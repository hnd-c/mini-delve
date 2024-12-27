'use client';

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";

export default function ProjectForm() {
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const router = useRouter();
  const supabase = createClient();

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
      const { error } = await supabase
        .from('project_credentials')
        .insert([data]);

      if (error) throw error;

      // Reset form and refresh page on success
      (e.target as HTMLFormElement).reset();
      setShowForm(false);
      router.refresh();
    } catch (error) {
      alert('Error saving project: ' + (error as Error).message);
    } finally {
      setLoading(false);
    }
  }

  if (!showForm) {
    return (
      <button
        onClick={() => setShowForm(true)}
        className="flex items-center justify-center gap-2 p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 transition-colors"
      >
        <Plus size={20} />
        <span>Add New Project</span>
      </button>
    );
  }

  return (
    <div className="border rounded-lg p-6 bg-white">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-lg">Add New Project</h3>
        <button
          onClick={() => setShowForm(false)}
          className="text-gray-500 hover:text-gray-700"
        >
          ✕
        </button>
      </div>

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
            minLength={3}
            placeholder="My Supabase Project"
            className="w-full p-2 border rounded"
          />
          <p className="text-sm text-gray-500 mt-1">
            A name to help you identify this project
          </p>
        </div>

        <div>
          <label htmlFor="projectUrl" className="block text-sm font-medium mb-2">
            Project URL
          </label>
          <input
            id="projectUrl"
            name="projectUrl"
            type="text"
            required
            placeholder="https://xxx.supabase.co"
            className="w-full p-2 border rounded"
          />
          <p className="text-sm text-gray-500 mt-1">
            Found in Project Settings → API → Project URL
          </p>
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
            className="w-full p-2 border rounded"
            autoComplete="off"
          />
          <p className="text-sm text-gray-500 mt-1">
            Found in Project Settings → API → service_role key
          </p>
        </div>

        <div className="flex gap-2 justify-end mt-4">
          <button
            type="button"
            onClick={() => setShowForm(false)}
            className="px-4 py-2 border rounded hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="bg-primary text-primary-foreground px-4 py-2 rounded hover:opacity-90 disabled:opacity-50 flex items-center justify-center"
          >
            {loading ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Adding Project...
              </>
            ) : (
              'Add Project'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}