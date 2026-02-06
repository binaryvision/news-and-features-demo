import { Play, Radio, ArrowRight } from "lucide-react";

const SIXTY_SECONDS_ARTICLE_URL = "https://www.raf.mod.uk/news/articles/raf-60-second-update-46/";
const SIXTY_SECONDS_VIDEO_ID = "L-EFuE3-f6o";
const INSIDE_AIR_URL = "https://www.raf.mod.uk/news/insideair/";

export function SixtySecondsAndPodcastSection() {
  return (
    <section className="py-8">
      <h2 className="text-2xl font-bold tracking-tight text-foreground/90 uppercase font-display mb-6">
        Watch & listen
      </h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8" data-scroll-reveal>
        {/* 60 second update – video + article link */}
        <div className="rounded-xl border border-border/50 bg-card overflow-hidden shadow-sm flex flex-col group hover:shadow-xl hover:border-border transition-shadow">
          <div className="relative aspect-video bg-muted">
            <iframe
              title="RAF 60 second update"
              src={`https://www.youtube.com/embed/${SIXTY_SECONDS_VIDEO_ID}?rel=0`}
              className="absolute inset-0 w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
          <div className="p-5 flex flex-col flex-1">
            <h3 className="font-display font-bold text-foreground text-lg mb-2">
              RAF 60 second update
            </h3>
            <a
              href={SIXTY_SECONDS_ARTICLE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-semibold text-primary hover:text-primary/80 flex items-center gap-1.5 mt-auto transition-colors"
            >
              Read article <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* Inside Air – podcast */}
        <a
          href={INSIDE_AIR_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-xl border border-border/50 bg-card overflow-hidden shadow-sm flex flex-col md:flex-row group hover:shadow-xl hover:border-border transition-shadow"
        >
          <div className="md:w-2/5 min-w-[40%] flex items-center justify-center bg-muted/50 p-8">
            <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center group-hover:bg-primary/30 transition-colors">
              <Radio className="w-10 h-10 text-primary" />
            </div>
          </div>
          <div className="flex-1 flex flex-col justify-center p-6 md:p-8">
            <span className="text-xs font-semibold text-primary uppercase tracking-wider">
              Podcast
            </span>
            <h3 className="font-display font-bold text-foreground text-xl mt-2 mb-2 group-hover:text-primary transition-colors">
              Inside Air
            </h3>
            <p className="text-sm text-muted-foreground">
              The RAF podcast – stories and conversations from across the Force.
            </p>
            <span className="text-sm font-semibold text-primary flex items-center gap-1.5 mt-4 group-hover:gap-2 transition-all">
              Listen <Play className="w-4 h-4" />
            </span>
          </div>
        </a>
      </div>
    </section>
  );
}
