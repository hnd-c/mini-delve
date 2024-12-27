'use server'

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function deleteProject(projectId: string) {
  const supabase = await createClient();
  
  const { error } = await supabase
    .from('project_credentials')
    .delete()
    .eq('id', projectId);

  if (error) throw new Error(error.message);
  
  revalidatePath('/protected');
}

export async function updateProject(projectId: string, data: {
  project_name: string;
  project_url: string;
  service_role_key: string;
}) {
  const supabase = await createClient();
  
  const { error } = await supabase
    .from('project_credentials')
    .update(data)
    .eq('id', projectId);

  if (error) throw new Error(error.message);
  
  revalidatePath('/protected');
}