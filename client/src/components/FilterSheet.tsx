import { useState } from "react";
import { format } from "date-fns";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { SlidersHorizontal, X, ChevronDown, CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import type { FilterState } from "@/pages/Home";

const EARTH_REGIONS = ["UK", "Asia", "Africa", "Europe", "Middle East", "North America", "Oceania", "South America"];
const SPACE_REGION = ["Space"];

const TOPICS_WITH_SUBTOPICS = [
  {
    name: "Operations",
    subtopics: ["Training", "Humanitarian aid", "QRA", "International partnerships", "Exercises", "Protection and Policing"]
  },
  {
    name: "People",
    subtopics: ["Serving families", "Honours", "Sport", "Senior Leadership", "Reserves"]
  },
  {
    name: "Equipment & Technology",
    subtopics: ["Aircraft", "Team Tempest", "Space Command", "Cyberspace"]
  },
  {
    name: "Heritage",
    subtopics: ["Battle of Britain", "D-Day", "Remembrance", "Anniversaries"]
  }
];

function subtopicsOf(parentName: string): string[] {
  return TOPICS_WITH_SUBTOPICS.find(t => t.name === parentName)?.subtopics ?? [];
}

function parentOf(subtopic: string): string | undefined {
  return TOPICS_WITH_SUBTOPICS.find(t => t.subtopics.includes(subtopic))?.name;
}

interface FilterSheetProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
}

