import * as React from "react"
import { cn } from "../../lib/utils"

export const Command = ({ children, className }: { children: React.ReactNode; className?: string }) => {
  return <div className={cn("flex flex-col overflow-hidden", className)}>{children}</div>
}

export const CommandInput = ({ placeholder }: { placeholder?: string }) => {
  return (
    <input
      placeholder={placeholder}
      className="flex h-9 w-full rounded-md border border-input bg-transparent py-3 px-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
    />
  )
}

export const CommandEmpty = ({ children }: { children: React.ReactNode }) => {
  return <div className="py-6 text-center text-sm">{children}</div>
}

export const CommandGroup = ({ children }: { children: React.ReactNode }) => {
  return <div className="overflow-hidden p-1 text-foreground">{children}</div>
}

export const CommandItem = ({
  children,
  onSelect,
  value,
}: {
  children: React.ReactNode
  onSelect?: (value: string) => void
  value: string
}) => {
  return (
    <div
      onClick={() => onSelect?.(value)}
      className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 hover:bg-accent hover:text-accent-foreground"
    >
      {children}
    </div>
  )
}