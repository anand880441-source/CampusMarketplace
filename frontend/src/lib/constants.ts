import type {
  Category,
  Condition,
  EnquiryStatus,
  ListingStatus,
  ListingType,
} from "./types";

export const CATEGORY_OPTIONS: { value: Category; label: string }[] = [
  { value: "books", label: "Books" },
  { value: "electronics", label: "Electronics" },
  { value: "furniture", label: "Furniture" },
  { value: "stationery", label: "Stationery" },
  { value: "other", label: "Other" },
];

export const CATEGORY_LABELS: Record<Category, string> = {
  books: "Books",
  electronics: "Electronics",
  furniture: "Furniture",
  stationery: "Stationery",
  other: "Other",
};

export const CONDITION_OPTIONS: { value: Condition; label: string }[] = [
  { value: "new", label: "New" },
  { value: "like_new", label: "Like new" },
  { value: "good", label: "Good" },
  { value: "fair", label: "Fair" },
  { value: "poor", label: "Poor" },
];

export const CONDITION_LABELS: Record<Condition, string> = {
  new: "New",
  like_new: "Like new",
  good: "Good",
  fair: "Fair",
  poor: "Poor",
};

export const LISTING_TYPE_OPTIONS: { value: ListingType; label: string }[] = [
  { value: "sale", label: "For sale" },
  { value: "free", label: "Free" },
  { value: "exchange", label: "Exchange" },
];

export const LISTING_TYPE_LABELS: Record<ListingType, string> = {
  sale: "For sale",
  free: "Free",
  exchange: "Exchange",
};

export const LISTING_STATUS_OPTIONS: {
  value: ListingStatus;
  label: string;
}[] = [
  { value: "available", label: "Available" },
  { value: "reserved", label: "Reserved" },
  { value: "sold", label: "Sold" },
];

export const LISTING_STATUS_LABELS: Record<ListingStatus, string> = {
  available: "Available",
  reserved: "Reserved",
  sold: "Sold",
};

export const ENQUIRY_STATUS_LABELS: Record<EnquiryStatus, string> = {
  pending: "Pending",
  accepted: "Accepted",
  rejected: "Rejected",
  withdrawn: "Withdrawn",
};

export const SORT_OPTIONS = [
  { value: "newest", label: "Newest first" },
  { value: "price_asc", label: "Price: low to high" },
  { value: "price_desc", label: "Price: high to low" },
  { value: "relevance", label: "Best match" },
] as const;
