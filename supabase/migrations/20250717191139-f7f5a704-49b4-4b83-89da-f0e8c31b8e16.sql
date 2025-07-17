-- Insert sample commission rules for testing the commission calculator
INSERT INTO commission_rules (rule_name, rule_type, rate, bonus_threshold, bonus_amount, is_active) VALUES
('Per Active User Commission', 'per_active_user', 2.50, NULL, NULL, true),
('Per Session Commission', 'per_session', 0.75, NULL, NULL, true),
('SMS Commission', 'per_sms', 0.05, NULL, NULL, true),
('Transaction Volume Bonus', 'transaction_bonus', 0.00, 50, 25.00, true);

-- Insert sample recruited users for existing agents
INSERT INTO agent_recruited_users (agent_id, user_phone, user_type, is_active, registration_date)
SELECT 
    id as agent_id,
    '+243123456789' as user_phone,
    'citizen' as user_type,
    true as is_active,
    NOW() - interval '30 days' as registration_date
FROM agents
WHERE status IN ('active', 'pending')
LIMIT 10;