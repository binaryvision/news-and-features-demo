import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Play, Camera } from "lucide-react";
import { cn } from "@/lib/utils";

type Platform = "instagram" | "youtube" | "podcast";

type MultimediaItem = {
  id: string;
  platform: Platform;
  title: string;
  subtitle?: string;
};

const MULTIMEDIA_ITEMS: MultimediaItem[] = [
  {
    id: "1",
    platform: "podcast",
    title: "InsideAir",
    subtitle: "Ep 132: Increasing the RAF's IQ",
  },
  {
    id: "2",
    platform: "instagram",
    title: "RAF Instagram",
    subtitle: "Reel",
  },
  {
    id: "3",
    platform: "podcast",
    title: "InsideAir",
    subtitle: "Ep 132: Increasing the RAF's IQ",
  },
  {
    id: "4",
    platform: "youtube",
    title: "Future Horizons",
    subtitle: "Episode 18 - Secure at home, strong abroad",
  },
  {
    id: "5",
    platform: "youtube",
    title: "RAF 60 second update",
    subtitle: "29 October 2025",
  },
  {
    id: "6",
    platform: "podcast",
    title: "Team Tempest",
    subtitle: "Ep 45: Next-gen capability",
  },
  {
    id: "7",
    platform: "youtube",
    title: "RAF Recruitment",
    subtitle: "Careers in the Air Force",
  },
];

const ROW_HEIGHT = 280;

function InstagramCard({ item }: { item: MultimediaItem }) {
  return (
    <div
      className={cn(
        "rounded-xl border border-border/50 bg-card overflow-hidden shadow-sm flex flex-col items-center justify-center shrink-0",
        "bg-gradient-to-br from-[#f09433] via-[#e6683c] via-[#dc2743] via-[#cc2366] to-[#bc1888]",
        "h-[var(--carousel-row-height)] w-[var(--carousel-instagram-width)]"
      )}
      style={
        {
          "--carousel-row-height": `${ROW_HEIGHT}px`,
          "--carousel-instagram-width": `${ROW_HEIGHT * (9 / 16)}px`,
        } as React.CSSProperties
      }
    >
      <div className="bg-white/90 rounded-full p-4">
        <Camera className="w-10 h-10 text-[#E1306C]" />
      </div>
      <span className="mt-3 text-white font-semibold text-sm drop-shadow">Instagram</span>
      {item.subtitle && (
        <span className="text-white/90 text-xs mt-1">{item.subtitle}</span>
      )}
    </div>
  );
}

function YouTubeCard({ item }: { item: MultimediaItem }) {
  return (
    <div
      className="rounded-xl border border-border/50 bg-card overflow-hidden shadow-sm flex flex-col bg-zinc-900 shrink-0 h-[var(--carousel-row-height)] w-[var(--carousel-video-width)]"
      style={
        {
          "--carousel-row-height": `${ROW_HEIGHT}px`,
          "--carousel-video-width": `${ROW_HEIGHT * (16 / 9)}px`,
        } as React.CSSProperties
      }
    >
      <div className="flex-1 flex flex-col items-center justify-center gap-3 p-4">
        <div className="w-14 h-14 rounded-full bg-red-600 flex items-center justify-center shrink-0">
          <Play className="w-7 h-7 text-white ml-1" fill="currentColor" />
        </div>
        <span className="text-red-500 text-xs font-semibold uppercase tracking-wider">YouTube</span>
      </div>
      <div className="p-3 bg-zinc-800/80 border-t border-zinc-700/50">
        <p className="text-white text-sm font-medium truncate">{item.title}</p>
        {item.subtitle && (
          <p className="text-zinc-400 text-xs truncate mt-0.5">{item.subtitle}</p>
        )}
      </div>
    </div>
  );
}

function PodcastCard({ item }: { item: MultimediaItem }) {
  return (
    <div
      className="rounded-xl border border-border/50 bg-card overflow-hidden shadow-sm flex flex-row bg-muted/50 shrink-0 h-[var(--carousel-row-height)] w-[var(--carousel-video-width)]"
      style={
        {
          "--carousel-row-height": `${ROW_HEIGHT}px`,
          "--carousel-video-width": `${ROW_HEIGHT * (16 / 9)}px`,
        } as React.CSSProperties
      }
    >
      <div className="w-1/3 shrink-0 flex items-center justify-center bg-muted">
        <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
          <Play className="w-8 h-8 text-primary ml-1" fill="currentColor" />
        </div>
      </div>
      <div className="flex-1 flex flex-col justify-center p-4 min-w-0">
        <span className="text-xs font-semibold text-primary uppercase tracking-wider">Podcast</span>
        <p className="font-display font-bold text-foreground text-base mt-1 truncate">{item.title}</p>
        {item.subtitle && (
          <p className="text-muted-foreground text-sm mt-0.5 line-clamp-2">{item.subtitle}</p>
        )}
      </div>
    </div>
  );
}

function MultimediaCard({ item }: { item: MultimediaItem }) {
  switch (item.platform) {
    case "instagram":
      return <InstagramCard item={item} />;
    case "youtube":
      return <YouTubeCard item={item} />;
    case "podcast":
      return <PodcastCard item={item} />;
  }
}

export function MultimediaCarousel() {
  return (
    <section className="my-10">
      <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-4">
        Related content
      </h3>
      <div className="relative">
        <Carousel
          opts={{ align: "start", loop: true }}
          className="w-full"
        >
          <CarouselContent className="-ml-4 h-[280px] items-center">
            {MULTIMEDIA_ITEMS.map((item) => (
              <CarouselItem
                key={item.id}
                className="pl-4 basis-auto flex-shrink-0 h-full flex items-center"
              >
                <MultimediaCard item={item} />
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="-left-2 sm:-left-12 top-1/2 -translate-y-1/2" />
          <CarouselNext className="-right-2 sm:-right-12 top-1/2 -translate-y-1/2" />
        </Carousel>
      </div>
    </section>
  );
}
