import Link from 'next/link';
import type { Metadata } from 'next';
import { PublicNav } from '@/app/_components/PublicNav';
import { PublicFooter } from '@/app/_components/PublicFooter';
import { ScrollToTop } from '@/app/_components/ScrollToTop';
import { getAllAlumni } from '@/lib/alumni';
import AlumniClient from './AlumniClient';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Our Alumni | Expert Media Solutions',
  description:
    'Meet the alumni of Expert Media Solutions — talented professionals who trained with us and are now making an impact across industries.',
};

const heroPattern =
  "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")";

export default async function AlumniPage() {
  const alumni = await getAllAlumni();

  const totalYears = new Set(alumni.map((a) => a.graduationYear)).size;
  const totalPrograms = new Set(alumni.map((a) => a.program)).size;

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900">
      <PublicNav />

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-neutral-950 via-neutral-900 to-red-950 text-white">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.06]"
          style={{ backgroundImage: heroPattern }}
        />
        <div className="absolute -right-24 top-1/2 h-[28rem] w-[28rem] -translate-y-1/2 rounded-full bg-red-500/20 blur-3xl" />
        <div className="relative mx-auto max-w-6xl px-6 py-20 sm:py-24 lg:py-28">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.22em] text-red-300/95">
            Expert Media Solutions
          </p>
          <h1 className="max-w-3xl text-4xl font-semibold leading-tight tracking-tight sm:text-5xl lg:text-[3.25rem]">
            Our Alumni
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-neutral-300 sm:text-lg">
            Talented individuals who trained and grew with us — now driving impact across industries
            worldwide.
          </p>

          {/* Stats */}
          {alumni.length > 0 && (
            <div className="mt-10 flex flex-wrap gap-6">
              {[
                { value: alumni.length, label: 'Alumni' },
                { value: totalPrograms, label: totalPrograms === 1 ? 'Program' : 'Programs' },
                { value: totalYears, label: totalYears === 1 ? 'Year' : 'Years' },
              ].map(({ value, label }) => (
                <div key={label} className="flex flex-col">
                  <span className="text-3xl font-bold text-white">{value}</span>
                  <span className="text-xs font-medium text-neutral-400 uppercase tracking-widest mt-0.5">{label}</span>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="h-1 w-full bg-gradient-to-r from-transparent via-red-500/60 to-transparent" />
      </section>

      {/* Alumni list with filters */}
      {alumni.length === 0 ? (
        <section className="mx-auto max-w-6xl px-6 py-24 text-center">
          <p className="text-sm text-neutral-500">No alumni records yet — check back soon.</p>
        </section>
      ) : (
        <AlumniClient alumni={alumni} />
      )}

      {/* CTA */}
      <section className="border-t border-red-400/30 bg-gradient-to-r from-red-600 to-red-500 px-6 py-14 text-center text-white sm:py-16">
        <div className="mx-auto max-w-2xl">
          <h2 className="text-2xl font-semibold sm:text-3xl">Want to collaborate?</h2>
          <p className="mt-3 text-sm text-white/90 sm:text-base">
            Tell us about your project — we&apos;ll connect you with the right people.
          </p>
          <Link
            href="/contacts"
            className="mt-8 inline-flex items-center justify-center rounded-full bg-white px-8 py-3 text-sm font-semibold text-red-600 shadow-md transition-transform hover:scale-[1.02] hover:bg-neutral-50"
          >
            Contact us
          </Link>
        </div>
      </section>

      <PublicFooter />
      <ScrollToTop />
    </div>
  );
}
