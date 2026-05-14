import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingAnimationProps {
  isVisible: boolean;
}

export default function LoadingAnimation({ isVisible }: LoadingAnimationProps) {
  const [currentTipIndex, setCurrentTipIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  // Dynamic tips to show during loading
  const tips = [
    '🔍 Scanning your bills for hidden fees...',
    '💰 Analyzing subscription charges...',
    '🏥 Checking medical billing errors...',
    '📱 Reviewing telecom charges...',
    '🏠 Examining insurance premiums...',
    '✅ Calculating potential savings...',
    '📊 Generating personalized recommendations...',
    '⚡ Almost done! Finalizing your report...',
    '🎯 Finding actionable insights for you...',
    '💡 Discovering money-saving opportunities...',
  ];

  // Rotate tips every 2 seconds
  useEffect(() => {
    if (!isVisible) return;

    const tipInterval = setInterval(() => {
      setCurrentTipIndex((prev) => (prev + 1) % tips.length);
    }, 2000);

    return () => clearInterval(tipInterval);
  }, [isVisible, tips.length]);

  // Simulate progress bar (0-90% over time)
  useEffect(() => {
    if (!isVisible) {
      setProgress(0);
      return;
    }

    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) return 90;
        return prev + Math.random() * 15;
      });
    }, 800);

    return () => clearInterval(progressInterval);
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <div className="mb-6 p-6 sm:p-8 neon-box rounded-lg border-l-4 border-neon-pink animate-in fade-in duration-300">
      {/* Animated spinner and main message */}
      <div className="flex items-start gap-4 mb-6">
        <div className="flex-shrink-0">
          <Loader2 className="w-8 h-8 text-neon-pink animate-spin" />
        </div>
        <div className="flex-1">
          <p className="text-neon-pink font-bold text-lg mb-2">🤖 AI Analysis in Progress</p>
          <p className="text-gray-300 text-sm mb-4">
            Our advanced AI is carefully reviewing your bills. This typically takes 30-60 seconds.
          </p>

          {/* Dynamic rotating tips */}
          <div className="mb-4 h-8 overflow-hidden">
            <div
              className="transition-all duration-500 ease-in-out"
              style={{
                transform: `translateY(-${currentTipIndex * 32}px)`,
              }}
            >
              {tips.map((tip, index) => (
                <div
                  key={index}
                  className="h-8 flex items-center text-neon-cyan font-semibold text-sm"
                >
                  {tip}
                </div>
              ))}
            </div>
          </div>

          {/* Progress bar with gradient */}
          <div className="space-y-2">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs text-gray-400">Analysis Progress</span>
              <span className="text-xs text-neon-cyan font-semibold">{Math.round(progress)}%</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden border border-gray-600">
              <div
                className="h-full bg-gradient-to-r from-neon-pink via-neon-cyan to-neon-pink rounded-full transition-all duration-500 ease-out shadow-lg shadow-neon-pink/50"
                style={{
                  width: `${progress}%`,
                  backgroundSize: '200% 100%',
                  animation: 'shimmer 2s infinite',
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Reassuring messages section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-6 pt-6 border-t border-gray-600">
        <div className="bg-neon-cyan/10 p-3 rounded-lg border border-neon-cyan/30">
          <p className="text-xs text-gray-400 mb-1">💡 Tip</p>
          <p className="text-sm text-neon-cyan font-semibold">
            Most people discover billing issues they didn't know about.
          </p>
        </div>
        <div className="bg-neon-pink/10 p-3 rounded-lg border border-neon-pink/30">
          <p className="text-xs text-gray-400 mb-1">✨ Good news</p>
          <p className="text-sm text-neon-pink font-semibold">
            You're taking the first step to optimize your finances!
          </p>
        </div>
      </div>

      {/* CSS animation for shimmer effect */}
      <style>{`
        @keyframes shimmer {
          0% {
            background-position: 200% 0;
          }
          100% {
            background-position: -200% 0;
          }
        }
      `}</style>
    </div>
  );
}
