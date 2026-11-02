# LIZ INDICA — Sistema de design (real)

## Marca (fixa)
- Fontes: Fraunces (display), Outfit (texto), JetBrains Mono (rótulos `label-mono`).
- Cores (`src/styles.css` @theme): ink #161008, parchment #F6EFE2, gold #C6A15B (gold-soft #E2CF9D), terracotta #A9502F, sepia #57493A.
- Logos originais em `src/assets`.

## Composição
- Superfícies alternadas: parchment (acolhida, diretório) ↔ ink (como funciona, instituto), separadas por bordas gold/45.
- Acolhida: duas regiões assimétricas (texto/escolha | retratos 1.5fr/1fr). Mobile: título e escolhas no 1º viewport, retratos em faixa rolável logo abaixo.
- Cards do diretório: grandes, retrato 260–280px em painel ink com `object-contain` (foto inteira, sem filtro), 1/2/3 colunas.
- Perfil: retrato amplo (340–540px) + identidade; no mobile identidade e CTA vêm antes do retrato. Foto ampliável em diálogo. Barra fixa mobile discreta com primeiro nome + canal.
- Fotos de pessoas nunca recebem filtro (`photo-sepia` não é usado em retratos) nem corte.

## Limites
- Sem rótulos de destaque/ranking, sem conteúdo inventado, sem imagens geradas de pessoas.
- Movimento: GSAP leve na acolhida; respeita reduced-motion; conteúdo nunca depende da animação para aparecer.
