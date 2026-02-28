import { NextResponse } from 'next/server';
import { readData, writeData } from '@/lib/storage';
import { isAuthorized } from '@/lib/auth';
import { type DraftState, getInitialDraftState } from '@/data/ryder-cup';

const KEY = 'draft';

export async function GET() {
  const data = readData<DraftState>(KEY);
  return NextResponse.json(data ?? getInitialDraftState());
}

export async function POST(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const body = (await request.json()) as DraftState;
  writeData(KEY, body);
  return NextResponse.json({ ok: true });
}
