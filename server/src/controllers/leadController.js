import { Lead } from '../models/Lead.js';

export const getLeads = async (req, res) => {
  try {
    const leads = await Lead.find()
      .sort({ captured_at: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      data: leads,
    });
  } catch (error) {
    console.error(
      'Failed to fetch leads:',
      error
    );

    return res.status(500).json({
      success: false,
      message: 'Failed to load leads.',
    });
  }
};

export const getLeadById = async (req, res) => {
  try {
    const lead = await Lead.findOne({
      lead_id: req.params.leadId,
    }).lean();

    if (!lead) {
      return res.status(404).json({
        success: false,
        message: 'Lead not found.',
      });
    }

    return res.status(200).json({
      success: true,
      data: lead,
    });
  } catch (error) {
    console.error(
      'Failed to fetch lead:',
      error
    );

    return res.status(500).json({
      success: false,
      message: 'Failed to load lead.',
    });
  }
};