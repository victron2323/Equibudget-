/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Project, Category, Expense, User, Notification, BackupHistory } from '../types';

export const DEFAULT_USERS: User[] = [
  {
    id: 'usr-1',
    name: 'Ing. Víctor Michilena',
    email: 'victormichilena011@gmail.com',
    role: 'admin',
    avatar: 'VM',
    status: 'active'
  },
  {
    id: 'usr-2',
    name: 'Ing. Carlos Mendoza',
    email: 'carlos.mendoza@equibudget.com',
    role: 'collaborator',
    avatar: 'CM',
    status: 'active'
  },
  {
    id: 'usr-3',
    name: 'Diana Rojas (Inspectora)',
    email: 'diana.rojas@equibudget.com',
    role: 'collaborator',
    avatar: 'DR',
    status: 'active'
  }
];

export const DEFAULT_CATEGORIES: Category[] = [
  { id: 'cat-1', name: 'Alimentación', color: '#f97316', icon: 'Utensils' },
  { id: 'cat-2', name: 'Hospedaje', color: '#a855f7', icon: 'Hotel' },
  { id: 'cat-3', name: 'Transporte', color: '#3b82f6', icon: 'Bus' },
  { id: 'cat-4', name: 'Combustible', color: '#0ea5e9', icon: 'Fuel' },
  { id: 'cat-5', name: 'Peajes', color: '#f59e0b', icon: 'MapPin' },
  { id: 'cat-6', name: 'Parqueaderos', color: '#64748b', icon: 'SquarePark' },
  { id: 'cat-7', name: 'Materiales', color: '#10b981', icon: 'Package' },
  { id: 'cat-8', name: 'Herramientas', color: '#6366f1', icon: 'Wrench' },
  { id: 'cat-9', name: 'Compras menores', color: '#ec4899', icon: 'ShoppingBag' },
  { id: 'cat-10', name: 'Logística', color: '#14b8a6', icon: 'Truck' },
  { id: 'cat-11', name: 'Otros', color: '#94a3b8', icon: 'Coins' }
];

export const DEFAULT_PROJECTS: Project[] = [
  {
    id: 'prj-1',
    name: 'Montaje Electromecánico Subestación Delta',
    client: 'Iberdrola S.A.',
    startDate: '2026-06-01',
    endDate: '2026-08-31',
    budget: 45000,
    status: 'Activo',
    description: 'Instalación de pórticos, transformadores de potencia y celdas de media tensión.'
  },
  {
    id: 'prj-2',
    name: 'Estudio de Suelos Línea de Transmisión Sur',
    client: 'Interconexión Eléctrica ISA',
    startDate: '2026-07-01',
    endDate: '2026-07-15',
    budget: 6200,
    status: 'Activo',
    description: 'Sondeos geotécnicos y ensayos de laboratorio para fundaciones de torres 12 a 45.'
  },
  {
    id: 'prj-3',
    name: 'Optimización Planta de Tratamiento de Aguas',
    client: 'Consorcio Acuasan',
    startDate: '2026-04-10',
    endDate: '2026-06-30',
    budget: 15500,
    status: 'Finalizado',
    description: 'Automatización del sistema de dosificación de cloro y calibración de caudalímetros.'
  },
  {
    id: 'prj-4',
    name: 'Cimentación Parque Eólico WindTech',
    client: 'WindTech Energía S.A.',
    startDate: '2026-07-10',
    endDate: '2026-11-30',
    budget: 80000,
    status: 'Activo',
    description: 'Vaciado de concreto ciclópeo para base de aerogeneradores T1, T2 y T3.'
  },
  {
    id: 'prj-5',
    name: 'Revisión Red Eléctrica Túnel de Oriente',
    client: 'Gobernación Departamental',
    startDate: '2026-08-01',
    endDate: '2026-09-15',
    budget: 12000,
    status: 'Suspendido',
    description: 'Inspección de luminarias y cables de potencia por filtraciones de humedad.'
  }
];

