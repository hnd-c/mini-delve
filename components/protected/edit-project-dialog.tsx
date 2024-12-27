'use client';

import { useState } from 'react';
import { Project } from '@/app/protected/types';
import { updateProject } from '@/app/protected/actions';

export default function EditProjectDialog({
  project,
  onClose,
}: {
  project: Project;
  onClose: () => void;
}) {
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      project_name: formData.get('projectName') as string,
      project_url: formData.get('projectUrl') as string,
      service_role_key: formData.get('serviceRoleKey') as string,
    };

    try {
      await updateProject(project.id, data);
      onClose();
    } catch (error) {
      alert('Error updating project');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-background p-6 rounded-lg max-w-md w-full">
        <h3 className="text-lg font-semibold mb-4">Edit Project</h3>
        
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label htmlFor="projectName" className="block text-sm font-medium mb-2">
              Project Name
            </label>
            <input
              id="projectName"
              name="projectName"
              type="text"
              required
              defaultValue={project.project_name}
              className="w-full p-2 border rounded"
            />
          </div>

          <div>
            <label htmlFor="projectUrl" className="block text-sm font-medium mb-2">
              Project URL
            </label>
            <input
              id="projectUrl"
              name="projectUrl"
              type="url"
              required
              defaultValue={project.project_url}
              className="w-full p-2 border rounded"
            />
          </div>

          <div>
            <label htmlFor="serviceRoleKey" className="block text-sm font-medium mb-2">
              Service Role Key
            </label>
            <input
              id="serviceRoleKey"
              name="serviceRoleKey"
              type="password"
              required
              defaultValue={project.service_role_key}
              className="w-full p-2 border rounded"
            />
          </div>

          <div className="flex justify-end gap-2 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="bg-primary text-primary-foreground px-4 py-2 rounded hover:opacity-90 disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}