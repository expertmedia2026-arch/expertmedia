'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import type { AlumniRow } from '@/lib/alumni';

const ALL = 'all';

function getInitials(name: string) {
  return name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');
}

const AVATAR_COLORS = [
  'bg-red-600',
  'bg-neutral-700',
  'bg-rose-700',
  'bg-stone-600',
  'bg-red-800',
  'bg-neutral-600',
];

function avatarColor(name: string) {
  let hash = 0;
  for (const ch of name) hash = (hash * 31 + ch.charCodeAt(0)) & 0xffff;
  return AVATAR_COLORS[hash % AVATAR_COLORS.length];
}

type Props = { alumni: AlumniRow[] };

export default function AlumniClient({ alumni }: Props) {
  const years = useMemo(
    () => [...new Set(alumni.map((a) => a.graduationYear))].sort((a, b) => b - a),
    [alumni],
  );
  const programs = useMemo(
    () => [...new Set(alumni.map((a) => a.program))].sort(),
    [alumni],
  );

  const [yearFilter, setYearFilter] = useState<string>(ALL);
  const [programFilter, setProgramFilter] = useState<string>(ALL);
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return alumni.filter((a) => {
      if (yearFilter !== ALL && a.graduationYear !== Number(yearFilter)) return false;
      if (programFilter !== ALL && a.program !== programFilter) return false;
      if (q && !a.name.toLowerCase().includes(q) && !a.program.toLowerCase().includes(q) && !(a.currentRole ?? '').toLowerCase().includes(q)) return false;
      return true;
    });
  }, [alumni, yearFilter, programFilter, search]);

  // Group by year for display
  const grouped = useMemo(() => {
    const map = new Map<number, AlumniRow[]>();
    for (const a of filtered) {
      const arr = map.get(a.graduationYear) ?? [];
      arr.push(a);
      map.set(a.graduationYear, arr);
    }
    return [...map.entries()].sort((a, b) => b[0] - a[0]);
  }, [filtered]);

  const filtersActive = yearFilter !== ALL || programFilter !== ALL || search.trim() !== '';

  function clearFilters() {
    setYearFilter(ALL);
    setProgramFilter(ALL);
    setSearch('');
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-14 sm:py-16">
      {/* Filter bar */}
      <div className="mb-10 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
        <div className="relative flex-1">
          <svg
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400"
            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
          </svg>
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, program, or role…"
            className="w-full rounded-xl border border-neutral-200 bg-white py-2.5 pl-9 pr-4 text-sm text-neutral-800 shadow-sm outline-none placeholder:text-neutral-400 focus:border-red-400 focus:ring-2 focus:ring-red-100"
          />
        </div>

        <select
          value={yearFilter}
          onChange={(e) => setYearFilter(e.target.value)}
          className="rounded-xl border border-neutral-200 bg-white px-3 py-2.5 text-sm text-neutral-700 shadow-sm focus:border-red-400 focus:ring-2 focus:ring-red-100 sm:w-36"
        >
          <option value={ALL}>All years</option>
          {years.map((y) => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>

        <select
          value={programFilter}
          onChange={(e) => setProgramFilter(e.target.value)}
          className="rounded-xl border border-neutral-200 bg-white px-3 py-2.5 text-sm text-neutral-700 shadow-sm focus:border-red-400 focus:ring-2 focus:ring-red-100 sm:w-52"
        >
          <option value={ALL}>All programs</option>
          {programs.map((p) => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>

        {filtersActive && (
          <button
            type="button"
            onClick={clearFilters}
            className="whitespace-nowrap rounded-xl border border-neutral-200 bg-white px-3 py-2.5 text-sm text-neutral-600 shadow-sm hover:border-red-300 hover:text-red-600 transition-colors"
          >
            Clear
          </button>
        )}
      </div>

      {/* Results summary */}
      <p className="mb-8 text-xs text-neutral-500">
        Showing <span className="font-semibold text-neutral-700">{filtered.length}</span> of{' '}
        <span className="font-semibold text-neutral-700">{alumni.length}</span> alumni
        {filtersActive ? ' — matching current filters' : ''}
      </p>

      {/* Empty state */}
      {filtered.length === 0 && (
        <div className="rounded-2xl border border-dashed border-neutral-300 bg-neutral-50 py-20 text-center">
          <p className="text-sm font-medium text-neutral-600">No alumni match your filters.</p>
          <button
            type="button"
            onClick={clearFilters}
            className="mt-3 text-sm text-red-600 hover:underline"
          >
            Clear filters
          </button>
        </div>
      )}

      {/* Grouped by year */}
      <div className="space-y-14">
        {grouped.map(([year, members]) => (
          <section key={year}>
            <div className="mb-6 flex items-center gap-4">
              <h2 className="text-xl font-semibold text-neutral-900 sm:text-2xl border-l-8 border-red-500 pl-4">
                Class of {year}
              </h2>
              <span className="rounded-full bg-red-50 border border-red-200 px-2.5 py-0.5 text-xs font-semibold text-red-700">
                {members.length}
              </span>
            </div>

            <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:gap-5 lg:grid-cols-4">
              {members.map((a) => (
                <li
                  key={a.id}
                  className="group flex flex-col overflow-hidden rounded-2xl border border-neutral-200/90 bg-white shadow-sm transition-shadow duration-300 hover:shadow-md"
                >
                  <Link href={`/alumni/${a.id}`} className="flex flex-1 flex-col">
                    {/* Photo / initials */}
                    <div className="relative aspect-[4/5] overflow-hidden bg-neutral-100">
                      {a.imageUrl ? (
                        <Image
                          src={a.imageUrl}
                          alt={a.name}
                          fill
                          className="object-cover object-top transition-transform duration-500 group-hover:scale-[1.02]"
                          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                        />
                      ) : (
                        <div className={`flex h-full w-full items-center justify-center ${avatarColor(a.name)}`}>
                          <span className="text-3xl font-bold text-white/90 sm:text-4xl">
                            {getInitials(a.name)}
                          </span>
                        </div>
                      )}
                      {/* Overlay for photo cards */}
                      {a.imageUrl && (
                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 via-black/25 to-transparent pb-4 pt-16 px-4 text-center sm:text-left sm:px-4">
                          <p className="text-sm font-semibold text-white sm:text-base leading-tight">{a.name}</p>
                          <p className="mt-0.5 text-xs text-white/80">{a.program}</p>
                        </div>
                      )}
                    </div>

                    {/* Text block — always shown; name repeated only when no photo */}
                    <div className="flex flex-1 flex-col gap-1 border-t border-neutral-100 px-3 py-3 sm:px-4">
                      {!a.imageUrl && (
                        <>
                          <p className="text-sm font-semibold text-neutral-900 sm:text-base leading-tight">{a.name}</p>
                          <p className="text-xs text-red-700/90">{a.program}</p>
                        </>
                      )}
                      {a.currentRole && (
                        <p className="text-xs leading-snug text-neutral-500 line-clamp-2">{a.currentRole}</p>
                      )}
                      <p className="mt-auto pt-1 text-[11px] font-medium text-red-600">View profile</p>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
