import React, { useState } from 'react';
import { Layout } from './components/Layout';
import { Socios } from './pages/Socios';
import { BuscarCarnet } from './pages/BuscarCarnet';
import { Caja } from './pages/Caja';
import { useGymData } from './hooks/useGymData';

function App() {
  const [currentPage, setCurrentPage] = useState('socios');
  const [selectedCarnet, setSelectedCarnet] = useState<string | null>(null);
  
  const {
    data,
    addSocio,
    addIngreso,
    addRetiro,
    addGasto,
    iniciarTurno,
    cerrarTurno,
  } = useGymData();

  const handleNavigateToCarnet = (carnet: string) => {
    setSelectedCarnet(carnet);
    setCurrentPage('carnet-detail');
  };

  const handleNavigateBack = () => {
    setSelectedCarnet(null);
    setCurrentPage('socios');
  };

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'socios':
        return (
          <Socios
            socios={data.socios}
            onAddSocio={addSocio}
            contadorCarnet={data.contadores.carnet}
            onNavigateToCarnet={handleNavigateToCarnet}
          />
        );
      
      case 'buscar':
        return (
          <BuscarCarnet
            socios={data.socios}
            onNavigateBack={() => setCurrentPage('socios')}
          />
        );
      
      case 'caja':
        return (
          <Caja
            socios={data.socios}
            retiros={data.retiros}
            gastos={data.gastos}
            ingresos={data.ingresos}
            turnos={data.turnos}
            contadorRetiro={data.contadores.retiro}
            onAddIngreso={addIngreso}
            onAddRetiro={addRetiro}
            onAddGasto={addGasto}
            onIniciarTurno={iniciarTurno}
            onCerrarTurno={cerrarTurno}
          />
        );
      
      case 'carnet-detail':
        if (!selectedCarnet) {
          setCurrentPage('socios');
          return null;
        }
        
        const socio = data.socios.find(s => s.carnet === selectedCarnet);
        if (!socio) {
          setCurrentPage('socios');
          return null;
        }
        
        return (
          <BuscarCarnet
            socios={[socio]}
            onNavigateBack={handleNavigateBack}
          />
        );
      
      default:
        return (
          <Socios
            socios={data.socios}
            onAddSocio={addSocio}
            contadorCarnet={data.contadores.carnet}
            onNavigateToCarnet={handleNavigateToCarnet}
          />
        );
    }
  };

  return (
    <Layout currentPage={currentPage} onNavigate={setCurrentPage}>
      {renderCurrentPage()}
    </Layout>
  );
}

export default App;