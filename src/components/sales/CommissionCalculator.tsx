import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Calculator, Save, DollarSign, Settings, Users, MessageSquare, Activity } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface CommissionRule {
  id: string;
  rule_name: string;
  rule_type: string;
  rate: number;
  bonus_threshold?: number;
  bonus_amount?: number;
  is_active: boolean;
}

interface AgentCommission {
  agent_id: string;
  agent_name: string;
  active_users: number;
  completed_sessions: number;
  sms_count: number;
  transactions_count: number;
  calculated_commission: number;
}

export const CommissionCalculator = () => {
  const { toast } = useToast();
  const [commissionRules, setCommissionRules] = useState<CommissionRule[]>([]);
  const [agentCommissions, setAgentCommissions] = useState<AgentCommission[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState('current_month');
  const [loading, setLoading] = useState(true);
  const [calculating, setCalculating] = useState(false);

  useEffect(() => {
    loadCommissionRules();
    calculateCommissions();
  }, [selectedPeriod]);

  const loadCommissionRules = async () => {
    try {
      const { data, error } = await supabase
        .from('commission_rules')
        .select('*')
        .eq('is_active', true)
        .order('rule_type');

      if (error) throw error;
      setCommissionRules(data || []);
    } catch (error) {
      console.error('Error loading commission rules:', error);
      toast({
        title: "Error loading rules",
        description: "Failed to load commission rules.",
        variant: "destructive"
      });
    }
  };

  const calculateCommissions = async () => {
    try {
      setCalculating(true);

      // Load agents and their performance data
      const { data: agents, error: agentsError } = await supabase
        .from('agents')
        .select(`
          id,
          agent_id,
          agent_name,
          status
        `)
        .eq('status', 'active');

      if (agentsError) throw agentsError;

      const commissionCalculations: AgentCommission[] = [];

      for (const agent of agents || []) {
        // Load recruited users count
        const { data: users, error: usersError } = await supabase
          .from('agent_recruited_users')
          .select('*')
          .eq('agent_id', agent.id)
          .eq('is_active', true);

        if (usersError) throw usersError;

        // Load completed sessions count
        const { data: sessions, error: sessionsError } = await supabase
          .from('agent_user_sessions')
          .select('*')
          .eq('agent_id', agent.id)
          .eq('is_completed', true);

        if (sessionsError) throw sessionsError;

        // Load SMS count
        const { data: sms, error: smsError } = await supabase
          .from('agent_user_sms')
          .select('sms_count')
          .eq('agent_id', agent.id);

        if (smsError) throw smsError;

        // Load transactions count
        const { data: transactions, error: transactionsError } = await supabase
          .from('agent_user_transactions')
          .select('*')
          .eq('agent_id', agent.id);

        if (transactionsError) throw transactionsError;

        const activeUsers = users?.length || 0;
        const completedSessions = sessions?.length || 0;
        const totalSms = sms?.reduce((sum, s) => sum + (s.sms_count || 0), 0) || 0;
        const transactionsCount = transactions?.length || 0;

        // Calculate commission based on rules
        let totalCommission = 0;

        commissionRules.forEach(rule => {
          switch (rule.rule_type) {
            case 'per_active_user':
              totalCommission += activeUsers * rule.rate;
              break;
            case 'per_session':
              totalCommission += completedSessions * rule.rate;
              break;
            case 'per_sms':
              totalCommission += totalSms * rule.rate;
              break;
            case 'transaction_bonus':
              if (rule.bonus_threshold && transactionsCount >= rule.bonus_threshold) {
                const bonuses = Math.floor(transactionsCount / rule.bonus_threshold);
                totalCommission += bonuses * (rule.bonus_amount || 0);
              }
              break;
          }
        });

        commissionCalculations.push({
          agent_id: agent.agent_id,
          agent_name: agent.agent_name,
          active_users: activeUsers,
          completed_sessions: completedSessions,
          sms_count: totalSms,
          transactions_count: transactionsCount,
          calculated_commission: totalCommission
        });
      }

      setAgentCommissions(commissionCalculations);
    } catch (error) {
      console.error('Error calculating commissions:', error);
      toast({
        title: "Calculation Error",
        description: "Failed to calculate commissions.",
        variant: "destructive"
      });
    } finally {
      setCalculating(false);
      setLoading(false);
    }
  };

  const saveCommissionCalculation = async (agentCommission: AgentCommission) => {
    try {
      const startDate = new Date();
      startDate.setDate(1); // First day of month
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + 1, 0); // Last day of month

      const { error } = await supabase
        .from('agent_commissions')
        .insert({
          agent_id: agentCommission.agent_id,
          calculation_period_start: startDate.toISOString().split('T')[0],
          calculation_period_end: endDate.toISOString().split('T')[0],
          active_users_count: agentCommission.active_users,
          completed_sessions_count: agentCommission.completed_sessions,
          sms_count: agentCommission.sms_count,
          total_commission: agentCommission.calculated_commission
        });

      if (error) throw error;

      toast({
        title: "Commission Saved",
        description: `Commission calculation saved for ${agentCommission.agent_name}`,
      });
    } catch (error) {
      console.error('Error saving commission:', error);
      toast({
        title: "Save Error",
        description: "Failed to save commission calculation.",
        variant: "destructive"
      });
    }
  };

  const getRuleIcon = (ruleType: string) => {
    switch (ruleType) {
      case 'per_active_user':
        return <Users className="h-4 w-4" />;
      case 'per_session':
        return <Activity className="h-4 w-4" />;
      case 'per_sms':
        return <MessageSquare className="h-4 w-4" />;
      case 'transaction_bonus':
        return <DollarSign className="h-4 w-4" />;
      default:
        return <Calculator className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Commission Rules */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Commission Rules
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Current commission calculation rules and rates
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {commissionRules.map((rule) => (
              <div key={rule.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  {getRuleIcon(rule.rule_type)}
                  <div>
                    <p className="font-medium">{rule.rule_name}</p>
                    <p className="text-sm text-muted-foreground">
                      Rate: ${rule.rate.toFixed(4)}
                      {rule.bonus_threshold && (
                        <> • Bonus: ${rule.bonus_amount} per {rule.bonus_threshold} transactions</>
                      )}
                    </p>
                  </div>
                </div>
                <Badge variant="outline">Active</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Period Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Calculation Period</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 items-center">
            <Label htmlFor="period">Select Period:</Label>
            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="current_month">Current Month</SelectItem>
                <SelectItem value="last_month">Last Month</SelectItem>
                <SelectItem value="current_quarter">Current Quarter</SelectItem>
                <SelectItem value="last_quarter">Last Quarter</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={calculateCommissions} disabled={calculating}>
              <Calculator className="h-4 w-4 mr-2" />
              {calculating ? 'Calculating...' : 'Recalculate'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Commission Calculations */}
      <Card>
        <CardHeader>
          <CardTitle>Commission Calculations</CardTitle>
          <p className="text-sm text-muted-foreground">
            Calculated commissions based on current rules and agent performance
          </p>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading commission calculations...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Agent ID</TableHead>
                  <TableHead>Agent Name</TableHead>
                  <TableHead>Active Users</TableHead>
                  <TableHead>Sessions</TableHead>
                  <TableHead>SMS Sent</TableHead>
                  <TableHead>Transactions</TableHead>
                  <TableHead>Commission</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {agentCommissions.map((commission) => (
                  <TableRow key={commission.agent_id}>
                    <TableCell className="font-medium">{commission.agent_id}</TableCell>
                    <TableCell>{commission.agent_name}</TableCell>
                    <TableCell>{commission.active_users}</TableCell>
                    <TableCell>{commission.completed_sessions}</TableCell>
                    <TableCell>{commission.sms_count}</TableCell>
                    <TableCell>{commission.transactions_count}</TableCell>
                    <TableCell className="font-semibold text-green-600">
                      ${commission.calculated_commission.toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => saveCommissionCalculation(commission)}
                      >
                        <Save className="h-4 w-4 mr-2" />
                        Save
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {!loading && agentCommissions.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No commission data available for the selected period.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};