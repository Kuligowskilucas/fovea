import { Head, usePage } from '@inertiajs/react';
import { Check, Copy, Download } from 'lucide-react';
import { QRCodeCanvas } from 'qrcode.react';
import { useRef, useState } from 'react';
import { toast } from 'sonner';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { dashboard } from '@/routes';
import { qrcode } from '@/routes/catalogo';
import { index as produtosIndex } from '@/routes/produtos';

/** Lado do QR em px. Generoso pra escanear impresso, com quiet zone de 4 módulos. */
const TAMANHO = 288;

export default function ProdutoQrCode({ url }: { url: string }) {
    const { name } = usePage().props;
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [copiado, setCopiado] = useState(false);

    async function copiar() {
        try {
            await navigator.clipboard.writeText(url);
            setCopiado(true);
            toast.success('Link copiado.');
            setTimeout(() => setCopiado(false), 2000);
        } catch {
            toast.error('Não foi possível copiar. Copie o link manualmente.');
        }
    }

    function baixarPng() {
        const canvas = canvasRef.current;

        if (!canvas) {
            return;
        }

        const link = document.createElement('a');
        link.href = canvas.toDataURL('image/png');
        link.download = 'catalogo-qrcode.png';
        link.click();
    }

    return (
        <>
            <Head title="QR code do catálogo" />

            <div className="flex h-full flex-1 flex-col gap-6 p-4">
                <Heading
                    variant="small"
                    title="QR code do catálogo"
                    description="Para divulgar a vitrine no story, na vitrine da loja ou no cartão"
                />

                <div className="grid max-w-lg gap-4">
                    <div className="flex flex-col items-center gap-3 rounded-xl border p-6">
                        {/* bg branco fixo: QR em fundo escuro não escaneia. */}
                        <div className="rounded-lg bg-white p-3">
                            <QRCodeCanvas
                                ref={canvasRef}
                                value={url}
                                size={TAMANHO}
                                level="Q"
                                marginSize={4}
                                bgColor="#ffffff"
                                fgColor="#000000"
                                className="h-auto w-full max-w-[288px]"
                            />
                        </div>
                        <p className="text-sm font-medium">{name}</p>
                    </div>

                    <div className="grid gap-2">
                        <p className="text-xs text-muted-foreground">Endereço da vitrine</p>
                        <p className="rounded-md border bg-muted/50 px-3 py-2 text-sm break-all">
                            {url}
                        </p>
                    </div>

                    <div className="flex flex-col gap-2 sm:flex-row">
                        <Button onClick={baixarPng} className="sm:flex-1">
                            <Download className="size-4" />
                            Baixar PNG
                        </Button>
                        <Button variant="secondary" onClick={copiar} className="sm:flex-1">
                            {copiado ? <Check className="size-4" /> : <Copy className="size-4" />}
                            {copiado ? 'Copiado' : 'Copiar link'}
                        </Button>
                    </div>
                </div>
            </div>
        </>
    );
}

ProdutoQrCode.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: dashboard() },
        { title: 'Produtos', href: produtosIndex() },
        { title: 'QR code', href: qrcode() },
    ],
};
