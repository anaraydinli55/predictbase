import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const matchId = searchParams.get('matchId');

  if (!matchId) return NextResponse.json({ error: 'Match ID required' }, { status: 400 });

  try {
    const res = await fetch(`https://api.balldontlie.io/v1/fh/matches/${matchId}`, {
      headers: { 
        'Authorization': process.env.BALLDONTLIE_API_KEY || '',
        'Content-Type': 'application/json'
      },
      next: { revalidate: 0 } 
    });

    const data = await res.json();
    
    // Sadece 90 dakika (Regular Time) verilerini ayıklıyoruz
    const cleanData = {
      score: data.data?.scores?.ft || null, // "2-1" gibi
      events: (data.data?.events || [])
        .filter((e: any) => e.type === 'goal' && parseInt(e.minute) <= 90)
        .map((e: any) => ({ player: e.player_name, minute: e.minute }))
    };

    return NextResponse.json(cleanData);
  } catch (error) {
    return NextResponse.json({ error: 'API Error' }, { status: 500 });
  }
}
