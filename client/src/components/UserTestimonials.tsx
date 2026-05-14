import { Star } from 'lucide-react';

interface Testimonial {
  id: number;
  name: string;
  avatar: string;
  savings: string;
  savingsAmount: number;
  feedback: string;
  rating: number;
  billType: string;
}

const testimonials: Testimonial[] = [
  {
    id: 1,
    name: 'Sarah M.',
    avatar: '👩‍💼',
    savings: '$127/month',
    savingsAmount: 127,
    feedback:
      'I discovered 3 duplicate charges on my medical bills and 2 unauthorized subscriptions. The AI analysis was spot-on. Saved me over $1,500 in the first year!',
    rating: 5,
    billType: 'Medical & Subscriptions',
  },
  {
    id: 2,
    name: 'James T.',
    avatar: '👨‍💼',
    savings: '$89/month',
    savingsAmount: 89,
    feedback:
      'My insurance was overcharging me for months. Bill Analyzer found the error in seconds. Called them, got it fixed. This tool paid for itself immediately.',
    rating: 5,
    billType: 'Insurance',
  },
  {
    id: 3,
    name: 'Maria L.',
    avatar: '👩',
    savings: '$156/month',
    savingsAmount: 156,
    feedback:
      'Found hidden fees on my phone bill, credit card, and internet. The AI generated a perfect action plan. I negotiated better rates with all three companies.',
    rating: 5,
    billType: 'Utilities & Phone',
  },
];

export default function UserTestimonials() {
  return (
    <section className="py-12 sm:py-16">
      <div className="mb-8 sm:mb-12">
        <h2 className="text-2xl sm:text-3xl font-bold text-neon-pink glow-text uppercase tracking-wider mb-2">
          What Users Are Saying
        </h2>
        <p className="text-gray-400 text-sm sm:text-base">
          See how Bill Analyzer has helped users discover hidden charges and save money
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
        {testimonials.map((testimonial) => (
          <div
            key={testimonial.id}
            className="neon-box p-5 sm:p-6 rounded-lg hover:border-neon-pink/50 transition-all duration-300 hover:shadow-lg hover:shadow-neon-pink/20"
          >
            {/* Header with avatar and savings */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="text-4xl">{testimonial.avatar}</div>
                <div>
                  <h3 className="text-neon-cyan font-bold text-sm sm:text-base">{testimonial.name}</h3>
                  <p className="text-gray-500 text-xs">{testimonial.billType}</p>
                </div>
              </div>
            </div>

            {/* Savings highlight */}
            <div className="mb-4 p-3 bg-neon-pink/10 border border-neon-pink/30 rounded-lg">
              <p className="text-neon-pink font-bold text-lg sm:text-xl glow-text">{testimonial.savings}</p>
              <p className="text-gray-400 text-xs">Monthly savings</p>
            </div>

            {/* Rating */}
            <div className="flex gap-1 mb-3">
              {Array.from({ length: testimonial.rating }).map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-neon-cyan text-neon-cyan" />
              ))}
            </div>

            {/* Feedback */}
            <p className="text-gray-300 text-sm leading-relaxed italic">"{testimonial.feedback}"</p>

            {/* Bottom accent */}
            <div className="mt-4 pt-4 border-t border-neon-cyan/20">
              <p className="text-neon-cyan text-xs font-semibold">✓ Real Feedback</p>
            </div>
          </div>
        ))}
      </div>

      {/* Key benefits */}
      <div className="mt-8 sm:mt-12 grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        <div className="neon-box p-4 text-center rounded-lg">
          <p className="text-neon-pink font-bold text-lg sm:text-xl glow-text">$50-$200+</p>
          <p className="text-gray-400 text-xs sm:text-sm">Potential Savings</p>
        </div>
        <div className="neon-box p-4 text-center rounded-lg">
          <p className="text-neon-cyan font-bold text-lg sm:text-xl glow-text">100%</p>
          <p className="text-gray-400 text-xs sm:text-sm">Free Forever</p>
        </div>
        <div className="neon-box p-4 text-center rounded-lg">
          <p className="text-neon-pink font-bold text-lg sm:text-xl glow-text">AI-Powered</p>
          <p className="text-gray-400 text-xs sm:text-sm">Advanced Analysis</p>
        </div>
        <div className="neon-box p-4 text-center rounded-lg">
          <p className="text-neon-cyan font-bold text-lg sm:text-xl glow-text">2 Minutes</p>
          <p className="text-gray-400 text-xs sm:text-sm">To Get Started</p>
        </div>
      </div>
    </section>
  );
}
