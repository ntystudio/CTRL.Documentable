import { Search, X } from "lucide-react"
import * as React from "react"

import { Label } from "src/components/ui/label"
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarInput,
} from "src/components/ui/sidebar"

interface SearchFormProps extends React.ComponentProps<"form"> {
  onSearch?: (query: string) => void;
  searchQuery?: string;
  onClearSearch?: () => void;
}

export function SearchForm({ 
  onSearch, 
  searchQuery = '', 
  onClearSearch,
  ...props 
}: SearchFormProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (onSearch) {
      onSearch(e.target.value);
    }
  };

  const handleClear = () => {
    if (onClearSearch) {
      onClearSearch();
    }
  };

  return (
    <form {...props} onSubmit={(e) => e.preventDefault()}>
      <SidebarGroup className="py-0">
        <SidebarGroupContent className="relative">
          <Label htmlFor="search" className="sr-only">
            Search
          </Label>
          <SidebarInput
            id="search"
            placeholder="Search classes..."
            className="pl-8"
            value={searchQuery}
            onChange={handleChange}
          />
          <Search className="pointer-events-none absolute left-2 top-1/2 size-4 -translate-y-1/2 select-none opacity-50" />
          {searchQuery && (
            <button
              onClick={handleClear}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              aria-label="Clear search"
              type="button"
            >
              <X className="size-4" />
            </button>
          )}
        </SidebarGroupContent>
      </SidebarGroup>
    </form>
  )
}
