// Irrigation Card v1.0.0 – Bewässerung für Hunter Hydrawise / Hochformat / Touch / Kiosk — AGPL-3.0-only — BeGiBue
// Einzeldatei. Zonen werden über die Geräte der Hydrawise-Integration gefunden (Entity-Registry, translation_key).
const IRRIGATION_CARD_VERSION="1.0.0";
// Eingebettetes Standardbild (WebP als data-URL); leer = kein Bild, solange keine image_url gesetzt ist
const EMBEDDED_IMAGE_URL="";
const DEF={title:"Bewässerung",subtitle:"Hunter Hydrawise",show_image:true,image_mode:"banner",image_url:"",zones:[],pump_entity:"switch.gartenpumpe",pump_title:"Gartenpumpe",
  durations:"5, 10, 15, 30",show_controller:true,status_entity:"",rain_entity:"",layout:"auto",scale:1};
// Rollen der Hydrawise-Entitäten je Zonen-Gerät: Domain + translation_key (siehe homeassistant/components/hydrawise)
const ZONE_KEYS={"switch.manual_watering":"manual","switch.auto_watering":"auto","sensor.next_cycle":"next","sensor.watering_time":"remaining",
  "sensor.daily_active_water_time":"daily_time","sensor.daily_active_water_use":"daily_use","binary_sensor.watering":"running"};
const CTRL_KEYS={"binary_sensor.rain_sensor":"rain","sensor.daily_active_water_time":"daily_time","sensor.daily_total_water_use":"daily_use"};
const OFF=["unavailable","unknown",""];

class IrrigationCard extends HTMLElement{
  constructor(){super();this.attachShadow({mode:"open"});this._config={...DEF};this._sig="";this._pending={};this._total={};}
  static getStubConfig(){return{...DEF};}
  static getConfigForm(){
    const e=(n,d)=>({name:n,selector:{entity:d?{domain:d}:{}}}),t=n=>({name:n,selector:{text:{}}}),x=(name,title,schema,expanded)=>({type:"expandable",name,title,flatten:true,expanded,schema});
    const L={title:"Titel",subtitle:"Untertitel",show_image:"Bild anzeigen",image_mode:"Bild-Darstellung",image_url:"Eigenes Bild (URL, optional)",layout:"Layout",scale:"Größe (Kiosk: 1,2 – 1,5)",zones:"Zonen",pump_entity:"Pumpe",pump_title:"Bezeichnung der Pumpe",
      durations:"Startdauern in Minuten",show_controller:"Controller-Werte anzeigen (Status, Regensensor, Tageswerte)",status_entity:"Controller-Status (optional)",rain_entity:"Regensensor (optional)"};
    const H={image_url:"Leer = eingebettetes Standardbild, z. B. /local/images/garten.jpg.",zones:"Hydrawise-Zonen in gewünschter Reihenfolge. Leer = alle Zonen automatisch.",durations:"Kommagetrennt, z. B. 5, 10, 15, 30 – max. 6 Werte.",
      status_entity:"Leer = automatisch vom Hydrawise-Controller.",rain_entity:"Leer = automatisch vom Hydrawise-Controller."};
    return{schema:[
      x("general","Allgemein",[t("title"),t("subtitle"),{name:"show_image",selector:{boolean:{}}},{name:"image_mode",selector:{select:{mode:"dropdown",options:[{value:"banner",label:"Banner hinter dem Titel"},{value:"background",label:"Dezent im Kartenhintergrund"}]}}},t("image_url"),{name:"layout",selector:{select:{mode:"dropdown",options:[{value:"auto",label:"Automatisch (breit ab 480 px)"},{value:"wide",label:"Immer breit"},{value:"compact",label:"Immer kompakt"}]}}},{name:"scale",selector:{number:{min:.8,max:1.8,step:.05,mode:"slider"}}}]),
      x("zones_group","Zonen",[{name:"zones",selector:{device:{multiple:true,filter:{integration:"hydrawise",model:"Zone"}}}}],true),
      x("control","Steuerung",[t("durations"),e("pump_entity",["switch","valve","input_boolean"]),t("pump_title")]),
      x("controller","Controller",[{name:"show_controller",selector:{boolean:{}}},e("status_entity","binary_sensor"),e("rain_entity","binary_sensor")])],
      computeLabel:s=>L[s.name],computeHelper:s=>H[s.name]};
  }
  connectedCallback(){if(!this._ro)this._ro=new ResizeObserver(()=>{this._layout();this._measure();});this._ro.observe(this);this._layout();
    // Restzeit und relative Zeiten minütlich nachführen
    this._tick=setInterval(()=>{this._sig="";this._update();},60000);}
  disconnectedCallback(){this._ro?.disconnect();clearInterval(this._tick);}
  _layout(){const card=this.shadowRoot?.querySelector("ha-card");if(!card)return;const l=this._config.layout,w=this.clientWidth;card.classList.toggle("wide",l==="wide"||(l!=="compact"&&w>=480));}
  setConfig(c){this._config={...DEF,...c};this._sig="";this._built=false;this._update();}
  set hass(h){this._hass=h;this._update();}
  get hass(){return this._hass;}
  getCardSize(){return 4+3*Math.max(1,this._zones?.length||1);}
  getGridOptions(){return{columns:12,min_columns:4,min_rows:this._minRows||8};}
  // Natürliche Inhaltshöhe in Grid-Zeilen umrechnen (HA: 56 px Zeile + 8 px Abstand)
  _measure(){
    const card=this.shadowRoot?.querySelector("ha-card"),main=card?.querySelector("main");
    if(!main||!this.clientWidth)return;
    const cs=getComputedStyle(card),hs=getComputedStyle(this);
    const h=main.offsetHeight+parseFloat(cs.borderTopWidth)+parseFloat(cs.borderBottomWidth);
    const rh=parseFloat(hs.getPropertyValue("--row-height"))||56,gap=parseFloat(hs.getPropertyValue("--row-gap"))||8;
    this._minRows=Math.max(1,Math.ceil((h+gap)/(rh+gap)));
  }

