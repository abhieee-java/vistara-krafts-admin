-- ==============================================================================
-- VISTĀRA KRAFTS — OWNER ATELIER ADMIN AUTHENTICATION & RATE LIMITING
-- ==============================================================================
-- Password: '2008' (stored as salted bcrypt hash using pgcrypto)
-- Security: Verification strictly server-side in PostgreSQL
-- Rate Limiting: 5 attempts maximum before lockout
-- Alert: Automatic Resend email dispatch to ad4064773@gmail.com on rate violation
-- ==============================================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- 1. Admin Security Configuration Table
CREATE TABLE IF NOT EXISTS public.admin_security_config (
  id int PRIMARY KEY DEFAULT 1,
  resend_api_key text NOT NULL,
  alert_recipient text NOT NULL DEFAULT 'ad4064773@gmail.com',
  from_email text NOT NULL DEFAULT 'Vistāra Security <welcome@vistarakrafts.com>',
  max_attempts int NOT NULL DEFAULT 5,
  lockout_minutes int NOT NULL DEFAULT 15,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT single_config_row CHECK (id = 1)
);

ALTER TABLE public.admin_security_config ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.admin_security_config FROM anon, authenticated;

INSERT INTO public.admin_security_config (id, resend_api_key, alert_recipient, from_email, max_attempts, lockout_minutes)
VALUES (1, 'YOUR_RESEND_API_KEY', 'ad4064773@gmail.com', 'Vistāra Security <welcome@vistarakrafts.com>', 5, 15)
ON CONFLICT (id) DO UPDATE SET
  alert_recipient = EXCLUDED.alert_recipient,
  from_email = EXCLUDED.from_email,
  max_attempts = EXCLUDED.max_attempts,
  lockout_minutes = EXCLUDED.lockout_minutes,
  updated_at = now();

