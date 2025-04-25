import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import MapTooltip from './MapTooltip';

mapboxgl.accessToken = 'pk.eyJ1Ijoic2lkaW1lbnQiLCJhIjoiY205ZGVzNDVkMTJ5eTJ0b2RsNTJqaHp6ZCJ9.aIWJ0AlaJti6TsSEEYeHPg';

interface MapProps {
  center?: [number, number];
  zoom?: number;
}

export default function Map({ center = [-74.5, 40], zoom = 9 }: MapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [hoveredCountryId, setHoveredCountryId] = useState<string | null>(null);
  const currentHoveredId = useRef<string | null>(null);
  const [tooltip, setTooltip] = useState<{ countryName: string; x: number; y: number } | null>(null);

  useEffect(() => {
    if (!mapContainer.current) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/light-v11',
      center: center,
      zoom: 2,
      interactive: true,
      dragRotate: false,
      dragPan: true,
      scrollZoom: true,
      doubleClickZoom: false,
      touchZoomRotate: false,
      keyboard: false,
      boxZoom: false,
      minZoom: 1.5,          // lock zoom level
      maxZoom: 3
    });

    map.current.on('load', () => {
      // Add country boundaries source
      map.current?.addSource('countries', {
        type: 'vector',
        url: 'mapbox://mapbox.country-boundaries-v1'
      });

      // Add country boundaries layer
      map.current?.addLayer({
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
      map.current?.addLayer({
        'id': 'country-borders',
        'type': 'line',
        'source': 'countries',
        'source-layer': 'country_boundaries',
        'paint': {
          'line-color': '#ffffff',
          'line-width': 1
        }
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
    });

    return () => {
      map.current?.remove();
    };
  }, []);

  return (
    <div className="relative w-full h-full">
      <div ref={mapContainer} className="w-full h-full rounded-lg overflow-hidden" />
      {tooltip && (
        <MapTooltip
          countryName={tooltip.countryName}
          x={tooltip.x}
          y={tooltip.y}
        />
      )}
    </div>
  );
} 