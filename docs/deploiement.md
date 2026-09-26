# Déploiement

Cible : un serveur personnel, exposé par un tunnel Cloudflare. Le site, la base
et les migrations tournent dans `docker-compose.prod.yml`.

```
Internet → Cloudflare → tunnel sortant → cloudflared → web:3001
                                                         └→ postgres:5432
```

Aucun port n'est publié sur l'hôte et aucune redirection n'est à configurer sur
la box : c'est le serveur qui établit la connexion vers Cloudflare. L'adresse IP
du domicile n'est jamais exposée, et le montage fonctionne derrière un CGNAT.

## Prérequis

- Docker et le plugin compose.
- Un nom de domaine dont les DNS sont gérés par Cloudflare.
- 2 Go de RAM, 10 Go de disque. La base occupe environ 250 Mo une fois le
  catalogue importé, dont l'essentiel dans le schéma `staging`.

## Première mise en ligne

```bash
git clone https://github.com/HussonAxel/pokedata.git
cd pokedata
cp .env.production.example .env
```

Remplir `.env` :

```bash
openssl rand -base64 32   # BETTER_AUTH_SECRET
openssl rand -base64 24   # POSTGRES_PASSWORD
```

`TUNNEL_TOKEN` peut rester vide à ce stade : le tunnel se lance séparément.

### 1. L'application

```bash
docker compose -f docker-compose.prod.yml up -d --build
```

Le service `migrate` applique les migrations et s'arrête ; `web` n'accepte de
démarrer qu'après sa réussite. Vérifier :

```bash
docker compose -f docker-compose.prod.yml ps
docker compose -f docker-compose.prod.yml logs -f web
curl -I http://localhost:3001
```

Le port 3001 n'est publié que sur la boucle locale du serveur : il permet cette
vérification, mais reste injoignable depuis le réseau local et depuis Internet.

### 2. Le tunnel

Créer le tunnel dans le dashboard Cloudflare (Zero Trust → Networks → Tunnels),
ajouter un hostname public pointant vers `http://web:3001`, copier le jeton dans
`TUNNEL_TOKEN`, puis :

```bash
docker compose -f docker-compose.prod.yml --profile tunnel up -d
```

Le profil est nécessaire à chaque commande qui doit inclure le tunnel, y compris
les redémarrages et les mises à jour.

## Importer le catalogue

Le catalogue n'est pas dans les migrations : il se construit depuis les CSV
PokéAPI (voir `docs/ingestion.md`). Depuis le dépôt, sur le serveur :

```bash
pnpm install
DATABASE_URL=postgresql://postgres:<mot-de-passe>@localhost:5433/pokedata \
  pnpm ingest:fetch && pnpm ingest:stage && pnpm ingest:transform
```

La base de production n'expose pas de port sur l'hôte. Deux options : publier
temporairement `5432` dans le compose, ou lancer l'ingestion depuis un conteneur
rattaché au réseau Docker. La seconde évite d'exposer la base :

```bash
docker compose -f docker-compose.prod.yml run --rm --workdir /app web \
  sh -c 'pnpm ingest:fetch && pnpm ingest:stage && pnpm ingest:transform'
```

À rejouer quand les données PokéAPI évoluent. Une tâche `cron` mensuelle suffit.

## Mise à jour du site

La CI/CD est définie dans `.github/workflows/ci.yml`. Chaque push ou fusion sur
`master` lance les vérifications de format, lint et types, les tests et un build
Docker sur un runner hébergé par GitHub. Les pull requests exécutent ces mêmes
contrôles sans déploiement.

Le serveur interroge GitHub chaque minute via un timer systemd utilisateur. Il
déploie uniquement le dernier commit de `master`, après la réussite de sa CI
déclenchée par un **push**. Un simple `git pull` local ne déclenche rien.
Ce choix évite d'installer un runner GitHub sur le serveur d'un dépôt public.

Le déploiement utilise un répertoire dédié `~/.local/share/pokedata-deploy`,
indépendant du dossier de développement. Il reconstruit l'image avec le lockfile,
sauvegarde toute la base, exécute les migrations, remplace le web, puis attend
son healthcheck. Le projet Docker reste `pokedata` et conserve le volume existant.
PostgreSQL doit déjà être démarré : cette automatisation met à jour une production
existante, elle ne réalise pas son initialisation.

