#!/usr/bin/env bash
# ============================================================
#  As Leis de Mithra — publicação no GitHub Pages
#  Uso:  ./deploy.sh
#  Pré-requisito: estar logado na sua conta GitHub PESSOAL
#                 (rode antes:  gh auth login)
# ============================================================
set -euo pipefail

REPO="leisdemithra"
DOMINIO="leisdemithra.com"
EMAIL="rafaelhfallgatter@gmail.com"

cd "$(dirname "$0")"

# ── 1. confere o login ──────────────────────────────────────
if ! gh auth status >/dev/null 2>&1; then
  echo "✗ Você não está logado no GitHub. Rode:  gh auth login"; exit 1
fi
CONTA=$(gh api user --jq .login)
echo "→ Publicando pela conta GitHub: $CONTA"
if [ "$CONTA" = "r-hoffmann-sparring" ]; then
  echo "⚠  Esta é a conta do trabalho. Se quiser a pessoal, rode 'gh auth login' antes."
  read -r -p "   Continuar mesmo assim? [s/N] " ok
  [ "$ok" = "s" ] || exit 1
fi

# ── 2. repositório local ────────────────────────────────────
if [ ! -d .git ]; then
  git init -q -b main
  git config user.name "Rafael Hoffmann Fallgatter"
  git config user.email "$EMAIL"
fi
git add -A
git commit -q -m "Site de lançamento de As Leis de Mithra" || echo "→ Nada novo para commitar"

# ── 3. repositório remoto ───────────────────────────────────
if gh repo view "$CONTA/$REPO" >/dev/null 2>&1; then
  echo "→ Repositório já existe, enviando atualização"
  git remote get-url origin >/dev/null 2>&1 || git remote add origin "https://github.com/$CONTA/$REPO.git"
  git push -q -u origin main
else
  echo "→ Criando repositório $CONTA/$REPO"
  gh repo create "$REPO" --public --source=. --push \
     --description "Site de lançamento do romance As Leis de Mithra"
fi

# ── 4. liga o GitHub Pages ──────────────────────────────────
echo "→ Ativando o GitHub Pages"
gh api -X POST "repos/$CONTA/$REPO/pages" \
   -f "source[branch]=main" -f "source[path]=/" >/dev/null 2>&1 \
 || echo "  (Pages já estava ativo)"

gh api -X PUT "repos/$CONTA/$REPO/pages" -f "cname=$DOMINIO" >/dev/null 2>&1 \
 || echo "  (domínio já configurado)"

echo
echo "✓ Publicado."
echo "  Provisório : https://$CONTA.github.io/$REPO/"
echo "  Definitivo : https://$DOMINIO  (depois do DNS na GoDaddy)"
echo
echo "Quando o DNS estiver propagado, rode para forçar HTTPS:"
echo "  gh api -X PUT repos/$CONTA/$REPO/pages -F https_enforced=true"
