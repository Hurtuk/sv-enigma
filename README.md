# SvEnigma

Jeu de piste de l'Institution Saint-Victrice — https://ohrm.fr/sv

Douze équipes, identifiées par une couleur, parcourent l'établissement pour
retrouver Georges Liot, maire de Bihorel disparu le soir de l'inauguration, en 1903.

## Déroulé d'une partie

1. Sur l'accueil, l'équipe scanne **son** QR code, qui contient sa couleur
   (`red`, `blue`, …). L'application en déduit le premier chapitre.
2. Chaque chapitre affiche d'abord une **énigme de lieu** : une devinette qui
   désigne la salle suivante.
3. Arrivée dans la salle, l'équipe scanne le QR code à sa couleur qui y est affiché.
   S'il correspond à l'étape en cours, l'**énigme** de la salle apparaît.
4. La bonne réponse fait passer au chapitre suivant. Une réponse d'un seul
   caractère est pénalisée de 30 secondes en cas d'erreur, pour décourager la
   force brute.
5. Le chapitre 13 n'a pas d'énigme : il renvoie les équipes au hall, et la partie
   s'arrête là.

Le code d'une étape est le début du MD5 de `couleur + numéro de chapitre` :
`md5("red1")` → `9d579c86a5`. C'est ce que contiennent les QR codes des salles,
et c'est aussi ce que le front recalcule pour passer au chapitre suivant.

## Organisation

```
front/   Application Angular (le jeu)
back/    API et pages PHP, servies au même endroit que le front
```

## Front (`front/`)

Angular 22, composants standalone, sans zone.js (l'état est porté par des
signaux). Le lecteur de QR code est `@zxing/ngx-scanner`.

Toutes les commandes se lancent depuis `front/` :

```bash
cd front
npm install
npm start        # serveur de dev sur http://localhost:4200/
npm run build    # build de production -> front/dist/sv-enigma/browser
```

`npm start` appelle l'API via `proxy.conf.json`, qui attend un PHP servant
`back/` sur `http://localhost:8080`. Par exemple :

```bash
cp back/php/config.sample.php back/php/config.php   # une seule fois
php -S localhost:8080 -t back
```

### Le site n'est pas servi à la racine du domaine

Il vit sous `/sv`. Rien n'est codé en dur : tout est résolu contre le
`<base href>`, que `angular.json` renseigne (`baseHref: "/sv/"`) uniquement en
configuration de production — le serveur de développement reste sur `/`.
Déménager ne demande donc que de changer cette ligne… **et de rejouer la
migration SQL** si le préfixe change à nouveau (voir plus bas).

Conséquence sur les images, qui vivent à deux endroits selon qui les consomme :

| Dossier | Pour quoi | Résolution |
|---|---|---|
| `src/assets/images/` | fonds appelés depuis un SCSS | le build les émet hashées dans `media/`, l'URL est réécrite relativement à la feuille |
| `public/assets/images/` | images citées dans un template | copiées telles quelles, appelées en relatif (`assets/…`) |

Un `url()` de SCSS est résolu **à la compilation** : une image de `public/` y est
introuvable et fait échouer le build. C'est ce qui dicte la répartition.

L'API, elle, ne peut pas être appelée en simple relatif : `HttpClient` résoudrait
contre l'URL courante, donc `/sv/scenario/<code>/api/…`. `tools.service.ts`
la résout explicitement contre `document.baseURI`.

## Back (`back/`)

PHP + MySQL. Le contenu de `back/` est déployé au même endroit que le build du
front, soit `/ohrm.fr/sv` en FTP :

```
sv/
├── .htaccess          (réécriture SPA : tout ce qui n'existe pas -> index.html)
├── api/getEnigma.php  (le seul endpoint : une étape à partir de son code)
├── php/DB.class.php   (couche PDO)
├── php/config.php     (identifiants de la base — NON versionné)
├── php/datamodel.php  (en-têtes CORS + instanciation de $db)
├── enigmas.php        (back-office de rédaction des énigmes)
├── letter.php         (affiche une lettre en grand, ciblée par QR code)
├── migrations/*.sql   (à jouer à la main ; non déployé)
├── *.png              (images citées par les énigmes stockées en base)
└── ...                (contenu de front/dist/sv-enigma/browser)
```

Le `.htaccess` ne doit contenir **aucune directive `Options`** : le mutualisé LWS
restreint `AllowOverride` et répond 500 sur tout le dossier, images comprises,
dès qu'il en rencontre une. Son `RewriteBase` doit suivre le préfixe du site.

Le jeu tient en trois tables : `places` (les salles), `questions` (énigme +
réponse) et `transitions` (le parcours d'une couleur, une ligne par chapitre,
qui relie une salle et une question).

### Base partagée et préfixe de tables

L'hébergement n'offre qu'une base pour tous les projets. Ces trois noms étant
bien trop courants pour y être posés nus, les tables sont préfixées, comme dans
les autres projets : les requêtes écrivent `{p}` devant chaque table, et
`DB.class.php` le remplace par la clé `prefix` de `config.php` (`sv_` par
défaut). Un préfixe vide redonne les noms nus.

Les identifiants de la base sont dans `back/php/config.php`, exclu du dépôt car
celui-ci est public. Le modèle à recopier est `back/php/config.sample.php`.
Rien n'est affiché au navigateur en cas d'erreur : tout va dans le journal du
serveur, préfixé `[sv-enigma]`.

`enigmas.php` est le back-office : il liste les douze parcours, colore chaque
étape selon ce qui reste à rédiger, et ouvre un éditeur riche sur l'énigme
choisie. **Il n'est protégé par aucune authentification** alors qu'il écrit
directement en base.

## Déploiement

Cible : `https://ohrm.fr/sv`, soit `/ohrm.fr/sv` en FTP.

1. `cd front && npm run build` (la configuration de production pose `baseHref: /sv/`)
2. Envoyer le contenu de `front/dist/sv-enigma/browser/` dans `sv/` —
   `index.html` **en dernier**, après les bundles qu'il référence
3. Envoyer le contenu de `back/` dans `sv/`, sauf `migrations/`

Ne pas supprimer le dossier distant avant de publier : écraser en place suffit,
et un transfert interrompu laisse alors l'ancienne version fonctionnelle.

`php/config.php` n'étant pas dans le dépôt, il vit sur le serveur avec les
identifiants de l'hébergement : ne pas l'écraser en déployant.

### Installation de la base

Le port MySQL de l'hébergement n'est pas joignable depuis un poste de travail :
tout passe par phpMyAdmin.

1. Jouer `back/migrations/2026-08-16-schema-base-partagee.sql` — il crée les
   trois tables préfixées en `utf8mb4`, sans toucher à l'existant
   (`CREATE TABLE IF NOT EXISTS`).
2. Importer le fichier de données, **absent du dépôt** : il contient toutes les
   réponses du jeu et ce dépôt est public. Le régénérer depuis la base locale :

   ```bash
   mysqldump -u root --default-character-set=utf8mb4 --no-tablespaces \
     --skip-comments --compact mystery places questions transitions
   ```

   puis préfixer les noms de tables en `sv_`.
3. Renseigner `back/php/config.php` sur le serveur avec les identifiants de la
   base partagée et le même préfixe.

`back/migrations/2026-08-16-images-relatives.sql` rend relatives les images des
énigmes du musée ; elle est déjà appliquée au contenu exporté ci-dessus, et
rejouable sans dommage.
