import { money, PageHeader, Table, Td } from '@/components/staff/kit';
import StaffLayout from '@/layouts/staff-layout';

interface Client {
    id: number;
    name: string;
    email: string;
    sessions: number;
    spent: number;
    joined: string | null;
}

export default function AdminClients({ clients }: { clients: Client[] }) {
    return (
        <StaffLayout title="Clients">
            <PageHeader title="Clients" subtitle="Everyone using Sanad to find support." />

            <Table head={['Client', 'Sessions', 'Spent', 'Joined']} empty={clients.length === 0 ? 'No clients yet.' : undefined}>
                {clients.map((c) => (
                    <tr key={c.id}>
                        <Td>
                            <p className="text-ashen-800 font-medium">{c.name}</p>
                            <p className="text-ashen-400 text-xs">{c.email}</p>
                        </Td>
                        <Td>{c.sessions}</Td>
                        <Td className="text-ashen-700 font-medium">{money(c.spent)}</Td>
                        <Td className="text-ashen-500">{c.joined ?? '—'}</Td>
                    </tr>
                ))}
            </Table>
        </StaffLayout>
    );
}
