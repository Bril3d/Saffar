# SAFAR Chain - Cahier des Charges

> **Projet**: SAFAR Chain - Tracabilite des antibiotiques veterinaires + Marketplace producteur-consommateur
> **Hackathon**: Chain & Brain Edition 2 (Tunisie, 25-26 Avril 2026)
> **Equipe**: 4 developpeurs - **Duree**: ~18 heures
> **Piliers**: Intelligence Artificielle - Blockchain - Cybersecurite
> **Plateforme**: Application Mobile (React Native ou Flutter)

---

## 1. CONTEXTE & PROBLEMATIQUE

### 1.1 Probleme
La resistance antimicrobienne (RAM) est une menace sanitaire mondiale Top 10 (OMS). En Tunisie, l'utilisation excessive d'antibiotiques dans l'elevage avicole contribue a l'emergence de bacteries resistantes transmises a l'humain via la chaine alimentaire.

### 1.2 Constat actuel
- Aucun systeme numerique ne trace l'utilisation d'antibiotiques a la ferme
- Les prescriptions veterinaires sont sur papier, non tracables
- Les delais de retrait ne sont pas verifies de maniere fiable
- Les consommateurs n'ont aucune visibilite sur les traitements subis par les animaux
- Les intermediaires prennent 50-60% de marge entre producteur et consommateur

### 1.3 Solution proposee
SAFAR est une application mobile qui:
1. Trace chaque molecule d'antibiotique du veterinaire a l'abattoir (blockchain)
2. Verifie automatiquement les delais de retrait avant abattage (smart contract)
3. Connecte directement le producteur au consommateur via un marketplace de confiance
4. Detecte les anomalies et fraudes via Machine Learning (Isolation Forest)
5. Assiste les veterinaires et eleveurs avec un LLM local (Ollama) - 100% prive, sans cloud

### 1.4 Nom
"SAFAR" signifie "voyage" en arabe - le voyage d'une molecule de la ferme a l'assiette.

---

## 2. ACTEURS DU SYSTEME

### 2.1 Acteurs principaux

| Acteur | Role | Interface | Acces |
|---|---|---|---|
| **Pharmacie veterinaire** | Dispense les antibiotiques, enregistre les ventes | App mobile | Wallet blockchain |
| **Veterinaire** | Prescrit les antibiotiques, diagnostique | App mobile | Wallet + licence |
| **Eleveur/Fermier** | Confirme l'administration, vend ses produits | App mobile | Wallet |
| **Abattoir** | Verifie l'eligibilite des lots, scanne QR | App mobile + scanner | Wallet |
| **Consommateur** | Achete des produits fermiers, verifie la tracabilite | App mobile | Inscription simple |

### 2.2 Matrice des droits

| Action | Pharmacie | Vet | Eleveur | Abattoir | Consommateur |
|---|---|---|---|---|---|
| Enregistrer vente medicament | OUI | - | - | - | - |
| Creer prescription | - | OUI | - | - | - |
| Confirmer administration | - | - | OUI | - | - |
| Verifier eligibilite lot | - | - | - | OUI | - |
| Publier produits a vendre | - | - | OUI | - | - |
| Acheter produits | - | - | - | - | OUI |
| Scanner QR tracabilite | - | - | - | - | OUI |

---

## 3. EXIGENCES FONCTIONNELLES

### Etape 1: Dispensation par la pharmacie veterinaire

**Description**: La pharmacie enregistre la vente d'un antibiotique a un veterinaire.

**Donnees enregistrees on-chain**:
- Code ATC du medicament (ex: J01XB01 pour colistine)
- Numero de lot fabricant
- Quantite dispensee
- ID du veterinaire acheteur (adresse wallet)
- Timestamp
- Signature cryptographique de la pharmacie

**Regles metier**:
- Seules les pharmacies enregistrees peuvent ecrire cette transaction
- Le veterinaire doit avoir une licence valide
- Classification WHO AWaRe automatiquement associee (Access/Watch/Reserve)

---

