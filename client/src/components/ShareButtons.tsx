import { Share2, Facebook, Twitter, Linkedin, Mail, MessageCircle, Copy } from 'lucide-react';
import { toast } from 'sonner';
import { useState } from 'react';

interface ShareButtonsProps {
  title?: string;
  description?: string;
  url?: string;
}

export default function ShareButtons({
  title = 'Bill Analyzer - Find Hidden Fees & Save Money on Your Bills',
  description = 'Analyze your bills with cutting-edge AI technology. Discover hidden charges, identify billing errors, and get actionable savings strategies. 100% free!',
  url = typeof window !== 'undefined' ? window.location.href : '',
}: ShareButtonsProps) {
  const [showMore, setShowMore] = useState(false);

  const shareLinks = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(title)}`,
    twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
    whatsapp: `https://wa.me/?text=${encodeURIComponent(`${title} - ${url}`)}`,
    email: `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(`${description}\n\n${url}`)}`,
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(url);
    toast.success('✅ Link copied to clipboard!');
  };

  const handleShare = (platform: string, link: string) => {
    window.open(link, '_blank', 'width=600,height=400');
    toast.success(`✅ Sharing on ${platform}!`);
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Share Title */}
      <div className="flex items-center gap-2">
        <Share2 size={20} className="text-neon-cyan" />
        <span className="text-sm font-bold text-neon-cyan">Share with Friends</span>
      </div>

      {/* Main Share Buttons */}
      <div className="flex flex-wrap gap-3">
        {/* Facebook */}
        <button
          onClick={() => handleShare('Facebook', shareLinks.facebook)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600/20 text-blue-400 text-sm font-bold rounded-lg border border-blue-600/50 hover:bg-blue-600/40 transition-all active:scale-95"
          title="Share on Facebook"
        >
          <Facebook size={18} />
          <span className="hidden sm:inline">Facebook</span>
        </button>

        {/* Twitter/X */}
        <button
          onClick={() => handleShare('Twitter', shareLinks.twitter)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-black/40 text-gray-300 text-sm font-bold rounded-lg border border-gray-600/50 hover:bg-gray-800/40 transition-all active:scale-95"
          title="Share on Twitter"
        >
          <Twitter size={18} />
          <span className="hidden sm:inline">Twitter</span>
        </button>

        {/* LinkedIn */}
        <button
          onClick={() => handleShare('LinkedIn', shareLinks.linkedin)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-700/20 text-blue-300 text-sm font-bold rounded-lg border border-blue-700/50 hover:bg-blue-700/40 transition-all active:scale-95"
          title="Share on LinkedIn"
        >
          <Linkedin size={18} />
          <span className="hidden sm:inline">LinkedIn</span>
        </button>

        {/* WhatsApp */}
        <button
          onClick={() => handleShare('WhatsApp', shareLinks.whatsapp)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-green-600/20 text-green-400 text-sm font-bold rounded-lg border border-green-600/50 hover:bg-green-600/40 transition-all active:scale-95"
          title="Share on WhatsApp"
        >
          <MessageCircle size={18} />
          <span className="hidden sm:inline">WhatsApp</span>
        </button>

        {/* Email */}
        <button
          onClick={() => handleShare('Email', shareLinks.email)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-orange-600/20 text-orange-400 text-sm font-bold rounded-lg border border-orange-600/50 hover:bg-orange-600/40 transition-all active:scale-95"
          title="Share via Email"
        >
          <Mail size={18} />
          <span className="hidden sm:inline">Email</span>
        </button>

        {/* Copy Link */}
        <button
          onClick={handleCopyLink}
          className="inline-flex items-center gap-2 px-4 py-2 bg-neon-cyan/20 text-neon-cyan text-sm font-bold rounded-lg border border-neon-cyan/50 hover:bg-neon-cyan/40 transition-all active:scale-95"
          title="Copy link to clipboard"
        >
          <Copy size={18} />
          <span className="hidden sm:inline">Copy Link</span>
        </button>
      </div>

      {/* Mobile-optimized compact view */}
      <div className="sm:hidden text-xs text-gray-400 text-center">
        Tap any button above to share with friends
      </div>
    </div>
  );
}
