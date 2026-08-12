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

type RegisterForm = {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
};

// calm, glowy field style — explicit light colors so text/icons never disappear on the page split
const fieldClass =
    'h-11 rounded-xl border-ashen-300 bg-ashen-50/70 text-ashen-800 placeholder:text-ashen-400 transition-shadow focus-visible:border-ashen-400 focus-visible:ring-2 focus-visible:ring-ashen-500/25 focus-visible:ring-offset-0 focus-visible:shadow-[0_0_0_4px_rgba(146,147,141,0.12)]';

function Register({ googleEnabled }: { googleEnabled?: boolean }) {
    const { data, setData, post, processing, errors, reset } = useForm<RegisterForm>({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('register'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <>
            <Head title="Register" />
            <form className="flex flex-col gap-6" onSubmit={submit}>
                <div className="grid gap-6">
                    <div className="grid gap-2">
                        <Label htmlFor="name">Name</Label>
                        <Input
                            id="name"
                            type="text"
                            required
                            autoFocus
                            tabIndex={1}
                            autoComplete="name"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            disabled={processing}
                            placeholder="Full name"
                            className={fieldClass}
                        />
                        <InputError message={errors.name} className="mt-2" />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="email">Email address</Label>
                        <Input
                            id="email"
                            type="email"
                            required
                            tabIndex={2}
                            autoComplete="email"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            disabled={processing}
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
                            tabIndex={3}
                            autoComplete="new-password"
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            disabled={processing}
                            placeholder="Password"
                            className={fieldClass}
                        />
                        <InputError message={errors.password} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="password_confirmation">Confirm password</Label>
                        <PasswordInput
                            id="password_confirmation"
                            required
                            tabIndex={4}
                            autoComplete="new-password"
                            value={data.password_confirmation}
                            onChange={(e) => setData('password_confirmation', e.target.value)}
                            disabled={processing}
                            placeholder="Confirm password"
                            className={fieldClass}
                        />
                        <InputError message={errors.password_confirmation} />
                    </div>

                    <motion.button
                        type="submit"
                        tabIndex={5}
                        disabled={processing}
                        whileHover={{ scale: processing ? 1 : 1.01 }}
                        whileTap={{ scale: processing ? 1 : 0.98 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                        className="bg-ashen-700 hover:bg-ashen-800 mt-2 flex w-full items-center justify-center gap-2 rounded-full py-3 text-sm font-medium text-white shadow-[0_12px_30px_-12px_rgba(73,74,69,0.8)] transition-colors disabled:cursor-not-allowed disabled:opacity-70"
                    >
                        {processing && <LoaderCircle className="h-4 w-4 animate-spin" />}
                        Create account
                    </motion.button>
                </div>

                {googleEnabled && <GoogleAuthButton label="Sign up with Google" />}

                <div className="text-ashen-500 text-center text-sm">
                    Already have an account?{' '}
                    <TextLink href={route('login')} className="text-ashen-700 font-medium" tabIndex={6}>
                        Log in
                    </TextLink>
                </div>
            </form>
        </>
    );
}

Register.layout = (page: ReactNode) => (
    <AuthSplitLayout
        title="Begin your journey"
        description="Welcome to OurSanad — let's create your safe space together."
        photoSide="right"
        quote="Every journey inward begins with one gentle step."
        quoteFooter="You've just taken yours."
    >
        {page}
    </AuthSplitLayout>
);

export default Register;
