<h1 align="center">Irrigation Card</h1>

<p align="center">
  Custom-Card zur Bewässerungssteuerung mit <strong>Hunter Hydrawise</strong> in Home Assistant.
</p>

<p align="center">
  <strong>Version 1.1.0</strong><br>
  <a href="https://github.com/BeGiBue/irrigation-card/actions/workflows/validate.yml"><img src="https://github.com/BeGiBue/irrigation-card/actions/workflows/validate.yml/badge.svg" alt="HACS validation"></a>
</p>

## Funktionen

- Zonen werden direkt als **Hydrawise-Geräte** ausgewählt – mehrere Zonen über den nativen Geräte-Picker hinzufügen, entfernen und sortieren
- Ohne Auswahl erscheinen automatisch alle Hydrawise-Zonen
- Alle Entitäten einer Zone werden selbst gefunden (Entity-Registry, `translation_key`) – unabhängig von Sprache und Entity-IDs
- Jeder Wert und jeder Schalter erscheint nur, wenn die zugehörige Entität existiert – fehlende Sensoren werden ausgeblendet statt mit „—“ angezeigt
- Pro Zone: Status (Bereit / Bewässert / Pausiert / Offline), nächster Zyklus, heute bewässert, Automatik-Schalter
- Manueller Start mit wählbarer Dauer (Standard 5 / 10 / 15 / 30 min) über `hydrawise.start_watering`
- Laufende Zone: Restzeit mit Fortschrittsbalken und Stopp-Taste; die Restzeit wird zwischen den Hydrawise-Abfragen minütlich heruntergezählt
- Nach Start/Stopp fordert die Card sofort ein Update an (Hydrawise fragt sonst nur alle 5 Minuten ab)
- Aufbau von oben nach unten: Titel, Pumpe, Zonen, Statistiken, Controller
- Optionale Pumpe (z. B. `switch.gartenpumpe`) als Schalter direkt unter dem Titel – Zustand und Schalter am rechten Rand
- Statistiken unter den Zonen: heute bewässert, Wasserverbrauch (nur wenn eine Verbrauchs-Entität existiert), aktive Zonen, optional Leistung und Energie eines Leistungsmessers (z. B. Messsteckdose der Pumpe); darunter Controller-Status und Regensensor – jeweils einzeilig mit dem Wert am rechten Rand
- Eingebettetes Foto (Hunter MP Rotator) als Banner hinter dem Titel oder dezent im Kartenhintergrund – optional eigene Bild-URL
- Theme-sensitive Darstellung für Light Mode, Dark Mode und eigene Themes (Glas-Look wie die [NAS Card](https://github.com/BeGiBue/nas-card))
- Optimiert für Hochformat und Touch – iPhone, iPad und Raspberry-Pi-Kiosk: Schrift wächst mit der Kartenbreite, breites Layout ab 480 px

## Voraussetzung

Die Integration [Hunter Hydrawise](https://www.home-assistant.io/integrations/hydrawise/) ist eingerichtet. Sie legt pro Zone ein Gerät mit diesen Entitäten an (Beispiel Zone „Rasen“):

```text
valve.rasen
switch.rasen_manuelle_bewasserung
switch.rasen_automatische_bewasserung
sensor.rasen_nachster_zyklus
sensor.rasen_bewasserungszeit          (verbleibende Bewässerungszeit)
binary_sensor.rasen_bewasserung
sensor.rasen_tagliche_aktive_bewasserungszeit
```

Die Card liest diese Zuordnung aus dem Gerät – die Entity-IDs müssen nicht eingetragen werden.

## Installation über HACS

### Automatisch

[![Open your Home Assistant instance and open this repository inside the Home Assistant Community Store.](https://my.home-assistant.io/badges/hacs_repository.svg)](https://my.home-assistant.io/redirect/hacs_repository/?owner=BeGiBue&repository=irrigation-card&category=plugin)

### Manuell

1. In HACS **Benutzerdefinierte Repositories** öffnen.
2. `https://github.com/BeGiBue/irrigation-card` hinzufügen.
3. Als Typ **Dashboard** auswählen.
4. **Irrigation Card** installieren.
5. Home Assistant bzw. den Browser vollständig neu laden.

## Card hinzufügen

Minimal – alle Hydrawise-Zonen automatisch:

```yaml
type: custom:irrigation-card
```

Mit ausgewählten Zonen (Geräte-IDs, am einfachsten im grafischen Editor wählen):

```yaml
type: custom:irrigation-card
title: Bewässerung
subtitle: Hunter Hydrawise
zones:
  - 1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d
  - 6d5c4b3a2f1e0d9c8b7a6f5e4d3c2b1a
pump_entity: switch.gartenpumpe
pump_title: Gartenpumpe
durations: ["5", "10", "15", "30"]
image_url: /local/images/rasen.jpg
```

## Optionen

Alle Optionen sind im grafischen Editor mit Standardfeldern von Home Assistant einstellbar (Textfelder, Auswahllisten, Schalter, Schieberegler, Geräte- und Entity-Picker).

| Option | Werte | Standard | Beschreibung |
|---|---|---|---|
| **Allgemein** | | | |
| `title` | Text | `Bewässerung` | Haupttitel |
| `subtitle` | Text | `Hunter Hydrawise` | Untertitel; leer = Name des Controllers |
| `layout` | `auto` \| `wide` \| `compact` | `auto` | `auto`: breites Layout ab 480 px Kartenbreite |
| `scale` | `0.8` – `1.8` | `1` | Skaliert die gesamte Card, z. B. für Kiosk-Displays |
| **Bild** | | | |
| `show_image` | `true` \| `false` | `true` | Bild anzeigen |
| `image_mode` | `banner` \| `background` | `banner` | `banner`: Foto hinter dem Titel. `background`: blass im Kartenhintergrund. |
| `image_url` | URL | leer | Eigenes Bild, z. B. `/local/images/rasen.jpg`. Leer = eingebettetes Standardbild. |
| **Zonen** | | | |
| `zones` | Liste von Geräte-IDs | leer | Hydrawise-Zonen in Anzeigereihenfolge. Leer = alle Zonen. |
| `durations` | Liste von Minuten | `5, 10, 15, 30` | Start-Tasten (max. 6, je 1 – 1440 min); eigene Werte möglich |
| **Pumpe** | | | |
| `show_pump` | `true` \| `false` | `true` | Pumpe anzeigen |
| `pump_entity` | Entität | `switch.gartenpumpe` | Pumpe (`switch`, `valve`, `input_boolean`); ohne Entität keine Anzeige |
| `pump_title` | Text | `Gartenpumpe` | Bezeichnung der Pumpe |
| **Statistiken** | | | |
| `show_stats` | `true` \| `false` | `true` | Heute bewässert, Wasserverbrauch und aktive Zonen anzeigen |
| `daily_time_entity` | Entität | automatisch | Tägliche Bewässerungszeit überschreiben |
| `water_use_entity` | Entität | automatisch | Wasserverbrauch überschreiben. Hydrawise legt ihn nur mit Durchflusssensor an – ohne Entität wird kein Verbrauch angezeigt. |
| `power_entity` | Entität | leer | Leistungsmesser – aktuelle Leistung (`device_class: power`), z. B. Messsteckdose der Pumpe. Kachel wird orange, sobald Leistung anliegt. |
| `energy_entity` | Entität | leer | Leistungsmesser – Energie (`device_class: energy`), z. B. kWh-Zähler der Messsteckdose |
| **Controller** | | | |
| `show_controller` | `true` \| `false` | `true` | Controller-Status und Regensensor anzeigen |
| `status_entity` | Entität | automatisch | Controller-Status überschreiben |
| `rain_entity` | Entität | automatisch | Regensensor überschreiben (z. B. ein eigener Sensor) |

Die Akzentfarbe lässt sich per Theme mit `--irrigation-color` anpassen.

## Grafischer Editor

Die Card verwendet Home Assistants eingebauten Formular-Editor (`getConfigForm()`) mit den aufklappbaren Gruppen **Allgemein**, **Bild**, **Zonen**, **Pumpe**, **Statistiken** und **Controller**. Zonen werden im Geräte-Picker ausgewählt, der nur Hydrawise-Zonen anbietet; die Startdauern sind eine Mehrfachauswahl, in die eigene Minutenwerte eingetippt werden können.

## Bedienung

| Element | Aktion |
|---|---|
| Dauer-Taste (z. B. „10 min“) | `hydrawise.start_watering` mit dieser Dauer |
| Stopp | schaltet `switch.<zone>_manuelle_bewasserung` aus |
| Automatik | schaltet `switch.<zone>_automatische_bewasserung` (aus = Hydrawise pausiert die Zone für 365 Tage) |
| Pumpe | schaltet die Pumpen-Entität um |
| Kacheln, Zeilen, Status-Pill | öffnen den Mehr-Info-Dialog |

## Bild

Das Standardbild (`images/MP-Rotator-Flyer.webp`, zugeschnitten und gespiegelt) ist direkt in der JavaScript-Datei eingebettet, da HACS nur `irrigation-card.js` installiert. Mit `show_image: false` wird es ausgeblendet.

## Hinweise zu Marken

Dieses Projekt ist ein unabhängiges Community-Projekt und steht in keiner Verbindung zu Hunter Industries oder Home Assistant. **Hunter** und **Hydrawise** sind Marken ihrer jeweiligen Rechteinhaber.

## Lizenz

GNU Affero General Public License v3.0 only (**AGPL-3.0-only**). Details stehen in [`LICENSE`](LICENSE).
