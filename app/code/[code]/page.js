'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, ExternalLink, Copy } from 'lucide-react';

export default function StatsPage() {
  const params = useParams();
  const router = useRouter();
  const code = params.code;
  const [link, setLink] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchLink();
  }, [code]);

  const fetchLink = async () => {
    try {
      const res = await fetch(`/api/links/${code}`);
      if (!res.ok) {
        throw new Error('Link not found');
      }
      const data = await res.json();
      setLink(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    const url = `${window.location.origin}/${code}`;
    navigator.clipboard.writeText(url);
    alert('Copied to clipboard!');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  if (error || !link) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Link Not Found</h1>
          <button
            onClick={() => router.push('/')}
            className="text-blue-600 hover:underline"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const shortUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/${code}`;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <button
            onClick={() => router.push('/')}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-2"
          >
            <ArrowLeft size={20} />
            Back to Dashboard
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Link Statistics</h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-sm border p-6 space-y-6">
          {/* Short URL */}
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-2">
              Short URL
            </label>
            <div className="flex items-center gap-2 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <code className="flex-1 text-blue-700 font-mono text-lg">{shortUrl}</code>
              <button
                onClick={copyToClipboard}
                className="p-2 text-blue-600 hover:text-blue-700"
                title="Copy to clipboard"
              >
                <Copy size={20} />
              </button>
            </div>
          </div>

          {/* Target URL */}
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-2">
              Target URL
            </label>
            <div className="flex items-center gap-2 p-4 bg-gray-50 border rounded-lg">
              <span className="flex-1 break-all">{link.targetUrl}</span>
              <a
                href={link.targetUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 text-gray-600 hover:text-gray-700"
                title="Open target URL"
              >
                <ExternalLink size={20} />
              </a>
            </div>
          </div>

          {/* Statistics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-lg">
              <div className="text-sm font-medium text-purple-600 mb-1">Total Clicks</div>
              <div className="text-3xl font-bold text-purple-900">{link.clicks}</div>
            </div>

            <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-lg">
              <div className="text-sm font-medium text-green-600 mb-1">Created</div>
              <div className="text-sm font-semibold text-green-900">
                {new Date(link.createdAt).toLocaleDateString()}
              </div>
              <div className="text-xs text-green-700">
                {new Date(link.createdAt).toLocaleTimeString()}
              </div>
            </div>

            <div className="p-4 bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200 rounded-lg">
              <div className="text-sm font-medium text-orange-600 mb-1">Last Clicked</div>
              <div className="text-sm font-semibold text-orange-900">
                {link.lastClicked
                  ? new Date(link.lastClicked).toLocaleDateString()
                  : 'Never'}
              </div>
              {link.lastClicked && (
                <div className="text-xs text-orange-700">
                  {new Date(link.lastClicked).toLocaleTimeString()}
                </div>
              )}
            </div>
          </div>

          {/* Short Code */}
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-2">
              Short Code
            </label>
            <code className="block p-4 bg-gray-50 border rounded-lg font-mono text-lg">
              {link.code}
            </code>
          </div>
        </div>
      </main>
    </div>
  );
}
