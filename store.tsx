import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Slot, Lot, BookingRequest, BookingHistoryItem } from './types';

// Mock Lots Data
const MOCK_LOTS: Lot[] = [
  { id: 'L1', name: 'Downtown Plaza', address: '123 Main St, City Center', totalSlots: 300, image: 'https://picsum.photos/400/200?random=1' },
  { id: 'L2', name: 'Westside Mall', address: '456 West Ave, Commercial Dist', totalSlots: 300, image: 'https://picsum.photos/400/200?random=2' },
  { id: 'L3', name: 'Airport Long Term', address: '789 Skyway, Terminal 2', totalSlots: 300, image: 'https://picsum.photos/400/200?random=3' },
  { id: 'L4', name: 'Central Station', address: '101 Rail Rd, Transit Hub', totalSlots: 300, image: 'https://picsum.photos/400/200?random=4' },
];

// Mock Admin Credentials
const MOCK_ADMINS = [
  { username: 'admin', password: 'password', name: 'Super Admin', role: 'admin' as const, managedLotId: undefined },
  { username: 'downtown', password: 'password', name: 'Downtown Manager', role: 'admin' as const, managedLotId: 'L1' },
  { username: 'westside', password: 'password', name: 'Westside Manager', role: 'admin' as const, managedLotId: 'L2' },
  { username: 'airport', password: 'password', name: 'Airport Manager', role: 'admin' as const, managedLotId: 'L3' },
  { username: 'central', password: 'password', name: 'Central Manager', role: 'admin' as const, managedLotId: 'L4' },
];

// Generate Initial Slots (100 Car, 100 Bike, 100 Truck per lot)
const generateSlots = (): Slot[] => {
  const slots: Slot[] = [];
  MOCK_LOTS.forEach(lot => {
    // 100 Car Slots
    for (let i = 1; i <= 100; i++) {
      slots.push({
        id: `${lot.id}-C${i}`,
        lotId: lot.id,
        number: i,
        type: 'car',
        status: 'available'
      });
    }
    // 100 Bike Slots
    for (let i = 1; i <= 100; i++) {
      slots.push({
        id: `${lot.id}-B${i}`,
        lotId: lot.id,
        number: i,
        type: 'bike',
        status: 'available'
      });
    }
    // 100 Truck Slots
    for (let i = 1; i <= 100; i++) {
      slots.push({
        id: `${lot.id}-T${i}`,
        lotId: lot.id,
        number: i,
        type: 'truck',
        status: 'available'
      });
    }
  });
  return slots;
};

// Extension of User to include password for mock auth
interface RegisteredUser extends User {
  password?: string;
}

