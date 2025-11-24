# Widget Écran de Verrouillage - Guide

Le widget supporte maintenant l'écran de verrouillage avec 3 formats différents.

## Formats disponibles

### 1. Accessory Rectangular (Recommandé)
**Format :** Rectangulaire horizontal
**Affiche :**
- ❤️ **X jours ensemble**
- 📍 **Distance** • **Nom du partenaire**

**Utilisation :** Parfait pour voir rapidement les jours ensemble et la distance GPS en même temps.

### 2. Accessory Circular
**Format :** Cercle compact
**Affiche :**
- ❤️ **X jours** ensemble

**Utilisation :** Format minimaliste, juste les jours ensemble.

### 3. Accessory Inline
**Format :** Texte compact (sous l'heure)
**Affiche :**
- ❤️ **X jours ensemble • Distance**

**Utilisation :** Texte simple sous l'horloge sur l'écran de verrouillage.

## Données affichées

### Days Together (Jours ensemble)
- Calculé depuis les dates de création des comptes des deux partenaires
- Synchronisé en temps réel depuis Firebase
- Mis à jour automatiquement

### Distance GPS
- Distance calculée entre les deux partenaires
- Format : "2.5km", "150m", etc.
- Affiche le nom du partenaire si disponible
- Nécessite que les deux partenaires partagent leur localisation

## Ajouter le widget à l'écran de verrouillage

### Sur iPhone

1. **Verrouiller l'iPhone**
2. **Long press sur l'écran de verrouillage**
3. **Appuyer sur "Personnaliser"**
4. **Sélectionner "Verrouillage"** (si pas déjà sélectionné)
5. **Appuyer sur "Widgets"** en bas de l'écran
6. **Faire défiler** et trouver "Nightly Couple"
7. **Ajouter le format souhaité :**
   - Rectangulaire : Plus d'informations
   - Circulaire : Compact
   - Inline : Texte sous l'heure

### Formats recommandés

- **Accessory Rectangular** : Pour voir jours ensemble + distance
- **Accessory Circular** : Pour un design minimaliste
- **Accessory Inline** : Pour un texte discret sous l'heure

## Fonctionnalités

### Mise à jour automatique
- Le widget se met à jour toutes les 30 minutes
- Les données sont synchronisées depuis Firebase en temps réel
- Force update avec `ExtensionStorage.reloadWidget()`

### Données en temps réel
- **Days Together** : Calculé depuis Firebase
- **Distance** : Calculée depuis les coordonnées GPS en temps réel
- **Partner Name** : Mis à jour si le partenaire change son pseudo

## Design

### Accessory Rectangular
```
❤️ 45 jours         📍 2.5km
   ensemble           PARTENAIRE
```

### Accessory Circular
```
    ❤️
   45
  jours
```

### Accessory Inline
```
❤️ 45 jours ensemble • 2.5km
```

## Limitations iOS

### Accessory Widgets
- Disponibles uniquement sur iOS 16.0+
- Limités à certaines informations
- Pas de couleurs personnalisées (utilise le thème système)
- Taille fixe selon le format

### Performance
- Les widgets de l'écran de verrouillage consomment moins de batterie
- Mises à jour limitées pour préserver la batterie
- Données mises en cache dans UserDefaults

## Données synchronisées

Les données sont partagées via App Groups (`group.com.emplica.nightly.data`) :

```swift
let defaults = UserDefaults(suiteName: "group.com.emplica.nightly.data")
let daysTogether = defaults?.integer(forKey: "daysTogether") ?? 0
let distance = defaults?.string(forKey: "distance") ?? "N/A"
let partnerName = defaults?.string(forKey: "partnerName") ?? ""
```

## Troubleshooting

### Le widget ne s'affiche pas sur l'écran de verrouillage

1. **Vérifier iOS 16.0+** : Les Accessory Widgets nécessitent iOS 16.0+
2. **Vérifier la disponibilité** : Certains iPhone plus anciens ne supportent pas tous les formats
3. **Réessayer** : Supprimer et réajouter le widget

### Les données ne s'affichent pas

1. **Vérifier les App Groups** : S'assurer que l'App Group est configuré dans Xcode
2. **Vérifier les données** : S'assurer qu'un partenaire est connecté
3. **Forcer la mise à jour** : `ExtensionStorage.reloadWidget()` depuis l'app

### La distance n'apparaît pas

1. **Vérifier le partage GPS** : Les deux partenaires doivent partager leur localisation
2. **Vérifier les permissions** : L'app doit avoir les permissions de localisation
3. **Attendre quelques secondes** : Le GPS peut prendre du temps pour obtenir une position précise

## Code

Les vues sont définies dans `targets/widget/NightlyWidget.swift` :

- `LockScreenRectangularView` : Vue rectangulaire
- `LockScreenCircularView` : Vue circulaire  
- `LockScreenInlineView` : Vue inline

Le widget détecte automatiquement le format avec `@Environment(\.widgetFamily)` et affiche la vue appropriée.

## Exemples d'affichage

### Rectangular
```
[❤️] 45 jours        [📍] 2.5km
     ensemble            PARTENAIRE
```

### Circular
```
┌─────────┐
│   ❤️    │
│   45    │
│  jours  │
└─────────┘
```

### Inline
```
❤️ 45 jours ensemble • 2.5km
```

