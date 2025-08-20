import { NextResponse } from 'next/server';
import { clearAuthCookiesAction } from '@/lib/auth-actions';

export async function POST() {
  try {
    // Clear authentication cookies
    await clearAuthCookiesAction();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json({ error: 'Failed to logout' }, { status: 500 });
  }
}
