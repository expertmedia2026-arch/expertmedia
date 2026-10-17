import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import path from 'path';
import { randomUUID } from 'crypto';
import { prisma } from '@/lib/prisma';
import { dbUnreachableResponse } from '@/lib/prisma-http';
import { saveUploadedFile } from '@/lib/server-media';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function canManage(role: string | undefined) {
  return role === 'ADMIN' || role === 'MANAGER' || role === 'STAFF';
}

const alumniSelect = {
  id: true,
  name: true,
  program: true,
  graduationYear: true,
  imageUrl: true,
  currentRole: true,
  bio: true,
  linkedInUrl: true,
  githubUrl: true,
  createdAt: true,
} as const;

export async function POST(req: NextRequest) {
  try {
    const store = await cookies();
    const role = store.get('role')?.value;
    if (!canManage(role)) {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    const form = await req.formData();
    const name = String(form.get('name') || '').trim();
    const program = String(form.get('program') || '').trim();
    const graduationYearRaw = form.get('graduationYear');
    const currentRole = String(form.get('currentRole') || '').trim() || null;
    const bio = String(form.get('bio') || '').trim() || null;
    const linkedInUrl = String(form.get('linkedInUrl') || '').trim() || null;
    const githubUrl = String(form.get('githubUrl') || '').trim() || null;
    const file = form.get('photo');

    if (!name) return NextResponse.json({ message: 'Name is required' }, { status: 400 });
    if (!program) return NextResponse.json({ message: 'Program is required' }, { status: 400 });

    const graduationYear = parseInt(String(graduationYearRaw || ''), 10);
    if (Number.isNaN(graduationYear) || graduationYear < 1900 || graduationYear > 2100) {
      return NextResponse.json({ message: 'A valid graduation year is required' }, { status: 400 });
    }

    let imageUrl: string | null = null;
    if (file instanceof File && file.size > 0) {
      if (!file.type.startsWith('image/')) {
        return NextResponse.json({ message: 'Photo must be an image' }, { status: 400 });
      }
      const ext = path.extname(file.name).toLowerCase() || '.jpg';
      const saved = await saveUploadedFile(file, 'team', `${randomUUID()}${ext}`);
      imageUrl = saved.url;
    }

    const alumni = await prisma.alumni.create({
      data: { name, program, graduationYear, imageUrl, currentRole, bio, linkedInUrl, githubUrl },
      select: alumniSelect,
    });

    return NextResponse.json(
      { ...alumni, createdAt: alumni.createdAt.toISOString() },
      { status: 201 },
    );
  } catch (e: unknown) {
    const db = dbUnreachableResponse(e);
    if (db) return db;
    const message = e instanceof Error ? e.message : 'Could not add alumni';
    return NextResponse.json({ message }, { status: 500 });
  }
}
