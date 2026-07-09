import { useForm } from '@inertiajs/react';
import { useState, type FormEvent, type ReactNode } from 'react';
import ExameController from '@/actions/App/Http/Controllers/ExameController';
import { Button } from '@/components/ui/button';
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { BlocoAcuidadeVisual } from './bloco-acuidade-visual';
import { BlocoAutorrefracao } from './bloco-autorrefracao';
import { BlocoCeratometria } from './bloco-ceratometria';
import { BlocoRetinoscopia } from './bloco-retinoscopia';
import { BlocoRxFinal } from './bloco-rx-final';
import { criarDadosPadrao, mergeDados, type DadosExame } from './exames-tipos';

/** Um item do acordeão; começa fechado. */
function AcordeaoBloco({ titulo, children }: { titulo: string; children: ReactNode }) {
    const [aberto, setAberto] = useState(false);

    return (
        <Collapsible
            open={aberto}
            onOpenChange={setAberto}
            className="rounded-xl border border-sidebar-border/70 dark:border-sidebar-border"
        >
            <CollapsibleTrigger className="flex w-full items-center justify-between p-4 text-sm font-medium">
                {titulo}
                <span className="text-muted-foreground">{aberto ? '−' : '+'}</span>
            </CollapsibleTrigger>
            <CollapsibleContent className="border-t border-sidebar-border/70 p-4 dark:border-sidebar-border">
                {children}
            </CollapsibleContent>
        </Collapsible>
    );
}

export function ExamesForm({
    consultaId,
    exame,
}: {
    consultaId: number;
    exame: { dados: unknown } | null;
}) {
    const form = useForm({
        dados: mergeDados(criarDadosPadrao(), exame?.dados ?? null),
    });

    function setBloco<K extends keyof DadosExame>(chave: K, valor: DadosExame[K]) {
        form.setData('dados', { ...form.data.dados, [chave]: valor });
    }

    function salvar(e: FormEvent) {
        e.preventDefault();
        form.post(ExameController.salvar.url(consultaId), { preserveScroll: true });
    }

    return (
        <form onSubmit={salvar} className="grid gap-3">
            <AcordeaoBloco titulo="Acuidade Visual">
                <BlocoAcuidadeVisual
                    value={form.data.dados.acuidade_visual}
                    onChange={(v) => setBloco('acuidade_visual', v)}
                />
            </AcordeaoBloco>

            <AcordeaoBloco titulo="Autorrefração">
                <BlocoAutorrefracao
                    value={form.data.dados.autorrefracao}
                    onChange={(v) => setBloco('autorrefracao', v)}
                />
            </AcordeaoBloco>

            <AcordeaoBloco titulo="Ceratometria">
                <BlocoCeratometria
                    value={form.data.dados.ceratometria}
                    onChange={(v) => setBloco('ceratometria', v)}
                />
            </AcordeaoBloco>

            <AcordeaoBloco titulo="Retinoscopia Dinâmica">
                <BlocoRetinoscopia
                    idPrefixo="retino-dinamica"
                    value={form.data.dados.retinoscopia_dinamica}
                    onChange={(v) => setBloco('retinoscopia_dinamica', v)}
                />
            </AcordeaoBloco>

            <AcordeaoBloco titulo="Retinoscopia Estática">
                <BlocoRetinoscopia
                    idPrefixo="retino-estatica"
                    value={form.data.dados.retinoscopia_estatica}
                    onChange={(v) => setBloco('retinoscopia_estatica', v)}
                />
            </AcordeaoBloco>

            <AcordeaoBloco titulo="RX Final">
                <BlocoRxFinal
                    value={form.data.dados.rx_final}
                    onChange={(v) => setBloco('rx_final', v)}
                />
            </AcordeaoBloco>

            <div>
                <Button type="submit" disabled={form.processing}>
                    Salvar exames
                </Button>
            </div>
        </form>
    );
}