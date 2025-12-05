// --- ICONE SVG ---
const drillIconSVG = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="drill-icon"><path d="M12 2v5" stroke="#888" stroke-width="2" /><rect x="8" y="7" width="8" height="4" fill="#222" stroke="none" rx="1" /><path d="M12 11v11" stroke="#333" stroke-width="2" /><path d="M12 13l3 2 M12 17l3 2 M12 13l-3 2 M12 17l-3 2 M12 22l-3-2 3 2 3-2" stroke="#333" stroke-width="1.5" /></svg>`;
const extractionIconSVG = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="result-icon"><path d="M8 14v6c0 1 2 2 4 0s4 1 4 0v-6c0-3-2-5-4-5s-4 2-4 5z" fill="#fff0f0" stroke="#d32f2f"/><path d="M12 7V1m-3 3l3-3 3 3" stroke="#d32f2f" stroke-width="2"/></svg>`;
const immediateLoadIconSVG = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="result-icon"><path d="M10 13v8c0 1 4 1 4 0v-8" stroke="#555" stroke-width="2"/><path d="M7 7l1-3c0-1.5 1.5-2.5 3.5-2s4.5 0.5 4.5 2l1 3H7z" fill="#fffbe6" stroke="#f57c00"/><path d="M19 9l-2 3h2l-1 4" stroke="#e65100" stroke-width="2" fill="none"/></svg>`;

function showCustomAlert(msg, title="⚠️ Attenzione") {
  document.getElementById('alert-title').innerText = title;
  document.getElementById('alert-message').innerHTML = msg;
  document.getElementById('alert-overlay').style.display = 'flex';
}
function closeCustomAlert() {
  document.getElementById('alert-overlay').style.display = 'none';
}

// --- DATI ORIGINALI ---
const DEFAULT_PROTOCOLS = {
  "High": {
    "4.2": {
      "D1": { "non compresso": { fresa: "4.0 maschiatore", prep: "Completa" }, "compresso": { fresa: "4.0 maschiatore", prep: "Completa" } },
      "D2_D1": { "non compresso": { fresa: "4.0 maschiatore", prep: "Completa" }, "compresso": { fresa: "4.0 maschiatore", prep: "SottopreparazioneØ in altezza (Ø4.0 maschiatore –2 mm, Ø 3.0 completa)" } },
      "D2": { "non compresso": { fresa: "3.8", prep: "Completa", testa: "Ø 4.0mm" }, "compresso": { fresa: "3.8", prep: "SottopreparazioneØ in altezza (Ø3.8 –2 mm, Ø 2.8 completa)" } },
      "D3_D2": { "non compresso": { fresa: "3.6", prep: "Completa", testa: "Ø 4.0mm" }, "compresso": { fresa: "3.6", prep: "SottopreparazioneØ (Ø3.6 –2 mm, Ø2.8 completa)", testa: "a discrezione Ø 4mm" } },
      "D3": { "non compresso": { fresa: "3.4", prep: "SottopreparazioneØ in altezza (Ø3.4 –2 mm, Ø f.lettrice)", testa: "Ø 4.0mm" }, "compresso": { fresa: "3.2", prep: "SottopreparazioneØ in altezza (Ø3.2 –2 mm, Ø 2.3 completa)", testa: "Ø 4.0mm" } },
      "D3_D4": { "non compresso": { fresa: "3.2", prep: "Completa" , testa: "Ø 4.0mm" }, "compresso": { fresa: "2.8", prep: "SottopreparazioneØ in altezza (Ø2.8 –2 mm, Ø 2.3 completa)", testa: "Ø 4.0mm" } },
      "D4": { "non compresso": { fresa: "2.8", prep: "Completa", testa: "Ø 4.0mm" }, "compresso": { fresa: "2.6/F.lettrice", prep: "Completa", testa: "Ø 3.0mm" } }
    },
    "3.7": {
      "D1": { "non compresso": { fresa: "3.4", prep: "Completa" }, "compresso": { fresa: "3.4", prep: "Completa" } },
      "D2_D1": { "non compresso": { fresa: "3.4", prep: "Completa" }, "compresso": { fresa: "3.4", prep: "Completa" } },
      "D2": { "non compresso": { fresa: "3.4", prep: "Completa" }, "compresso": { fresa: "3.2", prep: "Completa" } },
      "D3_D2": { "non compresso": { fresa: "3.2", prep: "Completa" }, "compresso": { fresa: "3.0", prep: "completa" } },
      "D3": { "non compresso": { fresa: "2.8", prep: "SottopreparazioneØ in altezza (Ø2.8 –2 mm, Ø2.3 completa)" }, "compresso": { fresa: "2.8", prep: "SottopreparazioneØ in altezza (Ø2.8 –2 mm, Ø2.0 completa)" } },
      "D3_D4": { "non compresso": { fresa: "2.3", prep: "Completa", testa: "Ø 2.8mm" }, "compresso": { fresa: "2.3", prep: "completa)", testa: "Ø 2.8mm" } },
      "D4": { "non compresso": { fresa: "2.3", prep: "Completa", testa: "Ø 2.8mm" }, "compresso": { fresa: "2.3", prep: "SottopreparazioneØ in altezza (Ø2.3 –2 mm, Ø1.7 completa)", testa: "Ø 2.8mm" } }
    },
    "3.2": {
      "D1": { "non compresso": { fresa: "2.8", prep: "Completa" }, "compresso": { fresa: "2.3", prep: "Completa" } },
      "D2_D1": { "non compresso": { fresa: "2.3", prep: "Completa" }, "compresso": { fresa: "2.3", prep: "Completa" } },
      "D2": { "non compresso": { fresa: "2.3", prep: "Completa" }, "compresso": { fresa: "2.0", prep: "Completa" } },
      "D3_D2": { "non compresso": { fresa: "2.0", prep: "Completa" }, "compresso": { fresa: "2.0", prep: "Completa" } },
      "D3": { "non compresso": { fresa: "2.0", prep: "Completa" }, "compresso": { fresa: "1.7", prep: "Completa" } },
      "D3_D4": { "non compresso": { fresa: "1.7", prep: "Completa" }, "compresso": { fresa: "1.7", prep: "2–3 mm meno in profondità" } },
      "D4": { "non compresso": { fresa: "1.7", prep: "Completa" }, "compresso": { fresa: "1.7", prep: "2–3 mm meno in profondità" } }
    },
    "2.7": {
      "D1": { "non compresso": { fresa: "2.3", prep: "Completa" }, "compresso": { fresa: "2.0", prep: "Completa" } },
      "D2_D1": { "non compresso": { fresa: "2.3", prep: "Completa" }, "compresso": { fresa: "2.0", prep: "Completa" } },
      "D2": { "non compresso": { fresa: "2.0", prep: "Completa" }, "compresso": { fresa: "2.0", prep: "SottopreparazioneØ in altezza (Ø2.0 –2 mm, Ø1,7 completa)" } },
      "D3_D2": { "non compresso": { fresa: "2.0", prep: "Completa" }, "compresso": { fresa: "1.7", prep: "Completa" } },
      "D3": { "non compresso": { fresa: "1.7", prep: "Completa" }, "compresso": { fresa: "1.7", prep: "Completa" } },
      "D3_D4": { "non compresso": { fresa: "1.7", prep: "Completa" }, "compresso": { fresa: "1.7", prep: "Sottopreparazione in altezza (–1 mm)" } },
      "D4": { "non compresso": { fresa: "1.7", prep: "2–3 mm meno in profondità" }, "compresso": { fresa: "1.7", prep: "2–3 mm meno in profondità" } }
    },
    "4.8": {} 
  },
  "Medium": {
    "4.2": {
      "D1": { "non compresso": { fresa: "4.0", prep: "Completa" }, "compresso": { fresa: "4.0", prep: "Completa" } },
      "D2_D1": { "non compresso": { fresa: "4.0", prep: "Completa" }, "compresso": { fresa: "4.0", prep: "SottopreparazioneØ in altezza (Ø4.0 –2 mm, Ø 3.0 completa)" } },
      "D2": { "non compresso": { fresa: "3.8", prep: "Completa", testa: "Ø 4.0mm" }, "compresso": { fresa: "3.8", prep: "SottopreparazioneØ in altezza (Ø3.8 –2 mm, Ø 2.8 completa)" } },
      "D3_D2": { "non compresso": { fresa: "3.6", prep: "Completa", testa: "Ø 4.0mm" }, "compresso": { fresa: "3.6", prep: "SottopreparazioneØ (Ø3.6 –2 mm, Ø2.8 completa)", testa: "Ø 4.0mm" } },
      "D3": { "non compresso": { fresa: "3.4", prep: "SottopreparazioneØ in altezza (Ø3.4 –2 mm, Ø f.lettrice)", testa: "Ø 4.0mm" }, "compresso": { fresa: "3.2", prep: "SottopreparazioneØ in altezza (Ø3.2 –2 mm, Ø 2.3 completa)", testa: "Ø 4.0mm" } },
      "D3_D4": { "non compresso": { fresa: "3.2", prep: "Completa", testa: "Ø 4.0mm" }, "compresso": { fresa: "2.8", prep: "SottopreparazioneØ in altezza (Ø2.8 –2 mm, Ø 2.3 completa)", testa: "Ø 4.0mm" } },
      "D4": { "non compresso": { fresa: "2.8", prep: "Completa", testa: "Ø 4.0mm" }, "compresso": { fresa: "2.6/F.lettrice", prep: "Completa", testa: "Ø 3.0mm" } }
    },
    "3.7": {
      "D1": { "non compresso": { fresa: "3.4", prep: "Completa" }, "compresso": { fresa: "3.4", prep: "Completa" } },
      "D2_D1": { "non compresso": { fresa: "3.4", prep: "Completa" }, "compresso": { fresa: "3.4", prep: "Completa" } },
      "D2": { "non compresso": { fresa: "3.4", prep: "Completa" }, "compresso": { fresa: "3.2", prep: "Completa" } },
      "D3_D2": { "non compresso": { fresa: "3.2", prep: "Completa" }, "compresso": { fresa: "3.0", prep: "completa" } },
      "D3": { "non compresso": { fresa: "2.8", prep: "SottopreparazioneØ in altezza (Ø2.8 –2 mm, Ø2.3 completa)" }, "compresso": { fresa: "2.8", prep: "SottopreparazioneØ in altezza (Ø2.8 –2 mm, Ø2.0 completa)" } },
      "D3_D4": { "non compresso": { fresa: "2.3", prep: "Completa", testa: "Ø 2.8mm" }, "compresso": { fresa: "2.3", prep: "completa)", testa: "Ø 2.8mm" } },
      "D4": { "non compresso": { fresa: "2.3", prep: "Completa", testa: "Ø 2.8mm" }, "compresso": { fresa: "2.3", prep: "SottopreparazioneØ in altezza (Ø2.3 –2 mm, Ø1.7 completa)", testa: "Ø 2.8mm" } }
    },
    "4.8": {
      "D1": { "non compresso": { fresa: "non consigliato", prep: "non consigliato" }, "compresso": { fresa: "non consigliato", prep: "non consigliato" } },
      "D2_D1": { "non compresso": { fresa: "non consigliato", prep: "non consigliato" }, "compresso": { fresa: "non consigliato", prep: "non consigliato" } },
      "D2": { "non compresso": { fresa: "maschiatore 4,8", prep: "SottopreparazioneØ in altezza (maschiatore 4,8 metà , Ø 4,4 completa)" }, "compresso": { fresa: "4,4", prep: "SottopreparazioneØ in altezza (Ø4.4 –2 mm, Ø 3.0 completa)" } },
      "D3_D2": { "non compresso": { fresa: "4.4", prep: "completa" }, "compresso": { fresa: "4.4", prep: "SottopreparazioneØ in altezza (Ø4.4 –2 mm, Ø 3.0 completa)" } },
      "D3": { "non compresso": { fresa: "4.4", prep: "SottopreparazioneØ in altezza (Ø4.4 –2 mm, Ø 3.2 completa)" }, "compresso": { fresa: "4.2", prep: "SottopreparazioneØ in altezza (Ø4.2 –2 mm, Ø 3.0 completa)" } },
      "D3_D4": { "non compresso": { fresa: "4.2", prep: "SottopreparazioneØ in altezza (Ø4.2 –2 mm, Ø 3.0mm completa)" }, "compresso": { fresa: "4.0", prep: "SottopreparazioneØ in altezza (Ø4.0 –2 mm, Ø 2.8completa)" } },
      "D4": { "non compresso": { fresa: "3.6", prep: "completa", testa: "Ø 4.0mm" }, "compresso": { fresa: "3.6", prep: "SottopreparazioneØ in altezza (Ø3.6 –2 mm, Ø f.lettrice completa)", testa: "Ø 4.0mm" } }
    },
    "3.2": {}, // Non esiste 3.2 Low
    "2.7": {}  // Non esiste 2.7 Low
  },
  "Low": {
    "4.2": {
      "D1": { "non compresso": { fresa: "non consigliato", prep: "non consigliato" }, "compresso": { fresa: "non consigliato", prep: "non consigliato" } },
      "D2_D1": { "non compresso": { fresa: "non consigliato", prep: "non consigliato" }, "compresso": { fresa: "non consigliato", prep: "non consigliato" } },
      "D2": { "non compresso": { fresa: "non consigliato", prep: "non consigliato" }, "compresso": { fresa: "non consigliato", prep: "non consigliato" } },
      "D3_D2": { "non compresso": { fresa: "non consigliato", prep: "non consigliato" }, "compresso": { fresa: "non consigliato", prep: "non consigliato" } },
      "D3": { "non compresso": { fresa: "3.0", prep: "SottopreparazioneØ in altezza (Ø3.0 –2 mm, Ø 2.3 completa)" }, "compresso": { fresa: "2.8", prep: "SottopreparazioneØ in altezza (Ø2.8 –2 mm, Ø 2.3 completa)", testa: "Ø 3.0mm" } },
      "D3_D4": { "non compresso": { fresa: "2.8", prep: "Completa", testa: "Ø 3.0mm" }, "compresso": { fresa: "F.lettrice", prep: "Completa" } },
      "D4": { "non compresso": { fresa: "2.6 oppure F.lettrice", prep: "Completa", testa: "Ø 3.0mm" }, "compresso": { fresa: "2.3", prep: "SottopreparazioneØ in altezza (Ø2.3 –2 mm, Ø 1.7 completa)" } }
    },
    "3.7": {
      "D1": { "non compresso": { fresa: "non consigliato", prep: "non consigliato" }, "compresso": { fresa: "non consigliato", prep: "non consigliato" } },
      "D2_D1": { "non compresso": { fresa: "non consigliato", prep: "non consigliato" }, "compresso": { fresa: "non consigliato", prep: "non consigliato" } },
      "D2": { "non compresso": { fresa: "non consigliato", prep: "non consigliato" }, "compresso": { fresa: "non consigliato", prep: "non consigliato" } },
      "D3_D2": { "non compresso": { fresa: "non consigliato", prep: "non consigliato" }, "compresso": { fresa: "non consigliato", prep: "non consigliato" } },
      "D3": { "non compresso": { fresa: "2.8", prep: "Completa" }, "compresso": { fresa: "2.6/2.8", prep: "SottopreparazioneØ in altezza (Ø2.8/2.6 –2 mm, Ø 2.0 completa)" } },
      "D3_D4": { "non compresso": { fresa: "2.3", prep: "Completa", testa: "Ø 2.8mm" }, "compresso": { fresa: "2.3", prep: "SottopreparazioneØ in altezza (Ø2.3 –2 mm, Ø2.0 completa)", testa: "Ø 2.8mm" } },
      "D4": { "non compresso": { fresa: "2.0", prep: "Completa" }, "compresso": { fresa: "2.0", prep: "SottopreparazioneØ in altezza (Ø2.0 –2 mm, Ø1.7 completa)" } }
    },
    "4.8": {
      "D1": { "non compresso": { fresa: "non consigliato", prep: "non consigliato" }, "compresso": { fresa: "non consigliato", prep: "non consigliato" } },
      "D2_D1": { "non compresso": { fresa: "non consigliato", prep: "non consigliato" }, "compresso": { fresa: "non consigliato", prep: "non consigliato" } },
      "D2": { "non compresso": { fresa: "non consigliato", prep: "non consigliato" }, "compresso": { fresa: "non consigliato", prep: "non consigliato" } },
      "D3_D2": { "non compresso": { fresa: "non consigliato", prep: "non consigliato" }, "compresso": { fresa: "non consigliato", prep: "non consigliato" } },
      "D3": { "non compresso": { fresa: "3.8", prep: "Completa", testa: "Ø 4.0mm" }, "compresso": { fresa: "3.6", prep: "Completa", testa: "Ø 4.0mm" } },
      "D3_D4": { "non compresso": { fresa: "3.6", prep: "SottopreparazioneØ in altezza (Ø3.6 –2 mm, Ø 3.0 completa)", testa: "Ø 4.0mm" }, "compresso": { fresa: "3.4", prep: "SottopreparazioneØ in altezza (Ø3.4 –2 mm, Ø3.0 completa)", testa: "Ø 4.0mm" } },
      "D4": { "non compresso": { fresa: "3.2", prep: "Completa", testa: "Ø 3.8mm" }, "compresso": { fresa: "3.2", prep: "SottopreparazioneØ in altezza (Ø3.2 –2 mm, Ø 2.8 completa))", testa: "Ø 3.8mm" } }
    },
    "3.2": {}, // Non esiste 3.2 Low
    "2.7": {}  // Non esiste 2.7 Low
  }
};

let dbProtocolli = {};

function initApp() {
  // SAFETY: Assicuriamoci che l'editor sia chiuso all'avvio
  const ed = document.getElementById("editor-overlay");
  if(ed) ed.style.display = 'none';

  try {
    const savedInfo = localStorage.getItem("b1one_protocols_custom");
    if (savedInfo) {
      dbProtocolli = JSON.parse(savedInfo);
    } else {
      dbProtocolli = JSON.parse(JSON.stringify(DEFAULT_PROTOCOLS));
    }
    if(!dbProtocolli["High"]) throw new Error("Corrupted Data");
    
  } catch(e) {
    console.warn("Resetting DB due to error", e);
    localStorage.removeItem("b1one_protocols_custom");
    dbProtocolli = JSON.parse(JSON.stringify(DEFAULT_PROTOCOLS));
  }

  let acc = parseInt(localStorage.getItem(accessiKey)) || 0;
  localStorage.setItem(accessiKey, ++acc);
}

function checkPassword() {
  const passwordInput = document.getElementById('password-input').value;
  if (passwordInput === "Martina07") {
    document.getElementById('password-overlay').style.display = 'none';
    // Mostra il disclaimer subito dopo la password
    document.getElementById('disclaimer-overlay').style.display = 'flex';
  } else {
    showCustomAlert('Password errata. Riprova.');
    document.getElementById('password-input').value = "";
  }
}

function toggleDisclaimerBtn() {
    const chk = document.getElementById('accept-check');
    const btn = document.getElementById('disclaimer-btn');
    btn.disabled = !chk.checked;
}

function acceptDisclaimer() {
    document.getElementById('disclaimer-overlay').style.display = 'none';
}

document.getElementById('password-input').addEventListener('keyup', function(event) {
    if (event.key === "Enter") checkPassword();
});

// --- HELPER VISUALI ---
const corpoApiceData = {
  "2.7|High": { corpo: "2,3", apice: "1,3" }, "3.2|High": { corpo: "2,5", apice: "1,8" },
  "3.7|High": { corpo: "3,0", apice: "2,0" }, "3.7|Medium": { corpo: "2,9", apice: "2,0" }, "3.7|Low": { corpo: "2,3", apice: "2,0" },
  "4.2|High": { corpo: "3,5", apice: "2,3" }, "4.2|Medium": { corpo: "3,4", apice: "2,3" }, "4.2|Low": { corpo: "2,8", apice: "2,3" },
  "4.8|Medium": { corpo: "4,0", apice: "2,9" }, "4.8|Low": { corpo: "3,4", apice: "2,9" },
};

function getCorpoApice(diametro, b1one) {
  const key = `${diametro}|${b1one}`;
  if (corpoApiceData[key]) {
    const { corpo, apice } = corpoApiceData[key];
    return ` (corpo Ø${corpo} apice Ø${apice})`;
  }
  return "";
}

function getDensitaColor(densita) {
  if (densita.includes('D1')) return 'red';
  if (densita.includes('D2')) return 'red';
  if (densita.includes('D3 → D2')) return 'darkorange';
  if (densita.includes('D3 → D4')) return 'green';
  if (densita.includes('D2 → D1')) return 'lightcoral';
  if (densita.includes('D3')) return 'lightsalmon';
  if (densita.includes('D4')) return 'lightgreen';
  return 'black';
}

function getB1OneColor(tipo) {
  if (tipo === 'High') return 'red';
  if (tipo === 'Medium') return 'orange';
  if (tipo === 'Low') return 'green';
  return 'black';
}

function getImpiantoIdeale(diametro, densita) {
  const tipo = (() => {
    if (["3.7", "4.2", "4.8"].includes(diametro)) {
      if (["D1", "D2", "D2 → D1"].includes(densita)) return "High";
      if (["D3", "D3 → D2"].includes(densita)) return "Medium";
      if (["D4", "D3 → D4"].includes(densita)) return "Low";
    }
    return null;
  })();

  if (!tipo) return "";
  const colore = { High: "#e74c3c", Medium: "#ff8800", Low: "#28a745" }[tipo];
  return `<div class="result-block"><strong>🌟 Impianto ideale:</strong> <span style="color:${colore}; font-weight:bold;">B1One ${tipo} (Ø${diametro})</span></div>`;
}

// --- GENERAZIONE UI ---
function creaCampiImpianti() {
  const num = document.getElementById('impianti').value;
  const container = document.getElementById('impianti-container');
  container.innerHTML = '';
  if (!num) return;

  for (let i = 0; i < num; i++) {
    const card = document.createElement('div');
    card.className = 'impianto-card';

    const header = document.createElement('div');
    header.className = 'impianto-header';
    const title = document.createElement('div');
    title.className = 'impianto-title';
    title.textContent = `Impianto ${i + 1}`;
    const collapseBtn = document.createElement('button');
    collapseBtn.className = 'collapse-btn';
    collapseBtn.textContent = '−';
    collapseBtn.onclick = function() {
      const content = this.parentNode.nextElementSibling;
      if (content.classList.contains('hidden')) {
        content.classList.remove('hidden');
        this.textContent = '−';
      } else {
        content.classList.add('hidden');
        this.textContent = '+';
      }
    };
    header.appendChild(title);
    header.appendChild(collapseBtn);
    card.appendChild(header);

    const content = document.createElement('div');
    content.className = 'impianto-content';
    content.innerHTML = `
      <div class="form-group">
        <label for="dente_${i}">Dente:</label>
        <select id="dente_${i}">
          <option value="">-- Seleziona --</option>
          ${[11,12,13,14,15,16,17,18,21,22,23,24,25,26,27,28,31,32,33,34,35,36,37,38,41,42,43,44,45,46,47,48].map(n => `<option value="${n}">${n}</option>`).join('')}
        </select>
      </div>
      
      <div class="form-group">
        <label style="margin-bottom:2px;">Densità Ossea: <span style="color:red; font-weight:bold;">*</span></label>
        <div class="radio-group">
          <label class="radio-label">
            <input type="radio" name="modo_densita_${i}" value="hu" checked onchange="toggleModoInput(${i})">
            Hounsfield
          </label>
          <label class="radio-label">
            <input type="radio" name="modo_densita_${i}" value="densita" onchange="toggleModoInput(${i})">
            Classe (D1-D4)
          </label>
        </div>
        
        <div id="hu_block_${i}">
          <input type="number" id="hu_${i}" placeholder="Valore HU (es. 850)">
        </div>
        <div id="densita_block_${i}" style="display:none;">
          <select id="densita_ossea_${i}" onchange="impostaHUdaDensita(${i})">
            <option value="">-- Seleziona classe --</option>
            <option value="D1">D1</option>
            <option value="D2_D1">D2 tendente a D1</option>
            <option value="D2">D2</option>
            <option value="D3_D2">D3 tendente a D2</option>
            <option value="D3">D3</option>
            <option value="D3_D4">D4 tendente a D3</option>
            <option value="D4">D4</option>
          </select>
        </div>
      </div>

      <div class="form-group">
        <label>Opzioni Cliniche:</label>
        <div class="radio-group">
           <label class="radio-label">
              <input type="checkbox" id="carico_${i}"> Carico Immediato
           </label>
           <label class="radio-label">
              <input type="checkbox" id="post_${i}" onchange="toggleNotaPost(${i})"> Post-estrattivo
           </label>
        </div>
        <div id="nota_post_${i}" class="nota" style="display:none;">
            ⚠️ In presenza di una radice in posizione impianto il valore HU deve essere controllato (per possibile sovrastima).
        </div>
      </div>

      <div class="form-group">
        <label for="diametro_${i}">Diametro (mm):</label>
        <select id="diametro_${i}" onchange="aggiornaTutto(${i})">
          <option value="2.7">2.7</option>
          <option value="3.2">3.2</option>
          <option value="3.7">3.7</option>
          <option value="4.2">4.2</option>
          <option value="4.8">4.8</option>
        </select>
      </div>
      <div class="form-group">
        <label for="lunghezza_${i}">Lunghezza (mm):</label>
        <select id="lunghezza_${i}">
        </select>
      </div>
      <div class="form-group">
        <label for="b1one_${i}">B1One:</label>
        <select id="b1one_${i}" onchange="aggiornaOpzioniB1One(${i})">
          <option value="High" style="color:red;">High</option>
          <option value="Medium" style="color:orange;">Medium</option>
          <option value="Low" style="color:green;">Low</option>
        </select>
      </div>
    `;
    card.appendChild(content);
    container.appendChild(card);
  }
  for (let i = 0; i < num; i++) aggiornaTutto(i);
}

function aggiornaOpzioniB1One(index) {
  const b1oneSelect = document.getElementById(`b1one_${index}`);
  const diametroSelect = document.getElementById(`diametro_${index}`);
  if (!b1oneSelect || !diametroSelect) return;
  const diametro = diametroSelect.value;
  const b1oneValue = b1oneSelect.value;
  for (let opt of b1oneSelect.options) opt.disabled = false;
  if (diametro === '2.7' || diametro === '3.2') {
    b1oneSelect.value = 'High';
    for (let opt of b1oneSelect.options) { if (opt.value !== 'High') opt.disabled = true; }
  } else if (diametro === '4.8') {
    if (b1oneValue === 'High') b1oneSelect.value = 'Medium';
    for (let opt of b1oneSelect.options) { if (opt.value === 'High') opt.disabled = true; }
  }
}

function aggiornaOpzioniLunghezza(index) {
    const diametroSelect = document.getElementById(`diametro_${index}`);
    const lunghezzaSelect = document.getElementById(`lunghezza_${index}`);
    if (!diametroSelect || !lunghezzaSelect) return;
    const diametro = diametroSelect.value;
    const currentValue = lunghezzaSelect.value;
    let options = [];
    let defaultOption = '';
    if (diametro === '2.7' || diametro === '3.2') {
        options = ["10", "12", "14", "15.5", "17"];
        defaultOption = '10';
    } else if (diametro === '3.7') {
        options = ["8", "10", "12", "14", "15.5", "17"];
        defaultOption = '8';
    } else {
        options = ["6", "8", "10", "12", "14", "15.5", "17"];
        defaultOption = '6';
    }
    lunghezzaSelect.innerHTML = options.map(val => `<option value="${val}">${val}</option>`).join('');
    if (options.includes(currentValue)) lunghezzaSelect.value = currentValue;
    else lunghezzaSelect.value = defaultOption;
}

function aggiornaTutto(index) {
  aggiornaOpzioniB1One(index);
  aggiornaOpzioniLunghezza(index);
}

function toggleModoInput(i) {
  const radioSelected = document.querySelector(`input[name="modo_densita_${i}"]:checked`);
  const value = radioSelected ? radioSelected.value : "hu";

  const huBlock = document.getElementById(`hu_block_${i}`);
  const densitaBlock = document.getElementById(`densita_block_${i}`);
  
  if (value === "hu") {
    huBlock.style.display = "block";
    densitaBlock.style.display = "none";
    document.getElementById(`densita_ossea_${i}`).value = "";
  } else {
    huBlock.style.display = "none";
    densitaBlock.style.display = "block";
    document.getElementById(`hu_${i}`).value = "";
  }
}

function toggleNotaPost(i) {
    const chk = document.getElementById(`post_${i}`);
    const nota = document.getElementById(`nota_post_${i}`);
    if(chk && nota) {
        nota.style.display = chk.checked ? 'block' : 'none';
    }
}

function impostaHUdaDensita(i) {
  const valore = document.getElementById(`densita_ossea_${i}`).value;
  const campoHU = document.getElementById(`hu_${i}`);
  const mappa = { "D1": 1300, "D2_D1": 1200, "D2": 1000, "D3_D2": 775, "D3": 600, "D3_D4": 400, "D4": 250 };
  campoHU.value = mappa[valore] || "";
}

function applicaCalcoliLunghezza(testo, L) {
    if (!testo || typeof testo !== 'string') return testo;
    const len = parseFloat(L);
    if (isNaN(len)) return testo;

    const fmt = (val) => `{{${val}mm}}`;

    testo = testo.replace(/2[–-—]?3\s*mm\s*meno.*?(?:profondità)?/gi, match => { 
        return fmt((len - 1.5) + "/" + (len - 2.5)); 
    });
    testo = testo.replace(/[–-—]\s*2\s*mm/gi, match => { 
        return fmt(len - 1.5);
    });
    testo = testo.replace(/[–-—]\s*1\s*mm/gi, match => { 
        return fmt(len - 0.5);
    });
    testo = testo.replace(/\bcompleta\b/gi, match => { 
        return fmt(len + 0.5);
    });
    testo = testo.replace(/f\.?lettrice(?!.*\{\{)/gi, match => {
        return match + " " + fmt(len + 0.5);
    });

    testo = testo.replace(/\(([^)]+)\)/g, (match, content) => {
        if (!content.includes(',')) return match;
        let parts = content.split(',');
        const getVal = (s) => {
            const m = s.match(/\{\{([\d.]+)mm\}\}/);
            return m ? parseFloat(m[1]) : 0;
        };
        parts.sort((a, b) => getVal(b) - getVal(a));
        return `(${parts.join(', ')})`;
    });

    testo = testo.replace(/\{\{(.*?)\}\}/g, '<strong>($1)</strong>');
    return testo;
}

function getDensitaBackgroundColor(densitaLabel) {
    if (!densitaLabel) return '#f9f9f9'; 
    if (densitaLabel.includes('D1') && !densitaLabel.includes('D2')) return '#ffcdd2'; 
    if (densitaLabel.includes('D2')) return '#ffe0b2'; 
    if (densitaLabel.includes('D3')) return '#fff9c4'; 
    if (densitaLabel.includes('D4')) return '#c8e6c9'; 
    return '#f9f9f9';
}

function getProtocolloDinamico(b1oneType, diametro, hu, caricoMode, lunghezzaImpianto) {
  let dKey = "D4";
  if (hu > 1250) dKey = "D1";
  else if (hu >= 1150) dKey = "D2_D1";
  else if (hu >= 850) dKey = "D2";
  else if (hu >= 700) dKey = "D3_D2";
  else if (hu >= 500) dKey = "D3";
  else if (hu >= 300) dKey = "D3_D4";
  
  try {
    const p = dbProtocolli[b1oneType][diametro] && dbProtocolli[b1oneType][diametro][dKey] ? dbProtocolli[b1oneType][diametro][dKey][caricoMode] : null;
    if(!p) return { densita: dKey.replace("_", " → "), fresa: "Non definito", prep: "-", testa: "", noteGenerali: "", fresaNumerica: "?", lunghezzaNumerica: "-" };
    
    const noteGen = dbProtocolli[b1oneType][diametro].__notes || "";
    const prepCalcolata = applicaCalcoliLunghezza(p.prep, lunghezzaImpianto);
    
    let fresaNum = p.fresa.match(/[\d.,]+/);
    fresaNum = fresaNum ? fresaNum[0] : "?";
    
    let lungNum = "-";
    const matchBold = prepCalcolata.match(/<strong>\(([\d.,]+)mm\)<\/strong>/);
    if (matchBold) { lungNum = matchBold[1] + "mm"; } else { const matchSimple = prepCalcolata.match(/(\d+[.,]?\d*)\s*mm/); if (matchSimple) lungNum = matchSimple[0]; }

    return {
      densita: dKey.replace("_", " → "),
      fresa: p.fresa,
      prep: prepCalcolata,
      fresaNumerica: fresaNum,
      lunghezzaNumerica: lungNum,
      testa: p.testa,
      noteGenerali: noteGen
    };
  } catch (e) {
    return { densita: dKey.replace("_", " → "), fresa: "Errore", prep: "Errore", fresaNumerica: "?", lunghezzaNumerica: "-", testa: "", noteGenerali: "" };
  }
}

function extractDiameter(text) {
    if (!text || typeof text !== 'string') return 0;
    const match = text.match(/(\d+[.,]\d+)/);
    return match ? parseFloat(match[1].replace(',', '.')) : 0;
}

// --- LOGICHE BOTTONI ---

function calcolaFresaComune() {
    const num = document.getElementById('impianti').value;
    if (!num) return showCustomAlert("Seleziona prima il numero di impianti.");

    let superiore = [];
    let inferiore = [];

    // --- RACCOLTA DATI ---
    for (let i = 0; i < num; i++) {
        const denteVal = document.getElementById(`dente_${i}`).value;
        const dente = parseInt(denteVal);
        if (!dente) continue;

        const radioSelected = document.querySelector(`input[name="modo_densita_${i}"]:checked`);
        let hu = 0;
        if(radioSelected && radioSelected.value === "hu") {
             hu = parseInt(document.getElementById(`hu_${i}`).value) || 0;
        } else {
             const densVal = document.getElementById(`densita_ossea_${i}`).value;
             const mappa = { "D1": 1300, "D2_D1": 1200, "D2": 1000, "D3_D2": 775, "D3": 600, "D3_D4": 400, "D4": 250 };
             hu = mappa[densVal] || 0;
        }
        
        const carico = document.getElementById(`carico_${i}`).checked ? 'compresso' : 'non compresso';
        const b1one = document.getElementById(`b1one_${i}`).value;
        const diametro = document.getElementById(`diametro_${i}`).value;
        const lunghezza = document.getElementById(`lunghezza_${i}`).value;

        const prep = getProtocolloDinamico(b1one, diametro, hu, carico, lunghezza);
        const diametroFinale = extractDiameter(prep.fresa);
        const lunghezzaCalc = prep.lunghezzaNumerica !== "-" ? prep.lunghezzaNumerica : lunghezza; 

        if (diametroFinale > 0) {
            const item = { 
                id: i+1, 
                dente: dente, 
                diam: diametroFinale, 
                len: lunghezzaCalc, 
                prepText: prep.prep,
                impDiam: diametro, 
                impLen: lunghezza,
                b1Type: b1one,
                densityLabel: prep.densita,
                headPrep: prep.testa
            };

            if (dente >= 10 && dente <= 29) superiore.push(item);
            else if (dente >= 30 && dente <= 49) inferiore.push(item);
        }
    }

    if (superiore.length === 0 && inferiore.length === 0) {
        return showCustomAlert("Nessun impianto valido trovato per il calcolo.");
    }
    
    function estraiLunghezzaSpecifica(testoProtocollo, diametroFresa, lunghezzaDefault) {
        const cleanText = testoProtocollo.replace(/<[^>]*>/g, ''); 
        const pattern = new RegExp(`Ø\\s*${diametroFresa.toFixed(1).replace('.', '[.,]')}.*?\\((\\d+[.,]?\\d*)\\s*mm\\)`, 'i');
        const match = cleanText.match(pattern);
        if (match && match[1]) {
            return match[1] + "mm";
        }
        return lunghezzaDefault;
    }

    // MAPPA COLORI DENSITÀ
    const getDensColor = (d) => {
        if(d.includes('D1')) return '#ffcdd2'; // Red-ish
        if(d.includes('D2')) return '#ffe0b2'; // Orange-ish
        if(d.includes('D3')) return '#fff9c4'; // Yellow-ish
        if(d.includes('D4')) return '#c8e6c9'; // Green-ish
        return '#f9f9f9';
    }

    // Genera la tabella riassuntiva in alto
    function generaRiepilogoImpianti(items) {
        if (items.length === 0) return "";
        items.sort((a, b) => a.dente - b.dente);
        let html = `<div style="margin-bottom:15px; background:#eef; padding:10px; border-radius:6px; font-size:13px; border:1px solid #ccf;">
                    <div style="font-weight:bold; margin-bottom:5px; color:#004085;">📋 Riepilogo Impianti:</div>
                    <div style="display:flex; flex-wrap:wrap; gap:10px;">`;
        
        items.forEach(item => {
            const bgCol = getDensColor(item.densityLabel);
            const prefix = item.b1Type.charAt(0); // H, M, L
            html += `<div style="background:${bgCol}; padding:4px 8px; border-radius:4px; border:1px solid #ccc; box-shadow:0 1px 2px rgba(0,0,0,0.1);">
                        <strong>#${item.dente}</strong>: ${prefix} Ø${item.impDiam} x ${item.impLen}mm
                     </div>`;
        });
        
        // LEGENDA
        html += `</div>
                 <div style="margin-top:10px; display:flex; gap:15px; font-size:11px; align-items:center;">
                    <span style="font-weight:bold; color:#555;">Legenda Densità:</span>
                    <span style="display:flex;align-items:center;gap:4px;"><span style="width:10px;height:10px;background:#ffcdd2;border:1px solid #999;border-radius:50%"></span>D1</span>
                    <span style="display:flex;align-items:center;gap:4px;"><span style="width:10px;height:10px;background:#ffe0b2;border:1px solid #999;border-radius:50%"></span>D2</span>
                    <span style="display:flex;align-items:center;gap:4px;"><span style="width:10px;height:10px;background:#fff9c4;border:1px solid #999;border-radius:50%"></span>D3</span>
                    <span style="display:flex;align-items:center;gap:4px;"><span style="width:10px;height:10px;background:#c8e6c9;border:1px solid #999;border-radius:50%"></span>D4</span>
                 </div>
                 </div>`;
        return html;
    }

    function generaSequenzaArcata(items, nomeArcata, coloreBordo) {
        if (items.length === 0) return "";
        items.sort((a, b) => a.diam - b.diam);
        const diametriUnici = [...new Set(items.map(item => item.diam))];
        
        let html = `<div style="margin-bottom:25px; text-align:left;">
                      <h3 style="color:${coloreBordo}; font-size:18px; text-transform:uppercase; border-bottom:2px solid ${coloreBordo}; padding-bottom:5px; margin-bottom:10px;">${nomeArcata}</h3>
                      ${generaRiepilogoImpianti(items)}
                      <div style="margin-top:10px;">`;

        let headPrepItems = []; // Accumulatore per le preparazioni di testa

        diametriUnici.forEach((d, index) => {
            const targets = items.filter(item => item.diam >= d);
            const stoppers = items.filter(item => item.diam === d);
            
            targets.forEach(t => {
                t.currentStepLen = estraiLunghezzaSpecifica(t.prepText, d, t.len);
            });
            
            const groups = {};
            targets.forEach(t => {
                const lKey = t.currentStepLen;
                if (!groups[lKey]) groups[lKey] = [];
                groups[lKey].push(t);
            });

            const sortedLengths = Object.keys(groups).sort((a, b) => {
                const valA = parseFloat(a) || 0;
                const valB = parseFloat(b) || 0;
                return valA - valB;
            });

            let passText = "";
            sortedLengths.forEach(lenKey => {
                const toothObjs = groups[lenKey];
                
                // Raccogli preparazioni di testa
                toothObjs.forEach(t => {
                    if (t.headPrep && !headPrepItems.find(h => h.id === t.id)) {
                        headPrepItems.push(t);
                    }
                });

                // Stampa solo i numeri dei denti, senza info testa qui
                const teethStr = toothObjs.map(t => `<strong>${t.dente}</strong>`).join(", ");
                passText += `<div style="margin-bottom:4px; padding-left:10px;">• ${teethStr} <span style="color:#666; font-style:italic;">(a L ${lenKey})</span></div>`;
            });

            html += `
                <div style="background:${index % 2 === 0 ? '#f9f9f9' : '#fff'}; padding:12px; border-left:5px solid ${coloreBordo}; margin-bottom:10px; border-radius:4px; box-shadow:0 1px 3px rgba(0,0,0,0.05);">
                    <div style="font-size:16px; font-weight:bold; color:#333; margin-bottom:5px; display:flex; align-items:center;">
                        <span style="background:${coloreBordo}; color:white; width:24px; height:24px; border-radius:50%; display:inline-flex; justify-content:center; align-items:center; margin-right:8px; font-size:14px;">${index + 1}</span>
                        Fresa Ø ${d.toFixed(1)}
                    </div>
                    <div style="color:#555; font-size:14px; margin-left:32px;">
                        <div style="margin-top:4px;">${passText}</div>
                    </div>
                    ${stoppers.length > 0 ? `<div style="margin-top:8px; margin-left:32px; padding-top:4px; border-top:1px dashed #ccc; color:#d32f2f; font-size:13px; font-weight:bold;">🛑 STOP (Fresa Finale) per: ${stoppers.map(t => t.dente).join(", ")}</div>` : ''}
                </div>
            `;
        });

        // SEZIONE FINALE PREPARAZIONE DI TESTA
        if (headPrepItems.length > 0) {
             headPrepItems.sort((a,b) => a.dente - b.dente);
             html += `<div style="background:#fff3cd; padding:12px; border-left:5px solid #ffc107; margin-bottom:10px; border-radius:4px; box-shadow:0 1px 3px rgba(0,0,0,0.05); margin-top:20px;">
                        <div style="font-size:16px; font-weight:bold; color:#856404; margin-bottom:5px; display:flex; align-items:center;">
                            <span style="font-size:18px; margin-right:5px;">🟢</span> Preparazione di Testa (Countersink)
                        </div>
                        <div style="margin-left:32px; color:#555; font-size:14px;">
                            <p style="margin:0 0 5px 0;">Effettuare solo dopo l'ultimo passaggio di fresa:</p>`;
             
             headPrepItems.forEach(t => {
                 html += `<div style="margin-bottom:4px;">• <strong>${t.dente}</strong>: ${t.headPrep}</div>`;
             });
             
             html += `</div></div>`;
        }

        html += `</div></div>`;
        return html;
    }

    // --- COSTRUZIONE MSG FINALE ---
    let msg = `<div id="sequenza-content">`; // Wrapper per il PDF
    
    // Header con nome paziente
    const nomePaziente = document.getElementById('nome').value || "Paziente";
    msg += `<div style="text-align:center; margin-bottom:20px; border-bottom:1px solid #eee; padding-bottom:10px;">
                <h2 style="margin:0; color:#333;">Sequenza di Preparazione</h2>
                <p style="margin:5px 0 0 0; color:#666;">${nomePaziente}</p>
            </div>`;

    msg += generaSequenzaArcata(superiore, "Arcata Superiore", "#0056b3");
    msg += generaSequenzaArcata(inferiore, "Arcata Inferiore", "#28a745");
    msg += `</div>`; // Chiudi wrapper

    // Aggiunta bottone PDF in cima all'alert
    msg = `<div style="text-align:right; margin-bottom:10px;">
             <button onclick="esportaSequenzaPDF()" style="background:#dc3545; color:white; border:none; padding:6px 12px; border-radius:4px; cursor:pointer; font-weight:bold;">📄 Scarica PDF Sequenza</button>
           </div>` + msg;

    showCustomAlert(msg, "📊 Analisi Sequenza & Raggruppamento");
}

