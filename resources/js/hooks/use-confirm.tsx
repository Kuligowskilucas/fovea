import {
    createContext,
    useCallback,
    useContext,
    useRef,
    useState,
    type ReactNode,
} from 'react';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { buttonVariants } from '@/components/ui/button';

export type ConfirmOptions = {
    title: string;
    description?: ReactNode;
    confirmText?: string;
    cancelText?: string;
    destructive?: boolean;
};

type ConfirmFn = (options: ConfirmOptions) => Promise<boolean>;

const ConfirmContext = createContext<ConfirmFn | null>(null);

export function ConfirmProvider({ children }: { children: ReactNode }) {
    const [open, setOpen] = useState(false);
    const [options, setOptions] = useState<ConfirmOptions | null>(null);
    const resolveRef = useRef<((value: boolean) => void) | null>(null);

    const confirm = useCallback<ConfirmFn>((opts) => {
        setOptions(opts);
        setOpen(true);
        return new Promise<boolean>((resolve) => {
            resolveRef.current = resolve;
        });
    }, []);

    const settle = useCallback((result: boolean) => {
        resolveRef.current?.(result);
        resolveRef.current = null;
        setOpen(false);
    }, []);

    return (
        <ConfirmContext.Provider value={confirm}>
            {children}

            <AlertDialog
                open={open}
                onOpenChange={(next) => {
                    // fechar por ESC, clique fora ou "Cancelar" resolve como false
                    if (!next) settle(false);
                }}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>{options?.title}</AlertDialogTitle>
                        {options?.description && (
                            <AlertDialogDescription>
                                {options.description}
                            </AlertDialogDescription>
                        )}
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>
                            {options?.cancelText ?? 'Cancelar'}
                        </AlertDialogCancel>
                        <AlertDialogAction
                            className={
                                options?.destructive
                                    ? buttonVariants({ variant: 'destructive' })
                                    : undefined
                            }
                            onClick={() => settle(true)}
                        >
                            {options?.confirmText ?? 'Confirmar'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </ConfirmContext.Provider>
    );
}

export function useConfirm(): ConfirmFn {
    const ctx = useContext(ConfirmContext);
    if (!ctx) {
        throw new Error('useConfirm precisa estar dentro de <ConfirmProvider>.');
    }
    return ctx;
}