import { trpc } from "@/trpc/client";
import { useClerk } from "@clerk/nextjs";
import { toast } from "sonner";

interface UseSubscriptionsProps {
  userId: string;
  isSubscribed: boolean;
  fromVideoId?: string;
}

const useSubscriptions = ({
  userId,
  isSubscribed,
  fromVideoId,
}: UseSubscriptionsProps) => {
  const clerk = useClerk();
  const utils = trpc.useUtils();

  const create = trpc.subscriptions.create.useMutation({
    onSuccess: () => {
      toast.success("Subscribed successfully!");

      utils.videos.getAllSubs.invalidate();

      if (fromVideoId) {
        utils.videos.getById.invalidate({ id: fromVideoId });
      }
    },
    onError: (error) => {
      toast.error("Failed to subscribe: " + error.message);
      if (error.data?.code === "UNAUTHORIZED") {
        clerk.openSignIn();
      }
    },
  });

  const remove = trpc.subscriptions.remove.useMutation({
    onSuccess: () => {
      toast.success("Subscribed successfully!");

      utils.videos.getAllSubs.invalidate();

      if (fromVideoId) {
        utils.videos.getById.invalidate({ id: fromVideoId });
      }
    },
    onError: (error) => {
      toast.error("Failed to subscribe: " + error.message);
      if (error.data?.code === "UNAUTHORIZED") {
        clerk.openSignIn();
      }
    },
  });

  const isPending = create.isPending || remove.isPending;

  const onClick = async () => {
    if (isSubscribed) {
      await remove.mutate({ userId });
    } else {
      await create.mutate({ userId });
    }
  };

  return {
    isPending,
    isSubscribed,
    onClick,
  };
};

export default useSubscriptions;
