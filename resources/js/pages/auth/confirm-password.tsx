// Components
import { Head, useForm } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { FormEventHandler } from 'react';

import InputError from '@/components/input-error';
import { Label } from '@/components/ui/label';
import { PasswordInput } from '@/components/ui/password-input';
import AuthLayout from '@/layouts/auth-layout';

export default function ConfirmPassword() {
    const { data, setData, post, processing, errors, reset } = useForm({
        password: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(route('password.confirm'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <AuthLayout
            title="Confirm your password"
            description="This is a secure area of the application. Please confirm your password before continuing."
        >
            <Head title="Confirm password" />

            <form onSubmit={submit}>
                <div className="space-y-6">
                    <div className="grid gap-2">
                        <Label htmlFor="password">Password</Label>
                        <PasswordInput
                            id="password"
                            name="password"
                            placeholder="Password"
                            autoComplete="current-password"
                            value={data.password}
                            autoFocus
                            onChange={(e) => setData('password', e.target.value)}
                        />

                        <InputError message={errors.password} />
                    </div>

                    <div className="flex items-center">
                        <motion.button
                            type="submit"
                            disabled={processing}
                            whileHover={{ scale: processing ? 1 : 1.01 }}
                            whileTap={{ scale: processing ? 1 : 0.98 }}
                            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                            className="bg-ashen-700 hover:bg-ashen-800 flex w-full items-center justify-center gap-2 rounded-full py-3 text-sm font-medium text-white shadow-[0_12px_30px_-12px_rgba(73,74,69,0.8)] transition-colors disabled:cursor-not-allowed disabled:opacity-70"
                        >
                            {processing && <LoaderCircle className="h-4 w-4 animate-spin" />}
                            Confirm password
                        </motion.button>
                    </div>
                </div>
            </form>
        </AuthLayout>
    );
}
