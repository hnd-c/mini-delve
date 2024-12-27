import { createClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";
import { Clock, CheckCircle, XCircle, Shield, Wand2 } from "lucide-react";
import Link from "next/link";
import { checkProjectPITRStatus } from "./pitr";
import { ComplianceHistory } from "@/components/compliance/ComplianceHistory";
import { runPITRComplianceCheck, generateComplianceFix } from "../../actions";
import { Button } from "@/components/ui/button";
import { revalidatePath } from "next/cache";
import { format } from "date-fns";
import { PITRStatus } from './pitr';
import { AIFix } from "@/components/compliance/AIFix";

interface PageProps {
  params: { projectId: string };
}

const PITR_SETUP_INSTRUCTIONS = `
-- Run this SQL function in your database to enable PITR status checking:

CREATE OR REPLACE FUNCTION check_pitr_status()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    result json;
BEGIN
    /* This function checks Point-in-Time Recovery (PITR) configuration status
     * 
     * Returns JSON with:
     *   - enabled: Boolean indicating if archive_mode is enabled
     *   - wal_level: Current WAL level setting
     *   - archive_command: Current archive command configuration
     */
    SELECT json_build_object(
        'enabled', COALESCE(
            (SELECT setting::bool 
             FROM pg_settings 
             WHERE name = 'archive_mode'), 
            false
        ),
        'wal_level', (
            SELECT setting 
            FROM pg_settings 
            WHERE name = 'wal_level'
        ),
        'archive_command', (
            SELECT setting 
            FROM pg_settings 
            WHERE name = 'archive_command'
        )
    ) INTO result;
    
    RETURN result;
END;
$$;`;

export default async function Page({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params;
  const supabase = await createClient();

  const { data: project } = await supabase
    .from('project_credentials')
    .select('*')
    .eq('id', projectId)
    .single();

  if (!project) {
    notFound();
  }

  const { data: history } = await supabase
    .from('compliance_checks')
    .select('*')
    .eq('project_id', projectId)
    .eq('check_type', 'pitr')
    .order('created_at', { ascending: false })
    .limit(10);

  const hasBeenChecked = history && history.length > 0;
  const pitrStatus: PITRStatus | null = hasBeenChecked && history[0]?.details 
    ? {
        enabled: history[0].details.enabled,
        passing: history[0].details.enabled,
        retention_period: history[0].details.retention_period
      }
    : null;

  console.log('PITR Debug:', {
    hasBeenChecked,
    pitrStatus,
    history: history?.[0]?.details,
    rawHistory: history?.[0]
  });

  return (
    <div className="flex-1 w-full flex flex-col gap-8 p-4 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">
          PITR Compliance: {project.project_name}
        </h1>
      </div>

      {/* Navigation tabs */}
      <div className="flex gap-4 border-b">
        <Link
          href={`/protected/compliance/${projectId}/mfa`}
          className="px-4 py-2 text-muted-foreground hover:text-foreground"
        >
          MFA Check
        </Link>
        <Link
          href={`/protected/compliance/${projectId}/rls`}
          className="px-4 py-2 text-muted-foreground hover:text-foreground"
        >
          RLS Check
        </Link>
        <Link
          href={`/protected/compliance/${projectId}/pitr`}
          className="px-4 py-2 border-b-2 border-primary text-primary"
        >
          PITR Check
        </Link>
      </div>

      <div className="border rounded-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <Shield className="w-6 h-6 text-green-600" />
          <h2 className="text-xl font-semibold">Point-in-Time Recovery (PITR)</h2>
        </div>

        {/* Setup instructions */}
        <details className="mb-6 border-b pb-4">
          <summary className="flex items-center gap-2 cursor-pointer group">
            <span className="inline-block w-4 h-4 text-gray-600 group-hover:text-gray-800">▶</span>
            <span className="text-red-600 font-medium">Setup Required</span>
            <span className="text-sm text-gray-600">- Click to view instructions</span>
          </summary>
          <div className="mt-4 pl-6">
            <p className="text-sm text-gray-700 mb-3">
              To enable PITR checking, execute this function in your database:
            </p>
            <pre className="bg-gray-50 border rounded-md p-4 text-sm overflow-x-auto font-mono">
              {PITR_SETUP_INSTRUCTIONS}
            </pre>
          </div>
        </details>

        <p className="text-gray-600 mb-6">
          PITR allows you to restore your database to any point in time, protecting against accidental data loss and corruption.
        </p>

        {!hasBeenChecked ? (
          <div className="bg-gray-50 border rounded-lg p-4">
            <p className="text-gray-600 text-sm">
              Run a compliance check to view PITR status
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className={`bg-${pitrStatus?.enabled ? 'green' : 'yellow'}-50 border border-${pitrStatus?.enabled ? 'green' : 'yellow'}-200 rounded p-4`}>
              <div className="flex items-center gap-2 mb-2">
                {pitrStatus?.enabled ? (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                ) : (
                  <XCircle className="w-5 h-5 text-yellow-600" />
                )}
                <h3 className={`font-medium text-${pitrStatus?.enabled ? 'green' : 'yellow'}-800`}>
                  PITR is {pitrStatus?.enabled ? 'Enabled' : 'Disabled'}
                </h3>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-gray-700">
                  Retention Period: {pitrStatus?.retention_period ?? 'undefined'} days
                </p>
              </div>
            </div>
            
            {pitrStatus && !pitrStatus.enabled && (
              <>
                <div className="mt-4">
                  <p className="text-sm text-yellow-700 mb-2">
                    Required: PITR should be enabled for production databases
                  </p>
                  <AIFix 
                    checkType="pitr"
                    projectId={projectId}
                    details={pitrStatus}
                    generateFix={generateComplianceFix}
                  />
                </div>
              </>
            )}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between border-t pt-4">
        <div>
          <span className="text-sm text-gray-500">Last checked: </span>
          <span className="text-base font-medium">
            {history?.[0] ? format(new Date(history[0].created_at), 'MMM d, yyyy HH:mm') : 'Never'}
          </span>
        </div>
        <form action={async () => {
          'use server'
          const { projectId } = await params;
          await runPITRComplianceCheck(projectId);
          revalidatePath(`/protected/compliance/${projectId}/pitr`);
        }}>
          <Button type="submit">
            Run Compliance Check
          </Button>
        </form>
      </div>

      <ComplianceHistory 
        history={history || []} 
        checkType="pitr" 
      />
    </div>
  );
}