import React from 'react';
import * as Icons from 'lucide-react';

interface CategoryIconProps {
  name: string;
  className?: string;
  size?: number;
}

export const CategoryIcon: React.FC<CategoryIconProps> = ({ name, className = 'w-5 h-5', size = 20 }) => {
  // Safe dynamic lucide icon rendering
  const LucideIcon = (Icons as unknown as Record<string, React.ComponentType<{ className?: string; size?: number }>>)[name] || Icons.Tag;
  return <LucideIcon className={className} size={size} />;
};
