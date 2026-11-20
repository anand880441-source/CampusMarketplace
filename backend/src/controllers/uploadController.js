exports.uploadImages = (req, res) => {
  const files = req.files || [];

  if (files.length === 0) {
    return res.status(400).json({
      success: false,
      message: "Please choose at least one image",
    });
  }

  const urls = files.map((file) => `/uploads/${file.filename}`);

  res.status(201).json({ success: true, urls });
};
