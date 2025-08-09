// Offer types
export interface Offer {
  _id: string;
  title: string;
  country: string;
  cities: string[];
  hotels: Hotel[];
  description: string;
  image: string;
  price: number;
  dailyProgram: DailyProgram[];
  inclusions: string[];
  exclusions: string[];
  pricingRules: Array<{
    minAge: number;
    maxAge: number;
    price: number;
  }>;
  cancellationPolicy: CancellationPolicy[];
  totalSeats: number;
  availableSeats: number;
  alertThreshold?: number;
  maxPassengers: number;
  roomTypes: Array<{
    label: string;
    value: string;
    price: number;
  }>;
  departDates: Array<{
    date: string;
    returnDate: string;
  }>;
}

export interface Hotel {
  name: string;
  stars: number;
}

export interface DailyProgram {
  day: number;
  content: string;
}

export interface PricingRule {
  id: string;
  minAge: number;
  maxAge: number;
  price: number;
}

export interface CancellationPolicy {
  id: string;
  minDaysBeforeDeparture: number;
  refundPercent: number;
}

export interface DepartDate {
  label: string;
  date: string;
  dateRetour: string;
}

export interface RoomType {
  id: string;
  label: string;
  price: number;
  capacity: number;
  pricePerPerson: boolean;
}

// Reservation types
export interface Reservation {
  id: string;
  offerId: string;
  agencyId: string;
  status: 'pending' | 'approved' | 'rejected' | 'paid' | 'pending_payment';
  passengers: Passenger[];
  totalPrice: number;
  amountPaid: number;
  amountRemaining: number;
  createdAt: string;
  passportFiles: UploadedFile[];
  paymentProof?: UploadedFile;
  departDateSelected?: string;
  returnDateSelected?: string;
}

export interface Passenger {
  id: string;
  name: string;
  birthdate: string;
  calculatedPrice: number;
  passportNumber?: string;
  passportExpiry?: string;
  roomTypeSelected?: string;
}

export interface UploadedFile {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
}

// User types
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'agency';
  agencyName?: string;
  address?: string;
  rc?: string;
  phone?: string;
  isProfileComplete?: boolean;
  isApproved?: boolean;
}