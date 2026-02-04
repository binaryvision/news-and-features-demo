import type { Content } from "@shared/schema";
import Masonry from "react-masonry-css";
import { ForYouCard } from "@/components/ForYouCard";

interface ForYouSectionProps {
  items: Content[];
}

/**
 * Three-column masonry layout using react-masonry-css (CSS-based, no jQuery).
 * See https://masonry.desandro.com/layout and https://www.npmjs.com/package/react-masonry-css
 */
const breakpointColumns = {
  default: 3,
  1024: 3,
  768: 2,
  500: 1,
};

/** Vary image aspect per card so masonry has mixed heights (landscape, portrait, wide, square) */
const IMAGE_ASPECT_VARIANTS = [
  "aspect-[4/3]",
  "aspect-[3/4]",
  "aspect-[16/9]",
  "aspect-square",
  "aspect-[5/4]",
  "aspect-[4/5]",
];

export function ForYouSection({ items }: ForYouSectionProps) {
  if (items.length === 0) return null;

  const displayItems = items.slice(0, 9);

  return (
    <section className="py-12 bg-secondary/30 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 mt-8">
      <div className="max-w-[1608px] mx-auto">
        <h2 className="text-2xl font-bold tracking-tight text-foreground/90 uppercase font-display text-center mb-8">
          FOR YOU / YOU MIGHT ALSO BE INTERESTED IN
        </h2>
        <Masonry
          breakpointCols={breakpointColumns}
          className="flex w-auto -ml-4"
          columnClassName="pl-4 bg-clip-padding"
          data-scroll-reveal
        >
          {displayItems.map((item, index) => (
            <div key={item.id} className="mb-4">
              <ForYouCard
                item={item}
                index={index}
                imageAspectClass={IMAGE_ASPECT_VARIANTS[index % IMAGE_ASPECT_VARIANTS.length]}
              />
            </div>
          ))}
        </Masonry>
      </div>
    </section>
  );
}
