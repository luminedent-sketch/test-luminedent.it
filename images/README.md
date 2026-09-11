# OG images

`og-image.png` (IT) e `og-image-en.png` (EN) — 1200x630, generate dai token CSS
del sito (--teal #0E9C87, --paper #F5FBFA, Plus Jakarta Sans) e dal listino
attuale: impianto 400€, faccette E-max 300€/dente, All-on-4 da 4.640€.

## Al go-live su luminedent.it

Il tag `og:image` di tutte le pagine punta al dominio di test:

    https://test-luminedent-it.vercel.app/images/...

Prima di puntare il dominio, sostituirlo su tutte le pagine:

    grep -rl test-luminedent-it.vercel.app/images --include="*.html" . \
      | xargs sed -i '' 's|https://test-luminedent-it.vercel.app/images/|https://luminedent.it/images/|g'

Il sito vecchio serve un `/images/og-image.png` diverso: Facebook e LinkedIn
possono tenerlo in cache. Dopo il passaggio, forzare il refresh dai rispettivi
Sharing Debugger, oppure rinominare i file in `og-image-v2.png` /
`og-image-en-v2.png` e aggiornare i tag.
