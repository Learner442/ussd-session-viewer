-- Create sales_agent_commissions table
CREATE TABLE public.sales_agent_commissions (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    sales_agent_id UUID NOT NULL,
    calculation_period_start DATE NOT NULL,
    calculation_period_end DATE NOT NULL,
    supervised_agents_count INTEGER DEFAULT 0,
    total_agent_revenue NUMERIC(12,2) DEFAULT 0.00,
    total_agent_commissions NUMERIC(12,2) DEFAULT 0.00,
    sales_agent_commission NUMERIC(12,2) DEFAULT 0.00,
    performance_bonus NUMERIC(12,2) DEFAULT 0.00,
    total_earning NUMERIC(12,2) DEFAULT 0.00,
    is_paid BOOLEAN DEFAULT FALSE,
    paid_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    FOREIGN KEY (sales_agent_id) REFERENCES public.sales_agents(id) ON DELETE CASCADE
);

-- Enable RLS on sales_agent_commissions
ALTER TABLE public.sales_agent_commissions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for sales_agent_commissions
CREATE POLICY "Anyone can view sales agent commissions" ON public.sales_agent_commissions FOR SELECT USING (true);
CREATE POLICY "Anyone can manage sales agent commissions" ON public.sales_agent_commissions FOR ALL USING (true);

-- Create trigger for updated_at
CREATE TRIGGER update_sales_agent_commissions_updated_at
  BEFORE UPDATE ON public.sales_agent_commissions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_sales_agent_commissions_sales_agent_id ON public.sales_agent_commissions(sales_agent_id);
CREATE INDEX idx_sales_agent_commissions_period ON public.sales_agent_commissions(calculation_period_start, calculation_period_end);