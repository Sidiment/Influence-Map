import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Influencer } from '@/models/Influencer';
import { protect } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    // Connect to database
    await connectDB();

    // Get influencers
    const influencers = await Influencer.find()
      .select('name profilePicture followers')
      .populate('followers', 'username');

    return NextResponse.json(influencers);
  } catch (error) {
    console.error('Error fetching influencers:', error);
    return NextResponse.json(
      { message: 'Error fetching influencers' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    // Connect to database
    await connectDB();

    const { name, profilePicture } = await request.json();

    // Validate input
    if (!name || !profilePicture) {
      return NextResponse.json(
        { message: 'Please provide name and profile picture' },
        { status: 400 }
      );
    }

    // Create new influencer
    const influencer = await Influencer.create({
      name,
      profilePicture,
    });

    return NextResponse.json(influencer, { status: 201 });
  } catch (error) {
    console.error('Error creating influencer:', error);
    return NextResponse.json(
      { message: 'Error creating influencer' },
      { status: 500 }
    );
  }
} 