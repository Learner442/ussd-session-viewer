-- Create sales_agent_wallets table
CREATE TABLE public.sales_agent_wallets (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    sales_agent_id UUID NOT NULL UNIQUE,
    balance NUMERIC(12,2) DEFAULT 0.00,
    commission_balance NUMERIC(12,2) DEFAULT 0.00,
    total_earnings NUMERIC(12,2) DEFAULT 0.00,
    last_transaction_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    FOREIGN KEY (sales_agent_id) REFERENCES public.sales_agents(id) ON DELETE CASCADE
);

-- Enable RLS on sales_agent_wallets
ALTER TABLE public.sales_agent_wallets ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for sales_agent_wallets
CREATE POLICY "Anyone can view sales agent wallets" ON public.sales_agent_wallets FOR SELECT USING (true);
CREATE POLICY "Anyone can manage sales agent wallets" ON public.sales_agent_wallets FOR ALL USING (true);

-- Create trigger for updated_at
CREATE TRIGGER update_sales_agent_wallets_updated_at
  BEFORE UPDATE ON public.sales_agent_wallets
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to automatically create wallet for new sales agents
CREATE OR REPLACE FUNCTION public.create_sales_agent_wallet()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO public.sales_agent_wallets (sales_agent_id, balance, commission_balance)
  VALUES (NEW.id, COALESCE(NEW.initial_budget, 0.00), 0.00);
  RETURN NEW;
END;
$$;

-- Create trigger to auto-create wallet for new sales agents
CREATE TRIGGER create_sales_agent_wallet_trigger
  AFTER INSERT ON public.sales_agents
  FOR EACH ROW
  EXECUTE FUNCTION public.create_sales_agent_wallet();

-- Create wallets for existing sales agents
INSERT INTO public.sales_agent_wallets (sales_agent_id, balance, commission_balance)
SELECT id, initial_budget, 0.00
FROM public.sales_agents
ON CONFLICT (sales_agent_id) DO NOTHING;