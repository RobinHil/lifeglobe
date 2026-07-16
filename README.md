# LifeGlobe

Jeu de la vie de Conway (B3/S23) projeté sur un globe terrestre 3D, façon hologramme.
Les cellules - minuscules, comme des organismes microscopiques - ne vivent que sur les
continents émergés ; les océans restent vides. Zoomez pour révéler le détail de la
simulation, comme au microscope.

Deux modes de rendu :

- **Hologramme** (par défaut) : sphère bleue semi-transparente, contours des continents
  tracés finement, léger glow cyan.
- **Réaliste** : texture satellite classique, couleurs naturelles de la Terre.

Dans les deux cas, un fin axe matérialise les pôles, et le HUD reste minimal
(population, génération, naissances/morts, historique de population).

## Stack

- [Vite](https://vite.dev/) + React 19 + TypeScript
- Three.js via `@react-three/fiber` + `@react-three/drei`
- `@react-three/postprocessing` (bloom léger sur les cellules vivantes)
- `zustand` (état global), `recharts` (historique de population)
- Tailwind CSS, icônes `lucide-react`
- Gestionnaire de paquets : **pnpm**

## Lancer en local

Prérequis : Node 22 (voir `.nvmrc`) et pnpm.

```bash
pnpm install
pnpm dev        # http://localhost:5173
```

Build de production :

```bash
pnpm build      # sortie dans dist/
pnpm preview
```

## Lancer avec Docker

```bash
docker compose up --build    # http://localhost:8080
```

Le conteneur builde l'application (pnpm) puis sert `dist/` via nginx.

## Structure du dossier

```
src/
  simulation/       # logique pure du jeu de la vie (aucune dépendance React/Three)
    lifeEngine.ts   # moteur B3/S23, Uint8Array, torique en longitude
    terrainMask.ts  # lecture de l'image terre/océan -> masque isLand
  scene/            # composants 3D (React Three Fiber)
    Globe.tsx       # sphère hologramme/réaliste, contours, axe des pôles
    LifeGrid.tsx    # cellules vivantes en InstancedMesh + boucle de simulation
    CameraRig.tsx   # OrbitControls (rotation + zoom)
  store/
    simulationStore.ts
  ui/
    HUD.tsx         # population, génération, naissances/morts
    StatsPanel.tsx  # graphique discret de la population
    SettingsPanel.tsx
  assets/           # masque terre/océan + texture couleur (équirectangulaires, 4096×2048)
```

## Données terrain

Deux images statiques, c'est tout :

1. `earth-water-mask.png` - masque terre/océan noir et blanc. Chargé dans un canvas
   caché, pixels lus via `getImageData`, seuil de luminosité, sous-échantillonnage au
   plus proche voisin vers la grille de simulation (`isLand`). La polarité clair/foncé
   est détectée automatiquement (les océans couvrent ~71 % du globe).
2. `earth-color.jpg` - texture satellite appliquée telle quelle en mode réaliste.

## Réglages disponibles

- Lecture / Pause, pas à pas
- Vitesse de simulation (1 à 60 générations/s), découplée du framerate
- Réinitialisation aléatoire avec densité réglable, effacement total
- Résolution de la grille : 360, 720 (défaut), 1440 ou 2880 cellules de large
  (hauteur = moitié de la largeur)
- Rotation automatique du globe on/off
- Mode de rendu : hologramme / réaliste

Contrôles caméra : clic-glisser pour tourner, molette ou pincement pour zoomer.

## Crédits

Textures d'après les images NASA Blue Marble (domaine public), via le projet
[webgl-earth](https://github.com/turban/webgl-earth).
