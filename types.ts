
export type UserRole = 'user' | 'admin';

export interface User {
  id: string;
  name: string;
  phone: string;
  role: UserRole;
  managedLotId?: string; // Optional: If defined, this admin manages only this lot
}

export type SlotStatus = 'available' | 'allocated' | 'occupied';

// For historical records (Completed/Failed/Cancelled)
export interface BookingHistoryItem {
  id: string; // unique history id
  slotId: string;
  lotId: string;
  lotName: string;
  slotNumber: number;
  slotType: 'car' | 'bike' | 'truck';
  userId: string;
  userName: string;
  vehicleNumber: string;
  vehicleType: string;
  bookingTime: number; // When they clicked book
  scheduledTime: number; // When they said they would arrive
  entryTime?: number;
  exitTime?: number;
  status: 'completed' | 'failed' | 'cancelled';
  cost?: number;
}

export interface Slot {
  id: string;
  lotId: string;
  number: number;
  type: 'car' | 'bike' | 'truck'; // Designated type for the slot
  status: SlotStatus;
  
  // Booking Details
  userId?: string;
  userName?: string;
  userPhone?: string;
  vehicleNumber?: string;
  vehicleType?: 'car' | 'bike' | 'truck';
  bookingTime?: number; // Timestamp when allocated
  scheduledTime?: number; // Timestamp for when the user selected to park
  entryTime?: number; // Timestamp when confirmed parked
}

export interface Lot {
  id: string;
  name: string;
  address: string;
  totalSlots: number;
  image: string;
}

export interface BookingRequest {
  vehicleNumber: string;
  vehicleType: 'car' | 'bike' | 'truck';
  date: string;
  time: string;
}