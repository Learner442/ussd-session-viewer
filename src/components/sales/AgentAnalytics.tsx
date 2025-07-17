import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { AlertTriangle, TrendingUp, TrendingDown, Users, Activity, DollarSign, MessageSquare, Shield } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface FilterState {
  timePeriod: string;
  region: string;
  agentStatus: string;
  userType: string;
}

interface AgentAnalyticsProps {
  filters: FilterState;
}

interface ActivityRatioData {
  agent_id: string;
  agent_name: string;
  total_users: number;
  active_after_30_days: number;
  users_with_transactions: number;
  activity_rate: number;
  transaction_rate: number;
}

interface RevenueEfficiencyData {
  agent_id: string;
  agent_name: string;
  total_revenue: number;
  total_users: number;
  total_sessions: number;
  revenue_per_user: number;
  revenue_per_session: number;
}

interface ChurnData {
  agent_id: string;
  agent_name: string;
  last_activity_date: string;
  days_inactive: number;
  status: 'active' | 'at_risk' | 'churned';
}

interface FraudRiskData {
  agent_id: string;
  agent_name: string;
  duplicate_users: number;
  sms_ratio: number;
  revenue_ratio: number;
  risk_level: 'low' | 'medium' | 'high';
}

export const AgentAnalytics: React.FC<AgentAnalyticsProps> = ({ filters }) => {
  const { toast } = useToast();
  const [activityRatios, setActivityRatios] = useState<ActivityRatioData[]>([]);
  const [revenueEfficiency, setRevenueEfficiency] = useState<RevenueEfficiencyData[]>([]);
  const [churnWatch, setChurnWatch] = useState<ChurnData[]>([]);
  const [fraudRisks, setFraudRisks] = useState<FraudRiskData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalyticsData();
  }, [filters]);

  const loadAnalyticsData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        loadActivityRatios(),
        loadRevenueEfficiency(),
        loadChurnWatch(),
        loadFraudRisks()
      ]);
    } catch (error) {
      console.error('Error loading analytics data:', error);
      toast({
        title: "Error loading analytics",
        description: "Failed to load advanced analytics data.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const loadActivityRatios = async () => {
    const { data: agents, error } = await supabase
      .from('agents')
      .select(`
        id,
        agent_id,
        agent_name,
        agent_recruited_users(id, is_active, registration_date),
        agent_user_transactions(recruited_user_id)
      `);

    if (error) throw error;

    const activityData: ActivityRatioData[] = agents?.map(agent => {
      const totalUsers = agent.agent_recruited_users?.length || 0;
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const activeAfter30Days = agent.agent_recruited_users?.filter(user => 
        user.is_active && new Date(user.registration_date) <= thirtyDaysAgo
      ).length || 0;

      const uniqueTransactionUsers = new Set(
        agent.agent_user_transactions?.map(t => t.recruited_user_id) || []
      ).size;

      return {
        agent_id: agent.agent_id,
        agent_name: agent.agent_name,
        total_users: totalUsers,
        active_after_30_days: activeAfter30Days,
        users_with_transactions: uniqueTransactionUsers,
        activity_rate: totalUsers > 0 ? Math.round((activeAfter30Days / totalUsers) * 100) : 0,
        transaction_rate: totalUsers > 0 ? Math.round((uniqueTransactionUsers / totalUsers) * 100) : 0
      };
    }) || [];

    setActivityRatios(activityData);
  };

  const loadRevenueEfficiency = async () => {
    const { data: agents, error } = await supabase
      .from('agents')
      .select(`
        id,
        agent_id,
        agent_name,
        agent_recruited_users(count),
        agent_user_sessions(count),
        agent_user_transactions(revenue_generated)
      `);

    if (error) throw error;

    const efficiencyData: RevenueEfficiencyData[] = agents?.map(agent => {
      const totalUsers = agent.agent_recruited_users?.[0]?.count || 0;
      const totalSessions = agent.agent_user_sessions?.[0]?.count || 0;
      const totalRevenue = agent.agent_user_transactions?.reduce((sum, t) => 
        sum + (Number(t.revenue_generated) || 0), 0) || 0;

      return {
        agent_id: agent.agent_id,
        agent_name: agent.agent_name,
        total_revenue: totalRevenue,
        total_users: totalUsers,
        total_sessions: totalSessions,
        revenue_per_user: totalUsers > 0 ? totalRevenue / totalUsers : 0,
        revenue_per_session: totalSessions > 0 ? totalRevenue / totalSessions : 0
      };
    }) || [];

    setRevenueEfficiency(efficiencyData);
  };

  const loadChurnWatch = async () => {
    const { data: agents, error } = await supabase
      .from('agents')
      .select(`
        id,
        agent_id,
        agent_name,
        updated_at,
        agent_user_sessions(session_date)
      `);

    if (error) throw error;

    const churnData: ChurnData[] = agents?.map(agent => {
      const lastSessionDate = agent.agent_user_sessions
        ?.map(s => new Date(s.session_date))
        .reduce((latest, current) => current > latest ? current : latest, new Date(0));

      const lastActivity = lastSessionDate && lastSessionDate.getTime() > 0 
        ? lastSessionDate 
        : new Date(agent.updated_at);

      const daysInactive = Math.floor((Date.now() - lastActivity.getTime()) / (1000 * 60 * 60 * 24));
      
      let status: ChurnData['status'] = 'active';
      if (daysInactive > 60) status = 'churned';
      else if (daysInactive > 30) status = 'at_risk';

      return {
        agent_id: agent.agent_id,
        agent_name: agent.agent_name,
        last_activity_date: lastActivity.toISOString().split('T')[0],
        days_inactive: daysInactive,
        status
      };
    }) || [];

    setChurnWatch(churnData.filter(agent => agent.status !== 'active'));
  };

  const loadFraudRisks = async () => {
    const { data: agents, error } = await supabase
      .from('agents')
      .select(`
        id,
        agent_id,
        agent_name,
        agent_recruited_users(user_phone),
        agent_user_sms(sms_count),
        agent_user_sessions(count),
        agent_user_transactions(revenue_generated)
      `);

    if (error) throw error;

    const fraudData: FraudRiskData[] = agents?.map(agent => {
      // Check for duplicate phone numbers
      const phoneNumbers = agent.agent_recruited_users?.map(u => u.user_phone) || [];
      const uniquePhones = new Set(phoneNumbers);
      const duplicateUsers = phoneNumbers.length - uniquePhones.size;

      // Calculate SMS to revenue ratio
      const totalSms = agent.agent_user_sms?.reduce((sum, s) => sum + (s.sms_count || 0), 0) || 0;
      const totalRevenue = agent.agent_user_transactions?.reduce((sum, t) => 
        sum + (Number(t.revenue_generated) || 0), 0) || 0;
      const totalSessions = agent.agent_user_sessions?.[0]?.count || 0;

      const smsRatio = totalSessions > 0 ? totalSms / totalSessions : 0;
      const revenueRatio = totalSms > 0 ? totalRevenue / totalSms : 0;

      // Determine risk level
      let riskLevel: FraudRiskData['risk_level'] = 'low';
      if (duplicateUsers > 3 || smsRatio > 10 || (totalSms > 100 && revenueRatio < 0.01)) {
        riskLevel = 'high';
      } else if (duplicateUsers > 1 || smsRatio > 5 || (totalSms > 50 && revenueRatio < 0.05)) {
        riskLevel = 'medium';
      }

      return {
        agent_id: agent.agent_id,
        agent_name: agent.agent_name,
        duplicate_users: duplicateUsers,
        sms_ratio: smsRatio,
        revenue_ratio: revenueRatio,
        risk_level: riskLevel
      };
    }).filter(agent => agent.risk_level !== 'low') || [];

    setFraudRisks(fraudData);
  };

  const getStatusBadge = (status: string, type: 'churn' | 'risk') => {
    if (type === 'churn') {
      const config = {
        at_risk: { label: 'At Risk', variant: 'destructive' as const },
        churned: { label: 'Churned', variant: 'outline' as const }
      };
      const item = config[status as keyof typeof config];
      return <Badge variant={item.variant}>{item.label}</Badge>;
    } else {
      const config = {
        medium: { label: 'Medium Risk', variant: 'outline' as const },
        high: { label: 'High Risk', variant: 'destructive' as const }
      };
      const item = config[status as keyof typeof config];
      return <Badge variant={item.variant}>{item.label}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-muted rounded w-1/3 mb-4"></div>
                <div className="h-32 bg-muted rounded"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Activity Ratio Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Activity Ratio Analysis
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            User retention and transaction participation rates
          </p>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Agent</TableHead>
                <TableHead>Total Users</TableHead>
                <TableHead>Active After 30 Days</TableHead>
                <TableHead>Users with Transactions</TableHead>
                <TableHead>Activity Rate</TableHead>
                <TableHead>Transaction Rate</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {activityRatios.map((data) => (
                <TableRow key={data.agent_id}>
                  <TableCell className="font-medium">{data.agent_name}</TableCell>
                  <TableCell>{data.total_users}</TableCell>
                  <TableCell>{data.active_after_30_days}</TableCell>
                  <TableCell>{data.users_with_transactions}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Progress value={data.activity_rate} className="w-16" />
                      <span className="text-sm">{data.activity_rate}%</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Progress value={data.transaction_rate} className="w-16" />
                      <span className="text-sm">{data.transaction_rate}%</span>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Revenue Efficiency */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Revenue Efficiency
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Revenue generation per user and per session
          </p>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Agent</TableHead>
                <TableHead>Total Revenue</TableHead>
                <TableHead>Total Users</TableHead>
                <TableHead>Total Sessions</TableHead>
                <TableHead>Revenue/User</TableHead>
                <TableHead>Revenue/Session</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {revenueEfficiency.map((data) => (
                <TableRow key={data.agent_id}>
                  <TableCell className="font-medium">{data.agent_name}</TableCell>
                  <TableCell>${data.total_revenue.toFixed(2)}</TableCell>
                  <TableCell>{data.total_users}</TableCell>
                  <TableCell>{data.total_sessions}</TableCell>
                  <TableCell>${data.revenue_per_user.toFixed(2)}</TableCell>
                  <TableCell>${data.revenue_per_session.toFixed(2)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Agent Churn Watch */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Agent Churn Watch
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Agents at risk of churning or already inactive
          </p>
        </CardHeader>
        <CardContent>
          {churnWatch.length === 0 ? (
            <Alert>
              <TrendingUp className="h-4 w-4" />
              <AlertDescription>
                Great news! No agents are currently at risk of churning.
              </AlertDescription>
            </Alert>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Agent</TableHead>
                  <TableHead>Last Activity</TableHead>
                  <TableHead>Days Inactive</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {churnWatch.map((data) => (
                  <TableRow key={data.agent_id}>
                    <TableCell className="font-medium">{data.agent_name}</TableCell>
                    <TableCell>{data.last_activity_date}</TableCell>
                    <TableCell>{data.days_inactive} days</TableCell>
                    <TableCell>{getStatusBadge(data.status, 'churn')}</TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm">
                        Send Reminder
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Fraud Risk Check */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Fraud Risk Check
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Agents with suspicious activity patterns
          </p>
        </CardHeader>
        <CardContent>
          {fraudRisks.length === 0 ? (
            <Alert>
              <Shield className="h-4 w-4" />
              <AlertDescription>
                No suspicious activity detected. All agents appear to be operating normally.
              </AlertDescription>
            </Alert>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Agent</TableHead>
                  <TableHead>Duplicate Users</TableHead>
                  <TableHead>SMS Ratio</TableHead>
                  <TableHead>Revenue Ratio</TableHead>
                  <TableHead>Risk Level</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {fraudRisks.map((data) => (
                  <TableRow key={data.agent_id}>
                    <TableCell className="font-medium">{data.agent_name}</TableCell>
                    <TableCell>
                      {data.duplicate_users > 0 && (
                        <span className="text-orange-600">{data.duplicate_users}</span>
                      )}
                    </TableCell>
                    <TableCell>{data.sms_ratio.toFixed(2)}</TableCell>
                    <TableCell>${data.revenue_ratio.toFixed(3)}</TableCell>
                    <TableCell>{getStatusBadge(data.risk_level, 'risk')}</TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm">
                        <AlertTriangle className="h-4 w-4 mr-2" />
                        Investigate
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};