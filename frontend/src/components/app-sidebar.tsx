import {
  ChartAreaIcon,
  DollarSign,
  Layers,
  LogOut,
  Package,
  Receipt,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useAuth } from "@/context/AuthContext";
import { Role } from "@/types/Role";

export function AppSidebar() {
  const { user, logout } = useAuth();

  let items = [
    {
      title: "Products",
      url: "/admin/products",
      icon: Package,
    },
    {
      title: "Sales",
      url: "/admin/sales",
      icon: DollarSign,
    },
  ];

  if (user?.role === Role.Admin) {
    items = [
      {
        title: "Stats",
        url: "/admin/stats",
        icon: ChartAreaIcon,
      },
      ...items,
      {
        title: "Stock",
        url: "/admin/stock",
        icon: Layers,
      },
      {
        title: "Expenses",
        url: "/admin/expenses",
        icon: Receipt,
      },
    ];
  }

  return (
    <Sidebar variant="sidebar">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-2xl text-red-800">
            HEDJ Man
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="flex justify-between h-full">
              <div className="flex flex-col">
                {items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <a href={item.url}>
                        <item.icon />
                        <span>{item.title}</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </div>

              {/* Logout button */}
              <SidebarMenuItem key="Logout">
                <SidebarMenuButton
                  onClick={logout}
                  className="cursor-pointer"
                  asChild
                >
                  <div>
                    <LogOut className="text-red-500" />
                    <span className="text-red-600">Logout</span>
                  </div>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
