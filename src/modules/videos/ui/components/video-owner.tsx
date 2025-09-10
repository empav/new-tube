import { Button } from "@/components/ui/button";
import UserAvatar from "@/components/user-avatar";
import SubscriptionButton from "@/modules/subscriptions/ui/components/SubscriptionButton";
import useSubscriptions from "@/modules/subscriptions/ui/hooks/useSubscriptions";
import UserInfo from "@/modules/users/ui/components/UserInfo";
import { VideoGetByIdOutput } from "@/trpc/routers/types";
import { useAuth } from "@clerk/nextjs";
import Link from "next/link";

const VideoOwner = ({
  user,
  videoId,
}: {
  user: VideoGetByIdOutput["user"];
  videoId: string;
}) => {
  const { userId: clerkUserId, isLoaded } = useAuth();

  const { isPending, isSubscribed, onClick } = useSubscriptions({
    userId: user.id,
    isSubscribed: user.viewerSubscribed,
    fromVideoId: videoId,
  });

  return (
    <div className="flex items-center sm:items-start justify-between sm:justify-start gap-3 min-w-0">
      <Link href={`/users/${user.id}`}>
        <div className="flex items-center gap-3 min-w-0">
          <UserAvatar size="lg" imageUrl={user.image_url} name={user.name} />
          <div className="flex flex-col min-w-0 gap-1">
            <UserInfo name={user.name} size={"lg"} />
            <span className="text-sm text-muted-foreground line-clamp-1">
              {user.subscriberCount} subscribers
            </span>
          </div>
        </div>
      </Link>
      {clerkUserId === user.clerkId ? (
        <Button variant="secondary" className="rounded-full" asChild>
          <Link href={`/studio/videos/${videoId}`}>Edit Video</Link>
        </Button>
      ) : (
        <SubscriptionButton
          onClick={onClick}
          disabled={isPending || !isLoaded}
          isSubscribed={isSubscribed}
          className="flex-none"
        />
      )}
    </div>
  );
};

export default VideoOwner;
