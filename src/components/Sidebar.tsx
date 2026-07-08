/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef } from 'react';
import { User, Notification } from '../types';
import { 
  LayoutDashboard, 
  Briefcase, 
  ReceiptText, 
  Tags, 
  FileSpreadsheet, 
  Cloud, 
  LogOut, 
  Shield, 
  User as UserIcon,
  Bell,
  Menu,
  X,
  Database,
  Camera,
  Trash
} from 'lucide-react';

export type NavigationTab = 'dashboard' | 'projects' | 'expenses' | 'categories' | 'reports' | 'sync' | 'users';

interface SidebarProps {
  activeTab: NavigationTab;
  setActiveTab: (tab: NavigationTab) => void;
  currentUser: User;
  onLogout: () => void;
  notifications: Notification[];
  isMobileOpen: boolean;
  setIsMobileOpen: (open: boolean) => void;
  customLogo: string | null;
  onLogoChange: (logo: string | null) => void;
}

export default function Sidebar({
  activeTab,
  setActiveTab,
  currentUser,
  onLogout,
  notifications,
  isMobileOpen,
  setIsMobileOpen,
  customLogo,
  onLogoChange
}: SidebarProps) {
  const unreadNotifications = notifications.filter(n => !n.read).length;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'projects', label: 'Proyectos', icon: Briefcase },
    { id: 'expenses', label: 'Gastos de Campo', icon: ReceiptText },
    { id: 'categories', label: 'Categorías', icon: Tags, adminOnly: true },
    { id: 'reports', label: 'Reportes y Rendición', icon: FileSpreadsheet },
    { id: 'sync', label: 'Respaldos y Nube', icon: Cloud },
    { id: 'users', label: 'Cuentas Host DB', icon: Database, adminOnly: true }
  ] as const;

  const handleTabClick = (tabId: NavigationTab) => {
    setActiveTab(tabId);
    setIsMobileOpen(false);
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result && typeof event.target.result === 'string') {
        onLogoChange(event.target.result);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <>
      {/* Backdrop overlay for mobile menu */}
      {isMobileOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-slate-900/20 backdrop-blur-xs z-35" 
          onClick={() => setIsMobileOpen(false)}
          id="mobile-backdrop"
        />
      )}

      {/* Sidebar navigation */}
      <aside className={`
        fixed inset-y-0 left-0 bg-white dark:bg-slate-900 border-r border-slate-100 dark:border-slate-800 w-64 z-40 p-5 flex flex-col justify-between transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:h-screen
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}
      `} id="sidebar-container">
        
        <div className="space-y-6">
          {/* Logo / Branding */}
          <div className="hidden lg:flex items-center gap-2.5 pb-4 border-b border-slate-100 dark:border-slate-800 group/brand" id="sidebar-brand-box">
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleLogoUpload} 
              accept="image/*" 
              className="hidden" 
            />
            
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="relative p-2 bg-brand-green rounded-xl text-white shadow-xs cursor-pointer overflow-hidden flex items-center justify-center shrink-0 w-9 h-9 hover:brightness-95 transition-all"
              title="Haz clic para subir tu propio logotipo"
            >
              {customLogo ? (
                <img 
                  src={customLogo} 
                  alt="Logo" 
                  className="w-full h-full object-cover rounded-lg"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <Briefcase className="h-5 w-5" />
              )}
              
              {/* Camera overlay on hover */}
              <div className="absolute inset-0 bg-brand-green-hover/80 opacity-0 group-hover/brand:opacity-100 flex items-center justify-center transition-opacity">
                <Camera className="h-3.5 w-3.5 text-white" />
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h1 className="font-extrabold font-display text-slate-900 dark:text-white text-base tracking-tight truncate flex items-center gap-0.5">
                  <span className="text-brand-blue">EQUI</span><span className="text-brand-green">BUDGET</span>
                </h1>
                {customLogo && (
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      onLogoChange(null);
                    }}
                    className="p-1 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-rose-50 transition-colors"
                    title="Restaurar logo predeterminado"
                  >
                    <Trash className="h-3 w-3" />
                  </button>
                )}
              </div>
              <p className="text-[9px] font-bold text-slate-400 tracking-widest uppercase">Gastos & Viáticos</p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1" id="sidebar-nav">
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest pl-3 mb-2">Menú Principal</p>
            {menuItems.map((item) => {
              // Hide admin-only items if current user is contributor
              if ('adminOnly' in item && item.adminOnly && currentUser.role !== 'admin') {
                return null;
              }

              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => handleTabClick(item.id as NavigationTab)}
                  className={`
                    w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all cursor-pointer group
                    ${isActive 
                      ? 'bg-brand-green/10 dark:bg-brand-green/20 text-slate-900 dark:text-white font-semibold' 
                      : 'text-slate-500 dark:text-slate-400 hover:text-brand-blue dark:hover:text-brand-blue hover:bg-slate-50 dark:hover:bg-slate-800'}
                  `}
                  id={`sidebar-link-${item.id}`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`h-4.5 w-4.5 shrink-0 transition-transform ${isActive ? 'scale-105 text-brand-green' : 'text-brand-blue group-hover:scale-102 opacity-80 group-hover:opacity-100'}`} />
                    <span>{item.label}</span>
                  </div>

                  {/* Badges on menu items */}
                  {item.id === 'sync' && (
                    <span className="w-2 h-2 rounded-full bg-brand-green animate-pulse" />
                  )}
                  {item.id === 'expenses' && unreadNotifications > 0 && (
                    <span className="bg-rose-50 text-rose-600 border border-rose-100 text-[9px] px-1.5 py-0.5 rounded-full font-bold">
                      Aviso
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* User Card & Logout bottom */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-4" id="sidebar-footer">
          {/* User profile info */}
          <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800 flex items-center gap-3" id="sidebar-user-card">
            <div className="w-9 h-9 rounded-full bg-brand-green/10 flex items-center justify-center text-brand-green font-bold text-xs shrink-0 shadow-xs">
              {currentUser.avatar || currentUser.name.charAt(0)}
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="text-xs font-bold text-slate-800 dark:text-white truncate leading-tight">
                {currentUser.name}
              </h4>
              <p className="text-[10px] text-slate-400 truncate mt-0.5 font-medium">{currentUser.email}</p>
              
              {/* Role Indicator */}
              <div className="flex items-center gap-1 mt-1.5">
                <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-0.5 ${
                  currentUser.role === 'admin' 
                    ? 'bg-brand-green/10 text-brand-green border border-brand-green/20' 
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-650 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                }`}>
                  {currentUser.role === 'admin' ? (
                    <>
                      <Shield className="h-2 w-2 shrink-0 text-brand-green" />
                      <span>Coordinador</span>
                    </>
                  ) : (
                    <>
                      <UserIcon className="h-2 w-2 shrink-0 text-slate-500" />
                      <span>Colaborador</span>
                    </>
                  )}
                </span>
              </div>
            </div>
          </div>

          {/* Logout Action */}
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-semibold text-slate-400 hover:text-rose-500 hover:bg-rose-50/50 rounded-xl transition-all cursor-pointer"
            id="sidebar-logout-btn"
          >
            <LogOut className="h-4.5 w-4.5 shrink-0" />
            <span>Cerrar Sesión</span>
          </button>
        </div>

      </aside>
    </>
  );
}
