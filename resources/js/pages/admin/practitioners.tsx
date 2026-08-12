import { APPROACH_LABELS, LANGUAGE_LABELS } from '@/components/specialist-card';
import { DeleteUserButton } from '@/components/staff/delete-user-button';
import { HourSelect } from '@/components/staff/hour-picker';
import { Badge, CARD, money, PageHeader, Section, Table, Td } from '@/components/staff/kit';
import StaffLayout from '@/layouts/staff-layout';
import { Link, router, useForm } from '@inertiajs/react';
import { Plus, Trash2, UserPlus, X } from 'lucide-react';
import { useState } from 'react';

interface Practitioner {
    id: number;
    name: string;
    email: string;
    headline: string | null;
    approaches: string[];
    languages: string[];
    approval_status: string;
    sessions: number;
    earned: number;
    owed: number;
}

interface ServiceOption {
    id: number;
    name: string;
    duration_minutes: number | null;
}

interface Options {
    approaches: string[];
    languages: string[];
}

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

/** Days are offered Monday → Sunday; the stored `day_of_week` numbering is untouched. */
const WEEK = [1, 2, 3, 4, 5, 6, 0];

export default function AdminPractitioners({
    practitioners,
    options,
    services,
}: {
    practitioners: Practitioner[];
    options: Options;
    services: ServiceOption[];
}) {
    const [adding, setAdding] = useState(false);
    const setStatus = (id: number, approval_status: string) =>
        router.patch(`/admin/practitioners/${id}`, { approval_status }, { preserveScroll: true });
    const payAll = (id: number) => router.post(`/admin/practitioners/${id}/payout-all`, {}, { preserveScroll: true });

    return (
        <StaffLayout title="Practitioners">
            <PageHeader
                title="Practitioners"
                subtitle="Approve who appears in the directory — and create fully set-up specialist or admin accounts."
                action={
                    <button
                        type="button"
                        onClick={() => setAdding((v) => !v)}
                        className="bg-ashen-700 hover:bg-ashen-800 inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold text-white transition"
                    >
                        {adding ? <X className="size-4" /> : <Plus className="size-4" />}
                        {adding ? 'Close' : 'Add account'}
                    </button>
                }
            />

            {adding && (
                <div className="mb-8">
                    <AddAccountForm options={options} services={services} onDone={() => setAdding(false)} />
                </div>
            )}

            <Section title="All specialists">
                <Table
                    head={['Specialist', 'Sessions', 'Earned', 'Owed', 'Status', 'Actions']}
                    empty={practitioners.length === 0 ? 'No practitioners yet.' : undefined}
                >
                    {practitioners.map((p) => (
                        <tr key={p.id}>
                            <Td>
                                <p className="text-ashen-800 font-medium">{p.name}</p>
                                <p className="text-ashen-400 text-xs">{p.headline ?? p.email}</p>
                            </Td>
                            <Td>{p.sessions}</Td>
                            <Td className="text-ashen-700 font-medium">{money(p.earned)}</Td>
                            <Td>
                                {p.owed > 0 ? (
                                    <button
                                        type="button"
                                        onClick={() => payAll(p.id)}
                                        className="border-ashen-300 text-ashen-700 hover:bg-ashen-50 inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition"
                                        title="Mark this whole balance as paid out"
                                    >
                                        {money(p.owed)} · Pay all
                                    </button>
                                ) : (
                                    <span className="text-ashen-400 text-xs">—</span>
                                )}
                            </Td>
                            <Td>
                                <Badge>{p.approval_status}</Badge>
                            </Td>
                            <Td>
                                <div className="flex items-center gap-2">
                                    <Link
                                        href={`/admin/practitioners/${p.id}/edit`}
                                        className="border-ashen-300 text-ashen-700 hover:bg-ashen-100 rounded-full border px-3.5 py-1.5 text-xs font-medium transition"
                                    >
                                        Edit
                                    </Link>
                                    {p.approval_status !== 'approved' && (
                                        <button
                                            type="button"
                                            onClick={() => setStatus(p.id, 'approved')}
                                            className="bg-ashen-700 hover:bg-ashen-800 rounded-full px-3.5 py-1.5 text-xs font-semibold text-white transition"
                                        >
                                            Approve
                                        </button>
                                    )}
                                    {p.approval_status !== 'rejected' && (
                                        <button
                                            type="button"
                                            onClick={() => setStatus(p.id, 'rejected')}
                                            className="border-ashen-300 text-ashen-600 hover:bg-ashen-100 rounded-full border px-3.5 py-1.5 text-xs font-medium transition"
                                        >
                                            {p.approval_status === 'approved' ? 'Suspend' : 'Reject'}
                                        </button>
                                    )}
                                    <DeleteUserButton id={p.id} name={p.name} />
                                </div>
                            </Td>
                        </tr>
                    ))}
                </Table>
            </Section>
        </StaffLayout>
    );
}

