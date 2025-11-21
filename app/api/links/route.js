import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { links } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { nanoid } from 'nanoid';
import { z } from 'zod';

const createLinkSchema = z.object({
  targetUrl: z.string().url('Invalid URL format'),
  customCode: z.string().regex(/^[A-Za-z0-9]{6,8}$/, 'Code must be 6-8 alphanumeric characters').optional(),
});

// GET /api/links - List all links
export async function GET() {
  try {
    const allLinks = await db.select().from(links).orderBy(links.createdAt);
    return NextResponse.json(allLinks);
  } catch (error) {
    console.error('Error fetching links:', error);
    return NextResponse.json({ error: 'Failed to fetch links' }, { status: 500 });
  }
}

// POST /api/links - Create a new link
export async function POST(request) {
  try {
    const body = await request.json();
    const validation = createLinkSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0].message },
        { status: 400 }
      );
    }

    const { targetUrl, customCode } = validation.data;
    const code = customCode || nanoid(6);

    // Check if code already exists
    const existing = await db.select().from(links).where(eq(links.code, code)).limit(1);
    
    if (existing.length > 0) {
      return NextResponse.json(
        { error: 'Short code already exists' },
        { status: 409 }
      );
    }

    const newLink = await db.insert(links).values({
      code,
      targetUrl,
      clicks: 0,
    }).returning();

    return NextResponse.json(newLink[0], { status: 201 });
  } catch (error) {
    console.error('Error creating link:', error);
    return NextResponse.json({ error: 'Failed to create link' }, { status: 500 });
  }
}
