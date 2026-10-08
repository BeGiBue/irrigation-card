// Irrigation Card v1.1.0 – Bewässerung für Hunter Hydrawise / Hochformat / Touch / Kiosk — AGPL-3.0-only — BeGiBue
// Einzeldatei. Zonen werden über die Geräte der Hydrawise-Integration gefunden (Entity-Registry, translation_key).
const IRRIGATION_CARD_VERSION="1.1.0";
// Eingebettetes Standardbild (Hunter MP Rotator, gespiegelt, WebP als data-URL) – Quelle: images/MP-Rotator-Flyer.webp
const EMBEDDED_IMAGE_URL="data:image/webp;base64,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";
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
    const rel=a<3600?rtf.format(Math.round(sec/60),"minute"):dd===0?rtf.format(Math.round(sec/3600),"hour"):dd===1?"":rtf.format(dd,"day");
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
    const pumpRow=pump?`<button class="panel pump${this._on(c.pump_entity)?" on":""}" data-toggle="${this._e(c.pump_entity)}" ${this._ok(c.pump_entity)?"":"disabled"}><span class="chip"><ha-icon icon="mdi:pump"></ha-icon></span><b class="pt">${this._e(c.pump_title||pump.attributes?.friendly_name||"Pumpe")}</b><span class="ps">${this._e(this._f(c.pump_entity))}</span>${this._sw(this._on(c.pump_entity))}</button>`:"";
    const empty=`<section class="panel empty"><ha-icon icon="mdi:information-outline"></ha-icon><span>Keine Hydrawise-Zonen gefunden. Richte die Integration <b>Hunter Hydrawise</b> ein oder wähle die Zonen im Karteneditor aus.</span></section>`;
    this.shadowRoot.innerHTML=`<style>${IrrigationCard.css}</style><ha-card class="${bgm?"bgm":""}" style="--s:${sc}">${bgm?`<img class="bgimg pic" alt="" src="${this._e(img)}">`:""}<main>
      <section class="hero">
        <div class="title${ban?" banner":""}">${ban?`<img class="pic" alt="" src="${this._e(img)}">`:""}<span class="chip big${anyRun?" live":""}"><ha-icon icon="mdi:sprinkler-variant"></ha-icon></span><div><h1>${this._e(c.title)}</h1><p>${this._e(c.subtitle||k.name)}</p></div></div>
      </section>
      ${pumpRow}
      ${z.length?`<section class="zones">${z.map(x=>this._zone(x)).join("")}</section>`:empty}
      <section class="tiles">${tiles.join("")}</section>
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
    .banner>.pic{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:70% 55%;z-index:0}
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
    /* Controller-Kacheln einzeilig: Symbol, Titel, Wert am rechten Rand */
    .tiles{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,16em),1fr));gap:.6em}
    .tiles>:last-child:nth-child(odd){grid-column:1/-1}
    .tile{min-width:0;min-height:3.6em;display:grid;grid-template-columns:auto minmax(0,1fr) auto;column-gap:.6em;align-items:center;padding:.55em .8em;
      background:var(--fill);border:1px solid var(--line);border-radius:1em}
    .tile .lbl{font-size:.95em;-webkit-line-clamp:1}
    .tile .val{justify-content:flex-end}.tile .val b{font-size:1.15em}
    .tile:active,.drow:active,.pump:active,.dur:active,.stop:active{background:var(--fill-hi);transform:scale(.985)}
    @media (hover:hover){button.tile:hover,.drow:hover,.pump:hover:not(:disabled),.dur:hover:not(:disabled){background:var(--fill-hi)}}
    button:focus-visible{outline:2px solid var(--pri);outline-offset:2px}

    .pump{width:100%;min-height:3.8em;padding:.6em .9em;display:flex;align-items:center;gap:.8em}
    .pump .chip{--t:var(--mut)}.pump.on .chip{--t:var(--pri)}.pump.on .chip ha-icon{animation:spin 2s linear infinite}
    .pt{flex:1;min-width:0;font-size:1.05em;font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
    .ps{flex:none;color:var(--mut);font-size:.95em;white-space:nowrap}

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
