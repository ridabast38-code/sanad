import { ClientInfoButton, type ClientDetail } from '@/components/staff/client-info-button';
import { DeleteUserButton } from '@/components/staff/delete-user-button';
import { CARD, money, PageHeader, Table, Td } from '@/components/staff/kit';
import StaffLayout from '@/layouts/staff-layout';

export default function AdminClients({ clients }: { clients: ClientDetail[] }) {
    return (
        <StaffLayout title="Clients">
            <PageHeader title="Clients" subtitle="Everyone using OurSanad to find support." />

            {clients.length === 0 ? (
                <div className={`p-8 text-center ${CARD}`}>
                    <p className="text-ashen-400 text-sm">No clients yet.</p>
                </div>
            ) : (
                <>
                    {/* Phone: a stacked card per client, so the Info and Delete actions are
                    always on screen — in a table they sat in a last column pushed off the
                    right edge, out of reach. */}
                    <div className="space-y-3 md:hidden">
                        {clients.map((c) => (
                            <div key={c.id} className={`p-4 ${CARD}`}>
                                <div className="flex items-start justify-between gap-3">
                                    <div className="min-w-0">
                                        <p className="text-ashen-800 font-medium">{c.name}</p>
                                        <p className="text-ashen-400 truncate text-xs">{c.email}</p>
                                    </div>
                                    <p className="text-ashen-700 shrink-0 text-sm font-medium">{money(c.spent)}</p>
                                </div>
                                <div className="text-ashen-500 mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs">
                                    <span>{c.sessions} sessions</span>
                                    <span>Joined {c.joined ?? '—'}</span>
                                </div>
                                <div className="mt-3 flex items-center gap-2">
                                    <ClientInfoButton client={c} />
                                    <DeleteUserButton id={c.id} name={c.name} />
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Desktop: the dense table. */}
                    <div className="hidden md:block">
                        <Table head={['Client', 'Sessions', 'Spent', 'Joined', 'Actions']}>
                            {clients.map((c) => (
                                <tr key={c.id}>
                                    <Td>
                                        <p className="text-ashen-800 font-medium">{c.name}</p>
                                        <p className="text-ashen-400 text-xs">{c.email}</p>
                                    </Td>
                                    <Td>{c.sessions}</Td>
                                    <Td className="text-ashen-700 font-medium">{money(c.spent)}</Td>
                                    <Td className="text-ashen-500">{c.joined ?? '—'}</Td>
                                    <Td>
                                        <div className="flex items-center gap-2">
                                            <ClientInfoButton client={c} />
                                            <DeleteUserButton id={c.id} name={c.name} />
                                        </div>
                                    </Td>
                                </tr>
                            ))}
                        </Table>
                    </div>
                </>
            )}
        </StaffLayout>
    );
}
