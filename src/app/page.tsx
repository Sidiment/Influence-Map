'use client';

import { useState, useEffect } from 'react';
import Map, { Marker, NavigationControl } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { getUserInfo, getUserVideos, extractLocation } from '@/utils/bilibili';

interface Location {
  id: string;
  name: string;
  coordinates: [number, number];
  timestamp: string;
  videoTitle: string;
}

export default function Home() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [selectedInfluencer, setSelectedInfluencer] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userInfo, setUserInfo] = useState<{ name: string; face: string } | null>(null);

  const trackInfluencer = async () => {
    if (!selectedInfluencer) {
      setError('Please enter a Bilibili influencer ID');
      return;
    }

    setLoading(true);
    setError(null);
    setLocations([]);
    setUserInfo(null);

    try {
      const user = await getUserInfo(selectedInfluencer);
      if (!user) {
        setError('Could not find the influencer');
        return;
      }

      setUserInfo({ name: user.name, face: user.face });

      const videos = await getUserVideos(selectedInfluencer);
      if (videos.length === 0) {
        setError('No videos found for this influencer');
        return;
      }

      const newLocations: Location[] = [];
      let locationCount = 0;

      for (const video of videos) {
        if (locationCount >= 10) break; // Limit to 10 locations for performance
        
        if (video.desc) {
          const coordinates = extractLocation(video.desc);
          if (coordinates) {
            newLocations.push({
              id: video.aid,
              name: user.name,
              coordinates,
              timestamp: new Date().toISOString(),
              videoTitle: video.title
            });
            locationCount++;
          }
        }
      }

      if (newLocations.length === 0) {
        setError('No locations found in the influencer\'s videos');
        return;
      }

      setLocations(newLocations);
    } catch (err) {
      console.error('Error:', err);
      setError('An error occurred while tracking the influencer. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="w-full h-screen">
      <div className="absolute top-4 left-4 z-10 bg-white p-4 rounded-lg shadow-lg max-w-sm">
        <h1 className="text-2xl font-bold mb-4">Bilibili Influencer Tracker</h1>
        <div className="space-y-4">
          <input
            type="text"
            placeholder="Enter Bilibili influencer ID"
            className="w-full p-2 border rounded"
            value={selectedInfluencer}
            onChange={(e) => setSelectedInfluencer(e.target.value)}
          />
          <button
            className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 disabled:bg-blue-300"
            onClick={trackInfluencer}
            disabled={loading}
          >
            {loading ? 'Tracking...' : 'Track Influencer'}
          </button>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          {userInfo && (
            <div className="mt-4">
              <h2 className="font-semibold">Influencer: {userInfo.name}</h2>
              {locations.length > 0 && (
                <div className="mt-2">
                  <h3 className="font-semibold">Locations Found:</h3>
                  <ul className="mt-2 space-y-2">
                    {locations.map((location) => (
                      <li key={location.id} className="text-sm">
                        {location.videoTitle}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <Map
        mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
        initialViewState={{
          longitude: 116.4074,
          latitude: 39.9042,
          zoom: 4
        }}
        style={{ width: '100%', height: '100%' }}
        mapStyle="mapbox://styles/mapbox/streets-v12"
      >
        <NavigationControl />
        {locations.map((location) => (
          <Marker
            key={location.id}
            longitude={location.coordinates[0]}
            latitude={location.coordinates[1]}
          >
            <div className="bg-red-500 w-4 h-4 rounded-full border-2 border-white" />
          </Marker>
        ))}
      </Map>
    </main>
  );
} 