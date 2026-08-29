'use client';

import { useState, useRef, useEffect, memo } from 'react';
import { motion, useMotionValue, useAnimationFrame, animate } from 'framer-motion';
import Image from 'next/image';

interface VideoTestimonial {
  id: number;
  video: string;
  poster: string;
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
    poster: '/assets/video testimonials/testimonial 1 poster.webp',
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
    poster: '/assets/video testimonials/testimonial 2 poster.webp',
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
    poster: '/assets/video testimonials/testimonial 3 poster.webp',
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
    poster: '/assets/video testimonials/testimonial 4 poster.webp',
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

// memo matters here: the marquee cycles cards past the activeId observer, and
// every setActiveId re-rendered all twelve copies (and their <video> elements).
const VideoCard = memo(function VideoCard({ testimonial, className, ...props }: VideoCardProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [playing, setPlaying] = useState(false);
  const [visible, setVisible] = useState(false);
  // Only attach the mp4 source once the card is near the viewport. The carousel
  // renders three copies of every testimonial, so eager loading would pull down
  // all four videos twelve times over on first paint.
  const [shouldLoad, setShouldLoad] = useState(false);

  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;

    // Loading and playing are deliberately separate.
    //
    // The marquee renders three copies of every testimonial, so twelve <video>
    // elements exist for four clips. Attaching and playing every copy within
    // 200px of the viewport meant decoding the same video up to three times at
    // once, and that was the whole cost of the jank where this section meets
    // the section above it: neutralising these videos took the long frames
    // there from 16 to 0.
    //
    // Attach metadata only after the carousel reaches the upper half of the
    // viewport. Loading five video copies while the last service card is still
    // exiting makes Chrome decode media and move the sticky stack in the same
    // frame, which is the remaining last-card flicker.
    const loader = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setShouldLoad(true);
      },
      { rootMargin: '0px 0px -50% 0px' }
    );

    // The negative bottom margin delays playback until the card has risen well
    // clear of the viewport's bottom edge. A playing video locks the
    // compositor to the clip's frame rate (~30fps, measured), so starting at
    // the first 40% of visibility meant the tail of the service stack above
    // was still on screen and its exit suddenly ran at half rate - which read
    // as a flicker on the last card. Bottom-heavy on purpose: entry from below
    // is where that collision happens. Horizontal margins stay 0 so cards
    // clipped by the marquee edges behave as before.
    const player = new IntersectionObserver(
      ([entry]) => setVisible(entry.intersectionRatio >= 0.4),
      { threshold: [0, 0.4, 0.75], rootMargin: '-10% 0px -30% 0px' }
    );

    loader.observe(el);
    player.observe(el);
    return () => {
      loader.disconnect();
      player.disconnect();
    };
  }, []);

  // Runs after the src is attached, so the first play() isn't fired at an
  // empty <video>. Keeps only the visible cards decoding frames.
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !shouldLoad) return;
    if (visible) video.play().catch(() => {});
    else video.pause();
  }, [shouldLoad, visible]);

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
      ref={wrapperRef}
      className={`bg-white rounded-2xl overflow-hidden border border-gray-100 flex-shrink-0 w-[85vw] sm:w-[500px] md:w-full md:max-w-[800px] ${className || ''}`}
      {...props}
    >
      <div className="grid grid-cols-[120px_1fr] sm:grid-cols-[180px_1fr] md:grid-cols-[280px_1fr]">
        {/* Video */}
        <div className="relative aspect-[9/16] bg-gray-900 cursor-pointer" onClick={togglePlay}>
          <video
            ref={videoRef}
            src={shouldLoad ? testimonial.video : undefined}
            poster={testimonial.poster}
            className="w-full h-full object-cover"
            // metadata, not none: the src attaches 300px before the section is
            // visible, while the pinned card above holds a static screen - the
            // cheapest possible moment to open the file and spin up the
            // decoder. With none, that cost landed at first play(), right in
            // the middle of the card-to-testimonials transition.
            preload="metadata"
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
});

export default function Testimonials() {
  const [activeId, setActiveId] = useState<number>(1);
  const sectionRef = useRef<HTMLElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const [isPaused, setIsPaused] = useState(false);
  const [onScreen, setOnScreen] = useState(false);
  const [contentWidth, setContentWidth] = useState(0);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Speed in px per frame
  const speed = 0.5;

  // Freeze both marquees until Testimonials reaches the top fifth of the
  // viewport. A default threshold fires at the first visible pixel; at that
  // point the last service card still occupies almost the whole screen. The
  // shrunken observer root keeps all carousel motion dormant until that card
  // has cleared.
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => setOnScreen(entry.isIntersecting),
      { rootMargin: '0px 0px -80% 0px' }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

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
    if (onScreen && !isPaused && contentWidth > 0) {
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
    if (!onScreen || !containerRef.current) return;
    
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
  }, [contentWidth, onScreen]); // Only observe moving cards while visible

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
    <section ref={sectionRef} id="testimonials" className="py-16 md:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-8 text-center md:text-left"
        >
          <span className="inline-block bg-teal-100 text-teal-700 px-3 py-1 rounded-full text-sm font-medium mb-4">
            Testimonials
          </span>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 leading-snug max-w-3xl mx-auto md:mx-0 text-balance">
            Don&apos;t take our word for it. Hear it from the{' '}
            <span className="text-emerald-500">founders who handed us their stack.</span>
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
            {/* items-start, or the row stretches every box to match the tallest.
                These load lazily, and an unloaded one still occupies its full
                reserved height - so a single straggler was dragging all six up
                with it and leaving white space under the ones already in. */}
            <div
              className={`${onScreen ? 'animate-marquee-slow' : ''} flex items-start gap-6`}
              style={{ width: 'max-content' }}
            >
              {[...upworkReviews, ...upworkReviews, ...upworkReviews].map((review, idx) => (
                <div key={idx} className="flex-shrink-0 w-[80vw] sm:w-[400px] md:w-[500px] bg-white rounded-lg border border-gray-200/50 overflow-hidden">
                  <Image
                    src={review}
                    alt={`Upwork Review ${(idx % upworkReviews.length) + 1}`}
                    // The screenshots are 1292x498. Declaring 500x300 reserved a
                    // 5:3 box, so each review came in 107px too tall and then
                    // snapped down to its real 2.6:1 shape on load. Passing the
                    // true dimensions makes the reserved box the final box, and
                    // gives Next a sensible srcset to pick retina sizes from.
                    width={1292}
                    height={498}
                    sizes="(max-width: 640px) 80vw, (max-width: 768px) 400px, 500px"
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
