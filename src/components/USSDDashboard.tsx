import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Home, BarChart3, MessageSquare, DollarSign, Users, ChevronDown, ChevronRight, CreditCard, Settings, DollarSign as FXIcon, UserCheck, TrendingUp } from "lucide-react";
import dapayLogo from "@/assets/dapay-logo.png";
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
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { SessionReport } from "./SessionReport";
import { USSDSessionTable } from "./USSDSessionTable";
import { SMSManagement } from "./SMSManagement";
import { CostAnalytics } from "./CostAnalytics";
import { UserMetrics } from "./UserMetrics";
import { Transactions } from "./Transactions";
import { RatesConfiguration } from "./RatesConfiguration";
import { FXConfiguration } from "./FXConfiguration";
import { AgentManagement } from "./AgentManagement";
import { SalesAgentModule } from "./SalesAgentModule";
import { USSDConfiguration } from "./USSDConfiguration";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { ThemeToggle } from "./ThemeToggle";

function AppSidebar({ activeTab, setActiveTab }: { activeTab: string; setActiveTab: (tab: string) => void }) {
  const { t } = useTranslation('dashboard');
  const [reportsOpen, setReportsOpen] = useState(true);
  const [agentsOpen, setAgentsOpen] = useState(true);
  const [configOpen, setConfigOpen] = useState(true);

  const homeItems = [
    { title: t('menu.home'), url: "home", icon: Home },
  ];

  const reportItems = [
    { title: t('menu.ussdSessions'), url: "sessions", icon: BarChart3 },
    { title: t('menu.sms'), url: "sms", icon: MessageSquare },
    { title: t('menu.costAnalysis'), url: "analytics", icon: DollarSign },
    { title: t('menu.userMetrics'), url: "users", icon: Users },
    { title: t('menu.transactions'), url: "transactions", icon: CreditCard },
  ];

  const agentItems = [
    { title: t('menu.agentManagement'), url: "agent-management", icon: UserCheck },
    { title: t('menu.salesAgentModule'), url: "sales-agent-module", icon: TrendingUp },
  ];

  const configItems = [
    { title: t('menu.ratesConfiguration'), url: "rates-configuration", icon: Settings },
    { title: t('menu.fxConfiguration'), url: "fx-configuration", icon: FXIcon },
    { title: t('menu.ussdConfiguration'), url: "ussd-configuration", icon: Settings },
  ];


  return (
    <Sidebar className="w-64">
      <SidebarContent>
        {/* Logo Section */}
        <div className="p-4 border-b">
          <img src={dapayLogo} alt="DAPAY" className="h-16 w-auto" />
        </div>
        <SidebarGroup>
          <SidebarGroupLabel>{t('navigation.home', { ns: 'common' })}</SidebarGroupLabel>
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
          <Collapsible open={reportsOpen} onOpenChange={setReportsOpen}>
            <CollapsibleTrigger asChild>
              <SidebarGroupLabel className="cursor-pointer flex items-center justify-between hover:bg-muted/50 rounded-md">
                <span>{t('navigation.reports', { ns: 'common' })}</span>
                {reportsOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              </SidebarGroupLabel>
            </CollapsibleTrigger>
            <CollapsibleContent>
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
            </CollapsibleContent>
          </Collapsible>
        </SidebarGroup>

        <SidebarGroup>
          <Collapsible open={agentsOpen} onOpenChange={setAgentsOpen}>
            <CollapsibleTrigger asChild>
              <SidebarGroupLabel className="cursor-pointer flex items-center justify-between hover:bg-muted/50 rounded-md">
                <span>{t('navigation.agents', { ns: 'common' })}</span>
                {agentsOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              </SidebarGroupLabel>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <SidebarGroupContent>
                <SidebarMenu>
                  {agentItems.map((item) => (
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
            </CollapsibleContent>
          </Collapsible>
        </SidebarGroup>

        <SidebarGroup>
          <Collapsible open={configOpen} onOpenChange={setConfigOpen}>
            <CollapsibleTrigger asChild>
              <SidebarGroupLabel className="cursor-pointer flex items-center justify-between hover:bg-muted/50 rounded-md">
                <span>{t('navigation.configuration', { ns: 'common' })}</span>
                {configOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              </SidebarGroupLabel>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <SidebarGroupContent>
                <SidebarMenu>
                  {configItems.map((item) => (
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
            </CollapsibleContent>
          </Collapsible>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}

export function USSDDashboard() {
  const { t } = useTranslation('dashboard');
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
      case "transactions":
        return <Transactions />;
      case "agent-management":
        return <AgentManagement />;
      case "sales-agent-module":
        return <SalesAgentModule />;
      case "rates-configuration":
        return <RatesConfiguration />;
      case "fx-configuration":
        return <FXConfiguration />;
      case "ussd-configuration":
        return <USSDConfiguration />;
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
                <h1 className="text-2xl font-bold text-foreground">{t('title')}</h1>
                <p className="text-sm text-muted-foreground">
                  {t('subtitle')}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <ThemeToggle />
              <LanguageSwitcher />
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-status-active rounded-full animate-pulse"></div>
                <span className="text-sm text-muted-foreground">{t('status.live')}</span>
              </div>
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