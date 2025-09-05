import { DatosGimnasio, Socio } from '../types';

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

// Verificar si estamos en Electron
const isElectron = () => {
  return typeof window !== 'undefined' && window.electronAPI;
};

export const loadData = async (): Promise<DatosGimnasio> => {
  try {
    if (isElectron()) {
      // Cargar desde archivo en Electron
      const data = await window.electronAPI.loadGymData();
      if (data) {
        // Actualizar estado de socios al cargar
        if (data.socios) {
          data.socios = data.socios.map((socio: Socio) => ({
            ...socio,
            estado: calcularEstadoSocio(socio.fechaInicio),
          }));
        }
        return { ...defaultData, ...data };
      }
      return defaultData;
    } else {
      // Fallback a localStorage para desarrollo web
      const data = localStorage.getItem('apolo-gym-data');
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
    }
  } catch (error) {
    console.error('Error loading data:', error);
    return defaultData;
  }
};

export const saveData = async (data: DatosGimnasio): Promise<void> => {
  try {
    if (isElectron()) {
      // Guardar en archivo en Electron
      const success = await window.electronAPI.saveGymData(data);
      if (!success) {
        console.error('Error guardando datos en archivo');
      }
    } else {
      // Fallback a localStorage para desarrollo web
      localStorage.setItem('apolo-gym-data', JSON.stringify(data));
    }
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

// Función para obtener la ruta donde se guardan los datos (solo en Electron)
export const getDataPath = async (): Promise<string | null> => {
  if (isElectron()) {
    try {
      return await window.electronAPI.getDataPath();
    } catch (error) {
      console.error('Error obteniendo ruta de datos:', error);
      return null;
    }
  }
  return null;
};