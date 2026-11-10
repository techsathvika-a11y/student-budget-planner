import React from 'react';
import * as Icons from 'lucide-react';

interface CategoryIconProps {
  name: string;
  className?: string;
  size?: number;
}

export const CategoryIcon: React.FC<CategoryIconProps> = ({ name, className = 'w-5 h-5', size = 20 }) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const IconComponent = (Icons as any)[name] || Icons.CircleDot;
  return <IconComponent size={size} className={className} />;
};

export const AVAILABLE_CATEGORY_ICONS = [
  'Utensils',
  'Bus',
  'BookOpen',
  'Home',
  'Film',
  'ShoppingBag',
  'HeartPulse',
  'Wifi',
  'Tv',
  'Coffee',
  'Smartphone',
  'Briefcase',
  'GraduationCap',
  'Laptop',
  'DollarSign',
  'Users',
  'Award',
  'Compass',
  'Music',
  'Gift',
  'ShieldCheck',
  'Sparkles',
  'Car',
  'Fuel',
  'Zap',
  'MoreHorizontal',
];

export const AVAILABLE_COLORS = [
  '#f97316', // orange
  '#06b6d4', // cyan
  '#8b5cf6', // purple
  '#3b82f6', // blue
  '#ec4899', // pink
  '#10b981', // emerald
  '#ef4444', // red
  '#6366f1', // indigo
  '#14b8a6', // teal
  '#f59e0b', // amber
  '#64748b', // slate
  '#84cc16', // lime
];
