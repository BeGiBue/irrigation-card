/**
 * Irrigation Card – Bewässerungssteuerung für Home Assistant
 *
 * Eine Karte mit globaler Pumpe und beliebig vielen Zonen. Jede Zone kennt:
 *   manual_switch     – Schalter für manuelle Bewässerung
 *   auto_switch       – Schalter für automatische Bewässerung
 *   next_cycle_sensor – Sensor mit dem nächsten Zyklus
 *   duration_sensor   – Sensor mit der Bewässerungszeit
 *   active_sensor     – Binary-Sensor "Bewässerung läuft"
 *
 * Mit `prefix` (z. B. "rasen") werden fehlende Entitäten automatisch nach dem
 * Muster switch.<prefix>_manuelle_bewasserung usw. ergänzt.
 */

const CARD_VERSION = "1.0.0";

const ENTITY_PATTERNS = {
  manual_switch: (p) => `switch.${p}_manuelle_bewasserung`,
  auto_switch: (p) => `switch.${p}_automatische_bewasserung`,
  next_cycle_sensor: (p) => `sensor.${p}_nachster_zyklus`,
  duration_sensor: (p) => `sensor.${p}_bewasserungszeit`,
  active_sensor: (p) => `binary_sensor.${p}_bewasserung`,
};

const STRINGS = {
  de: {
    title: "Bewässerung",
    pump: "Pumpe",
    running: "Bewässert",
    idle: "Bereit",
    manual: "Manuell",
    auto: "Automatik",
    next_cycle: "Nächster Zyklus",
    duration: "Bewässerungszeit",
    unavailable: "Nicht verfügbar",
    no_zones: "Keine Zonen konfiguriert. Füge im Editor eine Zone hinzu.",
    add_zone: "Zone hinzufügen",
    remove_zone: "Entfernen",
    move_up: "Nach oben",
    move_down: "Nach unten",
    zone: "Zone",
    general: "Allgemein",
  },
  en: {
    title: "Irrigation",
    pump: "Pump",
    running: "Watering",
    idle: "Idle",
    manual: "Manual",
    auto: "Automatic",
    next_cycle: "Next cycle",
    duration: "Watering time",
    unavailable: "Unavailable",
    no_zones: "No zones configured. Add a zone in the editor.",
    add_zone: "Add zone",
    remove_zone: "Remove",
    move_up: "Move up",
    move_down: "Move down",
    zone: "Zone",
    general: "General",
  },
};

function t(hass, key) {
  const lang = (hass && hass.language ? hass.language : "de").split("-")[0];
  return (STRINGS[lang] || STRINGS.en)[key] || STRINGS.en[key] || key;
}

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (c) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  })[c]);
}

/** Ergänzt fehlende Entitäten einer Zone anhand des Präfixes. */
function resolveZone(zone) {
  const resolved = { ...zone };
  const prefix = (zone.prefix || "").trim();
  if (prefix) {
    for (const [key, pattern] of Object.entries(ENTITY_PATTERNS)) {
      if (!resolved[key]) resolved[key] = pattern(prefix);
    }
  }
  return resolved;
}

function isOn(stateObj) {
  return !!stateObj && ["on", "open", "opening"].includes(stateObj.state);
}

function isUnavailable(stateObj) {
  return !stateObj || ["unavailable", "unknown"].includes(stateObj.state);
}

function fireEvent(node, type, detail) {
  node.dispatchEvent(new CustomEvent(type, { detail, bubbles: true, composed: true }));
}

