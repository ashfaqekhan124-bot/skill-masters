import { PlayCircle, Clock, VideoOff } from 'lucide-react';

interface VideoPlaceholderProps {
  title?: string;
  message?: string;
  duration?: string;
  showPlayButton?: boolean;
}

export default function VideoPlaceholder({
  title = 'Coming Soon',
  message = 'Content will be uploaded soon',
  duration,
  showPlayButton = true,
}: VideoPlaceholderProps) {
  return (
    <div className="relative w-full aspect-video bg-gray-900 rounded-2xl overflow-hidden flex flex-col items-center justify-center group">
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-800 via-gray-900 to-black" />

      {/* Grid pattern overlay */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `linear-gradient(rgba(59,130,246,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(59,130,246,0.3) 1px, transparent 1px)`,
          backgroundSize: '40px 40px',
        }}
      />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center gap-4 px-6 text-center">
        {showPlayButton ? (
          <div className="relative">
            <PlayCircle className="w-20 h-20 text-blue-500 opacity-50 group-hover:opacity-70 transition-opacity" />
            <div className="absolute inset-0 rounded-full bg-blue-500/20 blur-2xl group-hover:bg-blue-500/30 transition-colors" />
          </div>
        ) : (
          <VideoOff className="w-16 h-16 text-gray-600" />
        )}

        <div>
          <h3 className="text-white font-semibold text-lg mb-1">{title}</h3>
          <p className="text-gray-400 text-sm">{message}</p>
          {duration && (
            <p className="text-gray-500 text-xs mt-2 flex items-center justify-center gap-1">
              <Clock className="w-3 h-3" /> {duration}
            </p>
          )}
        </div>
      </div>

      {/* Bottom bar */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-800">
        <div className="h-full w-0 bg-blue-600" />
      </div>
    </div>
  );
}
