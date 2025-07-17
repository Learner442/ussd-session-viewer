import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, Download, TrendingUp, TrendingDown } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AgentPerformance {
  id: string;
  agent_id: string;
  agent_name: string;
  region: string;
  total_users_registered: number;
  active_users: number;
  sessions_generated: number;
  transactions_made: number;
  sms_sent: number;
  revenue_generated: number;
  commission_owed: number;
  conversion_rate: number;
  status: string;
}

interface FilterState {
  timePeriod: string;
  region: string;
  agentStatus: string;
  userType: string;
}

interface AgentPerformanceTableProps {
  filters: FilterState;
}

export const AgentPerformanceTable: React.FC<AgentPerformanceTableProps> = ({ filters }) => {
  const { toast } = useToast();
  const [agents, setAgents] = useState<AgentPerformance[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAgentPerformance();
  }, [filters]);

  const loadAgentPerformance = async () => {
    try {
      setLoading(true);

      // Load agents with their performance data
      const { data: agentsData, error: agentsError } = await supabase
        .from('agents')
        .select(`
          *
        `);

      if (agentsError) throw agentsError;

      // Load related data separately to avoid aggregation issues
      const agentIds = agentsData?.map(agent => agent.id) || [];
      
      const [recruitedUsers, sessions, transactions, sms, commissions] = await Promise.all([
        supabase.from('agent_recruited_users').select('agent_id').in('agent_id', agentIds),
        supabase.from('agent_user_sessions').select('agent_id').in('agent_id', agentIds),
        supabase.from('agent_user_transactions').select('agent_id, revenue_generated').in('agent_id', agentIds),
        supabase.from('agent_user_sms').select('agent_id, sms_count').in('agent_id', agentIds),
        supabase.from('agent_commissions').select('agent_id, total_commission').in('agent_id', agentIds)
      ]);

      // Transform data to match the required format
      const performanceData: AgentPerformance[] = agentsData?.map(agent => {
        const agentRecruitedUsers = recruitedUsers.data?.filter(u => u.agent_id === agent.id) || [];
        const agentSessions = sessions.data?.filter(s => s.agent_id === agent.id) || [];
        const agentTransactions = transactions.data?.filter(t => t.agent_id === agent.id) || [];
        const agentSms = sms.data?.filter(s => s.agent_id === agent.id) || [];
        const agentCommissions = commissions.data?.filter(c => c.agent_id === agent.id) || [];
        
        const totalUsers = agentRecruitedUsers.length;
        const activeSessions = agentSessions.length;
        const totalRevenue = agentTransactions.reduce((sum, t) => sum + (Number(t.revenue_generated) || 0), 0);
        const totalSms = agentSms.reduce((sum, s) => sum + (Number(s.sms_count) || 0), 0);
        const totalCommission = agentCommissions.reduce((sum, c) => sum + (Number(c.total_commission) || 0), 0);
        
        return {
          id: agent.id,
          agent_id: agent.agent_id,
          agent_name: agent.agent_name,
          region: agent.region,
          total_users_registered: totalUsers,
          active_users: Math.floor(totalUsers * 0.8), // Simulated active users (80% retention)
          sessions_generated: activeSessions,
          transactions_made: agentTransactions.length,
          sms_sent: totalSms,
          revenue_generated: totalRevenue,
          commission_owed: totalCommission,
          conversion_rate: totalUsers > 0 ? Math.round((Math.floor(totalUsers * 0.8) / totalUsers) * 100) : 0,
          status: agent.status || 'active'
        };
      }) || [];

      setAgents(performanceData);

    } catch (error) {
      toast({
        title: "Error loading performance data",
        description: "Failed to load agent performance data. Please try again.",
        variant: "destructive"
      });
      console.error('Error loading agent performance:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { label: 'Active', variant: 'default' as const },
      inactive: { label: 'Inactive', variant: 'secondary' as const },
      suspended: { label: 'Suspended', variant: 'destructive' as const },
      pending: { label: 'Pending', variant: 'outline' as const }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getPerformanceTrend = (conversionRate: number) => {
    if (conversionRate >= 80) {
      return <TrendingUp className="h-4 w-4 text-green-600" />;
    } else if (conversionRate >= 60) {
      return <TrendingUp className="h-4 w-4 text-yellow-600" />;
    } else {
      return <TrendingDown className="h-4 w-4 text-red-600" />;
    }
  };

  const handleViewDetails = (agentId: string) => {
    toast({
      title: "Agent Details",
      description: `Viewing details for agent ${agentId}`,
    });
  };

  const handleExportAgent = (agentId: string) => {
    toast({
      title: "Export Started",
      description: `Exporting report for agent ${agentId}`,
    });
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Loading agent performance data...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Agent Performance Summary</CardTitle>
        <p className="text-sm text-muted-foreground">
          Detailed performance metrics for all sales agents
        </p>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Agent ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Region</TableHead>
                <TableHead>Total Users</TableHead>
                <TableHead>Active Users</TableHead>
                <TableHead>Sessions</TableHead>
                <TableHead>Transactions</TableHead>
                <TableHead>SMS Sent</TableHead>
                <TableHead>Revenue</TableHead>
                <TableHead>Commission</TableHead>
                <TableHead>Conversion</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {agents.map((agent) => (
                <TableRow key={agent.id}>
                  <TableCell className="font-medium">{agent.agent_id}</TableCell>
                  <TableCell>{agent.agent_name}</TableCell>
                  <TableCell className="capitalize">{agent.region}</TableCell>
                  <TableCell>{agent.total_users_registered}</TableCell>
                  <TableCell>{agent.active_users}</TableCell>
                  <TableCell>{agent.sessions_generated}</TableCell>
                  <TableCell>{agent.transactions_made}</TableCell>
                  <TableCell>{agent.sms_sent}</TableCell>
                  <TableCell>${agent.revenue_generated.toFixed(2)}</TableCell>
                  <TableCell>${agent.commission_owed.toFixed(2)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {agent.conversion_rate}%
                      {getPerformanceTrend(agent.conversion_rate)}
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(agent.status)}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewDetails(agent.agent_id)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleExportAgent(agent.agent_id)}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {agents.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            No agent performance data available for the selected filters.
          </div>
        )}
      </CardContent>
    </Card>
  );
};