import mongoose from 'mongoose';

const LeadSchema = new mongoose.Schema(
  {
    lead_id: {
      type: String,
      required: true,
      unique: true,
      trim: true,
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
      trim: true,
      lowercase: true,
    },

    answers: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },

    config_version: {
      type: Number,
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

    captured_at: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

LeadSchema.index({ captured_at: -1 });

export const Lead = mongoose.model('Lead', LeadSchema);