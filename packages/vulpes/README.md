# Rodar build

Em caso de problemas com o prettier ao rodar build

```bash
cd packages/vulpes

npx prettier --write --end-of-line lf "src/**/*.{ts,tsx}"

# Remover arquivos do index
git rm --cached -r .

# Normalizar line endings
git add --renormalize .

cd ../../
```

# Rodar servidor

```bash
npm run dev
```
