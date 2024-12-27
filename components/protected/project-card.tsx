'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Project } from '@/app/protected/types';
import { Pencil, Trash2, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { deleteProject } from '@/app/protected/actions';
import EditProjectDialog from './edit-project-dialog';

export default function ProjectCard({ project }: { project: Project }) {
  const [showKey, setShowKey] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this project?')) return;
    
    setIsDeleting(true);
    try {
      await deleteProject(project.id);
    } catch (error) {
      alert('Error deleting project');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <div className="p-4 border rounded-lg shadow-sm hover:shadow-md transition-shadow flex flex-col">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-semibold">{project.project_name}</h3>
          <div className="flex gap-2">
            <button
              onClick={() => setIsEditing(true)}
              className="p-1 hover:text-blue-600"
              title="Edit"
            >
              <Pencil size={16} />
            </button>
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="p-1 hover:text-red-600 disabled:opacity-50"
              title="Delete"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>
        
        <p className="text-sm text-gray-600 break-all">{project.project_url}</p>
        
        <div className="mt-2 flex items-center gap-2">
          <div className="flex-1">
            <p className="text-sm font-medium">Service Role Key:</p>
            <p className="text-sm font-mono break-all">
              {showKey ? project.service_role_key : '••••••••••••••••'}
            </p>
          </div>
          <button
            onClick={() => setShowKey(!showKey)}
            className="p-1 hover:text-blue-600"
          >
            {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>

        <p className="text-xs text-gray-400 mt-2">
          Added on: {new Date(project.created_at).toLocaleDateString()}
        </p>

        <div className="flex-grow mt-4"></div>

        <Link
          href={`/protected/compliance/${project.id}/mfa`}
          className="mt-4 w-full bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded flex items-center justify-center gap-2 transition-colors"
        >
          <ShieldCheck size={16} />
          Check Compliance
        </Link>
      </div>

      {isEditing && (
        <EditProjectDialog
          project={project}
          onClose={() => setIsEditing(false)}
        />
      )}
    </>
  );
}