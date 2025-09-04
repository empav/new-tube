"use client";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "./ui/skeleton";

interface FilterCarouselProps {
  value?: string | null;
  isLoading?: boolean;
  onSelect: (value: string | null) => void;
  data: {
    value: string;
    label: string;
  }[];
}

export const FilterCarousel = ({
  value,
  isLoading = false,
  onSelect,
  data,
}: FilterCarouselProps) => {
  return (
    <Carousel
      opts={{ align: "start", dragFree: true }}
      className="w-full px-12"
    >
      <CarouselContent className="-ml-3">
        {isLoading &&
          Array.from({ length: 14 }).map((_, index) => (
            <CarouselItem key={index} className="basis-auto pl-3">
              <Skeleton className="h-full w-[100px] rounded-lg px-3 py-1 text-sm font-semibold">
                &nbsp;
              </Skeleton>
            </CarouselItem>
          ))}
        {!isLoading && (
          <>
            <CarouselItem className="basis-auto pl-3">
              <Badge
                variant={!value ? "default" : "secondary"}
                className="cursor-pointer whitespace-nowrap rounded-lg px-3 py-1 text-sm"
                onClick={() => onSelect(null)}
              >
                All
              </Badge>
            </CarouselItem>
            {data.map((item) => (
              <CarouselItem key={item.value} className="basis-auto pl-3">
                <Badge
                  variant={value === item.value ? "default" : "secondary"}
                  className="cursor-pointer whitespace-nowrap rounded-lg px-3 py-1 text-sm"
                  onClick={() => onSelect(item.value)}
                >
                  {item.label}
                </Badge>
              </CarouselItem>
            ))}
          </>
        )}
      </CarouselContent>
      <CarouselPrevious className="left-0 z-20" />
      <CarouselNext className="right-0 z-20" />
    </Carousel>
  );
};
