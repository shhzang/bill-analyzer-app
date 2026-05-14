import { useState } from 'react';
import { Loader2, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import AnxietyCarousel from '@/components/AnxietyCarousel';
import FileUploadZone from '@/components/FileUploadZone';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';

interface UploadedFile {
  file: File;
  preview?: string;
  type: 'pdf' | 'excel' | 'image' | 'unknown';
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
        setShowPreview(true);
        toast.success('Bill analysis completed!');
      }
    },
    onError: (error) => {
      console.error('Analysis error:', error);
      toast.error(error.message || 'Failed to analyze bills. Please try again.');
    },
  });

  const handleFilesSelected = (files: UploadedFile[]) => {
    setUploadedFiles(files);
  };

  const handleAnalyze = async () => {
    if (uploadedFiles.length === 0) {
      toast.error('Please upload at least one file');
      return;
    }

    setIsAnalyzing(true);
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
      toast.error('Failed to analyze bills. Please try again.');
    } finally {
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
          </div>
          <p className="text-neon-cyan glow-text-cyan text-sm sm:text-base">
            Discover hidden fees. Reclaim your money. Take control of your finances.
          </p>
          <p className="text-gray-400 text-xs sm:text-sm mt-2">
            Analyze your bills with AI-powered insights. Find savings, identify errors, take action.
          </p>
        </div>
      </header>

      {/* Main content */}
      <main className="container py-8 sm:py-12">
        {/* Anxiety Carousel Section */}
        <section className="mb-12 sm:mb-16">
          <div className="mb-4">
            <h2 className="text-xl sm:text-2xl font-bold text-neon-pink glow-text uppercase tracking-wider">
              Why You Need Bill Analysis
            </h2>
          </div>
          <AnxietyCarousel />
        </section>

        {/* File Upload Section */}
        <section className="mb-12 sm:mb-16">
          <div className="mb-6">
            <h2 className="text-xl sm:text-2xl font-bold text-neon-pink glow-text uppercase tracking-wider mb-2">
              Upload Your Bills
            </h2>
            <p className="text-gray-400 text-sm">
              Upload your bill documents and let our AI analyze them for hidden fees, errors, and savings opportunities.
            </p>
          </div>

          <div className="neon-box-cyan p-6 sm:p-8 rounded-lg">
            <FileUploadZone onFilesSelected={handleFilesSelected} isLoading={isAnalyzing} />
          </div>
        </section>

        {/* Analysis Section */}
        {uploadedFiles.length > 0 && (
          <section className="mb-12 sm:mb-16">
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                onClick={handleAnalyze}
                disabled={isAnalyzing || uploadedFiles.length === 0}
                className="flex-1 bg-neon-pink hover:bg-neon-pink/90 text-black font-bold py-3 sm:py-4 text-base sm:text-lg rounded-lg transition-all duration-200 hover:shadow-lg hover:shadow-neon-pink/50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Analyzing Your Bills...
                  </>
                ) : (
                  <>
                    <Zap className="w-5 h-5 mr-2" />
                    Analyze Bills with AI
                  </>
                )}
              </Button>

              {analysisReport && (
                <>
                  <Button
                    onClick={() => setShowPreview(true)}
                    variant="outline"
                    className="flex-1 border-neon-cyan text-neon-cyan hover:bg-neon-cyan/10 py-3 sm:py-4 text-base sm:text-lg rounded-lg font-semibold"
                  >
                    Preview Report
                  </Button>

                  <Button
                    onClick={handleDownloadReport}
                    variant="outline"
                    className="flex-1 border-neon-pink text-neon-pink hover:bg-neon-pink/10 py-3 sm:py-4 text-base sm:text-lg rounded-lg font-semibold"
                  >
                    Download Report
                  </Button>
                </>
              )}
            </div>

            {isAnalyzing && (
              <div className="mt-6 p-4 bg-neon-cyan/10 border border-neon-cyan/30 rounded-lg">
                <div className="flex items-center gap-3">
                  <Loader2 className="w-5 h-5 text-neon-cyan animate-spin" />
                  <div>
                    <p className="text-neon-cyan font-semibold">Analyzing your bills...</p>
                    <p className="text-gray-400 text-sm">This may take a moment. Our AI is reviewing your documents.</p>
                  </div>
                </div>
              </div>
            )}
          </section>
        )}

        {/* Info Section */}
        <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
          <div className="neon-box p-4 sm:p-6 rounded-lg">
            <div className="text-2xl sm:text-3xl mb-3">🔍</div>
            <h3 className="text-neon-cyan font-bold mb-2">Identify Issues</h3>
            <p className="text-gray-400 text-sm">
              Our AI finds duplicate charges, billing errors, and unauthorized subscriptions.
            </p>
          </div>

          <div className="neon-box p-4 sm:p-6 rounded-lg">
            <div className="text-2xl sm:text-3xl mb-3">💰</div>
            <h3 className="text-neon-cyan font-bold mb-2">Calculate Savings</h3>
            <p className="text-gray-400 text-sm">
              Get exact numbers on how much you can save monthly by optimizing your bills.
            </p>
          </div>

          <div className="neon-box p-4 sm:p-6 rounded-lg">
            <div className="text-2xl sm:text-3xl mb-3">✅</div>
            <h3 className="text-neon-cyan font-bold mb-2">Take Action</h3>
            <p className="text-gray-400 text-sm">
              Get step-by-step instructions to cancel subscriptions, call providers, and file complaints.
            </p>
          </div>
        </section>
      </main>

      {/* Report Preview Dialog */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-[#1a1a2e] border-neon-cyan/30">
          <DialogHeader>
            <DialogTitle className="text-neon-pink glow-text">Bill Analysis Report</DialogTitle>
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
              className="flex-1 bg-neon-pink hover:bg-neon-pink/90 text-black font-bold"
            >
              Download Report
            </Button>
            <Button
              onClick={() => setShowPreview(false)}
              variant="outline"
              className="flex-1 border-neon-cyan text-neon-cyan hover:bg-neon-cyan/10"
            >
              Close
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
                AI-powered bill analysis to help you find hidden fees and save money.
              </p>
            </div>
            <div>
              <h4 className="text-neon-cyan font-bold mb-2">Features</h4>
              <ul className="text-gray-400 text-sm space-y-1">
                <li>• Identify billing errors</li>
                <li>• Find hidden charges</li>
                <li>• Calculate monthly savings</li>
              </ul>
            </div>
            <div>
              <h4 className="text-neon-cyan font-bold mb-2">Supported Formats</h4>
              <ul className="text-gray-400 text-sm space-y-1">
                <li>• PDF documents</li>
                <li>• Excel spreadsheets</li>
                <li>• Bill photos & images</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-neon-cyan/20 pt-4 text-center text-gray-500 text-xs">
            <p>&copy; 2026 Bill Analyzer. All rights reserved. | Privacy Policy | Terms of Service</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

// Helper function to convert File to base64
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result.split(',')[1] || '');
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
