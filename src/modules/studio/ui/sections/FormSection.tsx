"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { trpc } from "@/trpc/client";
import {
  CopyCheckIcon,
  CopyIcon,
  Globe2Icon,
  ImagePlusIcon,
  Loader2Icon,
  LockIcon,
  MoreVerticalIcon,
  RotateCcwIcon,
  SparklesIcon,
  TrashIcon,
} from "lucide-react";
import { Suspense, useState } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import z from "zod";
import { videoUpdateSchema } from "@/db/schema";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import VideoPlayer from "@/modules/videos/ui/components/video-player";
import Link from "next/link";
import { sleep, snakeCaseToTitle } from "@/lib/utils";
import Image from "next/image";
import { THUMBNAIL_FALLBACK } from "@/constants";
import { ThumbnailUploadModal } from "../components/ThumbnailUploadModal";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type FormProps = z.infer<typeof videoUpdateSchema>;

const FormSectionSkeleton = () => {
  return <div>Loading...</div>;
};

const FormSection = ({ videoId }: { videoId: string }) => {
  return (
    <Suspense fallback={<FormSectionSkeleton />}>
      <ErrorBoundary fallback={<div>Error loading video data</div>}>
        <FormSectionSuspense videoId={videoId} />
      </ErrorBoundary>
    </Suspense>
  );
};

