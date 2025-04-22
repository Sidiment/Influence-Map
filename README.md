# Influencer Footprint Map

A web platform where users can follow influencers and view the locations they've visited, extracted from their video content.

## Features

- User authentication (register/login)
- Follow/unfollow influencers
- Interactive map showing influencer locations
- Video content integration
- Real-time location updates

## Tech Stack

- **Frontend**: Next.js, React, Tailwind CSS
- **Backend**: Node.js, Express
- **Database**: MongoDB
- **APIs**: Mapbox for maps, YouTube/TikTok APIs for video data
- **AI Tools**: Cursor AI for development assistance

## Prerequisites

- Node.js (v14 or later)
- MongoDB
- Mapbox account and access token
- YouTube/TikTok API credentials (optional)

## Setup

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd influencer-map
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory with the following variables:
   ```
   MONGODB_URI=mongodb://localhost:27017/influencer-map
   JWT_SECRET=your-secret-key
   NEXT_PUBLIC_MAPBOX_TOKEN=your-mapbox-token
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
influencer-map/
├── src/
│   ├── app/              # Next.js app directory
│   │   ├── api/          # API routes
│   │   ├── components/   # React components
│   │   └── pages/        # Page components
│   ├── lib/              # Utility functions
│   ├── models/           # MongoDB models
│   └── types/            # TypeScript types
├── public/               # Static files
└── .env                  # Environment variables
```

## API Endpoints

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/influencers` - Get list of influencers
- `GET /api/influencer/:id` - Get specific influencer
- `POST /api/follow` - Follow an influencer
- `GET /api/user/following` - Get followed influencers

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details. 