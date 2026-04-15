export enum UserRole {
  ADMIN = 'admin',
  AGENT = 'agent',
  OWNER = 'owner',
  BUYER = 'buyer',
}

export enum UserStatus {
  ACTIVE = 'active',
  SUSPENDED = 'suspended',
  PENDING = 'pending',
}

export enum PropertyStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  SOLD = 'sold',
}

export enum PropertyType {
  APARTMENT = 'Apartment',
  FULLY_DETACHED = 'Fully Detached House',
  SEMI_DETACHED = 'Semi-Detached House',
  TERRACED = 'Terraced House',
  DUPLEX = 'Duplex',
  BLOCK_OF_FLATS = 'Block of Flats',
  LAND = 'Land',
  COMMERCIAL = 'Commercial',
}

export enum InquiryStatus {
  NEW = 'new',
  IN_PROGRESS = 'in_progress',
  RESPONDED = 'responded',
  CLOSED = 'closed',
}

export enum PreferredContact {
  EMAIL = 'email',
  PHONE = 'phone',
  WHATSAPP = 'whatsapp',
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  agency?: string;
  status: UserStatus;
  avatarUrl?: string;
  createdAt: string;
}

export interface Property {
  id: string;
  title: string;
  type: PropertyType;
  status: PropertyStatus;
  price: number;
  state: string;
  lga: string;
  area: string;
  beds?: number;
  baths?: number;
  sqm?: number;
  amenities: string[];
  description: string;
  images: string[];
  panoramaUrl?: string | null;
  featured: boolean;
  views: number;
  isOwkaz: boolean;
  rejectionReason?: string;
  salePrice?: number;
  soldAt?: string;
  publishedAt?: string;
  submittedBy: User;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface Inquiry {
  id: string;
  property: Property;
  buyer: User;
  message: string;
  preferredContact: PreferredContact;
  status: InquiryStatus;
  assignedTo?: User;
  internalNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Notification {
  id: string;
  text: string;
  type: string;
  read: boolean;
  relatedPropertyId?: string;
  createdAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}
