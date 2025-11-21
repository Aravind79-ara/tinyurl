import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { links } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

// GET /api/links/:code - Get stats for a single link
export async function GET(request, { params }) {
  try {
    const { code } = params;
    const link = await db.select().from(links).where(eq(links.code, code)).limit(1);
    
    if (link.length === 0) {
      return NextResponse.json({ error: 'Link not found' }, { status: 404 });
    }

    return NextResponse.json(link[0]);
  } catch (error) {
    console.error('Error fetching link:', error);
    return NextResponse.json({ error: 'Failed to fetch link' }, { status: 500 });
  }
}

// DELETE /api/links/:code - Delete a link
export async function DELETE(request, { params }) {
  try {
    const { code } = params;
    const deleted = await db.delete(links).where(eq(links.code, code)).returning();
    
    if (deleted.length === 0) {
      return NextResponse.json({ error: 'Link not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Link deleted successfully' });
  } catch (error) {
    console.error('Error deleting link:', error);
    return NextResponse.json({ error: 'Failed to delete link' }, { status: 500 });
  }
}
