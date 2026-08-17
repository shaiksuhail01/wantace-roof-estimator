import mongoose from 'mongoose';

const OptionSchema = new mongoose.Schema(
  {
    value: {
      type: String,
      required: true,
      trim: true,
    },

    label: {
      type: String,
      required: true,
      trim: true,
    },

    rate_per_sqft: {
      type: Number,
      min: 0,
    },

    multiplier: {
      type: Number,
      min: 0,
    },

    tear_off_per_sqft: {
      type: Number,
      min: 0,
    },
  },
  { _id: false }
);

const QuestionSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      trim: true,
    },

    label: {
      type: String,
      required: true,
      trim: true,
    },

    type: {
      type: String,
      enum: ['number', 'select'],
      required: true,
    },

    unit: {
      type: String,
      trim: true,
    },

    required: {
      type: Boolean,
      default: true,
    },

    min: {
      type: Number,
    },

    max: {
      type: Number,
    },

    active: {
      type: Boolean,
      default: true,
    },

    order: {
      type: Number,
      required: true,
    },

    options: {
      type: [OptionSchema],
      default: [],
    },
  },
  { _id: false }
);

const ConfigSchema = new mongoose.Schema(
  {
    config_version: {
      type: Number,
      required: true,
      min: 1,
    },

    is_active: {
      type: Boolean,
      default: true,
    },

    business: {
      name: {
        type: String,
        required: true,
        trim: true,
      },

      region: {
        type: String,
        required: true,
        trim: true,
      },

      currency: {
        type: String,
        required: true,
        trim: true,
        uppercase: true,
      },
    },

    questions: {
      type: [QuestionSchema],
      required: true,
      default: [],
    },

    modifiers: {
      waste_factor: {
        type: Number,
        required: true,
        min: 0,
      },

      permit_flat_fee: {
        type: Number,
        required: true,
        min: 0,
      },

      range_spread_pct: {
        type: Number,
        required: true,
        min: 0,
      },
    },
  },
  {
    timestamps: true,
  }
);

export const Config = mongoose.model('Config', ConfigSchema);