export const DEFAULT_EXPENSES: Expense[] = [
  {
    id: 'exp-1',
    projectId: 'prj-1',
    date: '2026-07-01',
    person: 'Ing. Carlos Mendoza',
    category: 'Hospedaje',
    description: 'Estadía de 4 técnicos - Hotel El Campestre',
    value: 1200,
    paymentMethod: 'Transferencia',
    invoiceNumber: 'FAC-2026-8841',
    attachments: [
      { id: 'att-1', name: 'hotel_campestre.png', type: 'image', url: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=300&q=80' }
    ],
    observations: 'Se incluye desayuno para el equipo. Excelente servicio.'
  },
  {
    id: 'exp-2',
    projectId: 'prj-1',
    date: '2026-07-02',
    person: 'Ing. Carlos Mendoza',
    category: 'Combustible',
    description: 'Tanqueo camioneta Toyota Hilux TX - Primax',
    value: 185,
    paymentMethod: 'Tarjeta de Crédito',
    invoiceNumber: 'GAS-449102',
    attachments: [
      { id: 'att-2', name: 'recibo_gasolina.png', type: 'image', url: 'https://images.unsplash.com/photo-1527018601619-a508a2be00cd?auto=format&fit=crop&w=300&q=80' }
    ],
    observations: 'Kilometraje registrado: 120,450 km.'
  },
  {
    id: 'exp-3',
    projectId: 'prj-2',
    date: '2026-07-03',
    person: 'Diana Rojas (Inspectora)',
    category: 'Alimentación',
    description: 'Almuerzo equipo de perforación - El Carbón y Sazón',
    value: 145,
    paymentMethod: 'Efectivo',
    invoiceNumber: 'POS-0091482',
    attachments: [],
    observations: 'Almuerzo para 5 personas de la cuadrilla.'
  },
  {
    id: 'exp-4',
    projectId: 'prj-2',
    date: '2026-07-04',
    person: 'Diana Rojas (Inspectora)',
    category: 'Herramientas',
    description: 'Broca diamantada 3 pulgadas - Sodimac Constructor',
    value: 650,
    paymentMethod: 'Tarjeta de Crédito',
    invoiceNumber: 'FAC-991204',
    attachments: [
      { id: 'att-3', name: 'factura_sodimac.png', type: 'image', url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=300&q=80' }
    ],
    observations: 'Reemplazo de broca dañada en sondeo número 4.'
  },
  {
    id: 'exp-5',
    projectId: 'prj-1',
    date: '2026-07-05',
    person: 'Ing. Carlos Mendoza',
    category: 'Materiales',
    description: 'Pernos de anclaje de alta resistencia - Ferretería Industrial',
    value: 3400,
    paymentMethod: 'Transferencia',
    invoiceNumber: 'FAC-11029',
    attachments: [
      { id: 'att-4', name: 'comprobante_banco.png', type: 'image', url: 'https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?auto=format&fit=crop&w=300&q=80' }
    ],
    observations: 'Adquisición de pernos grado 8 autorizados por interventoría.'
  },
  {
    id: 'exp-6',
    projectId: 'prj-3',
    date: '2026-06-15',
    person: 'Diana Rojas (Inspectora)',
    category: 'Peajes',
    description: 'Peaje Autopista Central - Telepeaje Flypass',
    value: 45,
    paymentMethod: 'Efectivo',
    invoiceNumber: 'PEA-99238',
    attachments: [],
    observations: 'Desplazamiento a planta para pruebas de caudal.'
  },
  {
    id: 'exp-7',
    projectId: 'prj-2',
    date: '2026-07-06',
    person: 'Diana Rojas (Inspectora)',
    category: 'Hospedaje',
    description: 'Albergue rural para ayudantes de campo - Cabañas del Valle',
    value: 4800,
    paymentMethod: 'Transferencia',
    invoiceNumber: 'FAC-123',
    attachments: [],
    observations: 'Alojamiento para 6 ayudantes durante 8 noches. Alerta: ¡Esto consume gran parte del presupuesto de este proyecto!'
  },
  {
    id: 'exp-8',
    projectId: 'prj-4',
    date: '2026-07-06',
    person: 'Ing. Carlos Mendoza',
    category: 'Logística',
    description: 'Alquiler de mezcladora de concreto - RentaEquipos Ltda',
    value: 2800,
    paymentMethod: 'Transferencia',
    invoiceNumber: 'FAC-55204',
    attachments: [
      { id: 'att-5', name: 'mezcladora.png', type: 'image', url: 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&w=300&q=80' }
    ],
    observations: 'Alquiler semanal para vaciado de bases de aerogeneradores.'
  }
];

export const DEFAULT_NOTIFICATIONS = (projects: Project[], expenses: Expense[]): Notification[] => {
  return [
    {
      id: 'not-1',
      type: 'budget_low',
      title: 'Presupuesto por debajo del 20%',
      message: 'El proyecto "Estudio de Suelos Línea de Transmisión Sur" ha consumido el 90.2% de su fondo. Saldo disponible: $605.',
      date: '2026-07-06T14:30:00Z',
      read: false,
      projectId: 'prj-2'
    },
    {
      id: 'not-2',
      type: 'project_end',
      title: 'Proyecto próximo a finalizar',
      message: 'El proyecto "Estudio de Suelos Línea de Transmisión Sur" finaliza el 15 de julio (en 8 días). Prepare el informe de liquidación.',
      date: '2026-07-07T08:00:00Z',
      read: false,
      projectId: 'prj-2'
    },
    {
      id: 'not-3',
      type: 'missing_invoice',
      title: 'Factura pendiente de subir',
      message: 'El gasto registrado por Diana Rojas "Albergue rural para ayudantes de campo" ($4,800) no tiene ningún comprobante adjunto.',
      date: '2026-07-06T18:00:00Z',
      read: false,
      projectId: 'prj-2',
      expenseId: 'exp-7'
    },
    {
      id: 'not-4',
      type: 'system',
      title: 'Sincronización en la nube exitosa',
      message: 'Se ha realizado el respaldo diario automático en la nube. 5 proyectos y 8 gastos asegurados.',
      date: '2026-07-07T01:00:00Z',
      read: true
    }
  ];
};

export const MOCK_BACKUP_HISTORY: BackupHistory[] = [
  { id: 'b-1', date: '2026-07-07 01:00', size: '14.8 KB', recordsCount: 13, status: 'Completado' },
  { id: 'b-2', date: '2026-07-06 01:00', size: '13.2 KB', recordsCount: 11, status: 'Completado' },
  { id: 'b-3', date: '2026-07-05 01:00', size: '12.9 KB', recordsCount: 10, status: 'Completado' },
  { id: 'b-4', date: '2026-07-04 01:00', size: '9.4 KB', recordsCount: 8, status: 'Completado' },
];
