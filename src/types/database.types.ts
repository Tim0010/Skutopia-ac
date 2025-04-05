
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          name: string
          avatar_url: string
          role: string
        }
        Insert: {
          id: string
          created_at?: string
          updated_at?: string
          name?: string
          avatar_url?: string
          role?: string
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          name?: string
          avatar_url?: string
          role?: string
        }
        Relationships: []
      }
      users_videos: {
        Row: {
          id: string
          user_id: string
          video_id: string
          progress: number
          completed: boolean
          last_watched: string
        }
        Insert: {
          id?: string
          user_id: string
          video_id: string
          progress?: number
          completed?: boolean
          last_watched?: string
        }
        Update: {
          id?: string
          user_id?: string
          video_id?: string
          progress?: number
          completed?: boolean
          last_watched?: string
        }
        Relationships: []
      }
      videos: {
        Row: {
          id: string
          title: string
          description: string
          url: string
          thumbnail_url: string
          duration: number
          category: string
          author: string
          view_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description: string
          url: string
          thumbnail_url: string
          duration: number
          category: string
          author: string
          view_count?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string
          url?: string
          thumbnail_url?: string
          duration?: number
          category?: string
          author?: string
          view_count?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      mentors: {
        Row: {
          id: string
          name: string
          avatar_url: string
          specialization: string
          bio: string
          subjects: string[]
          hourly_rate: number
          currency: string
          availability: string
          sessions_completed: number
          rating: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          avatar_url?: string
          specialization?: string
          bio?: string
          subjects?: string[]
          hourly_rate?: number
          currency?: string
          availability?: string
          sessions_completed?: number
          rating?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          avatar_url?: string
          specialization?: string
          bio?: string
          subjects?: string[]
          hourly_rate?: number
          currency?: string
          availability?: string
          sessions_completed?: number
          rating?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      mentor_education: {
        Row: {
          id: string
          mentor_id: string
          degree: string
          institution: string
          year: string
          created_at: string
        }
        Insert: {
          id?: string
          mentor_id: string
          degree: string
          institution: string
          year?: string
          created_at?: string
        }
        Update: {
          id?: string
          mentor_id?: string
          degree?: string
          institution?: string
          year?: string
          created_at?: string
        }
        Relationships: []
      }
      mentor_experience: {
        Row: {
          id: string
          mentor_id: string
          position: string
          organization: string
          period: string
          created_at: string
        }
        Insert: {
          id?: string
          mentor_id: string
          position: string
          organization: string
          period?: string
          created_at?: string
        }
        Update: {
          id?: string
          mentor_id?: string
          position?: string
          organization?: string
          period?: string
          created_at?: string
        }
        Relationships: []
      }
      mentor_resources: {
        Row: {
          id: string
          mentor_id: string
          title: string
          description: string
          type: string
          url: string
          is_premium: boolean
          created_at: string
        }
        Insert: {
          id?: string
          mentor_id: string
          title: string
          description?: string
          type: string
          url: string
          is_premium?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          mentor_id?: string
          title?: string
          description?: string
          type?: string
          url?: string
          is_premium?: boolean
          created_at?: string
        }
        Relationships: []
      }
      mentor_bookings: {
        Row: {
          id: string
          user_id: string
          mentor_id: string
          date: string
          time_slot: string
          status: string
          notes: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          mentor_id: string
          date: string
          time_slot: string
          status?: string
          notes?: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          mentor_id?: string
          date?: string
          time_slot?: string
          status?: string
          notes?: string
          created_at?: string
        }
        Relationships: []
      }
      mentor_feedback: {
        Row: {
          id: string
          user_id: string
          mentor_id: string
          rating: number
          comment: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          mentor_id: string
          rating: number
          comment?: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          mentor_id?: string
          rating?: number
          comment?: string
          created_at?: string
        }
        Relationships: []
      }
      quizzes: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          title: string
          description: string | null
          created_by: string
          tutor_id: string | null
          grade: string
          subject: string
          time_limit_minutes: number | null
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          title: string
          description?: string | null
          created_by: string
          tutor_id?: string | null
          grade: string
          subject: string
          time_limit_minutes?: number | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          title?: string
          description?: string | null
          created_by?: string
          tutor_id?: string | null
          grade?: string
          subject?: string
          time_limit_minutes?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "quizzes_created_by_fkey"
            columns: ["created_by"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quizzes_tutor_id_fkey"
            columns: ["tutor_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      questions: {
        Row: {
          id: string
          quiz_id: string
          created_at: string
          updated_at: string
          text: string
          order_index: number | null
          points: number
        }
        Insert: {
          id?: string
          quiz_id: string
          created_at?: string
          updated_at?: string
          text: string
          order_index?: number | null
          points?: number
        }
        Update: {
          id?: string
          quiz_id?: string
          created_at?: string
          updated_at?: string
          text?: string
          order_index?: number | null
          points?: number
        }
        Relationships: [
          {
            foreignKeyName: "questions_quiz_id_fkey"
            columns: ["quiz_id"]
            referencedRelation: "quizzes"
            referencedColumns: ["id"]
          }
        ]
      }
      answers: {
        Row: {
          id: string
          question_id: string
          created_at: string
          updated_at: string
          answer_text: string
          is_correct: boolean
          explanation: string | null
        }
        Insert: {
          id?: string
          question_id: string
          created_at?: string
          updated_at?: string
          answer_text: string
          is_correct: boolean
          explanation?: string | null
        }
        Update: {
          id?: string
          question_id?: string
          created_at?: string
          updated_at?: string
          answer_text?: string
          is_correct?: boolean
          explanation?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "answers_question_id_fkey"
            columns: ["question_id"]
            referencedRelation: "questions"
            referencedColumns: ["id"]
          }
        ]
      }
      quiz_attempts: {
        Row: {
          id: string
          user_id: string
          quiz_id: string
          score: number
          answers: Json | null
          completed_at: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          quiz_id: string
          score: number
          answers?: Json | null
          completed_at?: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          quiz_id?: string
          score?: number
          answers?: Json | null
          completed_at?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "quiz_attempts_quiz_id_fkey"
            columns: ["quiz_id"]
            referencedRelation: "quizzes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quiz_attempts_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
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
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type Enums<T extends keyof Database['public']['Enums']> = Database['public']['Enums'][T]
