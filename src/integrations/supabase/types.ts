export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      agent_commissions: {
        Row: {
          active_users_commission: number | null
          active_users_count: number | null
          agent_id: string
          calculation_period_end: string
          calculation_period_start: string
          completed_sessions_count: number | null
          created_at: string
          id: string
          is_paid: boolean | null
          paid_date: string | null
          sessions_commission: number | null
          sms_commission: number | null
          sms_count: number | null
          total_commission: number | null
          transaction_bonuses_amount: number | null
          transaction_bonuses_count: number | null
          updated_at: string
        }
        Insert: {
          active_users_commission?: number | null
          active_users_count?: number | null
          agent_id: string
          calculation_period_end: string
          calculation_period_start: string
          completed_sessions_count?: number | null
          created_at?: string
          id?: string
          is_paid?: boolean | null
          paid_date?: string | null
          sessions_commission?: number | null
          sms_commission?: number | null
          sms_count?: number | null
          total_commission?: number | null
          transaction_bonuses_amount?: number | null
          transaction_bonuses_count?: number | null
          updated_at?: string
        }
        Update: {
          active_users_commission?: number | null
          active_users_count?: number | null
          agent_id?: string
          calculation_period_end?: string
          calculation_period_start?: string
          completed_sessions_count?: number | null
          created_at?: string
          id?: string
          is_paid?: boolean | null
          paid_date?: string | null
          sessions_commission?: number | null
          sms_commission?: number | null
          sms_count?: number | null
          total_commission?: number | null
          transaction_bonuses_amount?: number | null
          transaction_bonuses_count?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "agent_commissions_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
        ]
      }
      agent_recruited_users: {
        Row: {
          agent_id: string
          created_at: string
          id: string
          is_active: boolean | null
          last_activity_date: string | null
          registration_date: string
          user_phone: string
          user_type: string
        }
        Insert: {
          agent_id: string
          created_at?: string
          id?: string
          is_active?: boolean | null
          last_activity_date?: string | null
          registration_date?: string
          user_phone: string
          user_type: string
        }
        Update: {
          agent_id?: string
          created_at?: string
          id?: string
          is_active?: boolean | null
          last_activity_date?: string | null
          registration_date?: string
          user_phone?: string
          user_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "agent_recruited_users_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
        ]
      }
      agent_services: {
        Row: {
          agent_id: string
          created_at: string
          id: string
          is_enabled: boolean | null
          rate: number
          rate_type: string
          service_type: string
        }
        Insert: {
          agent_id: string
          created_at?: string
          id?: string
          is_enabled?: boolean | null
          rate: number
          rate_type: string
          service_type: string
        }
        Update: {
          agent_id?: string
          created_at?: string
          id?: string
          is_enabled?: boolean | null
          rate?: number
          rate_type?: string
          service_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "agent_services_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
        ]
      }
      agent_user_sessions: {
        Row: {
          agent_id: string
          created_at: string
          id: string
          is_completed: boolean | null
          recruited_user_id: string
          session_date: string
          session_type: string
        }
        Insert: {
          agent_id: string
          created_at?: string
          id?: string
          is_completed?: boolean | null
          recruited_user_id: string
          session_date?: string
          session_type: string
        }
        Update: {
          agent_id?: string
          created_at?: string
          id?: string
          is_completed?: boolean | null
          recruited_user_id?: string
          session_date?: string
          session_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "agent_user_sessions_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agent_user_sessions_recruited_user_id_fkey"
            columns: ["recruited_user_id"]
            isOneToOne: false
            referencedRelation: "agent_recruited_users"
            referencedColumns: ["id"]
          },
        ]
      }
      agent_user_sms: {
        Row: {
          agent_id: string
          created_at: string
          id: string
          recruited_user_id: string
          sms_count: number
          sms_date: string
        }
        Insert: {
          agent_id: string
          created_at?: string
          id?: string
          recruited_user_id: string
          sms_count?: number
          sms_date?: string
        }
        Update: {
          agent_id?: string
          created_at?: string
          id?: string
          recruited_user_id?: string
          sms_count?: number
          sms_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "agent_user_sms_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agent_user_sms_recruited_user_id_fkey"
            columns: ["recruited_user_id"]
            isOneToOne: false
            referencedRelation: "agent_recruited_users"
            referencedColumns: ["id"]
          },
        ]
      }
      agent_user_transactions: {
        Row: {
          agent_id: string
          created_at: string
          id: string
          recruited_user_id: string
          revenue_generated: number | null
          transaction_amount: number
          transaction_date: string
          transaction_type: string
        }
        Insert: {
          agent_id: string
          created_at?: string
          id?: string
          recruited_user_id: string
          revenue_generated?: number | null
          transaction_amount: number
          transaction_date?: string
          transaction_type: string
        }
        Update: {
          agent_id?: string
          created_at?: string
          id?: string
          recruited_user_id?: string
          revenue_generated?: number | null
          transaction_amount?: number
          transaction_date?: string
          transaction_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "agent_user_transactions_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agent_user_transactions_recruited_user_id_fkey"
            columns: ["recruited_user_id"]
            isOneToOne: false
            referencedRelation: "agent_recruited_users"
            referencedColumns: ["id"]
          },
        ]
      }
      agent_wallets: {
        Row: {
          agent_id: string
          balance: number | null
          created_at: string
          id: string
          last_transaction_at: string | null
          total_transactions: number | null
          updated_at: string
        }
        Insert: {
          agent_id: string
          balance?: number | null
          created_at?: string
          id?: string
          last_transaction_at?: string | null
          total_transactions?: number | null
          updated_at?: string
        }
        Update: {
          agent_id?: string
          balance?: number | null
          created_at?: string
          id?: string
          last_transaction_at?: string | null
          total_transactions?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "agent_wallets_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: true
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
        ]
      }
      agents: {
        Row: {
          agent_id: string
          agent_name: string
          auto_kyc: boolean | null
          created_at: string
          created_by: string | null
          id: string
          initial_topup: number | null
          phone_number: string
          region: string
          sales_agent_id: string | null
          status: Database["public"]["Enums"]["agent_status"] | null
          supervisor: string
          updated_at: string
        }
        Insert: {
          agent_id: string
          agent_name: string
          auto_kyc?: boolean | null
          created_at?: string
          created_by?: string | null
          id?: string
          initial_topup?: number | null
          phone_number: string
          region: string
          sales_agent_id?: string | null
          status?: Database["public"]["Enums"]["agent_status"] | null
          supervisor: string
          updated_at?: string
        }
        Update: {
          agent_id?: string
          agent_name?: string
          auto_kyc?: boolean | null
          created_at?: string
          created_by?: string | null
          id?: string
          initial_topup?: number | null
          phone_number?: string
          region?: string
          sales_agent_id?: string | null
          status?: Database["public"]["Enums"]["agent_status"] | null
          supervisor?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_agents_sales_agent"
            columns: ["sales_agent_id"]
            isOneToOne: false
            referencedRelation: "sales_agents"
            referencedColumns: ["id"]
          },
        ]
      }
      commission_rules: {
        Row: {
          bonus_amount: number | null
          bonus_threshold: number | null
          created_at: string
          id: string
          is_active: boolean | null
          rate: number
          rule_name: string
          rule_type: string
          updated_at: string
        }
        Insert: {
          bonus_amount?: number | null
          bonus_threshold?: number | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          rate: number
          rule_name: string
          rule_type: string
          updated_at?: string
        }
        Update: {
          bonus_amount?: number | null
          bonus_threshold?: number | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          rate?: number
          rule_name?: string
          rule_type?: string
          updated_at?: string
        }
        Relationships: []
      }
      cost_categories: {
        Row: {
          category_name: string
          created_at: string
          description: string | null
          id: string
          is_active: boolean | null
        }
        Insert: {
          category_name: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
        }
        Update: {
          category_name?: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
        }
        Relationships: []
      }
      cost_entries: {
        Row: {
          agent_id: string | null
          amount: number
          category_id: string
          cost_date: string
          cost_type: string
          created_at: string
          created_by: string | null
          description: string
          id: string
          updated_at: string
        }
        Insert: {
          agent_id?: string | null
          amount: number
          category_id: string
          cost_date: string
          cost_type: string
          created_at?: string
          created_by?: string | null
          description: string
          id?: string
          updated_at?: string
        }
        Update: {
          agent_id?: string | null
          amount?: number
          category_id?: string
          cost_date?: string
          cost_type?: string
          created_at?: string
          created_by?: string | null
          description?: string
          id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "cost_entries_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cost_entries_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "cost_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      fx_rate_history: {
        Row: {
          changed_at: string
          changed_by: string | null
          fx_rate_id: string
          id: string
          new_rate: number
          old_rate: number
        }
        Insert: {
          changed_at?: string
          changed_by?: string | null
          fx_rate_id: string
          id?: string
          new_rate: number
          old_rate: number
        }
        Update: {
          changed_at?: string
          changed_by?: string | null
          fx_rate_id?: string
          id?: string
          new_rate?: number
          old_rate?: number
        }
        Relationships: [
          {
            foreignKeyName: "fx_rate_history_fx_rate_id_fkey"
            columns: ["fx_rate_id"]
            isOneToOne: false
            referencedRelation: "fx_rates"
            referencedColumns: ["id"]
          },
        ]
      }
      fx_rates: {
        Row: {
          created_at: string
          effective_date: string
          from_currency: string
          id: string
          is_active: boolean | null
          rate: number
          to_currency: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          effective_date?: string
          from_currency: string
          id?: string
          is_active?: boolean | null
          rate: number
          to_currency: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          effective_date?: string
          from_currency?: string
          id?: string
          is_active?: boolean | null
          rate?: number
          to_currency?: string
          updated_at?: string
        }
        Relationships: []
      }
      sales_agent_commissions: {
        Row: {
          calculation_period_end: string
          calculation_period_start: string
          created_at: string
          id: string
          is_paid: boolean | null
          paid_date: string | null
          performance_bonus: number | null
          sales_agent_commission: number | null
          sales_agent_id: string
          supervised_agents_count: number | null
          total_agent_commissions: number | null
          total_agent_revenue: number | null
          total_earning: number | null
          updated_at: string
        }
        Insert: {
          calculation_period_end: string
          calculation_period_start: string
          created_at?: string
          id?: string
          is_paid?: boolean | null
          paid_date?: string | null
          performance_bonus?: number | null
          sales_agent_commission?: number | null
          sales_agent_id: string
          supervised_agents_count?: number | null
          total_agent_commissions?: number | null
          total_agent_revenue?: number | null
          total_earning?: number | null
          updated_at?: string
        }
        Update: {
          calculation_period_end?: string
          calculation_period_start?: string
          created_at?: string
          id?: string
          is_paid?: boolean | null
          paid_date?: string | null
          performance_bonus?: number | null
          sales_agent_commission?: number | null
          sales_agent_id?: string
          supervised_agents_count?: number | null
          total_agent_commissions?: number | null
          total_agent_revenue?: number | null
          total_earning?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "sales_agent_commissions_sales_agent_id_fkey"
            columns: ["sales_agent_id"]
            isOneToOne: false
            referencedRelation: "sales_agents"
            referencedColumns: ["id"]
          },
        ]
      }
      sales_agent_wallets: {
        Row: {
          balance: number | null
          commission_balance: number | null
          created_at: string
          id: string
          last_transaction_at: string | null
          sales_agent_id: string
          total_earnings: number | null
          updated_at: string
        }
        Insert: {
          balance?: number | null
          commission_balance?: number | null
          created_at?: string
          id?: string
          last_transaction_at?: string | null
          sales_agent_id: string
          total_earnings?: number | null
          updated_at?: string
        }
        Update: {
          balance?: number | null
          commission_balance?: number | null
          created_at?: string
          id?: string
          last_transaction_at?: string | null
          sales_agent_id?: string
          total_earnings?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "sales_agent_wallets_sales_agent_id_fkey"
            columns: ["sales_agent_id"]
            isOneToOne: true
            referencedRelation: "sales_agents"
            referencedColumns: ["id"]
          },
        ]
      }
      sales_agents: {
        Row: {
          agent_name: string
          commission_rate: number | null
          created_at: string
          created_by: string | null
          department: string | null
          email: string | null
          id: string
          initial_budget: number | null
          phone_number: string
          region: string
          role: string | null
          sales_agent_id: string
          status: Database["public"]["Enums"]["agent_status"] | null
          target_quota: number | null
          updated_at: string
        }
        Insert: {
          agent_name: string
          commission_rate?: number | null
          created_at?: string
          created_by?: string | null
          department?: string | null
          email?: string | null
          id?: string
          initial_budget?: number | null
          phone_number: string
          region: string
          role?: string | null
          sales_agent_id: string
          status?: Database["public"]["Enums"]["agent_status"] | null
          target_quota?: number | null
          updated_at?: string
        }
        Update: {
          agent_name?: string
          commission_rate?: number | null
          created_at?: string
          created_by?: string | null
          department?: string | null
          email?: string | null
          id?: string
          initial_budget?: number | null
          phone_number?: string
          region?: string
          role?: string | null
          sales_agent_id?: string
          status?: Database["public"]["Enums"]["agent_status"] | null
          target_quota?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      service_rates: {
        Row: {
          created_at: string
          currency: string | null
          effective_date: string
          id: string
          is_active: boolean | null
          max_amount: number | null
          min_amount: number | null
          rate_type: string
          rate_value: number
          service_name: string
          service_type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          currency?: string | null
          effective_date?: string
          id?: string
          is_active?: boolean | null
          max_amount?: number | null
          min_amount?: number | null
          rate_type: string
          rate_value: number
          service_name: string
          service_type: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          currency?: string | null
          effective_date?: string
          id?: string
          is_active?: boolean | null
          max_amount?: number | null
          min_amount?: number | null
          rate_type?: string
          rate_value?: number
          service_name?: string
          service_type?: string
          updated_at?: string
        }
        Relationships: []
      }
      sms_logs: {
        Row: {
          agent_id: string | null
          cost: number | null
          created_at: string
          delivered_at: string | null
          id: string
          message_content: string
          message_type: string
          phone_number: string
          provider: string | null
          sent_at: string
          status: string
          transaction_id: string | null
        }
        Insert: {
          agent_id?: string | null
          cost?: number | null
          created_at?: string
          delivered_at?: string | null
          id?: string
          message_content: string
          message_type: string
          phone_number: string
          provider?: string | null
          sent_at?: string
          status?: string
          transaction_id?: string | null
        }
        Update: {
          agent_id?: string | null
          cost?: number | null
          created_at?: string
          delivered_at?: string | null
          id?: string
          message_content?: string
          message_type?: string
          phone_number?: string
          provider?: string | null
          sent_at?: string
          status?: string
          transaction_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sms_logs_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sms_logs_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "transactions"
            referencedColumns: ["id"]
          },
        ]
      }
      transactions: {
        Row: {
          agent_id: string | null
          amount: number
          completed_at: string | null
          created_at: string
          currency: string | null
          failure_reason: string | null
          fee: number | null
          id: string
          metadata: Json | null
          status: string
          transaction_id: string
          transaction_type: string
          user_phone: string
          ussd_session_id: string | null
        }
        Insert: {
          agent_id?: string | null
          amount: number
          completed_at?: string | null
          created_at?: string
          currency?: string | null
          failure_reason?: string | null
          fee?: number | null
          id?: string
          metadata?: Json | null
          status?: string
          transaction_id: string
          transaction_type: string
          user_phone: string
          ussd_session_id?: string | null
        }
        Update: {
          agent_id?: string | null
          amount?: number
          completed_at?: string | null
          created_at?: string
          currency?: string | null
          failure_reason?: string | null
          fee?: number | null
          id?: string
          metadata?: Json | null
          status?: string
          transaction_id?: string
          transaction_type?: string
          user_phone?: string
          ussd_session_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "transactions_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_ussd_session_id_fkey"
            columns: ["ussd_session_id"]
            isOneToOne: false
            referencedRelation: "ussd_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      user_profiles: {
        Row: {
          agent_id: string | null
          created_at: string
          id: string
          kyc_status: string | null
          last_activity_date: string | null
          metadata: Json | null
          phone_number: string
          registration_date: string
          status: string
          updated_at: string
          user_type: string
        }
        Insert: {
          agent_id?: string | null
          created_at?: string
          id?: string
          kyc_status?: string | null
          last_activity_date?: string | null
          metadata?: Json | null
          phone_number: string
          registration_date?: string
          status?: string
          updated_at?: string
          user_type: string
        }
        Update: {
          agent_id?: string | null
          created_at?: string
          id?: string
          kyc_status?: string | null
          last_activity_date?: string | null
          metadata?: Json | null
          phone_number?: string
          registration_date?: string
          status?: string
          updated_at?: string
          user_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_profiles_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
        ]
      }
      user_sessions: {
        Row: {
          created_at: string
          duration: number | null
          end_time: string | null
          id: string
          ip_address: unknown | null
          session_type: string
          start_time: string
          status: string
          user_agent: string | null
          user_phone: string
        }
        Insert: {
          created_at?: string
          duration?: number | null
          end_time?: string | null
          id?: string
          ip_address?: unknown | null
          session_type: string
          start_time?: string
          status?: string
          user_agent?: string | null
          user_phone: string
        }
        Update: {
          created_at?: string
          duration?: number | null
          end_time?: string | null
          id?: string
          ip_address?: unknown | null
          session_type?: string
          start_time?: string
          status?: string
          user_agent?: string | null
          user_phone?: string
        }
        Relationships: []
      }
      ussd_sessions: {
        Row: {
          agent_id: string | null
          completed_at: string | null
          created_at: string
          id: string
          phone_number: string
          revenue_generated: number | null
          service_code: string
          session_duration: number | null
          session_id: string
          session_status: string
          session_text: string | null
          steps_count: number | null
          updated_at: string
        }
        Insert: {
          agent_id?: string | null
          completed_at?: string | null
          created_at?: string
          id?: string
          phone_number: string
          revenue_generated?: number | null
          service_code: string
          session_duration?: number | null
          session_id: string
          session_status?: string
          session_text?: string | null
          steps_count?: number | null
          updated_at?: string
        }
        Update: {
          agent_id?: string | null
          completed_at?: string | null
          created_at?: string
          id?: string
          phone_number?: string
          revenue_generated?: number | null
          service_code?: string
          session_duration?: number | null
          session_id?: string
          session_status?: string
          session_text?: string | null
          steps_count?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ussd_sessions_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      generate_agent_id: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      generate_sales_agent_id: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
    }
    Enums: {
      agent_status: "pending" | "active" | "suspended" | "inactive"
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
      agent_status: ["pending", "active", "suspended", "inactive"],
    },
  },
} as const
