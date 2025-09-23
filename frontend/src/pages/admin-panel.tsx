import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { ModeToggle } from "@/components/mode-toggle";
import { Outlet } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";

export default function AdminPanel() {
  const { isAdmin } = useAuth();
  return (
    <SidebarProvider>
      <div className="flex h-screen w-full">
        {/* Sidebar */}
        <AppSidebar />

        {/* Main content */}
        <div className="flex-1 flex flex-col">
          {/* Horizontal bar */}
          <div className="flex items-center justify-between bg-gray-100 dark:bg-gray-800 px-4 h-16 border-b border-gray-200 dark:border-gray-700">
            {/* Left buttons */}
            <div className="flex items-center gap-3">
              <SidebarTrigger />
              <ModeToggle />
            </div>

            {/* Right buttons */}
            <div className="flex items-center gap-3">
              {isAdmin ? (
                <a href="/admin/products/new">
                  <Button type="button" variant={"outline"}>
                    Add Product
                  </Button>
                </a>
              ) : null}

              <a href="/admin/sales/new">
                <Button type="button">Add Sale</Button>
              </a>
            </div>
          </div>

          {/* Page content */}
          <main className="flex-1 overflow-auto p-4">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
