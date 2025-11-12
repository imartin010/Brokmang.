-- Default configuration and seed data for Brokmang platform
-- Run this after all migrations are applied

set search_path = public;

-- Seed deal sources
insert into public.deal_sources (organization_id, name)
values 
  ('3664ed88-2563-4abf-81e3-3cf405dd7580', 'Lead'),
  ('3664ed88-2563-4abf-81e3-3cf405dd7580', 'Cold Call'),
  ('3664ed88-2563-4abf-81e3-3cf405dd7580', 'Company Data'),
  ('3664ed88-2563-4abf-81e3-3cf405dd7580', 'Personal Data'),
  ('3664ed88-2563-4abf-81e3-3cf405dd7580', 'Referral'),
  ('3664ed88-2563-4abf-81e3-3cf405dd7580', 'Website'),
  ('3664ed88-2563-4abf-81e3-3cf405dd7580', 'Social Media')
on conflict (organization_id, lower(name)) do nothing;

-- Seed default commission configuration
insert into public.commission_config (organization_id, role, base_rate_per_million, description)
values
  ('3664ed88-2563-4abf-81e3-3cf405dd7580', 'sales_agent', 6000, 'Average 6000 EGP per 1 Million in sales'),
  ('3664ed88-2563-4abf-81e3-3cf405dd7580', 'team_leader', 2500, 'Average 2500 EGP per 1 Million in sales'),
  ('3664ed88-2563-4abf-81e3-3cf405dd7580', 'sales_manager', 1500, 'Average 1500 EGP per 1 Million in sales'),
  ('3664ed88-2563-4abf-81e3-3cf405dd7580', 'business_unit_head', 0, 'No direct sales commission'),
  ('3664ed88-2563-4abf-81e3-3cf405dd7580', 'finance', 0, 'No sales commission'),
  ('3664ed88-2563-4abf-81e3-3cf405dd7580', 'ceo', 0, 'No sales commission'),
  ('3664ed88-2563-4abf-81e3-3cf405dd7580', 'admin', 0, 'No sales commission')
on conflict (organization_id, role, effective_from) do nothing;

-- Seed default tax configuration
insert into public.tax_config (organization_id, withholding_tax_rate, vat_rate, income_tax_rate, notes)
values (
  '3664ed88-2563-4abf-81e3-3cf405dd7580',
  0.05,  -- 5% withholding tax
  0.14,  -- 14% VAT
  0.00,  -- Income tax (to be configured by finance)
  'Default tax rates for Egypt. Finance should update income tax rate as needed.'
)
on conflict (organization_id, effective_from) do nothing;

-- Seed sample developer commission rates
insert into public.developer_commission_rates (organization_id, developer_name, commission_percentage, notes)
values
  ('3664ed88-2563-4abf-81e3-3cf405dd7580', 'Default Developer', 2.0, 'Default 2% commission rate'),
  ('3664ed88-2563-4abf-81e3-3cf405dd7580', 'Premium Developer A', 2.5, 'Higher commission for premium projects'),
  ('3664ed88-2563-4abf-81e3-3cf405dd7580', 'Budget Developer B', 1.5, 'Lower commission for budget-friendly projects')
on conflict do nothing;

