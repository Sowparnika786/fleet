import React, { useState, useEffect, useRef, useMemo } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { 
  MapPin, Truck, Navigation, Search, Filter, 
  RotateCcw, Maximize2, Zap, Clock, ShieldCheck, 
  AlertTriangle, X, Compass, ChevronRight, Eye, CheckCircle2
} from 'lucide-react';
import { Vehicle, Delivery, Assignment, Driver } from '../types';

interface LiveFleetMapProps {
  vehicles: Vehicle[];
  deliveries: Delivery[];
  assignments: Assignment[];
  drivers: Driver[];
  onRefresh?: () => void;
}

type FilterMode = 'all' | 'available' | 'assigned' | 'deliveries';

export const LiveFleetMap: React.FC<LiveFleetMapProps> = ({
  vehicles,
  deliveries,
  assignments,
  drivers,
  onRefresh
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.FeatureGroup | null>(null);
  const routeLayerRef = useRef<L.Polyline | null>(null);

  // Filter & Search State
  const [filterMode, setFilterMode] = useState<FilterMode>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEntity, setSelectedEntity] = useState<{
    type: 'vehicle' | 'delivery' | 'assignment';
    id: string;
    data: any;
  } | null>(null);

  // Active Route State
  const [activeRoute, setActiveRoute] = useState<{
    deliveryId: string;
    deliveryTitle: string;
    origin: [number, number];
    destination: [number, number];
    originAddress: string;
    destinationAddress: string;
    distanceKm: string;
    durationMin: number;
    assignedVehicle?: Vehicle;
    assignedDriverName?: string;
    isOsrmRoute: boolean;
  } | null>(null);

  const [loadingRoute, setLoadingRoute] = useState(false);

  // Initial Map Setup
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [37.60, -122.25],
        zoom: 10,
        zoomControl: false,
        attributionControl: false
      });

      // Sleek Voyager tile layer (OpenStreetMap data, free, zero API key)
      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        maxZoom: 19,
        subdomains: 'abcd'
      }).addTo(map);

      // Attribution bottom right
      L.control.attribution({ position: 'bottomright', prefix: false })
        .addAttribution('&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>')
        .addTo(map);

      // Custom zoom control
      L.control.zoom({ position: 'bottomright' }).addTo(map);

      const markersGroup = L.featureGroup().addTo(map);
      markersLayerRef.current = markersGroup;
      mapInstanceRef.current = map;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Filtered Entities Calculation
  const filteredVehicles = useMemo(() => {
    return vehicles.filter((v) => {
      const matchesSearch = 
        v.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.plate_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.id.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchesSearch) return false;
      if (filterMode === 'all') return true;
      if (filterMode === 'available') return v.status === 'Available';
      if (filterMode === 'assigned') return v.status === 'In Transit' || v.status === 'Assigned';
      if (filterMode === 'deliveries') return false;
      return true;
    });
  }, [vehicles, searchQuery, filterMode]);

  const filteredDeliveries = useMemo(() => {
    return deliveries.filter((d) => {
      const matchesSearch = 
        d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.cargo_type.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchesSearch) return false;
      if (filterMode === 'all' || filterMode === 'deliveries') return true;
      if (filterMode === 'assigned') return d.status === 'Assigned' || d.status === 'In Transit';
      return false;
    });
  }, [deliveries, searchQuery, filterMode]);

  // Helper to create HTML DivIcons
  const createVehicleIcon = (status: string, plate: string) => {
    let colorBg = '#059669'; // Green Available
    let borderColor = '#047857';
    let ringColor = 'rgba(16, 185, 129, 0.3)';

    if (status === 'In Transit' || status === 'Assigned') {
      colorBg = '#D97706'; // Gold Assigned
      borderColor = '#B45309';
      ringColor = 'rgba(217, 119, 6, 0.3)';
    } else if (status === 'Maintenance') {
      colorBg = '#DC2626'; // Red Maintenance
      borderColor = '#991B1B';
      ringColor = 'rgba(220, 38, 38, 0.3)';
    } else if (status === 'Out of Service' || status === 'Inactive') {
      colorBg = '#64748B'; // Grey Inactive
      borderColor = '#475569';
      ringColor = 'rgba(100, 116, 139, 0.3)';
    }

    const html = `
      <div style="position: relative; display: flex; flex-direction: column; align-items: center; transform: translate(-50%, -50%); cursor: pointer;">
        <div style="position: absolute; width: 36px; height: 36px; border-radius: 50%; background: ${ringColor}; animation: pulse 2s infinite;"></div>
        <div style="width: 28px; height: 28px; border-radius: 8px; background: ${colorBg}; border: 2px solid #ffffff; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.25); display: flex; align-items: center; justify-content: center; z-index: 2;">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/>
            <path d="M15 18H9"/>
            <path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14"/>
            <circle cx="17" cy="18" r="2"/>
            <circle cx="7" cy="18" r="2"/>
          </svg>
        </div>
        <div style="margin-top: 2px; font-size: 9px; font-weight: 700; font-family: monospace; background: #ffffff; color: #0f172a; padding: 1px 4px; border-radius: 4px; border: 1px solid #cbd5e1; box-shadow: 0 1px 2px rgba(0,0,0,0.1); white-space: nowrap; z-index: 3;">
          ${plate}
        </div>
      </div>
    `;

    return L.divIcon({
      className: 'vehicle-marker-icon',
      html,
      iconSize: [30, 42],
      iconAnchor: [15, 21]
    });
  };

  const createPickupIcon = (title: string) => {
    const html = `
      <div style="position: relative; display: flex; flex-direction: column; align-items: center; transform: translate(-50%, -50%); cursor: pointer;">
        <div style="width: 24px; height: 24px; border-radius: 50%; background: #0284c7; border: 2px solid #ffffff; box-shadow: 0 4px 6px rgba(0,0,0,0.2); display: flex; align-items: center; justify-content: center;">
          <div style="width: 8px; height: 8px; border-radius: 50%; background: #ffffff;"></div>
        </div>
        <div style="margin-top: 2px; font-size: 9px; font-weight: 700; font-family: monospace; background: #0284c7; color: #ffffff; padding: 1px 4px; border-radius: 4px; white-space: nowrap;">
          PICKUP
        </div>
      </div>
    `;
    return L.divIcon({ className: 'pickup-marker-icon', html, iconSize: [24, 38], iconAnchor: [12, 19] });
  };

  const createDestIcon = (title: string) => {
    const html = `
      <div style="position: relative; display: flex; flex-direction: column; align-items: center; transform: translate(-50%, -50%); cursor: pointer;">
        <div style="width: 24px; height: 24px; border-radius: 50%; background: #7c3aed; border: 2px solid #ffffff; box-shadow: 0 4px 6px rgba(0,0,0,0.2); display: flex; align-items: center; justify-content: center;">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="3">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
        </div>
        <div style="margin-top: 2px; font-size: 9px; font-weight: 700; font-family: monospace; background: #7c3aed; color: #ffffff; padding: 1px 4px; border-radius: 4px; white-space: nowrap;">
          DEST
        </div>
      </div>
    `;
    return L.divIcon({ className: 'dest-marker-icon', html, iconSize: [24, 38], iconAnchor: [12, 19] });
  };

  // Select Route & Draw Polyline
  const handleSelectDelivery = async (delivery: Delivery) => {
    setSelectedEntity({ type: 'delivery', id: delivery.id, data: delivery });
    setLoadingRoute(true);

    const origin: [number, number] = [delivery.origin_lat, delivery.origin_lng];
    const destination: [number, number] = [delivery.destination_lat, delivery.destination_lng];

    // Find assigned mission if exists
    const matchingAssignment = assignments.find((a) => a.delivery_id === delivery.id);
    const assignedVehicle = matchingAssignment 
      ? vehicles.find((v) => v.id === matchingAssignment.vehicle_id) 
      : undefined;
    const assignedDriver = matchingAssignment
      ? drivers.find((d) => d.id === matchingAssignment.driver_id)
      : undefined;

    let routeCoords: Array<[number, number]> = [];
    let distanceKm = delivery.estimated_distance_km ? delivery.estimated_distance_km.toFixed(1) : '42.5';
    let durationMin = Math.round(parseFloat(distanceKm) * 1.4);
    let isOsrm = false;

    // Call free open-source OSRM routing service
    try {
      const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${origin[1]},${origin[0]};${destination[1]},${destination[0]}?overview=full&geometries=geojson`;
      const res = await fetch(osrmUrl);
      if (res.ok) {
        const json = await res.json();
        if (json.routes && json.routes[0]) {
          routeCoords = json.routes[0].geometry.coordinates.map((c: [number, number]) => [c[1], c[0]]);
          distanceKm = (json.routes[0].distance / 1000).toFixed(1);
          durationMin = Math.round(json.routes[0].duration / 60);
          isOsrm = true;
        }
      }
    } catch (err) {
      console.warn('OSRM routing fallback to direct corridor:', err);
    }

    // Graceful fallback polyline if OSRM is unreachable
    if (routeCoords.length === 0) {
      routeCoords = [origin, destination];
    }

    setActiveRoute({
      deliveryId: delivery.id,
      deliveryTitle: delivery.title,
      origin,
      destination,
      originAddress: delivery.origin_address,
      destinationAddress: delivery.destination_address,
      distanceKm,
      durationMin,
      assignedVehicle,
      assignedDriverName: assignedDriver?.name || matchingAssignment?.driver_name,
      isOsrmRoute: isOsrm
    });

    setLoadingRoute(false);

    // Draw Route on Leaflet Map
    if (mapInstanceRef.current) {
      if (routeLayerRef.current) {
        mapInstanceRef.current.removeLayer(routeLayerRef.current);
      }

      // Smooth elegant gold route line
      const polyline = L.polyline(routeCoords, {
        color: '#D97706', // Gold / Amber luxury accent
        weight: 5,
        opacity: 0.85,
        lineCap: 'round',
        lineJoin: 'round',
        dashArray: isOsrm ? undefined : '8, 8'
      }).addTo(mapInstanceRef.current);

      routeLayerRef.current = polyline;

      // Fit bounds with comfortable padding
      mapInstanceRef.current.fitBounds(polyline.getBounds(), { padding: [60, 60] });
    }
  };

  const handleClearRoute = () => {
    if (routeLayerRef.current && mapInstanceRef.current) {
      mapInstanceRef.current.removeLayer(routeLayerRef.current);
      routeLayerRef.current = null;
    }
    setActiveRoute(null);
    setSelectedEntity(null);
  };

  // Render Markers on Map
  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current) return;

    markersLayerRef.current.clearLayers();

    // 1. Plot Vehicles
    filteredVehicles.forEach((v) => {
      if (typeof v.current_location_lat !== 'number' || typeof v.current_location_lng !== 'number') return;

      const marker = L.marker([v.current_location_lat, v.current_location_lng], {
        icon: createVehicleIcon(v.status, v.plate_number)
      });

      // Find any active mission for this vehicle
      const activeAsn = assignments.find(
        (a) => a.vehicle_id === v.id && (a.status === 'In Progress' || a.status === 'Scheduled')
      );
      const activeDriver = activeAsn 
        ? drivers.find((d) => d.id === activeAsn.driver_id)
        : drivers.find((d) => d.status === 'Available');

      const popupContent = `
        <div style="font-family: inherit; font-size: 12px; color: #0f172a; min-width: 220px; line-height: 1.4;">
          <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #e2e8f0; padding-bottom: 6px; margin-bottom: 6px;">
            <span style="font-family: monospace; font-weight: 700; color: #059669; font-size: 11px;">${v.id}</span>
            <span style="font-size: 10px; font-weight: 700; padding: 2px 6px; border-radius: 9999px; background: ${
              v.status === 'Available' ? '#ecfdf5; color: #047857;' : '#fffbeb; color: #b45309;'
            }">${v.status}</span>
          </div>
          <div style="font-weight: 700; font-size: 13px; margin-bottom: 2px;">${v.model}</div>
          <div style="font-size: 11px; color: #64748b; margin-bottom: 6px;">Plate: <strong>${v.plate_number}</strong> • ${v.category}</div>
          
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 6px 8px; margin-bottom: 6px; font-size: 11px;">
            <div>⚡ State of Charge: <strong>${v.battery_fuel_pct}%</strong></div>
            <div>📍 Location: <span style="color: #64748b;">${v.current_address}</span></div>
            ${activeDriver ? `<div>👤 Operator: <strong>${activeDriver.name}</strong></div>` : ''}
            ${activeAsn ? `<div>📦 Mission: <strong>${activeAsn.id}</strong></div>` : ''}
          </div>
        </div>
      `;

      marker.bindPopup(popupContent);
      marker.on('click', () => {
        setSelectedEntity({ type: 'vehicle', id: v.id, data: v });
      });

      markersLayerRef.current?.addLayer(marker);
    });

    // 2. Plot Deliveries (Pickup & Destination pins)
    filteredDeliveries.forEach((d) => {
      // Pickup Pin
      if (typeof d.origin_lat === 'number' && typeof d.origin_lng === 'number') {
        const pMarker = L.marker([d.origin_lat, d.origin_lng], {
          icon: createPickupIcon(d.title)
        });

        pMarker.bindPopup(`
          <div style="font-size: 12px; color: #0f172a; min-width: 200px;">
            <div style="font-weight: 700; color: #0284c7; font-size: 11px;">PICKUP DEPOT</div>
            <div style="font-weight: 700; font-size: 13px; margin: 2px 0;">${d.title}</div>
            <div style="font-size: 11px; color: #64748b;">${d.origin_address}</div>
            <div style="margin-top: 6px; font-size: 11px;">Cargo: <strong>${d.cargo_type}</strong> (${d.weight_kg}kg)</div>
          </div>
        `);

        pMarker.on('click', () => handleSelectDelivery(d));
        markersLayerRef.current?.addLayer(pMarker);
      }

      // Destination Pin
      if (typeof d.destination_lat === 'number' && typeof d.destination_lng === 'number') {
        const dMarker = L.marker([d.destination_lat, d.destination_lng], {
          icon: createDestIcon(d.title)
        });

        dMarker.bindPopup(`
          <div style="font-size: 12px; color: #0f172a; min-width: 200px;">
            <div style="font-weight: 700; color: #7c3aed; font-size: 11px;">DESTINATION TARGET</div>
            <div style="font-weight: 700; font-size: 13px; margin: 2px 0;">${d.title}</div>
            <div style="font-size: 11px; color: #64748b;">${d.destination_address}</div>
            <div style="margin-top: 6px; font-size: 11px;">Status: <strong>${d.status}</strong></div>
          </div>
        `);

        dMarker.on('click', () => handleSelectDelivery(d));
        markersLayerRef.current?.addLayer(dMarker);
      }
    });

  }, [filteredVehicles, filteredDeliveries, assignments, drivers]);

  // Controls: Fit All Markers
  const handleFitAll = () => {
    if (mapInstanceRef.current && markersLayerRef.current) {
      const bounds = markersLayerRef.current.getBounds();
      if (bounds.isValid()) {
        mapInstanceRef.current.fitBounds(bounds, { padding: [50, 50] });
      }
    }
  };

  // Controls: Reset View
  const handleResetView = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([37.60, -122.25], 10);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      
      {/* Top Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2.5 mb-1">
            <span className="p-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700">
              <Compass className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight font-mono">
              LIVE FLEET MAP // GEOSPATIAL TELEMETRY
            </h2>
          </div>
          <p className="text-xs text-slate-500">
            Real-time geospatial fleet positioning, delivery origin/destination waypoints, and automated road routing.
          </p>
        </div>

        {/* Legend Badges */}
        <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono bg-slate-50 p-2.5 rounded-xl border border-slate-200">
          <span className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-700 font-semibold">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" /> Available ({vehicles.filter(v => v.status === 'Available').length})
          </span>
          <span className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-white border border-slate-200 text-amber-700 font-semibold">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Assigned / Transit ({vehicles.filter(v => v.status === 'In Transit' || v.status === 'Assigned').length})
          </span>
          <span className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-white border border-slate-200 text-rose-700 font-semibold">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-600" /> Maintenance ({vehicles.filter(v => v.status === 'Maintenance').length})
          </span>
        </div>
      </div>

      {/* Map Card Container */}
      <div className="relative bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden h-[680px] flex flex-col">
        
        {/* Floating Top Control Toolbar */}
        <div className="absolute top-4 left-4 right-4 z-[1000] flex flex-wrap items-center justify-between gap-3 pointer-events-none">
          
          {/* Search Box */}
          <div className="relative w-72 pointer-events-auto shadow-md rounded-xl">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search vehicles, plates, cargo..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/95 backdrop-blur-md border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500 font-sans shadow-xs"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Quick Filter Pill Buttons */}
          <div className="flex items-center gap-1.5 bg-white/95 backdrop-blur-md p-1.5 rounded-xl border border-slate-200 shadow-md pointer-events-auto">
            <button
              onClick={() => setFilterMode('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all cursor-pointer ${
                filterMode === 'all'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Show All
            </button>
            <button
              onClick={() => setFilterMode('available')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all cursor-pointer ${
                filterMode === 'available'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Available
            </button>
            <button
              onClick={() => setFilterMode('assigned')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all cursor-pointer ${
                filterMode === 'assigned'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Assigned
            </button>
            <button
              onClick={() => setFilterMode('deliveries')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all cursor-pointer ${
                filterMode === 'deliveries'
                  ? 'bg-emerald-800 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Active Deliveries
            </button>
          </div>

          {/* Map View Helpers */}
          <div className="flex items-center gap-1.5 bg-white/95 backdrop-blur-md p-1.5 rounded-xl border border-slate-200 shadow-md pointer-events-auto">
            <button
              onClick={handleFitAll}
              title="Fit All Fleet Markers"
              className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-mono font-semibold text-slate-700 transition-all cursor-pointer"
            >
              <Maximize2 className="w-3.5 h-3.5 text-emerald-600" />
              <span className="hidden sm:inline">Fit All</span>
            </button>

            <button
              onClick={handleResetView}
              title="Reset View to Bay Area"
              className="p-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 transition-all cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>

        {/* Leaflet DOM Node */}
        <div ref={mapContainerRef} className="w-full flex-1 z-0" />

        {/* Floating Active Route Information Panel */}
        {activeRoute && (
          <div className="absolute bottom-5 left-5 z-[1000] w-96 max-w-[calc(100%-2.5rem)] bg-white/95 backdrop-blur-md rounded-2xl border border-amber-300 shadow-xl p-4 animate-in fade-in space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping" />
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-700">
                  {activeRoute.isOsrmRoute ? 'OSRM Highway Corridor' : 'Direct Corridor'}
                </span>
              </div>
              <button 
                onClick={handleClearRoute}
                className="text-slate-400 hover:text-slate-700 cursor-pointer p-1"
                title="Clear Active Route"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <h4 className="text-sm font-bold text-slate-900 truncate">
                {activeRoute.deliveryTitle}
              </h4>
              <p className="text-[11px] text-slate-500 font-mono">Consignment {activeRoute.deliveryId}</p>
            </div>

            {/* Waypoint Steps */}
            <div className="space-y-1.5 text-xs">
              <div className="flex items-start space-x-2">
                <div className="w-2 h-2 rounded-full bg-sky-500 mt-1 shrink-0" />
                <div className="min-w-0 flex-1">
                  <span className="text-[10px] font-mono text-slate-400 uppercase font-semibold block">Origin Pickup</span>
                  <span className="text-[11px] text-slate-700 truncate block">{activeRoute.originAddress}</span>
                </div>
              </div>
              <div className="flex items-start space-x-2">
                <div className="w-2 h-2 rounded-full bg-purple-500 mt-1 shrink-0" />
                <div className="min-w-0 flex-1">
                  <span className="text-[10px] font-mono text-slate-400 uppercase font-semibold block">Target Destination</span>
                  <span className="text-[11px] text-slate-700 truncate block">{activeRoute.destinationAddress}</span>
                </div>
              </div>
            </div>

            {/* Metrics Breakdown */}
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-xs font-mono">
              <div className="p-2 rounded-lg bg-amber-50/60 border border-amber-200">
                <span className="text-[10px] text-slate-500 block">Est. Road Distance</span>
                <span className="text-sm font-bold text-amber-900">{activeRoute.distanceKm} km</span>
              </div>
              <div className="p-2 rounded-lg bg-amber-50/60 border border-amber-200">
                <span className="text-[10px] text-slate-500 block">Transit Time</span>
                <span className="text-sm font-bold text-amber-900">~{activeRoute.durationMin} min</span>
              </div>
            </div>

            {activeRoute.assignedVehicle && (
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] font-mono">
                <span className="text-slate-500 flex items-center gap-1">
                  <Truck className="w-3.5 h-3.5 text-emerald-600" /> {activeRoute.assignedVehicle.model}
                </span>
                {activeRoute.assignedDriverName && (
                  <span className="text-slate-700 font-bold">
                    👤 {activeRoute.assignedDriverName}
                  </span>
                )}
              </div>
            )}
          </div>
        )}

      </div>

    </div>
  );
};