### Etape 2: Prescription veterinaire

**Description**: Le veterinaire cree une prescription numerique liee a un lot d'animaux.

**Donnees enregistrees on-chain**:
- Reference au lot de medicament (lien avec Etape 1)
- ID de l'exploitation (ferme)
- ID du lot d'animaux traite
- Diagnostic
- Posologie (dose, frequence, duree)
- Date de debut du traitement
- Delai de retrait calcule automatiquement
- Signature cryptographique du veterinaire

**Regles metier**:
- Le medicament prescrit doit correspondre a un lot achete par ce veterinaire
- Le delai de retrait est calcule selon la reglementation nationale
- Le smart contract lance automatiquement un timer de retrait

---

### Etape 3: Confirmation d'administration par l'eleveur

**Description**: L'eleveur confirme qu'il a administre le traitement prescrit.

**Donnees enregistrees on-chain**:
- Reference a la prescription (lien avec Etape 2)
- Date et heure d'administration
- Confirmation de dose administree
- Signature cryptographique de l'eleveur

**Regles metier**:
- L'eleveur ne peut confirmer que des prescriptions destinees a sa ferme
- La date d'administration ne peut pas etre anterieure a la prescription

---

### Etape 4: Verification a l'abattoir (MOMENT CLE DE LA DEMO)

**Description**: L'abattoir scanne le QR code du lot et verifie l'eligibilite a l'abattage.

**Processus**:
1. L'operateur scanne le QR code du lot
2. Le smart contract verifie: block.timestamp >= dateFinRetrait
3. Resultat visuel: ELIGIBLE (vert) ou NON ELIGIBLE (rouge + jours restants)
4. Si eligible: le lot est certifie sur la blockchain, genere un certificat
5. Si non eligible: le lot est rejete automatiquement

**Donnees enregistrees on-chain**:
- ID du lot verifie
- Resultat (eligible/rejete)
- Timestamp de verification
- ID de l'abattoir
- Hash du certificat de conformite (si eligible)

**Regles metier**:
- AUCUNE exception possible - le smart contract est la loi
- Le certificat de conformite est necessaire pour la vente sur le marketplace

---

### Etape 5: Marketplace Producteur vers Consommateur

**Description**: L'eleveur publie ses produits sur le marketplace SAFAR. Chaque produit est lie a un lot certifie sur la blockchain. Le consommateur achete directement, sans intermediaire.

**Flux**:
```
Eleveur publie produit (lie au lot certifie)
  -> Consommateur parcourt le catalogue
  -> Consulte la tracabilite (QR)
  -> Passe commande
  -> Eleveur confirme et prepare
  -> Livraison ou retrait
  -> SAFAR preleve 10-12% de commission
```

---

## 4. MODULE MARKETPLACE - DETAIL

### 4.1 Fonctionnalites eleveur (vendeur)

| Fonctionnalite | Description |
|---|---|
| Creer une fiche produit | Nom, description, photos, prix/kg, quantite disponible |
| Lier au lot blockchain | Associer le produit a un lot avec certificat (Etape 4) |
| Gerer le stock | Mettre a jour les quantites, marquer "epuise" |
| Recevoir les commandes | Notification push, confirmer/rejeter, delai de preparation |
| Tableau de bord ventes | Historique, revenus, commissions prelevees |
| Mode livraison | Retrait a la ferme / Livraison / Les deux |

**Regles**: Un produit ne peut etre publie que s'il est lie a un lot avec certificat de conformite.

### 4.2 Fonctionnalites consommateur (acheteur)

| Fonctionnalite | Description |
|---|---|
| Parcourir le catalogue | Filtrer par produit, localisation, prix, note |
| Consulter la tracabilite | Scanner QR -> historique antibiotique complet du lot |
| Passer une commande | Selectionner produit, quantite, mode de livraison |
| Paiement | En ligne (D17/Flouci) ou a la livraison |
| Suivi de commande | Statut en temps reel (notifications push) |
| Noter et commenter | Evaluation du producteur et du produit |

