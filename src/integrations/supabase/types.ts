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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      case_actions: {
        Row: {
          action_date: string
          action_type: string
          case_id: string
          category: Database["public"]["Enums"]["action_category"]
          completed: boolean | null
          completed_at: string | null
          created_at: string
          created_by: string
          description: string | null
          id: string
          metadata: Json | null
          priority: string | null
          related_event_id: string | null
          related_file_id: string | null
          title: string
        }
        Insert: {
          action_date?: string
          action_type: string
          case_id: string
          category: Database["public"]["Enums"]["action_category"]
          completed?: boolean | null
          completed_at?: string | null
          created_at?: string
          created_by: string
          description?: string | null
          id?: string
          metadata?: Json | null
          priority?: string | null
          related_event_id?: string | null
          related_file_id?: string | null
          title: string
        }
        Update: {
          action_date?: string
          action_type?: string
          case_id?: string
          category?: Database["public"]["Enums"]["action_category"]
          completed?: boolean | null
          completed_at?: string | null
          created_at?: string
          created_by?: string
          description?: string | null
          id?: string
          metadata?: Json | null
          priority?: string | null
          related_event_id?: string | null
          related_file_id?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "case_actions_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "case_actions_related_event_id_fkey"
            columns: ["related_event_id"]
            isOneToOne: false
            referencedRelation: "case_events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "case_actions_related_file_id_fkey"
            columns: ["related_file_id"]
            isOneToOne: false
            referencedRelation: "case_files"
            referencedColumns: ["id"]
          },
        ]
      }
      case_communications: {
        Row: {
          body: string | null
          case_id: string
          created_by: string
          from_name: string
          id: string
          is_outgoing: boolean
          sent_at: string
          subject: string
          to_address: string
        }
        Insert: {
          body?: string | null
          case_id: string
          created_by: string
          from_name: string
          id?: string
          is_outgoing?: boolean
          sent_at?: string
          subject?: string
          to_address: string
        }
        Update: {
          body?: string | null
          case_id?: string
          created_by?: string
          from_name?: string
          id?: string
          is_outgoing?: boolean
          sent_at?: string
          subject?: string
          to_address?: string
        }
        Relationships: [
          {
            foreignKeyName: "case_communications_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
        ]
      }
      case_events: {
        Row: {
          case_id: string
          completed: boolean | null
          created_at: string
          created_by: string
          description: string | null
          event_at: string
          event_type: Database["public"]["Enums"]["event_type"]
          id: string
          reminder: string | null
          title: string
        }
        Insert: {
          case_id: string
          completed?: boolean | null
          created_at?: string
          created_by: string
          description?: string | null
          event_at: string
          event_type?: Database["public"]["Enums"]["event_type"]
          id?: string
          reminder?: string | null
          title: string
        }
        Update: {
          case_id?: string
          completed?: boolean | null
          created_at?: string
          created_by?: string
          description?: string | null
          event_at?: string
          event_type?: Database["public"]["Enums"]["event_type"]
          id?: string
          reminder?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "case_events_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
        ]
      }
      case_files: {
        Row: {
          case_id: string
          file_name: string
          file_size: string | null
          file_type: string | null
          id: string
          storage_path: string | null
          uploaded_at: string
          uploaded_by: string
        }
        Insert: {
          case_id: string
          file_name: string
          file_size?: string | null
          file_type?: string | null
          id?: string
          storage_path?: string | null
          uploaded_at?: string
          uploaded_by: string
        }
        Update: {
          case_id?: string
          file_name?: string
          file_size?: string | null
          file_type?: string | null
          id?: string
          storage_path?: string | null
          uploaded_at?: string
          uploaded_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "case_files_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
        ]
      }
      case_lawyers: {
        Row: {
          assigned_at: string
          case_id: string
          id: string
          is_lead: boolean | null
          user_id: string
        }
        Insert: {
          assigned_at?: string
          case_id: string
          id?: string
          is_lead?: boolean | null
          user_id: string
        }
        Update: {
          assigned_at?: string
          case_id?: string
          id?: string
          is_lead?: boolean | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "case_lawyers_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
        ]
      }
      case_notes: {
        Row: {
          ai_summary: string | null
          case_id: string
          content: string | null
          created_at: string
          duration: string | null
          id: string
          note_type: Database["public"]["Enums"]["note_type"]
          updated_at: string
          user_id: string
        }
        Insert: {
          ai_summary?: string | null
          case_id: string
          content?: string | null
          created_at?: string
          duration?: string | null
          id?: string
          note_type?: Database["public"]["Enums"]["note_type"]
          updated_at?: string
          user_id: string
        }
        Update: {
          ai_summary?: string | null
          case_id?: string
          content?: string | null
          created_at?: string
          duration?: string | null
          id?: string
          note_type?: Database["public"]["Enums"]["note_type"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "case_notes_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
        ]
      }
      case_timeline: {
        Row: {
          author: string | null
          case_id: string
          created_at: string
          detail: string | null
          icon: string | null
          id: string
          title: string
        }
        Insert: {
          author?: string | null
          case_id: string
          created_at?: string
          detail?: string | null
          icon?: string | null
          id?: string
          title: string
        }
        Update: {
          author?: string | null
          case_id?: string
          created_at?: string
          detail?: string | null
          icon?: string | null
          id?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "case_timeline_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
        ]
      }
      cases: {
        Row: {
          admission_completed: boolean | null
          budget: number | null
          case_number: string
          checklist_generated: boolean | null
          client_id: string | null
          commitment_signed: boolean | null
          consultation_date: string | null
          consultation_type: string | null
          court: string | null
          created_at: string
          created_by: string
          currency: string | null
          deadline_at: string | null
          description: string | null
          fee_type: Database["public"]["Enums"]["fee_type"] | null
          id: string
          judge: string | null
          legal_area: Database["public"]["Enums"]["legal_area"]
          opened_at: string
          opposing_contact: string | null
          opposing_lawyer: string | null
          opposing_name: string | null
          phase: string | null
          priority: Database["public"]["Enums"]["case_priority"]
          procedure_type: string | null
          referral_detail: string | null
          referral_source: string | null
          reminder: string | null
          status: Database["public"]["Enums"]["case_status"]
          tags: string[] | null
          title: string
          updated_at: string
          welcome_email_sent: boolean | null
        }
        Insert: {
          admission_completed?: boolean | null
          budget?: number | null
          case_number: string
          checklist_generated?: boolean | null
          client_id?: string | null
          commitment_signed?: boolean | null
          consultation_date?: string | null
          consultation_type?: string | null
          court?: string | null
          created_at?: string
          created_by: string
          currency?: string | null
          deadline_at?: string | null
          description?: string | null
          fee_type?: Database["public"]["Enums"]["fee_type"] | null
          id?: string
          judge?: string | null
          legal_area: Database["public"]["Enums"]["legal_area"]
          opened_at?: string
          opposing_contact?: string | null
          opposing_lawyer?: string | null
          opposing_name?: string | null
          phase?: string | null
          priority?: Database["public"]["Enums"]["case_priority"]
          procedure_type?: string | null
          referral_detail?: string | null
          referral_source?: string | null
          reminder?: string | null
          status?: Database["public"]["Enums"]["case_status"]
          tags?: string[] | null
          title: string
          updated_at?: string
          welcome_email_sent?: boolean | null
        }
        Update: {
          admission_completed?: boolean | null
          budget?: number | null
          case_number?: string
          checklist_generated?: boolean | null
          client_id?: string | null
          commitment_signed?: boolean | null
          consultation_date?: string | null
          consultation_type?: string | null
          court?: string | null
          created_at?: string
          created_by?: string
          currency?: string | null
          deadline_at?: string | null
          description?: string | null
          fee_type?: Database["public"]["Enums"]["fee_type"] | null
          id?: string
          judge?: string | null
          legal_area?: Database["public"]["Enums"]["legal_area"]
          opened_at?: string
          opposing_contact?: string | null
          opposing_lawyer?: string | null
          opposing_name?: string | null
          phase?: string | null
          priority?: Database["public"]["Enums"]["case_priority"]
          procedure_type?: string | null
          referral_detail?: string | null
          referral_source?: string | null
          reminder?: string | null
          status?: Database["public"]["Enums"]["case_status"]
          tags?: string[] | null
          title?: string
          updated_at?: string
          welcome_email_sent?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "cases_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      clients: {
        Row: {
          address: string | null
          company: string | null
          created_at: string
          created_by: string
          email: string | null
          id: string
          name: string
          notes: string | null
          phone: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          company?: string | null
          created_at?: string
          created_by: string
          email?: string | null
          id?: string
          name: string
          notes?: string | null
          phone?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          company?: string | null
          created_at?: string
          created_by?: string
          email?: string | null
          id?: string
          name?: string
          notes?: string | null
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string
          first_name: string
          id: string
          initials: string | null
          last_name: string
          phone: string | null
          specialty: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string
          first_name?: string
          id?: string
          initials?: string | null
          last_name?: string
          phone?: string | null
          specialty?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string
          first_name?: string
          id?: string
          initials?: string | null
          last_name?: string
          phone?: string | null
          specialty?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: { Args: never; Returns: boolean }
      is_case_member: { Args: { _case_id: string }; Returns: boolean }
    }
    Enums: {
      action_category:
        | "comunicacion"
        | "documento"
        | "reunion"
        | "accion_legal"
        | "pago"
        | "tarea"
        | "cambio_estado"
        | "firma"
        | "cambio_cliente"
        | "administrativo"
        | "alerta"
      app_role: "admin" | "lawyer"
      case_priority: "baja" | "media" | "alta" | "urgente"
      case_status:
        | "borrador"
        | "activo"
        | "audiencia"
        | "negociacion"
        | "revision"
        | "pendiente"
        | "cerrado"
        | "archivado"
      event_type: "audiencia" | "vencimiento" | "cita" | "reunion" | "otro"
      fee_type: "por_hora" | "precio_fijo" | "porcentaje" | "mixto"
      legal_area:
        | "civil"
        | "penal"
        | "laboral"
        | "mercantil"
        | "administrativo"
        | "familia"
        | "fiscal"
      note_type: "text" | "audio"
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
      action_category: [
        "comunicacion",
        "documento",
        "reunion",
        "accion_legal",
        "pago",
        "tarea",
        "cambio_estado",
        "firma",
        "cambio_cliente",
        "administrativo",
        "alerta",
      ],
      app_role: ["admin", "lawyer"],
      case_priority: ["baja", "media", "alta", "urgente"],
      case_status: [
        "borrador",
        "activo",
        "audiencia",
        "negociacion",
        "revision",
        "pendiente",
        "cerrado",
        "archivado",
      ],
      event_type: ["audiencia", "vencimiento", "cita", "reunion", "otro"],
      fee_type: ["por_hora", "precio_fijo", "porcentaje", "mixto"],
      legal_area: [
        "civil",
        "penal",
        "laboral",
        "mercantil",
        "administrativo",
        "familia",
        "fiscal",
      ],
      note_type: ["text", "audio"],
    },
  },
} as const
