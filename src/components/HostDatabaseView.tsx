/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { DEFAULT_USERS } from '../data/initialData';
import { 
  Database, 
  Server, 
  Mail, 
  Key, 
  Shield, 
  UserPlus, 
  UserMinus, 
  UserX, 
  Trash2, 
  Settings, 
  Terminal, 
  Check, 
  X, 
  Lock, 
  Plus, 
  Search, 
  AlertCircle, 
  Edit3, 
  Save,
  RotateCw,
  Info,
  ShieldCheck,
  UserCheck,
  User as UserIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function HostDatabaseView() {
  // Load users from localStorage or default users
  const [users, setUsers] = useState<User[]>(() => {
    try {
      const saved = localStorage.getItem('equibudget_users_list');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.error("Error loading users from host list", e);
    }
    return DEFAULT_USERS;
  });

  // Sync back to localStorage
  useEffect(() => {
    localStorage.setItem('equibudget_users_list', JSON.stringify(users));
  }, [users]);

  // Form states for creating/editing users
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  // Form inputs
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPassword, setFormPassword] = useState('');
  const [formRole, setFormRole] = useState<UserRole>('collaborator');
  const [formStatus, setFormStatus] = useState<'active' | 'inactive'>('active');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Server console logs state
  const [serverLogs, setServerLogs] = useState<string[]>(() => [
    `[${new Date().toLocaleTimeString()}] [SYSTEM] Conectando con Host LocalStorage en el navegador...`,
    `[${new Date().toLocaleTimeString()}] [SYSTEM] Dirección base: host://browser.local/equibudget_users_list`,
    `[${new Date().toLocaleTimeString()}] [DATABASE] Cuentas de usuario cargadas con éxito. Registros encontrados: ${users.length}`,
    `[${new Date().toLocaleTimeString()}] [AUTH] Consola de administración inicializada en modo seguro.`
  ]);

  // Add a log helper
  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setServerLogs(prev => [`[${timestamp}] ${message}`, ...prev.slice(0, 49)]);
  };

  // Open add user form
  const handleOpenAdd = () => {
    setEditingUser(null);
    setFormName('');
    setFormEmail('');
    setFormPassword('');
    setFormRole('collaborator');
    setFormStatus('active');
    setError('');
    setSuccess('');
    setShowAddForm(true);
  };

  // Open edit user form
  const handleOpenEdit = (user: User) => {
    setEditingUser(user);
    setFormName(user.name);
    setFormEmail(user.email);
    setFormPassword(user.password || 'password123');
    setFormRole(user.role);
    setFormStatus(user.status);
    setError('');
    setSuccess('');
    setShowAddForm(true);
  };

  // Submit new or edited user
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formName.trim() || !formEmail.trim() || !formPassword) {
      setError('Por favor complete todos los campos.');
      return;
    }

    if (!formEmail.includes('@')) {
      setError('El correo electrónico no es válido.');
      return;
    }

    // Check duplicate email (if new user or email changed)
    const emailLower = formEmail.toLowerCase().trim();
    const isDuplicate = users.some(u => 
      u.email.toLowerCase() === emailLower && (!editingUser || editingUser.id !== u.id)
    );

    if (isDuplicate) {
      setError('Este correo electrónico ya está registrado en el Host.');
      return;
    }

    const names = formName.trim().split(' ');
    const avatar = names.length > 1 
      ? (names[0].charAt(0) + names[1].charAt(0)).toUpperCase() 
      : names[0].charAt(0).toUpperCase();

    if (editingUser) {
      // Edit mode
      setUsers(prev => prev.map(u => u.id === editingUser.id ? {
        ...u,
        name: formName.trim(),
        email: emailLower,
        password: formPassword,
        role: formRole,
        status: formStatus,
        avatar
      } : u));

      addLog(`[DATABASE] Usuario editado: ${emailLower} (${formRole.toUpperCase()})`);
      setSuccess('Usuario actualizado con éxito.');
    } else {
      // Create mode
      const newUser: User = {
        id: `usr-${Date.now()}`,
        name: formName.trim(),
        email: emailLower,
        password: formPassword,
        role: formRole,
        status: formStatus,
        avatar
      };

      setUsers(prev => [...prev, newUser]);
      addLog(`[DATABASE] Nuevo usuario creado en el Host: ${emailLower} (${formRole.toUpperCase()})`);
      setSuccess('Usuario registrado con éxito.');
    }

    // Reset and close after a brief delay
    setTimeout(() => {
      setShowAddForm(false);
      setEditingUser(null);
      setError('');
      setSuccess('');
    }, 1000);
  };

  // Delete user
  const handleDelete = (userId: string, email: string) => {
    // Prevent deleting the currently loaded user from general list (though they can logout)
    const sessionUser = localStorage.getItem('equibudget_user');
    if (sessionUser) {
      const parsed = JSON.parse(sessionUser);
      if (parsed.id === userId) {
        addLog(`[WARN] Se denegó la eliminación del usuario con sesión activa en este navegador: ${email}`);
        alert('No puedes eliminar tu propio usuario mientras tienes la sesión iniciada.');
        return;
      }
    }

    if (window.confirm(`¿Está seguro de que desea eliminar permanentemente al usuario ${email} del Host de Base de Datos?`)) {
      setUsers(prev => prev.filter(u => u.id !== userId));
      addLog(`[DATABASE] Registro eliminado permanentemente: ${email}`);
    }
  };

  // Toggle role directly
  const handleToggleRole = (user: User) => {
    const nextRole: UserRole = user.role === 'admin' ? 'collaborator' : 'admin';
    setUsers(prev => prev.map(u => u.id === user.id ? { ...u, role: nextRole } : u));
    addLog(`[DATABASE] Cambio de rol para ${user.email}: ${user.role} -> ${nextRole}`);
  };

  // Seed default data
  const handleResetToDefault = () => {
    if (window.confirm('¿Deseas restablecer la lista de usuarios del Host a la configuración de fábrica? Se perderán los usuarios creados manualmente.')) {
      setUsers(DEFAULT_USERS);
      addLog('[DATABASE] Base de datos de usuarios restaurada a los valores predeterminados (DEFAULT_USERS).');
    }
  };

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6" id="host-database-view-wrapper">
      
      {/* Upper banner indicating host location and context */}
      <div className="bg-slate-900 rounded-3xl p-6 text-white border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden" id="host-banner">
        <div className="absolute top-0 right-0 w-80 h-full bg-linear-to-l from-brand-green/10 to-transparent pointer-events-none rounded-r-3xl" />
        <div className="space-y-2 z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-brand-green/10 border border-brand-green/20 rounded-xl text-brand-green text-[11px] font-bold">
            <Server className="h-3.5 w-3.5 text-brand-green" />
            <span>Host de Persistencia Local</span>
          </div>
          <h2 className="text-2xl font-extrabold font-display tracking-tight text-white">
            Consola del Host de Base de Datos
          </h2>
          <p className="text-xs text-slate-400 max-w-xl leading-relaxed">
            Los datos se almacenan en el <strong className="text-brand-green">LocalStorage</strong> de su navegador en la clave <code className="bg-slate-800 text-brand-green px-1 py-0.5 rounded text-[10px]">equibudget_users_list</code>. Este panel proporciona acceso completo de administrador ("Root Host") para gestionar accesos, verificar contraseñas en texto claro y auditar las cuentas registradas.
          </p>
        </div>

        <div className="flex gap-2.5 shrink-0 z-10">
          <button
            onClick={handleResetToDefault}
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 hover:border-slate-650 font-semibold text-xs rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
            title="Restaurar de fábrica"
          >
            <RotateCw className="h-4 w-4 text-brand-green" />
            <span>Restablecer de Fábrica</span>
          </button>
          
          <button
            onClick={handleOpenAdd}
            className="px-4 py-2.5 bg-brand-green hover:bg-brand-green-hover text-white font-semibold text-xs rounded-xl transition-all cursor-pointer shadow-xs flex items-center gap-1.5 hover:scale-[1.01] active:scale-[0.99]"
          >
            <UserPlus className="h-4 w-4" />
            <span>Registrar Usuario en Host</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="host-db-layout-grid">
        
        {/* Left Column: Accounts Directory Table */}
        <div className="lg:col-span-2 space-y-4" id="host-accounts-directory">
          <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-xs space-y-4">
            
            {/* Filter and Search controls */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3" id="host-filters-row">
              <div>
                <h3 className="text-sm font-bold font-display text-slate-800">Cuentas Registradas en el Sistema</h3>
                <p className="text-[10px] text-slate-400">Listado interactivo de correos e información de seguridad</p>
              </div>

              <div className="relative w-full sm:w-64">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Buscar por correo o nombre..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-brand-green transition-colors"
                />
              </div>
            </div>

            {/* Main Accounts Table */}
            <div className="overflow-x-auto" id="host-accounts-table-container">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    <th className="py-3 px-3">Usuario</th>
                    <th className="py-3 px-3">Correo del Host</th>
                    <th className="py-3 px-3">Rol / Permisos</th>
                    <th className="py-3 px-3">Contraseña</th>
                    <th className="py-3 px-3 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 text-xs">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-slate-400 italic">
                        No se encontraron cuentas que coincidan con la búsqueda.
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((user) => (
                      <tr 
                        key={user.id} 
                        className="hover:bg-slate-50/50 transition-colors"
                        id={`user-host-row-${user.id}`}
                      >
                        {/* Column 1: User details */}
                        <td className="py-3.5 px-3">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-brand-green/10 text-brand-green font-bold flex items-center justify-center border border-brand-green/20 shrink-0">
                              {user.avatar || user.name.substring(0, 2).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <p className="font-bold text-slate-800 truncate max-w-[140px]">{user.name}</p>
                              <span className={`inline-flex items-center gap-0.5 text-[9px] font-bold px-1.5 py-0.25 rounded-md mt-0.5 ${
                                user.status === 'active' 
                                  ? 'bg-brand-green/10 text-brand-green' 
                                  : 'bg-slate-100 text-slate-500'
                              }`}>
                                <span className={`w-1 h-1 rounded-full ${user.status === 'active' ? 'bg-brand-green' : 'bg-slate-400'}`} />
                                {user.status === 'active' ? 'Activo' : 'Inactivo'}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Column 2: Registered Email */}
                        <td className="py-3.5 px-3 text-slate-600 font-mono text-[11px] truncate max-w-[160px]">
                          <div className="flex items-center gap-1.5">
                            <Mail className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                            <span className="truncate">{user.email}</span>
                          </div>
                        </td>

                        {/* Column 3: Role / Permissions */}
                        <td className="py-3.5 px-3">
                          <button
                            onClick={() => handleToggleRole(user)}
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold border transition-colors cursor-pointer shrink-0 ${
                              user.role === 'admin'
                                ? 'bg-brand-green/10 text-brand-green border-brand-green/20 hover:bg-brand-green/20'
                                : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                            }`}
                            title="Haz clic para cambiar de rol"
                          >
                            {user.role === 'admin' ? (
                              <>
                                <Shield className="h-3 w-3 text-brand-green" />
                                <span>Coordinador</span>
                              </>
                            ) : (
                              <>
                                <UserIcon className="h-3 w-3 text-slate-400" />
                                <span>Colaborador</span>
                              </>
                            )}
                          </button>
                        </td>

                        {/* Column 4: Password (Plaintext mock for debug) */}
                        <td className="py-3.5 px-3 text-slate-700 font-mono text-[11px]">
                          <div className="flex items-center gap-1 text-slate-700">
                            <Key className="h-3 w-3 text-amber-500 shrink-0" />
                            <span>{user.password || 'password123'}</span>
                          </div>
                        </td>

                        {/* Column 5: Action buttons */}
                        <td className="py-3.5 px-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleOpenEdit(user)}
                              className="p-1.5 text-slate-400 hover:text-brand-green hover:bg-slate-100 rounded-lg transition-all cursor-pointer"
                              title="Editar usuario"
                            >
                              <Edit3 className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => handleDelete(user.id, user.email)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all cursor-pointer"
                              title="Eliminar usuario permanentemente"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </td>

                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

          </div>
        </div>

        {/* Right Column: Console Terminal / Form Panel */}
        <div className="space-y-4" id="host-db-side-controls">
          
          {/* Animate Form Container */}
          <AnimatePresence mode="wait">
            {showAddForm && (
              <motion.div
                initial={{ opacity: 0, y: -15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="bg-white rounded-2xl border border-brand-green/20 p-5 shadow-sm space-y-4"
                id="host-user-form-panel"
              >
                <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                    <Database className="h-4 w-4 text-brand-green" />
                    <span>{editingUser ? 'Modificar Registro' : 'Nuevo Registro de Host'}</span>
                  </h4>
                  <button
                    onClick={() => {
                      setShowAddForm(false);
                      setEditingUser(null);
                    }}
                    className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-3.5" id="host-register-form">
                  {error && (
                    <div className="p-2.5 bg-rose-50 border border-rose-100 rounded-xl text-rose-700 text-[10px] flex items-center gap-1.5">
                      <AlertCircle className="h-3.5 w-3.5 shrink-0 text-rose-500" />
                      <span className="font-medium">{error}</span>
                    </div>
                  )}

                  {success && (
                    <div className="p-2.5 bg-brand-green/10 border border-brand-green/20 rounded-xl text-brand-green text-[10px] flex items-center gap-1.5">
                      <Check className="h-3.5 w-3.5 shrink-0 text-brand-green" />
                      <span className="font-semibold">{success}</span>
                    </div>
                  )}

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1">
                      Nombre Completo
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ej. Ing. Víctor Michilena"
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-green/10 focus:border-brand-green transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1">
                      Correo Electrónico (Host Log-In)
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="ejemplo@correo.com"
                      value={formEmail}
                      onChange={(e) => setFormEmail(e.target.value)}
                      className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-green/10 focus:border-brand-green transition-all font-mono"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1">
                        Contraseña Host
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Min. 6 caracteres"
                        value={formPassword}
                        onChange={(e) => setFormPassword(e.target.value)}
                        className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-green/10 focus:border-brand-green transition-all font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1">
                        Estado
                      </label>
                      <select
                        value={formStatus}
                        onChange={(e) => setFormStatus(e.target.value as any)}
                        className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-green/10 focus:border-brand-green transition-all cursor-pointer"
                      >
                        <option value="active">Activo</option>
                        <option value="inactive">Inactivo</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1">
                      Rol de Permisos
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setFormRole('collaborator')}
                        className={`py-2 px-2 rounded-xl border text-[11px] font-bold transition-all cursor-pointer ${
                          formRole === 'collaborator'
                            ? 'bg-brand-green/10 text-brand-green border-brand-green/20'
                            : 'bg-slate-50 text-slate-500 border-slate-200 hover:border-slate-350'
                        }`}
                      >
                        Colaborador
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormRole('admin')}
                        className={`py-2 px-2 rounded-xl border text-[11px] font-bold transition-all cursor-pointer ${
                          formRole === 'admin'
                            ? 'bg-brand-green/10 text-brand-green border-brand-green/20'
                            : 'bg-slate-50 text-slate-500 border-slate-200 hover:border-slate-350'
                        }`}
                      >
                        Coordinador
                      </button>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setShowAddForm(false);
                        setEditingUser(null);
                      }}
                      className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl cursor-pointer transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-2 bg-brand-green hover:bg-brand-green-hover text-white font-semibold text-xs rounded-xl cursor-pointer transition-colors shadow-xs"
                    >
                      {editingUser ? 'Guardar Cambios' : 'Registrar'}
                    </button>
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Real-time Server Terminal Logs */}
          <div className="bg-slate-950 text-slate-200 rounded-2xl p-5 shadow-lg border border-slate-800 space-y-3 font-mono" id="host-terminal-logs">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center gap-2">
                <Terminal className="h-4 w-4 text-brand-green shrink-0" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-300">Consola de Servidor (Host logs)</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-brand-green animate-pulse" />
                <span className="text-[9px] text-slate-400 font-bold">ONLINE</span>
              </div>
            </div>

            <div className="space-y-1.5 max-h-48 overflow-y-auto text-[10px] leading-relaxed custom-scrollbar text-brand-green/90">
              {serverLogs.map((log, idx) => (
                <div key={idx} className="truncate">
                  <span className="text-slate-500 select-none">&gt;&gt;</span> {log}
                </div>
              ))}
            </div>
            
            <div className="pt-2 text-[9px] text-slate-500 border-t border-slate-900 text-center">
              Fin de los registros recientes de seguridad y login.
            </div>
          </div>

          {/* Persistent security overview */}
          <div className="bg-brand-green/5 border border-brand-green/10 rounded-2xl p-4 flex gap-3 text-slate-800" id="security-notice-panel">
            <Info className="h-5 w-5 text-brand-green shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <h4 className="text-xs font-bold uppercase tracking-wide text-slate-900">Seguridad & Datos de Acceso</h4>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Dado que los registros de correo electrónico se guardan en el Host de su propio navegador, puedes ingresar con cualquiera de las cuentas de arriba utilizando la contraseña especificada en la columna <strong>Contraseña</strong>. Los cambios de privilegios (de Colaborador a Coordinador) se aplican de inmediato en la sesión.
              </p>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
