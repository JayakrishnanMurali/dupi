'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import type { ApiProject } from '@/lib/dupi/types';

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.projectId as string;
  
  const [project, setProject] = useState<ApiProject | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mockData, setMockData] = useState<any>(null);
  const [loadingMock, setLoadingMock] = useState(false);

  useEffect(() => {
    async function fetchProject() {
      try {
        const response = await fetch(`/api/projects/${projectId}`);
        if (!response.ok) {
          throw new Error('Project not found');
        }
        const result = await response.json();
        setProject(result.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load project');
      } finally {
        setLoading(false);
      }
    }

    if (projectId) {
      fetchProject();
    }
  }, [projectId]);

  const generateMockData = async (count?: number) => {
    setLoadingMock(true);
    try {
      const url = count 
        ? `/api/mock/${projectId}?count=${count}`
        : `/api/mock/${projectId}`;
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to generate mock data');
      }
      const result = await response.json();
      setMockData(result.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate mock data');
    } finally {
      setLoadingMock(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-900 to-slate-900 text-white flex items-center justify-center">
        <div className="text-xl">Loading project...</div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-900 to-slate-900 text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Project Not Found</h1>
          <p className="text-red-300 mb-6">{error}</p>
          <Button onClick={() => router.push('/')} className="bg-blue-600 hover:bg-blue-700">
            Go Home
          </Button>
        </div>
      </div>
    );
  }

  const apiUrl = `${window.location.origin}/api/mock/${projectId}`;
  const expiresIn = Math.ceil((new Date(project.expiresAt).getTime() - Date.now()) / (1000 * 60 * 60));

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-900 to-slate-900 text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-4xl font-bold">{project.name}</h1>
            <Button 
              onClick={() => router.push('/projects')} 
              className="bg-gray-600 hover:bg-gray-700"
            >
              ← Back to Projects
            </Button>
          </div>

          {project.description && (
            <p className="text-xl text-slate-300 mb-8">{project.description}</p>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Project Info */}
            <div className="bg-white/10 rounded-xl p-6 border border-white/20">
              <h2 className="text-2xl font-bold mb-4">Project Details</h2>
              <div className="space-y-3">
                <div>
                  <span className="font-semibold">Method:</span>
                  <span className="ml-2 px-2 py-1 bg-blue-600 rounded text-sm">{project.method}</span>
                </div>
                <div>
                  <span className="font-semibold">Status Codes:</span>
                  <span className="ml-2">{project.expectedStatusCodes.join(', ')}</span>
                </div>
                <div>
                  <span className="font-semibold">Expires:</span>
                  <span className="ml-2 text-yellow-300">
                    in {expiresIn > 0 ? `${expiresIn} hours` : 'Expired'}
                  </span>
                </div>
                <div>
                  <span className="font-semibold">Created:</span>
                  <span className="ml-2">{new Date(project.createdAt).toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* API Endpoint */}
            <div className="bg-white/10 rounded-xl p-6 border border-white/20">
              <h2 className="text-2xl font-bold mb-4">API Endpoint</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Mock API URL:</label>
                  <div className="flex gap-2">
                    <code className="flex-1 bg-black/30 p-3 rounded text-sm font-mono break-all">
                      {apiUrl}
                    </code>
                    <Button 
                      onClick={() => copyToClipboard(apiUrl)}
                      className="bg-green-600 hover:bg-green-700 px-3"
                    >
                      Copy
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h3 className="font-semibold">Test API:</h3>
                  <div className="flex gap-2">
                    <Button 
                      onClick={() => generateMockData()}
                      disabled={loadingMock}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      {loadingMock ? 'Generating...' : 'Generate Single'}
                    </Button>
                    <Button 
                      onClick={() => generateMockData(5)}
                      disabled={loadingMock}
                      className="bg-purple-600 hover:bg-purple-700"
                    >
                      Generate Array (5)
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* TypeScript Interface */}
          <div className="mt-8 bg-white/10 rounded-xl p-6 border border-white/20">
            <h2 className="text-2xl font-bold mb-4">TypeScript Interface</h2>
            <pre className="bg-black/30 p-4 rounded overflow-x-auto text-sm font-mono">
              <code>{project.interfaceCode}</code>
            </pre>
          </div>

          {/* Mock Data Preview */}
          {mockData && (
            <div className="mt-8 bg-white/10 rounded-xl p-6 border border-white/20">
              <h2 className="text-2xl font-bold mb-4">Generated Mock Data</h2>
              <pre className="bg-black/30 p-4 rounded overflow-x-auto text-sm">
                <code>{JSON.stringify(mockData, null, 2)}</code>
              </pre>
            </div>
          )}

          {/* Usage Examples */}
          <div className="mt-8 bg-white/10 rounded-xl p-6 border border-white/20">
            <h2 className="text-2xl font-bold mb-4">Usage Examples</h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">cURL:</h3>
                <code className="block bg-black/30 p-3 rounded text-sm font-mono break-all">
                  curl "{apiUrl}"
                </code>
              </div>
              <div>
                <h3 className="font-semibold mb-2">JavaScript Fetch:</h3>
                <code className="block bg-black/30 p-3 rounded text-sm font-mono whitespace-pre">
{`fetch('${apiUrl}')
  .then(response => response.json())
  .then(data => console.log(data));`}
                </code>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Multiple Records:</h3>
                <code className="block bg-black/30 p-3 rounded text-sm font-mono break-all">
                  curl "{apiUrl}?count=10"
                </code>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}