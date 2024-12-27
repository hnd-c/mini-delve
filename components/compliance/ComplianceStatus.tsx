import { Shield, CheckCircle, XCircle } from "lucide-react";
import { format } from 'date-fns';

interface ComplianceStatusProps {
  type: 'rls' | 'mfa' | 'pitr';
  status: boolean | null;
  error?: string | null;
  details: any;
}

const typeConfig = {
  rls: {
    title: 'Row Level Security (RLS)',
    description: 'RLS ensures that users can only access their own data by enforcing access policies at the database level.',
    icon: Shield
  },
  mfa: {
    title: 'Multi-Factor Authentication (MFA)',
    description: 'MFA adds an additional layer of security by requiring users to verify their identity using multiple methods.',
    icon: Shield
  },
  pitr: {
    title: 'Point in Time Recovery (PITR)',
    description: 'PITR enables database restoration to any point in time within the retention period.',
    icon: Shield
  }
};

export function ComplianceStatus({ type, status, error, details }: ComplianceStatusProps) {
  const config = typeConfig[type];

  return (
    <div className="border rounded-lg p-6">
      <div className="flex items-center gap-3 mb-4">
        <config.icon className="w-6 h-6 text-green-600" />
        <h2 className="text-xl font-semibold">{config.title}</h2>
      </div>
      <div className="space-y-4">
        <p className="text-gray-600">{config.description}</p>
        
        {error ? (
          <div className="bg-red-50 border border-red-200 rounded p-4">
            <h3 className="font-medium text-red-800 mb-2">Error checking status:</h3>
            <p className="text-sm text-red-700">{error}</p>
          </div>
        ) : status !== null && (
          <div className={`bg-${status ? 'green' : 'yellow'}-50 border border-${status ? 'green' : 'yellow'}-200 rounded p-4`}>
            <div className="flex items-center gap-2 mb-2">
              {status ? (
                <CheckCircle className="w-5 h-5 text-green-600" />
              ) : (
                <XCircle className="w-5 h-5 text-yellow-600" />
              )}
              <h3 className={`font-medium text-${status ? 'green' : 'yellow'}-800`}>
                {type === 'rls' && `${details.percentage.toFixed(1)}% of tables have RLS enabled`}
                {type === 'mfa' && `${details.percentage.toFixed(1)}% of users have MFA enabled`}
                {type === 'pitr' && (details.isEnabled ? 'PITR is enabled' : 'PITR is disabled')}
              </h3>
            </div>
            <div className="space-y-2">
              {type === 'rls' && (
                <>
                  <p className="text-sm text-gray-700">
                    Total Tables: {details.totalTables}
                  </p>
                  <p className="text-sm text-gray-700">
                    Tables with RLS: {details.rlsEnabledTables}
                  </p>
                </>
              )}
              {type === 'mfa' && (
                <>
                  <p className="text-sm text-gray-700">
                    Total Users: {details.totalUsers}
                  </p>
                  <p className="text-sm text-gray-700">
                    Users with MFA: {details.mfaEnabledUsers}
                  </p>
                </>
              )}
              {type === 'pitr' && (
                <>
                  <p className="text-sm text-gray-700">
                    Retention Period: {details.retentionPeriod} days
                  </p>
                  <p className="text-sm text-gray-700">
                    Last Backup: {format(new Date(details.lastBackupTime), 'PPpp')}
                  </p>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}