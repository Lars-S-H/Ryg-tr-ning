# Rygtræning 💪

En lille web-app (PWA) med daglig rygtræning til Laura (TeamGym, Gladsaxe IF).

- **17 rygvenlige øvelser** med animerede streg-figurer. De er valgt, fordi det gør ondt ved **fremadbøjning**: ingen sit-ups eller "rør tæerne", men fokus på neutral ryg og hoftehængsel.
- **Plan i 3 faser** (uge 1–2, 3–5 og 6+) på ca. 20 minutter. På klubdage (tir, ons, søn) er der et kort program på ca. 10 minutter, og der er en "Let dag" til, når ryggen er øm.
- **Guidet træning** med timer, pauser og lyd, smerteskala før og efter samt noter.
- **Fremgang**: stime 🔥, kalender, smertegraf og mærker.
- **Forældreoverblik** (`foraelder.html`) og push-besked til forældre via ntfy.
- Virker uden internet og kan lægges på hjemmeskærmen på iPhone.

## 1. Udgiv appen

Repoet er **privat**. GitHub Pages kræver et offentligt repo, medmindre man har GitHub Pro. Du kan vælge mellem to løsninger:

**A) GitHub Pages (enklest).** Gør repoet offentligt: *Settings → General → Change visibility → Public*. Der ligger ingen hemmeligheder i koden, for familienøglen findes kun i linkene. Gå derefter til *Settings → Pages → Source: Deploy from a branch → `main` / `(root)` → Save*.
Efter 1–2 minutter ligger appen på `https://lars-s-h.github.io/Ryg-tr-ning/`.

**B) Netlify (repoet kan forblive privat).** Opret en gratis konto på netlify.com, vælg *Add new site → Import from Git → GitHub*, og vælg repoet. Der er ingen build-kommando, og publish-mappen er `/`.

## 2. Del med forældre (valgfrit, ca. 5 min)

1. Gå til <https://console.firebase.google.com>, vælg **Opret projekt** (Google Analytics er ikke nødvendigt).
2. Vælg **Build → Realtime Database → Create database**, vælg placeringen *Belgium (europe-west1)* og *Start in locked mode*.
3. Vælg fanen **Rules**, indsæt følgende og tryk **Publish**:
   ```json
   {
     "rules": {
       ".read": false,
       ".write": false,
       "familier": {
         "$k": { ".read": "$k.length >= 12", ".write": "$k.length >= 12" }
       }
     }
   }
   ```
   Data kan kun læses af nogen, der kender den hemmelige familienøgle.
4. Kopiér databasens adresse (fx `https://xxx-default-rtdb.europe-west1.firebasedatabase.app`) og sæt den ind i `config.js` som `FIREBASE_DB_URL`.

## 3. Kom i gang

1. Åbn `…/foraelder.html` og tryk **Opret familienøgle**.
2. Send **Lauras link** til hende. Hun åbner det i Safari og vælger **Del → Føj til hjemmeskærm**.
3. Gem dit eget link som bogmærke.
4. Hvis du vil have en besked efter hver træning, så hent appen **ntfy** og abonnér på det emne, der står på forældresiden. Det virker også uden Firebase.

## Tilpasning

- **Farver**: `--brand` og `--accent` øverst i `css/app.css`.
- **Øvelser og animationer**: `js/exercises.js`.
- **Plan, sæt og gentagelser**: `js/plan.js`.
- Har Laura fået øvelser af en fysioterapeut, kan de lægges ind i `js/exercises.js` og `js/plan.js`.
- Ved ændringer skal `VERSION` i `sw.js` hæves, så telefonen henter den nye version.

> Appen er ikke en erstatning for fysioterapeut eller læge.
