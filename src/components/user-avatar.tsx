import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Cat } from "lucide-react";

interface UserAvatarProps {
  username: string;
  avatar?: string | null;
  size?: "sm" | "default" | "lg";
  className?: string;
}

export function UserAvatar({
  username,
  avatar,
  size = "default",
  className,
}: UserAvatarProps) {
  const initial = username.charAt(0).toUpperCase();

  return (
    <Avatar size={size} className={className}>
      {avatar && <AvatarImage src={avatar} alt={username} />}
      <AvatarFallback className="bg-muted text-muted-foreground">
        <Cat className="size-4" aria-hidden />
        <span className="sr-only">{initial}</span>
      </AvatarFallback>
    </Avatar>
  );
}
