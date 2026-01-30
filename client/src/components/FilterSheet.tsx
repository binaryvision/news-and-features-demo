import { useState } from "react";
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetTrigger,
  SheetClose
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { SlidersHorizontal, X, ChevronDown } from "lucide-react";

const REGIONS = ["UK", "Asia", "Africa", "Europe", "Middle East", "North America", "Oceania", "South America", "Space"];
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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

export function FilterSheet() {
  const [regions, setRegions] = useState<string[]>(["Asia", "Middle East", "North America"]);
  const [isBestMatch, setIsBestMatch] = useState(false);
  const [expandedTopics, setExpandedTopics] = useState<string[]>(["Operations", "People", "Equipment & Technology", "Heritage"]);
  const [selectedSubtopics, setSelectedSubtopics] = useState<string[]>(["Honours", "Reserves"]);
  
  const toggleTopic = (topicName: string) => {
    setExpandedTopics(prev => 
      prev.includes(topicName) ? prev.filter(t => t !== topicName) : [...prev, topicName]
    );
  };

  const toggleSubtopic = (subtopic: string) => {
    setSelectedSubtopics(prev =>
      prev.includes(subtopic) ? prev.filter(s => s !== subtopic) : [...prev, subtopic]
    );
  };

  const toggleRegion = (region: string) => {
    setRegions(prev => 
      prev.includes(region) ? prev.filter(r => r !== region) : [...prev, region]
    );
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
              <span className={cn("text-sm font-medium transition-colors", !isBestMatch ? "text-foreground font-bold" : "text-muted-foreground")}>Latest</span>
              <Switch checked={isBestMatch} onCheckedChange={setIsBestMatch} />
              <span className={cn("text-sm font-medium transition-colors", isBestMatch ? "text-foreground font-bold" : "text-muted-foreground")}>Best match</span>
            </div>
          </section>

          {/* Filter by Date */}
          <section className="space-y-4">
            <h3 className="text-lg font-bold">Filter by date</h3>
            <div className="flex items-center gap-4 mb-4">
              <span className="text-sm font-medium">Anytime</span>
              <Switch />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>From:</Label>
                <Input type="text" placeholder="DD/MM/YYYY" className="bg-muted border-none h-12" />
              </div>
              <div className="space-y-2">
                <Label>To:</Label>
                <Input type="text" placeholder="DD/MM/YYYY" className="bg-muted border-none h-12" />
              </div>
            </div>
          </section>

          {/* Filter by Region */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold">Filter by region</h3>
              <button 
                onClick={() => setRegions([])}
                className="text-sm font-bold flex items-center gap-1 hover:underline"
              >
                Clear all <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {REGIONS.map(region => (
                <Badge
                  key={region}
                  variant={regions.includes(region) ? "default" : "outline"}
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
              <button 
                onClick={() => setSelectedSubtopics([])}
                className="text-sm font-bold flex items-center gap-1 hover:underline"
              >
                Clear all <X className="w-4 h-4" />
              </button>
            </div>
            <div className="grid grid-cols-1 gap-6">
              {TOPICS_WITH_SUBTOPICS.map(topic => (
                <div key={topic.name} className="space-y-3">
                  <div 
                    onClick={() => toggleTopic(topic.name)}
                    className="flex items-center gap-3 bg-muted p-4 rounded-lg cursor-pointer hover:bg-muted/80 transition-colors"
                  >
                    <div className="w-5 h-5 border-2 rounded bg-white flex items-center justify-center">
                      {topic.subtopics.some(s => selectedSubtopics.includes(s)) && (
                        <div className="w-2 h-2 bg-foreground rounded-full" />
                      )}
                    </div>
                    <span className="flex-1 text-sm font-bold">{topic.name}</span>
                    <ChevronDown className={cn("w-4 h-4 text-muted-foreground transition-transform", expandedTopics.includes(topic.name) ? "rotate-180" : "")} />
                  </div>
                  
                  {expandedTopics.includes(topic.name) && (
                    <div className="pl-4 grid grid-cols-1 gap-2">
                      {topic.subtopics.map(sub => (
                        <label key={sub} className="flex items-center gap-3 cursor-pointer group py-1">
                          <div 
                            onClick={() => toggleSubtopic(sub)}
                            className={cn(
                              "w-5 h-5 border-2 rounded flex items-center justify-center transition-colors",
                              selectedSubtopics.includes(sub) ? "bg-foreground border-foreground" : "bg-white border-muted-foreground/30"
                            )}
                          >
                            {selectedSubtopics.includes(sub) && (
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
            <Button className="w-full h-12 font-bold text-lg">Apply Filters</Button>
          </SheetClose>
        </div>
      </SheetContent>
    </Sheet>
  );
}

