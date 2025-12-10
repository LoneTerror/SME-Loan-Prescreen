import React, { useState } from 'react';
import { User, Lock, ArrowRight } from 'lucide-react';
import logo from '../assets/logo.png'; 

/**
 * Login Component
 * Handles user authentication for both Applicants and Bank Staff (Admins).
 * Features a split-screen layout with branding on the left and a form on the right.
 */
export default function Login({ onLogin }) {
  // State for form inputs and UI feedback
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [role, setRole] = useState('applicant'); // Default role is 'applicant'

  /**
   * Handles the form submission.
   * Validates credentials based on the selected role (Admin vs Applicant).
   * Note: In a real app, this would make an API call to a backend auth service.
   */
  const handleLogin = (e) => {
    e.preventDefault();
    if (role === 'admin') {
      if (username === 'admin' && password === 'admin123') onLogin('admin');
      else setError('Invalid Bank Staff credentials');
    } else {
      // For demo purposes, any non-empty credentials allow applicant access
      if (username && password) onLogin('user');
      else setError('Please enter username and password');
    }
  };

  return (
    <div className="min-h-screen flex font-sans">
      
      {/* Branding Section (Left Side - Desktop Only) */}
      <div className="hidden lg:flex w-1/2 bg-slate-900 text-white flex-col justify-center px-12 relative overflow-hidden">
        
        {/* Decorative Background Elements */}
        <div className="absolute top-0 left-0 w-full h-full opacity-20">
           <div className="absolute right-0 top-0 bg-indigo-500 w-96 h-96 rounded-full blur-3xl filter opacity-50"></div>
           <div className="absolute left-0 bottom-0 bg-blue-500 w-96 h-96 rounded-full blur-3xl filter opacity-50"></div>
        </div>

        <div className="z-10 flex flex-col items-center text-center">
          <img 
            src={logo} 
            alt="SpotCheck" 
            className="w-96 h-auto object-contain mb-8 drop-shadow-2xl rounded-3xl" 
          />
          
          <p className="text-blue-100 text-2xl font-light mb-8 max-w-lg">
            The next-generation lending gateway. <br/>
            <span className="font-semibold text-white">Verify. Validate. Submit.</span>
          </p>

          {/* Social Proof / Stats */}
          <div className="flex gap-6">
            <div className="bg-white/10 backdrop-blur-md p-5 rounded-2xl border border-white/10 text-center w-32">
              <h3 className="font-bold text-2xl">0s</h3>
              <p className="text-sm text-blue-200">Bounce Rate</p>
            </div>
            <div className="bg-white/10 backdrop-blur-md p-5 rounded-2xl border border-white/10 text-center w-32">
              <h3 className="font-bold text-2xl">100%</h3>
              <p className="text-sm text-blue-200">Compliance</p>
            </div>
          </div>
        </div>
      </div>

      {/* Login Form Section (Right Side) */}
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-[#fdfbf7] p-8">
        <div className="w-full max-w-md bg-white p-10 rounded-2xl shadow-xl border border-slate-100">
            
            {/* Mobile Logo (Visible only on small screens) */}
            <div className="lg:hidden text-center mb-8">
                <img src={logo} alt="Logo" className="w-40 h-auto mx-auto rounded-2xl" />
            </div>

            <h2 className="text-3xl font-bold text-slate-800 mb-2">Welcome Back</h2>
            <p className="text-slate-500 mb-8">Please enter your details to sign in.</p>

            {/* Role Switcher Pill */}
            <div className="bg-slate-50 p-1 rounded-xl flex mb-8 border border-slate-100">
                <button 
                  onClick={() => setRole('applicant')} 
                  className={`flex-1 py-3 text-sm font-semibold rounded-lg transition-all ${role === 'applicant' ? 'bg-white shadow text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  Applicant
                </button>
                <button 
                  onClick={() => setRole('admin')} 
                  className={`flex-1 py-3 text-sm font-semibold rounded-lg transition-all ${role === 'admin' ? 'bg-white shadow text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  Bank Staff
                </button>
            </div>

            {/* Input Fields */}
            <form onSubmit={handleLogin} className="space-y-6">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Username</label>
                  <div className="relative mt-2">
                    <User className="w-5 h-5 absolute left-3 top-3.5 text-slate-400" />
                    <input 
                      type="text" 
                      className="w-full pl-10 p-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all" 
                      value={username} 
                      onChange={e => setUsername(e.target.value)} 
                      placeholder={role === 'admin' ? "admin" : "user"} 
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Password</label>
                  <div className="relative mt-2">
                    <Lock className="w-5 h-5 absolute left-3 top-3.5 text-slate-400" />
                    <input 
                      type="password" 
                      className="w-full pl-10 p-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all" 
                      value={password} 
                      onChange={e => setPassword(e.target.value)} 
                      placeholder="••••••••" 
                    />
                  </div>
                </div>
                
                {/* Error Message Display */}
                {error && (
                  <div className="text-sm font-medium text-red-600 bg-red-50 p-4 rounded-xl text-center border border-red-100">
                    {error}
                  </div>
                )}
                
                <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-4 rounded-xl font-bold shadow-lg shadow-indigo-200 hover:shadow-indigo-300 flex justify-center items-center gap-2 transition-all transform active:scale-[0.98]">
                  {role === 'admin' ? 'Access Dashboard' : 'Start Application'} <ArrowRight className="w-5 h-5" />
                </button>
            </form>

            <div className="mt-8 pt-6 border-t border-slate-100 text-center">
              <p className="text-xs text-slate-400">Demo Access: <span className="font-mono text-indigo-500">admin/admin123</span> or <span className="font-mono text-indigo-500">user/password</span></p>
            </div>
        </div>
      </div>
    </div>
  );
}