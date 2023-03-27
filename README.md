# Vue 3 + TypeScript + Vite

This template should help get you started developing with Vue 3 and TypeScript in Vite. The template uses Vue 3 `<script setup>` SFCs, check out the [script setup docs](https://v3.vuejs.org/api/sfc-script-setup.html#sfc-script-setup) to learn more.

## Recommended IDE Setup

- [VS Code](https://code.visualstudio.com/) + [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur) + [TypeScript Vue Plugin (Volar)](https://marketplace.visualstudio.com/items?itemName=Vue.vscode-typescript-vue-plugin).

## Type Support For `.vue` Imports in TS

TypeScript cannot handle type information for `.vue` imports by default, so we replace the `tsc` CLI with `vue-tsc` for type checking. In editors, we need [TypeScript Vue Plugin (Volar)](https://marketplace.visualstudio.com/items?itemName=Vue.vscode-typescript-vue-plugin) to make the TypeScript language service aware of `.vue` types.

If the standalone TypeScript plugin doesn't feel fast enough to you, Volar has also implemented a [Take Over Mode](https://github.com/johnsoncodehk/volar/discussions/471#discussioncomment-1361669) that is more performant. You can enable it by the following steps:

1. Disable the built-in TypeScript Extension
   1. Run `Extensions: Show Built-in Extensions` from VSCode's command palette
   2. Find `TypeScript and JavaScript Language Features`, right click and select `Disable (Workspace)`
2. Reload the VSCode window by running `Developer: Reload Window` from the command palette.

## Deployment
The project requires a Supabase instance to be available. The following guide walks through setting the self-hosted version of Supabase up, setting up a NGINX reverse proxy in front of the supabase instance and adding basic auth to Supabase Studio. Lastly it uses PM2 to host the website itself. The guide applies to Debian/Ubuntu systems.

### Set up Supabase
First of all, Docker together with Docker Compose should be installed.

Checkout the Supabase repo:
```shell
git clone --depth 1 https://github.com/supabase/supabase
cd supabase/docker
cp .env.example .env
```

Use the [JWT Generator](https://supabase.com/docs/guides/self-hosting#api-keys) to generate an `ANON_KEY` and a `SERVICE_KEY`. In the `.env` file replace:
- `ANON_KEY` with the generated `ANON_KEY`
- `SERVICE_ROLE_KEY` with the generated `SERVICE_KEY`
- `JWT_SECRET` with the secret used to generate the keys
- `POSTGRES_PASSWORD` with a desired password for Postgres
- `API_EXTERNAL_URL` with `http://localhost:8000`
- `ENABLE_EMAIL_AUTOCONFIRM` with `true`
- `STUDIO_PORT` with `3050`
- `SUPABASE_PUBLIC_URL` with the external URL to access Supabase Studio followed by `:3000` to ensure it is running on port 3000

In the top of the `volumes/api/kong.yml` file replace:
- The key for the consumer named `anon` with the generated `ANON_KEY`
- The key for the consumer named `service_role` with the generated `SERVICE_KEY`

Run the supabase instance in the background by using `docker compose up -d`.

### Set up NGINX
Install NGINX:
```shell
sudo apt install nginx
```

Disable the default NGINX configuration:
```shell
sudo unlink /etc/nginx/sites-enabled/default
```

Clone and insert the config file for Supabase:
```shell
git clone https://gist.github.com/cc5f3c7aea6ad994cb682df3da0acba2.git ./tmp-supabase
mv ./tmp-supabase/supabase.conf /etc/nginx/sites-available/supabase.conf
rm -rf ./tmp-supabase
```

Set up symbolic link to enable config:
```shell
sudo ln -s /etc/nginx/sites-available/supabase.conf /etc/nginx/sites-enabled/
```

Set up basic auth, replace `<username>` and `<password>` with desired username and password:
```
sudo apt install apache2 apache2-utils
sudo htpasswd -c -b /etc/nginx/.htpasswd <username> <password>
```

Restart NGINX:
```shell
sudo systemctl restart nginx
```

### Set up firewall
This part very much depends on the firewall used, but in general traffic should be allowed through port `80` and `3000`, with everything else blocked, especially port `3050`. The following guide goes through setting this up with ufw.

Start out by installing UFW:
```shell
sudo apt install ufw
```

Then setup the firewall to deny all incoming traffic and allow all outgoing traffic by default:
```shell
sudo ufw default deny incoming
sudo ufw default allow outgoing
```

Then allow your SSH connection, which by default is at port 22/tcp, which can be done like so:
```shell
sudo ufw allow ssh
```

Then allow the port for the website, which is port 80:
```shell
sudo ufw allow 80/tcp
```

UFW is actually a layer on top of the built-in iptables in Linux, which Docker also interacts with directly, meaning Docker bypasses the firewall setup here. To enable compatability we follow [this guide by chaifeng](https://github.com/chaifeng/ufw-docker#solving-ufw-and-docker-issues). We simply need to add the following snippet to the end of the UFW config file `/etc/ufw/after.rules`:
```
# BEGIN UFW AND DOCKER
*filter
:ufw-user-forward - [0:0]
:ufw-docker-logging-deny - [0:0]
:DOCKER-USER - [0:0]
-A DOCKER-USER -j ufw-user-forward

-A DOCKER-USER -j RETURN -s 10.0.0.0/8
-A DOCKER-USER -j RETURN -s 172.16.0.0/12
-A DOCKER-USER -j RETURN -s 192.168.0.0/16

-A DOCKER-USER -p udp -m udp --sport 53 --dport 1024:65535 -j RETURN

-A DOCKER-USER -j ufw-docker-logging-deny -p tcp -m tcp --tcp-flags FIN,SYN,RST,ACK SYN -d 192.168.0.0/16
-A DOCKER-USER -j ufw-docker-logging-deny -p tcp -m tcp --tcp-flags FIN,SYN,RST,ACK SYN -d 10.0.0.0/8
-A DOCKER-USER -j ufw-docker-logging-deny -p tcp -m tcp --tcp-flags FIN,SYN,RST,ACK SYN -d 172.16.0.0/12
-A DOCKER-USER -j ufw-docker-logging-deny -p udp -m udp --dport 0:32767 -d 192.168.0.0/16
-A DOCKER-USER -j ufw-docker-logging-deny -p udp -m udp --dport 0:32767 -d 10.0.0.0/8
-A DOCKER-USER -j ufw-docker-logging-deny -p udp -m udp --dport 0:32767 -d 172.16.0.0/12

-A DOCKER-USER -j RETURN

-A ufw-docker-logging-deny -m limit --limit 3/min --limit-burst 10 -j LOG --log-prefix "[UFW DOCKER BLOCK] "
-A ufw-docker-logging-deny -j DROP

COMMIT
# END UFW AND DOCKER
```

This makes sure that Supabase Studio cannot be accessed externally without going through the basic auth set up through NGINX, though we do need to allow this port:
```shell
sudo ufw allow 3000/tcp
```

Lastly, restart UFW:
```shell
sudo ufw reload
```

### Set up PM2 and website
First you need to have Node.js and NPM installed. When that is installed, install PM2:
```shell
npm install pm2@latest -g
```

Then clone this repository:
```shell
git clone https://github.com/BLumbye/project-game-prototype.git
cd project-game-prototype
```

Set up a `.env` file with the following contents:
```
VITE_SUPABASE_URL=<Supabase url>
VITE_SUPABASE_ANON_KEY=<Supabase anon key>
```

Install packages and build the site:
```shell
npm install
npm run build
```

Allow any app to run on port 80:
```shell
sudo apt install libcap2-bin
sudo setcap cap_net_bind_service=+ep /usr/local/bin/node
```

If the above command fails it is likely because Node is installed in another location. In that case change the path to match that location.

Then serve the webpage through PM2:
```shell
pm2 serve dist 80 --spa --name project-game
```

### Note about security
This guide is still WIP, and the basic auth, as well as the authentication on the website, is not secure at all, meaning that you should use a unique password for these services (as you always should). By setting up SSL and routing the pages through HTTPS instead these methods should be secure.