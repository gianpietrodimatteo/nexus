import { TablePageSkeleton } from "@/components/ui/skeleton"

export default function UsersLoading() {
  return (
    <TablePageSkeleton 
      hasFilters={true}
      columns={7}
      rows={5}
      hasAvatar={true}
    />
  )
}