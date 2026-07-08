/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useRef } from 'react';
import { Project, Expense, Category, User } from '../types';
import { 
  FileSpreadsheet, 
  Printer, 
  Download, 
  Calendar, 
  Tags, 
  Briefcase, 
  User as UserIcon, 
  Building, 
  FileText, 
  Upload, 
  ArrowRight,
  TrendingUp,
  TrendingDown,
  Scale,
  CheckCircle,
  Eye
} from 'lucide-react';

interface ReportsViewProps {
  projects: Project[];
  expenses: Expense[];
  categories: Category[];
  currentUser: User;
}

export default function ReportsView({
  projects,
  expenses,
  categories,
  currentUser
}: ReportsViewProps) {
  // Filter States
  const [filterProjectId, setFilterProjectId] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterDateStart, setFilterDateStart] = useState('');
  const [filterDateEnd, setFilterDateEnd] = useState('');

  // Corporate logo state
  const [companyLogo, setCompanyLogo] = useState<string>(''); // Base64 or mock image
  const logoInputRef = useRef<HTMLInputElement>(null);

  // Currency Formatter
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(val).replace('CLP', '$');
  };

  // Handle Logo Upload
  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setCompanyLogo(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Get active selected project
  const selectedProjectObj = useMemo(() => {
    return projects.find(p => p.id === filterProjectId);
  }, [projects, filterProjectId]);

  // Total allocated capital for chosen project (or sum of all if 'all')
  const allocatedFund = useMemo(() => {
    if (filterProjectId === 'all') {
      return projects.reduce((sum, p) => sum + p.budget, 0);
    }
    return selectedProjectObj ? selectedProjectObj.budget : 0;
  }, [projects, filterProjectId, selectedProjectObj]);

  // Filtered expenses based on report criteria
  const reportExpenses = useMemo(() => {
    return expenses.filter(exp => {
      const matchesProject = filterProjectId === 'all' || exp.projectId === filterProjectId;
      const matchesCategory = filterCategory === 'all' || exp.category === filterCategory;
      
      let matchesDate = true;
      if (filterDateStart) {
        matchesDate = matchesDate && (new Date(exp.date) >= new Date(filterDateStart));
      }
      if (filterDateEnd) {
        matchesDate = matchesDate && (new Date(exp.date) <= new Date(filterDateEnd));
      }

      return matchesProject && matchesCategory && matchesDate;
    }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [expenses, filterProjectId, filterCategory, filterDateStart, filterDateEnd]);

  // Financial Computations
  const stats = useMemo(() => {
    const totalSpent = reportExpenses.reduce((sum, e) => sum + e.value, 0);
    const balanceRemaining = allocatedFund - totalSpent;
    const efficiency = allocatedFund > 0 ? (totalSpent / allocatedFund) * 100 : 0;

    return {
      totalSpent,
      balanceRemaining,
      efficiency
    };
  }, [reportExpenses, allocatedFund]);

  // Breakdown by Category for selected subset
  const categoryBreakdown = useMemo(() => {
    const map: Record<string, number> = {};
    reportExpenses.forEach(exp => {
      map[exp.category] = (map[exp.category] || 0) + exp.value;
    });

    return Object.entries(map).map(([name, val]) => {
      const pct = stats.totalSpent > 0 ? (val / stats.totalSpent) * 100 : 0;
      return { name, value: val, percentage: pct };
    }).sort((a, b) => b.value - a.value);
  }, [reportExpenses, stats.totalSpent]);

  // Breakdown by Spender for selected subset
  const personBreakdown = useMemo(() => {
    const map: Record<string, number> = {};
    reportExpenses.forEach(exp => {
      map[exp.person] = (map[exp.person] || 0) + exp.value;
    });

    return Object.entries(map).map(([name, val]) => {
      const pct = stats.totalSpent > 0 ? (val / stats.totalSpent) * 100 : 0;
      return { name, value: val, percentage: pct };
    }).sort((a, b) => b.value - a.value);
  }, [reportExpenses, stats.totalSpent]);

  // Export to Excel (CSV)
  const handleExportCSV = () => {
    if (reportExpenses.length === 0) return;

    // Build formal header metadata
    const metaProject = filterProjectId === 'all' ? 'TODOS LOS PROYECTOS' : (selectedProjectObj?.name || '');
    const metaDate = `Rango: ${filterDateStart || 'Inicio'} hasta ${filterDateEnd || 'Fin'}`;
    
    const csvContent = [
      ['REPÓRTE OFICIAL DE RENDICIÓN DE CUENTAS - EQUIBUDGET'],
      [`Proyecto:`, metaProject],
      [`Cliente:`, filterProjectId === 'all' ? 'N/A' : (selectedProjectObj?.client || '')],
      [`Fecha de emisión:`, new Date().toLocaleDateString('es-ES')],
      [metaDate],
      [],
      ['RESUMEN GENERAL'],
      ['Presupuesto Asignado', 'Total Gastado', 'Saldo Restante', 'Consumo %'],
      [allocatedFund, stats.totalSpent, stats.balanceRemaining, stats.efficiency.toFixed(2)],
      [],
      ['DESGLOSE DETALLADO DE GASTOS'],
      ['ID Gasto', 'Fecha', 'Persona Responsable', 'Categoría/Rubro', 'Descripción', 'Método de Pago', 'N° Factura', 'Valor ($)']
    ];

    reportExpenses.forEach(exp => {
      csvContent.push([
        exp.id,
        exp.date,
        exp.person,
        exp.category,
        `"${exp.description.replace(/"/g, '""')}"`,
        exp.paymentMethod,
        exp.invoiceNumber ? `"${exp.invoiceNumber}"` : 'Sin Factura',
        exp.value.toFixed(2)
      ]);
    });

    // Convert array to CSV string with BOM for Excel Spanish special characters support
    const csvString = "\uFEFF" + csvContent.map(e => e.join(',')).join('\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `EquiBudget_Rendicion_${filterProjectId}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Trigger Print dialog (isolates report preview via custom styling inside App)
  const handlePrintPDF = () => {
    window.print();
  };

  return (
    <div className="space-y-6" id="reports-module-wrapper">
      
      {/* Printable Style Sheet injection strictly when printing */}
      <style>{`
        @media print {
          /* Hide sidebar, headers, and filters */
          aside, #mobile-top-bar, #app-header, #reports-filters-pane, #mobile-menu-toggle, #reports-action-buttons {
            display: none !important;
          }
          /* Expand preview container to full screen */
          body {
            background: white !important;
            color: black !important;
            font-size: 10pt !important;
          }
          #main-content-layout {
            padding: 0 !important;
            margin: 0 !important;
          }
          #reports-preview-pane {
            grid-column: span 12 / span 12 !important;
            border: none !important;
            box-shadow: none !important;
            padding: 0 !important;
            margin: 0 !important;
            background: white !important;
            width: 100% !important;
          }
          /* Custom layout margins for standard print margins */
          @page {
            size: A4 portrait;
            margin: 1.5cm;
          }
        }
      `}</style>

      {/* Action Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5" id="reports-header-row">
        <div>
          <h2 className="text-xl font-bold font-display text-slate-800">
            Generador de Reportes y Rendiciones
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Prepare hojas de gastos oficiales y consolidadas con resúmenes ejecutivos para el área contable.
          </p>
        </div>

        {/* Floating Print / Download buttons on screen */}
        <div className="flex items-center gap-2" id="reports-action-buttons">
          <button
            onClick={handleExportCSV}
            disabled={reportExpenses.length === 0}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-white border border-slate-250 hover:bg-slate-50 text-slate-700 hover:text-slate-950 font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer disabled:opacity-45 disabled:cursor-not-allowed"
          >
            <Download className="h-4 w-4 text-brand-green" />
            <span>Exportar Excel</span>
          </button>
          
          <button
            onClick={handlePrintPDF}
            disabled={reportExpenses.length === 0}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-brand-green hover:bg-brand-green-hover text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer disabled:opacity-45 disabled:cursor-not-allowed hover:scale-[1.01] active:scale-[0.99]"
          >
            <Printer className="h-4 w-4" />
            <span>Imprimir / PDF</span>
          </button>
        </div>
      </div>

      {/* Main layout grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="main-content-layout">
        
        {/* Left column: Filter Settings */}
        <div className="lg:col-span-4 space-y-4" id="reports-filters-pane">
          <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-xs space-y-5">
            <h3 className="text-xs font-bold text-slate-755 uppercase tracking-wider border-b border-slate-100 pb-2.5">
              Configuración del Reporte
            </h3>

            {/* Project scope */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1">
                <Briefcase className="h-3.5 w-3.5 text-brand-green" />
                <span>Alcance (Proyecto)</span>
              </label>
              <select
                value={filterProjectId}
                onChange={(e) => setFilterProjectId(e.target.value)}
                className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-brand-green cursor-pointer"
              >
                <option value="all">Consolidado (Todos los Proyectos)</option>
                {projects.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>

            {/* Category scope */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1">
                <Tags className="h-3.5 w-3.5 text-brand-green" />
                <span>Filtrar por Rubro</span>
              </label>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-brand-green cursor-pointer"
              >
                <option value="all">Cualquier Rubro</option>
                {categories.map(c => (
                  <option key={c.id} value={c.name}>{c.name}</option>
                ))}
              </select>
            </div>

            {/* Date range selection */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                <span>Rango de Fechas</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="date"
                  placeholder="Desde"
                  value={filterDateStart}
                  onChange={(e) => setFilterDateStart(e.target.value)}
                  className="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800"
                />
                <input
                  type="date"
                  placeholder="Hasta"
                  value={filterDateEnd}
                  onChange={(e) => setFilterDateEnd(e.target.value)}
                  className="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800"
                />
              </div>
              <p className="text-[9px] text-slate-400">Deje en blanco para incluir el historial completo.</p>
            </div>

            {/* Corporate Logo Upload Section */}
            <div className="space-y-1.5 border-t border-slate-100 pt-4">
              <label className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1">
                <Building className="h-3.5 w-3.5" />
                <span>Logotipo de Empresa</span>
              </label>
              
              <div className="flex items-center gap-3">
                <div 
                  onClick={() => logoInputRef.current?.click()}
                  className="w-12 h-12 border-2 border-dashed border-slate-200 rounded-xl hover:border-brand-green/45 bg-slate-50 cursor-pointer flex flex-col items-center justify-center text-slate-400 hover:text-brand-green transition-colors"
                  title="Subir logotipo"
                >
                  <input
                    type="file"
                    ref={logoInputRef}
                    accept="image/*"
                    onChange={handleLogoChange}
                    className="hidden"
                  />
                  <Upload className="h-4.5 w-4.5" />
                </div>
                
                <div className="min-w-0">
                  <p className="text-[11px] font-bold text-slate-600 truncate">Logotipo Corporativo</p>
                  <p className="text-[9px] text-slate-450">
                    {companyLogo ? '✓ Cargado exitosamente' : 'Opcional. Sube JPG o PNG'}
                  </p>
                  {companyLogo && (
                    <button 
                      onClick={() => setCompanyLogo('')}
                      className="text-[9px] text-rose-500 hover:underline font-semibold"
                    >
                      Remover logo
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Status Info Indicators */}
            <div className="bg-brand-green/5 border border-brand-green/10 rounded-xl p-3.5 text-[11px] text-slate-800 space-y-1">
              <div className="flex items-center gap-1 font-bold">
                <CheckCircle className="h-4 w-4 text-brand-green shrink-0" />
                <span>Vista Previa Activa</span>
              </div>
              <p className="text-slate-500 font-medium leading-relaxed">
                El documento de la derecha se actualiza automáticamente. Puede revisarlo antes de realizar la impresión o descargarlo a formato Excel.
              </p>
            </div>
          </div>
        </div>

        {/* Right column: Document layout preview (A4 emulation) */}
        <div className="lg:col-span-8 space-y-4" id="reports-preview-pane">
          <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm text-slate-800 space-y-6 min-h-[842px] max-w-4xl mx-auto" id="report-a4-canvas">
            
            {/* Document Header block */}
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 border-b border-slate-200 pb-6" id="pdf-header">
              
              {/* Logo & Corporate Meta */}
              <div className="flex items-start gap-4">
                {companyLogo ? (
                  <img 
                    src={companyLogo} 
                    alt="Logo Empresa" 
                    className="h-14 max-w-[120px] object-contain shrink-0"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="h-14 w-14 bg-brand-green rounded-xl flex items-center justify-center text-white font-extrabold text-lg shrink-0 shadow-sm">
                    EQ
                  </div>
                )}
                <div>
                  <h3 className="text-sm font-extrabold font-display uppercase tracking-wider text-slate-900 leading-tight">
                    {companyLogo ? 'Rendición de Cuentas' : 'EquiBudget Corp Ltd.'}
                  </h3>
                  <p className="text-[10px] text-slate-500 leading-normal mt-0.5">Control de Viáticos, Logística y Compras en Obra</p>
                  <p className="text-[9px] text-slate-400 mt-0.5">Documentación Contable Oficial</p>
                </div>
              </div>

              {/* Scope & Date metadata */}
              <div className="text-left sm:text-right text-[10px] text-slate-500 space-y-0.5">
                <p>Fecha Emisión: <strong className="text-slate-800 font-bold">{new Date().toLocaleDateString('es-ES')}</strong></p>
                <p>Generado por: <strong className="text-slate-800 font-semibold">{currentUser.name}</strong></p>
                <p>Filtro Fechas: <strong className="text-slate-700 font-medium">{filterDateStart || 'Inicio'} al {filterDateEnd || 'Fin'}</strong></p>
              </div>

            </div>

            {/* Document Title bar */}
            <div className="text-center bg-slate-900 text-white rounded-xl py-3 px-4 shadow-sm" id="pdf-title-bar">
              <h2 className="text-xs font-extrabold uppercase tracking-widest">
                INFORME CONSOLIDADO DE RENDICIÓN DE GASTOS DE INGENIERÍA
              </h2>
              <p className="text-[10px] text-slate-400 mt-1 font-semibold">
                Proyecto: {filterProjectId === 'all' ? 'TODOS LOS PROYECTOS REGISTRADOS' : (selectedProjectObj?.name || 'Varios')}
              </p>
            </div>

            {/* Financial indicators (allocated, spent, remaining) */}
            <div className="grid grid-cols-3 gap-4 bg-slate-50 border border-slate-200/60 rounded-2xl p-4 text-center" id="pdf-kpis">
              <div>
                <span className="text-[9px] text-slate-450 uppercase font-extrabold tracking-wide">Fondo Asignado</span>
                <p className="text-sm font-bold text-slate-900 mt-0.5">{formatCurrency(allocatedFund)}</p>
              </div>
              <div className="border-x border-slate-200">
                <span className="text-[9px] text-rose-550 uppercase font-extrabold tracking-wide">Total Gastado</span>
                <p className="text-sm font-bold text-rose-600 mt-0.5">{formatCurrency(stats.totalSpent)}</p>
              </div>
              <div>
                <span className={`text-[9px] uppercase font-extrabold tracking-wide ${stats.balanceRemaining < 0 ? 'text-rose-550' : 'text-brand-green'}`}>Saldo Restante</span>
                <p className={`text-sm font-bold mt-0.5 ${stats.balanceRemaining < 0 ? 'text-rose-600' : 'text-brand-green'}`}>
                  {formatCurrency(stats.balanceRemaining)}
                </p>
              </div>
            </div>

            {/* Dual tables breakdown (Category on left, Person on right) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6" id="pdf-breakdowns">
              
              {/* Category summary table */}
              <div className="space-y-2">
                <h4 className="text-[10px] font-bold text-slate-800 uppercase tracking-wider border-b border-slate-200 pb-1.5 flex items-center gap-1">
                  <span>1. Consumo por Categoría / Rubro</span>
                </h4>
                {categoryBreakdown.length === 0 ? (
                  <p className="text-[10px] text-slate-400 italic">No hay gastos asociados.</p>
                ) : (
                  <table className="w-full text-[10px] text-left">
                    <thead>
                      <tr className="text-slate-450 font-bold border-b border-slate-100">
                        <th className="py-1">Rubro</th>
                        <th className="py-1 text-right">Gasto</th>
                        <th className="py-1 text-right">%</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-650">
                      {categoryBreakdown.map(item => (
                        <tr key={item.name}>
                          <td className="py-1.5 font-semibold text-slate-850">{item.name}</td>
                          <td className="py-1.5 text-right font-bold text-slate-900">{formatCurrency(item.value)}</td>
                          <td className="py-1.5 text-right text-slate-500">{item.percentage.toFixed(0)}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>

              {/* Spender summary table */}
              <div className="space-y-2">
                <h4 className="text-[10px] font-bold text-slate-800 uppercase tracking-wider border-b border-slate-200 pb-1.5 flex items-center gap-1">
                  <span>2. Consumo por Colaborador / Personal</span>
                </h4>
                {personBreakdown.length === 0 ? (
                  <p className="text-[10px] text-slate-400 italic">No hay gastos asociados.</p>
                ) : (
                  <table className="w-full text-[10px] text-left">
                    <thead>
                      <tr className="text-slate-450 font-bold border-b border-slate-100">
                        <th className="py-1">Personal</th>
                        <th className="py-1 text-right">Gasto</th>
                        <th className="py-1 text-right">%</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-650">
                      {personBreakdown.map(item => (
                        <tr key={item.name}>
                          <td className="py-1.5 font-semibold text-slate-850">{item.name}</td>
                          <td className="py-1.5 text-right font-bold text-slate-900">{formatCurrency(item.value)}</td>
                          <td className="py-1.5 text-right text-slate-500">{item.percentage.toFixed(0)}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>

            </div>

            {/* List breakdown of expenses */}
            <div className="space-y-2" id="pdf-ledger">
              <h4 className="text-[10px] font-bold text-slate-800 uppercase tracking-wider border-b border-slate-200 pb-1.5">
                3. Libro Auxiliar de Gastos Detallados
              </h4>
              
              {reportExpenses.length === 0 ? (
                <p className="text-xs text-slate-400 py-6 text-center">No hay gastos que coincidan con los filtros.</p>
              ) : (
                <table className="w-full text-[9px] text-left border-collapse" id="pdf-ledger-table">
                  <thead>
                    <tr className="bg-slate-50 text-slate-500 font-extrabold uppercase border-b border-slate-200">
                      <th className="p-1.5">Fecha</th>
                      <th className="p-1.5">Descripción</th>
                      <th className="p-1.5">Responsable</th>
                      <th className="p-1.5">Rubro</th>
                      <th className="p-1.5">Forma Pago</th>
                      <th className="p-1.5">Factura</th>
                      <th className="p-1.5 text-right">Valor</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-150 text-slate-700">
                    {reportExpenses.map(exp => (
                      <tr key={exp.id}>
                        <td className="p-1.5 whitespace-nowrap">{exp.date}</td>
                        <td className="p-1.5 max-w-[150px] truncate">{exp.description}</td>
                        <td className="p-1.5 whitespace-nowrap">{exp.person}</td>
                        <td className="p-1.5">{exp.category}</td>
                        <td className="p-1.5">{exp.paymentMethod}</td>
                        <td className="p-1.5 font-mono">{exp.invoiceNumber || '-'}</td>
                        <td className="p-1.5 text-right font-bold text-slate-900">{formatCurrency(exp.value)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* Corporate approval block (signatures) */}
            <div className="grid grid-cols-2 gap-12 pt-16" id="pdf-signatures">
              <div className="text-center">
                <div className="border-t border-slate-350 w-36 mx-auto mb-1"></div>
                <p className="text-[9px] font-bold text-slate-700">{currentUser.name}</p>
                <p className="text-[8px] text-slate-450 uppercase">{currentUser.role === 'admin' ? 'Coordinador General' : 'Inspector de Campo'}</p>
              </div>
              <div className="text-center">
                <div className="border-t border-slate-350 w-36 mx-auto mb-1"></div>
                <p className="text-[9px] font-bold text-slate-700">Responsable Administrativo</p>
                <p className="text-[8px] text-slate-450 uppercase">Área de Contabilidad y Finanzas</p>
              </div>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
}
