import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log('Toss Webhook Received:', body);
    
    // 결제 상태 업데이트 등의 로직 처리
    
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Error handling Toss Webhook:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
