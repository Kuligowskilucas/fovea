import { Head } from '@inertiajs/react';
import { ImageOff } from 'lucide-react';

type Produto = {
    id: number;
    nome: string;
    descricao: string | null;
    preco: string | null;
    imagem: string | null;
};

type Categoria = {
    id: number;
    nome: string;
    produtos: Produto[];
};

type Props = {
    categorias: Categoria[];
    rodape_preco: string;
    whatsapp: {
        numero: string;
        mensagem: string;
    };
};

function moeda(valor: string): string {
    return Number(valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

/** Glifo do WhatsApp inline — evita puxar um pacote de ícones de marca. */
function IconeWhatsApp({ className }: { className?: string }) {
    return (
        <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884a9.82 9.82 0 016.988 2.896 9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.885-9.885 9.885M20.52 3.449C18.24 1.245 15.24 0 12.045 0 5.463 0 .104 5.359.101 11.944c0 2.096.549 4.14 1.595 5.945L0 24l6.305-1.654a11.94 11.94 0 005.71 1.454h.006c6.585 0 11.946-5.36 11.949-11.945a11.86 11.86 0 00-3.45-8.406" />
        </svg>
    );
}

function CardProduto({
    produto,
    rodapePreco,
    linkWhatsApp,
}: {
    produto: Produto;
    rodapePreco: string;
    linkWhatsApp: string | null;
}) {
    return (
        <article className="flex flex-col overflow-hidden rounded-xl border bg-card">
            {produto.imagem ? (
                <img
                    src={produto.imagem}
                    alt={produto.nome}
                    loading="lazy"
                    decoding="async"
                    className="aspect-square w-full bg-muted object-cover"
                />
            ) : (
                <div className="flex aspect-square w-full items-center justify-center bg-muted text-muted-foreground">
                    <ImageOff className="size-8" aria-hidden="true" />
                </div>
            )}

            <div className="flex flex-1 flex-col gap-3 p-4">
                <div className="grid gap-1">
                    <h3 className="leading-tight font-medium">{produto.nome}</h3>
                    {produto.descricao && (
                        <p className="text-sm text-muted-foreground">{produto.descricao}</p>
                    )}
                </div>

                <div className="mt-auto grid gap-0.5">
                    {produto.preco === null ? (
                        <p className="font-semibold text-muted-foreground">Sob consulta</p>
                    ) : (
                        <p className="text-lg font-semibold">{moeda(produto.preco)}</p>
                    )}
                    <p className="text-xs text-muted-foreground">{rodapePreco}</p>
                </div>

                {linkWhatsApp && (
                    <a
                        href={linkWhatsApp}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-md bg-[#25D366] text-sm font-medium text-black transition-opacity hover:opacity-90"
                    >
                        <IconeWhatsApp className="size-4" />
                        Tenho interesse
                    </a>
                )}
            </div>
        </article>
    );
}

export default function CatalogoIndex({ categorias, rodape_preco, whatsapp }: Props) {
    // Sem número configurado, o wa.me quebraria — melhor não mostrar o botão.
    const temWhatsApp = whatsapp.numero !== '';

    function linkWhatsApp(produto: Produto): string | null {
        if (!temWhatsApp) {
            return null;
        }

        const mensagem = whatsapp.mensagem.replaceAll('{nome}', produto.nome);

        return `https://wa.me/${whatsapp.numero}?text=${encodeURIComponent(mensagem)}`;
    }

    const vazio = categorias.length === 0;

    return (
        <>
            <Head title="Catálogo" />

            <div className="grid gap-10">
                <header className="grid gap-1">
                    <h1 className="text-2xl font-semibold tracking-tight">Nossas armações</h1>
                    <p className="text-sm text-muted-foreground">
                        Escolha a sua e fale com a gente pelo WhatsApp.
                    </p>
                </header>

                {vazio && (
                    <p className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">
                        Nosso catálogo está sendo atualizado. Volte em breve.
                    </p>
                )}

                {categorias.map((categoria) => (
                    <section key={categoria.id} className="grid gap-4">
                        <h2 className="text-lg font-semibold tracking-tight">{categoria.nome}</h2>

                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
                            {categoria.produtos.map((produto) => (
                                <CardProduto
                                    key={produto.id}
                                    produto={produto}
                                    rodapePreco={rodape_preco}
                                    linkWhatsApp={linkWhatsApp(produto)}
                                />
                            ))}
                        </div>
                    </section>
                ))}
            </div>
        </>
    );
}
