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
          status?: Database["public"]["Enums"]["agent_status"] | null
          supervisor?: string
          updated_at?: string
        }
        Relationships: []
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      generate_agent_id: {
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
