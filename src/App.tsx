import React, { useState, useEffect } from 'react';
import { 
  fetchVehicles, fetchDrivers, fetchDeliveries, 
  fetchAssignments, fetchFleetPulse, fetchSafetyPassport, resetDemo 
} from './api';
import { 
  Vehicle, Driver, Delivery, Assignment, 
  FleetPulseData, SafetyPassport 
} from './types';

import { Navbar } from './components/Navbar';
import { DispatchOverview } from './components/DispatchOverview';
import { VehiclesView } from './components/VehiclesView';
import { DriversView } from './components/DriversView';
import { DeliveriesView } from './components/DeliveriesView';
import { AssignmentsView } from './components/AssignmentsView';
import { TimeMachineScrubber } from './components/TimeMachineScrubber';
import { AttackLab } from './components/AttackLab';
import { AvailabilityHeatmap } from './components/AvailabilityHeatmap';
import { BlackBoxViewer } from './components/BlackBoxViewer';

import { CommandPalette } from './components/CommandPalette';
import { GuidedDemoModal } from './components/GuidedDemoModal';
import { SmartMatchModal } from './components/SmartMatchModal';
import { SafetyPassportModal } from './components/SafetyPassportModal';
import { AutoRecoveryModal } from './components/AutoRecoveryModal';
import { PaletteBanner } from './components/PaletteBanner';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('overview');
  
  // Core Entities State
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [pulseData, setPulseData] = useState<FleetPulseData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isResetting, setIsResetting] = useState<boolean>(false);

  // Modals State
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState<boolean>(false);
  const [isDemoOpen, setIsDemoOpen] = useState<boolean>(false);
  const [selectedSmartMatchDelivery, setSelectedSmartMatchDelivery] = useState<Delivery | null>(null);
  const [selectedPassport, setSelectedPassport] = useState<SafetyPassport | null>(null);
  const [selectedRecoveryAssignment, setSelectedRecoveryAssignment] = useState<Assignment | null>(null);

  // Master Data Refresh
  const refreshAllData = async () => {
    try {
      const [v, d, deliv, asn, pulse] = await Promise.all([
        fetchVehicles(),
        fetchDrivers(),
        fetchDeliveries(),
        fetchAssignments(),
        fetchFleetPulse()
      ]);
      setVehicles(v);
      setDrivers(d);
      setDeliveries(deliv);
      setAssignments(asn);
      setPulseData(pulse);
    } catch (err) {
      console.error('Data refresh error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshAllData();
    const timer = setInterval(() => {
      refreshAllData();
    }, 20000);
    return () => clearInterval(timer);
  }, []);

  // Handle Reset Demo
  const handleResetDemo = async () => {
    if (confirm('Reset fleet database to pristine demo state?')) {
      setIsResetting(true);
      try {
        await resetDemo();
        await refreshAllData();
      } catch (err: any) {
        alert(err.message);
      } finally {
        setIsResetting(false);
      }
    }
  };

  // Open Safety Passport Modal
  const handleViewPassport = async (assignmentId: string) => {
    try {
      const p = await fetchSafetyPassport(assignmentId);
      setSelectedPassport(p);
    } catch (err: any) {
      alert(`Passport error: ${err.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
        onOpenDemo={() => setIsDemoOpen(true)}
        onResetDemo={handleResetDemo}
        isResetting={isResetting}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'overview' && (
          <DispatchOverview
            vehicles={vehicles}
            drivers={drivers}
            deliveries={deliveries}
            assignments={assignments}
            pulseData={pulseData}
            loading={loading}
            setActiveTab={setActiveTab}
            onOpenSmartMatch={(deliv) => setSelectedSmartMatchDelivery(deliv)}
            onViewPassport={handleViewPassport}
            onOpenDemo={() => setIsDemoOpen(true)}
          />
        )}

        {activeTab === 'vehicles' && (
          <VehiclesView vehicles={vehicles} onRefresh={refreshAllData} />
        )}

        {activeTab === 'drivers' && (
          <DriversView drivers={drivers} onRefresh={refreshAllData} />
        )}

        {activeTab === 'deliveries' && (
          <DeliveriesView
            deliveries={deliveries}
            onRefresh={refreshAllData}
            onOpenSmartMatch={(deliv) => setSelectedSmartMatchDelivery(deliv)}
          />
        )}

        {activeTab === 'assignments' && (
          <AssignmentsView
            assignments={assignments}
            onRefresh={refreshAllData}
            onViewPassport={handleViewPassport}
            onOpenRecovery={(asn) => setSelectedRecoveryAssignment(asn)}
          />
        )}

        {activeTab === 'time-machine' && <TimeMachineScrubber />}

        {activeTab === 'attack-lab' && (
          <AttackLab vehicles={vehicles} drivers={drivers} />
        )}

        {activeTab === 'heatmap' && <AvailabilityHeatmap />}

        {activeTab === 'black-box' && <BlackBoxViewer />}
      </main>

      {/* Clean White & Emerald Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 text-xs text-slate-500 font-mono">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span className="text-slate-900 font-bold tracking-wider">FLEETWISE NEXUS</span>
            <span>// AUTONOMOUS DISPATCH ORCHESTRATION</span>
          </div>
          <div className="flex items-center space-x-6 text-[11px]">
            <span>FastAPI + SQLite WAL</span>
            <span>React 19 + TypeScript</span>
            <span className="text-emerald-600 font-semibold">100% Zero-Collision Guarantee</span>
          </div>
        </div>
      </footer>

      {/* Global Modals */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        setActiveTab={setActiveTab}
        onOpenDemo={() => setIsDemoOpen(true)}
        onResetDemo={handleResetDemo}
      />

      <GuidedDemoModal
        isOpen={isDemoOpen}
        onClose={() => setIsDemoOpen(false)}
        setActiveTab={setActiveTab}
      />

      <SmartMatchModal
        delivery={selectedSmartMatchDelivery}
        isOpen={!!selectedSmartMatchDelivery}
        onClose={() => setSelectedSmartMatchDelivery(null)}
        onAssignmentCreated={refreshAllData}
      />

      <SafetyPassportModal
        passport={selectedPassport}
        isOpen={!!selectedPassport}
        onClose={() => setSelectedPassport(null)}
      />

      <AutoRecoveryModal
        assignment={selectedRecoveryAssignment}
        isOpen={!!selectedRecoveryAssignment}
        onClose={() => setSelectedRecoveryAssignment(null)}
        onRecoveryCompleted={refreshAllData}
      />

    </div>
  );
};

export default App;
