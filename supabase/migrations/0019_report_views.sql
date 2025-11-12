-- Report generation views for custom date ranges and periods
set check_function_bodies = off;
set search_path = public;

-- Agent performance report (daily/weekly/monthly/quarterly/yearly)
create or replace view public.agent_performance_report as
select
  p.id as agent_id,
  p.full_name as agent_name,
  p.email,
  p.role,
  t.id as team_id,
  t.name as team_name,
  bu.id as business_unit_id,
  bu.name as business_unit_name,
  -- Attendance metrics
  count(distinct al.work_date) as days_worked,
  avg(extract(epoch from (al.check_out_time - al.check_in_time)) / 3600) filter (where al.check_out_time is not null) as avg_hours_per_day,
  -- Activity metrics
  sum(dam.active_calls_count) as total_calls,
  sum(dam.meetings_scheduled) as total_meetings,
  sum(dam.requests_generated) as total_requests,
  -- Lead & deal metrics
  count(l.*) as total_leads,
  count(l.*) filter (where l.status = 'converted') as converted_leads,
  case when count(l.*) > 0 then (count(l.*) filter (where l.status = 'converted')::numeric / count(l.*)::numeric) * 100 else 0 end as conversion_rate,
  count(d.*) filter (where d.stage = 'won') as deals_won,
  sum(d.deal_value) filter (where d.stage = 'won') as total_deal_value,
  sum(d.commission_value) filter (where d.stage = 'won') as total_commission_earned,
  -- Rating metrics
  avg(adr.overall_score) as avg_rating_score,
  avg(adr.appearance_score) as avg_appearance,
  avg(adr.professionalism_score) as avg_professionalism,
  p.organization_id,
  date_trunc('month', coalesce(al.work_date, dam.work_date, l.received_date, d.created_at::date))::date as report_month
from public.profiles p
left join public.team_members tm on tm.user_id = p.id
left join public.teams t on t.id = tm.team_id
left join public.business_units bu on bu.id = t.business_unit_id
left join public.attendance_logs al on al.agent_id = p.id
left join public.daily_agent_metrics dam on dam.agent_id = p.id and dam.work_date = al.work_date
left join public.leads l on l.agent_id = p.id
left join public.deals d on d.agent_id = p.id
left join public.agent_daily_ratings adr on adr.agent_id = p.id
where p.role = 'sales_agent'
group by p.id, p.full_name, p.email, p.role, t.id, t.name, bu.id, bu.name, p.organization_id, 
         date_trunc('month', coalesce(al.work_date, dam.work_date, l.received_date, d.created_at::date))::date;

-- Team performance report
create or replace view public.team_performance_report as
select
  t.id as team_id,
  t.name as team_name,
  bu.id as business_unit_id,
  bu.name as business_unit_name,
  t.leader_id,
  lp.full_name as leader_name,
  count(distinct tm.user_id) as team_size,
  -- Aggregate team metrics
  sum(dam.active_calls_count) as total_team_calls,
  sum(dam.meetings_scheduled) as total_team_meetings,
  sum(dam.requests_generated) as total_team_requests,
  count(distinct cr.id) filter (where cr.status = 'pending') as pending_requests,
  count(distinct cr.id) filter (where cr.status = 'approved') as approved_requests,
  -- Lead & deal metrics
  count(l.*) as total_team_leads,
  count(l.*) filter (where l.status = 'converted') as converted_team_leads,
  count(d.*) filter (where d.stage = 'won') as team_deals_won,
  sum(d.deal_value) filter (where d.stage = 'won') as team_total_value,
  sum(d.commission_value) filter (where d.stage = 'won') as team_total_commission,
  -- Rating averages
  avg(adr.overall_score) as team_avg_rating,
  t.organization_id,
  date_trunc('month', coalesce(dam.work_date, l.received_date, d.created_at::date))::date as report_month
from public.teams t
join public.business_units bu on bu.id = t.business_unit_id
left join public.profiles lp on lp.id = t.leader_id
left join public.team_members tm on tm.team_id = t.id
left join public.daily_agent_metrics dam on dam.agent_id = tm.user_id
left join public.client_requests cr on cr.team_id = t.id
left join public.leads l on l.team_id = t.id
left join public.deals d on d.team_id = t.id
left join public.agent_daily_ratings adr on adr.agent_id = tm.user_id
group by t.id, t.name, bu.id, bu.name, t.leader_id, lp.full_name, t.organization_id,
         date_trunc('month', coalesce(dam.work_date, l.received_date, d.created_at::date))::date;

-- Business unit performance and finance combined report
create or replace view public.business_unit_combined_report as
select
  bu.id as business_unit_id,
  bu.name as business_unit_name,
  bu.organization_id,
  o.name as organization_name,
  fs.snapshot_month as report_month,
  -- Performance metrics
  count(distinct t.id) as team_count,
  count(distinct tm.user_id) as agent_count,
  count(distinct d.id) filter (where d.stage <> 'lost') as open_deals,
  count(distinct d.id) filter (where d.stage = 'won') as won_deals,
  sum(d.deal_value) filter (where d.stage = 'won') as total_sales_value,
  -- Financial metrics
  coalesce(fs.revenue, 0) as revenue,
  coalesce(fs.expenses, 0) as expenses,
  coalesce(sum(ce.amount), 0) as detailed_costs,
  coalesce(sum(es.monthly_salary), 0) as payroll_costs,
  coalesce(sum(d.commission_value), 0) as commission_costs,
  -- Profit metrics
  coalesce(fs.revenue, 0) - coalesce(fs.expenses, 0) - coalesce(sum(d.commission_value), 0) as gross_profit,
  coalesce(fs.revenue, 0) * 0.05 as withholding_tax,
  coalesce(fs.revenue, 0) * 0.14 as vat_tax,
  coalesce(fs.revenue, 0) - coalesce(fs.expenses, 0) - coalesce(sum(d.commission_value), 0) - (coalesce(fs.revenue, 0) * 0.19) as net_profit_before_income_tax
from public.business_units bu
join public.organizations o on o.id = bu.organization_id
left join public.teams t on t.business_unit_id = bu.id
left join public.team_members tm on tm.team_id = t.id
left join public.deals d on d.business_unit_id = bu.id
left join public.financial_snapshots fs on fs.business_unit_id = bu.id
left join public.cost_entries ce on ce.business_unit_id = bu.id and date_trunc('month', ce.cost_month) = date_trunc('month', fs.snapshot_month)
left join public.employee_salaries es on es.organization_id = bu.organization_id and (es.effective_to is null or es.effective_to >= current_date)
group by bu.id, bu.name, bu.organization_id, o.name, fs.snapshot_month, fs.revenue, fs.expenses;

comment on view public.agent_performance_report is 'Comprehensive agent performance report with attendance, activities, leads, and deals.';
comment on view public.team_performance_report is 'Team-level performance metrics aggregating all agent activities and results.';
comment on view public.business_unit_combined_report is 'Combined performance and financial report per business unit.';

