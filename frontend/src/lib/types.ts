export type Category =
  | "books"
  | "electronics"
  | "furniture"
  | "stationery"
  | "other";

export type Condition = "new" | "like_new" | "good" | "fair" | "poor";

export type ListingType = "sale" | "free" | "exchange";

export type ListingStatus = "available" | "reserved" | "sold";

export type EnquiryStatus = "pending" | "accepted" | "rejected" | "withdrawn";

export interface ContactInfo {
  email?: string;
  phone?: string;
}

export interface SellerSummary {
  _id: string;
  name: string;
  college?: string;
}

export interface PublicUser extends SellerSummary {
  course?: string;
  profileImage?: string;
  contactPreference?: "email" | "phone";
  contact?: ContactInfo;
  memberSince?: string;
}

export interface AuthUser {
  _id: string;
  name: string;
  email: string;
  role: string;
  college?: string;
  course?: string;
  phone?: string;
  contactPreference?: "email" | "phone";
  profileImage?: string;
}

export interface Listing {
  _id: string;
  seller: SellerSummary | PublicUser | string;
  title: string;
  description: string;
  price: number;
  category: Category;
  condition: Condition;
  listingType: ListingType;
  images: string[];
  status: ListingStatus;
  isActive: boolean;
  location: string;
  createdAt: string;
  updatedAt: string;
  isAvailable?: boolean;
}

export interface EnquiryListingSummary {
  _id: string;
  title: string;
  price: number;
  images: string[];
  status: ListingStatus;
  isActive: boolean;
}

export interface Enquiry {
  _id: string;
  listing: EnquiryListingSummary | string;
  buyer: PublicUser;
  seller: PublicUser;
  message: string;
  offerPrice: number | null;
  status: EnquiryStatus;
  responseMessage?: string;
  respondedAt?: string | null;
  createdAt: string;
}

export interface NotificationItem {
  _id: string;
  type: "enquiry_received" | "enquiry_response" | "listing_sold";
  message: string;
  listing?: { _id: string; title: string } | string | null;
  enquiry?: string | null;
  isRead: boolean;
  createdAt: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ListResponse<T> {
  success: boolean;
  data: T[];
  pagination?: PaginationMeta;
}

export interface NotificationsResponse extends ListResponse<NotificationItem> {
  unreadCount: number;
}

export interface SellerProfileResponse {
  success: boolean;
  data: {
    seller: PublicUser;
    stats: {
      available: number;
      reserved: number;
      sold: number;
      total: number;
    };
  };
}

export interface DashboardStats {
  active: number;
  reserved: number;
  sold: number;
  receivedEnquiries: number;
  pendingOffers: number;
  sentEnquiries: number;
  unreadNotifications: number;
}

export interface DashboardResponse {
  success: boolean;
  data: {
    stats: DashboardStats;
    recentReceived: Enquiry[];
    recentSent: Enquiry[];
  };
}
