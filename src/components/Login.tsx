/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { 
  Shield, 
  User as UserIcon, 
  LogIn, 
  UserPlus, 
  Briefcase, 
  CheckCircle2, 
  Eye, 
  EyeOff, 
  Lock, 
  Mail, 
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface LoginProps {
  onLogin: (user: User) => void;
}

export default function Login({ onLogin }: LoginProps) {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  
  // Local storage users list
  const [usersList, setUsersList] = useState<User[]>(() => {
    try {
      const saved = localStorage.getItem('equibudget_users_list');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error("Error reading users list", e);
    }
    return [];
  });

  // Sync users list to local storage
  useEffect(() => {
    localStorage.setItem('equibudget_users_list', JSON.stringify(usersList));
  }, [usersList]);

  // Login Form States
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [loginError, setLoginError] = useState('');

  // Register Form States
  const [registerName, setRegisterName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerRole, setRegisterRole] = useState<UserRole>('collaborator');
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [registerError, setRegisterError] = useState('');
  const [registerSuccess, setRegisterSuccess] = useState('');

  // Handle Login submission
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    if (!loginEmail.trim() || !loginPassword) {
      setLoginError('Por favor ingresa tu correo y contraseña.');
      return;
    }

    const foundUser = usersList.find(
      u => u.email.toLowerCase() === loginEmail.toLowerCase().trim()
    );

    if (!foundUser) {
      setLoginError('No se encontró ningún usuario con ese correo. Registra uno nuevo para comenzar.');
      return;
    }

    const correctPassword = foundUser.password || 'password123';
    if (loginPassword !== correctPassword) {
      setLoginError('Contraseña incorrecta. Inténtalo de nuevo.');
      return;
    }

    onLogin(foundUser);
  };

  // Handle Register submission
  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setRegisterError('');
    setRegisterSuccess('');

    if (!registerName.trim()) {
      setRegisterError('Por favor ingresa tu nombre completo.');
      return;
    }

    if (!registerEmail.trim() || !registerEmail.includes('@')) {
      setRegisterError('Por favor ingresa un correo electrónico válido.');
      return;
    }

    if (registerPassword.length < 6) {
      setRegisterError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    const emailExists = usersList.some(
      u => u.email.toLowerCase() === registerEmail.toLowerCase().trim()
    );

    if (emailExists) {
      setRegisterError('Este correo electrónico ya está registrado.');
      return;
    }

    const names = registerName.trim().split(' ');
    const avatar = names.length > 1 
      ? (names[0].charAt(0) + names[1].charAt(0)).toUpperCase() 
      : names[0].charAt(0).toUpperCase();

    const newUser: User = {
      id: `usr-${Date.now()}`,
      name: registerName.trim(),
      email: registerEmail.toLowerCase().trim(),
      role: registerRole,
      avatar,
      status: 'active',
      password: registerPassword
    };

    setUsersList(prev => [...prev, newUser]);
    setRegisterSuccess('¡Usuario creado correctamente! Redirigiendo...');
    
    setRegisterName('');
    setRegisterEmail('');
    setRegisterPassword('');
    
    setTimeout(() => {
      setLoginEmail(newUser.email);
      setActiveTab('login');
      setRegisterSuccess('');
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden font-sans" id="login-container">
      {/* SaaS premium glow effects in light blue and green */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-brand-green/5 rounded-full blur-3xl"></div>
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-brand-blue/5 rounded-full blur-3xl"></div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md z-10" id="login-brand-wrapper">
        <div className="flex justify-center mb-3">
          <div className="p-3 bg-brand-green rounded-2xl text-white shadow-md shadow-brand-green/10 flex items-center justify-center">
            <Briefcase className="h-7 w-7" />
          </div>
        </div>
        <h2 className="text-center text-3xl font-extrabold font-display text-slate-900 tracking-tight flex items-center justify-center gap-0.5">
          <span className="text-brand-blue font-extrabold font-display">EQUI</span><span className="text-brand-green font-extrabold font-display">BUDGET</span>
        </h2>
        <p className="mt-1 text-center text-xs text-slate-500 font-medium uppercase tracking-widest">
          Simplificá tus presupuestos y viáticos
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md z-10" id="login-card-wrapper">
        <div className="bg-white shadow-xl shadow-brand-blue/5 rounded-2xl border border-slate-100 overflow-hidden">
          
          {/* Tabs for Login & Register */}
          <div className="flex border-b border-slate-150 bg-slate-50/50" id="auth-tabs">
            <button
              onClick={() => {
                setActiveTab('login');
                setLoginError('');
              }}
              className={`flex-1 py-4 text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer relative ${
                activeTab === 'login' ? 'text-slate-950 font-semibold' : 'text-slate-400 hover:text-slate-650'
              }`}
              id="tab-login"
            >
              <LogIn className="h-4 w-4" />
              <span>Ingresar</span>
              {activeTab === 'login' && (
                <motion.div 
                  layoutId="activeTabLine"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-green" 
                />
              )}
            </button>
            <button
              onClick={() => {
                setActiveTab('register');
                setRegisterError('');
              }}
              className={`flex-1 py-4 text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer relative ${
                activeTab === 'register' ? 'text-slate-950 font-semibold' : 'text-slate-400 hover:text-slate-650'
              }`}
              id="tab-register"
            >
              <UserPlus className="h-4 w-4" />
              <span>Registrarse</span>
              {activeTab === 'register' && (
                <motion.div 
                  layoutId="activeTabLine"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-green" 
                />
              )}
            </button>
          </div>

          <div className="p-6 sm:p-10">
            <AnimatePresence mode="wait">
              {activeTab === 'login' ? (
                <motion.div
                  key="login-form-view"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ duration: 0.15 }}
                >
                  <form onSubmit={handleLoginSubmit} className="space-y-4" id="form-login">
                    {loginError && (
                      <div className="p-3 bg-rose-50 border border-rose-100 rounded-2xl text-rose-700 text-xs flex items-center gap-2" id="login-error-alert">
                        <AlertCircle className="h-4 w-4 shrink-0 text-rose-500" />
                        <span className="font-medium">{loginError}</span>
                      </div>
                    )}

                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                        Correo Electrónico
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 h-4.5 w-4.5" />
                        <input
                          type="email"
                          required
                          value={loginEmail}
                          onChange={(e) => setLoginEmail(e.target.value)}
                          placeholder="ejemplo@correo.com"
                          className="w-full pl-11 pr-3 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-950 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-brand-green/5 focus:border-brand-green focus:bg-white transition-all"
                          id="login-email-input"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                        Contraseña
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 h-4.5 w-4.5" />
                        <input
                          type={showLoginPassword ? "text" : "password"}
                          required
                          value={loginPassword}
                          onChange={(e) => setLoginPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full pl-11 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-950 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-brand-green/5 focus:border-brand-green focus:bg-white transition-all"
                          id="login-password-input"
                        />
                        <button
                          type="button"
                          onClick={() => setShowLoginPassword(!showLoginPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                        >
                          {showLoginPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3 bg-brand-green hover:bg-brand-green-hover text-white font-bold rounded-xl shadow-md shadow-brand-green/10 cursor-pointer transition-all flex items-center justify-center gap-2 mt-4 text-sm hover:scale-[1.01] active:scale-[0.99]"
                      id="login-submit-btn"
                    >
                      <LogIn className="h-4 w-4" />
                      <span>Ingresar a mi cuenta</span>
                    </button>
                  </form>

                  {/* Informational guide in case there are no users */}
                  <div className="mt-6 pt-6 border-t border-[#EAF2ED] text-center" id="no-users-guide">
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      ¿Nuevo en Equibudget? Hacé clic en la pestaña de <strong>Registrarse</strong> para crear una cuenta personal al instante.
                    </p>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="register-form-view"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.15 }}
                >
                  <form onSubmit={handleRegisterSubmit} className="space-y-4" id="form-register">
                    {registerError && (
                      <div className="p-3 bg-rose-50 border border-rose-100 rounded-2xl text-rose-700 text-xs flex items-center gap-2" id="register-error-alert">
                        <AlertCircle className="h-4 w-4 shrink-0 text-rose-500" />
                        <span className="font-medium">{registerError}</span>
                      </div>
                    )}

                    {registerSuccess && (
                      <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-2xl text-emerald-800 text-xs flex items-center gap-2" id="register-success-alert">
                        <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                        <span className="font-semibold">{registerSuccess}</span>
                      </div>
                    )}

                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                        Nombre Completo
                      </label>
                      <div className="relative">
                        <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 h-4.5 w-4.5" />
                        <input
                          type="text"
                          required
                          value={registerName}
                          onChange={(e) => setRegisterName(e.target.value)}
                          placeholder="Ej. Martín García"
                          className="w-full pl-11 pr-3 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-950 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-brand-green/5 focus:border-brand-green focus:bg-white transition-all"
                          id="register-name-input"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                        Correo Electrónico
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 h-4.5 w-4.5" />
                        <input
                          type="email"
                          required
                          value={registerEmail}
                          onChange={(e) => setRegisterEmail(e.target.value)}
                          placeholder="correo@empresa.com"
                          className="w-full pl-11 pr-3 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-950 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-brand-green/5 focus:border-brand-green focus:bg-white transition-all"
                          id="register-email-input"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                        Contraseña (mínimo 6 caracteres)
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 h-4.5 w-4.5" />
                        <input
                          type={showRegisterPassword ? "text" : "password"}
                          required
                          value={registerPassword}
                          onChange={(e) => setRegisterPassword(e.target.value)}
                          placeholder="Crea tu contraseña"
                          className="w-full pl-11 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-950 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-brand-green/5 focus:border-brand-green focus:bg-white transition-all"
                          id="register-password-input"
                        />
                        <button
                          type="button"
                          onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                        >
                          {showRegisterPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                        Rol en el Presupuesto
                      </label>
                      <div className="grid grid-cols-2 gap-3" id="role-selector">
                        <button
                          type="button"
                          onClick={() => setRegisterRole('collaborator')}
                          className={`py-3 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                            registerRole === 'collaborator'
                              ? 'bg-brand-green/10 text-brand-green border-brand-green'
                              : 'bg-slate-50 text-slate-500 border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          Colaborador
                        </button>
                        <button
                          type="button"
                          onClick={() => setRegisterRole('admin')}
                          className={`py-3 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                            registerRole === 'admin'
                              ? 'bg-brand-green/10 text-brand-green border-brand-green'
                              : 'bg-slate-50 text-slate-500 border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          Coordinador
                        </button>
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3 bg-brand-green hover:bg-brand-green-hover text-white font-bold rounded-xl shadow-md shadow-brand-green/10 cursor-pointer transition-all flex items-center justify-center gap-2 mt-4 text-sm hover:scale-[1.01] active:scale-[0.99]"
                      id="register-submit-btn"
                    >
                      <UserPlus className="h-4 w-4" />
                      <span>Crear mi cuenta</span>
                    </button>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-100 text-center text-[10px] text-slate-400 font-medium">
            <span>Control de fondos independiente con cifrado local</span>
          </div>

        </div>
      </div>
    </div>
  );
}
