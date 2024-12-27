'use client';

import { Project } from '@/app/protected/types';
import ProjectCard from './project-card';

export default function ProjectList({ projects }: { projects: Project[] }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {projects.map((project) => (
        <ProjectCard key={project.id} project={project} />
      ))}
      {projects.length === 0 && (
        <p className="text-gray-500 col-span-full">No projects added yet.</p>
      )}
    </div>
  );
}