### 4.3 Page tracabilite produit (vue consommateur)

```
TRACABILITE COMPLETE - Lot #L-882
Ferme: Ferme El Fahs, Ariana
Eleveur: Ahmed Ben Ali (verifie)

HISTORIQUE ANTIBIOTIQUE
- Amoxicilline prescrite le 03/03/2026
  Par: Dr. Ben Ali (Veterinaire #V-221)
  Diagnostic: Infection respiratoire
  Derniere dose: 10/03/2026
  Delai de retrait: Complete 17/03

ABATTOIR
- Controle: Eligible (20/03/2026)
  Abattoir: Certified Facility #A-15

SCORE DE CONFIANCE: 98/100
Verifie sur blockchain (tx: 0x7f3...)
```

### 4.4 Produits par phase

| Phase | Produits | Logistique |
|---|---|---|
| Phase 1 (hackathon + MVP) | Oeufs, miel | Simple - pas de chaine du froid |
| Phase 2 | Volaille vivante, produits laitiers | Moyenne |
| Phase 3 | Viande transformee, viande rouge | Partenaires logistiques requis |

### 4.5 Cycle de vie du QR Code physique

Le lien physique-numerique est maintenu a travers les etapes suivantes:

```
Elevage:
  Lot numerique cree (ID interne), pas de QR physique necessaire.

Abattoir (Gate - apres certification):
  1. L'app abattoir genere un QR code lie au hash du certificat blockchain
  2. QR imprime sur etiquettes thermiques
  3. Etiquettes colles sur chaque emballage du lot

Consommateur (en magasin ou livraison):
  1. Scanne l'etiquette sur l'emballage
  2. L'app resout le hash -> recupere le certificat on-chain
  3. Affiche la tracabilite complete

Securite: Falsifier une etiquette = hash invalide = detecte immediatement.
```

---

## 5. ARCHITECTURE TECHNIQUE

### 5.1 Vue d'ensemble

```
APPLICATION MOBILE (React Native / Flutter) - OFFLINE-FIRST
  - Ecrans Vet/Pharmacie
  - Ecrans Eleveur
  - Ecrans Consommateur
  - Scanner QR integre
  - Base locale (WatermelonDB) pour mode hors-ligne
  - File d'attente de transactions signees (sync auto au retour du reseau)
       |
  API BACKEND (Node.js / Express)
  - Auth API
  - Chain API + Meta-Transaction Relayer (paie le gas a la place des users)
  - Marketplace API
  - AI Layer 1 API (scikit-learn - anomalies)
  - AI Layer 2 API (Ollama - LLM assistant)
       |
  DATA LAYER
  - Blockchain (Hardhat local)
  - SQLite / JSON DB
  - AI Layer 1: Python + scikit-learn (Isolation Forest, XGBoost)
  - AI Layer 2: Ollama (phi3:mini ou llama3.2:3b) - tourne sur le serveur local
```

### 5.2 Stack technique

| Couche | Technologie | Justification |
|---|---|---|
| **App Mobile** | React Native (Expo) ou Flutter | Cross-platform iOS + Android |
| **Offline-First** | WatermelonDB ou expo-sqlite | Mode hors-ligne pour zones rurales |
| **Blockchain** | Solidity + Hardhat (noeud local) | Dev rapide, gratuit, pas de reseau |
| **Interaction Smart Contract** | ethers.js v6 | Standard |
| **Meta-Transactions** | EIP-712 + Relayer backend | Zero friction crypto - user ne paie pas le gas |
| **Backend API** | Node.js + Express | Rapide pour equipe de 4 |
| **AI Layer 1** | Python + scikit-learn (Isolation Forest) | Detection anomalies sur donnees structurees |
| **AI Layer 2** | Ollama (phi3:mini ou llama3.2:3b) | LLM local, prive, sans API externe |
| **Base de donnees** | SQLite ou JSON | Zero infrastructure |
| **QR Codes** | react-native-qrcode-svg + react-native-camera | Natif mobile |
| **Paiement** | Flouci / D17 API (mock pour hackathon) | Paiement mobile tunisien |
| **Notifications** | Firebase Cloud Messaging | Push notifications |

