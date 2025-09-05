import { useState, useEffect } from 'react';
import { DatosGimnasio, Socio, Retiro, Gasto, Ingreso } from '../types';
import { loadData, saveData, generarNumeroCarnet, generarNumeroRetiro } from '../utils/localStorage';

export const useGymData = () => {
  const [data, setData] = useState<DatosGimnasio>({
    socios: [],
    retiros: [],
    gastos: [],
    ingresos: [],
    turnos: [],
    contadores: {
      carnet: 1,
      retiro: 1,
    },
  });
  const [isLoading, setIsLoading] = useState(true);

  // Cargar datos al inicializar
  useEffect(() => {
    const initializeData = async () => {
      try {
        const loadedData = await loadData();
        setData(loadedData);
      } catch (error) {
        console.error('Error inicializando datos:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeData();
  }, []);

  // Guardar datos cuando cambien
  useEffect(() => {
    if (!isLoading) {
      saveData(data);
    }
  }, [data]);

  const addSocio = (socioData: Omit<Socio, 'id' | 'carnet' | 'estado'>) => {
    const nuevoSocio: Socio = {
      id: crypto.randomUUID(),
      carnet: generarNumeroCarnet(data.contadores.carnet),
      estado: 'vigente', // Se calculará automáticamente al cargar
      ...socioData,
    };

    setData(prev => ({
      ...prev,
      socios: [...prev.socios, nuevoSocio],
      contadores: {
        ...prev.contadores,
        carnet: prev.contadores.carnet + 1,
      },
    }));
  };

  const addIngreso = (ingresoData: Omit<Ingreso, 'id'>) => {
    const nuevoIngreso: Ingreso = {
      id: crypto.randomUUID(),
      ...ingresoData,
    };

    setData(prev => ({
      ...prev,
      ingresos: [...prev.ingresos, nuevoIngreso],
    }));
  };
  const addRetiro = (retiroData: Omit<Retiro, 'id' | 'numero'>) => {
    const nuevoRetiro: Retiro = {
      id: crypto.randomUUID(),
      numero: generarNumeroRetiro(data.contadores.retiro),
      ...retiroData,
    };

    setData(prev => ({
      ...prev,
      retiros: [...prev.retiros, nuevoRetiro],
      contadores: {
        ...prev.contadores,
        retiro: prev.contadores.retiro + 1,
      },
    }));
  };

  const addGasto = (gastoData: Omit<Gasto, 'id'>) => {
    const nuevoGasto: Gasto = {
      id: crypto.randomUUID(),
      ...gastoData,
    };

    setData(prev => ({
      ...prev,
      gastos: [...prev.gastos, nuevoGasto],
    }));
  };

  const iniciarTurno = (usuario: string, montoInicial: number) => {
    const nuevoTurno = {
      id: crypto.randomUUID(),
      usuario,
      fechaInicio: new Date().toISOString(),
      montoInicial,
      cerrado: false,
    };

    setData(prev => ({
      ...prev,
      turnos: [...prev.turnos, nuevoTurno],
    }));
  };

  const cerrarTurno = (montoFinal: number) => {
    setData(prev => {
      const turnos = prev.turnos.map(turno => {
        if (!turno.cerrado) {
          return {
            ...turno,
            fechaFin: new Date().toISOString(),
            montoFinal,
            recaudacion: montoFinal - turno.montoInicial,
            cerrado: true,
          };
        }
        return turno;
      });

      return { ...prev, turnos };
    });
  };

  return {
    data,
    isLoading,
    addSocio,
    addIngreso,
    addRetiro,
    addGasto,
    iniciarTurno,
    cerrarTurno,
  };
};