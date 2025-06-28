// app/api/sendNotification/route.ts
import { NextResponse } from 'next/server';
import { sendPushNotification } from '@/lib/sendPushNotification';

export async function POST(req: Request) {
  try {
    const { title, message } = await req.json();
    const result = await sendPushNotification(title, message);
    return NextResponse.json({ success: true, result });
  } catch (error) {
    console.error('Notification API Error:', error);
    return NextResponse.json({ success: false, error: 'Failed to send notification' }, { status: 500 });
  }
}
