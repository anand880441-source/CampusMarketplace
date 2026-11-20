const { z } = require("zod");
const {
  CATEGORIES,
  CONDITIONS,
  LISTING_TYPES,
  LISTING_STATUSES,
} = require("./constants");

const registerSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  password: z.string().min(6).max(100),
  college: z.string().optional(),
  course: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const listingCreateSchema = z.object({
  title: z.string().trim().min(3).max(120),
  description: z.string().trim().min(10).max(2000),
  price: z.coerce.number().min(0).optional().default(0),
  category: z.enum(CATEGORIES),
  condition: z.enum(CONDITIONS),
  listingType: z.enum(LISTING_TYPES).optional().default("sale"),
  images: z.array(z.string().trim().min(1)).max(4).optional().default([]),
  location: z.string().trim().max(100).optional().default(""),
});

const listingUpdateSchema = z.object({
  title: z.string().trim().min(3).max(120).optional(),
  description: z.string().trim().min(10).max(2000).optional(),
  price: z.coerce.number().min(0).optional(),
  category: z.enum(CATEGORIES).optional(),
  condition: z.enum(CONDITIONS).optional(),
  listingType: z.enum(LISTING_TYPES).optional(),
  images: z.array(z.string().trim().min(1)).max(4).optional(),
  location: z.string().trim().max(100).optional(),
  isActive: z.boolean().optional(),
});

const listingStatusSchema = z.object({
  status: z.enum(LISTING_STATUSES),
});

const optionalPrice = z.preprocess(
  (value) =>
    value === "" || value === null || value === undefined ? undefined : value,
  z.coerce.number().min(0).optional()
);

const enquiryCreateSchema = z.object({
  listingId: z.string().min(1),
  message: z.string().trim().min(2).max(1000),
  offerPrice: optionalPrice,
});

const enquiryResponseSchema = z.object({
  status: z.enum(["accepted", "rejected"]),
  responseMessage: z.string().trim().max(500).optional().default(""),
});

const profileUpdateSchema = z.object({
  name: z.string().trim().min(2).max(100).optional(),
  college: z.string().trim().max(150).optional(),
  course: z.string().trim().max(150).optional(),
  phone: z.string().trim().max(20).optional(),
  contactPreference: z.enum(["email", "phone"]).optional(),
  profileImage: z.string().trim().max(500).optional(),
});

module.exports = {
  registerSchema,
  loginSchema,
  listingCreateSchema,
  listingUpdateSchema,
  listingStatusSchema,
  enquiryCreateSchema,
  enquiryResponseSchema,
  profileUpdateSchema,
};