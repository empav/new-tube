import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import UserAvatar from "@/components/user-avatar";
import { commentInsertSchema } from "@/db/schema";
import { useClerk, useUser } from "@clerk/nextjs";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { trpc } from "@/trpc/client";
import { toast } from "sonner";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";

type CommentFormProps = {
  videoId: string;
  onSuccess?: () => void;
};

const FormSchema = commentInsertSchema.pick({
  value: true,
  videoId: true,
});

type FormProps = z.infer<typeof FormSchema>;

export const CommentForm = ({
  videoId,
  onSuccess = () => {},
}: CommentFormProps) => {
  const utils = trpc.useContext();
  const { user } = useUser();
  const clerk = useClerk();

  const createComment = trpc.comments.create.useMutation({
    onSuccess: () => {
      utils.comments.getAll.invalidate({ videoId });
      toast.success("Comment created");
      form.reset();
      onSuccess();
    },
    onError: (error) => {
      toast.error(error.message);
      if (error.data?.code === "UNAUTHORIZED") {
        clerk.openSignIn();
      }
    },
  });

  const form = useForm<FormProps>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      value: "",
      videoId,
    },
  });

  const onSubmit = (data: FormProps) => {
    createComment.mutate(data);
  };

  return (
    <Form {...form}>
      <form className="flex gap-4 group" onSubmit={form.handleSubmit(onSubmit)}>
        <UserAvatar
          size="lg"
          imageUrl={user?.imageUrl || "/user-placeholder.svg"}
          name={user?.username || "User"}
        />
        <div className="flex-1">
          <FormField
            control={form.control}
            name="value"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Textarea
                    placeholder="Add a public comment..."
                    className="resize-none bg-transparent overflow-hidden min-h-0"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="flex justify-end mt-2 gap-2">
            <Button
              className="sm"
              type="submit"
              disabled={createComment.isPending || !form.formState.isDirty}
            >
              Comment
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
};
