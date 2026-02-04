# Balestra — notation d’escrime artistique

Balestra est une application web dédiée à la **notation en compétition d’escrime artistique**. Elle permet aux jurés de saisir leurs notations sur un même combat/spectacle, pour **deux sessions distinctes** (Programme Technique et Programme Libre), puis de valider les pénalités et d’obtenir les résultats finaux.

Les règles de notations de basent sur le document REGLEMENT-NATIONAL-M17*-CFEA26
qui se trouve dans doc/REGLEMENT-NATIONAL-M17*-CFEA26.pdf

## Objectifs

- Centraliser la notation d’un combat par plusieurs jurés.
- Garantir **une seule notation par combat et par juré** pour chaque session.
- Séparer clairement les sessions **Programme Technique** et **Programme Libre**.
- Gérer les pénalités (globales et d’action) avec validation par majorité.
- Calculer et afficher les notes finales, avec export.

## Fonctionnalités

### Gestion des combats

- Création, modification et suppression d’un combat.
- Informations complètes : nom, catégorie, club, escrimeurs, description, code technique.
- Partage du combat avec d’autres utilisateurs (jurés).

### Notation

- Deux sessions indépendantes :
  - **Programme Technique** (notation technique)
  - **Programme Libre** (notation technique + artistique)
- Ajout des phrases d’armes avec difficulté, note et coefficient.
- Pénalités :
  - **Pénalités globales**
  - **Pénalités d’action** (rattachées à une phrase d’armes)
- Une **pause de 5 secondes** entre phrases est prise en compte dans les règles.

### Validation des pénalités

- Validation **par majorité automatique (50%+)**.
- Validation manuelle par session.
- Liste détaillée des pénalités d’action par numéro de phrase.

### Résultats

- Page de note finale (moyennes par session + moyenne générale).
- Écran “Résultats” exportable (CSV / impression PDF).

### Comptes utilisateurs

- Authentification (connexion uniquement).
- Superadmin pour la gestion des utilisateurs.
- Page “Mon compte” pour changer son mot de passe.
- Partage des combats avec des utilisateurs existants.

## Notes importantes

- Chaque juré peut noter **une seule fois par combat et par session**.
- Les pénalités d’action sont rattachées à une phrase précise.
- Le calcul final applique la majorité pour les pénalités, puis les scores sont ramenés sur 10.

## Contribuer

Les contributions sont bienvenues :

1. Fork du projet
2. Création d’une branche
3. Pull Request

## Licence

Ce projet est distribué sous licence **GNU GPL v3**. Toute modification distribuée doit rester open-source.

## Contact

Pour les questions et autres remarques, l'adresse **balestra.k3qcbu@bumpmail.io** est disponible.
Vous pouvez aussi ouvrir une discussion ou une issue sur le dépôt du projet : https://github.com/adeline-t/balestra.
