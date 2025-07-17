-- Add sales_agent_id column to agents table
ALTER TABLE public.agents ADD COLUMN sales_agent_id UUID;

-- Add foreign key constraint to reference sales_agents table
ALTER TABLE public.agents ADD CONSTRAINT fk_agents_sales_agent 
    FOREIGN KEY (sales_agent_id) REFERENCES public.sales_agents(id);

-- Update existing agents to reference their sales agents
UPDATE public.agents 
SET sales_agent_id = (
    SELECT sa.id 
    FROM public.sales_agents sa 
    WHERE sa.agent_name = public.agents.supervisor
    LIMIT 1
)
WHERE supervisor IS NOT NULL AND supervisor != '';

-- Create index for better performance
CREATE INDEX idx_agents_sales_agent_id ON public.agents(sales_agent_id);

-- Drop the old supervisor column (after data migration)
-- We'll keep it for now and remove it in a later migration if needed
-- ALTER TABLE public.agents DROP COLUMN supervisor;