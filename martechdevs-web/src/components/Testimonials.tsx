'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, useMotionValue, useAnimationFrame, animate } from 'framer-motion';
import Image from 'next/image';

interface VideoTestimonial {
  id: number;
  video: string;
  name: string;
  role: string;
  company: string;
  clientLogo: string;
  quote: string;
  tools: Array<{ name: string; icon: string }>;
  bgColor: string;
}

const testimonials: VideoTestimonial[] = [
  {
    id: 1,
    video: '/assets/video testimonials/testimonial 1.mp4',
    name: 'JB Jaquenzel',
    role: 'Founder and CEO',
    company: 'Evaboot',
    clientLogo: 'Evaboot.png',
    quote: 'Faizur helped us transfer Google Analytics conversion events to Google Ads via Segment. We set that up within two or three weeks. Now we have a clear vision of our conversions and we could optimize our campaigns like this. Because if your tracking is not on point, you can\'t really improve your Google Ads performance.',
    tools: [
      { name: 'GA4', icon: 'ga4 logo icon.svg' },
      { name: 'Segment', icon: 'segment logo icon.svg' },
      { name: 'Google Ads', icon: 'google ads logo icon.svg' }
    ],
    bgColor: 'bg-blue-50',
  },
  {
    id: 2,
    video: '/assets/video testimonials/testimonial 2.mp4',
    name: 'Elie',
    role: 'CMO',
    company: 'Submagic',
    clientLogo: 'Submagic.png',
    quote: "We have worked with Faizur and his agency for the past six months to set up all the growth stack that we needed. All the marketing analytics tools like Mixpanel, Google Analytics, data tracking tool, customer analysis tool like Customer.io, and every kind of tool that we needed. He's always ready to help and super reactive. I highly recommend to work with him.",
    tools: [
      { name: 'Mixpanel', icon: 'mixpanel logo icon.svg' },
      { name: 'Customer.io', icon: 'customerio logo icon.svg' },
      { name: 'GA4', icon: 'ga4 logo icon.svg' }
    ],
    bgColor: 'bg-purple-50',
  },
  {
    id: 3,
    video: '/assets/video testimonials/testimonial 3.mp4',
    name: 'Arman Assadi',
    role: 'CEO',
    company: 'Steno.ai',
    clientLogo: 'Steno.png',
    quote: 'We worked with Faizur when we wanted to set up Mixpanel. What I loved was how detail-oriented he was, and that he wasn\'t just there to accomplish that one task. He was able to advise us. He suggested setting up Segment and he thought about everything at a macro level, all the way down to the micro. It gave me confidence to outsource this.',
    tools: [
      { name: 'Mixpanel', icon: 'mixpanel logo icon.svg' },
      { name: 'Segment', icon: 'segment logo icon.svg' }
    ],
    bgColor: 'bg-emerald-50',
  },
  {
    id: 4,
    video: '/assets/video testimonials/testimonial 4.mp4',
    name: 'Gabriel',
    role: 'Operations',
    company: 'MKTV',
    clientLogo: 'MuslimkidsTV.png',
    quote: 'We recently had the pleasure of working with Faiz on our integration of Segment. Not only did he help us seamlessly set up the integration, but he also went above and beyond to help us establish dashboards in Mixpanel. What was super valuable was having somebody who understood both the business/marketing requirements but also had the technical expertise to execute them.',
    tools: [
      { name: 'Segment', icon: 'segment logo icon.svg' },
      { name: 'Mixpanel', icon: 'mixpanel logo icon.svg' }
    ],
    bgColor: 'bg-cyan-50',
  },
];

const upworkReviews = [
  '/assets/upwork testimonials/upwork testimonial 1.png',
  '/assets/upwork testimonials/upwork testimonial 2.png',
  '/assets/upwork testimonials/upwork testimonial 3.png',
  '/assets/upwork testimonials/upwork testimonial 4.png',
  '/assets/upwork testimonials/upwork testimonial 5.png',
  '/assets/upwork testimonials/upwork testimonial 6.png',
];

interface VideoCardProps extends React.HTMLAttributes<HTMLDivElement> {
  testimonial: VideoTestimonial;
}

