import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';
import { LogOut, Download } from 'lucide-react';

const ADMIN_PASSWORD = 'Ai318318';

export default function Admin() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [password, setPassword] = useState('');
  const [showLoginDialog, setShowLoginDialog] = useState(true);

  const submissionsQuery = trpc.submissions.getAll.useQuery(undefined, {
    enabled: isLoggedIn,
  });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setIsLoggedIn(true);
      setShowLoginDialog(false);
      setPassword('');
      toast.success('✅ Login successful!');
    } else {
      toast.error('❌ Invalid password');
      setPassword('');
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setShowLoginDialog(true);
    setPassword('');
    toast.success('Logged out');
  };

  const downloadAsCSV = () => {
    if (!submissionsQuery.data?.data) return;

    const headers = ['ID', 'Full Name', 'Phone', 'Country', 'Email', 'Submitted At'];
    const rows = submissionsQuery.data.data.map((submission) => [
      submission.id,
      submission.fullName,
      submission.phone,
      submission.country,
      submission.email,
      new Date(submission.createdAt).toLocaleString(),
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `user-submissions-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
    toast.success('✅ CSV downloaded successfully!');
  };

  if (!isLoggedIn) {
    return (
      <Dialog open={showLoginDialog} onOpenChange={() => {}}>
        <DialogContent className="sm:max-w-md bg-black border-2 border-neon-pink/50">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-neon-pink">
              🔐 Admin Login
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-neon-pink mb-2">
                Username
              </label>
              <input
                type="text"
                value="admin"
                disabled
                className="w-full px-4 py-2 bg-black border-2 border-neon-pink/30 text-white rounded-lg opacity-50 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neon-pink mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 bg-black border-2 border-neon-pink/30 text-white rounded-lg focus:outline-none focus:border-neon-pink focus:shadow-lg focus:shadow-neon-pink/50 transition-all"
                placeholder="Enter password"
                autoFocus
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-neon-pink text-black font-bold py-3 rounded-lg hover:shadow-lg hover:shadow-neon-pink/60 transition-all active:scale-95"
            >
              Login
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-neon-pink">📊 Admin Dashboard</h1>
          <Button
            onClick={handleLogout}
            className="bg-neon-pink text-black font-bold px-6 py-2 rounded-lg hover:shadow-lg hover:shadow-neon-pink/60 transition-all active:scale-95 flex items-center gap-2"
          >
            <LogOut size={18} />
            Logout
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-black border-2 border-neon-pink/50 rounded-lg p-6">
            <div className="text-neon-pink text-sm font-medium mb-2">Total Submissions</div>
            <div className="text-4xl font-bold text-white">
              {submissionsQuery.data?.data?.length || 0}
            </div>
          </div>
          <div className="bg-black border-2 border-neon-cyan/50 rounded-lg p-6">
            <div className="text-neon-cyan text-sm font-medium mb-2">Last Updated</div>
            <div className="text-lg font-bold text-white">
              {submissionsQuery.data?.data?.[0]
                ? new Date(submissionsQuery.data.data[0].createdAt).toLocaleDateString()
                : 'N/A'}
            </div>
          </div>
          <div className="bg-black border-2 border-neon-cyan/50 rounded-lg p-6">
            <div className="text-neon-cyan text-sm font-medium mb-2">Status</div>
            <div className="text-lg font-bold text-white">
              {submissionsQuery.isLoading ? 'Loading...' : 'Active'}
            </div>
          </div>
        </div>

        {/* Download Button */}
        <div className="mb-6">
          <Button
            onClick={downloadAsCSV}
            disabled={!submissionsQuery.data?.data || submissionsQuery.data.data.length === 0}
            className="bg-neon-cyan text-black font-bold px-6 py-2 rounded-lg hover:shadow-lg hover:shadow-neon-cyan/60 transition-all active:scale-95 flex items-center gap-2 disabled:opacity-50"
          >
            <Download size={18} />
            Download as CSV
          </Button>
        </div>

        {/* Table */}
        <div className="border-2 border-neon-pink/50 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-neon-pink/10 border-b-2 border-neon-pink/50">
                  <th className="px-6 py-4 text-left text-neon-pink font-bold">ID</th>
                  <th className="px-6 py-4 text-left text-neon-pink font-bold">Full Name</th>
                  <th className="px-6 py-4 text-left text-neon-pink font-bold">Phone</th>
                  <th className="px-6 py-4 text-left text-neon-pink font-bold">Country</th>
                  <th className="px-6 py-4 text-left text-neon-pink font-bold">Email</th>
                  <th className="px-6 py-4 text-left text-neon-pink font-bold">Submitted At</th>
                </tr>
              </thead>
              <tbody>
                {submissionsQuery.isLoading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-gray-400">
                      Loading submissions...
                    </td>
                  </tr>
                ) : submissionsQuery.data?.data && submissionsQuery.data.data.length > 0 ? (
                  submissionsQuery.data.data.map((submission, index) => (
                    <tr
                      key={submission.id}
                      className={`border-b border-neon-pink/20 hover:bg-neon-pink/5 transition-colors ${
                        index % 2 === 0 ? 'bg-black' : 'bg-neon-pink/5'
                      }`}
                    >
                      <td className="px-6 py-4 text-white font-mono">{submission.id}</td>
                      <td className="px-6 py-4 text-white">{submission.fullName}</td>
                      <td className="px-6 py-4 text-white">{submission.phone}</td>
                      <td className="px-6 py-4 text-white">{submission.country}</td>
                      <td className="px-6 py-4 text-neon-cyan hover:underline cursor-pointer">
                        {submission.email}
                      </td>
                      <td className="px-6 py-4 text-gray-400 text-sm">
                        {new Date(submission.createdAt).toLocaleString()}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-gray-400">
                      No submissions yet
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
