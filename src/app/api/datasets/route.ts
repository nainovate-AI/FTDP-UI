import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const DATASETS_FILE = path.join(process.cwd(), 'src', 'data', 'datasets.json');

export async function GET() {
  try {
    const data = fs.readFileSync(DATASETS_FILE, 'utf8');
    const datasets = JSON.parse(data);
    return NextResponse.json(datasets);
  } catch (error) {
    console.error('Error reading datasets:', error);
    return NextResponse.json([], { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const datasets = await request.json();
    fs.writeFileSync(DATASETS_FILE, JSON.stringify(datasets, null, 2));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving datasets:', error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