interface AppContextType {
  user: User | null;
  login: (user: User) => void;
  logout: () => void;
  lots: Lot[];
  slots: Slot[];
  history: BookingHistoryItem[];
  bookSlot: (slotId: string, details: BookingRequest, user: User) => void;
  confirmPark: (slotId: string) => void;
  exitSlot: (slotId: string) => void;
  cancelBooking: (slotId: string) => void;
  clearHistory: () => void;
  // Auth methods
  registerUser: (user: User, password: string) => boolean;
  validateUser: (phone: string, password: string) => User | null;
  validateAdmin: (username: string, password: string) => User | null;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // 1. Session Persistence
  const [user, setUser] = useState<User | null>(() => {
    try {
      const stored = localStorage.getItem('parkaro_current_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  // 2. Slot Persistence
  const [slots, setSlots] = useState<Slot[]>(() => {
    try {
      const stored = localStorage.getItem('parkaro_slots');
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error("Failed to load slots", e);
    }
    return generateSlots();
  });

  // 3. History Persistence
  const [history, setHistory] = useState<BookingHistoryItem[]>(() => {
    try {
      const stored = localStorage.getItem('parkaro_history');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });
  
  // Persistence Effects
  useEffect(() => {
    localStorage.setItem('parkaro_slots', JSON.stringify(slots));
  }, [slots]);

  useEffect(() => {
    localStorage.setItem('parkaro_history', JSON.stringify(history));
  }, [history]);

  // 4. User Registry Persistence
  const [registry, setRegistry] = useState<RegisteredUser[]>(() => {
    try {
      const stored = localStorage.getItem('parkaro_users');
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error("Failed to load users from local storage", error);
      return [];
    }
  });

  const login = (userData: User) => {
    setUser(userData);
    localStorage.setItem('parkaro_current_user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('parkaro_current_user');
  };

  const registerUser = (userData: User, password: string) => {
    if (registry.some(u => u.phone === userData.phone)) {
      return false;
    }
    const newUser = { ...userData, password };
    const updatedRegistry = [...registry, newUser];
    
    setRegistry(updatedRegistry);
    localStorage.setItem('parkaro_users', JSON.stringify(updatedRegistry));
    return true;
  };

  const validateUser = (phone: string, password: string): User | null => {
    const found = registry.find(u => u.phone === phone && u.password === password);
    if (found) {
      const { password: _, ...safeUser } = found;
      return safeUser;
    }
    return null;
  };

  const validateAdmin = (username: string, password: string): User | null => {
    const found = MOCK_ADMINS.find(a => a.username === username && a.password === password);
    if (found) {
      return {
        id: `admin-${found.username}`,
        name: found.name,
        phone: '0000000000',
        role: 'admin',
        managedLotId: found.managedLotId
      };
    }
    return null;
  };

  const bookSlot = (slotId: string, details: BookingRequest, booker: User) => {
    // Calculate Scheduled Timestamp
    const scheduledDate = new Date(`${details.date}T${details.time}`);
    const scheduledTime = !isNaN(scheduledDate.getTime()) ? scheduledDate.getTime() : Date.now();

    setSlots(prev => prev.map(slot => {
      if (slot.id === slotId) {
        return {
          ...slot,
          status: 'allocated',
          userId: booker.id,
          userName: booker.name,
          userPhone: booker.phone,
          vehicleNumber: details.vehicleNumber,
          vehicleType: details.vehicleType,
          bookingTime: Date.now(),
          scheduledTime: scheduledTime
        };
      }
      return slot;
    }));
  };

  const confirmPark = (slotId: string) => {
    setSlots(prev => prev.map(slot => {
      if (slot.id === slotId) {
        return {
          ...slot,
          status: 'occupied',
          entryTime: Date.now()
        };
      }
      return slot;
    }));
  };

  const exitSlot = (slotId: string) => {
    const slot = slots.find(s => s.id === slotId);
    
    if (slot && slot.status === 'occupied') {
        // Calculate cost
        let cost = 0;
        if (slot.entryTime) {
          const now = Date.now();
          const diffMs = now - slot.entryTime;
          const days = Math.max(1, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
          
          let rate = 0;
          switch(slot.type) {
              case 'bike': rate = 20; break;
              case 'car': rate = 50; break;
              case 'truck': rate = 100; break;
              default: rate = 50;
          }
          cost = days * rate;
        }
        
        // Create History Record
        const historyItem: BookingHistoryItem = {
            id: 'hist-' + Date.now() + Math.random().toString(36).substr(2, 5),
            slotId: slot.id,
            lotId: slot.lotId,
            lotName: MOCK_LOTS.find(l => l.id === slot.lotId)?.name || 'Unknown',
            slotNumber: slot.number,
            slotType: slot.type,
            userId: slot.userId || '',
            userName: slot.userName || '',
            vehicleNumber: slot.vehicleNumber || '',
            vehicleType: slot.vehicleType || 'car',
            bookingTime: slot.bookingTime || 0,
            scheduledTime: slot.scheduledTime || 0,
            entryTime: slot.entryTime,
            exitTime: Date.now(),
            status: 'completed',
            cost: cost
        };
        setHistory(prev => [historyItem, ...prev]);
    }

    setSlots(prev => prev.map(s => {
      if (s.id === slotId) {
        // Reset slot
        return {
          id: s.id,
          lotId: s.lotId,
          number: s.number,
          type: s.type,
          status: 'available'
        };
      }
      return s;
    }));
  };

  const cancelBooking = (slotId: string) => {
    const slot = slots.find(s => s.id === slotId);
    if (slot) {
        const historyItem: BookingHistoryItem = {
            id: 'hist-cncl-' + Date.now() + Math.random().toString(36).substr(2, 5),
            slotId: slot.id,
            lotId: slot.lotId,
            lotName: MOCK_LOTS.find(l => l.id === slot.lotId)?.name || 'Unknown',
            slotNumber: slot.number,
            slotType: slot.type,
            userId: slot.userId || '',
            userName: slot.userName || '',
            vehicleNumber: slot.vehicleNumber || '',
            vehicleType: slot.vehicleType || 'car',
            bookingTime: slot.bookingTime || 0,
            scheduledTime: slot.scheduledTime || 0,
            status: 'cancelled',
            exitTime: Date.now()
        };
        setHistory(prev => [historyItem, ...prev]);
    }

    setSlots(prev => prev.map(s => {
      if (s.id === slotId) {
        return {
          id: s.id,
          lotId: s.lotId,
          number: s.number,
          type: s.type,
          status: 'available'
          // All other properties are intentionally omitted to reset the slot
        };
      }
      return s;
    }));
  };

  const clearHistory = () => {
    if (!user) return;
    // Only clear history for current user
    setHistory(prev => prev.filter(h => h.userId !== user.id));
  };

  // 1 Hour Timeout Check
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      const ONE_HOUR = 60 * 60 * 1000;
      
      let hasChanges = false;
      const newSlots = [...slots];
      const newHistory = [...history];

      for (let i = 0; i < newSlots.length; i++) {
        const slot = newSlots[i];
        if (slot.status === 'allocated' && slot.bookingTime) {
          // If 1 hour passed since BOOKING time
          if (now - slot.bookingTime > ONE_HOUR) {
             console.log(`Booking for slot ${slot.id} expired.`);
             
             // Add to Failed History
             newHistory.unshift({
                id: 'hist-fail-' + Date.now() + i,
                slotId: slot.id,
                lotId: slot.lotId,
                lotName: MOCK_LOTS.find(l => l.id === slot.lotId)?.name || 'Unknown',
                slotNumber: slot.number,
                slotType: slot.type,
                userId: slot.userId || '',
                userName: slot.userName || '',
                vehicleNumber: slot.vehicleNumber || '',
                vehicleType: slot.vehicleType || 'car',
                bookingTime: slot.bookingTime || 0,
                scheduledTime: slot.scheduledTime || 0,
                status: 'failed'
             });

             // Reset Slot
             newSlots[i] = {
                id: slot.id,
                lotId: slot.lotId,
                number: slot.number,
                type: slot.type,
                status: 'available'
             };
             hasChanges = true;
          }
        }
      }

      if (hasChanges) {
          setSlots(newSlots);
          setHistory(newHistory);
      }
    }, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, [slots, history]);

  return (
    <AppContext.Provider value={{ 
      user, 
      login, 
      logout, 
      lots: MOCK_LOTS, 
      slots, 
      history,
      bookSlot,
      confirmPark,
      exitSlot,
      cancelBooking,
      clearHistory,
      registerUser,
      validateUser,
      validateAdmin
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used within AppProvider");
  return context;
};