import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Plus, Search, Download, Filter, Users, TrendingUp, AlertTriangle, DollarSign } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { AgentRegistration } from "./agent/AgentRegistration";
import { AgentProfile } from "./agent/AgentProfile";
import { AgentMonitoring } from "./agent/AgentMonitoring";

export function AgentManagement() {
  const { t } = useTranslation('agent');
  const [activeView, setActiveView] = useState<"dashboard" | "profile" | "monitoring">("dashboard");
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);
  const [isRegistrationOpen, setIsRegistrationOpen] = useState(false);
  const [agents, setAgents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch agents from database
  const fetchAgents = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('agents')
        .select(`
          *,
          agent_wallets(balance),
          agent_services(service_type, rate, rate_type)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching agents:', error);
      } else {
        setAgents(data || []);
      }
    } catch (error) {
      console.error('Error fetching agents:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAgents();
  }, []);

  // Refresh agents when registration dialog closes
  const handleRegistrationClose = () => {
    setIsRegistrationOpen(false);
    fetchAgents(); // Refresh the list
  };

  const stats = [
    {
      title: t('stats.totalAgents'),
      value: "2,847",
      change: "+12.3%",
      icon: Users,
      color: "text-blue-600"
    },
    {
      title: t('stats.activeToday'),
      value: "1,923",
      change: "+5.7%",
      icon: TrendingUp,
      color: "text-green-600"
    },
    {
      title: t('stats.totalVolume'),
      value: "$234,567",
      change: "+18.2%",
      icon: DollarSign,
      color: "text-purple-600"
    },
    {
      title: t('stats.alerts'),
      value: "47",
      change: "-23.1%",
      icon: AlertTriangle,
      color: "text-red-600"
    }
  ];

  const renderContent = () => {
    switch (activeView) {
      case "profile":
        return <AgentProfile agentId={selectedAgentId} onBack={() => setActiveView("dashboard")} />;
      case "monitoring":
        return <AgentMonitoring 
          onAgentSelect={(id) => {
            setSelectedAgentId(id);
            setActiveView("profile");
          }}
          onBack={() => setActiveView("dashboard")}
        />;
      default:
        return renderDashboard();
    }
  };

  const renderDashboard = () => (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                <span className={stat.change.startsWith("+") ? "text-green-600" : "text-red-600"}>
                  {stat.change}
                </span>{" "}
                {t('stats.fromLastMonth')}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Dialog open={isRegistrationOpen} onOpenChange={setIsRegistrationOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              {t('management.registerNewAgent')}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{t('registration.title')}</DialogTitle>
            </DialogHeader>
            <AgentRegistration onBack={handleRegistrationClose} />
          </DialogContent>
        </Dialog>
        <Button variant="outline" onClick={() => setActiveView("monitoring")} className="flex items-center gap-2">
          <Users className="h-4 w-4" />
          {t('management.agentMonitoring')}
        </Button>
        <Button variant="outline" className="flex items-center gap-2">
          <Download className="h-4 w-4" />
          {t('management.exportReports')}
        </Button>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>{t('quickActions.title')}</CardTitle>
          <CardDescription>{t('quickActions.subtitle')}</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="recent" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="recent">{t('quickActions.recentActivity')}</TabsTrigger>
              <TabsTrigger value="alerts">{t('quickActions.alerts')}</TabsTrigger>
              <TabsTrigger value="performance">{t('quickActions.topPerformers')}</TabsTrigger>
            </TabsList>
            
            <TabsContent value="recent" className="space-y-4">
              <div className="space-y-3">
                {loading ? (
                  <div className="text-center py-4">Loading agents...</div>
                ) : agents.length === 0 ? (
                  <div className="text-center py-4 text-muted-foreground">
                    No agents found. Register your first agent to get started.
                  </div>
                ) : (
                  agents.slice(0, 5).map((agent) => (
                    <div key={agent.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${
                          agent.status === 'active' ? 'bg-green-500' : 
                          agent.status === 'pending' ? 'bg-yellow-500' : 'bg-gray-500'
                        }`}></div>
                        <div>
                          <p className="font-medium">{agent.agent_id}</p>
                          <p className="text-sm text-muted-foreground">
                            {agent.agent_name} - {agent.region}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={
                          agent.status === 'active' ? 'default' : 
                          agent.status === 'pending' ? 'secondary' : 'outline'
                        }>
                          {agent.status}
                        </Badge>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            setSelectedAgentId(agent.id);
                            setActiveView("profile");
                          }}
                        >
                          View
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="alerts" className="space-y-4">
              <div className="space-y-3">
                {[
                  { agent: "AGT_023", alert: "No activity in 5 days", type: "warning" },
                  { agent: "AGT_045", alert: "Low wallet balance", type: "error" },
                  { agent: "AGT_067", alert: "Eligible for bonus", type: "success" },
                ].map((alert, i) => (
                  <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${
                        alert.type === "error" ? "bg-red-500" : 
                        alert.type === "warning" ? "bg-yellow-500" : "bg-green-500"
                      }`}></div>
                      <div>
                        <p className="font-medium">{alert.agent}</p>
                        <p className="text-sm text-muted-foreground">{alert.alert}</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">View</Button>
                  </div>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="performance" className="space-y-4">
              <div className="space-y-3">
                {[
                  { agent: "AGT_012", sales: "$2,456", commission: "$98.24", rank: 1 },
                  { agent: "AGT_089", sales: "$2,234", commission: "$89.36", rank: 2 },
                  { agent: "AGT_156", sales: "$2,123", commission: "$84.92", rank: 3 },
                ].map((performer) => (
                  <div key={performer.agent} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Badge variant="secondary">#{performer.rank}</Badge>
                      <div>
                        <p className="font-medium">{performer.agent}</p>
                        <p className="text-sm text-muted-foreground">
                          Sales: {performer.sales} | Commission: {performer.commission}
                        </p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">View Profile</Button>
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{t('management.title')}</h1>
          <p className="text-muted-foreground">
            {t('management.subtitle')}
          </p>
        </div>
      </div>
      
      {renderContent()}
    </div>
  );
}
