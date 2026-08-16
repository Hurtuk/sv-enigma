# SvEnigma

Jeu de piste de l'Institution Saint-Victrice — https://mystere.saintvictrice.fr

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
back/    API et pages PHP, servies à la racine du domaine
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

En production comme en développement, le front appelle `/api/` en relatif :
il n'y a pas d'URL d'API à configurer, le front et l'API partageant le domaine.

## Back (`back/`)

PHP + MySQL. Le contenu de `back/` est déployé **à la racine** de `htdocs`,
au même endroit que le build du front :

```
htdocs/
├── .htaccess          (réécriture SPA : tout ce qui n'existe pas -> index.html)
├── api/getEnigma.php  (le seul endpoint : une étape à partir de son code)
├── php/DB.class.php   (couche PDO)
├── php/config.php     (identifiants de la base — NON versionné)
├── php/datamodel.php  (en-têtes CORS + instanciation de $db)
├── enigmas.php        (back-office de rédaction des énigmes)
├── letter.php         (affiche une lettre en grand, ciblée par QR code)
├── *.png              (images utilisées par les énigmes, appelées à la racine)
└── ...                (contenu de front/dist/sv-enigma/browser)
```

La base `mystery` compte trois tables : `places` (les salles), `questions`
(énigme + réponse) et `transitions` (le parcours d'une couleur, une ligne par
chapitre, qui relie une salle et une question).

Les colonnes sont en `latin1` tandis que `DB.class.php` fait `SET NAMES utf8` :
la conversion se fait à la volée, ne pas « corriger » l'un sans l'autre.

Les identifiants de la base sont dans `back/php/config.php`, exclu du dépôt car
celui-ci est public. Le modèle à recopier est `back/php/config.sample.php`.
Rien n'est affiché au navigateur en cas d'erreur : tout va dans le journal du
serveur, préfixé `[sv-enigma]`.

`enigmas.php` est le back-office : il liste les douze parcours, colore chaque
étape selon ce qui reste à rédiger, et ouvre un éditeur riche sur l'énigme
choisie. **Il n'est protégé par aucune authentification** alors qu'il écrit
directement en base.

## Déploiement

1. `cd front && npm run build`
2. Envoyer le contenu de `front/dist/sv-enigma/browser/` dans `htdocs/`
3. Envoyer le contenu de `back/` dans `htdocs/` (fusion à la racine)

`php/config.php` n'étant pas dans le dépôt, il vit sur le serveur avec les
identifiants de l'hébergement : ne pas l'écraser en déployant.
