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
      rooms: {
        Row: {
          id: string
          hostId: string
          hostName: string
          createdAt: string
          lastActive: string
          videoUrl: string
          videoTitle: string
        }
        Insert: {
          id?: string
          hostId: string
          hostName: string
          createdAt?: string
          lastActive?: string
          videoUrl?: string
          videoTitle?: string
        }
        Update: {
          id?: string
          hostId?: string
          hostName?: string
          createdAt?: string
          lastActive?: string
          videoUrl?: string
          videoTitle?: string
        }
      }
      user_rooms: {
        Row: {
          id: number
          userId: string
          roomId: string
          isHost: boolean
          lastVisited: string
        }
        Insert: {
          id?: number
          userId: string
          roomId: string
          isHost?: boolean
          lastVisited?: string
        }
        Update: {
          id?: number
          userId?: string
          roomId?: string
          isHost?: boolean
          lastVisited?: string
        }
      }
    }
  }
} 