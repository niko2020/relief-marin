# Relief Marin

Application web de visualisation de reliefs sous-marins avec superposition de couches satellite et cartes marines.

## 📋 Description

Relief Marin est une application web interactive permettant de visualiser et d'explorer des cartes sous-marines avec :
- Superposition dynamique de couches (satellite, relief, cartes marines)
- Contrôle de transparence en temps réel
- Navigation tactile fluide (pinch-to-zoom, pan)
- Géolocalisation GPS
- Interface optimisée mobile-first
- PWA (Progressive Web App) installable

## 🚀 Fonctionnalités

### Contrôles de la carte
- **Zoom/Dézoom** : Pincement à deux doigts (mobile) ou molette (desktop)
- **Déplacement** : Glisser avec un doigt (mobile) ou clic-glisser (desktop)
- **Réinitialisation** : Bouton ↺ ou triple tap ou double-clic
- **GPS** : Bouton 📍 pour localiser votre position

### Couches disponibles
1. **Satellite** : Vue satellite de la zone marine
2. **Relief** : Carte bathymétrique du relief sous-marin
3. **Carte Marine** : Carte marine de navigation

### Contrôle de transparence
Slider permettant d'ajuster la transparence de la couche relief (0-100%) pour une meilleure visualisation.

## 🎯 Navigation

### Raccourcis clavier
- `Échap` : Réinitialiser la vue
- `1` : Basculer sur vue satellite
- `2` : Basculer sur carte marine
- `Espace` : Activer GPS
- `↑/↓/←/→` : Ajuster la transparence (si slider sélectionné)

### Contrôles tactiles (mobile)
- **1 doigt** : Déplacer la carte
- **2 doigts (pincement)** : Zoomer/dézoomer
- **Triple tap** : Réinitialiser la vue
- **Bouton ↺** : Réinitialiser le zoom

## 📁 Structure du projet

```
relief-marin/
├── index.html              # Page principale
├── README.md              # Documentation
├── css/
│   ├── main.css           # Styles de base
│   └── components.css     # Styles des composants
├── js/
│   └── app.js            # Application principale
├── config/
│   └── map-config.json   # Configuration de la carte
└── media/
    ├── satellite.jpg     # Image satellite
    ├── relief.jpg        # Image relief
    └── maps.jpg          # Image carte marine
```

## ⚙️ Configuration

### Fichier `config/map-config.json`

```json
{
  "bounds": {
    "north": 43.3000,
    "south": 43.2500,
    "west": 5.3500,
    "east": 5.4000
  },
  "center": {
    "lat": 43.2750,
    "lon": 5.3750
  },
  "name": "Zone Relief Marin",
  "description": "Cartes sous-marines - Méditerranée",
  "images": {
    "satellite": "media/satellite.jpg",
    "relief": "media/relief.jpg",
    "maps": "media/maps.jpg"
  }
}
```

### Paramètres configurables

- **bounds** : Coordonnées géographiques de la zone (nord, sud, est, ouest)
- **center** : Point central de la carte (latitude, longitude)
- **name** : Nom de la zone
- **description** : Description de la zone
- **images** : Chemins vers les images des couches

## 🛠️ Installation

### Prérequis
- Serveur web (Apache, Nginx, ou serveur de développement)
- Navigateur moderne (Chrome, Firefox, Safari, Edge)

### Déploiement local

1. Cloner ou télécharger le projet
2. Placer vos images dans le dossier `media/` :
   - `satellite.jpg` : Vue satellite
   - `relief.jpg` : Carte du relief
   - `maps.jpg` : Carte marine
3. Configurer `config/map-config.json` selon votre zone
4. Ouvrir `index.html` dans un navigateur

### Serveur de développement

```bash
# Python 3
python -m http.server 8000

# Node.js
npx serve

# PHP
php -S localhost:8000
```

Puis ouvrir `http://localhost:8000` dans votre navigateur.

## 📱 PWA (Progressive Web App)

L'application est installable sur mobile et desktop :

1. Ouvrir l'application dans un navigateur
2. Cliquer sur "Installer" ou "Ajouter à l'écran d'accueil"
3. L'application s'ouvre comme une application native

### Fonctionnalités PWA
- ✅ Installation sur l'écran d'accueil
- ✅ Fonctionne hors ligne (via Service Worker)
- ✅ Interface plein écran
- ✅ Icônes et splash screen personnalisés

## 🎨 Personnalisation

### Thème et couleurs

Modifier les variables CSS dans `css/main.css` :

```css
:root {
    --primary: #0ea5e9;        /* Couleur principale */
    --accent: #10b981;          /* Couleur d'accent */
    --background: #0f172a;      /* Arrière-plan */
    --text-primary: #f8fafc;    /* Texte principal */
}
```

### Limites de zoom

Modifier dans `js/app.js` :

```javascript
const MAX_SCALE = 10;  // Zoom maximum
const MIN_SCALE = 1;   // Zoom minimum
```

## 🌐 Compatibilité

### Navigateurs supportés
- ✅ Chrome/Edge 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Opera 76+

### Appareils
- ✅ Desktop (Windows, macOS, Linux)
- ✅ Mobile (iOS, Android)
- ✅ Tablettes

## ♿ Accessibilité

L'application respecte les standards WCAG 2.1 :
- ✅ Navigation au clavier complète
- ✅ Attributs ARIA pour lecteurs d'écran
- ✅ Mode haut contraste
- ✅ Support mode réduit d'animations
- ✅ Indicateurs de focus visibles

## 🔧 Dépannage

### Les images ne s'affichent pas
- Vérifier que les fichiers existent dans `media/`
- Vérifier les chemins dans `config/map-config.json`
- Des images placeholder sont générées automatiquement si les images sont manquantes

### Le GPS ne fonctionne pas
- Nécessite HTTPS (sauf localhost)
- Autoriser la géolocalisation dans le navigateur
- En mode file:// une position simulée est affichée

### Le zoom est lent
- Vérifier la taille des images (recommandé : < 2MB par image)
- Optimiser les images (compression JPEG 80-90%)

## 📄 Licence

Ce projet est sous licence libre. Vous pouvez l'utiliser, le modifier et le distribuer librement.

## 🤝 Contribution

Les contributions sont les bienvenues ! Pour contribuer :

1. Fork le projet
2. Créer une branche (`git checkout -b feature/amelioration`)
3. Commit vos changements (`git commit -m 'Ajout fonctionnalité'`)
4. Push vers la branche (`git push origin feature/amelioration`)
5. Ouvrir une Pull Request

## 📞 Support

Pour toute question ou problème, ouvrir une issue sur le dépôt du projet.

---

**Version** : 2.0
**Dernière mise à jour** : Octobre 2025
