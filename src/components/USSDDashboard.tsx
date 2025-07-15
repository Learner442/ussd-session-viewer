import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SessionReport } from "./SessionReport";
import { USSDSessionTable } from "./USSDSessionTable";
import { SMSManagement } from "./SMSManagement";
import { CostAnalytics } from "./CostAnalytics";
import { UserMetrics } from "./UserMetrics";

export function USSDDashboard() {
  const [activeTab, setActiveTab] = useState("home");

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
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="home">Home</TabsTrigger>
            <TabsTrigger value="sessions">USSD Sessions</TabsTrigger>
            <TabsTrigger value="sms">SMS Management</TabsTrigger>
            <TabsTrigger value="analytics">Cost Analytics</TabsTrigger>
            <TabsTrigger value="users">User Metrics</TabsTrigger>
          </TabsList>
          
          <TabsContent value="home">
            <SessionReport />
          </TabsContent>
          
          <TabsContent value="sessions">
            <USSDSessionTable />
          </TabsContent>
          
          <TabsContent value="sms">
            <SMSManagement />
          </TabsContent>
          
          <TabsContent value="analytics">
            <CostAnalytics />
          </TabsContent>
          
          <TabsContent value="users">
            <UserMetrics />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}