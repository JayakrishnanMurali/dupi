'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

export default function CreateProjectPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    interfaceCode: '',
    method: 'GET' as const,
    expirationHours: 24,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create project');
      }

      const result = await response.json();
      router.push(`/projects/${result.data.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const exampleInterface = `interface User {
  id: number;
  name: string;
  email: string;
  avatar?: string;
  isActive: boolean;
  createdAt: Date;
  profile: {
    bio: string;
    location: string;
    website?: string;
  };
  tags: string[];
}`;

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-900 to-slate-900 text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-8">Create New Project</h1>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-lg font-medium mb-2">
                Project Name
              </label>
              <input
                type="text"
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter project name"
                required
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-lg font-medium mb-2">
                Description (Optional)
              </label>
              <input
                type="text"
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Brief description of your API"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="method" className="block text-lg font-medium mb-2">
                  HTTP Method
                </label>
                <select
                  id="method"
                  value={formData.method}
                  onChange={(e) => setFormData({ ...formData, method: e.target.value as any })}
                  className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="GET">GET</option>
                  <option value="POST">POST</option>
                  <option value="PUT">PUT</option>
                  <option value="DELETE">DELETE</option>
                  <option value="PATCH">PATCH</option>
                </select>
              </div>

              <div>
                <label htmlFor="expiration" className="block text-lg font-medium mb-2">
                  Expiration (hours)
                </label>
                <input
                  type="number"
                  id="expiration"
                  value={formData.expirationHours}
                  onChange={(e) => setFormData({ ...formData, expirationHours: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="1"
                  max="720"
                />
              </div>
            </div>

            <div>
              <label htmlFor="interface" className="block text-lg font-medium mb-2">
                TypeScript Interface
              </label>
              <div className="flex gap-4 mb-2">
                <Button
                  type="button"
                  onClick={() => setFormData({ ...formData, interfaceCode: exampleInterface })}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Use Example
                </Button>
                <Button
                  type="button"
                  onClick={() => setFormData({ ...formData, interfaceCode: '' })}
                  className="bg-gray-600 hover:bg-gray-700"
                >
                  Clear
                </Button>
              </div>
              <textarea
                id="interface"
                value={formData.interfaceCode}
                onChange={(e) => setFormData({ ...formData, interfaceCode: e.target.value })}
                className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                placeholder="Paste your TypeScript interface here..."
                rows={12}
                required
              />
            </div>

            {error && (
              <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4">
                <p className="text-red-300">{error}</p>
              </div>
            )}

            <div className="flex gap-4">
              <Button
                type="submit"
                disabled={isLoading}
                className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
              >
                {isLoading ? 'Creating...' : 'Create Project'}
              </Button>
              <Button
                type="button"
                onClick={() => router.push('/')}
                className="bg-gray-600 hover:bg-gray-700"
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}