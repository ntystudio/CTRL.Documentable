import * as React from "react"
import { GalleryVerticalEnd, ChevronRight } from "lucide-react"
import { useNavigate, useLocation } from 'react-router-dom'
import { useSelectedClass } from '../providers/SelectedClassContextProvider'
import { SearchForm } from "src/components/ui/search-form"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "src/components/ui/collapsible"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
} from "src/components/ui/sidebar"
import { handleHomeClick } from "src/lib/utils"

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { objectData, setSelectedClass } = useSelectedClass();
  const [searchQuery, setSearchQuery] = React.useState('');
  const [activeItemId, setActiveItemId] = React.useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  React.useEffect(() => {
    const findActiveItem = (items: any[]): string | null => {
      for (const item of items) {
        if (location.pathname === `/class/${item.path}` || 
            location.pathname.startsWith(`/class/${item.path}/`)) {
          return item.id;
        }
        if (item.children) {
          const childResult = findActiveItem(item.children);
          if (childResult) return childResult;
        }
      }
      return null;
    };

    const activeId = findActiveItem(objectData);
    if (activeId) {
      setActiveItemId(activeId);
    }
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
    setActiveItemId(item.id);
    setSelectedClass(item);
    navigate(`/class/${item.path}`);
  }, [navigate, setSelectedClass]);

  const handleClearSearch = () => {
    setSearchQuery('');
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
  };

  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="/" onClick={(e) => handleHomeClick(e, setSelectedClass, navigate)}>
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
        <SearchForm 
          onSearch={handleSearchChange} 
          searchQuery={searchQuery} 
          onClearSearch={handleClearSearch} 
        />
      </SidebarHeader>
      <SidebarContent className="gap-0">
        <SidebarGroup>
          {searchQuery ? (
            // Display search results
            <SidebarGroupContent>
              <SidebarMenu>
                {searchResults.map((item) => (
                  <SidebarMenuItem key={item.id}>
                    <SidebarMenuButton 
                      asChild 
                      onClick={(e) => {
                        e.preventDefault();
                        handleItemClick(item);
                      }}
                      isActive={activeItemId === item.id}
                    >
                      <a href="#" className="font-medium">
                        {item.name}
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          ) : (
            // Display regular navigation with collapsible sections
            // Skip the first category and directly show its children
            objectData.length > 0 && objectData[0].children ? (
              // Render children of the first category
              objectData[0].children.map((item) => (
                <Collapsible
                  key={item.id}
                  defaultOpen
                  className="group/collapsible"
                >
                  <SidebarGroup>
                    <SidebarGroupLabel
                      asChild
                      className="group/label text-sm text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                    >
                      <CollapsibleTrigger>
                        {item.name}{" "}
                        <ChevronRight className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-90" />
                      </CollapsibleTrigger>
                    </SidebarGroupLabel>
                    <CollapsibleContent>
                      <SidebarGroupContent>
                        <SidebarMenu>
                          {item.children?.map((subItem) => (
                            <SidebarMenuItem key={subItem.id}>
                              <SidebarMenuButton 
                                asChild 
                                isActive={activeItemId === subItem.id}
                                onClick={(e) => {
                                  e.preventDefault();
                                  handleItemClick(subItem);
                                }}
                              >
                                <a href="#">{subItem.name}</a>
                              </SidebarMenuButton>
                              {subItem.children?.length ? (
                                <SidebarMenuSub>
                                  {subItem.children.map((nestedItem) => (
                                    <SidebarMenuSubItem key={nestedItem.id}>
                                      <SidebarMenuSubButton 
                                        asChild 
                                        isActive={activeItemId === nestedItem.id}
                                        onClick={(e) => {
                                          e.preventDefault();
                                          handleItemClick(nestedItem);
                                        }}
                                      >
                                        <a href="#">{nestedItem.name}</a>
                                      </SidebarMenuSubButton>
                                    </SidebarMenuSubItem>
                                  ))}
                                </SidebarMenuSub>
                              ) : null}
                            </SidebarMenuItem>
                          ))}
                        </SidebarMenu>
                      </SidebarGroupContent>
                    </CollapsibleContent>
                  </SidebarGroup>
                </Collapsible>
              ))
            ) : (
              // Fallback to render all categories if structure is different
              objectData.map((category) => (
                <Collapsible
                  key={category.id}
                  defaultOpen
                  className="group/collapsible"
                >
                  <SidebarGroup>
                    <SidebarGroupLabel
                      asChild
                      className="group/label text-sm text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                    >
                      <CollapsibleTrigger>
                        {category.name}{" "}
                        <ChevronRight className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-90" />
                      </CollapsibleTrigger>
                    </SidebarGroupLabel>
                    <CollapsibleContent>
                      <SidebarGroupContent>
                        <SidebarMenu>
                          {category.children?.map((item) => (
                            <SidebarMenuItem key={item.id}>
                              <SidebarMenuButton 
                                asChild 
                                isActive={activeItemId === item.id}
                                onClick={(e) => {
                                  e.preventDefault();
                                  handleItemClick(item);
                                }}
                              >
                                <a href="#">{item.name}</a>
                              </SidebarMenuButton>
                              {item.children?.length ? (
                                <SidebarMenuSub>
                                  {item.children.map((subItem) => (
                                    <SidebarMenuSubItem key={subItem.id}>
                                      <SidebarMenuSubButton 
                                        asChild 
                                        isActive={activeItemId === subItem.id}
                                        onClick={(e) => {
                                          e.preventDefault();
                                          handleItemClick(subItem);
                                        }}
                                      >
                                        <a href="#">{subItem.name}</a>
                                      </SidebarMenuSubButton>
                                    </SidebarMenuSubItem>
                                  ))}
                                </SidebarMenuSub>
                              ) : null}
                            </SidebarMenuItem>
                          ))}
                        </SidebarMenu>
                      </SidebarGroupContent>
                    </CollapsibleContent>
                  </SidebarGroup>
                </Collapsible>
              ))
            )
          )}
        </SidebarGroup>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}
