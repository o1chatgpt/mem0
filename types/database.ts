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
        }
        Insert: {
          id?: number
          content: string
          user_id: number
          ai_member_id?: number | null
          created_at?: string
        }
        Update: {
          id?: number
          content?: string
          user_id?: number
          ai_member_id?: number | null
          created_at?: string
        }
      }
    }
  }
}
