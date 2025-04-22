import mongoose from 'mongoose';

export interface ILocation {
  type: 'Point';
  coordinates: [number, number];
}

export interface IVideo {
  title: string;
  url: string;
  location: ILocation;
  influencerId: mongoose.Types.ObjectId;
  thumbnail: string;
  createdAt: Date;
  updatedAt: Date;
}

const videoSchema = new mongoose.Schema<IVideo>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    url: {
      type: String,
      required: true,
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        required: true,
      },
      coordinates: {
        type: [Number],
        required: true,
      },
    },
    influencerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Influencer',
      required: true,
    },
    thumbnail: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Create a 2dsphere index for geospatial queries
videoSchema.index({ location: '2dsphere' });

export const Video = mongoose.models.Video || mongoose.model<IVideo>('Video', videoSchema); 