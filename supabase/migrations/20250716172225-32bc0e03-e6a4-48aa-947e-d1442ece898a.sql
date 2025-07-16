-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Authenticated users can create agents" ON public.agents;
DROP POLICY IF EXISTS "Authenticated users can view agents" ON public.agents;
DROP POLICY IF EXISTS "Users can update their created agents" ON public.agents;

-- Create new public access policies
CREATE POLICY "Anyone can view agents" 
ON public.agents 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can create agents" 
ON public.agents 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can update agents" 
ON public.agents 
FOR UPDATE 
USING (true);

-- Update agent_services policies to allow public access
DROP POLICY IF EXISTS "Users can view agent services" ON public.agent_services;
DROP POLICY IF EXISTS "Users can manage agent services" ON public.agent_services;

CREATE POLICY "Anyone can view agent services" 
ON public.agent_services 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can manage agent services" 
ON public.agent_services 
FOR ALL
USING (true);

-- Update agent_wallets policies to allow public access  
DROP POLICY IF EXISTS "Users can view agent wallets" ON public.agent_wallets;
DROP POLICY IF EXISTS "Users can manage agent wallets" ON public.agent_wallets;

CREATE POLICY "Anyone can view agent wallets" 
ON public.agent_wallets 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can manage agent wallets" 
ON public.agent_wallets 
FOR ALL
USING (true);