import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { User } from '@/models/User';
import { Influencer } from '@/models/Influencer';
import { protect } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    // Connect to database
    await connectDB();

    const { influencerId } = await request.json();

    // Validate input
    if (!influencerId) {
      return NextResponse.json(
        { message: 'Please provide influencer ID' },
        { status: 400 }
      );
    }

    // Get user from token
    const token = request.headers.get('authorization')?.split(' ')[1];
    if (!token) {
      return NextResponse.json(
        { message: 'Not authorized' },
        { status: 401 }
      );
    }

    const user = await User.findOne({ token });
    if (!user) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }

    // Check if influencer exists
    const influencer = await Influencer.findById(influencerId);
    if (!influencer) {
      return NextResponse.json(
        { message: 'Influencer not found' },
        { status: 404 }
      );
    }

    // Check if user is already following
    const isFollowing = user.following.includes(influencerId);
    
    if (isFollowing) {
      // Unfollow
      await User.findByIdAndUpdate(user._id, {
        $pull: { following: influencerId },
      });
      await Influencer.findByIdAndUpdate(influencerId, {
        $pull: { followers: user._id },
      });
    } else {
      // Follow
      await User.findByIdAndUpdate(user._id, {
        $addToSet: { following: influencerId },
      });
      await Influencer.findByIdAndUpdate(influencerId, {
        $addToSet: { followers: user._id },
      });
    }

    return NextResponse.json({
      message: isFollowing ? 'Unfollowed successfully' : 'Followed successfully',
    });
  } catch (error) {
    console.error('Error following/unfollowing:', error);
    return NextResponse.json(
      { message: 'Error following/unfollowing' },
      { status: 500 }
    );
  }
} 