# SvEnigma

Jeu d'énigmes de la Saint-Victrice — https://mystere.saintvictrice.fr

## Organisation

```
front/   Application Angular 16 (source du jeu)
back/    API et pages PHP, servies à la racine du domaine
```

## Front (`front/`)

Application Angular générée avec Angular CLI. Toutes les commandes se lancent
depuis `front/` :

```bash
cd front
npm install
npm start        # serveur de dev sur http://localhost:4200/
npm run build    # build de dev  -> front/dist/sv-enigma
ng build --configuration production   # build de prod
```

L'URL de l'API est définie dans `src/environments/environment.ts` (dev) et
`src/environments/environment.prod.ts` (prod).

## Back (`back/`)

PHP + MySQL. Le contenu de `back/` est déployé **à la racine** de `htdocs`,
au même endroit que le build du front, ce qui donne l'arborescence en ligne :

```
htdocs/
├── .htaccess          (réécriture SPA : tout ce qui n'existe pas -> index.html)
├── api/getEnigma.php  (endpoint appelé par le front)
├── php/DB.class.php   (couche PDO)
├── php/datamodel.php  (headers CORS + instanciation de $db)
├── enigmas.php        (page d'admin des énigmes)
├── letter.php         (page « lettre » affichée via QR code)
├── *.png              (images de lettres, ciblées directement par URL)
└── ...                (contenu de front/dist/sv-enigma)
```

Les identifiants de la base sont dans `back/php/DB.class.php`.

## Déploiement

1. `cd front && ng build --configuration production`
2. Envoyer le contenu de `front/dist/sv-enigma/` dans `htdocs/`
3. Envoyer le contenu de `back/` dans `htdocs/` (fusion à la racine)
