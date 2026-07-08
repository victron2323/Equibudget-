/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { Category, Expense, User } from '../types';
import { 
  Tags, 
  Plus, 
  Trash2, 
  Edit3, 
  Check, 
  X, 
  AlertTriangle,
  Info,
  Palette,
  Utensils,
  Hotel,
  Bus,
  Fuel,
  MapPin,
  Wrench,
  Package,
  ShoppingBag,
  Truck,
  Coins,
  Coffee,
  Hammer,
  Zap,
  Phone,
  ShieldCheck,
  CheckSquare
} from 'lucide-react';

interface CategoryManagerProps {
  categories: Category[];
  setCategories: React.Dispatch<React.SetStateAction<Category[]>>;
  expenses: Expense[];
  currentUser: User;
}

// Icon Mapping dictionary
const ICON_COMPONENTS: Record<string, React.ComponentType<any>> = {
  Utensils,
  Hotel,
  Bus,
  Fuel,
  MapPin,
  Wrench,
  Package,
  ShoppingBag,
  Truck,
  Coins,
  Coffee,
  Hammer,
  Zap,
  Phone,
  ShieldCheck,
  CheckSquare
};

// Preset colors for the color picker
const COLOR_PRESETS = [
  '#f97316', // Orange
  '#a855f7', // Purple
  '#3b82f6', // Blue
  '#0ea5e9', // Sky Blue
  '#f59e0b', // Amber
  '#64748b', // Slate Gray
  '#10b981', // Emerald Green
  '#6366f1', // Indigo
  '#ec4899', // Pink
  '#14b8a6', // Teal
  '#ef4444', // Red
  '#84cc16'  // Lime
];

