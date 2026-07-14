import { useForm } from '@inertiajs/react';
import { useEffect, useState, type FormEvent, type ReactNode } from 'react';
import PrescricaoController from '@/actions/App/Http/Controllers/PrescricaoController';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CampoDioptria, CampoNumero } from './campo-dioptria';


type Tipo = 'oculos' | 'lente_contato';
type Olho = 'OD' | 'OE';

type MedidaData = {
    olho: Olho;
    esferico: string;
    cilindrico: string;
    eixo: string;
    av: string;
    prisma: string;
    dnp: string;
};

type PrescricaoData = {
    tipo: Tipo;
    tipo_visao: string; // 'longe' | 'longe_perto' | ''
    adicao: string;
    lente: string;
    retorno_em: string;
    observacoes: string;
    medidas: MedidaData[];
};


function medidaVazia(olho: Olho): MedidaData {
    return { olho, esferico: '', cilindrico: '', eixo: '', av: '', prisma: '', dnp: '' };
}

const INICIAL: PrescricaoData = {
    tipo: 'oculos',
    tipo_visao: 'longe',
    adicao: '',
    lente: '',
    retorno_em: '',
    observacoes: '',
    medidas: [medidaVazia('OD'), medidaVazia('OE')],
};

type MedidaSalva = {
    olho: Olho;
    esferico: string | null;
    cilindrico: string | null;
    eixo: number | null;
    av: string | null;
    prisma: string | null;
    dnp: string | null;
};

export type PrescricaoRepetir = {
    tipo: Tipo;
    tipo_visao: string | null;
    adicao: string | null;
    lente: string | null;
    observacoes: string | null;
    medidas: MedidaSalva[];
};

const str = (v: string | number | null | undefined): string =>
    v === null || v === undefined ? '' : String(v);


/** Converte uma prescrição salva nos dados editáveis do formulário.
 *  retorno_em fica em branco de propósito — é uma receita nova. */
function paraFormulario(p: PrescricaoRepetir): PrescricaoData {
    const medidaDe = (olho: Olho): MedidaData => {
        const m = p.medidas.find((x) => x.olho === olho);
        return {
            olho,
            esferico: str(m?.esferico),
            cilindrico: str(m?.cilindrico),
            eixo: str(m?.eixo),
            av: str(m?.av),
            prisma: str(m?.prisma),
            dnp: str(m?.dnp),
        };
    };

    return {
        tipo: p.tipo,
        tipo_visao: str(p.tipo_visao),
        adicao: str(p.adicao),
        lente: str(p.lente),
        retorno_em: '',
        observacoes: str(p.observacoes),
        medidas: [medidaDe('OD'), medidaDe('OE')],
    };
}

/** Botão de segmento (toggle) reutilizável. */
function Segmento({
    ativo,
    onClick,
    children,
}: {
    ativo: boolean;
    onClick: () => void;
    children: ReactNode;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={[
                'rounded-md px-3 py-1.5 text-sm transition-colors',
                ativo
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-muted',
            ].join(' ')}
        >
            {children}
        </button>
    );
}

