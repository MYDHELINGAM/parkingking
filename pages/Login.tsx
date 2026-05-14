import React, { useState, useEffect } from 'react';
import { useApp } from '../store';
import { useNavigate } from 'react-router-dom';
import { Car, User, ShieldCheck, Phone, Lock, ChevronRight, AlertCircle, CheckCircle, Eye, EyeOff, X } from 'lucide-react';

// Extracted Component to prevent re-rendering focus loss
const FloatingInput = ({ 
  type, 
  value, 
  onChange, 
  label, 
  icon: Icon,
  isPassword = false,
  showPassword = false,
  onTogglePassword,
  prefix,
  maxLength,
  pattern
}: any) => (
  <div className="relative w-full group">
    <input 
      type={isPassword ? (showPassword ? 'text' : 'password') : type}
      value={value}
      onChange={onChange}
      placeholder=" "
      required
      maxLength={maxLength}
      pattern={pattern}
      className={`peer w-full ${prefix ? 'pl-[5.5rem]' : 'pl-12'} pr-10 py-3.5 bg-dark-900/60 backdrop-blur-md border border-white/10 rounded-xl text-white outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/50 transition-all duration-300 shadow-inner`}
    />
    <label className={`
      absolute left-3 transition-all duration-300 px-2 pointer-events-none rounded
      
      peer-placeholder-shown:top-3.5 
      peer-placeholder-shown:text-base 
      peer-placeholder-shown:text-slate-400 
      ${prefix ? 'peer-placeholder-shown:left-[5.5rem]' : 'peer-placeholder-shown:left-12'}
      
      peer-focus:-top-2.5 
      peer-focus:text-xs 
      peer-focus:text-primary-glow 
      peer-focus:left-3
      peer-focus:bg-dark-900
      
      -top-2.5
      text-xs
      text-primary-glow
      bg-dark-900
      backdrop-blur-xl
    `}>
      {label}
    </label>
    <Icon className="absolute left-4 top-4 h-5 w-5 text-slate-400 peer-focus:text-primary transition-colors" />
    
    {prefix && (
      <span className="absolute left-11 top-[17px] text-slate-400 font-medium text-sm border-r border-white/10 pr-2.5 pl-1 leading-none pointer-events-none select-none">
        {prefix}
      </span>
    )}
    
    {isPassword && (
      <button 
        type="button"
        onClick={onTogglePassword}
        className="absolute right-3 top-4 text-slate-400 hover:text-white transition-colors z-10 focus:outline-none"
      >
        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
      </button>
    )}
  </div>
);

