'use client';

import { useState } from 'react';
import Map from '@/components/Map';
import ProfileCard from '@/components/ProfileCard';
import SearchBar from '@/components/SearchBar';

// Sample data - replace with real data later
const sampleProfiles = [
  { id: 1, name: 'John Doe', image: 'https://i.pravatar.cc/150?img=1', location: 'New York', coordinates: [-74.006, 40.7128] as [number, number] },
  { id: 2, name: 'Jane Smith', image: 'https://i.pravatar.cc/150?img=2', location: 'Los Angeles', coordinates: [-118.2437, 34.0522] as [number, number] },
  { id: 3, name: 'Mike Johnson', image: 'https://i.pravatar.cc/150?img=3', location: 'Chicago', coordinates: [-87.6298, 41.8781] as [number, number] },
  { id: 4, name: 'Sarah Williams', image: 'https://i.pravatar.cc/150?img=4', location: 'Houston', coordinates: [-95.3698, 29.7604] as [number, number] },
  { id: 5, name: 'David Brown', image: 'https://i.pravatar.cc/150?img=5', location: 'Phoenix', coordinates: [-112.0740, 33.4484] as [number, number] },
];

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProfile, setSelectedProfile] = useState<number | null>(null);

  const filteredProfiles = sampleProfiles.filter(profile =>
    profile.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    profile.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const defaultCenter: [number, number] = [-95.7129, 37.0902];

  return (
    <div className="flex h-screen">
      {/* Left sidebar with profiles */}
      <div className="w-1/3 p-4 bg-gray-50 dark:bg-gray-800 overflow-y-auto">
        <SearchBar onSearch={setSearchQuery} />
        <div className="space-y-2">
          {filteredProfiles.map(profile => (
            <ProfileCard
              key={profile.id}
              name={profile.name}
              image={profile.image}
              location={profile.location}
              onClick={() => setSelectedProfile(profile.id)}
            />
          ))}
        </div>
      </div>

      {/* Right side map */}
      <div className="w-2/3 p-4">
        <Map
          center={selectedProfile 
            ? sampleProfiles.find(p => p.id === selectedProfile)?.coordinates 
            : defaultCenter}
          zoom={selectedProfile ? 12 : 4}
        />
      </div>
    </div>
  );
}