### Installer ou mettre à jour l'automatisation

Prérequis : Linux avec systemd utilisateur, Docker Compose, Git, GitHub CLI
authentifié (`gh auth login`), curl, flock et Python 3. Aucun secret de production
n'est envoyé à GitHub. Le compte système doit pouvoir utiliser Docker.

```bash
bash scripts/install-auto-deploy.sh "$PWD/.env"
loginctl show-user "$USER" -p Linger
# Si Linger=no, activer le démarrage au boot sans session ouverte :
sudo loginctl enable-linger "$USER"
```

L'installation copie le `.env` dans `production.env` avec des permissions 600.
Relancer l'installation après une modification du script de déploiement ou du
`.env` : ces fichiers locaux ne sont pas remplacés automatiquement par un push.

```bash
systemctl --user list-timers pokedata-deploy.timer
journalctl --user -u pokedata-deploy.service -n 100
cat ~/.local/share/pokedata-deploy/deployed-sha
# Vérifier immédiatement (la CI doit déjà avoir réussi) :
systemctl --user start pokedata-deploy.service
# Suspendre les prochains déploiements :
systemctl --user stop pokedata-deploy.timer
```

Une CI en échec laisse la production en place. Un échec de build, sauvegarde ou
migration empêche le remplacement du web. Une migration partiellement appliquée
peut toutefois affecter l'ancienne application : privilégier les migrations
compatibles avec la version précédente. Un healthcheck en échec après remplacement
est signalé dans le journal ; aucun rollback automatique de code ou de base n'est
effectué. Le timer réessaie après une minute. Pour intervenir, arrêter le timer
et le service (`systemctl --user stop pokedata-deploy.timer pokedata-deploy.service`).

Les archives complètes dans `~/.local/share/pokedata-deploy/backups/` et les sources
dans `releases/` sont conservées ; prévoir leur nettoyage et une copie distante
des sauvegardes. Pour revenir à une version précédente, pousser un revert sur
`master` : il repasse par la CI et le déploiement. Les migrations de base ne sont
pas annulées par un revert Git.

### Mise à jour manuelle de secours

Arrêter le timer avant une intervention manuelle pour éviter deux déploiements
concurrents. Le dossier de travail doit contenir la version que l'on veut publier.

```bash
git pull
docker compose -f docker-compose.prod.yml --profile tunnel up -d --build
```

Les migrations en attente sont appliquées automatiquement au démarrage.

## Sauvegardes

```bash
./scripts/backup-db.sh /chemin/vers/sauvegardes
```

Le script exclut le schéma `staging`, reconstructible depuis PokéAPI : une
archive fait environ 250 Ko au lieu de 9 Mo. Les 14 dernières sont conservées.

Une sauvegarde qui reste sur le serveur ne protège de rien. À planifier dans
`cron`, suivi d'une copie vers un stockage distant :

```cron
30 3 * * * cd /srv/pokedata && ./scripts/backup-db.sh ./backups >> ./backups/cron.log 2>&1
```

Restauration :

```bash
zcat sauvegarde.sql.gz | docker compose -f docker-compose.prod.yml exec -T postgres \
  psql -U postgres -d pokedata
```

Une restauration qui n'a jamais été testée n'est pas une sauvegarde : la vérifier
une fois sur une base jetable.

## Points de vigilance

- **Coupure de courant ou d'accès** : le site tombe, sans bascule. C'est le coût
  de l'hébergement à domicile.
- **Débit montant** : c'est lui qui sert les pages. Cloudflare met en cache les
  fichiers statiques, pas le rendu serveur.
- **Isolation réseau** : si le routeur le permet, placer le serveur sur un VLAN
  séparé. À défaut, ne monter aucun partage de fichiers personnel dessus.
- **SSH** : par clé uniquement, et jamais exposé par le tunnel.
- **Secrets** : `.env` n'est pas versionné et ne doit pas l'être. Le changement
  de `BETTER_AUTH_SECRET` invalide toutes les sessions en cours.
