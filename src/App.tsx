/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Project, 
  Expense, 
  Category, 
  User, 
  Notification 
} from './types';
import { 
  DEFAULT_PROJECTS, 
  DEFAULT_EXPENSES, 
  DEFAULT_CATEGORIES, 
  DEFAULT_NOTIFICATIONS 
} from './data/initialData';

// Component imports
import Login from './components/Login';
import Sidebar, { NavigationTab } from './components/Sidebar';
import DashboardView from './components/DashboardView';
import ProjectManager from './components/ProjectManager';
import ExpenseManager from './components/ExpenseManager';
import CategoryManager from './components/CategoryManager';
import ReportsView from './components/ReportsView';
import CloudSyncSimulator from './components/CloudSyncSimulator';
import HostDatabaseView from './components/HostDatabaseView';

// Icons
import { Menu, X, Bell, User as UserIcon, Cloud, LogOut } from 'lucide-react';

export default function App() {
  // --- Authentication State ---
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem('equibudget_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Sync current user to localStorage
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('equibudget_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('equibudget_user');
    }
  }, [currentUser]);

  const handleLogout = () => {
    setCurrentUser(null);
  };

  if (!currentUser) {
    return <Login onLogin={setCurrentUser} />;
  }

  // Render DashboardShell with key of user ID to force complete remount when switching accounts
  return (
    <DashboardShell 
      key={currentUser.id}
      currentUser={currentUser} 
      onLogout={handleLogout} 
    />
  );
}

interface DashboardShellProps {
  key?: string;
  currentUser: User;
  onLogout: () => void;
}

