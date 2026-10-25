# Build the static site on the native build platform (output is architecture independent)
FROM --platform=$BUILDPLATFORM node:24.22.1-alpine3.24 AS build
WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
# Corepack installs the pnpm version pinned in package.json's packageManager field
ENV COREPACK_ENABLE_DOWNLOAD_PROMPT=0
RUN corepack enable && CI=true pnpm install --frozen-lockfile

COPY . .
# PocketBase is reverse proxied by Caddy on the same origin, so a relative URL works for any domain
ARG VITE_POCKETBASE_URL=/
ENV VITE_POCKETBASE_URL=$VITE_POCKETBASE_URL
RUN VITE_APP_VERSION="$(node -p "require('./package.json').version")" pnpm build

FROM caddy:2.11.7-alpine
COPY Caddyfile /etc/caddy/Caddyfile
COPY --from=build /app/dist /srv
