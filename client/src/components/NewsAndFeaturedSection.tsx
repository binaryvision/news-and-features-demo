import type { Content } from "@shared/schema";
import { Play, FileText, Radio } from "lucide-react";
import { cn } from "@/lib/utils";

function getTypeIcon(type: string, className?: string) {
  switch (type.toLowerCase()) {
    case "video":
      return <Play className={className} />;
    case "audio":
      return <Radio className={className} />;
    default:
      return <FileText className={className} />;
  }
}

interface NewsAndFeaturedSectionProps {
  featured: Content | undefined;
  gridItems: Content[];
}

export function NewsAndFeaturedSection({ featured, gridItems }: NewsAndFeaturedSectionProps) {
  const [card1, ...rest] = gridItems;
  const [compact1, compact2, ...textOnly] = rest;
  const [text1, text2, text3] = textOnly;

  return (
    <div className="mb-16" data-scroll-reveal>
      {featured && (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-0 rounded-3xl overflow-hidden shadow-2xl shadow-black/10 mb-12 bg-card border border-border/50">
          <div className="lg:col-span-3 relative aspect-[16/10] lg:aspect-auto lg:min-h-[320px] bg-muted group cursor-pointer">
            {featured.imageUrl ? (
              <img
                src={featured.imageUrl}
                alt={featured.title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-secondary/30">
                {getTypeIcon(featured.type, "w-16 h-16 text-muted-foreground/40")}
              </div>
            )}
            {featured.type === "video" && (
              <div className="absolute bottom-4 right-4 w-14 h-14 rounded-full bg-black/70 flex items-center justify-center text-white">
                <Play className="w-7 h-7 ml-1" />
              </div>
            )}
            {featured.labelTag && (
              <span className="absolute top-4 left-4 px-3 py-1 bg-black/60 backdrop-blur-sm text-white text-xs font-bold rounded-md uppercase tracking-wider">
                {featured.labelTag}
              </span>
            )}
          </div>
          <div className="lg:col-span-2 flex flex-col justify-center p-8 md:p-10 bg-card">
            {featured.labelTag && (
              <span className="inline-block px-3 py-1 bg-primary/10 text-primary text-xs font-bold rounded-md mb-4 uppercase tracking-wider w-fit">
                {featured.labelTag}
              </span>
            )}
            <h1 className="text-2xl md:text-3xl font-display font-bold text-foreground leading-tight mb-4">
              {featured.title}
            </h1>
            <p className="text-muted-foreground leading-relaxed line-clamp-4">
              {featured.description}
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="space-y-0">
          {card1 && (
            <article
              className="group cursor-pointer rounded-xl overflow-hidden bg-card border border-border/50 hover:shadow-xl hover:border-border transition-all duration-300 flex flex-col"
              data-scroll-reveal
            >
              <div className="relative aspect-[4/3] bg-muted overflow-hidden">
                {card1.imageUrl ? (
                  <img
                    src={card1.imageUrl}
                    alt={card1.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-secondary/30">
                    {getTypeIcon(card1.type, "w-12 h-12 text-muted-foreground/30")}
                  </div>
                )}
                {card1.labelTag && (
                  <span className="absolute bottom-3 left-3 px-3 py-1 bg-black/60 backdrop-blur-sm text-white text-xs font-bold rounded-md uppercase tracking-wider">
                    {card1.labelTag}
                  </span>
                )}
              </div>
              <div className="p-5 flex flex-col flex-1">
                <h3 className="font-display font-bold text-foreground leading-tight group-hover:text-primary transition-colors text-lg mb-2">
                  {card1.title}
                </h3>
                <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                  {card1.description}
                </p>
              </div>
            </article>
          )}
        </div>

        <div className="space-y-6">
          {compact1 && <CompactCard item={compact1} />}
          {compact2 && <CompactCard item={compact2} />}
        </div>

        <div className="space-y-6">
          {text1 && <TextOnlyRow item={text1} />}
          {text2 && <TextOnlyRow item={text2} />}
          {text3 && <TextOnlyRow item={text3} />}
        </div>
      </div>
    </div>
  );
}

function CompactCard({ item }: { item: Content }) {
  return (
    <article
      className="group cursor-pointer rounded-xl overflow-hidden bg-card border border-border/50 hover:shadow-xl hover:border-border transition-all duration-300 flex flex-col"
      data-scroll-reveal
    >
      <div className="relative aspect-video bg-muted overflow-hidden">
        {item.imageUrl ? (
          <img
            src={item.imageUrl}
            alt={item.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-secondary/30">
            {getTypeIcon(item.type, "w-10 h-10 text-muted-foreground/30")}
          </div>
        )}
        <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-sm text-white text-xs font-semibold px-2 py-1 rounded-md flex items-center gap-1.5">
          {getTypeIcon(item.type, "w-3 h-3")}
          <span className="uppercase">{item.type}</span>
        </div>
        {item.labelTag && (
          <span className="absolute bottom-2 left-2 px-2 py-1 bg-black/60 backdrop-blur-sm text-white text-xs font-bold rounded uppercase tracking-wider">
            {item.labelTag}
          </span>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-display font-bold text-foreground text-base leading-tight group-hover:text-primary transition-colors line-clamp-2">
          {item.title}
        </h3>
      </div>
    </article>
  );
}

function TextOnlyRow({ item }: { item: Content }) {
  return (
    <article
      className="group cursor-pointer py-4 border-b border-border/50 last:border-0 hover:bg-muted/30 -mx-2 px-2 rounded-lg transition-colors"
      data-scroll-reveal
    >
      {item.labelTag && (
        <span className="inline-block text-xs font-bold text-primary uppercase tracking-wider mb-2">
          {item.labelTag}
        </span>
      )}
      <h3 className="font-display font-bold text-foreground leading-tight group-hover:text-primary transition-colors mb-1">
        {item.title}
      </h3>
      <p className="text-sm text-muted-foreground line-clamp-2">
        {item.description}
      </p>
    </article>
  );
}
