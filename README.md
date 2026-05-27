## app template

Monorepo scaffold:
- `frontend`: Vite + React + TypeScript
- `backend`: FastAPI + SQLite
- `deploy`: Nginx + systemd + deploy scripts

### Local development

Backend:
```bash
cd backend
python -m venv .venv
. .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

Frontend:
```bash
cd frontend
npm install
npm run dev
```

### Build release

```bash
./scripts/release.sh
```
## Hi there 👋

<!--
**sunxu42/sunxu42** is a ✨ _special_ ✨ repository because its `README.md` (this file) appears on your GitHub profile.

Here are some ideas to get you started:

- 🔭 I’m currently working on ...
- 🌱 I’m currently learning ...
- 👯 I’m looking to collaborate on ...
- 🤔 I’m looking for help with ...
- 💬 Ask me about ...
- 📫 How to reach me: ...
- 😄 Pronouns: ...
- ⚡ Fun fact: ...
-->
