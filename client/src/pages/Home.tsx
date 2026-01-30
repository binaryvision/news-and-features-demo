import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api, type Content } from "@shared/routes";
import { SearchInput } from "@/components/SearchInput";
import { ContentGrid } from "@/components/ContentGrid";
import { motion, AnimatePresence } from "framer-motion";
import { Filter, ChevronDown, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

// Categories for filter chips
const FILTERS = ["Aircraft", "Asia", "Cyberspace", "People", "Operations"];

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<string | null>(null);

  // Fetch all content
  const { data: content = [], isLoading } = useQuery({
    queryKey: [api.content.list.path],
    queryFn: async () => {
      const res = await fetch(api.content.list.path);
      if (!res.ok) return []; // Fallback for POC if backend not ready
      return api.content.list.responses[200].parse(await res.json());
    },
  });

  // Client-side filtering for POC responsiveness
  const isSearching = searchQuery.length > 0;
  
  const filteredContent = content.filter(item => {
    if (!isSearching) return true;
    
    const matchesSearch = 
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());
      
    const matchesFilter = activeFilter 
      ? item.tags?.includes(activeFilter) || item.category === activeFilter
      : true;

    return matchesSearch && matchesFilter;
  });

  const featured = content.find(c => c.isFeatured) || content[0];
  const operations = content.filter(c => c.category === 'operation').slice(0, 4);
  const equipment = content.filter(c => c.category === 'equipment').slice(0, 4);
  
  // Simulated search results
  const topMatches = filteredContent.slice(0, 2);
  const allMatches = filteredContent.slice(2);

  return (
    <div className="min-h-screen bg-background font-sans text-foreground pb-20">
      {/* Navbar Placeholder */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 font-display font-bold text-xl tracking-tight">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white">
              S
            </div>
            <span>SEARCH<span className="text-primary">POC</span></span>
          </div>
          <div className="hidden md:flex items-center gap-6 text-sm font-medium text-muted-foreground">
            <span className="hover:text-foreground cursor-pointer transition-colors">NEWS</span>
            <span className="hover:text-foreground cursor-pointer transition-colors">OPERATIONS</span>
            <span className="hover:text-foreground cursor-pointer transition-colors">EQUIPMENT</span>
          </div>
          <div className="w-8 h-8 rounded-full bg-secondary"></div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* Search Bar Area */}
        <div className="relative z-40 mb-12 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <h1 className="text-4xl font-display font-bold tracking-tight uppercase shrink-0">
            News and Featured
          </h1>
          <div className="flex-1 max-w-2xl">
            <SearchInput 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onClear={() => setSearchQuery("")}
              isExpanded={isSearching}
            />
          </div>
        </div>
          
        {/* Animated Filters */}
          <AnimatePresence>
            {isSearching && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4 flex flex-wrap items-center gap-2 overflow-hidden"
              >
                <span className="text-sm font-medium text-muted-foreground mr-2">Filters:</span>
                {FILTERS.map(filter => (
                  <button
                    key={filter}
                    onClick={() => setActiveFilter(activeFilter === filter ? null : filter)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                      activeFilter === filter 
                        ? "bg-primary text-primary-foreground ring-2 ring-primary/20" 
                        : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                    }`}
                  >
                    {filter}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        {/* Content States */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <AnimatePresence mode="wait">
            {!isSearching ? (
              <motion.div
                key="landing"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                {/* Hero Featured Item */}
                {featured && (
                  <div className="mb-16 relative rounded-3xl overflow-hidden aspect-[21/9] group cursor-pointer shadow-2xl shadow-black/10">
                    <img 
                      src={featured.imageUrl || "https://images.unsplash.com/photo-1542281286-9e0a16bb7366?auto=format&fit=crop&q=80"} 
                      alt={featured.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-8 md:p-12">
                      <div className="max-w-3xl">
                        <span className="inline-block px-3 py-1 bg-accent text-white text-xs font-bold rounded-md mb-4 uppercase tracking-wider">
                          Featured Story
                        </span>
                        <h1 className="text-3xl md:text-5xl font-display font-bold text-white mb-4 leading-tight">
                          {featured.title}
                        </h1>
                        <p className="text-lg text-white/80 line-clamp-2 max-w-2xl">
                          {featured.description}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <ContentGrid title="OPERATIONS" items={operations} />
                <ContentGrid title="EQUIPMENT & TECHNOLOGY" items={equipment} />
                
                <section className="py-12 bg-secondary/30 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 mt-8">
                  <div className="max-w-7xl mx-auto">
                    <div className="flex items-center justify-between mb-8">
                      <h2 className="text-2xl font-bold tracking-tight text-foreground/90 uppercase font-display">FOR YOU</h2>
                    </div>
                    {/* Placeholder for recommendations - reused Operations for demo */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                      {operations.slice(0, 3).map(item => (
                        <div key={item.id} className="flex gap-4 items-start">
                           <div className="w-24 h-24 bg-muted rounded-lg shrink-0 overflow-hidden">
                             {item.imageUrl && <img src={item.imageUrl} className="w-full h-full object-cover" />}
                           </div>
                           <div>
                             <h4 className="font-bold text-base leading-snug mb-1">{item.title}</h4>
                             <p className="text-sm text-muted-foreground line-clamp-2">{item.description}</p>
                           </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </section>
              </motion.div>
            ) : (
              <motion.div
                key="results"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex items-center justify-between mb-8 border-b border-border pb-4">
                  <h2 className="text-xl text-muted-foreground">
                    <span className="text-foreground font-bold">{filteredContent.length} results</span> found for "{searchQuery}"
                  </h2>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>Sort by:</span>
                    <button className="flex items-center gap-1 font-medium text-foreground">
                      Relevance <ChevronDown className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {topMatches.length > 0 && (
                  <div className="mb-12">
                    <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-4">Top Matches</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {topMatches.map((item, i) => (
                        <div key={item.id} className="bg-secondary/30 rounded-xl p-6 border border-border/50 hover:border-primary/30 transition-colors cursor-pointer group">
                          <div className="flex gap-4">
                            <div className="w-24 h-24 bg-background rounded-lg shadow-sm shrink-0 overflow-hidden">
                              {item.imageUrl && <img src={item.imageUrl} className="w-full h-full object-cover" />}
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
                               <img src={item.imageUrl} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
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
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </main>
    </div>
  );
}
