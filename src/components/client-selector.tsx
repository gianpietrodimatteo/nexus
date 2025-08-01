'use client'

import * as React from 'react'
import { Check, ChevronsUpDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { trpc } from '@/lib/trpc'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'

interface ClientSelectorProps {
  value?: string
  onValueChange: (value: string | undefined) => void
  placeholder?: string
  className?: string
  disabled?: boolean
}

export function ClientSelector({
  value,
  onValueChange,
  placeholder = 'Select client...',
  className,
  disabled = false,
}: ClientSelectorProps) {
  const [open, setOpen] = React.useState(false)

  // Fetch organizations/clients
  const { data: organizations, isLoading } = trpc.organizations.list.useQuery()

  const selectedOrganization = React.useMemo(() => {
    if (!value || !organizations) return null
    return organizations.find((org) => org.id === value)
  }, [value, organizations])

  const handleSelect = (currentValue: string) => {
    if (currentValue === value) {
      onValueChange(undefined) // Allow deselection
    } else {
      onValueChange(currentValue === '' ? undefined : currentValue)
    }
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn('w-full justify-between', className)}
          disabled={disabled || isLoading}
        >
          {selectedOrganization ? (
            <span className="truncate">{selectedOrganization.name}</span>
          ) : (
            <span className="text-muted-foreground">
              {isLoading ? 'Loading...' : placeholder}
            </span>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command>
          <CommandInput 
            placeholder="Search clients..." 
            className="h-9" 
          />
          <CommandEmpty>No client found.</CommandEmpty>
          <CommandList>
            <CommandGroup>
              {/* All clients option */}
              <CommandItem
                value=""
                onSelect={() => handleSelect('')}
                className="cursor-pointer"
              >
                <Check
                  className={cn(
                    'mr-2 h-4 w-4',
                    !value ? 'opacity-100' : 'opacity-0'
                  )}
                />
                All clients
              </CommandItem>
              
              {/* Individual clients */}
              {organizations?.map((organization) => (
                <CommandItem
                  key={organization.id}
                  value={organization.name}
                  onSelect={() => handleSelect(organization.id)}
                  className="cursor-pointer"
                >
                  <Check
                    className={cn(
                      'mr-2 h-4 w-4',
                      value === organization.id ? 'opacity-100' : 'opacity-0'
                    )}
                  />
                  <div className="flex flex-col">
                    <span className="font-medium">{organization.name}</span>
                    {organization.url && (
                      <span className="text-xs text-muted-foreground">
                        {organization.url}
                      </span>
                    )}
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}