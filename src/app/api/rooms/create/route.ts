import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { roomId, hostId, hostName } = await request.json();
    
    if (!roomId || !hostId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    
    const supabase = createServiceClient();
    
    // Create the room
    const { error: roomError } = await supabase
      .from('rooms')
      .insert({
        id: roomId,
        hostId,
        hostName,
        createdAt: new Date().toISOString(),
        lastActive: new Date().toISOString(),
        videoUrl: '',
        videoTitle: ''
      });
      
    if (roomError) {
      console.error('Error creating room:', roomError);
      return NextResponse.json({ error: 'Failed to create room' }, { status: 500 });
    }
    
    // Add to user's recent rooms
    const { error: userRoomError } = await supabase
      .from('user_rooms')
      .insert({
        userId: hostId,
        roomId,
        isHost: true,
        lastVisited: new Date().toISOString()
      });
      
    if (userRoomError) {
      console.error('Error updating user rooms:', userRoomError);
      // We don't fail the request if this part fails, as the room is already created
    }
    
    return NextResponse.json({ success: true, roomId });
  } catch (error) {
    console.error('Server error creating room:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 