export default function CategoryManager({
  categories,
  setCategories,
  expenses,
  currentUser
}: CategoryManagerProps) {
  const isAdmin = currentUser.role === 'admin';

  // Form States
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    color: '#3b82f6',
    icon: 'Coins'
  });
  const [formError, setFormError] = useState('');

  // Delete Alert States
  const [deleteBlockReason, setDeleteBlockReason] = useState<string | null>(null);

  // Handlers
  const handleOpenCreate = () => {
    if (!isAdmin) return;
    setEditingCategory(null);
    setFormData({
      name: '',
      color: '#3b82f6',
      icon: 'Coins'
    });
    setFormError('');
    setIsFormOpen(true);
  };

  const handleOpenEdit = (cat: Category) => {
    if (!isAdmin) return;
    setEditingCategory(cat);
    setFormData({
      name: cat.name,
      color: cat.color,
      icon: cat.icon
    });
    setFormError('');
    setIsFormOpen(true);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    const trimmedName = formData.name.trim();
    if (!trimmedName) {
      setFormError('Por favor ingrese un nombre para el rubro.');
      return;
    }

    // Check duplicate name
    const isDuplicate = categories.some(c => 
      c.name.toLowerCase() === trimmedName.toLowerCase() && 
      (!editingCategory || c.id !== editingCategory.id)
    );
    if (isDuplicate) {
      setFormError('Ya existe una categoría con ese nombre.');
      return;
    }

    if (editingCategory) {
      // Edit
      setCategories(prev => prev.map(c => c.id === editingCategory.id ? {
        ...c,
        name: trimmedName,
        color: formData.color,
        icon: formData.icon
      } : c));
    } else {
      // Create
      const newCat: Category = {
        id: 'cat-' + Date.now(),
        name: trimmedName,
        color: formData.color,
        icon: formData.icon
      };
      setCategories(prev => [...prev, newCat]);
    }

    setIsFormOpen(false);
  };

  const handleDeleteCategory = (cat: Category) => {
    if (!isAdmin) return;

    // Check if category is currently used by any expense
    const countInUse = expenses.filter(e => e.category === cat.name).length;
    if (countInUse > 0) {
      setDeleteBlockReason(
        `No se puede eliminar "${cat.name}" porque está asignada a ${countInUse} registros de gastos. Actualiza o elimina dichos gastos primero.`
      );
      return;
    }

    if (confirm(`¿Estás seguro de que deseas eliminar la categoría "${cat.name}"?`)) {
      setCategories(prev => prev.filter(c => c.id !== cat.id));
    }
  };

  return (
    <div className="space-y-6" id="category-manager-wrapper">
      
      {/* Header action row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5" id="cm-header-row">
        <div>
          <h2 className="text-xl font-bold font-display text-slate-800">
            Configuración de Rubros de Gasto
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Personalice y configure las categorías disponibles para la clasificación del dinero de viáticos.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="self-start px-4.5 py-2.5 bg-brand-green hover:bg-brand-green-hover text-white font-semibold text-xs rounded-xl shadow-xs cursor-pointer flex items-center gap-2 transition-all hover:scale-[1.01] active:scale-[0.99]"
          id="new-category-btn"
        >
          <Plus className="h-4.5 w-4.5" />
          <span>Agregar Rubro</span>
        </button>
      </div>

      {/* Categories Grid layout */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" id="categories-grid">
        {categories.map((cat) => {
          const IconComp = ICON_COMPONENTS[cat.icon] || Coins;
          const usageCount = expenses.filter(e => e.category === cat.name).length;

          return (
            <div 
              key={cat.id} 
              className="bg-white rounded-2xl border border-slate-100 p-5 shadow-xs hover:shadow-sm hover:border-brand-green/45 transition-all flex flex-col justify-between group"
              id={`cat-card-${cat.id}`}
            >
              <div className="flex items-start justify-between">
                {/* Visual Icon Badge */}
                <div 
                  className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-sm"
                  style={{ backgroundColor: cat.color }}
                >
                  <IconComp className="h-6 w-6" />
                </div>

                {/* Edit / Delete actions */}
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleOpenEdit(cat)}
                    className="p-1 text-slate-400 hover:text-brand-green hover:bg-brand-green/10 rounded-lg transition-colors cursor-pointer"
                    title="Editar"
                  >
                    <Edit3 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteCategory(cat)}
                    className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                    title="Eliminar"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Text Info */}
              <div className="mt-5">
                <h3 className="text-sm font-bold font-display text-slate-800 tracking-tight">{cat.name}</h3>
                <div className="flex items-center gap-2 mt-1.5 text-[10px] text-slate-450 font-semibold">
                  <span>Asignado en:</span>
                  <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-bold">
                    {usageCount} {usageCount === 1 ? 'gasto' : 'gastos'}
                  </span>
                </div>
              </div>

            </div>
          );
        })}
      </div>

      {/* Info Warning Tip */}
      <div className="bg-brand-green/5 border border-brand-green/10 rounded-2xl p-5 flex gap-3.5 text-slate-800" id="tip-categories-rules">
        <Info className="h-5 w-5 text-brand-green shrink-0 mt-0.5" />
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wide text-slate-900 mb-0.5">Integridad de Reportes</h4>
          <p className="text-xs text-slate-500 leading-relaxed">
            Las categorías modificadas o agregadas se reflejan de inmediato en los paneles de registro para el personal en campo y se desglosan en las hojas de rendición de cuentas administrativas.
          </p>
        </div>
      </div>

      {/* Category Editor / Creation Form Dialog modal */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in" id="category-form-overlay">
          <div className="bg-white rounded-3xl border border-slate-100 max-w-sm w-full p-6 shadow-2xl relative" id="category-form-modal">
            
            <button 
              onClick={() => setIsFormOpen(false)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-50 cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            <h3 className="text-base font-extrabold font-display text-slate-800 mb-4 flex items-center gap-2">
              <Tags className="h-5 w-5 text-brand-green" />
              <span>{editingCategory ? 'Editar Categoría' : 'Nueva Categoría'}</span>
            </h3>

            <form onSubmit={handleFormSubmit} className="space-y-4" id="cm-editor-form">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Nombre del Rubro</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Peajes, Logística..."
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-green/10 focus:border-brand-green transition-all font-semibold"
                />
              </div>

              {/* Preset Color Picker */}
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                  <Palette className="h-3.5 w-3.5" />
                  <span>Color Identificador</span>
                </label>
                <div className="grid grid-cols-6 gap-2" id="color-picker-grid">
                  {COLOR_PRESETS.map((col) => (
                    <button
                      key={col}
                      type="button"
                      onClick={() => setFormData({ ...formData, color: col })}
                      className="w-8 h-8 rounded-full cursor-pointer transition-transform relative flex items-center justify-center border border-slate-200 shadow-xs hover:scale-110 active:scale-95"
                      style={{ backgroundColor: col }}
                    >
                      {formData.color === col && (
                        <Check className="h-4 w-4 text-white drop-shadow-md font-bold" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Icon Selection Panel */}
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Icono Asociado</label>
                <div className="grid grid-cols-6 gap-2 max-h-24 overflow-y-auto p-1.5 bg-slate-50 border border-slate-250 rounded-xl" id="icon-picker-grid">
                  {Object.entries(ICON_COMPONENTS).map(([iconName, IconComponent]) => (
                    <button
                      key={iconName}
                      type="button"
                      onClick={() => setFormData({ ...formData, icon: iconName })}
                      className={`p-1.5 rounded-lg border flex items-center justify-center cursor-pointer transition-all ${
                        formData.icon === iconName 
                          ? 'bg-brand-green border-brand-green text-white shadow-xs' 
                          : 'bg-white border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                      }`}
                      title={iconName}
                    >
                      <IconComponent className="h-4.5 w-4.5" />
                    </button>
                  ))}
                </div>
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
                  {editingCategory ? 'Guardar Cambios' : 'Crear Rubro'}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* Block Alert Modal (Referential constraint) */}
      {deleteBlockReason && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in" id="category-block-overlay">
          <div className="bg-white rounded-3xl border border-slate-100 max-w-sm w-full p-6 shadow-2xl" id="category-block-modal">
            <div className="flex items-center gap-3 text-rose-600 mb-3">
              <div className="p-2 bg-rose-50 rounded-lg">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <h3 className="text-sm font-bold font-display">Operación No Permitida</h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed mb-5">
              {deleteBlockReason}
            </p>
            <div className="flex justify-end">
              <button
                onClick={() => setDeleteBlockReason(null)}
                className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-xs font-bold cursor-pointer transition-colors"
              >
                Cerrar Mensaje
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
