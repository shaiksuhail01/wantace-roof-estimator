import { Config } from '../models/Config.js';

export const getPublicConfig = async (req, res) => {
  try {
    const config = await Config.findOne({
      is_active: true,
    }).lean();

    if (!config) {
      return res.status(404).json({
        success: false,
        message: 'No active configuration found.',
      });
    }

    const publicQuestions = config.questions
      .filter((question) => question.active)
      .sort((a, b) => a.order - b.order)
      .map((question) => ({
        key: question.key,
        label: question.label,
        type: question.type,
        unit: question.unit,
        required: question.required,
        min: question.min,
        max: question.max,

        options: question.options.map((option) => ({
          value: option.value,
          label: option.label,
        })),
      }));

    return res.status(200).json({
      success: true,
      data: {
        config_version: config.config_version,

        business: config.business,

        questions: publicQuestions,
      },
    });
  } catch (error) {
    console.error('Failed to fetch public configuration:', error);

    return res.status(500).json({
      success: false,
      message: 'Failed to load configuration.',
    });
  }
};