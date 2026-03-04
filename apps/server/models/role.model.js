const mongoose = require("mongoose");

const roleSchema = new mongoose.Schema(
  {
    roleName: { type: String, required: true, unique: true },
    roleNumber: { type: Number, required: true, unique: true },
    roleSlug: { type: String }, // Auto-generated from roleName
  },
  {
    timestamps: true,
  },
);

roleSchema.index({ roleName: 1 }, { unique: true });
roleSchema.index({ roleNumber: 1 }, { unique: true });

const Role = mongoose.models.roles || mongoose.model("roles", roleSchema);

module.exports = Role;
