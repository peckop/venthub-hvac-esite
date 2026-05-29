// Orion Hook Verification Success Test - Verified
import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    status: "ok",
    timestamp: new Date().toISOString()
  })
}
