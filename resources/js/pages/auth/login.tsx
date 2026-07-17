import { Head, useForm } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { FormEventHandler, ReactNode } from 'react';

import GoogleAuthButton from '@/components/google-auth-button';
import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PasswordInput } from '@/components/ui/password-input';
import AuthSplitLayout from '@/layouts/auth/auth-split-layout';

type LoginForm = {
    email: string;
    password: string;
};

interface LoginProps {
    status?: string;
    canResetPassword: boolean;
    googleEnabled?: boolean;
}

// calm, glowy field style — explicit light colors so text/icons never disappear on the page split
const fieldClass =
    'h-11 rounded-xl border-ashen-300 bg-ashen-50/70 text-ashen-800 placeholder:text-ashen-400 transition-shadow focus-visible:border-ashen-400 focus-visible:ring-2 focus-visible:ring-ashen-500/25 focus-visible:ring-offset-0 focus-visible:shadow-[0_0_0_4px_rgba(146,147,141,0.12)]';

function Login({ status, canResetPassword, googleEnabled }: LoginProps) {
    const { data, setData, post, processing, errors, reset } = useForm<LoginForm>({
        email: '',
        password: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <>
            <Head title="Log in" />

            <form className="flex flex-col gap-6" onSubmit={submit}>
                <div className="grid gap-6">
                    <div className="grid gap-2">
                        <Label htmlFor="email">Email address</Label>
                        <Input
                            id="email"
                            type="email"
                            required
                            autoFocus
                            tabIndex={1}
                            autoComplete="email"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            placeholder="email@example.com"
                            className={fieldClass}
                        />
                        <InputError message={errors.email} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="password">Password</Label>
                        <PasswordInput
                            id="password"
                            required
                            tabIndex={2}
                            autoComplete="current-password"
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            placeholder="Password"
                            className={fieldClass}
                        />
                        <InputError message={errors.password} />
                        {canResetPassword && (
                            <div className="flex justify-end">
                                <TextLink href={route('password.request')} className="text-ashen-700 text-sm" tabIndex={5}>
                                    Forgot password?
                                </TextLink>
                            </div>
                        )}
                    </div>

                    <motion.button
                        type="submit"
                        tabIndex={4}
                        disabled={processing}
                        whileHover={{ scale: processing ? 1 : 1.01 }}
                        whileTap={{ scale: processing ? 1 : 0.98 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                        className="bg-ashen-700 hover:bg-ashen-800 mt-2 flex w-full items-center justify-center gap-2 rounded-full py-3 text-sm font-medium text-white shadow-[0_12px_30px_-12px_rgba(73,74,69,0.8)] transition-colors disabled:cursor-not-allowed disabled:opacity-70"
                    >
                        {processing && <LoaderCircle className="h-4 w-4 animate-spin" />}
                        Log in
                    </motion.button>
                </div>

                {googleEnabled && <GoogleAuthButton label="Continue with Google" />}

                <div className="text-ashen-500 text-center text-sm">
                    Don't have an account?{' '}
                    <TextLink href={route('register')} className="text-ashen-700 font-medium" tabIndex={6}>
                        Sign up
                    </TextLink>
                </div>
            </form>

            {status && <div className="text-ashen-600 mt-4 text-center text-sm font-medium">{status}</div>}
        </>
    );
}

Login.layout = (page: ReactNode) => (
    <AuthSplitLayout
        title="Welcome back"
        description="It's good to see you again. Let's pick up where you left off."
        photoSide="left"
        quote="Coming back is a quiet act of courage."
        quoteFooter="We're glad you're here again."
    >
        {page}
    </AuthSplitLayout>
);

export default Login;
