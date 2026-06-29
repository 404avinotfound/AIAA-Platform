const mongoose = require("mongoose");

const AnswerSchema = new mongoose.Schema(
  {
    question: { type: mongoose.Schema.Types.ObjectId, ref: "Question", required: true, index: true },
    author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    body: { type: String, required: true },
    attachments: [
      {
        url: String,
        fileName: String,
        fileType: String,
      },
    ],
    upvotes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    isModeratorApproved: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Answer", AnswerSchema);
