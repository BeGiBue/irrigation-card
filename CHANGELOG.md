# Changelog

## 1.1.0 - 2026-10-08

### Geändert

- Neue Reihenfolge: Pumpe direkt unter dem Titel, darunter die Zonen, dann die Statistiken (Heute bewässert, Verbrauch, aktive Zonen) und zuletzt Controller-Status und Regensensor.
- Pumpe und Controller-Kacheln einzeilig: Titel links, Wert bzw. Zustand und Schalter am rechten Rand.
- Controller-Kacheln breit in zwei Spalten; eine übrige Kachel nutzt die volle Breite.

- Alle Einstellungen im grafischen Editor mit Standardfeldern, gegliedert in Allgemein, Bild, Zonen, Pumpe, Statistiken und Controller.
- Startdauern als Mehrfachauswahl (eigene Werte möglich) statt Freitext; Textangaben wie `5, 10, 15` funktionieren weiterhin.
- Neue Optionen `show_pump`, `show_stats`, `daily_time_entity` und `water_use_entity`; `show_controller` blendet nur noch Controller-Status und Regensensor aus.

### Behoben

- Alle Sensoren und Schalter erscheinen nur, wenn die Entität tatsächlich existiert – auch nächster Zyklus, Restzeit und Automatik (vorher teils mit „—“).
- „Nächster Zyklus“ zeigte bei Terminen am Folgetag doppelt „Morgen … morgen“.

## 1.0.0 - 2026-10-07

- Erste Veröffentlichung der Irrigation Card für Hunter Hydrawise.
- Zonen als Hydrawise-Geräte im nativen Geräte-Picker wählbar; ohne Auswahl alle Zonen automatisch.
- Entitäten werden über die Entity-Registry (`translation_key`) zugeordnet.
- Manueller Start mit wählbaren Dauern, Stopp, Automatik-Schalter, Restzeit mit Fortschrittsbalken.
- Sofortiges Update nach Start/Stopp; Restzeit wird zwischen den Abfragen heruntergezählt.
- Controller-Kacheln (Status, Regensensor, Tageswerte, aktive Zonen) und optionale Pumpe.
- Eingebettetes Standardbild (Hunter MP Rotator) als Banner oder im Kartenhintergrund, eigene Bild-URL möglich.
- Glas-Look, Light/Dark Mode, optimiert für Hochformat, Touch und Kiosk (`layout`, `scale`).
