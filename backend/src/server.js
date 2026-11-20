
require("dotenv").config();

const requiredEnvVars = ["MONGODB_URI", "JWT_SECRET"];
if (process.env.NODE_ENV === "production") {
  requiredEnvVars.push("FRONTEND_URL");
}

const missingEnvVars = requiredEnvVars.filter((name) => !process.env[name]);

if (missingEnvVars.length > 0) {
  console.error(`Missing required environment variables: ${missingEnvVars.join(", ")}`);
  process.exit(1);
}

const cloudinaryEnvVars = [
  "CLOUDINARY_CLOUD_NAME",
  "CLOUDINARY_API_KEY",
  "CLOUDINARY_API_SECRET",
];
const configuredCloudinaryVars = cloudinaryEnvVars.filter(
  (name) => process.env[name]
);

if (
  configuredCloudinaryVars.length > 0 &&
  configuredCloudinaryVars.length < cloudinaryEnvVars.length
) {
  console.warn(
    "Cloudinary configuration is incomplete. Uploaded images will use ephemeral local storage."
  );
} else if (
  process.env.NODE_ENV === "production" &&
  configuredCloudinaryVars.length === 0
) {
  console.warn(
    "Cloudinary is not configured. Uploaded images will use ephemeral local storage."
  );
}

const app = require("./app");
const connectDB = require("./confing/db");

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
};

startServer();
