import RoomClient from './client';

// This is required for static site generation with dynamic routes
export async function generateStaticParams() {
  // Return an array of params to pre-render
  return [{ id: 'placeholder' }];
}

export default function RoomPage() {
  return <RoomClient />;
} 