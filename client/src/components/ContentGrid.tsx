import { Content } from "@shared/schema";
import { ArrowRight, Play, FileText, Radio } from "lucide-react";
import { cn } from "@/lib/utils";

interface ContentGridProps {
  title: string;
  items: Content[];
  onViewAll?: () => void;
  layout?: "grid" | "list";
  /** On mobile, show items in a horizontal scroll row instead of a vertical grid. */
  scrollHorizontalOnMobile?: boolean;
}

export function ContentGrid({ title, items, onViewAll, layout = "grid", scrollHorizontalOnMobile = false }: ContentGridProps) {
  if (items.length === 0) return null;

  const isGrid = layout === "grid";
  const useMobileScroll = isGrid && scrollHorizontalOnMobile;

  return (
    <section className="py-8">
      <div className="flex items-center justify-between mb-6" data-scroll-reveal>
        <h2 className="text-2xl font-bold tracking-tight text-foreground/90 uppercase font-display">{title}</h2>
        {onViewAll && (
          <button
            onClick={onViewAll}
            className="text-sm font-semibold text-primary hover:text-primary/80 flex items-center gap-1 transition-colors"
          >
            More {title.split(" ").map((w) => w.charAt(0) + w.slice(1).toLowerCase()).join(" ")} <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>

      <div
        className={cn(
          "gap-6",
          useMobileScroll
            ? "flex overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0 md:overflow-visible md:grid md:grid-cols-2 lg:grid-cols-4"
            : cn(
                "grid",
                isGrid ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4" : "grid-cols-1"
              )
        )}
        data-scroll-reveal
      >
        {items.map((item) =>
          useMobileScroll ? (
            <div
              key={item.id}
              className="shrink-0 w-[min(85vw,320px)] md:w-auto md:min-w-0"
            >
              <ContentCard item={item} layout={layout} />
            </div>
          ) : (
            <ContentCard key={item.id} item={item} layout={layout} />
          )
        )}
      </div>
    </section>
  );
}

function ContentCard({ item, layout }: { item: Content; layout: "grid" | "list" }) {
  const className = cn(
    "group cursor-pointer relative overflow-hidden rounded-xl bg-card border border-border/50",
    "hover:shadow-xl hover:border-border",
    layout === "list" ? "flex flex-col md:flex-row gap-6 p-4" : "flex flex-col"
  );
  const inner = (
    <>
      <div className={cn(
        "relative overflow-hidden bg-muted",
        layout === "list" ? "w-full md:w-64 aspect-video rounded-lg shrink-0" : "w-full aspect-[4/3]"
      )}>
        {item.imageUrl ? (
          <img
            src={item.imageUrl}
            alt={item.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-secondary/30">
            {getTypeIcon(item.type, "w-12 h-12 text-muted-foreground/30")}
          </div>
        )}
        <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-sm text-white text-xs font-semibold px-2 py-1 rounded-md flex items-center gap-1.5">
          {getTypeIcon(item.type, "w-3 h-3")}
          <span className="uppercase">{item.type}</span>
        </div>
      </div>

      <div className={cn(
        "flex flex-col",
        layout === "list" ? "justify-center flex-1" : "p-5"
      )}>
        <div className="flex items-center gap-2 mb-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
          <span className="text-primary">{item.labelTag ?? item.category}</span>
          <span>•</span>
          <span>{item.date}</span>
        </div>
        <h3 className={cn(
          "font-display font-bold text-foreground leading-tight group-hover:text-primary transition-colors",
          layout === "list" ? "text-xl mb-2" : "text-lg mb-2"
        )}>
          {item.title}
        </h3>
        <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
          {item.description}
        </p>
        {layout === "list" && item.tags && (
          <div className="mt-4 flex flex-wrap gap-2">
            {item.tags.map(tag => (
              <span key={tag} className="px-2 py-1 bg-secondary text-secondary-foreground text-xs rounded-md font-medium">
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </>
  );
  return (
    <a href={item.url} className={className}>
      {inner}
    </a>
  );
}

function getTypeIcon(type: string, className?: string) {
  switch (type.toLowerCase()) {
    case 'video': return <Play className={className} />;
    case 'audio': return <Radio className={className} />;
    default: return <FileText className={className} />;
  }
}