function elabora() {
  try {
      const nome = document.getElementById('nome').value;
      if (!nome.trim()) { showCustomAlert('Inserire Cognome e Nome del paziente'); return; }
      const num = document.getElementById('impianti').value;
      if (!num) { showCustomAlert('Selezionare il numero di impianti'); return; }

      for (let i = 0; i < num; i++) {
        const dente = document.getElementById(`dente_${i}`).value;
        
        // CONTROLLO VALIDAZIONE PIU' ROBUSTO
        const radioSelected = document.querySelector(`input[name="modo_densita_${i}"]:checked`);
        const inputMode = radioSelected ? radioSelected.value : "hu"; 
        
        if (inputMode === "hu") {
            const huVal = document.getElementById(`hu_${i}`).value;
            if(!huVal) { showCustomAlert(`Impianto ${i+1}: Inserisci un valore Hounsfield valido.`); return; }
        } else {
            const densVal = document.getElementById(`densita_ossea_${i}`).value;
            if(!densVal) { showCustomAlert(`Impianto ${i+1}: Seleziona una classe di densità dal menu.`); return; }
        }

        if (!dente) { showCustomAlert(`Selezionare il numero del dente per l'impianto ${i+1}`); return; }
      }

      let impiantiElaborati = parseInt(localStorage.getItem(impiantiKey)) || 0;
      impiantiElaborati += parseInt(num);
      localStorage.setItem(impiantiKey, impiantiElaborati);

      let output = `<h2 style="text-align:center; margin-bottom:20px;">Risultati per: ${nome}</h2>`;
      
      for (let i = 0; i < num; i++) {
        const dente = document.getElementById(`dente_${i}`).value;
        const hu = parseInt(document.getElementById(`hu_${i}`).value);
        
        const carico = document.getElementById(`carico_${i}`).checked ? 'compresso' : 'non compresso';
        const post = document.getElementById(`post_${i}`).checked ? 'si' : 'no';
        const b1one = document.getElementById(`b1one_${i}`).value;
        const diametro = document.getElementById(`diametro_${i}`).value;
        const lunghezza = document.getElementById(`lunghezza_${i}`).value;

        // Passiamo anche la lunghezza per il calcolo
        const prep = getProtocolloDinamico(b1one, diametro, hu, carico, lunghezza);
        
        const coloreDensita = getDensitaColor(prep.densita);
        const coloreB1One = getB1OneColor(b1one);
        const drillDiam = prep.fresaNumerica;
        
        let imgTag = "";
        const key = `${diametro}_${b1one}`;
        const placeholderSrc = `https://placehold.co/150x250/e0f7fa/006064?text=${b1one}+${diametro}\\n${lunghezza}mm`;
        
        const immaginiLocali = {
            "4.8_Medium": { src: "48_Medium.png", desc: `Medium Ø4.8 x ${lunghezza}mm (corpo Ø4,0 apice Ø2,9)`, pdf: "indicazioni_48.pdf" },
            "4.8_Low": { src: "48_Low.png", desc: `Low Ø4.8 x ${lunghezza}mm (corpo Ø3,4 apice Ø2,9)`, pdf: "indicazioni_48.pdf" },
            "4.2_Low": { src: "42_Low.png", desc: `Low Ø4.2 x ${lunghezza}mm (corpo Ø2,8 apice Ø2,3)`, pdf: "indicazioni_42.pdf" },
            "4.2_Medium": { src: "42_Medium.png", desc: `Medium Ø4.2 x ${lunghezza}mm (corpo Ø3,4 apice Ø2,3)`, pdf: "indicazioni_42.pdf" },
            "4.2_High": { src: "42_High.png", desc: `High Ø4.2 x ${lunghezza}mm (corpo Ø3,5 apice Ø2,3)`, pdf: "indicazioni_42.pdf" },
            "3.7_Low": { src: "37_Low.png", desc: `Low Ø3.7 x ${lunghezza}mm (corpo Ø2,3 apice Ø2,0)` },
            "3.7_Medium": { src: "37_Medium.png", desc: `Medium Ø3.7 x ${lunghezza}mm (corpo Ø2,9 apice Ø2,0)`, pdf: "indicazioni_37.pdf" },
            "3.7_High": { src: "37_High.png", desc: `High Ø3.7 x ${lunghezza}mm (corpo Ø3,0 apice Ø2,0)`, pdf: "indicazioni_37.pdf" },
            "3.2_High": { src: "32_High.png", desc: `High Ø3.2 x ${lunghezza}mm (corpo Ø2,5 apice Ø1,8)`, pdf: "indicazioni_32high.pdf" },
            "2.7_High": { src: "27_High.png", desc: `High Ø2.7 x ${lunghezza}mm (corpo Ø2,3 apice Ø1,3)` }
        };
        
        if (immaginiLocali[key]) {
              imgTag = `<img src="${immaginiLocali[key].src}" onerror="this.onerror=null;this.src='${placeholderSrc}';" style="max-height: 180px; border-radius:4px;">`;
        } else {
              imgTag = `<img src="${placeholderSrc}" style="max-height: 180px; border-radius:4px;">`;
        }

        // 1. Etichetta Sopra (Nuova logica)
        const labelHtml = `<div style="margin-bottom:6px; font-weight:900; font-size:16px; color:${coloreB1One}; background:#fff; border:1px solid #eee; padding:4px 8px; border-radius:6px; box-shadow:0 1px 3px rgba(0,0,0,0.05); white-space:nowrap;">${b1one} Ø${diametro} x ${lunghezza}mm</div>`;

        // 2. Pulsante Sotto (Logica PDF)
        let pdfFile = "";
        if (diametro === "2.7") pdfFile = "indicazioni_27high.pdf";
        else if (diametro === "3.2") pdfFile = "indicazioni_32high.pdf";
        else if (diametro === "3.7") pdfFile = "indicazioni_37.pdf";
        else if (diametro === "4.2") pdfFile = "indicazioni_42.pdf";
        else if (diametro === "4.8") pdfFile = "indicazioni_48.pdf";

        const btnHtml = pdfFile ? `<button onclick="window.open('${pdfFile}', '_blank')" style="margin-top:8px; background: linear-gradient(to bottom, #17a2b8, #138496); color: white; padding: 6px 12px; border: none; border-radius: 20px; font-size: 12px; font-weight: bold; cursor: pointer; box-shadow: 0 2px 4px rgba(0,0,0,0.2); border-bottom: 2px solid #117a8b;">📄 Indicazioni</button>` : "";

        output += `
          <div class="result-row" style="display: grid; grid-template-columns: 1fr 4px 1fr; gap: 20px; max-width: 1000px; margin: auto; align-items: start;">
            <div class="result-content">
              <div class="dente">🦷 Dente: ${dente}</div>
              ${ (["16","17","18","26","27","28","36","37","38","46","47","48"].includes(dente) && ((diametro === "2.7" && b1one === "High") || (diametro === "3.2" && b1one === "High") || (diametro === "3.7" && b1one === "Low"))) ? '<div style="color:red; font-weight:bold; margin-top:10px;">❌ Non consigliato per questa posizione: "resistenza insufficiente"</div>' : '' }
              <div class="densita" style="color:${coloreDensita}; text-shadow:1px 1px 2px gray;">🦴 Densità: ${prep.densita}</div>
              ${getImpiantoIdeale(diametro, prep.densita)}
              <div class="result-block"><strong>${extractionIconSVG} Post-estrattivo:</strong> ${post === 'si' ? 'Sì <span style="color:red;">(rivalutare la densità ossea con il ROI)</span>' : 'No'}</div>
              <div class="result-block"><strong>🔩 B1One:</strong> <span style="color:${coloreB1One}; font-weight:bold;">${b1one} Ø${diametro} x ${lunghezza}mm${getCorpoApice(diametro, b1one)}</span></div>
              <div class="result-block"><strong>${immediateLoadIconSVG} Carico immediato:</strong> ${carico === 'compresso' ? 'Sì' : 'No'}</div>
              <div class="result-block"><strong>${drillIconSVG} Fresa Finale Ø:</strong> ${drillDiam} mm</div>
              <div class="result-block"><strong>📏 Preparazione in lunghezza:</strong> ${prep.prep}</div>
              ${prep.noteGenerali ? `<div class="note-cliniche-box"><span class="note-cliniche-title">📝 Note Cliniche:</span><span class="note-cliniche-text">${prep.noteGenerali}</span></div>` : ""}
              ${prep.testa ? `<div class="result-block" style="margin-top:10px;"><strong>🟢 Preparazione Testa:</strong> ${prep.testa}</div>` : ""}
            </div>
            <div style="background-color: #007BFF; height: 100%; border-radius: 2px;"></div>
            <div style="align-self: start; display: flex; flex-direction: column; align-items: center; justify-content: flex-start;">
               ${labelHtml}
               ${imgTag}
               ${btnHtml}
            </div>
          </div>
        `;
      }
      document.getElementById('output').innerHTML = output;
      document.getElementById('odontoBtn').style.display = 'inline-block';
      document.getElementById('output').scrollIntoView({behavior: 'smooth'});
  } catch(err) {
      showCustomAlert("Errore imprevisto durante l'elaborazione: " + err.message);
      console.error(err);
  }
}

