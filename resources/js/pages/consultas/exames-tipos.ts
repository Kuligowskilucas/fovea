export type OlhoGrade = { esferico: string; cilindrico: string; eixo: string };
export type OlhoRxGrade = { esferico: string; cilindrico: string; eixo: string; av: string };
export type OlhoRetino = { valor: string; av: string };
export type AVLinha = { vl: string; vp: string; ph: string };

export type Ceratometria = {
    od: string;
    oe: string;
    miras: string;
    observacoes: string;
};

export type Autorrefracao = {
    od: OlhoGrade;
    oe: OlhoGrade;
    observacoes: string;
};

export type AcuidadeVisual = {
    optotipo: string;
    sem_correcao: { od: AVLinha; oe: AVLinha; ao: AVLinha };
    com_correcao: { od: AVLinha; oe: AVLinha; ao: AVLinha };
    observacoes: string;
};

export type Retinoscopia = {
    od: OlhoRetino;
    oe: OlhoRetino;
    observacoes: string;
};

export type RxFinal = {
    od: OlhoRxGrade;
    oe: OlhoRxGrade;
    adicao: string;
    av_perto: string;
    tipo_lente: string;
    tratamento: string;
    observacoes: string;
};

export type DadosExame = {
    acuidade_visual: AcuidadeVisual;
    autorrefracao: Autorrefracao;
    ceratometria: Ceratometria;
    retinoscopia_dinamica: Retinoscopia;
    retinoscopia_estatica: Retinoscopia;
    rx_final: RxFinal;
};

const avLinha = (): AVLinha => ({ vl: '', vp: '', ph: '' });
const olhoGrade = (): OlhoGrade => ({ esferico: '', cilindrico: '', eixo: '' });
const olhoRxGrade = (): OlhoRxGrade => ({ esferico: '', cilindrico: '', eixo: '', av: '' });
const olhoRetino = (): OlhoRetino => ({ valor: '', av: '' });

/** Estrutura padrão (vazia) — sempre um objeto novo, seguro para reset. */
export function criarDadosPadrao(): DadosExame {
    return {
        acuidade_visual: {
            optotipo: '',
            sem_correcao: { od: avLinha(), oe: avLinha(), ao: avLinha() },
            com_correcao: { od: avLinha(), oe: avLinha(), ao: avLinha() },
            observacoes: '',
        },
        autorrefracao: {
            od: olhoGrade(),
            oe: olhoGrade(),
            observacoes: '',
        },
        ceratometria: { od: '', oe: '', miras: '', observacoes: '' },
        retinoscopia_dinamica: {
            od: olhoRetino(),
            oe: olhoRetino(),
            observacoes: '',
        },
        retinoscopia_estatica: {
            od: olhoRetino(),
            oe: olhoRetino(),
            observacoes: '',
        },
        rx_final: {
            od: olhoRxGrade(),
            oe: olhoRxGrade(),
            adicao: '',
            av_perto: '',
            tipo_lente: '',
            tratamento: '',
            observacoes: '',
        },
    };
}

function ehObjeto(v: unknown): v is Record<string, unknown> {
    return typeof v === 'object' && v !== null && !Array.isArray(v);
}

/**
 * Reidrata os dados salvos sobre a estrutura padrão. Trata `null` (gerado pelo
 * ConvertEmptyStringsToNull) e chaves ausentes, garantindo que todo campo folha
 * seja sempre uma string — inputs controlados não aceitam null/undefined.
 */
export function mergeDados<T>(padrao: T, salvo: unknown): T {
    if (!ehObjeto(padrao)) {
        return (salvo ?? padrao) as T;
    }
    const salvoObj = ehObjeto(salvo) ? salvo : {};
    const resultado: Record<string, unknown> = {};
    for (const chave of Object.keys(padrao)) {
        resultado[chave] = mergeDados(
            (padrao as Record<string, unknown>)[chave],
            salvoObj[chave],
        );
    }
    return resultado as T;
}