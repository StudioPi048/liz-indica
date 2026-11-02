# LIZ INDICA — Sistema de design (real)

## Marca (fixa)
- Fontes: Fraunces (display), Outfit (texto), JetBrains Mono (rótulos `label-mono`).
- Cores (`src/styles.css` @theme): ink #161008, parchment #F6EFE2, gold #C6A15B (gold-soft #E2CF9D), terracotta #A9502F, sepia #57493A.
- Logos originais em `src/assets`.

## Composição
- Superfícies alternadas: parchment (acolhida, diretório) ↔ ink (como funciona, instituto), separadas por bordas gold/45.
- Acolhida (revogado: carrossel de 3 fichas, rejeitado por Pietro). Agora: título → faixa contínua "Conheça a rede LIZ" de largura total → escolhas Online/Presencial (esq.) + busca, links e parágrafo original (dir.; no mobile abaixo).
- Faixa: TODAS as pessoas do diretório (mesmo conjunto deduplicado; sem foto = iniciais), retratos quadrados de tamanho único (224px desktop, 168px mobile) com `object-contain` sobre `--color-portrait`, nome abaixo, sem moldura/sombra/cidade/contador. Rolagem horizontal nativa; GSAP ticker avança ~26px/s constante. Início aleatório por visita, ordem do diretório. Pausa em hover, foco, toque, fora da tela, aba oculta; botão Pausar/Retomar prevalece. Teclado: um único link tabulável, setas/Home/End percorrem.
- Fecho do loop: no encontro da faixa entram cópias visuais dos primeiros retratos, só para preencher a largura do loop. São acionáveis — link real para o mesmo perfil da pessoa mostrada — com `aria-hidden="true"` e `tabIndex={-1}`, ou seja, fora da sequência de tabulação e da leitura de tela, **sem `inert`** (revogado: "clones inert, sem links"). Foto, nome e clique apontam sempre para a mesma pessoa, e a sequência lógica continua única (originais: um só item tabulável).
- Toque: a pausa temporária aberta em pointerdown é encerrada por pointerup, **pointercancel** ou **lostpointercapture** (a rolagem nativa cancela o ponteiro) com timer de retomada; Retomar também limpa essa pausa temporária, então retoma de fato. Pausa explícita continua prevalecendo.
- Movimento reduzido: sem autoplay **e sem botão Pausar/Retomar**; aparece a nota "Movimento automático desligado pelo seu dispositivo. Role para o lado ou use as setas." e a navegação manual (rolagem, setas, abrir perfil) permanece completa.
- Mídia institucional: `hero-bg2.webp` como figura lateral na seção do Instituto (legenda "O Instituto LIZ"); `roots-soft.webp` ao lado do título do diretório, em caixa parchment com `mix-blend-multiply`, nunca sob texto ou controles.
- Sem kickers mono uppercase acima de títulos na home/diretório/perfil: a informação institucional vira metadado legível (texto normal abaixo do título ou na linha de links). `label-mono` só para rótulos de dados (ex.: legendas dos números).
- Cards do diretório: grandes, retrato 260–280px em painel ink com `object-contain` (foto inteira, sem filtro), 1/2/3 colunas.
- Perfil: retrato amplo (340–540px) + identidade; no mobile identidade e CTA vêm antes do retrato. Foto ampliável em diálogo. Barra fixa mobile discreta com primeiro nome + canal.
- Fotos de pessoas nunca recebem filtro (`photo-sepia` não é usado em retratos) nem corte.

## Limites
- Sem rótulos de destaque/ranking, sem conteúdo inventado, sem imagens geradas de pessoas.
- Movimento: GSAP leve na acolhida; respeita reduced-motion; conteúdo nunca depende da animação para aparecer.