function VideoCard({ testimonial, className, ...props }: VideoCardProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch(() => {});
    }
  }, []);

  const togglePlay = () => {
    if (videoRef.current) {
      if (playing) {
        videoRef.current.muted = true;
      } else {
        videoRef.current.muted = false;
      }
      setPlaying(!playing);
    }
  };

  return (
    <div 
      className={`bg-white rounded-2xl overflow-hidden border border-gray-100 flex-shrink-0 w-[85vw] sm:w-[500px] md:w-full md:max-w-[800px] ${className || ''}`}
      {...props}
    >
      <div className="grid grid-cols-[120px_1fr] sm:grid-cols-[180px_1fr] md:grid-cols-[280px_1fr]">
        {/* Video */}
        <div className="relative aspect-[9/16] bg-gray-900 cursor-pointer" onClick={togglePlay}>
          <video
            ref={videoRef}
            src={testimonial.video}
            className="w-full h-full object-cover"
            loop
            muted
            playsInline
          />
          <div className="absolute inset-0 flex items-center justify-center bg-black/20 hover:bg-black/30 transition-colors">
            <div className="w-10 h-10 md:w-14 md:h-14 bg-white/90 rounded-full flex items-center justify-center">
              {playing ? (
                <svg className="w-4 h-4 md:w-6 md:h-6 text-gray-900" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6 4h4v16H6zM14 4h4v16h-4z" />
                </svg>
              ) : (
                <svg className="w-4 h-4 md:w-6 md:h-6 text-gray-900 ml-1" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              )}
            </div>
          </div>
          {!playing && (
            <div className="absolute bottom-2 right-2 bg-black/60 text-white px-2 py-1 rounded text-[10px] md:text-xs">
              🔇 Click for sound
            </div>
          )}
        </div>

        {/* Content */}
        <div className={`${testimonial.bgColor} p-4 md:p-8 flex flex-col justify-center min-w-0`}>
          <div className="mb-2 md:mb-4">
            <p className="font-semibold text-gray-900 text-base md:text-lg leading-tight">{testimonial.name}</p>
            <p className="text-xs md:text-sm text-gray-500 leading-tight mt-0.5">{testimonial.role}, {testimonial.company}</p>
          </div>
          <p className="text-gray-700 text-sm md:text-base mb-3 md:mb-5 leading-relaxed line-clamp-6 md:line-clamp-none">&ldquo;{testimonial.quote}&rdquo;</p>
          <div className="flex items-center gap-2 md:gap-3 flex-wrap">
            {testimonial.tools.map((tool) => (
              <div key={tool.name} className="flex items-center gap-1.5 md:gap-2">
                <Image
                  src={`/assets/tool logos icons/${tool.icon}`}
                  alt={tool.name}
                  width={24}
                  height={24}
                  className="w-5 h-5 md:w-6 md:h-6 object-contain"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
                <span className="text-xs md:text-sm font-medium text-gray-700">{tool.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Testimonials() {
  const [activeId, setActiveId] = useState<number>(1);
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const [isPaused, setIsPaused] = useState(false);
  const [contentWidth, setContentWidth] = useState(0);
  const observerRef = useRef<IntersectionObserver | null>(null);
  
  // Speed in px per frame
  const speed = 0.5; 

  // Measure content width (single set)
  useEffect(() => {
    const measure = () => {
      if (contentRef.current) {
        const totalWidth = contentRef.current.scrollWidth;
        // We assume 3 sets.
        setContentWidth(totalWidth / 3);
      }
    };
    // Initial measure with delay to ensure rendering
    const timer = setTimeout(measure, 100);
    window.addEventListener('resize', measure);
    return () => {
      window.removeEventListener('resize', measure);
      clearTimeout(timer);
    };
  }, []);

  useAnimationFrame((t, delta) => {
    if (!isPaused && contentWidth > 0) {
      const moveBy = (speed * 60) * (delta / 1000); 
      let newX = x.get() - moveBy;
      
      // Loop logic
      if (newX <= -contentWidth) {
        newX += contentWidth;
      }
      x.set(newX);
    }
  });

  // Intersection Observer for active state
  useEffect(() => {
    if (!containerRef.current) return;
    
    const options = {
      root: containerRef.current,
      threshold: 0.5,
    };

    observerRef.current = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const id = Number(entry.target.getAttribute('data-id'));
          if (id) setActiveId(id);
        }
      });
    }, options);

    const cards = document.querySelectorAll('.testimonial-card');
    cards.forEach(card => observerRef.current?.observe(card));

    return () => observerRef.current?.disconnect();
  }, [contentWidth]); // Re-run if content refreshes

  const handleLogoClick = (targetId: number) => {
    if (!contentRef.current || !containerRef.current) return;

    setIsPaused(true);

    // Find all instances
    const cards = Array.from(document.querySelectorAll(`.testimonial-card[data-id="${targetId}"]`)) as HTMLElement[];
    if (cards.length === 0) {
      setIsPaused(false);
      return;
    }

    const currentX = x.get();
    const containerWidth = containerRef.current.offsetWidth;
    
    let bestTargetX = -Infinity;
    let minDiff = Infinity;

    cards.forEach(card => {
        // Calculate where x should be to center this card
        // screenPos = card.offsetLeft + x
        // desiredScreenPos = (containerWidth - card.offsetWidth) / 2
        // x = desiredScreenPos - card.offsetLeft
        const targetX = (containerWidth - card.offsetWidth) / 2 - card.offsetLeft;
        
        // Prefer movement to the left (targetX < currentX) for natural flow
        // But find closest.
        const diff = Math.abs(targetX - currentX);
        if (diff < minDiff) {
            minDiff = diff;
            bestTargetX = targetX;
        }
    });

    animate(x, bestTargetX, {
        duration: 0.8,
        ease: "easeInOut",
        onComplete: () => {
            setIsPaused(false);
        }
    });
    setActiveId(targetId);
  };

  return (
    <section id="testimonials" className="py-16 md:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-8 text-center md:text-left"
        >
          <span className="inline-block bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-sm font-medium mb-4">
            Testimonials
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 leading-tight">
            It&apos;s not enough to <span className="text-emerald-500">just be</span>
            <br />
            competent. You need to
            <br />
            <span className="text-emerald-500">prove it too.</span>
          </h2>
        </motion.div>

        {/* Logo Pagination/Navigation */}
        <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 md:gap-6 mb-10">
          <div className="inline-flex items-center gap-4 md:gap-6 bg-gray-50/80 backdrop-blur-sm p-3 rounded-2xl border border-gray-100/50 shadow-inner">
            {testimonials.map((t) => (
              <button
                key={t.id}
                onClick={() => handleLogoClick(t.id)}
                className={`transition-all duration-300 grayscale hover:grayscale-0 relative px-3 py-2 rounded-lg ${
                  activeId === t.id ? 'grayscale-0 bg-white shadow-sm scale-105' : 'opacity-50 hover:opacity-80 hover:bg-white/50'
                }`}
              >
                <div className="h-5 w-24 md:h-6 md:w-28 flex items-center justify-center">
                  <Image
                    src={`/assets/client logos/${t.clientLogo}`}
                    alt={t.company}
                    width={100}
                    height={40}
                    className="h-full w-auto object-contain max-w-full"
                  />
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Video Carousel - Infinite Loop */}
        <div 
          className="relative mb-12"
          ref={containerRef}
        >
          <div className="marquee-mask overflow-hidden">
            <motion.div 
              className="flex gap-6" 
              style={{ x, width: 'max-content' }}
              ref={contentRef}
              onHoverStart={() => setIsPaused(true)}
              onHoverEnd={() => setIsPaused(false)}
            >
              {[...testimonials, ...testimonials, ...testimonials].map((t, idx) => (
                <VideoCard 
                  key={`${t.id}-${idx}`} 
                  testimonial={t} 
                  className="testimonial-card"
                  data-id={t.id}
                />
              ))}
            </motion.div>
          </div>
        </div>

        {/* Upwork Reviews */}
        <div className="mt-12">
          <div className="flex items-center justify-center gap-2 mb-6">
            <span className="text-gray-500 text-sm font-medium">Reviews on</span>
            <span className="text-emerald-600 font-bold">Upwork</span>
          </div>
          
          <div className="marquee-mask overflow-hidden">
            <div className="animate-marquee-slow flex gap-6" style={{ width: 'max-content' }}>
              {[...upworkReviews, ...upworkReviews, ...upworkReviews].map((review, idx) => (
                <div key={idx} className="flex-shrink-0 w-[80vw] sm:w-[400px] md:w-[500px] bg-white rounded-lg border border-gray-200/50 overflow-hidden">
                  <Image
                    src={review}
                    alt={`Upwork Review ${(idx % upworkReviews.length) + 1}`}
                    width={500}
                    height={300}
                    className="w-full h-auto"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
