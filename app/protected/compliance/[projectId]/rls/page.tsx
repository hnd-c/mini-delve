import { createClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";
import { Users, CheckCircle, XCircle, Shield, Wand2 } from "lucide-react";
import Link from "next/link";
import { checkProjectRLSStatus } from "./rls";
import { ComplianceHistory } from "@/components/compliance/ComplianceHistory";
import { runRLSComplianceCheck } from "../../actions";
import { Button } from "@/components/ui/button";
import { revalidatePath } from "next/cache";
import { format } from "date-fns";
import { RLSStatus } from "./rls";
import { AIFix } from "@/components/compliance/AIFix";
import { generateComplianceFix } from "../../actions";

interface PageProps {
  params: Promise<{ projectId: string }>;
}

const RLS_SETUP_INSTRUCTIONS = `
-- Run this SQL function in your database to enable RLS checking:

CREATE OR REPLACE FUNCTION check_rls_status()
RETURNS TABLE (
    table_name text,
    has_rls boolean
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  /* This function checks the RLS (Row Level Security) status for all tables in the public schema
   * 
   * Returns:
   *   - table_name: The name of the table
   *   - has_rls: Boolean indicating if RLS is enabled for the table
   */
  SELECT 
      c.relname as table_name,
      c.relrowsecurity as has_rls
  FROM pg_class c
  JOIN pg_namespace n ON n.oid = c.relnamespace
  WHERE n.nspname = 'public'
  AND c.relkind = 'r';
$$;
`;

export default async function Page({ params }: PageProps) {
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

  // Fetch RLS status
  let rlsStatus = null;
  let rlsError = null;

  try {
    rlsStatus = await checkProjectRLSStatus(
      project.project_url,
      project.service_role_key
    );
  } catch (error) {
    rlsError = (error as Error).message;
  }

  const { data: history } = await supabase
    .from('compliance_checks')
    .select('*')
    .eq('project_id', projectId)
    .eq('check_type', 'rls')
    .order('created_at', { ascending: false })
    .limit(10);

  const hasBeenChecked = history && history.length > 0;

  return (
    <div className="flex-1 w-full flex flex-col gap-8 p-4 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">
          RLS Compliance: {project.project_name}
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
          className="px-4 py-2 border-b-2 border-primary text-primary"
        >
          RLS Check
        </Link>
        <Link
          href={`/protected/compliance/${projectId}/pitr`}
          className="px-4 py-2 text-muted-foreground hover:text-foreground"
        >
          PITR Check
        </Link>
      </div>

      <div className="border rounded-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <Shield className="w-6 h-6 text-green-600" />
          <h2 className="text-xl font-semibold">Row Level Security (RLS)</h2>
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
              To enable RLS checking, execute this function in your database:
            </p>
            <pre className="bg-gray-50 border rounded-md p-4 text-sm overflow-x-auto font-mono">
              {RLS_SETUP_INSTRUCTIONS}
            </pre>
          </div>
        </details>

        <p className="text-gray-600 mb-6">
          RLS ensures that users can only access their own data by enforcing access policies at the database level.
        </p>

        {!hasBeenChecked ? (
          <div className="bg-gray-50 border rounded-lg p-4">
            <p className="text-gray-600 text-sm">
              Run a compliance check to view RLS status
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {rlsStatus && (
              <div className={`bg-${rlsStatus.passing ? 'green' : 'yellow'}-50 border border-${rlsStatus.passing ? 'green' : 'yellow'}-200 rounded p-4`}>
                <div className="flex items-center gap-2 mb-2">
                  {rlsStatus.passing ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : (
                    <XCircle className="w-5 h-5 text-yellow-600" />
                  )}
                  <h3 className={`font-medium text-${rlsStatus.passing ? 'green' : 'yellow'}-800`}>
                    {rlsStatus.passing ? 'All tables have RLS enabled' : 'Some tables missing RLS'}
                  </h3>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-gray-700">
                    Total Tables: {rlsStatus.totalTables}
                  </p>
                  <p className="text-sm text-gray-700">
                    Tables with RLS: {rlsStatus.rlsEnabledTables}
                  </p>
                  <p className="text-sm text-gray-700">
                    RLS Coverage: {rlsStatus.percentage.toFixed(1)}%
                  </p>
                  
                  {/* Table Details */}
                  <div className="mt-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Table Details:</h4>
                    <div className="bg-white rounded border">
                      {rlsStatus.tables.map((table, i) => (
                        <div 
                          key={table.name}
                          className={`flex justify-between items-center p-2 text-sm ${
                            i !== rlsStatus.tables.length - 1 ? 'border-b' : ''
                          }`}
                        >
                          <span>{table.name}</span>
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            table.hasRLS 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {table.hasRLS ? 'RLS Enabled' : 'RLS Disabled'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
            {rlsStatus && !rlsStatus.passing && (
              <div className="mt-4">
                <p className="text-sm text-yellow-700 mb-2">
                  Required: All tables should have RLS enabled
                </p>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <Wand2 className="w-4 h-4" />
                  Fix with AI
                </Button>
              </div>
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
          await runRLSComplianceCheck((await params).projectId);
          revalidatePath(`/protected/compliance/${(await params).projectId}/rls`);
        }}>
          <Button type="submit">
            Run Compliance Check
          </Button>
        </form>
      </div>

      <ComplianceHistory 
        history={history || []} 
        checkType="rls" 
      />
    </div>
  );
}