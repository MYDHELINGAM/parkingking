import React, { useState } from 'react';
import { useApp } from '../store';
import { Clock, MapPin, Car, AlertTriangle, Check, ArrowLeft, Trash2, Calendar, XCircle, History, Ban, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Slot, BookingHistoryItem } from '../types';

export const MyBookings: React.FC = () => {
  const { slots, user, lots, history, confirmPark, clearHistory, cancelBooking } = useApp();
  const navigate = useNavigate();
  const [toast, setToast] = useState<string | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{ show: boolean; slotId: string | null }>({ show: false, slotId: null });
  
  if (!user) return null;

  const now = Date.now();

  const handleCancelBooking = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    setConfirmDialog({ show: true, slotId: id });
  };

  const confirmCancellation = () => {
    if (confirmDialog.slotId) {
      console.log("Cancelling booking for slot:", confirmDialog.slotId);
      cancelBooking(confirmDialog.slotId);
      setToast('Booking cancelled. Slot is now available.');
      setTimeout(() => setToast(null), 3000);
    }
    setConfirmDialog({ show: false, slotId: null });
  };

  const cancelCancellation = () => {
    setConfirmDialog({ show: false, slotId: null });
  };

  const handleConfirmPark = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    confirmPark(id);
  }

  // 1. Get Active Slots (Allocated / Occupied)
  const activeBookings = slots
    .filter(s => (s.status === 'allocated' || s.status === 'occupied') && s.userId === user.id)
    .map(slot => {
        let displayStatus: 'upcoming' | 'active' = 'active';
        
        if (slot.status === 'occupied') {
            displayStatus = 'active';
        } else if (slot.status === 'allocated') {
             if (slot.scheduledTime && slot.scheduledTime > now) {
                 displayStatus = 'upcoming';
             } else {
                 displayStatus = 'active';
             }
        }

        return {
            type: 'current',
            data: slot,
            displayStatus: displayStatus,
            sortTime: slot.bookingTime || 0
        };
    });

  // 2. Get History (Completed / Failed)
  const historyBookings = history
    .filter(h => h.userId === user.id)
    .map(item => ({
        type: 'history',
        data: item,
        displayStatus: item.status, // 'completed' | 'failed' | 'cancelled'
        sortTime: item.bookingTime
    }));

  // 3. Merge and Sort (Newest first)
  const allBookings = [...activeBookings, ...historyBookings].sort((a, b) => b.sortTime - a.sortTime);

  const getLotName = (id: string) => lots.find(l => l.id === id)?.name || 'Unknown Lot';

  const getStatusColor = (status: string) => {
      switch(status) {
          case 'upcoming': return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20';
          case 'active': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
          case 'completed': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
          case 'failed': return 'bg-red-500/10 text-red-400 border-red-500/20';
          case 'cancelled': return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
          default: return 'bg-slate-500/10 text-slate-400';
      }
  };

  const getStatusIcon = (status: string) => {
      switch(status) {
          case 'upcoming': return <Calendar className="w-3 h-3 mr-1" />;
          case 'active': return <Clock className="w-3 h-3 mr-1" />;
          case 'completed': return <Check className="w-3 h-3 mr-1" />;
          case 'failed': return <XCircle className="w-3 h-3 mr-1" />;
          case 'cancelled': return <Ban className="w-3 h-3 mr-1" />;
          default: return null;
      }
  };

  return (
    <div className="max-w-4xl mx-auto animate-fade-in-up relative">
      
      {/* Confirmation Dialog */}
      {confirmDialog.show && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="crystal-card max-w-md w-full p-8 rounded-3xl border border-red-500/20 shadow-[0_0_40px_rgba(239,68,68,0.3)] animate-scale-in">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-red-500/40">
                <AlertTriangle className="h-8 w-8 text-red-500" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Cancel Booking?</h3>
              <p className="text-slate-300 text-sm">Are you sure you want to cancel this booking? This action cannot be undone.</p>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={cancelCancellation}
                className="flex-1 bg-white/5 hover:bg-white/10 text-white border border-white/10 py-3 px-4 rounded-xl font-semibold transition-all duration-300"
              >
                Keep Booking
              </button>
              <button
                onClick={confirmCancellation}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white py-3 px-4 rounded-xl font-bold transition-all duration-300 shadow-lg shadow-red-500/30 hover:shadow-red-500/50 flex items-center justify-center"
              >
                <Ban className="w-4 h-4 mr-2" />
                Yes, Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-24 right-5 md:right-10 z-50 bg-emerald-500/90 text-white px-6 py-4 rounded-xl shadow-[0_0_30px_rgba(16,185,129,0.3)] animate-fade-in-up flex items-center border border-white/20 backdrop-blur-md">
          <CheckCircle className="w-6 h-6 mr-3 text-white drop-shadow-md" />
          <div>
             <h4 className="font-bold text-sm">Success</h4>
             <p className="text-xs text-emerald-100">{toast}</p>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center">
            <button 
            onClick={() => navigate('/dashboard')} 
            className="mr-4 p-2 rounded-full bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-all duration-300 hover:scale-110"
            aria-label="Back to Dashboard"
            >
            <ArrowLeft className="h-5 w-5" />
            </button>
            <h2 className="text-2xl font-bold text-white">My Bookings</h2>
        </div>
        
        {historyBookings.length > 0 && (
            <button 
                onClick={clearHistory}
                className="flex items-center px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-xl text-sm font-medium transition-all"
            >
                <Trash2 className="w-4 h-4 mr-2" />
                Clear History
            </button>
        )}
      </div>
      
      {allBookings.length === 0 ? (
        <div className="text-center py-24 bg-dark-900/50 rounded-3xl border border-white/5 backdrop-blur-sm crystal-card">
          <History className="h-20 w-20 text-dark-800 mx-auto mb-6" />
          <p className="text-slate-500 text-lg font-light">You have no booking history.</p>
          <button onClick={() => navigate('/dashboard')} className="mt-6 text-primary hover:text-white underline transition-colors">Book a slot now</button>
        </div>
      ) : (
        <div className="space-y-6">
          {allBookings.map((item, idx) => {
            const displayStatus = item.displayStatus;
            
            let id: string;
            let lotName: string;
            let slotNumber: number;
            let slotType: string;
            let vehicleNumber: string;
            let vehicleType: string;
            let bookingTime: number;
            let scheduledTime: number;
            let status: string;
            let exitTime: number | undefined;

            if (item.type === 'current') {
                const s = item.data as Slot;
                id = s.id;
                lotName = getLotName(s.lotId);
                slotNumber = s.number;
                slotType = s.type;
                vehicleNumber = s.vehicleNumber || '';
                vehicleType = s.vehicleType || 'car';
                bookingTime = s.bookingTime || 0;
                scheduledTime = s.scheduledTime || 0;
                status = s.status;
                exitTime = undefined;
            } else {
                const h = item.data as BookingHistoryItem;
                id = h.id;
                lotName = h.lotName;
                slotNumber = h.slotNumber;
                slotType = h.slotType;
                vehicleNumber = h.vehicleNumber;
                vehicleType = h.vehicleType;
                bookingTime = h.bookingTime;
                scheduledTime = h.scheduledTime;
                status = h.status;
                exitTime = h.exitTime;
            }

            return (
                <div key={`${item.type}-${id}-${idx}`} className="crystal-card rounded-2xl border border-white/5 overflow-hidden flex flex-col md:flex-row group hover:border-primary/30 transition-all duration-300 shadow-lg relative">
                
                {/* Status Bar Indicator */}
                <div className={`absolute left-0 top-0 bottom-0 w-1 ${
                    displayStatus === 'active' ? 'bg-yellow-500' : 
                    displayStatus === 'upcoming' ? 'bg-indigo-500' :
                    displayStatus === 'completed' ? 'bg-emerald-500' : 
                    displayStatus === 'cancelled' ? 'bg-slate-500' : 'bg-red-500'
                }`}></div>

                <div className="p-8 flex-grow pl-10">
                    <div className="flex justify-between items-start">
                    <div>
                        <h3 className="text-xl font-bold text-white group-hover:text-primary transition-colors">{lotName}</h3>
                        <p className="text-slate-400 flex items-center text-sm mt-2">
                        <MapPin className="h-4 w-4 mr-1.5" /> 
                        <span className="uppercase text-slate-300 mr-1">{slotType} Slot:</span> 
                        <span className="text-white font-mono font-bold ml-1 text-lg bg-dark-800 px-2 py-0.5 rounded-lg border border-white/10">{slotNumber}</span>
                        </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border flex items-center ${getStatusColor(displayStatus)}`}>
                        {getStatusIcon(displayStatus)}
                        {displayStatus}
                    </span>
                    </div>

                    <div className="mt-6 grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center text-slate-300">
                        <Car className="h-4 w-4 mr-2.5 text-primary" /> 
                        <span className="font-mono">{vehicleNumber}</span> 
                        <span className="ml-2 text-slate-500 capitalize">({vehicleType})</span>
                    </div>
                    <div className="flex items-center text-slate-300">
                        <Calendar className="h-4 w-4 mr-2.5 text-primary" /> 
                        {/* Use scheduled time if available, else booking time */}
                        {scheduledTime 
                            ? new Date(scheduledTime).toLocaleString([], {month:'short', day:'numeric', hour: '2-digit', minute:'2-digit'}) 
                            : new Date(bookingTime || 0).toLocaleString([], {month:'short', day:'numeric', hour: '2-digit', minute:'2-digit'})
                        }
                    </div>
                    </div>

                    {/* Action Hint for Active/Allocated */}
                    {displayStatus === 'active' && item.type === 'current' && status === 'allocated' && (
                        <div className="mt-6 bg-yellow-500/5 p-4 rounded-xl flex items-start text-xs text-yellow-200/80 border border-yellow-500/10 animate-pulse">
                            <AlertTriangle className="h-4 w-4 mr-2.5 flex-shrink-0 text-yellow-500" />
                            Action Required: Please confirm parking within 1 hour.
                        </div>
                    )}
                    
                    {displayStatus === 'upcoming' && (
                         <div className="mt-6 text-xs text-indigo-300">
                            Your slot is reserved. Status will change to Active when your time arrives.
                         </div>
                    )}
                </div>

                {/* Actions for Allocated Slots (Active or Upcoming) */}
                {item.type === 'current' && status === 'allocated' && (
                     <div className="bg-dark-950/50 p-6 flex flex-col gap-3 justify-center md:w-56 border-t md:border-t-0 md:border-l border-white/5 relative z-10">
                        {displayStatus === 'active' && (
                            <button 
                                onClick={(e) => handleConfirmPark(e, id)}
                                className="w-full bg-gradient-to-r from-primary to-indigo-600 text-white py-2 px-4 rounded-xl font-bold shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all transform hover:scale-105 active:scale-95 text-sm cursor-pointer"
                            >
                                Confirm Park
                            </button>
                        )}
                        <button 
                            onClick={(e) => handleCancelBooking(e, id)}
                            className="w-full bg-red-500/10 text-red-400 border border-red-500/20 py-2 px-4 rounded-xl font-bold hover:bg-red-500 hover:text-white transition-all text-sm flex items-center justify-center cursor-pointer hover:shadow-lg"
                        >
                            <Ban className="w-4 h-4 mr-2" />
                            Cancel
                        </button>
                     </div>
                )}
                
                {/* Parked Indicator */}
                {displayStatus === 'active' && item.type === 'current' && status === 'occupied' && (
                    <div className="bg-emerald-500/5 p-6 flex items-center justify-center md:w-56 border-t md:border-t-0 md:border-l border-emerald-500/10">
                    <div className="text-center">
                        <div className="w-10 h-10 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-2 text-emerald-500">
                            <Check className="h-6 w-6" />
                        </div>
                        <p className="text-emerald-400 font-bold mb-1">Parked</p>
                        <p className="text-xs text-emerald-600/70">Timer running...</p>
                    </div>
                    </div>
                )}

                {/* History Info */}
                {(displayStatus === 'completed' || displayStatus === 'failed' || displayStatus === 'cancelled') && (
                     <div className="bg-dark-950/30 p-6 flex items-center justify-center md:w-56 border-t md:border-t-0 md:border-l border-white/5">
                        <div className="text-center">
                            <p className="text-slate-500 text-xs uppercase font-bold mb-1">
                                {displayStatus === 'completed' ? 'Ended' : displayStatus === 'cancelled' ? 'Cancelled' : 'Failed'}
                            </p>
                            <p className="text-white text-sm">
                                {displayStatus === 'cancelled' 
                                  ? 'User Cancelled' 
                                  : exitTime ? new Date(exitTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'Auto-Cancelled'}
                            </p>
                        </div>
                     </div>
                )}
                </div>
            );
          })}
        </div>
      )}
    </div>
  );
};