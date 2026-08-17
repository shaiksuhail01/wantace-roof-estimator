import { Config } from '../models/Config.js';

const CALCULATOR_REQUIRED_QUESTIONS = [
  'roof_area',
  'material',
  'pitch',
  'layers',
  'stories',
];

const validateCalculatorQuestions = (questions) => {
  if (!Array.isArray(questions)) {
    throw new Error('Questions must be an array.');
  }

  for (const key of CALCULATOR_REQUIRED_QUESTIONS) {
    const question = questions.find(
      (item) => item.key === key
    );

    if (!question) {
      throw new Error(
        `Required calculator question "${key}" is missing.`
      );
    }

    if (!question.active) {
      throw new Error(
        `Question "${key}" is required by the pricing calculator and cannot be inactive.`
      );
    }

    if (!question.required) {
      throw new Error(
        `Question "${key}" is required by the pricing calculator and must remain required.`
      );
    }
  }
};

export const getPublicConfig = async (req, res) => {
  try {
    const config = await Config.findOne({
      is_active: true,
    })
      .sort({ config_version: -1 })
      .lean();

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
    console.error(
      'Failed to fetch public configuration:',
      error
    );

    return res.status(500).json({
      success: false,
      message: 'Failed to load configuration.',
    });
  }
};

export const getAdminConfig = async (req, res) => {
  try {
    const config = await Config.findOne({
      is_active: true,
    })
      .sort({ config_version: -1 })
      .lean();

    if (!config) {
      return res.status(404).json({
        success: false,
        message: 'No active configuration found.',
      });
    }

    return res.status(200).json({
      success: true,
      data: config,
    });
  } catch (error) {
    console.error(
      'Failed to fetch admin configuration:',
      error
    );

    return res.status(500).json({
      success: false,
      message: 'Failed to load configuration.',
    });
  }
};

export const updateAdminConfig = async (req, res) => {
  try {
    const {
      business,
      questions,
      modifiers,
    } = req.body;

    // ----------------------------------------
    // Basic request validation
    // ----------------------------------------

    if (!business || !questions || !modifiers) {
      return res.status(400).json({
        success: false,
        message:
          'Business, questions and modifiers are required.',
      });
    }

    if (!Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({
        success: false,
        message:
          'At least one configuration question is required.',
      });
    }

    // ----------------------------------------
    // Calculator compatibility validation
    // ----------------------------------------

    validateCalculatorQuestions(questions);

    // ----------------------------------------
    // Find current active configuration
    // ----------------------------------------

    const currentConfig = await Config.findOne({
      is_active: true,
    }).sort({
      config_version: -1,
    });

    if (!currentConfig) {
      return res.status(404).json({
        success: false,
        message: 'No active configuration found.',
      });
    }

    // ----------------------------------------
    // Determine next configuration version
    // ----------------------------------------

    const latestConfig = await Config.findOne()
      .sort({
        config_version: -1,
      })
      .select('config_version')
      .lean();

    const nextVersion =
      (latestConfig?.config_version || 0) + 1;

    // ----------------------------------------
    // Create new historical configuration
    // ----------------------------------------

    const newConfig = await Config.create({
      config_version: nextVersion,
      is_active: false,
      business,
      questions,
      modifiers,
    });

    // ----------------------------------------
    // Deactivate previous active configuration
    // ----------------------------------------

    await Config.updateMany(
      {
        is_active: true,
        _id: { $ne: newConfig._id },
      },
      {
        $set: {
          is_active: false,
        },
      }
    );

    // ----------------------------------------
    // Activate new configuration
    // ----------------------------------------

    newConfig.is_active = true;

    await newConfig.save();

    return res.status(201).json({
      success: true,
      message:
        `Configuration version ${nextVersion} published successfully.`,
      data: newConfig,
    });
  } catch (error) {
    console.error(
      'Failed to update configuration:',
      error
    );

    return res.status(400).json({
      success: false,
      message:
        error.message ||
        'Failed to update configuration.',
    });
  }
};