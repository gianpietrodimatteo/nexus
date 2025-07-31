import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface UserFiltersProps {
  value: 'all' | 'ADMIN' | 'SE'
  onValueChange: (value: 'all' | 'ADMIN' | 'SE') => void
}

export function UserFilters({ value, onValueChange }: UserFiltersProps) {
  return (
    <div className="px-6 py-6 border-b border-gray-100">
      <Tabs value={value} onValueChange={onValueChange}>
        <TabsList className="bg-transparent p-0 gap-2">
          <TabsTrigger 
            value="all"
            className="data-[state=active]:bg-black data-[state=active]:text-white bg-transparent border border-[#DBDBDB] text-[#1F2937] rounded-[24px] px-4 py-3 text-base font-normal"
          >
            All Users
          </TabsTrigger>
          <TabsTrigger 
            value="ADMIN"
            className="data-[state=active]:bg-black data-[state=active]:text-white bg-transparent border border-[#DBDBDB] text-[#1F2937] rounded-[24px] px-4 py-3 text-base font-normal"
          >
            Admin Users
          </TabsTrigger>
          <TabsTrigger 
            value="SE"
            className="data-[state=active]:bg-black data-[state=active]:text-white bg-transparent border border-[#DBDBDB] text-[#1F2937] rounded-[24px] px-4 py-3 text-base font-normal"
          >
            SE Users
          </TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  )
}