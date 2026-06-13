interface AvatarProps {
  src?: string | null;
  name?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showOnline?: boolean;
  className?: string;
}

const gradients = [
  'linear-gradient(135deg,#3D0A28,#7A1CAC)',
  'linear-gradient(135deg,#1E0840,#C4006A)',
  'linear-gradient(135deg,#30043E,#FF1493)',
  'linear-gradient(135deg,#200A28,#7A1CAC)',
  'linear-gradient(135deg,#3D1808,#C4006A)',
];

const getGradient = (name: string = '') => {
  const index = name.charCodeAt(0) % gradients.length;
  return gradients[index];
};

const sizes = {
  xs: 'w-7 h-7 text-xs',
  sm: 'w-8 h-8 text-sm',
  md: 'w-10 h-10 text-sm',
  lg: 'w-12 h-12 text-base',
  xl: 'w-16 h-16 text-xl',
};

export default function Avatar({ src, name = '', size = 'md', showOnline, className = '' }: AvatarProps) {
  return (
    <div className={`relative flex-shrink-0 ${className}`}>
      <div
        className={`${sizes[size]} rounded-full flex items-center justify-center font-700 overflow-hidden`}
        style={{
          background: src ? undefined : getGradient(name),
          border: '1.5px solid rgba(255,20,147,0.25)',
        }}
      >
        {src ? (
          <img src={src} alt={name} className="w-full h-full object-cover" />
        ) : (
          <span className="text-white font-bold">
            {name.charAt(0).toUpperCase()}
          </span>
        )}
      </div>

      {showOnline && (
        <span
          className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2"
          style={{
            background: '#00FF88',
            borderColor: 'var(--sidebar)',
            boxShadow: '0 0 6px #00FF88',
          }}
        />
      )}
    </div>
  );
}