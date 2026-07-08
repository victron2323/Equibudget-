/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo, useState } from 'react';
import { Project, Expense, Category, Notification, User } from '../types';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Scale, 
  Briefcase, 
  Calendar, 
  Bell, 
  Check, 
  CheckCheck,
  AlertTriangle, 
  ArrowRight,
  Plus,
  Zap,
  Info
} from 'lucide-react';

interface DashboardViewProps {
  projects: Project[];
  expenses: Expense[];
  categories: Category[];
  notifications: Notification[];
  setNotifications: React.Dispatch<React.SetStateAction<Notification[]>>;
  setActiveTab: (tab: any) => void;
  currentUser: User;
  onAddExpenseClick: () => void;
  onAddProjectClick: () => void;
}

export default function DashboardView({
  projects,
  expenses,
  categories,
  notifications,
  setNotifications,
  setActiveTab,
  currentUser,
  onAddExpenseClick,
  onAddProjectClick
}: DashboardViewProps) {
  // Format Currency
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(val).replace('CLP', '$');
  };

  // Computations across ALL projects
  const totals = useMemo(() => {
    // We only sum budgets for non-suspended/non-finished projects, or sum all of them? Sum all projects that are active or finalized.
    // Let's sum budgets for all projects in our list to show total allocated capital
    const activeProjects = projects.filter(p => p.status === 'Activo');
    const totalBudget = projects.reduce((sum, p) => sum + p.budget, 0);
    const totalSpent = expenses.reduce((sum, e) => sum + e.value, 0);
    const availableBalance = totalBudget - totalSpent;
    const percentUsed = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

    return {
      totalBudget,
      totalSpent,
      availableBalance,
      percentUsed,
      activeCount: activeProjects.length
    };
  }, [projects, expenses]);

  // Expenses grouped by category for SVG chart
  const expensesByCategory = useMemo(() => {
    const map: Record<string, number> = {};
    categories.forEach(c => {
      map[c.name] = 0;
    });

    expenses.forEach(e => {
      if (map[e.category] !== undefined) {
        map[e.category] += e.value;
      } else {
        map['Otros'] = (map['Otros'] || 0) + e.value;
      }
    });

    const brandChartColors = [
      '#12b886', // brand green
      '#0f4c9a', // brand deep blue
      '#3b82f6', // brand light blue
      '#1098ad', // teal/cyan
      '#4c6ef5', // soft indigo
      '#15aabf'  // turquoise
    ];

    return Object.entries(map)
      .filter(([_, total]) => total > 0)
      .sort((a, b) => b[1] - a[1])
      .map(([name, total], index) => {
        return {
          name,
          total,
          color: brandChartColors[index % brandChartColors.length]
        };
      });
  }, [expenses, categories]);

  // Expenses grouped by project for SVG bar chart
  const expensesByProject = useMemo(() => {
    return projects.map(p => {
      const spent = expenses
        .filter(e => e.projectId === p.id)
        .reduce((sum, e) => sum + e.value, 0);
      const percent = p.budget > 0 ? (spent / p.budget) * 100 : 0;
      return {
        id: p.id,
        name: p.name,
        shortName: p.name.length > 25 ? p.name.substring(0, 25) + '...' : p.name,
        budget: p.budget,
        spent,
        percent,
        status: p.status
      };
    }).sort((a, b) => b.spent - a.spent);
  }, [projects, expenses]);

  // Handle marking notification as read
  const handleMarkAsRead = (notifId: string) => {
    setNotifications(prev => prev.map(n => n.id === notifId ? { ...n, read: true } : n));
  };

  const handleMarkAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const recentExpenses = useMemo(() => {
    return [...expenses]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 4);
  }, [expenses]);

  return (
    <div className="space-y-6" id="dashboard-view-wrapper">
      
      {/* Top Banner Greeting */}
      <div className="bg-white rounded-2xl p-6 text-slate-800 border border-slate-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden" id="dashboard-banner">
        <div className="absolute top-0 right-0 w-80 h-full bg-gradient-to-l from-brand-green/5 to-transparent pointer-events-none rounded-r-2xl" />
        <div className="space-y-2 z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-brand-green/10 border border-brand-green/20 rounded-xl text-brand-green text-[11px] font-bold">
            <Zap className="h-3.5 w-3.5 text-brand-green" />
            <span>Panel de Coordinación</span>
          </div>
          <h2 className="text-2xl font-extrabold font-display tracking-tight text-slate-950">
            ¡Hola, {currentUser.name}!
          </h2>
          <p className="text-xs text-slate-500 max-w-xl leading-relaxed">
            Bienvenido a <strong className="text-slate-800">EquiBudget</strong>. Actualmente estás administrando <strong className="text-slate-800">{totals.activeCount} proyectos activos</strong>. Accedé en tiempo real a los viáticos y gastos de campo registrados en el sistema.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0 z-10" id="banner-quick-actions">
          {currentUser.role === 'admin' && (
            <button
              onClick={onAddProjectClick}
              className="px-4 py-2.5 bg-white hover:bg-slate-50 text-brand-blue border border-brand-blue/30 font-semibold text-xs rounded-xl transition-all cursor-pointer shadow-xs flex items-center gap-1.5"
            >
              <Plus className="h-4 w-4 text-brand-blue" />
              <span>Nuevo Proyecto</span>
            </button>
          )}
          <button
            onClick={onAddExpenseClick}
            className="px-4 py-2.5 bg-brand-green hover:bg-brand-green-hover text-white font-semibold text-xs rounded-xl transition-all cursor-pointer shadow-sm flex items-center gap-1.5 hover:scale-[1.01] active:scale-[0.99]"
          >
            <Plus className="h-4 w-4" />
            <span>Registrar Gasto</span>
          </button>
        </div>
      </div>

      {/* 4 Cards Summary row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" id="dashboard-kpi-grid">
        {/* Total Budget Card */}
        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-xs flex flex-col justify-between hover:border-brand-green/20 transition-colors" id="kpi-card-budget">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Fondo Total Asignado</span>
            <div className="p-2 bg-brand-green/10 text-brand-green rounded-xl">
              <Briefcase className="h-4.5 w-4.5" />
            </div>
          </div>
          <div className="mt-3.5">
            <h3 className="text-2xl font-bold font-display text-slate-900">{formatCurrency(totals.totalBudget)}</h3>
            <p className="text-[10px] text-slate-500 mt-1">Capital consolidado de {projects.length} proyectos</p>
          </div>
        </div>

        {/* Total Spent Card */}
        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-xs flex flex-col justify-between hover:border-brand-green/20 transition-colors" id="kpi-card-spent">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Gastado</span>
            <div className="p-2 bg-rose-50 text-rose-600 rounded-xl">
              <TrendingDown className="h-4.5 w-4.5" />
            </div>
          </div>
          <div className="mt-3.5">
            <h3 className="text-2xl font-bold font-display text-rose-600">{formatCurrency(totals.totalSpent)}</h3>
            <div className="flex items-center gap-1 text-[10px] text-slate-500 mt-1">
              <span className="font-semibold text-rose-600">({totals.percentUsed.toFixed(1)}%)</span>
              <span>utilizado de los viáticos</span>
            </div>
          </div>
        </div>

        {/* Available Balance Card */}
        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-xs flex flex-col justify-between hover:border-brand-green/20 transition-colors" id="kpi-card-balance">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Saldo Disponible</span>
            <div className={`p-2 rounded-xl ${totals.availableBalance < 0 ? 'bg-rose-50 text-rose-600' : 'bg-brand-green/10 text-brand-green'}`}>
              <TrendingUp className="h-4.5 w-4.5" />
            </div>
          </div>
          <div className="mt-3.5">
            <h3 className={`text-2xl font-bold font-display ${totals.availableBalance < 0 ? 'text-rose-600' : 'text-brand-green'}`}>
              {formatCurrency(totals.availableBalance)}
            </h3>
            <p className="text-[10px] text-slate-500 mt-1">Suma libre de viáticos en tránsito</p>
          </div>
        </div>

        {/* Budget Health Card */}
        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-xs flex flex-col justify-between hover:border-brand-green/20 transition-colors" id="kpi-card-health">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Eficiencia de Gasto</span>
            <div className="p-2 bg-brand-green/10 text-brand-green rounded-xl">
              <Scale className="h-4.5 w-4.5" />
            </div>
          </div>
          <div className="mt-3.5">
            <div className="flex items-baseline gap-1">
              <h3 className="text-2xl font-bold font-display text-slate-850">{(100 - totals.percentUsed).toFixed(0)}%</h3>
              <span className="text-xs text-slate-400 font-semibold">libre</span>
            </div>
            
            {/* Health mini bar */}
            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mt-2">
              <div 
                className={`h-full rounded-full transition-all duration-500 ${
                  totals.percentUsed > 80 ? 'bg-rose-500' : totals.percentUsed > 50 ? 'bg-amber-500' : 'bg-brand-green'
                }`}
                style={{ width: `${Math.min(100, totals.percentUsed)}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Left is charts, Right is Notifications & Recent */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="dashboard-main-content">
        
        {/* Left Bento: Interactive SVG Charts */}
        <div className="lg:col-span-8 space-y-6" id="charts-bento-column">
          
          {/* Chart 1: Gastos por Proyecto (Bar Chart) */}
          <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-xs" id="box-chart-projects">
            <div className="flex items-center justify-between mb-4 border-b border-slate-150 pb-3">
              <div>
                <h3 className="text-sm font-bold font-display text-slate-800">
                  Consumo de Viáticos por Proyecto de Ingeniería
                </h3>
                <p className="text-[10px] text-slate-400 mt-0.5">Fondo asignado (gris) vs. Gasto registrado (azul)</p>
              </div>
              <button onClick={() => setActiveTab('projects')} className="text-xs text-brand-green hover:text-brand-green-hover font-bold hover:underline inline-flex items-center gap-0.5 cursor-pointer">
                <span>Ver todos</span>
                <ArrowRight className="h-3 w-3" />
              </button>
            </div>

            {projects.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-400">
                Registra proyectos para visualizar el balance de viáticos.
              </div>
            ) : (
              <div className="space-y-4" id="project-bar-charts">
                {expensesByProject.map(p => {
                  const budgetVal = p.budget;
                  const spentVal = p.spent;
                  const remaining = budgetVal - spentVal;
                  
                  return (
                    <div key={p.id} className="group/item relative" id={`chart-row-project-${p.id}`}>
                      {/* Name of project */}
                      <div className="flex items-center justify-between text-xs mb-1.5">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className={`w-2 h-2 rounded-full shrink-0 ${
                            p.status === 'Activo' ? 'bg-brand-green' : p.status === 'Finalizado' ? 'bg-slate-400' : 'bg-rose-500'
                          }`} />
                          <span className="font-bold text-slate-700 truncate">{p.name}</span>
                          <span className="text-[10px] text-slate-400 italic">({p.status})</span>
                        </div>
                        <div className="text-right flex items-center gap-2 text-slate-500">
                          <span className="font-bold text-slate-800">{formatCurrency(spentVal)}</span>
                          <span>/ {formatCurrency(budgetVal)}</span>
                        </div>
                      </div>

                      {/* Bar indicator */}
                      <div className="relative w-full h-4 bg-slate-100/85 rounded-lg overflow-hidden border border-slate-100">
                        {/* Progress Bar */}
                        <div 
                          className={`h-full rounded-l-lg transition-all duration-500 ${
                            p.percent > 90 ? 'bg-rose-500' : p.percent > 70 ? 'bg-amber-500' : 'bg-brand-green'
                          }`}
                          style={{ width: `${Math.min(100, p.percent)}%` }}
                        />
                        {/* Numerical indicator inside the bar if wide enough */}
                        {p.percent > 15 && (
                          <div className="absolute inset-0 flex items-center pl-2 text-[8px] font-extrabold text-white pointer-events-none drop-shadow-xs">
                            {p.percent.toFixed(0)}% Utilizado
                          </div>
                        )}
                      </div>

                      {/* Tooltip detail on hover */}
                      <div className="opacity-0 group-hover/item:opacity-100 absolute top-[-30px] right-2 bg-slate-900 text-white text-[10px] py-1 px-2.5 rounded-lg font-medium shadow-md transition-opacity pointer-events-none z-10 flex items-center gap-1.5">
                        <span>Restante:</span>
                        <span className={`font-bold ${remaining < 0 ? 'text-rose-400' : 'text-brand-green'}`}>
                          {formatCurrency(remaining)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Chart 2: Gastos por Categoría (Bento Side-by-Side SVG) */}
          <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-xs" id="box-chart-categories">
            <h3 className="text-sm font-bold font-display text-slate-800 mb-4 border-b border-slate-150 pb-3">
              Distribución de Costos por Categoría de Gasto
            </h3>

            {expensesByCategory.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-400">
                Registra gastos para ver el desglose por rubro.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center" id="category-chart-layout">
                {/* Visual Circle (Donut Chart using native beautiful SVG circle dasharrays!) */}
                <div className="md:col-span-5 flex justify-center" id="category-chart-circle">
                  <div className="relative w-44 h-44 flex items-center justify-center">
                    {/* SVG Donut */}
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                      {/* Grey placeholder track */}
                      <circle 
                        cx="50" 
                        cy="50" 
                        r="40" 
                        fill="transparent" 
                        stroke="#f1f5f9" 
                        strokeWidth="12" 
                      />
                      {/* Render custom segment arcs */}
                      {(() => {
                        let currentOffset = 0;
                        const totalExpenseSum = expensesByCategory.reduce((sum, item) => sum + item.total, 0);

                        return expensesByCategory.map((item, idx) => {
                          if (totalExpenseSum <= 0) return null;
                          const percentage = (item.total / totalExpenseSum) * 100;
                          const circumference = 2 * Math.PI * 40; // ~251.2
                          const strokeLength = (percentage / 100) * circumference;
                          const strokeOffset = circumference - strokeLength + currentOffset;
                          
                          // Advance current offset (as a negative shift)
                          currentOffset -= strokeLength;

                          return (
                            <circle 
                              key={item.name}
                              cx="50" 
                              cy="50" 
                              r="40" 
                              fill="transparent" 
                              stroke={item.color} 
                              strokeWidth="12" 
                              strokeDasharray={`${strokeLength} ${circumference - strokeLength}`}
                              strokeDashoffset={strokeOffset}
                              strokeLinecap="round"
                              className="transition-all duration-300 hover:stroke-[14px] cursor-pointer"
                              style={{ transformOrigin: '50px 50px' }}
                            />
                          );
                        });
                      })()}
                    </svg>

                    {/* Central stats text */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Total</span>
                      <span className="text-base font-extrabold text-slate-800 font-display">
                        {formatCurrency(expenses.reduce((sum, e) => sum + e.value, 0))}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Categories Table/Legend */}
                <div className="md:col-span-7 space-y-2.5" id="category-chart-legend">
                  {(() => {
                    const totalExpenseSum = expensesByCategory.reduce((sum, item) => sum + item.total, 0);
                    return expensesByCategory.slice(0, 5).map(item => {
                      const pct = totalExpenseSum > 0 ? (item.total / totalExpenseSum) * 100 : 0;
                      return (
                        <div key={item.name} className="flex items-center justify-between text-xs" id={`legend-${item.name}`}>
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                            <span className="font-semibold text-slate-700 truncate">{item.name}</span>
                          </div>
                          <div className="flex items-center gap-2 text-slate-500 font-medium text-right">
                            <span className="font-bold text-slate-800">{formatCurrency(item.total)}</span>
                            <span className="text-[10px] bg-slate-50 px-1.5 py-0.5 rounded-md border border-slate-100 text-slate-500">
                              {pct.toFixed(0)}%
                            </span>
                          </div>
                        </div>
                      );
                    });
                  })()}
                  {expensesByCategory.length > 5 && (
                    <div className="text-[10px] text-slate-400 text-right font-medium italic pt-1">
                      + {expensesByCategory.length - 5} rubros adicionales de menor cuantía.
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

        </div>

        {/* Right Bento: Notifications Feed & Recent Expenses */}
        <div className="lg:col-span-4 space-y-6" id="alerts-column">
          
          {/* Notifications Panel */}
          <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-xs" id="box-dashboard-notifications">
            <div className="flex items-center justify-between mb-4 border-b border-slate-150 pb-3">
              <div className="flex items-center gap-2">
                <Bell className="h-4.5 w-4.5 text-slate-500" />
                <h3 className="text-sm font-bold font-display text-slate-800">Alertas y Avisos</h3>
              </div>
              {notifications.filter(n => !n.read).length > 0 && (
                <button 
                  onClick={handleMarkAllAsRead}
                  className="text-[10px] text-brand-green hover:text-brand-green-hover font-bold hover:underline cursor-pointer flex items-center gap-0.5"
                >
                  <CheckCheck className="h-3.5 w-3.5" />
                  <span>Leer todas</span>
                </button>
              )}
            </div>

            {notifications.length === 0 ? (
              <div className="py-6 text-center text-xs text-slate-400 flex flex-col items-center gap-1">
                <Check className="h-8 w-8 text-brand-green mb-1" />
                <span>No hay notificaciones activas. Todo al día.</span>
              </div>
            ) : (
              <div className="space-y-3 max-h-[280px] overflow-y-auto pr-1" id="notifications-list">
                {notifications.map((n) => (
                  <div 
                    key={n.id} 
                    className={`p-3 rounded-xl border text-xs transition-colors flex gap-2.5 relative group ${
                      n.read 
                        ? 'bg-slate-50/50 border-slate-100 text-slate-500' 
                        : 'bg-amber-50/40 border-amber-100 text-slate-800'
                    }`}
                    id={`notif-card-${n.id}`}
                  >
                    {/* Visual icons based on notification type */}
                    <div className="shrink-0 pt-0.5">
                      {n.type === 'budget_low' ? (
                        <AlertTriangle className="h-4 w-4 text-rose-500" />
                      ) : n.type === 'project_end' ? (
                        <Calendar className="h-4 w-4 text-amber-500" />
                      ) : (
                        <Info className="h-4 w-4 text-brand-green" />
                      )}
                    </div>

                    {/* Content */}
                    <div className="space-y-1 pr-4">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold leading-tight">{n.title}</span>
                        {!n.read && (
                          <span className="w-1.5 h-1.5 rounded-full bg-brand-green animate-pulse" />
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 leading-normal">{n.message}</p>
                      <p className="text-[9px] text-slate-400">{new Date(n.date).toLocaleDateString('es-ES', {hour: '2-digit', minute: '2-digit'})}</p>
                    </div>

                    {/* Action button to mark as read */}
                    {!n.read && (
                      <button 
                        onClick={() => handleMarkAsRead(n.id)}
                        className="absolute right-2 top-2 p-1 text-slate-400 hover:text-brand-green rounded-lg bg-white/60 hover:bg-white cursor-pointer opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity"
                        title="Marcar como leída"
                      >
                        <Check className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Expenses Feed */}
          <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-xs" id="box-dashboard-recent-expenses">
            <div className="flex items-center justify-between mb-4 border-b border-slate-150 pb-3">
              <h3 className="text-sm font-bold font-display text-slate-800">Gastos Recientes</h3>
              <button 
                onClick={() => setActiveTab('expenses')}
                className="text-[10px] text-brand-green hover:text-brand-green-hover font-bold hover:underline cursor-pointer"
              >
                Ver historial
              </button>
            </div>

            {recentExpenses.length === 0 ? (
              <div className="py-6 text-center text-xs text-slate-400">
                Aún no has registrado ningún gasto de campo.
              </div>
            ) : (
              <div className="space-y-3" id="recent-expenses-feed">
                {recentExpenses.map((exp) => {
                  const proj = projects.find(p => p.id === exp.projectId);
                  
                  return (
                    <div 
                      key={exp.id} 
                      className="p-3 bg-slate-50 hover:bg-brand-green/5 rounded-xl border border-slate-100 text-xs transition-colors flex items-center justify-between gap-3"
                      id={`recent-exp-row-${exp.id}`}
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 mb-1">
                          <span className="font-bold text-slate-800 truncate">{exp.description}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                          <span className="font-semibold bg-brand-green/10 text-brand-green px-1.5 py-0.5 rounded-md truncate max-w-[120px]">
                            {proj ? proj.name : 'Ingeniería'}
                          </span>
                          <span>•</span>
                          <span>{exp.person}</span>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="font-bold font-display text-rose-600 text-xs">
                          {formatCurrency(exp.value)}
                        </span>
                        <p className="text-[9px] text-slate-400">{exp.date}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Quick Notice Tip */}
          <div className="bg-brand-green/5 border border-brand-green/10 rounded-2xl p-4 flex gap-3 text-slate-800" id="info-notice-box">
            <Info className="h-5 w-5 text-brand-green shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="text-xs font-bold uppercase tracking-wide text-slate-900">Seguimiento de Viáticos</h4>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                El sistema <strong className="text-slate-800">EquiBudget</strong> evalúa automáticamente los saldos asignados por proyecto. Las alertas de fondo bajo se disparan automáticamente para prevenir sobregiros en faenas lejanas.
              </p>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
