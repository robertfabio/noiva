import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  const userId = request.nextUrl.searchParams.get('userId');
  
  if (!userId) {
    return NextResponse.json({ error: 'UserId is required' }, { status: 400 });
  }
  
  const supabase = createServiceClient();
  
  try {
    // Fetch rooms where the user is the host
    const { data, error } = await supabase
      .from('rooms')
      .select('*')
      .eq('hostId', userId)
      .order('createdAt', { ascending: false })
      .limit(10);
      
    if (error) {
      console.error('Error fetching hosted rooms:', error);
      return NextResponse.json({ error: 'Failed to fetch rooms' }, { status: 500 });
    }
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Server error fetching hosted rooms:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 