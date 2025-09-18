import { DatosGimnasio, Socio } from '../types';

const STORAGE_KEY = 'apolo-gym-data';

const defaultData: DatosGimnasio = {
  socios: [],
  retiros: [],
  gastos: [],
  ingresos: [],
  turnos: [],
  contadores: {
    carnet: 1,
    retiro: 1,
  },
};

export const loadData = (): DatosGimnasio => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return defaultData;
    
    const parsedData = JSON.parse(data);
    
    // Actualizar estado de socios al cargar
    if (parsedData.socios) {
      parsedData.socios = parsedData.socios.map((socio: Socio) => ({
        ...socio,
        estado: calcularEstadoSocio(socio.fechaInicio),
      }));
    }
    
    return { ...defaultData, ...parsedData };
  } catch (error) {
    console.error('Error loading data:', error);
    return defaultData;
  }
};

export const saveData = (data: DatosGimnasio): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Error saving data:', error);
  }
};

export const calcularEstadoSocio = (fechaInicio: string): 'vigente' | 'vencido' => {
  const inicio = new Date(fechaInicio);
  const ahora = new Date();
  const unMesEnMs = 30 * 24 * 60 * 60 * 1000; // 30 días
  
  return (ahora.getTime() - inicio.getTime()) > unMesEnMs ? 'vencido' : 'vigente';
};

export const generarNumeroCarnet = (contador: number): string => {
  const año = new Date().getFullYear().toString().slice(-2);
  const numero = contador.toString().padStart(3, '0');
  return `${año}-${numero}`;
};

export const generarNumeroRetiro = (contador: number): string => {
  return contador.toString().padStart(3, '0');
};