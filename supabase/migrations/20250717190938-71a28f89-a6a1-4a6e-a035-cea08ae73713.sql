-- Insert sample commission rules for testing the commission calculator
INSERT INTO commission_rules (rule_name, rule_type, rate, bonus_threshold, bonus_amount, is_active) VALUES
('Per Active User Commission', 'per_active_user', 2.50, NULL, NULL, true),
('Per Session Commission', 'per_session', 0.75, NULL, NULL, true),
('SMS Commission', 'per_sms', 0.05, NULL, NULL, true),
('Transaction Volume Bonus', 'transaction_bonus', 0.00, 50, 25.00, true);

-- Insert some sample recruited users and activities for existing agents
INSERT INTO agent_recruited_users (agent_id, user_phone, user_type, is_active, registration_date) 
SELECT 
    id as agent_id,
    '+243' || (random() * 1000000000)::int as user_phone,
    CASE 
        WHEN random() < 0.5 THEN 'citizen'
        WHEN random() < 0.8 THEN 'merchant'
        ELSE 'agent'
    END as user_type,
    CASE WHEN random() < 0.8 THEN true ELSE false END as is_active,
    NOW() - (random() * interval '90 days') as registration_date
FROM agents
CROSS JOIN generate_series(1, (random() * 10 + 5)::int);

-- Insert some sample sessions for recruited users
WITH user_sessions AS (
    SELECT 
        aru.agent_id,
        aru.id as recruited_user_id,
        'ussd_session' as session_type,
        CASE WHEN random() < 0.7 THEN true ELSE false END as is_completed,
        NOW() - (random() * interval '30 days') as session_date
    FROM agent_recruited_users aru
    CROSS JOIN generate_series(1, (random() * 5 + 1)::int)
)
INSERT INTO agent_user_sessions (agent_id, recruited_user_id, session_type, is_completed, session_date)
SELECT agent_id, recruited_user_id, session_type, is_completed, session_date
FROM user_sessions;

-- Insert some sample SMS records
WITH sms_records AS (
    SELECT 
        aru.agent_id,
        aru.id as recruited_user_id,
        (random() * 5 + 1)::int as sms_count,
        NOW() - (random() * interval '30 days') as sms_date
    FROM agent_recruited_users aru
    CROSS JOIN generate_series(1, (random() * 3 + 1)::int)
)
INSERT INTO agent_user_sms (agent_id, recruited_user_id, sms_count, sms_date)
SELECT agent_id, recruited_user_id, sms_count, sms_date
FROM sms_records;

-- Insert some sample transactions
WITH transactions AS (
    SELECT 
        aru.agent_id,
        aru.id as recruited_user_id,
        (random() * 1000 + 50)::numeric(10,2) as transaction_amount,
        CASE 
            WHEN random() < 0.3 THEN 'money_transfer'
            WHEN random() < 0.6 THEN 'bill_payment'
            ELSE 'mobile_topup'
        END as transaction_type,
        NOW() - (random() * interval '30 days') as transaction_date,
        (random() * 50 + 10)::numeric(10,2) as revenue_generated
    FROM agent_recruited_users aru
    WHERE aru.is_active = true
    CROSS JOIN generate_series(1, (random() * 8 + 2)::int)
)
INSERT INTO agent_user_transactions (agent_id, recruited_user_id, transaction_amount, transaction_type, transaction_date, revenue_generated)
SELECT agent_id, recruited_user_id, transaction_amount, transaction_type, transaction_date, revenue_generated
FROM transactions;