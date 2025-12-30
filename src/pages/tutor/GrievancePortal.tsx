import React from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, Construction } from 'lucide-react';

export default function GrievancePortal() {
  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center min-h-[60vh]"
      >
        <div className="text-center space-y-4 max-w-md">
          <div className="w-20 h-20 mx-auto rounded-full bg-destructive/10 flex items-center justify-center">
            <AlertCircle className="w-10 h-10 text-destructive" />
          </div>
          <h1 className="text-3xl font-bold">Grievance Portal</h1>
          <p className="text-muted-foreground">
            Report issues and concerns securely through our grievance redressal system.
          </p>
          <div className="flex items-center justify-center gap-2 text-warning">
            <Construction className="w-5 h-5" />
            <span className="font-semibold">Coming Soon</span>
          </div>
          <p className="text-sm text-muted-foreground">
            This portal is currently under development. You'll be notified when it becomes available.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
