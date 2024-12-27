import { createClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";
import { Shield, CheckCircle, XCircle, Wand2 } from "lucide-react";
import { checkProjectMFAStatus, MFAStatus } from "./mfa";
import Link from "next/link";
import { ComplianceHistory } from "@/components/compliance/ComplianceHistory";
import { runMFAComplianceCheck } from "../../actions";
import { Button } from "@/components/ui/button";
import { revalidatePath } from "next/cache";
import { format } from "date-fns";
import { AIFix } from "@/components/compliance/AIFix";
import { generateComplianceFix } from "../../actions";

const Page = async ({ params }: { params: Promise<{ projectId: string }> }) => {
  const projectId = (await params).projectId
  
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

  // Fetch MFA status
  let mfaStatus: MFAStatus | null = null;
  let mfaError: string | null = null;

  try {
    mfaStatus = await checkProjectMFAStatus(
      project.project_url,
      project.service_role_key
    );
  } catch (error) {
    mfaError = (error as Error).message;
  }

  // Fetch compliance history
  const { data: history } = await supabase
    .from('compliance_checks')
    .select('*')
    .eq('project_id', projectId)
    .eq('check_type', 'mfa')
    .order('created_at', { ascending: false })
    .limit(10);

  const hasBeenChecked = history && history.length > 0;

  return (
    <div className="flex-1 w-full flex flex-col gap-8 p-4 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">
          MFA Compliance: {project.project_name}
        </h1>
      </div>

      <div className="flex gap-4 border-b">
        <Link
          href={`/protected/compliance/${projectId}/mfa`}
          className="px-4 py-2 border-b-2 border-primary text-primary"
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
          className="px-4 py-2 text-muted-foreground hover:text-foreground"
        >
          PITR Check
        </Link>
      </div>

      <div className="bg-accent p-4 rounded-lg">
        <p className="text-sm">
          Project URL: {project.project_url}
        </p>
      </div>

      <div className="border rounded-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <Shield className="w-6 h-6 text-green-600" />
          <h2 className="text-xl font-semibold">Multi-Factor Authentication (MFA)</h2>
        </div>

        <p className="text-gray-600 mb-6">
          MFA adds an additional layer of security by requiring users to provide two or more verification factors to gain access.
        </p>

        {!hasBeenChecked ? (
          <div className="bg-gray-50 border rounded-lg p-4">
            <p className="text-gray-600 text-sm">
              Run a compliance check to view MFA status
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {mfaStatus && (
              <div className={mfaStatus.passing 
                ? "bg-green-50 border border-green-200 rounded p-4"
                : "bg-yellow-50 border border-yellow-200 rounded p-4"
              }>
                <div className="flex items-center gap-2 mb-2">
                  {mfaStatus.passing ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : (
                    <XCircle className="w-5 h-5 text-yellow-600" />
                  )}
                  <h3 className={mfaStatus.passing 
                    ? "font-medium text-green-800"
                    : "font-medium text-yellow-800"
                  }>
                    {mfaStatus.passing ? 'Compliant' : 'Not Compliant'}
                  </h3>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-gray-700">
                    Total Users: {mfaStatus.totalUsers}
                  </p>
                  <p className="text-sm text-gray-700">
                    Users with MFA: {mfaStatus.mfaEnabled}
                  </p>
                  <p className="text-sm text-gray-700">
                    MFA Adoption: {mfaStatus.percentage.toFixed(1)}%
                  </p>
                  {mfaStatus && !mfaStatus.passing && (
                    <>
                      <div className="mt-4">
                        <p className="text-sm text-yellow-700 mb-2">
                          Required: MFA should be enabled for all users
                        </p>
                        <AIFix 
                          checkType="mfa"
                          projectId={projectId}
                          details={mfaStatus}
                          generateFix={generateComplianceFix}
                        />
                      </div>
                    </>
                  )}
                </div>
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
          const { projectId } = await params;
          await runMFAComplianceCheck(projectId);
          revalidatePath(`/protected/compliance/${projectId}/mfa`);
        }}>
          <Button type="submit">
            Run Compliance Check
          </Button>
        </form>
      </div>

      <ComplianceHistory 
        history={history || []} 
        checkType="mfa" 
      />
    </div>
  );
}

export default Page