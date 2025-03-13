import * as React from "react"
import { GalleryVerticalEnd, X } from "lucide-react"
import { useNavigate, useLocation } from 'react-router-dom'
import { Input } from './ui/input'
import { useSelectedClass } from '../providers/SelectedClassContextProvider'

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
} from "src/components/ui/sidebar"

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { objectData, setSelectedClass } = useSelectedClass();
  const [searchQuery, setSearchQuery] = React.useState('');
  const [activeItemId, setActiveItemId] = React.useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  React.useEffect(() => {
    const findActiveItem = (items: any[]): string | null => {
      for (const item of items) {
        if (location.pathname.includes(`/class/${item.path}`)) {
          return item.id;
        }
        if (item.children) {
          const childResult = findActiveItem(item.children);
          if (childResult) return childResult;
        }
      }
      return null;
    };

    setActiveItemId(findActiveItem(objectData));
  }, [objectData, location.pathname]);

  const filterItems = React.useCallback((items: any[], query: string): any[] => {
    if (!query) return [];
    const results: any[] = [];
    items.forEach(item => {
      if (item.name.toLowerCase().includes(query.toLowerCase())) {
        results.push(item);
      }
      if (item.children) {
        results.push(...filterItems(item.children, query));
      }
    });
    return results;
  }, []);

  const searchResults = React.useMemo(() => 
    filterItems(objectData, searchQuery), 
    [objectData, searchQuery, filterItems]
  );

  const handleItemClick = React.useCallback((item: any) => {
    navigate('class/' + item.path);
    setSelectedClass(item);
    setActiveItemId(item.id);
  }, [navigate, setSelectedClass]);

  const handleClearSearch = () => {
    setSearchQuery('');
  };

  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="/">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <GalleryVerticalEnd className="size-4" />
                </div>
                <div className="flex flex-col gap-0.5 leading-none">
                  <span className="font-semibold">CTRL Documentable</span>
                  <span className="">v1.0.0</span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <div className="relative mb-4 px-3">
          <Input
            type="text"
            placeholder="Search classes..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="pr-8 border-2 rounded"
          />
          {searchQuery && (
            <button
              onClick={handleClearSearch}
              className="absolute right-5 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              aria-label="Clear search"
            >
              <X className="size-4" />
            </button>
          )}
        </div>
        <SidebarGroup>
          <SidebarMenu>
            {searchQuery ? (
              // Display search results
              searchResults.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton 
                    asChild 
                    onClick={() => handleItemClick(item)}
                    className={activeItemId === item.id ? 'font-bold text-blue-500' : ''}
                  >
                    <a href="#" className="font-medium">
                      {item.name}
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))
            ) : (
              // Display regular navigation
              objectData.map((category) => (
                <SidebarMenuItem key={category.id}>
                  <SidebarMenuButton asChild>
                    <a href="#" className="font-medium">
                      {category.name}
                    </a>
                  </SidebarMenuButton>
                  {category.children?.length ? (
                    <SidebarMenuSub>
                      {category.children.map((item) => (
                        <SidebarMenuSubItem key={item.id}>
                          <SidebarMenuSubButton 
                            asChild 
                            isActive={activeItemId === item.id}
                            onClick={() => handleItemClick(item)}
                          >
                            <a href="#">{item.name}</a>
                          </SidebarMenuSubButton>
                          {item.children?.length ? (
                            <SidebarMenuSub>
                              {item.children.map((subItem) => (
                                <SidebarMenuSubItem key={subItem.id}>
                                  <SidebarMenuSubButton 
                                    asChild 
                                    isActive={activeItemId === subItem.id}
                                    onClick={() => handleItemClick(subItem)}
                                  >
                                    <a href="#">{subItem.name}</a>
                                  </SidebarMenuSubButton>
                                </SidebarMenuSubItem>
                              ))}
                            </SidebarMenuSub>
                          ) : null}
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  ) : null}
                </SidebarMenuItem>
              ))
            )}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}
