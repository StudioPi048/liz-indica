# LIZ INDICA — Sistema de design (real)

## Marca (fixa)
- Fontes: Fraunces (display), Outfit (texto), JetBrains Mono (rótulos `label-mono`).
- Cores (`src/styles.css` @theme): ink #161008, parchment #F6EFE2, gold #C6A15B (gold-soft #E2CF9D), terracotta #A9502F, sepia #57493A.
- Logos originais em `src/assets`.

## Composição
- Superfícies alternadas: parchment (acolhida, diretório) ↔ ink (como funciona, instituto), separadas por bordas gold/45.
- Acolhida (revogado: carrossel de 3 fichas, rejeitado por Pietro). Agora: título → faixa contínua "Conheça a rede LIZ" de largura total → escolhas Online/Presencial (esq.) + busca, links e parágrafo original (dir.; no mobile abaixo).
- Faixa: TODAS as pessoas do diretório (mesmo conjunto deduplicado; sem foto = iniciais), retratos quadrados de tamanho único (224px desktop, 168px mobile) com `object-contain` sobre `--color-portrait`, nome abaixo, sem moldura/sombra/cidade/contador. Rolagem horizontal nativa; GSAP ticker avança ~26px/s constante; cópias só para fechar o loop (aria-hidden, inert, sem links). Início aleatório por visita, ordem do diretório. Pausa em hover, foco, toque, fora da tela, aba oculta; botão Pausar/Retomar prevalece; movimento reduzido sem autoplay. Teclado: um único link tabulável, setas/Home/End percorrem.
- Mídia institucional: `hero-bg2.webp` como figura lateral na seção do Instituto (legenda "O Instituto LIZ"); `roots-soft.webp` ao lado do título do diretório, em caixa parchment com `mix-blend-multiply`, nunca sob texto ou controles.
- Sem kickers mono uppercase acima de títulos na home/diretório/perfil: a informação institucional vira metadado legível (texto normal abaixo do título ou na linha de links). `label-mono` só para rótulos de dados (ex.: legendas dos números).
- Cards do diretório: grandes, retrato 260–280px em painel ink com `object-contain` (foto inteira, sem filtro), 1/2/3 colunas.
- Perfil: retrato amplo (340–540px) + identidade; no mobile identidade e CTA vêm antes do retrato. Foto ampliável em diálogo. Barra fixa mobile discreta com primeiro nome + canal.
- Fotos de pessoas nunca recebem filtro (`photo-sepia` não é usado em retratos) nem corte.

## Limites
- Sem rótulos de destaque/ranking, sem conteúdo inventado, sem imagens geradas de pessoas.
- Movimento: GSAP leve na acolhida; respeita reduced-motion; conteúdo nunca depende da animação para aparecer.
