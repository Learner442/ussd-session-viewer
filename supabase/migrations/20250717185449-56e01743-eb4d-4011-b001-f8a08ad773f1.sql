-- USSD Sessions Module
CREATE TABLE public.ussd_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id VARCHAR NOT NULL UNIQUE,
  phone_number VARCHAR NOT NULL,
  service_code VARCHAR NOT NULL,
  session_text TEXT,
  session_status VARCHAR NOT NULL DEFAULT 'active' CHECK (session_status IN ('active', 'completed', 'timeout', 'cancelled')),
  agent_id UUID REFERENCES public.agents(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  session_duration INTEGER, -- in seconds
  steps_count INTEGER DEFAULT 0,
  revenue_generated NUMERIC DEFAULT 0.00
);

-- Transactions Module (broader than agent transactions)
CREATE TABLE public.transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  transaction_id VARCHAR NOT NULL UNIQUE,
  user_phone VARCHAR NOT NULL,
  transaction_type VARCHAR NOT NULL CHECK (transaction_type IN ('send_money', 'receive_money', 'pay_bill', 'buy_airtime', 'withdraw', 'deposit')),
  amount NUMERIC NOT NULL,
  fee NUMERIC DEFAULT 0.00,
  currency VARCHAR DEFAULT 'XAF',
  status VARCHAR NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'cancelled')),
  agent_id UUID REFERENCES public.agents(id),
  ussd_session_id UUID REFERENCES public.ussd_sessions(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  failure_reason TEXT,
  metadata JSONB
);

-- SMS Management Module
CREATE TABLE public.sms_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  phone_number VARCHAR NOT NULL,
  message_content TEXT NOT NULL,
  message_type VARCHAR NOT NULL CHECK (message_type IN ('notification', 'confirmation', 'alert', 'marketing', 'otp')),
  status VARCHAR NOT NULL DEFAULT 'sent' CHECK (status IN ('sent', 'delivered', 'failed', 'pending')),
  agent_id UUID REFERENCES public.agents(id),
  transaction_id UUID REFERENCES public.transactions(id),
  cost NUMERIC DEFAULT 0.00,
  provider VARCHAR,
  sent_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  delivered_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Cost Analytics Module
CREATE TABLE public.cost_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  category_name VARCHAR NOT NULL UNIQUE,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.cost_entries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  category_id UUID NOT NULL REFERENCES public.cost_categories(id),
  description TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  cost_type VARCHAR NOT NULL CHECK (cost_type IN ('operational', 'infrastructure', 'marketing', 'personnel', 'other')),
  cost_date DATE NOT NULL,
  agent_id UUID REFERENCES public.agents(id),
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- FX Configuration Module
CREATE TABLE public.fx_rates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  from_currency VARCHAR NOT NULL,
  to_currency VARCHAR NOT NULL,
  rate NUMERIC NOT NULL,
  is_active BOOLEAN DEFAULT true,
  effective_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(from_currency, to_currency)
);

CREATE TABLE public.fx_rate_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  fx_rate_id UUID NOT NULL REFERENCES public.fx_rates(id),
  old_rate NUMERIC NOT NULL,
  new_rate NUMERIC NOT NULL,
  changed_by UUID,
  changed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Rates Configuration Module
CREATE TABLE public.service_rates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  service_name VARCHAR NOT NULL,
  service_type VARCHAR NOT NULL CHECK (service_type IN ('transaction', 'sms', 'commission', 'fee')),
  rate_value NUMERIC NOT NULL,
  rate_type VARCHAR NOT NULL CHECK (rate_type IN ('percentage', 'fixed', 'tiered')),
  min_amount NUMERIC DEFAULT 0,
  max_amount NUMERIC,
  currency VARCHAR DEFAULT 'XAF',
  is_active BOOLEAN DEFAULT true,
  effective_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- User Management Module
CREATE TABLE public.user_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  phone_number VARCHAR NOT NULL UNIQUE,
  user_type VARCHAR NOT NULL CHECK (user_type IN ('regular', 'premium', 'agent', 'admin')),
  status VARCHAR NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'inactive')),
  registration_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_activity_date TIMESTAMP WITH TIME ZONE,
  kyc_status VARCHAR DEFAULT 'pending' CHECK (kyc_status IN ('pending', 'verified', 'rejected')),
  agent_id UUID REFERENCES public.agents(id),
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.user_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_phone VARCHAR NOT NULL,
  session_type VARCHAR NOT NULL CHECK (session_type IN ('ussd', 'web', 'mobile', 'api')),
  start_time TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  end_time TIMESTAMP WITH TIME ZONE,
  duration INTEGER, -- in seconds
  ip_address INET,
  user_agent TEXT,
  status VARCHAR NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'expired')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.ussd_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sms_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cost_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cost_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fx_rates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fx_rate_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_rates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;

-- Create public access policies for all tables
CREATE POLICY "Anyone can view ussd sessions" ON public.ussd_sessions FOR SELECT USING (true);
CREATE POLICY "Anyone can manage ussd sessions" ON public.ussd_sessions FOR ALL USING (true);

CREATE POLICY "Anyone can view transactions" ON public.transactions FOR SELECT USING (true);
CREATE POLICY "Anyone can manage transactions" ON public.transactions FOR ALL USING (true);

