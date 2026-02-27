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
      assignments: {
        Row: {
          ai_feedback: string | null
          created_at: string
          description: string | null
          due_date: string
          id: string
          points: number
          score: number | null
          status: string
          submission_text: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          ai_feedback?: string | null
          created_at?: string
          description?: string | null
          due_date: string
          id?: string
          points?: number
          score?: number | null
          status?: string
          submission_text?: string | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          ai_feedback?: string | null
          created_at?: string
          description?: string | null
          due_date?: string
          id?: string
          points?: number
          score?: number | null
          status?: string
          submission_text?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      care_tasks: {
        Row: {
          created_at: string
          frequency: string
          id: string
          is_done: boolean
          notes: string | null
          plant_name: string
          scheduled_date: string
          scheduled_time: string
          task_type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          frequency?: string
          id?: string
          is_done?: boolean
          notes?: string | null
          plant_name: string
          scheduled_date?: string
          scheduled_time?: string
          task_type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          frequency?: string
          id?: string
          is_done?: boolean
          notes?: string | null
          plant_name?: string
          scheduled_date?: string
          scheduled_time?: string
          task_type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      community_posts: {
        Row: {
          author_name: string
          content: string
          created_at: string
          id: string
          image_url: string | null
          likes_count: number
          tags: string[] | null
          user_id: string
        }
        Insert: {
          author_name: string
          content: string
          created_at?: string
          id?: string
          image_url?: string | null
          likes_count?: number
          tags?: string[] | null
          user_id: string
        }
        Update: {
          author_name?: string
          content?: string
          created_at?: string
          id?: string
          image_url?: string | null
          likes_count?: number
          tags?: string[] | null
          user_id?: string
        }
        Relationships: []
      }
      farmer_ai_cache: {
        Row: {
          cache_key: string
          content: Json
          created_at: string
          expires_at: string
          id: string
          user_id: string
        }
        Insert: {
          cache_key: string
          content?: Json
          created_at?: string
          expires_at?: string
          id?: string
          user_id: string
        }
        Update: {
          cache_key?: string
          content?: Json
          created_at?: string
          expires_at?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      field_zones: {
        Row: {
          area_acres: number | null
          created_at: string
          crop: string
          disease: string
          health: string
          id: string
          name: string
          soil_type: string
          status: string
          treatment: string
          updated_at: string
          user_id: string
        }
        Insert: {
          area_acres?: number | null
          created_at?: string
          crop: string
          disease?: string
          health?: string
          id?: string
          name: string
          soil_type?: string
          status?: string
          treatment?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          area_acres?: number | null
          created_at?: string
          crop?: string
          disease?: string
          health?: string
          id?: string
          name?: string
          soil_type?: string
          status?: string
          treatment?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      iot_readings: {
        Row: {
          created_at: string
          humidity: number | null
          id: string
          recorded_at: string
          soil_moisture: number | null
          soil_ph: number | null
          temperature: number | null
          user_id: string
        }
        Insert: {
          created_at?: string
          humidity?: number | null
          id?: string
          recorded_at?: string
          soil_moisture?: number | null
          soil_ph?: number | null
          temperature?: number | null
          user_id: string
        }
        Update: {
          created_at?: string
          humidity?: number | null
          id?: string
          recorded_at?: string
          soil_moisture?: number | null
          soil_ph?: number | null
          temperature?: number | null
          user_id?: string
        }
        Relationships: []
      }
      knowledge_categories: {
        Row: {
          created_at: string
          description: string | null
          entries_count: number
          id: string
          last_edited_at: string
          last_edited_by: string | null
          name: string
          reviewer_name: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          entries_count?: number
          id?: string
          last_edited_at?: string
          last_edited_by?: string | null
          name: string
          reviewer_name?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          entries_count?: number
          id?: string
          last_edited_at?: string
          last_edited_by?: string | null
          name?: string
          reviewer_name?: string
        }
        Relationships: []
      }
      knowledge_entries: {
        Row: {
          ai_generated: boolean
          category_id: string
          created_at: string
          created_by: string
          crops_affected: string[] | null
          disease_name: string
          id: string
          prevention: string | null
          severity_level: string
          symptoms: string
          treatment: string
          updated_at: string
        }
        Insert: {
          ai_generated?: boolean
          category_id: string
          created_at?: string
          created_by: string
          crops_affected?: string[] | null
          disease_name: string
          id?: string
          prevention?: string | null
          severity_level?: string
          symptoms: string
          treatment: string
          updated_at?: string
        }
        Update: {
          ai_generated?: boolean
          category_id?: string
          created_at?: string
          created_by?: string
          crops_affected?: string[] | null
          disease_name?: string
          id?: string
          prevention?: string | null
          severity_level?: string
          symptoms?: string
          treatment?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "knowledge_entries_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "knowledge_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      lab_completions: {
        Row: {
          ai_result: Json | null
          created_at: string
          exercise_title: string
          exercise_type: string
          id: string
          user_id: string
          xp_earned: number
        }
        Insert: {
          ai_result?: Json | null
          created_at?: string
          exercise_title: string
          exercise_type: string
          id?: string
          user_id: string
          xp_earned?: number
        }
        Update: {
          ai_result?: Json | null
          created_at?: string
          exercise_title?: string
          exercise_type?: string
          id?: string
          user_id?: string
          xp_earned?: number
        }
        Relationships: []
      }
      learning_modules: {
        Row: {
          created_at: string
          description: string | null
          difficulty: string
          icon: string
          id: string
          title: string
          total_lessons: number
        }
        Insert: {
          created_at?: string
          description?: string | null
          difficulty?: string
          icon?: string
          id?: string
          title: string
          total_lessons?: number
        }
        Update: {
          created_at?: string
          description?: string | null
          difficulty?: string
          icon?: string
          id?: string
          title?: string
          total_lessons?: number
        }
        Relationships: []
      }
      learning_progress: {
        Row: {
          completed_lessons: number
          created_at: string
          id: string
          module_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          completed_lessons?: number
          created_at?: string
          id?: string
          module_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          completed_lessons?: number
          created_at?: string
          id?: string
          module_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "learning_progress_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "learning_modules"
            referencedColumns: ["id"]
          },
        ]
      }
      model_metrics: {
        Row: {
          created_at: string
          id: string
          metrics_per_class: Json
          month_label: string
          notes: string | null
          overall_accuracy: number
          recorded_by: string
        }
        Insert: {
          created_at?: string
          id?: string
          metrics_per_class?: Json
          month_label: string
          notes?: string | null
          overall_accuracy: number
          recorded_by: string
        }
        Update: {
          created_at?: string
          id?: string
          metrics_per_class?: Json
          month_label?: string
          notes?: string | null
          overall_accuracy?: number
          recorded_by?: string
        }
        Relationships: []
      }
      plant_diary_entries: {
        Row: {
          ai_tip: string | null
          created_at: string
          entry_date: string
          health_status: string
          id: string
          image_url: string | null
          note: string
          plant_name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          ai_tip?: string | null
          created_at?: string
          entry_date?: string
          health_status?: string
          id?: string
          image_url?: string | null
          note: string
          plant_name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          ai_tip?: string | null
          created_at?: string
          entry_date?: string
          health_status?: string
          id?: string
          image_url?: string | null
          note?: string
          plant_name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      post_likes: {
        Row: {
          created_at: string
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_likes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "community_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          district: string | null
          id: string
          language: string
          name: string
          role: Database["public"]["Enums"]["app_role"]
          state: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          district?: string | null
          id?: string
          language?: string
          name?: string
          role?: Database["public"]["Enums"]["app_role"]
          state?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          district?: string | null
          id?: string
          language?: string
          name?: string
          role?: Database["public"]["Enums"]["app_role"]
          state?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      quiz_attempts: {
        Row: {
          correct_answers: number
          created_at: string
          id: string
          questions: Json
          topic: string
          total_questions: number
          user_id: string
          xp_earned: number
        }
        Insert: {
          correct_answers: number
          created_at?: string
          id?: string
          questions?: Json
          topic: string
          total_questions: number
          user_id: string
          xp_earned?: number
        }
        Update: {
          correct_answers?: number
          created_at?: string
          id?: string
          questions?: Json
          topic?: string
          total_questions?: number
          user_id?: string
          xp_earned?: number
        }
        Relationships: []
      }
      review_items: {
        Row: {
          ai_suggestion: string | null
          confidence_pct: number
          created_at: string
          crop: string
          disease_confirmed: string | null
          disease_predicted: string
          district: string
          expert_notes: string | null
          farmer_name: string
          id: string
          image_url: string | null
          is_urgent: boolean
          reviewed_at: string | null
          reviewed_by: string | null
          severity: string
          state: string | null
          status: string
          submitted_by: string
        }
        Insert: {
          ai_suggestion?: string | null
          confidence_pct?: number
          created_at?: string
          crop: string
          disease_confirmed?: string | null
          disease_predicted: string
          district?: string
          expert_notes?: string | null
          farmer_name?: string
          id?: string
          image_url?: string | null
          is_urgent?: boolean
          reviewed_at?: string | null
          reviewed_by?: string | null
          severity?: string
          state?: string | null
          status?: string
          submitted_by: string
        }
        Update: {
          ai_suggestion?: string | null
          confidence_pct?: number
          created_at?: string
          crop?: string
          disease_confirmed?: string | null
          disease_predicted?: string
          district?: string
          expert_notes?: string | null
          farmer_name?: string
          id?: string
          image_url?: string | null
          is_urgent?: boolean
          reviewed_at?: string | null
          reviewed_by?: string | null
          severity?: string
          state?: string | null
          status?: string
          submitted_by?: string
        }
        Relationships: []
      }
      scan_history: {
        Row: {
          created_at: string
          id: string
          image_url: string | null
          result: Json
          scan_type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          image_url?: string | null
          result?: Json
          scan_type?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          image_url?: string | null
          result?: Json
          scan_type?: string
          user_id?: string
        }
        Relationships: []
      }
      scheme_applications: {
        Row: {
          ai_probability: number | null
          applied_date: string
          created_at: string
          id: string
          notes: string | null
          scheme_name: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          ai_probability?: number | null
          applied_date?: string
          created_at?: string
          id?: string
          notes?: string | null
          scheme_name: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          ai_probability?: number | null
          applied_date?: string
          created_at?: string
          id?: string
          notes?: string | null
          scheme_name?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      soil_readings: {
        Row: {
          ai_recommendation: string | null
          created_at: string
          id: string
          location_label: string
          moisture_pct: number | null
          nitrogen_ppm: number | null
          ph: number | null
          phosphorus_ppm: number | null
          potassium_ppm: number | null
          user_id: string
        }
        Insert: {
          ai_recommendation?: string | null
          created_at?: string
          id?: string
          location_label?: string
          moisture_pct?: number | null
          nitrogen_ppm?: number | null
          ph?: number | null
          phosphorus_ppm?: number | null
          potassium_ppm?: number | null
          user_id: string
        }
        Update: {
          ai_recommendation?: string | null
          created_at?: string
          id?: string
          location_label?: string
          moisture_pct?: number | null
          nitrogen_ppm?: number | null
          ph?: number | null
          phosphorus_ppm?: number | null
          potassium_ppm?: number | null
          user_id?: string
        }
        Relationships: []
      }
      student_xp: {
        Row: {
          created_at: string
          id: string
          source: string
          source_id: string | null
          user_id: string
          xp_amount: number
        }
        Insert: {
          created_at?: string
          id?: string
          source: string
          source_id?: string | null
          user_id: string
          xp_amount: number
        }
        Update: {
          created_at?: string
          id?: string
          source?: string
          source_id?: string | null
          user_id?: string
          xp_amount?: number
        }
        Relationships: []
      }
      training_runs: {
        Row: {
          ai_recommendations: Json | null
          batch_size: number
          completed_at: string | null
          duration_minutes: number | null
          epochs: number
          final_accuracy: number | null
          final_loss: number | null
          id: string
          learning_rate: number
          notes: string | null
          started_at: string
          started_by: string
          status: string
        }
        Insert: {
          ai_recommendations?: Json | null
          batch_size?: number
          completed_at?: string | null
          duration_minutes?: number | null
          epochs?: number
          final_accuracy?: number | null
          final_loss?: number | null
          id?: string
          learning_rate?: number
          notes?: string | null
          started_at?: string
          started_by: string
          status?: string
        }
        Update: {
          ai_recommendations?: Json | null
          batch_size?: number
          completed_at?: string | null
          duration_minutes?: number | null
          epochs?: number
          final_accuracy?: number | null
          final_loss?: number | null
          id?: string
          learning_rate?: number
          notes?: string | null
          started_at?: string
          started_by?: string
          status?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      app_role: "farmer" | "gardener" | "student" | "expert"
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
      app_role: ["farmer", "gardener", "student", "expert"],
    },
  },
} as const