const FormSectionSuspense = ({ videoId }: { videoId: string }) => {
  const router = useRouter();
  const trpcUtils = trpc.useUtils();

  const [video] = trpc.studio.getById.useSuspenseQuery({ id: videoId });
  const [categories] = trpc.categories.getAll.useSuspenseQuery();

  const [thumbnailModalOpen, setThumbnailModalOpen] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const generateDescription = trpc.videos.generateDescription.useMutation({
    onSuccess: () => {
      toast.success("Background job successfully started");
    },
  });
  const generateTitle = trpc.videos.generateTitle.useMutation({
    onSuccess: () => {
      toast.success("Background job successfully started");
    },
  });
  const restoreThumbnail = trpc.videos.restoreThumbnail.useMutation({
    onSuccess: () => {
      trpcUtils.studio.getById.invalidate({ id: videoId });
      trpcUtils.studio.getAll.invalidate();
      toast.success("Thumbnail restored successfully");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const deleteVideo = trpc.videos.delete.useMutation({
    onSuccess: () => {
      trpcUtils.studio.getAll.invalidate();
      router.push("/studio");
      toast.success("Video deleted successfully");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const updateVideo = trpc.videos.update.useMutation({
    onSuccess: () => {
      trpcUtils.studio.getAll.invalidate();
      trpcUtils.studio.getById.invalidate({ id: videoId });
      toast.success("Video updated successfully");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update video");
    },
  });

  const form = useForm<FormProps>({
    resolver: zodResolver(videoUpdateSchema),
    defaultValues: video,
  });

  const onSubmit = async (data: FormProps) => {
    await updateVideo.mutateAsync({ id: videoId, ...data });
    router.push("/studio");
  };

  const fullURL = `${process.env.NEXT_PUBLIC_APP_URL}/videos/${videoId}`;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(fullURL);
    setIsCopied(true);
    await sleep(2000);
    setIsCopied(false);
  };

  return (
    <>
      <ThumbnailUploadModal
        open={thumbnailModalOpen}
        onOpenChange={setThumbnailModalOpen}
        videoId={videoId}
      />
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold">Video Details</h1>
              <p className="text-xs text-muted-foreground">
                Manage your video details
              </p>
            </div>
            <div className="flex items-center gap-x-2">
              <Button
                type="submit"
                disabled={updateVideo.isPending || !form.formState.isDirty}
              >
                Save
              </Button>
              <DropdownMenu modal={false}>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreVerticalIcon />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={() =>
                      deleteVideo.mutate({
                        id: videoId,
                        assetId: video.muxAssetId,
                      })
                    }
                  >
                    <TrashIcon className="mr-2 size-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
            <div className="space-y-8 lg:col-span-3">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-x-2">
                      Title
                      <Tooltip>
                        <TooltipTrigger asChild>
                          {generateTitle.isPending ? (
                            <Loader2Icon className="animate-spin" />
                          ) : (
                            <SparklesIcon
                              className="size-4 cursor-pointer"
                              onClick={() => generateTitle.mutate({ videoId })}
                            />
                          )}
                        </TooltipTrigger>
                        <TooltipContent>
                          Generate a title using AI
                        </TooltipContent>
                      </Tooltip>
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Add a Title to your video"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-x-2">
                      Description
                      <Tooltip>
                        <TooltipTrigger asChild>
                          {generateDescription.isPending ? (
                            <Loader2Icon className="animate-spin" />
                          ) : (
                            <SparklesIcon
                              className="size-4 cursor-pointer"
                              onClick={() =>
                                generateDescription.mutate({ videoId })
                              }
                            />
                          )}
                        </TooltipTrigger>
                        <TooltipContent>
                          Generate a description using AI
                        </TooltipContent>
                      </Tooltip>
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        value={field.value ?? ""}
                        rows={10}
                        className="resize-none pr-10"
                        placeholder="Add a Description to your video"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="thumbnailUrl"
                render={() => (
                  <FormItem>
                    <FormLabel>Thumbnail</FormLabel>
                    <FormControl>
                      <div className="group relative h-[84px] w-[153px] border border-dashed border-neutral-400 p-0.5">
                        <Image
                          src={video.thumbnailUrl ?? THUMBNAIL_FALLBACK}
                          alt="Thumbnail"
                          fill
                          className="object-cover"
                        />
                        <DropdownMenu modal={false}>
                          <DropdownMenuTrigger asChild>
                            <Button
                              type="button"
                              size="icon"
                              className="absolute right-1 top-1 size-7 rounded-full bg-black/50 opacity-100 duration-300 hover:bg-black/50 group-hover:opacity-100 md:opacity-0"
                            >
                              <MoreVerticalIcon className="text-white" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="start" side="right">
                            <DropdownMenuItem
                              onClick={() => setThumbnailModalOpen(true)}
                            >
                              <ImagePlusIcon className="mr-1 size-4" />
                              Change
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                restoreThumbnail.mutate({ id: videoId })
                              }
                            >
                              <RotateCcwIcon className="mr-1 size-4" />
                              Restore
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="categoryId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value ?? undefined}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="flex flex-col gap-y-8 lg:col-span-2">
              <div className="flex h-fit flex-col gap-4 overflow-hidden rounded-xl bg-[#F9f9f9]">
                <VideoPlayer
                  playbackId={video.muxPlaybackId}
                  thumbnail={video.thumbnailUrl}
                />
              </div>
              <div className="flex flex-col gap-y-6 p-4">
                <div className="flex items-center justify-between gap-x-2">
                  <div className="flex flex-col gap-y-1">
                    <p className="text-xs text-muted-foreground">Video Link</p>
                    <div className="flex items-center gap-x-2">
                      <Link
                        href={`/videos/${videoId}`}
                        className="text-sm font-medium text-blue-600 hover:underline"
                      >
                        <p className="line-clamp-1 text-sm text-blue-500">
                          {fullURL}
                        </p>
                      </Link>
                      <Button
                        variant="ghost"
                        size="icon"
                        type="button"
                        className="shrink-0"
                        onClick={handleCopy}
                        disabled={isCopied}
                      >
                        {isCopied ? <CopyCheckIcon /> : <CopyIcon />}
                      </Button>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex flex-col gap-y-1">
                    <p className="text-xs text-muted-foreground">
                      Video status
                    </p>
                    <p className="text-sm">
                      {snakeCaseToTitle(video.muxStatus ?? "Preparing")}
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex flex-col gap-y-1">
                    <p className="text-xs text-muted-foreground">
                      Subtitles/Audio
                    </p>
                    <p className="text-sm">
                      {snakeCaseToTitle(
                        video.muxTrackStatus ?? "No Subtitles/Audio",
                      )}
                    </p>
                  </div>
                </div>
              </div>
              <FormField
                control={form.control}
                name="visibility"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Visibility</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value ?? undefined}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value={"public"}>
                          <div className="flex items-center">
                            <Globe2Icon className="mr-2 size-4" />
                            Public
                          </div>
                        </SelectItem>
                        <SelectItem value={"private"}>
                          <div className="flex items-center">
                            <LockIcon className="mr-2 size-4" />
                            Private
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        </form>
      </Form>
    </>
  );
};

export default FormSection;
