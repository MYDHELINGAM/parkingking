import React from 'react';
import { useApp } from '../store';
import { MapPin, Navigation, ArrowRight, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const UserDashboard: React.FC = () => {
  const { lots } = useApp();
  const navigate = useNavigate();

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-in-up">
      {/* Mock Google Map */}
      <div className="relative w-full h-[400px] rounded-3xl overflow-hidden shadow-2xl border border-white/20 group crystal-card">
        <div className="absolute inset-0 bg-dark-900/50 backdrop-blur-sm">
          {/* Abstract Map UI - Liquid Theme */}
          <div className="w-full h-full opacity-30" style={{
            backgroundImage: 'linear-gradient(#6366f1 1px, transparent 1px), linear-gradient(90deg, #6366f1 1px, transparent 1px)',
            backgroundSize: '50px 50px'
          }}></div>
          
          <div className="absolute inset-0 bg-gradient-to-t from-dark-950/80 via-transparent to-transparent"></div>

          {/* Map Elements */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10">
            <div className="relative flex flex-col items-center">
              <span className="flex h-8 w-8 relative z-10 items-center justify-center">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-4 w-4 bg-cyan-500 border-2 border-white shadow-[0_0_20px_rgba(34,211,238,0.8)]"></span>
              </span>
              <div className="mt-2 bg-dark-900/80 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/20 shadow-lg text-xs font-bold text-white whitespace-nowrap">
                Current Location
              </div>
            </div>
          </div>

          {/* Lot Markers */}
          {lots.map((lot, idx) => (
            <div key={lot.id} 
                 className="absolute cursor-pointer transition-all duration-300 hover:scale-110 group/marker animate-float"
                 style={{ 
                   top: `${30 + (idx * 15)}%`, 
                   left: `${20 + (idx * 20)}%`,
                   animationDelay: `${idx * 1.5}s`
                 }}
                 onClick={() => navigate(`/book/${lot.id}`)}
            >
              <div className="relative">
                <MapPin className="text-primary-glow drop-shadow-[0_0_15px_rgba(99,102,241,0.8)] h-12 w-12 relative z-10" />
                <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-6 h-2 bg-primary/50 blur-[4px] rounded-full"></div>
              </div>
              <div className="opacity-0 group-hover/marker:opacity-100 transition-opacity absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 bg-white/90 backdrop-blur-md text-dark-950 px-3 py-1.5 rounded-lg shadow-xl text-xs font-bold whitespace-nowrap z-20 pointer-events-none border border-white/20">
                {lot.name}
              </div>
            </div>
          ))}
        </div>
        
        <div className="absolute top-6 right-6 bg-dark-900/60 backdrop-blur-xl px-4 py-2 rounded-xl border border-white/10 shadow-lg">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse shadow-[0_0_10px_rgba(52,211,153,0.8)]"></div>
            <span className="text-xs font-medium text-slate-200">Live Updates</span>
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center drop-shadow-md">
          <Navigation className="mr-3 h-6 w-6 text-primary-glow" />
          Nearby Parking Lots
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {lots.map((lot, i) => (
            <div 
              key={lot.id}
              onClick={() => navigate(`/book/${lot.id}`)}
              className="group crystal-card rounded-2xl overflow-hidden hover:border-primary/50 transition-all duration-500 hover:shadow-[0_0_40px_rgba(99,102,241,0.2)] cursor-pointer relative hover:-translate-y-2"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <div className="h-48 overflow-hidden relative">
                <div className="absolute inset-0 bg-gradient-to-t from-dark-900/90 to-transparent z-10"></div>
                <img 
                  src={lot.image} 
                  alt={lot.name} 
                  className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700 opacity-80 group-hover:opacity-100"
                />
                <div className="absolute top-3 right-3 z-20">
                  <span className="bg-emerald-500/20 backdrop-blur-md text-emerald-300 border border-emerald-500/30 text-xs px-3 py-1 rounded-full font-bold flex items-center shadow-[0_0_15px_rgba(16,185,129,0.3)]">
                    <Zap className="w-3 h-3 mr-1 fill-emerald-300" />
                    Open
                  </span>
                </div>
              </div>
              <div className="p-5 relative z-20 -mt-10">
                <h3 className="font-bold text-lg text-white leading-tight mb-2 group-hover:text-primary-glow transition-colors">{lot.name}</h3>
                <p className="text-slate-300 text-sm mb-4 flex items-start line-clamp-2 h-10">
                  <MapPin className="h-4 w-4 mr-1.5 flex-shrink-0 mt-0.5 text-slate-400" />
                  {lot.address}
                </p>
                <div className="flex justify-between items-center pt-4 border-t border-white/10">
                  <div className="flex flex-col">
                    <span className="text-xs text-slate-400 uppercase font-semibold">Capacity</span>
                    <span className="font-bold text-white text-lg drop-shadow">{lot.totalSlots} <span className="text-sm font-normal text-slate-400">Slots</span></span>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all duration-300 shadow-[0_0_15px_rgba(255,255,255,0.1)] group-hover:shadow-[0_0_20px_rgba(99,102,241,0.6)]">
                    <ArrowRight className="h-5 w-5" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};