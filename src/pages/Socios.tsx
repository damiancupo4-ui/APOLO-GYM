import React, { useState } from 'react';
import { Plus, User, Calendar, CreditCard, DollarSign, Eye } from 'lucide-react';
import { Socio } from '../types';
import { calcularEstadoSocio, generarNumeroCarnet } from '../utils/localStorage';

interface SociosProps {
  socios: Socio[];
  onAddSocio: (socio: Omit<Socio, 'id' | 'carnet' | 'estado'>) => void;
  contadorCarnet: number;
  onNavigateToCarnet: (carnet: string) => void;
}

export const Socios: React.FC<SociosProps> = ({ 
  socios, 
  onAddSocio, 
  contadorCarnet,
  onNavigateToCarnet 
}) => {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    nombreCompleto: '',
    dni: '',
    fechaInicio: new Date().toISOString().split('T')[0],
    formaPago: 'efectivo' as 'efectivo' | 'transferencia',
    monto: 30000,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nombreCompleto || !formData.dni) {
      alert('Por favor complete todos los campos obligatorios');
      return;
    }

    onAddSocio(formData);
    setFormData({
      nombreCompleto: '',
      dni: '',
      fechaInicio: new Date().toISOString().split('T')[0],
      formaPago: 'efectivo',
      monto: 30000,
    });
    setShowForm(false);
  };

  const sociosOrdenados = [...socios].sort((a, b) => b.carnet.localeCompare(a.carnet));

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-gray-800">Gestión de Socios</h2>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition-colors duration-200 shadow-md"
        >
          <Plus className="w-5 h-5" />
          Nuevo Socio
        </button>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center gap-3">
            <User className="w-8 h-8 text-blue-600" />
            <div>
              <p className="text-sm text-gray-600">Total Socios</p>
              <p className="text-2xl font-bold text-gray-800">{socios.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center gap-3">
            <Calendar className="w-8 h-8 text-green-600" />
            <div>
              <p className="text-sm text-gray-600">Socios Vigentes</p>
              <p className="text-2xl font-bold text-gray-800">
                {socios.filter(s => s.estado === 'vigente').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center gap-3">
            <DollarSign className="w-8 h-8 text-yellow-600" />
            <div>
              <p className="text-sm text-gray-600">Próximo Carnet</p>
              <p className="text-2xl font-bold text-gray-800">
                {generarNumeroCarnet(contadorCarnet)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Formulario Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full mx-4">
            <h3 className="text-2xl font-bold text-gray-800 mb-6">Nuevo Socio</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre Completo *
                </label>
                <input
                  type="text"
                  value={formData.nombreCompleto}
                  onChange={(e) => setFormData({ ...formData, nombreCompleto: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  DNI *
                </label>
                <input
                  type="text"
                  value={formData.dni}
                  onChange={(e) => setFormData({ ...formData, dni: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fecha de Inicio
                </label>
                <input
                  type="date"
                  value={formData.fechaInicio}
                  onChange={(e) => setFormData({ ...formData, fechaInicio: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Forma de Pago
                </label>
                <select
                  value={formData.formaPago}
                  onChange={(e) => setFormData({ ...formData, formaPago: e.target.value as 'efectivo' | 'transferencia' })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="efectivo">Efectivo</option>
                  <option value="transferencia">Transferencia</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Monto
                </label>
                <input
                  type="number"
                  value={formData.monto}
                  onChange={(e) => setFormData({ ...formData, monto: Number(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors duration-200"
                >
                  Crear Socio
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 py-2 px-4 rounded-lg transition-colors duration-200"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Lista de Carnets */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-6">Carnets de Socios</h3>
        
        {socios.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <User className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p className="text-lg">No hay socios registrados</p>
            <p className="text-sm">Haz clic en "Nuevo Socio" para comenzar</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sociosOrdenados.map((socio) => (
              <div
                key={socio.id}
                className={`border-2 rounded-lg p-6 transition-all duration-200 hover:shadow-lg cursor-pointer ${
                  socio.estado === 'vigente'
                    ? 'border-green-500 bg-green-50 hover:bg-green-100'
                    : 'border-red-500 bg-red-50 hover:bg-red-100'
                }`}
                onClick={() => onNavigateToCarnet(socio.carnet)}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="text-2xl font-bold text-gray-800">
                    APOLO GYM
                  </div>
                  <div className={`px-3 py-1 rounded-full text-sm font-semibold ${
                    socio.estado === 'vigente'
                      ? 'bg-green-600 text-white'
                      : 'bg-red-600 text-white'
                  }`}>
                    {socio.estado.toUpperCase()}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="text-lg font-semibold text-gray-700">
                    Carnet: {socio.carnet}
                  </div>
                  <div className="text-sm text-gray-600">
                    {socio.nombreCompleto}
                  </div>
                  <div className="text-sm text-gray-600">
                    DNI: {socio.dni}
                  </div>
                  <div className="text-sm text-gray-600">
                    Inicio: {new Date(socio.fechaInicio).toLocaleDateString()}
                  </div>
                </div>
                
                <button className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors duration-200">
                  <Eye className="w-4 h-4" />
                  Ver Detalles
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};