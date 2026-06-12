import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { motion } from 'motion/react';
import { Eye, EyeOff } from 'lucide-react';
import * as React from 'react';

/**
 * A password field with a calm show/hide toggle.
 * When hidden, the browser shows dots; toggling reveals the text.
 */
const PasswordInput = React.forwardRef<HTMLInputElement, React.ComponentProps<'input'>>(({ className, ...props }, ref) => {
    const [visible, setVisible] = React.useState(false);

    return (
        <div className="relative">
            <Input ref={ref} type={visible ? 'text' : 'password'} className={cn('pr-10', className)} {...props} />
            <motion.button
                type="button"
                tabIndex={-1}
                onClick={() => setVisible((v) => !v)}
                whileTap={{ scale: 0.85 }}
                transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                aria-label={visible ? 'Hide password' : 'Show password'}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-ashen-500 transition-colors hover:text-sage-700"
            >
                {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </motion.button>
        </div>
    );
});

PasswordInput.displayName = 'PasswordInput';

export { PasswordInput };
