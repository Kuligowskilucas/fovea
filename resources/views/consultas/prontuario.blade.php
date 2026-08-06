<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Prontuário — {{ $consulta->paciente->nome_completo }}</title>
    <style>
        * { box-sizing: border-box; }
        body {
            margin: 0;
            font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            color: #1a1a1a;
            background: #f3f4f6;
            line-height: 1.5;
        }
        .folha {
            max-width: 800px;
            margin: 24px auto;
            background: #fff;
            padding: 40px 48px;
            box-shadow: 0 1px 4px rgba(0, 0, 0, .1);
        }
        .cabecalho {
            display: flex;
            align-items: center;
            gap: 16px;
            border-bottom: 2px solid #0d9488;
            padding-bottom: 16px;
        }
        .cabecalho img { max-height: 64px; }
        .cabecalho .info h1 { margin: 0; font-size: 20px; }
        .cabecalho .info p { margin: 2px 0 0; font-size: 13px; color: #4b5563; }
        .paciente {
            display: flex;
            flex-wrap: wrap;
            gap: 4px 32px;
            margin: 24px 0 8px;
            font-size: 14px;
        }
        h2.titulo {
            font-size: 16px;
            margin: 28px 0 12px;
            color: #0d9488;
            text-transform: uppercase;
            letter-spacing: .04em;
        }
        h3.subtitulo {
            font-size: 14px;
            margin: 20px 0 8px;
            color: #0f766e;
            font-weight: 600;
        }
        p.mini-titulo {
            font-size: 13px;
            font-weight: 600;
            margin: 12px 0 6px;
            color: #4b5563;
        }
        table { width: 100%; border-collapse: collapse; font-size: 14px; margin-bottom: 4px; }
        th, td { border: 1px solid #d1d5db; padding: 8px 10px; text-align: center; }
        th { background: #f0fdfa; font-weight: 600; }
        td.olho { font-weight: 600; background: #f9fafb; }
        .detalhes { margin-top: 12px; font-size: 14px; }
        .detalhes p { margin: 4px 0; }
        .obs-secao { margin: 8px 0 0; font-size: 13px; color: #374151; white-space: pre-wrap; }
        .obs { margin-top: 20px; font-size: 14px; white-space: pre-wrap; }
        .vazio { font-size: 14px; color: #6b7280; font-style: italic; }
        .assinatura { margin-top: 64px; text-align: center; font-size: 14px; }
        .assinatura .linha {
            width: 280px;
            margin: 0 auto 6px;
            border-top: 1px solid #111827;
        }
        .barra-print { max-width: 800px; margin: 24px auto 0; text-align: right; }
        .barra-print button {
            background: #0d9488;
            color: #fff;
            border: 0;
            padding: 10px 20px;
            border-radius: 8px;
            font-size: 14px;
            cursor: pointer;
        }
        @media print {
            body { background: #fff; }
            .folha { box-shadow: none; margin: 0; max-width: none; padding: 0; }
            .no-print { display: none !important; }
            h3.subtitulo { page-break-after: avoid; }
            table { page-break-inside: avoid; }
            @page { margin: 1.5cm; }
        }
    </style>
</head>
<body>
@php
    $paciente = $consulta->paciente;
    $e = $consulta->exame?->dados ?? [];

    // Acesso seguro e profundo ao jsonb do exame (trata null/ausente).
    $g = fn ($path) => data_get($e, $path);

    $temValor = fn ($v) => ! is_null($v) && $v !== '';

    // Verdadeiro se o nó (folha ou sub-árvore) tem qualquer valor preenchido.
    $temDados = function ($node) use (&$temDados) {
        if (is_array($node)) {
            foreach ($node as $v) {
                if ($temDados($v)) {
                    return true;
                }
            }
            return false;
        }
        return ! is_null($node) && $node !== '';
    };

    $dioptria = fn ($v) => (is_null($v) || $v === '') ? '—' : str_replace('.', ',', sprintf('%+.2f', (float) $v));
    $eixo = fn ($v) => (is_null($v) || $v === '') ? '—' : $v . '°';
    $texto = fn ($v) => (is_null($v) || $v === '') ? '—' : $v;
    $dnp = fn ($v) => is_null($v) ? '—' : number_format((float) $v, 1, ',', '');

    $temExame = $temDados($e);
    $temPrescricoes = $consulta->prescricoes->isNotEmpty();
@endphp

    <div class="barra-print no-print">
        <button onclick="window.print()">Imprimir</button>
    </div>

    <div class="folha">
        <div class="cabecalho">
            @if (config('clinica.logo'))
                <img src="{{ asset(config('clinica.logo')) }}" alt="Logo">
            @endif
            <div class="info">
                <h1>{{ config('clinica.nome') }}</h1>
                <p>{{ config('clinica.profissional') }}@if (config('clinica.registro')) — {{ config('clinica.registro') }}@endif</p>
                @if (config('clinica.endereco') || config('clinica.telefone'))
                    <p>{{ config('clinica.endereco') }}@if (config('clinica.telefone')) · {{ config('clinica.telefone') }}@endif</p>
                @endif
            </div>
        </div>

        <div class="paciente">
            <span><strong>Paciente:</strong> {{ $paciente->nome_completo }}</span>
            @if (! is_null($paciente->idade))
                <span><strong>Idade:</strong> {{ $paciente->idade }} anos</span>
            @endif
            <span><strong>Data:</strong> {{ $consulta->atendido_em?->format('d/m/Y') }}</span>
            @if ($consulta->procedimento)
                <span><strong>Procedimento:</strong> {{ $consulta->procedimento }}</span>
            @endif
            @if ($consulta->profissional)
                <span><strong>Profissional:</strong> {{ $consulta->profissional->name }}</span>
            @endif
        </div>

        {{-- ==================== EXAMES ==================== --}}
        <h2 class="titulo">Exames</h2>

        @if (! $temExame)
            <p class="vazio">Nenhum exame registrado nesta consulta.</p>
        @else
            {{-- Autorrefração --}}
            @if ($temDados($g('autorrefracao')))
                <h3 class="subtitulo">Autorrefração</h3>
                <table>
                    <thead>
                        <tr><th>Olho</th><th>Esférico</th><th>Cilíndrico</th><th>Eixo</th></tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td class="olho">OD</td>
                            <td>{{ $dioptria($g('autorrefracao.od.esferico')) }}</td>
                            <td>{{ $dioptria($g('autorrefracao.od.cilindrico')) }}</td>
                            <td>{{ $eixo($g('autorrefracao.od.eixo')) }}</td>
                        </tr>
                        <tr>
                            <td class="olho">OE</td>
                            <td>{{ $dioptria($g('autorrefracao.oe.esferico')) }}</td>
                            <td>{{ $dioptria($g('autorrefracao.oe.cilindrico')) }}</td>
                            <td>{{ $eixo($g('autorrefracao.oe.eixo')) }}</td>
                        </tr>
                    </tbody>
                </table>
                @if ($temValor($g('autorrefracao.observacoes')))
                    <div class="obs-secao"><strong>Observações:</strong> {{ $g('autorrefracao.observacoes') }}</div>
                @endif
            @endif

            {{-- Ceratometria --}}
            @if ($temDados($g('ceratometria')))
                <h3 class="subtitulo">Ceratometria</h3>
                <div class="detalhes">
                    @if ($temValor($g('ceratometria.od')))
                        <p><strong>OD:</strong> {{ $g('ceratometria.od') }}</p>
                    @endif
                    @if ($temValor($g('ceratometria.oe')))
                        <p><strong>OE:</strong> {{ $g('ceratometria.oe') }}</p>
                    @endif
                    @if ($temValor($g('ceratometria.miras')))
                        <p><strong>Miras:</strong> {{ $g('ceratometria.miras') }}</p>
                    @endif
                    @if ($temValor($g('ceratometria.observacoes')))
                        <p><strong>Observações:</strong> {{ $g('ceratometria.observacoes') }}</p>
                    @endif
                </div>
            @endif

            {{-- Retinoscopias --}}
            @foreach (['retinoscopia_estatica' => 'Retinoscopia estática', 'retinoscopia_dinamica' => 'Retinoscopia dinâmica'] as $chave => $rotulo)
                @if ($temDados($g($chave)))
                    <h3 class="subtitulo">{{ $rotulo }}</h3>
                    <table>
                        <thead>
                            <tr><th>Olho</th><th>Valor</th><th>AV</th></tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td class="olho">OD</td>
                                <td>{{ $texto($g("$chave.od.valor")) }}</td>
                                <td>{{ $texto($g("$chave.od.av")) }}</td>
                            </tr>
                            <tr>
                                <td class="olho">OE</td>
                                <td>{{ $texto($g("$chave.oe.valor")) }}</td>
                                <td>{{ $texto($g("$chave.oe.av")) }}</td>
                            </tr>
                        </tbody>
                    </table>
                    @if ($temValor($g("$chave.observacoes")))
                        <div class="obs-secao"><strong>Observações:</strong> {{ $g("$chave.observacoes") }}</div>
                    @endif
                @endif
            @endforeach

            {{-- Acuidade visual --}}
            @if ($temDados($g('acuidade_visual')))
                <h3 class="subtitulo">Acuidade visual</h3>
                @if ($temValor($g('acuidade_visual.optotipo')))
                    <div class="detalhes"><p><strong>Optotipo:</strong> {{ $g('acuidade_visual.optotipo') }}</p></div>
                @endif
                @foreach (['sem_correcao' => 'Sem correção', 'com_correcao' => 'Com correção'] as $chave => $rotulo)
                    @if ($temDados($g("acuidade_visual.$chave")))
                        <p class="mini-titulo">{{ $rotulo }}</p>
                        <table>
                            <thead>
                                <tr><th></th><th>VL</th><th>VP</th><th>PH</th></tr>
                            </thead>
                            <tbody>
                                @foreach (['od' => 'OD', 'oe' => 'OE', 'ao' => 'AO'] as $olho => $lbl)
                                    <tr>
                                        <td class="olho">{{ $lbl }}</td>
                                        <td>{{ $texto($g("acuidade_visual.$chave.$olho.vl")) }}</td>
                                        <td>{{ $texto($g("acuidade_visual.$chave.$olho.vp")) }}</td>
                                        <td>{{ $texto($g("acuidade_visual.$chave.$olho.ph")) }}</td>
                                    </tr>
                                @endforeach
                            </tbody>
                        </table>
                    @endif
                @endforeach
                @if ($temValor($g('acuidade_visual.observacoes')))
                    <div class="obs-secao"><strong>Observações:</strong> {{ $g('acuidade_visual.observacoes') }}</div>
                @endif
            @endif

            {{-- RX Final --}}
            @if ($temDados($g('rx_final')))
                <h3 class="subtitulo">RX Final</h3>
                <table>
                    <thead>
                        <tr><th>Olho</th><th>Esférico</th><th>Cilíndrico</th><th>Eixo</th><th>AV</th></tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td class="olho">OD</td>
                            <td>{{ $dioptria($g('rx_final.od.esferico')) }}</td>
                            <td>{{ $dioptria($g('rx_final.od.cilindrico')) }}</td>
                            <td>{{ $eixo($g('rx_final.od.eixo')) }}</td>
                            <td>{{ $texto($g('rx_final.od.av')) }}</td>
                        </tr>
                        <tr>
                            <td class="olho">OE</td>
                            <td>{{ $dioptria($g('rx_final.oe.esferico')) }}</td>
                            <td>{{ $dioptria($g('rx_final.oe.cilindrico')) }}</td>
                            <td>{{ $eixo($g('rx_final.oe.eixo')) }}</td>
                            <td>{{ $texto($g('rx_final.oe.av')) }}</td>
                        </tr>
                    </tbody>
                </table>
                <div class="detalhes">
                    @if ($temValor($g('rx_final.adicao')))
                        <p><strong>Adição:</strong> +{{ number_format((float) $g('rx_final.adicao'), 2, ',', '') }}</p>
                    @endif
                    @if ($temValor($g('rx_final.av_perto')))
                        <p><strong>AV perto:</strong> {{ $g('rx_final.av_perto') }}</p>
                    @endif
                    @if ($temValor($g('rx_final.tipo_lente')))
                        <p><strong>Tipo de lente:</strong> {{ $g('rx_final.tipo_lente') }}</p>
                    @endif
                    @if ($temValor($g('rx_final.tratamento')))
                        <p><strong>Tratamento:</strong> {{ $g('rx_final.tratamento') }}</p>
                    @endif
                </div>
                @if ($temValor($g('rx_final.observacoes')))
                    <div class="obs-secao"><strong>Observações:</strong> {{ $g('rx_final.observacoes') }}</div>
                @endif
            @endif
        @endif

        {{-- ==================== PRESCRIÇÕES ==================== --}}
        @if ($temPrescricoes)
            <h2 class="titulo">Prescrições</h2>

            @foreach ($consulta->prescricoes as $p)
                @php
                    $isOculos = $p->tipo === 'oculos';
                    $pod = $p->medidas->firstWhere('olho', 'OD');
                    $poe = $p->medidas->firstWhere('olho', 'OE');
                    $visaoLabel = match ($p->tipo_visao) {
                        'longe' => 'Longe',
                        'longe_perto' => 'Longe e perto',
                        default => null,
                    };
                @endphp

                <h3 class="subtitulo">{{ $isOculos ? 'Óculos' : 'Lente de contato' }}</h3>
                <table>
                    <thead>
                        <tr>
                            <th>Olho</th><th>Esférico</th><th>Cilíndrico</th><th>Eixo</th><th>AV</th>
                            @if ($isOculos)
                                <th>DNP</th><th>Prisma</th>
                            @endif
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td class="olho">OD</td>
                            <td>{{ $dioptria($pod?->esferico) }}</td>
                            <td>{{ $dioptria($pod?->cilindrico) }}</td>
                            <td>{{ $eixo($pod?->eixo) }}</td>
                            <td>{{ $texto($pod?->av) }}</td>
                            @if ($isOculos)
                                <td>{{ $dnp($pod?->dnp) }}</td>
                                <td>{{ $texto($pod?->prisma) }}</td>
                            @endif
                        </tr>
                        <tr>
                            <td class="olho">OE</td>
                            <td>{{ $dioptria($poe?->esferico) }}</td>
                            <td>{{ $dioptria($poe?->cilindrico) }}</td>
                            <td>{{ $eixo($poe?->eixo) }}</td>
                            <td>{{ $texto($poe?->av) }}</td>
                            @if ($isOculos)
                                <td>{{ $dnp($poe?->dnp) }}</td>
                                <td>{{ $texto($poe?->prisma) }}</td>
                            @endif
                        </tr>
                    </tbody>
                </table>
                <div class="detalhes">
                    @if ($isOculos && $visaoLabel)
                        <p><strong>Visão:</strong> {{ $visaoLabel }}</p>
                    @endif
                    @if ($isOculos && ! is_null($p->adicao))
                        <p><strong>Adição:</strong> +{{ number_format((float) $p->adicao, 2, ',', '') }}</p>
                    @endif
                    @if ($p->lente)
                        <p><strong>Lente:</strong> {{ $p->lente }}</p>
                    @endif
                    @if ($p->retorno_em)
                        <p><strong>Retorno:</strong> {{ $p->retorno_em->format('d/m/Y') }}</p>
                    @endif
                </div>
                @if ($p->observacoes)
                    <div class="obs-secao"><strong>Observações:</strong> {{ $p->observacoes }}</div>
                @endif
            @endforeach
        @endif

        {{-- Observações gerais da consulta --}}
        @if ($consulta->observacoes)
            <div class="obs"><strong>Observações da consulta:</strong> {{ $consulta->observacoes }}</div>
        @endif

        @if ($consulta->retorno_em)
            <div class="detalhes"><p><strong>Retorno:</strong> {{ $consulta->retorno_em->format('d/m/Y') }}</p></div>
        @endif

        <div class="assinatura">
            <div class="linha"></div>
            {{ config('clinica.profissional') }}@if (config('clinica.registro')) — {{ config('clinica.registro') }}@endif
        </div>
    </div>
</body>
</html>