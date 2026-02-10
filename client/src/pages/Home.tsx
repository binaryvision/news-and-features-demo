import { useState, useRef, useEffect } from "react";
import { format } from "date-fns";
import { useLocation } from "wouter";
import { useContent } from "@/hooks/use-content";
import { useScrollReveal } from "@/hooks/use-scroll-reveal";
import { SearchInput } from "@/components/SearchInput";
import { FilterSheet } from "@/components/FilterSheet";
import RafLogo from "@/components/RafLogo";
import { ContentGrid } from "@/components/ContentGrid";
import { MultimediaCarousel } from "@/components/MultimediaCarousel";
import { NewsAndFeaturedSection } from "@/components/NewsAndFeaturedSection";
import { SixtySecondsAndPodcastSection } from "@/components/SixtySecondsAndPodcastSection";
import { ForYouSection } from "@/components/ForYouSection";
import { Loader2, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { useStickyMenu } from "@/hooks/use-sticky-menu";

export interface FilterState {
  regions: string[];
  subtopics: string[];
  parentTopics: string[];
  sortBy: "latest" | "bestMatch";
  filterByDate: boolean;
  dateFrom?: string;
  dateTo?: string;
}

const DEFAULT_FILTERS: FilterState = {
  regions: [],
  subtopics: [],
  parentTopics: [],
  sortBy: "bestMatch",
  filterByDate: false,
};

function getInitialFilters(): FilterState {
  if (typeof window === "undefined") return DEFAULT_FILTERS;
  const params = new URLSearchParams(window.location.search);
  const parentTopic = params.get("parentTopic");
  if (parentTopic) {
    return { ...DEFAULT_FILTERS, parentTopics: [decodeURIComponent(parentTopic)] };
  }
  return DEFAULT_FILTERS;
}

function useHideRegions(): boolean {
  if (typeof window === "undefined") return false;
  return new URLSearchParams(window.location.search).has("disableRegions");
}

/** Build path + search string, preserving existing params and applying updates. */
function buildLocationWithParams(updates: { set?: Record<string, string>; remove?: string[] }): string {
  if (typeof window === "undefined") return "/";
  const params = new URLSearchParams(window.location.search);
  updates.remove?.forEach(key => params.delete(key));
  Object.entries(updates.set ?? {}).forEach(([key, value]) => params.set(key, value));
  const search = params.toString();
  return search ? `/?${search}` : "/";
}

export default function Home() {
  const [, setLocation] = useLocation();
  const hideRegions = useHideRegions();
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<FilterState>(getInitialFilters);
  const menuRef = useRef<HTMLDivElement>(null);
  useStickyMenu(menuRef);
  // Listen for URL changes (browser back/forward) and sync filters from search params
  useEffect(() => {
    const syncFiltersFromUrl = () => {
      const params = new URLSearchParams(window.location.search);
      const parentTopic = params.get("parentTopic");
      if (parentTopic) {
        const decoded = decodeURIComponent(parentTopic);
        setFilters(prev => ({ ...prev, parentTopics: [decoded] }));
      } else {
        setFilters(prev => (prev.parentTopics.length === 0 ? prev : { ...prev, parentTopics: [] }));
      }
    };
    window.addEventListener("popstate", syncFiltersFromUrl);
    return () => window.removeEventListener("popstate", syncFiltersFromUrl);
  }, []);

  // Demo/POC: content from local dummy data (no server)
  const { data: content = [], isLoading } = useContent();

  function handleMoreByParentTopic(parentTopic: string) {
    setFilters(prev => ({ ...prev, parentTopics: [parentTopic] }));
    setLocation(buildLocationWithParams({ set: { parentTopic } }));
  }

  function hasActiveFilters(): boolean {
    return (
      filters.regions.length > 0 ||
      filters.subtopics.length > 0 ||
      filters.parentTopics.length > 0 ||
      (filters.filterByDate && (!!filters.dateFrom || !!filters.dateTo))
    );
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

    // Parent topic filtering (e.g. "Operations" = category operations or any of its subtopics)
    const PARENT_TO_CATEGORY: Record<string, string> = {
      "Operations": "operations",
      "Equipment & Technology": "equipment",
    };
    const TOPICS_WITH_SUBTOPICS = [
      { name: "Operations", subtopics: ["Training", "Humanitarian aid", "QRA", "International partnerships", "Exercises", "Protection and Policing"] },
      { name: "People", subtopics: ["Serving families", "Honours", "Sport", "Senior Leadership", "Reserves"] },
      { name: "Equipment & Technology", subtopics: ["Aircraft", "Team Tempest", "Space Command", "Cyberspace"] },
      { name: "Heritage", subtopics: ["Battle of Britain", "D-Day", "Remembrance", "Anniversaries"] },
    ];
    if (filters.parentTopics.length > 0) {
      const matchesParent = filters.parentTopics.some(parentName => {
        const config = TOPICS_WITH_SUBTOPICS.find(t => t.name === parentName);
        if (!config) return false;
        const category = PARENT_TO_CATEGORY[parentName];
        if (category && item.category === category) return true;
        return config.subtopics.some(sub =>
          item.tags?.some(tag => tag.toLowerCase() === sub.toLowerCase())
        );
      });
      if (!matchesParent) return false;
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

    // Date filtering
    if (filters.filterByDate && (filters.dateFrom || filters.dateTo)) {
      const itemTime = new Date(item.date).getTime();
      if (filters.dateFrom) {
        const from = new Date(filters.dateFrom);
        from.setHours(0, 0, 0, 0);
        if (itemTime < from.getTime()) return false;
      }
      if (filters.dateTo) {
        const to = new Date(filters.dateTo);
        to.setHours(23, 59, 59, 999);
        if (itemTime > to.getTime()) return false;
      }
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

  const removeFilter = (type: "region" | "subtopic" | "parentTopic", value: string) => {
    setFilters(prev => ({
      ...prev,
      ...(type === "region" && { regions: prev.regions.filter(r => r !== value) }),
      ...(type === "subtopic" && { subtopics: prev.subtopics.filter(s => s !== value) }),
      ...(type === "parentTopic" && { parentTopics: prev.parentTopics.filter(p => p !== value) }),
    }));
  };

  const clearAllFilters = () => {
    setFilters({
      regions: [],
      subtopics: [],
      parentTopics: [],
      sortBy: "bestMatch",
      filterByDate: false,
      dateFrom: undefined,
      dateTo: undefined,
    });
    setLocation(buildLocationWithParams({ remove: ["parentTopic"] }));
  };

  const clearDateFilter = () => {
    setFilters(prev => ({
      ...prev,
      filterByDate: false,
      dateFrom: undefined,
      dateTo: undefined,
    }));
  };

  const featured = content.find(c => c.isFeatured) || content[0];
  const newsGridItems = content.filter(c => c.category === "news" && !c.isFeatured).slice(0, 6);
  const operations = content.filter(c => c.category === "operations").slice(0, 4);
  const equipment = content.filter(c => c.category === "equipment").slice(0, 4);
  const forYouItems = content.filter(c => c.forYou === true);

  const topMatches = sortedContent.slice(0, 5);
  const contentRef = useRef<HTMLDivElement>(null);
  useScrollReveal(contentRef, !isLoading && !isSearching);
  const allMatches = sortedContent.slice(5);
  const allMatchesBeforeCarousel = allMatches.slice(0, 6);
  const allMatchesAfterCarousel = allMatches.slice(6);

  return (
    <div className="min-h-screen bg-background font-sans text-foreground pb-20">
      <header className="bg-background/80 border-t-4 border-[#002F5F]">
        <div className="max-w-[1608px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <a
            href="/"
            className="flex items-center px-6 py-4 rounded-b-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-[#002F5F] focus-visible:ring-offset-2"
            style={{ backgroundColor: "#002F5F" }}
          >
            <RafLogo className="h-12 w-auto max-w-[220px] sm:max-w-[260px]" />
          </a>
        </div>
      </header>

      <main className="max-w-[1608px] mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="mb-12 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <h1 className="text-4xl font-display font-bold tracking-tight uppercase shrink-0">
            News and Featured
          </h1>
          <div ref={menuRef} className="z-10 flex-1 max-w-2xl flex items-center gap-4">
            <SearchInput
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onClear={() => setSearchQuery("")}
              isExpanded={isSearching}
            />
            <FilterSheet
              filters={filters}
              onFiltersChange={setFilters}
              hideRegions={hideRegions}
            />
          </div>
        </div>

        {hasActiveFilters() && (
          <div className="mb-8 flex flex-wrap items-center gap-2 overflow-hidden">
            <div className="flex flex-wrap gap-2 items-center">
              {filters.filterByDate && (filters.dateFrom || filters.dateTo) && (
                <Badge
                  variant="secondary"
                  className="px-3 py-1.5 gap-2 rounded-lg bg-muted text-foreground border-none hover:bg-muted/80 cursor-default"
                >
                  <span>
                    Date:{" "}
                    {filters.dateFrom && filters.dateTo
                      ? `${format(new Date(filters.dateFrom), "d MMM yyyy")} – ${format(new Date(filters.dateTo), "d MMM yyyy")}`
                      : filters.dateFrom
                        ? `from ${format(new Date(filters.dateFrom), "d MMM yyyy")}`
                        : `until ${format(new Date(filters.dateTo!), "d MMM yyyy")}`}
                  </span>
                  <button
                    onClick={clearDateFilter}
                    className="ml-1 hover:bg-muted-foreground/20 rounded-full p-0.5 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              )}
              {!hideRegions &&
                filters.regions.map(region => (
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
              {filters.parentTopics.map(parent => (
                <Badge
                  key={`parent-${parent}`}
                  variant="secondary"
                  className="px-3 py-1.5 gap-2 rounded-lg bg-muted text-foreground border-none hover:bg-muted/80 cursor-default"
                >
                  {parent}
                  <button
                    onClick={() => removeFilter("parentTopic", parent)}
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
            <SixtySecondsAndPodcastSection />
            <ContentGrid title="OPERATIONS" items={operations} onViewAll={() => handleMoreByParentTopic("Operations")} scrollHorizontalOnMobile />
            <ContentGrid title="EQUIPMENT & TECHNOLOGY" items={equipment} onViewAll={() => handleMoreByParentTopic("Equipment & Technology")} scrollHorizontalOnMobile />
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
              <div className="flex items-center gap-4">
                <span className={cn("text-sm font-medium transition-colors", filters.sortBy === "latest" ? "text-foreground font-bold" : "text-muted-foreground")}>Latest</span>
                <Switch
                  checked={filters.sortBy === "bestMatch"}
                  onCheckedChange={(checked) => setFilters(prev => ({ ...prev, sortBy: checked ? "bestMatch" : "latest" }))}
                />
                <span className={cn("text-sm font-medium transition-colors", filters.sortBy === "bestMatch" ? "text-foreground font-bold" : "text-muted-foreground")}>Best match</span>
              </div>
            </div>

            {topMatches.length > 0 && (
              <div className="mb-12">
                <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-4">Top Matches</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 md:grid-flow-col gap-4 md:grid-rows-[repeat(12,_1fr)]">
                  {/* Column 1: Primary (content over image) + Secondary (image left, content right) */}
                  {topMatches[0] && (
                    <a
                      href={topMatches[0].url}
                      className="md:row-span-7 min-h-[320px] relative flex flex-col rounded-xl border border-border/50 bg-card overflow-hidden hover:shadow-xl hover:border-primary/30 transition-all cursor-pointer group"
                    >
                      <div className="absolute inset-0 bg-muted">
                        {topMatches[0].imageUrl ? (
                          <img src={topMatches[0].imageUrl} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" alt="" />
                        ) : (
                          <div className="w-full h-full bg-secondary/30" />
                        )}
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 p-4 md:p-5 bg-gradient-to-t from-black/80 via-black/50 to-transparent">
                        <span className="text-xs font-bold text-white/90 uppercase tracking-wider">{topMatches[0].labelTag ?? topMatches[0].category}</span>
                        <h4 className="font-display font-bold text-lg md:text-xl text-white mt-1 mb-1 group-hover:text-primary transition-colors line-clamp-3">{topMatches[0].title}</h4>
                        <span className="text-xs text-white/80">{topMatches[0].date}</span>
                      </div>
                    </a>
                  )}
                  {topMatches[1] && (
                    <a
                      href={topMatches[1].url}
                      className="flex flex-row rounded-xl border md:row-span-5 border-border/50 bg-card overflow-hidden hover:shadow-xl hover:border-primary/30 transition-all cursor-pointer group min-h-0"
                    >
                      <div className="w-2/5 min-w-[40%] shrink-0 aspect-video bg-muted overflow-hidden">
                        {topMatches[1].imageUrl ? (
                          <img src={topMatches[1].imageUrl} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" alt="" />
                        ) : (
                          <div className="w-full h-full bg-secondary/30" />
                        )}
                      </div>
                      <div className="flex-1 flex flex-col justify-center p-3 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-0.5">
                          {(topMatches[1].tags?.slice(0, 2) ?? [topMatches[1].category]).map(tag => (
                            <span key={tag} className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">{tag}</span>
                          ))}
                        </div>
                        <h4 className="font-display font-bold text-sm group-hover:text-primary transition-colors line-clamp-2">{topMatches[1].title}</h4>
                        <span className="text-[10px] text-muted-foreground mt-0.5">{topMatches[1].date}</span>
                      </div>
                    </a>
                  )}
                  {/* Column 2: Three secondary-style cards (image left, content right) */}
                  {topMatches[2] && (
                    <a
                      href={topMatches[2].url}
                      className="flex flex-row rounded-xl border md:row-span-4 border-border/50 bg-card overflow-hidden hover:shadow-xl hover:border-primary/30 transition-all cursor-pointer group min-h-0"
                    >
                      <div className="w-2/5 min-w-[40%] shrink-0 aspect-video bg-muted overflow-hidden">
                        {topMatches[2].imageUrl ? (
                          <img src={topMatches[2].imageUrl} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" alt="" />
                        ) : (
                          <div className="w-full h-full bg-secondary/30" />
                        )}
                      </div>
                      <div className="flex-1 flex flex-col justify-center p-3 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-0.5">
                          {(topMatches[2].tags?.slice(0, 2) ?? [topMatches[2].category]).map(tag => (
                            <span key={tag} className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">{tag}</span>
                          ))}
                        </div>
                        <h4 className="font-display font-bold text-sm group-hover:text-primary transition-colors line-clamp-2">{topMatches[2].title}</h4>
                        <span className="text-[10px] text-muted-foreground mt-0.5">{topMatches[2].date}</span>
                      </div>
                    </a>
                  )}
                  {topMatches[3] && (
                    <a
                      href={topMatches[3].url}
                      className="flex flex-row rounded-xl border md:row-span-4 border-border/50 bg-card overflow-hidden hover:shadow-xl hover:border-primary/30 transition-all cursor-pointer group min-h-0"
                    >
                      <div className="w-2/5 min-w-[40%] shrink-0 aspect-video bg-muted overflow-hidden">
                        {topMatches[3].imageUrl ? (
                          <img src={topMatches[3].imageUrl} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" alt="" />
                        ) : (
                          <div className="w-full h-full bg-secondary/30" />
                        )}
                      </div>
                      <div className="flex-1 flex flex-col justify-center p-3 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-0.5">
                          {(topMatches[3].tags?.slice(0, 2) ?? [topMatches[3].category]).map(tag => (
                            <span key={tag} className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">{tag}</span>
                          ))}
                        </div>
                        <h4 className="font-display font-bold text-sm group-hover:text-primary transition-colors line-clamp-2">{topMatches[3].title}</h4>
                        <span className="text-[10px] text-muted-foreground mt-0.5">{topMatches[3].date}</span>
                      </div>
                    </a>
                  )}
                  {topMatches[4] && (
                    <a
                      href={topMatches[4].url}
                      className="flex flex-row rounded-xl md:row-span-4 border border-border/50 bg-card overflow-hidden hover:shadow-xl hover:border-primary/30 transition-all cursor-pointer group min-h-0"
                    >
                      <div className="w-2/5 min-w-[40%] shrink-0 aspect-video bg-muted overflow-hidden">
                        {topMatches[4].imageUrl ? (
                          <img src={topMatches[4].imageUrl} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" alt="" />
                        ) : (
                          <div className="w-full h-full bg-secondary/30" />
                        )}
                      </div>
                      <div className="flex-1 flex flex-col justify-center p-3 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-0.5">
                          {(topMatches[4].tags?.slice(0, 2) ?? [topMatches[4].category]).map(tag => (
                            <span key={tag} className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">{tag}</span>
                          ))}
                        </div>
                        <h4 className="font-display font-bold text-sm group-hover:text-primary transition-colors line-clamp-2">{topMatches[4].title}</h4>
                        <span className="text-[10px] text-muted-foreground mt-0.5">{topMatches[4].date}</span>
                      </div>
                    </a>
                  )}
                </div>
              </div>
            )}

            <div>
              <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-4">All Matches</h3>
              {allMatches.length === 0 && (
                <div className="bg-card rounded-xl border border-border shadow-sm">
                  <div className="p-12 text-center text-muted-foreground">
                    <p>No other matches found.</p>
                  </div>
                </div>
              )}
              {allMatchesBeforeCarousel.length > 0 && (
                <div className="bg-card rounded-xl border border-border shadow-sm divide-y divide-border">
                  {allMatchesBeforeCarousel.map(item => (
                    <a
                      key={item.id}
                      href={item.url}
                      className="p-6 hover:bg-muted/30 transition-colors flex flex-col md:flex-row gap-6 cursor-pointer group block"
                    >
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
                    </a>
                  ))}
                </div>
              )}
              <MultimediaCarousel />
              {allMatchesAfterCarousel.length > 0 && (
                <div className="bg-card rounded-xl border border-border shadow-sm divide-y divide-border mt-10">
                  {allMatchesAfterCarousel.map(item => (
                    <a
                      key={item.id}
                      href={item.url}
                      className="p-6 hover:bg-muted/30 transition-colors flex flex-col md:flex-row gap-6 cursor-pointer group block"
                    >
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
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
