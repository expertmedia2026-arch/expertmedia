import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { PublicFooter } from '@/app/_components/PublicFooter';
import { PublicNav } from '@/app/_components/PublicNav';
import { ScrollToTop } from '@/app/_components/ScrollToTop';
import { getAlumniById } from '@/lib/alumni';

export const dynamic = 'force-dynamic';

type PageProps = {
  params: Promise<{ id: string }>;
};

function getInitials(name: string) {
  return name
    .split(' ')
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() ?? '')
    .join('');
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const alumni = await getAlumniById(id);

  if (!alumni) {
    return {
      title: 'Alumni Not Found | Expert Media Solutions',
    };
  }

  return {
    title: `${alumni.name} | Our Alumni | Expert Media Solutions`,
    description:
      alumni.bio ??
      `${alumni.name} is part of the Expert Media Solutions alumni community in ${alumni.program}.`,
  };
}

export default async function AlumniDetailPage({ params }: PageProps) {
  const { id } = await params;
  const alumni = await getAlumniById(id);

  if (!alumni) notFound();

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900">
      <PublicNav />

      <section className="border-b border-neutral-200 bg-white">
        <div className="mx-auto max-w-6xl px-6 py-6 text-sm">
          <Link href="/alumni" className="text-neutral-500 transition-colors hover:text-red-600">
            Back to Alumni
          </Link>
        </div>
      </section>

      <main className="mx-auto max-w-6xl px-6 py-12 sm:py-16">
        <div className="grid gap-8 lg:grid-cols-[320px_minmax(0,1fr)] lg:gap-12">
          <section className="overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-sm">
            <div className="relative aspect-[4/5] bg-neutral-100">
              {alumni.imageUrl ? (
                <Image
                  src={alumni.imageUrl}
                  alt={alumni.name}
                  fill
                  className="object-cover object-top"
                  sizes="(max-width: 1024px) 100vw, 320px"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-red-700">
                  <span className="text-5xl font-bold text-white">{getInitials(alumni.name)}</span>
                </div>
              )}
            </div>
          </section>

          <section className="flex flex-col justify-center">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-red-600">
              Expert Media Solutions Alumni
            </p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-neutral-950 sm:text-4xl">
              {alumni.name}
            </h1>

            <div className="mt-5 flex flex-wrap gap-3">
              <span className="rounded-full border border-red-200 bg-red-50 px-4 py-1.5 text-sm font-medium text-red-700">
                {alumni.program}
              </span>
              <span className="rounded-full border border-neutral-200 bg-white px-4 py-1.5 text-sm font-medium text-neutral-700">
                Class of {alumni.graduationYear}
              </span>
            </div>

            {alumni.currentRole && (
              <p className="mt-6 text-lg text-neutral-700">{alumni.currentRole}</p>
            )}

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-widest text-neutral-400">Program</p>
                <p className="mt-2 text-sm font-medium text-neutral-900">{alumni.program}</p>
              </div>
              <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-widest text-neutral-400">Graduation Year</p>
                <p className="mt-2 text-sm font-medium text-neutral-900">{alumni.graduationYear}</p>
              </div>
            </div>

            {alumni.bio && (
              <div className="mt-8 rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-neutral-950">About</h2>
                <p className="mt-3 whitespace-pre-line text-sm leading-7 text-neutral-600">{alumni.bio}</p>
              </div>
            )}

            {(alumni.linkedInUrl || alumni.githubUrl) && (
              <div className="mt-8 flex flex-wrap gap-3">
                {alumni.linkedInUrl && (
                  <a
                    href={alumni.linkedInUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center rounded-full bg-[#0A66C2] px-5 py-2.5 text-sm font-medium text-white transition-transform hover:scale-[1.01]"
                  >
                    LinkedIn
                  </a>
                )}
                {alumni.githubUrl && (
                  <a
                    href={alumni.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center rounded-full bg-neutral-900 px-5 py-2.5 text-sm font-medium text-white transition-transform hover:scale-[1.01]"
                  >
                    GitHub
                  </a>
                )}
              </div>
            )}
          </section>
        </div>
      </main>

      <PublicFooter />
      <ScrollToTop />
    </div>
  );
}
