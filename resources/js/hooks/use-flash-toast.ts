import { router } from '@inertiajs/react';
import { useEffect } from 'react';
import { toast } from 'sonner';

type Flash = { success?: string | null; error?: string | null };

export function useFlashToast(): void {
    useEffect(() => {
        return router.on('success', (event) => {
            const flash = (event.detail.page.props as { flash?: Flash }).flash;

            if (flash?.success) {
                toast.success(flash.success);
            }
            if (flash?.error) {
                toast.error(flash.error);
            }
        });
    }, []);
}