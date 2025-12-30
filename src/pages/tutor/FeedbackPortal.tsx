import React from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, Construction } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function FeedbackPortal() {
  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center min-h-[60vh]"
      >
        <div className="text-center space-y-4 max-w-md">
          <div className="w-20 h-20 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
            <MessageSquare className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-3xl font-bold">Feedback Portal</h1>
          <p className="text-muted-foreground">
            Share your valuable feedback to help us improve the institution.
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
