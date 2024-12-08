import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import codes from '@/lib/codes.json';

export async function POST(request: Request) {
  try {
    const { code } = await request.json();
    const codesData = codes.codes;
    const codeIndex = codesData.findIndex(c => c.code === code);
    
    if (codeIndex === -1) {
      return NextResponse.json(
        { error: 'Code not found' },
        { status: 404 }
      );
    }

    codesData[codeIndex].used = true;

    // Update the JSON file
    const filePath = path.join(process.cwd(), 'lib/codes.json');
    await fs.writeFile(
      filePath,
      JSON.stringify({ codes: codesData }, null, 2)
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to mark code as used' },
      { status: 500 }
    );
  }
}