function esportaSequenzaPDF() {
    const element = document.getElementById('sequenza-content');
    if (!element) return;
    
    const nome = document.getElementById('nome').value || 'paziente';
    
    // Clona l'elemento per modificarlo leggermente per la stampa
    const clone = element.cloneNode(true);
    clone.style.width = '600px'; 
    clone.style.padding = '20px';
    clone.style.background = 'white';
    
    const container = document.createElement('div');
    container.style.position = 'fixed';
    container.style.top = '-9999px';
    container.appendChild(clone);
    document.body.appendChild(container);

    html2canvas(clone, { scale: 2 }).then(canvas => {
        const imgData = canvas.toDataURL('image/jpeg', 1.0);
        const pdf = new window.jspdf.jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const imgProps = pdf.getImageProperties(imgData);
        const imgHeight = (imgProps.height * pdfWidth) / imgProps.width;
        
        pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, imgHeight);
        pdf.save(`Sequenza_Preparazione_${nome.replace(/\s+/g, '_')}.pdf`);
        
        document.body.removeChild(container);
    });
}

// --- EDITOR LOGIC ---
function apriEditor() {
  document.getElementById("editor-overlay").style.display = "flex";
  renderEditorTable();
}
function chiudiEditor() {
  document.getElementById("editor-overlay").style.display = "none";
}
function renderEditorTable() {
  const b1one = document.getElementById("edit-b1one").value;
  const diam = document.getElementById("edit-diametro").value;
  const tbody = document.getElementById("editor-tbody");
  tbody.innerHTML = "";

  if (!dbProtocolli[b1one] || !dbProtocolli[b1one][diam]) {
    tbody.innerHTML = "<tr><td colspan='5' style='text-align:center; padding:20px; color:red;'>Nessun protocollo definito per questa combinazione (es. B1One High Ø4.8 non esiste).</td></tr>";
    return;
  }
  if (Object.keys(dbProtocolli[b1one][diam]).length === 0) {
    tbody.innerHTML = "<tr><td colspan='5' style='text-align:center; padding:20px; color:red;'>Combinazione non valida per il sistema B1One.</td></tr>";
    return;
  }

  // --- MODIFICA PER NOTE CLINICHE ---
  // Recupera e imposta il valore delle note nella textarea
  const currentNotes = dbProtocolli[b1one][diam].__notes || "";
  document.getElementById("edit-general-notes").value = currentNotes;

  const densities = ["D1", "D2_D1", "D2", "D3_D2", "D3", "D3_D4", "D4"];
  const densityLabels = {
    "D1": "D1 (>1250 HU)", "D2_D1": "D2 → D1", "D2": "D2", 
    "D3_D2": "D3 → D2", "D3": "D3", "D3_D4": "D3 → D4", "D4": "D4 (<250 HU)"
  };

  densities.forEach(dKey => {
    const dataRow = dbProtocolli[b1one][diam][dKey];
    if (!dataRow) return;

    let tr1 = document.createElement("tr");
    tr1.innerHTML = `
      <td rowspan="2" style="font-weight:bold; vertical-align:middle;">${densityLabels[dKey]}</td>
      <td>Differito</td>
      <td><textarea onchange="updateDB('${b1one}','${diam}','${dKey}','non compresso','fresa', this.value)">${dataRow["non compresso"].fresa || ''}</textarea></td>
      <td><textarea onchange="updateDB('${b1one}','${diam}','${dKey}','non compresso','prep', this.value)">${dataRow["non compresso"].prep || ''}</textarea></td>
      <td><input type="text" value="${dataRow["non compresso"].testa || ''}" onchange="updateDB('${b1one}','${diam}','${dKey}','non compresso','testa', this.value)"></td>
    `;
    tbody.appendChild(tr1);

    let tr2 = document.createElement("tr");
    tr2.innerHTML = `
      <td style="color:var(--accent); font-weight:bold;">Immediato</td>
      <td><textarea onchange="updateDB('${b1one}','${diam}','${dKey}','compresso','fresa', this.value)">${dataRow["compresso"].fresa || ''}</textarea></td>
      <td><textarea onchange="updateDB('${b1one}','${diam}','${dKey}','compresso','prep', this.value)">${dataRow["compresso"].prep || ''}</textarea></td>
      <td><input type="text" value="${dataRow["compresso"].testa || ''}" onchange="updateDB('${b1one}','${diam}','${dKey}','compresso','testa', this.value)"></td>
    `;
    tbody.appendChild(tr2);
  });
}
function updateDB(b1, diam, dens, load, field, val) {
  if(dbProtocolli[b1] && dbProtocolli[b1][diam] && dbProtocolli[b1][diam][dens]) {
    dbProtocolli[b1][diam][dens][load][field] = val;
  }
}
function salvaProtocolliDB() {
  localStorage.setItem("b1one_protocols_custom", JSON.stringify(dbProtocolli));
  showCustomAlert("Protocolli salvati nel browser! (Temporaneo)");
  chiudiEditor();
}
function ripristinaDefault() {
  if(confirm("Sei sicuro? Questo cancellerà tutte le tue modifiche.")) {
    localStorage.removeItem("b1one_protocols_custom");
    initApp();
    renderEditorTable();
  }
}

