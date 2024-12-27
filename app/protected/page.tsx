import FetchDataSteps from "@/components/tutorial/fetch-data-steps";
import { createClient } from "@/utils/supabase/server";
import { InfoIcon } from "lucide-react";
import { redirect } from "next/navigation";
import ProjectForm from "@/components/protected/project-form";
import ProjectList from "@/components/protected/project-list";

export default async function ProtectedPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/sign-in");
  }

  // Fetch user's projects
  const { data: projects } = await supabase
    .from('project_credentials')
    .select('*')
    .order('created_at', { ascending: false });

  return (
    <div className="flex-1 w-full flex flex-col gap-12">
      <div className="w-full">
        <div className="bg-accent text-sm p-3 px-5 rounded-md text-foreground flex gap-3 items-center">
          <InfoIcon size="16" strokeWidth={2} />
          Upload your Supabase project credentials to get started with checking compliance
        </div>
      </div>
      {/* <div className="flex flex-col gap-2 items-start">
        <h2 className="font-bold text-2xl mb-4">Your user details</h2>
        <pre className="text-xs font-mono p-3 rounded border max-h-32 overflow-auto">
          {JSON.stringify(user, null, 2)}
        </pre>
      </div> */}
      
      <div className="flex flex-col gap-8">
        <ProjectForm />

        <div className="flex flex-col gap-6">
          <h2 className="font-bold text-2xl">Your Projects</h2>
          <ProjectList projects={projects || []} />
        </div>
      </div>
    </div>
  );
}
