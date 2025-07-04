import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs/promises';

const CONFIG_PATH = path.join(process.cwd(), 'src', 'data', 'hyperparameter-config.json');

export async function GET() {
  try {
    const data = await fs.readFile(CONFIG_PATH, 'utf8');
    const configData = JSON.parse(data);
    return NextResponse.json(configData);
  } catch (error) {
    console.error('Error reading hyperparameter config:', error);
    return NextResponse.json({ error: 'Failed to read hyperparameter config' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const configData = await request.json();
    await fs.writeFile(CONFIG_PATH, JSON.stringify(configData, null, 2));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error writing hyperparameter config:', error);
    return NextResponse.json({ error: 'Failed to write hyperparameter config' }, { status: 500 });
  }
}
