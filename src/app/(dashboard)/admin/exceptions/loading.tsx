import { TablePageSkeleton } from '@/components/ui/skeleton'

export default function ExceptionsLoading() {
  return <TablePageSkeleton hasFilters={true} columns={9} rows={8} />
}