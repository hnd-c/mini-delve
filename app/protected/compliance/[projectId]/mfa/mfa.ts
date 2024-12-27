import { createClient } from "@supabase/supabase-js";

export interface MFAStatus {
  totalUsers: number;
  mfaEnabled: number;
  percentage: number;
  passing: boolean;
}

export async function checkProjectMFAStatus(projectUrl: string, serviceKey: string): Promise<MFAStatus> {
  console.log('Checking MFA status for project:');
  console.log('URL:', projectUrl);
  console.log('Service Key:', serviceKey.substring(0, 8) + '...');
  
  try {
    const adminClient = createClient(projectUrl, serviceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    console.log('Querying users and their factors...');
    
    const { data, error } = await adminClient.auth.admin.listUsers();
    
    if (error) {
      console.error('Admin API error:', error);
      throw error;
    }

    const totalUsers = data.users.length;
    
    // Count users with verified MFA factors
    const mfaEnabled = data.users.filter(user => 
      user.factors && 
      user.factors.some(factor => factor.status === 'verified')
    ).length;

    const percentage = totalUsers > 0 ? (mfaEnabled / totalUsers) * 100 : 0;

    console.log('Query successful:', {
      totalUsers,
      mfaEnabled,
      percentage: percentage.toFixed(1) + '%'
    });

    return {
      totalUsers,
      mfaEnabled,
      percentage,
      passing: percentage >= 80
    };

  } catch (err) {
    const error = err as Error;
    console.error('Error details:', {
      message: error.message || 'Unknown error',
      name: error.name
    });
    throw new Error(`Failed to fetch users: ${error.message || 'Unknown error'}`);
  }
}