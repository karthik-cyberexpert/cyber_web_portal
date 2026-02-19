import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  variant?: 'primary' | 'accent' | 'success' | 'warning' | 'info';
  className?: string;
  delay?: number;
  onClick?: () => void;
}

const variantStyles = {
  primary: 'bg-gradient-primary text-white',
  accent: 'bg-gradient-accent text-white',
  success: 'bg-gradient-success text-white',
  warning: 'bg-gradient-warm text-white',
  info: 'bg-gradient-to-br from-info to-primary text-white',
};

export function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  variant = 'primary',
  className,
  delay = 0,
  onClick,
}: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      onClick={onClick}
      className={cn(
        'stat-card cursor-pointer',
        variantStyles[variant],
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm opacity-80 mb-1">{title}</p>
          <p className="text-2xl sm:text-3xl font-bold">{value}</p>
          {subtitle && (
            <p className="text-sm opacity-70 mt-1">{subtitle}</p>
          )}
          {trend && (
            <div className="flex items-center gap-1 mt-2">
              <span className={cn(
                'text-xs px-2 py-0.5 rounded-full',
                trend.isPositive ? 'bg-white/20' : 'bg-white/20'
              )}>
                {trend.isPositive ? '+' : ''}{trend.value}%
              </span>
              <span className="text-xs opacity-70">vs last month</span>
            </div>
          )}
        </div>
        <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </motion.div>
  );
}

interface GlassStatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  iconColor?: string;
  className?: string;
  delay?: number;
}

export function GlassStatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  iconColor = 'text-primary',
  className,
  delay = 0,
}: GlassStatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className={cn(
        'glass-card rounded-2xl p-6 hover:shadow-card-hover transition-all duration-300',
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground mb-1">{title}</p>
          <p className="text-2xl sm:text-3xl font-bold text-foreground">{value}</p>
          {subtitle && (
            <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
          )}
        </div>
        <div className={cn(
          'w-12 h-12 rounded-xl flex items-center justify-center',
          'bg-primary/10'
        )}>
          <Icon className={cn('w-6 h-6', iconColor)} />
        </div>
      </div>
    </motion.div>
  );
}

interface ProgressCardProps {
  title: string;
  value: number;
  max?: number;
  label?: string;
  color?: 'primary' | 'accent' | 'success' | 'warning';
  className?: string;
  delay?: number;
}

const progressColors = {
  primary: 'bg-primary',
  accent: 'bg-accent',
  success: 'bg-success',
  warning: 'bg-warning',
};

export function ProgressCard({
  title,
  value,
  max = 100,
  label,
  color = 'primary',
  className,
  delay = 0,
}: ProgressCardProps) {
  const percentage = (value / max) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className={cn(
        'glass-card rounded-2xl p-6',
        className
      )}
    >
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-medium text-foreground">{title}</p>
        <p className="text-sm text-muted-foreground">
          {label || `${value}/${max}`}
        </p>
      </div>
      <div className="h-3 bg-muted rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ delay: delay + 0.2, duration: 0.8, ease: 'easeOut' }}
          className={cn('h-full rounded-full', progressColors[color])}
        />
      </div>
      <p className="text-2xl font-bold mt-3">{percentage.toFixed(0)}%</p>
    </motion.div>
  );
}
