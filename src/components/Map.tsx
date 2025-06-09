import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import MapTooltip from './MapTooltip';
import MapboxGeocoder from '@mapbox/mapbox-gl-geocoder';
import '@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css';
import { useAuth } from '../contexts/AuthContext';
import { SavedLocation } from '../types/user';

mapboxgl.accessToken = 'pk.eyJ1Ijoic2lkaW1lbnQiLCJhIjoiY205ZGVzNDVkMTJ5eTJ0b2RsNTJqaHp6ZCJ9.aIWJ0AlaJti6TsSEEYeHPg';

interface MapProps {
  center?: [number, number];
  zoom?: number;
}

interface PolygonGeometry {
  type: 'Polygon';
  coordinates: number[][][];
}

interface MultiPolygonGeometry {
  type: 'MultiPolygon';
  coordinates: number[][][][];
}

interface Bounds {
  minLng: number;
  maxLng: number;
  minLat: number;
  maxLat: number;
  center: [number, number];
}

export default function Map({ center = [-74.5, 40], zoom = 9 }: MapProps) {
  const { user } = useAuth();
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const geocoderContainerRef = useRef<HTMLDivElement>(null);
  const [hoveredCountryId, setHoveredCountryId] = useState<string | null>(null);
  const currentHoveredId = useRef<string | null>(null);
  const [tooltip, setTooltip] = useState<{ countryName: string; x: number; y: number } | null>(null);
  const [is2DView, setIs2DView] = useState(false);
  const markers = useRef<mapboxgl.Marker[]>([]);
  const [savedLocations, setSavedLocations] = useState<SavedLocation[]>([]);
  const isTransitioning = useRef(false);
  const lastViewState = useRef({ is2D: false, zoom: 0 });
  const styleChangeTimeout = useRef<NodeJS.Timeout | null>(null);
  const pendingStyleChange = useRef<string | null>(null);

  // Function to add custom layers
  const addCustomLayers = () => {
    if (!map.current) return;

    // Remove existing sources and layers if they exist
    if (map.current.getSource('countries')) {
      map.current.removeLayer('country-borders');
      map.current.removeLayer('country-boundaries');
      map.current.removeSource('countries');
    }

    // Add country boundaries source
    map.current.addSource('countries', {
      type: 'vector',
      url: 'mapbox://mapbox.country-boundaries-v1'
    });

    // Add country boundaries layer
    map.current.addLayer({
      'id': 'country-boundaries',
      'type': 'fill',
      'source': 'countries',
      'source-layer': 'country_boundaries',
      'paint': {
        'fill-color': [
          'case',
          ['boolean', ['feature-state', 'hover'], false],
          '#ff0000',
          '#e6e6e6'
        ],
        'fill-opacity': [
          'case',
          ['boolean', ['feature-state', 'hover'], false],
          0.8,
          0.4
        ]
      }
    });

    // Add country borders
    map.current.addLayer({
      'id': 'country-borders',
      'type': 'line',
      'source': 'countries',
      'source-layer': 'country_boundaries',
      'paint': {
        'line-color': '#ffffff',
        'line-width': 1
      }
    });
  };

  // Function to toggle marker visibility
  const toggleMarkersVisibility = (visible: boolean) => {
    markers.current.forEach(marker => {
      const element = marker.getElement();
      element.style.display = visible ? 'block' : 'none';
    });
  };

  // Function to handle zoom-based view switching
  const handleZoomChange = () => {
    if (!map.current || isTransitioning.current) return;

    const currentZoom = map.current.getZoom();
    const isCurrently2D = is2DView;
    const shouldBe2D = currentZoom >= 2.5;

    // Debug logging for view state changes
    console.log('DEBUG: View State Check:', {
      currentZoom,
      isCurrently2D,
      shouldBe2D,
      isTransitioning: isTransitioning.current,
      lastState: lastViewState.current
    });

    // Only trigger view change if we're crossing the threshold
    if (isCurrently2D !== shouldBe2D) {
      isTransitioning.current = true;
      
      // Clear any pending style changes
      if (styleChangeTimeout.current) {
        clearTimeout(styleChangeTimeout.current);
      }

      console.log('DEBUG: Switching View:', {
        from: isCurrently2D ? '2D' : '3D',
        to: shouldBe2D ? '2D' : '3D',
        zoom: currentZoom
      });

      // Update state first
      setIs2DView(shouldBe2D);
      
      // Store the pending style change
      pendingStyleChange.current = shouldBe2D 
        ? 'mapbox://styles/mapbox/streets-v12'
        : 'mapbox://styles/mapbox/light-v11';

      // Update zoom constraints based on the new view
      if (shouldBe2D) {
        // When switching to 2D, allow zooming in further
        map.current.setMinZoom(1.5);
        map.current.setMaxZoom(10);
      } else {
        // When switching to 3D, maintain globe view constraints
        map.current.setMinZoom(1.5);
        map.current.setMaxZoom(3);
      }

      // Update last view state
      lastViewState.current = {
        is2D: shouldBe2D,
        zoom: currentZoom
      };

      // Apply style change after a short delay
      styleChangeTimeout.current = setTimeout(() => {
        if (pendingStyleChange.current) {
          handleStyleChange(pendingStyleChange.current, !shouldBe2D);
          pendingStyleChange.current = null;
        }
        isTransitioning.current = false;
        console.log('DEBUG: View Transition Complete:', {
          newView: shouldBe2D ? '2D' : '3D',
          currentZoom: map.current?.getZoom(),
          projection: map.current?.getProjection(),
          is2D: is2DView
        });
      }, 100);
    }
  };

  // Function to handle style change
  const handleStyleChange = (newStyle: string, isGlobeView: boolean = false) => {
    if (!map.current) return;

    console.log('DEBUG: Style Change:', {
      from: map.current.getStyle().name,
      to: newStyle,
      isGlobeView,
      currentZoom: map.current.getZoom(),
      is2D: is2DView
    });

    // Change style
    map.current.setStyle(newStyle);

    // Set projection based on view type
    map.current.setProjection(isGlobeView ? 'globe' : 'mercator');

    // Toggle markers visibility based on view
    toggleMarkersVisibility(!isGlobeView);

    // Wait for style to load
    map.current.once('style.load', () => {
      console.log('DEBUG: Style Loaded:', {
        style: newStyle,
        projection: map.current?.getProjection(),
        zoom: map.current?.getZoom(),
        is2D: is2DView
      });

      // Re-add custom layers
      addCustomLayers();

      // Ensure zoom constraints are set correctly after style change
      if (is2DView) {
        map.current?.setMinZoom(1.5);
        map.current?.setMaxZoom(10);
      } else {
        map.current?.setMinZoom(1.5);
        map.current?.setMaxZoom(3);
      }
    });
  };

  // Function to check if a location already exists
  const isLocationExists = (coordinates: [number, number]): boolean => {
    return savedLocations.some(loc => 
      Math.abs(loc.coordinates[0] - coordinates[0]) < 0.0001 && 
      Math.abs(loc.coordinates[1] - coordinates[1]) < 0.0001
    );
  };

  // Function to save location to user profile
  const saveLocation = (coordinates: [number, number], name: string) => {
    if (!user || isLocationExists(coordinates)) return;

    const newLocation: SavedLocation = {
      id: Date.now().toString(),
      name,
      coordinates,
      createdAt: new Date()
    };

    const updatedUser = {
      ...user,
      savedLocations: [...user.savedLocations, newLocation]
    };
    
    // Update localStorage
    localStorage.setItem('user', JSON.stringify(updatedUser));
    
    // Update users array in localStorage
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const idx = users.findIndex((u: any) => u.email === user.email);
    if (idx !== -1) {
      users[idx] = updatedUser;
      localStorage.setItem('users', JSON.stringify(users));
    }

    // Update local state
    setSavedLocations(prev => [...prev, newLocation]);
  };

  // Function to add a marker
  const addMarker = (lngLat: [number, number], name?: string) => {
    if (!map.current || isLocationExists(lngLat)) return;

    console.log('DEBUG: Adding marker:', {
      coordinates: lngLat,
      name,
      is2D: is2DView,
      currentZoom: map.current.getZoom()
    });

    const marker = new mapboxgl.Marker({
      color: "#FF0000",
      draggable: true
    })
      .setLngLat(lngLat)
      .addTo(map.current);

    markers.current.push(marker);
    
    // Add click event to remove marker
    marker.getElement().addEventListener('click', () => {
      marker.remove();
      markers.current = markers.current.filter(m => m !== marker);
      // Remove from saved locations
      setSavedLocations(prev => prev.filter(loc => 
        loc.coordinates[0] !== lngLat[0] || loc.coordinates[1] !== lngLat[1]
      ));
    });

    // If name is provided, save the location
    if (name) {
      saveLocation(lngLat, name);
    }
  };

  // Function to load saved locations
  const loadSavedLocations = () => {
    if (!user || !map.current) return;
    setSavedLocations(user.savedLocations);
    user.savedLocations.forEach(location => {
      addMarker(location.coordinates, location.name);
    });
  };

  useEffect(() => {
    if (!mapContainer.current) return;

    console.log('DEBUG: Initializing Map:', {
      center,
      zoom,
      style: 'mapbox://styles/mapbox/light-v11'
    });

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/light-v11',
      center: center,
      zoom: 2,
      interactive: true,
      dragRotate: true,
      minZoom: 1.5,
      maxZoom: 3,
      projection: 'globe',
      doubleClickZoom: false
    });

    // Add event listener for flyToLocation
    const handleFlyToLocation = (event: CustomEvent) => {
      if (!map.current) return;
      const { coordinates, zoom } = event.detail;
      map.current.flyTo({
        center: coordinates,
        zoom: zoom,
        duration: 2000
      });
    };

    window.addEventListener('flyToLocation', handleFlyToLocation as EventListener);

    // Add geocoder control
    const geocoder = new MapboxGeocoder({
      accessToken: mapboxgl.accessToken as string,
      mapboxgl: mapboxgl as any,
      placeholder: 'Search for a location',
      marker: false,
    });

    // Add geocoder to the map
    if (geocoderContainerRef.current) {
      geocoderContainerRef.current.appendChild(geocoder.onAdd(map.current));
    }

    // Handle geocoder result
    geocoder.on('result', (event: any) => {
      const currentZoom = map.current?.getZoom() || 0;
      if (currentZoom < 2.5) {
        alert('Please zoom in to add pins');
        return;
      }
      const coordinates = event.result.center as [number, number];
      const name = event.result.place_name;
      if (!isLocationExists(coordinates)) {
        addMarker(coordinates, name);
        map.current?.flyTo({
          center: coordinates,
          zoom: 12
        });
      }
    });

    map.current.on('load', () => {
      console.log('DEBUG: Map Loaded:', {
        initialZoom: map.current?.getZoom(),
        projection: map.current?.getProjection(),
        style: map.current?.getStyle().name,
        is2D: is2DView
      });

      addCustomLayers();
      loadSavedLocations();
      toggleMarkersVisibility(is2DView);

      // Add zoom change listener with debounce
      let zoomTimeout: NodeJS.Timeout;
      map.current?.on('zoom', () => {
        clearTimeout(zoomTimeout);
        zoomTimeout = setTimeout(() => {
          handleZoomChange();
        }, 100);
      });

      // Add continuous zoom level logging
      map.current?.on('zoom', () => {
        console.log('DEBUG: Current Zoom:', {
          level: map.current?.getZoom(),
          is2D: is2DView,
          projection: map.current?.getProjection()
        });
      });

      // Add hover interactions
      map.current?.on('mousemove', 'country-boundaries', (e) => {
        if (e.features && e.features.length > 0) {
          const newCountryId = e.features[0].id as string;
          const countryName = e.features[0].properties?.name_en || 'Unknown Country';
          
          if (currentHoveredId.current) {
            map.current?.setFeatureState(
              { source: 'countries', sourceLayer: 'country_boundaries', id: currentHoveredId.current },
              { hover: false }
            );
          }
          
          currentHoveredId.current = newCountryId;
          setHoveredCountryId(newCountryId);
          setTooltip({
            countryName,
            x: e.point.x,
            y: e.point.y
          });
          
          map.current?.setFeatureState(
            { source: 'countries', sourceLayer: 'country_boundaries', id: newCountryId },
            { hover: true }
          );
        }
      });

      map.current?.on('mouseleave', 'country-boundaries', () => {
        if (currentHoveredId.current) {
          map.current?.setFeatureState(
            { source: 'countries', sourceLayer: 'country_boundaries', id: currentHoveredId.current },
            { hover: false }
          );
        }
        currentHoveredId.current = null;
        setHoveredCountryId(null);
        setTooltip(null);
      });

      // Add click event to place markers
      map.current?.on('click', (e) => {
        const currentZoom = map.current?.getZoom() || 0;
        console.log('DEBUG: Map click:', {
          is2D: is2DView,
          currentZoom,
          coordinates: [e.lngLat.lng, e.lngLat.lat]
        });

        if (currentZoom < 2.5) {
          alert('Please zoom in to add pins');
          return;
        }

        const coordinates: [number, number] = [e.lngLat.lng, e.lngLat.lat];
        if (!isLocationExists(coordinates)) {
          const name = prompt('Enter a name for this location:');
          if (name) {
            addMarker(coordinates, name);
          }
        }
      });
    });

    return () => {
      if (styleChangeTimeout.current) {
        clearTimeout(styleChangeTimeout.current);
      }
      window.removeEventListener('flyToLocation', handleFlyToLocation as EventListener);
      map.current?.remove();
      markers.current.forEach(marker => marker.remove());
    };
  }, [user]);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <div ref={geocoderContainerRef} style={{ position: 'absolute', top: '10px', left: '10px', zIndex: 1 }} />
      <div ref={mapContainer} style={{ width: '100%', height: '100%' }} />
      {tooltip && <MapTooltip {...tooltip} />}
    </div>
  );
} 