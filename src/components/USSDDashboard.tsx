import { useState } from "react";
import { Home, BarChart3, MessageSquare, DollarSign, Users } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { SessionReport } from "./SessionReport";
import { USSDSessionTable } from "./USSDSessionTable";
import { SMSManagement } from "./SMSManagement";
import { CostAnalytics } from "./CostAnalytics";
import { UserMetrics } from "./UserMetrics";

const homeItems = [
  { title: "Dashboard", url: "home", icon: Home },
];

const reportItems = [
  { title: "USSD Sessions", url: "sessions", icon: BarChart3 },
  { title: "SMS", url: "sms", icon: MessageSquare },
  { title: "Cost Analysis", url: "analytics", icon: DollarSign },
  { title: "User Metrics", url: "users", icon: Users },
];

function AppSidebar({ activeTab, setActiveTab }: { activeTab: string; setActiveTab: (tab: string) => void }) {
  return (
    <Sidebar className="w-64">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Home</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {homeItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    onClick={() => setActiveTab(item.url)}
                    className={activeTab === item.url ? "bg-muted text-primary font-medium" : "hover:bg-muted/50"}
                  >
                    <item.icon className="mr-2 h-4 w-4" />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Reports</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {reportItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    onClick={() => setActiveTab(item.url)}
                    className={activeTab === item.url ? "bg-muted text-primary font-medium" : "hover:bg-muted/50"}
                  >
                    <item.icon className="mr-2 h-4 w-4" />
                    <span>{item.title}</span>
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

export function USSDDashboard() {
  const [activeTab, setActiveTab] = useState("home");

  const renderContent = () => {
    switch (activeTab) {
      case "home":
        return <SessionReport />;
      case "sessions":
        return <USSDSessionTable />;
      case "sms":
        return <SMSManagement />;
      case "analytics":
        return <CostAnalytics />;
      case "users":
        return <UserMetrics />;
      default:
        return <SessionReport />;
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <header className="h-16 flex items-center justify-between px-6 border-b">
            <div className="flex items-center space-x-4">
              <SidebarTrigger />
              <div>
                <h1 className="text-2xl font-bold text-foreground">USSD Management</h1>
                <p className="text-sm text-muted-foreground">
                  Monitor sessions, SMS delivery, and cost analytics
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-status-active rounded-full animate-pulse"></div>
              <span className="text-sm text-muted-foreground">Live</span>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 p-6 bg-background">
            {renderContent()}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}