import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import MapTooltip from './MapTooltip';
import MapboxGeocoder from '@mapbox/mapbox-gl-geocoder';
import '@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css';

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
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const geocoderContainerRef = useRef<HTMLDivElement>(null);
  const [hoveredCountryId, setHoveredCountryId] = useState<string | null>(null);
  const currentHoveredId = useRef<string | null>(null);
  const [tooltip, setTooltip] = useState<{ countryName: string; x: number; y: number } | null>(null);
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const selectedCountryRef = useRef<string | null>(null);
  const lastClickTime = useRef<number>(0);
  const CLICK_COOLDOWN = 1000; // 1 second cooldown between clicks
  const [is2DView, setIs2DView] = useState(false);
  const markers = useRef<mapboxgl.Marker[]>([]);

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
          ['boolean', ['feature-state', 'selected'], false],
          '#ff6b6b',
          '#e6e6e6'
        ],
        'fill-opacity': [
          'case',
          ['boolean', ['feature-state', 'hover'], false],
          0.8,
          ['boolean', ['feature-state', 'selected'], false],
          0.7,
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

  // Function to handle style change
  const handleStyleChange = (newStyle: string, isGlobeView: boolean = false) => {
    if (!map.current) return;

    // Store current selection state
    const currentSelection = selectedCountryRef.current;

    // Change style
    map.current.setStyle(newStyle);

    // Set projection based on view type
    map.current.setProjection(isGlobeView ? 'globe' : 'mercator');
    console.log('DEBUG: Switching view with zoom range:', {
      view: isGlobeView ? 'globe' : '2D',
      minZoom: map.current.getMinZoom(),
      maxZoom: map.current.getMaxZoom(),
      currentZoom: map.current.getZoom(),
      projection: map.current.getProjection()
    });

    // Wait for style to load
    map.current.once('style.load', () => {
      // Re-add custom layers
      addCustomLayers();

      // Restore selection if there was one
      if (currentSelection) {
        try {
          map.current?.setFeatureState(
            { source: 'countries', sourceLayer: 'country_boundaries', id: currentSelection },
            { selected: true }
          );
        } catch (error) {
          console.error('DEBUG: Error restoring selection state:', error);
        }
      }
    });
  };

  // Function to reset selection
  const resetSelection = () => {
    if (selectedCountryRef.current) {
      console.log('DEBUG: Resetting selection for country:', selectedCountryRef.current);
      try {
        map.current?.setFeatureState(
          { source: 'countries', sourceLayer: 'country_boundaries', id: selectedCountryRef.current },
          { selected: false }
        );
        console.log('DEBUG: Successfully reset feature state for:', selectedCountryRef.current);
      } catch (error) {
        console.error('DEBUG: Error resetting feature state:', error);
      }
      selectedCountryRef.current = null;
      setSelectedCountry(null);
      setIs2DView(false);
    }
  };

  // Function to set selection
  const setSelection = (countryId: string) => {
    console.log('DEBUG: Setting selection for country:', countryId);
    console.log('DEBUG: Current selected country:', selectedCountryRef.current);
    
    // First reset any existing selection
    resetSelection();
    
    // Then set the new selection
    try {
      selectedCountryRef.current = countryId;
      setSelectedCountry(countryId);
      map.current?.setFeatureState(
        { source: 'countries', sourceLayer: 'country_boundaries', id: countryId },
        { selected: true }
      );
      console.log('DEBUG: Successfully set feature state for:', countryId);
      setIs2DView(true);
    } catch (error) {
      console.error('DEBUG: Error setting feature state:', error);
    }
  };

  // Function to calculate bounds from coordinates
  const calculateBounds = (coordinates: number[][]): Bounds => {
    let minLng = Infinity;
    let maxLng = -Infinity;
    let minLat = Infinity;
    let maxLat = -Infinity;

    coordinates.forEach((coord: number[]) => {
      minLng = Math.min(minLng, coord[0]);
      maxLng = Math.max(maxLng, coord[0]);
      minLat = Math.min(minLat, coord[1]);
      maxLat = Math.max(maxLat, coord[1]);
    });

    return {
      minLng,
      maxLng,
      minLat,
      maxLat,
      center: [(minLng + maxLng) / 2, (minLat + maxLat) / 2] as [number, number]
    };
  };

  // Function to calculate appropriate zoom level based on bounds
  const calculateZoomLevel = (bounds: Bounds) => {
    const lngDiff = Math.abs(bounds.maxLng - bounds.minLng);
    const latDiff = Math.abs(bounds.maxLat - bounds.minLat);
    const maxDiff = Math.max(lngDiff, latDiff);
    
    // Adjust zoom level based on the size of the country
    if (maxDiff > 100) return 1.5; // Very large countries
    if (maxDiff > 50) return 2; // Large countries
    if (maxDiff > 20) return 2.5; // Medium countries
    if (maxDiff > 10) return 3; // Small countries
    return 3.5; // Very small countries
  };

  // Function to adjust center for large countries
  const adjustCenterForLargeCountries = (bounds: Bounds, countryName: string): [number, number] => {
    const lngDiff = Math.abs(bounds.maxLng - bounds.minLng);
    const latDiff = Math.abs(bounds.maxLat - bounds.minLat);
    const maxDiff = Math.max(lngDiff, latDiff);

    // Special handling for very large countries
    if (maxDiff > 100) {
      switch (countryName) {
        case 'Russia':
          return [100, 60];
        case 'United States':
          return [-95, 40];
        case 'Canada':
          return [-100, 60];
        case 'China':
          return [105, 35];
        default:
          return bounds.center;
      }
    }
    return bounds.center;
  };

  // Function to add a marker
  const addMarker = (lngLat: [number, number]) => {
    if (!map.current) return;

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
    });
  };

  useEffect(() => {
    if (!mapContainer.current) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/light-v11',
      center: center,
      zoom: 2,
      interactive: true,
      dragRotate: true,
    });

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
      const coordinates = event.result.center as [number, number];
      addMarker(coordinates);
      map.current?.flyTo({
        center: coordinates,
        zoom: 12
      });
    });

    // Add click event to place markers
    map.current.on('click', (e) => {
      addMarker([e.lngLat.lng, e.lngLat.lat]);
    });

    map.current.on('load', () => {
      console.log('DEBUG: Map loaded successfully');
      addCustomLayers();

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

      // Add click interaction
      map.current?.on('click', 'country-boundaries', (e) => {
        const now = Date.now();
        if (now - lastClickTime.current < CLICK_COOLDOWN) {
          console.log('DEBUG: Click ignored - cooldown period');
          return;
        }
        lastClickTime.current = now;

        if (e.features && e.features.length > 0) {
          const clickedCountryId = e.features[0].id as string;
          const clickedCountry = e.features[0];
          const countryName = clickedCountry.properties?.name_en || 'Unknown Country';
          
          console.log('DEBUG: Click event details:', {
            clickedCountryId,
            selectedCountry: selectedCountryRef.current,
            countryName,
            featureState: map.current?.getFeatureState({ source: 'countries', sourceLayer: 'country_boundaries', id: clickedCountryId })
          });
          
          // If clicking the same country, ignore
          if (clickedCountryId === selectedCountryRef.current) {
            console.log('DEBUG: Click ignored - same country');
            return;
          }
          
          console.log('DEBUG: Country clicked:', {
            id: clickedCountryId,
            name: countryName,
            geometryType: clickedCountry.geometry.type,
            geometry: clickedCountry.geometry,
            properties: clickedCountry.properties
          });

          // Set new selection
          setSelection(clickedCountryId);

          // Calculate bounds from geometry
          if (clickedCountry.geometry) {
            let bounds;
            if (clickedCountry.geometry.type === 'Polygon') {
              const geometry = clickedCountry.geometry as PolygonGeometry;
              bounds = calculateBounds(geometry.coordinates[0]);
            } else if (clickedCountry.geometry.type === 'MultiPolygon') {
              const geometry = clickedCountry.geometry as MultiPolygonGeometry;
              // Use the first polygon for now
              bounds = calculateBounds(geometry.coordinates[0][0]);
            }

            if (bounds) {
              const zoomLevel = calculateZoomLevel(bounds);
              const adjustedCenter = adjustCenterForLargeCountries(bounds, countryName);
              
              console.log('DEBUG: Calculated bounds and zoom:', {
                ...bounds,
                zoomLevel,
                adjustedCenter,
                currentZoom: map.current?.getZoom()
              });

              // First transition to 2D view
              map.current?.easeTo({
                center: adjustedCenter,
                zoom: zoomLevel,
                duration: 2000, // Longer duration for smoother transition
                essential: true,
                pitch: 0,
                bearing: 0
              });

              // Then change the style and projection to 2D
              setTimeout(() => {
                if (map.current) {
                  // Update zoom constraints for 2D view
                  map.current.setMinZoom(4);
                  map.current.setMaxZoom(10);
                  // Change to 2D style
                  handleStyleChange('mapbox://styles/mapbox/streets-v12', false);
                }
              }, 1000);
            }
          } else {
            console.warn('DEBUG: No valid geometry found for country:', clickedCountryId);
          }
        }
      });

      // Add click outside to reset
      map.current?.on('click', (e) => {
        const features = map.current?.queryRenderedFeatures(e.point, {
          layers: ['country-boundaries']
        });
        
        if (!features || features.length === 0) {
          console.log('DEBUG: Clicking outside - resetting view');
          resetSelection();
          
          // Reset to global view with default zoom
          map.current?.easeTo({
            center: [-74.5, 40],
            zoom: 2,
            duration: 2000, // Longer duration for smoother transition
            essential: true,
            pitch: 0,
            bearing: 0
          });

          // Reset to globe view
          setTimeout(() => {
            if (map.current) {
              // Reset zoom constraints for globe view
              map.current.setMinZoom(1.5);
              map.current.setMaxZoom(4);
              // Change back to globe projection
              handleStyleChange('mapbox://styles/mapbox/light-v11', true);
            }
          }, 1000);
        }
      });

      // Add zoom change listener to track zoom levels (with debounce)
      let zoomTimeout: NodeJS.Timeout;
      map.current?.on('zoom', () => {
        if (map.current) {
          clearTimeout(zoomTimeout);
          zoomTimeout = setTimeout(() => {
            console.log('DEBUG: Current view state:', {
              projection: map.current?.getProjection(),
              zoom: map.current?.getZoom(),
              minZoom: map.current?.getMinZoom(),
              maxZoom: map.current?.getMaxZoom()
            });
          }, 100); // Only log after zoom has stopped for 100ms
        }
      });
    });

    return () => {
      map.current?.remove();
      markers.current.forEach(marker => marker.remove());
    };
  }, []);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <div ref={geocoderContainerRef} style={{ position: 'absolute', top: '10px', left: '10px', zIndex: 1 }} />
      <div ref={mapContainer} style={{ width: '100%', height: '100%' }} />
      {tooltip && <MapTooltip {...tooltip} />}
    </div>
  );
} 