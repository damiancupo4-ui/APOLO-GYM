import React, { useState } from 'react';
import { Search, User, Calendar, CreditCard, ArrowLeft, DollarSign } from 'lucide-react';
import { Socio } from '../types';

interface BuscarCarnetProps {
  socios: Socio[];
  onNavigateBack: () => void;
}

export const BuscarCarnet: React.FC<BuscarCarnetProps> = ({ socios, onNavigateBack }) => {
  const [carnetBusqueda, setCarnetBusqueda] = useState('');
  const [socioEncontrado, setSocioEncontrado] = useState<Socio | null>(null);
  const [noEncontrado, setNoEncontrado] = useState(false);

  const buscarSocio = () => {
    if (!carnetBusqueda.trim()) return;

    // Limpiar estados anteriores
    setSocioEncontrado(null);
    setNoEncontrado(false);

    const socio = socios.find(s => s.carnet === carnetBusqueda.trim());

    if (socio) {
      setSocioEncontrado(socio);
    } else {
      setNoEncontrado(true);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      buscarSocio();
    }
  };

  const limpiarBusqueda = () => {
    setCarnetBusqueda('');
    setSocioEncontrado(null);
    setNoEncontrado(false);
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <button
          onClick={onNavigateBack}
          className="p-2 text-gray-600 hover:text-gray-800 transition-colors duration-200"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h2 className="text-3xl font-bold text-gray-800">Buscar Carnet</h2>
      </div>

      {/* Búsqueda */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Número de Carnet (ej: 25-001)
            </label>
            <input
              type="text"
              value={carnetBusqueda}
              onChange={(e) => setCarnetBusqueda(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ingrese número de carnet"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
            />
          </div>
          <button
            onClick={buscarSocio}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg flex items-center gap-2 transition-colors duration-200 shadow-md"
          >
            <Search className="w-5 h-5" />
            Buscar
          </button>
          {(socioEncontrado || noEncontrado) && (
            <button
              onClick={limpiarBusqueda}
              className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-lg transition-colors duration-200"
            >
              Limpiar
            </button>
          )}
        </div>
      </div>

      {/* Resultado de búsqueda */}
      {noEncontrado && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <div className="text-red-600 text-lg font-semibold">
            No se encontró ningún socio con el carnet: {carnetBusqueda}
          </div>
        </div>
      )}

      {socioEncontrado && (
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Header del carnet */}
          <div
            className={`p-6 ${
              socioEncontrado.estado === 'vigente'
                ? 'bg-gradient-to-r from-green-500 to-green-600'
                : 'bg-gradient-to-r from-red-500 to-red-600'
            } text-white`}
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-3xl font-bold">APOLO GYM</h3>
                <p className="text-xl opacity-90">Carnet de Socio</p>
              </div>
              <div
                className={`px-4 py-2 rounded-full text-lg font-bold ${
                  socioEncontrado.estado === 'vigente'
                    ? 'bg-green-800 text-green-100'
                    : 'bg-red-800 text-red-100'
                }`}
              >
                {socioEncontrado.estado.toUpperCase()}
              </div>
            </div>
          </div>

          {/* Detalles del socio */}
          <div className="p-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <User className="w-5 h-5 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-600">Número de Carnet</p>
                    <p className="text-xl font-bold text-gray-800">
                      {socioEncontrado.carnet}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <User className="w-5 h-5 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-600">Nombre Completo</p>
                    <p className="text-lg font-semibold text-gray-800">
                      {socioEncontrado.nombreCompleto}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <CreditCard className="w-5 h-5 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-600">DNI</p>
                    <p className="text-lg font-semibold text-gray-800">
                      {socioEncontrado.dni}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-600">Fecha de Inicio</p>
                    <p className="text-lg font-semibold text-gray-800">
                      {new Date(socioEncontrado.fechaInicio).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <CreditCard className="w-5 h-5 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-600">Forma de Pago</p>
                    <p className="text-lg font-semibold text-gray-800 capitalize">
                      {socioEncontrado.formaPago}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <DollarSign className="w-5 h-5 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-600">Monto</p>
                    <p className="text-lg font-semibold text-gray-800">
                      ${socioEncontrado.monto.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Información de vencimiento */}
            <div
              className={`p-4 rounded-lg ${
                socioEncontrado.estado === 'vigente'
                  ? 'bg-green-100 border border-green-300'
                  : 'bg-red-100 border border-red-300'
              }`}
            >
              <p className="text-sm text-gray-600">
                {socioEncontrado.estado === 'vigente'
                  ? 'El pase de este socio está vigente y puede acceder al gimnasio.'
                  : 'El pase de este socio ha vencido. Debe renovar para acceder al gimnasio.'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
