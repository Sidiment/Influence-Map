interface ProfileCardProps {
  name: string;
  image: string;
  location: string;
  onClick: () => void;
}

export default function ProfileCard({ name, image, location, onClick }: ProfileCardProps) {
  return (
    <div 
      onClick={onClick}
      className="flex items-center p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer mb-3"
    >
      <div className="w-12 h-12 relative rounded-full overflow-hidden">
        <img
          src={image}
          alt={name}
          className="object-cover w-full h-full"
        />
      </div>
      <div className="ml-4">
        <h3 className="font-medium text-gray-900 dark:text-white">{name}</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">{location}</p>
      </div>
    </div>
  );
} 