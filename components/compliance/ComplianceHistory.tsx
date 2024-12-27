import { format } from "date-fns";
import { CheckCircle, XCircle } from "lucide-react";
import { ComplianceCheck, ComplianceCheckType } from "@/app/protected/compliance/type";

interface ComplianceHistoryProps {
  history: ComplianceCheck[];
  checkType: ComplianceCheckType;
}

function formatDetails(check: ComplianceCheck): string {
  switch (check.check_type) {
    case 'rls':
      return `${check.details.rlsEnabledTables}/${check.details.totalTables} tables have RLS (${check.details.percentage.toFixed(1)}%)`;
    case 'mfa':
      return `${check.details.mfaEnabledUsers}/${check.details.totalUsers} users have MFA (${check.details.percentage.toFixed(1)}%)`;
    case 'pitr':
      return `PITR ${check.details.isEnabled ? 'enabled' : 'disabled'}, ${check.details.retentionPeriod} days retention`;
    default:
      return JSON.stringify(check.details);
  }
}

export function ComplianceHistory({ history, checkType }: ComplianceHistoryProps) {
  return (
    <div className="mt-8 border rounded-lg">
      <h3 className="text-lg font-medium p-4 border-b">
        Recent Compliance Checks
      </h3>
      <div className="divide-y">
        {history.length === 0 ? (
          <div className="p-4 text-gray-500">
            No compliance checks recorded yet.
          </div>
        ) : (
          history.map((check) => (
            <div key={check.id} className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                {check.status ? (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-600" />
                )}
                <div>
                  <div className="font-medium">
                    {check.status ? 'Passed' : 'Failed'}
                  </div>
                  <div className="text-sm text-gray-500">
                    {formatDetails(check)}
                  </div>
                </div>
              </div>
              <div className="text-sm text-gray-500">
                {format(new Date(check.created_at), 'MMM d, yyyy HH:mm')}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}