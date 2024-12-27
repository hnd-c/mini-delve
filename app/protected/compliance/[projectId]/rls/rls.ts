import { createClient } from "@supabase/supabase-js";

interface Policy {
  policy_name: string;
  table_name: string;
  schema_name: string;
}

export interface RLSStatus {
  totalTables: number;
  rlsEnabledTables: number;
  percentage: number;
  passing: boolean;
  tables: {
    name: string;
    hasRLS: boolean;
  }[];
}

export async function checkProjectRLSStatus(projectUrl: string, serviceKey: string): Promise<RLSStatus> {
  console.log('Checking RLS status for project:');
  console.log('URL:', projectUrl);
  console.log('Service Key:', serviceKey.substring(0, 8) + '...');
  
  try {
    // Call the existing function
    const response = await fetch(`${projectUrl}/rest/v1/rpc/check_rls_status`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${serviceKey}`,
        'apikey': serviceKey,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to check RLS status: ${response.statusText}`);
    }

    const tables = await response.json();
    console.log('Tables:', tables);

    const totalTables = tables.length;
    const rlsEnabledTables = tables.filter((t: any) => t.has_rls).length;
    const percentage = totalTables > 0 ? (rlsEnabledTables / totalTables) * 100 : 0;

    return {
      totalTables,
      rlsEnabledTables,
      percentage,
      passing: percentage === 100,
      tables: tables.map((t: any) => ({
        name: t.table_name,
        hasRLS: t.has_rls
      }))
    };

  } catch (err) {
    const error = err as Error;
    console.error('Error details:', error);
    throw new Error(`Failed to check RLS status: ${error.message || 'Unknown error'}`);
  }
}