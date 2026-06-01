// Icon component for React Fast Refresh compatibility
import { iconSizes, iconColors, Icons } from "./icon-config";

// Helper function to render icon with props
export interface IconProps {
  name: keyof typeof Icons;
  size?: keyof typeof iconSizes;
  color?: keyof typeof iconColors;
  className?: string;
}

export const IconComponent = ({
  name,
  size = "md",
  color = "muted",
  className = "",
}: IconProps) => {
  const Icon = Icons[name];
  const sizeClass = iconSizes[size];
  const colorClass = iconColors[color];

  return (
    <Icon
      className={`${sizeClass} ${colorClass} ${className}`}
    />
  );
};