### 5.3 Technologies interdites (hackathon)
- Hyperledger (trop lourd)
- Vrais circuits ZK (trop lent)
- Base de donnees cloud (dependance reseau)
- Architecture microservices (integration impossible en 18h)

---

## 6. SMART CONTRACTS

### 6.1 DrugRegistry - Enregistrement des ventes

```
Struct DrugSale:
  pharmacy: address
  veterinarian: address
  atcCode: string        // Ex: "J01XB01"
  batchNumber: string
  quantity: uint256
  timestamp: uint256
  awareClass: string     // "Access" / "Watch" / "Reserve"

Functions:
  registerSale(vet, atcCode, batch, qty, awareClass) -> saleId
  getSale(saleId) -> DrugSale
  getVetPurchases(vet) -> saleId[]

Events:
  SaleRegistered(saleId, pharmacy, vet, atcCode)

Access: onlyRegisteredPharmacy
```

### 6.2 DrugWithdrawalRegistry - Delais legaux minimaux (NOUVEAU)

```
// Registre IMMUABLE des delais de retrait legaux par code ATC
// Initialise au deploiement, ne peut PAS etre modifie par un vet ou admin
mapping(string atcCode => uint256 legalMinDays) withdrawalRegistry;

// Exemples pre-charges:
//   "J01XB01" (Colistine)    -> 7 jours
//   "J01CA04" (Amoxicilline) -> 5 jours
//   "J01AA07" (Tetracycline) -> 10 jours

Functions:
  getLegalMinDays(atcCode) -> uint256
  // onlyOwner a la creation, AUCUNE modification posterieure possible
```

### 6.3 PrescriptionRegistry - Prescriptions

```
Struct Prescription:
  drugSaleId: uint256
  veterinarian: address
  farmer: address
  animalLotId: string
  diagnosis: string
  dosage: uint256
  startDate: uint256
  withdrawalEnd: uint256  // = startDate + max(withdrawalDays_saisi, legalMinDays[atcCode])
  administered: bool
  adminTimestamp: uint256

Functions:
  // SECURISE: withdrawalDays saisi est compare au minimum legal.
  // Si le vet essaie de mettre 0 jour pour Colistine (min legal = 7),
  // le contrat utilise automatiquement 7 jours.
  createPrescription(saleId, farmer, lotId, diagnosis, dosage, withdrawalDays) -> rxId
  confirmAdministration(rxId) -> bool
  getPrescription(rxId) -> Prescription
  getFarmPrescriptions(farmer) -> rxId[]

Logique interne:
  atcCode = DrugRegistry.getSale(saleId).atcCode
  legalMin = DrugWithdrawalRegistry.getLegalMinDays(atcCode)
  withdrawalEnd = startDate + max(withdrawalDays, legalMin) * 1 days

Events:
  PrescriptionCreated(rxId, vet, farmer, lotId)
  AdministrationConfirmed(rxId, farmer, timestamp)

Access: onlyRegisteredVet / onlyFarmerOfPrescription
```

### 6.4 SlaughterGate - Verification abattoir

```
Struct LotVerification:
  animalLotId: string
  slaughterhouse: address
  eligible: bool
  timestamp: uint256
  certificateHash: bytes32  // Poseidon hash pour compatibilite ZKP future

Functions:
  checkEligibility(lotId) -> (eligible, daysRemaining)
  certifyLot(lotId) -> certificateHash
  verifyCertificate(certHash) -> valid

Events:
  LotChecked(lotId, eligible, daysRemaining)
  LotCertified(lotId, certificateHash)

Access: onlyRegisteredSlaughterhouse
```

### 6.5 AccessControl - Gestion des roles

