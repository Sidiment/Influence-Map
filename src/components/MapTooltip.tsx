interface MapTooltipProps {
  countryName: string;
  x: number;
  y: number;
}

export default function MapTooltip({ countryName, x, y }: MapTooltipProps) {
  return (
    <div
      className="absolute bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-3 py-2 rounded-lg shadow-lg text-sm font-medium pointer-events-none"
      style={{
        left: x,
        top: y,
        transform: 'translate(-50%, -100%)',
        marginTop: '-10px'
      }}
    >
      {countryName}
    </div>
  );
} 