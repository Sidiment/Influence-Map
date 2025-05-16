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
              return inf ? (
                <li key={fid} className="flex items-center">
                  <img src={inf.avatar} alt={inf.name} className="w-6 h-6 rounded-full mr-2" />
                  <span>{inf.name}</span>
                </li>
              ) : null;
            })}
          </ul>
        ) : (
          <p className="text-gray-500">No followed influencers or users yet</p>
        )}
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-2">Saved Locations</h3>
        {user.savedLocations.length > 0 ? (
          <ul className="space-y-2">
            {user.savedLocations.map((location: SavedLocation) => (
              <li key={location.id} className="p-2 bg-gray-50 rounded">
                <div className="font-medium">{location.name}</div>
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