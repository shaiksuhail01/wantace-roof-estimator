import mongoose from 'mongoose';

const LeadSchema = new mongoose.Schema(
  {
    lead_id: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    captured_at: {
      type: Date,
      required: true,
      default: Date.now,
    },

    config_version: {
      type: Number,
      required: true,
      min: 1,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    phone: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },

    answers: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },

    estimate_low: {
      type: Number,
      required: true,
      min: 0,
    },

    estimate_high: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

export const Lead = mongoose.model('Lead', LeadSchema);