// --- FUNZIONE PER SCARICARE APP AGGIORNATA ---
function scaricaVersionePermanente() {
    // 1. Elementi da nascondere
    const editor = document.getElementById('editor-overlay');
    const adminArea = document.getElementById('adminArea');
    const loginBox = document.getElementById('loginBox');
    
    // 2. Salva stato visualizzazione attuale
    const oldEditorDisplay = editor.style.display;
    const oldAdminDisplay = adminArea.style.display;
    const oldLoginDisplay = loginBox.style.display;

    // 3. Modifica direttamente il DOM per l'export (nascondi tutto con stile inline)
    editor.setAttribute('style', 'display: none;'); 
    adminArea.setAttribute('style', 'display: none;');
    loginBox.setAttribute('style', 'display: none;');

    // 4. Prepara i nuovi protocolli JSON
    const newProtocolsJSON = JSON.stringify(dbProtocolli, null, 2);
    
    // 5. Cattura l'intero codice HTML della pagina corrente
    let fullHTML = document.documentElement.outerHTML;

    // 6. Ripristina la visualizzazione per l'utente attuale
    editor.style.display = oldEditorDisplay;
    adminArea.style.display = oldAdminDisplay;
    loginBox.style.display = oldLoginDisplay;

    // 7. Sostituisci il blocco JSON nel codice catturato
    const startMarker = "const DEFAULT_PROTOCOLS = {";
    const endMarker = "let dbProtocolli = {};"; 
    
    const startIndex = fullHTML.indexOf(startMarker);
    const endIndex = fullHTML.indexOf(endMarker);
    
    if (startIndex === -1 || endIndex === -1) {
        showCustomAlert("Errore critico: Impossibile trovare il punto di iniezione del codice.");
        return;
    }
    
    const newBlock = `const DEFAULT_PROTOCOLS = ${newProtocolsJSON};\n\n`;
    const newHTML = fullHTML.substring(0, startIndex) + newBlock + fullHTML.substring(endIndex);
    
    // 8. Crea e scarica il file
    const blob = new Blob([newHTML], {type: "text/html"});
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "Protocollo_B1ONE_Aggiornato.html";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showCustomAlert("✅ Nuova App Generata!\n\nIl file 'Protocollo_B1ONE_Aggiornato.html' è stato scaricato.\nUsa questo file d'ora in poi per avere le modifiche permanenti.");
}

