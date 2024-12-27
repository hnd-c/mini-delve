import { createClient } from "@supabase/supabase-js";

export interface PITRStatus {
  enabled: boolean;
  passing: boolean;
  retention_period?: number; // in days
}

export async function checkProjectPITRStatus(projectUrl: string, serviceKey: string): Promise<PITRStatus> {
  console.log('Checking PITR status for project:');
  console.log('URL:', projectUrl);
  console.log('Service Key:', serviceKey.substring(0, 8) + '...');
  
  try {
    const adminClient = createClient(projectUrl, serviceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    // Call our custom SQL function
    const { data, error } = await adminClient.rpc('check_pitr_status');
    
    if (error) {
      console.error('RPC Error:', error);
      throw error;
    }

    console.log('PITR Status Response:', data);

    return {
      enabled: data.enabled && data.wal_level === 'replica',
      passing: data.enabled && data.wal_level === 'replica',
      retention_period: undefined // We can't get this from PostgreSQL settings
    };

  } catch (err) {
    const error = err as Error;
    console.error('Error details:', {
      message: error.message || 'Unknown error',
      name: error.name,
      stack: error.stack
    });
    throw new Error(`Failed to check PITR status: ${error.message || 'Unknown error'}`);
  }
}