export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      activity_log: {
        Row: {
          action: string
          actor_id: string | null
          created_at: string
          entity_id: string | null
          entity_type: string
          id: string
          metadata: Json | null
          organization_id: string
        }
        Insert: {
          action: string
          actor_id?: string | null
          created_at?: string
          entity_id?: string | null
          entity_type: string
          id?: string
          metadata?: Json | null
          organization_id: string
        }
        Update: {
          action?: string
          actor_id?: string | null
          created_at?: string
          entity_id?: string | null
          entity_type?: string
          id?: string
          metadata?: Json | null
          organization_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "activity_log_actor_id_fkey"
            columns: ["actor_id"]
            isOneToOne: false
            referencedRelation: "agent_dashboard_summary"
            referencedColumns: ["agent_id"]
          },
          {
            foreignKeyName: "activity_log_actor_id_fkey"
            columns: ["actor_id"]
            isOneToOne: false
            referencedRelation: "agent_performance_report"
            referencedColumns: ["agent_id"]
          },
          {
            foreignKeyName: "activity_log_actor_id_fkey"
            columns: ["actor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activity_log_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_overview"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "activity_log_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_pnl"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "activity_log_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activity_log_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "pipeline_performance"
            referencedColumns: ["organization_id"]
          },
        ]
      }
      agent_daily_ratings: {
        Row: {
          agent_id: string
          appearance_score: number | null
          comments: string | null
          created_at: string
          deals_closed_count: number | null
          honesty_score: number | null
          id: string
          kindness_score: number | null
          leads_received_count: number | null
          organization_id: string
          professionalism_score: number | null
          rated_by: string
          rating_date: string
          updated_at: string
        }
        Insert: {
          agent_id: string
          appearance_score?: number | null
          comments?: string | null
          created_at?: string
          deals_closed_count?: number | null
          honesty_score?: number | null
          id?: string
          kindness_score?: number | null
          leads_received_count?: number | null
          organization_id: string
          professionalism_score?: number | null
          rated_by: string
          rating_date?: string
          updated_at?: string
        }
        Update: {
          agent_id?: string
          appearance_score?: number | null
          comments?: string | null
          created_at?: string
          deals_closed_count?: number | null
          honesty_score?: number | null
          id?: string
          kindness_score?: number | null
          leads_received_count?: number | null
          organization_id?: string
          professionalism_score?: number | null
          rated_by?: string
          rating_date?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "agent_daily_ratings_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agent_dashboard_summary"
            referencedColumns: ["agent_id"]
          },
          {
            foreignKeyName: "agent_daily_ratings_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agent_performance_report"
            referencedColumns: ["agent_id"]
          },
          {
            foreignKeyName: "agent_daily_ratings_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agent_daily_ratings_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_overview"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "agent_daily_ratings_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_pnl"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "agent_daily_ratings_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agent_daily_ratings_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "pipeline_performance"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "agent_daily_ratings_rated_by_fkey"
            columns: ["rated_by"]
            isOneToOne: false
            referencedRelation: "agent_dashboard_summary"
            referencedColumns: ["agent_id"]
          },
          {
            foreignKeyName: "agent_daily_ratings_rated_by_fkey"
            columns: ["rated_by"]
            isOneToOne: false
            referencedRelation: "agent_performance_report"
            referencedColumns: ["agent_id"]
          },
          {
            foreignKeyName: "agent_daily_ratings_rated_by_fkey"
            columns: ["rated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_insight_runs: {
        Row: {
          completed_at: string | null
          created_at: string
          error_message: string | null
          id: string
          initiated_by: string
          input: Json
          organization_id: string
          output: Json | null
          scope: string
          status: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          error_message?: string | null
          id?: string
          initiated_by: string
          input: Json
          organization_id: string
          output?: Json | null
          scope: string
          status?: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          error_message?: string | null
          id?: string
          initiated_by?: string
          input?: Json
          organization_id?: string
          output?: Json | null
          scope?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_insight_runs_initiated_by_fkey"
            columns: ["initiated_by"]
            isOneToOne: false
            referencedRelation: "agent_dashboard_summary"
            referencedColumns: ["agent_id"]
          },
          {
            foreignKeyName: "ai_insight_runs_initiated_by_fkey"
            columns: ["initiated_by"]
            isOneToOne: false
            referencedRelation: "agent_performance_report"
            referencedColumns: ["agent_id"]
          },
          {
            foreignKeyName: "ai_insight_runs_initiated_by_fkey"
            columns: ["initiated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_insight_runs_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_overview"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "ai_insight_runs_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_pnl"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "ai_insight_runs_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_insight_runs_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "pipeline_performance"
            referencedColumns: ["organization_id"]
          },
        ]
      }
      assist_requests: {
        Row: {
          assignee_id: string | null
          created_at: string
          deal_id: string | null
          details: string | null
          id: string
          organization_id: string
          requester_id: string
          resolution: string | null
          status: Database["public"]["Enums"]["assist_request_status"]
          subject: string
          updated_at: string
        }
        Insert: {
          assignee_id?: string | null
          created_at?: string
          deal_id?: string | null
          details?: string | null
          id?: string
          organization_id: string
          requester_id: string
          resolution?: string | null
          status?: Database["public"]["Enums"]["assist_request_status"]
          subject: string
          updated_at?: string
        }
        Update: {
          assignee_id?: string | null
          created_at?: string
          deal_id?: string | null
          details?: string | null
          id?: string
          organization_id?: string
          requester_id?: string
          resolution?: string | null
          status?: Database["public"]["Enums"]["assist_request_status"]
          subject?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "assist_requests_assignee_id_fkey"
            columns: ["assignee_id"]
            isOneToOne: false
            referencedRelation: "agent_dashboard_summary"
            referencedColumns: ["agent_id"]
          },
          {
            foreignKeyName: "assist_requests_assignee_id_fkey"
            columns: ["assignee_id"]
            isOneToOne: false
            referencedRelation: "agent_performance_report"
            referencedColumns: ["agent_id"]
          },
          {
            foreignKeyName: "assist_requests_assignee_id_fkey"
            columns: ["assignee_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assist_requests_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "deals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assist_requests_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_overview"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "assist_requests_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_pnl"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "assist_requests_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assist_requests_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "pipeline_performance"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "assist_requests_requester_id_fkey"
            columns: ["requester_id"]
            isOneToOne: false
            referencedRelation: "agent_dashboard_summary"
            referencedColumns: ["agent_id"]
          },
          {
            foreignKeyName: "assist_requests_requester_id_fkey"
            columns: ["requester_id"]
            isOneToOne: false
            referencedRelation: "agent_performance_report"
            referencedColumns: ["agent_id"]
          },
          {
            foreignKeyName: "assist_requests_requester_id_fkey"
            columns: ["requester_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      attendance_logs: {
        Row: {
          agent_id: string
          check_in_time: string
          check_out_time: string | null
          created_at: string
          id: string
          location_check_in: string | null
          location_check_out: string | null
          notes: string | null
          organization_id: string
          updated_at: string
          work_date: string
        }
        Insert: {
          agent_id: string
          check_in_time: string
          check_out_time?: string | null
          created_at?: string
          id?: string
          location_check_in?: string | null
          location_check_out?: string | null
          notes?: string | null
          organization_id: string
          updated_at?: string
          work_date?: string
        }
        Update: {
          agent_id?: string
          check_in_time?: string
          check_out_time?: string | null
          created_at?: string
          id?: string
          location_check_in?: string | null
          location_check_out?: string | null
          notes?: string | null
          organization_id?: string
          updated_at?: string
          work_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "attendance_logs_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agent_dashboard_summary"
            referencedColumns: ["agent_id"]
          },
          {
            foreignKeyName: "attendance_logs_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agent_performance_report"
            referencedColumns: ["agent_id"]
          },
          {
            foreignKeyName: "attendance_logs_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_logs_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_overview"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "attendance_logs_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_pnl"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "attendance_logs_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_logs_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "pipeline_performance"
            referencedColumns: ["organization_id"]
          },
        ]
      }
      business_units: {
        Row: {
          created_at: string
          description: string | null
          id: string
          leader_id: string | null
          name: string
          organization_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          leader_id?: string | null
          name: string
          organization_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          leader_id?: string | null
          name?: string
          organization_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "business_units_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_overview"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "business_units_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_pnl"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "business_units_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "business_units_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "pipeline_performance"
            referencedColumns: ["organization_id"]
          },
        ]
      }
      client_requests: {
        Row: {
          agent_id: string
          agent_notes: string | null
          client_budget: number
          client_name: string
          client_phone: string
          converted_deal_id: string | null
          created_at: string
          delivery_date: string | null
          destination: string
          id: string
          leader_notes: string | null
          organization_id: string
          project_needed: string
          rejection_reason: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: Database["public"]["Enums"]["request_status"]
          team_id: string | null
          team_leader_id: string | null
          updated_at: string
        }
        Insert: {
          agent_id: string
          agent_notes?: string | null
          client_budget: number
          client_name: string
          client_phone: string
          converted_deal_id?: string | null
          created_at?: string
          delivery_date?: string | null
          destination: string
          id?: string
          leader_notes?: string | null
          organization_id: string
          project_needed: string
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["request_status"]
          team_id?: string | null
          team_leader_id?: string | null
          updated_at?: string
        }
        Update: {
          agent_id?: string
          agent_notes?: string | null
          client_budget?: number
          client_name?: string
          client_phone?: string
          converted_deal_id?: string | null
          created_at?: string
          delivery_date?: string | null
          destination?: string
          id?: string
          leader_notes?: string | null
          organization_id?: string
          project_needed?: string
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["request_status"]
          team_id?: string | null
          team_leader_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_requests_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agent_dashboard_summary"
            referencedColumns: ["agent_id"]
          },
          {
            foreignKeyName: "client_requests_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agent_performance_report"
            referencedColumns: ["agent_id"]
          },
          {
            foreignKeyName: "client_requests_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_requests_converted_deal_id_fkey"
            columns: ["converted_deal_id"]
            isOneToOne: false
            referencedRelation: "deals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_requests_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_overview"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "client_requests_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_pnl"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "client_requests_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_requests_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "pipeline_performance"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "client_requests_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "agent_dashboard_summary"
            referencedColumns: ["agent_id"]
          },
          {
            foreignKeyName: "client_requests_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "agent_performance_report"
            referencedColumns: ["agent_id"]
          },
          {
            foreignKeyName: "client_requests_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_requests_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "agent_performance_report"
            referencedColumns: ["team_id"]
          },
          {
            foreignKeyName: "client_requests_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "team_leader_dashboard"
            referencedColumns: ["team_id"]
          },
          {
            foreignKeyName: "client_requests_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "team_member_performance"
            referencedColumns: ["team_id"]
          },
          {
            foreignKeyName: "client_requests_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "team_performance_report"
            referencedColumns: ["team_id"]
          },
          {
            foreignKeyName: "client_requests_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_requests_team_leader_id_fkey"
            columns: ["team_leader_id"]
            isOneToOne: false
            referencedRelation: "agent_dashboard_summary"
            referencedColumns: ["agent_id"]
          },
          {
            foreignKeyName: "client_requests_team_leader_id_fkey"
            columns: ["team_leader_id"]
            isOneToOne: false
            referencedRelation: "agent_performance_report"
            referencedColumns: ["agent_id"]
          },
          {
            foreignKeyName: "client_requests_team_leader_id_fkey"
            columns: ["team_leader_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      coaching_notes: {
        Row: {
          author_id: string
          created_at: string
          id: string
          note: string
          organization_id: string
          participant_id: string
          subject: string
          updated_at: string
          visibility: string
        }
        Insert: {
          author_id: string
          created_at?: string
          id?: string
          note: string
          organization_id: string
          participant_id: string
          subject: string
          updated_at?: string
          visibility?: string
        }
        Update: {
          author_id?: string
          created_at?: string
          id?: string
          note?: string
          organization_id?: string
          participant_id?: string
          subject?: string
          updated_at?: string
          visibility?: string
        }
        Relationships: [
          {
            foreignKeyName: "coaching_notes_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "agent_dashboard_summary"
            referencedColumns: ["agent_id"]
          },
          {
            foreignKeyName: "coaching_notes_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "agent_performance_report"
            referencedColumns: ["agent_id"]
          },
          {
            foreignKeyName: "coaching_notes_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "coaching_notes_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_overview"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "coaching_notes_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_pnl"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "coaching_notes_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "coaching_notes_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "pipeline_performance"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "coaching_notes_participant_id_fkey"
            columns: ["participant_id"]
            isOneToOne: false
            referencedRelation: "agent_dashboard_summary"
            referencedColumns: ["agent_id"]
          },
          {
            foreignKeyName: "coaching_notes_participant_id_fkey"
            columns: ["participant_id"]
            isOneToOne: false
            referencedRelation: "agent_performance_report"
            referencedColumns: ["agent_id"]
          },
          {
            foreignKeyName: "coaching_notes_participant_id_fkey"
            columns: ["participant_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      commission_config: {
        Row: {
          base_rate_per_million: number
          created_at: string
          description: string | null
          effective_from: string
          effective_to: string | null
          id: string
          organization_id: string
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string
        }
        Insert: {
          base_rate_per_million: number
          created_at?: string
          description?: string | null
          effective_from?: string
          effective_to?: string | null
          id?: string
          organization_id: string
          role: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Update: {
          base_rate_per_million?: number
          created_at?: string
          description?: string | null
          effective_from?: string
          effective_to?: string | null
          id?: string
          organization_id?: string
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "commission_config_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_overview"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "commission_config_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_pnl"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "commission_config_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commission_config_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "pipeline_performance"
            referencedColumns: ["organization_id"]
          },
        ]
      }
      cost_entries: {
        Row: {
          amount: number
          approval_status: string | null
          approved_by: string | null
          business_unit_id: string | null
          category: Database["public"]["Enums"]["cost_category"]
          cost_month: string
          created_at: string
          created_by: string
          description: string | null
          id: string
          is_fixed_cost: boolean
          is_recurring: boolean
          notes: string | null
          organization_id: string
          receipt_url: string | null
          updated_at: string
        }
        Insert: {
          amount: number
          approval_status?: string | null
          approved_by?: string | null
          business_unit_id?: string | null
          category: Database["public"]["Enums"]["cost_category"]
          cost_month: string
          created_at?: string
          created_by: string
          description?: string | null
          id?: string
          is_fixed_cost?: boolean
          is_recurring?: boolean
          notes?: string | null
          organization_id: string
          receipt_url?: string | null
          updated_at?: string
        }
        Update: {
          amount?: number
          approval_status?: string | null
          approved_by?: string | null
          business_unit_id?: string | null
          category?: Database["public"]["Enums"]["cost_category"]
          cost_month?: string
          created_at?: string
          created_by?: string
          description?: string | null
          id?: string
          is_fixed_cost?: boolean
          is_recurring?: boolean
          notes?: string | null
          organization_id?: string
          receipt_url?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "cost_entries_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "agent_dashboard_summary"
            referencedColumns: ["agent_id"]
          },
          {
            foreignKeyName: "cost_entries_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "agent_performance_report"
            referencedColumns: ["agent_id"]
          },
          {
            foreignKeyName: "cost_entries_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cost_entries_business_unit_id_fkey"
            columns: ["business_unit_id"]
            isOneToOne: false
            referencedRelation: "agent_performance_report"
            referencedColumns: ["business_unit_id"]
          },
          {
            foreignKeyName: "cost_entries_business_unit_id_fkey"
            columns: ["business_unit_id"]
            isOneToOne: false
            referencedRelation: "business_unit_combined_report"
            referencedColumns: ["business_unit_id"]
          },
          {
            foreignKeyName: "cost_entries_business_unit_id_fkey"
            columns: ["business_unit_id"]
            isOneToOne: false
            referencedRelation: "business_unit_finance_overview"
            referencedColumns: ["business_unit_id"]
          },
          {
            foreignKeyName: "cost_entries_business_unit_id_fkey"
            columns: ["business_unit_id"]
            isOneToOne: false
            referencedRelation: "business_unit_pnl"
            referencedColumns: ["business_unit_id"]
          },
          {
            foreignKeyName: "cost_entries_business_unit_id_fkey"
            columns: ["business_unit_id"]
            isOneToOne: false
            referencedRelation: "business_units"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cost_entries_business_unit_id_fkey"
            columns: ["business_unit_id"]
            isOneToOne: false
            referencedRelation: "team_leader_dashboard"
            referencedColumns: ["business_unit_id"]
          },
          {
            foreignKeyName: "cost_entries_business_unit_id_fkey"
            columns: ["business_unit_id"]
            isOneToOne: false
            referencedRelation: "team_performance_report"
            referencedColumns: ["business_unit_id"]
          },
          {
            foreignKeyName: "cost_entries_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "agent_dashboard_summary"
            referencedColumns: ["agent_id"]
          },
          {
            foreignKeyName: "cost_entries_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "agent_performance_report"
            referencedColumns: ["agent_id"]
          },
          {
            foreignKeyName: "cost_entries_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cost_entries_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_overview"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "cost_entries_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_pnl"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "cost_entries_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cost_entries_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "pipeline_performance"
            referencedColumns: ["organization_id"]
          },
        ]
      }
      daily_agent_metrics: {
        Row: {
          active_calls_count: number
          agent_id: string
          created_at: string
          deals_closed: number
          id: string
          meetings_scheduled: number
          mood: string | null
          notes: string | null
          organization_id: string
          requests_generated: number
          updated_at: string
          work_date: string
        }
        Insert: {
          active_calls_count?: number
          agent_id: string
          created_at?: string
          deals_closed?: number
          id?: string
          meetings_scheduled?: number
          mood?: string | null
          notes?: string | null
          organization_id: string
          requests_generated?: number
          updated_at?: string
          work_date?: string
        }
        Update: {
          active_calls_count?: number
          agent_id?: string
          created_at?: string
          deals_closed?: number
          id?: string
          meetings_scheduled?: number
          mood?: string | null
          notes?: string | null
          organization_id?: string
          requests_generated?: number
          updated_at?: string
          work_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "daily_agent_metrics_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agent_dashboard_summary"
            referencedColumns: ["agent_id"]
          },
          {
            foreignKeyName: "daily_agent_metrics_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agent_performance_report"
            referencedColumns: ["agent_id"]
          },
          {
            foreignKeyName: "daily_agent_metrics_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "daily_agent_metrics_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_overview"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "daily_agent_metrics_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_pnl"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "daily_agent_metrics_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "daily_agent_metrics_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "pipeline_performance"
            referencedColumns: ["organization_id"]
          },
        ]
      }
      deal_activities: {
        Row: {
          activity_at: string
          activity_type: string
          created_at: string
          deal_id: string
          id: string
          performed_by: string
          summary: string
        }
        Insert: {
          activity_at?: string
          activity_type: string
          created_at?: string
          deal_id: string
          id?: string
          performed_by: string
          summary: string
        }
        Update: {
          activity_at?: string
          activity_type?: string
          created_at?: string
          deal_id?: string
          id?: string
          performed_by?: string
          summary?: string
        }
        Relationships: [
          {
            foreignKeyName: "deal_activities_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "deals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deal_activities_performed_by_fkey"
            columns: ["performed_by"]
            isOneToOne: false
            referencedRelation: "agent_dashboard_summary"
            referencedColumns: ["agent_id"]
          },
          {
            foreignKeyName: "deal_activities_performed_by_fkey"
            columns: ["performed_by"]
            isOneToOne: false
            referencedRelation: "agent_performance_report"
            referencedColumns: ["agent_id"]
          },
          {
            foreignKeyName: "deal_activities_performed_by_fkey"
            columns: ["performed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      deal_sources: {
        Row: {
          created_at: string
          id: string
          name: string
          organization_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          organization_id: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          organization_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "deal_sources_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_overview"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "deal_sources_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_pnl"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "deal_sources_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deal_sources_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "pipeline_performance"
            referencedColumns: ["organization_id"]
          },
        ]
      }
      deals: {
        Row: {
          agent_id: string | null
          business_unit_id: string | null
          closed_date: string | null
          commission_value: number
          created_at: string
          deal_value: number
          developer_id: string | null
          expected_close_date: string | null
          id: string
          metadata: Json
          name: string
          notes: string | null
          organization_id: string
          probability: number
          source_id: string | null
          stage: Database["public"]["Enums"]["deal_stage"]
          team_id: string | null
          updated_at: string
        }
        Insert: {
          agent_id?: string | null
          business_unit_id?: string | null
          closed_date?: string | null
          commission_value?: number
          created_at?: string
          deal_value?: number
          developer_id?: string | null
          expected_close_date?: string | null
          id?: string
          metadata?: Json
          name: string
          notes?: string | null
          organization_id: string
          probability?: number
          source_id?: string | null
          stage?: Database["public"]["Enums"]["deal_stage"]
          team_id?: string | null
          updated_at?: string
        }
        Update: {
          agent_id?: string | null
          business_unit_id?: string | null
          closed_date?: string | null
          commission_value?: number
          created_at?: string
          deal_value?: number
          developer_id?: string | null
          expected_close_date?: string | null
          id?: string
          metadata?: Json
          name?: string
          notes?: string | null
          organization_id?: string
          probability?: number
          source_id?: string | null
          stage?: Database["public"]["Enums"]["deal_stage"]
          team_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "deals_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agent_dashboard_summary"
            referencedColumns: ["agent_id"]
          },
          {
            foreignKeyName: "deals_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agent_performance_report"
            referencedColumns: ["agent_id"]
          },
          {
            foreignKeyName: "deals_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deals_business_unit_id_fkey"
            columns: ["business_unit_id"]
            isOneToOne: false
            referencedRelation: "agent_performance_report"
            referencedColumns: ["business_unit_id"]
          },
          {
            foreignKeyName: "deals_business_unit_id_fkey"
            columns: ["business_unit_id"]
            isOneToOne: false
            referencedRelation: "business_unit_combined_report"
            referencedColumns: ["business_unit_id"]
          },
          {
            foreignKeyName: "deals_business_unit_id_fkey"
            columns: ["business_unit_id"]
            isOneToOne: false
            referencedRelation: "business_unit_finance_overview"
            referencedColumns: ["business_unit_id"]
          },
          {
            foreignKeyName: "deals_business_unit_id_fkey"
            columns: ["business_unit_id"]
            isOneToOne: false
            referencedRelation: "business_unit_pnl"
            referencedColumns: ["business_unit_id"]
          },
          {
            foreignKeyName: "deals_business_unit_id_fkey"
            columns: ["business_unit_id"]
            isOneToOne: false
            referencedRelation: "business_units"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deals_business_unit_id_fkey"
            columns: ["business_unit_id"]
            isOneToOne: false
            referencedRelation: "team_leader_dashboard"
            referencedColumns: ["business_unit_id"]
          },
          {
            foreignKeyName: "deals_business_unit_id_fkey"
            columns: ["business_unit_id"]
            isOneToOne: false
            referencedRelation: "team_performance_report"
            referencedColumns: ["business_unit_id"]
          },
          {
            foreignKeyName: "deals_developer_id_fkey"
            columns: ["developer_id"]
            isOneToOne: false
            referencedRelation: "developer_commission_rates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deals_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_overview"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "deals_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_pnl"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "deals_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deals_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "pipeline_performance"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "deals_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "deal_sources"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deals_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "agent_performance_report"
            referencedColumns: ["team_id"]
          },
          {
            foreignKeyName: "deals_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "team_leader_dashboard"
            referencedColumns: ["team_id"]
          },
          {
            foreignKeyName: "deals_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "team_member_performance"
            referencedColumns: ["team_id"]
          },
          {
            foreignKeyName: "deals_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "team_performance_report"
            referencedColumns: ["team_id"]
          },
          {
            foreignKeyName: "deals_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      developer_commission_rates: {
        Row: {
          base_commission_amount: number | null
          commission_percentage: number
          created_at: string
          developer_name: string
          id: string
          is_active: boolean | null
          notes: string | null
          organization_id: string
          project_name: string | null
          updated_at: string
        }
        Insert: {
          base_commission_amount?: number | null
          commission_percentage: number
          created_at?: string
          developer_name: string
          id?: string
          is_active?: boolean | null
          notes?: string | null
          organization_id: string
          project_name?: string | null
          updated_at?: string
        }
        Update: {
          base_commission_amount?: number | null
          commission_percentage?: number
          created_at?: string
          developer_name?: string
          id?: string
          is_active?: boolean | null
          notes?: string | null
          organization_id?: string
          project_name?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "developer_commission_rates_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_overview"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "developer_commission_rates_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_pnl"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "developer_commission_rates_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "developer_commission_rates_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "pipeline_performance"
            referencedColumns: ["organization_id"]
          },
        ]
      }
      employee_salaries: {
        Row: {
          created_at: string
          created_by: string | null
          currency: string | null
          effective_from: string
          effective_to: string | null
          employee_id: string
          id: string
          monthly_salary: number
          notes: string | null
          organization_id: string
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          currency?: string | null
          effective_from: string
          effective_to?: string | null
          employee_id: string
          id?: string
          monthly_salary: number
          notes?: string | null
          organization_id: string
          role: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          currency?: string | null
          effective_from?: string
          effective_to?: string | null
          employee_id?: string
          id?: string
          monthly_salary?: number
          notes?: string | null
          organization_id?: string
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "employee_salaries_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "agent_dashboard_summary"
            referencedColumns: ["agent_id"]
          },
          {
            foreignKeyName: "employee_salaries_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "agent_performance_report"
            referencedColumns: ["agent_id"]
          },
          {
            foreignKeyName: "employee_salaries_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employee_salaries_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "agent_dashboard_summary"
            referencedColumns: ["agent_id"]
          },
          {
            foreignKeyName: "employee_salaries_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "agent_performance_report"
            referencedColumns: ["agent_id"]
          },
          {
            foreignKeyName: "employee_salaries_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employee_salaries_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_overview"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "employee_salaries_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_pnl"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "employee_salaries_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employee_salaries_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "pipeline_performance"
            referencedColumns: ["organization_id"]
          },
        ]
      }
      finance_adjustments: {
        Row: {
          amount: number
          approved_by: string | null
          business_unit_id: string | null
          created_at: string
          created_by: string
          id: string
          notes: string | null
          organization_id: string
          reason: string
          status: Database["public"]["Enums"]["finance_adjustment_status"]
          updated_at: string
        }
        Insert: {
          amount?: number
          approved_by?: string | null
          business_unit_id?: string | null
          created_at?: string
          created_by: string
          id?: string
          notes?: string | null
          organization_id: string
          reason: string
          status?: Database["public"]["Enums"]["finance_adjustment_status"]
          updated_at?: string
        }
        Update: {
          amount?: number
          approved_by?: string | null
          business_unit_id?: string | null
          created_at?: string
          created_by?: string
          id?: string
          notes?: string | null
          organization_id?: string
          reason?: string
          status?: Database["public"]["Enums"]["finance_adjustment_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "finance_adjustments_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "agent_dashboard_summary"
            referencedColumns: ["agent_id"]
          },
          {
            foreignKeyName: "finance_adjustments_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "agent_performance_report"
            referencedColumns: ["agent_id"]
          },
          {
            foreignKeyName: "finance_adjustments_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "finance_adjustments_business_unit_id_fkey"
            columns: ["business_unit_id"]
            isOneToOne: false
            referencedRelation: "agent_performance_report"
            referencedColumns: ["business_unit_id"]
          },
          {
            foreignKeyName: "finance_adjustments_business_unit_id_fkey"
            columns: ["business_unit_id"]
            isOneToOne: false
            referencedRelation: "business_unit_combined_report"
            referencedColumns: ["business_unit_id"]
          },
          {
            foreignKeyName: "finance_adjustments_business_unit_id_fkey"
            columns: ["business_unit_id"]
            isOneToOne: false
            referencedRelation: "business_unit_finance_overview"
            referencedColumns: ["business_unit_id"]
          },
          {
            foreignKeyName: "finance_adjustments_business_unit_id_fkey"
            columns: ["business_unit_id"]
            isOneToOne: false
            referencedRelation: "business_unit_pnl"
            referencedColumns: ["business_unit_id"]
          },
          {
            foreignKeyName: "finance_adjustments_business_unit_id_fkey"
            columns: ["business_unit_id"]
            isOneToOne: false
            referencedRelation: "business_units"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "finance_adjustments_business_unit_id_fkey"
            columns: ["business_unit_id"]
            isOneToOne: false
            referencedRelation: "team_leader_dashboard"
            referencedColumns: ["business_unit_id"]
          },
          {
            foreignKeyName: "finance_adjustments_business_unit_id_fkey"
            columns: ["business_unit_id"]
            isOneToOne: false
            referencedRelation: "team_performance_report"
            referencedColumns: ["business_unit_id"]
          },
          {
            foreignKeyName: "finance_adjustments_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "agent_dashboard_summary"
            referencedColumns: ["agent_id"]
          },
          {
            foreignKeyName: "finance_adjustments_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "agent_performance_report"
            referencedColumns: ["agent_id"]
          },
          {
            foreignKeyName: "finance_adjustments_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "finance_adjustments_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_overview"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "finance_adjustments_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_pnl"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "finance_adjustments_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "finance_adjustments_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "pipeline_performance"
            referencedColumns: ["organization_id"]
          },
        ]
      }
      financial_snapshots: {
        Row: {
          business_unit_id: string | null
          contribution_margin: number | null
          created_at: string
          expenses: number
          id: string
          metadata: Json
          organization_id: string
          revenue: number
          snapshot_month: string
        }
        Insert: {
          business_unit_id?: string | null
          contribution_margin?: number | null
          created_at?: string
          expenses?: number
          id?: string
          metadata?: Json
          organization_id: string
          revenue?: number
          snapshot_month: string
        }
        Update: {
          business_unit_id?: string | null
          contribution_margin?: number | null
          created_at?: string
          expenses?: number
          id?: string
          metadata?: Json
          organization_id?: string
          revenue?: number
          snapshot_month?: string
        }
        Relationships: [
          {
            foreignKeyName: "financial_snapshots_business_unit_id_fkey"
            columns: ["business_unit_id"]
            isOneToOne: false
            referencedRelation: "agent_performance_report"
            referencedColumns: ["business_unit_id"]
          },
          {
            foreignKeyName: "financial_snapshots_business_unit_id_fkey"
            columns: ["business_unit_id"]
            isOneToOne: false
            referencedRelation: "business_unit_combined_report"
            referencedColumns: ["business_unit_id"]
          },
          {
            foreignKeyName: "financial_snapshots_business_unit_id_fkey"
            columns: ["business_unit_id"]
            isOneToOne: false
            referencedRelation: "business_unit_finance_overview"
            referencedColumns: ["business_unit_id"]
          },
          {
            foreignKeyName: "financial_snapshots_business_unit_id_fkey"
            columns: ["business_unit_id"]
            isOneToOne: false
            referencedRelation: "business_unit_pnl"
            referencedColumns: ["business_unit_id"]
          },
          {
            foreignKeyName: "financial_snapshots_business_unit_id_fkey"
            columns: ["business_unit_id"]
            isOneToOne: false
            referencedRelation: "business_units"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "financial_snapshots_business_unit_id_fkey"
            columns: ["business_unit_id"]
            isOneToOne: false
            referencedRelation: "team_leader_dashboard"
            referencedColumns: ["business_unit_id"]
          },
          {
            foreignKeyName: "financial_snapshots_business_unit_id_fkey"
            columns: ["business_unit_id"]
            isOneToOne: false
            referencedRelation: "team_performance_report"
            referencedColumns: ["business_unit_id"]
          },
          {
            foreignKeyName: "financial_snapshots_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_overview"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "financial_snapshots_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_pnl"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "financial_snapshots_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "financial_snapshots_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "pipeline_performance"
            referencedColumns: ["organization_id"]
          },
        ]
      }
      initiatives: {
        Row: {
          created_at: string
          description: string | null
          due_date: string | null
          id: string
          organization_id: string
          owner_id: string | null
          status: Database["public"]["Enums"]["initiative_status"]
          target_metric: string | null
          target_value: number | null
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          organization_id: string
          owner_id?: string | null
          status?: Database["public"]["Enums"]["initiative_status"]
          target_metric?: string | null
          target_value?: number | null
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          organization_id?: string
          owner_id?: string | null
          status?: Database["public"]["Enums"]["initiative_status"]
          target_metric?: string | null
          target_value?: number | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "initiatives_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_overview"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "initiatives_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_pnl"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "initiatives_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "initiatives_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "pipeline_performance"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "initiatives_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "agent_dashboard_summary"
            referencedColumns: ["agent_id"]
          },
          {
            foreignKeyName: "initiatives_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "agent_performance_report"
            referencedColumns: ["agent_id"]
          },
          {
            foreignKeyName: "initiatives_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      kpi_targets: {
        Row: {
          business_unit_id: string | null
          created_at: string
          id: string
          metric: string
          organization_id: string
          period_end: string
          period_start: string
          target_value: number
          team_id: string | null
          updated_at: string
        }
        Insert: {
          business_unit_id?: string | null
          created_at?: string
          id?: string
          metric: string
          organization_id: string
          period_end: string
          period_start: string
          target_value: number
          team_id?: string | null
          updated_at?: string
        }
        Update: {
          business_unit_id?: string | null
          created_at?: string
          id?: string
          metric?: string
          organization_id?: string
          period_end?: string
          period_start?: string
          target_value?: number
          team_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "kpi_targets_business_unit_id_fkey"
            columns: ["business_unit_id"]
            isOneToOne: false
            referencedRelation: "agent_performance_report"
            referencedColumns: ["business_unit_id"]
          },
          {
            foreignKeyName: "kpi_targets_business_unit_id_fkey"
            columns: ["business_unit_id"]
            isOneToOne: false
            referencedRelation: "business_unit_combined_report"
            referencedColumns: ["business_unit_id"]
          },
          {
            foreignKeyName: "kpi_targets_business_unit_id_fkey"
            columns: ["business_unit_id"]
            isOneToOne: false
            referencedRelation: "business_unit_finance_overview"
            referencedColumns: ["business_unit_id"]
          },
          {
            foreignKeyName: "kpi_targets_business_unit_id_fkey"
            columns: ["business_unit_id"]
            isOneToOne: false
            referencedRelation: "business_unit_pnl"
            referencedColumns: ["business_unit_id"]
          },
          {
            foreignKeyName: "kpi_targets_business_unit_id_fkey"
            columns: ["business_unit_id"]
            isOneToOne: false
            referencedRelation: "business_units"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "kpi_targets_business_unit_id_fkey"
            columns: ["business_unit_id"]
            isOneToOne: false
            referencedRelation: "team_leader_dashboard"
            referencedColumns: ["business_unit_id"]
          },
          {
            foreignKeyName: "kpi_targets_business_unit_id_fkey"
            columns: ["business_unit_id"]
            isOneToOne: false
            referencedRelation: "team_performance_report"
            referencedColumns: ["business_unit_id"]
          },
          {
            foreignKeyName: "kpi_targets_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_overview"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "kpi_targets_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_pnl"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "kpi_targets_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "kpi_targets_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "pipeline_performance"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "kpi_targets_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "agent_performance_report"
            referencedColumns: ["team_id"]
          },
          {
            foreignKeyName: "kpi_targets_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "team_leader_dashboard"
            referencedColumns: ["team_id"]
          },
          {
            foreignKeyName: "kpi_targets_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "team_member_performance"
            referencedColumns: ["team_id"]
          },
          {
            foreignKeyName: "kpi_targets_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "team_performance_report"
            referencedColumns: ["team_id"]
          },
          {
            foreignKeyName: "kpi_targets_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      leads: {
        Row: {
          agent_id: string
          client_email: string | null
          client_name: string
          client_phone: string | null
          contacted_date: string | null
          converted_date: string | null
          converted_deal_id: string | null
          created_at: string
          destination: string | null
          estimated_budget: number | null
          id: string
          lost_date: string | null
          lost_reason: string | null
          metadata: Json | null
          notes: string | null
          organization_id: string
          project_type: string | null
          qualified_date: string | null
          received_date: string
          source_id: string | null
          status: Database["public"]["Enums"]["lead_status"]
          team_id: string | null
          updated_at: string
        }
        Insert: {
          agent_id: string
          client_email?: string | null
          client_name: string
          client_phone?: string | null
          contacted_date?: string | null
          converted_date?: string | null
          converted_deal_id?: string | null
          created_at?: string
          destination?: string | null
          estimated_budget?: number | null
          id?: string
          lost_date?: string | null
          lost_reason?: string | null
          metadata?: Json | null
          notes?: string | null
          organization_id: string
          project_type?: string | null
          qualified_date?: string | null
          received_date?: string
          source_id?: string | null
          status?: Database["public"]["Enums"]["lead_status"]
          team_id?: string | null
          updated_at?: string
        }
        Update: {
          agent_id?: string
          client_email?: string | null
          client_name?: string
          client_phone?: string | null
          contacted_date?: string | null
          converted_date?: string | null
          converted_deal_id?: string | null
          created_at?: string
          destination?: string | null
          estimated_budget?: number | null
          id?: string
          lost_date?: string | null
          lost_reason?: string | null
          metadata?: Json | null
          notes?: string | null
          organization_id?: string
          project_type?: string | null
          qualified_date?: string | null
          received_date?: string
          source_id?: string | null
          status?: Database["public"]["Enums"]["lead_status"]
          team_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "leads_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agent_dashboard_summary"
            referencedColumns: ["agent_id"]
          },
          {
            foreignKeyName: "leads_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agent_performance_report"
            referencedColumns: ["agent_id"]
          },
          {
            foreignKeyName: "leads_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leads_converted_deal_id_fkey"
            columns: ["converted_deal_id"]
            isOneToOne: false
            referencedRelation: "deals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leads_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_overview"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "leads_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_pnl"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "leads_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leads_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "pipeline_performance"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "leads_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "deal_sources"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leads_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "agent_performance_report"
            referencedColumns: ["team_id"]
          },
          {
            foreignKeyName: "leads_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "team_leader_dashboard"
            referencedColumns: ["team_id"]
          },
          {
            foreignKeyName: "leads_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "team_member_performance"
            referencedColumns: ["team_id"]
          },
          {
            foreignKeyName: "leads_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "team_performance_report"
            referencedColumns: ["team_id"]
          },
          {
            foreignKeyName: "leads_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      meetings: {
        Row: {
          agent_id: string
          attendees: Json | null
          client_request_id: string | null
          created_at: string
          deal_id: string | null
          description: string | null
          duration_minutes: number | null
          id: string
          location: string | null
          meeting_date: string
          meeting_time: string
          organization_id: string
          outcome: string | null
          status: Database["public"]["Enums"]["meeting_status"]
          title: string
          updated_at: string
        }
        Insert: {
          agent_id: string
          attendees?: Json | null
          client_request_id?: string | null
          created_at?: string
          deal_id?: string | null
          description?: string | null
          duration_minutes?: number | null
          id?: string
          location?: string | null
          meeting_date: string
          meeting_time: string
          organization_id: string
          outcome?: string | null
          status?: Database["public"]["Enums"]["meeting_status"]
          title: string
          updated_at?: string
        }
        Update: {
          agent_id?: string
          attendees?: Json | null
          client_request_id?: string | null
          created_at?: string
          deal_id?: string | null
          description?: string | null
          duration_minutes?: number | null
          id?: string
          location?: string | null
          meeting_date?: string
          meeting_time?: string
          organization_id?: string
          outcome?: string | null
          status?: Database["public"]["Enums"]["meeting_status"]
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "meetings_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agent_dashboard_summary"
            referencedColumns: ["agent_id"]
          },
          {
            foreignKeyName: "meetings_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agent_performance_report"
            referencedColumns: ["agent_id"]
          },
          {
            foreignKeyName: "meetings_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "meetings_client_request_id_fkey"
            columns: ["client_request_id"]
            isOneToOne: false
            referencedRelation: "client_requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "meetings_client_request_id_fkey"
            columns: ["client_request_id"]
            isOneToOne: false
            referencedRelation: "pending_requests_by_leader"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "meetings_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "deals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "meetings_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_overview"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "meetings_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_pnl"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "meetings_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "meetings_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "pipeline_performance"
            referencedColumns: ["organization_id"]
          },
        ]
      }
      organizations: {
        Row: {
          created_at: string
          id: string
          name: string
          settings: Json
          timezone: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          settings?: Json
          timezone?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          settings?: Json
          timezone?: string
          updated_at?: string
        }
        Relationships: []
      }
      performance_cycles: {
        Row: {
          created_at: string
          ends_on: string
          id: string
          name: string
          organization_id: string
          starts_on: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          ends_on: string
          id?: string
          name: string
          organization_id: string
          starts_on: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          ends_on?: string
          id?: string
          name?: string
          organization_id?: string
          starts_on?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "performance_cycles_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_overview"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "performance_cycles_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_pnl"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "performance_cycles_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "performance_cycles_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "pipeline_performance"
            referencedColumns: ["organization_id"]
          },
        ]
      }
      performance_reviews: {
        Row: {
          action_plan: string | null
          created_at: string
          cycle_id: string
          id: string
          opportunities: string | null
          reviewee_id: string
          reviewer_id: string
          score: number
          strengths: string | null
          submitted_at: string | null
          updated_at: string
        }
        Insert: {
          action_plan?: string | null
          created_at?: string
          cycle_id: string
          id?: string
          opportunities?: string | null
          reviewee_id: string
          reviewer_id: string
          score: number
          strengths?: string | null
          submitted_at?: string | null
          updated_at?: string
        }
        Update: {
          action_plan?: string | null
          created_at?: string
          cycle_id?: string
          id?: string
          opportunities?: string | null
          reviewee_id?: string
          reviewer_id?: string
          score?: number
          strengths?: string | null
          submitted_at?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "performance_reviews_cycle_id_fkey"
            columns: ["cycle_id"]
            isOneToOne: false
            referencedRelation: "performance_cycles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "performance_reviews_reviewee_id_fkey"
            columns: ["reviewee_id"]
            isOneToOne: false
            referencedRelation: "agent_dashboard_summary"
            referencedColumns: ["agent_id"]
          },
          {
            foreignKeyName: "performance_reviews_reviewee_id_fkey"
            columns: ["reviewee_id"]
            isOneToOne: false
            referencedRelation: "agent_performance_report"
            referencedColumns: ["agent_id"]
          },
          {
            foreignKeyName: "performance_reviews_reviewee_id_fkey"
            columns: ["reviewee_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "performance_reviews_reviewer_id_fkey"
            columns: ["reviewer_id"]
            isOneToOne: false
            referencedRelation: "agent_dashboard_summary"
            referencedColumns: ["agent_id"]
          },
          {
            foreignKeyName: "performance_reviews_reviewer_id_fkey"
            columns: ["reviewer_id"]
            isOneToOne: false
            referencedRelation: "agent_performance_report"
            referencedColumns: ["agent_id"]
          },
          {
            foreignKeyName: "performance_reviews_reviewer_id_fkey"
            columns: ["reviewer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string | null
          full_name: string
          id: string
          metadata: Json
          organization_id: string
          preferred_name: string | null
          role: Database["public"]["Enums"]["user_role"]
          supervised_by: string | null
          supervision_started_at: string | null
          under_supervision: boolean | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name: string
          id: string
          metadata?: Json
          organization_id: string
          preferred_name?: string | null
          role: Database["public"]["Enums"]["user_role"]
          supervised_by?: string | null
          supervision_started_at?: string | null
          under_supervision?: boolean | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string
          id?: string
          metadata?: Json
          organization_id?: string
          preferred_name?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          supervised_by?: string | null
          supervision_started_at?: string | null
          under_supervision?: boolean | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_overview"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "profiles_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_pnl"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "profiles_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "pipeline_performance"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "profiles_supervised_by_fkey"
            columns: ["supervised_by"]
            isOneToOne: false
            referencedRelation: "agent_dashboard_summary"
            referencedColumns: ["agent_id"]
          },
          {
            foreignKeyName: "profiles_supervised_by_fkey"
            columns: ["supervised_by"]
            isOneToOne: false
            referencedRelation: "agent_performance_report"
            referencedColumns: ["agent_id"]
          },
          {
            foreignKeyName: "profiles_supervised_by_fkey"
            columns: ["supervised_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      tax_config: {
        Row: {
          created_at: string
          effective_from: string
          effective_to: string | null
          id: string
          income_tax_rate: number
          notes: string | null
          organization_id: string
          updated_at: string
          vat_rate: number
          withholding_tax_rate: number
        }
        Insert: {
          created_at?: string
          effective_from?: string
          effective_to?: string | null
          id?: string
          income_tax_rate?: number
          notes?: string | null
          organization_id: string
          updated_at?: string
          vat_rate?: number
          withholding_tax_rate?: number
        }
        Update: {
          created_at?: string
          effective_from?: string
          effective_to?: string | null
          id?: string
          income_tax_rate?: number
          notes?: string | null
          organization_id?: string
          updated_at?: string
          vat_rate?: number
          withholding_tax_rate?: number
        }
        Relationships: [
          {
            foreignKeyName: "tax_config_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_overview"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "tax_config_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_pnl"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "tax_config_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tax_config_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "pipeline_performance"
            referencedColumns: ["organization_id"]
          },
        ]
      }
      team_members: {
        Row: {
          assigned_role: Database["public"]["Enums"]["user_role"]
          joined_at: string
          team_id: string
          user_id: string
        }
        Insert: {
          assigned_role?: Database["public"]["Enums"]["user_role"]
          joined_at?: string
          team_id: string
          user_id: string
        }
        Update: {
          assigned_role?: Database["public"]["Enums"]["user_role"]
          joined_at?: string
          team_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_members_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "agent_performance_report"
            referencedColumns: ["team_id"]
          },
          {
            foreignKeyName: "team_members_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "team_leader_dashboard"
            referencedColumns: ["team_id"]
          },
          {
            foreignKeyName: "team_members_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "team_member_performance"
            referencedColumns: ["team_id"]
          },
          {
            foreignKeyName: "team_members_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "team_performance_report"
            referencedColumns: ["team_id"]
          },
          {
            foreignKeyName: "team_members_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "team_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "agent_dashboard_summary"
            referencedColumns: ["agent_id"]
          },
          {
            foreignKeyName: "team_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "agent_performance_report"
            referencedColumns: ["agent_id"]
          },
          {
            foreignKeyName: "team_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      teams: {
        Row: {
          business_unit_id: string
          created_at: string
          id: string
          leader_id: string | null
          name: string
          updated_at: string
        }
        Insert: {
          business_unit_id: string
          created_at?: string
          id?: string
          leader_id?: string | null
          name: string
          updated_at?: string
        }
        Update: {
          business_unit_id?: string
          created_at?: string
          id?: string
          leader_id?: string | null
          name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "teams_business_unit_id_fkey"
            columns: ["business_unit_id"]
            isOneToOne: false
            referencedRelation: "agent_performance_report"
            referencedColumns: ["business_unit_id"]
          },
          {
            foreignKeyName: "teams_business_unit_id_fkey"
            columns: ["business_unit_id"]
            isOneToOne: false
            referencedRelation: "business_unit_combined_report"
            referencedColumns: ["business_unit_id"]
          },
          {
            foreignKeyName: "teams_business_unit_id_fkey"
            columns: ["business_unit_id"]
            isOneToOne: false
            referencedRelation: "business_unit_finance_overview"
            referencedColumns: ["business_unit_id"]
          },
          {
            foreignKeyName: "teams_business_unit_id_fkey"
            columns: ["business_unit_id"]
            isOneToOne: false
            referencedRelation: "business_unit_pnl"
            referencedColumns: ["business_unit_id"]
          },
          {
            foreignKeyName: "teams_business_unit_id_fkey"
            columns: ["business_unit_id"]
            isOneToOne: false
            referencedRelation: "business_units"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "teams_business_unit_id_fkey"
            columns: ["business_unit_id"]
            isOneToOne: false
            referencedRelation: "team_leader_dashboard"
            referencedColumns: ["business_unit_id"]
          },
          {
            foreignKeyName: "teams_business_unit_id_fkey"
            columns: ["business_unit_id"]
            isOneToOne: false
            referencedRelation: "team_performance_report"
            referencedColumns: ["business_unit_id"]
          },
        ]
      }
    }
    Views: {
      agent_daily_activity: {
        Row: {
          activity_count: number | null
          activity_date: string | null
          activity_entries: Json[] | null
          activity_type: string | null
          agent_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "deals_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agent_dashboard_summary"
            referencedColumns: ["agent_id"]
          },
          {
            foreignKeyName: "deals_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agent_performance_report"
            referencedColumns: ["agent_id"]
          },
          {
            foreignKeyName: "deals_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      agent_daily_summary: {
        Row: {
          agent_id: string | null
          agent_name: string | null
          calls_made: number | null
          check_in_time: string | null
          check_out_time: string | null
          deals: number | null
          hours_worked: number | null
          meetings: number | null
          mood: string | null
          requests: number | null
          work_date: string | null
        }
        Relationships: [
          {
            foreignKeyName: "daily_agent_metrics_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agent_dashboard_summary"
            referencedColumns: ["agent_id"]
          },
          {
            foreignKeyName: "daily_agent_metrics_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agent_performance_report"
            referencedColumns: ["agent_id"]
          },
          {
            foreignKeyName: "daily_agent_metrics_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      agent_dashboard_summary: {
        Row: {
          agent_id: string | null
          email: string | null
          full_name: string | null
          open_deals: number | null
          preferred_name: string | null
          total_closed_value: number | null
          total_commission: number | null
          weighted_pipeline: number | null
          wins_this_week: number | null
        }
        Relationships: []
      }
      agent_performance_report: {
        Row: {
          agent_id: string | null
          agent_name: string | null
          avg_appearance: number | null
          avg_hours_per_day: number | null
          avg_professionalism: number | null
          avg_rating_score: number | null
          business_unit_id: string | null
          business_unit_name: string | null
          conversion_rate: number | null
          converted_leads: number | null
          days_worked: number | null
          deals_won: number | null
          email: string | null
          organization_id: string | null
          report_month: string | null
          role: Database["public"]["Enums"]["user_role"] | null
          team_id: string | null
          team_name: string | null
          total_calls: number | null
          total_commission_earned: number | null
          total_deal_value: number | null
          total_leads: number | null
          total_meetings: number | null
          total_requests: number | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_overview"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "profiles_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_pnl"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "profiles_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "pipeline_performance"
            referencedColumns: ["organization_id"]
          },
        ]
      }
      ai_insight_recent: {
        Row: {
          completed_at: string | null
          created_at: string | null
          id: string | null
          initiated_by: string | null
          organization_id: string | null
          output: Json | null
          scope: string | null
          status: string | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          id?: string | null
          initiated_by?: string | null
          organization_id?: string | null
          output?: Json | null
          scope?: string | null
          status?: string | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          id?: string | null
          initiated_by?: string | null
          organization_id?: string | null
          output?: Json | null
          scope?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_insight_runs_initiated_by_fkey"
            columns: ["initiated_by"]
            isOneToOne: false
            referencedRelation: "agent_dashboard_summary"
            referencedColumns: ["agent_id"]
          },
          {
            foreignKeyName: "ai_insight_runs_initiated_by_fkey"
            columns: ["initiated_by"]
            isOneToOne: false
            referencedRelation: "agent_performance_report"
            referencedColumns: ["agent_id"]
          },
          {
            foreignKeyName: "ai_insight_runs_initiated_by_fkey"
            columns: ["initiated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_insight_runs_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_overview"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "ai_insight_runs_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_pnl"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "ai_insight_runs_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_insight_runs_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "pipeline_performance"
            referencedColumns: ["organization_id"]
          },
        ]
      }
      attendance_today: {
        Row: {
          agent_id: string | null
          agent_name: string | null
          check_in_time: string | null
          check_out_time: string | null
          email: string | null
          hours_worked: number | null
          id: string | null
          location_check_in: string | null
          location_check_out: string | null
          organization_id: string | null
          work_date: string | null
        }
        Relationships: [
          {
            foreignKeyName: "attendance_logs_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agent_dashboard_summary"
            referencedColumns: ["agent_id"]
          },
          {
            foreignKeyName: "attendance_logs_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agent_performance_report"
            referencedColumns: ["agent_id"]
          },
          {
            foreignKeyName: "attendance_logs_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_logs_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_overview"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "attendance_logs_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_pnl"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "attendance_logs_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_logs_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "pipeline_performance"
            referencedColumns: ["organization_id"]
          },
        ]
      }
      business_unit_combined_report: {
        Row: {
          agent_count: number | null
          business_unit_id: string | null
          business_unit_name: string | null
          commission_costs: number | null
          detailed_costs: number | null
          expenses: number | null
          gross_profit: number | null
          net_profit_before_income_tax: number | null
          open_deals: number | null
          organization_id: string | null
          organization_name: string | null
          payroll_costs: number | null
          report_month: string | null
          revenue: number | null
          team_count: number | null
          total_sales_value: number | null
          vat_tax: number | null
          withholding_tax: number | null
          won_deals: number | null
        }
        Relationships: [
          {
            foreignKeyName: "business_units_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_overview"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "business_units_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_pnl"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "business_units_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "business_units_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "pipeline_performance"
            referencedColumns: ["organization_id"]
          },
        ]
      }
      business_unit_finance_overview: {
        Row: {
          business_unit_id: string | null
          business_unit_name: string | null
          organization_id: string | null
          total_expenses: number | null
          total_margin: number | null
          total_revenue: number | null
          trailing_three_month_margin: number | null
        }
        Relationships: [
          {
            foreignKeyName: "business_units_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_overview"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "business_units_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_pnl"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "business_units_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "business_units_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "pipeline_performance"
            referencedColumns: ["organization_id"]
          },
        ]
      }
      business_unit_pnl: {
        Row: {
          business_unit_id: string | null
          business_unit_name: string | null
          contribution_margin: number | null
          fixed_costs: number | null
          gross_revenue: number | null
          net_profit: number | null
          organization_id: string | null
          period_month: string | null
          profit_before_income_tax: number | null
          total_commissions_paid: number | null
          total_expenses: number | null
          total_salaries: number | null
          variable_costs: number | null
          vat: number | null
          withholding_tax: number | null
        }
        Relationships: [
          {
            foreignKeyName: "business_units_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_overview"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "business_units_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_pnl"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "business_units_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "business_units_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "pipeline_performance"
            referencedColumns: ["organization_id"]
          },
        ]
      }
      monthly_finance_trends: {
        Row: {
          business_unit_id: string | null
          business_unit_name: string | null
          contribution_margin: number | null
          expenses: number | null
          revenue: number | null
          snapshot_month: string | null
        }
        Relationships: [
          {
            foreignKeyName: "financial_snapshots_business_unit_id_fkey"
            columns: ["business_unit_id"]
            isOneToOne: false
            referencedRelation: "agent_performance_report"
            referencedColumns: ["business_unit_id"]
          },
          {
            foreignKeyName: "financial_snapshots_business_unit_id_fkey"
            columns: ["business_unit_id"]
            isOneToOne: false
            referencedRelation: "business_unit_combined_report"
            referencedColumns: ["business_unit_id"]
          },
          {
            foreignKeyName: "financial_snapshots_business_unit_id_fkey"
            columns: ["business_unit_id"]
            isOneToOne: false
            referencedRelation: "business_unit_finance_overview"
            referencedColumns: ["business_unit_id"]
          },
          {
            foreignKeyName: "financial_snapshots_business_unit_id_fkey"
            columns: ["business_unit_id"]
            isOneToOne: false
            referencedRelation: "business_unit_pnl"
            referencedColumns: ["business_unit_id"]
          },
          {
            foreignKeyName: "financial_snapshots_business_unit_id_fkey"
            columns: ["business_unit_id"]
            isOneToOne: false
            referencedRelation: "business_units"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "financial_snapshots_business_unit_id_fkey"
            columns: ["business_unit_id"]
            isOneToOne: false
            referencedRelation: "team_leader_dashboard"
            referencedColumns: ["business_unit_id"]
          },
          {
            foreignKeyName: "financial_snapshots_business_unit_id_fkey"
            columns: ["business_unit_id"]
            isOneToOne: false
            referencedRelation: "team_performance_report"
            referencedColumns: ["business_unit_id"]
          },
        ]
      }
      organization_overview: {
        Row: {
          business_unit_count: number | null
          member_count: number | null
          organization_id: string | null
          organization_name: string | null
          team_count: number | null
          total_expenses: number | null
          total_margin: number | null
          total_revenue: number | null
        }
        Relationships: []
      }
      organization_pnl: {
        Row: {
          contribution_margin: number | null
          net_profit: number | null
          organization_id: string | null
          organization_name: string | null
          period_month: string | null
          profit_before_income_tax: number | null
          total_commissions: number | null
          total_expenses: number | null
          total_fixed_costs: number | null
          total_gross_revenue: number | null
          total_variable_costs: number | null
          total_vat: number | null
          total_withholding_tax: number | null
        }
        Relationships: []
      }
      pending_requests_by_leader: {
        Row: {
          agent_id: string | null
          agent_name: string | null
          agent_notes: string | null
          client_budget: number | null
          client_name: string | null
          client_phone: string | null
          created_at: string | null
          delivery_date: string | null
          destination: string | null
          id: string | null
          organization_id: string | null
          project_needed: string | null
          team_leader_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "client_requests_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agent_dashboard_summary"
            referencedColumns: ["agent_id"]
          },
          {
            foreignKeyName: "client_requests_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agent_performance_report"
            referencedColumns: ["agent_id"]
          },
          {
            foreignKeyName: "client_requests_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_requests_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_overview"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "client_requests_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_pnl"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "client_requests_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_requests_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "pipeline_performance"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "client_requests_team_leader_id_fkey"
            columns: ["team_leader_id"]
            isOneToOne: false
            referencedRelation: "agent_dashboard_summary"
            referencedColumns: ["agent_id"]
          },
          {
            foreignKeyName: "client_requests_team_leader_id_fkey"
            columns: ["team_leader_id"]
            isOneToOne: false
            referencedRelation: "agent_performance_report"
            referencedColumns: ["agent_id"]
          },
          {
            foreignKeyName: "client_requests_team_leader_id_fkey"
            columns: ["team_leader_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      pipeline_performance: {
        Row: {
          closed_deals: number | null
          closed_value: number | null
          open_deals: number | null
          organization_id: string | null
          pipeline_month: string | null
          weighted_pipeline: number | null
        }
        Relationships: []
      }
      revenue_from_deals: {
        Row: {
          business_unit_id: string | null
          calculated_gross_revenue: number | null
          deals_won: number | null
          organization_id: string | null
          revenue_month: string | null
          total_commission: number | null
          total_deal_value: number | null
        }
        Relationships: [
          {
            foreignKeyName: "deals_business_unit_id_fkey"
            columns: ["business_unit_id"]
            isOneToOne: false
            referencedRelation: "agent_performance_report"
            referencedColumns: ["business_unit_id"]
          },
          {
            foreignKeyName: "deals_business_unit_id_fkey"
            columns: ["business_unit_id"]
            isOneToOne: false
            referencedRelation: "business_unit_combined_report"
            referencedColumns: ["business_unit_id"]
          },
          {
            foreignKeyName: "deals_business_unit_id_fkey"
            columns: ["business_unit_id"]
            isOneToOne: false
            referencedRelation: "business_unit_finance_overview"
            referencedColumns: ["business_unit_id"]
          },
          {
            foreignKeyName: "deals_business_unit_id_fkey"
            columns: ["business_unit_id"]
            isOneToOne: false
            referencedRelation: "business_unit_pnl"
            referencedColumns: ["business_unit_id"]
          },
          {
            foreignKeyName: "deals_business_unit_id_fkey"
            columns: ["business_unit_id"]
            isOneToOne: false
            referencedRelation: "business_units"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deals_business_unit_id_fkey"
            columns: ["business_unit_id"]
            isOneToOne: false
            referencedRelation: "team_leader_dashboard"
            referencedColumns: ["business_unit_id"]
          },
          {
            foreignKeyName: "deals_business_unit_id_fkey"
            columns: ["business_unit_id"]
            isOneToOne: false
            referencedRelation: "team_performance_report"
            referencedColumns: ["business_unit_id"]
          },
          {
            foreignKeyName: "deals_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_overview"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "deals_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_pnl"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "deals_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deals_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "pipeline_performance"
            referencedColumns: ["organization_id"]
          },
        ]
      }
      team_leader_dashboard: {
        Row: {
          business_unit_id: string | null
          business_unit_name: string | null
          leader_id: string | null
          member_count: number | null
          open_deals: number | null
          organization_id: string | null
          team_id: string | null
          team_name: string | null
          total_closed_value: number | null
          total_commission: number | null
          weighted_pipeline: number | null
        }
        Relationships: [
          {
            foreignKeyName: "business_units_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_overview"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "business_units_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_pnl"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "business_units_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "business_units_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "pipeline_performance"
            referencedColumns: ["organization_id"]
          },
        ]
      }
      team_member_performance: {
        Row: {
          agent_id: string | null
          agent_name: string | null
          avg_probability: number | null
          closed_value: number | null
          commission_value: number | null
          open_deals: number | null
          team_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "deals_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agent_dashboard_summary"
            referencedColumns: ["agent_id"]
          },
          {
            foreignKeyName: "deals_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agent_performance_report"
            referencedColumns: ["agent_id"]
          },
          {
            foreignKeyName: "deals_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      team_performance_report: {
        Row: {
          approved_requests: number | null
          business_unit_id: string | null
          business_unit_name: string | null
          converted_team_leads: number | null
          leader_id: string | null
          leader_name: string | null
          organization_id: string | null
          pending_requests: number | null
          report_month: string | null
          team_avg_rating: number | null
          team_deals_won: number | null
          team_id: string | null
          team_name: string | null
          team_size: number | null
          team_total_commission: number | null
          team_total_value: number | null
          total_team_calls: number | null
          total_team_leads: number | null
          total_team_meetings: number | null
          total_team_requests: number | null
        }
        Relationships: [
          {
            foreignKeyName: "business_units_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_overview"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "business_units_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_pnl"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "business_units_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "business_units_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "pipeline_performance"
            referencedColumns: ["organization_id"]
          },
        ]
      }
      upcoming_meetings: {
        Row: {
          agent_id: string | null
          agent_name: string | null
          client_request_id: string | null
          deal_id: string | null
          deal_name: string | null
          duration_minutes: number | null
          id: string | null
          location: string | null
          meeting_date: string | null
          meeting_datetime: string | null
          meeting_time: string | null
          organization_id: string | null
          status: Database["public"]["Enums"]["meeting_status"] | null
          title: string | null
        }
        Relationships: [
          {
            foreignKeyName: "meetings_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agent_dashboard_summary"
            referencedColumns: ["agent_id"]
          },
          {
            foreignKeyName: "meetings_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agent_performance_report"
            referencedColumns: ["agent_id"]
          },
          {
            foreignKeyName: "meetings_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "meetings_client_request_id_fkey"
            columns: ["client_request_id"]
            isOneToOne: false
            referencedRelation: "client_requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "meetings_client_request_id_fkey"
            columns: ["client_request_id"]
            isOneToOne: false
            referencedRelation: "pending_requests_by_leader"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "meetings_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "deals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "meetings_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_overview"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "meetings_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_pnl"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "meetings_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "meetings_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "pipeline_performance"
            referencedColumns: ["organization_id"]
          },
        ]
      }
      user_team_hierarchy: {
        Row: {
          business_unit_id: string | null
          organization_id: string | null
          relation: string | null
          team_id: string | null
          user_id: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      can_access_business_unit: {
        Args: { target_id: string }
        Returns: boolean
      }
      can_access_deal: { Args: { target_id: string }; Returns: boolean }
      can_access_profile: { Args: { target_id: string }; Returns: boolean }
      can_access_team: { Args: { target_id: string }; Returns: boolean }
      current_organization_id: { Args: never; Returns: string }
      current_profile_id: { Args: never; Returns: string }
      current_role: {
        Args: never
        Returns: Database["public"]["Enums"]["user_role"]
      }
      has_any_role: {
        Args: { target_roles: Database["public"]["Enums"]["user_role"][] }
        Returns: boolean
      }
    }
    Enums: {
      assist_request_status: "open" | "in_progress" | "resolved" | "declined"
      cost_category:
        | "rent"
        | "salary_agent"
        | "salary_team_leader"
        | "salary_sales_manager"
        | "salary_bu_head"
        | "salary_finance"
        | "salary_ceo"
        | "salary_admin"
        | "marketing"
        | "phone_bills"
        | "utilities"
        | "software_subscriptions"
        | "office_supplies"
        | "travel"
        | "training"
        | "other_fixed"
        | "other_variable"
      deal_stage:
        | "prospecting"
        | "qualified"
        | "negotiation"
        | "contract_sent"
        | "won"
        | "lost"
      finance_adjustment_status: "pending" | "approved" | "rejected"
      initiative_status: "draft" | "active" | "completed" | "archived"
      lead_status:
        | "new"
        | "contacted"
        | "qualified"
        | "unqualified"
        | "converted"
        | "lost"
      meeting_status: "scheduled" | "completed" | "cancelled" | "rescheduled"
      request_status: "pending" | "approved" | "rejected" | "converted"
      user_role:
        | "sales_agent"
        | "team_leader"
        | "sales_manager"
        | "finance"
        | "business_unit_head"
        | "ceo"
        | "admin"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      assist_request_status: ["open", "in_progress", "resolved", "declined"],
      cost_category: [
        "rent",
        "salary_agent",
        "salary_team_leader",
        "salary_sales_manager",
        "salary_bu_head",
        "salary_finance",
        "salary_ceo",
        "salary_admin",
        "marketing",
        "phone_bills",
        "utilities",
        "software_subscriptions",
        "office_supplies",
        "travel",
        "training",
        "other_fixed",
        "other_variable",
      ],
      deal_stage: [
        "prospecting",
        "qualified",
        "negotiation",
        "contract_sent",
        "won",
        "lost",
      ],
      finance_adjustment_status: ["pending", "approved", "rejected"],
      initiative_status: ["draft", "active", "completed", "archived"],
      lead_status: [
        "new",
        "contacted",
        "qualified",
        "unqualified",
        "converted",
        "lost",
      ],
      meeting_status: ["scheduled", "completed", "cancelled", "rescheduled"],
      request_status: ["pending", "approved", "rejected", "converted"],
      user_role: [
        "sales_agent",
        "team_leader",
        "sales_manager",
        "finance",
        "business_unit_head",
        "ceo",
        "admin",
      ],
    },
  },
} as const
