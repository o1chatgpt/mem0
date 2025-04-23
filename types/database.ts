export type Database = {
  public: {
    Tables: {
      fm_users: {
        Row: {
          id: number
          name: string
          email: string
          password_hash: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          name: string
          email: string
          password_hash: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          name?: string
          email?: string
          password_hash?: string
          created_at?: string
          updated_at?: string
        }
      }
      fm_folders: {
        Row: {
          id: number
          name: string
          path: string
          user_id: number
          parent_id: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          name: string
          path: string
          user_id: number
          parent_id?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          name?: string
          path?: string
          user_id?: number
          parent_id?: number | null
          created_at?: string
          updated_at?: string
        }
      }
      fm_files: {
        Row: {
          id: number
          name: string
          path: string
          size: number
          mime_type: string
          user_id: number
          folder_id: number | null
          content: string | null
          blob_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          name: string
          path: string
          size: number
          mime_type: string
          user_id: number
          folder_id?: number | null
          content?: string | null
          blob_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          name?: string
          path?: string
          size?: number
          mime_type?: string
          user_id?: number
          folder_id?: number | null
          content?: string | null
          blob_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      fm_ai_members: {
        Row: {
          id: number
          name: string
          role: string
          specialty: string
          description: string | null
          user_id: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          name: string
          role: string
          specialty: string
          description?: string | null
          user_id: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          name?: string
          role?: string
          specialty?: string
          description?: string | null
          user_id?: number
          created_at?: string
          updated_at?: string
        }
      }
      fm_memories: {
        Row: {
          id: number
          content: string
          user_id: number
          ai_member_id: number | null
          created_at: string
          category: string | null
        }
        Insert: {
          id?: number
          content: string
          user_id: number
          ai_member_id?: number | null
          created_at?: string
          category?: string | null
        }
        Update: {
          id?: number
          content?: string
          user_id?: number
          ai_member_id?: number | null
          created_at?: string
          category?: string | null
        }
      }
      fm_memory_categories: {
        Row: {
          id: number
          name: string
          description: string | null
          color: string | null
          icon: string | null
          user_id: number
          created_at: string
        }
        Insert: {
          id?: number
          name: string
          description?: string | null
          color?: string | null
          icon?: string | null
          user_id: number
          created_at?: string
        }
        Update: {
          id?: number
          name?: string
          description?: string | null
          color?: string | null
          icon?: string | null
          user_id?: number
          created_at?: string
        }
      }
      fm_export_schedules: {
        Row: {
          id: number
          user_id: number
          ai_member_id: number | null
          name: string
          frequency: string
          day_of_week: number | null
          day_of_month: number | null
          hour: number
          minute: number
          format: string
          email: string
          last_sent: string | null
          next_scheduled: string
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          user_id: number
          ai_member_id?: number | null
          name: string
          frequency: string
          day_of_week?: number | null
          day_of_month?: number | null
          hour: number
          minute: number
          format: string
          email: string
          last_sent?: string | null
          next_scheduled: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          user_id?: number
          ai_member_id?: number | null
          name?: string
          frequency?: string
          day_of_week?: number | null
          day_of_month?: number | null
          hour?: number
          minute?: number
          format?: string
          email?: string
          last_sent?: string | null
          next_scheduled?: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      fm_webhooks: {
        Row: {
          id: string
          name: string
          endpoint: string
          description: string | null
          events: string[]
          secret: string
          is_active: boolean
          created_at: string
          last_triggered: string | null
          success_count: number
          failure_count: number
          user_id: number
        }
        Insert: {
          id?: string
          name: string
          endpoint: string
          description?: string | null
          events: string[]
          secret: string
          is_active?: boolean
          created_at?: string
          last_triggered?: string | null
          success_count?: number
          failure_count?: number
          user_id: number
        }
        Update: {
          id?: string
          name?: string
          endpoint?: string
          description?: string | null
          events?: string[]
          secret?: string
          is_active?: boolean
          created_at?: string
          last_triggered?: string | null
          success_count?: number
          failure_count?: number
          user_id?: number
        }
      }
      fm_webhook_events: {
        Row: {
          id: string
          webhook_id: string
          event: string
          payload: any
          status: "success" | "failure"
          status_code: number
          response_time: number | null
          timestamp: string
        }
        Insert: {
          id?: string
          webhook_id: string
          event: string
          payload: any
          status: "success" | "failure"
          status_code: number
          response_time?: number | null
          timestamp?: string
        }
        Update: {
          id?: string
          webhook_id?: string
          event?: string
          payload?: any
          status?: "success" | "failure"
          status_code?: number
          response_time?: number | null
          timestamp?: string
        }
      }
    }
    Functions: {
      get_memory_category_counts: {
        Args: {
          user_id_param: number
        }
        Returns: {
          category: string | null
          count: number
        }[]
      }
      increment_webhook_success_count: {
        Args: {
          webhook_id: string
        }
        Returns: number
      }
      increment_webhook_failure_count: {
        Args: {
          webhook_id: string
        }
        Returns: number
      }
    }
  }
}
