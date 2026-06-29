const multer = require("multer");
const path = require("path");
const fs = require("fs");

const uploadDir = path.join(__dirname, "..", "..", "uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const safeName = `${Date.now()}-${file.originalname.replace(/[^a-zA-Z0-9.\-_]/g, "_")}`;
    cb(null, safeName);
  },
});

// ---- Size limits (requested) ----
// Profile photo / passport-size photo / signature image: max 100KB
const IMAGE_MAX_BYTES = 100 * 1024;
// Membership / legal documents (Govt ID, Advocate ID, Enrollment Certificate,
// Side Wing / Resources documents): max 250KB, PDF only
const DOCUMENT_MAX_BYTES = 250 * 1024;

const IMAGE_MIME_TYPES = ["image/png", "image/jpeg", "image/webp", "image/gif"];
const IMAGE_EXTENSIONS = [".png", ".jpg", ".jpeg", ".webp", ".gif"];

const DOCUMENT_MIME_TYPES = ["application/pdf"];
const DOCUMENT_EXTENSIONS = [".pdf"];

function isImageFile(file) {
  const ext = path.extname(file.originalname || "").toLowerCase();
  return IMAGE_MIME_TYPES.includes(file.mimetype) && IMAGE_EXTENSIONS.includes(ext);
}

function isDocumentFile(file) {
  const ext = path.extname(file.originalname || "").toLowerCase();
  return DOCUMENT_MIME_TYPES.includes(file.mimetype) && DOCUMENT_EXTENSIONS.includes(ext);
}

// ---- Profile pictures / passport photos / signature images ----
// Image files only (jpg, jpeg, png, webp, gif), max 100KB.
const uploadImage = multer({
  storage,
  limits: { fileSize: IMAGE_MAX_BYTES },
  fileFilter: (_req, file, cb) => {
    if (isImageFile(file)) return cb(null, true);
    cb(new Error("Only image files (JPG, JPEG, PNG, WEBP, GIF) up to 100KB are allowed."));
  },
});

// ---- Legal / membership / Side Wing documents ----
// PDF only, max 250KB.
const uploadDocument = multer({
  storage,
  limits: { fileSize: DOCUMENT_MAX_BYTES },
  fileFilter: (_req, file, cb) => {
    if (isDocumentFile(file)) return cb(null, true);
    cb(new Error("Only PDF files up to 250KB are allowed."));
  },
});

// ---- Membership application form ----
// This single form mixes image fields (photo, signature) and document fields
// (Govt ID, Advocate ID, Enrollment Certificate). Multer only supports one
// fileSize limit per instance, so we use the larger ceiling (250KB) here and
// strictly re-check each field's real limit in enforceMembershipFileSizes,
// below, once the files have actually been written to disk.
const MEMBERSHIP_IMAGE_FIELDS = ["profilePhoto", "signature"];
const MEMBERSHIP_DOCUMENT_FIELDS = ["govtId", "advocateId", "enrollmentCertificate"];

const uploadMembershipFiles = multer({
  storage,
  limits: { fileSize: DOCUMENT_MAX_BYTES },
  fileFilter: (_req, file, cb) => {
    if (MEMBERSHIP_IMAGE_FIELDS.includes(file.fieldname)) {
      if (!isImageFile(file)) {
        return cb(new Error(`${file.fieldname}: only image files (JPG, JPEG, PNG, WEBP, GIF) are allowed.`));
      }
      return cb(null, true);
    }
    if (MEMBERSHIP_DOCUMENT_FIELDS.includes(file.fieldname)) {
      if (!isDocumentFile(file)) {
        return cb(new Error(`${file.fieldname}: only PDF files are allowed.`));
      }
      return cb(null, true);
    }
    cb(new Error("Unexpected file field."));
  },
});

// Runs after uploadMembershipFiles. Multer's fileFilter can't see a file's
// final size while it's still streaming in, so image fields (capped at
// 100KB) could otherwise slip through under the shared 250KB instance
// ceiling. This re-checks each field's real size on disk and rejects (and
// deletes) anything that's too big for its specific field.
function enforceMembershipFileSizes(req, res, next) {
  const files = req.files || {};

  for (const field of MEMBERSHIP_IMAGE_FIELDS) {
    const uploaded = files[field]?.[0];
    if (uploaded && uploaded.size > IMAGE_MAX_BYTES) {
      fs.unlink(uploaded.path, () => {});
      return res.status(400).json({ message: `${field}: image must be 100KB or smaller.` });
    }
  }
  for (const field of MEMBERSHIP_DOCUMENT_FIELDS) {
    const uploaded = files[field]?.[0];
    if (uploaded && uploaded.size > DOCUMENT_MAX_BYTES) {
      fs.unlink(uploaded.path, () => {});
      return res.status(400).json({ message: `${field}: PDF must be 250KB or smaller.` });
    }
  }
  next();
}

// ---- General-purpose uploader (kept as-is) ----
// Used for community Q&A attachments, which were not part of the requested
// changes. Unchanged from the original: images/pdf/doc/docx, up to 15MB.
const GENERAL_ALLOWED_TYPES = [
  "image/png",
  "image/jpeg",
  "image/webp",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

const uploadGeneral = multer({
  storage,
  fileFilter: (_req, file, cb) => {
    if (GENERAL_ALLOWED_TYPES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Unsupported file type"));
    }
  },
  limits: { fileSize: 15 * 1024 * 1024 }, // 15MB
});

module.exports = {
  uploadImage,
  uploadDocument,
  uploadMembershipFiles,
  enforceMembershipFileSizes,
  uploadGeneral,
  IMAGE_MAX_BYTES,
  DOCUMENT_MAX_BYTES,
};
