"use client";

import { useState } from "react";
import { Dialog } from "@/components/ui/dialog";

interface ComplianceCheckDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  type: "PITR" | "TLS";
}

export default function ComplianceCheckDialog({
  isOpen,
  onClose,
  onConfirm,
  type,
}: ComplianceCheckDialogProps) {
  const command = type === "PITR" 
    ? "CREATE OR REPLACE FUNCTION check_pitr_status()"
    : "CREATE OR REPLACE FUNCTION check_tls_status()";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
        <div className="bg-white p-6 rounded-lg max-w-md w-full">
          <h3 className="text-lg font-semibold mb-4">Run SQL Function First</h3>
          <p className="mb-4">
            Before checking {type} compliance, please ensure you've run the following SQL command in your database:
          </p>
          <pre className="bg-gray-100 p-3 rounded text-sm mb-4 overflow-x-auto">
            {command}
          </pre>
          <div className="flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                onConfirm();
                onClose();
              }}
              className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded"
            >
              I've Run the Command
            </button>
          </div>
        </div>
      </div>
    </Dialog>
  );
}