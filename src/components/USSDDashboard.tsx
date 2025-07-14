import { USSDSessionTable } from "./USSDSessionTable";

export function USSDDashboard() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">USSD Management</h1>
            <p className="text-muted-foreground mt-1">
              Monitor and manage USSD sessions in real-time
            </p>
          </div>
          
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-status-active rounded-full animate-pulse"></div>
            <span className="text-sm text-muted-foreground">Live</span>
          </div>
        </div>

        {/* Main Content */}
        <USSDSessionTable />
      </div>
    </div>
  );
}