import { Lead } from '../models/Lead.js';
import { Config } from '../models/Config.js';

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
    console.error('Failed to fetch leads:', error);

    return res.status(500).json({
      success: false,
      message: 'Failed to load leads.',
    });
  }
};

export const getLeadById = async (req, res) => {
  try {
    const { leadId } = req.params;

    const lead = await Lead.findOne({
      lead_id: leadId,
    }).lean();

    if (!lead) {
      return res.status(404).json({
        success: false,
        message: 'Lead not found.',
      });
    }

    /*
     * Important:
     * Find the exact configuration version used
     * when this lead was created.
     */
    const config = await Config.findOne({
      config_version: lead.config_version,
    }).lean();

    if (!config) {
      return res.status(404).json({
        success: false,
        message: `Configuration version ${lead.config_version} not found.`,
      });
    }

    return res.status(200).json({
      success: true,

      data: {
        lead,

        configuration: {
          config_version: config.config_version,
          business: config.business,
          questions: config.questions
            .filter((question) => question.active)
            .sort((a, b) => a.order - b.order),
          modifiers: config.modifiers,
          is_active: config.is_active,
          createdAt: config.createdAt,
          updatedAt: config.updatedAt,
        },
      },
    });
  } catch (error) {
    console.error(
      'Failed to fetch lead details:',
      error
    );

    return res.status(500).json({
      success: false,
      message: 'Failed to load lead details.',
    });
  }
};