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
