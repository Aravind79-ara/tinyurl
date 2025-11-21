'use client';

import { useState, useEffect } from 'react';
import { Plus, Trash2, Copy, ExternalLink } from 'lucide-react';

export default function Dashboard() {
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [targetUrl, setTargetUrl] = useState('');
  const [customCode, setCustomCode] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchLinks();
  }, []);

  const fetchLinks = async () => {
    try {
      const res = await fetch('/api/links');
      const data = await res.json();
      setLinks(data);
    } catch (err) {
      setError('Failed to load links');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSubmitting(true);

    try {
      const res = await fetch('/api/links', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetUrl,
          customCode: customCode || undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to create link');
      }

      setSuccess('Link created successfully!');
      setTargetUrl('');
      setCustomCode('');
      setShowForm(false);
      fetchLinks();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (code) => {
    if (!confirm('Are you sure you want to delete this link?')) return;

    try {
      const res = await fetch(`/api/links/${code}`, { method: 'DELETE' });
      if (res.ok) {
        fetchLinks();
      }
    } catch (err) {
      setError('Failed to delete link');
    }
  };

  const copyToClipboard = (code) => {
    const url = `${window.location.origin}/${code}`;
    navigator.clipboard.writeText(url);
    alert('Copied to clipboard!');
  };

  const filteredLinks = links.filter(
    (link) =>
      link.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      link.targetUrl.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-900 ">TinyLink Dashboard</h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Success/Error Messages */}
        {success && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 text-green-800 rounded">
            {success}
          </div>
        )}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-800 rounded">
            {error}
          </div>
        )}

        {/* Add Link Button */}
        <div className="mb-6 flex justify-between items-center">
          <input
            type="text" style={{color:"black"}}
            placeholder="Search by code or URL..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-4 py-2 border rounded-lg w-64"
          />
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-black rounded-lg hover:bg-blue-700"
          >
            <Plus size={20} />
            Add Link
          </button>
        </div>

        {/* Add Link Form */}
        {showForm && (
          <div className="mb-6 p-6 bg-white rounded-lg shadow-sm border">
            <h2 className="text-lg font-semibold mb-4 text-black">Create New Short Link</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-black">Target URL *</label>
                <input
                  type="url"
                  required style={{color:"black"}}
                  value={targetUrl}
                  onChange={(e) => setTargetUrl(e.target.value)}
                  placeholder="https://example.com"
                  className="w-full px-4 py-2 border rounded-lg"
                  disabled={submitting}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-black">
                  Custom Code (optional, 6-8 characters)
                </label>
                <input
                  type="text" style={{color:"black"}}
                  value={customCode}
                  onChange={(e) => setCustomCode(e.target.value)}
                  placeholder="mycode"
                  pattern="[A-Za-z0-9]{6,8}"
                  className="w-full px-4 py-2 border rounded-lg text-black"
                  disabled={submitting}
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {submitting ? 'Creating...' : 'Create Link'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 bg-gray-700 rounded-lg hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Links Table */}
        {loading ? (
          <div className="text-center py-12">Loading...</div>
        ) : filteredLinks.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm">
            <p className="text-black-500">No links found. Create your first one!</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Short Code
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Target URL
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Clicks
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Last Clicked
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredLinks.map((link) => (
                    <tr key={link.code} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <a
                          href={`/code/${link.code}`}
                          className="text-blue-600 hover:underline font-mono text-black"
                        >
                          {link.code}
                        </a>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="truncate max-w-md text-black">{link.targetUrl}</span>
                          <a
                            href={link.targetUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-gray-400 hover:text-black-600"
                          >
                            <ExternalLink size={16} />
                          </a>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-black">{link.clicks}</td>
                      <td className="px-6 py-4 text-black">
                        {link.lastClicked
                          ? new Date(link.lastClicked).toLocaleString()
                          : 'Never'}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => copyToClipboard(link.code)}
                            className="p-1 text-gray-600 hover:text-blue-600"
                            title="Copy short URL"
                          >
                            <Copy size={18} />
                          </button>
                          <button
                            onClick={() => handleDelete(link.code)}
                            className="p-1 text-gray-600 hover:text-red-600"
                            title="Delete link"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