```
Roles: PHARMACY, VETERINARIAN, FARMER, SLAUGHTERHOUSE, ADMIN

Functions:
  registerActor(actor, role) -> bool     // Admin only
  getRole(actor) -> Role
  isRegistered(actor) -> bool
  revokeAccess(actor) -> bool            // Admin only

// Support Meta-Transactions (EIP-712)
// Les fonctions acceptent des signatures validees par le Relayer backend.
// L'utilisateur signe localement (gratuit), SAFAR soumet et paie le gas.
executeMetaTx(from, functionCall, signature) -> bool
```

---

## 7. API BACKEND

### 7.1 Tracabilite

| Methode | Endpoint | Description | Auth |
|---|---|---|---|
| POST | /api/drugs/sale | Enregistrer vente medicament | Pharmacie |
| GET | /api/drugs/sale/:id | Details d'une vente | Tous |
| POST | /api/prescriptions | Creer prescription | Vet |
| GET | /api/prescriptions/:id | Details prescription | Tous |
| PUT | /api/prescriptions/:id/confirm | Confirmer administration | Eleveur |
| GET | /api/lots/:lotId/eligibility | Verifier eligibilite | Abattoir |
| POST | /api/lots/:lotId/certify | Certifier lot eligible | Abattoir |
| GET | /api/lots/:lotId/trace | Tracabilite complete | Public |

### 7.2 Marketplace

| Methode | Endpoint | Description | Auth |
|---|---|---|---|
| GET | /api/products | Lister produits disponibles | Public |
| GET | /api/products/:id | Details produit + tracabilite | Public |
| POST | /api/products | Publier un produit | Eleveur |
| PUT | /api/products/:id | Modifier produit | Eleveur |
| DELETE | /api/products/:id | Retirer produit | Eleveur |
| POST | /api/orders | Passer commande | Consommateur |
| GET | /api/orders/:id | Statut commande | Acheteur/Vendeur |
| PUT | /api/orders/:id/status | Mettre a jour statut | Eleveur |
| POST | /api/reviews | Laisser un avis | Consommateur |

### 7.3 IA - Layer 1 (Machine Learning - scikit-learn)

| Methode | Endpoint | Description | Auth |
|---|---|---|---|
| GET | /api/ai/anomaly/vet/:vetId | Detecte prescriptions anormales vs pairs (Isolation Forest) | Admin |
| GET | /api/ai/anomaly/farm/:farmerId | Detecte si volumes vendus inconsistants avec taille lot declare | Admin/Eleveur |
| GET | /api/ai/forecast/:governorate | Predit demande antibiotiques semaine suivante (XGBoost) | Admin |

### 7.4 IA - Layer 2 (LLM Local - Ollama)

| Methode | Endpoint | Description | Auth |
|---|---|---|---|
| POST | /api/ai/assistant/vet | Assistant veterinaire: symptomes -> recommandation antibiotique | Vet |
| POST | /api/ai/assistant/farmer | Assistant eleveur: question en langage naturel sur lot/traitement | Eleveur |
| POST | /api/ai/explain/trace | Explique la tracabilite d'un lot en langage simple | Public |

Modele Ollama utilise: phi3:mini (3.8B) ou llama3.2:3b
Execution: 100% locale sur le serveur SAFAR - aucune donnee n'est envoyee a un service externe.

Exemple d'usage (assistant vet):
```
Input:  "Poulets de 28 jours, decharge nasale, perte d'appetit, lot de 3000"
Output: "Suspicion infection respiratoire bacterienne. Recommande: Amoxicilline
         (J01CA04 - AWaRe: Access). Duree: 5 jours. Retrait: 5 jours.
         EVITER: Colistine (Reserve) - non indiquee en premiere intention."
```

### 7.4 Format de reponse

```json
{
  "success": true,
  "data": {},
  "error": null,
  "meta": {
    "timestamp": "2026-04-25T10:30:00Z",
    "txHash": "0x7f3a..."
  }
}
```

---

## 8. MODELE DE DONNEES (OFF-CHAIN)

