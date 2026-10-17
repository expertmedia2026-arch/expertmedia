import { prisma } from '@/lib/prisma';
import type { AlumniRow } from '@/lib/alumni';
import AlumniAdminClient from './AlumniAdminClient';

export const dynamic = 'force-dynamic';

export default async function AdminAlumniPage() {
  let rows: AlumniRow[] = [];
  try {
    const list = await prisma.alumni.findMany({
      orderBy: [{ graduationYear: 'desc' }, { name: 'asc' }],
      select: {
        id: true,
        name: true,
        program: true,
        graduationYear: true,
        imageUrl: true,
        currentRole: true,
        bio: true,
        linkedInUrl: true,
        createdAt: true,
      },
    });
    rows = list.map((a) => ({ ...a, createdAt: a.createdAt.toISOString() }));
  } catch {
    rows = [];
  }

  return <AlumniAdminClient initialAlumni={rows} />;
}
