# Irrigation Card 💧

Eine Home-Assistant-Lovelace-Karte zur Bewässerungssteuerung: eine globale Pumpe und beliebig viele Zonen – komplett im visuellen Editor konfigurierbar.

Pro Zone werden angezeigt:

| Element | Entität (Beispiel „Rasen“) |
|---|---|
| Manuelle Bewässerung (Schalter) | `switch.rasen_manuelle_bewasserung` |
| Automatische Bewässerung (Schalter) | `switch.rasen_automatische_bewasserung` |
| Nächster Zyklus | `sensor.rasen_nachster_zyklus` |
| Bewässerungszeit | `sensor.rasen_bewasserungszeit` |
| Bewässerung aktiv | `binary_sensor.rasen_bewasserung` |

Läuft eine Zone, wird sie farbig hervorgehoben und animiert. Ein Klick auf Sensoren öffnet den Mehr-Info-Dialog, Schalter werden direkt umgeschaltet.

## Installation

### HACS (benutzerdefiniertes Repository)
1. HACS → ⋮ → *Benutzerdefinierte Repositories* → `https://github.com/BeGiBue/irrigation-card`, Typ **Dashboard**.
2. „Irrigation Card“ installieren und den Browser neu laden.

### Manuell
1. `irrigation-card.js` nach `/config/www/irrigation-card.js` kopieren.
2. *Einstellungen → Dashboards → ⋮ → Ressourcen* → `/local/irrigation-card.js` als **JavaScript-Modul** hinzufügen.

## Konfiguration

Im Dashboard *Karte hinzufügen → Irrigation Card*. Im Editor lassen sich Zonen hinzufügen, entfernen, sortieren und einzeln bearbeiten.

**Präfix-Kurzform:** Trägst du bei einer Zone nur das Präfix (z. B. `rasen`) ein, werden alle leeren Entitätsfelder automatisch nach dem Muster oben ergänzt. Einzeln gesetzte Entitäten haben Vorrang.

```yaml
type: custom:irrigation-card
title: Bewässerung
pump: switch.gartenpumpe
pump_name: Gartenpumpe
zones:
  - name: Rasen
    icon: mdi:sprinkler-variant
    prefix: rasen
  - name: Hochbeet
    icon: mdi:flower
    manual_switch: switch.hochbeet_manuelle_bewasserung
    auto_switch: switch.hochbeet_automatische_bewasserung
    next_cycle_sensor: sensor.hochbeet_nachster_zyklus
    duration_sensor: sensor.hochbeet_bewasserungszeit
    active_sensor: binary_sensor.hochbeet_bewasserung
```

### Optionen

| Option | Typ | Standard | Beschreibung |
|---|---|---|---|
| `title` | string | `Bewässerung` | Kartentitel |
| `icon` | string | `mdi:sprinkler-variant` | Icon im Titel |
| `pump` | entity | – | Globale Pumpe (`switch`, `valve`, `input_boolean`) |
| `pump_name` | string | Anzeigename der Entität | Name der Pumpe |
| `pump_icon` | string | `mdi:pump` | Icon der Pumpe |
| `show_pump` | boolean | `true` | Pumpe anzeigen |
| `zones` | list | `[]` | Zonen (siehe unten) |

**Zone:** `name`, `icon`, `prefix`, `manual_switch`, `auto_switch`, `next_cycle_sensor`, `duration_sensor`, `active_sensor` – alle optional.

Ohne `active_sensor` gilt eine Zone als aktiv, wenn `manual_switch` eingeschaltet ist.

### Design

Die Akzentfarbe lässt sich per Theme oder [card-mod](https://github.com/thomasloven/lovelace-card-mod) über `--irrigation-accent-color` anpassen.
