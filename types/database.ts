export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          password_hash: string | null
          name: string | null
          avatar_url: string | null
          role: string
          is_admin: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          password_hash?: string | null
          name?: string | null
          avatar_url?: string | null
          role?: string
          is_admin?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          password_hash?: string | null
          name?: string | null
          avatar_url?: string | null
          role?: string
          is_admin?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      ai_family_members: {
        Row: {
          id: string
          name: string
          slug: string
          description: string | null
          avatar_url: string | null
          personality: string | null
          system_prompt: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          description?: string | null
          avatar_url?: string | null
          personality?: string | null
          system_prompt?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          description?: string | null
          avatar_url?: string | null
          personality?: string | null
          system_prompt?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      chat_sessions: {
        Row: {
          id: string
          user_id: string
          ai_family_member_id: string
          title: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          ai_family_member_id: string
          title?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          ai_family_member_id?: string
          title?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      chat_messages: {
        Row: {
          id: string
          session_id: string
          sender_type: string
          sender_id: string
          content: string
          created_at: string
        }
        Insert: {
          id?: string
          session_id: string
          sender_type: string
          sender_id: string
          content: string
          created_at?: string
        }
        Update: {
          id?: string
          session_id?: string
          sender_type?: string
          sender_id?: string
          content?: string
          created_at?: string
        }
      }
      ai_family_member_memories: {
        Row: {
          id: string
          ai_family_member_id: string
          user_id: string
          memory: string
          relevance: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          ai_family_member_id: string
          user_id: string
          memory: string
          relevance?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          ai_family_member_id?: string
          user_id?: string
          memory?: string
          relevance?: number
          created_at?: string
          updated_at?: string
        }
      }
      tools: {
        Row: {
          id: number
          name: string
          slug: string
          description: string | null
          icon: string | null
          config: Json
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          name: string
          slug: string
          description?: string | null
          icon?: string | null
          config?: Json
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          name?: string
          slug?: string
          description?: string | null
          icon?: string | null
          config?: Json
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      ai_family_tools: {
        Row: {
          id: number
          ai_family_id: string
          tool_id: number
          permission_level: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          ai_family_id: string
          tool_id: number
          permission_level?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          ai_family_id?: string
          tool_id?: number
          permission_level?: string
          created_at?: string
          updated_at?: string
        }
      }
      app_routes: {
        Row: {
          id: number
          route: string
          name: string
          description: string | null
          icon: string | null
          is_active: boolean
          requires_auth: boolean
          admin_only: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          route: string
          name: string
          description?: string | null
          icon?: string | null
          is_active?: boolean
          requires_auth?: boolean
          admin_only?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          route?: string
          name?: string
          description?: string | null
          icon?: string | null
          is_active?: boolean
          requires_auth?: boolean
          admin_only?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      voice_services: {
        Row: {
          id: string
          name: string
          is_active: boolean
          is_default: boolean
          api_key: string | null
          default_voice: string | null
          settings: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          is_active?: boolean
          is_default?: boolean
          api_key?: string | null
          default_voice?: string | null
          settings?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          is_active?: boolean
          is_default?: boolean
          api_key?: string | null
          default_voice?: string | null
          settings?: Json
          created_at?: string
          updated_at?: string
        }
      }
      voice_assignments: {
        Row: {
          id: string
          ai_family_member_id: string
          voice_service_id: string
          voice_id: string
          settings: Json
          is_default: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          ai_family_member_id: string
          voice_service_id: string
          voice_id: string
          settings?: Json
          is_default?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          ai_family_member_id?: string
          voice_service_id?: string
          voice_id?: string
          settings?: Json
          is_default?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      files: {
        Row: {
          id: string
          user_id: string
          name: string
          path: string
          size: number
          mime_type: string
          storage_path: string
          is_public: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          path: string
          size: number
          mime_type: string
          storage_path: string
          is_public?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          path?: string
          size?: number
          mime_type?: string
          storage_path?: string
          is_public?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      folders: {
        Row: {
          id: string
          user_id: string
          parent_id: string | null
          name: string
          path: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          parent_id?: string | null
          name: string
          path: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          parent_id?: string | null
          name?: string
          path?: string
          created_at?: string
          updated_at?: string
        }
      }
      tasks: {
        Row: {
          id: string
          title: string
          description: string | null
          status: string
          priority: string
          assigned_to: string | null
          created_by: string
          due_date: string | null
          completed_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          status?: string
          priority?: string
          assigned_to?: string | null
          created_by: string
          due_date?: string | null
          completed_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          status?: string
          priority?: string
          assigned_to?: string | null
          created_by?: string
          due_date?: string | null
          completed_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      image_generations: {
        Row: {
          id: string
          user_id: string
          prompt: string
          negative_prompt: string | null
          model: string | null
          width: number | null
          height: number | null
          image_url: string | null
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          prompt: string
          negative_prompt?: string | null
          model?: string | null
          width?: number | null
          height?: number | null
          image_url?: string | null
          status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          prompt?: string
          negative_prompt?: string | null
          model?: string | null
          width?: number | null
          height?: number | null
          image_url?: string | null
          status?: string
          created_at?: string
          updated_at?: string
        }
      }
      api_connections: {
        Row: {
          id: string
          user_id: string
          service_name: string
          api_key: string | null
          is_active: boolean
          settings: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          service_name: string
          api_key?: string | null
          is_active?: boolean
          settings?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          service_name?: string
          api_key?: string | null
          is_active?: boolean
          settings?: Json
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
