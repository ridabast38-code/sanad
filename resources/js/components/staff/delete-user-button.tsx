import { router } from '@inertiajs/react';
import { AlertTriangle } from 'lucide-react';
import { useState } from 'react';

/**
 * Admin "Delete" for a user, with a hard confirmation step. Deleting cascades at
 * the database level to everything attached — profile, availability, and every
 * booking, transaction and session note the user is on. Irreversible, so the
 * modal spells that out and points to Suspend for anyone whose history matters.
 */
export function DeleteUserButton({ id, name }: { id: number; name: string }) {
    const [open, setOpen] = useState(false);
    const [deleting, setDeleting] = useState(false);

    const confirmDelete = () => {
        setDeleting(true);
        router.delete(`/admin/users/${id}`, {
            preserveScroll: true,
            onFinish: () => {
                setDeleting(false);
                setOpen(false);
            },
        });
    };

    return (
        <>
            <button
                type="button"
                onClick={() => setOpen(true)}
                className="rounded-full border border-red-300 px-3.5 py-1.5 text-xs font-medium text-red-600 transition hover:bg-red-50"
            >
                Delete
            </button>

            {open && (
                <div
                    className="bg-ashen-950/60 fixed inset-0 z-[80] flex items-center justify-center p-4 backdrop-blur-sm"
                    onClick={() => !deleting && setOpen(false)}
                >
                    <div onClick={(e) => e.stopPropagation()} className="bg-ashen-50 w-full max-w-md rounded-2xl p-6 shadow-2xl">
                        <div className="flex items-start gap-3">
                            <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-600">
                                <AlertTriangle className="size-5" />
                            </span>
                            <div>
                                <h3 className="font-display text-ashen-900 text-lg">Delete {name}?</h3>
                                <p className="text-ashen-600 mt-1 text-sm leading-relaxed">
                                    This permanently deletes {name} and <strong>everything attached to them</strong> — their profile, availability,
                                    and every booking, transaction and session note they're on. It cannot be undone.
                                </p>
                                <p className="text-ashen-500 mt-2 text-xs">
                                    Want to keep their history? Close this and use <strong>Suspend</strong> instead.
                                </p>
                            </div>
                        </div>

                        <div className="mt-6 flex items-center justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => setOpen(false)}
                                disabled={deleting}
                                className="text-ashen-600 hover:text-ashen-900 rounded-full px-4 py-2 text-sm font-medium transition disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={confirmDelete}
                                disabled={deleting}
                                className="rounded-full bg-red-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-60"
                            >
                                {deleting ? 'Deleting…' : 'Delete permanently'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
