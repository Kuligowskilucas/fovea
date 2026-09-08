<?php

namespace App\Actions\Produto;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Intervention\Image\Drivers\Gd\Driver;
use Intervention\Image\Encoders\JpegEncoder;
use Intervention\Image\ImageManager;

class ProcessarImagemProduto
{
    /** Largura máxima do catálogo; imagens menores não sofrem upscale. */
    private const LARGURA_MAX = 1000;

    private const QUALIDADE = 80;

    private const DIRETORIO = 'produtos';

    private const DISCO = 'public';

    private ImageManager $manager;

    public function __construct()
    {
        // GD, e não Imagick: a VM tem 1 GB de RAM e o GD é bem mais leve.
        $this->manager = new ImageManager(new Driver);
    }

    /**
     * Redimensiona, comprime e grava a imagem no disco público.
     * Devolve o caminho relativo a ser guardado em produtos.imagem.
     */
    public function salvar(UploadedFile $arquivo): string
    {
        $imagem = $this->manager->decodePath($arquivo->getRealPath())
            ->scaleDown(width: self::LARGURA_MAX);

        // Normaliza tudo pra JPEG: tamanho previsível independente do formato enviado.
        $encoded = $imagem->encode(new JpegEncoder(quality: self::QUALIDADE));

        $caminho = self::DIRETORIO.'/'.Str::uuid().'.jpg';

        Storage::disk(self::DISCO)->put($caminho, (string) $encoded);

        return $caminho;
    }

    /** Remove o arquivo físico. Usado só na troca de imagem — nunca no soft delete. */
    public function remover(?string $caminho): void
    {
        if ($caminho === null || $caminho === '') {
            return;
        }

        Storage::disk(self::DISCO)->delete($caminho);
    }
}
