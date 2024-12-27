'use client';

import { useState } from 'react';
import { Shield, AlertTriangle } from 'lucide-react';

interface SQLConfirmationDialogProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  sqlFunction: string;
  checkType: 'RLS' | 'PITR';
}

export function SQLConfirmationDialog({
  isOpen,
  onConfirm,
  onCancel,
  sqlFunction,
  checkType
}: SQLConfirmationDialogProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 space-y-4">
        <div className="flex items-center gap-2 text-amber-600">
          <AlertTriangle className="h-5 w-5" />
          <h2 className="text-lg font-semibold">Database Function Required</h2>
        </div>

        <p className="text-gray-600">
          To perform the {checkType} check, we need to create a helper function in your database. 
          This function will be used to check your {checkType} settings safely.
        </p>

        <div className="bg-gray-50 p-4 rounded-md">
          <h3 className="text-sm font-medium text-gray-900 mb-2">SQL Function:</h3>
          <pre className="text-xs bg-gray-100 p-3 rounded overflow-x-auto">
            {sqlFunction}
          </pre>
        </div>

        <div className="flex items-start gap-2 bg-blue-50 p-4 rounded">
          <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
          <div className="text-sm text-blue-700">
            <p className="font-medium">Security Note:</p>
            <p>This function is safe and only reads configuration values. It cannot modify your database.</p>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Create Function
          </button>
        </div>
      </div>
    </div>
  );
}