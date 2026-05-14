import React, { useState, useEffect } from 'react';
import { useApp } from '../store';
import { Slot } from '../types';
import { Car, CheckCircle, Clock, X, Printer, IndianRupee, PieChart, Building2, Filter, Truck, Bike, LayoutGrid, RotateCcw, PanelLeft, PanelLeftClose, User, Calendar, History } from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const { lots, slots, exitSlot, user, history } = useApp();
  // Filter lots if the user is a specific lot admin
  const visibleLots = user?.managedLotId ? lots.filter(l => l.id === user.managedLotId) : lots;
  
  const [selectedLotId, setSelectedLotId] = useState(visibleLots[0]?.id || lots[0].id);
  const [modalSlot, setModalSlot] = useState<Slot | null>(null);
  const [showBill, setShowBill] = useState(false);
  
  // Animation State
  const [isClosing, setIsClosing] = useState(false);

  // Sidebar Toggle State
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Tab State
  const [activeTab, setActiveTab] = useState<'slots' | 'history'>('slots');

  // Filters
  const [filterType, setFilterType] = useState<'all' | 'car' | 'bike' | 'truck'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'available' | 'allocated' | 'occupied'>('all');
  
  // History Filters
  const [historyDate, setHistoryDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [historyLotFilter, setHistoryLotFilter] = useState<string>('all');

  // Update selected lot if user changes or visible lots change
  useEffect(() => {
    if (visibleLots.length > 0 && !visibleLots.find(l => l.id === selectedLotId)) {
        setSelectedLotId(visibleLots[0].id);
    }
  }, [visibleLots, selectedLotId]);

  // Auto-collapse sidebar on mobile on initial load
  useEffect(() => {
    if (window.innerWidth < 1024) {
      setIsSidebarOpen(false);
    }
  }, []);

  // Apply Filters
  const currentSlots = slots.filter(s => {
    if (s.lotId !== selectedLotId) return false;
    if (filterType !== 'all' && s.type !== filterType) return false;
    if (filterStatus !== 'all' && s.status !== filterStatus) return false;
    return true;
  });

  // Apply History Filters
  const filteredHistory = history.filter(h => {
    // Filter by lot
    if (historyLotFilter !== 'all' && h.lotId !== historyLotFilter) return false;
    
    // Filter by date
    if (historyDate && h.exitTime) {
      const exitDate = new Date(h.exitTime).toISOString().split('T')[0];
      if (exitDate !== historyDate) return false;
    }
    
    // Only show completed bookings (vehicles that have exited)
    return h.status === 'completed';
  }).sort((a, b) => (b.exitTime || 0) - (a.exitTime || 0));

  const currentLot = lots.find(l => l.id === selectedLotId);

  // Stats Logic (based on total slots for lot, not filtered)
  const lotStatsSlots = slots.filter(s => s.lotId === selectedLotId);
  const totalSlots = lotStatsSlots.length;
  const available = lotStatsSlots.filter(s => s.status === 'available').length;
  const allocated = lotStatsSlots.filter(s => s.status === 'allocated').length;
  const occupied = lotStatsSlots.filter(s => s.status === 'occupied').length;

  const handleSlotClick = (slot: Slot) => {
    if (slot.status === 'available') {
      return; 
    } else {
      setIsClosing(false);
      setModalSlot(slot);
      setShowBill(false);
    }
  };

  const closeModal = (callback?: () => void) => {
    setIsClosing(true);
    setTimeout(() => {
      if (callback) callback();
      setModalSlot(null);
      setShowBill(false);
      setIsClosing(false);
    }, 200); // Wait for animation
  };

  const handleExit = () => {
    setIsClosing(true);
    setTimeout(() => {
      setShowBill(true);
      setIsClosing(false);
    }, 200);
  };

  const handleBillClose = () => {
    if (modalSlot) {
      // Execute exit logic then close
      exitSlot(modalSlot.id);
      closeModal();
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const calculateBillDetails = (slot: Slot) => {
    if (!slot.entryTime) return { days: 0, hours: 0, rate: 0, total: 0 };
    
    const now = Date.now();
    const diffMs = now - slot.entryTime;
    
    // Convert to days (rounding up for daily charge)
    const days = Math.max(1, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
    const totalHours = Math.ceil(diffMs / (1000 * 60 * 60));
    
    let rate = 0;
    switch(slot.type) {
        case 'bike': rate = 20; break;
        case 'car': rate = 50; break;
        case 'truck': rate = 100; break;
        default: rate = 50;
    }
    
    return {
        days,
        hours: totalHours,
        rate,
        total: days * rate
    };
  };

  const getVehicleIcon = (type: string) => {
    switch(type) {
      case 'bike': return <Bike className="w-5 h-5" />;
      case 'truck': return <Truck className="w-5 h-5" />;
      default: return <Car className="w-5 h-5" />;
    }
  };

  return (
    <div className="flex h-[calc(100vh-80px)] overflow-hidden relative">
      
      {/* Mobile Backdrop */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 lg:hidden transition-opacity duration-300"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <div className={`
          fixed lg:static inset-y-0 left-0 z-40 h-full
          glass-panel border-r border-white/10
          transition-all duration-300 ease-in-out transform shadow-2xl
          ${isSidebarOpen ? 'translate-x-0 w-72' : '-translate-x-full lg:translate-x-0 lg:w-0 lg:opacity-0 lg:overflow-hidden'}
      `}>
         <div className="w-72 h-full flex flex-col p-6 overflow-y-auto custom-scrollbar">
            <div className="flex justify-between items-center mb-8">
                <div className="flex items-center">
                  <Filter className="w-5 h-5 text-primary-glow mr-2 drop-shadow-[0_0_10px_rgba(99,102,241,0.8)]" />
                  <h2 className="text-xl font-bold text-white tracking-wide">Filters</h2>
                </div>
                <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors">
                  <X className="w-5 h-5" />
                </button>
            </div>

            <div className="space-y-8 flex-1">
                {/* Lot Selector */}
                <div className="space-y-3">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Select Lot</label>
                  <div className="relative group">
                    <select 
                        value={selectedLotId} 
                        onChange={(e) => setSelectedLotId(e.target.value)}
                        disabled={visibleLots.length <= 1}
                        className="w-full bg-dark-950/50 backdrop-blur-md text-white border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 appearance-none cursor-pointer hover:bg-white/5 transition-all"
                    >
                        {visibleLots.map(lot => <option key={lot.id} value={lot.id} className="bg-dark-900">{lot.name}</option>)}
                    </select>
                    <Building2 className="absolute right-3 top-3.5 h-4 w-4 text-slate-400 pointer-events-none group-hover:text-primary transition-colors" />
                  </div>
                </div>

                {/* Vehicle Type Filter */}
                <div className="space-y-3">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Vehicle Type</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button 
                      onClick={() => setFilterType('all')}
                      className={`px-3 py-2 rounded-lg text-sm font-medium flex items-center justify-center transition-all ${filterType === 'all' ? 'bg-primary text-white shadow-[0_0_15px_rgba(99,102,241,0.4)]' : 'bg-white/5 text-slate-400 border border-white/5 hover:bg-white/10'}`}
                    >
                      <LayoutGrid className="w-4 h-4 mr-2" /> All
                    </button>
                    <button 
                      onClick={() => setFilterType('car')}
                      className={`px-3 py-2 rounded-lg text-sm font-medium flex items-center justify-center transition-all ${filterType === 'car' ? 'bg-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.4)]' : 'bg-white/5 text-slate-400 border border-white/5 hover:bg-white/10'}`}
                    >
                      <Car className="w-4 h-4 mr-2" /> Car
                    </button>
                    <button 
                      onClick={() => setFilterType('bike')}
                      className={`px-3 py-2 rounded-lg text-sm font-medium flex items-center justify-center transition-all ${filterType === 'bike' ? 'bg-orange-500 text-white shadow-[0_0_15px_rgba(249,115,22,0.4)]' : 'bg-white/5 text-slate-400 border border-white/5 hover:bg-white/10'}`}
                    >
                      <Bike className="w-4 h-4 mr-2" /> Bike
                    </button>
                    <button 
                      onClick={() => setFilterType('truck')}
                      className={`px-3 py-2 rounded-lg text-sm font-medium flex items-center justify-center transition-all ${filterType === 'truck' ? 'bg-purple-600 text-white shadow-[0_0_15px_rgba(147,51,234,0.4)]' : 'bg-white/5 text-slate-400 border border-white/5 hover:bg-white/10'}`}
                    >
                      <Truck className="w-4 h-4 mr-2" /> Truck
                    </button>
                  </div>
                </div>

                {/* Status Filter */}
                <div className="space-y-3">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Status</label>
                  <div className="space-y-2">
                    <button 
                      onClick={() => setFilterStatus('all')}
                      className={`w-full px-4 py-2 rounded-lg text-sm font-medium flex items-center transition-all ${filterStatus === 'all' ? 'bg-white/10 text-white border border-white/10' : 'text-slate-400 hover:bg-white/5'}`}
                    >
                      <div className="w-2 h-2 rounded-full bg-slate-400 mr-3"></div> All Statuses
                    </button>
                    <button 
                      onClick={() => setFilterStatus('available')}
                      className={`w-full px-4 py-2 rounded-lg text-sm font-medium flex items-center transition-all ${filterStatus === 'available' ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30' : 'text-slate-400 hover:bg-white/5'}`}
                    >
                      <div className="w-2 h-2 rounded-full bg-emerald-500 mr-3 shadow-[0_0_5px_rgba(16,185,129,0.8)]"></div> Available
                    </button>
                    <button 
                      onClick={() => setFilterStatus('occupied')}
                      className={`w-full px-4 py-2 rounded-lg text-sm font-medium flex items-center transition-all ${filterStatus === 'occupied' ? 'bg-blue-500/10 text-blue-300 border border-blue-500/30' : 'text-slate-400 hover:bg-white/5'}`}
                    >
                      <div className="w-2 h-2 rounded-full bg-blue-500 mr-3 shadow-[0_0_5px_rgba(59,130,246,0.8)]"></div> Occupied
                    </button>
                    <button 
                      onClick={() => setFilterStatus('allocated')}
                      className={`w-full px-4 py-2 rounded-lg text-sm font-medium flex items-center transition-all ${filterStatus === 'allocated' ? 'bg-yellow-500/10 text-yellow-300 border border-yellow-500/30' : 'text-slate-400 hover:bg-white/5'}`}
                    >
                      <div className="w-2 h-2 rounded-full bg-yellow-500 mr-3 shadow-[0_0_5px_rgba(234,179,8,0.8)]"></div> Allocated
                    </button>
                  </div>
                </div>
            </div>

            <div className="pt-6 border-t border-white/10">
                <button 
                  onClick={() => { setFilterType('all'); setFilterStatus('all'); }}
                  className="w-full py-3 rounded-xl bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white transition-all text-sm font-medium flex items-center justify-center border border-white/5"
                >
                  <RotateCcw className="w-4 h-4 mr-2" /> Reset Filters
                </button>
                
                <div className="mt-6 grid grid-cols-2 gap-4">
                    <div className="bg-dark-950/60 p-3 rounded-xl border border-white/10">
                      <span className="text-[10px] uppercase font-bold text-slate-500">Occupied</span>
                      <p className="text-xl font-bold text-white mt-1 drop-shadow-md">{occupied}</p>
                    </div>
                    <div className="bg-dark-950/60 p-3 rounded-xl border border-white/10">
                      <span className="text-[10px] uppercase font-bold text-slate-500">Available</span>
                      <p className="text-xl font-bold text-emerald-400 mt-1 drop-shadow-md">{available}</p>
                    </div>
                </div>
            </div>
         </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative transition-all duration-300">
        
        {/* Top Control Bar */}
        <div className="p-4 md:p-6 flex flex-col xl:flex-row xl:items-center gap-4 flex-shrink-0">
           <div className="flex items-center gap-4 w-full xl:w-auto">
             <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="p-3 bg-dark-900/60 border border-white/10 rounded-xl text-white hover:bg-primary/80 hover:border-primary/50 hover:text-white transition-all duration-300 shadow-lg group flex-shrink-0 backdrop-blur-md"
                title={isSidebarOpen ? "Close Filters" : "Open Filters"}
             >
                {isSidebarOpen ? <PanelLeftClose className="w-6 h-6" /> : <PanelLeft className="w-6 h-6" />}
             </button>
             
             {/* Tab Switcher */}
             <div className="flex bg-dark-900/60 border border-white/10 rounded-xl p-1 backdrop-blur-md">
               <button
                 onClick={() => setActiveTab('slots')}
                 className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center ${
                   activeTab === 'slots' 
                     ? 'bg-primary text-white shadow-lg' 
                     : 'text-slate-400 hover:text-white'
                 }`}
               >
                 <LayoutGrid className="w-4 h-4 mr-2" />
                 Live Slots
               </button>
               <button
                 onClick={() => setActiveTab('history')}
                 className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center ${
                   activeTab === 'history' 
                     ? 'bg-primary text-white shadow-lg' 
                     : 'text-slate-400 hover:text-white'
                 }`}
               >
                 <History className="w-4 h-4 mr-2" />
                 History
               </button>
             </div>
             
             {/* Stats Strip - Integrated in Top Bar */}
             {activeTab === 'slots' && (
             <div className="grid grid-cols-2 md:grid-cols-4 gap-3 flex-1 xl:w-auto">
                <div className="bg-dark-900/40 border border-white/10 rounded-xl px-4 py-2 flex items-center min-w-[140px] backdrop-blur-sm">
                    <div className="bg-white/5 p-2 rounded-lg mr-3"><PieChart className="text-primary-glow w-5 h-5" /></div>
                    <div><p className="text-slate-400 text-[10px] uppercase font-bold">Total</p><p className="text-lg font-bold text-white leading-none">{totalSlots}</p></div>
                </div>
                <div className="bg-dark-900/40 border border-white/10 rounded-xl px-4 py-2 flex items-center min-w-[140px] backdrop-blur-sm">
                    <div className="bg-yellow-500/10 p-2 rounded-lg mr-3"><Clock className="text-yellow-500 w-5 h-5" /></div>
                    <div><p className="text-slate-400 text-[10px] uppercase font-bold">Allocated</p><p className="text-lg font-bold text-yellow-500 leading-none">{allocated}</p></div>
                </div>
                <div className="bg-dark-900/40 border border-white/10 rounded-xl px-4 py-2 flex items-center min-w-[140px] backdrop-blur-sm">
                    <div className="bg-blue-500/10 p-2 rounded-lg mr-3"><Car className="text-blue-400 w-5 h-5" /></div>
                    <div><p className="text-slate-400 text-[10px] uppercase font-bold">Occupied</p><p className="text-lg font-bold text-blue-400 leading-none">{occupied}</p></div>
                </div>
                <div className="bg-dark-900/40 border border-white/10 rounded-xl px-4 py-2 flex items-center min-w-[140px] backdrop-blur-sm">
                    <div className="bg-emerald-500/10 p-2 rounded-lg mr-3"><CheckCircle className="text-emerald-400 w-5 h-5" /></div>
                    <div><p className="text-slate-400 text-[10px] uppercase font-bold">Available</p><p className="text-lg font-bold text-emerald-400 leading-none">{available}</p></div>
                </div>
             </div>
             )}
             
             {/* History Filters */}
             {activeTab === 'history' && (
               <div className="flex gap-3 flex-1 xl:w-auto">
                 <div className="flex items-center gap-2">
                   <Calendar className="w-5 h-5 text-slate-400" />
                   <input
                     type="date"
                     value={historyDate}
                     onChange={(e) => setHistoryDate(e.target.value)}
                     max={new Date().toISOString().split('T')[0]}
                     className="bg-dark-900/60 border border-white/10 rounded-xl px-4 py-2 text-white outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all backdrop-blur-md"
                   />
                 </div>
                 <div className="flex items-center gap-2">
                   <Building2 className="w-5 h-5 text-slate-400" />
                   <select
                     value={historyLotFilter}
                     onChange={(e) => setHistoryLotFilter(e.target.value)}
                     className="bg-dark-900/60 border border-white/10 rounded-xl px-4 py-2 text-white outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all backdrop-blur-md appearance-none cursor-pointer"
                   >
                     <option value="all" className="bg-dark-900">All Lots</option>
                     {visibleLots.map(lot => (
                       <option key={lot.id} value={lot.id} className="bg-dark-900">{lot.name}</option>
                     ))}
                   </select>
                 </div>
                 <div className="bg-dark-900/40 border border-white/10 rounded-xl px-4 py-2 flex items-center backdrop-blur-sm">
                   <div className="bg-emerald-500/10 p-2 rounded-lg mr-3"><CheckCircle className="text-emerald-400 w-5 h-5" /></div>
                   <div><p className="text-slate-400 text-[10px] uppercase font-bold">Records</p><p className="text-lg font-bold text-white leading-none">{filteredHistory.length}</p></div>
                 </div>
               </div>
             )}
           </div>
        </div>

        {/* Grid Container */}
        <div className="flex-1 px-4 md:px-6 pb-6 overflow-hidden">
          <div className="h-full bg-dark-900/30 border border-white/10 rounded-3xl shadow-2xl overflow-hidden relative flex flex-col backdrop-blur-md crystal-card">
            
            {activeTab === 'slots' ? (
            <div className="flex-1 overflow-y-auto p-6 scroll-smooth custom-scrollbar">
              {currentSlots.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-500 animate-fade-in-up">
                    <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-4 border border-white/5">
                        <Filter className="w-10 h-10 opacity-50" />
                    </div>
                    <p className="text-lg font-medium text-white mb-2">No slots found</p>
                    <p className="text-sm">Try adjusting your filters to see more results.</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
                  {currentSlots.map((slot, i) => (
                    <button
                      key={slot.id}
                      onClick={() => handleSlotClick(slot)}
                      className={`
                        relative overflow-hidden rounded-2xl p-4 border transition-all duration-300 text-left group
                        animate-fade-in-up flex flex-col justify-between h-[140px] backdrop-blur-sm crystal-card
                        ${slot.status === 'available' 
                            ? 'bg-white/5 border-white/10 hover:border-emerald-400/50 hover:bg-emerald-500/10 hover:shadow-[0_0_30px_rgba(16,185,129,0.15)] hover:-translate-y-1 hover:scale-[1.02]' 
                            : ''}
                        ${slot.status === 'allocated' 
                            ? 'bg-yellow-500/10 border-yellow-500/20 hover:border-yellow-500 hover:bg-yellow-500/15 hover:shadow-[0_0_20px_rgba(234,179,8,0.2)] hover:-translate-y-0.5 hover:scale-[1.01]' 
                            : ''}
                        ${slot.status === 'occupied' 
                            ? 'bg-blue-600/10 border-blue-500/20 hover:border-blue-500 hover:bg-blue-600/15 hover:shadow-[0_0_20px_rgba(59,130,246,0.2)] hover:-translate-y-0.5 hover:scale-[1.01]' 
                            : ''}
                      `}
                      style={{ animationDelay: `${Math.min(i * 10, 500)}ms` }}
                    >
                      {/* Card Header */}
                      <div className="flex justify-between items-start">
                        <span className={`text-2xl font-bold font-mono ${
                            slot.status === 'available' ? 'text-slate-400 group-hover:text-white' : 
                            slot.status === 'allocated' ? 'text-yellow-400' : 'text-blue-300'
                        }`}>
                           {slot.number}
                        </span>
                        <div className={`p-2 rounded-lg backdrop-blur-md ${
                             slot.status === 'available' ? 'bg-white/5 text-slate-500 group-hover:text-emerald-300 group-hover:bg-emerald-500/20' : 
                             slot.status === 'allocated' ? 'bg-yellow-500/20 text-yellow-500' : 'bg-blue-500/20 text-blue-400'
                        }`}>
                           {getVehicleIcon(slot.type)}
                        </div>
                      </div>

                      {/* Card Body */}
                      <div className="mt-2">
                        {slot.status === 'available' && (
                             <div className="flex items-center text-slate-400 text-xs font-medium group-hover:text-emerald-300 transition-colors">
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-2 shadow-[0_0_8px_rgba(16,185,129,1)]"></div>
                                Available
                             </div>
                        )}
                        {slot.status === 'allocated' && (
                            <div className="space-y-1">
                                <div className="flex items-center text-yellow-500 text-xs font-bold">
                                    <Clock className="w-3 h-3 mr-1" /> Reserved
                                </div>
                                <div className="text-white text-xs truncate opacity-80 flex items-center">
                                    <User className="w-3 h-3 mr-1" />
                                    {slot.userName || 'Unknown'}
                                </div>
                            </div>
                        )}
                        {slot.status === 'occupied' && (
                            <div className="space-y-1">
                                <div className="flex items-center text-blue-400 text-xs font-bold">
                                    <CheckCircle className="w-3 h-3 mr-1" /> Parked
                                </div>
                                <div className="text-white text-sm font-mono bg-blue-500/10 px-1.5 py-0.5 rounded w-fit border border-blue-500/20">
                                    {slot.vehicleNumber || '---'}
                                </div>
                            </div>
                        )}
                      </div>

                      {/* Hover Overlay Effect for Available - Iridescence */}
                      {slot.status === 'available' && (
                          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
            ) : (
            <div className="flex-1 overflow-y-auto p-6 scroll-smooth custom-scrollbar">
              {filteredHistory.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-500 animate-fade-in-up">
                    <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-4 border border-white/5">
                        <History className="w-10 h-10 opacity-50" />
                    </div>
                    <p className="text-lg font-medium text-white mb-2">No history records</p>
                    <p className="text-sm">No completed bookings found for this date.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredHistory.map((record, idx) => (
                    <div 
                      key={record.id} 
                      className="crystal-card rounded-2xl border border-white/5 p-6 hover:border-emerald-500/30 transition-all duration-300 animate-fade-in-up"
                      style={{ animationDelay: `${Math.min(idx * 30, 500)}ms` }}
                    >
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h3 className="text-lg font-bold text-white flex items-center">
                                {record.lotName}
                                <span className="ml-3 text-sm font-mono bg-white/5 px-2 py-1 rounded border border-white/10">
                                  Slot {record.slotNumber}
                                </span>
                              </h3>
                              <p className="text-slate-400 text-sm mt-1 capitalize flex items-center">
                                {getVehicleIcon(record.slotType)}
                                <span className="ml-2">{record.slotType} Slot</span>
                              </p>
                            </div>
                            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center">
                              <CheckCircle className="w-3 h-3 mr-1" /> Completed
                            </span>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                            <div className="space-y-2">
                              <div className="flex items-center text-sm">
                                <User className="w-4 h-4 mr-2 text-slate-400" />
                                <span className="text-slate-400 mr-2">Customer:</span>
                                <span className="text-white font-medium">{record.userName}</span>
                              </div>
                              <div className="flex items-center text-sm">
                                <Car className="w-4 h-4 mr-2 text-slate-400" />
                                <span className="text-slate-400 mr-2">Vehicle:</span>
                                <span className="text-white font-mono font-bold">{record.vehicleNumber}</span>
                                <span className="text-slate-500 ml-2 capitalize">({record.vehicleType})</span>
                              </div>
                            </div>
                            
                            <div className="space-y-2">
                              <div className="flex items-center text-sm">
                                <Clock className="w-4 h-4 mr-2 text-slate-400" />
                                <span className="text-slate-400 mr-2">Entry:</span>
                                <span className="text-white">{record.entryTime ? new Date(record.entryTime).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }) : '-'}</span>
                              </div>
                              <div className="flex items-center text-sm">
                                <CheckCircle className="w-4 h-4 mr-2 text-emerald-400" />
                                <span className="text-slate-400 mr-2">Exit:</span>
                                <span className="text-white">{record.exitTime ? new Date(record.exitTime).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }) : '-'}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        {record.cost !== undefined && (
                          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-6 py-4 min-w-[140px] text-center">
                            <p className="text-xs text-emerald-400 uppercase font-bold mb-1">Total Paid</p>
                            <p className="text-2xl font-black text-white flex items-center justify-center">
                              <IndianRupee className="w-5 h-5 mr-1" />
                              {record.cost}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal Details */}
      {modalSlot && !showBill && (
        <div className={`fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 z-50 transition-opacity duration-200 ${isClosing ? 'opacity-0' : 'opacity-100'}`}>
          <div className={`crystal-card border border-white/20 rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.5)] max-w-md w-full overflow-hidden relative animate-fade-in-up transition-all duration-200 ${isClosing ? 'scale-95 translate-y-4 opacity-0' : 'scale-100 translate-y-0 opacity-100'}`}>
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-cyan-400"></div>
            <div className="p-8">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-white drop-shadow-md">Slot {modalSlot.type.toUpperCase()}-{modalSlot.number}</h3>
                <button onClick={() => closeModal()} className="text-slate-400 hover:text-white transition-colors bg-white/5 p-2 rounded-full hover:bg-white/10"><X className="w-5 h-5" /></button>
              </div>
              <div className="space-y-4 text-sm bg-dark-900/60 p-6 rounded-2xl border border-white/10 backdrop-blur-md">
                <p className="flex justify-between items-center border-b border-white/10 pb-2"><span className="text-slate-400">Status</span> <span className="font-bold uppercase text-xs px-2 py-1 rounded bg-white/10 text-white border border-white/5 shadow-inner">{modalSlot.status}</span></p>
                <p className="flex justify-between items-center border-b border-white/10 pb-2"><span className="text-slate-400">User</span> <span className="text-white font-medium">{modalSlot.userName}</span></p>
                <p className="flex justify-between items-center border-b border-white/10 pb-2"><span className="text-slate-400">Phone</span> <span className="text-white font-medium">{modalSlot.userPhone}</span></p>
                <p className="flex justify-between items-center border-b border-white/10 pb-2"><span className="text-slate-400">Vehicle</span> <span className="font-mono bg-primary/20 text-primary-glow px-2 rounded border border-primary/20">{modalSlot.vehicleNumber}</span></p>
                <p className="flex justify-between items-center border-b border-white/10 pb-2"><span className="text-slate-400">Booking Time</span> <span className="text-white">{modalSlot.bookingTime ? new Date(modalSlot.bookingTime).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }) : '-'}</span></p>
                <p className="flex justify-between items-center"><span className="text-slate-400">Type</span> <span className="capitalize text-white">{modalSlot.vehicleType}</span></p>
              </div>
              
              {modalSlot.status === 'occupied' && (
                <button 
                  onClick={handleExit}
                  className="mt-8 w-full bg-red-500/10 text-red-300 border border-red-500/30 py-3.5 rounded-xl font-bold shadow-lg hover:bg-red-500 hover:text-white transition-all duration-300 hover:shadow-[0_0_20px_rgba(239,68,68,0.4)]"
                >
                  Exit Vehicle & Generate Bill
                </button>
              )}
               {modalSlot.status === 'allocated' && (
                <p className="mt-6 text-sm text-center text-yellow-400 bg-yellow-500/10 p-3 rounded-xl border border-yellow-500/20 backdrop-blur-sm">
                  <Clock className="w-4 h-4 inline mr-2" />
                  Waiting for user to confirm parking...
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Bill Modal (RECEIPT) */}
      {showBill && modalSlot && (
        <div className={`fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 z-50 transition-opacity duration-200 ${isClosing ? 'opacity-0' : 'opacity-100'}`}>
          <div id="print-receipt" className={`bg-white rounded-3xl shadow-[0_0_50px_rgba(255,255,255,0.2)] max-w-sm w-full overflow-hidden relative animate-fade-in-up transition-all duration-200 ${isClosing ? 'scale-95 translate-y-4 opacity-0' : 'scale-100 translate-y-0 opacity-100'}`}>
            <div className="w-full">
              <div className="p-8 pb-4 text-center border-b border-dashed border-gray-300">
                 <div className="bg-emerald-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3 shadow-md shadow-emerald-200 no-print">
                   <CheckCircle className="h-8 w-8 text-emerald-600" />
                 </div>
                 <h2 className="text-2xl font-black text-gray-900 uppercase tracking-wide">Parkaro</h2>
                 <p className="text-xs text-gray-500 mt-1 uppercase tracking-widest">Parking Receipt</p>
              </div>

              <div className="p-8 py-6 space-y-3">
                 <div className="flex justify-between items-end border-b border-gray-100 pb-2">
                    <span className="text-xs text-gray-400 uppercase font-semibold">Customer</span>
                    <span className="text-sm font-bold text-gray-800 text-right">{modalSlot.userName}<br/><span className="text-xs font-normal text-gray-500">{modalSlot.userPhone}</span></span>
                 </div>
                 <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                    <span className="text-xs text-gray-400 uppercase font-semibold">Vehicle</span>
                    <span className="text-sm font-bold text-gray-800 uppercase">{modalSlot.vehicleNumber} <span className="text-xs text-gray-500 normal-case">({modalSlot.vehicleType})</span></span>
                 </div>
                 
                 <div className="py-2 space-y-2">
                    <div className="flex justify-between text-xs">
                        <span className="text-gray-500">Entry Time</span>
                        <span className="text-gray-900 font-medium">{modalSlot.entryTime ? new Date(modalSlot.entryTime).toLocaleString() : '-'}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                        <span className="text-gray-500">Exit Time</span>
                        <span className="text-gray-900 font-medium">{new Date().toLocaleString()}</span>
                    </div>
                 </div>

                 <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                    {(() => {
                        const bill = calculateBillDetails(modalSlot);
                        return (
                            <>
                                <div className="flex justify-between text-xs mb-1">
                                    <span className="text-gray-500">Duration</span>
                                    <span className="text-gray-900 font-bold">{bill.days} Day(s) <span className="font-normal text-gray-400">({bill.hours} hrs)</span></span>
                                </div>
                                <div className="flex justify-between text-xs mb-1">
                                    <span className="text-gray-500">Rate ({modalSlot.vehicleType})</span>
                                    <span className="text-gray-900">₹{bill.rate} / day</span>
                                </div>
                                <div className="flex justify-between items-center mt-3 pt-2 border-t border-gray-200">
                                    <span className="text-sm font-bold text-gray-900">TOTAL DUE</span>
                                    <span className="text-xl font-black text-primary flex items-center"><IndianRupee className="h-5 w-5" /> {bill.total}</span>
                                </div>
                            </>
                        );
                    })()}
                 </div>
              </div>

              <div className="bg-gray-100 p-4 flex gap-3 no-print">
                <button onClick={handlePrint} className="flex-1 bg-white border border-gray-200 text-gray-700 py-3 rounded-xl font-bold hover:bg-gray-50 flex items-center justify-center transition-colors shadow-sm">
                  <Printer className="h-4 w-4 mr-2" /> Print
                </button>
                <button onClick={handleBillClose} className="flex-1 bg-gray-900 text-white py-3 rounded-xl font-bold hover:bg-black transition-colors shadow-lg">
                  Paid & Exit
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};