import mongoose from 'mongoose';

export interface IInfluencer {
  name: string;
  profilePicture: string;
  videos: mongoose.Types.ObjectId[];
  followers: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const influencerSchema = new mongoose.Schema<IInfluencer>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    profilePicture: {
      type: String,
      required: true,
    },
    videos: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Video',
    }],
    followers: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    }],
  },
  {
    timestamps: true,
  }
);

export const Influencer = mongoose.models.Influencer || mongoose.model<IInfluencer>('Influencer', influencerSchema); 