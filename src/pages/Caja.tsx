import React, { useState } from 'react';
import { DollarSign, Minus, Plus, Calculator, Clock, CreditCard, User } from 'lucide-react';
import { Retiro, Gasto, Turno, Ingreso, Socio } from '../types';
import { generarNumeroRetiro } from '../utils/localStorage';

interface CajaProps {
  socios: Socio[];
  retiros: Retiro[];
  gastos: Gasto[];
  ingresos: Ingreso[];
  turnos: Turno[];
  contadorRetiro: number;
  onAddRetiro: (retiro: Omit<Retiro, 'id' | 'numero'>) => void;
  onAddGasto: (gasto: Omit<Gasto, 'id'>) => void;
  onAddIngreso: (ingreso: Omit<Ingreso, 'id'>) => void;
  onIniciarTurno: (usuario: string, montoInicial: number) => void;
  onCerrarTurno: (montoFinal: number) => void;
}

export const Caja: React.FC<CajaProps> = ({
  socios,
  retiros,
  gastos,
  ingresos,
  turnos,
  contadorRetiro,
  onAddRetiro,
  onAddGasto,
  onAddIngreso,
  onIniciarTurno,
  onCerrarTurno,
}) => {
  const [activeTab, setActiveTab] = useState<'ingresos' | 'retiros' | 'gastos' | 'turnos'>('ingresos');
  const [showIngresoForm, setShowIngresoForm] = useState(false);
  const [showRetiroForm, setShowRetiroForm] = useState(false);
  const [showGastoForm, setShowGastoForm] = useState(false);
  const [showIniciarTurno, setShowIniciarTurno] = useState(false);
  const [showCerrarTurno, setShowCerrarTurno] = useState(false);

  const [ingresoForm, setIngresoForm] = useState({
    carnet: '',
    monto: 30000,
    formaPago: 'efectivo' as 'efectivo' | 'transferencia',
  });

  const [retiroForm, setRetiroForm] = useState({
    monto: 0,
    descripcion: '',
  });

  const [gastoForm, setGastoForm] = useState({
    monto: 0,
    proveedor: '',
    motivo: '',
    remito: '',
  });

  const [turnoForm, setTurnoForm] = useState({
    usuario: '',
    montoInicial: 0,
  });

  const [montoFinalTurno, setMontoFinalTurno] = useState(0);

  const turnoActual = turnos.find(t => !t.cerrado);

  // Calcular efectivo en caja
  const calcularEfectivoEnCaja = () => {
    if (!turnoActual) return 0;
    
    const ingresosEfectivo = ingresos
      .filter(i => i.formaPago === 'efectivo' && new Date(i.fecha) >= new Date(turnoActual.fechaInicio))
      .reduce((sum, i) => sum + i.monto, 0);
    
    const retirosDelTurno = retiros
      .filter(r => new Date(r.fecha) >= new Date(turnoActual.fechaInicio))
      .reduce((sum, r) => sum + r.monto, 0);
    
    const gastosDelTurno = gastos
      .filter(g => new Date(g.fecha) >= new Date(turnoActual.fechaInicio))
      .reduce((sum, g) => sum + g.monto, 0);

    return turnoActual.montoInicial + ingresosEfectivo - retirosDelTurno - gastosDelTurno;
  };

  const handleIngresoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!turnoActual) {
      alert('Debe iniciar un turno antes de registrar ingresos');
      return;
    }

    if (!ingresoForm.carnet || ingresoForm.monto <= 0) {
      alert('Complete todos los campos correctamente');
      return;
    }

    const socio = socios.find(s => s.carnet === ingresoForm.carnet);
    if (!socio) {
      alert('No se encontró un socio con ese número de carnet');
      return;
    }

    onAddIngreso({
      carnet: ingresoForm.carnet,
      nombreSocio: socio.nombreCompleto,
      monto: ingresoForm.monto,
      formaPago: ingresoForm.formaPago,
      fecha: new Date().toISOString(),
    });

    setIngresoForm({ carnet: '', monto: 30000, formaPago: 'efectivo' });
    setShowIngresoForm(false);
  };

  const handleRetiroSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!turnoActual) {
      alert('Debe iniciar un turno antes de registrar retiros');
      return;
    }

    if (retiroForm.monto <= 0) {
      alert('El monto debe ser mayor a 0');
      return;
    }

    onAddRetiro({
      monto: retiroForm.monto,
      fecha: new Date().toISOString(),
      descripcion: retiroForm.descripcion,
    });

    setRetiroForm({ monto: 0, descripcion: '' });
    setShowRetiroForm(false);
  };

  const handleGastoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!turnoActual) {
      alert('Debe iniciar un turno antes de registrar gastos');
      return;
    }

    if (!gastoForm.monto || !gastoForm.proveedor || !gastoForm.motivo) {
      alert('Complete todos los campos obligatorios');
      return;
    }

    onAddGasto({
      ...gastoForm,
      fecha: new Date().toISOString(),
    });

    setGastoForm({ monto: 0, proveedor: '', motivo: '', remito: '' });
    setShowGastoForm(false);
  };

  const handleIniciarTurno = () => {
    if (!turnoForm.usuario.trim()) {
      alert('Debe ingresar el nombre del usuario');
      return;
    }
    if (turnoForm.montoInicial < 0) {
      alert('El monto inicial debe ser mayor o igual a 0');
      return;
    }
    onIniciarTurno(turnoForm.usuario, turnoForm.montoInicial);
    setTurnoForm({ usuario: '', montoInicial: 0 });
    setShowIniciarTurno(false);
  };

  const handleCerrarTurno = () => {
    if (montoFinalTurno < 0) {
      alert('El monto final debe ser mayor o igual a 0');
      return;
    }
    onCerrarTurno(montoFinalTurno);
    setMontoFinalTurno(0);
    setShowCerrarTurno(false);
  };

  const tabs = [
    { id: 'ingresos', label: 'Ingresos', icon: Plus },
    { id: 'retiros', label: 'Retiros', icon: Minus },
    { id: 'gastos', label: 'Gastos', icon: Calculator },
    { id: 'turnos', label: 'Turnos', icon: Clock },
  ];

  const efectivoEnCaja = calcularEfectivoEnCaja();

  return (
    <div className="space-y-8">
      <h2 className="text-3xl font-bold text-gray-800">Sistema de Caja</h2>

      {/* Estado del turno y efectivo en caja */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold text-gray-800">Estado del Turno</h3>
            <div className="flex gap-3">
              {!turnoActual ? (
                <button
                  onClick={() => setShowIniciarTurno(true)}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors duration-200"
                >
                  <Plus className="w-4 h-4" />
                  Iniciar Turno
                </button>
              ) : (
                <button
                  onClick={() => setShowCerrarTurno(true)}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors duration-200"
                >
                  <Minus className="w-4 h-4" />
                  Cerrar Turno
                </button>
              )}
            </div>
          </div>

          {turnoActual ? (
            <div className="space-y-3">
              <div className="bg-green-50 p-3 rounded-lg">
                <p className="text-sm text-green-600">Usuario</p>
                <p className="text-lg font-bold text-green-800">{turnoActual.usuario}</p>
              </div>
              <div className="bg-blue-50 p-3 rounded-lg">
                <p className="text-sm text-blue-600">Inicio</p>
                <p className="text-lg font-semibold text-blue-800">
                  {new Date(turnoActual.fechaInicio).toLocaleString()}
                </p>
              </div>
              <div className="bg-yellow-50 p-3 rounded-lg">
                <p className="text-sm text-yellow-600">Estado</p>
                <p className="text-lg font-bold text-yellow-800">ABIERTO</p>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Clock className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg">No hay turno abierto</p>
              <p className="text-sm">Inicie un nuevo turno para comenzar</p>
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Efectivo en Caja</h3>
          {turnoActual ? (
            <div className="space-y-3">
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-sm text-green-600">Efectivo Disponible</p>
                <p className="text-3xl font-bold text-green-800">
                  ${efectivoEnCaja.toLocaleString()}
                </p>
              </div>
              <div className="text-xs text-gray-500 space-y-1">
                <p>Inicial: ${turnoActual.montoInicial.toLocaleString()}</p>
                <p>+ Ingresos efectivo del turno</p>
                <p>- Retiros y gastos del turno</p>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <DollarSign className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg">Turno cerrado</p>
              <p className="text-sm">Inicie un turno para ver el efectivo</p>
            </div>
          )}
        </div>
      </div>

      {/* Mensaje de turno cerrado */}
      {!turnoActual && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
          <div className="text-yellow-800 text-lg font-semibold mb-2">
            ⚠️ No hay turno abierto
          </div>
          <p className="text-yellow-700">
            Debe iniciar un turno antes de registrar ingresos, retiros o gastos.
          </p>
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="border-b border-gray-200">
          <nav className="flex">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex-1 flex items-center justify-center gap-2 py-4 px-6 transition-colors duration-200 ${
                    activeTab === tab.id
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-6">
          {/* Tab Ingresos */}
          {activeTab === 'ingresos' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="text-lg font-semibold text-gray-800">Ingresos por Carnets</h4>
                <button
                  onClick={() => turnoActual ? setShowIngresoForm(true) : alert('Debe iniciar un turno primero')}
                  className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors duration-200 ${
                    turnoActual 
                      ? 'bg-green-600 hover:bg-green-700 text-white' 
                      : 'bg-gray-400 text-gray-200 cursor-not-allowed'
                  }`}
                  disabled={!turnoActual}
                >
                  <Plus className="w-4 h-4" />
                  Registrar Ingreso
                </button>
              </div>
              
              {ingresos.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>No hay ingresos registrados</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {ingresos.slice(-10).reverse().map((ingreso) => (
                    <div key={ingreso.id} className="p-4 border border-gray-200 rounded-lg bg-green-50">
                      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                        <div>
                          <p className="text-sm text-gray-600">Carnet</p>
                          <p className="font-bold text-green-700">{ingreso.carnet}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Socio</p>
                          <p className="font-semibold">{ingreso.nombreSocio}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Monto</p>
                          <p className="font-bold text-green-800">${ingreso.monto.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Forma de Pago</p>
                          <p className="font-semibold capitalize">{ingreso.formaPago}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Fecha</p>
                          <p className="font-semibold">
                            {new Date(ingreso.fecha).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Tab Retiros */}
          {activeTab === 'retiros' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="text-lg font-semibold text-gray-800">Retiros del Dueño</h4>
                <button
                  onClick={() => turnoActual ? setShowRetiroForm(true) : alert('Debe iniciar un turno primero')}
                  className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors duration-200 ${
                    turnoActual 
                      ? 'bg-red-600 hover:bg-red-700 text-white' 
                      : 'bg-gray-400 text-gray-200 cursor-not-allowed'
                  }`}
                  disabled={!turnoActual}
                >
                  <Minus className="w-4 h-4" />
                  Nuevo Retiro
                </button>
              </div>

              {retiros.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>No hay retiros registrados</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {retiros.slice(-10).reverse().map((retiro) => (
                    <div key={retiro.id} className="p-4 border border-gray-200 rounded-lg bg-red-50">
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                          <p className="text-sm text-gray-600">Número</p>
                          <p className="font-bold text-red-600">#{retiro.numero}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Monto</p>
                          <p className="font-semibold text-red-800">${retiro.monto.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Fecha</p>
                          <p className="font-semibold">
                            {new Date(retiro.fecha).toLocaleDateString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Descripción</p>
                          <p className="font-semibold">{retiro.descripcion || 'Sin descripción'}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Tab Gastos */}
          {activeTab === 'gastos' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="text-lg font-semibold text-gray-800">Gastos Registrados</h4>
                <button
                  onClick={() => turnoActual ? setShowGastoForm(true) : alert('Debe iniciar un turno primero')}
                  className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors duration-200 ${
                    turnoActual 
                      ? 'bg-yellow-600 hover:bg-yellow-700 text-white' 
                      : 'bg-gray-400 text-gray-200 cursor-not-allowed'
                  }`}
                  disabled={!turnoActual}
                >
                  <Calculator className="w-4 h-4" />
                  Nuevo Gasto
                </button>
              </div>

              {gastos.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>No hay gastos registrados</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {gastos.slice(-10).reverse().map((gasto) => (
                    <div key={gasto.id} className="p-4 border border-gray-200 rounded-lg bg-yellow-50">
                      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                        <div>
                          <p className="text-sm text-gray-600">Monto</p>
                          <p className="font-bold text-yellow-700">${gasto.monto.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Proveedor</p>
                          <p className="font-semibold">{gasto.proveedor}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Motivo</p>
                          <p className="font-semibold">{gasto.motivo}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Remito</p>
                          <p className="font-semibold">{gasto.remito}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Fecha</p>
                          <p className="font-semibold">
                            {new Date(gasto.fecha).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Tab Turnos */}
          {activeTab === 'turnos' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="text-lg font-semibold text-gray-800">Historial de Turnos</h4>
              </div>
              
              {turnos.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>No hay turnos registrados</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {turnos.slice(-10).reverse().map((turno) => (
                    <div
                      key={turno.id}
                      className={`p-4 rounded-lg border-2 ${
                        turno.cerrado
                          ? 'border-gray-300 bg-gray-50'
                          : 'border-green-300 bg-green-50'
                      }`}
                    >
                      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                        <div>
                          <p className="text-sm text-gray-600">Usuario</p>
                          <p className="font-semibold">{turno.usuario}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Inicio</p>
                          <p className="font-semibold">
                            {new Date(turno.fechaInicio).toLocaleDateString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Monto Inicial</p>
                          <p className="font-semibold">${turno.montoInicial.toLocaleString()}</p>
                        </div>
                        {turno.cerrado && (
                          <>
                            <div>
                              <p className="text-sm text-gray-600">Monto Final</p>
                              <p className="font-semibold">${turno.montoFinal?.toLocaleString()}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-600">Recaudación</p>
                              <p className="font-bold text-green-600">
                                ${turno.recaudacion?.toLocaleString()}
                              </p>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modal Iniciar Turno */}
      {showIniciarTurno && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full mx-4">
            <h3 className="text-2xl font-bold text-gray-800 mb-6">Iniciar Turno</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre del Usuario *
                </label>
                <input
                  type="text"
                  value={turnoForm.usuario}
                  onChange={(e) => setTurnoForm({ ...turnoForm, usuario: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Ej: María González"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Monto Inicial de Caja
                </label>
                <input
                  type="number"
                  value={turnoForm.montoInicial}
                  onChange={(e) => setTurnoForm({ ...turnoForm, montoInicial: Number(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  min="0"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleIniciarTurno}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg transition-colors duration-200"
                >
                  Iniciar Turno
                </button>
                <button
                  onClick={() => setShowIniciarTurno(false)}
                  className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 py-2 px-4 rounded-lg transition-colors duration-200"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Cerrar Turno */}
      {showCerrarTurno && turnoActual && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full mx-4">
            <h3 className="text-2xl font-bold text-gray-800 mb-6">Cerrar Turno</h3>
            <div className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-blue-600">Monto Inicial del Turno</p>
                <p className="text-xl font-bold text-blue-800">
                  ${turnoActual.montoInicial.toLocaleString()}
                </p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-sm text-green-600">Efectivo Actual en Caja</p>
                <p className="text-xl font-bold text-green-800">
                  ${efectivoEnCaja.toLocaleString()}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Monto que queda para el próximo turno
                </label>
                <input
                  type="number"
                  value={montoFinalTurno}
                  onChange={(e) => setMontoFinalTurno(Number(e.target.value))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  min="0"
                />
              </div>
              {montoFinalTurno > 0 && (
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <p className="text-sm text-yellow-600">Recaudación Calculada</p>
                  <p className="text-xl font-bold text-yellow-800">
                    ${(montoFinalTurno - turnoActual.montoInicial).toLocaleString()}
                  </p>
                </div>
              )}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleCerrarTurno}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg transition-colors duration-200"
                >
                  Cerrar Turno
                </button>
                <button
                  onClick={() => setShowCerrarTurno(false)}
                  className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 py-2 px-4 rounded-lg transition-colors duration-200"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Ingreso */}
      {showIngresoForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full mx-4">
            <h3 className="text-2xl font-bold text-gray-800 mb-6">Registrar Ingreso</h3>
            <form onSubmit={handleIngresoSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Número de Carnet *
                </label>
                <input
                  type="text"
                  value={ingresoForm.carnet}
                  onChange={(e) => setIngresoForm({ ...ingresoForm, carnet: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Ej: 25-001"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Monto *
                </label>
                <input
                  type="number"
                  value={ingresoForm.monto}
                  onChange={(e) => setIngresoForm({ ...ingresoForm, monto: Number(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  min="1"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Forma de Pago
                </label>
                <select
                  value={ingresoForm.formaPago}
                  onChange={(e) => setIngresoForm({ ...ingresoForm, formaPago: e.target.value as 'efectivo' | 'transferencia' })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="efectivo">Efectivo</option>
                  <option value="transferencia">Transferencia</option>
                </select>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg transition-colors duration-200"
                >
                  Registrar Ingreso
                </button>
                <button
                  type="button"
                  onClick={() => setShowIngresoForm(false)}
                  className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 py-2 px-4 rounded-lg transition-colors duration-200"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Retiro */}
      {showRetiroForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full mx-4">
            <h3 className="text-2xl font-bold text-gray-800 mb-6">Nuevo Retiro</h3>
            <form onSubmit={handleRetiroSubmit} className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-blue-600">Número de Retiro</p>
                <p className="text-xl font-bold text-blue-800">
                  #{generarNumeroRetiro(contadorRetiro)}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Monto *
                </label>
                <input
                  type="number"
                  value={retiroForm.monto}
                  onChange={(e) => setRetiroForm({ ...retiroForm, monto: Number(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  min="1"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descripción
                </label>
                <input
                  type="text"
                  value={retiroForm.descripcion}
                  onChange={(e) => setRetiroForm({ ...retiroForm, descripcion: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Motivo del retiro (opcional)"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg transition-colors duration-200"
                >
                  Registrar Retiro
                </button>
                <button
                  type="button"
                  onClick={() => setShowRetiroForm(false)}
                  className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 py-2 px-4 rounded-lg transition-colors duration-200"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Gasto */}
      {showGastoForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full mx-4">
            <h3 className="text-2xl font-bold text-gray-800 mb-6">Nuevo Gasto</h3>
            <form onSubmit={handleGastoSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Monto *
                </label>
                <input
                  type="number"
                  value={gastoForm.monto}
                  onChange={(e) => setGastoForm({ ...gastoForm, monto: Number(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  min="1"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Proveedor *
                </label>
                <input
                  type="text"
                  value={gastoForm.proveedor}
                  onChange={(e) => setGastoForm({ ...gastoForm, proveedor: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Motivo *
                </label>
                <input
                  type="text"
                  value={gastoForm.motivo}
                  onChange={(e) => setGastoForm({ ...gastoForm, motivo: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Número de Remito
                </label>
                <input
                  type="text"
                  value={gastoForm.remito}
                  onChange={(e) => setGastoForm({ ...gastoForm, remito: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-yellow-600 hover:bg-yellow-700 text-white py-2 px-4 rounded-lg transition-colors duration-200"
                >
                  Registrar Gasto
                </button>
                <button
                  type="button"
                  onClick={() => setShowGastoForm(false)}
                  className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 py-2 px-4 rounded-lg transition-colors duration-200"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};