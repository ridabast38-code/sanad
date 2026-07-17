import { Badge, CARD, money, PageHeader, Section, Table, Td } from '@/components/staff/kit';
import StaffLayout from '@/layouts/staff-layout';
import { router, useForm } from '@inertiajs/react';
import { Plus, UserPlus, X } from 'lucide-react';
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

export default function AdminPractitioners({ practitioners }: { practitioners: Practitioner[] }) {
    const [adding, setAdding] = useState(false);
    const setStatus = (id: number, approval_status: string) =>
        router.patch(`/admin/practitioners/${id}`, { approval_status }, { preserveScroll: true });
    const payAll = (id: number) => router.post(`/admin/practitioners/${id}/payout-all`, {}, { preserveScroll: true });

    return (
        <StaffLayout title="Practitioners">
            <PageHeader
                title="Practitioners"
                subtitle="Approve who appears in the directory — and create login accounts for new specialists or admins."
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
                    <AddAccountForm onDone={() => setAdding(false)} />
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
    'w-full rounded-xl border border-ashen-200 bg-ashen-50/80 px-3.5 py-2.5 text-sm text-ashen-800 transition focus:border-ashen-400 focus:outline-none focus:ring-2 focus:ring-ashen-500/20';

function AddAccountForm({ onDone }: { onDone: () => void }) {
    const { data, setData, post, processing, errors, reset } = useForm<{
        name: string;
        email: string;
        password: string;
        role: string;
        photo: File | null;
    }>({
        name: '',
        email: '',
        password: '',
        role: 'practitioner',
        photo: null,
    });

    const [photoPreview, setPhotoPreview] = useState<string | null>(null);

    const pickPhoto = (file: File | null) => {
        setData('photo', file);
        setPhotoPreview(file ? URL.createObjectURL(file) : null);
    };

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
        <form onSubmit={submit} className={`p-6 ${CARD}`}>
            <div className="mb-5 flex items-center gap-2">
                <span className="bg-ashen-100 text-ashen-700 flex size-9 items-center justify-center rounded-full">
                    <UserPlus className="size-5" />
                </span>
                <h3 className="font-display text-ashen-800 text-lg">New account</h3>
            </div>

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

            {data.role === 'practitioner' && (
                <div className="mt-4">
                    <label className="text-ashen-600 mb-1.5 block text-sm font-medium">Photo</label>
                    <div className="flex items-center gap-4">
                        <div className="bg-ashen-50 border-ashen-200 size-20 shrink-0 overflow-hidden rounded-2xl border">
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
                            <p className="text-ashen-400 mt-1.5 text-xs">Shown in the client specialist directory. JPG, PNG or WebP, up to 4 MB.</p>
                            {errors.photo && <p className="text-ashen-500 mt-1 text-xs">{errors.photo}</p>}
                        </div>
                    </div>
                </div>
            )}

            <div className="mt-5 flex items-center gap-3">
                <button
                    type="submit"
                    disabled={processing}
                    className="bg-ashen-700 hover:bg-ashen-800 rounded-full px-6 py-2.5 text-sm font-semibold text-white transition disabled:opacity-60"
                >
                    Create account
                </button>
                <p className="text-ashen-400 text-xs">They'll sign in at /login with this email & password.</p>
            </div>
        </form>
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
