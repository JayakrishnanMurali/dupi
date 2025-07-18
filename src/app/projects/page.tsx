'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import type { ApiProject } from '@/lib/dupi/types';

export default function ProjectsPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<ApiProject[]>([]);
  const [stats, setStats] = useState<{ total: number; active: number; expired: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProjects() {
      try {
        const response = await fetch('/api/projects');
        if (!response.ok) {
          throw new Error('Failed to fetch projects');
        }
        const result = await response.json();
        setProjects(result.data.projects);
        setStats(result.data.stats);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load projects');
      } finally {
        setLoading(false);
      }
    }

    fetchProjects();
  }, []);

  const deleteProject = async (projectId: string) => {
    try {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete project');
      }

      setProjects(projects.filter(p => p.id !== projectId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete project');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-900 to-slate-900 text-white flex items-center justify-center">
        <div className="text-xl">Loading projects...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-900 to-slate-900 text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-4xl font-bold">My Projects</h1>
            <div className="flex gap-4">
              <Button 
                onClick={() => router.push('/create')}
                className="bg-blue-600 hover:bg-blue-700"
              >
                + New Project
              </Button>
              <Button 
                onClick={() => router.push('/')}
                className="bg-gray-600 hover:bg-gray-700"
              >
                ← Home
              </Button>
            </div>
          </div>

          {/* Stats */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white/10 rounded-xl p-6 border border-white/20 text-center">
                <div className="text-3xl font-bold text-blue-400">{stats.active}</div>
                <div className="text-lg">Active Projects</div>
              </div>
              <div className="bg-white/10 rounded-xl p-6 border border-white/20 text-center">
                <div className="text-3xl font-bold text-green-400">{stats.total}</div>
                <div className="text-lg">Total Projects</div>
              </div>
              <div className="bg-white/10 rounded-xl p-6 border border-white/20 text-center">
                <div className="text-3xl font-bold text-yellow-400">{stats.expired}</div>
                <div className="text-lg">Expired Projects</div>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 mb-6">
              <p className="text-red-300">{error}</p>
            </div>
          )}

          {/* Projects List */}
          {projects.length === 0 ? (
            <div className="text-center py-12">
              <h2 className="text-2xl font-bold mb-4">No Projects Yet</h2>
              <p className="text-slate-300 mb-6">Create your first mock API project to get started!</p>
              <Button 
                onClick={() => router.push('/create')}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Create First Project
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((project) => {
                const expiresIn = Math.ceil((new Date(project.expiresAt).getTime() - Date.now()) / (1000 * 60 * 60));
                const isExpired = expiresIn <= 0;
                
                return (
                  <div key={project.id} className="bg-white/10 rounded-xl p-6 border border-white/20">
                    <div className="flex items-start justify-between mb-4">
                      <h3 className="text-xl font-bold truncate flex-1">{project.name}</h3>
                      <span className={`px-2 py-1 rounded text-xs ${
                        isExpired ? 'bg-red-600' : 'bg-green-600'
                      }`}>
                        {isExpired ? 'Expired' : 'Active'}
                      </span>
                    </div>
                    
                    {project.description && (
                      <p className="text-slate-300 text-sm mb-4 line-clamp-2">{project.description}</p>
                    )}
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between text-sm">
                        <span>Method:</span>
                        <span className="px-2 py-1 bg-blue-600 rounded text-xs">{project.method}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Expires:</span>
                        <span className={isExpired ? 'text-red-300' : 'text-yellow-300'}>
                          {isExpired ? 'Expired' : `${expiresIn}h`}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Created:</span>
                        <span>{new Date(project.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button 
                        onClick={() => router.push(`/projects/${project.id}`)}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-sm py-2"
                      >
                        View Details
                      </Button>
                      <Button 
                        onClick={() => deleteProject(project.id)}
                        className="bg-red-600 hover:bg-red-700 text-sm py-2 px-3"
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}