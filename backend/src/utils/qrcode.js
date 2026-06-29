const QRCode = require("qrcode");

// Encodes a public verification URL into a QR code data URL,
// e.g. https://aiaa.org.in/verify/AIAA-2026-000123
async function generateQrDataUrl(membershipNumber, baseUrl) {
  const verifyUrl = `${baseUrl || process.env.CLIENT_URL}/verify/${membershipNumber}`;
  return QRCode.toDataURL(verifyUrl, { margin: 1, width: 300 });
}

module.exports = { generateQrDataUrl };
