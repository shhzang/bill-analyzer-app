import { useState } from 'react';
import { Loader2, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import AnxietyCarousel from '@/components/AnxietyCarousel';
import FileUploadZone from '@/components/FileUploadZone';
import UserTestimonials from '@/components/UserTestimonials';
import LoadingAnimation from '@/components/LoadingAnimation';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';

interface UploadedFile {
  file: File;
  preview?: string;
  type: 'pdf' | 'excel' | 'image' | 'unknown';
}

// Helper function to convert file to base64
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result.split(',')[1]); // Remove data:application/pdf;base64, prefix
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function Home() {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisReport, setAnalysisReport] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  // Initialize tRPC mutation for bill analysis
  const analyzeBillsMutation = trpc.bills.analyze.useMutation({
    onSuccess: (data) => {
      if (data.report) {
        setAnalysisReport(data.report);
        setIsAnalyzing(false);
        toast.dismiss('analysis-status');
        toast.success('✅ Analysis complete! Preview or download your personalized report.', {
          duration: 5000,
        });
      }
    },
    onError: (error) => {
      console.error('Analysis error:', error);
      toast.dismiss('analysis-status');
      toast.error('❌ Failed to analyze bills. Please try again.');
      setIsAnalyzing(false);
    },
  });

  const handleFilesSelected = (files: UploadedFile[]) => {
    setUploadedFiles(files);
    
    // Auto-trigger analysis after files are selected
    setTimeout(() => {
      handleAnalyzeAuto(files);
    }, 500);
  };

  const handleAnalyzeAuto = async (files: UploadedFile[]) => {
    if (files.length === 0) return;
    setIsAnalyzing(true);
    toast.loading('🤖 AI is analyzing your bills...', { id: 'analysis-status' });
    
    try {
      const fileData = await Promise.all(
        files.map(async (uf) => ({
          name: uf.file.name,
          type: uf.file.type,
          size: uf.file.size,
          base64: await fileToBase64(uf.file),
        }))
      );
      
      await analyzeBillsMutation.mutateAsync({ files: fileData });
    } catch (error) {
      console.error('Auto-analysis error:', error);
      toast.dismiss('analysis-status');
      toast.error('Failed to prepare files for analysis. Please try again.');
      setIsAnalyzing(false);
    }
  };

  const handleAnalyze = async () => {
    if (uploadedFiles.length === 0) {
      toast.error('Please upload at least one file');
      return;
    }

    setIsAnalyzing(true);
    toast.loading('🤖 AI is analyzing your bills...', { id: 'analysis-status' });
    
    try {
      // Convert files to base64 for transmission
      const fileData = await Promise.all(
        uploadedFiles.map(async (uf) => ({
          name: uf.file.name,
          type: uf.file.type,
          size: uf.file.size,
          base64: await fileToBase64(uf.file),
        }))
      );

      // Call tRPC mutation to analyze bills
      await analyzeBillsMutation.mutateAsync({
        files: fileData,
      });
    } catch (error) {
      console.error('Analysis error:', error);
      toast.dismiss('analysis-status');
      toast.error('Failed to analyze bills. Please try again.');
      setIsAnalyzing(false);
    }
  };

  const handleDownloadReport = () => {
    if (!analysisReport) return;

    const element = document.createElement('a');
    const file = new Blob([analysisReport], { type: 'text/html' });
    element.href = URL.createObjectURL(file);
    element.download = `bill-analysis-report-${new Date().toISOString().split('T')[0]}.html`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    toast.success('Report downloaded successfully!');
  };

  return (
    <div className="min-h-screen bg-dark-deep text-foreground">
      {/* Header with SEO optimization */}
      <header className="border-b border-neon-cyan/20 bg-gradient-to-b from-[#1a0a2e] to-transparent">
        <div className="container py-6 sm:py-8">
          <div className="flex items-center gap-3 mb-2">
            <Zap className="w-8 h-8 text-neon-pink glow-text" />
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold glow-text uppercase tracking-wider">
              Bill Analyzer
            </h1>
            <div className="ml-auto">
              <span className="inline-block bg-neon-pink text-black px-3 py-1 rounded-full text-xs sm:text-sm font-bold glow-text">
                100% FREE
              </span>
            </div>
          </div>
          <p className="text-neon-cyan glow-text-cyan text-sm sm:text-base font-semibold">
            🤖 Powered by Advanced AI • Find Hidden Fees • Reclaim Your Money
          </p>
          <p className="text-gray-400 text-xs sm:text-sm mt-2">
            Analyze your bills with cutting-edge AI technology. Discover hidden charges, identify billing errors, and get actionable savings strategies. Your data is secure and never shared.
          </p>
        </div>
      </header>

      {/* Main content */}
      <main className="container py-8 sm:py-12">
        {/* Anxiety Carousel Section */}
        <section className="mb-12 sm:mb-16">
          <div className="mb-4">
            <h2 className="text-xl sm:text-2xl font-bold text-neon-pink glow-text uppercase tracking-wider">
              Why You Need AI-Powered Bill Analysis
            </h2>
            <p className="text-gray-400 text-sm mt-2">
              Most people leave thousands of dollars on the table every year. Our AI finds what you miss.
            </p>
          </div>
          <AnxietyCarousel />
        </section>

        {/* User Testimonials Section */}
        <UserTestimonials />

        {/* File Upload Section */}
        <section className="mb-12 sm:mb-16">
          <div className="mb-6">
            <h2 className="text-xl sm:text-2xl font-bold text-neon-pink glow-text uppercase tracking-wider mb-2">
              Upload Your Bills (It's Free!)
            </h2>
            <p className="text-gray-400 text-sm">
              Upload your bill documents and let our advanced AI analyze them instantly for hidden fees, billing errors, and personalized savings opportunities. No credit card required.
            </p>
          </div>

          <div className="neon-box-cyan p-6 sm:p-8 rounded-lg">
            <FileUploadZone onFilesSelected={handleFilesSelected} isLoading={isAnalyzing} />
          </div>
        </section>

        {/* Analysis Section */}
        {uploadedFiles.length > 0 && (
          <section className="mb-12 sm:mb-16">
            {/* File list and status */}
            <div className="mb-6 p-4 sm:p-6 neon-box-cyan rounded-lg">
              <h3 className="text-neon-cyan font-bold mb-3">📁 Uploaded Files ({uploadedFiles.length})</h3>
              <div className="space-y-2">
                {uploadedFiles.map((item, index) => (
                  <div key={index} className="flex items-center justify-between text-sm">
                    <span className="text-gray-300 truncate flex items-center gap-2">
                      {item.file.type.startsWith('image/') ? '🖼️' : item.file.type.includes('pdf') ? '📄' : '📊'}
                      {item.file.name}
                    </span>
                    <span className="text-gray-500 ml-2 text-xs">{(item.file.size / 1024 / 1024).toFixed(2)} MB</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Analysis status - In Progress */}
            <LoadingAnimation isVisible={isAnalyzing} />

            {/* Analysis complete */}
            {analysisReport && !isAnalyzing && (
              <div className="mb-6 p-4 sm:p-6 neon-box rounded-lg border-l-4 border-neon-cyan">
                <div className="flex items-center gap-3">
                  <div className="text-2xl">✅</div>
                  <div>
                    <p className="text-neon-cyan font-bold">Analysis Complete!</p>
                    <p className="text-gray-400 text-sm">Your personalized bill analysis report is ready. Click below to preview or download.</p>
                  </div>
                </div>
              </div>
            )}

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              {!isAnalyzing && !analysisReport && (
                <Button
                  onClick={handleAnalyze}
                  disabled={isAnalyzing || uploadedFiles.length === 0}
                  className="flex-1 bg-neon-pink hover:bg-neon-pink/90 text-black font-bold py-3 sm:py-4 text-base sm:text-lg rounded-lg transition-all duration-200 hover:shadow-lg hover:shadow-neon-pink/50"
                >
                  <Zap className="w-5 h-5 mr-2" />
                  Analyze with Advanced AI (FREE)
                </Button>
              )}

              {analysisReport && !isAnalyzing && (
                <>
                  <Button
                    onClick={() => setShowPreview(true)}
                    className="flex-1 bg-neon-cyan hover:bg-neon-cyan/80 text-black font-bold py-4 sm:py-5 text-lg sm:text-xl rounded-lg transition-all duration-200 hover:shadow-xl hover:shadow-neon-cyan/60 active:scale-95 border-2 border-neon-cyan/30"
                  >
                    <span className="text-xl mr-2">👁️</span>Preview Report
                  </Button>
                  <Button
                    onClick={handleDownloadReport}
                    className="flex-1 bg-neon-pink hover:bg-neon-pink/80 text-black font-bold py-4 sm:py-5 text-lg sm:text-xl rounded-lg transition-all duration-200 hover:shadow-xl hover:shadow-neon-pink/60 active:scale-95 border-2 border-neon-pink/30"
                  >
                    <span className="text-xl mr-2">⬇️</span>Download Report
                  </Button>
                </>
              )}
            </div>
          </section>
        )}

        {/* Info Section */}
        <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
          <div className="neon-box p-4 sm:p-6 rounded-lg">
            <div className="text-2xl sm:text-3xl mb-3">🤖</div>
            <h3 className="text-neon-cyan font-bold mb-2">AI-Powered Analysis</h3>
            <p className="text-gray-400 text-sm">
              Our advanced AI finds duplicate charges, billing errors, and unauthorized subscriptions that humans miss.
            </p>
          </div>

          <div className="neon-box p-4 sm:p-6 rounded-lg">
            <div className="text-2xl sm:text-3xl mb-3">💰</div>
            <h3 className="text-neon-cyan font-bold mb-2">Real Savings</h3>
            <p className="text-gray-400 text-sm">
              Get exact numbers on how much you can save monthly. Potential savings vary based on your bills.
            </p>
          </div>

          <div className="neon-box p-4 sm:p-6 rounded-lg">
            <div className="text-2xl sm:text-3xl mb-3">⚡</div>
            <h3 className="text-neon-cyan font-bold mb-2">Instant Action Plan</h3>
            <p className="text-gray-400 text-sm">
              Get step-by-step instructions to cancel subscriptions, call providers, and file complaints—all free.
            </p>
          </div>
        </section>
      </main>

      {/* Report Preview Dialog */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-[#1a1a2e] border-neon-cyan/30">
          <DialogHeader>
            <DialogTitle className="text-neon-pink glow-text">📊 Your Bill Analysis Report</DialogTitle>
          </DialogHeader>
          {analysisReport && (
            <div
              className="prose prose-invert max-w-none text-sm sm:text-base"
              dangerouslySetInnerHTML={{ __html: analysisReport }}
            />
          )}
          <div className="flex gap-3 mt-6 pt-4 border-t border-neon-cyan/20">
            <Button
              onClick={handleDownloadReport}
              className="flex-1 bg-neon-pink hover:bg-neon-pink/80 text-black font-bold py-3 sm:py-4 text-base sm:text-lg rounded-lg transition-all duration-200 hover:shadow-lg hover:shadow-neon-pink/60 active:scale-95 border-2 border-neon-pink/30"
            >
              ⬇️ Download Report
            </Button>
            <Button
              onClick={() => setShowPreview(false)}
              className="flex-1 bg-neon-cyan/20 hover:bg-neon-cyan/40 text-neon-cyan font-bold py-3 sm:py-4 text-base sm:text-lg rounded-lg transition-all duration-200 hover:shadow-lg hover:shadow-neon-cyan/40 border-2 border-neon-cyan/50"
            >
              ✕ Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Footer */}
      <footer className="border-t border-neon-cyan/20 mt-12 sm:mt-16 py-6 sm:py-8 bg-gradient-to-t from-[#0a0e27] to-transparent">
        <div className="container">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-6">
            <div>
              <h4 className="text-neon-pink font-bold mb-2">Bill Analyzer</h4>
              <p className="text-gray-400 text-sm">
                Free AI-powered bill analysis. Find hidden fees, billing errors, and save money every month. No credit card required.
              </p>
            </div>
            <div>
              <h4 className="text-neon-cyan font-bold mb-2">What We Find</h4>
              <ul className="text-gray-400 text-sm space-y-1">
                <li>• Duplicate charges & errors</li>
                <li>• Unauthorized subscriptions</li>
                <li>• Overcharge opportunities</li>
                <li>• Monthly savings potential</li>
              </ul>
            </div>
            <div>
              <h4 className="text-neon-cyan font-bold mb-2">Supported Formats</h4>
              <ul className="text-gray-400 text-sm space-y-1">
                <li>• PDF documents</li>
                <li>• Excel spreadsheets (CSV)</li>
                <li>• Bill photos & screenshots</li>
                <li>• All image formats</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-neon-cyan/20 pt-4 text-center text-gray-500 text-xs">
            <p>&copy; 2026 Bill Analyzer. 100% Free. Powered by Advanced AI. | Privacy Policy | Terms of Service</p>
          </div>
        </div>
      </footer>
    </div>
  );
}


