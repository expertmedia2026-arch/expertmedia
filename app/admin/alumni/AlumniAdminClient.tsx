'use client';

import Image from 'next/image';
import { useCallback, useRef, useState } from 'react';
import { HiPencilSquare, HiTrash } from 'react-icons/hi2';
import type { AlumniRow } from '@/lib/alumni';

const headerPattern =
  "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")";

function sortAlumni(a: AlumniRow, b: AlumniRow) {
  if (b.graduationYear !== a.graduationYear) return b.graduationYear - a.graduationYear;
  return a.name.localeCompare(b.name);
}

type Props = { initialAlumni: AlumniRow[] };

export default function AlumniAdminClient({ initialAlumni }: Props) {
  const [alumni, setAlumni] = useState<AlumniRow[]>(() => [...initialAlumni].sort(sortAlumni));
  const [addOpen, setAddOpen] = useState(false);
  const [editing, setEditing] = useState<AlumniRow | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const [preview, setPreview] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [editPreview, setEditPreview] = useState<string | null>(null);
  const editFileRef = useRef<HTMLInputElement>(null);

  const clearPhoto = useCallback(() => {
    setPreview(null);
    if (fileRef.current) fileRef.current.value = '';
  }, []);

  const clearEditPhoto = useCallback(() => {
    setEditPreview(null);
    if (editFileRef.current) editFileRef.current.value = '';
  }, []);

  const closeAdd = useCallback(() => {
    setAddOpen(false);
    setError(null);
    clearPhoto();
  }, [clearPhoto]);

  const closeEdit = useCallback(() => {
    setEditing(null);
    setError(null);
    clearEditPhoto();
  }, [clearEditPhoto]);

  function flash(msg: string) {
    setNotice(msg);
    setTimeout(() => setNotice(null), 2500);
  }

  function handlePhoto(e: React.ChangeEvent<HTMLInputElement>, mode: 'add' | 'edit') {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (mode === 'add') setPreview(reader.result as string);
      else setEditPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  }

  async function onAddSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const formEl = e.currentTarget;
    setSubmitting(true);
    try {
      const res = await fetch('/api/alumni', { method: 'POST', body: new FormData(formEl) });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) { setError(data.message ?? 'Could not add alumni'); return; }
      setAlumni((prev) => [...prev, data as AlumniRow].sort(sortAlumni));
      flash('Alumni added');
      closeAdd();
      formEl.reset();
    } catch { setError('Network error'); }
    finally { setSubmitting(false); }
  }

  async function onEditSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!editing) return;
    setError(null);
    const formEl = e.currentTarget;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/alumni/${editing.id}`, { method: 'PATCH', body: new FormData(formEl) });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) { setError(data.message ?? 'Could not update alumni'); return; }
      setAlumni((prev) => prev.map((a) => (a.id === data.id ? (data as AlumniRow) : a)).sort(sortAlumni));
      flash('Alumni updated');
      closeEdit();
    } catch { setError('Network error'); }
    finally { setSubmitting(false); }
  }

  async function onDelete(a: AlumniRow) {
    if (!confirm(`Delete "${a.name}"? This cannot be undone.`)) return;
    setError(null);
    try {
      const res = await fetch(`/api/alumni/${a.id}`, { method: 'DELETE' });
      if (!res.ok) { const d = await res.json().catch(() => ({})); setError(d.message ?? 'Delete failed'); return; }
      setAlumni((prev) => prev.filter((x) => x.id !== a.id));
      flash('Alumni removed');
    } catch { setError('Network error'); }
  }

  return (
    <div className="min-h-0 overflow-y-auto px-6 sm:px-8 py-8 pb-16">
      {/* Header */}
      <div className="relative overflow-hidden rounded-xl border border-gray-200 bg-gradient-to-br from-neutral-900 via-neutral-800 to-red-950 text-white shadow-lg mb-8">
        <div className="absolute inset-0 opacity-[0.07]" style={{ backgroundImage: headerPattern }} />
        <div className="relative px-6 py-8 sm:px-10 sm:py-10 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
          <div>
            <p className="text-xs font-medium uppercase tracking-widest text-red-300/90 mb-2">Public site</p>
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">Our Alumni</h1>
            <p className="mt-2 text-sm text-neutral-300 max-w-xl leading-relaxed">
              Add and manage alumni shown on the <span className="text-white/90 font-medium">/alumni</span> page, grouped by graduation year and program.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {notice && (
              <span className="rounded-full bg-emerald-500/20 px-3 py-1.5 text-xs font-medium text-emerald-100 border border-emerald-400/30">
                {notice}
              </span>
            )}
            <span className="rounded-full bg-white/10 px-3 py-1.5 text-sm backdrop-blur-sm border border-white/10">
              {alumni.length} alumni
            </span>
            <button
              type="button"
              onClick={() => { setError(null); setAddOpen(true); }}
              className="inline-flex items-center gap-2 rounded-full bg-red-500 px-4 py-2 text-sm font-medium text-white shadow-md shadow-red-900/40 hover:bg-red-600 transition-colors"
            >
              Add Alumni
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {error && !addOpen && !editing && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 text-red-800 text-sm px-4 py-3">{error}</div>
      )}

      {/* Table */}
      <section>
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2 mb-4">
          <h2 className="text-sm font-semibold text-gray-800">Alumni directory</h2>
          <p className="text-xs text-gray-500">Sorted by graduation year (newest first)</p>
        </div>
        {alumni.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50/50 p-12 text-center text-sm text-gray-600">
            No alumni yet. Add the first one with the button above.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
            <table className="w-full min-w-[700px] text-left text-sm">
              <thead className="border-b border-gray-200 bg-gray-50 text-xs font-semibold uppercase tracking-wide text-gray-600">
                <tr>
                  <th className="px-3 py-3 w-12" scope="col">Photo</th>
                  <th className="px-3 py-3 min-w-[140px]" scope="col">Name</th>
                  <th className="px-3 py-3" scope="col">Program</th>
                  <th className="px-3 py-3 whitespace-nowrap" scope="col">Year</th>
                  <th className="px-3 py-3 hidden md:table-cell" scope="col">Current role</th>
                  <th className="px-3 py-3 text-right w-0" scope="col">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {alumni.map((a) => (
                  <tr key={a.id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="px-3 py-2 align-middle">
                      <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-full border border-gray-200 bg-neutral-100">
                        {a.imageUrl ? (
                          <Image src={a.imageUrl} alt="" fill className="object-cover" sizes="36px" />
                        ) : (
                          <span className="flex h-full w-full items-center justify-center bg-neutral-200 text-[10px] font-bold text-neutral-500">
                            {a.name.split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase()}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-3 py-2 align-middle font-medium text-gray-900">{a.name}</td>
                    <td className="px-3 py-2 align-middle text-gray-600">{a.program}</td>
                    <td className="px-3 py-2 align-middle">
                      <span className="rounded-md bg-red-50 border border-red-200 px-2 py-0.5 text-xs font-semibold text-red-700">
                        {a.graduationYear}
                      </span>
                    </td>
                    <td className="px-3 py-2 align-middle text-gray-500 hidden md:table-cell">
                      {a.currentRole || <span className="text-gray-300">—</span>}
                    </td>
                    <td className="px-3 py-2 align-middle text-right">
                      <div className="inline-flex items-center gap-0.5">
                        <button
                          type="button"
                          onClick={() => { setEditing(a); setEditPreview(null); if (editFileRef.current) editFileRef.current.value = ''; }}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-gray-200 bg-white text-gray-700 hover:border-red-200 hover:bg-red-50 hover:text-red-600 transition-colors"
                          title="Edit" aria-label={`Edit ${a.name}`}
                        >
                          <HiPencilSquare className="h-4 w-4" aria-hidden />
                        </button>
                        <button
                          type="button"
                          onClick={() => onDelete(a)}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-red-200 bg-red-50 text-red-700 hover:bg-red-100 transition-colors"
                          title="Delete" aria-label={`Delete ${a.name}`}
                        >
                          <HiTrash className="h-4 w-4" aria-hidden />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* ── Add modal ── */}
      {addOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={closeAdd} aria-hidden />
          <div className="relative bg-white rounded-xl p-6 w-full max-w-lg shadow-xl border border-gray-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Add Alumni</h2>
              <button type="button" onClick={closeAdd} className="text-sm rounded-md border px-2 py-1">Close</button>
            </div>
            <form onSubmit={onAddSubmit} className="space-y-4">
              {error && <div className="rounded-lg border border-red-200 bg-red-50 text-red-800 text-sm px-3 py-2">{error}</div>}
              <AlumniFormFields preview={preview} fileRef={fileRef} onPhoto={(e) => handlePhoto(e, 'add')} onClearPhoto={clearPhoto} />
              <button type="submit" disabled={submitting} className="w-full rounded-lg bg-red-500 py-2.5 text-sm font-medium text-white hover:bg-red-600 disabled:opacity-60 transition-colors">
                {submitting ? 'Saving…' : 'Add Alumni'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ── Edit modal ── */}
      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={closeEdit} aria-hidden />
          <div className="relative bg-white rounded-xl p-6 w-full max-w-lg shadow-xl border border-gray-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Edit Alumni</h2>
              <button type="button" onClick={closeEdit} className="text-sm rounded-md border px-2 py-1">Close</button>
            </div>
            <form key={editing.id} onSubmit={onEditSubmit} className="space-y-4">
              {error && <div className="rounded-lg border border-red-200 bg-red-50 text-red-800 text-sm px-3 py-2">{error}</div>}
              <AlumniFormFields
                preview={editPreview}
                existingImageUrl={editing.imageUrl ?? undefined}
                fileRef={editFileRef}
                onPhoto={(e) => handlePhoto(e, 'edit')}
                onClearPhoto={clearEditPhoto}
                defaults={editing}
              />
              <button type="submit" disabled={submitting} className="w-full rounded-lg bg-red-500 py-2.5 text-sm font-medium text-white hover:bg-red-600 disabled:opacity-60 transition-colors">
                {submitting ? 'Saving…' : 'Update Alumni'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Shared form fields ── */
type FieldProps = {
  preview: string | null;
  existingImageUrl?: string;
  fileRef: React.RefObject<HTMLInputElement | null>;
  onPhoto: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onClearPhoto: () => void;
  defaults?: Partial<AlumniRow>;
};

function AlumniFormFields({ preview, existingImageUrl, fileRef, onPhoto, onClearPhoto, defaults }: FieldProps) {
  const shown = preview ?? existingImageUrl ?? null;
  return (
    <>
      {/* Photo */}
      <div className="flex flex-col items-center gap-2">
        <div
          className="relative w-20 h-20 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center cursor-pointer overflow-hidden hover:border-red-400 transition-colors bg-gray-50"
          onClick={() => fileRef.current?.click()}
          title="Click to upload photo"
        >
          {shown ? (
            <Image src={shown} alt="Preview" fill className="object-cover" unoptimized={!!preview} />
          ) : (
            <svg className="w-8 h-8 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
            </svg>
          )}
        </div>
        <input ref={fileRef} name="photo" type="file" accept="image/*" className="hidden" onChange={onPhoto} />
        <div className="flex gap-2">
          <button type="button" onClick={() => fileRef.current?.click()} className="text-xs text-gray-500 hover:text-red-500 transition-colors">
            {shown ? 'Replace photo' : 'Upload photo'}
          </button>
          {preview && (
            <button type="button" onClick={onClearPhoto} className="text-xs text-red-400 hover:text-red-600 transition-colors">
              {existingImageUrl ? 'Keep original' : 'Remove'}
            </button>
          )}
        </div>
        <p className="text-[11px] text-gray-400">Optional — initials avatar shown if no photo</p>
      </div>

      {/* Name */}
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Name</label>
        <input name="name" type="text" required defaultValue={defaults?.name} className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm" placeholder="Full name" />
      </div>

      {/* Program */}
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Program</label>
        <select name="program" required defaultValue={defaults?.program ?? ''} className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm bg-white">
          <option value="" disabled>Select a program</option>
          <option value="Software Development">Software Development</option>
          <option value="Hardware & Maintenance">Hardware &amp; Maintenance</option>
          <option value="Robotics">Robotics</option>
          <option value="Graphic Design">Graphic Design</option>
        </select>
      </div>

      {/* Year */}
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Graduation year</label>
        <input name="graduationYear" type="number" required min={1900} max={2100} defaultValue={defaults?.graduationYear ?? new Date().getFullYear()} className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm" />
      </div>

      {/* Current role */}
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Current role <span className="text-gray-400 font-normal">(optional)</span></label>
        <input name="currentRole" type="text" defaultValue={defaults?.currentRole ?? ''} className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm" placeholder="e.g. Backend Engineer at Flutterwave" />
      </div>

      {/* LinkedIn */}
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">LinkedIn URL <span className="text-gray-400 font-normal">(optional)</span></label>
        <input name="linkedInUrl" type="url" defaultValue={defaults?.linkedInUrl ?? ''} className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm" placeholder="https://linkedin.com/in/…" />
      </div>

      {/* GitHub */}
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">GitHub URL <span className="text-gray-400 font-normal">(optional)</span></label>
        <input name="githubUrl" type="url" defaultValue={defaults?.githubUrl ?? ''} className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm" placeholder="https://github.com/…" />
      </div>

      {/* Bio */}
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Bio <span className="text-gray-400 font-normal">(optional)</span></label>
        <textarea name="bio" rows={3} defaultValue={defaults?.bio ?? ''} className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm resize-y" placeholder="Short bio or achievement highlight" />
      </div>
    </>
  );
}
