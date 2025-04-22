import axios from 'axios';

interface BilibiliUser {
  mid: string;
  name: string;
  face: string;
}

interface BilibiliVideo {
  aid: string;
  title: string;
  desc: string;
  location?: string;
  coordinates?: [number, number];
}

// Create an axios instance with default config
const bilibiliApi = axios.create({
  baseURL: 'https://api.bilibili.com',
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    'Referer': 'https://www.bilibili.com',
    'Origin': 'https://www.bilibili.com'
  }
});

export async function getUserInfo(mid: string): Promise<BilibiliUser | null> {
  try {
    const response = await bilibiliApi.get(`/x/web-interface/card?mid=${mid}`);
    if (response.data.code === 0) {
      return {
        mid: response.data.data.card.mid,
        name: response.data.data.card.name,
        face: response.data.data.card.face
      };
    }
    return null;
  } catch (error) {
    console.error('Error fetching user info:', error);
    return null;
  }
}

export async function getUserVideos(mid: string): Promise<BilibiliVideo[]> {
  try {
    const response = await bilibiliApi.get(`/x/space/wbi/arc/search?mid=${mid}&ps=30&tid=0&pn=1&order=pubdate`);
    if (response.data.code === 0) {
      return response.data.data.list.vlist.map((video: any) => ({
        aid: video.aid,
        title: video.title,
        desc: video.description || '',
        location: video.location || ''
      }));
    }
    return [];
  } catch (error) {
    console.error('Error fetching user videos:', error);
    return [];
  }
}

// Helper function to extract location from video description
export function extractLocation(description: string): [number, number] | null {
  // Simple location extraction - this is a placeholder
  // In a real implementation, you would use a geocoding service
  // or Bilibili's location API
  const locationPatterns = [
    /(?:在|于|位于|地点|位置|地址)[：:]\s*([^，。\n]+)/,
    /(?:地点|位置|地址)[：:]\s*([^，。\n]+)/
  ];

  for (const pattern of locationPatterns) {
    const match = description.match(pattern);
    if (match && match[1]) {
      // For now, return a default location in China
      // In a real implementation, you would use a geocoding service
      return [116.4074, 39.9042];
    }
  }

  return null;
} 