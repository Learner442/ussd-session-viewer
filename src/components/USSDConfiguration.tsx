import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Plus, Settings, Network, History, Code, Play, Calendar } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MenuFlowManager } from "./ussd/MenuFlowManager";
import { ServiceManager } from "./ussd/ServiceManager";
import { MNOManager } from "./ussd/MNOManager";
import { FlowHistory } from "./ussd/FlowHistory";
import { MenuBuilder } from "./ussd/MenuBuilder";
import { FlowPreview } from "./ussd/FlowPreview";
import { ScheduledDeployments } from "./ussd/ScheduledDeployments";

export function USSDConfiguration() {
  const { t } = useTranslation('common');
  const [activeTab, setActiveTab] = useState("flows");
  const [selectedFlowId, setSelectedFlowId] = useState<string | null>(null);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">USSD Configuration</h1>
          <p className="text-muted-foreground mt-2">
            Dynamically build, update, and publish USSD menu flows for different MNOs and services
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="flows" className="flex items-center gap-2">
            <Network className="h-4 w-4" />
            Menu Flows
          </TabsTrigger>
          <TabsTrigger value="builder" className="flex items-center gap-2">
            <Code className="h-4 w-4" />
            Flow Builder
          </TabsTrigger>
          <TabsTrigger value="preview" className="flex items-center gap-2">
            <Play className="h-4 w-4" />
            Preview & Test
          </TabsTrigger>
          <TabsTrigger value="services" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Services
          </TabsTrigger>
          <TabsTrigger value="mnos" className="flex items-center gap-2">
            <Network className="h-4 w-4" />
            MNOs
          </TabsTrigger>
          <TabsTrigger value="schedule" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Scheduled
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <History className="h-4 w-4" />
            History
          </TabsTrigger>
        </TabsList>

        <TabsContent value="flows" className="space-y-6">
          <MenuFlowManager onSelectFlow={setSelectedFlowId} />
        </TabsContent>

        <TabsContent value="builder" className="space-y-6">
          <MenuBuilder selectedFlowId={selectedFlowId} />
        </TabsContent>

        <TabsContent value="preview" className="space-y-6">
          <FlowPreview selectedFlowId={selectedFlowId} />
        </TabsContent>

        <TabsContent value="services" className="space-y-6">
          <ServiceManager />
        </TabsContent>

        <TabsContent value="mnos" className="space-y-6">
          <MNOManager />
        </TabsContent>

        <TabsContent value="schedule" className="space-y-6">
          <ScheduledDeployments />
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <FlowHistory selectedFlowId={selectedFlowId} />
        </TabsContent>
      </Tabs>
    </div>
  );
}