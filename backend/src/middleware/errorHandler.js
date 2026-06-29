function errorHandler(err, _req, res, _next) {
  console.error(err);

  // Multer raises these for both file-type rejections (fileFilter, already a
  // clear message) and the built-in fileSize limit (a generic one), so map
  // them to a clean 400 instead of falling through to a generic 500.
  if (err.name === "MulterError") {
    const message =
      err.code === "LIMIT_FILE_SIZE"
        ? "The file you selected is larger than this upload allows. Please check the size limit shown on the form and try again."
        : err.message || "There was a problem with the uploaded file.";
    return res.status(400).json({ message });
  }

  const status = err.status || 500;
  res.status(status).json({
    message: err.message || "Something went wrong on the server",
  });
}

module.exports = errorHandler;
