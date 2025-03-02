# URL Shortener [projet personnel]  

🇬🇧 For the english version, [click here](README.md)

## Description  

Application `Express.js` permettant de créer et supprimer des raccourcis d'URL personnalisés en temps réel.

Par exemple, si vous avez une URL longue comme `www.google.com/search?q=url+shortener&.....`, vous pouvez la raccourcir en `monsite.com/{votre choix}` et la partager plus facilement.

L'application enregistre également la date de création et le nombre de visites de chaque raccourci. Le tout est stocké dans une base de données `MongoDB`

**[ A Noter ]** : L'application est conçue pour être hébergée à côté d'autres applications sur un serveur. Pour l'utiliser il faut l'encapsuler dans un `Server` du module `http NodeJs`

## Authentification  

Pour éviter que quiconque puisse créer ou supprimer des raccourcis avec votre domaine, l'application est protégée par un système d'authentification avec `Passport.js`. Elle utilise mon propre fournisseur d'identité qui gère aussi le processus d'autorisation mais vous pouvez facilement le remplacer par un autre grâce aux stratégies de `Passport.js`

## Démonstration  
Voici à quoi ressemble l'interface de l'application  
<img src="demo.png" alt="Image de l'interface" width="500px">

Vous pouvez la tester avec le compte de démonstration suivant (accès en lecture seule) :  

Sélectionner "se connecter par email"
- **Identifiant** : `demo@milobrt.fr`
- **Mot de passe** : `Demo123!`  

Elle est actuellement hébergée [ici](https://urls.milobrt.fr)