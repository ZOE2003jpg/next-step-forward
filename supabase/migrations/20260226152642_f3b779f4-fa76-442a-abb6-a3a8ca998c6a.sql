
-- Schedule auto-close stale orders every 6 hours
SELECT cron.schedule(
  'auto-close-stale-orders',
  '0 */6 * * *',
  $$
  SELECT net.http_post(
    url := 'https://zlvptkwrehuoxvgwiurh.supabase.co/functions/v1/auto-close-orders',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpsdnB0a3dyZWh1b3h2Z3dpdXJoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIxMDM0NzYsImV4cCI6MjA4NzY3OTQ3Nn0.UEyVg26FHXIxckEesTuZ-meYb7pARsGEMBOEjmlFOxM"}'::jsonb,
    body := '{}'::jsonb
  ) AS request_id;
  $$
);

-- Schedule daily report at midnight
SELECT cron.schedule(
  'daily-report',
  '0 0 * * *',
  $$
  SELECT net.http_post(
    url := 'https://zlvptkwrehuoxvgwiurh.supabase.co/functions/v1/daily-report',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpsdnB0a3dyZWh1b3h2Z3dpdXJoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIxMDM0NzYsImV4cCI6MjA4NzY3OTQ3Nn0.UEyVg26FHXIxckEesTuZ-meYb7pARsGEMBOEjmlFOxM"}'::jsonb,
    body := '{}'::jsonb
  ) AS request_id;
  $$
);

-- Schedule wallet balance alerts every 12 hours
SELECT cron.schedule(
  'wallet-balance-alerts',
  '0 */12 * * *',
  $$
  SELECT net.http_post(
    url := 'https://zlvptkwrehuoxvgwiurh.supabase.co/functions/v1/wallet-alerts',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpsdnB0a3dyZWh1b3h2Z3dpdXJoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIxMDM0NzYsImV4cCI6MjA4NzY3OTQ3Nn0.UEyVg26FHXIxckEesTuZ-meYb7pARsGEMBOEjmlFOxM"}'::jsonb,
    body := '{}'::jsonb
  ) AS request_id;
  $$
);
