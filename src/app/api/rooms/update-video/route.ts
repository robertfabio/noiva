import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { roomId, videoUrl, videoTitle, userId } = await request.json();
    
    if (!roomId || !videoUrl || !userId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    
    const supabase = createServiceClient();
    
    // Check if room exists and user is host
    const { data: roomData, error: roomError } = await supabase
      .from('rooms')
      .select('hostId')
      .eq('id', roomId)
      .single();
      
    if (roomError || !roomData) {
      console.error('Error checking room exists:', roomError);
      return NextResponse.json({ error: 'Room not found' }, { status: 404 });
    }
    
    // Check if user is host
    if (roomData.hostId !== userId) {
      return NextResponse.json({ error: 'Only host can update video' }, { status: 403 });
    }
    
    // Update the room's video information
    const { error: updateError } = await supabase
      .from('rooms')
      .update({ 
        videoUrl, 
        videoTitle: videoTitle || '',
        lastActive: new Date().toISOString()
      })
      .eq('id', roomId);
      
    if (updateError) {
      console.error('Error updating video information:', updateError);
      return NextResponse.json({ error: 'Failed to update video' }, { status: 500 });
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Server error updating video:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 