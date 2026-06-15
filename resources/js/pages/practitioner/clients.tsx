import { PageHeader, Table, Td } from '@/components/staff/kit';
import StaffLayout from '@/layouts/staff-layout';

interface Client {
    id: number;
    name: string;
    email: string;
    sessions: number;
    completed: number;
    next_at: string | null;
    last_at: string | null;
}

export default function PractitionerClients({ clients }: { clients: Client[] }) {
    return (
        <StaffLayout title="Clients">
            <PageHeader title="Your clients" subtitle="Everyone you've supported, and when you'll see them next." />

            <Table
                head={['Client', 'Sessions', 'Completed', 'Next session', 'Last seen']}
                empty={clients.length === 0 ? 'No clients yet.' : undefined}
            >
                {clients.map((c) => (
                    <tr key={c.id}>
                        <Td>
                            <p className="text-ashen-800 font-medium">{c.name}</p>
                            <p className="text-ashen-400 text-xs">{c.email}</p>
                        </Td>
                        <Td>{c.sessions}</Td>
                        <Td className="text-ashen-500">{c.completed}</Td>
                        <Td className={c.next_at ? 'text-sage-700 font-medium' : 'text-ashen-400'}>{c.next_at ?? '—'}</Td>
                        <Td className="text-ashen-500">{c.last_at ?? '—'}</Td>
                    </tr>
                ))}
            </Table>
        </StaffLayout>
    );
}
