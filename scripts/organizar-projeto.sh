#!/bin/bash

echo "🧹 Iniciando organização do projeto..."

# Mover screenshots para docs/screenshots
if [ -d "audit-screenshots" ] && [ "$(ls -A audit-screenshots)" ]; then
    echo "📦 Movendo screenshots para docs/screenshots/"
    mkdir -p docs/screenshots
    mv audit-screenshots/* docs/screenshots/
    rmdir audit-screenshots 2>/dev/null || true
fi

# Mover propostas para docs/proposals
if [ -d "proposals/takamura" ]; then
    echo "📦 Movendo propostas para docs/proposals/"
    mkdir -p docs/proposals
    mv proposals/takamura/* docs/proposals/
    rmdir proposals/takamura 2>/dev/null || rmdir proposals 2>/dev/null || true
fi

# Mover scripts auxiliares para docs/scripts
if [ -d "scripts" ] && [ "$(ls -A scripts)" ] && [ ! "$(ls -A scripts/.cache)" ]; then
    echo "📦 Movendo scripts para docs/scripts/"
    mkdir -p docs/scripts
    mv scripts/* docs/scripts/
    rmdir scripts 2>/dev/null || true
fi

# Mover docs-locales para docs
if [ -d "docs-local" ]; then
    echo "📦 Movendo docs-locales para docs/"
    mv docs-local/* docs/
    rmdir docs-local 2>/dev/null || true
fi

# Limpar cache vazio
if [ -d "scripts/.cache" ] && [ ! "$(ls -A scripts/.cache)" ]; then
    echo "🗑️  Removendo cache vazio"
    rmdir scripts/.cache
fi

# Remover opencode se não for usado
if [ -d ".opencode" ]; then
    echo "🗑️  Removendo .opencode"
    rm -rf .opencode
fi

# Remover overclock-app se não for usado
if [ -d ".overclock-app" ]; then
    echo "🗑️  Removendo .overclock-app"
    rm -rf .overclock-app
fi

echo "✅ Organização concluída!"
