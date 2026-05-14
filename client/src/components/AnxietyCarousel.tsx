import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface CarouselSlide {
  id: number;
  title: string;
  subtitle: string;
  description: string;
  icon: string;
}

const slides: CarouselSlide[] = [
  {
    id: 1,
    title: 'Hidden Bill Fees',
    subtitle: 'Your bills might be MORE EXPENSIVE than you think',
    description: 'Credit cards, medical, insurance, mortgage, phone bills... Most people never check for hidden fees. These "small numbers" could be stealing thousands from you every year.',
    icon: '💳',
  },
  {
    id: 2,
    title: 'Medical Bill Errors',
    subtitle: 'Errors are MORE COMMON than you realize',
    description: 'Duplicate charges, coding mistakes, insurance gaps... Medical billing is complex. Nobody is carefully checking YOUR bills. Hospitals count on it.',
    icon: '🏥',
  },
  {
    id: 3,
    title: 'Education Cost Traps',
    subtitle: 'The BIGGEST financial black hole for families',
    description: 'Tuition, fees, loans, interest... Many people spend decades paying for education. Years after graduation, you\'re still paying for yesterday\'s education.',
    icon: '🎓',
  },
  {
    id: 4,
    title: 'Telecom Billing Tricks',
    subtitle: 'The most profitable customers are the LAZY ones',
    description: 'Telecom companies make the most money from people who never check their bills. Hidden charges, forgotten subscriptions, inflated rates—they\'re counting on your inattention.',
    icon: '📱',
  },
];

export default function AnxietyCarousel() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [autoPlay, setAutoPlay] = useState(true);

  useEffect(() => {
    if (!autoPlay) return;

    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [autoPlay]);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
    setAutoPlay(false);
    setTimeout(() => setAutoPlay(true), 10000);
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
    setAutoPlay(false);
    setTimeout(() => setAutoPlay(true), 10000);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
    setAutoPlay(false);
    setTimeout(() => setAutoPlay(true), 10000);
  };

  const slide = slides[currentSlide];

  return (
    <div className="w-full bg-dark-deep relative overflow-hidden">
      {/* Scan lines effect */}
      <div className="absolute inset-0 pointer-events-none scan-lines opacity-10 z-10" />
      
      {/* Main carousel container */}
      <div className="relative h-64 sm:h-72 md:h-80 flex items-center justify-center">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#0a0e27] via-[#1a0a2e] to-[#0a0e27]" />
        
        {/* Animated background accent */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-1/2 left-1/4 w-96 h-96 bg-[#ff006e] rounded-full mix-blend-screen filter blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#00f5ff] rounded-full mix-blend-screen filter blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        </div>

        {/* Content */}
        <div className="relative z-20 px-4 sm:px-6 text-center max-w-2xl">
          {/* Icon */}
          <div className="text-5xl sm:text-6xl mb-4 animate-bounce">{slide.icon}</div>

          {/* Title */}
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2 glow-text uppercase tracking-wider">
            {slide.title}
          </h2>

          {/* Subtitle */}
          <p className="text-base sm:text-lg text-neon-cyan font-semibold mb-3 glow-text-cyan">
            {slide.subtitle}
          </p>

          {/* Description */}
          <p className="text-sm sm:text-base text-gray-300 leading-relaxed">
            {slide.description}
          </p>
        </div>

        {/* Navigation buttons */}
        <button
          onClick={prevSlide}
          className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-30 p-2 hover:text-neon-pink text-neon-cyan transition-colors duration-200 hover:scale-110"
          aria-label="Previous slide"
        >
          <ChevronLeft className="w-6 h-6 sm:w-8 sm:h-8" />
        </button>

        <button
          onClick={nextSlide}
          className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-30 p-2 hover:text-neon-pink text-neon-cyan transition-colors duration-200 hover:scale-110"
          aria-label="Next slide"
        >
          <ChevronRight className="w-6 h-6 sm:w-8 sm:h-8" />
        </button>
      </div>

      {/* Progress indicator */}
      <div className="flex justify-center gap-2 py-4 px-4 bg-gradient-to-t from-[#0a0e27] to-transparent">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`h-2 transition-all duration-300 rounded-full cursor-pointer ${
              index === currentSlide
                ? 'w-8 bg-neon-pink shadow-lg shadow-neon-pink'
                : 'w-2 bg-neon-cyan hover:w-4'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

      {/* Slide counter */}
      <div className="text-center text-xs sm:text-sm text-gray-500 pb-2 font-mono">
        {currentSlide + 1} / {slides.length}
      </div>
    </div>
  );
}
