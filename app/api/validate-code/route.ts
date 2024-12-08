import { NextResponse } from 'next/server'
import codes from '@/lib/codes.json'

export async function POST(request: Request) {
  try {
    const { code } = await request.json()
    console.log(code)
    const codeData = codes.codes.find((c) => c.code === code && !c.used)

    console.log(code)

    return NextResponse.json({
      valid: !!codeData,
    })
  } catch (error) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}
