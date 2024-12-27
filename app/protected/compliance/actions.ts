'use server'

import { createClient } from "@/utils/supabase/server";
import { ComplianceCheckType } from "@/app/protected/compliance/type";
import { checkProjectMFAStatus } from "./[projectId]/mfa/mfa";
import { checkProjectRLSStatus } from "./[projectId]/rls/rls";
import { checkProjectPITRStatus } from "./[projectId]/pitr/pitr";
import { PITRStatus } from "./type";

interface Table {
  name: string;
  hasRLS: boolean;
}

export async function recordComplianceCheck(
  projectId: string,
  checkType: ComplianceCheckType,
  status: boolean,
  details: any
) {
  const supabase = await createClient();
  
  const { error } = await supabase
    .from('compliance_checks')
    .insert({
      project_id: projectId,
      check_type: checkType,
      status,
      details,
      created_by: (await supabase.auth.getUser()).data.user?.id
    });

  if (error) throw new Error(`Failed to record compliance check: ${error.message}`);
}

export async function runMFAComplianceCheck(projectId: string) {
  const supabase = await createClient();
  
  // Get project details
  const { data: project } = await supabase
    .from('project_credentials')
    .select('*')
    .eq('id', projectId)
    .single();

  if (!project) throw new Error('Project not found');

  // Run MFA check
  const mfaStatus = await checkProjectMFAStatus(
    project.project_url,
    project.service_role_key
  );

  // Record the check
  await recordComplianceCheck(
    projectId,
    'mfa',
    mfaStatus.passing,
    {
      totalUsers: mfaStatus.totalUsers,
      mfaEnabledUsers: mfaStatus.mfaEnabled,
      percentage: mfaStatus.percentage
    }
  );

  return mfaStatus;
}

export async function runRLSComplianceCheck(projectId: string) {
  const supabase = await createClient();
  const { data: project } = await supabase
    .from('project_credentials')
    .select('*')
    .eq('id', projectId)
    .single();

  if (!project) throw new Error('Project not found');

  const rlsStatus = await checkProjectRLSStatus(
    project.project_url,
    project.service_role_key
  );

  await recordComplianceCheck(
    projectId,
    'rls',
    rlsStatus.passing,
    {
      totalTables: rlsStatus.totalTables,
      rlsEnabledTables: rlsStatus.rlsEnabledTables,
      percentage: rlsStatus.percentage,
      tables: rlsStatus.tables
    }
  );

  return rlsStatus;
}

export async function runPITRComplianceCheck(projectId: string) {
  const supabase = await createClient();
  const { data: project } = await supabase
    .from('project_credentials')
    .select('*')
    .eq('id', projectId)
    .single();

  if (!project) throw new Error('Project not found');

  const pitrStatus: PITRStatus = await checkProjectPITRStatus(
    project.project_url,
    project.service_role_key
  );

  await recordComplianceCheck(
    projectId,
    'pitr',
    pitrStatus.enabled,
    {
      enabled: pitrStatus.enabled,
      wal_level: pitrStatus.wal_level,
      archive_command: pitrStatus.archive_command
    }
  );

  return pitrStatus;
}

export async function generateComplianceFix(projectId: string, checkType: 'mfa' | 'rls' | 'pitr', details: any) {
  'use server'
  
  try {
    const supabase = await createClient();
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      return 'Authentication required. Please sign in.';
    }

    // Make sure we have a valid URL
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    
    const response = await fetch(`${baseUrl}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`
      },
      body: JSON.stringify({ messages: [
        {
          role: "system",
          content: "You are a database security expert helping to fix compliance issues in a Supabase PostgreSQL database."
        },
        {
          role: "user",
          content: generatePrompt(checkType, details)
        }
      ]})
    });

    if (!response.ok) {
      console.error('Generate fix error:', await response.text());
      return `Failed to generate fix (${response.status}). Please try again.`;
    }

    const data = await response.json();
    return data.message;
  } catch (error) {
    console.error('Error generating fix:', error);
    return 'An error occurred while generating the fix. Please try again.';
  }
}

function generatePrompt(checkType: 'mfa' | 'rls' | 'pitr', details: any): string {
  if (checkType === 'mfa') {
    return `I need help enforcing Multi-Factor Authentication (MFA) for my Supabase users. Here are the current details:

Total Users: ${details.totalUsers}
Users with MFA: ${details.mfaEnabledUsers}
MFA Coverage: ${details.percentage.toFixed(1)}%

Please provide:
1. Steps to enforce MFA for all users
2. Code examples for implementing MFA in the application
3. Best practices for MFA implementation`;
  }

  if (checkType === 'rls') {
    return `I need help enabling Row Level Security (RLS) for my database tables. Here are the current details:

Total Tables: ${details.totalTables}
Tables with RLS: ${details.rlsEnabledTables}
RLS Coverage: ${details.percentage.toFixed(1)}%

Tables missing RLS:
${details.tables
  .filter((t: Table) => !t.hasRLS)
  .map((t: Table) => `- ${t.name}`)
  .join('\n')}

Please provide SQL commands to:
1. Enable RLS for these tables
2. Create basic security policies
3. Explain each step`;
  }

  if (checkType === 'pitr') {
    return `I need help enabling Point-in-Time Recovery (PITR) for my database. Here are the current details:

PITR Status: ${details.enabled ? 'Enabled' : 'Disabled'}
WAL Level: ${details.wal_level}
Archive Command: ${details.archive_command || 'Not configured'}

Please provide:
1. Steps to enable PITR
2. Recommended retention period
3. Any additional configuration needed
4. Best practices for backup strategy`;
  }

  return '';
}