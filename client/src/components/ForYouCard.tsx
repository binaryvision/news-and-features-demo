import type { Content } from "@shared/schema";
import { cn } from "@/lib/utils";

interface ForYouCardProps {
  item: Content;
  index: number;
  imageAspectClass?: string;
}

export function ForYouCard({ item, index, imageAspectClass }: ForYouCardProps) {
  const isSocial = Boolean(item.handle);
  const isThemed = Boolean(item.themeTag) && !item.handle;

  return (
    <article
      className={cn(
        "group cursor-pointer rounded-xl overflow-hidden bg-card border border-border/50",
        "hover:shadow-xl hover:border-border transition-all duration-300 flex flex-col"
      )}
      data-scroll-reveal
    >
      <div className={cn("relative w-full bg-muted overflow-hidden shrink-0", imageAspectClass ?? "aspect-[4/3]")}>
        {item.imageUrl ? (
          <img
            src={item.imageUrl}
            alt={item.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-secondary/30" />
        )}
        {item.themeTag && !isSocial && (
          <span
            className={cn(
              "absolute bg-black/60 backdrop-blur-sm text-white text-xs font-bold rounded-md uppercase tracking-wider px-2 py-1",
              isThemed ? "top-3 left-3" : "bottom-3 left-3"
            )}
          >
            {item.themeTag}
          </span>
        )}
      </div>

      <div className="p-4 flex flex-col flex-shrink-0">
        {isSocial ? (
          <>
            {item.handle && (
              <span className="text-sm font-semibold text-primary mb-1">{item.handle}</span>
            )}
            <p className="text-sm text-muted-foreground line-clamp-2 mb-2">{item.description}</p>
            <span className="text-xs text-muted-foreground">{item.date}</span>
          </>
        ) : isThemed ? (
          <>
            {item.themeTag && (
              <span className="text-xs font-bold text-primary uppercase tracking-wider mb-2">
                {item.themeTag}
              </span>
            )}
            <h3 className="font-display font-bold text-foreground leading-tight group-hover:text-primary transition-colors mb-2">
              {item.title}
            </h3>
            <p className="text-sm text-muted-foreground line-clamp-2">{item.description}</p>
          </>
        ) : (
          <>
            {item.themeTag && (
              <span className="text-xs font-bold text-primary uppercase tracking-wider mb-2">
                {item.themeTag}
              </span>
            )}
            <h3 className="font-display font-bold text-foreground leading-tight group-hover:text-primary transition-colors line-clamp-2">
              {item.title}
            </h3>
          </>
        )}
      </div>
    </article>
  );
}
