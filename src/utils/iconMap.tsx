import React from 'react';
import {
  User,
  BookOpen,
  Briefcase,
  Lightbulb,
  ShoppingBag,
  Folder,
  Star,
  Heart,
  Target,
  Smile,
  Bookmark,
  Compass,
  CheckSquare,
  Coffee,
  Globe,
  Tag,
  FileText,
  LucideIcon,
} from 'lucide-react';

export type IconProps = React.SVGProps<SVGSVGElement> & {
  size?: number | string;
  strokeWidth?: number | string;
  absoluteStrokeWidth?: boolean;
};

const ICON_MAP: Record<string, LucideIcon> = {
  User,
  BookOpen,
  Briefcase,
  Lightbulb,
  ShoppingBag,
  Folder,
  Star,
  Heart,
  Target,
  Smile,
  Bookmark,
  Compass,
  CheckSquare,
  Coffee,
  Globe,
  Tag,
  FileText,
};

export function renderCategoryIcon(
  iconName: string,
  props: IconProps = { className: 'w-4 h-4' }
): React.ReactElement {
  const IconComponent = ICON_MAP[iconName] || Folder;
  return <IconComponent {...props} />;
}
