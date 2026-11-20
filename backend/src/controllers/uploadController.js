const crypto = require("crypto");
const upload = require("../middleware/upload");

const uploadToCloudinary = async (file) => {
  const folder = (process.env.CLOUDINARY_FOLDER || "campusmarket").trim();
  const timestamp = Math.floor(Date.now() / 1000);
  const signature = crypto
    .createHash("sha1")
    .update(
      `folder=${folder}&timestamp=${timestamp}${process.env.CLOUDINARY_API_SECRET}`
    )
    .digest("hex");

  const formData = new FormData();
  formData.append(
    "file",
    new Blob([file.buffer], { type: file.mimetype }),
    file.originalname || "image"
  );
  formData.append("api_key", process.env.CLOUDINARY_API_KEY);
  formData.append("timestamp", String(timestamp));
  formData.append("folder", folder);
  formData.append("signature", signature);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload`,
    { method: "POST", body: formData }
  );

  let payload = null;
  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  if (!response.ok || !payload?.secure_url) {
    throw new Error(
      payload?.error?.message || "Could not upload image to Cloudinary"
    );
  }

  return payload.secure_url;
};

exports.uploadImages = async (req, res) => {
  try {
    const files = req.files || [];

    if (files.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please choose at least one image",
      });
    }

    const urls = upload.cloudinaryConfigured
      ? await Promise.all(files.map(uploadToCloudinary))
      : files.map((file) => `/uploads/${file.filename}`);

    res.status(201).json({ success: true, urls });
  } catch (error) {
    res.status(502).json({ success: false, message: error.message });
  }
};
