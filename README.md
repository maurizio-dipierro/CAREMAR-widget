# README.md

## Panoramica del serivzio proxy

`ragapp_proxy` è un servizio proxy basato su FastAPI progettato per:

* Generare e gestire token client per conversazioni (`/shop/token`).
* Inoltrare in streaming le query verso un servizio RAG esterno (`/widget/query`).
* Raccogliere e inoltrare feedback degli utenti (`/feedback`).
* Fornire endpoint di **health** e **version** per il monitoraggio.

Il proxy supporta compressione GZip, configurazione CORS opzionale e caching in memoria dei token client.

---

## Caratteristiche principali

* **FastAPI** per prestazioni elevate e semplicità di sviluppo.
* **Cache TTL**: utilizzo di una cache in memoria con TTL (Time‑To‑Live) di default 900 secondi per ogni token client (max 1024 token). Ogni token scade automaticamente dopo il TTL, riducendo il rischio di riutilizzo e limitando l’uso di memoria.
* **Sicurezza e validazione**: autenticazione tramite `X-API-Key` per proteggere gli endpoint `/shop/token` e `/feedback`, generazione di token casuali sicuri con `secrets.token_hex`, validazione dei payload in ingresso con Pydantic, gestione CORS configurabile via variabili d’ambiente, middleware GZip per evitare potenziali attacchi basati su payload troppo grandi, logging dettagliato e raccomandazione di esporre il servizio solo tramite HTTPS in produzione.
* **Middleware GZip** per risparmiare banda su payload di grandi dimensioni.
* **Middleware CORS** opzionale, configurabile tramite variabili d'ambiente.
* Endpoint di health check (`/healthz`) e versione (`/version`).

---

## Prerequisiti

* Python 3.9 o superiore
* `pip`

---

## Installazione

1. Clona il repository:

   ```shell
   git clone https://tuo-repo-url.git
   cd tuo-repo
   ```

2. Installa le dipendenze:

   ```shell
   pip install -r requirements.txt
   ```

3. Crea un file `.env` in radice con le seguenti variabili:

   ```dotenv
   SHOP_API_TOKEN=tuo_shop_api_token
   RAGAPP_QUERY_URL=https://api.ragapp.com/query
   RAGAPP_FEEDBACK_URL=https://api.ragapp.com/feedback
   RAG_APP_API_KEY=tuo_rag_app_api_key
   ENABLE_CORS=true            # o false per disabilitare
   CORS_ALLOW=http://localhost:9998 # domini permessi, separati da virgola
   ```

---

## Avvio del server

Avvia l'applicazione FastAPI con Uvicorn:

```shell
uvicorn ragapp_proxy:app --port 9000
```

L'applicazione sarà raggiungibile su `http://localhost:9000`.

---

## Endpoints disponibili

### `GET /shop/token`

* **Descrizione:** Genera un nuovo `client_token` per la conversazione.
* **Header richiesti:** `X-API-Key: <SHOP_API_TOKEN>`
* **Risposta:**

  ```json
  { "client_token": "<token_esadecimale>" }
  ```

### `GET /healthz`

* **Descrizione:** Health check (incluso non esposto nello schema OpenAPI).
* **Risposta:** `{ "status": "ok" }`

### `GET /version`

* **Descrizione:** Restituisce la versione dell'app (incluso non esposto nello schema OpenAPI).
* **Risposta:** `{ "version": "<VERSION>" }`

### `POST /widget/query`

* **Descrizione:** Inoltra in streaming la query RAG.
* **Header richiesti:** Nessuno oltre a quelli di default.
* **Body (JSON):**

  ```json
  {
    "client_token": "<token>",
    "query": "<testo domanda>"
  }
  ```
* **Risposta:** Streaming binario (`application/octet-stream`).

### `POST /feedback`

* **Descrizione:** Raccoglie feedback ed inoltra al servizio RAG.
* **Header richiesti:** `X-API-Key: <SHOP_API_TOKEN>`
* **Body (JSON):**

  ```json
  {
    "client_token": "<token>",
    "question": "<domanda utente>",
    "answer": "<risposta fornita>",
    "feedback": "True"|"False",
    "comment": "<commento opzionale>"
  }
  ```

---

## Esempi di utilizzo con `curl`

### 1. Ottenere il client token

```shell
curl -H "X-API-Key: 441c1616-3d44-11f0-8149-afe873d6c675" \
     http://localhost:9000/shop/token
```

Risposta:

```json
{ "client_token": "135af434b08c0cf9bbdbc47336a137e0" }
```

### 2. Effettuare una query RAG

```shell
curl -X POST \
     -H "Content-Type: application/json" \
     -d '{
         "client_token": "135af434b08c0cf9bbdbc47336a137e0",
         "query": "Come posso richiedere informazioni sulla RAG?"
     }' \
     http://localhost:9000/widget/query
```

(Il server risponderà in streaming con i dati RAG.)

### 3. Inviare feedback

```shell
curl -X POST \
     -H "Content-Type: application/json" \
     -H "X-API-Key: 441c1616-3d44-11f0-8149-afe873d6c675" \
     -d '{
         "client_token": "135af434b08c0cf9bbdbc47336a137e0",
         "question": "Come posso richiedere informazioni sulla RAG?",
         "answer": "Puoi richiedere via email a support@ragapp.com",
         "feedback": "True",
         "comment": "Molto utile"
     }' \
     http://localhost:9000/feedback
```

---

## Note aggiuntive

* La cache dei token è in RAM: al riavvio del processo, tutti i token scadono.
* Il middleware CORS è abilitato solo se `ENABLE_CORS` è impostato a `true`.
* Regola `CLIENTS_TOKEN_TTL` e `CLIENTS_TOKEN_MAX_SIZE` via variabili d'ambiente per scalabilità.

---

