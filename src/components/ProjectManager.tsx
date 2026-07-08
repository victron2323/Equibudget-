/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { Project, Expense, User, ProjectStatus } from '../types';
import { 
  Briefcase, 
  Calendar, 
  Plus, 
  Edit3, 
  Trash2, 
  Check, 
  X, 
  AlertTriangle, 
  Search, 
  Lock, 
  TrendingUp, 
  TrendingDown, 
  Info,
  Building
} from 'lucide-react';

interface ProjectManagerProps {
  projects: Project[];
  setProjects: React.Dispatch<React.SetStateAction<Project[]>>;
  expenses: Expense[];
  currentUser: User;
  onProjectSelect?: (projectId: string) => void;
}

export default function ProjectManager({
  projects,
  setProjects,
  expenses,
  currentUser,
  onProjectSelect
}: ProjectManagerProps) {
  const isAdmin = currentUser.role === 'admin';

  // Search & Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | ProjectStatus>('all');

  // Form State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    client: '',
    startDate: '',
    endDate: '',
    budget: '',
    status: 'Activo' as ProjectStatus,
    description: ''
  });
  const [formError, setFormError] = useState('');

  // Delete Confirm State
  const [showDeleteConfirmId, setShowDeleteConfirmId] = useState<string | null>(null);

  // Currency Formatter
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(val).replace('CLP', '$');
  };

  // Computations
  const projectStats = useMemo(() => {
    return projects.map(p => {
      const projectExpenses = expenses.filter(e => e.projectId === p.id);
      const spent = projectExpenses.reduce((sum, e) => sum + e.value, 0);
      const remaining = p.budget - spent;
      const percentUsed = p.budget > 0 ? (spent / p.budget) * 100 : 0;
      return {
        ...p,
        spent,
        remaining,
        percentUsed,
        expensesCount: projectExpenses.length
      };
    });
  }, [projects, expenses]);

  // Filtered list
  const filteredProjects = useMemo(() => {
    return projectStats.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            p.client.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [projectStats, searchQuery, statusFilter]);

  // Handlers
  const handleOpenCreate = () => {
    if (!isAdmin) return;
    setEditingProject(null);
    setFormData({
      name: '',
      client: '',
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      budget: '',
      status: 'Activo',
      description: ''
    });
    setFormError('');
    setIsFormOpen(true);
  };

  const handleOpenEdit = (proj: Project) => {
    if (!isAdmin) return;
    setEditingProject(proj);
    setFormData({
      name: proj.name,
      client: proj.client,
      startDate: proj.startDate,
      endDate: proj.endDate,
      budget: proj.budget.toString(),
      status: proj.status,
      description: proj.description || ''
    });
    setFormError('');
    setIsFormOpen(true);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    const budgetVal = parseFloat(formData.budget);
    if (isNaN(budgetVal) || budgetVal <= 0) {
      setFormError('El presupuesto debe ser un número mayor a cero.');
      return;
    }

    if (!formData.name.trim() || !formData.client.trim()) {
      setFormError('Por favor complete el nombre del proyecto y el cliente.');
      return;
    }

    if (new Date(formData.startDate) > new Date(formData.endDate)) {
      setFormError('La fecha de fin debe ser posterior a la fecha de inicio.');
      return;
    }

    if (editingProject) {
      // Edit mode
      setProjects(prev => prev.map(p => p.id === editingProject.id ? {
        ...p,
        name: formData.name.trim(),
        client: formData.client.trim(),
        startDate: formData.startDate,
        endDate: formData.endDate,
        budget: budgetVal,
        status: formData.status,
        description: formData.description.trim()
      } : p));
    } else {
      // Create mode
      const newProj: Project = {
        id: 'prj-' + Date.now(),
        name: formData.name.trim(),
        client: formData.client.trim(),
        startDate: formData.startDate,
        endDate: formData.endDate,
        budget: budgetVal,
        status: formData.status,
        description: formData.description.trim()
      };
      setProjects(prev => [newProj, ...prev]);
    }

    setIsFormOpen(false);
  };

  const handleDeleteProject = (id: string) => {
    if (!isAdmin) return;
    setProjects(prev => prev.filter(p => p.id !== id));
    setShowDeleteConfirmId(null);
  };

  return (
    <div className="space-y-6" id="project-manager-wrapper">
      
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5" id="pm-header-row">
        <div>
          <h2 className="text-xl font-bold font-display text-slate-800">
            Administración de Proyectos de Ingeniería
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Cree y supervise los fondos asignados a viáticos en cada frente de obra.
          </p>
        </div>

        {isAdmin ? (
          <button
            onClick={handleOpenCreate}
            className="self-start px-4.5 py-2.5 bg-brand-green hover:bg-brand-green-hover text-white font-semibold text-xs rounded-xl shadow-xs cursor-pointer flex items-center gap-2 transition-all"
            id="new-project-btn"
          >
            <Plus className="h-4.5 w-4.5" />
            <span>Nuevo Proyecto</span>
          </button>
        ) : (
          <div className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-100 border border-slate-200 text-slate-500 rounded-xl text-xs font-semibold select-none">
            <Lock className="h-3.5 w-3.5 text-slate-400" />
            <span>Solo Lectura (Colaborador)</span>
          </div>
        )}
      </div>

      {/* Controls: Search & Filters */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 bg-white p-4 rounded-2xl border border-slate-100 shadow-xs" id="pm-controls">
        <div className="md:col-span-8 relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 h-4.5 w-4.5" />
          <input
            type="text"
            placeholder="Buscar por nombre de proyecto o cliente..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-green/10 focus:border-brand-green transition-all"
            id="pm-search-input"
          />
        </div>

        <div className="md:col-span-4">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-green/10 focus:border-brand-green transition-all cursor-pointer"
            id="pm-status-select"
          >
            <option value="all">Todos los Estados</option>
            <option value="Activo">Estado: Activo</option>
            <option value="Finalizado">Estado: Finalizado</option>
            <option value="Suspendido">Estado: Suspendido</option>
          </select>
        </div>
      </div>

      {/* Projects Grid List */}
      {filteredProjects.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center" id="pm-empty">
          <div className="p-4 bg-slate-50 text-slate-350 rounded-full max-w-max mx-auto mb-3">
            <Briefcase className="h-10 w-10" />
          </div>
          <h4 className="text-sm font-bold text-slate-700 mb-1">No se encontraron proyectos</h4>
          <p className="text-xs text-slate-400 max-w-xs mx-auto">
            {projects.length === 0 
              ? 'Crea tu primer proyecto de ingeniería presionando el botón "Nuevo Proyecto" de arriba.' 
              : 'Prueba modificando los criterios de búsqueda o filtros.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5" id="projects-grid">
          {filteredProjects.map((p) => {
            const isLowBudget = p.percentUsed >= 80 && p.status === 'Activo';
            const isOverdrawn = p.spent > p.budget;
            
            return (
              <div 
                key={p.id} 
                className="bg-white rounded-2xl border border-slate-100 p-5 shadow-xs flex flex-col justify-between hover:shadow-md transition-all relative group"
                id={`project-card-${p.id}`}
              >
                
                {/* Status and Edit/Delete bar */}
                <div className="flex items-center justify-between mb-3.5">
                  <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                    p.status === 'Activo' 
                      ? 'bg-brand-green/5 text-brand-green border border-brand-green/10' 
                      : p.status === 'Finalizado'
                      ? 'bg-slate-100 text-slate-600 border border-slate-200'
                      : 'bg-rose-50 text-rose-600 border border-rose-100'
                  }`}>
                    {p.status}
                  </span>

                  {/* Actions for Admin only */}
                  {isAdmin && (
                    <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleOpenEdit(p)}
                        className="p-1.5 text-slate-400 hover:text-brand-green hover:bg-brand-green/5 rounded-lg cursor-pointer transition-colors"
                        title="Editar Proyecto"
                        id={`edit-proj-btn-${p.id}`}
                      >
                        <Edit3 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setShowDeleteConfirmId(p.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer transition-colors"
                        title="Eliminar Proyecto"
                        id={`delete-proj-btn-${p.id}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Main Content */}
                <div className="space-y-1.5 mb-5 flex-1">
                  <h3 className="text-sm font-bold font-display text-slate-800 leading-tight">
                    {p.name}
                  </h3>
                  <div className="flex items-center gap-1 text-[11px] text-slate-500 font-medium">
                    <Building className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                    <span>Cliente: <strong className="text-slate-700">{p.client}</strong></span>
                  </div>
                  {p.description && (
                    <p className="text-[11px] text-slate-400 leading-relaxed pt-1 max-w-sm line-clamp-2">
                      {p.description}
                    </p>
                  )}
                </div>

                {/* Calendar Dates bar */}
                <div className="flex items-center gap-4 text-[10px] text-slate-450 font-semibold border-t border-slate-50 pt-3 mb-4">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5 text-slate-400" />
                    <span>Inicio: {p.startDate}</span>
                  </div>
                  <span>•</span>
                  <div>
                    <span>Fin: {p.endDate}</span>
                  </div>
                </div>

                {/* Progress bar and Balance */}
                <div className="space-y-2 pt-1">
                  <div className="flex justify-between items-baseline text-xs">
                    <span className="text-slate-400 font-medium">Presupuesto Utilizado</span>
                    <div className="flex items-center gap-1">
                      <span className="font-bold text-slate-800">{formatCurrency(p.spent)}</span>
                      <span className="text-slate-400">/ {formatCurrency(p.budget)}</span>
                    </div>
                  </div>

                  {/* Progressive indicator bar */}
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${
                        p.percentUsed > 100 
                          ? 'bg-rose-600' 
                          : p.percentUsed >= 80 
                          ? 'bg-amber-500' 
                          : 'bg-brand-blue'
                      }`}
                      style={{ width: `${Math.min(100, p.percentUsed)}%` }}
                    />
                  </div>

                  {/* Remaining or Low Balance alert */}
                  <div className="flex justify-between items-center text-[10px] font-bold mt-1.5">
                    <div className="text-slate-450">
                      Consumido: <span className="text-slate-700">{p.percentUsed.toFixed(1)}%</span>
                    </div>

                    <div className={`flex items-center gap-1 ${p.remaining < 0 ? 'text-rose-600' : 'text-brand-green'}`}>
                      {p.remaining < 0 ? (
                        <>
                          <TrendingDown className="h-3 w-3" />
                          <span>Excedido: {formatCurrency(Math.abs(p.remaining))}</span>
                        </>
                      ) : (
                        <>
                          <TrendingUp className="h-3 w-3" />
                          <span>Disponible: {formatCurrency(p.remaining)}</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Warning Alerts */}
                  {isLowBudget && (
                    <div className="mt-3 p-2 bg-amber-50 border border-amber-100 rounded-xl text-[10px] text-amber-800 font-semibold flex items-center gap-1.5">
                      <AlertTriangle className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                      <span>Alerta de viáticos: Queda menos del 20% disponible.</span>
                    </div>
                  )}
                  {isOverdrawn && (
                    <div className="mt-3 p-2 bg-rose-50 border border-rose-100 rounded-xl text-[10px] text-rose-800 font-semibold flex items-center gap-1.5">
                      <AlertTriangle className="h-3.5 w-3.5 text-rose-500 shrink-0" />
                      <span>Sobregiro: Los gastos han superado el fondo asignado.</span>
                    </div>
                  )}
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* Form Drawer Modal (Slide up / Fade in) */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in" id="project-form-overlay">
          <div className="bg-white rounded-3xl border border-slate-100 max-w-md w-full p-6 shadow-2xl relative" id="project-form-modal">
            
            <button 
              onClick={() => setIsFormOpen(false)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-50 cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            <h3 className="text-base font-extrabold font-display text-slate-800 mb-4 flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-brand-green" />
              <span>{editingProject ? 'Editar Proyecto' : 'Crear Nuevo Proyecto'}</span>
            </h3>

            <form onSubmit={handleFormSubmit} className="space-y-4" id="pm-editor-form">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Nombre del Proyecto</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Línea de Transmisión Sur..."
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-green/10 focus:border-brand-green transition-all"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Cliente</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Iberdrola, ISA..."
                  value={formData.client}
                  onChange={(e) => setFormData({ ...formData, client: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-green/10 focus:border-brand-green transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Fecha Inicio</label>
                  <input
                    type="date"
                    required
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-green/10 focus:border-brand-green transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Fecha Fin</label>
                  <input
                    type="date"
                    required
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-green/10 focus:border-brand-green transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Presupuesto ($)</label>
                  <input
                    type="number"
                    step="any"
                    required
                    placeholder="Ej. 15000"
                    value={formData.budget}
                    onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-green/10 focus:border-brand-green transition-all font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Estado</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as ProjectStatus })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-green/10 focus:border-brand-green transition-all"
                  >
                    <option value="Activo">Activo</option>
                    <option value="Finalizado">Finalizado</option>
                    <option value="Suspendido">Suspendido</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Descripción / Notas (Opcional)</label>
                <textarea
                  rows={2}
                  placeholder="Detalles de la obra, alcance de los viáticos..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-green/10 focus:border-brand-green transition-all"
                />
              </div>

              {formError && (
                <div className="p-3 bg-rose-50 border border-rose-100 text-rose-700 text-xs rounded-lg flex items-center gap-1.5">
                  <AlertTriangle className="h-4 w-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="flex-1 py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-semibold cursor-pointer transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 px-3 bg-brand-green hover:bg-brand-green-hover text-white rounded-xl text-xs font-semibold cursor-pointer transition-colors shadow-xs"
                >
                  {editingProject ? 'Guardar Cambios' : 'Crear Proyecto'}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* Delete Confirmation Alert */}
      {showDeleteConfirmId && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in" id="project-delete-overlay">
          <div className="bg-white rounded-3xl border border-slate-100 max-w-sm w-full p-6 shadow-2xl" id="project-delete-modal">
            <div className="flex items-center gap-3 text-rose-600 mb-3">
              <div className="p-2 bg-rose-50 rounded-lg">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <h3 className="text-sm font-bold font-display">¿Eliminar Proyecto?</h3>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed mb-5">
              Al eliminar este proyecto, se perderán todos los datos y los gastos asociados en el historial dejarán de pertenecer a un proyecto válido. Esta acción es irreversible.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowDeleteConfirmId(null)}
                className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-xs font-semibold cursor-pointer transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleDeleteProject(showDeleteConfirmId)}
                className="flex-1 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold cursor-pointer transition-colors"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
