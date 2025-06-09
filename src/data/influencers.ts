export interface Influencer {
  id: string;
  name: string;
  location: string;
  avatar: string;
  savedLocations?: {
    id: string;
    name: string;
    coordinates: [number, number];
    description?: string;
    createdAt: Date;
  }[];
}

export const INFLUENCERS: Influencer[] = [
  {
    id: '1',
    name: 'John Doe',
    location: 'New York',
    avatar: 'https://i.pravatar.cc/150?img=1',
    savedLocations: [
      {
        id: 'loc1',
        name: 'Central Park',
        coordinates: [-73.9654, 40.7829],
        description: 'Beautiful park in the heart of Manhattan',
        createdAt: new Date('2024-01-01')
      },
      {
        id: 'loc2',
        name: 'Times Square',
        coordinates: [-73.9855, 40.7580],
        description: 'The Crossroads of the World',
        createdAt: new Date('2024-01-02')
      }
    ]
  },
  {
    id: '2',
    name: 'Jane Smith',
    location: 'Los Angeles',
    avatar: 'https://i.pravatar.cc/150?img=2',
    savedLocations: [
      {
        id: 'loc3',
        name: 'Hollywood Sign',
        coordinates: [-118.3215, 34.1341],
        description: 'Iconic Hollywood landmark',
        createdAt: new Date('2024-01-03')
      },
      {
        id: 'loc4',
        name: 'Santa Monica Pier',
        coordinates: [-118.4962, 34.0080],
        description: 'Historic pier with amusement park',
        createdAt: new Date('2024-01-04')
      }
    ]
  },
  {
    id: '3',
    name: 'Mike Johnson',
    location: 'Chicago',
    avatar: 'https://i.pravatar.cc/150?img=3',
    savedLocations: [
      {
        id: 'loc5',
        name: 'Millennium Park',
        coordinates: [-87.6228, 41.8825],
        description: 'Home to the famous Cloud Gate sculpture',
        createdAt: new Date('2024-01-05')
      },
      {
        id: 'loc6',
        name: 'Navy Pier',
        coordinates: [-87.6028, 41.8917],
        description: 'Popular lakefront attraction',
        createdAt: new Date('2024-01-06')
      }
    ]
  },
  {
    id: '4',
    name: 'Sarah Williams',
    location: 'Houston',
    avatar: 'https://i.pravatar.cc/150?img=4',
    savedLocations: [
      {
        id: 'loc7',
        name: 'Space Center Houston',
        coordinates: [-95.0897, 29.5517],
        description: 'NASA visitor center',
        createdAt: new Date('2024-01-07')
      },
      {
        id: 'loc8',
        name: 'Houston Museum District',
        coordinates: [-95.3853, 29.7225],
        description: 'Cultural hub with multiple museums',
        createdAt: new Date('2024-01-08')
      }
    ]
  },
  {
    id: '5',
    name: 'David Brown',
    location: 'Phoenix',
    avatar: 'https://i.pravatar.cc/150?img=5',
    savedLocations: [
      {
        id: 'loc9',
        name: 'Camelback Mountain',
        coordinates: [-111.9647, 33.5153],
        description: 'Popular hiking destination',
        createdAt: new Date('2024-01-09')
      },
      {
        id: 'loc10',
        name: 'Desert Botanical Garden',
        coordinates: [-111.9477, 33.4631],
        description: 'Beautiful desert plant collection',
        createdAt: new Date('2024-01-10')
      }
    ]
  }
]; 