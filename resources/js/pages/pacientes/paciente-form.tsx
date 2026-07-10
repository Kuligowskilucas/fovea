import { useRef, useState, type ReactNode } from 'react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

export interface Paciente {
    id: number;
    nome_completo: string;
    nome_social: string | null;
    data_nascimento: string | null;
    sexo: string | null;
    cpf: string | null;
    rg: string | null;
    ocupacao: string | null;
    celular_whatsapp: string | null;
    telefone_2: string | null;
    email: string | null;
    origem: string | null;
    responsavel_nome: string | null;
    responsavel_cpf: string | null;
    cep: string | null;
    logradouro: string | null;
    numero: string | null;
    complemento: string | null;
    bairro: string | null;
    cidade: string | null;
    uf: string | null;
}

type Errors = Partial<Record<string, string>>;

function Campo({ label, name, error, children, className, obrigatorio }: {
    label: string;
    name: string;
    error?: string;
    children: ReactNode;
    className?: string;
    obrigatorio?: boolean;
}) {
    return (
        <div className={`grid gap-1.5 ${className ?? ''}`}>
            <Label htmlFor={name}>
                {label}
                {obrigatorio && <span className="text-destructive"> *</span>}
            </Label>
            {children}
            <InputError message={error} />
        </div>
    );
}

function Secao({ titulo, children }: { titulo: string; children: ReactNode }) {
    return (
        <section className="grid gap-4">
            <h2 className="text-sm font-medium text-muted-foreground">{titulo}</h2>
            <div className="grid gap-4 sm:grid-cols-2">{children}</div>
        </section>
    );
}

