# As Leis de Mithra — leisdemithra.com

Site estático de divulgação e captação de lista de espera.
Sem build e sem dependências.

```
index.html      página completa
styles.css      estilos
script.js       estrelas, animações e envio do formulário
favicon.svg     ícone da aba
CNAME           domínio do GitHub Pages (leisdemithra.com)
robots.txt      liberação para buscadores
sitemap.xml     mapa do site
deploy.sh       publica no GitHub Pages
autor.jpg       (opcional) sua foto
og-image.jpg    (opcional) imagem de compartilhamento
```

Ver no seu computador:

```bash
cd "/Users/rafaelhfallgatter/Documents/Pessoais/Livro/site"
python3 -m http.server 8000     # depois abra http://localhost:8000
```

---

# Os 4 passos para o site entrar no ar

## Passo 1 — Entrar na sua conta GitHub pessoal

Hoje o terminal está logado como `r-hoffmann-sparring`, sua conta do trabalho.
Para publicar pela conta pessoal:

```bash
gh auth login
```

Escolha: `GitHub.com` → `HTTPS` → `Login with a web browser`.
Confirme com `gh api user --jq .login` — tem que aparecer sua conta pessoal.

## Passo 2 — Publicar

```bash
cd "/Users/rafaelhfallgatter/Documents/Pessoais/Livro/site"
./deploy.sh
```

Cria o repositório, envia os arquivos e liga o GitHub Pages. Ao final ele mostra
uma URL provisória (`https://SUACONTA.github.io/leisdemithra/`) que já funciona
na hora — útil para conferir tudo antes do domínio apontar.

## Passo 3 — Apontar o domínio na GoDaddy

Entre em https://dcc.godaddy.com/control/portfolio/leisdemithra.com/settings
e vá em **DNS → Gerenciar zonas**.

**Apague** os registros `A` que existem hoje apontando para `76.223.105.230` e
`13.248.243.5` (é a página de estacionamento da GoDaddy).

**Crie** estes cinco registros:

| Tipo | Nome | Valor | TTL |
|---|---|---|---|
| A | @ | 185.199.108.153 | 600 |
| A | @ | 185.199.109.153 | 600 |
| A | @ | 185.199.110.153 | 600 |
| A | @ | 185.199.111.153 | 600 |
| CNAME | www | SUACONTA.github.io | 600 |

Troque `SUACONTA` pelo nome da sua conta GitHub pessoal. O ponto final no fim do
CNAME a GoDaddy coloca sozinha.

A propagação leva de 10 minutos a algumas horas. Para acompanhar:

```bash
dig +short leisdemithra.com A
```

Quando devolver os quatro endereços `185.199.*`, está pronto.

## Passo 4 — Forçar HTTPS

Depois que o DNS propagar, o GitHub emite o certificado sozinho (leva mais alguns
minutos). Aí rode:

```bash
gh api -X PUT repos/SUACONTA/leisdemithra/pages -F https_enforced=true
```

Pronto: https://leisdemithra.com no ar, com cadeado.

---

# A lista de espera

**Estado atual:** ATIVA. Os cadastros vão para o Formspree
(`https://formspree.io/f/xrpgnraw`), ficam salvos no painel de lá e você recebe
notificação no `rafaelhfallgatter@gmail.com`. O mailto continua no código apenas
como rede de segurança, caso o endpoint seja apagado.

**Para ativar de verdade:**

1. Crie uma conta em https://formspree.io com o `rafaelhfallgatter@gmail.com`
2. Crie um formulário novo — você recebe uma URL como `https://formspree.io/f/xdkoqwer`
3. Cole em [`script.js`](script.js), na linha `const FORM_ENDPOINT = "";`

   ```js
   const FORM_ENDPOINT = "https://formspree.io/f/xdkoqwer";
   ```

4. Republique: `./deploy.sh`

A partir daí cada cadastro fica salvo no painel do Formspree (de onde você exporta
um CSV no lançamento) e você recebe uma notificação no Gmail.

**Atenção ao limite:** o plano grátis do Formspree para em 50 cadastros por mês, e
acima disso o envio é recusado sem o visitante perceber. Se esperar volume maior,
comece direto no [Buttondown](https://buttondown.email) ou
[Beehiiv](https://beehiiv.com) — eles guardam a lista e ainda disparam o e-mail de
lançamento para todo mundo, coisa que o Formspree não faz.

---

# Ajustes opcionais

**Sua foto:** salve como `autor.jpg` nesta pasta (vertical, ~480×600). Sem o
arquivo, o site mostra um bloco com as iniciais — nada quebra.

**Imagem de compartilhamento:** salve `og-image.jpg` (1200×630). É o que aparece
quando mandam o link no WhatsApp ou LinkedIn.

**Textos:** todos em `index.html`, cada seção com um comentário (`<!-- HERO -->`,
`<!-- PERSONAGENS -->`, etc.).

**Cores:** no bloco `:root` do topo de `styles.css`.

Depois de qualquer alteração, `./deploy.sh` publica de novo.