// --- UTILITIES SALVATAGGIO / EXPORT ---
function resetta() { location.reload(); }
function salvaDati() {
  const nome = document.getElementById('nome').value || 'paziente';
  const num = document.getElementById('impianti').value;
  if (!num) return showCustomAlert("Completa l'elaborazione prima di salvare.");
  const dati = { paziente: nome, impianti: [] };
  for (let i = 0; i < num; i++) {
    const radioSelected = document.querySelector(`input[name="modo_densita_${i}"]:checked`);
    const inputMode = radioSelected ? radioSelected.value : "hu"; 
    
    // CORREZIONE: Salviamo esplicitamente la scelta del menu a tendina
    const densitaVal = document.getElementById(`densita_ossea_${i}`).value;
    
    const carico = document.getElementById(`carico_${i}`).checked ? 'compresso' : 'non compresso';
    const post = document.getElementById(`post_${i}`).checked ? 'si' : 'no';

    dati.impianti.push({
      dente: document.getElementById(`dente_${i}`).value,
      hu: document.getElementById(`hu_${i}`).value,
      inputMode: inputMode,
      densitaClass: densitaVal, // Salvataggio valore menu
      carico: carico,
      post: post,
      b1one: document.getElementById(`b1one_${i}`).value,
      diametro: document.getElementById(`diametro_${i}`).value,
      lunghezza: document.getElementById(`lunghezza_${i}`).value
    });
  }
  const blob = new Blob([JSON.stringify(dati, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `Dati_${nome.replace(/\s+/g, "_")}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
function caricaDati(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const dati = JSON.parse(e.target.result);
      // Controllo robusto contro file vuoti o non validi
      if (!dati || (!dati.impianti && !dati.i)) {
          showCustomAlert("File non valido o corrotto.");
          return;
      }
      document.getElementById('nome').value = dati.paziente || dati.p || '';
      // Gestiamo sia la vecchia struttura (dati.impianti) che quella nuova (dati.i)
      const listaImpianti = dati.impianti || dati.i || [];
      document.getElementById('impianti').value = listaImpianti.length;
      creaCampiImpianti();
      setTimeout(() => {
        listaImpianti.forEach((impianto, i) => {
          document.getElementById(`dente_${i}`).value = impianto.dente || impianto.d || '';
          // Ripristino Modo Input (HU o Classe)
          const mode = impianto.inputMode || "hu";
          if (mode) {
              const radio = document.querySelector(`input[name="modo_densita_${i}"][value="${mode}"]`);
              if (radio) { radio.checked = true; toggleModoInput(i); }
          }
          if (impianto.densitaClass) {
             const densSelect = document.getElementById(`densita_ossea_${i}`);
             if(densSelect) { densSelect.value = impianto.densitaClass; impostaHUdaDensita(i); }
          }
          if(impianto.hu) { document.getElementById(`hu_${i}`).value = impianto.hu; }
          const isCarico = (impianto.carico === 'compresso' || impianto.carico === 'Sì' || impianto.l === true);
          const isPost = (impianto.post === 'si' || impianto.post === 'Sì' || impianto.p === true);
          document.getElementById(`carico_${i}`).checked = isCarico;
          document.getElementById(`post_${i}`).checked = isPost;
          toggleNotaPost(i);
          document.getElementById(`diametro_${i}`).value = impianto.diametro || impianto.dm || '';
          aggiornaTutto(i);
          document.getElementById(`b1one_${i}`).value = impianto.b1one || impianto.b || '';
          document.getElementById(`lunghezza_${i}`).value = impianto.lunghezza || impianto.ln || '';
          aggiornaTutto(i);
        });
      }, 100);
    } catch (err) { console.error(err); showCustomAlert("Errore file JSON."); }
  };
  reader.readAsText(file);
}
function esportaPDF() {
  const nome = document.getElementById('nome').value || 'paziente';
  const output = document.getElementById('output');
  if (!output.innerHTML.includes('Risultati per:')) return showCustomAlert("Non ci sono risultati da esportare.");
  html2canvas(output, { scale: 2 }).then(canvas => {
    const imgData = canvas.toDataURL('image/jpeg', 1.0);
    const pdf = new window.jspdf.jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const imgProps = pdf.getImageProperties(imgData);
    const imgHeight = (imgProps.height * pageWidth) / imgProps.width;
    let position = 0;
    while (position < imgHeight) {
      pdf.addImage(imgData, 'JPEG', 0, -position, pageWidth, imgHeight);
      position += pageHeight;
      if (position < imgHeight) pdf.addPage();
    }
    pdf.save(`Protocollo_B1One_${nome.replace(/\s+/g, '_')}.pdf`);
  });
}
function updateGeneralNotes(val) {
    const b1one = document.getElementById("edit-b1one").value;
    const diam = document.getElementById("edit-diametro").value;
    if(dbProtocolli[b1one] && dbProtocolli[b1one][diam]) {
        dbProtocolli[b1one][diam].__notes = val;
    }
}

function parseDrillSteps(prepText) {
  // Regex per estrarre: "Ø" seguito da numero, e poi "(numero mm)"
  // Esempio testo: "SottopreparazioneØ in altezza (Ø2.0 (14.5mm), Ø2.8 (12.5mm))"
  // Match 1: "2.0", "14.5"
  // Match 2: "2.8", "12.5"
  const regex = /Ø\s*([\d.,]+).*?\(([\d.,]+)mm\)/g;
  const steps = [];
  let match;
  
  // Rimuoviamo tag HTML per sicurezza
  const cleanText = prepText.replace(/<[^>]*>/g, '');
  
  while ((match = regex.exec(cleanText)) !== null) {
    steps.push({
      diam: match[1],
      len: match[2]
    });
  }
  
  return steps;
}

// --- ODONTOGRAMMA ---
function mostraOdontogramma() {
    try {
        const num = document.getElementById('impianti').value;
        if (!num) { showCustomAlert("Nessun impianto selezionato."); return; }
        
        const overlay = document.getElementById('odonto-overlay');
        if(!overlay) { showCustomAlert("Errore interfaccia: Overlay non trovato."); return; }
        
        overlay.style.display = 'flex';
        document.getElementById('odonto-patient-name').innerText = "Paziente: " + (document.getElementById('nome').value || "Sconosciuto");
        
        const upperGrid = document.getElementById('grid-upper');
        const lowerGrid = document.getElementById('grid-lower');
        upperGrid.innerHTML = ''; lowerGrid.innerHTML = '';
        
        const upperTeeth = [18,17,16,15,14,13,12,11,21,22,23,24,25,26,27,28];
        const lowerTeeth = [48,47,46,45,44,43,42,41,31,32,33,34,35,36,37,38];
        
        let implantMap = {};
        for(let i=0; i<num; i++) {
            const denteElem = document.getElementById(`dente_${i}`);
            if(!denteElem) continue;
            const dente = parseInt(denteElem.value);
            if(!dente) continue;
            
            // Recupero dati
            let hu = 0;
            const radioHu = document.querySelector(`input[name="modo_densita_${i}"][value="hu"]`);
            if(radioHu && radioHu.checked) {
                 hu = parseInt(document.getElementById(`hu_${i}`).value) || 0;
            } else {
                 const densVal = document.getElementById(`densita_ossea_${i}`).value;
                 const mappa = { "D1": 1300, "D2_D1": 1200, "D2": 1000, "D3_D2": 775, "D3": 600, "D3_D4": 400, "D4": 250 };
                 hu = mappa[densVal] || 0;
            }
            
            const caricoChk = document.getElementById(`carico_${i}`);
            const carico = (caricoChk && caricoChk.checked) ? 'compresso' : 'non compresso';
            
            const b1one = document.getElementById(`b1one_${i}`).value;
            const diametro = document.getElementById(`diametro_${i}`).value;
            const lunghezza = document.getElementById(`lunghezza_${i}`).value;
            
            const prep = getProtocolloDinamico(b1one, diametro, hu, carico, lunghezza);
            const bgColor = getDensitaBackgroundColor(prep.densita);
            const typeLetter = b1one ? b1one.charAt(0).toUpperCase() : "?";
            
            // 1. PARSING DEI PASSAGGI MULTIPLI
            const drillSteps = parseDrillSteps(prep.prep);
            
            // Se il parsing fallisce (nessun match), usiamo il dato "fresa numerica" semplice come fallback
            let drillInfoHTML = "";
            if (drillSteps.length > 0) {
                drillInfoHTML = drillSteps.map(s => `<div>F Ø${s.diam} L${s.len}</div>`).join("");
            } else {
                drillInfoHTML = `<div>F Ø${prep.fresaNumerica} L${prep.lunghezzaNumerica}</div>`;
            }

            // 2. AGGIUNTA PREPARAZIONE TESTA
            if (prep.testa) {
                drillInfoHTML += `<div style="color:#d32f2f; font-weight:bold; border-top:1px solid #ccc; margin-top:2px;">Testa ${prep.testa}</div>`;
            }

            implantMap[dente] = {
                typeLetter: typeLetter,
                diametroImp: diametro,
                lunghezzaImp: lunghezza,
                bgColor: bgColor,
                drillInfoHTML: drillInfoHTML 
            };
        }
        
        upperTeeth.forEach(t => upperGrid.appendChild(createToothElement(t, implantMap[t])));
        lowerTeeth.forEach(t => lowerGrid.appendChild(createToothElement(t, implantMap[t])));
        
    } catch(e) {
        console.error(e);
        showCustomAlert("Errore durante la generazione dell'odontogramma: " + e.message);
    }
}

function createToothElement(toothNum, data) {
    const div = document.createElement('div');
    div.className = 'tooth-container';
    if(data) div.classList.add('active');
    
    let bgStyle = data ? `background-color:${data.bgColor}; border-color:#555; color:#000; box-shadow:0 2px 5px rgba(0,0,0,0.15);` : "";
    
    let circleContent = data ? `<div style="line-height:1.1;"><div class="tooth-imp-diam">${data.typeLetter} ${data.diametroImp}</div><div class="tooth-imp-len">${data.lunghezzaImp}</div></div>` : "";
    
    // Qui inseriamo l'HTML generato dinamicamente con tutti i passaggi
    let infoBox = data ? `<div class="tooth-info" style="margin-top:4px;">${data.drillInfoHTML}</div>` : '';

    div.innerHTML = `<div class="tooth-number">${toothNum}</div>
                      <div class="tooth-circle" style="${bgStyle}">${circleContent}</div>
                      ${infoBox}`;
    return div;
}

function closeOdonto() { document.getElementById('odonto-overlay').style.display = 'none'; }
function esportaOdontogrammaPDF() {
    const element = document.getElementById('odonto-sheet');
    const originalBorder = element.style.border;
    element.style.border = "none";
    html2canvas(element, { scale: 2 }).then(canvas => {
        element.style.border = originalBorder;
        const imgData = canvas.toDataURL('image/jpeg', 1.0);
        const pdf = new window.jspdf.jsPDF('l', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const imgProps = pdf.getImageProperties(imgData);
        const imgHeight = (imgProps.height * pdfWidth) / imgProps.width;
        pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, imgHeight);
        pdf.save(`Sintesi_Odontogramma_${document.getElementById('nome').value}.pdf`);
    });
}

const accessiKey = "contatoreAccessi";
const impiantiKey = "impiantiElaborati";

window.onload = function() {
    initApp();
    // Safety check
    const ids = ['editor-overlay', 'adminArea', 'loginBox', 'odonto-overlay'];
    ids.forEach(id => {
        const el = document.getElementById(id);
        if(el) el.style.display = 'none';
    });
};

function mostraLogin() { document.getElementById("loginBox").style.display = "block"; }
function verificaLogin() {
  const pass = document.getElementById("adminPass").value;
  if (pass === "b1admin") {
    mostraAdmin();
    document.getElementById("loginBox").style.display = "none";
  } else {
    showCustomAlert("Password Admin Errata.");
  }
}
function mostraAdmin() {
  document.getElementById("accessiCount").textContent = localStorage.getItem(accessiKey) || 0;
  document.getElementById("impiantiCount").textContent = localStorage.getItem(impiantiKey) || 0;
  document.getElementById("adminArea").style.display = "block";
}

function mostraContatti() { document.getElementById('finestraContatti').style.display = 'block'; }
function nascondiContatti() { document.getElementById('finestraContatti').style.display = 'none'; }
