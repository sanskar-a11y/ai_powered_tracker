# AI Productivity OS

Scaffold for the AI Productivity OS project. This repository contains TypeScript + Next.js (App Router) scaffold and project structure. It is a scaffold only — Node/npm and Git must be available locally to install dependencies, initialize git, and push to a remote.

Quick local setup (run after installing Node.js and Git):

```powershell
npm install
npx tailwindcss init -p
npm run dev
```

Git setup (if remote not yet added):

```powershell
git init
git add .
git commit -m "Initial scaffold"
git remote add origin <YOUR_REPO_URL>
git branch -M main
git push -u origin main
```

Security:
- Do NOT put API keys in this repo.
- Add secrets to `.env.local` (already in `.gitignore`).
