# LIZ INDICA — Sistema de design (real)

## Marca (fixa)
- Fontes: Fraunces (display), Outfit (texto), JetBrains Mono (rótulos `label-mono`).
- Cores (`src/styles.css` @theme): ink #161008, parchment #F6EFE2, gold #C6A15B (gold-soft #E2CF9D), terracotta #A9502F, sepia #57493A.
- Logos originais em `src/assets`.

## Composição
- Superfícies alternadas: parchment (acolhida, diretório) ↔ ink (como funciona, instituto), separadas por bordas gold/45.
- Acolhida: carrossel rotativo "Conheça nossa rede" com TODAS as pessoas do diretório (mesmo conjunto deduplicado, com ou sem foto; sem foto = iniciais). Desktop: 3 cartões iguais (foto em caixa de 200px, legenda de altura fixa 88px para nada se mover). Mobile: 1 cartão com foto de 220px e nome/local ao lado, controles logo abaixo; Online/Presencial seguem no 1º viewport (Online termina ~675px em 390×844).
- Carrossel: avança 1 posição a cada 5,5s (tempo igual por passo), início aleatório por visita definido após montar, ordem do diretório preservada; pausa em hover, foco interno, fora da tela e aba oculta; pausa explícita prevalece; movimento reduzido inicia pausado. Só os cartões visíveis são montados + pré-carga da próxima foto. Nunca rotular como destaque.
- Mídia institucional: `hero-bg2.webp` como figura lateral na seção do Instituto (legenda "O Instituto LIZ"); `roots-soft.webp` ao lado do título do diretório, em caixa parchment com `mix-blend-multiply`, nunca sob texto ou controles.
- Sem kickers mono uppercase acima de títulos na home/diretório/perfil: a informação institucional vira metadado legível (texto normal abaixo do título ou na linha de links). `label-mono` só para rótulos de dados (ex.: legendas dos números).
- Cards do diretório: grandes, retrato 260–280px em painel ink com `object-contain` (foto inteira, sem filtro), 1/2/3 colunas.
- Perfil: retrato amplo (340–540px) + identidade; no mobile identidade e CTA vêm antes do retrato. Foto ampliável em diálogo. Barra fixa mobile discreta com primeiro nome + canal.
- Fotos de pessoas nunca recebem filtro (`photo-sepia` não é usado em retratos) nem corte.

## Limites
- Sem rótulos de destaque/ranking, sem conteúdo inventado, sem imagens geradas de pessoas.
- Movimento: GSAP leve na acolhida; respeita reduced-motion; conteúdo nunca depende da animação para aparecer.
