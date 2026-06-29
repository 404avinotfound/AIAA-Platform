const mongoose = require("mongoose");

const DocumentSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: String,
    category: {
      type: String,
      enum: ["circular", "notification", "act", "judgment", "legal_document", "other"],
      default: "other",
    },
    fileUrl: { type: String, required: true },
    fileType: String, // pdf, doc, image
    isPinned: { type: Boolean, default: false },
    // When true, only active members (or staff) can see/download this
    // document via GET /api/documents.
    membersOnly: { type: Boolean, default: false },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

DocumentSchema.index({ title: "text", description: "text" });

module.exports = mongoose.model("Document", DocumentSchema);
