# Project Game

Project Game is a web-based project management simulation. Players bid on a project and then, week by week, hire workers, rent equipment, take loans and allocate resources to activities while reacting to events, ending with a survey. An admin creates games, adds players and follows progress, bids and results live, with a presentation view for running a session in class. Without a server connection the game can be played in freeplay mode, where progress isn't saved.

It is built with Vue 3, TypeScript and Vite, with [PocketBase](https://pocketbase.io/) as the backend.

## Deployment
The app is deployed with Docker Compose:
- `ghcr.io/blumbye/project-game`: the built site served by [Caddy](https://caddyserver.com/) with automatic HTTPS. It also proxies `/api` and `/_` (admin UI) to PocketBase.
- `ghcr.io/muchobien/pocketbase`: community PocketBase 0.22 image. On first start the schema from `pb_schema.json` is imported and the admin account is created.
- `nickfedor/watchtower`: checks for a new app image every 5 minutes and restarts the app with it.

### Building the image
The workflow **Publish Docker image** runs on every push to `master`, and can also be run manually under **Actions → Publish Docker image → Run workflow** for any branch.

1. The image is tagged `latest` (`master`), `<branch>` and `sha-<commit>`.
2. The first time, make the package public under the account's **Packages** settings (or run `docker login ghcr.io` on the server).

### Deploying
On a server with Docker and a domain pointing to it (ports 80 and 443 open):

1. Run this on the server to download the deployment files (requires `curl`). Existing `.env` settings are preserved:
   ```bash
   mkdir -p ~/project-game && cd ~/project-game && (
     for file in docker-compose.yml .env.example pb_schema.json; do
       curl -fSLO "https://raw.githubusercontent.com/BLumbye/project-game/master/$file" || exit 1
     done
     cp -n .env.example .env
   )
   ```
2. Fill in `DOMAIN`, `PB_ADMIN_EMAIL` and `PB_ADMIN_PASSWORD` in `.env`.
3. Start it from that folder:
   ```shell
   docker compose up -d
   ```

The site is then available at `https://<DOMAIN>` and the PocketBase admin UI at `https://<DOMAIN>/_/`.

Updates are automatic: pushing to `master` publishes a new image, which is deployed within a few minutes. Changes to `docker-compose.yml` itself still need `docker compose up -d` on the server.

The schema is only imported into an empty database. Later schema changes must be made in the admin UI (or by importing the JSON there); export them again via **Settings → Export collections** and update `pb_schema.json` here. Data lives in the `pb_data` Docker volume.

### Note about running locally (when testing)
To run on your localhost, enable pnpm with `corepack enable` and use
```
pnpm install
pnpm dev
```
For this to work, you'll need a connection to the server. Get this by creating an .env file in the root folder of the project and adding:
```
VITE_POCKETBASE_URL=https://v2202303182271221643.ultrasrv.de/
VITE_APP_VERSION=$npm_package_version
```