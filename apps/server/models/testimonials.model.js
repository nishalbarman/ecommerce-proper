const mongoose = require("mongoose");

const testimonialsSchema = new mongoose.Schema(
  {
    clientName: { type: String, required: true },
    clientSpeech: { type: String, required: true },
    clientAvatar: { type: String, required: true },
    clientChatImage: { type: String, required: true },
  },
  {
    timestamps: true,
    query: {
      all() {
        return this.where({});
      },
    },
  }
);

const Testimonials =
  mongoose.models.testimonials ||
  mongoose.model("testimonials", testimonialsSchema);

module.exports = Testimonials;