function DashboardShell({ currentUser, onLogout }: DashboardShellProps) {
  const isDemoUser = ['usr-1', 'usr-2', 'usr-3'].includes(currentUser.id);

  // --- Master Database State (Scoped by User ID) ---
  const [projects, setProjects] = useState<Project[]>(() => {
    try {
      const saved = localStorage.getItem(`equibudget_projects_${currentUser.id}`);
      return saved ? JSON.parse(saved) : (isDemoUser ? DEFAULT_PROJECTS : []);
    } catch {
      return isDemoUser ? DEFAULT_PROJECTS : [];
    }
  });

  const [expenses, setExpenses] = useState<Expense[]>(() => {
    try {
      const saved = localStorage.getItem(`equibudget_expenses_${currentUser.id}`);
      return saved ? JSON.parse(saved) : (isDemoUser ? DEFAULT_EXPENSES : []);
    } catch {
      return isDemoUser ? DEFAULT_EXPENSES : [];
    }
  });

  const [categories, setCategories] = useState<Category[]>(() => {
    try {
      const saved = localStorage.getItem(`equibudget_categories_${currentUser.id}`);
      return saved ? JSON.parse(saved) : DEFAULT_CATEGORIES;
    } catch {
      return DEFAULT_CATEGORIES;
    }
  });

  const [notifications, setNotifications] = useState<Notification[]>(() => {
    try {
      const saved = localStorage.getItem(`equibudget_notifications_${currentUser.id}`);
      return saved ? JSON.parse(saved) : (isDemoUser ? DEFAULT_NOTIFICATIONS(DEFAULT_PROJECTS, DEFAULT_EXPENSES) : []);
    } catch {
      return isDemoUser ? DEFAULT_NOTIFICATIONS(DEFAULT_PROJECTS, DEFAULT_EXPENSES) : [];
    }
  });

  // --- Brand custom logo state ---
  const [customLogo, setCustomLogo] = useState<string | null>(() => {
    try {
      return localStorage.getItem('equibudget_custom_logo');
    } catch {
      return null;
    }
  });

  const handleLogoChange = (newLogo: string | null) => {
    setCustomLogo(newLogo);
    try {
      if (newLogo) {
        localStorage.setItem('equibudget_custom_logo', newLogo);
      } else {
        localStorage.removeItem('equibudget_custom_logo');
      }
    } catch (e) {
      console.error(e);
    }
  };

  // --- UI Navigation State ---
  const [activeTab, setActiveTab] = useState<NavigationTab>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [cloudSyncStatus, setCloudSyncStatus] = useState<'synced' | 'syncing' | 'error' | 'offline'>('synced');
  const [isNotificationPaneOpen, setIsNotificationPaneOpen] = useState(false);

  // --- Local Persistence side-effects ---
  useEffect(() => {
    localStorage.setItem(`equibudget_projects_${currentUser.id}`, JSON.stringify(projects));
  }, [projects, currentUser.id]);

  useEffect(() => {
    localStorage.setItem(`equibudget_expenses_${currentUser.id}`, JSON.stringify(expenses));
  }, [expenses, currentUser.id]);

  useEffect(() => {
    localStorage.setItem(`equibudget_categories_${currentUser.id}`, JSON.stringify(categories));
  }, [categories, currentUser.id]);

  useEffect(() => {
    localStorage.setItem(`equibudget_notifications_${currentUser.id}`, JSON.stringify(notifications));
  }, [notifications, currentUser.id]);

  // --- Dynamic Compliance Notification Engines ---
  useEffect(() => {
    if (projects.length === 0) return;

    const newAlerts: Notification[] = [];
    
    projects.forEach(p => {
      if (p.status !== 'Activo') return;

      const spent = expenses.filter(e => e.projectId === p.id).reduce((sum, e) => sum + e.value, 0);
      const ratio = p.budget > 0 ? spent / p.budget : 0;

      // Rule A: Low budget threshold (< 20% remaining)
      if (ratio >= 0.8) {
        const severity = ratio > 1.0 ? 'high' as const : 'medium' as const;
        const msg = ratio > 1.0 
          ? `El proyecto "${p.name}" ha sobregirado sus fondos de viáticos por ${new Intl.NumberFormat('es-CL').format(spent - p.budget)}.`
          : `Alerta de viáticos: Al proyecto "${p.name}" le queda menos del 20% del presupuesto asignado.`;
        
        newAlerts.push({
          id: `sys-budget-${p.id}`,
          type: 'budget_low',
          title: ratio > 1.0 ? 'Presupuesto Excedido' : 'Fondos Bajos',
          message: msg,
          date: new Date().toISOString().split('T')[0],
          severity,
          read: false
        });
      }

      // Rule B: Project timeline approaching (less than 7 days)
      const diffTime = new Date(p.endDate).getTime() - new Date().getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      if (diffDays > 0 && diffDays <= 7) {
        newAlerts.push({
          id: `sys-date-${p.id}`,
          type: 'project_end',
          title: 'Vencimiento Próximo',
          message: `El proyecto de ingeniería "${p.name}" está programado para finalizar en ${diffDays} días. Prepare la rendición final.`,
          date: new Date().toISOString().split('T')[0],
          severity: 'medium',
          read: false
        });
      }
    });

    // Merge system alerts with user alerts, eliminating duplicate IDs
    setNotifications(prev => {
      const filteredPrev = prev.filter(n => !n.id.startsWith('sys-'));
      return [...filteredPrev, ...newAlerts];
    });
  }, [projects, expenses]);

  // Read status computation
  const unreadCount = useMemo(() => {
    return notifications.filter(n => !n.read).length;
  }, [notifications]);

  // Handle marking notification as read
  const handleMarkAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const handleMarkAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const handleClearNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col lg:flex-row relative" id="app-root-shell">
      
      {/* 1. Mobile Top Navigation Bar (Hidden in large screens) */}
      <div 
        className="lg:hidden bg-white text-slate-800 h-16 px-4 flex items-center justify-between sticky top-0 z-40 border-b border-slate-100 shadow-xs"
        id="mobile-top-bar"
      >
        <div className="flex items-center gap-2">
          {customLogo ? (
            <div className="w-8 h-8 rounded-lg overflow-hidden shrink-0 border border-slate-100 flex items-center justify-center bg-white">
              <img 
                src={customLogo} 
                alt="Logo" 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
          ) : (
            <div className="w-8 h-8 bg-brand-green rounded-lg flex items-center justify-center font-extrabold text-sm text-white">
              EB
            </div>
          )}
          <span className="font-extrabold font-display text-base tracking-tight text-slate-900"><span className="text-brand-blue font-extrabold font-display">EQUI</span><span className="text-brand-green font-extrabold font-display">BUDGET</span></span>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Notifications Button */}
          <div className="relative">
            <button 
              onClick={() => setIsNotificationPaneOpen(!isNotificationPaneOpen)}
              className="p-1.5 text-slate-500 hover:text-slate-800 relative rounded-lg cursor-pointer"
            >
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full animate-pulse" />
              )}
            </button>

            {/* Mobile Notification Panel */}
            <AnimatePresence>
              {isNotificationPaneOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-45" 
                    onClick={() => setIsNotificationPaneOpen(false)} 
                  />
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 mt-2 w-72 bg-white border border-slate-150 rounded-2xl shadow-2xl z-50 overflow-hidden p-4 space-y-3 text-slate-800"
                    id="mobile-notifications-pane"
                  >
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                      <span className="text-xs font-bold text-slate-800">Alertas ({unreadCount})</span>
                      {unreadCount > 0 && (
                        <button 
                          onClick={handleMarkAllAsRead}
                          className="text-[10px] text-brand-green hover:underline font-bold cursor-pointer"
                        >
                          Leídas todas
                        </button>
                      )}
                    </div>

                    <div className="max-h-60 overflow-y-auto divide-y divide-slate-50 space-y-2">
                      {notifications.length === 0 ? (
                        <p className="text-[10px] text-slate-400 text-center py-4">No hay alertas activas.</p>
                      ) : (
                        notifications.map((n) => (
                          <div 
                            key={n.id} 
                            className={`text-[11px] p-2 rounded-xl transition-colors ${
                              !n.read ? 'bg-brand-green/5' : 'bg-white'
                            } relative group`}
                          >
                            <div className="flex items-center justify-between">
                              <span className={`font-bold ${
                                n.severity === 'high' ? 'text-rose-500' : 'text-slate-800'
                              }`}>
                                {n.title}
                              </span>
                              <div className="flex gap-1.5">
                                {!n.read && (
                                  <button 
                                    onClick={() => handleMarkAsRead(n.id)}
                                    className="text-brand-green font-bold hover:underline cursor-pointer text-[10px]"
                                  >
                                    Leído
                                  </button>
                                )}
                                <button 
                                  onClick={() => handleClearNotification(n.id)}
                                  className="text-rose-500 hover:underline cursor-pointer text-[10px]"
                                >
                                  Limpiar
                                </button>
                              </div>
                            </div>
                            <p className="text-slate-600 leading-relaxed mt-0.5">{n.message}</p>
                            <span className="text-[9px] text-slate-400 mt-1 block">{n.date}</span>
                          </div>
                        ))
                      )}
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>

          {/* Menu Drawer Toggle */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 text-slate-500 hover:text-slate-800 rounded-lg focus:outline-none cursor-pointer"
            id="mobile-menu-toggle"
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* 2. Sidebar Navigation */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={(tab) => {
          setActiveTab(tab);
          setIsNotificationPaneOpen(false);
        }} 
        currentUser={currentUser} 
        onLogout={onLogout}
        notifications={notifications}
        isMobileOpen={isMobileMenuOpen}
        setIsMobileOpen={setIsMobileMenuOpen}
        customLogo={customLogo}
        onLogoChange={handleLogoChange}
      />

      {/* 3. Main Content Stage */}
      <div className="flex-1 flex flex-col min-w-0" id="main-content-stage">
        
        {/* Desktop Top Header Info Bar */}
        <header 
          className="hidden lg:flex bg-white h-16 px-8 border-b border-slate-100 items-center justify-between sticky top-0 z-30 shadow-xs"
          id="app-header"
        >
          {/* Cloud Sync Status Indicator */}
          <div className="flex items-center gap-2 text-slate-500 text-xs font-semibold">
            <Cloud className={`h-4.5 w-4.5 ${cloudSyncStatus === 'syncing' ? 'text-blue-500 animate-pulse' : 'text-emerald-500'}`} />
            <span>
              {cloudSyncStatus === 'syncing' 
                ? 'Sincronizando con base de datos...' 
                : 'Conectado a la nube • Almacenamiento Seguro'}
            </span>
          </div>

          {/* User badge and Notifications Panel */}
          <div className="flex items-center gap-4">

            {/* Real Notification Dropdown trigger */}
            <div className="relative">
              <button 
                onClick={() => setIsNotificationPaneOpen(!isNotificationPaneOpen)}
                className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-50 rounded-xl relative cursor-pointer transition-colors"
                title="Bandeja de Alertas"
              >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full animate-pulse" />
                )}
              </button>

              {/* Notification Float Dialog Panel */}
              <AnimatePresence>
                {isNotificationPaneOpen && (
                  <>
                    <div 
                      className="fixed inset-0 z-35" 
                      onClick={() => setIsNotificationPaneOpen(false)} 
                    />
                    <motion.div 
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 mt-2 w-80 bg-white border border-slate-150 rounded-2xl shadow-2xl z-40 overflow-hidden p-4 space-y-3"
                      id="notifications-pane"
                    >
                      <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                        <span className="text-xs font-bold text-slate-800">Alertas y Notificaciones ({unreadCount})</span>
                        {unreadCount > 0 && (
                          <button 
                            onClick={handleMarkAllAsRead}
                            className="text-[10px] text-blue-600 hover:underline font-bold cursor-pointer"
                          >
                            Leídas todas
                          </button>
                        )}
                      </div>

                      <div className="max-h-60 overflow-y-auto divide-y divide-slate-50 space-y-2">
                        {notifications.length === 0 ? (
                          <p className="text-[10px] text-slate-400 text-center py-4">No hay alertas activas en obra.</p>
                        ) : (
                          notifications.map((n) => (
                            <div 
                              key={n.id} 
                              className={`text-[11px] p-2 rounded-xl transition-colors ${
                                !n.read ? 'bg-blue-50/50' : 'bg-white'
                              } relative group`}
                            >
                              <div className="flex items-center justify-between">
                                <span className={`font-bold ${
                                  n.severity === 'high' ? 'text-rose-600' : 'text-slate-800'
                                }`}>
                                  {n.title}
                                </span>
                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                  {!n.read && (
                                    <button 
                                      onClick={() => handleMarkAsRead(n.id)}
                                      className="text-blue-600 font-bold hover:underline cursor-pointer"
                                      title="Marcar leído"
                                    >
                                      Leído
                                    </button>
                                  )}
                                  <button 
                                    onClick={() => handleClearNotification(n.id)}
                                    className="text-rose-600 hover:underline cursor-pointer"
                                    title="Eliminar"
                                  >
                                    Limpiar
                                  </button>
                                </div>
                              </div>
                              <p className="text-slate-650 leading-relaxed mt-0.5">{n.message}</p>
                              <span className="text-[9px] text-slate-400 mt-1 block">{n.date}</span>
                            </div>
                          ))
                        )}
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

            {/* User Profile display info */}
            <div className="flex items-center gap-2.5 border-l border-slate-150 pl-4">
              <div className="w-8.5 h-8.5 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 border border-slate-200">
                <UserIcon className="h-4.5 w-4.5" />
              </div>
              <div className="text-left">
                <p className="text-xs font-bold text-slate-800 leading-tight">{currentUser.name}</p>
                <p className="text-[9px] text-slate-400 font-medium leading-none mt-0.5">
                  {currentUser.role === 'admin' ? 'Coordinador de Proyectos' : 'Colaborador Técnico'}
                </p>
              </div>
              
              <button 
                onClick={onLogout}
                className="p-1.5 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-lg cursor-pointer transition-colors ml-1.5"
                title="Cerrar Sesión"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>

          </div>
        </header>

        {/* 4. Active Tab Stage Panel Router */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto" id="main-content-pane">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.2 }}
              className="max-w-7xl mx-auto"
            >
              
              {activeTab === 'dashboard' && (
                <DashboardView 
                  projects={projects}
                  expenses={expenses}
                  categories={categories}
                  currentUser={currentUser}
                  notifications={notifications}
                  setNotifications={setNotifications}
                  setActiveTab={setActiveTab}
                  onAddExpenseClick={() => setActiveTab('expenses')}
                  onAddProjectClick={() => setActiveTab('projects')}
                />
              )}

              {activeTab === 'projects' && (
                <ProjectManager 
                  projects={projects}
                  setProjects={setProjects}
                  expenses={expenses}
                  currentUser={currentUser}
                  onProjectSelect={(pId) => {
                    setActiveTab('expenses');
                  }}
                />
              )}

              {activeTab === 'expenses' && (
                <ExpenseManager 
                  expenses={expenses}
                  setExpenses={setExpenses}
                  projects={projects}
                  categories={categories}
                  currentUser={currentUser}
                />
              )}

              {activeTab === 'categories' && (
                <CategoryManager 
                  categories={categories}
                  setCategories={setCategories}
                  expenses={expenses}
                  currentUser={currentUser}
                />
              )}

              {activeTab === 'reports' && (
                <ReportsView 
                  projects={projects}
                  expenses={expenses}
                  categories={categories}
                  currentUser={currentUser}
                />
              )}

              {activeTab === 'sync' && (
                <CloudSyncSimulator 
                  projects={projects}
                  expenses={expenses}
                  categories={categories}
                  notifications={notifications}
                  cloudSyncStatus={cloudSyncStatus}
                  setCloudSyncStatus={setCloudSyncStatus}
                />
              )}

              {activeTab === 'users' && (
                <HostDatabaseView />
              )}

            </motion.div>
          </AnimatePresence>
        </main>

      </div>
    </div>
  );
}
