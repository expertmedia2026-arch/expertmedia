import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import path from 'path';
import { randomUUID } from 'crypto';
import { prisma } from '@/lib/prisma';
import { dbUnreachableResponse } from '@/lib/prisma-http';
import { deleteStoredFile, saveUploadedFile } from '@/lib/server-media';

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

export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    const store = await cookies();
    const role = store.get('role')?.value;
    if (!canManage(role)) {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    const { id } = await ctx.params;
    const existing = await prisma.alumni.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ message: 'Not found' }, { status: 404 });

    const form = await req.formData();
    const name = String(form.get('name') ?? existing.name).trim();
    const program = String(form.get('program') ?? existing.program).trim();
    const yearRaw = form.get('graduationYear');
    const currentRole = String(form.get('currentRole') || '').trim() || null;
    const bio = String(form.get('bio') || '').trim() || null;
    const linkedInUrl = String(form.get('linkedInUrl') || '').trim() || null;
    const githubUrl = String(form.get('githubUrl') || '').trim() || null;
    const file = form.get('photo');

    if (!name) return NextResponse.json({ message: 'Name is required' }, { status: 400 });
    if (!program) return NextResponse.json({ message: 'Program is required' }, { status: 400 });

    const graduationYear =
      yearRaw !== null && yearRaw !== ''
        ? parseInt(String(yearRaw), 10)
        : existing.graduationYear;
    if (Number.isNaN(graduationYear) || graduationYear < 1900 || graduationYear > 2100) {
      return NextResponse.json({ message: 'A valid graduation year is required' }, { status: 400 });
    }

    let imageUrl = existing.imageUrl;
    if (file instanceof File && file.size > 0) {
      if (!file.type.startsWith('image/')) {
        return NextResponse.json({ message: 'Photo must be an image' }, { status: 400 });
      }
      const ext = path.extname(file.name).toLowerCase() || '.jpg';
      const saved = await saveUploadedFile(file, 'team', `${randomUUID()}${ext}`);
      await deleteStoredFile(existing.imageUrl);
      imageUrl = saved.url;
    }

    const alumni = await prisma.alumni.update({
      where: { id },
      data: { name, program, graduationYear, imageUrl, currentRole, bio, linkedInUrl, githubUrl },
      select: alumniSelect,
    });

    return NextResponse.json({ ...alumni, createdAt: alumni.createdAt.toISOString() });
  } catch (e: unknown) {
    const db = dbUnreachableResponse(e);
    if (db) return db;
    console.error('PATCH /api/alumni/[id]', e);
    const message = e instanceof Error ? e.message : 'Could not update alumni';
    return NextResponse.json({ message }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    const store = await cookies();
    const role = store.get('role')?.value;
    if (!canManage(role)) {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    const { id } = await ctx.params;
    const existing = await prisma.alumni.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ message: 'Not found' }, { status: 404 });

    await deleteStoredFile(existing.imageUrl);
    await prisma.alumni.delete({ where: { id } });

    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    const db = dbUnreachableResponse(e);
    if (db) return db;
    console.error('DELETE /api/alumni/[id]', e);
    const message = e instanceof Error ? e.message : 'Could not delete alumni';
    return NextResponse.json({ message }, { status: 500 });
  }
}
