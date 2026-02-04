import { Content } from "@shared/schema";
import { ArrowRight, Play, FileText, Radio } from "lucide-react";
import { cn } from "@/lib/utils";

interface ContentGridProps {
  title: string;
  items: Content[];
  onViewAll?: () => void;
  layout?: "grid" | "list";
}

export function ContentGrid({ title, items, onViewAll, layout = "grid" }: ContentGridProps) {
  if (items.length === 0) return null;

  return (
    <section className="py-8" data-scroll-reveal>
      <div className="flex items-center justify-between mb-6">
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

      <div className={cn(
        "grid gap-6",
        layout === "grid"
          ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
          : "grid-cols-1"
      )}>
        {items.map((item, index) => (
          <ContentCard key={item.id} item={item} index={index} layout={layout} />
        ))}
      </div>
    </section>
  );
}

function ContentCard({ item, index, layout }: { item: Content; index: number; layout: "grid" | "list" }) {
  return (
    <div
      className={cn(
        "group cursor-pointer relative overflow-hidden rounded-xl bg-card border border-border/50",
        "hover:shadow-xl hover:border-border transition-all duration-300",
        layout === "list" ? "flex flex-col md:flex-row gap-6 p-4" : "flex flex-col"
      )}
      data-scroll-reveal
    >
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
    </div>
  );
}

function getTypeIcon(type: string, className?: string) {
  switch (type.toLowerCase()) {
    case 'video': return <Play className={className} />;
    case 'audio': return <Radio className={className} />;
    default: return <FileText className={className} />;
  }
}
