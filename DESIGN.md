# LIZ INDICA — Sistema de design (real)

## Marca (fixa)
- Fontes: Fraunces (display), Outfit (texto), JetBrains Mono (rótulos `label-mono`).
- Cores (`src/styles.css` @theme): ink #161008, parchment #F6EFE2, gold #C6A15B (gold-soft #E2CF9D), terracotta #A9502F, sepia #57493A.
- Logos originais em `src/assets`.

## Composição
- Superfícies alternadas: parchment (acolhida, diretório) ↔ ink (como funciona, instituto), separadas por bordas gold/45.
- Acolhida desktop: texto/escolha | retratos 1.45fr/1fr; cada retrato na proporção natural da foto (img `h-auto`, sem caixa de altura fixa nem fundo ink), sem letterbox. Medido em 1440×900: principal 342×342, laterais 235×235.
- Acolhida mobile (390×844): título → 1 retrato de 220px com nome ao lado → pergunta + Online/Presencial (Online termina em ~617px) → busca/explorar → parágrafo original integral (desce via `order-last`) → demais retratos em faixa rolável de 240px.
- Mídia institucional: `hero-bg2.webp` como figura lateral na seção do Instituto (legenda "O Instituto LIZ"); `roots-soft.webp` ao lado do título do diretório, em caixa parchment com `mix-blend-multiply`, nunca sob texto ou controles.
- Sem kickers mono uppercase acima de títulos na home/diretório/perfil: a informação institucional vira metadado legível (texto normal abaixo do título ou na linha de links). `label-mono` só para rótulos de dados (ex.: legendas dos números).
- Cards do diretório: grandes, retrato 260–280px em painel ink com `object-contain` (foto inteira, sem filtro), 1/2/3 colunas.
- Perfil: retrato amplo (340–540px) + identidade; no mobile identidade e CTA vêm antes do retrato. Foto ampliável em diálogo. Barra fixa mobile discreta com primeiro nome + canal.
- Fotos de pessoas nunca recebem filtro (`photo-sepia` não é usado em retratos) nem corte.

## Limites
- Sem rótulos de destaque/ranking, sem conteúdo inventado, sem imagens geradas de pessoas.
- Movimento: GSAP leve na acolhida; respeita reduced-motion; conteúdo nunca depende da animação para aparecer.
