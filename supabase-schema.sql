-- Schema for Supabase project
-- Run this SQL in the Supabase SQL editor

-- Create rooms table
CREATE TABLE IF NOT EXISTS public.rooms (
  id TEXT PRIMARY KEY,
  hostId TEXT NOT NULL,
  hostName TEXT NOT NULL,
  createdAt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  lastActive TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  videoUrl TEXT DEFAULT '',
  videoTitle TEXT DEFAULT '',
  
  CONSTRAINT fk_host
    FOREIGN KEY(hostId)
    REFERENCES auth.users(id)
    ON DELETE CASCADE
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_rooms_hostId ON public.rooms(hostId);

-- Create user_rooms junction table to track room history
CREATE TABLE IF NOT EXISTS public.user_rooms (
  id SERIAL PRIMARY KEY,
  userId TEXT NOT NULL,
  roomId TEXT NOT NULL,
  isHost BOOLEAN DEFAULT false,
  lastVisited TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT fk_user
    FOREIGN KEY(userId)
    REFERENCES auth.users(id)
    ON DELETE CASCADE,
    
  CONSTRAINT fk_room
    FOREIGN KEY(roomId)
    REFERENCES public.rooms(id)
    ON DELETE CASCADE,
    
  CONSTRAINT unique_user_room UNIQUE(userId, roomId)
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_user_rooms_userId ON public.user_rooms(userId);
CREATE INDEX IF NOT EXISTS idx_user_rooms_roomId ON public.user_rooms(roomId);

-- Create RLS policies for security

-- Rooms table policies
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;

-- Any authenticated user can read rooms
CREATE POLICY "Anyone can read rooms"
  ON public.rooms FOR SELECT
  USING (true);

-- Only the host can update their rooms
CREATE POLICY "Host can update own rooms"
  ON public.rooms FOR UPDATE
  USING (auth.uid() = hostId);

-- Only the host can delete their rooms
CREATE POLICY "Host can delete own rooms"
  ON public.rooms FOR DELETE
  USING (auth.uid() = hostId);

-- Any authenticated user can create rooms
CREATE POLICY "Authenticated users can create rooms"
  ON public.rooms FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- user_rooms table policies
ALTER TABLE public.user_rooms ENABLE ROW LEVEL SECURITY;

-- Users can only see their own room history
CREATE POLICY "Users can read their own room history"
  ON public.user_rooms FOR SELECT
  USING (auth.uid() = userId);

-- Users can update their own room history
CREATE POLICY "Users can update their own room history"
  ON public.user_rooms FOR UPDATE
  USING (auth.uid() = userId);

-- Users can delete their own room history
CREATE POLICY "Users can delete their own room history"
  ON public.user_rooms FOR DELETE
  USING (auth.uid() = userId);

-- Users can create their own room history
CREATE POLICY "Users can create their own room history"
  ON public.user_rooms FOR INSERT
  WITH CHECK (auth.uid() = userId);

-- Give service role access to all tables
GRANT ALL ON public.rooms TO service_role;
GRANT ALL ON public.user_rooms TO service_role;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO service_role; 