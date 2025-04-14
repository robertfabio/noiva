import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  const userId = request.nextUrl.searchParams.get('userId');
  
  if (!userId) {
    return NextResponse.json({ error: 'UserId is required' }, { status: 400 });
  }
  
  const supabase = createServiceClient();
  
  try {
    // First get the user's recent room IDs
    const { data: userData, error: userError } = await supabase
      .from('user_rooms')
      .select('roomId')
      .eq('userId', userId)
      .order('lastVisited', { ascending: false })
      .limit(10);
      
    if (userError) {
      console.error('Error fetching user recent rooms:', userError);
      return NextResponse.json({ error: 'Failed to fetch recent rooms' }, { status: 500 });
    }
    
    if (!userData || userData.length === 0) {
      return NextResponse.json([]);
    }
    
    // Extract room IDs
    const roomIds = userData.map(item => item.roomId);
    
    // Fetch all rooms data
    const { data: roomsData, error: roomsError } = await supabase
      .from('rooms')
      .select('*')
      .in('id', roomIds);
      
    if (roomsError) {
      console.error('Error fetching room details:', roomsError);
      return NextResponse.json({ error: 'Failed to fetch room details' }, { status: 500 });
    }
    
    // Sort rooms in the same order as the recent list
    const sortedRooms = roomIds.map(roomId => 
      roomsData.find(room => room.id === roomId)
    ).filter(Boolean);
    
    return NextResponse.json(sortedRooms);
  } catch (error) {
    console.error('Server error fetching recent rooms:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 