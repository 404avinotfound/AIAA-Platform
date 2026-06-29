const mongoose = require("mongoose");

const QuestionSchema = new mongoose.Schema(
  {
    author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true },
    body: { type: String, required: true },
    tags: [{ type: String, index: true }],
    attachments: [
      {
        url: String,
        fileName: String,
        fileType: String, // pdf, image, doc...
      },
    ],
    isAnonymous: { type: Boolean, default: false },
    acceptedAnswer: { type: mongoose.Schema.Types.ObjectId, ref: "Answer", default: null },
    upvotes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    views: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ["open", "answered", "closed", "flagged"],
      default: "open",
    },
    isPinned: { type: Boolean, default: false },
  },
  { timestamps: true }
);

QuestionSchema.index({ title: "text", body: "text", tags: "text" });

module.exports = mongoose.model("Question", QuestionSchema);
