export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  price_registered:number;
  price_unregistered:number;
  sellerId: string;  // Seller's ID
  category: string;
  imageUrl: string;
  krishiBhavan: string;
  stock: number;
  officeId: string;
}

export interface Office {
  id: string;
  name: string;
  location: string;
  address: string;
  contact: string;
}

export interface Booking {
  id: string;
  user_id: string;
  product_name: string;
  product_id: string;
  quantity: number;
  krishiBhavan: string;
  booking_date_time: Date;
  total_amount: number;
  collection_status: 'pending' | 'confirmed' | 'collected' | 'expired';
  product?: Product; // Add this property
}

export interface CartItem {
  product: Product;
  quantity: number;
  office: Office;
}

export interface User {
  id: string;
  email: string;
  name: string;
  phone: string;
  role: 'customer' | 'seller';
  uniqueId: string;
  address: string;
  pincode: string;
  sellerId: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}