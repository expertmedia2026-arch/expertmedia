import { prisma } from '@/lib/prisma';

export type AlumniRow = {
  id: string;
  name: string;
  program: string;
  graduationYear: number;
  imageUrl: string | null;
  currentRole: string | null;
  bio: string | null;
  linkedInUrl: string | null;
  githubUrl: string | null;
  createdAt: string;
};

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

export async function getAllAlumni(): Promise<AlumniRow[]> {
  try {
    const rows = await prisma.alumni.findMany({
      orderBy: [{ graduationYear: 'desc' }, { name: 'asc' }],
      select: alumniSelect,
    });
    return rows.map((r) => ({ ...r, createdAt: r.createdAt.toISOString() }));
  } catch {
    return [];
  }
}

export async function getAlumniById(id: string): Promise<AlumniRow | null> {
  try {
    const row = await prisma.alumni.findUnique({
      where: { id },
      select: alumniSelect,
    });

    if (!row) return null;

    return { ...row, createdAt: row.createdAt.toISOString() };
  } catch {
    return null;
  }
}