### 8.1 Utilisateurs
```
users:
  id: UUID
  walletAddress: string (nullable pour consommateurs)
  role: PHARMACY | VET | FARMER | SLAUGHTERHOUSE | CONSUMER | ADMIN
  name: string
  email: string
  phone: string
  governorate: string
  licenseNumber: string (pour veterinaires)
  profilePhoto: string (URL)
  verified: boolean
  createdAt: timestamp
```

### 8.2 Produits (Marketplace)
```
products:
  id: UUID
  farmerId: UUID -> users
  lotId: string -> blockchain
  certificateHash: bytes32 -> blockchain
  title: string
  description: string
  category: EGGS | POULTRY_LIVE | POULTRY_MEAT | DAIRY | HONEY | RED_MEAT
  pricePerUnit: decimal
  unit: KG | PIECE | LITER | DOZEN
  quantityAvailable: integer
  photos: string[] (URLs)
  deliveryOptions: PICKUP | DELIVERY | BOTH
  location: { lat, lng, address }
  status: ACTIVE | SOLD_OUT | PAUSED
  createdAt: timestamp
```

### 8.3 Commandes
```
orders:
  id: UUID
  productId: UUID -> products
  consumerId: UUID -> users
  farmerId: UUID -> users
  quantity: integer
  totalPrice: decimal
  commission: decimal (10-12%)
  farmerPayout: decimal (totalPrice - commission)
  deliveryOption: PICKUP | DELIVERY
  deliveryAddress: string
  status: PENDING | CONFIRMED | PREPARING | READY | DELIVERED | CANCELLED
  createdAt: timestamp
```

### 8.4 Avis
```
reviews:
  id: UUID
  orderId: UUID -> orders
  consumerId: UUID -> users
  farmerId: UUID -> users
  rating: integer (1-5)
  comment: string
  createdAt: timestamp
```

---

## 9. ECRANS DE L'APPLICATION MOBILE

### 9.1 Ecrans a developper (hackathon)

| # | Ecran | Acteur | Priorite |
|---|---|---|---|
| 1 | Login / Inscription | Tous | MUST |
| 2 | Formulaire vente medicament | Pharmacie | MUST |
| 3 | Formulaire prescription | Veterinaire | MUST |
| 4 | Confirmation administration | Eleveur | MUST |
| 5 | Scanner QR + resultat eligibilite | Abattoir | MUST |
| 6 | Dashboard eleveur (lots + ventes) | Eleveur | MUST |
| 7 | Publier un produit | Eleveur | SHOULD |
| 8 | Catalogue produits | Consommateur | SHOULD |
| 9 | Page produit + tracabilite | Consommateur | SHOULD |
| 10 | Passer commande | Consommateur | SHOULD |

### 9.2 Design System

