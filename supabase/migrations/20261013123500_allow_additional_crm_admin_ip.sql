/* Additional CRM administrator network requested for whitelist enforcement. */

INSERT INTO public.crm_ip_whitelist (ip_address, label)
VALUES ('46.166.172.116'::inet, 'Approved administrator IP')
ON CONFLICT (ip_address) DO NOTHING;