export function FilterSheet({ filters, onFiltersChange }: FilterSheetProps) {
  const [expandedTopics, setExpandedTopics] = useState<string[]>(["Operations", "People", "Equipment & Technology", "Heritage"]);
  
  const toggleTopic = (topicName: string) => {
    setExpandedTopics(prev => 
      prev.includes(topicName) ? prev.filter(t => t !== topicName) : [...prev, topicName]
    );
  };

  const toggleParentTopic = (parentName: string) => {
    const isAdding = !filters.parentTopics.includes(parentName);
    onFiltersChange({
      ...filters,
      parentTopics: isAdding
        ? [...filters.parentTopics, parentName]
        : filters.parentTopics.filter(p => p !== parentName),
      ...(isAdding && {
        subtopics: filters.subtopics.filter(s => !subtopicsOf(parentName).includes(s)),
      }),
    });
  };

  const toggleSubtopic = (subtopic: string) => {
    const isAdding = !filters.subtopics.includes(subtopic);
    const parent = parentOf(subtopic);
    onFiltersChange({
      ...filters,
      subtopics: isAdding
        ? [...filters.subtopics, subtopic]
        : filters.subtopics.filter(s => s !== subtopic),
      ...(isAdding && parent && {
        parentTopics: filters.parentTopics.filter(p => p !== parent),
      }),
    });
  };

  const toggleRegion = (region: string) => {
    onFiltersChange({
      ...filters,
      regions: filters.regions.includes(region)
        ? filters.regions.filter(r => r !== region)
        : [...filters.regions, region]
    });
  };

  const clearRegions = () => {
    onFiltersChange({
      ...filters,
      regions: []
    });
  };

  const clearSubtopics = () => {
    onFiltersChange({
      ...filters,
      subtopics: [],
      parentTopics: [],
    });
  };

  const handleSortChange = (isBestMatch: boolean) => {
    onFiltersChange({
      ...filters,
      sortBy: isBestMatch ? "bestMatch" : "latest"
    });
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" className="gap-2 h-14 rounded-2xl px-6 border-2">
          <SlidersHorizontal className="w-5 h-5" />
          <span className="font-bold">Filters</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-full sm:max-w-xl overflow-y-auto">
        <SheetHeader className="flex flex-row items-center justify-between border-b pb-4 mb-6">
          <SheetTitle className="text-2xl font-bold">Filters</SheetTitle>
        </SheetHeader>

        <div className="space-y-10">
          {/* Sort By */}
          <section className="space-y-4">
            <h3 className="text-lg font-bold">Sort by</h3>
            <div className="flex items-center gap-4">
              <span className={cn("text-sm font-medium transition-colors", filters.sortBy === "latest" ? "text-foreground font-bold" : "text-muted-foreground")}>Latest</span>
              <Switch checked={filters.sortBy === "bestMatch"} onCheckedChange={handleSortChange} />
              <span className={cn("text-sm font-medium transition-colors", filters.sortBy === "bestMatch" ? "text-foreground font-bold" : "text-muted-foreground")}>Best match</span>
            </div>
          </section>

          {/* Filter by Date */}
          <section className="space-y-4">
            <h3 className="text-lg font-bold">Filter by date</h3>
            <div className="flex items-center gap-4 mb-4">
              <span className="text-sm font-medium">Anytime</span>
              <Switch
                checked={filters.filterByDate}
                onCheckedChange={(checked) =>
                  onFiltersChange({
                    ...filters,
                    filterByDate: checked,
                    ...(checked ? {} : { dateFrom: undefined, dateTo: undefined }),
                  })
                }
              />
            </div>
            {filters.filterByDate && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>From:</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal h-12 bg-muted border-none",
                          !filters.dateFrom && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {filters.dateFrom ? format(new Date(filters.dateFrom), "dd/MM/yyyy") : "DD/MM/YYYY"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={filters.dateFrom ? new Date(filters.dateFrom) : undefined}
                        onSelect={(date) =>
                          onFiltersChange({
                            ...filters,
                            dateFrom: date ? format(date, "yyyy-MM-dd") : undefined,
                          })
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="space-y-2">
                  <Label>To:</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal h-12 bg-muted border-none",
                          !filters.dateTo && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {filters.dateTo ? format(new Date(filters.dateTo), "dd/MM/yyyy") : "DD/MM/YYYY"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={filters.dateTo ? new Date(filters.dateTo) : undefined}
                        onSelect={(date) =>
                          onFiltersChange({
                            ...filters,
                            dateTo: date ? format(date, "yyyy-MM-dd") : undefined,
                          })
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            )}
          </section>

          {/* Filter by Region */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold">Filter by region</h3>
              {filters.regions.length > 0 && (
                <button 
                  onClick={clearRegions}
                  className="text-sm font-bold flex items-center gap-1 hover:underline"
                >
                  Clear all <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-2 items-center">
              {EARTH_REGIONS.map(region => (
                <Badge
                  key={region}
                  variant={filters.regions.includes(region) ? "default" : "outline"}
                  className="cursor-pointer px-4 py-2 rounded-lg text-sm font-medium h-auto"
                  onClick={() => toggleRegion(region)}
                >
                  {region}
                </Badge>
              ))}
              <div className="w-full py-1">
                <Separator className="h-0.5 bg-muted-foreground/20" />
              </div>
              {SPACE_REGION.map(region => (
                <Badge
                  key={region}
                  variant={filters.regions.includes(region) ? "default" : "outline"}
                  className="cursor-pointer px-4 py-2 rounded-lg text-sm font-medium h-auto"
                  onClick={() => toggleRegion(region)}
                >
                  {region}
                </Badge>
              ))}
            </div>
          </section>

          {/* Filter by Topic */}
          <section className="space-y-4 pb-10">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold">Filter by topic</h3>
              {(filters.subtopics.length > 0 || filters.parentTopics.length > 0) && (
                <button
                  onClick={clearSubtopics}
                  className="text-sm font-bold flex items-center gap-1 hover:underline"
                >
                  Clear all <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <div className="grid grid-cols-1 gap-6">
              {TOPICS_WITH_SUBTOPICS.map(topic => (
                <div key={topic.name} className="space-y-3">
                  <div
                    onClick={() => toggleTopic(topic.name)}
                    className="flex items-center gap-3 bg-muted p-4 rounded-lg cursor-pointer hover:bg-muted/80 transition-colors"
                  >
                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleParentTopic(topic.name);
                      }}
                      className={cn(
                        "w-5 h-5 border-2 rounded flex items-center justify-center transition-colors shrink-0",
                        filters.parentTopics.includes(topic.name)
                          ? "bg-foreground border-foreground"
                          : "bg-white border-muted-foreground/30"
                      )}
                    >
                      {filters.parentTopics.includes(topic.name) && (
                        <svg className="w-3.5 h-3.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      )}
                    </div>
                    <span className="flex-1 text-sm font-bold">{topic.name}</span>
                    <ChevronDown className={cn("w-4 h-4 text-muted-foreground transition-transform shrink-0", expandedTopics.includes(topic.name) ? "rotate-180" : "")} />
                  </div>

                  {expandedTopics.includes(topic.name) && (
                    <div className="pl-4 grid grid-cols-1 gap-2">
                      {topic.subtopics.map(sub => (
                        <label key={sub} className="flex items-center gap-3 cursor-pointer group py-1">
                          <div
                            onClick={() => toggleSubtopic(sub)}
                            className={cn(
                              "w-5 h-5 border-2 rounded flex items-center justify-center transition-colors",
                              filters.subtopics.includes(sub) ? "bg-foreground border-foreground" : "bg-white border-muted-foreground/30"
                            )}
                          >
                            {filters.subtopics.includes(sub) && (
                              <svg className="w-3.5 h-3.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4">
                                <polyline points="20 6 9 17 4 12" />
                              </svg>
                            )}
                          </div>
                          <span className="text-sm font-medium text-foreground/80 group-hover:text-foreground">{sub}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="sticky bottom-0 left-0 right-0 bg-background pt-4 border-t mt-auto">
          <SheetClose asChild>
            <Button className="w-full h-12 font-bold text-lg">View results</Button>
          </SheetClose>
        </div>
      </SheetContent>
    </Sheet>
  );
}

