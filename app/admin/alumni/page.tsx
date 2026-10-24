import { getAllAlumni } from '@/lib/alumni';
import AlumniAdminClient from './AlumniAdminClient';

export const dynamic = 'force-dynamic';

export default async function AdminAlumniPage() {
  const rows = await getAllAlumni();
  return <AlumniAdminClient initialAlumni={rows} />;
}
