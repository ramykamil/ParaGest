# Rapport de Définition de Projet (RDP)

**Titre du Projet :** Gestion de Magasin Paramédical (GMP)  
**Langue :** Français (Interface utilisateur)  
**Cible :** Magasins de fournitures médicales (fauteuils roulants, orthèses, masques, etc.)  
**Date de création :** 25 mars 2026

---

## 1. Objectifs Principaux

| Objectif | Description |
|:---|:---|
| **Gestion des Stocks** | Suivi des niveaux de stock, catégories et dates d'expiration |
| **Point de Vente (POS)** | Interface rapide pour enregistrer les ventes et générer des reçus |
| **Gestion des Clients** | Base de données des acheteurs fréquents et professionnels médicaux |
| **Tableau de Bord** | Visualisation du chiffre d'affaires quotidien et alertes de stock bas |

---

## 2. Stack Technique

| Couche | Technologie |
|:---|:---|
| **Frontend** | React.js (Vite) + Tailwind CSS + Lucide React (Icônes) |
| **Backend / BDD** | Supabase (PostgreSQL, Auth, Storage) |
| **Versioning** | Git + GitHub |
| **Déploiement** | Vercel (Frontend), Render (cron jobs si nécessaire) |

---

## 3. Modèle de Données

### Table `produits`
| Colonne | Type | Description |
|:---|:---|:---|
| `id` | UUID (PK) | Identifiant unique |
| `nom` | TEXT | Nom du produit |
| `description` | TEXT | Description détaillée |
| `prix_achat` | NUMERIC | Prix d'achat |
| `prix_vente` | NUMERIC | Prix de vente |
| `stock_actuel` | INTEGER | Quantité en stock |
| `seuil_alerte` | INTEGER | Seuil d'alerte stock bas |
| `categorie` | TEXT | Catégorie du produit |
| `created_at` | TIMESTAMPTZ | Date de création |

### Table `ventes`
| Colonne | Type | Description |
|:---|:---|:---|
| `id` | UUID (PK) | Identifiant unique |
| `date_vente` | TIMESTAMPTZ | Date de la vente |
| `total` | NUMERIC | Montant total |
| `methode_paiement` | TEXT | Espèces / Carte / Virement |
| `created_at` | TIMESTAMPTZ | Date de création |

### Table `ligne_ventes`
| Colonne | Type | Description |
|:---|:---|:---|
| `id` | UUID (PK) | Identifiant unique |
| `vente_id` | UUID (FK → ventes) | Référence à la vente |
| `produit_id` | UUID (FK → produits) | Référence au produit |
| `quantite` | INTEGER | Quantité vendue |
| `prix_unitaire` | NUMERIC | Prix unitaire au moment de la vente |

### Table `profils`
| Colonne | Type | Description |
|:---|:---|:---|
| `id` | UUID (PK, Auth) | Identifiant Supabase Auth |
| `nom` | TEXT | Nom complet |
| `role` | TEXT | Admin / Personnel |

---

## 4. Architecture Frontend

| Page | Route | Description |
|:---|:---|:---|
| **Tableau de Bord** | `/` | Cartes résumé : ventes du jour, alertes stock |
| **Inventaire** | `/inventaire` | Tableau recherchable, ajout/édition de produits |
| **Point de Vente** | `/pos` | Sélection d'articles, quantités, enregistrement |
| **Historique** | `/historique` | Liste des transactions passées |

---

## 5. Charte Graphique

- **Fond principal :** Blanc (`#FFFFFF`)
- **Couleur d'accent :** Bleu médical (`#007bff`)
- **Succès :** Vert (`#28a745`)
- **Danger / Alerte :** Rouge (`#dc3545`)
- **Texte :** Gris foncé (`#212529`)
- **Police :** Inter (Google Fonts)
- **Style :** Clean, professionnel, esthétique médicale

---

## 6. Variables d'Environnement

```env
VITE_SUPABASE_URL=https://votre-projet.supabase.co
VITE_SUPABASE_ANON_KEY=votre-cle-anon
```

---

## 7. Déploiement

1. **Vercel** : Configurer `vercel.json` pour le routage React Router
2. **Supabase** : Ajouter les variables d'environnement dans le dashboard
3. **Render** : Optionnel, pour les cron jobs ou logique backend lourde

---

## 8. Étapes d'Implémentation

1. ✅ Initialisation du projet (Vite + React)
2. ✅ Installation des dépendances (Tailwind, Supabase, React Router, Lucide)
3. ⬜ Création du schéma SQL Supabase
4. ⬜ Structure du projet (routing, layout, client Supabase)
5. ⬜ Tableau de Bord
6. ⬜ Inventaire
7. ⬜ Point de Vente
8. ⬜ Historique
9. ⬜ Polish UI + Localisation française
10. ⬜ Configuration de déploiement