| Element | Specification |
|---|---|
| Couleurs | Vert SAFAR (#10B981), Bleu blockchain (#3B82F6), Rouge alerte (#EF4444) |
| Typo | Inter (corps), JetBrains Mono (donnees blockchain) |
| Coins | 12px (cartes), 8px (boutons), 24px (badges) |
| Mode | Dark mode par defaut |
| Animations | Transition rouge/vert dramatique pour gate abattoir |

### 9.3 Navigation mobile

```
Tab Bar (en bas):
  [Accueil] [Tracabilite] [Marketplace] [Profil]

Accueil:
  - Pharmacie: Liste des ventes recentes + bouton "Nouvelle vente"
  - Vet: Prescriptions recentes + bouton "Nouvelle prescription"
  - Eleveur: Mes lots + statut retrait + bouton "Publier produit"
  - Consommateur: Catalogue produits + recherche

Tracabilite:
  - Scanner QR (camera)
  - Historique complet du lot scanne

Marketplace:
  - Catalogue avec filtres
  - Page produit detail
  - Panier / Commande

Profil:
  - Infos personnelles
  - Historique commandes
  - Wallet info (acteurs blockchain)
```

---

## 10. SECURITE

### 10.1 Authentification
- Acteurs blockchain (pharmacie, vet, eleveur, abattoir): Wallet signature (EIP-712)
- Consommateur: JWT + email/mot de passe
- Biometrie mobile (empreinte/face) pour confirmation de transactions

### 10.2 Meta-Transactions (Zero Friction)
- L'utilisateur signe le message localement sur son telephone (operation gratuite)
- La cle privee du wallet est stockee dans le Secure Enclave (iOS) ou Android Keystore
  -> Jamais exposee a l'application, jamais en RAM
- Le backend SAFAR (Relayer) recoit la signature, valide, et soumet la transaction on-chain
- Le Relayer paie les frais de gas (ETH/MATIC) a la place de l'utilisateur
- Resultat: l'utilisateur utilise la blockchain sans jamais manipuler de crypto

### 10.3 Controle d'acces
- RBAC sur l'API backend
- Smart contract AccessControl pour transactions on-chain
- Chaque acteur ne peut ecrire que les donnees de son role
- Audit trail immuable: chaque action est logguee on-chain avec signature
  -> Impossible de modifier ou supprimer un enregistrement posteriori

### 10.4 Protection des donnees
- Donnees fermier: Agregees au niveau gouvernorat pour analytics (pas individuelles)
- Communications: HTTPS / TLS
- Stockage local: Chiffrement AES-256 des donnees sensibles sur l'appareil
- LLM local (Ollama): Aucune donnee ne quitte le serveur SAFAR
- Pour le hackathon: "Privacy-preserving by architecture"

### 10.5 Integrite blockchain
- Smart contracts non-modifiables apres deploiement
- DrugWithdrawalRegistry: delais legaux immuables, aucun override possible
- SlaughterGate: AUCUNE exception - le smart contract est la loi
- Hash de certificat (Poseidon hash): compatible avec ZKP pour audit sans divulgation (roadmap production)

---

## 11. PERIMETRE HACKATHON vs PRODUCTION

### 11.1 Ce qui est CONSTRUIT (demo)

| Module | Fonctionnalites |
|---|---|
| Blockchain | 5 smart contracts deployes sur Hardhat local (+ DrugWithdrawalRegistry) |
| Etapes 1-4 | Flux complet: vente -> prescription -> administration -> gate |
| Meta-Tx | Relayer backend paie le gas, user signe localement |
| Marketplace | Catalogue, page tracabilite, QR physique, commande (mock paiement) |
| QR Code | Generation + scan + etiquette physique post-certification |
| AI Layer 1 | Isolation Forest: detection anomalie sur 1 vet et 1 farm (donnees synthetiques) |
| AI Layer 2 | Ollama phi3:mini: assistant vet en direct pendant la demo |
| Offline | Formulaire eleveur fonctionne sans connexion, sync auto |

### 11.2 Ce qui est PRESENTE (slides)

| Module | Support |
|---|---|
| Paiement reel | Maquette Flouci/D17 |
| Logistique livraison | Partenariat decrit |
| Dashboard analytics | Mockup statique |
| Expansion regionale | Roadmap |

### 11.3 Allocation equipe

| Personne | Role | Responsabilites |
|---|---|---|
| Dev 1 | Blockchain | 5 smart contracts, Hardhat, ethers.js, Relayer meta-tx |
| Dev 2 | Mobile - Ferme | Ecrans pharmacie, vet, eleveur, abattoir (Etapes 1-4), offline-first |
| Dev 3 | Mobile - Marketplace | Catalogue, page produit, tracabilite, QR physique, commande |
| Dev 4 | Backend + IA | API Express, Isolation Forest, Ollama integration, donnees synthetiques |

### 11.4 Jalons

| Heure | Jalon |
|---|---|
| T+1h | Contrats API definis |
| T+4h | Smart contracts deployes, app mobile peut les appeler |
| T+8h | Flux ferme fonctionne (Etapes 1-4) |
| T+10h | Marketplace: catalogue + tracabilite |
| T+12h | Commande fonctionne (mock paiement) |
| T+15h | Integration complete |
| T+16h | Script demo repete |
| T+17h | Slides pitch |
| T+18h | Gel du code |

---

## 12. BUSINESS MODEL

### 12.1 Modele principal: Commission Marketplace

Toute la tracabilite est GRATUITE. Le revenu vient de la commission sur les ventes directes producteur vers consommateur.

| Source | Montant | Paye par |
|---|---|---|
| Commission par vente | 10-12% | Eleveur (preleve auto) |
| Frais de livraison | Variable | Consommateur |
| Mise en avant produit | 50-100 TND/mois | Eleveur (optionnel) |

### 12.2 Proposition de valeur

| Acteur | Avant SAFAR | Avec SAFAR |
|---|---|---|
| Eleveur | Vend a 4-5 TND/kg aux intermediaires | Vend a 7-8 TND/kg direct (+50%) |
| Consommateur | Paie 9-12 TND/kg sans garantie | Paie 7-8 TND/kg avec tracabilite (-20%) |
| SAFAR | - | Preleve 10-12% sur chaque vente |

### 12.3 Projections

| Periode | Metrique | Revenu |
|---|---|---|
| An 1 | 500 familles actives | ~130,000 TND/an |
| An 2 | 2,000 familles + restaurants | ~600,000 TND/an |
| An 3 | 5,000+ familles + expansion | ~1.5M TND/an |

---

## 13. CRITERES DE SUCCES

### Demo
- [ ] Flux Etapes 1-4 fonctionne en live sur mobile
- [ ] Gate abattoir montre rouge puis vert apres le delai
- [ ] Tenter de mettre 0 jours de retrait -> contrat refuse (securite demonstree)
- [ ] Marketplace montre au moins 3 produits avec tracabilite
- [ ] QR code d'un produit mene a la page tracabilite blockchain
- [ ] Assistant veterinaire Ollama repond en live a une question sur des symptomes
- [ ] Mode hors-ligne: couper le Wi-Fi, enregistrer une administration, reconnect -> sync

### Pitch
- [ ] Histoire de la molecule racontee de bout en bout
- [ ] Business model clair: "marketplace, 10% de commission"
- [ ] Signification de "SAFAR" mentionnee
- [ ] Expliquer: "Notre LLM tourne sur notre serveur - aucune donnee ne quitte la plateforme"
- [ ] Expliquer: "L'eleveur utilise la blockchain sans savoir ce qu'est une crypto"

### Technique
- [ ] Aucun crash (noeud Hardhat local + Ollama local)
- [ ] Video backup enregistree
- [ ] 3 piliers: AI (Isolation Forest + Ollama), Blockchain (5 contrats), Cybersecurite (meta-tx + secure enclave)

---

## 14. GLOSSAIRE

| Terme | Definition |
|---|---|
| ATC | Systeme de classification des medicaments (OMS) |
| AMR/RAM | Resistance antimicrobienne |
| AWaRe | Classification OMS: Access / Watch / Reserve |
| Colistine | Antibiotique de dernier recours, utilise en aviculture |
| Delai de retrait | Periode min entre derniere dose et abattage |
| EIP-712 | Standard Ethereum pour la signature de messages structures (meta-transactions) |
| Gate | Point de controle a l'abattoir |
| Isolation Forest | Algorithme ML de detection d'anomalies (scikit-learn) |
| Meta-Transaction | Transaction blockchain ou l'utilisateur signe mais ne paie pas le gas |
| Offline-First | Architecture ou l'app fonctionne sans connexion et synchronise ensuite |
| Ollama | Outil pour executer des LLMs localement (sans cloud, sans API externe) |
| Poseidon Hash | Fonction de hachage compatible avec les zero-knowledge proofs |
| Relayer | Service backend qui soumet les meta-transactions et paie le gas |
| Secure Enclave | Composant materiel securise du telephone pour stocker les cles privees |
| Smart Contract | Programme auto-executable sur la blockchain |
| DGSV | Direction Generale des Services Veterinaires (Tunisie) |
| XGBoost | Algorithme ML de prediction (gradient boosting) |
