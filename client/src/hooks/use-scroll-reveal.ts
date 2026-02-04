import type { RefObject } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger);

/**
 * Scroll-triggered reveal: subtle fade-in and slide-up when each [data-scroll-reveal]
 * element enters the viewport. Respects prefers-reduced-motion.
 */
export function useScrollReveal(scopeRef: RefObject<HTMLElement | null>, enabled = true) {
  useGSAP(
    () => {
      if (!enabled) return;

      const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (reducedMotion) return;

      const els = scopeRef.current?.querySelectorAll<HTMLElement>("[data-scroll-reveal]");
      if (!els?.length) return;

      els.forEach((el) => {
        gsap.fromTo(
          el.children,
          { opacity: 0, y: 20 },
          {
            opacity: 1,
            y: 0,
            duration: 0.5,
            ease: "power2.out",
            stagger: 0.08,
            scrollTrigger: {
              trigger: el,
              start: "top 88%",
              end: "bottom 12%",
              toggleActions: "play none none none",
            },
            overwrite: "auto",
          }
        );
      });
    },
    { scope: scopeRef, dependencies: [enabled] }
  );
}
