-- Create USSD configuration tables for dynamic menu management

-- 1. USSD Services table (to define available services)
CREATE TABLE public.ussd_services (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  service_code VARCHAR(10) NOT NULL UNIQUE,
  service_name VARCHAR(255) NOT NULL,
  service_type VARCHAR(100) NOT NULL, -- e.g., 'balance_check', 'bill_payment', 'loan_service'
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 2. MNO (Mobile Network Operator) table
CREATE TABLE public.mnos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  mno_code VARCHAR(20) NOT NULL UNIQUE, -- e.g., 'VODACOM', 'AIRTEL', 'ORANGE'
  mno_name VARCHAR(100) NOT NULL,
  country VARCHAR(50),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 3. USSD Menu Flows table (main menu configuration)
CREATE TABLE public.ussd_menu_flows (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  flow_name VARCHAR(255) NOT NULL,
  service_id UUID REFERENCES public.ussd_services(id) ON DELETE CASCADE,
  version INTEGER NOT NULL DEFAULT 1,
  is_active BOOLEAN DEFAULT false,
  is_published BOOLEAN DEFAULT false,
  scheduled_publish_at TIMESTAMP WITH TIME ZONE,
  language VARCHAR(10) DEFAULT 'en',
  description TEXT,
  created_by VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(service_id, version)
);

-- 4. USSD Menu Steps table (individual menu steps/screens)
CREATE TABLE public.ussd_menu_steps (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  flow_id UUID REFERENCES public.ussd_menu_flows(id) ON DELETE CASCADE,
  step_number INTEGER NOT NULL,
  step_name VARCHAR(255) NOT NULL,
  menu_text TEXT NOT NULL,
  response_type VARCHAR(50) NOT NULL, -- 'input', 'selection', 'confirmation', 'end'
  timeout_seconds INTEGER DEFAULT 30,
  fallback_message TEXT,
  is_initial_step BOOLEAN DEFAULT false,
  parent_step_id UUID REFERENCES public.ussd_menu_steps(id),
  api_endpoint VARCHAR(500), -- for backend integration
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 5. USSD Menu Options table (for selection-type steps)
CREATE TABLE public.ussd_menu_options (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  step_id UUID REFERENCES public.ussd_menu_steps(id) ON DELETE CASCADE,
  option_number INTEGER NOT NULL,
  option_text VARCHAR(255) NOT NULL,
  option_value VARCHAR(100),
  next_step_id UUID REFERENCES public.ussd_menu_steps(id),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 6. USSD Flow MNO Mapping table (link flows to specific MNOs)
CREATE TABLE public.ussd_flow_mno_mapping (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  flow_id UUID REFERENCES public.ussd_menu_flows(id) ON DELETE CASCADE,
  mno_id UUID REFERENCES public.mnos(id) ON DELETE CASCADE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(flow_id, mno_id)
);

-- 7. USSD Flow History table (audit trail)
CREATE TABLE public.ussd_flow_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  flow_id UUID REFERENCES public.ussd_menu_flows(id) ON DELETE CASCADE,
  action VARCHAR(50) NOT NULL, -- 'created', 'updated', 'published', 'scheduled', 'rolled_back'
  changes_description TEXT,
  performed_by VARCHAR(255),
  performed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  old_version INTEGER,
  new_version INTEGER
);

-- Enable RLS on all tables
ALTER TABLE public.ussd_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mnos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ussd_menu_flows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ussd_menu_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ussd_menu_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ussd_flow_mno_mapping ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ussd_flow_history ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for all tables (allowing full access for now)
CREATE POLICY "Anyone can view ussd services" ON public.ussd_services FOR SELECT USING (true);
CREATE POLICY "Anyone can manage ussd services" ON public.ussd_services FOR ALL USING (true);

CREATE POLICY "Anyone can view mnos" ON public.mnos FOR SELECT USING (true);
CREATE POLICY "Anyone can manage mnos" ON public.mnos FOR ALL USING (true);

CREATE POLICY "Anyone can view ussd menu flows" ON public.ussd_menu_flows FOR SELECT USING (true);
CREATE POLICY "Anyone can manage ussd menu flows" ON public.ussd_menu_flows FOR ALL USING (true);

CREATE POLICY "Anyone can view ussd menu steps" ON public.ussd_menu_steps FOR SELECT USING (true);
CREATE POLICY "Anyone can manage ussd menu steps" ON public.ussd_menu_steps FOR ALL USING (true);

CREATE POLICY "Anyone can view ussd menu options" ON public.ussd_menu_options FOR SELECT USING (true);
CREATE POLICY "Anyone can manage ussd menu options" ON public.ussd_menu_options FOR ALL USING (true);

CREATE POLICY "Anyone can view ussd flow mno mapping" ON public.ussd_flow_mno_mapping FOR SELECT USING (true);
CREATE POLICY "Anyone can manage ussd flow mno mapping" ON public.ussd_flow_mno_mapping FOR ALL USING (true);

CREATE POLICY "Anyone can view ussd flow history" ON public.ussd_flow_history FOR SELECT USING (true);
CREATE POLICY "Anyone can manage ussd flow history" ON public.ussd_flow_history FOR ALL USING (true);

-- Add updated_at triggers
CREATE TRIGGER update_ussd_services_updated_at
  BEFORE UPDATE ON public.ussd_services
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_mnos_updated_at
  BEFORE UPDATE ON public.mnos
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_ussd_menu_flows_updated_at
  BEFORE UPDATE ON public.ussd_menu_flows
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_ussd_menu_steps_updated_at
  BEFORE UPDATE ON public.ussd_menu_steps
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert some sample data
INSERT INTO public.mnos (mno_code, mno_name, country) VALUES
('VODACOM', 'Vodacom', 'Tanzania'),
('AIRTEL', 'Airtel', 'Tanzania'),
('ORANGE', 'Orange', 'Cameroon'),
('MTN', 'MTN', 'Cameroon');

INSERT INTO public.ussd_services (service_code, service_name, service_type, description) VALUES
('*150*1#', 'Balance Check', 'balance_check', 'Check account balance'),
('*150*2#', 'Bill Payment', 'bill_payment', 'Pay utility bills'),
('*150*3#', 'Loan Service', 'loan_service', 'Request and manage loans'),
('*150*4#', 'Money Transfer', 'money_transfer', 'Send and receive money');

-- Create indexes for better performance
CREATE INDEX idx_ussd_menu_flows_service_id ON public.ussd_menu_flows(service_id);
CREATE INDEX idx_ussd_menu_flows_is_active ON public.ussd_menu_flows(is_active);
CREATE INDEX idx_ussd_menu_steps_flow_id ON public.ussd_menu_steps(flow_id);
CREATE INDEX idx_ussd_menu_steps_parent_step_id ON public.ussd_menu_steps(parent_step_id);
CREATE INDEX idx_ussd_menu_options_step_id ON public.ussd_menu_options(step_id);
CREATE INDEX idx_ussd_flow_mno_mapping_flow_id ON public.ussd_flow_mno_mapping(flow_id);
CREATE INDEX idx_ussd_flow_mno_mapping_mno_id ON public.ussd_flow_mno_mapping(mno_id);