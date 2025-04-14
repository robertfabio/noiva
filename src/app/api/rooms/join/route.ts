import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { roomId, userId } = await request.json();
    
    if (!roomId || !userId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    
    const supabase = createServiceClient();
    
    // Check if room exists
    const { data: roomData, error: roomError } = await supabase
      .from('rooms')
      .select('*')
      .eq('id', roomId)
      .single();
      
    if (roomError || !roomData) {
      console.error('Error checking room exists:', roomError);
      return NextResponse.json({ error: 'Room not found' }, { status: 404 });
    }
    
    // Update room's lastActive field
    const { error: updateRoomError } = await supabase
      .from('rooms')
      .update({ lastActive: new Date().toISOString() })
      .eq('id', roomId);
      
    if (updateRoomError) {
      console.error('Error updating room activity:', updateRoomError);
      // Non-critical error, continue execution
    }
    
    // Check if user already has this room in their list
    const { data: existingUserRoom } = await supabase
      .from('user_rooms')
      .select('*')
      .eq('userId', userId)
      .eq('roomId', roomId)
      .single();
      
    if (existingUserRoom) {
      // Update lastVisited timestamp
      const { error: updateError } = await supabase
        .from('user_rooms')
        .update({ lastVisited: new Date().toISOString() })
        .eq('userId', userId)
        .eq('roomId', roomId);
        
      if (updateError) {
        console.error('Error updating user room timestamp:', updateError);
      }
    } else {
      // Add to user's recent rooms
      const { error: insertError } = await supabase
        .from('user_rooms')
        .insert({
          userId,
          roomId,
          isHost: roomData.hostId === userId,
          lastVisited: new Date().toISOString()
        });
        
      if (insertError) {
        console.error('Error adding room to user history:', insertError);
      }
    }
    
    return NextResponse.json({ success: true, room: roomData });
  } catch (error) {
    console.error('Server error joining room:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 