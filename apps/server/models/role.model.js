const mongoose = require("mongoose");

const roleSchema = new mongoose.Schema(
  {
    roleName: { type: String, required: true, unique: true, index: true },
    roleNumber: { type: Number, required: true, unique: true, index: true },
    roleSlug: { type: String }, // Auto-generated from roleName
  },
  {
    timestamps: true,
  },
);

const Role = mongoose.models.roles || mongoose.model("roles", roleSchema);

module.exports = Role;
