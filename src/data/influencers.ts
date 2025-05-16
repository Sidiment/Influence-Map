export interface Influencer {
  id: string;
  name: string;
  location: string;
  avatar: string;
}

export const INFLUENCERS: Influencer[] = [
  {
    id: '1',
    name: 'John Doe',
    location: 'New York',
    avatar: 'https://i.pravatar.cc/150?img=1',
  },
  {
    id: '2',
    name: 'Jane Smith',
    location: 'Los Angeles',
    avatar: 'https://i.pravatar.cc/150?img=2',
  },
  {
    id: '3',
    name: 'Mike Johnson',
    location: 'Chicago',
    avatar: 'https://i.pravatar.cc/150?img=3',
  },
  {
    id: '4',
    name: 'Sarah Williams',
    location: 'Houston',
    avatar: 'https://i.pravatar.cc/150?img=4',
  },
  {
    id: '5',
    name: 'David Brown',
    location: 'Phoenix',
    avatar: 'https://i.pravatar.cc/150?img=5',
  },
]; 