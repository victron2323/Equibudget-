/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { BackupHistory, Project, Expense, Category, Notification } from '../types';
import { MOCK_BACKUP_HISTORY } from '../data/initialData';
import { 
  Cloud, 
  CloudLightning, 
  Database, 
  RotateCw, 
  CheckCircle, 
  AlertCircle, 
  ToggleLeft, 
  ToggleRight, 
  Calendar, 
  Server,
  Download,
  Info
} from 'lucide-react';

interface CloudSyncSimulatorProps {
  projects: Project[];
  expenses: Expense[];
  categories: Category[];
  notifications: Notification[];
  cloudSyncStatus: 'synced' | 'syncing' | 'error' | 'offline';
  setCloudSyncStatus: (status: 'synced' | 'syncing' | 'error' | 'offline') => void;
}

export default function CloudSyncSimulator({
  projects,
  expenses,
  categories,
  notifications,
  cloudSyncStatus,
  setCloudSyncStatus
}: CloudSyncSimulatorProps) {
  const [backupHistory, setBackupHistory] = useState<BackupHistory[]>(MOCK_BACKUP_HISTORY);
  const [autoBackup, setAutoBackup] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);

  const totalRecords = projects.length + expenses.length + categories.length + notifications.length;

  const handleManualBackup = () => {
    setIsSyncing(true);
    setCloudSyncStatus('syncing');

    // Simulate 2 seconds of delay for backing up files
    setTimeout(() => {
      const newBackup: BackupHistory = {
        id: 'b-' + Date.now(),
        date: new Date().toISOString().replace('T', ' ').substring(0, 16),
        size: `${(totalRecords * 1.1 + Math.random() * 2).toFixed(1)} KB`,
        recordsCount: totalRecords,
        status: 'Completado'
      };

      setBackupHistory(prev => [newBackup, ...prev]);
      setIsSyncing(false);
      setCloudSyncStatus('synced');
    }, 1800);
  };

  return (
    <div className="space-y-6" id="sync-simulator-wrapper">
      
      {/* Header action row */}
      <div className="flex items-center gap-2.5 border-b border-slate-100 pb-5" id="sync-header-row">
        <div className="p-2 bg-brand-green/10 text-brand-green rounded-xl border border-brand-green/20">
          <Cloud className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-xl font-bold font-display text-slate-800">
            Sincronización en la Nube y Respaldos
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Administre copias de seguridad de sus bases de datos de ingeniería y supervise la sincronización fuera de línea.
          </p>
        </div>
      </div>

      {/* Grid: Left is status panel, Right is log table */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="sync-grid-layout">
        
        {/* Status panel */}
        <div className="lg:col-span-5 space-y-4" id="sync-status-col">
          <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-xs space-y-6">
            
            {/* Main beacon status indicator */}
            <div className="flex items-center gap-4 border-b border-slate-100 pb-5">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center relative ${
                cloudSyncStatus === 'syncing' 
                  ? 'bg-brand-green/10 text-brand-green' 
                  : 'bg-brand-green/10 text-brand-green'
              }`}>
                {cloudSyncStatus === 'syncing' ? (
                  <RotateCw className="h-7 w-7 animate-spin" />
                ) : (
                  <>
                    <Database className="h-7 w-7" />
                    <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-brand-green border-2 border-white rounded-full animate-ping" />
                  </>
                )}
              </div>

              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Estado del Servidor</p>
                <h3 className="text-sm font-extrabold text-slate-800 flex items-center gap-1.5 mt-0.5">
                  <span>{cloudSyncStatus === 'syncing' ? 'Sincronizando...' : 'Nube Conectada y Activa'}</span>
                </h3>
                <p className="text-[10px] text-slate-500 mt-0.5">Servicio alojado en Cloud Infrastructure</p>
              </div>
            </div>

            {/* Quick Stats of records */}
            <div className="grid grid-cols-2 gap-4 text-center bg-slate-50 border border-slate-200/50 rounded-xl p-4" id="sync-stats-box">
              <div>
                <span className="text-[9px] text-slate-450 uppercase font-extrabold block">Registros Locales</span>
                <span className="text-lg font-bold text-slate-800 mt-0.5 block">{totalRecords}</span>
              </div>
              <div className="border-l border-slate-200">
                <span className="text-[9px] text-slate-450 uppercase font-extrabold block">Resguardado %</span>
                <span className="text-lg font-bold text-brand-green block mt-0.5">100%</span>
              </div>
            </div>

            {/* Manual Sync action */}
            <div className="space-y-3">
              <div>
                <h4 className="text-xs font-bold text-slate-700">Respaldo Manual</h4>
                <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                  Realice una copia de seguridad en tránsito inmediata para consolidar los últimos reportes cargados en obra.
                </p>
              </div>

              <button
                onClick={handleManualBackup}
                disabled={isSyncing}
                className="w-full py-3 bg-brand-green hover:bg-brand-green-hover text-white font-semibold text-xs rounded-xl shadow-xs cursor-pointer flex items-center justify-center gap-2 transition-all disabled:opacity-50 hover:scale-[1.01] active:scale-[0.99]"
              >
                <RotateCw className={`h-4.5 w-4.5 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>{isSyncing ? 'Subiendo datos de obra...' : 'Generar Respaldo Ahora'}</span>
              </button>
            </div>

            {/* Automatic toggle bar */}
            <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-2xl mt-4">
              <div>
                <h4 className="text-xs font-bold text-slate-800">Copia de Seguridad Automática</h4>
                <p className="text-[10px] text-slate-450 mt-0.5">Respaldar al cerrar sesión o apagar la app.</p>
              </div>
              <button 
                onClick={() => setAutoBackup(!autoBackup)}
                className="text-slate-600 cursor-pointer transition-colors"
              >
                {autoBackup ? (
                  <ToggleRight className="h-9 w-9 text-brand-green" />
                ) : (
                  <ToggleLeft className="h-9 w-9 text-slate-400" />
                )}
              </button>
            </div>

          </div>
        </div>

        {/* Backup logs history table */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-100 p-6 shadow-xs flex flex-col justify-between" id="sync-history-col">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-xs font-bold text-slate-750 uppercase tracking-wider flex items-center gap-1.5">
                <Server className="h-4 w-4 text-slate-500" />
                <span>Historial de Respaldos de Obra</span>
              </h3>
              <span className="text-[10px] bg-brand-green/10 text-brand-green font-bold px-2.5 py-0.5 rounded-full border border-brand-green/20">
                Seguro
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-[10px] font-extrabold text-slate-450 uppercase tracking-wider pb-2">
                    <th className="py-2">Fecha y Hora</th>
                    <th className="py-2">Tamaño</th>
                    <th className="py-2">Registros</th>
                    <th className="py-2 text-right">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-600">
                  {backupHistory.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-3 flex items-center gap-1.5 text-slate-800 font-semibold">
                        <Calendar className="h-3.5 w-3.5 text-slate-400" />
                        <span>{item.date}</span>
                      </td>
                      <td className="py-3 font-mono">{item.size}</td>
                      <td className="py-3">{item.recordsCount} registros</td>
                      <td className="py-3 text-right">
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-brand-green bg-brand-green/10 px-2 py-0.5 rounded-full border border-brand-green/20">
                          <CheckCircle className="h-3 w-3" />
                          <span>{item.status}</span>
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Technical specification details */}
          <div className="bg-brand-green/5 border border-brand-green/10 rounded-2xl p-4 flex gap-3 text-slate-800 mt-6" id="persistence-technote">
            <Info className="h-5 w-5 text-brand-green shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <h4 className="text-xs font-bold uppercase tracking-wide text-slate-900">Nota Técnica sobre Persistencia</h4>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Este prototipo de <strong className="text-slate-800">EquiBudget</strong> tiene habilitado un almacenamiento local persistente de datos (<strong className="text-slate-800">LocalStorage</strong>). Cualquier cambio que realices en los proyectos, categorías, gastos de viáticos o alertas se almacenará de manera segura en la memoria de su navegador para la siguiente sesión, garantizando que su trabajo de demostración permanezca intacto.
              </p>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
