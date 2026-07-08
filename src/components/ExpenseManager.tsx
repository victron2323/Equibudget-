/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useRef } from 'react';
import { Project, Expense, Category, User, ExpenseAttachment } from '../types';
import { 
  ReceiptText, 
  Plus, 
  Search, 
  Trash2, 
  Edit3, 
  Calendar, 
  Paperclip, 
  X, 
  AlertTriangle,
  Coins,
  ChevronDown,
  Filter,
  FileText,
  UploadCloud,
  FileImage,
  Eye,
  Check,
  User as UserIcon,
  CreditCard,
  Notebook,
  Lock
} from 'lucide-react';

interface ExpenseManagerProps {
  expenses: Expense[];
  setExpenses: React.Dispatch<React.SetStateAction<Expense[]>>;
  projects: Project[];
  categories: Category[];
  currentUser: User;
}

const PAYMENT_METHODS = [
  'Efectivo',
  'Tarjeta de Crédito Corporativa',
  'Tarjeta de Débito',
  'Transferencia Bancaria',
  'Caja Chica'
];

export default function ExpenseManager({
  expenses,
  setExpenses,
  projects,
  categories,
  currentUser
}: ExpenseManagerProps) {
  const isAdmin = currentUser.role === 'admin';

  // State for Lists and Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [projectFilter, setProjectFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [paymentMethodFilter, setPaymentMethodFilter] = useState('all');
  const [personFilter, setPersonFilter] = useState('all');
  const [sortBy, setSortBy] = useState<'date-desc' | 'date-asc' | 'value-desc' | 'value-asc'>('date-desc');

  // Drawer / Form State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [formError, setFormError] = useState('');

  // Form Fields
  const [formProjectId, setFormProjectId] = useState('');
  const [formDate, setFormDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [formPerson, setFormPerson] = useState(currentUser.name);
  const [formCategory, setFormCategory] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formValue, setFormValue] = useState('');
  const [formPaymentMethod, setFormPaymentMethod] = useState('Efectivo');
  const [formInvoiceNumber, setFormInvoiceNumber] = useState('');
  const [formObservations, setFormObservations] = useState('');
  const [formAttachments, setFormAttachments] = useState<ExpenseAttachment[]>([]);

  // Drag and Drop State
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Preview Image Modal
  const [previewAttachment, setPreviewAttachment] = useState<ExpenseAttachment | null>(null);

  // Currency Formatter
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(val).replace('CLP', '$');
  };

  // Get list of unique spenders/people for filters
  const uniquePersons = useMemo(() => {
    return Array.from(new Set(expenses.map(e => e.person)));
  }, [expenses]);

  // Allowed Projects for form submission: only active projects for collaborators, all for admin.
  const activeProjects = useMemo(() => {
    return projects.filter(p => p.status === 'Activo' || isAdmin);
  }, [projects, isAdmin]);

  // Filtered and Sorted Expenses List
  const filteredExpenses = useMemo(() => {
    return expenses
      .filter(exp => {
        const matchesSearch = 
          exp.description.toLowerCase().includes(searchQuery.toLowerCase()) || 
          exp.person.toLowerCase().includes(searchQuery.toLowerCase()) || 
          (exp.invoiceNumber && exp.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()));
        
        const matchesProject = projectFilter === 'all' || exp.projectId === projectFilter;
        const matchesCategory = categoryFilter === 'all' || exp.category === categoryFilter;
        const matchesPayment = paymentMethodFilter === 'all' || exp.paymentMethod === paymentMethodFilter;
        const matchesPerson = personFilter === 'all' || exp.person === personFilter;

        return matchesSearch && matchesProject && matchesCategory && matchesPayment && matchesPerson;
      })
      .sort((a, b) => {
        if (sortBy === 'date-desc') return new Date(b.date).getTime() - new Date(a.date).getTime();
        if (sortBy === 'date-asc') return new Date(a.date).getTime() - new Date(b.date).getTime();
        if (sortBy === 'value-desc') return b.value - a.value;
        if (sortBy === 'value-asc') return a.value - b.value;
        return 0;
      });
  }, [expenses, searchQuery, projectFilter, categoryFilter, paymentMethodFilter, personFilter, sortBy]);

  // Open Form for Adding
  const handleOpenAdd = () => {
    setEditingExpense(null);
    setFormProjectId(activeProjects[0]?.id || '');
    setFormDate(new Date().toISOString().split('T')[0]);
    setFormPerson(currentUser.name);
    setFormCategory(categories[0]?.name || 'Alimentación');
    setFormDescription('');
    setFormValue('');
    setFormPaymentMethod('Efectivo');
    setFormInvoiceNumber('');
    setFormObservations('');
    setFormAttachments([]);
    setFormError('');
    setIsFormOpen(true);
  };

  // Open Form for Editing
  const handleOpenEdit = (exp: Expense) => {
    // Permission check: Collaborator can only edit their own expense
    if (!isAdmin && exp.person !== currentUser.name) {
      alert('No tienes permisos para modificar gastos de otros colaboradores.');
      return;
    }

    setEditingExpense(exp);
    setFormProjectId(exp.projectId);
    setFormDate(exp.date);
    setFormPerson(exp.person);
    setFormCategory(exp.category);
    setFormDescription(exp.description);
    setFormValue(exp.value.toString());
    setFormPaymentMethod(exp.paymentMethod);
    setFormInvoiceNumber(exp.invoiceNumber || '');
    setFormObservations(exp.observations || '');
    setFormAttachments(exp.attachments);
    setFormError('');
    setIsFormOpen(true);
  };

  // Handle Form Submission
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    const valueNum = parseFloat(formValue);
    if (isNaN(valueNum) || valueNum <= 0) {
      setFormError('El valor del gasto debe ser un número mayor a cero.');
      return;
    }

    if (!formProjectId) {
      setFormError('Por favor seleccione el proyecto al que pertenece este gasto.');
      return;
    }

    if (!formDescription.trim()) {
      setFormError('Por favor ingrese un concepto o descripción breve.');
      return;
    }

    const targetProject = projects.find(p => p.id === formProjectId);
    if (targetProject && targetProject.status === 'Finalizado' && !isAdmin) {
      setFormError('No se pueden registrar gastos en proyectos finalizados.');
      return;
    }

    const payload: Expense = {
      id: editingExpense ? editingExpense.id : 'exp-' + Date.now(),
      projectId: formProjectId,
      date: formDate,
      person: formPerson,
      category: formCategory,
      description: formDescription.trim(),
      value: valueNum,
      paymentMethod: formPaymentMethod,
      invoiceNumber: formInvoiceNumber.trim() || undefined,
      attachments: formAttachments,
      observations: formObservations.trim() || undefined
    };

    if (editingExpense) {
      setExpenses(prev => prev.map(item => item.id === editingExpense.id ? payload : item));
    } else {
      setExpenses(prev => [payload, ...prev]);
    }

    setIsFormOpen(false);
  };

  // Delete Expense
  const handleDeleteExpense = (id: string, person: string) => {
    if (!isAdmin && person !== currentUser.name) {
      alert('No tienes permisos para eliminar gastos de otros colaboradores.');
      return;
    }

    if (confirm('¿Está seguro de que desea eliminar este registro de gasto?')) {
      setExpenses(prev => prev.filter(item => item.id !== id));
    }
  };

  // Drag and Drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  // Handle File Input selection
  const processFiles = (files: FileList) => {
    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const fileUrl = reader.result as string;
        const newAttachment: ExpenseAttachment = {
          id: 'att-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
          name: file.name,
          type: file.type.includes('pdf') ? 'pdf' : 'image',
          url: fileUrl
        };
        setFormAttachments(prev => [...prev, newAttachment]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files);
    }
  };

  // Remove uploaded attachment
  const handleRemoveAttachment = (attId: string) => {
    setFormAttachments(prev => prev.filter(att => att.id !== attId));
  };

  return (
    <div className="space-y-6" id="expenses-ledger-wrapper">
      
      {/* Upper header action row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5" id="el-header-row">
        <div>
          <h2 className="text-xl font-bold font-display text-slate-800">
            Libro de Gastos de Proyectos
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Registro y control formal de viáticos, facturas de compras y comprobantes de ingeniería.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="self-start px-4.5 py-2.5 bg-brand-green hover:bg-brand-green-hover text-white font-semibold text-xs rounded-xl shadow-xs cursor-pointer flex items-center gap-2 transition-all"
          id="new-expense-btn"
        >
          <Plus className="h-4.5 w-4.5" />
          <span>Registrar Gasto</span>
        </button>
      </div>

      {/* Grid: Left Column is filter panel, Right is ledger table */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="ledger-grid-layout">
        
        {/* Filters Sidebar panel (Desktop: 3-cols, Mobile: collapses nicely) */}
        <div className="lg:col-span-3 space-y-4" id="ledger-filters-pane">
          <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-xs space-y-4">
            <div className="flex items-center gap-1.5 border-b border-slate-100 pb-2.5">
              <Filter className="h-4 w-4 text-slate-500" />
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Filtros de Búsqueda</h3>
            </div>

            {/* Keyword Search */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase">Concepto / N° Factura</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-3.5 w-3.5" />
                <input
                  type="text"
                  placeholder="Buscar..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8.5 pr-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-brand-green transition-colors"
                />
              </div>
            </div>

            {/* Project Filter */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase">Proyecto de Ingeniería</label>
              <select
                value={projectFilter}
                onChange={(e) => setProjectFilter(e.target.value)}
                className="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-brand-green cursor-pointer"
              >
                <option value="all">Todos los Proyectos</option>
                {projects.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>

            {/* Category Filter */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase">Rubro / Categoría</label>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-brand-green cursor-pointer"
              >
                <option value="all">Todas las Categorías</option>
                {categories.map(c => (
                  <option key={c.id} value={c.name}>{c.name}</option>
                ))}
              </select>
            </div>

            {/* Spender Filter */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase">Persona Responsable</label>
              <select
                value={personFilter}
                onChange={(e) => setPersonFilter(e.target.value)}
                className="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-brand-green cursor-pointer"
              >
                <option value="all">Cualquier Persona</option>
                {uniquePersons.map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>

            {/* Payment Filter */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase">Método de Pago</label>
              <select
                value={paymentMethodFilter}
                onChange={(e) => setPaymentMethodFilter(e.target.value)}
                className="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-brand-green cursor-pointer"
              >
                <option value="all">Cualquier Método</option>
                {PAYMENT_METHODS.map(m => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>

            {/* Sort Order */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase">Ordenación</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-brand-green cursor-pointer"
              >
                <option value="date-desc">Fecha: Más reciente</option>
                <option value="date-asc">Fecha: Más antiguo</option>
                <option value="value-desc">Valor: Mayor a menor</option>
                <option value="value-asc">Valor: Menor a mayor</option>
              </select>
            </div>

            {/* Reset Filters Quick Button */}
            <button
              onClick={() => {
                setSearchQuery('');
                setProjectFilter('all');
                setCategoryFilter('all');
                setPersonFilter('all');
                setPaymentMethodFilter('all');
                setSortBy('date-desc');
              }}
              className="w-full py-2 bg-slate-100 hover:bg-slate-150 text-slate-600 rounded-xl text-[10px] font-bold uppercase transition-colors cursor-pointer"
            >
              Restaurar Filtros
            </button>
          </div>
        </div>

        {/* Ledger Table Section */}
        <div className="lg:col-span-9 bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden" id="ledger-content">
          
          <div className="p-4 border-b border-slate-100 flex items-center justify-between" id="ledger-content-header">
            <span className="text-xs font-bold text-slate-500">
              Mostrando {filteredExpenses.length} de {expenses.length} gastos
            </span>
          </div>

          {filteredExpenses.length === 0 ? (
            <div className="p-12 text-center" id="ledger-empty">
              <div className="p-4 bg-slate-50 text-slate-300 rounded-full max-w-max mx-auto mb-3">
                <Coins className="h-10 w-10" />
              </div>
              <h4 className="text-sm font-bold text-slate-700 mb-1">No se encontraron gastos</h4>
              <p className="text-xs text-slate-400">
                Ajusta las opciones de filtrado del menú lateral o registra un nuevo gasto.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto" id="ledger-table-container">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/75 border-b border-slate-100 text-[10px] font-extrabold text-slate-450 uppercase tracking-widest">
                    <th className="p-4">Detalle / Proyecto</th>
                    <th className="p-4">Rubro</th>
                    <th className="p-4">Fecha & Persona</th>
                    <th className="p-4">Método / Factura</th>
                    <th className="p-4 text-right">Comprobante</th>
                    <th className="p-4 text-right">Valor</th>
                    <th className="p-4 text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                  {filteredExpenses.map((exp) => {
                    const matchedProj = projects.find(p => p.id === exp.projectId);
                    const matchedCat = categories.find(c => c.name === exp.category);
                    
                    const isOwnExpense = exp.person === currentUser.name;
                    const canEdit = isAdmin || isOwnExpense;

                    return (
                      <tr key={exp.id} className="hover:bg-slate-50/50 transition-colors group" id={`expense-table-row-${exp.id}`}>
                        {/* Concept & Project */}
                        <td className="p-4 max-w-xs">
                          <div>
                            <span className="font-bold text-slate-800 block truncate">{exp.description}</span>
                            <span className="text-[10px] text-slate-400 truncate max-w-[180px] block mt-0.5">
                              {matchedProj ? matchedProj.name : 'Proyecto Desconocido'}
                            </span>
                          </div>
                        </td>

                        {/* Category */}
                        <td className="p-4">
                          <span 
                            className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold text-white shadow-xs"
                            style={{ backgroundColor: matchedCat?.color || '#94a3b8' }}
                          >
                            {exp.category}
                          </span>
                        </td>

                        {/* Spender & Date */}
                        <td className="p-4">
                          <div className="space-y-0.5">
                            <span className="font-semibold text-slate-700 block">{exp.person}</span>
                            <span className="text-[10px] text-slate-400 block">{exp.date}</span>
                          </div>
                        </td>

                        {/* Payment / Factura */}
                        <td className="p-4">
                          <div className="space-y-0.5">
                            <span className="text-[11px] text-slate-500 font-medium block">{exp.paymentMethod}</span>
                            {exp.invoiceNumber ? (
                              <span className="font-mono text-[9px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded border border-slate-200">
                                {exp.invoiceNumber}
                              </span>
                            ) : (
                              <span className="text-[9px] text-slate-400 block italic">Sin factura</span>
                            )}
                          </div>
                        </td>

                        {/* Attachments */}
                        <td className="p-4 text-right">
                          {exp.attachments && exp.attachments.length > 0 ? (
                            <div className="flex justify-end gap-1">
                              {exp.attachments.map((att) => (
                                <button
                                  key={att.id}
                                  onClick={() => setPreviewAttachment(att)}
                                  className="p-1 bg-brand-green/10 hover:bg-brand-green/20 border border-brand-green/20 text-brand-green rounded-lg transition-colors cursor-pointer"
                                  title={`Ver comprobante: ${att.name}`}
                                >
                                  {att.type === 'pdf' ? (
                                    <FileText className="h-3.5 w-3.5" />
                                  ) : (
                                    <FileImage className="h-3.5 w-3.5" />
                                  )}
                                </button>
                              ))}
                            </div>
                          ) : (
                            <span className="text-[9px] text-rose-500 bg-rose-50 border border-rose-100 px-1.5 py-0.5 rounded-full font-bold">
                              Falta Factura
                            </span>
                          )}
                        </td>

                        {/* Value */}
                        <td className="p-4 text-right font-bold text-slate-800">
                          {formatCurrency(exp.value)}
                        </td>

                        {/* Actions */}
                        <td className="p-4">
                          <div className="flex items-center justify-center gap-1">
                            {canEdit ? (
                              <>
                                <button
                                  onClick={() => handleOpenEdit(exp)}
                                  className="p-1 text-slate-400 hover:text-brand-green hover:bg-brand-green/10 rounded cursor-pointer transition-colors"
                                  title="Editar gasto"
                                >
                                  <Edit3 className="h-3.5 w-3.5" />
                                </button>
                                <button
                                  onClick={() => handleDeleteExpense(exp.id, exp.person)}
                                  className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded cursor-pointer transition-colors"
                                  title="Eliminar gasto"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </>
                            ) : (
                              <Lock className="h-3.5 w-3.5 text-slate-300" title="Solo lectura" />
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

        </div>

      </div>

      {/* Slide-in Drawer Modal for adding/editing expense */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-end z-50 animate-fade-in" id="expense-form-drawer">
          <div className="bg-white h-full max-w-lg w-full p-6 shadow-2xl flex flex-col justify-between overflow-y-auto animate-slide-left relative border-l border-slate-100" id="expense-form-panel">
            
            <div>
              <button 
                onClick={() => setIsFormOpen(false)}
                className="absolute top-4 left-4 p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-50 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="pl-8 pb-5 border-b border-slate-100 mb-5">
                <h3 className="text-base font-extrabold font-display text-slate-800 flex items-center gap-2">
                  <ReceiptText className="h-5 w-5 text-brand-green" />
                  <span>{editingExpense ? 'Editar Registro de Gasto' : 'Registrar Nuevo Gasto'}</span>
                </h3>
                <p className="text-[10px] text-slate-400 mt-1">Registrado por: <strong>{formPerson}</strong></p>
              </div>

              <form onSubmit={handleFormSubmit} className="space-y-4" id="ledger-editor-form">
                
                {/* Project selector */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Proyecto de Ingeniería</label>
                  <select
                    required
                    value={formProjectId}
                    onChange={(e) => setFormProjectId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-green/10 focus:border-brand-green transition-all cursor-pointer"
                  >
                    <option value="" disabled>Seleccione un proyecto...</option>
                    {activeProjects.map(p => (
                      <option key={p.id} value={p.id}>{p.name} ({p.client})</option>
                    ))}
                  </select>
                  {!isAdmin && (
                    <span className="text-[9px] text-slate-400 block mt-1">Solo se listan proyectos activos.</span>
                  )}
                </div>

                {/* Grid inputs */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Monto del Gasto ($)</label>
                    <input
                      type="number"
                      step="any"
                      required
                      placeholder="Ej. 1200"
                      value={formValue}
                      onChange={(e) => setFormValue(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-green/10 focus:border-brand-green transition-all font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Fecha</label>
                    <input
                      type="date"
                      required
                      value={formDate}
                      onChange={(e) => setFormDate(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-green/10 focus:border-brand-green transition-all cursor-pointer"
                    />
                  </div>
                </div>

                {/* Category & Payment Method */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Rubro / Categoría</label>
                    <select
                      value={formCategory}
                      onChange={(e) => setFormCategory(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-green/10 focus:border-brand-green transition-all cursor-pointer"
                    >
                      {categories.map(c => (
                        <option key={c.id} value={c.name}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Forma de Pago</label>
                    <select
                      value={formPaymentMethod}
                      onChange={(e) => setFormPaymentMethod(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-green/10 focus:border-brand-green transition-all cursor-pointer"
                    >
                      {PAYMENT_METHODS.map(m => (
                        <option key={m} value={m}>{m}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Description input */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Descripción / Concepto del Gasto</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Combustible Toyota frentes de obra..."
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-green/10 focus:border-brand-green transition-all"
                  />
                </div>

                {/* Invoice Number */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Número de Factura (Opcional)</label>
                  <input
                    type="text"
                    placeholder="Ej. FAC-2026-90412"
                    value={formInvoiceNumber}
                    onChange={(e) => setFormInvoiceNumber(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-green/10 focus:border-brand-green transition-all"
                  />
                </div>

                {/* File Attachment Uploader Box */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Comprobantes / Facturas PDF o Foto</label>
                  
                  {/* File Upload Stage Area */}
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-2xl p-4 text-center cursor-pointer transition-colors flex flex-col items-center justify-center gap-1.5 ${
                      isDragging 
                        ? 'border-brand-green bg-brand-green/5' 
                        : 'border-slate-200 hover:border-brand-green/45 bg-slate-50/50 hover:bg-slate-50'
                    }`}
                  >
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileSelect}
                      multiple
                      accept="image/*,application/pdf"
                      className="hidden"
                    />
                    <UploadCloud className="h-6 w-6 text-slate-400" />
                    <div>
                      <p className="text-[11px] font-bold text-slate-600">Suelte la factura aquí o haga clic para subir</p>
                      <p className="text-[9px] text-slate-400 mt-0.5">Soporta múltiples imágenes y archivos PDF</p>
                    </div>
                  </div>

                  {/* List of uploaded attachments */}
                  {formAttachments.length > 0 && (
                    <div className="mt-3 space-y-1.5" id="form-attachment-list">
                      {formAttachments.map((att) => (
                        <div 
                          key={att.id} 
                          className="flex items-center justify-between p-2 bg-slate-50 border border-slate-150 rounded-xl text-[11px]"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            {att.type === 'pdf' ? (
                              <FileText className="h-4 w-4 text-rose-500 shrink-0" />
                            ) : (
                              <FileImage className="h-4 w-4 text-brand-green shrink-0" />
                            )}
                            <span className="font-semibold text-slate-700 truncate max-w-[200px]">{att.name}</span>
                          </div>
                          
                          <button
                            type="button"
                            onClick={() => handleRemoveAttachment(att.id)}
                            className="p-1 hover:text-rose-600 text-slate-400 rounded-lg bg-slate-100 hover:bg-slate-200 cursor-pointer"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Observations */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Observaciones o Notas</label>
                  <textarea
                    rows={2}
                    placeholder="Escriba aquí aclaraciones o detalles de las facturas..."
                    value={formObservations}
                    onChange={(e) => setFormObservations(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-green/10 focus:border-brand-green transition-all"
                  />
                </div>

                {formError && (
                  <div className="p-3 bg-rose-50 border border-rose-100 text-rose-700 text-xs rounded-lg flex items-center gap-1.5">
                    <AlertTriangle className="h-4 w-4 shrink-0" />
                    <span>{formError}</span>
                  </div>
                )}

              </form>
            </div>

            <div className="flex gap-3 pt-5 border-t border-slate-100 bg-white sticky bottom-0">
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold text-xs rounded-xl cursor-pointer transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleFormSubmit}
                className="flex-1 py-3 bg-brand-green hover:bg-brand-green-hover text-white font-semibold text-xs rounded-xl cursor-pointer transition-colors shadow-sm"
              >
                {editingExpense ? 'Guardar Cambios' : 'Registrar Gasto'}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Invoice Lightbox Attachment Preview Modal */}
      {previewAttachment && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 z-55 animate-fade-in" id="receipt-lightbox">
          <div className="bg-slate-900 text-white rounded-3xl overflow-hidden max-w-lg w-full p-6 shadow-2xl relative flex flex-col items-center">
            
            <button 
              onClick={() => setPreviewAttachment(null)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="mb-4 text-center border-b border-slate-850 pb-3 w-full pr-8">
              <h4 className="text-sm font-bold font-display tracking-tight text-slate-200 truncate">
                {previewAttachment.name}
              </h4>
              <p className="text-[10px] text-slate-500 mt-0.5">Tipo: {previewAttachment.type.toUpperCase()}</p>
            </div>

            {/* Content Preview */}
            <div className="w-full flex justify-center items-center h-80 bg-slate-950 rounded-2xl overflow-hidden p-2 border border-slate-850">
              {previewAttachment.type === 'pdf' ? (
                <div className="flex flex-col items-center gap-3 text-slate-450 p-6 text-center">
                  <FileText className="h-16 w-16 text-rose-500 animate-pulse" />
                  <div>
                    <p className="text-xs font-bold text-white">Visualización de Comprobante PDF</p>
                    <p className="text-[10px] text-slate-500 mt-1">El archivo PDF contiene los timbres y la información de liquidación tributaria.</p>
                  </div>
                </div>
              ) : (
                <img 
                  src={previewAttachment.url} 
                  alt={previewAttachment.name}
                  className="max-h-full max-w-full object-contain"
                  referrerPolicy="no-referrer"
                />
              )}
            </div>

            <div className="mt-5 w-full flex gap-3">
              <button
                onClick={() => setPreviewAttachment(null)}
                className="w-full py-2.5 bg-slate-800 hover:bg-slate-750 text-slate-300 rounded-xl text-xs font-semibold cursor-pointer transition-colors border border-slate-750"
              >
                Cerrar Comprobante
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