  _s(id){return id&&this._hass?.states?.[id];}
  _e(v){return String(v??"").replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#039;");}
  _on(id){const s=this._s(id);return!!s&&["on","open","opening"].includes(s.state);}
  _ok(id){const s=this._s(id);return!!s&&!OFF.includes(s.state);}
  _more(id){if(id)this.dispatchEvent(new CustomEvent("hass-more-info",{bubbles:true,composed:true,detail:{entityId:id}}));}
  _f(id){const s=this._s(id);if(!s||OFF.includes(s.state))return"—";try{if(this._hass?.formatEntityState)return this._hass.formatEntityState(s);}catch(_){}const u=s.attributes?.unit_of_measurement;return`${s.state}${u?` ${u}`:""}`;}
  _loc(){return this._hass?.locale?.language||this._hass?.language||"de-DE";}

  // Hydrawise-Geräte und ihre Entitäten aus der Registry lesen
  _resolve(){
    const h=this._hass,ents=Object.values(h?.entities||{}),devs=h?.devices||{},byDev={};
    for(const en of ents){if(en.platform!=="hydrawise"||!en.device_id)continue;(byDev[en.device_id]??=[]).push(en);}
    const pick=(list,keys)=>{const r={};for(const en of list||[]){const d=en.entity_id.split(".")[0],k=keys[`${d}.${en.translation_key}`];
      if(k)r[k]=en.entity_id;else if(d==="valve")r.valve=en.entity_id;else if(d==="binary_sensor"&&!en.translation_key)r.status=en.entity_id;}return r;};
    let ids=(Array.isArray(this._config.zones)?this._config.zones:[this._config.zones]).filter(Boolean);
    if(!ids.length)ids=Object.keys(byDev).filter(id=>devs[id]?.model==="Zone"||pick(byDev[id],ZONE_KEYS).running);
    const zones=ids.filter(id=>byDev[id]).map(id=>({id,name:devs[id]?.name_by_user||devs[id]?.name||"Zone",ctrl:devs[id]?.via_device_id,...pick(byDev[id],ZONE_KEYS)}));
    const cid=zones.find(z=>z.ctrl)?.ctrl||Object.keys(byDev).find(id=>devs[id]&&devs[id].model!=="Zone");
    const ctrl={id:cid,name:devs[cid]?.name_by_user||devs[cid]?.name||"",...pick(byDev[cid],CTRL_KEYS)};
    if(this._config.status_entity)ctrl.status=this._config.status_entity;
    if(this._config.rain_entity)ctrl.rain=this._config.rain_entity;
    return{zones,ctrl};
  }

  _update(){
    if(!this.shadowRoot||!this._config||!this._hass)return;
    const r=this._resolve();this._zones=r.zones;this._ctrl=r.ctrl;
    const ids=[this._config.pump_entity,...Object.values(r.ctrl),...r.zones.flatMap(z=>Object.values(z))];
    // Anfrage erledigt, sobald der Zustand passt (oder nach 90 s aufgeben)
    for(const z of r.zones){const p=this._pending[z.id];if(p&&(this._running(z)===(p.kind==="start")||Date.now()>p.until))delete this._pending[z.id];}
    const sig=JSON.stringify(this._config)+ids.map(id=>{const s=this._s(id);return s?`${s.state}|${s.last_changed}`:"-";}).join("§")+JSON.stringify(this._pending)+(this._hass.language||"");
    if(sig===this._sig&&this._built)return;
    this._sig=sig;this._render();
  }

  _running(z){return z.running?this._on(z.running):this._on(z.valve)||this._on(z.manual);}
  // Restzeit: Hydrawise liefert nur alle 5 min einen neuen Wert – dazwischen seit der letzten Änderung herunterzählen
  _remaining(z){
    const s=this._s(z.remaining);if(!s||OFF.includes(s.state))return NaN;
    const n=Number(s.state),el=(Date.now()-new Date(s.last_changed).getTime())/60000;
    return Number.isFinite(n)?Math.max(0,Math.round(n-(el>0?el:0))):NaN;
  }
  _dur(sec){
    if(!Number.isFinite(sec))return"—";const m=Math.round(sec/60),h=Math.floor(m/60);
    return h?`${h} h${m%60?` ${m%60} min`:""}`:`${m} min`;
  }
  _secs(id){const s=this._s(id);if(!s||OFF.includes(s.state))return NaN;const n=Number(s.state),u=s.attributes?.unit_of_measurement;
    return!Number.isFinite(n)?NaN:u==="min"?n*60:u==="h"?n*3600:u==="d"?n*86400:n;}
  // Zeitpunkt als „Heute 05:00“ / „Morgen 05:00“ / „Sa., 10.10. 05:00“ plus relative Angabe
  _when(id){
    const s=this._s(id);if(!s||OFF.includes(s.state))return{main:"—",rel:""};
    const d=new Date(s.state);if(isNaN(d))return{main:this._f(id),rel:""};
    const loc=this._loc(),now=new Date(),day=x=>new Date(x.getFullYear(),x.getMonth(),x.getDate()).getTime();
    const dd=Math.round((day(d)-day(now))/86400000),time=d.toLocaleTimeString(loc,{hour:"2-digit",minute:"2-digit"});
    const de=loc.startsWith("de"),main=dd===0?`${de?"Heute":"Today"} ${time}`:dd===1?`${de?"Morgen":"Tomorrow"} ${time}`:`${d.toLocaleDateString(loc,{weekday:"short",day:"2-digit",month:"2-digit"})} ${time}`;
    const sec=(d-now)/1000,a=Math.abs(sec),rtf=new Intl.RelativeTimeFormat(loc,{numeric:"auto",style:"short"});
    const rel=a<3600?rtf.format(Math.round(sec/60),"minute"):dd===0?rtf.format(Math.round(sec/3600),"hour"):rtf.format(dd,"day");
    return{main,rel};
  }
  _durations(){return[...new Set(String(this._config.durations??"").split(/[,;\s]+/).map(Number).filter(n=>Number.isInteger(n)&&n>0&&n<=1440))].slice(0,6);}

  async _call(domain,service,data){try{await this._hass.callService(domain,service,data);return true;}catch(err){console.error("Irrigation Card:",err);return false;}}
  // Hydrawise fragt nur alle 5 min ab – nach einer Aktion sofort neu laden lassen
  _refresh(z){clearTimeout(this._rt);this._rt=setTimeout(()=>{const ids=[z.running,z.manual,z.remaining,z.valve].filter(Boolean);
    if(ids.length)this._call("homeassistant","update_entity",{entity_id:ids});},2500);}
  async _start(z,min){
    this._pending[z.id]={kind:"start",until:Date.now()+90000};this._total[z.id]=min;this._update();
    const ok=z.running?await this._call("hydrawise","start_watering",{entity_id:z.running,duration:min})
      :z.manual?await this._call("homeassistant","turn_on",{entity_id:z.manual}):await this._call("valve","open_valve",{entity_id:z.valve});
    if(!ok){delete this._pending[z.id];this._update();return;}
    this._refresh(z);
  }
  async _stop(z){
    this._pending[z.id]={kind:"stop",until:Date.now()+90000};this._update();
    const ok=z.manual?await this._call("homeassistant","turn_off",{entity_id:z.manual}):await this._call("valve","close_valve",{entity_id:z.valve});
    if(!ok){delete this._pending[z.id];this._update();return;}
    this._refresh(z);
  }
  _toggle(id){if(this._ok(id))this._call("homeassistant",this._on(id)?"turn_off":"turn_on",{entity_id:id});}

  _tile(icon,label,value,tone,more,unit){
    return`<button class="tile tone-${tone}" data-more="${this._e(more)}"><span class="chip"><ha-icon icon="${icon}"></ha-icon></span><span class="lbl">${this._e(label)}</span><span class="val txt"><b>${this._e(value)}</b>${unit?`<em>${this._e(unit)}</em>`:""}</span></button>`;
  }
  _sw(on){return`<span class="sw${on?" on":""}"><i></i></span>`;}

  _zone(z){
    const run=this._running(z),p=this._pending[z.id],auto=z.auto?this._on(z.auto):true,online=this._ok(z.running||z.manual||z.valve);
    const st=!online?["error","Offline"]:p?["primary",p.kind==="start"?"Startet …":"Stoppt …"]:run?["primary","Bewässert"]:!auto?["warning","Pausiert"]:["success","Bereit"];
    const rem=this._remaining(z);
    if(run&&Number.isFinite(rem))this._total[z.id]=Math.max(this._total[z.id]||0,rem);else if(!run&&!p)delete this._total[z.id];
    const tot=this._total[z.id],pct=run&&Number.isFinite(rem)&&tot?Math.max(2,Math.min(100,rem/tot*100)):0;
    const nx=this._when(z.next),today=this._secs(z.daily_time);
    const row=(l,id,v,sm,tone)=>`<button class="drow${tone?` tone-${tone}`:""}" data-more="${this._e(id)}"><span>${l}</span><b>${this._e(v)}${sm?` <em>${this._e(sm)}</em>`:""}</b></button>`;
    const run_box=run||p?.kind==="stop"?`<div class="runbox">
        <div class="rt"><span class="lbl">Restzeit</span><span class="val"><b>${Number.isFinite(rem)?rem:"—"}</b><em>min</em></span><i class="bar"><u style="width:${pct}%"></u></i></div>
        <button class="stop" data-stop="${this._e(z.id)}" ${p||!online?"disabled":""}><ha-icon icon="mdi:stop"></ha-icon><b>Stopp</b></button></div>`
      :`<div class="starts"><span class="lbl">Manuell starten</span><div class="durs">${this._durations().map(m=>`<button class="dur" data-start="${this._e(z.id)}" data-min="${m}" ${p||!online?"disabled":""}><b>${m}</b><em>min</em></button>`).join("")||`<button class="dur" data-start="${this._e(z.id)}" data-min="0" ${p||!online?"disabled":""}><b>Start</b></button>`}</div></div>`;
    return`<section class="panel zone tone-${st[0]}${run?" running":""}">
      <header><span class="chip"><ha-icon icon="mdi:sprinkler-variant"></ha-icon></span><h3>${this._e(z.name)}</h3><button class="pill" data-more="${this._e(z.running||z.manual)}"><i class="dot"></i><b>${this._e(st[1])}</b></button></header>
      ${run_box}
      <div class="drows">
        ${row("Nächster Zyklus",z.next,nx.main,nx.rel,!auto?"warning":"")}
        ${z.daily_time?row("Heute bewässert",z.daily_time,this._dur(today)):""}
        ${z.daily_use?row("Verbrauch heute",z.daily_use,this._f(z.daily_use)):""}
        ${z.auto?`<button class="drow tgl" data-toggle="${this._e(z.auto)}" ${this._ok(z.auto)?"":"disabled"}><span>Automatik</span>${this._sw(auto)}</button>`:""}
      </div>
    </section>`;
  }

  _render(){
    const c=this._config,z=this._zones,k=this._ctrl,sc=Math.min(1.8,Math.max(.8,Number(c.scale)||1));
    const anyRun=z.some(x=>this._running(x)),pump=this._s(c.pump_entity);
    const tiles=[];
    if(c.show_controller!==false){
      if(k.status){const on=this._on(k.status);tiles.push(this._tile(on?"mdi:cloud-check-outline":"mdi:cloud-off-outline","Controller",on?"Online":"Offline",on?"success":"error",k.status));}
      if(k.rain){const wet=this._on(k.rain),ok=this._ok(k.rain);tiles.push(this._tile(wet?"mdi:weather-pouring":"mdi:weather-sunny","Regensensor",ok?wet?"Regen":"Trocken":"—",wet?"warning":"success",k.rain));}
      if(k.daily_time)tiles.push(this._tile("mdi:timelapse","Heute bewässert",this._dur(this._secs(k.daily_time)),"primary",k.daily_time));
      if(k.daily_use)tiles.push(this._tile("mdi:water","Verbrauch heute",this._f(k.daily_use),"primary",k.daily_use));
    }
    const running=z.filter(x=>this._running(x)).length;
    tiles.push(`<div class="tile tone-${running?"primary":"neutral"}"><span class="chip"><ha-icon icon="mdi:sprinkler"></ha-icon></span><span class="lbl">Aktive Zonen</span><span class="val"><b>${running}</b><em>/ ${z.length}</em></span></div>`);
    const img=c.show_image!==false?(c.image_url?.trim()||EMBEDDED_IMAGE_URL):"",bgm=img&&c.image_mode==="background",ban=img&&!bgm;
    const pumpRow=pump?`<button class="panel pump${this._on(c.pump_entity)?" on":""}" data-toggle="${this._e(c.pump_entity)}" ${this._ok(c.pump_entity)?"":"disabled"}><span class="chip"><ha-icon icon="mdi:pump"></ha-icon></span><span class="ut"><b>${this._e(c.pump_title||pump.attributes?.friendly_name||"Pumpe")}</b><small>${this._e(this._f(c.pump_entity))}</small></span>${this._sw(this._on(c.pump_entity))}</button>`:"";
    const empty=`<section class="panel empty"><ha-icon icon="mdi:information-outline"></ha-icon><span>Keine Hydrawise-Zonen gefunden. Richte die Integration <b>Hunter Hydrawise</b> ein oder wähle die Zonen im Karteneditor aus.</span></section>`;
    this.shadowRoot.innerHTML=`<style>${IrrigationCard.css}</style><ha-card class="${bgm?"bgm":""}" style="--s:${sc}">${bgm?`<img class="bgimg pic" alt="" src="${this._e(img)}">`:""}<main>
      <section class="hero">
        <div class="title${ban?" banner":""}">${ban?`<img class="pic" alt="" src="${this._e(img)}">`:""}<span class="chip big${anyRun?" live":""}"><ha-icon icon="mdi:sprinkler-variant"></ha-icon></span><div><h1>${this._e(c.title)}</h1><p>${this._e(c.subtitle||k.name)}</p></div></div>
        <div class="tiles n${tiles.length}">${tiles.join("")}</div>
      </section>
      ${pumpRow}
      ${z.length?`<section class="zones">${z.map(x=>this._zone(x)).join("")}</section>`:empty}
    </main></ha-card>`;
    this.shadowRoot.querySelectorAll(".pic").forEach(im=>im.onerror=()=>{if(EMBEDDED_IMAGE_URL&&im.src!==EMBEDDED_IMAGE_URL)im.src=EMBEDDED_IMAGE_URL;else(im.closest(".banner")||im).classList.add("noimg");});
    const by=id=>z.find(x=>x.id===id);
    this.shadowRoot.querySelectorAll("[data-more]").forEach(x=>x.onclick=()=>this._more(x.dataset.more));
    this.shadowRoot.querySelectorAll("[data-toggle]").forEach(x=>x.onclick=()=>this._toggle(x.dataset.toggle));
    this.shadowRoot.querySelectorAll("[data-start]").forEach(x=>x.onclick=()=>this._start(by(x.dataset.start),Number(x.dataset.min)));
    this.shadowRoot.querySelectorAll("[data-stop]").forEach(x=>x.onclick=()=>this._stop(by(x.dataset.stop)));
    this._built=true;
    this._layout();
    this._measure();
  }

  static get css(){return`
    :host{display:block;width:100%;height:100%;container-type:inline-size;
      --txt:var(--primary-text-color,#111);--mut:var(--secondary-text-color,#777);--pri:var(--irrigation-color,var(--primary-color,#03a9f4));
      --ok:var(--success-color,#4caf50);--warn:var(--warning-color,#ff9800);--err:var(--error-color,#f44336);
      --line:color-mix(in srgb,var(--txt) 12%,transparent);--fill:color-mix(in srgb,var(--txt) 5%,transparent);--fill-hi:color-mix(in srgb,var(--txt) 10%,transparent)}
    *{box-sizing:border-box;-webkit-tap-highlight-color:transparent}
    button{font:inherit;color:inherit;cursor:pointer;touch-action:manipulation;text-align:left;border:0;background:none;padding:0}
    button:disabled{cursor:default;opacity:.45}
    /* Hintergrund, Rand, Radius und Blur kommen vom Theme (z. B. Frosted Glass) */
    ha-card{--s:1;font-size:calc(14px*var(--s));height:100%;overflow:hidden;color:var(--txt);-webkit-user-select:none;user-select:none;-webkit-touch-callout:none}
    @container (min-width:400px){ha-card{font-size:calc(15px*var(--s))}}
    @container (min-width:600px){ha-card{font-size:calc(17px*var(--s))}}
    @container (min-width:800px){ha-card{font-size:calc(19px*var(--s))}}
    @container (min-width:1000px){ha-card{font-size:calc(22px*var(--s))}}
    main{padding:calc(16px*var(--s));display:grid;gap:.6em}
    .tone-primary{--t:var(--pri)}.tone-success{--t:var(--ok)}.tone-warning{--t:var(--warn)}.tone-error{--t:var(--err)}.tone-neutral{--t:var(--mut)}
    .panel{background:var(--fill);border:1px solid var(--line);border-radius:1.1em}
    .chip{--t:var(--pri);flex:none;display:grid;place-items:center;width:2.1em;height:2.1em;border-radius:.65em;background:color-mix(in srgb,var(--t) 18%,transparent);color:var(--t)}
    .tile .chip,.zone .chip{--t:inherit}
    .chip ha-icon{--mdc-icon-size:1.3em}.chip.big{width:2.8em;height:2.8em;border-radius:.85em}.chip.big ha-icon{--mdc-icon-size:1.7em}
    .chip.live ha-icon,.zone.running .chip ha-icon{animation:spray 1.6s ease-in-out infinite}
    .pill{display:inline-flex;align-items:center;gap:.5em;min-height:2em;padding:.15em .8em .15em .6em;border-radius:999px;color:var(--txt);background:color-mix(in srgb,var(--t) 16%,transparent);border:1px solid color-mix(in srgb,var(--t) 40%,transparent)}
    .pill b{font-weight:600;font-size:.9em;white-space:nowrap}
    .dot{width:.6em;height:.6em;border-radius:50%;background:var(--t);box-shadow:0 0 .55em .05em color-mix(in srgb,var(--t) 70%,transparent)}
    .running .dot{animation:pulse 1.4s ease-in-out infinite}
    .lbl{font-size:.85em;line-height:1.15;color:var(--mut);overflow:hidden;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical}
    .val{display:flex;align-items:baseline;gap:.3em;min-width:0}
    .val b{font-size:1.75em;font-weight:600;line-height:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-variant-numeric:tabular-nums;letter-spacing:-.01em}
    .val.txt b{font-size:1.2em;line-height:1.15}
    .val em{font-style:normal;font-size:.9em;color:var(--mut);white-space:nowrap}
    .sw{flex:none;position:relative;width:2.6em;height:1.5em;border-radius:1em;background:var(--line);transition:background .2s}
    .sw i{position:absolute;top:.15em;left:.15em;width:1.2em;height:1.2em;border-radius:50%;background:#fff;box-shadow:0 1px 3px rgba(0,0,0,.3);transition:transform .2s}
    .sw.on{background:var(--pri)}.sw.on i{transform:translateX(1.1em)}

    .hero{display:grid;gap:.8em}
    .title{display:flex;align-items:center;gap:.7em;min-width:0}
    h1{margin:0;font-size:1.7em;font-weight:600;line-height:1.1;letter-spacing:-.01em}
    .title p{margin:.25em 0 0;color:var(--mut);font-size:.9em}
    /* Banner: Foto hinter dem Titel, unten abgedunkelt für lesbare Schrift */
    .banner{position:relative;overflow:hidden;align-items:flex-end;min-height:9em;padding:1em;border-radius:1.1em;border:1px solid var(--line);color:#fff}
    .banner>.pic{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:center 40%;z-index:0}
    .banner::after{content:"";position:absolute;inset:0;z-index:1;background:linear-gradient(to top,rgba(0,0,0,.62),rgba(0,0,0,.08) 70%)}
    .banner>*:not(.pic){position:relative;z-index:2}
    .banner p{color:rgba(255,255,255,.85)}
    .banner .chip{--t:#fff;background:rgba(255,255,255,.22);-webkit-backdrop-filter:blur(6px);backdrop-filter:blur(6px)}
    .banner.noimg{min-height:0;padding:0;border:0;color:inherit}.banner.noimg::after,.banner.noimg>.pic{display:none}
    .banner.noimg p{color:var(--mut)}.banner.noimg .chip{--t:var(--pri);background:color-mix(in srgb,var(--t) 18%,transparent)}
    @container (min-width:600px){.banner{min-height:11em}}
    /* Hintergrund-Modus: Foto groß und blass hinter der ganzen Card */
    ha-card{position:relative}
    .bgm main{position:relative;z-index:1}
    .bgimg{position:absolute;z-index:0;inset:0;width:100%;height:24em;object-fit:cover;opacity:.28;pointer-events:none;
      -webkit-mask-image:linear-gradient(to bottom,#000 30%,transparent);mask-image:linear-gradient(to bottom,#000 30%,transparent)}
    .bgimg.noimg{display:none}
    .tiles{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:.6em}
    .tiles.n1,.tiles.n3>:first-child,.tiles.n5>:first-child{grid-column:1/-1}
    .tile{min-width:0;min-height:5.2em;display:grid;grid-template-columns:auto minmax(0,1fr);grid-template-rows:auto 1fr;column-gap:.55em;align-items:center;padding:.75em;
      background:var(--fill);border:1px solid var(--line);border-radius:1em}
    .tile .val{grid-column:1/-1;margin-top:.45em}
    .tile:active,.drow:active,.pump:active,.dur:active,.stop:active{background:var(--fill-hi);transform:scale(.985)}
    @media (hover:hover){button.tile:hover,.drow:hover,.pump:hover:not(:disabled),.dur:hover:not(:disabled){background:var(--fill-hi)}}
    button:focus-visible{outline:2px solid var(--pri);outline-offset:2px}

    .pump{width:100%;min-height:3.8em;padding:.6em .9em;display:flex;align-items:center;gap:.8em}
    .pump .chip{--t:var(--mut)}.pump.on .chip{--t:var(--pri)}.pump.on .chip ha-icon{animation:spin 2s linear infinite}
    .ut{flex:1;min-width:0;display:flex;flex-direction:column;gap:.15em}.ut b{font-size:1.05em}.ut small{color:var(--mut);font-size:.85em;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}

    .zones{display:grid;gap:.6em;grid-template-columns:repeat(auto-fit,minmax(min(100%,16em),1fr))}
    .zone{min-width:0;padding:.8em;display:grid;gap:.7em;align-content:start;transition:border-color .3s,background .3s}
    .zone.running{border-color:color-mix(in srgb,var(--pri) 55%,transparent);background:color-mix(in srgb,var(--pri) 9%,transparent)}
    .zone header{display:flex;align-items:center;gap:.6em}.zone header .pill{flex:none}
    h3{margin:0;flex:1;font-size:1.1em;font-weight:600;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
    .drows{display:grid;gap:.1em;font-size:.95em}
    .drow{min-width:0;min-height:2.3em;display:grid;grid-template-columns:minmax(0,1fr) auto;align-items:center;gap:.55em;padding:.2em .4em;margin:0 -.4em;border-radius:.6em}
    .drow span{color:var(--mut);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
    .drow b{font-weight:600;font-variant-numeric:tabular-nums;white-space:nowrap;text-align:right}
    .drow.tone-warning b{color:var(--t)}
    .drow b em{font-style:normal;font-weight:400;color:var(--mut)}

    .starts{display:grid;gap:.4em}
    .durs{display:grid;grid-template-columns:repeat(auto-fit,minmax(3.6em,1fr));gap:.4em}
    .dur{min-height:2.9em;display:flex;align-items:baseline;justify-content:center;gap:.2em;padding:.5em .3em;border-radius:.8em;
      background:color-mix(in srgb,var(--pri) 12%,transparent);border:1px solid color-mix(in srgb,var(--pri) 35%,transparent)}
    .dur b{font-size:1.15em;font-weight:600;font-variant-numeric:tabular-nums}.dur em{font-style:normal;font-size:.8em;color:var(--mut)}
    .runbox{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:.8em;align-items:center}
    .rt{display:grid;gap:.3em;min-width:0}
    .bar{display:block;height:.35em;border-radius:.2em;background:var(--line);overflow:hidden}
    .bar u{display:block;height:100%;border-radius:inherit;background:var(--pri);text-decoration:none;transition:width .4s}
    .stop{min-height:3.2em;display:flex;align-items:center;gap:.4em;padding:.5em 1.1em .5em .9em;border-radius:.9em;color:var(--err);
      background:color-mix(in srgb,var(--err) 14%,transparent);border:1px solid color-mix(in srgb,var(--err) 45%,transparent)}
    .stop b{font-weight:600}

    .empty{display:flex;gap:.7em;align-items:flex-start;padding:1em;color:var(--mut);line-height:1.4}
    .empty ha-icon{flex:none;color:var(--pri)}

    /* Breites Layout (.wide, ab 480 px oder per Option): Kennzahlen in einer Reihe */
    @container (min-width:560px){.wide .tiles{grid-template-columns:repeat(auto-fit,minmax(0,1fr))}.wide .tiles>*{grid-column:auto!important}}
    @container (max-width:300px){.tiles{grid-template-columns:1fr}}

    @keyframes spray{0%,100%{transform:rotate(-12deg)}50%{transform:rotate(12deg)}}
    @keyframes spin{to{transform:rotate(360deg)}}
    @keyframes pulse{50%{opacity:.35}}
    @media (prefers-reduced-motion:reduce){.chip ha-icon,.dot{animation:none!important}.bar u,.sw,.sw i{transition:none}}
  `;}
}
Object.freeze(IrrigationCard.prototype);
if(!customElements.get("irrigation-card"))customElements.define("irrigation-card",IrrigationCard);
window.customCards=window.customCards||[];
if(!window.customCards.some(c=>c.type==="irrigation-card"))window.customCards.push({type:"irrigation-card",name:"Irrigation Card",description:"Bewässerungssteuerung für Hunter Hydrawise im Glas-Look, optimiert für iPhone, iPad und Hochformat-Kiosk.",preview:true,documentationURL:"https://github.com/BeGiBue/irrigation-card"});
console.info(`Irrigation Card v${IRRIGATION_CARD_VERSION}`);