/** Formatiert einen Zeitstempel relativ ("in 3 Std.") plus Uhrzeit. */
function formatTimestamp(hass, value) {
  const date = new Date(value);
  if (isNaN(date.getTime())) return null;
  const lang = hass && hass.language ? hass.language : "de";
  const diffSec = Math.round((date.getTime() - Date.now()) / 1000);
  const abs = Math.abs(diffSec);
  const rtf = new Intl.RelativeTimeFormat(lang, { numeric: "auto" });
  let relative;
  if (abs < 60) relative = rtf.format(diffSec, "second");
  else if (abs < 3600) relative = rtf.format(Math.round(diffSec / 60), "minute");
  else if (abs < 86400) relative = rtf.format(Math.round(diffSec / 3600), "hour");
  else relative = rtf.format(Math.round(diffSec / 86400), "day");
  const sameDay = new Date().toDateString() === date.toDateString();
  const time = date.toLocaleString(lang, sameDay
    ? { hour: "2-digit", minute: "2-digit" }
    : { weekday: "short", day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
  return `${time} · ${relative}`;
}

function formatState(hass, stateObj) {
  if (!stateObj) return "–";
  if (isUnavailable(stateObj)) return t(hass, "unavailable");
  if (stateObj.attributes.device_class === "timestamp") {
    const formatted = formatTimestamp(hass, stateObj.state);
    if (formatted) return formatted;
  }
  if (typeof hass.formatEntityState === "function") return hass.formatEntityState(stateObj);
  const unit = stateObj.attributes.unit_of_measurement;
  return unit ? `${stateObj.state} ${unit}` : stateObj.state;
}

class IrrigationCard extends HTMLElement {
  static getConfigElement() {
    return document.createElement("irrigation-card-editor");
  }

  static getStubConfig(hass) {
    const prefix = hass && Object.keys(hass.states)
      .map((id) => id.match(/^switch\.(.+)_manuelle_bewasserung$/))
      .find(Boolean);
    return {
      title: "Bewässerung",
      pump: hass && hass.states["switch.gartenpumpe"] ? "switch.gartenpumpe" : "",
      zones: [{
        name: prefix ? prefix[1].charAt(0).toUpperCase() + prefix[1].slice(1) : "Rasen",
        icon: "mdi:sprinkler-variant",
        prefix: prefix ? prefix[1] : "rasen",
      }],
    };
  }

  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._lastSignature = "";
  }

  setConfig(config) {
    if (!config) throw new Error("Ungültige Konfiguration");
    if (config.zones && !Array.isArray(config.zones)) {
      throw new Error("'zones' muss eine Liste sein");
    }
    this._config = {
      title: "Bewässerung",
      icon: "mdi:sprinkler-variant",
      show_pump: true,
      ...config,
      zones: (config.zones || []).map(resolveZone),
    };
    this._lastSignature = "";
    this._render();
  }

  set hass(hass) {
    this._hass = hass;
    // Nur neu rendern, wenn sich eine relevante Entität geändert hat.
    const signature = this._entityIds()
      .map((id) => {
        const s = hass.states[id];
        return s ? `${id}:${s.state}:${s.last_updated}` : `${id}:-`;
      })
      .join("|") + `|${hass.language}`;
    if (signature !== this._lastSignature) {
      this._lastSignature = signature;
      this._render();
    }
  }

  connectedCallback() {
    // Relative Zeitangaben ("in 5 Min.") regelmäßig aktualisieren.
    this._timer = setInterval(() => this._render(), 60000);
  }

  disconnectedCallback() {
    clearInterval(this._timer);
  }

  getCardSize() {
    return 1 + (this._config ? this._config.zones.length * 3 : 0);
  }

  getGridOptions() {
    return { columns: 12, min_columns: 6 };
  }

  _entityIds() {
    if (!this._config) return [];
    const ids = [this._config.pump];
    for (const zone of this._config.zones) {
      ids.push(...Object.keys(ENTITY_PATTERNS).map((k) => zone[k]));
    }
    return ids.filter(Boolean);
  }

  _toggle(entityId) {
    const stateObj = this._hass.states[entityId];
    if (!stateObj || isUnavailable(stateObj)) return;
    const domain = entityId.split(".")[0];
    if (domain === "valve") {
      this._hass.callService("valve", isOn(stateObj) ? "close_valve" : "open_valve", { entity_id: entityId });
    } else {
      this._hass.callService("homeassistant", isOn(stateObj) ? "turn_off" : "turn_on", { entity_id: entityId });
    }
  }

  _moreInfo(entityId) {
    if (entityId) fireEvent(this, "hass-more-info", { entityId });
  }

  _onClick(ev) {
    const target = ev.target.closest("[data-action]");
    if (!target) return;
    const { action, entity } = target.dataset;
    if (action === "toggle") this._toggle(entity);
    else if (action === "more-info") this._moreInfo(entity);
  }

  _renderToggle(entityId, label, icon) {
    const hass = this._hass;
    if (!entityId) return "";
    const stateObj = hass.states[entityId];
    const on = isOn(stateObj);
    const disabled = isUnavailable(stateObj);
    return `
      <button class="toggle ${on ? "on" : ""}" data-action="toggle" data-entity="${escapeHtml(entityId)}"
        ${disabled ? "disabled" : ""} aria-pressed="${on}" title="${escapeHtml(entityId)}">
        <ha-icon icon="${icon}"></ha-icon>
        <span class="toggle-label">${escapeHtml(label)}</span>
        <span class="switch"><span class="knob"></span></span>
      </button>`;
  }

  _renderInfo(entityId, label, icon) {
    if (!entityId) return "";
    const stateObj = this._hass.states[entityId];
    return `
      <div class="info" data-action="more-info" data-entity="${escapeHtml(entityId)}" role="button" tabindex="0">
        <ha-icon icon="${icon}"></ha-icon>
        <div class="info-text">
          <span class="info-label">${escapeHtml(label)}</span>
          <span class="info-value">${escapeHtml(formatState(this._hass, stateObj))}</span>
        </div>
      </div>`;
  }

  _renderZone(zone) {
    const hass = this._hass;
    const activeObj = hass.states[zone.active_sensor];
    const manualObj = hass.states[zone.manual_switch];
    const running = zone.active_sensor ? isOn(activeObj) : isOn(manualObj);
    const name = zone.name || (manualObj && manualObj.attributes.friendly_name) || t(hass, "zone");
    const statusEntity = zone.active_sensor || zone.manual_switch;

    return `
      <div class="zone ${running ? "running" : ""}">
        <div class="zone-header" data-action="more-info" data-entity="${escapeHtml(statusEntity || "")}">
          <div class="zone-icon"><ha-icon icon="${escapeHtml(zone.icon || "mdi:sprinkler-variant")}"></ha-icon></div>
          <div class="zone-title">
            <span class="zone-name">${escapeHtml(name)}</span>
            <span class="zone-status">${t(hass, running ? "running" : "idle")}</span>
          </div>
          ${running ? '<div class="drops"><span></span><span></span><span></span></div>' : ""}
        </div>
        <div class="toggles">
          ${this._renderToggle(zone.manual_switch, t(hass, "manual"), "mdi:hand-water")}
          ${this._renderToggle(zone.auto_switch, t(hass, "auto"), "mdi:calendar-clock")}
        </div>
        <div class="infos">
          ${this._renderInfo(zone.next_cycle_sensor, t(hass, "next_cycle"), "mdi:clock-outline")}
          ${this._renderInfo(zone.duration_sensor, t(hass, "duration"), "mdi:timer-sand")}
        </div>
      </div>`;
  }

  _renderPump() {
    const { pump, show_pump } = this._config;
    if (!pump || !show_pump) return "";
    const hass = this._hass;
    const stateObj = hass.states[pump];
    const on = isOn(stateObj);
    const name = this._config.pump_name || (stateObj && stateObj.attributes.friendly_name) || t(hass, "pump");
    return `
      <button class="pump ${on ? "on" : ""}" data-action="toggle" data-entity="${escapeHtml(pump)}"
        ${isUnavailable(stateObj) ? "disabled" : ""} aria-pressed="${on}">
        <ha-icon icon="${escapeHtml(this._config.pump_icon || "mdi:pump")}"></ha-icon>
        <span>${escapeHtml(name)}</span>
        <span class="pump-state">${escapeHtml(formatState(hass, stateObj))}</span>
      </button>`;
  }

  _render() {
    if (!this._config || !this._hass) return;
    const hass = this._hass;
    const zones = this._config.zones;
    const anyRunning = zones.some((z) => isOn(hass.states[z.active_sensor]) || isOn(hass.states[z.manual_switch]));

    this.shadowRoot.innerHTML = `
      <style>${IrrigationCard.styles}</style>
      <ha-card>
        <div class="header">
          <div class="title">
            <ha-icon class="${anyRunning ? "active" : ""}" icon="${escapeHtml(this._config.icon)}"></ha-icon>
            <span>${escapeHtml(this._config.title)}</span>
          </div>
          ${this._renderPump()}
        </div>
        <div class="zones">
          ${zones.length ? zones.map((z) => this._renderZone(z)).join("") : `<div class="empty">${t(hass, "no_zones")}</div>`}
        </div>
      </ha-card>`;

    const card = this.shadowRoot.querySelector("ha-card");
    card.addEventListener("click", (ev) => this._onClick(ev));
    card.addEventListener("keydown", (ev) => {
      // Native <button> lösen bei Enter/Leertaste selbst "click" aus.
      if ((ev.key === "Enter" || ev.key === " ") && ev.target.getAttribute("role") === "button") {
        ev.preventDefault();
        this._onClick(ev);
      }
    });
  }

  static get styles() {
    return `
      :host {
        --irr-accent: var(--irrigation-accent-color, #2196f3);
        --irr-accent-soft: color-mix(in srgb, var(--irr-accent) 15%, transparent);
        --irr-radius: var(--ha-card-border-radius, 12px);
      }
      ha-card { padding: 16px; display: flex; flex-direction: column; gap: 12px; }
      button { font: inherit; color: inherit; }
      .header { display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap; }
      .title { display: flex; align-items: center; gap: 10px; font-size: 1.25rem; font-weight: 500; }
      .title ha-icon { color: var(--secondary-text-color); }
      .title ha-icon.active { color: var(--irr-accent); }

      .pump {
        display: flex; align-items: center; gap: 8px; cursor: pointer;
        border: 1px solid var(--divider-color); border-radius: 999px;
        background: transparent; padding: 6px 12px 6px 10px;
        transition: background 0.2s, border-color 0.2s;
      }
      .pump ha-icon { --mdc-icon-size: 20px; color: var(--secondary-text-color); }
      .pump .pump-state { color: var(--secondary-text-color); font-size: 0.85rem; }
      .pump.on { background: var(--irr-accent-soft); border-color: var(--irr-accent); }
      .pump.on ha-icon { color: var(--irr-accent); animation: spin 2s linear infinite; }

      .zones { display: flex; flex-direction: column; gap: 12px; }
      .empty { color: var(--secondary-text-color); padding: 8px 0; }
      .zone {
        border: 1px solid var(--divider-color); border-radius: var(--irr-radius);
        padding: 12px; display: flex; flex-direction: column; gap: 10px;
        transition: border-color 0.3s, background 0.3s;
      }
      .zone.running { border-color: var(--irr-accent); background: var(--irr-accent-soft); }
      .zone-header { display: flex; align-items: center; gap: 12px; cursor: pointer; }
      .zone-icon {
        width: 40px; height: 40px; border-radius: 50%; flex: none;
        display: flex; align-items: center; justify-content: center;
        background: var(--secondary-background-color, rgba(127,127,127,0.1));
        color: var(--secondary-text-color);
      }
      .zone.running .zone-icon { background: var(--irr-accent); color: var(--text-primary-color, #fff); }
      .zone-title { display: flex; flex-direction: column; flex: 1; min-width: 0; }
      .zone-name { font-weight: 500; font-size: 1.05rem; }
      .zone-status { font-size: 0.85rem; color: var(--secondary-text-color); }
      .zone.running .zone-status { color: var(--irr-accent); font-weight: 500; }

      .drops { display: flex; gap: 4px; align-items: flex-end; height: 20px; }
      .drops span {
        width: 6px; height: 6px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg);
        background: var(--irr-accent); animation: drop 1.2s ease-in infinite;
      }
      .drops span:nth-child(2) { animation-delay: 0.4s; }
      .drops span:nth-child(3) { animation-delay: 0.8s; }

      .toggles, .infos { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 8px; }
      .toggle {
        display: flex; align-items: center; gap: 8px; cursor: pointer; text-align: left;
        border: none; border-radius: calc(var(--irr-radius) - 4px); padding: 10px;
        background: var(--secondary-background-color, rgba(127,127,127,0.1));
      }
      .toggle:disabled { opacity: 0.5; cursor: not-allowed; }
      .toggle ha-icon { --mdc-icon-size: 20px; color: var(--secondary-text-color); }
      .toggle.on ha-icon { color: var(--irr-accent); }
      .toggle-label { flex: 1; }
      .switch {
        width: 34px; height: 20px; border-radius: 10px; position: relative; flex: none;
        background: var(--disabled-text-color, #9e9e9e); transition: background 0.2s;
      }
      .knob {
        position: absolute; top: 2px; left: 2px; width: 16px; height: 16px; border-radius: 50%;
        background: #fff; transition: transform 0.2s;
      }
      .toggle.on .switch { background: var(--irr-accent); }
      .toggle.on .knob { transform: translateX(14px); }

      .info {
        display: flex; align-items: center; gap: 8px; cursor: pointer; padding: 4px 2px;
        border-radius: 8px;
      }
      .info:hover, .toggle:hover:not(:disabled), .pump:hover:not(:disabled) { filter: brightness(0.97); }
      .info ha-icon { --mdc-icon-size: 20px; color: var(--secondary-text-color); flex: none; }
      .info-text { display: flex; flex-direction: column; min-width: 0; }
      .info-label { font-size: 0.75rem; color: var(--secondary-text-color); }
      .info-value { font-size: 0.95rem; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
      [role="button"]:focus-visible, button:focus-visible { outline: 2px solid var(--irr-accent); outline-offset: 2px; }

      @keyframes spin { to { transform: rotate(360deg); } }
      @keyframes drop {
        0% { transform: translateY(-8px) rotate(-45deg); opacity: 0; }
        40% { opacity: 1; }
        100% { transform: translateY(6px) rotate(-45deg); opacity: 0; }
      }
      @media (prefers-reduced-motion: reduce) {
        .pump.on ha-icon, .drops span { animation: none; }
      }
    `;
  }
}

/* ------------------------------------------------------------------ */
/* Visueller Editor                                                    */
/* ------------------------------------------------------------------ */

const GENERAL_SCHEMA = [
  { name: "title", selector: { text: {} } },
  { name: "icon", selector: { icon: {} } },
  { name: "pump", selector: { entity: { domain: ["switch", "valve", "input_boolean"] } } },
  {
    type: "grid",
    name: "",
    schema: [
      { name: "pump_name", selector: { text: {} } },
      { name: "pump_icon", selector: { icon: {} } },
    ],
  },
  { name: "show_pump", selector: { boolean: {} } },
];

const ZONE_SCHEMA = [
  {
    type: "grid",
    name: "",
    schema: [
      { name: "name", selector: { text: {} } },
      { name: "icon", selector: { icon: {} } },
    ],
  },
  { name: "prefix", selector: { text: {} } },
  { name: "manual_switch", selector: { entity: { domain: ["switch", "valve", "input_boolean"] } } },
  { name: "auto_switch", selector: { entity: { domain: ["switch", "input_boolean"] } } },
  { name: "next_cycle_sensor", selector: { entity: { domain: ["sensor", "input_datetime"] } } },
  { name: "duration_sensor", selector: { entity: { domain: ["sensor", "input_number", "number"] } } },
  { name: "active_sensor", selector: { entity: { domain: ["binary_sensor", "switch", "valve"] } } },
];

const LABELS = {
  de: {
    title: "Titel",
    icon: "Icon",
    pump: "Pumpe (global)",
    pump_name: "Name der Pumpe",
    pump_icon: "Icon der Pumpe",
    show_pump: "Pumpe anzeigen",
    name: "Name",
    prefix: "Präfix (füllt leere Felder automatisch, z. B. \"rasen\")",
    manual_switch: "Manuelle Bewässerung (Schalter)",
    auto_switch: "Automatische Bewässerung (Schalter)",
    next_cycle_sensor: "Nächster Zyklus (Sensor)",
    duration_sensor: "Bewässerungszeit (Sensor)",
    active_sensor: "Bewässerung aktiv (Binary-Sensor)",
  },
  en: {
    title: "Title",
    icon: "Icon",
    pump: "Pump (global)",
    pump_name: "Pump name",
    pump_icon: "Pump icon",
    show_pump: "Show pump",
    name: "Name",
    prefix: "Prefix (fills empty fields automatically, e.g. \"lawn\")",
    manual_switch: "Manual irrigation (switch)",
    auto_switch: "Automatic irrigation (switch)",
    next_cycle_sensor: "Next cycle (sensor)",
    duration_sensor: "Watering time (sensor)",
    active_sensor: "Irrigation active (binary sensor)",
  },
};

class IrrigationCardEditor extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._expanded = 0;
  }

  setConfig(config) {
    // HA ruft setConfig nach jeder eigenen Änderung erneut auf. Ein Neuaufbau
    // würde dabei den Fokus im gerade bearbeiteten Feld zerstören.
    if (this._config && JSON.stringify(config) === JSON.stringify(this._config)) return;
    this._config = { ...config, zones: [...(config.zones || [])] };
    this._render();
  }

  set hass(hass) {
    this._hass = hass;
    this.shadowRoot.querySelectorAll("ha-form").forEach((form) => { form.hass = hass; });
    if (!this.shadowRoot.querySelector("ha-form")) this._render();
  }

  _label(schema) {
    const lang = (this._hass && this._hass.language ? this._hass.language : "de").split("-")[0];
    return (LABELS[lang] || LABELS.en)[schema.name] || schema.name;
  }

  _commit(config) {
    this._config = config;
    fireEvent(this, "config-changed", { config });
  }

  _updateZone(index, value) {
    const zones = [...this._config.zones];
    // Leere Werte entfernen, damit das YAML aufgeräumt bleibt.
    zones[index] = Object.fromEntries(Object.entries(value).filter(([, v]) => v !== "" && v != null));
    this._commit({ ...this._config, zones });
  }

  _zoneAction(action, index) {
    const zones = [...this._config.zones];
    if (action === "remove") {
      zones.splice(index, 1);
      if (this._expanded >= zones.length) this._expanded = zones.length - 1;
    } else if (action === "up" && index > 0) {
      [zones[index - 1], zones[index]] = [zones[index], zones[index - 1]];
      this._expanded = index - 1;
    } else if (action === "down" && index < zones.length - 1) {
      [zones[index + 1], zones[index]] = [zones[index], zones[index + 1]];
      this._expanded = index + 1;
    } else if (action === "add") {
      zones.push({ name: `${t(this._hass, "zone")} ${zones.length + 1}`, icon: "mdi:sprinkler-variant" });
      this._expanded = zones.length - 1;
    } else if (action === "expand") {
      this._expanded = this._expanded === index ? -1 : index;
    }
    this._commit({ ...this._config, zones });
    this._render();
  }

  async _render() {
    if (!this._config || !this._hass) return;
    // ha-form wird von HA bei Bedarf nachgeladen – sicherstellen, dass es existiert.
    if (!customElements.get("ha-form") && window.loadCardHelpers) {
      const helpers = await window.loadCardHelpers();
      helpers.createCardElement({ type: "entities", entities: [] });
      await customElements.whenDefined("hui-entities-card");
      await customElements.get("hui-entities-card").getConfigElement();
    }

    const hass = this._hass;
    const zones = this._config.zones;
    this.shadowRoot.innerHTML = `
      <style>
        .section { margin-bottom: 16px; }
        h3 { margin: 16px 0 8px; font-size: 1rem; font-weight: 500; }
        .zone { border: 1px solid var(--divider-color); border-radius: 8px; margin-bottom: 8px; }
        .zone-head { display: flex; align-items: center; gap: 4px; padding: 4px 4px 4px 12px; }
        .zone-head .label { flex: 1; cursor: pointer; display: flex; align-items: center; gap: 8px; padding: 8px 0; }
        .zone-body { padding: 0 12px 12px; }
        button {
          font: inherit; cursor: pointer; border: none; background: transparent; color: var(--primary-text-color);
          border-radius: 50%; width: 36px; height: 36px; display: inline-flex; align-items: center; justify-content: center;
        }
        button:hover { background: var(--secondary-background-color); }
        button:disabled { opacity: 0.3; cursor: default; }
        button.add {
          width: auto; border-radius: 8px; padding: 0 16px; gap: 8px; color: var(--primary-color);
          border: 1px dashed var(--primary-color); height: 40px;
        }
      </style>
      <div class="section"><ha-form id="general"></ha-form></div>
      <h3>Zonen</h3>
      ${zones.map((zone, i) => `
        <div class="zone">
          <div class="zone-head">
            <div class="label" data-action="expand" data-index="${i}">
              <ha-icon icon="${escapeHtml(zone.icon || "mdi:sprinkler-variant")}"></ha-icon>
              <span>${escapeHtml(zone.name || `${t(hass, "zone")} ${i + 1}`)}</span>
            </div>
            <button data-action="up" data-index="${i}" title="${t(hass, "move_up")}" ${i === 0 ? "disabled" : ""}><ha-icon icon="mdi:arrow-up"></ha-icon></button>
            <button data-action="down" data-index="${i}" title="${t(hass, "move_down")}" ${i === zones.length - 1 ? "disabled" : ""}><ha-icon icon="mdi:arrow-down"></ha-icon></button>
            <button data-action="remove" data-index="${i}" title="${t(hass, "remove_zone")}"><ha-icon icon="mdi:delete-outline"></ha-icon></button>
            <button data-action="expand" data-index="${i}"><ha-icon icon="${this._expanded === i ? "mdi:chevron-up" : "mdi:chevron-down"}"></ha-icon></button>
          </div>
          ${this._expanded === i ? `<div class="zone-body"><ha-form data-zone="${i}"></ha-form></div>` : ""}
        </div>`).join("")}
      <button class="add" data-action="add"><ha-icon icon="mdi:plus"></ha-icon>${t(hass, "add_zone")}</button>
    `;

    const general = this.shadowRoot.getElementById("general");
    general.hass = hass;
    general.schema = GENERAL_SCHEMA;
    general.data = { show_pump: true, ...this._config };
    general.computeLabel = (s) => this._label(s);
    general.addEventListener("value-changed", (ev) => {
      ev.stopPropagation();
      this._commit({ ...ev.detail.value, zones: this._config.zones });
    });

    this.shadowRoot.querySelectorAll("ha-form[data-zone]").forEach((form) => {
      const index = Number(form.dataset.zone);
      form.hass = hass;
      form.schema = ZONE_SCHEMA;
      form.data = zones[index];
      form.computeLabel = (s) => this._label(s);
      form.addEventListener("value-changed", (ev) => {
        ev.stopPropagation();
        this._updateZone(index, ev.detail.value);
        // Kopfzeile (Name/Icon) aktualisieren, ohne das Formular neu zu bauen.
        const head = form.closest(".zone").querySelector(".label");
        head.querySelector("span").textContent = ev.detail.value.name || `${t(hass, "zone")} ${index + 1}`;
        head.querySelector("ha-icon").setAttribute("icon", ev.detail.value.icon || "mdi:sprinkler-variant");
      });
    });

    this.shadowRoot.querySelectorAll("[data-action]").forEach((el) => {
      el.addEventListener("click", () => this._zoneAction(el.dataset.action, Number(el.dataset.index)));
    });
  }
}

customElements.define("irrigation-card", IrrigationCard);
customElements.define("irrigation-card-editor", IrrigationCardEditor);

window.customCards = window.customCards || [];
window.customCards.push({
  type: "irrigation-card",
  name: "Irrigation Card",
  description: "Bewässerungssteuerung mit Pumpe und beliebig vielen Zonen",
  preview: true,
  documentationURL: "https://github.com/BeGiBue/irrigation-card",
});

console.info(
  `%c IRRIGATION-CARD %c v${CARD_VERSION} `,
  "color: white; background: #2196f3; font-weight: 700;",
  "color: #2196f3; background: white; font-weight: 700;",
);
