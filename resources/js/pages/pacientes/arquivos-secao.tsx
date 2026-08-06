import { router, useForm } from '@inertiajs/react';
import { useRef, type ChangeEvent } from 'react';
import { Download, FileText, Image as ImageIcon, Trash2, Upload } from 'lucide-react';
import PacienteArquivoController from '@/actions/App/Http/Controllers/PacienteArquivoController';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { useConfirm } from '@/hooks/use-confirm';

export interface Arquivo {
    id: number;
    nome_original: string;
    mime: string;
    tamanho: number;
}

function formatarTamanho(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function ArquivosSecao({ pacienteId, arquivos }: { pacienteId: number; arquivos: Arquivo[] }) {
    const inputRef = useRef<HTMLInputElement>(null);
    const confirm = useConfirm();
    const form = useForm<{ arquivo: File | null }>({ arquivo: null });

    function aoEscolher(e: ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;

        form.setData('arquivo', file);
        form.post(PacienteArquivoController.store.url(pacienteId), {
            preserveScroll: true,
            forceFormData: true,
            onFinish: () => {
                form.reset();
                if (inputRef.current) inputRef.current.value = '';
            },
        });
    }

    async function remover(arquivo: Arquivo) {
        const ok = await confirm({
            title: 'Remover arquivo?',
            description: `"${arquivo.nome_original}" deixará de aparecer aqui.`,
            confirmText: 'Remover',
            destructive: true,
        });

        if (!ok) return;

        router.delete(PacienteArquivoController.destroy.url(arquivo.id), { preserveScroll: true });
    }

    return (
        <section className="grid gap-3">
            <div className="flex items-center justify-between gap-2">
                <h2 className="text-sm font-medium text-muted-foreground">Arquivos</h2>
                <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => inputRef.current?.click()}
                    disabled={form.processing}
                >
                    <Upload className="size-4" />
                    {form.processing ? 'Enviando…' : 'Enviar'}
                </Button>
            </div>

            <input
                ref={inputRef}
                type="file"
                accept="application/pdf,image/*"
                className="hidden"
                onChange={aoEscolher}
            />

            <InputError message={form.errors.arquivo} />

            {arquivos.length === 0 ? (
                <p className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">
                    Nenhum arquivo. Use “Enviar” para anexar um PDF ou imagem.
                </p>
            ) : (
                <div className="flex flex-col gap-2">
                    {arquivos.map((arquivo) => (
                        <div
                            key={arquivo.id}
                            className="flex items-center gap-3 rounded-xl border border-sidebar-border/70 p-3 dark:border-sidebar-border"
                        >
                            <span className="text-muted-foreground">
                                {arquivo.mime === 'application/pdf' ? (
                                    <FileText className="size-5" />
                                ) : (
                                    <ImageIcon className="size-5" />
                                )}
                            </span>
                            <div className="grid min-w-0 flex-1 gap-0.5">
                                <span className="truncate text-sm">{arquivo.nome_original}</span>
                                <span className="text-xs text-muted-foreground">
                                    {formatarTamanho(arquivo.tamanho)}
                                </span>
                            </div>
                            <Button size="sm" variant="ghost" asChild>
                                <a
                                    href={PacienteArquivoController.download.url(arquivo.id)}
                                    aria-label={`Baixar ${arquivo.nome_original}`}
                                >
                                    <Download className="size-4" />
                                </a>
                            </Button>
                            <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => remover(arquivo)}
                                aria-label={`Remover ${arquivo.nome_original}`}
                            >
                                <Trash2 className="size-4" />
                            </Button>
                        </div>
                    ))}
                </div>
            )}
        </section>
    );
}