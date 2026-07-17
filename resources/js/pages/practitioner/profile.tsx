import { Badge, CARD, PageHeader } from '@/components/staff/kit';
import StaffLayout from '@/layouts/staff-layout';
import { useForm } from '@inertiajs/react';
import { Check } from 'lucide-react';

interface ProfileData {
    headline: string | null;
    bio: string | null;
    gender: string | null;
    years_experience: number | null;
    approaches: string[];
    languages: string[];
    approval_status: string | null;
    photo_path: string | null;
}

interface ServiceRow {
    id: number;
    name: string;
    duration_minutes: number | null;
    price: number | null;
}

const LABELS: Record<string, string> = {
    cbt: 'CBT',
    emdr: 'EMDR',
    psychoanalysis: 'Psychoanalysis',
    arabic: 'Arabic',
    english: 'English',
    french: 'French',
};

export default function PractitionerProfile({
    profile,
    options,
    services,
}: {
    profile: ProfileData;
    options: { approaches: string[]; languages: string[] };
    services: ServiceRow[];
}) {
    const { data, setData, patch, processing, recentlySuccessful, errors } = useForm({
        headline: profile.headline ?? '',
        bio: profile.bio ?? '',
        gender: profile.gender ?? '',
        years_experience: profile.years_experience ?? 0,
        approaches: profile.approaches ?? [],
        languages: profile.languages ?? [],
    });

    const toggle = (field: 'approaches' | 'languages', value: string) =>
        setData(field, data[field].includes(value) ? data[field].filter((v) => v !== value) : [...data[field], value]);

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        patch('/practitioner/profile', { preserveScroll: true });
    };

    return (
        <StaffLayout title="Profile" fitViewport>
            {/* Two columns on desktop instead of one tall stack: the profile form and
            the pricing form are independent, so side by side they fit the screen and
            you can see your whole card at once. Each column scrolls its own fields
            with its Save button pinned below — a save you have to scroll to find is
            a save people miss. */}
            <div className="flex flex-1 flex-col lg:min-h-0">
                <div className="shrink-0">
                    <PageHeader
                        title="Your profile"
                        subtitle="This is what clients see on your specialist card."
                        action={profile.approval_status ? <Badge>{profile.approval_status}</Badge> : undefined}
                    />
                </div>

                <div className="grid gap-6 lg:min-h-0 lg:flex-1 lg:grid-cols-2 lg:items-stretch">
                    <form onSubmit={submit} className={`flex flex-col p-6 md:p-7 lg:min-h-0 ${CARD}`}>
                        <div className="scrollbar-hide space-y-6 lg:min-h-0 lg:flex-1 lg:overflow-y-auto lg:pr-1">
                            <Field label="Headline" error={errors.headline}>
                                <input
                                    type="text"
                                    value={data.headline}
                                    onChange={(e) => setData('headline', e.target.value)}
                                    placeholder="e.g. Calm, attentive psychological support"
                                    className={inputClass}
                                />
                            </Field>

                            <Field label="About you" error={errors.bio}>
                                <textarea value={data.bio} onChange={(e) => setData('bio', e.target.value)} rows={5} className={inputClass} />
                            </Field>

                            <div className="grid gap-6 sm:grid-cols-2">
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
                                        onChange={(e) => setData('years_experience', Number(e.target.value))}
                                        className={inputClass}
                                    />
                                </Field>
                            </div>

                            <Field label="Approaches">
                                <ChipGroup options={options.approaches} selected={data.approaches} onToggle={(v) => toggle('approaches', v)} />
                            </Field>

                            <Field label="Languages">
                                <ChipGroup options={options.languages} selected={data.languages} onToggle={(v) => toggle('languages', v)} />
                            </Field>
                        </div>

                        {/* pinned below the scrolling fields, never out of reach */}
                        <div className="border-ashen-300/25 mt-5 flex shrink-0 items-center gap-3 border-t pt-4">
                            <button
                                type="submit"
                                disabled={processing}
                                className="bg-ashen-700 hover:bg-ashen-800 rounded-full px-6 py-2.5 text-sm font-semibold text-white transition disabled:opacity-60"
                            >
                                Save profile
                            </button>
                            {recentlySuccessful && (
                                <span className="text-ashen-700 inline-flex items-center gap-1 text-sm font-medium">
                                    <Check className="size-4" /> Saved
                                </span>
                            )}
                        </div>
                    </form>

                    <ServicesCard services={services} />
                </div>
            </div>
        </StaffLayout>
    );
}

function ServicesCard({ services }: { services: ServiceRow[] }) {
    const { data, setData, put, processing, recentlySuccessful } = useForm<{ services: { id: number; price: number | string }[] }>({
        services: services.map((s) => ({ id: s.id, price: s.price ?? '' })),
    });

    const setPrice = (id: number, price: string) =>
        setData(
            'services',
            data.services.map((s) => (s.id === id ? { ...s, price } : s)),
        );

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        put('/practitioner/services', { preserveScroll: true });
    };

    return (
        // no top margin on desktop: it sits beside the profile form, not under it
        <form onSubmit={submit} className={`mt-6 flex flex-col p-6 md:p-7 lg:mt-0 lg:min-h-0 ${CARD}`}>
            <div className="shrink-0">
                <h2 className="font-display text-ashen-800 text-lg">Services &amp; pricing</h2>
                <p className="text-ashen-500 mt-1 text-sm">Set your price per session. Leave a price blank to not offer that service.</p>
            </div>

            <div className="scrollbar-hide mt-5 space-y-3 lg:min-h-0 lg:flex-1 lg:overflow-y-auto lg:pr-1">
                {services.map((service) => {
                    const row = data.services.find((s) => s.id === service.id);
                    return (
                        <div key={service.id} className="border-ashen-300/30 bg-ashen-50/50 flex items-center gap-4 rounded-xl border p-3.5">
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

            <div className="border-ashen-300/25 mt-5 flex shrink-0 items-center gap-3 border-t pt-4">
                <button
                    type="submit"
                    disabled={processing}
                    className="bg-ashen-700 hover:bg-ashen-800 rounded-full px-6 py-2.5 text-sm font-semibold text-white transition disabled:opacity-60"
                >
                    Save pricing
                </button>
                {recentlySuccessful && (
                    <span className="text-ashen-700 inline-flex items-center gap-1 text-sm font-medium">
                        <Check className="size-4" /> Saved
                    </span>
                )}
            </div>
        </form>
    );
}

const inputClass =
    'w-full rounded-xl border border-ashen-300/60 bg-ashen-50/80 px-3.5 py-2.5 text-sm text-ashen-800 transition focus:border-ashen-400 focus:bg-ashen-50 focus:outline-none focus:ring-2 focus:ring-ashen-500/20';

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
    return (
        <div>
            <label className="text-ashen-600 mb-1.5 block text-sm font-medium">{label}</label>
            {children}
            {error && <p className="text-ashen-500 mt-1 text-xs">{error}</p>}
        </div>
    );
}

function ChipGroup({ options, selected, onToggle }: { options: string[]; selected: string[]; onToggle: (v: string) => void }) {
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
                            active ? 'border-ashen-600 bg-ashen-600 text-white' : 'border-ashen-200 bg-ashen-50 text-ashen-700 hover:bg-ashen-100'
                        }`}
                    >
                        {LABELS[opt] ?? opt}
                    </button>
                );
            })}
        </div>
    );
}
