import { format } from 'date-fns'

export function fmtTime(iso: string) {
  try { return format(new Date(iso), 'HH:mm') } catch { return '' }
}