CREATE POLICY "Anyone can view sms logs" ON public.sms_logs FOR SELECT USING (true);
CREATE POLICY "Anyone can manage sms logs" ON public.sms_logs FOR ALL USING (true);

CREATE POLICY "Anyone can view cost categories" ON public.cost_categories FOR SELECT USING (true);
CREATE POLICY "Anyone can manage cost categories" ON public.cost_categories FOR ALL USING (true);

CREATE POLICY "Anyone can view cost entries" ON public.cost_entries FOR SELECT USING (true);
CREATE POLICY "Anyone can manage cost entries" ON public.cost_entries FOR ALL USING (true);

CREATE POLICY "Anyone can view fx rates" ON public.fx_rates FOR SELECT USING (true);
CREATE POLICY "Anyone can manage fx rates" ON public.fx_rates FOR ALL USING (true);

CREATE POLICY "Anyone can view fx rate history" ON public.fx_rate_history FOR SELECT USING (true);
CREATE POLICY "Anyone can manage fx rate history" ON public.fx_rate_history FOR ALL USING (true);

CREATE POLICY "Anyone can view service rates" ON public.service_rates FOR SELECT USING (true);
CREATE POLICY "Anyone can manage service rates" ON public.service_rates FOR ALL USING (true);

CREATE POLICY "Anyone can view user profiles" ON public.user_profiles FOR SELECT USING (true);
CREATE POLICY "Anyone can manage user profiles" ON public.user_profiles FOR ALL USING (true);

CREATE POLICY "Anyone can view user sessions" ON public.user_sessions FOR SELECT USING (true);
CREATE POLICY "Anyone can manage user sessions" ON public.user_sessions FOR ALL USING (true);

-- Create indexes for better performance
CREATE INDEX idx_ussd_sessions_phone ON public.ussd_sessions(phone_number);
CREATE INDEX idx_ussd_sessions_agent ON public.ussd_sessions(agent_id);
CREATE INDEX idx_ussd_sessions_status ON public.ussd_sessions(session_status);
CREATE INDEX idx_ussd_sessions_created ON public.ussd_sessions(created_at);

CREATE INDEX idx_transactions_phone ON public.transactions(user_phone);
CREATE INDEX idx_transactions_agent ON public.transactions(agent_id);
CREATE INDEX idx_transactions_status ON public.transactions(status);
CREATE INDEX idx_transactions_created ON public.transactions(created_at);
CREATE INDEX idx_transactions_type ON public.transactions(transaction_type);

CREATE INDEX idx_sms_logs_phone ON public.sms_logs(phone_number);
CREATE INDEX idx_sms_logs_agent ON public.sms_logs(agent_id);
CREATE INDEX idx_sms_logs_type ON public.sms_logs(message_type);
CREATE INDEX idx_sms_logs_sent ON public.sms_logs(sent_at);

CREATE INDEX idx_cost_entries_category ON public.cost_entries(category_id);
CREATE INDEX idx_cost_entries_date ON public.cost_entries(cost_date);
CREATE INDEX idx_cost_entries_agent ON public.cost_entries(agent_id);

CREATE INDEX idx_user_profiles_phone ON public.user_profiles(phone_number);
CREATE INDEX idx_user_profiles_agent ON public.user_profiles(agent_id);
CREATE INDEX idx_user_profiles_status ON public.user_profiles(status);

CREATE INDEX idx_user_sessions_phone ON public.user_sessions(user_phone);
CREATE INDEX idx_user_sessions_type ON public.user_sessions(session_type);
CREATE INDEX idx_user_sessions_start ON public.user_sessions(start_time);

-- Create triggers for updated_at columns
CREATE TRIGGER update_ussd_sessions_updated_at
  BEFORE UPDATE ON public.ussd_sessions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_transactions_updated_at
  BEFORE UPDATE ON public.transactions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_cost_entries_updated_at
  BEFORE UPDATE ON public.cost_entries
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_fx_rates_updated_at
  BEFORE UPDATE ON public.fx_rates
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_service_rates_updated_at
  BEFORE UPDATE ON public.service_rates
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default cost categories
INSERT INTO public.cost_categories (category_name, description) VALUES
('Infrastructure', 'Server, hosting, and infrastructure costs'),
('Personnel', 'Staff salaries and benefits'),
('Marketing', 'Advertising and promotional activities'),
('Operations', 'Day-to-day operational expenses'),
('Maintenance', 'System maintenance and updates'),
('Compliance', 'Regulatory and compliance costs');

-- Insert default service rates
INSERT INTO public.service_rates (service_name, service_type, rate_value, rate_type, currency) VALUES
('Money Transfer Fee', 'transaction', 0.02, 'percentage', 'XAF'),
('Bill Payment Fee', 'transaction', 100, 'fixed', 'XAF'),
('Airtime Purchase Fee', 'transaction', 0.01, 'percentage', 'XAF'),
('SMS Notification', 'sms', 25, 'fixed', 'XAF'),
('Agent Commission', 'commission', 0.005, 'percentage', 'XAF');

-- Insert default FX rates (example rates)
INSERT INTO public.fx_rates (from_currency, to_currency, rate) VALUES
('XAF', 'USD', 0.0016),
('USD', 'XAF', 625.0),
('XAF', 'EUR', 0.0015),
('EUR', 'XAF', 655.0);