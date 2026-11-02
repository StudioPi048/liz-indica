# LIZ INDICA — Produto (fatos)

- Diretório oficial de psicogenealogistas formados/indicados pelo Instituto LIZ.
- Dados vêm só do banco (`professionals`, `published = true`), ordem `sort_order`, depois nome.
- Listagem pública aplica `dedupeForDirectory` (mesmo nome + mesma foto aparece uma vez); todos os perfis seguem acessíveis por URL.
- Contato: apenas o canal cadastrado (`getPrimaryContact`); sem canal, nota honesta.
- Favoritos só no dispositivo (localStorage `liz-favoritos`), sem login.
- Áreas restritas preservadas: `/auth`, `/admin`, `/profissional`.
- Não existem no produto: preços, agenda, avaliações, ranking, depoimentos ou diagnóstico.

## Percurso da home
1. Acolhida: título + escolha Online (filtra modalidade online real) ou Presencial (país/cidade opcionais, "Ver profissionais" / "Explorar sem escolher local"); busca por nome/local; "Explorar todos os profissionais". Ao lado, as 3 primeiras pessoas com foto na ordem do diretório (sem rótulo de destaque).
2. Faixa "Como funciona" (3 passos originais) + "Como escolher?" (modalidade, formação, canais).
3. Diretório `#diretorio` "Conheça as pessoas da rede" (6 por vez, "Ver mais"), filtros extras em painel.
4. Instituto (inclui a frase "A Maior Rede de Psicogenealogistas do Mundo"), números institucionais, formulário "Quero ser indicado".

## Decisão de direção
Pietro rejeitou a versão 14c47186 ("diminuiu as fotos... não melhorou") e delegou a escolha em 02/11/2026: "Pode seguir com a que você achar melhor, mas a experiência do usuário conta, não quero que fique parecendo um grande catálogo". Direção escolhida: C+A — acolhimento e escolha guiada com presença humana.
