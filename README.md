# CHRIF Backend (MongoDB Atlas)

Versione del backend che usa **MongoDB Atlas** con **Mongoose**.

## Avvio

```bash
cd chrif-backend-mongo
cp .env.example .env
# Imposta MONGODB_URI con la stringa di connessione Atlas
npm install
npm run start   # oppure: npm run dev
```

## Configurazione Atlas

1. Crea un cluster su MongoDB Atlas.
2. Crea un utente database con username/password.
3. Aggiungi il tuo IP a *Network Access* (o 0.0.0.0/0 per test).
4. Imposta `MONGODB_URI` nel `.env`, ad es.:
   ```
   MONGODB_URI=mongodb+srv://user:pass@cluster0.xxxxx.mongodb.net/chrif?retryWrites=true&w=majority&appName=chrif-app
   ```

## Endpoints (identici alla versione SQLite)
- `GET /api/health`
- **Auth:** `POST /api/auth/register`, `POST /api/auth/login`
- **Site:** `GET /api/site`, `PUT /api/site` (JWT)
- **Skills:** `GET /api/skills`, `POST /api/skills` (JWT), `PUT /api/skills/:id` (JWT), `DELETE /api/skills/:id` (JWT)
- **Projects:** `GET /api/projects`, `GET /api/projects/:id`, `POST /api/projects` (JWT), `PUT /api/projects/:id` (JWT), `DELETE /api/projects/:id` (JWT)
- **Social:** `GET /api/social-links`, `POST /api/social-links` (JWT), `PUT /api/social-links/:id` (JWT), `DELETE /api/social-links/:id` (JWT)
- **Contact:** `POST /api/contact`
- **Export:** `GET /api/export`
- **Uploads:** `POST /api/uploads` (JWT) — multipart field: `file`

## Note
- I documenti hanno `_id` (stringa ObjectId) invece di `id` numerico.
- `SiteInfo` è un *singleton*: la GET lo crea se non esiste.
- Tutto il resto del frontend può restare invariato, a parte i campi `id` → `_id` nelle rotte admin se li usi esplicitamente.