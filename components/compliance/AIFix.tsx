'use client';

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Wand2 } from "lucide-react";

interface AIFixProps {
  checkType: 'mfa' | 'rls' | 'pitr';
  projectId: string;
  details: any;
  generateFix: (projectId: string, checkType: 'mfa' | 'rls' | 'pitr', details: any) => Promise<string>;
}

export function AIFix({ checkType, projectId, details, generateFix }: AIFixProps) {
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerateFix = async () => {
    setLoading(true);
    setError(null);
    try {
      const fix = await generateFix(projectId, checkType, details);
      setAiResponse(fix);
      if (fix.includes('error') || fix.includes('failed')) {
        setError(fix);
      }
    } catch (error) {
      console.error('Error:', error);
      setError('Failed to generate fix. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button 
        onClick={handleGenerateFix}
        variant="outline" 
        size="sm"
        className="flex items-center gap-2"
        disabled={loading}
      >
        <Wand2 className="w-4 h-4" />
        {loading ? 'Generating...' : 'Fix with AI'}
      </Button>

      <details className="mt-4 border rounded-lg">
        <summary className="flex items-center gap-2 p-4 cursor-pointer hover:bg-gray-50">
          <span className="inline-block w-4 h-4 text-gray-600">▶</span>
          <span className="font-medium text-gray-700">AI Suggested Fix</span>
        </summary>
        <div className="p-4 border-t bg-gray-50">
          <pre className={`whitespace-pre-wrap text-sm font-mono ${error ? 'text-red-600' : ''}`}>
            {error || aiResponse || 'Click "Fix with AI" to get suggestions'}
          </pre>
        </div>
      </details>
    </>
  );
}