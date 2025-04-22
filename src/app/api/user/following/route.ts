import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { User } from '@/models/User';
import { protect } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    // Connect to database
    await connectDB();

    // Get user from token
    const token = request.headers.get('authorization')?.split(' ')[1];
    if (!token) {
      return NextResponse.json(
        { message: 'Not authorized' },
        { status: 401 }
      );
    }

    const user = await User.findOne({ token }).populate({
      path: 'following',
      select: 'name profilePicture videos',
      populate: {
        path: 'videos',
        select: 'title url location thumbnail',
      },
    });

    if (!user) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(user.following);
  } catch (error) {
    console.error('Error fetching followed influencers:', error);
    return NextResponse.json(
      { message: 'Error fetching followed influencers' },
      { status: 500 }
    );
  }
} 