"use client";
import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";

interface AnimatedSectionProps {
  children: ReactNode;
  animation?: "fade-up" | "fade-in" | "scale-in" | "slide-left" | "slide-right" | "flip" | "blur-in" | "elastic";
  delay?: number;
  className?: string;
  threshold?: number;
  once?: boolean;
  spring?: boolean;
}

export default function AnimatedSection({
  children, animation = "fade-up", delay = 0, className = "", threshold = 0.12, once = true, spring = true,
}: AnimatedSectionProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setTimeout(() => { setIsVisible(true); setHasAnimated(true); }, delay * 120);
        if (once) observer.unobserve(element);
      } else if (!once) setIsVisible(false);
    }, { threshold, rootMargin: "-60px" });
    observer.observe(element);
    return () => observer.disconnect();
  }, [delay, once, threshold]);

  const hiddenStyles: Record<string, { opacity: number; transform: string; filter?: string }> = {
    "fade-up": { opacity: 0, transform: "translateY(45px)" },
    "fade-in": { opacity: 0, transform: "none" },
    "scale-in": { opacity: 0, transform: "scale(0.94)" },
    "slide-left": { opacity: 0, transform: "translateX(55px)" },
    "slide-right": { opacity: 0, transform: "translateX(-55px)" },
    "flip": { opacity: 0, transform: "rotateY(-15deg) translateY(30px)" },
    "blur-in": { opacity: 0, transform: "translateY(30px)", filter: "blur(8px)" },
    "elastic": { opacity: 0, transform: "scale(0.8) translateY(40px)" },
  };
  const visibleStyles = { opacity: 1, transform: "none", filter: "blur(0px)" };
  const currentStyles = isVisible ? visibleStyles : hiddenStyles[animation];
  const easings = {
    spring: "cubic-bezier(0.16, 1, 0.3, 1)",
    smooth: "cubic-bezier(0.22, 1, 0.36, 1)",
    elastic: "cubic-bezier(0.68, -0.55, 0.265, 1.55)",
    gentle: "cubic-bezier(0.4, 0, 0.2, 1)",
  };
  const getEasing = () => {
    if (!spring) return easings.gentle;
    if (animation === "elastic") return easings.elastic;
    if (animation === "flip" || animation === "blur-in") return easings.smooth;
    return easings.spring;
  };
  const getDuration = () => {
    if (animation === "blur-in" || animation === "flip") return "1s";
    if (animation === "elastic") return "0.9s";
    return "0.85s";
  };
  return (
    <div ref={ref} className={`${className} ${hasAnimated ? "animated" : ""}`}
      style={{ ...currentStyles, transition: `opacity ${getDuration()} ${getEasing()}, transform ${getDuration()} ${getEasing()}, filter ${getDuration()} ${getEasing()}`, willChange: "opacity, transform, filter", transformOrigin: animation === "flip" ? "center center" : "center bottom" }}>
      {children}
    </div>
  );
}

interface StaggerContainerProps { children: ReactNode; className?: string; staggerDelay?: number; baseDelay?: number; }
export function StaggerContainer({ children, className = "", staggerDelay = 0.1, baseDelay = 0 }: StaggerContainerProps) {
  return (
    <div className={className}>
      {Array.isArray(children) ? children.map((child, index) => (
        <div key={index} style={{ transitionDelay: `${(baseDelay + index * staggerDelay) * 120}ms` }}>{child}</div>
      )) : children}
    </div>
  );
}

interface HoverLiftProps { children: ReactNode; className?: string; lift?: number; }
export function HoverLift({ children, className = "", lift = 8 }: HoverLiftProps) {
  return (
    <div className={className} style={{ transition: "transform 0.4s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.4s ease" }}
      onMouseEnter={(e) => { const t = e.currentTarget as HTMLElement; t.style.transform = `translateY(-${lift}px)`; t.style.boxShadow = "0 20px 40px rgba(42, 34, 24, 0.12)"; }}
      onMouseLeave={(e) => { const t = e.currentTarget as HTMLElement; t.style.transform = "translateY(0)"; t.style.boxShadow = "none"; }}>
      {children}
    </div>
  );
}

interface MagneticButtonProps { children: ReactNode; className?: string; strength?: number; }
export function MagneticButton({ children, className = "", strength = 0.3 }: MagneticButtonProps) {
  const ref = useRef<HTMLDivElement>(null);
  const handleMouseMove = (e: React.MouseEvent) => {
    const el = ref.current; if (!el) return;
    const rect = el.getBoundingClientRect();
    el.style.transform = `translate(${(e.clientX - rect.left - rect.width / 2) * strength}px, ${(e.clientY - rect.top - rect.height / 2) * strength}px)`;
  };
  const handleMouseLeave = () => { if (ref.current) ref.current.style.transform = "translate(0, 0)"; };
  return (
    <div ref={ref} className={className} style={{ transition: "transform 0.3s cubic-bezier(0.22, 1, 0.36, 1)", willChange: "transform" }}
      onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave}>
      {children}
    </div>
  );
}

interface TextRevealProps { text: string; className?: string; delay?: number; staggerDelay?: number; }
export function TextReveal({ text, className = "", delay = 0, staggerDelay = 0.05 }: TextRevealProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setTimeout(() => setIsVisible(true), delay * 1000); observer.unobserve(el); }
    }, { threshold: 0.3 });
    observer.observe(el); return () => observer.disconnect();
  }, [delay]);
  return (
    <span ref={ref} className={className}>
      {text.split(" ").map((word, index) => (
        <span key={index} style={{ display: "inline-block", opacity: isVisible ? 1 : 0, transform: isVisible ? "translateY(0)" : "translateY(20px)",
          transition: `opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1) ${index * staggerDelay}s, transform 0.6s cubic-bezier(0.16, 1, 0.3, 1) ${index * staggerDelay}s`, marginRight: "0.3em" }}>
          {word}
        </span>
      ))}
    </span>
  );
}

interface ImageRevealProps { src: string; alt: string; className?: string; }
export function ImageReveal({ src, alt, className = "" }: ImageRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setIsVisible(true); observer.unobserve(el); }
    }, { threshold: 0.2 });
    observer.observe(el); return () => observer.disconnect();
  }, []);
  return (
    <div ref={ref} className={`img-reveal-container ${className}`} style={{ overflow: "hidden", position: "relative" }}>
      <img src={src} alt={alt} style={{ width: "100%", height: "auto", transform: isVisible ? "scale(1)" : "scale(1.1)", opacity: isVisible ? 1 : 0,
        filter: isVisible ? "blur(0px)" : "blur(8px)", transition: "transform 1s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.8s ease, filter 0.8s ease" }} />
    </div>
  );
}
