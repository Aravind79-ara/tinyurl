import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { links } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(request, { params }) {
  try {
    const { code } = params;
    const link = await db.select().from(links).where(eq(links.code, code)).limit(1);
    
    if (link.length === 0) {
      return new NextResponse('Not Found', { status: 404 });
    }

    // Update click count and last clicked time
    await db.update(links)
      .set({
        clicks: link[0].clicks + 1,
        lastClicked: new Date(),
      })
      .where(eq(links.code, code));

    // 302 redirect
    return NextResponse.redirect(link[0].targetUrl, { status: 302 });
  } catch (error) {
    console.error('Redirect error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
