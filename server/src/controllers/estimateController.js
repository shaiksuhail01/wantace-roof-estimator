import { Config } from '../models/Config.js';
import { Lead } from '../models/Lead.js';
import { calculateEstimate } from '../services/calculator.js';

const isValidEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

export const createEstimate = async (req, res) => {
  try {
    const { name, phone, email, answers } = req.body;

    // -----------------------------
    // Validate contact information
    // -----------------------------

    if (!name || typeof name !== 'string' || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Name is required.',
      });
    }

    if (!phone || typeof phone !== 'string' || !phone.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Phone is required.',
      });
    }

    if (!email || typeof email !== 'string' || !email.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Email is required.',
      });
    }

    if (!isValidEmail(email.trim())) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address.',
      });
    }

    if (
      !answers ||
      typeof answers !== 'object' ||
      Array.isArray(answers)
    ) {
      return res.status(400).json({
        success: false,
        message: 'Answers are required.',
      });
    }

    // -----------------------------
    // Load active configuration
    // -----------------------------

    const config = await Config.findOne({
      is_active: true,
    }).lean();

    if (!config) {
      return res.status(500).json({
        success: false,
        message: 'No active configuration is available.',
      });
    }

    // -----------------------------
    // Calculate estimate
    // -----------------------------

    const estimate = calculateEstimate(
      config,
      answers
    );

    // -----------------------------
    // Save lead
    // -----------------------------

    const lead = await Lead.create({
      lead_id: `ld_${Date.now()}`,
      name: name.trim(),
      phone: phone.trim(),
      email: email.trim().toLowerCase(),
      answers,
      config_version: config.config_version,
      estimate_low: estimate.estimate_low,
      estimate_high: estimate.estimate_high,
      captured_at: new Date(),
    });

    // -----------------------------
    // Return estimate
    // -----------------------------

    return res.status(201).json({
      success: true,
      data: {
        lead_id: lead.lead_id,
        config_version: config.config_version,
        estimate_low: estimate.estimate_low,
        estimate_high: estimate.estimate_high,
      },
    });
  } catch (error) {
    console.error(
      'Failed to create estimate:',
      error
    );

    return res.status(400).json({
      success: false,
      message: error.message || 'Unable to calculate estimate.',
    });
  }
};