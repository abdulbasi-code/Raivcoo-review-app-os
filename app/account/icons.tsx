// components/icons.tsx
import { Loader2 } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type IconKeys = keyof typeof Icons;

export const Icons = {
  spinner: Loader2,
  // Add more icons as needed
} as const;

export interface IconProps extends React.HTMLAttributes<SVGElement> {
  icon: IconKeys;
  size?: number;
  className?: string;
}

export const Icon: React.FC<IconProps> = ({
  icon,
  size = 24,
  className,
  ...props
}) => {
  const LucideIcon = Icons[icon] as LucideIcon;
  return <LucideIcon size={size} className={className} {...props} />;
};
