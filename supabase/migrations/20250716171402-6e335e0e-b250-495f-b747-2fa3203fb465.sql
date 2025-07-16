-- Create enum for agent status
CREATE TYPE public.agent_status AS ENUM ('pending', 'active', 'suspended', 'inactive');

-- Create agents table
CREATE TABLE public.agents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  agent_id VARCHAR(20) NOT NULL UNIQUE,
  agent_name VARCHAR(255) NOT NULL,
  phone_number VARCHAR(20) NOT NULL,
  region VARCHAR(100) NOT NULL,
  supervisor VARCHAR(255) NOT NULL,
  initial_topup DECIMAL(10,2) DEFAULT 0.00,
  auto_kyc BOOLEAN DEFAULT true,
  status agent_status DEFAULT 'pending',
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create agent services table for many-to-many relationship
CREATE TABLE public.agent_services (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  agent_id UUID NOT NULL REFERENCES public.agents(id) ON DELETE CASCADE,
  service_type VARCHAR(50) NOT NULL,
  rate DECIMAL(10,2) NOT NULL,
  rate_type VARCHAR(20) NOT NULL CHECK (rate_type IN ('percentage', 'fixed')),
  is_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(agent_id, service_type)
);

-- Create agent wallet table
CREATE TABLE public.agent_wallets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  agent_id UUID NOT NULL REFERENCES public.agents(id) ON DELETE CASCADE UNIQUE,
  balance DECIMAL(15,2) DEFAULT 0.00,
  total_transactions DECIMAL(15,2) DEFAULT 0.00,
  last_transaction_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_wallets ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for agents table
CREATE POLICY "Authenticated users can view agents" 
ON public.agents 
FOR SELECT 
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can create agents" 
ON public.agents 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their created agents" 
ON public.agents 
FOR UPDATE 
TO authenticated
USING (auth.uid() = created_by);

-- Create RLS policies for agent_services table
CREATE POLICY "Users can view agent services" 
ON public.agent_services 
FOR SELECT 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.agents 
    WHERE agents.id = agent_services.agent_id 
    AND agents.created_by = auth.uid()
  )
);

CREATE POLICY "Users can manage agent services" 
ON public.agent_services 
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.agents 
    WHERE agents.id = agent_services.agent_id 
    AND agents.created_by = auth.uid()
  )
);

-- Create RLS policies for agent_wallets table
CREATE POLICY "Users can view agent wallets" 
ON public.agent_wallets 
FOR SELECT 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.agents 
    WHERE agents.id = agent_wallets.agent_id 
    AND agents.created_by = auth.uid()
  )
);

CREATE POLICY "Users can manage agent wallets" 
ON public.agent_wallets 
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.agents 
    WHERE agents.id = agent_wallets.agent_id 
    AND agents.created_by = auth.uid()
  )
);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_agents_updated_at
BEFORE UPDATE ON public.agents
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_agent_wallets_updated_at
BEFORE UPDATE ON public.agent_wallets
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to generate agent ID
CREATE OR REPLACE FUNCTION public.generate_agent_id()
RETURNS TEXT AS $$
DECLARE
  new_id TEXT;
  counter INTEGER := 1;
BEGIN
  LOOP
    new_id := 'AGT_' || LPAD(counter::TEXT, 3, '0');
    IF NOT EXISTS (SELECT 1 FROM public.agents WHERE agent_id = new_id) THEN
      RETURN new_id;
    END IF;
    counter := counter + 1;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-generate agent_id
CREATE OR REPLACE FUNCTION public.set_agent_id()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.agent_id IS NULL OR NEW.agent_id = '' THEN
    NEW.agent_id := public.generate_agent_id();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_agent_id_trigger
BEFORE INSERT ON public.agents
FOR EACH ROW
EXECUTE FUNCTION public.set_agent_id();

-- Create trigger to auto-create wallet for new agents
CREATE OR REPLACE FUNCTION public.create_agent_wallet()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.agent_wallets (agent_id, balance)
  VALUES (NEW.id, COALESCE(NEW.initial_topup, 0.00));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER create_agent_wallet_trigger
AFTER INSERT ON public.agents
FOR EACH ROW
EXECUTE FUNCTION public.create_agent_wallet();