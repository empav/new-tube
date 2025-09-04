import { cva, VariantProps } from "class-variance-authority";
import { Avatar, AvatarImage } from "./ui/avatar";

const avatarVariants = cva("", {
  variants: {
    size: {
      default: "h-10 w-10",
      xs: "h-6 w-6",
      sm: "h-8 w-8",
      md: "h-10 w-10",
      lg: "h-12 w-12",
      xl: "h-16 w-16",
    },
  },
  defaultVariants: {
    size: "default",
  },
});

interface UserAvatarProps extends VariantProps<typeof avatarVariants> {
  imageUrl: string;
  name: string;
  className?: string;
  onClick?: () => void;
}

const UserAvatar = ({
  imageUrl,
  name,
  className,
  onClick,
  size,
}: UserAvatarProps) => {
  return (
    <Avatar className={avatarVariants({ size, className })}>
      <AvatarImage src={imageUrl} alt={name} onClick={onClick} />
    </Avatar>
  );
};

export default UserAvatar;