export function PrescricaoForm({consultaId, preencherCom}: {consultaId: number; preencherCom?: { dados: PrescricaoRepetir; nonce: number } | null;}) {
    const [aberto, setAberto] = useState(false);
    const form = useForm(INICIAL);
    const err = form.errors as Record<string, string>;
    const isOculos = form.data.tipo === 'oculos';

    // Quando o pai pede pra repetir uma receita, preenche e abre.
    // O `nonce` garante que repetir a MESMA receita duas vezes reative o efeito.
    useEffect(() => {
        if (preencherCom) {
            form.setData(paraFormulario(preencherCom.dados));
            form.clearErrors();
            setAberto(true);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [preencherCom?.nonce]);

    function setMedida(i: number, campo: keyof MedidaData, valor: string) {
        form.setData(
            'medidas',
            form.data.medidas.map((m, idx) =>
                idx === i ? { ...m, [campo]: valor } : m,
            ) as MedidaData[],
        );
    }

    function trocarTipo(tipo: Tipo) {
        if (tipo === form.data.tipo) {
            return;
        }
        if (tipo === 'lente_contato') {
            form.setData('tipo', tipo);
            form.setData('tipo_visao', '');
            form.setData('adicao', '');
            form.setData(
                'medidas',
                form.data.medidas.map((m) => ({ ...m, prisma: '', dnp: '' })),
            );
        } else {
            form.setData('tipo', tipo);
            form.setData('tipo_visao', form.data.tipo_visao || 'longe');
        }
    }

    function salvar(e: FormEvent) {
        e.preventDefault();
        form.post(PrescricaoController.store.url(consultaId), {
            preserveScroll: true,
            onSuccess: () => {
                form.reset();
                setAberto(false);
            },
        });
    }

    function cancelar() {
        form.reset();
        form.clearErrors();
        setAberto(false);
    }

    if (!aberto) {
        return (
            <button
                type="button"
                onClick={() => setAberto(true)}
                className="rounded-xl border border-dashed p-4 text-center text-sm text-muted-foreground transition-colors hover:bg-muted/50"
            >
                + Adicionar receita
            </button>
        );
    }

    return (
        <form
            onSubmit={salvar}
            className="grid gap-5 rounded-xl border border-sidebar-border/70 p-4 dark:border-sidebar-border"
        >
            {/* Tipo */}
            <div className="grid gap-1.5">
                <Label>Tipo de receita <span className="text-destructive">*</span></Label>
                <div className="inline-flex w-fit gap-1 rounded-lg border border-input p-1">
                    <Segmento ativo={isOculos} onClick={() => trocarTipo('oculos')}>
                        Óculos
                    </Segmento>
                    <Segmento
                        ativo={!isOculos}
                        onClick={() => trocarTipo('lente_contato')}
                    >
                        Lente de contato
                    </Segmento>
                </div>
                <InputError message={err.tipo} />
            </div>

            {/* Visão + adição (só óculos) */}
            {isOculos && (
                <div className="grid gap-4 sm:grid-cols-2">
                    <div className="grid gap-1.5">
                        <Label>Tipo de visão <span className="text-destructive">*</span></Label>
                        <div className="inline-flex w-fit gap-1 rounded-lg border border-input p-1">
                            <Segmento
                                ativo={form.data.tipo_visao === 'longe'}
                                onClick={() => form.setData('tipo_visao', 'longe')}
                            >
                                Longe
                            </Segmento>
                            <Segmento
                                ativo={form.data.tipo_visao === 'longe_perto'}
                                onClick={() => form.setData('tipo_visao', 'longe_perto')}
                            >
                                Longe e perto
                            </Segmento>
                        </div>
                        <InputError message={err.tipo_visao} />
                    </div>

                    <div className="grid gap-1.5">
                        <Label htmlFor="adicao">Adição</Label>
                        <CampoDioptria
                            id="adicao"
                            sinal="toggle"
                            value={form.data.adicao}
                            onChange={(v) => form.setData('adicao', v)}
                        />
                        <InputError message={err.adicao} />
                    </div>
                </div>
            )}

            {/* Grade OD/OE */}
            <div className="grid gap-3">
                <Label>Medidas</Label>
                {form.data.medidas.map((medida, i) => (
                    <div
                        key={medida.olho}
                        className="grid gap-3 rounded-lg border border-sidebar-border/70 p-3 dark:border-sidebar-border"
                    >
                        <span className="text-sm font-medium">
                            {medida.olho === 'OD' ? 'OD (olho direito)' : 'OE (olho esquerdo)'}
                        </span>
                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                            <div className="grid gap-1.5">
                                <Label htmlFor={`esf-${i}`} className="text-xs">
                                    Esférico
                                </Label>
                                <CampoDioptria
                                    id={`esf-${i}`}
                                    sinal="toggle"
                                    value={medida.esferico}
                                    onChange={(v) => setMedida(i, 'esferico', v)}
                                />
                                <InputError message={err[`medidas.${i}.esferico`]} />
                            </div>
                            <div className="grid gap-1.5">
                                <Label htmlFor={`cil-${i}`} className="text-xs">
                                    Cilíndrico
                                </Label>
                                <CampoDioptria
                                    id={`cil-${i}`}
                                    sinal="negativo"
                                    value={medida.cilindrico}
                                    onChange={(v) => setMedida(i, 'cilindrico', v)}
                                />
                                <InputError message={err[`medidas.${i}.cilindrico`]} />
                            </div>
                            <div className="grid gap-1.5">
                                <Label htmlFor={`eixo-${i}`} className="text-xs">
                                    Eixo
                                </Label>
                                <CampoNumero
                                    id={`eixo-${i}`}
                                    value={medida.eixo}
                                    onChange={(v) => setMedida(i, 'eixo', v)}
                                />
                                <InputError message={err[`medidas.${i}.eixo`]} />
                            </div>
                            <div className="grid gap-1.5">
                                <Label htmlFor={`av-${i}`} className="text-xs">
                                    AV
                                </Label>
                                <Input
                                    id={`av-${i}`}
                                    value={medida.av}
                                    onChange={(e) => setMedida(i, 'av', e.target.value)}
                                    autoComplete="off"
                                />
                                <InputError message={err[`medidas.${i}.av`]} />
                            </div>

                            {isOculos && (
                                <div className="grid gap-1.5">
                                    <Label htmlFor={`prisma-${i}`} className="text-xs">
                                        Prisma
                                    </Label>
                                    <Input
                                        id={`prisma-${i}`}
                                        value={medida.prisma}
                                        onChange={(e) => setMedida(i, 'prisma', e.target.value)}
                                        autoComplete="off"
                                    />
                                    <InputError message={err[`medidas.${i}.prisma`]} />
                                </div>
                            )}
                            {isOculos && (
                                <div className="grid gap-1.5">
                                    <Label htmlFor={`dnp-${i}`} className="text-xs">
                                        DNP
                                    </Label>
                                    <CampoNumero
                                        id={`dnp-${i}`}
                                        decimal
                                        value={medida.dnp}
                                        onChange={(v) => setMedida(i, 'dnp', v)}
                                    />
                                    <InputError message={err[`medidas.${i}.dnp`]} />
                                </div>
                            )}
                        </div>
                    </div>
                ))}
                <InputError message={err.medidas} />
            </div>

            {/* Comuns */}
            <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-1.5">
                    <Label htmlFor="lente">Lente</Label>
                    <Input
                        id="lente"
                        value={form.data.lente}
                        onChange={(e) => form.setData('lente', e.target.value)}
                        placeholder={isOculos ? 'Ex.: antirreflexo, multifocal' : 'Ex.: gelatinosa, tórica'}
                        autoComplete="off"
                    />
                    <InputError message={err.lente} />
                </div>
                <div className="grid gap-1.5">
                    <Label htmlFor="retorno_em">Retorno em</Label>
                    <Input
                        id="retorno_em"
                        type="date"
                        value={form.data.retorno_em}
                        onChange={(e) => form.setData('retorno_em', e.target.value)}
                    />
                    <InputError message={err.retorno_em} />
                </div>
                <div className="grid gap-1.5 sm:col-span-2">
                    <Label htmlFor="observacoes">Observações</Label>
                    <textarea
                        id="observacoes"
                        value={form.data.observacoes}
                        onChange={(e) => form.setData('observacoes', e.target.value)}
                        rows={3}
                        className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                    <InputError message={err.observacoes} />
                </div>
            </div>

            <div className="flex items-center gap-3">
                <Button type="submit" disabled={form.processing}>
                    Salvar receita
                </Button>
                <Button type="button" variant="secondary" onClick={cancelar}>
                    Cancelar
                </Button>
            </div>
        </form>
    );
}