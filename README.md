# 🚀 TEST-FLOW : Plateforme de Crowdsourcing UX (Simulateur)

**TEST-FLOW** est une application web moderne permettant aux propriétaires de sites web de recruter des testeurs réels pour obtenir des retours d'expérience (UX). Le projet intègre un écosystème financier complet basé sur un modèle de commission de 25%.

---

## 💡 Concept & Business Model

L'application repose sur un flux tripartite :
1.  **Employeurs** : Créent des campagnes de test et financent les récompenses.
2.  **Administrateur (Propriétaire)** : Valide les demandes et perçoit **25% de commission** sur chaque transaction.
3.  **Travailleurs** : Exécutent les tests et reçoivent une rémunération fixe de **300 F CFA** par tâche validée.

---

## 🛠️ Architecture du Projet

Le projet est structuré pour simuler un environnement de production réel :

*   **/index.html** : Landing page haute conversion (UI/UX Premium).
*   **/employeur/campagne.html** : Interface de création de projet avec calcul automatique des frais.
*   **/admin/gestion.html** : Panneau de contrôle permettant de valider les flux et de suivre les bénéfices.
*   **/travailleur/dashboard.html** : Espace utilisateur dynamique affichant les missions disponibles.

---

## ⚙️ Technologies utilisées

*   **Frontend** : [HTML5](https://developer.mozilla.org), [Tailwind CSS](https://tailwindcss.com) (Framework utilitaire pour un design moderne).
*   **Animations** : [AOS (Animate On Scroll)](https://michalsnik.github.io) pour l'interactivité.
*   **Logique & Persistance** : [JavaScript ES6+](https://developer.mozilla.org) et [LocalStorage API](https://developer.mozilla.org) pour simuler une base de données en temps réel entre les différents onglets.

---

## 🚀 Installation et Test

1. **Cloner le dépôt**
   ```bash
   git clone https://github.com
