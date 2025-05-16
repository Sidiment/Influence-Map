# Influencer Map

A modern web application that displays influencer and user locations on an interactive map. Built with Next.js, TypeScript, and Mapbox.

## Features

- User authentication (register, login, logout)
- Interactive map showing influencer locations
- Search and follow both influencers and registered users
- Sidebar with login/register form, followed list, and saved locations
- Protected map view (only accessible when logged in)
- Local storage persistence for user data and follows
- Responsive design with dark mode support
- Real-time map updates when selecting profiles

## User Experience

- **Login/Register:** Users must log in or register to access the map and social features.
- **Search & Follow:** Search for influencers (hardcoded) or other registered users. Follow or unfollow anyone from the search results.
- **Followed List:** See your followed influencers and users in the sidebar, with avatars.
- **Saved Locations:** (Optional) Users can see their saved map locations in the sidebar.
- **Protected Map:** The map is only visible after login, ensuring a personalized experience.

## Tech Stack

- **Framework**: Next.js 13+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Maps**: Mapbox GL
- **Package Manager**: npm

## Getting Started

1. Clone the repository:
```bash
git clone https://github.com/Sidiment/Influence-Map.git
cd Influence-Map
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env.local` file with your Mapbox token:
```
NEXT_PUBLIC_MAPBOX_TOKEN=your_mapbox_token_here
```

4. Start the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Project Structure

- `src/app/`: Contains the application routes and pages
- `src/components/`: Reusable UI components
- `src/contexts/`: Authentication context and logic
- `src/data/`: Hardcoded influencer data
- `src/types/`: TypeScript types
- `public/`: Static assets

## Development

- `npm run dev`: Start development server
- `npm run build`: Build for production
- `npm start`: Start production server
- `npm run lint`: Run ESLint

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
