export interface Socio {
  id: string;
  carnet: string;
  nombreCompleto: string;
  dni: string;
  fechaInicio: string;
  formaPago: 'efectivo' | 'transferencia';
  monto: number;
  estado: 'vigente' | 'vencido';
}

export interface Retiro {
  id: string;
  numero: string;
  monto: number;
  fecha: string;
  descripcion?: string;
}

export interface Gasto {
  id: string;
  monto: number;
  proveedor: string;
  motivo: string;
  remito: string;
  fecha: string;
}

export interface Ingreso {
  id: string;
  carnet: string;
  nombreSocio: string;
  monto: number;
  formaPago: 'efectivo' | 'transferencia';
  fecha: string;
}

export interface Turno {
  id: string;
  usuario: string;
  fechaInicio: string;
  fechaFin?: string;
  montoInicial: number;
  montoFinal?: number;
  recaudacion?: number;
  cerrado: boolean;
}

export interface DatosGimnasio {
  socios: Socio[];
  retiros: Retiro[];
  gastos: Gasto[];
  ingresos: Ingreso[];
  turnos: Turno[];
  contadores: {
    carnet: number;
    retiro: number;
  };
}