'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useCreateProject } from '@/lib/hooks/use-projects';
import type { CreateProjectParams } from '@/lib/api/types';

export default function CreateProjectPage() {
  const router = useRouter();
  const createProjectMutation = useCreateProject();
  
  const [formData, setFormData] = useState<CreateProjectParams>({
    name: '',
    description: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const project = await createProjectMutation.mutateAsync(formData);
      router.push(`/projects/${project.id}`);
    } catch (err) {
      console.error('Failed to create project:', err);
    }
  };

  const handleInputChange = (field: keyof CreateProjectParams, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-900 to-slate-900 text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-2xl">
          <div className="mb-8 flex items-center justify-between">
            <h1 className="text-4xl font-bold">Create New Project</h1>
            <Button 
              onClick={() => router.push('/projects')} 
              className="bg-gray-600 hover:bg-gray-700"
            >
              ← Back
            </Button>
          </div>

          <div className="rounded-xl border border-white/20 bg-white/10 p-8">
            <div className="mb-6">
              <h2 className="text-2xl font-bold mb-2">Project Information</h2>
              <p className="text-slate-300">
                Create a new project to organize your mock APIs. You can add multiple API endpoints to each project.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium mb-2">
                  Project Name <span className="text-red-400">*</span>
                </label>
                <input
                  id="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="w-full rounded-lg bg-slate-700 border border-slate-600 px-4 py-3 text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  placeholder="e.g., E-commerce API, User Management System"
                />
                <p className="mt-2 text-sm text-slate-400">
                  Choose a descriptive name for your project
                </p>
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium mb-2">
                  Description <span className="text-slate-400">(optional)</span>
                </label>
                <textarea
                  id="description"
                  rows={3}
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  className="w-full rounded-lg bg-slate-700 border border-slate-600 px-4 py-3 text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  placeholder="Briefly describe what this project is for..."
                />
                <p className="mt-2 text-sm text-slate-400">
                  Add an optional description to help identify this project later
                </p>
              </div>

              <div className="rounded-lg bg-blue-500/10 border border-blue-500/20 p-4">
                <h3 className="font-semibold text-blue-300 mb-2">What's Next?</h3>
                <p className="text-sm text-slate-300">
                  After creating your project, you'll be able to add multiple API endpoints, each with its own TypeScript interface and mock data generation.
                </p>
              </div>

              <div className="flex gap-4 pt-4">
                <Button
                  type="submit"
                  disabled={createProjectMutation.isPending || !formData.name.trim()}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {createProjectMutation.isPending ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Creating Project...
                    </div>
                  ) : (
                    'Create Project'
                  )}
                </Button>
                <Button
                  type="button"
                  onClick={() => router.push('/projects')}
                  className="bg-gray-600 hover:bg-gray-700"
                >
                  Cancel
                </Button>
              </div>
            </form>

            {createProjectMutation.error && (
              <div className="mt-4 rounded-lg bg-red-500/20 border border-red-500/50 p-4">
                <p className="text-red-300 text-sm">
                  Failed to create project: {createProjectMutation.error.message}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}