import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { AuthForm } from './AuthForm';
import { SavedLocation, User } from '../types/user';
import { INFLUENCERS, Influencer } from '../data/influencers';

function getUserAvatar(email: string) {
  // Use pravatar with hash of email for demo
  return `https://i.pravatar.cc/150?u=${encodeURIComponent(email)}`;
}

export const Sidebar: React.FC = () => {
  const { user, logout } = useAuth();
  const [search, setSearch] = useState('');
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedLocations, setSelectedLocations] = useState<Set<string>>(new Set());
  const [expandedUser, setExpandedUser] = useState<string | null>(null);

  if (!user) {
    return (
      <div className="w-80 h-full bg-white shadow-lg p-4">
        <AuthForm />
      </div>
    );
  }

  // Get all users except current user
  const allUsers: User[] = JSON.parse(localStorage.getItem('users') || '[]').filter((u: User) => u.email !== user.email);
  // Map users to influencer-like objects for search
  const userAsInfluencer: Influencer[] = allUsers.map(u => ({
    id: u.id,
    name: u.username,
    location: u.email,
    avatar: getUserAvatar(u.email),
  }));

  // Merge influencers and users
  const allSearchables: Influencer[] = [...INFLUENCERS, ...userAsInfluencer];

  // Filter by search
  const filteredInfluencers = allSearchables.filter(
    (inf) =>
      inf.name.toLowerCase().includes(search.toLowerCase()) ||
      inf.location.toLowerCase().includes(search.toLowerCase())
  );

  // Follow/unfollow logic
  const isFollowing = (id: string) => user.followedInfluencers.includes(id);

  const handleFollow = (id: string) => {
    if (!isFollowing(id)) {
      const updatedUser = {
        ...user,
        followedInfluencers: [...user.followedInfluencers, id],
      };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      // Also update users array in localStorage
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      const idx = users.findIndex((u: any) => u.email === user.email);
      if (idx !== -1) {
        users[idx] = updatedUser;
        localStorage.setItem('users', JSON.stringify(users));
      }
      window.location.reload();
    }
  };

  const handleUnfollow = (id: string) => {
    if (isFollowing(id)) {
      const updatedUser = {
        ...user,
        followedInfluencers: user.followedInfluencers.filter((fid) => fid !== id),
      };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      // Also update users array in localStorage
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      const idx = users.findIndex((u: any) => u.email === user.email);
      if (idx !== -1) {
        users[idx] = updatedUser;
        localStorage.setItem('users', JSON.stringify(users));
      }
      window.location.reload();
    }
  };

  // For displaying followed influencers (from both sources)
  const allById: { [id: string]: Influencer } = {};
  allSearchables.forEach(i => { allById[i.id] = i; });

  // Function to get saved locations for a followed user/influencer
  const getSavedLocations = (id: string): SavedLocation[] => {
    const influencer = allById[id];
    if (influencer?.savedLocations) {
      return influencer.savedLocations;
    }
    const followedUser = allUsers.find(u => u.id === id);
    return followedUser?.savedLocations || [];
  };

  // Function to select a location
  const selectLocation = (locationId: string) => {
    if (!isEditMode) return;
    setSelectedLocations(prev => {
      const newSet = new Set(prev);
      if (newSet.has(locationId)) {
        newSet.delete(locationId);
      } else {
        newSet.add(locationId);
      }
      return newSet;
    });
  };

  // Function to select all locations
  const selectAllLocations = () => {
    if (!isEditMode) return;
    setSelectedLocations(new Set(user.savedLocations.map(loc => loc.id)));
  };

  // Function to deselect all locations
  const deselectAllLocations = () => {
    if (!isEditMode) return;
    setSelectedLocations(new Set());
  };

  // Function to delete selected locations
  const deleteSelectedLocations = () => {
    if (!user || selectedLocations.size === 0 || !isEditMode) return;

    // Update saved locations
    const updatedLocations = user.savedLocations.filter(loc => !selectedLocations.has(loc.id));

    // Update user profile
    const updatedUser = {
      ...user,
      savedLocations: updatedLocations
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

    // Clear selection and exit edit mode
    setSelectedLocations(new Set());
    setIsEditMode(false);

    // Force a page reload to refresh the sidebar
    window.location.reload();
  };

  // Function to toggle edit mode
  const toggleEditMode = () => {
    setIsEditMode(!isEditMode);
    if (!isEditMode) {
      setSelectedLocations(new Set());
    }
  };

  // Function to fly to a location
  const flyToLocation = (location: SavedLocation) => {
    if (isEditMode) return;
    
    // Dispatch a custom event that the Map component will listen for
    const event = new CustomEvent('flyToLocation', {
      detail: {
        coordinates: location.coordinates,
        zoom: 12
      }
    });
    window.dispatchEvent(event);
  };

  // Function to add a location from followed user
  const addLocationFromUser = (location: SavedLocation) => {
    if (!user) return;

    // Check if location already exists
    const locationExists = user.savedLocations.some(
      loc => loc.coordinates[0] === location.coordinates[0] && 
             loc.coordinates[1] === location.coordinates[1]
    );

    if (locationExists) return;

    // Add location to user's saved locations
    const updatedUser = {
      ...user,
      savedLocations: [...user.savedLocations, location]
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

    // Force a page reload to refresh the sidebar
    window.location.reload();
  };

  // Function to toggle expanded user view
  const toggleExpandedUser = (userId: string) => {
    setExpandedUser(expandedUser === userId ? null : userId);
  };

  return (
    <div className="w-80 h-full bg-white shadow-lg p-4 flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">Welcome, {user.username}</h2>
        <button
          onClick={logout}
          className="text-sm text-red-600 hover:text-red-500"
        >
          Logout
        </button>
      </div>

      {/* Influencer/User Search and Follow */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search influencers or users..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full px-3 py-2 mb-2 rounded border border-gray-300"
        />
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {filteredInfluencers.map((inf) => (
            <div key={inf.id} className="flex items-center justify-between bg-gray-50 rounded p-2">
              <div className="flex items-center">
                <img src={inf.avatar} alt={inf.name} className="w-8 h-8 rounded-full mr-2" />
                <div>
                  <div className="font-medium">{inf.name}</div>
                  <div className="text-xs text-gray-500">{inf.location}</div>
                </div>
              </div>
              {isFollowing(inf.id) ? (
                <button
                  onClick={() => handleUnfollow(inf.id)}
                  className="text-xs text-white bg-red-500 hover:bg-red-600 px-2 py-1 rounded"
                >
                  Unfollow
                </button>
              ) : (
                <button
                  onClick={() => handleFollow(inf.id)}
                  className="text-xs text-white bg-blue-500 hover:bg-blue-600 px-2 py-1 rounded"
                >
                  Follow
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Followed Influencers/Users</h3>
        {user.followedInfluencers.length > 0 ? (
          <ul className="space-y-2">
            {user.followedInfluencers.map((fid) => {
              const inf = allById[fid];
              const savedLocations = getSavedLocations(fid);
              return inf ? (
                <li key={fid} className="bg-gray-50 rounded p-2">
                  <div 
                    className="flex items-center justify-between cursor-pointer"
                    onClick={() => toggleExpandedUser(fid)}
                  >
                    <div className="flex items-center">
                      <img src={inf.avatar} alt={inf.name} className="w-6 h-6 rounded-full mr-2" />
                      <span>{inf.name}</span>
                    </div>
                    <button className="text-gray-500">
                      {expandedUser === fid ? '▼' : '▶'}
                    </button>
                  </div>
                  {expandedUser === fid && savedLocations.length > 0 && (
                    <div className="mt-2 pl-8">
                      <h4 className="text-sm font-medium mb-2">Saved Locations:</h4>
                      <ul className="space-y-2">
                        {savedLocations.map((location) => (
                          <li key={location.id} className="bg-white rounded p-2">
                            <div className="flex justify-between items-center">
                              <div>
                                <div className="font-medium">{location.name}</div>
                                <div className="text-xs text-gray-500">
                                  {location.coordinates[0].toFixed(4)}, {location.coordinates[1].toFixed(4)}
                                </div>
                                {location.description && (
                                  <div className="text-xs text-gray-600 mt-1">{location.description}</div>
                                )}
                              </div>
                              <button
                                onClick={() => addLocationFromUser(location)}
                                className="px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-xs"
                              >
                                Add
                              </button>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </li>
              ) : null;
            })}
          </ul>
        ) : (
          <p className="text-gray-500">No followed influencers or users yet</p>
        )}
      </div>

      <div>
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-lg font-semibold">Saved Locations</h3>
          <button
            onClick={toggleEditMode}
            className={`px-3 py-1 rounded text-white ${
              isEditMode ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'
            }`}
          >
            {isEditMode ? 'Exit Edit' : 'Edit'}
          </button>
        </div>

        {isEditMode && (
          <div className="mb-4 space-x-2">
            <button 
              onClick={selectAllLocations}
              className="px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Select All
            </button>
            <button 
              onClick={deselectAllLocations}
              className="px-2 py-1 bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              Deselect All
            </button>
            <button 
              onClick={deleteSelectedLocations}
              className={`px-2 py-1 text-white rounded ${
                selectedLocations.size > 0 
                  ? 'bg-red-500 hover:bg-red-600' 
                  : 'bg-gray-300 cursor-not-allowed'
              }`}
              disabled={selectedLocations.size === 0}
            >
              Delete Selected
            </button>
          </div>
        )}

        {user.savedLocations.length > 0 ? (
          <ul className="space-y-2">
            {user.savedLocations.map((location: SavedLocation) => (
              <li 
                key={location.id} 
                className={`p-2 rounded cursor-${isEditMode ? 'pointer' : 'default'} ${
                  selectedLocations.has(location.id) 
                    ? 'bg-blue-100 border border-blue-300' 
                    : 'bg-gray-50'
                }`}
                onClick={() => selectLocation(location.id)}
              >
                <div className="flex justify-between items-center">
                  <div className="font-medium">{location.name}</div>
                  {!isEditMode && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        flyToLocation(location);
                      }}
                      className="px-2 py-1 bg-green-500 text-white rounded hover:bg-green-600 text-sm"
                    >
                      Go
                    </button>
                  )}
                </div>
                <div className="text-sm text-gray-500">
                  {location.coordinates[0].toFixed(4)}, {location.coordinates[1].toFixed(4)}
                </div>
                {location.description && (
                  <div className="text-sm text-gray-600 mt-1">{location.description}</div>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500">No saved locations yet</p>
        )}
      </div>
    </div>
  );
}; 