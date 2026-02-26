import { NextResponse } from 'next/server';
import { readData, writeData } from '@/lib/storage';
import { type DraftState, getInitialDraftState } from '@/data/ryder-cup';

const KEY = 'draft';

export async function GET() {
  const data = readData<DraftState>(KEY);
  return NextResponse.json(data ?? getInitialDraftState());
}

export async function POST(request: Request) {
  const body = (await request.json()) as DraftState;
  writeData(KEY, body);
  return NextResponse.json({ ok: true });
}
