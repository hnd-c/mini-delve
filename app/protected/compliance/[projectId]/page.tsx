import { createClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";
import { Shield, Users, Clock } from "lucide-react";

export default async function Page({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params
  const supabase = await createClient();

  // Fetch the project details
  const { data: project } = await supabase
    .from('project_credentials')
    .select('*')
    .eq('id', projectId)
    .single();

  if (!project) {
    notFound();
  }

  return (
    <div className="flex-1 w-full flex flex-col gap-8 p-4 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">
          Compliance Check: {project.project_name}
        </h1>
      </div>

      <div className="bg-accent p-4 rounded-lg">
        <p className="text-sm">
          Project URL: {project.project_url}
        </p>
      </div>

      <div className="grid gap-6">
        {/* MFA Section */}
        <div className="border rounded-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-semibold">Multi-Factor Authentication (MFA)</h2>
          </div>
          <div className="space-y-4">
            <p className="text-gray-600">
              MFA adds an additional layer of security by requiring users to provide two or more verification factors to gain access.
            </p>
            <div className="bg-yellow-50 border border-yellow-200 rounded p-4">
              <h3 className="font-medium text-yellow-800 mb-2">Checking Required:</h3>
              <ul className="list-disc list-inside text-sm text-yellow-700 space-y-1">
                <li>Verify if MFA is enabled for authentication</li>
                <li>Check MFA enforcement policies</li>
                <li>Review MFA provider settings</li>
              </ul>
            </div>
            <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
              Run MFA Check
            </button>
          </div>
        </div>

        {/* RLS Section */}
        <div className="border rounded-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <Users className="w-6 h-6 text-green-600" />
            <h2 className="text-xl font-semibold">Row Level Security (RLS)</h2>
          </div>
          <div className="space-y-4">
            <p className="text-gray-600">
              RLS ensures that users can only access their own data by enforcing access policies at the database level.
            </p>
            <div className="bg-yellow-50 border border-yellow-200 rounded p-4">
              <h3 className="font-medium text-yellow-800 mb-2">Checking Required:</h3>
              <ul className="list-disc list-inside text-sm text-yellow-700 space-y-1">
                <li>Verify RLS is enabled on all tables</li>
                <li>Check for proper policy definitions</li>
                <li>Analyze policy effectiveness</li>
              </ul>
            </div>
            <button className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
              Run RLS Check
            </button>
          </div>
        </div>

        {/* PITR Section */}
        <div className="border rounded-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <Clock className="w-6 h-6 text-purple-600" />
            <h2 className="text-xl font-semibold">Point in Time Recovery (PITR)</h2>
          </div>
          <div className="space-y-4">
            <p className="text-gray-600">
              PITR allows you to restore your database to any point in time, protecting against accidental data loss and corruption.
            </p>
            <div className="bg-yellow-50 border border-yellow-200 rounded p-4">
              <h3 className="font-medium text-yellow-800 mb-2">Checking Required:</h3>
              <ul className="list-disc list-inside text-sm text-yellow-700 space-y-1">
                <li>Verify PITR is enabled</li>
                <li>Check backup retention period</li>
                <li>Review recovery settings</li>
              </ul>
            </div>
            <button className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700">
              Run PITR Check
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}