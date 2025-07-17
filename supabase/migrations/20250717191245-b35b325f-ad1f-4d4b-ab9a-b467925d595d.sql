-- Insert sample sessions for recruited users
INSERT INTO agent_user_sessions (agent_id, recruited_user_id, session_type, is_completed, session_date)
SELECT 
    aru.agent_id,
    aru.id as recruited_user_id,
    'ussd_session' as session_type,
    true as is_completed,
    NOW() - interval '15 days' as session_date
FROM agent_recruited_users aru
LIMIT 15;

-- Insert sample SMS records
INSERT INTO agent_user_sms (agent_id, recruited_user_id, sms_count, sms_date)
SELECT 
    aru.agent_id,
    aru.id as recruited_user_id,
    3 as sms_count,
    NOW() - interval '10 days' as sms_date
FROM agent_recruited_users aru
LIMIT 12;

-- Insert sample transactions
INSERT INTO agent_user_transactions (agent_id, recruited_user_id, transaction_amount, transaction_type, transaction_date, revenue_generated)
SELECT 
    aru.agent_id,
    aru.id as recruited_user_id,
    500.00 as transaction_amount,
    'money_transfer' as transaction_type,
    NOW() - interval '5 days' as transaction_date,
    25.00 as revenue_generated
FROM agent_recruited_users aru
LIMIT 8;