export function PacienteFields({
    paciente,
    errors,
}: {
    paciente?: Paciente;
    errors: Errors;
}) {
    const v = (k: keyof Paciente) => (paciente?.[k] ?? '') as string;

    const containerRef = useRef<HTMLDivElement>(null);
    const [buscandoCep, setBuscandoCep] = useState(false);

    async function buscarCep() {
        const container = containerRef.current;
        if (!container) return;

        const campo = (name: string) =>
            container.querySelector<HTMLInputElement>(`#${name}`);

        const cep = (campo('cep')?.value ?? '').replace(/\D/g, '');
        if (cep.length !== 8) {
            toast.error('Digite um CEP com 8 dígitos.');
            return;
        }

        setBuscandoCep(true);
        try {
            const resposta = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
            const dados = await resposta.json();

            if (dados.erro) {
                toast.error('CEP não encontrado.');
                return;
            }

            const preencher = (name: string, valor: string) => {
                const el = campo(name);
                if (el) el.value = valor;
            };

            preencher('logradouro', dados.logradouro ?? '');
            preencher('bairro', dados.bairro ?? '');
            preencher('cidade', dados.localidade ?? '');
            preencher('uf', dados.uf ?? '');

            campo('numero')?.focus();
        } catch {
            toast.error('Não foi possível buscar o CEP. Tente novamente.');
        } finally {
            setBuscandoCep(false);
        }
    }

    return (
        <div ref={containerRef} className="grid gap-8">
            <Secao titulo="Identificação">
                <Campo
                    label="Nome completo"
                    name="nome_completo"
                    error={errors.nome_completo}
                    className="sm:col-span-2"
                    obrigatorio
                >
                    <Input id="nome_completo" name="nome_completo" defaultValue={v('nome_completo')} required autoComplete="off" />
                </Campo>
                <Campo label="Nome social" name="nome_social" error={errors.nome_social}>
                    <Input id="nome_social" name="nome_social" defaultValue={v('nome_social')} autoComplete="off" />
                </Campo>
                <Campo label="Data de nascimento" name="data_nascimento" error={errors.data_nascimento}>
                    <Input
                        id="data_nascimento"
                        name="data_nascimento"
                        type="date"
                        defaultValue={v('data_nascimento') ? v('data_nascimento').slice(0, 10) : ''}
                    />
                </Campo>
                <Campo label="Sexo" name="sexo" error={errors.sexo}>
                    <select
                        id="sexo"
                        name="sexo"
                        defaultValue={v('sexo')}
                        className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    >
                        <option value="">Selecione</option>
                        <option value="feminino">Feminino</option>
                        <option value="masculino">Masculino</option>
                        <option value="outro">Outro</option>
                    </select>
                </Campo>
                <Campo label="CPF" name="cpf" error={errors.cpf}>
                    <Input id="cpf" name="cpf" defaultValue={v('cpf')} autoComplete="off" />
                </Campo>
                <Campo label="RG" name="rg" error={errors.rg}>
                    <Input id="rg" name="rg" defaultValue={v('rg')} autoComplete="off" />
                </Campo>
                <Campo label="Ocupação" name="ocupacao" error={errors.ocupacao}>
                    <Input id="ocupacao" name="ocupacao" defaultValue={v('ocupacao')} autoComplete="off" />
                </Campo>
            </Secao>

            <Secao titulo="Contato">
                <Campo label="Celular / WhatsApp" name="celular_whatsapp" error={errors.celular_whatsapp}>
                    <Input id="celular_whatsapp" name="celular_whatsapp" defaultValue={v('celular_whatsapp')} autoComplete="off" />
                </Campo>
                <Campo label="Telefone 2" name="telefone_2" error={errors.telefone_2}>
                    <Input id="telefone_2" name="telefone_2" defaultValue={v('telefone_2')} autoComplete="off" />
                </Campo>
                <Campo label="E-mail" name="email" error={errors.email}>
                    <Input id="email" name="email" type="email" defaultValue={v('email')} autoComplete="off" />
                </Campo>
                <Campo label="Como conheceu a clínica" name="origem" error={errors.origem}>
                    <Input id="origem" name="origem" defaultValue={v('origem')} autoComplete="off" />
                </Campo>
            </Secao>

            <Secao titulo="Responsável legal">
                <Campo label="Nome do responsável" name="responsavel_nome" error={errors.responsavel_nome}>
                    <Input id="responsavel_nome" name="responsavel_nome" defaultValue={v('responsavel_nome')} autoComplete="off" />
                </Campo>
                <Campo label="CPF do responsável" name="responsavel_cpf" error={errors.responsavel_cpf}>
                    <Input id="responsavel_cpf" name="responsavel_cpf" defaultValue={v('responsavel_cpf')} autoComplete="off" />
                </Campo>
            </Secao>

            <Secao titulo="Endereço">
                <Campo label="CEP" name="cep" error={errors.cep}>
                    <div className="flex gap-2">
                        <Input id="cep" name="cep" defaultValue={v('cep')} autoComplete="off" />
                        <Button type="button" variant="outline" onClick={buscarCep} disabled={buscandoCep} className="shrink-0">
                            {buscandoCep ? 'Buscando...' : 'Completar'}
                        </Button>
                    </div>
                </Campo>
                <Campo label="Logradouro" name="logradouro" error={errors.logradouro}>
                    <Input id="logradouro" name="logradouro" defaultValue={v('logradouro')} autoComplete="off" />
                </Campo>
                <Campo label="Número" name="numero" error={errors.numero}>
                    <Input id="numero" name="numero" defaultValue={v('numero')} autoComplete="off" />
                </Campo>
                <Campo label="Complemento" name="complemento" error={errors.complemento}>
                    <Input id="complemento" name="complemento" defaultValue={v('complemento')} autoComplete="off" />
                </Campo>
                <Campo label="Bairro" name="bairro" error={errors.bairro}>
                    <Input id="bairro" name="bairro" defaultValue={v('bairro')} autoComplete="off" />
                </Campo>
                <Campo label="Cidade" name="cidade" error={errors.cidade}>
                    <Input id="cidade" name="cidade" defaultValue={v('cidade')} autoComplete="off" />
                </Campo>
                <Campo label="UF" name="uf" error={errors.uf}>
                    <Input id="uf" name="uf" maxLength={2} defaultValue={v('uf')} autoComplete="off" />
                </Campo>
            </Secao>
        </div>
    );
}