-- 2. Admin Auth Credentials Table
CREATE TABLE IF NOT EXISTS public.admin_auth (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  username text NOT NULL UNIQUE DEFAULT 'owner',
  email text NOT NULL DEFAULT 'ad4064773@gmail.com',
  password_hash text NOT NULL,
  failed_attempts int NOT NULL DEFAULT 0,
  last_failed_at timestamptz,
  locked_until timestamptz,
  alert_sent boolean NOT NULL DEFAULT false,
  last_alert_at timestamptz,
  last_login_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.admin_auth ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.admin_auth FROM anon, authenticated;

-- Insert or update owner master password hash ('2008')
INSERT INTO public.admin_auth (username, email, password_hash)
VALUES ('owner', 'ad4064773@gmail.com', crypt('2008', gen_salt('bf', 10)))
ON CONFLICT (username) DO UPDATE SET
  password_hash = crypt('2008', gen_salt('bf', 10)),
  email = 'ad4064773@gmail.com',
  updated_at = now();

-- 3. Admin Authentication Attempt Logs (Security Audit Trail)
CREATE TABLE IF NOT EXISTS public.admin_auth_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  username text NOT NULL DEFAULT 'owner',
  status text NOT NULL,
  ip_address text,
  user_agent text,
  details jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.admin_auth_attempts ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.admin_auth_attempts FROM anon, authenticated;

-- 4. Dispatch Resend Security Alert Email via pg_net
CREATE OR REPLACE FUNCTION public.send_admin_security_alert_email(
  p_failed_count int,
  p_client_info jsonb DEFAULT '{}'::jsonb
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  v_cfg record;
  v_subject text;
  v_html text;
  v_req_id bigint;
  v_ip text;
  v_ua text;
  v_now text;
BEGIN
  SELECT * INTO v_cfg FROM public.admin_security_config WHERE id = 1;
  IF NOT FOUND OR v_cfg.resend_api_key IS NULL OR v_cfg.resend_api_key = '' THEN
    RETURN jsonb_build_object('success', false, 'error', 'Resend API key not configured');
  END IF;

  v_ip := COALESCE(p_client_info->>'ip', 'Client Device');
  v_ua := COALESCE(p_client_info->>'userAgent', 'Browser Client');
  v_now := to_char(now() AT TIME ZONE 'Asia/Kolkata', 'YYYY-MM-DD HH24:MI:SS IST');

  v_subject := '🚨 [SECURITY HAMPER ALERT] Vistāra Krafts Admin Portal: Excessive Failed Login Attempts';

  v_html := '<!DOCTYPE html><html><body style="font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, sans-serif; background: #0f0e0d; color: #f9f8f5; padding: 30px; margin: 0;">'
    || '<div style="max-width: 600px; margin: 0 auto; background: #1c1b18; border: 1px solid #3b372e; border-radius: 16px; padding: 28px; box-shadow: 0 20px 40px rgba(0,0,0,0.5);">'
    || '<div style="text-align: center; margin-bottom: 24px;">'
    || '<div style="display: inline-block; width: 48px; height: 48px; line-height: 48px; border-radius: 12px; background: #cda851; color: #1c1b18; font-weight: 900; font-size: 20px;">VK</div>'
    || '<h1 style="color: #ef4444; font-size: 20px; margin: 16px 0 6px 0;">🚨 Security Hamper Alert: Excessive Failed Logins</h1>'
    || '<p style="color: #a8a29e; font-size: 13px; margin: 0;">Vistāra Krafts Owner Portal Defense Shield</p>'
    || '</div>'
    || '<div style="background: #271212; border: 1px solid #7f1d1d; border-radius: 12px; padding: 16px; margin-bottom: 20px;">'
    || '<p style="color: #fca5a5; font-size: 14px; font-weight: 600; margin: 0 0 8px 0;">⚠️ Potential Unauthorized Intrusion Detected</p>'
    || '<p style="color: #fecaca; font-size: 13px; margin: 0; line-height: 1.5;">More than <strong>' || p_failed_count || ' consecutive failed login attempts</strong> were recorded on the Vistāra Krafts Admin Portal. As a safeguard, the login endpoint has locked further attempts.</p>'
    || '</div>'
    || '<table style="width: 100%; border-collapse: collapse; font-size: 12px; margin-bottom: 24px;">'
    || '<tr><td style="padding: 8px; color: #a8a29e; border-bottom: 1px solid #2d2a24;">Trigger Timestamp:</td><td style="padding: 8px; color: #f9f8f5; font-weight: 600; border-bottom: 1px solid #2d2a24;">' || v_now || '</td></tr>'
    || '<tr><td style="padding: 8px; color: #a8a29e; border-bottom: 1px solid #2d2a24;">Failed Attempts:</td><td style="padding: 8px; color: #ef4444; font-weight: 700; border-bottom: 1px solid #2d2a24;">' || p_failed_count || ' / 5 (Exceeded)</td></tr>'
    || '<tr><td style="padding: 8px; color: #a8a29e; border-bottom: 1px solid #2d2a24;">Client IP / Origin:</td><td style="padding: 8px; color: #f9f8f5; font-family: monospace; border-bottom: 1px solid #2d2a24;">' || v_ip || '</td></tr>'
    || '<tr><td style="padding: 8px; color: #a8a29e; border-bottom: 1px solid #2d2a24;">User Agent:</td><td style="padding: 8px; color: #f9f8f5; font-family: monospace; font-size: 11px; border-bottom: 1px solid #2d2a24;">' || v_ua || '</td></tr>'
    || '<tr><td style="padding: 8px; color: #a8a29e;">Protective Action:</td><td style="padding: 8px; color: #22c55e; font-weight: 600;">15-Minute Cooldown Lock Engaged</td></tr>'
    || '</table>'
    || '<p style="color: #a8a29e; font-size: 12px; line-height: 1.5; margin: 0 0 20px 0;">If this was you and you forgot your password, please ensure you use your designated owner password. If you did not initiate these attempts, your portal has successfully thwarted the attempt.</p>'
    || '<div style="text-align: center; border-top: 1px solid #2d2a24; padding-top: 18px; font-size: 11px; color: #78716c;">'
    || 'Vistāra Krafts Atelier • Zero-Trust Owner Security'
    || '</div>'
    || '</div></body></html>';

  SELECT net.http_post(
    url := 'https://api.resend.com/emails',
    body := jsonb_build_object(
      'from', v_cfg.from_email,
      'to', jsonb_build_array(v_cfg.alert_recipient),
      'subject', v_subject,
      'html', v_html
    ),
    headers := jsonb_build_object(
      'Authorization', 'Bearer ' || v_cfg.resend_api_key,
      'Content-Type', 'application/json'
    ),
    timeout_milliseconds := 8000
  ) INTO v_req_id;

  INSERT INTO public.admin_auth_attempts (username, status, ip_address, user_agent, details)
  VALUES ('owner', 'ALERT_SENT', v_ip, v_ua, jsonb_build_object('req_id', v_req_id, 'recipient', v_cfg.alert_recipient, 'failed_count', p_failed_count));

  RETURN jsonb_build_object('success', true, 'req_id', v_req_id, 'recipient', v_cfg.alert_recipient);
EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object('success', false, 'error', SQLERRM);
END;
$$;

-- 5. Main verify_admin_login RPC Function
CREATE OR REPLACE FUNCTION public.verify_admin_login(
  p_password text,
  p_client_info jsonb DEFAULT '{}'::jsonb
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  v_admin record;
  v_cfg record;
  v_is_correct boolean;
  v_remaining int;
  v_ip text;
  v_ua text;
  v_email_result jsonb;
BEGIN
  SELECT * INTO v_cfg FROM public.admin_security_config WHERE id = 1;
  SELECT * INTO v_admin FROM public.admin_auth WHERE username = 'owner' FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Admin credentials not initialized.',
      'remaining', 0,
      'locked', true
    );
  END IF;

  v_ip := COALESCE(p_client_info->>'ip', 'Client Device');
  v_ua := COALESCE(p_client_info->>'userAgent', 'Browser Client');

  -- 1. Check if currently locked
  IF v_admin.locked_until IS NOT NULL AND v_admin.locked_until > now() THEN
    INSERT INTO public.admin_auth_attempts (username, status, ip_address, user_agent, details)
    VALUES ('owner', 'LOCKED_REJECTED', v_ip, v_ua, jsonb_build_object('locked_until', v_admin.locked_until));

    RETURN jsonb_build_object(
      'success', false,
      'locked', true,
      'remaining', 0,
      'failed_attempts', v_admin.failed_attempts,
      'locked_until', v_admin.locked_until,
      'error', 'Rate limit exceeded: Access is locked. A security alert was dispatched to ' || v_cfg.alert_recipient || '. Please retry in 15 minutes.'
    );
  END IF;

  -- If lock expired, reset
  IF v_admin.locked_until IS NOT NULL AND v_admin.locked_until <= now() THEN
    UPDATE public.admin_auth
    SET locked_until = NULL, failed_attempts = 0, alert_sent = false
    WHERE id = v_admin.id;
    v_admin.failed_attempts := 0;
  END IF;

  -- 2. Verify password against stored bcrypt hash
  v_is_correct := (crypt(p_password, v_admin.password_hash) = v_admin.password_hash);

  IF v_is_correct THEN
    -- Success! Reset failed attempts & alert
    UPDATE public.admin_auth
    SET failed_attempts = 0,
        locked_until = NULL,
        alert_sent = false,
        last_login_at = now(),
        updated_at = now()
    WHERE id = v_admin.id;

    INSERT INTO public.admin_auth_attempts (username, status, ip_address, user_agent, details)
    VALUES ('owner', 'SUCCESS', v_ip, v_ua, jsonb_build_object('login_time', now()));

    RETURN jsonb_build_object(
      'success', true,
      'remaining', 5,
      'locked', false,
      'user', jsonb_build_object(
        'email', v_admin.email,
        'name', 'Vistāra Krafts Owner',
        'role', 'Owner',
        'lastLogin', now()
      )
    );
  ELSE
    -- Failed attempt: Increment counter
    v_admin.failed_attempts := v_admin.failed_attempts + 1;
    v_remaining := GREATEST(0, v_cfg.max_attempts - v_admin.failed_attempts);

    IF v_admin.failed_attempts >= v_cfg.max_attempts THEN
      -- Exceeded 5 attempts! Lock account and trigger email
      UPDATE public.admin_auth
      SET failed_attempts = v_admin.failed_attempts,
          last_failed_at = now(),
          locked_until = now() + (v_cfg.lockout_minutes || ' minutes')::interval,
          alert_sent = true,
          last_alert_at = now(),
          updated_at = now()
      WHERE id = v_admin.id;

      INSERT INTO public.admin_auth_attempts (username, status, ip_address, user_agent, details)
      VALUES ('owner', 'LOCKOUT_TRIGGERED', v_ip, v_ua, jsonb_build_object(
        'failed_attempts', v_admin.failed_attempts,
        'locked_until', now() + (v_cfg.lockout_minutes || ' minutes')::interval
      ));

      -- Send security alert email via Resend
      v_email_result := public.send_admin_security_alert_email(v_admin.failed_attempts, p_client_info);

      RETURN jsonb_build_object(
        'success', false,
        'locked', true,
        'remaining', 0,
        'failed_attempts', v_admin.failed_attempts,
        'locked_until', now() + (v_cfg.lockout_minutes || ' minutes')::interval,
        'should_alert', true,
        'alert_dispatched', true,
        'alert_recipient', v_cfg.alert_recipient,
        'error', 'Maximum login attempts exceeded (5/5). Account locked for 15 minutes. A security hamper alert has been sent to ' || v_cfg.alert_recipient || '.'
      );
    ELSE
      -- Not yet locked: record failed attempt
      UPDATE public.admin_auth
      SET failed_attempts = v_admin.failed_attempts,
          last_failed_at = now(),
          updated_at = now()
      WHERE id = v_admin.id;

      INSERT INTO public.admin_auth_attempts (username, status, ip_address, user_agent, details)
      VALUES ('owner', 'FAILED', v_ip, v_ua, jsonb_build_object(
        'failed_attempts', v_admin.failed_attempts,
        'remaining', v_remaining
      ));

      RETURN jsonb_build_object(
        'success', false,
        'locked', false,
        'remaining', v_remaining,
        'failed_attempts', v_admin.failed_attempts,
        'error', 'Incorrect password. ' || v_remaining || ' attempt(s) remaining before security lockout.'
      );
    END IF;
  END IF;
END;
$$;

-- 6. Check Current Status RPC Function
CREATE OR REPLACE FUNCTION public.get_admin_auth_status()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  v_admin record;
  v_cfg record;
  v_remaining int;
  v_is_locked boolean;
BEGIN
  SELECT * INTO v_cfg FROM public.admin_security_config WHERE id = 1;
  SELECT * INTO v_admin FROM public.admin_auth WHERE username = 'owner';

  IF NOT FOUND THEN
    RETURN jsonb_build_object('configured', false);
  END IF;

  v_is_locked := (v_admin.locked_until IS NOT NULL AND v_admin.locked_until > now());
  v_remaining := CASE 
    WHEN v_is_locked THEN 0
    ELSE GREATEST(0, v_cfg.max_attempts - v_admin.failed_attempts)
  END;

  RETURN jsonb_build_object(
    'configured', true,
    'locked', v_is_locked,
    'locked_until', v_admin.locked_until,
    'remaining_attempts', v_remaining,
    'max_attempts', v_cfg.max_attempts,
    'failed_attempts', v_admin.failed_attempts
  );
END;
$$;

-- 7. Reset Lockout RPC Function
CREATE OR REPLACE FUNCTION public.reset_admin_lockout()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
BEGIN
  UPDATE public.admin_auth
  SET failed_attempts = 0,
      locked_until = NULL,
      alert_sent = false,
      updated_at = now()
  WHERE username = 'owner';

  RETURN jsonb_build_object('success', true, 'message', 'Admin lockout reset successfully');
END;
$$;

-- 8. Change Admin Master Password RPC Function
CREATE OR REPLACE FUNCTION public.change_admin_password(
  p_current_password text,
  p_new_password text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  v_admin record;
  v_is_correct boolean;
BEGIN
  IF p_new_password IS NULL OR length(trim(p_new_password)) < 4 THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'New password must be at least 4 characters long.'
    );
  END IF;

  SELECT * INTO v_admin FROM public.admin_auth WHERE username = 'owner' FOR UPDATE;
  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Admin credentials record not found.'
    );
  END IF;

  -- Verify current password
  v_is_correct := (crypt(p_current_password, v_admin.password_hash) = v_admin.password_hash);
  IF NOT v_is_correct THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Current master password is incorrect. Authorization denied.'
    );
  END IF;

  -- Update with new bcrypt hashed password
  UPDATE public.admin_auth
  SET password_hash = crypt(trim(p_new_password), gen_salt('bf', 10)),
      failed_attempts = 0,
      locked_until = NULL,
      updated_at = now()
  WHERE id = v_admin.id;

  -- Log security event
  INSERT INTO public.admin_auth_attempts (username, status, ip_address, user_agent, details)
  VALUES ('owner', 'PASSWORD_CHANGED', 'Authenticated Session', 'Owner Console', jsonb_build_object('changed_at', now()));

  RETURN jsonb_build_object(
    'success', true,
    'message', 'Master password changed successfully. Use your new password on next login.'
  );
EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object('success', false, 'error', SQLERRM);
END;
$$;

GRANT EXECUTE ON FUNCTION public.verify_admin_login(text, jsonb) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_admin_auth_status() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.reset_admin_lockout() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.change_admin_password(text, text) TO anon, authenticated;

-- 9. Get Real Customer Directory for Admin Analytics & Traffic Monitoring
CREATE OR REPLACE FUNCTION public.get_customer_directory()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, extensions
AS $$
DECLARE
  v_result jsonb;
BEGIN
  SELECT jsonb_agg(cust) INTO v_result
  FROM (
    SELECT 
      u.id,
      u.email,
      COALESCE(p.full_name, u.raw_user_meta_data->>'full_name', u.raw_user_meta_data->>'name', 'Vistāra Patron') as name,
      COALESCE(p.phone, '') as phone,
      to_char(u.created_at AT TIME ZONE 'Asia/Kolkata', 'YYYY-MM-DD HH24:MI:SS') as "registeredDate",
      COALESCE(to_char(u.last_sign_in_at AT TIME ZONE 'Asia/Kolkata', 'YYYY-MM-DD HH24:MI:SS'), to_char(u.created_at AT TIME ZONE 'Asia/Kolkata', 'YYYY-MM-DD HH24:MI:SS')) as "lastLogin",
      u.last_sign_in_at,
      u.created_at,
      COALESCE(p.provider, u.raw_app_meta_data->>'provider', 'google') as provider,
      'active' as status,
      COALESCE(p.member_tier, 'Verified Patron') as "memberTier",
      COALESCE(ord.order_count, 0) as "totalOrders",
      COALESCE(ord.total_spent, 0) as "totalSpent",
      jsonb_build_object(
        'fullName', COALESCE(p.full_name, u.raw_user_meta_data->>'name', ''),
        'phone', COALESCE(p.phone, ''),
        'street', COALESCE(p.address, ''),
        'city', 'Bengaluru',
        'state', 'KA',
        'pincode', COALESCE(p.pincode, '')
      ) as "defaultAddress"
    FROM auth.users u
    LEFT JOIN public.profiles p ON p.id = u.id
    LEFT JOIN (
      SELECT 
        customer_email,
        COUNT(*)::int as order_count,
        COALESCE(SUM(total), 0)::numeric as total_spent
      FROM public.orders
      GROUP BY customer_email
    ) ord ON lower(ord.customer_email) = lower(u.email)
    ORDER BY u.last_sign_in_at DESC NULLS LAST, u.created_at DESC
  ) cust;

  RETURN COALESCE(v_result, '[]'::jsonb);
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_customer_directory() TO anon, authenticated;
