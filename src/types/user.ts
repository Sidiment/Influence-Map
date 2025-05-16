export interface User {
  id: string;
  username: string;
  email: string;
  password: string; // Note: In a real app, we'd never store plain passwords
  followedInfluencers: string[];
  savedLocations: SavedLocation[];
}

export interface SavedLocation {
  id: string;
  name: string;
  coordinates: [number, number];
  description?: string;
  createdAt: Date;
}

export interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
} 