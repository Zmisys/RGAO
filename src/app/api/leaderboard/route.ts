import { NextResponse } from 'next/server';
import { readData, writeData } from '@/lib/storage';
import { isAuthorized } from '@/lib/auth';
import { type LeaderboardState, createInitialState } from '@/data/players';

const KEY = 'leaderboard';

export async function GET() {
  const data = readData<LeaderboardState>(KEY);
  return NextResponse.json(data ?? createInitialState());
}

export async function POST(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const body = (await request.json()) as LeaderboardState;
  writeData(KEY, body);
  return NextResponse.json({ ok: true });
}
