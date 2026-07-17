import { Head } from '@inertiajs/react';
import { MailCheck } from 'lucide-react';
import { motion } from 'motion/react';
import { ReactNode } from 'react';

import TextLink from '@/components/text-link';
import AuthSplitLayout from '@/layouts/auth/auth-split-layout';

function RegistrationPending({ email }: { email: string }) {
    return (
        <>
            <Head title="Check your email" />

            <div className="flex flex-col items-center gap-6 text-center">
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                    className="bg-ashen-100 text-ashen-700 flex size-16 items-center justify-center rounded-full"
                >
                    <MailCheck className="size-8" />
                </motion.div>

                <div className="grid gap-2">
                    <h2 className="text-ashen-800 text-xl font-semibold">Check your inbox</h2>
                    <p className="text-ashen-500 text-sm leading-relaxed">
                        We’ve sent a confirmation link to <span className="text-ashen-700 font-medium">{email}</span>. Click it to finish creating
                        your account — it’s how we keep your space secure.
                    </p>
                </div>

                <div className="border-ashen-200/70 bg-ashen-50/60 text-ashen-500 w-full rounded-2xl border p-4 text-xs leading-relaxed">
                    Didn’t get it after a minute? You can{' '}
                    <TextLink href={route('register')} className="text-ashen-700 font-medium">
                        try signing up again
                    </TextLink>
                    . The link expires in an hour.
                </div>

                <div className="text-ashen-500 text-sm">
                    Already confirmed?{' '}
                    <TextLink href={route('login')} className="text-ashen-700 font-medium">
                        Log in
                    </TextLink>
                </div>
            </div>
        </>
    );
}

RegistrationPending.layout = (page: ReactNode) => (
    <AuthSplitLayout
        title="Almost there"
        description="One quick confirmation and your safe space is ready."
        photoSide="right"
        quote="Every journey inward begins with one gentle step."
        quoteFooter="You've just taken yours."
    >
        {page}
    </AuthSplitLayout>
);

export default RegistrationPending;
