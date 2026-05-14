import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../store';
import { Slot } from '../types';
import { Calendar, Clock, Truck, Car, Bike, CheckCircle, Search, ArrowLeft } from 'lucide-react';

export const Booking: React.FC = () => {
  const { lotId } = useParams<{ lotId: string }>();
  const { lots, slots, bookSlot, user } = useApp();
  const navigate = useNavigate();
  
  const lot = lots.find(l => l.id === lotId);
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [loading, setLoading] = useState(false);
  
  // Step 1 Form Data
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [vehicleType, setVehicleType] = useState<'car' | 'bike' | 'truck'>('car');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');

  // Step 2 Selection
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);

  // Filter slots for this lot AND specific vehicle type
  const lotSlots = slots.filter(s => s.lotId === lotId && s.type === vehicleType);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setStep(2);
    setSelectedSlot(null); // Reset selection when searching again
  };

  const handleBookSlot = () => {
    if (!selectedSlot || !user) return;
    
    setLoading(true);
    // Simulate API delay
    setTimeout(() => {
      bookSlot(selectedSlot.id, {
        vehicleNumber,
        vehicleType,
        date,
        time
      }, user);
      setLoading(false);
      setStep(3); // Wait for redirect
      
      setTimeout(() => {
        navigate('/bookings');
      }, 1000);
    }, 1000);
  };

  if (!lot) return <div className="text-white text-center mt-20">Lot not found</div>;

  return (
    <div className="max-w-4xl mx-auto py-6">
      <button onClick={() => navigate('/dashboard')} className="flex items-center text-slate-400 hover:text-white mb-6 transition-colors">
        <ArrowLeft className="h-4 w-4 mr-2" /> Back to Dashboard
      </button>

      {/* Progress Bar */}
      <div className="mb-10 flex justify-center items-center">
        <div className="flex items-center w-full max-w-lg relative">
          <div className="absolute top-1/2 left-0 w-full h-1 bg-dark-800 -z-10 rounded-full"></div>
          <div 
            className="absolute top-1/2 left-0 h-1 bg-primary -z-10 rounded-full transition-all duration-500"
            style={{ width: step === 1 ? '0%' : step === 2 ? '50%' : '100%' }}
          ></div>
          
          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold border-4 transition-all duration-300 bg-dark-950 ${step >= 1 ? 'border-primary text-primary shadow-[0_0_15px_rgba(99,102,241,0.5)]' : 'border-dark-800 text-slate-600'}`}>1</div>
          <div className="flex-grow"></div>
          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold border-4 transition-all duration-300 bg-dark-950 ${step >= 2 ? 'border-primary text-primary shadow-[0_0_15px_rgba(99,102,241,0.5)]' : 'border-dark-800 text-slate-600'}`}>2</div>
          <div className="flex-grow"></div>
          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold border-4 transition-all duration-300 bg-dark-950 ${step >= 3 ? 'border-primary text-primary shadow-[0_0_15px_rgba(99,102,241,0.5)]' : 'border-dark-800 text-slate-600'}`}>3</div>
        </div>
      </div>

      <div className="glass-card rounded-3xl overflow-hidden animate-fade-in-up">
        <div className="bg-gradient-to-r from-dark-900 to-dark-800 p-8 border-b border-white/5">
          <h1 className="text-2xl font-bold text-white">Booking at {lot.name}</h1>
          <p className="text-slate-400 text-sm mt-1">{lot.address}</p>
        </div>

        <div className="p-8">
          {step === 1 && (
            <form onSubmit={handleSearch} className="animate-fade-in-up">
              <h2 className="text-xl font-semibold text-white mb-6">Vehicle & Time</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">Vehicle Number</label>
                  <input 
                    type="text" 
                    required
                    value={vehicleNumber}
                    onChange={e => setVehicleNumber(e.target.value.toUpperCase())}
                    className="w-full px-5 py-3 bg-dark-950 border border-dark-800 rounded-xl focus:ring-1 focus:ring-primary focus:border-primary outline-none uppercase text-white transition-all duration-300"
                    placeholder="ABC-1234"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">Vehicle Type</label>
                  <div className="grid grid-cols-3 gap-3">
                    <button type="button" onClick={() => setVehicleType('car')} className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all duration-300 ${vehicleType === 'car' ? 'border-primary bg-primary/20 text-white shadow-[0_0_15px_rgba(99,102,241,0.2)]' : 'border-dark-800 bg-dark-950 text-slate-500 hover:border-dark-700'}`}>
                      <Car className="h-6 w-6 mb-2" />
                      <span className="text-xs font-bold">Car</span>
                    </button>
                    <button type="button" onClick={() => setVehicleType('bike')} className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all duration-300 ${vehicleType === 'bike' ? 'border-primary bg-primary/20 text-white shadow-[0_0_15px_rgba(99,102,241,0.2)]' : 'border-dark-800 bg-dark-950 text-slate-500 hover:border-dark-700'}`}>
                      <Bike className="h-6 w-6 mb-2" />
                      <span className="text-xs font-bold">Bike</span>
                    </button>
                    <button type="button" onClick={() => setVehicleType('truck')} className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all duration-300 ${vehicleType === 'truck' ? 'border-primary bg-primary/20 text-white shadow-[0_0_15px_rgba(99,102,241,0.2)]' : 'border-dark-800 bg-dark-950 text-slate-500 hover:border-dark-700'}`}>
                      <Truck className="h-6 w-6 mb-2" />
                      <span className="text-xs font-bold">Truck</span>
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">Date</label>
                  <div className="relative">
                    <Calendar className="absolute left-4 top-3.5 h-5 w-5 text-slate-500" />
                    <input 
                      type="date" 
                      required
                      value={date}
                      onChange={e => setDate(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 bg-dark-950 border border-dark-800 rounded-xl focus:ring-1 focus:ring-primary focus:border-primary outline-none text-white appearance-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">Time</label>
                  <div className="relative">
                    <Clock className="absolute left-4 top-3.5 h-5 w-5 text-slate-500" />
                    <input 
                      type="time" 
                      required
                      value={time}
                      onChange={e => setTime(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 bg-dark-950 border border-dark-800 rounded-xl focus:ring-1 focus:ring-primary focus:border-primary outline-none text-white appearance-none"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <button type="submit" className="bg-white text-dark-950 px-8 py-3.5 rounded-xl font-bold hover:bg-slate-200 transition-colors shadow-lg flex items-center">
                  <Search className="h-5 w-5 mr-2" />
                  Find Slots
                </button>
              </div>
            </form>
          )}

          {step === 2 && (
            <div className="animate-fade-in-up">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-xl font-semibold text-white">
                    Select a {vehicleType.charAt(0).toUpperCase() + vehicleType.slice(1)} Slot
                </h2>
                <div className="flex space-x-6 text-sm">
                  <div className="flex items-center text-slate-300"><div className="w-3 h-3 rounded-full bg-emerald-500 mr-2 shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div> Available</div>
                  <div className="flex items-center text-slate-300"><div className="w-3 h-3 rounded-full bg-dark-800 mr-2 border border-slate-600"></div> Occupied/Allocated</div>
                </div>
              </div>

              {/* Grid tailored for showing 100 items, using simpler buttons to save space */}
              <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-3 mb-8 max-h-[400px] overflow-y-auto pr-2 no-scrollbar">
                {lotSlots.map(slot => (
                  <button
                    key={slot.id}
                    disabled={slot.status !== 'available'}
                    onClick={() => setSelectedSlot(slot)}
                    className={`
                      relative p-2 rounded-lg border transition-all duration-300 flex flex-col items-center justify-center aspect-square group
                      ${slot.status === 'available' 
                        ? selectedSlot?.id === slot.id 
                          ? 'border-primary bg-primary text-white shadow-[0_0_20px_rgba(99,102,241,0.5)] scale-110 z-10' 
                          : 'border-emerald-500/30 bg-emerald-500/5 text-emerald-400 hover:border-emerald-500 hover:bg-emerald-500/10'
                        : 'border-dark-800 bg-dark-950/50 text-dark-700 cursor-not-allowed opacity-50'}
                    `}
                  >
                    <span className="text-sm font-bold">{slot.number}</span>
                  </button>
                ))}
              </div>

              {selectedSlot && (
                <div className="bg-dark-950/50 p-6 rounded-2xl border border-primary/20 mb-8 relative overflow-hidden">
                  <div className="absolute left-0 top-0 w-1 h-full bg-primary"></div>
                  <h3 className="font-bold text-white mb-4">Booking Summary</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <p><span className="text-slate-500">Vehicle:</span> <span className="text-slate-200">{vehicleNumber} ({vehicleType})</span></p>
                    <p><span className="text-slate-500">Slot:</span> <span className="text-primary font-bold">{selectedSlot.type.toUpperCase()}-{selectedSlot.number}</span> at {lot.name}</p>
                    <p><span className="text-slate-500">Time:</span> <span className="text-slate-200">{date} {time}</span></p>
                    <p><span className="text-slate-500">User:</span> <span className="text-slate-200">{user?.name}</span></p>
                  </div>
                </div>
              )}

              <div className="flex justify-between pt-4 border-t border-white/5">
                <button onClick={() => setStep(1)} className="text-slate-400 hover:text-white px-4 py-2">Back</button>
                <button 
                  onClick={handleBookSlot}
                  disabled={!selectedSlot}
                  className={`bg-primary text-white px-8 py-3 rounded-xl font-bold hover:bg-primary-glow transition-all duration-300 shadow-[0_0_20px_rgba(99,102,241,0.3)] flex items-center ${!selectedSlot ? 'opacity-50 cursor-not-allowed shadow-none' : ''}`}
                >
                  {loading ? 'Processing...' : 'Confirm Booking'}
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="text-center py-16 animate-fade-in-up">
              <div className="inline-flex items-center justify-center w-24 h-24 bg-emerald-500/10 rounded-full mb-8 relative">
                <div className="absolute inset-0 bg-emerald-500/20 blur-xl rounded-full animate-pulse"></div>
                <CheckCircle className="h-12 w-12 text-emerald-500 relative z-10" />
              </div>
              <h2 className="text-3xl font-bold text-white mb-2">Booking Confirmed!</h2>
              <p className="text-slate-400">Redirecting to your dashboard...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};