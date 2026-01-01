/**
 * Date formatting utilities for consistent dd/mm/yyyy format across the app
 */

/**
 * Format a date to dd/mm/yyyy format
 * @param date - Date string, Date object, or timestamp
 * @returns Formatted date string in dd/mm/yyyy format
 */
export function formatDate(date: string | Date | number | null | undefined): string {
  if (!date) return '';
  
  const d = new Date(date);
  if (isNaN(d.getTime())) return String(date);
  
  return d.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
}

/**
 * Format a date with time to dd/mm/yyyy hh:mm format
 * @param date - Date string, Date object, or timestamp
 * @returns Formatted date-time string
 */
export function formatDateTime(date: string | Date | number | null | undefined): string {
  if (!date) return '';
  
  const d = new Date(date);
  if (isNaN(d.getTime())) return String(date);
  
  return d.toLocaleString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

/**
 * Format a date to a human readable format (e.g., "1 Jan 2026")
 * @param date - Date string, Date object, or timestamp
 * @returns Formatted date string
 */
export function formatDateReadable(date: string | Date | number | null | undefined): string {
  if (!date) return '';
  
  const d = new Date(date);
  if (isNaN(d.getTime())) return String(date);
  
  return d.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
}
