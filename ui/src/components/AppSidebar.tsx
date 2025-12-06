import { useState, useEffect } from "react";
import {
  Activity,
  BarChart3,
  FileText,
  MessageSquare,
  Power,
  Server,
  Home,
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
  SidebarHeader,
  useSidebar,
} from "@/components/ui/sidebar";

const menuItems = [
  { title: "Overview", url: "#overview", icon: Home },
  { title: "Node Telemetry", url: "#nodes", icon: Server },
  { title: "Quick Predict", url: "#predict", icon: MessageSquare },
  { title: "Event Log", url: "#events", icon: FileText },
  { title: "Analytics", url: "#analytics", icon: BarChart3 },
  { title: "System Control", url: "#control", icon: Power },
  { title: "Metrics", url: "#metrics", icon: Activity },
];

export function AppSidebar() {
  const { open } = useSidebar();
  const [activeSection, setActiveSection] = useState("#overview");

  useEffect(() => {
    const handleHashChange = () => {
      setActiveSection(window.location.hash || "#overview");
    };

    handleHashChange();
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  const handleClick = (url: string) => {
    setActiveSection(url);
    if (url.startsWith("#")) {
      const element = document.querySelector(url);
      element?.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <Sidebar className="border-r border-sidebar-border">
      <SidebarHeader className="border-b border-sidebar-border p-4">
        <div className="flex items-center gap-2">
          <Activity className="h-6 w-6 text-sidebar-primary" />
          {open && (
            <div>
              <h1 className="font-bold text-sidebar-foreground">Telemetry Hub</h1>
              <p className="text-xs text-sidebar-foreground/60">Distributed Monitoring</p>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <a
                      href={item.url}
                      onClick={(e) => {
                        e.preventDefault();
                        handleClick(item.url);
                      }}
                      className={`hover:bg-sidebar-accent transition-colors ${
                        activeSection === item.url
                          ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                          : ""
                      }`}
                    >
                      <item.icon className="h-4 w-4" />
                      {open && <span>{item.title}</span>}
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