export const Login: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'user' | 'admin'>('user');
  const [isRegistering, setIsRegistering] = useState(false);
  const { login, registerUser, validateUser, validateAdmin } = useApp();
  const navigate = useNavigate();

  // Login Form States
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [adminUsername, setAdminUsername] = useState('');
  
  // UI States for Login
  const [showLoginPass, setShowLoginPass] = useState(false);
  
  // Register Form States
  const [regName, setRegName] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPass, setRegPass] = useState('');
  const [regConfirmPass, setRegConfirmPass] = useState('');
  
  // UI States for Register
  const [showPass, setShowPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [passStrength, setPassStrength] = useState(0); // 0: None, 1: Weak, 2: Medium, 3: Strong
  
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Password Strength Logic
  useEffect(() => {
    if (!regPass) {
      setPassStrength(0);
      return;
    }
    // Simplification for UI: 
    // < 6 chars = Weak (1)
    // >= 6 chars = Medium (2)
    // >= 8 chars + Numbers = Strong (3)
    let uiScore = 1;
    if (regPass.length >= 6) uiScore = 2;
    if (regPass.length >= 8 && (/[0-9]/.test(regPass) || /[^A-Za-z0-9]/.test(regPass))) uiScore = 3;
    
    setPassStrength(uiScore);
  }, [regPass]);

  const handleUserLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    
    if(phone && password) {
      const user = validateUser(phone, password);
      if (user) {
        setSuccessMsg("Login Successful! Redirecting...");
        setTimeout(() => {
          login(user);
          navigate('/dashboard');
        }, 1500);
      } else {
        setError('Invalid account details. Please register if you do not have an account.');
        setTimeout(() => setError(''), 2000);
      }
    }
  };

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    
    if(adminUsername && password) {
      const admin = validateAdmin(adminUsername, password);
      if (admin) {
        setSuccessMsg("Admin Verified. Accessing Dashboard...");
        setTimeout(() => {
          login(admin);
          navigate('/admin');
        }, 1500);
      } else {
        setError('Invalid Admin Credentials.');
        setTimeout(() => setError(''), 2000);
      }
    }
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (passStrength < 2) {
       setError("Password is too weak. Please use at least 6 characters.");
       setTimeout(() => setError(''), 2000);
       return;
    }

    if (regPass !== regConfirmPass) {
      setError("Passwords do not match");
      setTimeout(() => setError(''), 2000);
      return;
    }

    const newUser = {
      id: 'u-' + Math.random().toString(36).substr(2, 9),
      name: regName,
      phone: regPhone,
      role: 'user' as const
    };

    const success = registerUser(newUser, regPass);
    
    if (success) {
      setSuccessMsg("Account Created Successfully! Logging in...");
      setTimeout(() => {
        login(newUser);
        navigate('/dashboard');
      }, 1500);
    } else {
      setError("An account with this phone number already exists.");
      setTimeout(() => setError(''), 2000);
    }
  };

  if (isRegistering) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
        
        <div className="crystal-card w-full max-w-md p-8 rounded-3xl animate-fade-in-up relative z-10">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-white mb-2 drop-shadow-lg animate-fade-in">Create Account</h2>
            <p className="text-slate-300 animate-fade-in">Join Parkaro for smart parking</p>
          </div>

          <form onSubmit={handleRegister} className="flex flex-col gap-6 animate-fade-in">
            {error && <div className="p-3 bg-red-500/20 backdrop-blur-sm border border-red-500/30 text-red-300 text-sm rounded-xl flex items-start"><AlertCircle className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />{error}</div>}
            {successMsg && <div className="p-3 bg-emerald-500/20 backdrop-blur-sm border border-emerald-500/30 text-emerald-300 text-sm rounded-xl flex items-center animate-pulse"><CheckCircle className="w-5 h-5 mr-2 flex-shrink-0" />{successMsg}</div>}
            
            <FloatingInput 
              type="text" 
              value={regName} 
              onChange={(e: any) => setRegName(e.target.value)} 
              label="Full Name" 
              icon={User} 
            />
            <FloatingInput 
              type="tel" 
              value={regPhone} 
              onChange={(e: any) => {
                const value = e.target.value.replace(/\D/g, '');
                if (value.length <= 10) setRegPhone(value);
              }} 
              label="Phone Number" 
              icon={Phone} 
              prefix="+91"
              maxLength={10}
              pattern="[0-9]{10}"
            />
            
            {/* Password Field with Strength */}
            <div className="w-full">
              <FloatingInput 
                type="password" 
                value={regPass} 
                onChange={(e: any) => setRegPass(e.target.value)} 
                label="Password" 
                icon={Lock} 
                isPassword={true}
                showPassword={showPass}
                onTogglePassword={() => setShowPass(!showPass)}
              />
              
              {regPass && (
                <>
                  <div className="flex space-x-1 h-1.5 px-1 mt-2">
                    <div className={`flex-1 rounded-full transition-all duration-300 ${passStrength >= 1 ? 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]' : 'bg-white/10'}`}></div>
                    <div className={`flex-1 rounded-full transition-all duration-300 ${passStrength >= 2 ? 'bg-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.5)]' : 'bg-white/10'}`}></div>
                    <div className={`flex-1 rounded-full transition-all duration-300 ${passStrength >= 3 ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'bg-white/10'}`}></div>
                  </div>
                  <p className={`text-[10px] text-right px-1 font-medium mt-1 ${
                    passStrength === 1 ? 'text-red-400' : 
                    passStrength === 2 ? 'text-yellow-400' : 
                    passStrength === 3 ? 'text-emerald-400' : 'text-slate-500'
                  }`}>
                    {passStrength === 1 ? 'Weak' : passStrength === 2 ? 'Medium' : 'Strong'}
                  </p>
                </>
              )}
            </div>

            {/* Confirm Password with Match Indicator */}
            <div className="w-full">
                <FloatingInput 
                type="password" 
                value={regConfirmPass} 
                onChange={(e: any) => setRegConfirmPass(e.target.value)} 
                label="Confirm Password" 
                icon={ShieldCheck} 
                isPassword={true}
                showPassword={showConfirmPass}
                onTogglePassword={() => setShowConfirmPass(!showConfirmPass)}
              />
              {regConfirmPass && (
                <div className={`flex items-center text-xs px-1 mt-2 ${regPass === regConfirmPass ? 'text-emerald-400' : 'text-red-400'}`}>
                  {regPass === regConfirmPass ? (
                    <><CheckCircle className="w-3 h-3 mr-1" /> Passwords match</>
                  ) : (
                    <><X className="w-3 h-3 mr-1" /> Passwords do not match</>
                  )}
                </div>
              )}
            </div>

            <button type="submit" className="w-full bg-gradient-to-r from-primary to-indigo-600 text-white py-3.5 rounded-xl font-bold shadow-lg shadow-primary/30 hover:shadow-primary/50 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 border border-white/20">
              Create Account
            </button>
          </form>
          <div className="mt-6 text-center animate-fade-in">
            <button onClick={() => setIsRegistering(false)} className="text-sm text-slate-400 hover:text-white transition-colors">
              Already have an account? <span className="text-primary-glow font-semibold underline decoration-primary/50">Login</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      
      <div className="crystal-card w-full max-w-md rounded-3xl overflow-hidden relative z-10 shadow-2xl animate-fade-in-up">
        {/* Header */}
        <div className="bg-white/5 p-8 text-center border-b border-white/5 backdrop-blur-sm">
          <div className="bg-gradient-to-tr from-primary to-indigo-600 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-primary/20 rotate-3 animate-float">
            <Car className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-2 tracking-tight drop-shadow-md animate-fade-in">Parkaro</h1>
        </div>

        {/* Tabs */}
        <div className="flex p-2 bg-dark-900/40 mx-6 mt-6 rounded-2xl border border-white/5 animate-fade-in">
          <button
            onClick={() => { setActiveTab('user'); setError(''); setSuccessMsg(''); }}
            className={`flex-1 flex items-center justify-center py-3 rounded-xl text-sm font-medium transition-all duration-300 ${
              activeTab === 'user' 
                ? 'bg-primary/80 text-white shadow-lg shadow-primary/25 backdrop-blur-md border border-white/10' 
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <User className="h-4 w-4 mr-2" />
            User
          </button>
          <button
            onClick={() => { setActiveTab('admin'); setError(''); setSuccessMsg(''); }}
            className={`flex-1 flex items-center justify-center py-3 rounded-xl text-sm font-medium transition-all duration-300 ${
              activeTab === 'admin' 
                ? 'bg-primary/80 text-white shadow-lg shadow-primary/25 backdrop-blur-md border border-white/10' 
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <ShieldCheck className="h-4 w-4 mr-2" />
            Admin
          </button>
        </div>

        <div className="p-8 pt-6">
          {error && <div className="mb-6 p-4 bg-red-500/20 backdrop-blur-sm border border-red-500/20 text-red-300 text-sm rounded-xl flex items-center animate-pulse"><AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />{error}</div>}
          {successMsg && <div className="mb-6 p-4 bg-emerald-500/20 backdrop-blur-sm border border-emerald-500/20 text-emerald-300 text-sm rounded-xl flex items-center animate-pulse"><CheckCircle className="w-5 h-5 mr-2 flex-shrink-0" />{successMsg}</div>}
          
          {activeTab === 'user' ? (
            <form onSubmit={handleUserLogin} className="flex flex-col gap-6 animate-fade-in">
              <FloatingInput 
                type="tel" 
                value={phone}
                onChange={(e: any) => {
                  const value = e.target.value.replace(/\D/g, '');
                  if (value.length <= 10) setPhone(value);
                }}
                label="Phone Number"
                icon={Phone}
                prefix="+91"
                maxLength={10}
                pattern="[0-9]{10}"
              />
              <FloatingInput 
                type="password" 
                value={password}
                onChange={(e: any) => setPassword(e.target.value)}
                label="Password"
                icon={Lock}
                isPassword={true}
                showPassword={showLoginPass}
                onTogglePassword={() => setShowLoginPass(!showLoginPass)}
              />
              
              <button type="submit" className="group w-full bg-white text-dark-950 py-3.5 rounded-xl font-bold hover:bg-slate-200 transition-all duration-300 flex items-center justify-center shadow-[0_0_20px_rgba(255,255,255,0.3)]">
                Sign In
                <ChevronRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </button>
            </form>
          ) : (
            <form onSubmit={handleAdminLogin} className="flex flex-col gap-6 animate-fade-in">
              <FloatingInput 
                type="text" 
                value={adminUsername}
                onChange={(e: any) => setAdminUsername(e.target.value)}
                label="Admin Username"
                icon={User}
              />
              <FloatingInput 
                type="password" 
                value={password}
                onChange={(e: any) => setPassword(e.target.value)}
                label="Password"
                icon={Lock}
                isPassword={true}
                showPassword={showLoginPass}
                onTogglePassword={() => setShowLoginPass(!showLoginPass)}
              />

              <button type="submit" className="group w-full bg-gradient-to-r from-slate-700 to-slate-800 text-white border border-slate-500/50 py-3.5 rounded-xl font-bold hover:from-slate-600 hover:to-slate-700 transition-all duration-300 flex items-center justify-center shadow-lg">
                Admin Dashboard
                <ChevronRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </button>
            </form>
          )}

          {activeTab === 'user' && (
            <>
              <div className="relative my-8 animate-fade-in">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/10"></div></div>
                <div className="relative flex justify-center text-xs uppercase tracking-wider"><span className="px-4 bg-transparent text-slate-400 backdrop-blur-xl rounded-full">Or</span></div>
              </div>

              <button 
                type="button" 
                onClick={() => setIsRegistering(true)}
                className="w-full bg-white/5 text-white border border-white/10 py-3.5 rounded-xl font-semibold hover:bg-white/10 hover:border-white/20 transition-all duration-300 backdrop-blur-sm animate-fade-in"
              >
                Create New Account
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};