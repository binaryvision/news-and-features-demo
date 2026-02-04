import { useState, useRef } from "react";
import { useContent } from "@/hooks/use-content";
import { useScrollReveal } from "@/hooks/use-scroll-reveal";
import type { Content } from "@shared/schema";
import { SearchInput } from "@/components/SearchInput";
import { FilterSheet } from "@/components/FilterSheet";
import { ContentGrid } from "@/components/ContentGrid";
import { NewsAndFeaturedSection } from "@/components/NewsAndFeaturedSection";
import { ForYouSection } from "@/components/ForYouSection";
import { Loader2, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export interface FilterState {
  regions: string[];
  subtopics: string[];
  sortBy: "latest" | "bestMatch";
  dateFrom?: string;
  dateTo?: string;
}

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<FilterState>({
    regions: [],
    subtopics: [],
    sortBy: "latest",
  });

  // Demo/POC: content from local dummy data (no server)
  const { data: content = [], isLoading } = useContent();

  function hasActiveFilters(): boolean {
    return filters.regions.length > 0 || filters.subtopics.length > 0;
  }

  // Client-side filtering for POC responsiveness
  const isSearching = searchQuery.length > 0 || hasActiveFilters();

  const filteredContent = content.filter(item => {
    // Search filtering
    if (searchQuery.length > 0) {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        item.title.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.tags?.some(tag => tag.toLowerCase().includes(q)) ||
        (item.labelTag?.toLowerCase().includes(q)) ||
        (item.themeTag?.toLowerCase().includes(q)) ||
        (item.handle?.toLowerCase().includes(q));
      if (!matchesSearch) return false;
    }

    // Region filtering (check tags for region names)
    if (filters.regions.length > 0) {
      const matchesRegion = filters.regions.some(region =>
        item.tags?.some(tag => tag.toLowerCase().includes(region.toLowerCase())) ||
        item.description.toLowerCase().includes(region.toLowerCase())
      );
      if (!matchesRegion) return false;
    }

    // Subtopic filtering (check tags and category)
    if (filters.subtopics.length > 0) {
      const matchesSubtopic = filters.subtopics.some(subtopic =>
        item.tags?.some(tag => tag.toLowerCase().includes(subtopic.toLowerCase())) ||
        item.category.toLowerCase().includes(subtopic.toLowerCase()) ||
        item.description.toLowerCase().includes(subtopic.toLowerCase())
      );
      if (!matchesSubtopic) return false;
    }

    return true;
  });

  // Sort content
  const sortedContent = [...filteredContent].sort((a, b) => {
    if (filters.sortBy === "latest") {
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    }
    return 0;
  });

  const removeFilter = (type: "region" | "subtopic", value: string) => {
    setFilters(prev => ({
      ...prev,
      [type === "region" ? "regions" : "subtopics"]: prev[type === "region" ? "regions" : "subtopics"].filter(
        item => item !== value
      ),
    }));
  };

  const clearAllFilters = () => {
    setFilters({
      regions: [],
      subtopics: [],
      sortBy: "latest",
    });
  };

  const featured = content.find(c => c.isFeatured) || content[0];
  const newsGridItems = content.filter(c => c.category === "news" && !c.isFeatured).slice(0, 6);
  const operations = content.filter(c => c.category === "operations").slice(0, 4);
  const equipment = content.filter(c => c.category === "equipment").slice(0, 4);
  const forYouItems = content.filter(c => c.forYou === true);

  const topMatches = sortedContent.slice(0, 2);
  const contentRef = useRef<HTMLDivElement>(null);
  useScrollReveal(contentRef, !isLoading && !isSearching);
  const allMatches = sortedContent.slice(2);

  return (
    <div className="min-h-screen bg-background font-sans text-foreground pb-20">
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50">
        <div className="max-w-[1608px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 font-display font-bold text-xl tracking-tight">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white">
              S
            </div>
            <span>SEARCH<span className="text-primary">POC</span></span>
          </div>
          <div className="w-8 h-8 rounded-full bg-secondary"></div>
        </div>
      </header>

      <main className="max-w-[1608px] mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="relative z-40 mb-12 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <h1 className="text-4xl font-display font-bold tracking-tight uppercase shrink-0">
            News and Featured
          </h1>
          <div className="flex-1 max-w-2xl flex items-center gap-4">
            <SearchInput
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onClear={() => setSearchQuery("")}
              isExpanded={isSearching}
            />
            <FilterSheet
              filters={filters}
              onFiltersChange={setFilters}
            />
          </div>
        </div>

        {hasActiveFilters() && (
          <div className="mb-8 flex flex-wrap items-center gap-2 overflow-hidden">
            <div className="flex flex-wrap gap-2 items-center">
              {filters.regions.map(region => (
                <Badge
                  key={`region-${region}`}
                  variant="secondary"
                  className="px-3 py-1.5 gap-2 rounded-lg bg-muted text-foreground border-none hover:bg-muted/80 cursor-default"
                >
                  {region}
                  <button
                    onClick={() => removeFilter("region", region)}
                    className="ml-1 hover:bg-muted-foreground/20 rounded-full p-0.5 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
              {filters.subtopics.map(subtopic => (
                <Badge
                  key={`subtopic-${subtopic}`}
                  variant="secondary"
                  className="px-3 py-1.5 gap-2 rounded-lg bg-muted text-foreground border-none hover:bg-muted/80 cursor-default"
                >
                  {subtopic}
                  <button
                    onClick={() => removeFilter("subtopic", subtopic)}
                    className="ml-1 hover:bg-muted-foreground/20 rounded-full p-0.5 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
              <button
                onClick={clearAllFilters}
                className="text-sm font-bold flex items-center gap-1 ml-2 hover:underline text-muted-foreground hover:text-foreground transition-colors"
              >
                Clear all <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : !isSearching ? (
          <div key="landing" ref={contentRef}>
            <NewsAndFeaturedSection featured={featured} gridItems={newsGridItems} />
            <ContentGrid title="OPERATIONS" items={operations} onViewAll={() => {}} />
            <ContentGrid title="EQUIPMENT & TECHNOLOGY" items={equipment} onViewAll={() => {}} />
            <ForYouSection items={forYouItems} />
          </div>
        ) : (
          <div key="results">
            <div className="flex items-center justify-between mb-8 border-b border-border pb-4">
              <h2 className="text-xl text-muted-foreground">
                {searchQuery ? (
                  <>
                    <span className="text-foreground font-bold">{sortedContent.length} results</span> found for "{searchQuery}"
                  </>
                ) : (
                  <span className="text-foreground font-bold">{sortedContent.length} results</span>
                )}
              </h2>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>Sort by:</span>
                <span className="font-medium text-foreground capitalize">{filters.sortBy === "latest" ? "Latest" : "Best match"}</span>
              </div>
            </div>

            {topMatches.length > 0 && (
              <div className="mb-12">
                <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-4">Top Matches</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {topMatches.map((item) => (
                    <div key={item.id} className="bg-secondary/30 rounded-xl p-6 border border-border/50 hover:border-primary/30 transition-colors cursor-pointer group">
                      <div className="flex gap-4">
                        <div className="w-24 h-24 bg-background rounded-lg shadow-sm shrink-0 overflow-hidden">
                          {item.imageUrl && <img src={item.imageUrl} className="w-full h-full object-cover" alt="" />}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-xs font-bold text-primary uppercase">{item.category}</span>
                            <span className="text-xs text-muted-foreground">• {item.date}</span>
                          </div>
                          <h4 className="font-bold text-lg mb-2 group-hover:text-primary transition-colors">{item.title}</h4>
                          <p className="text-sm text-muted-foreground line-clamp-2">{item.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div>
              <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-4">All Matches</h3>
              <div className="bg-card rounded-xl border border-border shadow-sm divide-y divide-border">
                {allMatches.length > 0 ? (
                  allMatches.map(item => (
                    <div key={item.id} className="p-6 hover:bg-muted/30 transition-colors flex flex-col md:flex-row gap-6 cursor-pointer group">
                      <div className="w-full md:w-48 aspect-video bg-muted rounded-lg shrink-0 overflow-hidden">
                        {item.imageUrl && (
                          <img src={item.imageUrl} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" alt="" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="px-2 py-0.5 rounded text-xs font-medium bg-secondary text-secondary-foreground uppercase">{item.type}</span>
                          <span className="text-xs text-muted-foreground">{item.date}</span>
                        </div>
                        <h4 className="font-bold text-xl mb-2 group-hover:text-primary transition-colors">{item.title}</h4>
                        <p className="text-muted-foreground mb-4 line-clamp-2">{item.description}</p>
                        {item.tags && (
                          <div className="flex flex-wrap gap-2">
                            {item.tags.map(tag => (
                              <span key={tag} className="text-xs text-muted-foreground bg-secondary/50 px-2 py-1 rounded">#{tag}</span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-12 text-center text-muted-foreground">
                    <p>No other matches found.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