const inputClass =
    'w-full rounded-xl border border-ashen-300/60 bg-ashen-50/80 px-3.5 py-2.5 text-sm text-ashen-800 transition focus:border-ashen-400 focus:bg-ashen-50 focus:outline-none focus:ring-2 focus:ring-ashen-500/20';

// `type` (not `interface`) on purpose: Inertia's useForm data type requires an
// index signature, which object type-aliases satisfy but named interfaces don't.
type PriceRow = {
    id: number;
    price: string;
};

type Window = {
    day_of_week: number;
    start_time: string;
};

function AddAccountForm({ options, services, onDone }: { options: Options; services: ServiceOption[]; onDone: () => void }) {
    const { data, setData, post, processing, errors, reset } = useForm<{
        name: string;
        email: string;
        password: string;
        role: string;
        photo: File | null;
        headline: string;
        bio: string;
        gender: string;
        years_experience: string;
        approaches: string[];
        languages: string[];
        services: PriceRow[];
        availability: Window[];
    }>({
        name: '',
        email: '',
        password: '',
        role: 'practitioner',
        photo: null,
        headline: '',
        bio: '',
        gender: '',
        years_experience: '',
        approaches: [],
        languages: [],
        services: services.map((s) => ({ id: s.id, price: '' })),
        availability: [],
    });

    const [photoPreview, setPhotoPreview] = useState<string | null>(null);
    const isPractitioner = data.role === 'practitioner';

    const pickPhoto = (file: File | null) => {
        setData('photo', file);
        setPhotoPreview(file ? URL.createObjectURL(file) : null);
    };

    const toggle = (field: 'approaches' | 'languages', value: string) =>
        setData(field, data[field].includes(value) ? data[field].filter((v) => v !== value) : [...data[field], value]);

    const setPrice = (id: number, price: string) =>
        setData(
            'services',
            data.services.map((s) => (s.id === id ? { ...s, price } : s)),
        );

    const addWindow = () => setData('availability', [...data.availability, { day_of_week: 1, start_time: '17:00' }]);
    const removeWindow = (i: number) =>
        setData(
            'availability',
            data.availability.filter((_, idx) => idx !== i),
        );
    const setWindow = (i: number, patch: Partial<Window>) =>
        setData(
            'availability',
            data.availability.map((w, idx) => (idx === i ? { ...w, ...patch } : w)),
        );

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/admin/staff', {
            preserveScroll: true,
            forceFormData: true,
            onSuccess: () => {
                reset();
                setPhotoPreview(null);
                onDone();
            },
        });
    };

    return (
        <form onSubmit={submit} className={`p-6 md:p-7 ${CARD}`}>
            <div className="mb-5 flex items-center gap-2">
                <span className="bg-ashen-100 text-ashen-700 flex size-9 items-center justify-center rounded-full">
                    <UserPlus className="size-5" />
                </span>
                <h3 className="font-display text-ashen-800 text-lg">New account</h3>
            </div>

            {/* ===== login basics ===== */}
            <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Full name" error={errors.name}>
                    <input type="text" value={data.name} onChange={(e) => setData('name', e.target.value)} className={inputClass} />
                </Field>
                <Field label="Email" error={errors.email}>
                    <input type="email" value={data.email} onChange={(e) => setData('email', e.target.value)} className={inputClass} />
                </Field>
                <Field label="Temporary password" error={errors.password}>
                    <input type="text" value={data.password} onChange={(e) => setData('password', e.target.value)} className={inputClass} />
                </Field>
                <Field label="Role" error={errors.role}>
                    <select value={data.role} onChange={(e) => setData('role', e.target.value)} className={inputClass}>
                        <option value="practitioner">Specialist</option>
                        <option value="admin">Admin</option>
                    </select>
                </Field>
            </div>

            {isPractitioner && (
                <>
                    {/* ===== photo ===== */}
                    <div className="mt-5">
                        <label className="text-ashen-600 mb-1.5 block text-sm font-medium">Photo</label>
                        <div className="flex items-center gap-4">
                            <div className="bg-ashen-50 border-ashen-300/60 size-20 shrink-0 overflow-hidden rounded-2xl border">
                                {photoPreview ? (
                                    <img src={photoPreview} alt="" className="size-full object-cover" />
                                ) : (
                                    <div className="text-ashen-400 flex size-full items-center justify-center">
                                        <UserPlus className="size-6" />
                                    </div>
                                )}
                            </div>
                            <div>
                                <input
                                    type="file"
                                    accept="image/jpeg,image/png,image/webp"
                                    onChange={(e) => pickPhoto(e.target.files?.[0] ?? null)}
                                    className="text-ashen-600 file:bg-ashen-700 hover:file:bg-ashen-800 text-sm file:mr-3 file:cursor-pointer file:rounded-full file:border-0 file:px-4 file:py-2 file:text-sm file:font-medium file:text-white"
                                />
                                <p className="text-ashen-400 mt-1.5 text-xs">Shown in the client directory. JPG, PNG or WebP, up to 4 MB.</p>
                                {errors.photo && <p className="text-ashen-500 mt-1 text-xs">{errors.photo}</p>}
                            </div>
                        </div>
                    </div>

                    {/* ===== profile ===== */}
                    <div className="border-ashen-300/25 mt-6 border-t pt-6">
                        <p className="text-ashen-500 mb-4 text-[11px] font-semibold tracking-[0.14em] uppercase">Profile</p>
                        <div className="grid gap-4">
                            <Field label="Title" error={errors.headline}>
                                <input
                                    type="text"
                                    value={data.headline}
                                    onChange={(e) => setData('headline', e.target.value)}
                                    placeholder="e.g. Licensed Clinical Doctor"
                                    className={inputClass}
                                />
                            </Field>
                            <Field label="Bio" error={errors.bio}>
                                <textarea value={data.bio} onChange={(e) => setData('bio', e.target.value)} rows={4} className={inputClass} />
                            </Field>
                            <div className="grid gap-4 sm:grid-cols-2">
                                <Field label="Gender" error={errors.gender}>
                                    <select value={data.gender} onChange={(e) => setData('gender', e.target.value)} className={inputClass}>
                                        <option value="">Prefer not to say</option>
                                        <option value="female">Female</option>
                                        <option value="male">Male</option>
                                    </select>
                                </Field>
                                <Field label="Years of experience" error={errors.years_experience}>
                                    <input
                                        type="number"
                                        min={0}
                                        max={60}
                                        value={data.years_experience}
                                        onChange={(e) => setData('years_experience', e.target.value)}
                                        className={inputClass}
                                    />
                                </Field>
                            </div>
                            <Field label="Approaches">
                                <ChipGroup
                                    options={options.approaches}
                                    labels={APPROACH_LABELS}
                                    selected={data.approaches}
                                    onToggle={(v) => toggle('approaches', v)}
                                />
                            </Field>
                            <Field label="Languages">
                                <ChipGroup
                                    options={options.languages}
                                    labels={LANGUAGE_LABELS}
                                    selected={data.languages}
                                    onToggle={(v) => toggle('languages', v)}
                                />
                            </Field>
                        </div>
                    </div>

                    {/* ===== pricing ===== */}
                    <div className="border-ashen-300/25 mt-6 border-t pt-6">
                        <p className="text-ashen-500 mb-1 text-[11px] font-semibold tracking-[0.14em] uppercase">Pricing</p>
                        <p className="text-ashen-400 mb-4 text-xs">
                            Set a price per session. Leave one blank to not offer it. They can adjust these later.
                        </p>
                        <div className="space-y-3">
                            {services.map((service) => {
                                const row = data.services.find((s) => s.id === service.id);
                                return (
                                    <div
                                        key={service.id}
                                        className="border-ashen-300/40 bg-ashen-50/50 flex items-center gap-4 rounded-xl border p-3.5"
                                    >
                                        <div className="min-w-0 flex-1">
                                            <p className="text-ashen-800 text-sm font-medium">{service.name}</p>
                                            {service.duration_minutes && <p className="text-ashen-400 text-xs">{service.duration_minutes} min</p>}
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <span className="text-ashen-400 text-sm">$</span>
                                            <input
                                                type="number"
                                                min={0}
                                                step={1}
                                                value={row?.price ?? ''}
                                                onChange={(e) => setPrice(service.id, e.target.value)}
                                                placeholder="—"
                                                className="border-ashen-300/60 text-ashen-800 bg-ashen-50/80 w-24 rounded-lg border px-3 py-1.5 text-sm"
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* ===== availability ===== */}
                    <div className="border-ashen-300/25 mt-6 border-t pt-6">
                        <div className="mb-4 flex items-center justify-between">
                            <div>
                                <p className="text-ashen-500 text-[11px] font-semibold tracking-[0.14em] uppercase">Weekly availability</p>
                                <p className="text-ashen-400 mt-1 text-xs">The windows clients can book. Repeats every week.</p>
                            </div>
                            <button
                                type="button"
                                onClick={addWindow}
                                className="border-ashen-300 text-ashen-700 hover:bg-ashen-100 inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-medium transition"
                            >
                                <Plus className="size-3.5" /> Add window
                            </button>
                        </div>

                        {data.availability.length === 0 ? (
                            <p className="text-ashen-400 text-sm">No windows yet — they won't be bookable until at least one is added.</p>
                        ) : (
                            <div className="space-y-2.5">
                                {data.availability.map((w, i) => (
                                    <div
                                        key={i}
                                        className="border-ashen-300/40 bg-ashen-50/50 flex flex-wrap items-center gap-2 rounded-xl border p-2.5"
                                    >
                                        <select
                                            value={w.day_of_week}
                                            onChange={(e) => setWindow(i, { day_of_week: Number(e.target.value) })}
                                            className="border-ashen-300/60 text-ashen-800 bg-ashen-50/80 rounded-lg border px-3 py-1.5 text-sm"
                                        >
                                            {WEEK.map((idx) => (
                                                <option key={idx} value={idx}>
                                                    {DAYS[idx]}
                                                </option>
                                            ))}
                                        </select>
                                        <HourSelect value={w.start_time} onChange={(start_time) => setWindow(i, { start_time })} />
                                        <button
                                            type="button"
                                            onClick={() => removeWindow(i)}
                                            className="text-ashen-400 hover:text-ashen-700 hover:bg-ashen-100 ml-auto flex size-8 items-center justify-center rounded-full transition"
                                            aria-label="Remove window"
                                        >
                                            <Trash2 className="size-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </>
            )}

            <div className="mt-6 flex items-center gap-3">
                <button
                    type="submit"
                    disabled={processing}
                    className="bg-ashen-700 hover:bg-ashen-800 rounded-full px-6 py-2.5 text-sm font-semibold text-white transition disabled:opacity-60"
                >
                    Create account
                </button>
                <p className="text-ashen-400 text-xs">They sign in at /login with this email &amp; password, then change it under Account.</p>
            </div>
        </form>
    );
}

function ChipGroup({
    options,
    labels,
    selected,
    onToggle,
}: {
    options: string[];
    labels: Record<string, string>;
    selected: string[];
    onToggle: (value: string) => void;
}) {
    return (
        <div className="flex flex-wrap gap-2">
            {options.map((opt) => {
                const active = selected.includes(opt);
                return (
                    <button
                        key={opt}
                        type="button"
                        onClick={() => onToggle(opt)}
                        className={`rounded-full border px-4 py-1.5 text-sm font-medium transition ${
                            active ? 'border-ashen-600 bg-ashen-600 text-white' : 'border-ashen-300/60 bg-ashen-50 text-ashen-700 hover:bg-ashen-100'
                        }`}
                    >
                        {labels[opt] ?? opt}
                    </button>
                );
            })}
        </div>
    );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
    return (
        <div>
            <label className="text-ashen-600 mb-1.5 block text-sm font-medium">{label}</label>
            {children}
            {error && <p className="text-ashen-500 mt-1 text-xs">{error}</p>}
        </div>
    );
}
