<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Receita — {{ $prescricao->consulta->paciente->nome_completo }}</title>
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
            margin: 24px 0;
            font-size: 14px;
        }
        h2.titulo {
            font-size: 16px;
            margin: 0 0 12px;
            color: #0d9488;
            text-transform: uppercase;
            letter-spacing: .04em;
        }
        table { width: 100%; border-collapse: collapse; font-size: 14px; }
        th, td { border: 1px solid #d1d5db; padding: 8px 10px; text-align: center; }
        th { background: #f0fdfa; font-weight: 600; }
        td.olho { font-weight: 600; background: #f9fafb; }
        .detalhes { margin-top: 16px; font-size: 14px; }
        .detalhes p { margin: 4px 0; }
        .obs { margin-top: 20px; font-size: 14px; white-space: pre-wrap; }
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
            @page { margin: 1.5cm; }
        }
    </style>
</head>
<body>
@php
    $isOculos = $prescricao->tipo === 'oculos';
    $od = $prescricao->medidas->firstWhere('olho', 'OD');
    $oe = $prescricao->medidas->firstWhere('olho', 'OE');

    $dioptria = fn ($v) => is_null($v) ? '—' : str_replace('.', ',', sprintf('%+.2f', (float) $v));
    $eixo = fn ($v) => (is_null($v) || $v === '') ? '—' : $v . '°';
    $texto = fn ($v) => (is_null($v) || $v === '') ? '—' : $v;
    $dnp = fn ($v) => is_null($v) ? '—' : number_format((float) $v, 1, ',', '');

    $visaoLabel = match ($prescricao->tipo_visao) {
        'longe' => 'Longe',
        'longe_perto' => 'Longe e perto',
        default => null,
    };
    $paciente = $prescricao->consulta->paciente;
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
            <span><strong>Data:</strong> {{ $prescricao->consulta->atendido_em?->format('d/m/Y') }}</span>
        </div>

        <h2 class="titulo">{{ $isOculos ? 'Receita de óculos' : 'Receita de lentes de contato' }}</h2>

        <table>
            <thead>
                <tr>
                    <th>Olho</th>
                    <th>Esférico</th>
                    <th>Cilíndrico</th>
                    <th>Eixo</th>
                    <th>AV</th>
                    @if ($isOculos)
                        <th>DNP</th>
                        <th>Prisma</th>
                    @endif
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td class="olho">OD</td>
                    <td>{{ $dioptria($od?->esferico) }}</td>
                    <td>{{ $dioptria($od?->cilindrico) }}</td>
                    <td>{{ $eixo($od?->eixo) }}</td>
                    <td>{{ $texto($od?->av) }}</td>
                    @if ($isOculos)
                        <td>{{ $dnp($od?->dnp) }}</td>
                        <td>{{ $texto($od?->prisma) }}</td>
                    @endif
                </tr>
                <tr>
                    <td class="olho">OE</td>
                    <td>{{ $dioptria($oe?->esferico) }}</td>
                    <td>{{ $dioptria($oe?->cilindrico) }}</td>
                    <td>{{ $eixo($oe?->eixo) }}</td>
                    <td>{{ $texto($oe?->av) }}</td>
                    @if ($isOculos)
                        <td>{{ $dnp($oe?->dnp) }}</td>
                        <td>{{ $texto($oe?->prisma) }}</td>
                    @endif
                </tr>
            </tbody>
        </table>

        <div class="detalhes">
            @if ($isOculos && $visaoLabel)
                <p><strong>Visão:</strong> {{ $visaoLabel }}</p>
            @endif
            @if ($isOculos && ! is_null($prescricao->adicao))
                <p><strong>Adição:</strong> +{{ number_format((float) $prescricao->adicao, 2, ',', '') }}</p>
            @endif
            @if ($prescricao->lente)
                <p><strong>Lente:</strong> {{ $prescricao->lente }}</p>
            @endif
            @if ($prescricao->retorno_em)
                <p><strong>Retorno:</strong> {{ $prescricao->retorno_em->format('d/m/Y') }}</p>
            @endif
        </div>

        @if ($prescricao->observacoes)
            <div class="obs"><strong>Observações:</strong> {{ $prescricao->observacoes }}</div>
        @endif

        <div class="assinatura">
            <div class="linha"></div>
            {{ config('clinica.profissional') }}@if (config('clinica.registro')) — {{ config('clinica.registro') }}@endif
        </div>
    </div>
</body>
</html>