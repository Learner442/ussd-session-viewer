import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { USSDSessionTable } from "./USSDSessionTable";
import { SMSManagement } from "./SMSManagement";
import { CostAnalytics } from "./CostAnalytics";

export function USSDDashboard() {
  const [activeTab, setActiveTab] = useState("sessions");

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">USSD Management</h1>
            <p className="text-muted-foreground mt-1">
              Monitor sessions, SMS delivery, and cost analytics
            </p>
          </div>
          
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-status-active rounded-full animate-pulse"></div>
            <span className="text-sm text-muted-foreground">Live</span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="sessions">USSD Sessions</TabsTrigger>
            <TabsTrigger value="sms">SMS Management</TabsTrigger>
            <TabsTrigger value="analytics">Cost Analytics</TabsTrigger>
          </TabsList>
          
          <TabsContent value="sessions">
            <USSDSessionTable />
          </TabsContent>
          
          <TabsContent value="sms">
            <SMSManagement />
          </TabsContent>
          
          <TabsContent value="analytics">
            <CostAnalytics />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}