import React from 'react';

interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  initials: string;
  size?: 'sm' | 'md' | 'lg';
}

export const Avatar = React.forwardRef<HTMLDivElement, AvatarProps>(
  ({ className = '', initials, size = 'md', ...props }, ref) => {
    const sizes = {
      sm: 'w-8 h-8 text-xs',
      md: 'w-10 h-10 text-sm min-w-[40px]',
      lg: 'w-12 h-12 text-base',
    };

    return (
      <div
        ref={ref}
        className={`flex items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-500 to-violet-500 text-white font-medium shadow-sm transition-transform hover:scale-105 flex-shrink-0 ${sizes[size]} ${className}`}
        {...props}
      >
        {initials}
      </div>
    );
  }
);
Avatar.displayName = 'Avatar';
