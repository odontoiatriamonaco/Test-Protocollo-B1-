// =============================================
// ICONE SVG
// =============================================
const drillIconSVG = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="drill-icon"><path d="M12 2v5" stroke="#888" stroke-width="2" /><rect x="8" y="7" width="8" height="4" fill="#222" stroke="none" rx="1" /><path d="M12 11v11" stroke="#333" stroke-width="2" /><path d="M12 13l3 2 M12 17l3 2 M12 13l-3 2 M12 17l-3 2 M12 22l-3-2 3 2 3-2" stroke="#333" stroke-width="1.5" /></svg>`;
const extractionIconSVG = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="result-icon"><path d="M8 14v6c0 1 2 2 4 0s4 1 4 0v-6c0-3-2-5-4-5s-4 2-4 5z" fill="#fff0f0" stroke="#d32f2f"/><path d="M12 7V1m-3 3l3-3 3 3" stroke="#d32f2f" stroke-width="2"/></svg>`;
const immediateLoadIconSVG = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="result-icon"><path d="M10 13v8c0 1 4 1 4 0v-8" stroke="#555" stroke-width="2"/><path d="M7 7l1-3c0-1.5 1.5-2.5 3.5-2s4.5 0.5 4.5 2l1 3H7z" fill="#fffbe6" stroke="#f57c00"/><path d="M19 9l-2 3h2l-1 4" stroke="#e65100" stroke-width="2" fill="none"/></svg>`;

// =============================================
// FUNZIONI ALERT E DISCLAIMER
// =============================================

function showCustomAlert(msg, title) {
    title = title || "⚠️ Attenzione";
    document.getElementById('alert-title').innerText = title;
    document.getElementById('alert-message').innerHTML = msg;
    document.getElementById('alert-overlay').style.display = 'flex';
}

function closeCustomAlert() {
    document.getElementById('alert-overlay').style.display = 'none';
}

function mostraInfoTesta() {
    var msg = '<div style="text-align:left; line-height:1.6;">' +
        '<p><strong>⚠️ Preparazione della Testa Implantare</strong></p>' +
        '<p>L\'utilizzo delle frese di testa è <strong>A DISCREZIONE</strong> del clinico e dipende da diversi fattori:</p>' +
        '<ul style="margin:10px 0; padding-left:20px;">' +
        '<li><strong>Spessore della corticale:</strong> valutare attentamente lo spessore dell\'osso corticale prima di procedere.</li>' +
        '<li><strong>Rischio di necrosi:</strong> un\'eccessiva compressione della corticale può portare a necrosi ossea per ischemia.</li>' +
        '<li><strong>Osso poco denso (D3-D4):</strong> in presenza di osso trabecolare con bassa densità, è consigliabile <strong>NON utilizzare</strong> la fresa di testa per preservare l\'osso disponibile.</li>' +
        '<li><strong>Carico immediato:</strong> nei casi di carico immediato, evitare la preparazione della testa può contribuire a una maggiore stabilità primaria.</li>' +
        '<li><strong>Post-estrattivo:</strong> negli impianti post-estrattivi, valutare con cautela l\'utilizzo della fresa di testa in base alla qualità ossea residua.</li>' +
        '</ul>' +
        '<p style="color:#d32f2f; font-weight:bold;">La decisione finale spetta sempre al clinico sulla base della valutazione intraoperatoria.</p>' +
        '</div>';
    showCustomAlert(msg, 'ℹ️ Informazioni Preparazione Testa');
}

// =============================================
// FUNZIONI CLASSE DENSITÀ PER GRIGLIA IMPORT
// =============================================

// Converte valore HU in classe densità
function huToClasse(hu) {
    if (!hu || hu === '') return '';
    hu = parseFloat(hu);
    if (hu >= 1250) return 'D1';
    if (hu >= 1150) return 'D2_D1';
    if (hu >= 850) return 'D2';
    if (hu >= 700) return 'D3_D2';
    if (hu >= 500) return 'D3';
    if (hu >= 300) return 'D3_D4';
    return 'D4';
}

// Converte classe in valore HU medio
function classeToHU(classe) {
    var huMap = {
        'D1': '1300',
        'D2_D1': '1200',
        'D2': '1000',
        'D3_D2': '775',
        'D3': '600',
        'D3_D4': '400',
        'D4': '200'
    };
    return huMap[classe] || '';
}

// Ottiene il colore e label per la classe
function getClasseInfo(classe) {
    var info = {
        'D1': { color: '#ef5350', border: '#d32f2f', label: 'D1' },
        'D2_D1': { color: '#ffcdd2', border: '#ef9a9a', label: 'D2→D1' },
        'D2': { color: '#ffa726', border: '#f57c00', label: 'D2' },
        'D3_D2': { color: '#ffe0b2', border: '#ffcc80', label: 'D3→D2' },
        'D3': { color: '#ffee58', border: '#fdd835', label: 'D3' },
        'D3_D4': { color: '#c8e6c9', border: '#a5d6a7', label: 'D3→D4' },
        'D4': { color: '#66bb6a', border: '#43a047', label: 'D4' }
    };
    return info[classe] || null;
}

// Genera HTML per visualizzare la classe con pallino colorato
function renderClasseBadge(classe) {
    if (!classe) return '<span style="color:#999;">--</span>';
    var info = getClasseInfo(classe);
    if (!info) return '<span style="color:#999;">--</span>';
    return '<span style="display:inline-flex; align-items:center; gap:5px;">' +
        '<span style="width:18px; height:18px; border-radius:50%; background:' + info.color + '; border:2px solid ' + info.border + '; display:inline-block;"></span>' +
        '<span style="font-weight:bold; font-size:12px;">' + info.label + '</span></span>';
}

// Mostra popup per selezione classe densità
function mostraPopupClasse(index) {
    var currentClasse = importedImplantsData[index] ? importedImplantsData[index].classe || '' : '';
    
    var popupHTML = '<div style="text-align:center;">' +
        '<p style="margin-bottom:15px; font-weight:bold;">Seleziona la classe di densità ossea:</p>' +
        '<div style="display:flex; flex-wrap:wrap; justify-content:center; gap:10px; max-width:400px; margin:0 auto;">';
    
    var classi = [
        { val: 'D1', color: '#ef5350', border: '#d32f2f', label: 'D1' },
        { val: 'D2_D1', color: '#ffcdd2', border: '#ef9a9a', label: 'D2→D1' },
        { val: 'D2', color: '#ffa726', border: '#f57c00', label: 'D2' },
        { val: 'D3_D2', color: '#ffe0b2', border: '#ffcc80', label: 'D3→D2' },
        { val: 'D3', color: '#ffee58', border: '#fdd835', label: 'D3' },
        { val: 'D3_D4', color: '#c8e6c9', border: '#a5d6a7', label: 'D3→D4' },
        { val: 'D4', color: '#66bb6a', border: '#43a047', label: 'D4' }
    ];
    
    for (var i = 0; i < classi.length; i++) {
        var c = classi[i];
        var selected = (c.val === currentClasse) ? 'border:3px solid #0056b3; transform:scale(1.1);' : '';
        popupHTML += '<div onclick="selezionaClasseImport(' + index + ', \'' + c.val + '\')" ' +
            'style="cursor:pointer; padding:10px; border-radius:10px; background:#f8f9fa; border:2px solid #dee2e6; ' +
            'transition:all 0.2s; min-width:70px; ' + selected + '" ' +
            'onmouseover="this.style.background=\'#e9ecef\'; this.style.transform=\'scale(1.05)\';" ' +
            'onmouseout="this.style.background=\'#f8f9fa\'; this.style.transform=\'scale(1)\';">' +
            '<div style="width:30px; height:30px; border-radius:50%; background:' + c.color + '; ' +
            'border:3px solid ' + c.border + '; margin:0 auto 5px; box-shadow:0 2px 4px rgba(0,0,0,0.2);"></div>' +
            '<div style="font-weight:bold; font-size:13px;">' + c.label + '</div>' +
        '</div>';
    }
    
    popupHTML += '</div></div>';
    
    showCustomAlert(popupHTML, '🎨 Seleziona Classe Densità');
}

// Gestisce la selezione della classe e sincronizza con HU
function selezionaClasseImport(index, classe) {
    closeCustomAlert();
    
    // Aggiorna la classe nei dati
    if (importedImplantsData[index]) {
        importedImplantsData[index].classe = classe;
        // Aggiorna anche l'HU corrispondente
        var nuovoHU = classeToHU(classe);
        importedImplantsData[index].densitaHU = nuovoHU;
        
        // Aggiorna l'input HU visivamente
        var huInput = document.getElementById('hu-input-' + index);
        if (huInput) {
            huInput.value = nuovoHU;
        }
        
        // Aggiorna il badge della classe
        var classeCell = document.getElementById('classe-cell-' + index);
        if (classeCell) {
            classeCell.innerHTML = renderClasseBadge(classe);
        }
    }
}

// Aggiorna la visualizzazione di una riga dopo modifica
function aggiornaVisualizzazioneRigaImport(index) {
    var tbody = document.getElementById('import-tbody');
    tbody.innerHTML = '';
    for (var i = 0; i < importedImplantsData.length; i++) {
        aggiungiRigaTabella(importedImplantsData[i], i);
    }
}

// Aggiorna HU da input e sincronizza classe
function aggiornaHUeClasse(index, huValue) {
    if (importedImplantsData[index]) {
        importedImplantsData[index].densitaHU = huValue;
        importedImplantsData[index].classe = huToClasse(huValue);
    }
    // Aggiorna solo il badge della classe, non tutta la riga
    var classeCell = document.getElementById('classe-cell-' + index);
    if (classeCell) {
        classeCell.innerHTML = renderClasseBadge(importedImplantsData[index].classe);
    }
}

// =============================================
// FUNZIONI CORTICALE (H/N/S)
// =============================================

// Ottiene info corticale (spessore bordo, colore, label)
function getCorticaleInfo(corticale) {
    var info = {
        'H': { spessore: 8, color: '#1565c0', label: 'H (Spessa >2mm)', desc: 'Corticale Spessa' },
        'N': { spessore: 4, color: '#1976d2', label: 'N (Normale 2mm)', desc: 'Corticale Normale' },
        'S': { spessore: 2, color: '#64b5f6', label: 'S (Sottile <2mm)', desc: 'Corticale Sottile' }
    };
    return info[corticale] || null;
}

// Converte classe densità in tipo spongiosa (h=densa, n=media, s=rarefatta)
function classeTipoSpongiosa(classe) {
    if (!classe) return null;
    // D1, D2_D1 = spongiosa densa (h)
    if (classe === 'D1' || classe === 'D2_D1') return 'h';
    // D2, D3_D2, D3 = spongiosa media (n)
    if (classe === 'D2' || classe === 'D3_D2' || classe === 'D3') return 'n';
    // D3_D4, D4 = spongiosa rarefatta (s)
    if (classe === 'D3_D4' || classe === 'D4') return 's';
    return null;
}

// Ottiene la classificazione combinata (es. "Hh", "Nn", "Ss")
function getClassificazioneOssea(corticale, classe) {
    if (!corticale) return null;
    var spongiosa = classeTipoSpongiosa(classe);
    if (!spongiosa) return null;
    return corticale + spongiosa;
}

// Ottiene info completa della classificazione ossea
function getClassificazioneOsseaInfo(classificazione) {
    var info = {
        'Hh': { label: 'Hh', desc: 'High/hard', dettaglio: 'Corticale spessa + Spongiosa densa', testa: 'obbligatoria' },
        'Hn': { label: 'Hn', desc: 'High/normal', dettaglio: 'Corticale spessa + Spongiosa media', testa: 'obbligatoria' },
        'Hs': { label: 'Hs', desc: 'High/soft', dettaglio: 'Corticale spessa + Spongiosa rarefatta', testa: 'protocollo_specifico' },
        'Nn': { label: 'Nn', desc: 'Normal/normal', dettaglio: 'Corticale media + Spongiosa media', testa: 'protocollo_specifico' },
        'Ns': { label: 'Ns', desc: 'Normal/soft', dettaglio: 'Corticale media + Spongiosa rarefatta', testa: 'non_indicata' },
        'Ss': { label: 'Ss', desc: 'Small/soft', dettaglio: 'Corticale sottile + Spongiosa rarefatta', testa: 'non_indicata' },
        // Combinazioni meno comuni
        'Sh': { label: 'Sh', desc: 'Small/hard', dettaglio: 'Corticale sottile + Spongiosa densa', testa: 'a_discrezione' },
        'Sn': { label: 'Sn', desc: 'Small/normal', dettaglio: 'Corticale sottile + Spongiosa media', testa: 'non_indicata' },
        'Nh': { label: 'Nh', desc: 'Normal/hard', dettaglio: 'Corticale media + Spongiosa densa', testa: 'a_discrezione' }
    };
    return info[classificazione] || null;
}

// Genera badge visivo per la corticale (cerchio con bordo blu variabile)
function renderCorticaleBadge(corticale, classe) {
    if (!corticale) return '<span style="color:#999; font-size:11px;">--</span>';
    
    var cortInfo = getCorticaleInfo(corticale);
    var classInfo = getClasseInfo(classe);
    if (!cortInfo) return '<span style="color:#999;">--</span>';
    
    var bgColor = classInfo ? classInfo.color : '#f5f5f5';
    var classificazione = getClassificazioneOssea(corticale, classe);
    var classOsseaInfo = classificazione ? getClassificazioneOsseaInfo(classificazione) : null;
    var labelExtra = classOsseaInfo ? ' (' + classOsseaInfo.desc + ')' : '';
    
    return '<span style="display:inline-flex; align-items:center; gap:6px;" title="' + cortInfo.desc + labelExtra + '">' +
        '<span style="width:24px; height:24px; border-radius:50%; background:' + bgColor + '; ' +
        'border:' + cortInfo.spessore + 'px solid ' + cortInfo.color + '; display:inline-block; box-shadow:0 1px 3px rgba(0,0,0,0.2);"></span>' +
        '<span style="font-weight:bold; font-size:12px; color:' + cortInfo.color + ';">' + corticale + '</span>' +
        (classificazione ? '<span style="font-size:11px; color:#666;">→ ' + classificazione + '</span>' : '') +
        '</span>';
}

// Mostra popup per selezione corticale
function mostraPopupCorticale(index) {
    var currentCorticale = importedImplantsData[index] ? importedImplantsData[index].corticale || '' : '';
    var currentClasse = importedImplantsData[index] ? importedImplantsData[index].classe || '' : '';
    
    var popupHTML = '<div style="text-align:center;">' +
        '<p style="margin-bottom:10px; font-weight:bold;">Seleziona lo spessore della corticale:</p>' +
        '<p style="font-size:12px; color:#666; margin-bottom:15px;">(Opzionale - basato su valutazione clinica)</p>' +
        '<div style="display:flex; justify-content:center; gap:20px; margin-bottom:20px;">';
    
    var corticali = [
        { val: 'H', spessore: 8, color: '#1565c0', label: 'H', desc: 'Spessa (>2mm)' },
        { val: 'N', spessore: 4, color: '#1976d2', label: 'N', desc: 'Normale (2mm)' },
        { val: 'S', spessore: 2, color: '#64b5f6', label: 'S', desc: 'Sottile (<2mm)' }
    ];
    
    // Ottieni colore sfondo dalla classe
    var classInfo = getClasseInfo(currentClasse);
    var bgColor = classInfo ? classInfo.color : '#f5f5f5';
    
    for (var i = 0; i < corticali.length; i++) {
        var c = corticali[i];
        var selected = (c.val === currentCorticale) ? 'box-shadow:0 0 0 3px #0056b3; transform:scale(1.1);' : '';
        var classificazione = getClassificazioneOssea(c.val, currentClasse);
        
        popupHTML += '<div onclick="selezionaCorticaleImport(' + index + ', \'' + c.val + '\')" ' +
            'style="cursor:pointer; padding:15px; border-radius:12px; background:#f8f9fa; border:2px solid #dee2e6; ' +
            'transition:all 0.2s; min-width:90px; ' + selected + '" ' +
            'onmouseover="this.style.background=\'#e3f2fd\';" ' +
            'onmouseout="this.style.background=\'#f8f9fa\';">' +
            '<div style="width:50px; height:50px; border-radius:50%; background:' + bgColor + '; ' +
            'border:' + c.spessore + 'px solid ' + c.color + '; margin:0 auto 8px; box-shadow:0 2px 6px rgba(0,0,0,0.2);"></div>' +
            '<div style="font-weight:bold; font-size:18px; color:' + c.color + ';">' + c.label + '</div>' +
            '<div style="font-size:11px; color:#666;">' + c.desc + '</div>' +
            (classificazione ? '<div style="font-size:12px; color:#1565c0; font-weight:bold; margin-top:5px;">→ ' + classificazione + '</div>' : '') +
        '</div>';
    }
    
    popupHTML += '</div>';
    
    // Pulsante per rimuovere selezione
    popupHTML += '<button onclick="selezionaCorticaleImport(' + index + ', \'\')" ' +
        'style="background:#f44336; color:white; border:none; padding:8px 20px; border-radius:6px; cursor:pointer; font-size:13px;">' +
        '✕ Rimuovi selezione</button>';
    
    popupHTML += '</div>';
    
    showCustomAlert(popupHTML, '🦴 Spessore Corticale');
}

// Gestisce la selezione della corticale
function selezionaCorticaleImport(index, corticale) {
    closeCustomAlert();
    
    if (importedImplantsData[index]) {
        importedImplantsData[index].corticale = corticale;
        
        // Aggiorna il badge della corticale
        var corticaleCell = document.getElementById('corticale-cell-' + index);
        if (corticaleCell) {
            corticaleCell.innerHTML = renderCorticaleBadge(corticale, importedImplantsData[index].classe);
        }
    }
}

// =============================================
// ORDINAMENTO DENTI SECONDO ODONTOGRAMMA
// =============================================
// Ordine visivo: 18→11, poi 21→28 (superiore) / 48→41, poi 31→38 (inferiore)
var ORDINE_ODONTOGRAMMA = [
    18, 17, 16, 15, 14, 13, 12, 11, 21, 22, 23, 24, 25, 26, 27, 28,  // Superiore
    48, 47, 46, 45, 44, 43, 42, 41, 31, 32, 33, 34, 35, 36, 37, 38   // Inferiore
];

function ordinaDentiOdontogramma(denti) {
    // Ordina un array di numeri dente secondo l'ordine dell'odontogramma
    return denti.slice().sort(function(a, b) {
        var idxA = ORDINE_ODONTOGRAMMA.indexOf(a);
        var idxB = ORDINE_ODONTOGRAMMA.indexOf(b);
        // Se non trovato, metti alla fine
        if (idxA === -1) idxA = 999;
        if (idxB === -1) idxB = 999;
        return idxA - idxB;
    });
}

function ordinaDentiOdontogrammaOggetti(dentiObj, chiaveDente) {
    // Ordina un array di oggetti che hanno una proprietà dente
    chiaveDente = chiaveDente || 'dente';
    return dentiObj.slice().sort(function(a, b) {
        var idxA = ORDINE_ODONTOGRAMMA.indexOf(a[chiaveDente]);
        var idxB = ORDINE_ODONTOGRAMMA.indexOf(b[chiaveDente]);
        if (idxA === -1) idxA = 999;
        if (idxB === -1) idxB = 999;
        return idxA - idxB;
    });
}

function toggleDisclaimerBtn() {
    var chk = document.getElementById('accept-check');
    var btn = document.getElementById('disclaimer-btn');
    if (chk && btn) {
        btn.disabled = !chk.checked;
        if (chk.checked) {
            btn.style.opacity = '1';
            btn.style.cursor = 'pointer';
        } else {
            btn.style.opacity = '0.5';
            btn.style.cursor = 'not-allowed';
        }
    }
}

function acceptDisclaimer() {
    var chk = document.getElementById('accept-check');
    if (!chk || !chk.checked) return;
    var overlay = document.getElementById('disclaimer-overlay');
    if (overlay) {
        overlay.style.display = 'none';
    }
}

function checkPassword() {
    var passwordInput = document.getElementById('password-input').value;
    if (passwordInput === "Martina07") {
        document.getElementById('password-overlay').style.display = 'none';
        document.getElementById('disclaimer-overlay').style.display = 'flex';
    } else {
        showCustomAlert('Password errata. Riprova.');
        document.getElementById('password-input').value = "";
    }
}

// =============================================
// IMPORTAZIONE REPORT REALGUIDE
// =============================================

var importedImplantsData = [];
var rawPdfText = "";

function apriImportReport() {
    document.getElementById('import-overlay').style.display = 'flex';
    document.getElementById('import-step1').style.display = 'block';
    document.getElementById('import-step2').style.display = 'none';
    document.getElementById('import-ocr-raw').style.display = 'none';
    document.getElementById('import-loading').style.display = 'none';
}

function chiudiImportOverlay() {
    document.getElementById('import-overlay').style.display = 'none';
    importedImplantsData = [];
    rawPdfText = "";
}

async function processaPDFReport(event) {
    var file = event.target.files[0];
    if (!file) return;
    
    document.getElementById('import-loading').style.display = 'block';
    updateLoadingStatus("Caricamento PDF...");
    
    try {
        var arrayBuffer = await file.arrayBuffer();
        var pdf = await pdfjsLib.getDocument({data: arrayBuffer}).promise;
        
        var fullText = "";
        var pagineConDensita = []; // Traccia pagine che hanno il grafico HU
        var tuttoImmagini = false;
        
        // STEP 1: Prova estrazione testo NATIVA
        var totalChars = 0;
        for (var i = 1; i <= pdf.numPages; i++) {
            updateLoadingStatus("Estrazione testo pagina " + i + " di " + pdf.numPages + "...");
            var page = await pdf.getPage(i);
            var textContent = await page.getTextContent();
            
            var items = textContent.items;
            var pageText = "";
            
            if (items.length > 0) {
                var sortedItems = items.slice().sort(function(a, b) {
                    var yA = -a.transform[5];
                    var yB = -b.transform[5];
                    if (Math.abs(yA - yB) < 5) return a.transform[4] - b.transform[4];
                    return yA - yB;
                });
                
                var lastY = null;
                var lastX = 0;
                
                for (var j = 0; j < sortedItems.length; j++) {
                    var item = sortedItems[j];
                    var currentY = -item.transform[5];
                    var currentX = item.transform[4];
                    var text = item.str;
                    
                    if (lastY !== null && Math.abs(currentY - lastY) > 5) {
                        pageText += "\n";
                        lastX = 0;
                    } else if (lastX > 0 && currentX - lastX > 10) {
                        pageText += " ";
                    }
                    
                    pageText += text;
                    lastY = currentY;
                    lastX = currentX + (item.width || text.length * 5);
                }
            }
            
            totalChars += pageText.length;
            fullText += "\n--- PAGINA " + i + " ---\n" + pageText;
        }
        
        // Verifica se è tutto immagini
        tuttoImmagini = (totalChars < 100);
        console.log("Caratteri totali estratti nativamente:", totalChars, "- Tutto immagini:", tuttoImmagini);
        
        if (tuttoImmagini) {
            // PDF tutto immagini: OCR completo
            updateLoadingStatus("PDF contiene immagini. Avvio OCR completo...");
            fullText = await estraiTestoConOCR(pdf);
        }
        
        // STEP 2: Identifica pagine con grafico densità DAL TESTO (nativo o OCR)
        var pagine = fullText.split(/---\s*PAGINA\s*(\d+)\s*---/);
        for (var p = 1; p < pagine.length; p += 2) {
            var numPagina = parseInt(pagine[p]);
            var testoPagina = pagine[p + 1] || "";
            if (/[Dd]ensit[àa].*osso.*volume/i.test(testoPagina) || 
                /volume.*dell.*impianto/i.test(testoPagina)) {
                pagineConDensita.push(numPagina);
            }
        }
        
        console.log("Pagine con grafico densità rilevate:", pagineConDensita);
        
        // STEP 3: OCR MIRATO per HU sulle pagine con grafico (solo se necessario)
        if (pagineConDensita.length > 0) {
            updateLoadingStatus("Estrazione valori HU con OCR mirato...");
            var huValues = await estraiHUConOCRMirato(pdf, pagineConDensita);
            
            // Aggiungi i valori HU al testo delle rispettive pagine
            for (var pageNum in huValues) {
                var hu = huValues[pageNum];
                if (hu) {
                    var marker = "--- PAGINA " + pageNum + " ---";
                    var idx = fullText.indexOf(marker);
                    if (idx !== -1) {
                        var insertPos = fullText.indexOf("\n", idx + marker.length);
                        if (insertPos !== -1) {
                            fullText = fullText.slice(0, insertPos) + 
                                       "\nHU_VALUE_EXTRACTED: " + hu + 
                                       fullText.slice(insertPos);
                        }
                    }
                }
            }
            console.log("Valori HU estratti:", huValues);
        }
        
        rawPdfText = fullText;
        console.log("Testo finale:", fullText);
        
        var datiEstratti = estraiDatiDaReport(fullText);
        mostraGrigliaAnteprima(datiEstratti);
        
    } catch (error) {
        console.error("Errore lettura PDF:", error);
        showCustomAlert("Errore nella lettura del PDF: " + (error.message || error));
    }
    
    document.getElementById('import-loading').style.display = 'none';
    event.target.value = '';
}

// OCR MIRATO: estrae i valori HU con strategia ottimizzata e worker persistente
// Ottimizzato per velocità mantenendo precisione
var tesseractWorker = null; // Worker persistente per velocità

async function initTesseractWorker() {
    if (tesseractWorker) return tesseractWorker;
    
    if (typeof Tesseract === 'undefined') {
        updateLoadingStatus("Caricamento OCR...");
        await loadScript('https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js');
    }
    
    updateLoadingStatus("Inizializzazione motore OCR...");
    tesseractWorker = await Tesseract.createWorker('eng', 1, {
        logger: function(m) {}
    });
    await tesseractWorker.setParameters({
        tessedit_char_whitelist: '0123456789'
    });
    return tesseractWorker;
}

async function estraiHUConOCRMirato(pdf, pagineConDensita) {
    var risultati = {};
    
    // Inizializza worker una volta sola (grande speedup)
    var worker = await initTesseractWorker();
    
    // Strategie complete per massima precisione (ma 1 solo PSM ciascuna)
    var strategies = [
        { name: 'std_loose', x: 0.27, y: 0.55, w: 0.10, h: 0.05, rMin: 150, gMax: 999, bMax: 999, ratio: 1.3, type: 'ratio' },
        { name: 'std_strict', x: 0.27, y: 0.55, w: 0.10, h: 0.05, rMin: 180, gMax: 150, bMax: 150, diff: 50, type: 'diff' },
        { name: 'center_strict', x: 0.28, y: 0.54, w: 0.12, h: 0.06, rMin: 180, gMax: 150, bMax: 150, diff: 50, type: 'diff' },
        { name: 'special_2xx', x: 0.295, y: 0.545, w: 0.075, h: 0.035, rMin: 150, gMax: 120, bMax: 120, diff: 30, type: 'diff' },
        { name: 'wide_strict', x: 0.24, y: 0.52, w: 0.18, h: 0.10, rMin: 180, gMax: 150, bMax: 150, diff: 50, type: 'diff' },
    ];
    
    for (var idx = 0; idx < pagineConDensita.length; idx++) {
        var pageNum = pagineConDensita[idx];
        updateLoadingStatus("Estrazione HU pagina " + pageNum + " (" + (idx + 1) + "/" + pagineConDensita.length + ")...");
        
        var page = await pdf.getPage(pageNum);
        var scale = 5.0; // Scala originale per precisione
        var viewport = page.getViewport({scale: scale});
        
        var canvas = document.createElement('canvas');
        var context = canvas.getContext('2d');
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        
        await page.render({canvasContext: context, viewport: viewport}).promise;
        
        var huTrovato = null;
        
        // Prova ogni strategia fino a trovare un valore valido
        for (var sIdx = 0; sIdx < strategies.length && !huTrovato; sIdx++) {
            var strat = strategies[sIdx];
            
            var cropX = Math.floor(viewport.width * strat.x);
            var cropY = Math.floor(viewport.height * strat.y);
            var cropW = Math.floor(viewport.width * strat.w);
            var cropH = Math.floor(viewport.height * strat.h);
            
            var croppedCanvas = document.createElement('canvas');
            croppedCanvas.width = cropW;
            croppedCanvas.height = cropH;
            var croppedCtx = croppedCanvas.getContext('2d');
            croppedCtx.drawImage(canvas, cropX, cropY, cropW, cropH, 0, 0, cropW, cropH);
            
            // Applica filtro colore
            try {
                var imgData = croppedCtx.getImageData(0, 0, cropW, cropH);
                var data = imgData.data;
                
                for (var px = 0; px < data.length; px += 4) {
                    var r = data[px];
                    var g = data[px + 1];
                    var b = data[px + 2];
                    
                    var isText = false;
                    if (strat.type === 'ratio') {
                        isText = (r > strat.rMin && r > g * strat.ratio && r > b * strat.ratio);
                    } else {
                        isText = (r > strat.rMin && g < strat.gMax && b < strat.bMax && r > g + strat.diff);
                    }
                    
                    if (isText) {
                        data[px] = 0;
                        data[px + 1] = 0;
                        data[px + 2] = 0;
                    } else {
                        data[px] = 255;
                        data[px + 1] = 255;
                        data[px + 2] = 255;
                    }
                }
                croppedCtx.putImageData(imgData, 0, 0);
            } catch(e) {
                continue;
            }
            
            var imageData = croppedCanvas.toDataURL('image/png');
            
            // OCR con worker persistente (molto più veloce)
            try {
                var result = await worker.recognize(imageData);
                var ocrText = result.data.text.replace(/\s/g, '');
                
                // Cerca numeri a 3-4 cifre validi
                var numeri = ocrText.match(/(\d{3,4})/g);
                if (numeri) {
                    var esclusi = ['000', '100', '110', '111', '200', '210', '211', '212', '213', '214', 
                                   '307', '309', '350', '500', '568', '810', '850', '999', '1000'];
                    
                    for (var n = 0; n < numeri.length; n++) {
                        var numStr = numeri[n].substring(0, 3);
                        var val = parseInt(numStr);
                        if (val >= 200 && val <= 900 && esclusi.indexOf(numStr) === -1) {
                            huTrovato = numStr;
                            console.log("✓ HU pagina " + pageNum + ": " + huTrovato + " [" + strat.name + "]");
                            break;
                        }
                    }
                }
            } catch (ocrErr) {
                // Ignora errori OCR, prova prossima strategia
            }
        }
        
        if (huTrovato) {
            risultati[pageNum] = huTrovato;
        } else {
            console.log("✗ HU non trovato per pagina " + pageNum);
        }
    }
    
    return risultati;
}

// Funzione separata per OCR COMPLETO (fallback) - ottimizzata
var tesseractWorkerFull = null;

async function estraiTestoConOCR(pdf) {
    var fullText = "";
    
    // Carica Tesseract se non già caricato
    if (typeof Tesseract === 'undefined') {
        updateLoadingStatus("Caricamento motore OCR...");
        await loadScript('https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js');
    }
    
    // Crea worker persistente per OCR completo
    if (!tesseractWorkerFull) {
        updateLoadingStatus("Inizializzazione OCR completo...");
        tesseractWorkerFull = await Tesseract.createWorker('ita+eng', 1, {
            logger: function(m) {}
        });
    }
    
    for (var i = 1; i <= pdf.numPages; i++) {
        updateLoadingStatus("OCR pagina " + i + " di " + pdf.numPages + "...");
        
        var page = await pdf.getPage(i);
        var scale = 2.5; // Ridotta da 4.0 - buon compromesso velocità/qualità
        var viewport = page.getViewport({scale: scale});
        
        var canvas = document.createElement('canvas');
        var context = canvas.getContext('2d');
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        
        await page.render({canvasContext: context, viewport: viewport}).promise;
        
        // Pre-processing semplificato
        try {
            var imgData = context.getImageData(0, 0, canvas.width, canvas.height);
            var data = imgData.data;
            
            for (var px = 0; px < data.length; px += 4) {
                var r = data[px];
                var g = data[px + 1];
                var b = data[px + 2];
                var luminosita = 0.299 * r + 0.587 * g + 0.114 * b;
                
                // Binarizzazione semplice
                if (luminosita < 128) {
                    data[px] = 0;
                    data[px + 1] = 0;
                    data[px + 2] = 0;
                } else {
                    data[px] = 255;
                    data[px + 1] = 255;
                    data[px + 2] = 255;
                }
            }
            context.putImageData(imgData, 0, 0);
        } catch(e) {
            console.log("Pre-processing saltato:", e);
        }
        
        var imageData = canvas.toDataURL('image/png');
        
        var result = await tesseractWorkerFull.recognize(imageData);
        fullText += "\n--- PAGINA " + i + " ---\n" + result.data.text;
    }
    
    return fullText;
}

function updateLoadingStatus(msg) {
    var loadingDiv = document.getElementById('import-loading');
    var statusP = loadingDiv.querySelector('p');
    if (statusP) statusP.textContent = msg;
}

function loadScript(src) {
    return new Promise(function(resolve, reject) {
        var script = document.createElement('script');
        script.src = src;
        script.onload = resolve;
        script.onerror = function() { reject(new Error('Impossibile caricare ' + src)); };
        document.head.appendChild(script);
    });
}

function estraiDatiDaReport(testo) {
    var risultato = {
        paziente: "",
        caricoImmediato: false,
        impianti: []
    };
    
    // =========================================
    // STEP 0: PRE-PROCESSING DEL TESTO OCR
    // Normalizza errori comuni prima dell'estrazione
    // =========================================
    
    // Funzione per normalizzare il testo OCR
    function normalizzaTestoOCR(t) {
        return t
            // Normalizza spazi multipli
            .replace(/\s+/g, ' ')
            // Normalizza trattini
            .replace(/[–—−]/g, '-')
            // Normalizza x nelle dimensioni
            .replace(/[×xX]/g, 'x')
            // Correggi L/l confuso con 1 nei codici (es. [2103741] → [210374L])
            .replace(/\[(\d{6})1\]/g, '[$1L]')
            .replace(/\[(\d{6})l\]/g, '[$1L]');
    }
    
    var testoNorm = normalizzaTestoOCR(testo);
    
    // =========================================
    // STEP 1: ESTRAI NOME PAZIENTE (MIGLIORATO)
    // =========================================
    
    // Funzione helper per pulire il nome paziente
    function pulisciNomePaziente(nome) {
        if (!nome) return '';
        
        // Rimuovi parole chiave che non sono parte del nome (case insensitive)
        var paroleDaRimuovere = [
            'Informazioni', 'Information', 'Report', 'Data', 'Paziente', 'Patient',
            'Esame', 'Exam', 'Chirurgo', 'Surgeon', 'Nome', 'Name', 'nascita',
            'Schema', 'Impianti', 'Implant', 'Evolution', 'IDI', 'Note', 'gg', 'mm', 'aaaa'
        ];
        
        // Rimuovi le parole e tutto ciò che segue
        for (var i = 0; i < paroleDaRimuovere.length; i++) {
            var regex = new RegExp('\\s*' + paroleDaRimuovere[i] + '.*$', 'i');
            nome = nome.replace(regex, '');
        }
        
        // Rimuovi caratteri non alfabetici (tranne spazi)
        nome = nome.replace(/[^A-Za-zÀ-ú\s]/g, ' ');
        
        // Normalizza spazi multipli
        nome = nome.replace(/\s+/g, ' ').trim();
        
        return nome;
    }
    
    // Cerca il nome paziente con pattern specifici per il formato RealGuide
    // Il nome può essere su più righe: "Paziente: COGNOME\nNOME"
    
    // Pattern 1: "Nome: COGNOME NOME" o "Nome: COGNOME SECONDO_NOME NOME" (2-4 parole)
    var matchPaziente = testo.match(/Nome[:\s]+([A-Z][A-Za-zÀ-ú]+(?:\s+[A-Z][A-Za-zÀ-ú]+){1,3})/);
    if (matchPaziente) {
        risultato.paziente = matchPaziente[1];
    }
    
    // Pattern 2: Se non trovato, cerca "Paziente:" seguito da nome su una o due righe
    if (!risultato.paziente) {
        // Cerca "Paziente: COGNOME SECONDO" seguito da "NOME" sulla riga successiva
        var matchMultiriga = testo.match(/Paziente[:\s]+([A-Z][A-Za-zÀ-ú]+(?:\s+[A-Z][A-Za-zÀ-ú]+)?)\s*[\n\r]+\s*([A-Z][A-Za-zÀ-ú]+)/);
        if (matchMultiriga) {
            risultato.paziente = matchMultiriga[1] + ' ' + matchMultiriga[2];
        }
    }
    
    // Pattern 3: Fallback - cerca qualsiasi nome dopo "Paziente:" (2-4 parole)
    if (!risultato.paziente) {
        var matchSemplice = testo.match(/Paziente[:\s]+([A-Z][A-Za-zÀ-ú]+(?:\s+[A-Z][A-Za-zÀ-ú]+){1,3})/);
        if (matchSemplice) {
            risultato.paziente = pulisciNomePaziente(matchSemplice[1]);
        }
    }
    
    // Pulisci il risultato finale
    if (risultato.paziente) {
        risultato.paziente = pulisciNomePaziente(risultato.paziente);
    }
    
    // =========================================
    // STEP 2: MAPPA CODICI PRODOTTO -> DIMENSIONI
    // Catalogo completo B1ONE IDI Evolution
    // =========================================
    var codiciDimensioni = {
        // ============ Ø 2.7mm ============
        // HIGH (H) - B1 One High
        '210278': { diametro: '2.7', lunghezza: '8' },
        '210270': { diametro: '2.7', lunghezza: '10' },
        '210272': { diametro: '2.7', lunghezza: '12' },
        '210274': { diametro: '2.7', lunghezza: '14' },
        '210275': { diametro: '2.7', lunghezza: '15.5' },
        '210277': { diametro: '2.7', lunghezza: '17' },
        
        // ============ Ø 3.2mm ============
        // HIGH (H) - B1 One High
        '210328': { diametro: '3.2', lunghezza: '8' },
        '210320': { diametro: '3.2', lunghezza: '10' },
        '210322': { diametro: '3.2', lunghezza: '12' },
        '210324': { diametro: '3.2', lunghezza: '14' },
        '210325': { diametro: '3.2', lunghezza: '15.5' },
        '210327': { diametro: '3.2', lunghezza: '17' },
        
        // ============ Ø 3.7mm ============
        // MEDIUM (M)
        '210378': { diametro: '3.7', lunghezza: '8' },
        '210370': { diametro: '3.7', lunghezza: '10' },
        '210372': { diametro: '3.7', lunghezza: '12' },
        '210374': { diametro: '3.7', lunghezza: '14' },
        '210375': { diametro: '3.7', lunghezza: '15.5' },
        '210377': { diametro: '3.7', lunghezza: '17' },
        // LOW (L) - stessi codici base
        
        // ============ Ø 4.2mm ============
        // MEDIUM (M)
        '210428': { diametro: '4.2', lunghezza: '8' },
        '210420': { diametro: '4.2', lunghezza: '10' },
        '210422': { diametro: '4.2', lunghezza: '12' },
        '210424': { diametro: '4.2', lunghezza: '14' },
        '210425': { diametro: '4.2', lunghezza: '15.5' },
        '210427': { diametro: '4.2', lunghezza: '17' },
        // LOW (L) - ha anche 6mm
        '210426': { diametro: '4.2', lunghezza: '6' },
        
        // ============ Ø 4.8mm ============
        // MEDIUM e LOW
        '210486': { diametro: '4.8', lunghezza: '6' },
        '210488': { diametro: '4.8', lunghezza: '8' },
        '210480': { diametro: '4.8', lunghezza: '10' },
        '210482': { diametro: '4.8', lunghezza: '12' },
        '210484': { diametro: '4.8', lunghezza: '14' },
        
        // ============ Ø 5.5mm ============
        // MEDIUM e LOW
        '210556': { diametro: '5.5', lunghezza: '6' },
        '210558': { diametro: '5.5', lunghezza: '8' },
        '210550': { diametro: '5.5', lunghezza: '10' },
        '210552': { diametro: '5.5', lunghezza: '12' }
    };
    
    // Funzione per correggere codici con errori OCR comuni
    function correggiCodice(codice) {
        // Già corretto
        if (codiciDimensioni[codice]) return codice;
        
        // Prova a sostituire caratteri confusi
        var varianti = [
            codice,
            codice.replace(/O/g, '0'),  // O → 0
            codice.replace(/I/g, '1'),  // I → 1
            codice.replace(/l/g, '1'),  // l → 1
            codice.replace(/S/g, '5'),  // S → 5
            codice.replace(/B/g, '8'),  // B → 8
        ];
        
        for (var v = 0; v < varianti.length; v++) {
            if (codiciDimensioni[varianti[v]]) return varianti[v];
        }
        
        return codice; // Ritorna originale se nessuna correzione funziona
    }
    
    // Funzione per estrarre dente da testo con vari pattern - MIGLIORATA
    function estraiDenteDaPagina(pagina) {
        var dente = null;
        
        // Pattern 1: "Posizione XX" o "Numero impianto: XX" (più affidabile)
        var m1 = pagina.match(/(?:Posizione|Numero\s*impianto)[:\s]*(\d{2})/i);
        if (m1) {
            var d = parseInt(m1[1]);
            if (d >= 11 && d <= 48) return d;
        }
        
        // Pattern 2: "XX IDI Evolution" (molto affidabile)
        var m2 = pagina.match(/\b(\d{2})\s+IDI\s*Evolution/i);
        if (m2) {
            var d = parseInt(m2[1]);
            if (d >= 11 && d <= 48) return d;
        }
        
        // Pattern 3: Numero dente a inizio riga seguito da IDI
        var m3 = pagina.match(/^[\s\n]*(\d{2})\s+IDI/im);
        if (m3) {
            var d = parseInt(m3[1]);
            if (d >= 11 && d <= 48) return d;
        }
        
        // Pattern 4: "X X Data" con spazio (OCR errato, es "3 5 Data")
        var m4 = pagina.match(/(\d)\s+(\d)\s+Data/i);
        if (m4) {
            var d = parseInt(m4[1] + m4[2]);
            if (d >= 11 && d <= 48) return d;
        }
        
        // Pattern 5: "X. X Data" con punto (OCR errato, es "4. 5 Data")
        var m5 = pagina.match(/(\d)[\.\,]\s*(\d)\s+Data/i);
        if (m5) {
            var d = parseInt(m5[1] + m5[2]);
            if (d >= 11 && d <= 48) return d;
        }
        
        // Pattern 6: "' X X Data" con caratteri strani prima (OCR errato)
        var m6 = pagina.match(/['\"\?\*\s]+(\d)\s*(\d)\s+Data/i);
        if (m6) {
            var d = parseInt(m6[1] + m6[2]);
            if (d >= 11 && d <= 48) return d;
        }
        
        // Pattern 7: Numero a inizio pagina formato "XX Data" o "XX Paziente"
        var m7 = pagina.match(/^\s*(\d{2})\s+(?:Data|Paziente)/im);
        if (m7) {
            var d = parseInt(m7[1]);
            if (d >= 11 && d <= 48) return d;
        }
        
        // Pattern 8: "Numero impianto:" seguito da numero su stessa o prossima riga
        var m8 = pagina.match(/Numero\s*impianto[:\s]*[\n\s]*(\d{2})/i);
        if (m8) {
            var d = parseInt(m8[1]);
            if (d >= 11 && d <= 48) return d;
        }
        
        return null;
    }
    
    // Funzione per estrarre codice prodotto con gestione errori
    function estraiCodiceDaPagina(pagina) {
        // Pattern 1: Codice standard [XXXXXXY] dove Y è H/M/L
        var m1 = pagina.match(/\[(\d{6})[HML1Il]?\]/i);
        if (m1) return correggiCodice(m1[1]);
        
        // Pattern 2: Codice con spazio [XX XXXXY]
        var m2 = pagina.match(/\[(\d{2})\s*(\d{4})[HML1Il]?\]/i);
        if (m2) return correggiCodice(m2[1] + m2[2]);
        
        // Pattern 3: Codice con spazi multipli [X X X X X XY]
        var m3 = pagina.match(/\[(\d)\s*(\d)\s*(\d)\s*(\d)\s*(\d)\s*(\d)[HML1Il]?\]/i);
        if (m3) return correggiCodice(m3[1] + m3[2] + m3[3] + m3[4] + m3[5] + m3[6]);
        
        return null;
    }
    
    // Funzione per estrarre tipo (Low/Medium/High) - MIGLIORATA per OCR
    function estraiTipoDaPagina(pagina) {
        // Pattern 1: Standard "B1 One - Medium" (con varianti OCR)
        var m1 = pagina.match(/B[1Il:\.]+\s*One\s*[-–—]?\s*(High|Medium|Low)/i);
        if (m1) return m1[1];
        
        // Pattern 2: Solo "Medium" o "Low" o "High" dopo "One"
        var m2 = pagina.match(/One\s*[-–—]?\s*(High|Medium|Low)/i);
        if (m2) return m2[1];
        
        // Pattern 3: Cerca tipo vicino al codice prodotto [XXXXXXM] = Medium, [XXXXXXL] = Low
        var m3 = pagina.match(/\[\d{6}([HMLhml])\]/);
        if (m3) {
            var suffix = m3[1].toUpperCase();
            if (suffix === 'M') return 'Medium';
            if (suffix === 'L') return 'Low';
            if (suffix === 'H') return 'High';
        }
        
        // Pattern 4: Cerca solo le parole Medium/Low/High nel contesto impianti
        if (/Medium/i.test(pagina)) return 'Medium';
        if (/Low/i.test(pagina)) return 'Low';
        if (/High/i.test(pagina)) return 'High';
        
        return null;
    }
    
    // Funzione per estrarre HU - MIGLIORATA v4 con supporto OCR mirato
    function estraiHUDaPagina(pagina) {
        // PRIORITÀ 1: Valore HU estratto con OCR mirato (tag inserito da estraiHUConOCRMirato)
        var matchOCR = pagina.match(/HU_VALUE_EXTRACTED:\s*(\d{3,4})/);
        if (matchOCR) {
            return matchOCR[1];
        }
        
        // Scale fisse del grafico da escludere (valori esatti sulla scala)
        var scaleFisse = ['1000', '1250', '3071', '3072', '350', '850', '307'];
        
        // Altri numeri da escludere (dimensioni, codici, contatori, valori spurii OCR)
        var altriEsclusi = ['286', '568', '500', '100', '110', '200', '150', '180', '240', '189', '396', '185'];
        
        // Rimuovi codici prodotto per non confondere
        var paginaPulita = pagina.replace(/\[\d{5,7}[HML1Il]?\]/gi, '');
        // Rimuovi dimensioni impianto (es. "4.2 x 10 mm", "10.00 mm")
        paginaPulita = paginaPulita.replace(/\d+[\.,]\d+\s*[xX×]?\s*\d*\s*mm/gi, '');
        // Rimuovi numeri pagina
        paginaPulita = paginaPulita.replace(/agina\s*\d+/gi, '');
        // Rimuovi timestamp e codici
        paginaPulita = paginaPulita.replace(/\[\d+\]/g, '');
        
        // Pattern 1: Cerca numero a 3-4 cifre DOPO "D4" (tipica posizione del valore HU nel grafico)
        // Il valore HU appare sotto il grafico, spesso dopo le classi D4 D3 D2 D1
        var matchDopoD4 = paginaPulita.match(/D4[\s\S]{0,50}?D[1-3][\s\S]{0,50}?(\d{3,4})/);
        if (matchDopoD4) {
            var val = matchDopoD4[1];
            var valNum = parseInt(val);
            if (scaleFisse.indexOf(val) === -1 && altriEsclusi.indexOf(val) === -1 && valNum >= 150 && valNum <= 1500) {
                return val;
            }
        }
        
        // Pattern 2: Cerca numero isolato a 3-4 cifre nella zona del grafico densità
        var matchDensita = paginaPulita.match(/[Dd]ensit[àa][\s\S]{0,200}?[D][1-4][\s\S]{0,100}?(\d{3,4})/);
        if (matchDensita) {
            var val = matchDensita[1];
            var valNum = parseInt(val);
            if (scaleFisse.indexOf(val) === -1 && altriEsclusi.indexOf(val) === -1 && valNum >= 150 && valNum <= 1500) {
                return val;
            }
        }
        
        // Pattern 3: Cerca nella zona dopo "volume dell'impianto"
        var zonaHU = paginaPulita.match(/volume[\s\S]{0,300}/i);
        if (zonaHU) {
            // Cerca numeri a 3-4 cifre nella zona
            var numeriZona = zonaHU[0].match(/\b(\d{3,4})\b/g);
            if (numeriZona) {
                for (var i = 0; i < numeriZona.length; i++) {
                    var val = numeriZona[i];
                    var valNum = parseInt(val);
                    // Range HU plausibile e non scale fisse
                    if (scaleFisse.indexOf(val) === -1 && altriEsclusi.indexOf(val) === -1 && valNum >= 150 && valNum <= 1500) {
                        return val;
                    }
                }
            }
        }
        
        // Pattern 4: Cerca numero a 3-4 cifre vicino a indicatore di classe
        var matchClassi = paginaPulita.match(/(\d{3,4})\s*[^\d]{0,20}?[D][1-4]/);
        if (matchClassi) {
            var val = matchClassi[1];
            var valNum = parseInt(val);
            if (scaleFisse.indexOf(val) === -1 && altriEsclusi.indexOf(val) === -1 && valNum >= 150 && valNum <= 1500) {
                return val;
            }
        }
        
        // Pattern 5: Fallback - cerca nella parte finale della pagina (dove appare il grafico)
        var ultimaParte = paginaPulita.substring(Math.max(0, paginaPulita.length - 500));
        var numeriFinali = ultimaParte.match(/\b(\d{3,4})\b/g);
        if (numeriFinali) {
            for (var i = 0; i < numeriFinali.length; i++) {
                var val = numeriFinali[i];
                var valNum = parseInt(val);
                if (scaleFisse.indexOf(val) === -1 && altriEsclusi.indexOf(val) === -1 && valNum >= 150 && valNum <= 1500) {
                    return val;
                }
            }
        }
        
        return null;
    }
    
    // Funzione per estrarre dimensioni dal testo (fallback) - MIGLIORATA per OCR
    function estraiDimensioniDaTesto(pagina) {
        // Pattern 1: Formato standard "X.X x XX mm"
        var m1 = pagina.match(/(\d[\.,]\d)\s*[xX×]\s*(\d{1,2}(?:[\.,]\d)?)\s*mm/i);
        if (m1) {
            var diam = m1[1].replace(',', '.');
            var lung = m1[2].replace(',', '.');
            if (['2.7', '3.2', '3.7', '4.2', '4.8', '5.5'].indexOf(diam) !== -1) {
                if (['6', '8', '10', '12', '14', '15.5', '17'].indexOf(lung) !== -1) {
                    return { diametro: diam, lunghezza: lung };
                }
            }
        }
        
        // Pattern 2: OCR senza punto "27x12", "42x12" o "48x10" → interpreta come 2.7x12, 4.2x12 o 4.8x10
        var m2 = pagina.match(/\b([2345][278])\s*[xX×]\s*(\d{1,2})\s*mm/i);
        if (m2) {
            var diamRaw = m2[1];
            var lung = m2[2];
            // Converte: 27→2.7, 32→3.2, 37→3.7, 42→4.2, 48→4.8, 55→5.5
            var diam = diamRaw.charAt(0) + '.' + diamRaw.charAt(1);
            if (['2.7', '3.2', '3.7', '4.2', '4.8', '5.5'].indexOf(diam) !== -1) {
                if (['6', '8', '10', '12', '14', '15', '17'].indexOf(lung) !== -1) {
                    if (lung === '15') lung = '15.5';
                    return { diametro: diam, lunghezza: lung };
                }
            }
        }
        
        // Pattern 3: OCR con errori spazi/caratteri "4 12 Xi 2" o "412 Xi 2" → 4.2 x 12
        var m3 = pagina.match(/\b([2345])[\s\.]*([278])\s*[xXiI×]+\s*(\d{1,2})\s*mm/i);
        if (m3) {
            var diam = m3[1] + '.' + m3[2];
            var lung = m3[3];
            if (['2.7', '3.2', '3.7', '4.2', '4.8', '5.5'].indexOf(diam) !== -1) {
                if (['6', '8', '10', '12', '14', '15', '17'].indexOf(lung) !== -1) {
                    if (lung === '15') lung = '15.5';
                    return { diametro: diam, lunghezza: lung };
                }
            }
        }
        
        // Pattern 4: Solo numeri separati vicino a "mm" - es. "4.8 Xx 10 MM"
        var m4 = pagina.match(/(\d[\.,]?\d?)\s*[xXiI×]+\s*(\d{1,2})\s*[mM]{2}/);
        if (m4) {
            var diamRaw = m4[1].replace(',', '.');
            var lung = m4[2];
            // Se manca il punto, aggiungilo
            if (diamRaw.length === 2 && diamRaw.indexOf('.') === -1) {
                diamRaw = diamRaw.charAt(0) + '.' + diamRaw.charAt(1);
            }
            if (['2.7', '3.2', '3.7', '4.2', '4.8', '5.5'].indexOf(diamRaw) !== -1) {
                if (['6', '8', '10', '12', '14', '15', '17'].indexOf(lung) !== -1) {
                    if (lung === '15') lung = '15.5';
                    return { diametro: diamRaw, lunghezza: lung };
                }
            }
        }
        
        return null;
    }
    
    // =========================================
    // STEP 2.5: ESTRAZIONE DA TABELLA RIEPILOGATIVA (PRIORITARIA)
    // La pagina con "Schema progetto: Impianti" o la tabella "Posizione/Produttore"
    // contiene la lista completa degli impianti in formato più strutturato
    // =========================================
    
    function estraiDaTabellaRiepilogativa(testoCompleto) {
        var impiantiTabella = [];
        
        // Trova tutti i codici prodotto nel testo [XXXXXXM] o [XXXXXXL] o [XXXXXXH]
        // Il codice è la fonte PIÙ AFFIDABILE perché difficile da corrompere
        var regexCodici = /\[(\d{6})([HMLhml1Il])\]/g;
        var matchCodici;
        var codiciTrovati = [];
        
        while ((matchCodici = regexCodici.exec(testoCompleto)) !== null) {
            var codice = matchCodici[1];
            var suffisso = matchCodici[2].toUpperCase();
            // Correggi suffisso OCR: 1/I/l → L
            if (suffisso === '1' || suffisso === 'I') suffisso = 'L';
            
            // Correggi il codice se necessario
            codice = correggiCodice(codice);
            
            if (codiciDimensioni[codice]) {
                codiciTrovati.push({
                    codice: codice,
                    suffisso: suffisso,
                    dimensioni: codiciDimensioni[codice],
                    posizione: matchCodici.index,
                    tipo: suffisso === 'M' ? 'Medium' : (suffisso === 'L' ? 'Low' : 'High')
                });
            }
        }
        
        // Funzione helper per verificare se un numero è un dente valido nel contesto
        function isDenteValido(num, contesto, posizione) {
            // Verifica range dente (11-18, 21-28, 31-38, 41-48)
            var decina = Math.floor(num / 10);
            var unita = num % 10;
            if (decina < 1 || decina > 4 || unita < 1 || unita > 8) return false;
            
            // Trova la posizione del numero nel contesto per verificare cosa c'è dopo
            var numStr = num.toString();
            var idx = contesto.indexOf(numStr);
            if (idx === -1) return true; // Non trovato, assume valido
            
            // Controlla caratteri DOPO il numero
            var dopoNum = contesto.substring(idx + numStr.length, idx + numStr.length + 10);
            
            // ESCLUDI se seguito da decimale (.00, .0, ,00) = è una misura, non un dente
            if (/^[\.,]\d/.test(dopoNum)) return false;
            
            // ESCLUDI se seguito da unità di misura (mm, MM, cm)
            if (/^\s*[mMcC][mM]/.test(dopoNum)) return false;
            
            // ESCLUDI se seguito da "x" + numero (è una dimensione, es. 42x8 = 4.2 x 8)
            if (/^[xX×]\s*\d/.test(dopoNum)) return false;
            
            // ESCLUDI se seguito da spazio + "x" + numero
            if (/^\s+[xX×]\s*\d/.test(dopoNum)) return false;
            
            return true;
        }
        
        // Per ogni codice trovato, cerca il numero del dente nelle vicinanze
        for (var c = 0; c < codiciTrovati.length; c++) {
            var info = codiciTrovati[c];
            var posIdx = info.posizione;
            
            // Cerca il numero del dente nei 200 caratteri PRIMA del codice
            var contestoPrima = testoCompleto.substring(Math.max(0, posIdx - 200), posIdx);
            var dente = null;
            
            // PULIZIA: Rimuovi le dimensioni dal testo prima di cercare i denti
            // Pattern: numeri seguiti da x/X e altri numeri (es. "42x8", "4.2 x 10", "42 x8mm")
            var contestoPulito = contestoPrima
                .replace(/\b\d{1,2}\s*[xX×]\s*\d{1,2}\s*mm/gi, ' ')  // "42x8mm", "4.2 x 10 mm"
                .replace(/\b\d{1,2}\s+[xX×]\s*\d{1,2}/g, ' ')         // "42 x8", "42 x 14"
                .replace(/\.\s*\d{1,2}\s+[xX×]/g, ' ')                 // ". 42 x"
                .replace(/\d[\.,]\d\s*[xX×]/g, ' ');                   // "4.2x", "4,2 x"
            
            // Cerca tutti i possibili denti (normali e da errori OCR) con le loro posizioni
            var candidatiDente = [];
            
            // Pattern 1: Numeri dente normali (11-48) con posizione
            var regexDente = /\b([1-4][1-8])\b/g;
            var matchDente;
            while ((matchDente = regexDente.exec(contestoPulito)) !== null) {
                var num = parseInt(matchDente[1]);
                if (isDenteValido(num, contestoPulito.substring(matchDente.index), 0)) {
                    candidatiDente.push({ dente: num, pos: matchDente.index });
                }
            }
            
            // Pattern 2: Errori OCR (es. "2%" → "25") - cerca SOLO se seguito da IDI
            var regexOCR = /\b([1-4])([%&\/\?\$#@!])\s+IDI/gi;
            var matchOCR;
            while ((matchOCR = regexOCR.exec(contestoPulito)) !== null) {
                var primaC = matchOCR[1];
                var secondoC = matchOCR[2];
                var mappaCaratteri = {'%': '5', '&': '6', '/': '7', '?': '7', '$': '5', '#': '3', '@': '6', '!': '1'};
                if (mappaCaratteri[secondoC]) {
                    var denteOCR = parseInt(primaC + mappaCaratteri[secondoC]);
                    if (denteOCR >= 11 && denteOCR <= 48) {
                        candidatiDente.push({ dente: denteOCR, pos: matchOCR.index });
                    }
                }
            }
            
            // Prendi il dente con la posizione PIÙ ALTA (più vicino al codice)
            if (candidatiDente.length > 0) {
                candidatiDente.sort(function(a, b) { return b.pos - a.pos; });
                dente = candidatiDente[0].dente;
            }
            
            // Se non trovato prima, cerca dopo
            if (!dente) {
                var contestoDopo = testoCompleto.substring(posIdx, Math.min(testoCompleto.length, posIdx + 100));
                // Pulisci anche il contesto dopo
                var contestoDopoP = contestoDopo
                    .replace(/\b\d{1,2}\s*[xX×]\s*\d{1,2}\s*mm/gi, ' ')
                    .replace(/\b\d{1,2}\s+[xX×]\s*\d{1,2}/g, ' ')
                    .replace(/\.\s*\d{1,2}\s+[xX×]/g, ' ')
                    .replace(/\d[\.,]\d\s*[xX×]/g, ' ');
                var numeriDopo = contestoDopoP.match(/\b([1-4][1-8])\b/g);
                if (numeriDopo) {
                    for (var n = 0; n < numeriDopo.length; n++) {
                        var num = parseInt(numeriDopo[n]);
                        if (isDenteValido(num, contestoDopoP, n)) {
                            dente = num;
                            break;
                        }
                    }
                }
            }
            
            if (dente) {
                // Controlla se questo dente è già stato aggiunto
                var giaPresente = false;
                for (var e = 0; e < impiantiTabella.length; e++) {
                    if (impiantiTabella[e].dente === dente) {
                        giaPresente = true;
                        break;
                    }
                }
                
                if (!giaPresente) {
                    // Cerca "Link" nei 200 caratteri PRIMA e 150 DOPO il codice
                    var contestoPrimaLink = testoCompleto.substring(Math.max(0, posIdx - 200), posIdx);
                    var contestoDopoLink = testoCompleto.substring(posIdx, Math.min(testoCompleto.length, posIdx + 150));
                    var contestoCompleto = contestoPrimaLink + contestoDopoLink;
                    var hasLink = /\bLink\b/i.test(contestoCompleto);
                    
                    console.log("📋 Dente " + dente + " - Codice [" + info.codice + info.suffisso + "] - Contesto: " + contestoCompleto.replace(/\n/g, ' ').substring(0, 100) + "...");
                    console.log("   Link trovato: " + (hasLink ? "SÌ ✅" : "NO ❌"));
                    
                    impiantiTabella.push({
                        dente: dente,
                        tipo: info.tipo,
                        diametro: info.dimensioni.diametro,
                        lunghezza: info.dimensioni.lunghezza,
                        densitaHU: '',
                        caricoImmediato: false,
                        postEstrattivo: false,
                        hasLink: hasLink,
                        fonte: 'tabella_codice'
                    });
                    
                    if (hasLink) {
                        console.log("🔗 Link trovato per dente " + dente);
                    }
                }
            }
        }
        
        return impiantiTabella;
    }
    
    // Prova prima l'estrazione dalla tabella (più affidabile)
    var impiantiDaTabella = estraiDaTabellaRiepilogativa(testo);
    if (impiantiDaTabella.length > 0) {
        console.log("✅ Impianti estratti da tabella riepilogativa:", impiantiDaTabella);
        risultato.impianti = impiantiDaTabella;
    }
    
    // =========================================
    // STEP 3: ESTRAZIONE PRINCIPALE DALLE PAGINE
    // =========================================
    var pagine = testo.split(/---\s*PAGINA\s*\d+\s*---/);
    
    for (var p = 0; p < pagine.length; p++) {
        var pagina = pagine[p];
        
        // Salta pagine senza contenuto utile
        if (pagina.length < 100) continue;
        
        // Estrai dente
        var dente = estraiDenteDaPagina(pagina);
        if (!dente) continue;
        
        // Estrai tipo
        var tipo = estraiTipoDaPagina(pagina);
        if (!tipo) continue;
        
        // Estrai codice e dimensioni
        var codice = estraiCodiceDaPagina(pagina);
        var dimensioni = null;
        
        if (codice && codiciDimensioni[codice]) {
            dimensioni = codiciDimensioni[codice];
        } else {
            // Fallback: estrai dimensioni dal testo
            dimensioni = estraiDimensioniDaTesto(pagina);
        }
        
        // Estrai HU (solo da pagine di dettaglio)
        var hu = null;
        if (pagina.indexOf('Densit') !== -1) {
            hu = estraiHUDaPagina(pagina);
        }
        
        // Aggiungi o aggiorna impianto
        var impIndex = -1;
        for (var j = 0; j < risultato.impianti.length; j++) {
            if (risultato.impianti[j].dente === dente) {
                impIndex = j;
                break;
            }
        }
        
        if (impIndex >= 0) {
            // Impianto già esiste - aggiorna solo dati MANCANTI
            // Non sovrascrivere dati dalla tabella (più affidabili)
            var imp = risultato.impianti[impIndex];
            
            // Aggiorna dimensioni SOLO se mancanti
            if (dimensioni && (!imp.diametro || !imp.lunghezza)) {
                if (!imp.diametro) imp.diametro = dimensioni.diametro;
                if (!imp.lunghezza) imp.lunghezza = dimensioni.lunghezza;
            }
            // Aggiorna HU sempre (viene dalle pagine di dettaglio)
            if (hu && !imp.densitaHU) {
                imp.densitaHU = hu;
            }
            // Aggiorna tipo SOLO se mancante
            if (tipo && !imp.tipo) {
                imp.tipo = tipo;
            }
            // Cerca Link nella pagina se non già trovato
            if (!imp.hasLink) {
                var hasLinkInPage = /\bLink\b/i.test(pagina) && /Abutment/i.test(pagina);
                if (hasLinkInPage) {
                    imp.hasLink = true;
                    console.log("🔗 Link trovato per dente " + dente + " (da pagina singola)");
                }
            }
        } else {
            // Cerca Link nella pagina
            var hasLinkInPage = /\bLink\b/i.test(pagina) && /Abutment/i.test(pagina);
            
            // Aggiungi nuovo impianto
            risultato.impianti.push({
                dente: dente,
                tipo: tipo,
                diametro: dimensioni ? dimensioni.diametro : '',
                lunghezza: dimensioni ? dimensioni.lunghezza : '',
                densitaHU: hu || '',
                caricoImmediato: false,
                postEstrattivo: false,
                hasLink: hasLinkInPage
            });
            
            if (hasLinkInPage) {
                console.log("🔗 Link trovato per dente " + dente + " (da pagina singola - nuovo)");
            }
        }
    }
    
    // =========================================
    // STEP 4: SECONDO PASSAGGIO PER HU MANCANTI
    // =========================================
    for (var p = 0; p < pagine.length; p++) {
        var pagina = pagine[p];
        if (pagina.indexOf('Densit') === -1) continue;
        
        var dente = estraiDenteDaPagina(pagina);
        if (!dente) continue;
        
        var hu = estraiHUDaPagina(pagina);
        if (!hu) continue;
        
        // Trova l'impianto e aggiorna HU se mancante
        for (var j = 0; j < risultato.impianti.length; j++) {
            if (risultato.impianti[j].dente === dente && !risultato.impianti[j].densitaHU) {
                risultato.impianti[j].densitaHU = hu;
                break;
            }
        }
    }
    
    // =========================================
    // STEP 5: PULIZIA E VALORI DEFAULT
    // =========================================
    
    // Rimuovi duplicati (tieni quello con più dati)
    var impiantiUnici = {};
    for (var i = 0; i < risultato.impianti.length; i++) {
        var imp = risultato.impianti[i];
        var key = imp.dente;
        
        if (!impiantiUnici[key]) {
            impiantiUnici[key] = imp;
        } else {
            // Tieni quello con più dati
            var esistente = impiantiUnici[key];
            if (imp.diametro && !esistente.diametro) esistente.diametro = imp.diametro;
            if (imp.lunghezza && !esistente.lunghezza) esistente.lunghezza = imp.lunghezza;
            if (imp.densitaHU && !esistente.densitaHU) esistente.densitaHU = imp.densitaHU;
        }
    }
    
    risultato.impianti = [];
    for (var key in impiantiUnici) {
        risultato.impianti.push(impiantiUnici[key]);
    }
    
    // Rimuovi impianti senza dati essenziali
    risultato.impianti = risultato.impianti.filter(function(imp) {
        return imp.dente && imp.tipo;
    });
    
    // Imposta valori di default se mancanti
    for (var d = 0; d < risultato.impianti.length; d++) {
        if (!risultato.impianti[d].diametro) risultato.impianti[d].diametro = "4.2";
        if (!risultato.impianti[d].lunghezza) risultato.impianti[d].lunghezza = "12";
    }
    
    // Ordina per numero dente
    risultato.impianti.sort(function(a, b) { return a.dente - b.dente; });
    
    console.log("Dati estratti (pattern migliorati):", risultato);
    return risultato;
}

function mostraGrigliaAnteprima(dati) {
    document.getElementById('import-step1').style.display = 'none';
    document.getElementById('import-step2').style.display = 'block';
    document.getElementById('import-paziente').value = dati.paziente;
    
    var tbody = document.getElementById('import-tbody');
    tbody.innerHTML = '';
    importedImplantsData = dati.impianti;
    
    for (var i = 0; i < dati.impianti.length; i++) {
        aggiungiRigaTabella(dati.impianti[i], i);
    }
    
    if (dati.impianti.length === 0) {
        tbody.innerHTML = '<tr><td colspan="9" style="text-align:center; color:#999; padding:20px;">Nessun impianto trovato. Usa "Aggiungi Impianto" per inserire manualmente.</td></tr>';
    }
}

function aggiungiRigaTabella(imp, index) {
    var tbody = document.getElementById('import-tbody');
    var tr = document.createElement('tr');
    tr.id = 'import-row-' + index;
    
    // Calcola la classe dall'HU se non già presente
    if (!imp.classe && imp.densitaHU) {
        imp.classe = huToClasse(imp.densitaHU);
    }
    
    tr.innerHTML = 
        '<td><input type="number" value="' + (imp.dente || '') + '" min="11" max="48" onchange="aggiornaImportData(' + index + ', \'dente\', this.value)"></td>' +
        '<td><select onchange="aggiornaImportData(' + index + ', \'tipo\', this.value)">' +
            '<option value="High"' + (imp.tipo === 'High' ? ' selected' : '') + '>High</option>' +
            '<option value="Medium"' + (imp.tipo === 'Medium' ? ' selected' : '') + '>Medium</option>' +
            '<option value="Low"' + (imp.tipo === 'Low' ? ' selected' : '') + '>Low</option>' +
        '</select></td>' +
        '<td><select onchange="aggiornaImportData(' + index + ', \'diametro\', this.value)">' +
            '<option value="2.7"' + (imp.diametro === '2.7' ? ' selected' : '') + '>2.7</option>' +
            '<option value="3.2"' + (imp.diametro === '3.2' ? ' selected' : '') + '>3.2</option>' +
            '<option value="3.7"' + (imp.diametro === '3.7' ? ' selected' : '') + '>3.7</option>' +
            '<option value="4.2"' + (imp.diametro === '4.2' ? ' selected' : '') + '>4.2</option>' +
            '<option value="4.8"' + (imp.diametro === '4.8' ? ' selected' : '') + '>4.8</option>' +
            '<option value="5.5"' + (imp.diametro === '5.5' ? ' selected' : '') + '>5.5</option>' +
        '</select></td>' +
        '<td><select onchange="aggiornaImportData(' + index + ', \'lunghezza\', this.value)">' +
            '<option value="6"' + (imp.lunghezza === '6' ? ' selected' : '') + '>6</option>' +
            '<option value="8"' + (imp.lunghezza === '8' ? ' selected' : '') + '>8</option>' +
            '<option value="10"' + (imp.lunghezza === '10' ? ' selected' : '') + '>10</option>' +
            '<option value="12"' + (imp.lunghezza === '12' ? ' selected' : '') + '>12</option>' +
            '<option value="14"' + (imp.lunghezza === '14' ? ' selected' : '') + '>14</option>' +
            '<option value="15.5"' + (imp.lunghezza === '15.5' ? ' selected' : '') + '>15.5</option>' +
            '<option value="17"' + (imp.lunghezza === '17' ? ' selected' : '') + '>17</option>' +
        '</select></td>' +
        '<td id="classe-cell-' + index + '" style="text-align:center; cursor:pointer;" onclick="mostraPopupClasse(' + index + ')" title="Clicca per modificare">' + 
            renderClasseBadge(imp.classe) + 
        '</td>' +
        '<td id="corticale-cell-' + index + '" style="text-align:center; cursor:pointer;" onclick="mostraPopupCorticale(' + index + ')" title="Clicca per selezionare spessore corticale">' + 
            renderCorticaleBadge(imp.corticale, imp.classe) + 
        '</td>' +
        '<td><input type="number" id="hu-input-' + index + '" value="' + (imp.densitaHU || '') + '" min="0" max="3000" placeholder="HU" onchange="aggiornaHUeClasse(' + index + ', this.value)"></td>' +
        '<td style="text-align:center;"><input type="checkbox"' + (imp.caricoImmediato ? ' checked' : '') + ' onchange="aggiornaImportData(' + index + ', \'caricoImmediato\', this.checked)"></td>' +
        '<td style="text-align:center;"><input type="checkbox"' + (imp.postEstrattivo ? ' checked' : '') + ' onchange="aggiornaImportData(' + index + ', \'postEstrattivo\', this.checked)"></td>' +
        '<td><button onclick="rimuoviRigaImport(' + index + ')" style="background:#f44336; color:white; border:none; padding:5px 10px; border-radius:4px; cursor:pointer;">🗑️</button></td>';
    
    tbody.appendChild(tr);
}

function aggiornaImportData(index, campo, valore) {
    if (importedImplantsData[index]) importedImplantsData[index][campo] = valore;
}

function rimuoviRigaImport(index) {
    importedImplantsData.splice(index, 1);
    var tbody = document.getElementById('import-tbody');
    tbody.innerHTML = '';
    for (var i = 0; i < importedImplantsData.length; i++) aggiungiRigaTabella(importedImplantsData[i], i);
}

function aggiungiRigaImport() {
    var nuovoImpianto = { dente: '', tipo: 'Medium', diametro: '4.2', lunghezza: '12', densitaHU: '', caricoImmediato: false, postEstrattivo: false };
    importedImplantsData.push(nuovoImpianto);
    var tbody = document.getElementById('import-tbody');
    if (tbody.innerHTML.indexOf('Nessun impianto') !== -1) tbody.innerHTML = '';
    aggiungiRigaTabella(nuovoImpianto, importedImplantsData.length - 1);
}

function mostraTestoOCR() {
    document.getElementById('import-step2').style.display = 'none';
    document.getElementById('import-ocr-raw').style.display = 'block';
    document.getElementById('ocr-text-area').value = rawPdfText;
}

function nascondiTestoOCR() {
    document.getElementById('import-ocr-raw').style.display = 'none';
    document.getElementById('import-step2').style.display = 'block';
}

function confermaImportazione() {
    var paziente = document.getElementById('import-paziente').value.trim();
    if (!paziente) { showCustomAlert("Inserisci il nome del paziente."); return; }
    if (importedImplantsData.length === 0) { showCustomAlert("Nessun impianto da importare."); return; }
    
    // Valida i denti
    for (var i = 0; i < importedImplantsData.length; i++) {
        var imp = importedImplantsData[i];
        var denteVal = parseInt(imp.dente);
        if (!denteVal || denteVal < 11 || denteVal > 48) {
            showCustomAlert("Controlla il numero del dente alla riga " + (i + 1));
            return;
        }
    }
    
    // Mostra alert di conferma
    var msg = "⚠️ <strong>Verifica i dati prima di confermare!</strong><br><br>";
    msg += "Stai per importare <strong>" + importedImplantsData.length + " impianti</strong> per:<br>";
    msg += "<strong>" + paziente + "</strong><br><br>";
    msg += "Controlla che diametro, lunghezza e tipo siano corretti.<br><br>";
    msg += "Vuoi procedere con l'importazione?";
    
    // Usa confirm nativo per semplicità
    if (!confirm("⚠️ VERIFICA I DATI PRIMA DI CONFERMARE!\n\nStai per importare " + importedImplantsData.length + " impianti per " + paziente + ".\n\nControlla che diametro, lunghezza e tipo siano corretti.\n\nVuoi procedere?")) {
        return;
    }
    
    eseguiImportazione(paziente);
}

function eseguiImportazione(paziente) {
    // Salva il conteggio prima di resettare
    var numImpianti = importedImplantsData.length;
    
    document.getElementById('nome').value = paziente;
    selectedTeeth = [];
    impiantiData = {};
    
    for (var j = 0; j < importedImplantsData.length; j++) {
        var impData = importedImplantsData[j];
        var dente = parseInt(impData.dente);
        selectedTeeth.push(dente);
        
        // Calcola la classe dall'HU se presente
        var classeCalcolata = '';
        if (impData.classe) {
            classeCalcolata = impData.classe;
        } else if (impData.densitaHU) {
            classeCalcolata = huToClasse(impData.densitaHU);
        }
        
        impiantiData[dente] = {
            b1one: impData.tipo,
            diametro: impData.diametro,
            lunghezza: impData.lunghezza,
            hu: impData.densitaHU || '',
            inputMode: impData.densitaHU ? 'hu' : (classeCalcolata ? 'densita' : 'hu'),
            carico: impData.caricoImmediato === true,
            postEstrattivo: impData.postEstrattivo === true,
            densitaClass: classeCalcolata,
            corticale: impData.corticale || '',
            hasLink: impData.hasLink || false
        };
        
        if (impData.hasLink) {
            console.log("🔗 hasLink trasferito per dente " + dente);
        }
    }
    
    // Aggiorna l'interfaccia dell'odontogramma
    if (typeof updateSelectionSummary === 'function') {
        updateSelectionSummary();
    }
    
    // Aggiorna visivamente i denti selezionati nell'odontogramma
    document.querySelectorAll('.tooth-stylized').forEach(function(el) {
        var toothNum = parseInt(el.getAttribute('data-tooth'));
        if (selectedTeeth.indexOf(toothNum) !== -1) {
            el.classList.add('selected');
        } else {
            el.classList.remove('selected');
        }
    });
    
    // Crea le card degli impianti
    var container = document.getElementById('impianti-container');
    if (container) {
        container.innerHTML = '';
        for (var k = 0; k < selectedTeeth.length; k++) {
            var card = creaCardImpianto(selectedTeeth[k], k);
            container.appendChild(card);
        }
    }
    
    // Aggiorna contatori
    if (typeof aggiornaContatori === 'function') {
        aggiornaContatori();
    }
    
    // Chiudi overlay (questo resetta importedImplantsData)
    document.getElementById('import-overlay').style.display = 'none';
    importedImplantsData = [];
    rawPdfText = "";
    
    showCustomAlert("✅ Importazione completata!<br><br>Importati <strong>" + numImpianti + "</strong> impianti per il paziente <strong>" + paziente + "</strong>.<br><br>Verifica i dati nelle schede e clicca <strong>ELABORA</strong> per calcolare i protocolli.", "📄 Import Completato");
}

// =============================================
// =============================================
// GESTIONE ODONTOGRAMMA INTERATTIVO
// =============================================

var upperTeethSelector = [18,17,16,15,14,13,12,11,21,22,23,24,25,26,27,28];
var lowerTeethSelector = [48,47,46,45,44,43,42,41,31,32,33,34,35,36,37,38];

var selectedTeeth = [];
var impiantiData = {};

function initOdontogrammaSelector() {
    // Quadranti separati
    var upperRight = document.getElementById('selector-upper-right');
    var upperLeft = document.getElementById('selector-upper-left');
    var lowerRight = document.getElementById('selector-lower-right');
    var lowerLeft = document.getElementById('selector-lower-left');
    
    // Denti per quadrante
    var q1 = [18,17,16,15,14,13,12,11]; // Superiore destro
    var q2 = [21,22,23,24,25,26,27,28]; // Superiore sinistro
    var q4 = [48,47,46,45,44,43,42,41]; // Inferiore destro
    var q3 = [31,32,33,34,35,36,37,38]; // Inferiore sinistro
    
    if (upperRight) {
        upperRight.innerHTML = '';
        for (var i = 0; i < q1.length; i++) {
            upperRight.appendChild(createSelectorTooth(q1[i]));
        }
    }
    
    if (upperLeft) {
        upperLeft.innerHTML = '';
        for (var j = 0; j < q2.length; j++) {
            upperLeft.appendChild(createSelectorTooth(q2[j]));
        }
    }
    
    if (lowerRight) {
        lowerRight.innerHTML = '';
        for (var k = 0; k < q4.length; k++) {
            lowerRight.appendChild(createSelectorTooth(q4[k]));
        }
    }
    
    if (lowerLeft) {
        lowerLeft.innerHTML = '';
        for (var l = 0; l < q3.length; l++) {
            lowerLeft.appendChild(createSelectorTooth(q3[l]));
        }
    }
    
    updateSelectionSummary();
}

function createSelectorTooth(toothNum) {
    var div = document.createElement('div');
    div.className = 'tooth-stylized';
    div.setAttribute('data-tooth', toothNum);
    
    if (selectedTeeth.indexOf(toothNum) !== -1) {
        div.classList.add('selected');
    }
    
    // SVG diversi per tipo di dente
    var toothSVG = getToothSVG(toothNum);
    
    div.innerHTML = '<div class="tooth-number-top">' + toothNum + '</div>' +
                    '<div class="tooth-shape">' + toothSVG + '</div>';
    
    div.onclick = function() {
        toggleToothSelection(toothNum, div);
    };
    
    return div;
}

function getToothSVG(toothNum) {
    var num = parseInt(toothNum);
    var posizione = num % 10; // Ultima cifra indica la posizione
    
    // Molari (1-3): 16,17,18,26,27,28,36,37,38,46,47,48
    if (posizione >= 6 && posizione <= 8) {
        return '<svg viewBox="0 0 40 50" xmlns="http://www.w3.org/2000/svg">' +
            '<path class="tooth-outline" d="M8 4 C4 4 2 10 2 18 C2 26 4 32 6 38 C7 42 8 46 11 46 C13 46 14 42 16 42 C18 42 19 46 20 46 C21 46 22 42 24 42 C26 42 27 46 29 46 C32 46 33 42 34 38 C36 32 38 26 38 18 C38 10 36 4 32 4 C28 4 26 6 20 6 C14 6 12 4 8 4 Z"/>' +
            '</svg>';
    }
    
    // Premolari (4-5): 14,15,24,25,34,35,44,45
    if (posizione >= 4 && posizione <= 5) {
        return '<svg viewBox="0 0 36 50" xmlns="http://www.w3.org/2000/svg">' +
            '<path class="tooth-outline" d="M18 3 C10 3 6 10 6 18 C6 26 8 34 10 40 C11 44 13 47 15 47 C17 47 17 44 18 44 C19 44 19 47 21 47 C23 47 25 44 26 40 C28 34 30 26 30 18 C30 10 26 3 18 3 Z"/>' +
            '</svg>';
    }
    
    // Canini (3): 13,23,33,43
    if (posizione === 3) {
        return '<svg viewBox="0 0 32 52" xmlns="http://www.w3.org/2000/svg">' +
            '<path class="tooth-outline" d="M16 2 C10 2 6 8 6 16 C6 24 8 32 10 40 C12 46 14 50 16 50 C18 50 20 46 22 40 C24 32 26 24 26 16 C26 8 22 2 16 2 Z"/>' +
            '</svg>';
    }
    
    // Incisivi laterali (2): 12,22,32,42
    if (posizione === 2) {
        return '<svg viewBox="0 0 30 48" xmlns="http://www.w3.org/2000/svg">' +
            '<path class="tooth-outline" d="M15 2 C9 2 5 8 5 16 C5 24 7 32 9 38 C10 42 12 46 15 46 C18 46 20 42 21 38 C23 32 25 24 25 16 C25 8 21 2 15 2 Z"/>' +
            '</svg>';
    }
    
    // Incisivi centrali (1): 11,21,31,41
    if (posizione === 1) {
        return '<svg viewBox="0 0 32 46" xmlns="http://www.w3.org/2000/svg">' +
            '<path class="tooth-outline" d="M16 2 C8 2 4 8 4 16 C4 24 6 32 9 38 C11 42 13 44 16 44 C19 44 21 42 23 38 C26 32 28 24 28 16 C28 8 24 2 16 2 Z"/>' +
            '</svg>';
    }
    
    // Default
    return '<svg viewBox="0 0 40 50" xmlns="http://www.w3.org/2000/svg">' +
        '<path class="tooth-outline" d="M20 2 C8 2 4 12 4 20 C4 28 6 35 8 42 C10 46 14 48 20 48 C26 48 30 46 32 42 C34 35 36 28 36 20 C36 12 32 2 20 2 Z"/>' +
        '</svg>';
}

function toggleToothSelection(toothNum, element) {
    var index = selectedTeeth.indexOf(toothNum);
    
    if (index === -1) {
        selectedTeeth.push(toothNum);
        element.classList.add('selected');
        
        if (!impiantiData[toothNum]) {
            impiantiData[toothNum] = {
                hu: '',
                densitaClass: '',
                inputMode: 'hu',
                carico: false,
                post: false,
                b1one: 'High',
                diametro: '3.7',
                lunghezza: '10'
            };
        }
    } else {
        selectedTeeth.splice(index, 1);
        element.classList.remove('selected');
    }
    
    selectedTeeth = ordinaDentiOdontogramma(selectedTeeth);
    
    // Aggiorna stato visivo
    var statoEl = document.getElementById('odonto-stato');
    if (statoEl) {
        statoEl.textContent = selectedTeeth.length > 0 ? selectedTeeth.length + ' selezionati' : 'Pronto';
        statoEl.style.color = selectedTeeth.length > 0 ? '#5b7fff' : '#4CAF50';
    }
    
    updateSelectionSummary();
    aggiornaImpiantiContainer();
}
function updateSelectionSummary() {
    var countEl = document.getElementById('selection-count');
    var listEl = document.getElementById('selection-list');
    
    if (countEl) countEl.textContent = selectedTeeth.length;
    if (listEl) {
        if (selectedTeeth.length === 0) {
            listEl.textContent = 'nessuno';
        } else {
            listEl.textContent = selectedTeeth.join(', ');
        }
    }
    
    var impiantiInput = document.getElementById('impianti');
    if (impiantiInput) {
        impiantiInput.value = selectedTeeth.length;
    }
}

function salvaStatoImpianto(dente) {
    var card = document.querySelector('[data-dente="' + dente + '"]');
    if (!card) return;
    
    var data = impiantiData[dente] || {};
    
    var huEl = card.querySelector('[data-field="hu"]');
    var densitaEl = card.querySelector('[data-field="densita"]:checked');
    var modoHuEl = card.querySelector('[data-field="modo_hu"]');
    var caricoEl = card.querySelector('[data-field="carico"]');
    var postEl = card.querySelector('[data-field="post"]');
    var b1oneEl = card.querySelector('[data-field="b1one"]');
    var diametroEl = card.querySelector('[data-field="diametro"]');
    var lunghezzaEl = card.querySelector('[data-field="lunghezza"]');
    var corticaleEl = card.querySelector('[data-field="corticale"]:checked');
    
    if (huEl) data.hu = huEl.value;
    if (densitaEl) data.densitaClass = densitaEl.value;
    if (modoHuEl) data.inputMode = modoHuEl.checked ? 'hu' : 'densita';
    if (caricoEl) data.carico = caricoEl.checked;
    if (postEl) { data.post = postEl.checked; data.postEstrattivo = postEl.checked; }
    if (b1oneEl) data.b1one = b1oneEl.value;
    if (diametroEl) data.diametro = diametroEl.value;
    if (lunghezzaEl) data.lunghezza = lunghezzaEl.value;
    if (corticaleEl) data.corticale = corticaleEl.value;
    
    impiantiData[dente] = data;
}

// Funzione per aggiornare la visualizzazione della corticale
function aggiornaCorticale(dente) {
    var card = document.querySelector('[data-dente="' + dente + '"]');
    if (!card) return;
    
    var corticaleEl = card.querySelector('[data-field="corticale"]:checked');
    var corticale = corticaleEl ? corticaleEl.value : '';
    
    // Ottieni la densità corrente
    var densitaEl = card.querySelector('[data-field="densita"]:checked');
    var huEl = card.querySelector('[data-field="hu"]');
    var modoHuEl = card.querySelector('[data-field="modo_hu"]');
    
    var densita = '';
    var isHuMode = modoHuEl && modoHuEl.checked;
    if (isHuMode && huEl && huEl.value) {
        densita = huToClasse(huEl.value);
    } else if (densitaEl) {
        densita = densitaEl.value;
    }
    
    // Mostra la densità con pallino accanto al valore HU (solo in modalità HU)
    var densitaDisplayDiv = document.getElementById('densita_display_' + dente);
    if (densitaDisplayDiv) {
        if (isHuMode && huEl && huEl.value && densita) {
            var densitaColors = {
                'D1': '#ef5350', 'D2_D1': '#ffcdd2', 'D2': '#ffa726', 
                'D3_D2': '#ffe0b2', 'D3': '#ffee58', 'D3_D4': '#c8e6c9', 'D4': '#66bb6a'
            };
            var densitaLabels = {
                'D1': 'D1', 'D2_D1': 'D2→D1', 'D2': 'D2', 
                'D3_D2': 'D3→D2', 'D3': 'D3', 'D3_D4': 'D3→D4', 'D4': 'D4'
            };
            var color = densitaColors[densita] || '#ccc';
            var label = densitaLabels[densita] || densita;
            densitaDisplayDiv.innerHTML = '<span style="width:18px; height:18px; border-radius:50%; background:' + color + '; display:inline-block; border:2px solid rgba(0,0,0,0.1);"></span>' +
                '<span style="font-weight:bold; font-size:14px;">' + label + '</span>';
            densitaDisplayDiv.style.display = 'flex';
        } else {
            densitaDisplayDiv.style.display = 'none';
        }
    }
    
    // Calcola la classificazione ossea
    var classificazione = '';
    var infoDesc = '';
    if (corticale && densita) {
        classificazione = getClassificazioneOssea(corticale, densita);
        if (classificazione) {
            var info = getClassificazioneOsseaInfo(classificazione);
            infoDesc = info ? info.desc : '';
        }
    }
    
    // Aggiorna classificazione in modalità HU
    var classificazioneDiv = document.getElementById('classificazione_' + dente);
    if (classificazioneDiv) {
        if (classificazione && isHuMode) {
            classificazioneDiv.innerHTML = '<span style="font-weight:bold; color:#1565c0; font-size:16px;">' + classificazione + '</span>' +
                '<span style="font-size:11px; color:#666;">' + infoDesc + '</span>';
            classificazioneDiv.style.display = 'inline-flex';
        } else {
            classificazioneDiv.style.display = 'none';
        }
    }
    
    // Aggiorna classificazione in modalità Densità
    var classificazioneDensitaDiv = document.getElementById('classificazione_densita_' + dente);
    if (classificazioneDensitaDiv) {
        if (classificazione && !isHuMode) {
            classificazioneDensitaDiv.innerHTML = '<span style="font-weight:bold; color:#1565c0; font-size:16px;">' + classificazione + '</span>' +
                '<span style="font-size:11px; color:#666;">' + infoDesc + '</span>';
            classificazioneDensitaDiv.style.display = 'inline-flex';
        } else {
            classificazioneDensitaDiv.style.display = 'none';
        }
    }
    
    // Aggiorna lo stile dei pulsanti corticale
    var options = card.querySelectorAll('.corticale-option');
    options.forEach(function(opt) {
        var input = opt.querySelector('input');
        if (input && input.checked) {
            opt.style.borderColor = '#1565c0';
            opt.style.background = '#e3f2fd';
        } else {
            opt.style.borderColor = '#ddd';
            opt.style.background = '';
        }
    });
    
    // Salva nei dati
    if (impiantiData[dente]) {
        impiantiData[dente].corticale = corticale;
    }
}

// Funzione per resettare la corticale
function resetCorticale(dente) {
    var card = document.querySelector('[data-dente="' + dente + '"]');
    if (!card) return;
    
    // Deseleziona tutti i radio della corticale
    var corticaleInputs = card.querySelectorAll('[data-field="corticale"]');
    corticaleInputs.forEach(function(input) {
        input.checked = false;
    });
    
    // Rimuovi dai dati
    if (impiantiData[dente]) {
        impiantiData[dente].corticale = '';
    }
    
    // Nascondi la classificazione
    var classificazioneDiv = document.getElementById('classificazione_' + dente);
    if (classificazioneDiv) {
        classificazioneDiv.style.display = 'none';
    }
    
    // Resetta lo stile dei pulsanti
    var options = card.querySelectorAll('.corticale-option');
    options.forEach(function(opt) {
        opt.style.borderColor = '#ddd';
        opt.style.background = '';
    });
}

function salvaStatoTutti() {
    for (var i = 0; i < selectedTeeth.length; i++) {
        salvaStatoImpianto(selectedTeeth[i]);
    }
}

function aggiornaImpiantiContainer() {
    salvaStatoTutti();
    
    var container = document.getElementById('impianti-container');
    if (!container) return;
    
    container.innerHTML = '';
    
    for (var i = 0; i < selectedTeeth.length; i++) {
        var card = creaCardImpianto(selectedTeeth[i], i);
        container.appendChild(card);
    }
}

function creaCardImpianto(dente, index) {
    var data = impiantiData[dente] || {};
    
    var card = document.createElement('div');
    card.className = 'impianto-card';
    card.setAttribute('data-dente', dente);
    
    var inputMode = data.inputMode || 'hu';
    var huValue = data.hu || '';
    var densitaValue = data.densitaClass || '';
    
    // Se c'è un valore HU ma non c'è la classe, calcola automaticamente
    if (huValue && !densitaValue) {
        densitaValue = huToClasse(huValue);
        // Salva anche in impiantiData per persistenza
        if (impiantiData[dente]) {
            impiantiData[dente].densitaClass = densitaValue;
        }
    }
    
    var caricoChecked = data.carico ? 'checked' : '';
    var postChecked = (data.post || data.postEstrattivo) ? 'checked' : '';
    var b1oneValue = data.b1one || 'High';
    var diametroValue = data.diametro || '3.7';
    var lunghezzaValue = data.lunghezza || '10';
    var corticaleValue = data.corticale || '';
    
    var huDisplay = inputMode === 'hu' ? '' : 'display:none;';
    var densitaDisplay = inputMode === 'densita' ? '' : 'display:none;';
    var postDisplay = (data.post || data.postEstrattivo) ? 'display:flex;' : 'display:none;';
    
    // Calcola classificazione ossea se corticale è selezionata
    var classificazioneOssea = '';
    var classificazioneInfo = '';
    if (corticaleValue && densitaValue) {
        classificazioneOssea = getClassificazioneOssea(corticaleValue, densitaValue);
        if (classificazioneOssea) {
            var info = getClassificazioneOsseaInfo(classificazioneOssea);
            classificazioneInfo = info ? info.desc : '';
        }
    }
    
    card.innerHTML = '<div class="impianto-header">' +
        '<div class="impianto-title"><strong>🦷 Dente ' + dente + '</strong></div>' +
        '<button class="collapse-btn" onclick="toggleCard(this)">−</button>' +
    '</div>' +
    '<div class="impianto-content" style="display:flex; gap:15px;">' +
        '<div class="impianto-form" style="flex:1;">' +
        '<div class="form-group">' +
            '<label>Densità Ossea: <span style="color:red; font-weight:bold;">*</span></label>' +
            '<div style="display:flex; align-items:center; gap:15px; flex-wrap:wrap;">' +
                '<div class="radio-group" style="display:flex; gap:8px; margin:0;">' +
                    '<label class="radio-label" style="margin:0;">' +
                        '<input type="radio" name="modo_densita_' + dente + '" value="hu" data-field="modo_hu" ' + (inputMode === 'hu' ? 'checked' : '') + ' onchange="toggleModoInputDente(' + dente + ')"> Hounsfield' +
                    '</label>' +
                    '<label class="radio-label" style="margin:0;">' +
                        '<input type="radio" name="modo_densita_' + dente + '" value="densita" data-field="modo_densita" ' + (inputMode === 'densita' ? 'checked' : '') + ' onchange="toggleModoInputDente(' + dente + ')"> Classe (D1-D4)' +
                    '</label>' +
                '</div>' +
                '<div style="display:flex; align-items:center; gap:8px;">' +
                    '<label class="corticale-option" style="cursor:pointer; display:flex; align-items:center; gap:5px; padding:8px 12px; border:2px solid #ddd; border-radius:8px;' + (corticaleValue === 'H' ? ' border-color:#1565c0; background:#e3f2fd;' : '') + '" title="Corticale >2mm">' +
                        '<input type="radio" name="corticale_' + dente + '" value="H" data-field="corticale" ' + (corticaleValue === 'H' ? 'checked' : '') + ' onchange="aggiornaCorticale(' + dente + '); salvaStatoImpianto(' + dente + ')" style="display:none;">' +
                        '<span style="width:24px; height:24px; border-radius:50%; border:6px solid #1565c0; display:inline-block;"></span>' +
                        '<span style="font-weight:bold; color:#1565c0;">H</span>' +
                        '<span style="font-size:10px; color:#666;">(>2mm)</span>' +
                    '</label>' +
                    '<label class="corticale-option" style="cursor:pointer; display:flex; align-items:center; gap:5px; padding:8px 12px; border:2px solid #ddd; border-radius:8px;' + (corticaleValue === 'N' ? ' border-color:#1976d2; background:#e3f2fd;' : '') + '" title="Corticale 2mm">' +
                        '<input type="radio" name="corticale_' + dente + '" value="N" data-field="corticale" ' + (corticaleValue === 'N' ? 'checked' : '') + ' onchange="aggiornaCorticale(' + dente + '); salvaStatoImpianto(' + dente + ')" style="display:none;">' +
                        '<span style="width:24px; height:24px; border-radius:50%; border:4px solid #1976d2; display:inline-block;"></span>' +
                        '<span style="font-weight:bold; color:#1976d2;">N</span>' +
                        '<span style="font-size:10px; color:#666;">(2mm)</span>' +
                    '</label>' +
                    '<label class="corticale-option" style="cursor:pointer; display:flex; align-items:center; gap:5px; padding:8px 12px; border:2px solid #ddd; border-radius:8px;' + (corticaleValue === 'S' ? ' border-color:#64b5f6; background:#e3f2fd;' : '') + '" title="Corticale <2mm">' +
                        '<input type="radio" name="corticale_' + dente + '" value="S" data-field="corticale" ' + (corticaleValue === 'S' ? 'checked' : '') + ' onchange="aggiornaCorticale(' + dente + '); salvaStatoImpianto(' + dente + ')" style="display:none;">' +
                        '<span style="width:24px; height:24px; border-radius:50%; border:2px solid #64b5f6; display:inline-block;"></span>' +
                        '<span style="font-weight:bold; color:#64b5f6;">S</span>' +
                        '<span style="font-size:10px; color:#666;">(<2mm)</span>' +
                    '</label>' +
                    '<button type="button" onclick="resetCorticale(' + dente + ')" style="background:#d32f2f; border:none; cursor:pointer; padding:4px 6px; border-radius:4px;" title="Rimuovi corticale">' +
                        '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6h14M10 11v6M14 11v6"/></svg>' +
                    '</button>' +
                '</div>' +
            '</div>' +
        '</div>' +
        '<div class="form-group" style="margin-top:8px;">' +
            '<div id="hu_block_' + dente + '" style="' + huDisplay + '">' +
                '<div style="display:flex; align-items:center; gap:12px; flex-wrap:wrap;">' +
                    '<input type="number" data-field="hu" placeholder="Valore HU (es. 850)" value="' + huValue + '" onchange="salvaStatoImpianto(' + dente + '); aggiornaCorticale(' + dente + ')" style="width:140px; padding:6px 8px;">' +
                    '<div id="densita_display_' + dente + '" style="display:none; align-items:center; gap:6px; padding:5px 10px; background:#f5f5f5; border-radius:6px;"></div>' +
                    '<div id="classificazione_' + dente + '" style="padding:5px 10px; background:#e3f2fd; border-radius:6px; display:' + (classificazioneOssea ? 'inline-flex' : 'none') + '; align-items:center; gap:6px;">' +
                        '<span style="font-weight:bold; color:#1565c0; font-size:16px;">' + classificazioneOssea + '</span>' +
                        '<span style="font-size:11px; color:#666;">' + classificazioneInfo + '</span>' +
                    '</div>' +
                '</div>' +
            '</div>' +
            '<div id="densita_block_' + dente + '" style="' + densitaDisplay + '">' +
                '<div class="densita-pallini-container">' +
                    '<div class="densita-row">' +
                        '<label class="densita-pallino" title="D1 - Osso molto denso">' +
                            '<input type="radio" name="densita_classe_' + dente + '" value="D1" data-field="densita" ' + (densitaValue === 'D1' ? 'checked' : '') + ' onchange="impostaHUdaDensitaDente(' + dente + '); salvaStatoImpianto(' + dente + ')">' +
                            '<span class="pallino" style="background:#ef5350; border-color:#d32f2f;"></span>' +
                            '<span class="pallino-label">D1</span>' +
                        '</label>' +
                        '<label class="densita-pallino" title="D2→D1 - Transizione">' +
                            '<input type="radio" name="densita_classe_' + dente + '" value="D2_D1" data-field="densita" ' + (densitaValue === 'D2_D1' ? 'checked' : '') + ' onchange="impostaHUdaDensitaDente(' + dente + '); salvaStatoImpianto(' + dente + ')">' +
                            '<span class="pallino" style="background:#ffcdd2; border-color:#ef9a9a;"></span>' +
                            '<span class="pallino-label">D2→D1</span>' +
                        '</label>' +
                        '<label class="densita-pallino" title="D2 - Osso corticale">' +
                            '<input type="radio" name="densita_classe_' + dente + '" value="D2" data-field="densita" ' + (densitaValue === 'D2' ? 'checked' : '') + ' onchange="impostaHUdaDensitaDente(' + dente + '); salvaStatoImpianto(' + dente + ')">' +
                            '<span class="pallino" style="background:#ffa726; border-color:#f57c00;"></span>' +
                            '<span class="pallino-label">D2</span>' +
                        '</label>' +
                        '<label class="densita-pallino" title="D3→D2 - Transizione">' +
                            '<input type="radio" name="densita_classe_' + dente + '" value="D3_D2" data-field="densita" ' + (densitaValue === 'D3_D2' ? 'checked' : '') + ' onchange="impostaHUdaDensitaDente(' + dente + '); salvaStatoImpianto(' + dente + ')">' +
                            '<span class="pallino" style="background:#ffe0b2; border-color:#ffcc80;"></span>' +
                            '<span class="pallino-label">D3→D2</span>' +
                        '</label>' +
                    '</div>' +
                    '<div class="densita-row">' +
                        '<label class="densita-pallino" title="D3 - Osso trabecolare">' +
                            '<input type="radio" name="densita_classe_' + dente + '" value="D3" data-field="densita" ' + (densitaValue === 'D3' ? 'checked' : '') + ' onchange="impostaHUdaDensitaDente(' + dente + '); salvaStatoImpianto(' + dente + ')">' +
                            '<span class="pallino" style="background:#ffee58; border-color:#fdd835;"></span>' +
                            '<span class="pallino-label">D3</span>' +
                        '</label>' +
                        '<label class="densita-pallino" title="D3→D4 - Transizione">' +
                            '<input type="radio" name="densita_classe_' + dente + '" value="D3_D4" data-field="densita" ' + (densitaValue === 'D3_D4' ? 'checked' : '') + ' onchange="impostaHUdaDensitaDente(' + dente + '); salvaStatoImpianto(' + dente + ')">' +
                            '<span class="pallino" style="background:#c8e6c9; border-color:#a5d6a7;"></span>' +
                            '<span class="pallino-label">D3→D4</span>' +
                        '</label>' +
                        '<label class="densita-pallino" title="D4 - Osso poroso">' +
                            '<input type="radio" name="densita_classe_' + dente + '" value="D4" data-field="densita" ' + (densitaValue === 'D4' ? 'checked' : '') + ' onchange="impostaHUdaDensitaDente(' + dente + '); salvaStatoImpianto(' + dente + ')">' +
                            '<span class="pallino" style="background:#66bb6a; border-color:#43a047;"></span>' +
                            '<span class="pallino-label">D4</span>' +
                        '</label>' +
                    '</div>' +
                '</div>' +
                '<div id="classificazione_densita_' + dente + '" style="margin-top:8px; padding:5px 10px; background:#e3f2fd; border-radius:6px; display:' + (classificazioneOssea && inputMode === 'densita' ? 'inline-flex' : 'none') + '; align-items:center; gap:6px;">' +
                    '<span style="font-weight:bold; color:#1565c0; font-size:16px;">' + classificazioneOssea + '</span>' +
                    '<span style="font-size:11px; color:#666;">' + classificazioneInfo + '</span>' +
                '</div>' +
            '</div>' +
        '</div>' +
        '<div class="form-group">' +
            '<label>Opzioni Cliniche:</label>' +
            '<div class="radio-group">' +
                '<label class="radio-label">' +
                    '<input type="checkbox" data-field="carico" ' + caricoChecked + ' onchange="salvaStatoImpianto(' + dente + ')"> Carico Immediato' +
                '</label>' +
                '<label class="radio-label">' +
                    '<input type="checkbox" data-field="post" ' + postChecked + ' onchange="toggleNotaPostDente(' + dente + '); salvaStatoImpianto(' + dente + ')"> Post-estrattivo' +
                '</label>' +
            '</div>' +
            '<div id="nota_post_' + dente + '" style="' + postDisplay + ' margin-top:8px; align-items:center; gap:8px;">' +
                '<div class="nota" style="margin:0; flex:0 1 auto;">⚠️ In caso di post-estrattivo rivalutare la densità ossea con la funzione ROI</div>' +
                '<button type="button" onclick="mostraInfoROI()" style="cursor:pointer; display:inline-flex; align-items:center; justify-content:center; width:20px; height:20px; background:linear-gradient(145deg, #0077cc, #005599); color:white; border-radius:50%; font-size:12px; font-weight:bold; border:2px solid #004488; box-shadow:0 2px 4px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.3); font-family:Georgia,serif; font-style:italic; flex-shrink:0; min-width:20px; min-height:20px; max-width:20px; max-height:20px; padding:0; line-height:1;" title="Info sulla funzione ROI">i</button>' +
            '</div>' +
        '</div>' +
        '<div class="form-group">' +
            '<label>Impianto:</label>' +
            '<div style="display:flex; gap:12px; align-items:center; flex-wrap:wrap;">' +
                '<div style="display:flex; align-items:center; gap:4px;">' +
                    '<span style="font-size:11px; color:#888;">Tipo:</span>' +
                    '<select data-field="b1one" onchange="aggiornaOpzioniB1OneDente(' + dente + '); aggiornaImmagineCard(' + dente + '); salvaStatoImpianto(' + dente + ')" style="padding:3px 6px; font-size:13px;">' +
                        '<option value="High" style="color:red;"' + (b1oneValue === 'High' ? ' selected' : '') + '>High</option>' +
                        '<option value="Medium" style="color:orange;"' + (b1oneValue === 'Medium' ? ' selected' : '') + '>Medium</option>' +
                        '<option value="Low" style="color:green;"' + (b1oneValue === 'Low' ? ' selected' : '') + '>Low</option>' +
                    '</select>' +
                '</div>' +
                '<div style="display:flex; align-items:center; gap:4px;">' +
                    '<span style="font-size:11px; color:#888;">Ø:</span>' +
                    '<select data-field="diametro" onchange="aggiornaTuttoDente(' + dente + '); aggiornaImmagineCard(' + dente + '); salvaStatoImpianto(' + dente + ')" style="padding:3px 6px; font-size:13px;">' +
                        '<option value="2.7"' + (diametroValue === '2.7' ? ' selected' : '') + '>2.7</option>' +
                        '<option value="3.2"' + (diametroValue === '3.2' ? ' selected' : '') + '>3.2</option>' +
                        '<option value="3.7"' + (diametroValue === '3.7' ? ' selected' : '') + '>3.7</option>' +
                        '<option value="4.2"' + (diametroValue === '4.2' ? ' selected' : '') + '>4.2</option>' +
                        '<option value="4.8"' + (diametroValue === '4.8' ? ' selected' : '') + '>4.8</option>' +
                    '</select>' +
                '</div>' +
                '<div style="display:flex; align-items:center; gap:4px;">' +
                    '<span style="font-size:11px; color:#888;">L:</span>' +
                    '<select data-field="lunghezza" onchange="aggiornaImmagineCard(' + dente + '); salvaStatoImpianto(' + dente + ')" style="padding:3px 6px; font-size:13px;"></select>' +
                '</div>' +
            '</div>' +
        '</div>' +
        '</div>' +
        '<div id="impianto_image_' + dente + '" class="impianto-image-area" style="width:140px; min-width:140px; background:linear-gradient(180deg, #2d3748 0%, #1a202c 100%); border-radius:10px; padding:12px; display:flex; flex-direction:column; align-items:center; justify-content:flex-start; gap:8px;">' +
            '<div id="impianto_label_' + dente + '" style="color:#00d4ff; font-weight:bold; font-size:12px; text-align:center;">High Ø' + diametroValue + ' x ' + lunghezzaValue + 'mm</div>' +
            '<img id="impianto_img_' + dente + '" src="" style="max-width:100%; max-height:150px; border-radius:4px;">' +
            '<button id="impianto_btn_' + dente + '" onclick="" style="margin-top:auto; background:linear-gradient(to bottom, #17a2b8, #138496); color:white; padding:6px 12px; border:none; border-radius:20px; font-size:11px; font-weight:bold; cursor:pointer; box-shadow:0 2px 4px rgba(0,0,0,0.2);">📄 Indicazioni</button>' +
        '</div>' +
    '</div>';
    
    setTimeout(function() {
        aggiornaTuttoDente(dente);
        aggiornaCorticale(dente);
        aggiornaImmagineCard(dente);
        var lunghezzaEl = card.querySelector('[data-field="lunghezza"]');
        if (lunghezzaEl && lunghezzaValue) {
            lunghezzaEl.value = lunghezzaValue;
        }
    }, 10);
    
    return card;
}

function toggleCard(btn) {
    var content = btn.parentNode.nextElementSibling;
    if (content.classList.contains('hidden')) {
        content.classList.remove('hidden');
        btn.textContent = '−';
    } else {
        content.classList.add('hidden');
        btn.textContent = '+';
    }
}

function toggleModoInputDente(dente) {
    var card = document.querySelector('[data-dente="' + dente + '"]');
    if (!card) return;
    
    var radioHu = card.querySelector('[data-field="modo_hu"]');
    var isHu = radioHu && radioHu.checked;
    
    var huBlock = document.getElementById('hu_block_' + dente);
    var densitaBlock = document.getElementById('densita_block_' + dente);
    
    if (isHu) {
        huBlock.style.display = 'block';
        densitaBlock.style.display = 'none';
    } else {
        huBlock.style.display = 'none';
        densitaBlock.style.display = 'block';
    }
    
    salvaStatoImpianto(dente);
}

function impostaHUdaDensitaDente(dente) {
    var card = document.querySelector('[data-dente="' + dente + '"]');
    if (!card) return;
    
    var densitaEl = card.querySelector('[data-field="densita"]:checked');
    var huEl = card.querySelector('[data-field="hu"]');
    
    if (!densitaEl || !huEl) return;
    
    var valore = densitaEl.value;
    var mappa = { "D1": 1300, "D2_D1": 1200, "D2": 1000, "D3_D2": 775, "D3": 600, "D3_D4": 400, "D4": 250 };
    huEl.value = mappa[valore] || "";
    
    // Aggiorna la classificazione ossea se la corticale è selezionata
    if (typeof aggiornaCorticale === 'function') {
        aggiornaCorticale(dente);
    }
}

function toggleNotaPostDente(dente) {
    var card = document.querySelector('[data-dente="' + dente + '"]');
    if (!card) return;
    
    var postEl = card.querySelector('[data-field="post"]');
    var notaEl = document.getElementById('nota_post_' + dente);
    
    if (postEl && notaEl) {
        notaEl.style.display = postEl.checked ? 'flex' : 'none';
    }
}

function aggiornaOpzioniB1OneDente(dente) {
    var card = document.querySelector('[data-dente="' + dente + '"]');
    if (!card) return;
    
    var b1oneEl = card.querySelector('[data-field="b1one"]');
    var diametroEl = card.querySelector('[data-field="diametro"]');
    
    if (!b1oneEl || !diametroEl) return;
    
    var diametro = diametroEl.value;
    
    for (var i = 0; i < b1oneEl.options.length; i++) {
        b1oneEl.options[i].disabled = false;
    }
    
    if (diametro === '2.7' || diametro === '3.2') {
        b1oneEl.value = 'High';
        for (var j = 0; j < b1oneEl.options.length; j++) {
            if (b1oneEl.options[j].value !== 'High') {
                b1oneEl.options[j].disabled = true;
            }
        }
    } else if (diametro === '4.8') {
        if (b1oneEl.value === 'High') b1oneEl.value = 'Medium';
        for (var k = 0; k < b1oneEl.options.length; k++) {
            if (b1oneEl.options[k].value === 'High') {
                b1oneEl.options[k].disabled = true;
            }
        }
    }
}

function aggiornaOpzioniLunghezzaDente(dente) {
    var card = document.querySelector('[data-dente="' + dente + '"]');
    if (!card) return;
    
    var diametroEl = card.querySelector('[data-field="diametro"]');
    var lunghezzaEl = card.querySelector('[data-field="lunghezza"]');
    
    if (!diametroEl || !lunghezzaEl) return;
    
    var diametro = diametroEl.value;
    var currentValue = lunghezzaEl.value || (impiantiData[dente] ? impiantiData[dente].lunghezza : '');
    
    var options = [];
    var defaultOption = '';
    
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
    
    lunghezzaEl.innerHTML = '';
    for (var i = 0; i < options.length; i++) {
        var opt = document.createElement('option');
        opt.value = options[i];
        opt.textContent = options[i];
        lunghezzaEl.appendChild(opt);
    }
    
    if (options.indexOf(currentValue) !== -1) {
        lunghezzaEl.value = currentValue;
    } else {
        lunghezzaEl.value = defaultOption;
    }
}

function aggiornaTuttoDente(dente) {
    aggiornaOpzioniB1OneDente(dente);
    aggiornaOpzioniLunghezzaDente(dente);
}

// =============================================
// DATI PROTOCOLLI
// =============================================

var DEFAULT_PROTOCOLS = {
  "High": {
    "4.2": {
      "D1": { "non compresso": { fresa: "4.0 maschiatore", prep: "Completa" }, "compresso": { fresa: "4.0 maschiatore", prep: "Completa" } },
      "D2_D1": { "non compresso": { fresa: "4.0 maschiatore", prep: "Completa" }, "compresso": { fresa: "4.0 maschiatore", prep: "SottopreparazioneØ in altezza (Ø4.0 maschiatore –2 mm, Ø 3.0 completa)" } },
      "D2": { "non compresso": { fresa: "3.8", prep: "Completa", testa: "Ø 4.0mm" }, "compresso": { fresa: "3.8", prep: "SottopreparazioneØ in altezza (Ø3.8 –2 mm, Ø 2.8 completa)" } },
      "D3_D2": { "non compresso": { fresa: "3.6", prep: "Completa", testa: "Ø 4.0mm" }, "compresso": { fresa: "3.6", prep: "SottopreparazioneØ (Ø3.6 –2 mm, Ø2.8 completa)", testa: "a discrezione Ø 4mm" } },
      "D3": { "non compresso": { fresa: "3.4", prep: "SottopreparazioneØ in altezza (Ø3.4 –2 mm, Ø f.lettrice)", testa: "Ø 4.0mm" }, "compresso": { fresa: "3.2", prep: "SottopreparazioneØ in altezza (Ø3.2 –2 mm, Ø 2.3 completa)", testa: "Ø 4.0mm" } },
      "D3_D4": { "non compresso": { fresa: "3.2", prep: "Completa", testa: "Ø 4.0mm" }, "compresso": { fresa: "2.8", prep: "SottopreparazioneØ in altezza (Ø2.8 –2 mm, Ø 2.3 completa)", testa: "Ø 4.0mm" } },
      "D4": { "non compresso": { fresa: "2.8", prep: "Completa", testa: "Ø 4.0mm" }, "compresso": { fresa: "2.8/F.lettrice", prep: "Completa", testa: "Ø 3.0mm" } }
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
      "D4": { "non compresso": { fresa: "2.8", prep: "Completa", testa: "Ø 4.0mm" }, "compresso": { fresa: "2.8/F.lettrice", prep: "Completa", testa: "Ø 3.0mm" } }
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
    "3.2": {},
    "2.7": {}
  },
  "Low": {
    "4.2": {
      "D1": { "non compresso": { fresa: "non consigliato", prep: "non consigliato" }, "compresso": { fresa: "non consigliato", prep: "non consigliato" } },
      "D2_D1": { "non compresso": { fresa: "non consigliato", prep: "non consigliato" }, "compresso": { fresa: "non consigliato", prep: "non consigliato" } },
      "D2": { "non compresso": { fresa: "non consigliato", prep: "non consigliato" }, "compresso": { fresa: "non consigliato", prep: "non consigliato" } },
      "D3_D2": { "non compresso": { fresa: "non consigliato", prep: "non consigliato" }, "compresso": { fresa: "non consigliato", prep: "non consigliato" } },
      "D3": { "non compresso": { fresa: "3.0", prep: "SottopreparazioneØ in altezza (Ø3.0 –2 mm, Ø 2.3 completa)" }, "compresso": { fresa: "2.8", prep: "SottopreparazioneØ in altezza (Ø2.8 –2 mm, Ø 2.3 completa)", testa: "Ø 3.0mm" } },
      "D3_D4": { "non compresso": { fresa: "2.8", prep: "Completa", testa: "Ø 3.0mm" }, "compresso": { fresa: "F.lettrice", prep: "Completa" } },
      "D4": { "non compresso": { fresa: "2.8 oppure F.lettrice", prep: "Completa", testa: "Ø 3.0mm" }, "compresso": { fresa: "2.3", prep: "SottopreparazioneØ in altezza (Ø2.3 –2 mm, Ø 1.7 completa)" } }
    },
    "3.7": {
      "D1": { "non compresso": { fresa: "non consigliato", prep: "non consigliato" }, "compresso": { fresa: "non consigliato", prep: "non consigliato" } },
      "D2_D1": { "non compresso": { fresa: "non consigliato", prep: "non consigliato" }, "compresso": { fresa: "non consigliato", prep: "non consigliato" } },
      "D2": { "non compresso": { fresa: "non consigliato", prep: "non consigliato" }, "compresso": { fresa: "non consigliato", prep: "non consigliato" } },
      "D3_D2": { "non compresso": { fresa: "non consigliato", prep: "non consigliato" }, "compresso": { fresa: "non consigliato", prep: "non consigliato" } },
      "D3": { "non compresso": { fresa: "2.8", prep: "Completa" }, "compresso": { fresa: "2.8", prep: "SottopreparazioneØ in altezza (Ø2.8 –2 mm, Ø 2.0 completa)" } },
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
    "3.2": {},
    "2.7": {}
  }
};

var dbProtocolli = {};
var accessiKey = "contatoreAccessi";
var impiantiKey = "impiantiElaborati";

// =============================================
// INIZIALIZZAZIONE
// =============================================

function initApp() {
    var ed = document.getElementById("editor-overlay");
    if (ed) ed.style.display = 'none';

    try {
        var savedInfo = localStorage.getItem("b1one_protocols_custom");
        if (savedInfo) {
            dbProtocolli = JSON.parse(savedInfo);
        } else {
            dbProtocolli = JSON.parse(JSON.stringify(DEFAULT_PROTOCOLS));
        }
        if (!dbProtocolli["High"]) throw new Error("Corrupted Data");
    } catch (e) {
        localStorage.removeItem("b1one_protocols_custom");
        dbProtocolli = JSON.parse(JSON.stringify(DEFAULT_PROTOCOLS));
    }

    var acc = parseInt(localStorage.getItem(accessiKey)) || 0;
    localStorage.setItem(accessiKey, ++acc);

    initOdontogrammaSelector();
}

// =============================================
// HELPER VISUALI
// =============================================

var corpoApiceData = {
    "2.7|High": { corpo: "2,3", apice: "1,3" },
    "3.2|High": { corpo: "2,5", apice: "1,8" },
    "3.7|High": { corpo: "3,0", apice: "2,0" },
    "3.7|Medium": { corpo: "2,9", apice: "2,0" },
    "3.7|Low": { corpo: "2,3", apice: "2,0" },
    "4.2|High": { corpo: "3,5", apice: "2,3" },
    "4.2|Medium": { corpo: "3,4", apice: "2,3" },
    "4.2|Low": { corpo: "2,8", apice: "2,3" },
    "4.8|Medium": { corpo: "4,0", apice: "2,9" },
    "4.8|Low": { corpo: "3,4", apice: "2,9" }
};

function getCorpoApice(diametro, b1one) {
    var key = diametro + "|" + b1one;
    if (corpoApiceData[key]) {
        return " (corpo Ø" + corpoApiceData[key].corpo + " apice Ø" + corpoApiceData[key].apice + ")";
    }
    return "";
}

function getDensitaColor(densita) {
    if (densita.indexOf('D1') !== -1) return 'red';
    if (densita.indexOf('D2') !== -1) return 'red';
    if (densita.indexOf('D3 → D2') !== -1) return 'darkorange';
    if (densita.indexOf('D3 → D4') !== -1) return 'green';
    if (densita.indexOf('D2 → D1') !== -1) return 'lightcoral';
    if (densita.indexOf('D3') !== -1) return 'lightsalmon';
    if (densita.indexOf('D4') !== -1) return 'lightgreen';
    return 'black';
}

function getB1OneColor(tipo) {
    if (tipo === 'High') return 'red';
    if (tipo === 'Medium') return 'orange';
    if (tipo === 'Low') return 'green';
    return 'black';
}

function getImpiantoIdeale(diametro, densita) {
    var tipo = null;
    if (diametro === "3.7" || diametro === "4.2" || diametro === "4.8") {
        if (densita === "D1" || densita === "D2" || densita === "D2 → D1") tipo = "High";
        else if (densita === "D3" || densita === "D3 → D2") tipo = "Medium";
        else if (densita === "D4" || densita === "D3 → D4") tipo = "Low";
    }
    if (!tipo) return "";
    var colori = { High: "#e74c3c", Medium: "#ff8800", Low: "#28a745" };
    return '<div class="result-block"><strong>🌟 Impianto ideale:</strong> <span style="color:' + colori[tipo] + '; font-weight:bold;">B1One ' + tipo + ' (Ø' + diametro + ')</span></div>';
}

function getDensitaBackgroundColor(densitaLabel) {
    if (!densitaLabel) return '#f9f9f9';
    
    // TENDENTI (colori sbiaditi) - controllare prima delle densità pure
    if (densitaLabel.indexOf('D2 → D1') !== -1 || densitaLabel === 'D2_D1') return '#ffcdd2'; // rosa sbiadito
    if (densitaLabel.indexOf('D3 → D2') !== -1 || densitaLabel === 'D3_D2') return '#ffe0b2'; // arancione sbiadito
    if (densitaLabel.indexOf('D3 → D4') !== -1 || densitaLabel === 'D3_D4') return '#c8e6c9'; // verde sbiadito
    
    // DENSITÀ PURE (colori netti/pieni)
    if (densitaLabel === 'D1' || (densitaLabel.indexOf('D1') !== -1 && densitaLabel.indexOf('→') === -1)) return '#ef5350'; // rosso netto
    if (densitaLabel === 'D2' || (densitaLabel.indexOf('D2') !== -1 && densitaLabel.indexOf('→') === -1)) return '#ffa726'; // arancione netto
    if (densitaLabel === 'D3' || (densitaLabel.indexOf('D3') !== -1 && densitaLabel.indexOf('→') === -1)) return '#ffee58'; // giallo netto
    if (densitaLabel === 'D4' || (densitaLabel.indexOf('D4') !== -1 && densitaLabel.indexOf('→') === -1)) return '#66bb6a'; // verde netto
    
    return '#f9f9f9';
}

// =============================================
// CALCOLI PROTOCOLLO
// =============================================

function applicaCalcoliLunghezza(testo, L) {
    if (!testo || typeof testo !== 'string') return testo;
    var len = parseFloat(L);
    if (isNaN(len)) return testo;

    testo = testo.replace(/2[–\-—]?3\s*mm\s*meno.*?(?:profondità)?/gi, function() {
        return "{{" + (len - 1.5) + "/" + (len - 2.5) + "mm}}";
    });
    testo = testo.replace(/[–\-—]\s*2\s*mm/gi, function() {
        return "{{" + (len - 1.5) + "mm}}";
    });
    testo = testo.replace(/[–\-—]\s*1\s*mm/gi, function() {
        return "{{" + (len - 0.5) + "mm}}";
    });
    testo = testo.replace(/\bcompleta\b/gi, function() {
        return "{{" + (len + 0.5) + "mm}}";
    });

    testo = testo.replace(/\{\{(.*?)\}\}/g, '<strong>($1)</strong>');
    return testo;
}

// =============================================
// FUNZIONE PER DETERMINARE IL COMPORTAMENTO DELLA FRESA DI TESTA
// Considera: densità ossea, posizione (mascellare/mandibolare), corticale
// =============================================

// Determina lo stato della testa: 'obbligatoria', 'non_indicata', 'a_discrezione', 'protocollo_specifico'
function getStatoTesta(denteNum, densita, corticale, postEstrattivo) {
    var dente = parseInt(denteNum);
    var isMascellare = (dente >= 11 && dente <= 28);
    var isMandibolare = (dente >= 31 && dente <= 48);
    
    // Normalizza densità
    var densitaNorm = densita ? densita.replace(/\s/g, '').replace('→', '_').toUpperCase() : '';
    
    // Classificazioni densità
    var isD4 = (densitaNorm === 'D4');
    var isD3D4 = (densitaNorm === 'D3_D4' || densitaNorm === 'D3→D4');
    var isD3 = (densitaNorm === 'D3');
    var isD3D2 = (densitaNorm === 'D3_D2' || densitaNorm === 'D3→D2');
    var isD2 = (densitaNorm === 'D2');
    var isD2D1 = (densitaNorm === 'D2_D1' || densitaNorm === 'D2→D1');
    var isD1 = (densitaNorm === 'D1');
    
    // Gruppi di densità
    var isOssoMoltoCompatto = (isD1 || isD2D1 || isD2 || isD3D2); // D1, D2→D1, D2, D3→D2
    var isOssoRarefatto = (isD4 || isD3D4); // D4, D3→D4
    
    // ============================================
    // REGOLA 1: Post-estrattivo → NO fresa di testa
    // ============================================
    if (postEstrattivo) {
        return 'non_indicata_post_estrattivo';
    }
    
    // ============================================
    // REGOLA 2: Corticale S → NO fresa di testa (qualsiasi arcata/densità)
    // ============================================
    if (corticale === 'S') {
        return 'non_indicata_corticale_sottile';
    }
    
    // ============================================
    // REGOLA 3: MASCELLARE
    // ============================================
    if (isMascellare) {
        // D4 o D3→D4 → NO
        if (isD4 || isD3D4) {
            return 'non_indicata_mascellare';
        }
        // Osso compatto (D1, D2→D1, D2, D3→D2) + Corticale H/N → Obbligatoria
        if (isOssoMoltoCompatto && (corticale === 'H' || corticale === 'N')) {
            return 'obbligatoria';
        }
    }
    
    // ============================================
    // REGOLA 4: MANDIBOLARE
    // ============================================
    if (isMandibolare) {
        // D4 + qualsiasi corticale → NO
        if (isD4) {
            return 'non_indicata_mandibolare_d4';
        }
        
        // D3→D4 + Corticale H/N → A discrezione
        if (isD3D4 && (corticale === 'H' || corticale === 'N')) {
            return 'a_discrezione';
        }
        
        // D3 + Corticale H/N → A discrezione
        if (isD3 && (corticale === 'H' || corticale === 'N')) {
            return 'a_discrezione';
        }
        
        // D1, D2→D1, D2, D3→D2 + Corticale H/N → Obbligatoria
        if (isOssoMoltoCompatto && (corticale === 'H' || corticale === 'N')) {
            return 'obbligatoria';
        }
    }
    
    // ============================================
    // REGOLA 5: Osso compatto (D1, D2→D1, D2, D3→D2) + Corticale H/N → Obbligatoria
    // ============================================
    if (isOssoMoltoCompatto && (corticale === 'H' || corticale === 'N')) {
        return 'obbligatoria';
    }
    
    // Se NON è selezionata la corticale → a discrezione
    if (!corticale) {
        return 'a_discrezione';
    }
    
    // Default → a discrezione
    return 'a_discrezione';
}

// Genera HTML per visualizzare lo stato della testa
function renderStatoTestaHTML(stato, testa, denteNum, densita, corticale) {
    if (!testa && stato !== 'obbligatoria') return '';
    
    var classificazione = corticale ? getClassificazioneOssea(corticale, densita) : null;
    var classLabel = classificazione ? ' <span style="color:#1565c0; font-weight:bold;">(' + classificazione + ')</span>' : '';
    
    switch(stato) {
        case 'obbligatoria':
            return '<div class="result-block" style="margin-top:10px; background:#e3f2fd; border-left:4px solid #1976d2; padding:8px;">' +
                '<strong>🔵 Preparazione Testa OBBLIGATORIA</strong>' + classLabel + ': ' + (testa || 'Secondo protocollo') +
                '<div style="font-size:11px; color:#666; margin-top:4px;">Corticale spessa richiede preparazione della testa</div>' +
                '</div>';
        
        case 'non_indicata':
            return '<div class="result-block" style="margin-top:10px; background:#ffebee; border-left:4px solid #d32f2f; padding:8px;">' +
                '<strong>🔴 Testa NON indicata</strong>' + classLabel +
                '<div style="font-size:11px; color:#666; margin-top:4px;">Corticale sottile/normale con spongiosa rarefatta: evitare fresa di testa</div>' +
                '</div>';
        
        case 'non_indicata_mascellare':
            return '<div class="result-block" style="margin-top:10px; background:#fff3e0; border-left:4px solid #ff9800; padding:8px;">' +
                '<strong>⚠️ Testa NON indicata</strong>: In osso D4/D3→D4 mascellare si sconsiglia la fresa di testa' +
                '</div>';
        
        case 'non_indicata_post_estrattivo':
            return '<div class="result-block" style="margin-top:10px; background:#fff3e0; border-left:4px solid #ff9800; padding:8px;">' +
                '<strong>⚠️ Testa NON indicata</strong>: Sito post-estrattivo - si sconsiglia la fresa di testa' +
                '</div>';
        
        case 'non_indicata_corticale_sottile':
            return '<div class="result-block" style="margin-top:10px; background:#ffebee; border-left:4px solid #d32f2f; padding:8px;">' +
                '<strong>🔴 Testa NON indicata</strong>: Corticale sottile (S) - evitare fresa di testa' +
                '</div>';
        
        case 'non_indicata_mandibolare_d4':
            return '<div class="result-block" style="margin-top:10px; background:#fff3e0; border-left:4px solid #ff9800; padding:8px;">' +
                '<strong>⚠️ Testa NON indicata</strong>: Osso D4 mandibolare - si sconsiglia la fresa di testa' +
                '</div>';
        
        case 'protocollo_specifico':
            return '<div class="result-block" style="margin-top:10px; background:#fff8e1; border-left:4px solid #ffc107; padding:8px;">' +
                '<strong>🟡 Testa: Valutare</strong>' + classLabel +
                '<div style="font-size:11px; color:#666; margin-top:4px;">Protocollo specifico in base a carico immediato/differito</div>' +
                '</div>';
        
        case 'a_discrezione':
        default:
            if (!testa) return '';
            return '<div class="result-block" style="margin-top:10px;">' +
                '<strong>🟢 Preparazione Testa (A discrezione)</strong> ' +
                '<button onclick="mostraInfoTesta()" style="cursor:pointer; display:inline-flex; align-items:center; justify-content:center; width:24px; height:24px; background:linear-gradient(145deg, #0077cc, #005599); color:white; border-radius:50%; font-size:14px; font-weight:bold; margin-left:8px; border:2px solid #004488; box-shadow:0 3px 6px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.3); font-family:Georgia,serif; font-style:italic;" title="Clicca per informazioni">i</button>' +
                ': ' + testa +
                '</div>';
    }
}

// Funzione legacy per compatibilità (ora usa getStatoTesta internamente)
function deveEscludereTesta(denteNum, densita, corticale, postEstrattivo) {
    var stato = getStatoTesta(denteNum, densita, corticale, postEstrattivo);
    return stato === 'non_indicata' || 
           stato === 'non_indicata_mascellare' || 
           stato === 'non_indicata_post_estrattivo' ||
           stato === 'non_indicata_corticale_sottile' ||
           stato === 'non_indicata_mandibolare_d4';
}

function getProtocolloDinamico(b1oneType, diametro, hu, caricoMode, lunghezzaImpianto) {
    var dKey = "D4";
    if (hu > 1250) dKey = "D1";
    else if (hu >= 1150) dKey = "D2_D1";
    else if (hu >= 850) dKey = "D2";
    else if (hu >= 700) dKey = "D3_D2";
    else if (hu >= 500) dKey = "D3";
    else if (hu >= 300) dKey = "D3_D4";

    try {
        var p = null;
        if (dbProtocolli[b1oneType] && dbProtocolli[b1oneType][diametro] && dbProtocolli[b1oneType][diametro][dKey]) {
            p = dbProtocolli[b1oneType][diametro][dKey][caricoMode];
        }
        if (!p) return { densita: dKey.replace("_", " → "), fresa: "Non definito", prep: "-", testa: "", noteGenerali: "", fresaNumerica: "?", lunghezzaNumerica: "-" };

        var noteGen = (dbProtocolli[b1oneType][diametro].__notes) || "";
        var prepCalcolata = applicaCalcoliLunghezza(p.prep, lunghezzaImpianto);

        var fresaMatch = p.fresa.match(/[\d.,]+/);
        var fresaNum = fresaMatch ? fresaMatch[0] : "?";
        
        // Gestisci caso speciale "F.lettrice" o "Fresa lettrice"
        if (p.fresa.toLowerCase().indexOf('lettrice') !== -1 || p.fresa.toLowerCase().indexOf('f.lettrice') !== -1) {
            fresaNum = "F.lettrice";
        }

        var lungNum = "-";
        var matchBold = prepCalcolata.match(/<strong>\(([\d.,]+)mm\)<\/strong>/);
        if (matchBold) {
            lungNum = matchBold[1] + "mm";
        }

        return {
            densita: dKey.replace("_", " → "),
            fresa: p.fresa,
            prep: prepCalcolata,
            fresaNumerica: fresaNum,
            lunghezzaNumerica: lungNum,
            testa: p.testa || "",
            noteGenerali: noteGen
        };
    } catch (e) {
        return { densita: dKey.replace("_", " → "), fresa: "Errore", prep: "Errore", fresaNumerica: "?", lunghezzaNumerica: "-", testa: "", noteGenerali: "" };
    }
}

// =============================================
// ELABORAZIONE PRINCIPALE
// =============================================

function elabora() {
    try {
        salvaStatoTutti();

        var nome = document.getElementById('nome').value;
        if (!nome || !nome.trim()) {
            showCustomAlert('Inserire Cognome e Nome del paziente');
            return;
        }

        if (selectedTeeth.length === 0) {
            showCustomAlert("Seleziona almeno un dente dall'odontogramma");
            return;
        }

        // Valida
        for (var i = 0; i < selectedTeeth.length; i++) {
            var dente = selectedTeeth[i];
            var data = impiantiData[dente];
            if (!data) {
                showCustomAlert('Dente ' + dente + ': Dati mancanti');
                return;
            }

            if (data.inputMode === 'hu') {
                if (!data.hu) {
                    showCustomAlert('Dente ' + dente + ': Inserisci un valore Hounsfield valido.');
                    return;
                }
            } else {
                if (!data.densitaClass) {
                    showCustomAlert('Dente ' + dente + ': Seleziona una classe di densità.');
                    return;
                }
            }
        }

        var impiantiElaborati = parseInt(localStorage.getItem(impiantiKey)) || 0;
        impiantiElaborati += selectedTeeth.length;
        localStorage.setItem(impiantiKey, impiantiElaborati);

        var output = '<h2 style="text-align:center; margin-bottom:20px;">Risultati per: ' + nome + '</h2>';

        for (var j = 0; j < selectedTeeth.length; j++) {
            var denteNum = selectedTeeth[j];
            var denteData = impiantiData[denteNum];

            var hu = parseInt(denteData.hu) || 0;
            if (denteData.inputMode === 'densita' && denteData.densitaClass) {
                var mappa = { "D1": 1300, "D2_D1": 1200, "D2": 1000, "D3_D2": 775, "D3": 600, "D3_D4": 400, "D4": 250 };
                hu = mappa[denteData.densitaClass] || 0;
            }

            var carico = (denteData.carico || denteData.post) ? 'compresso' : 'non compresso';
            var post = denteData.post ? 'si' : 'no';
            var b1one = denteData.b1one || 'High';
            var diametro = denteData.diametro || '3.7';
            var lunghezza = denteData.lunghezza || '10';

            var prep = getProtocolloDinamico(b1one, diametro, hu, carico, lunghezza);

            var coloreDensita = getDensitaColor(prep.densita);
            var coloreB1One = getB1OneColor(b1one);
            var drillDiam = prep.fresaNumerica;

            var labelHtml = '<div style="margin-bottom:6px; font-weight:900; font-size:16px; color:' + coloreB1One + '; background:#fff; border:1px solid #eee; padding:4px 8px; border-radius:6px;">' + b1one + ' Ø' + diametro + ' x ' + lunghezza + 'mm</div>';

            // Immagini locali
            var immaginiLocali = {
                "4.8_Medium": "48_Medium.png", "4.8_Low": "48_Low.png",
                "4.2_Low": "42_Low.png", "4.2_Medium": "42_Medium.png", "4.2_High": "42_High.png",
                "3.7_Low": "37_Low.png", "3.7_Medium": "37_Medium.png", "3.7_High": "37_High.png",
                "3.2_High": "32_High.png", "2.7_High": "27_High.png"
            };
            var imgKey = diametro + "_" + b1one;
            var placeholderSrc = 'https://placehold.co/150x250/e0f7fa/006064?text=' + b1one + '+' + diametro;
            var imgSrc = immaginiLocali[imgKey] || placeholderSrc;
            var imgTag = '<img src="' + imgSrc + '" onerror="this.onerror=null;this.src=\'' + placeholderSrc + '\';" style="max-height: 180px; border-radius:4px;">';

            // Bottone Indicazioni PDF
            var pdfFile = "";
            if (diametro === "2.7") pdfFile = "indicazioni_27high.pdf";
            else if (diametro === "3.2") pdfFile = "indicazioni_32high.pdf";
            else if (diametro === "3.7") pdfFile = "indicazioni_37.pdf";
            else if (diametro === "4.2") pdfFile = "indicazioni_42.pdf";
            else if (diametro === "4.8") pdfFile = "indicazioni_48.pdf";

            var btnHtml = pdfFile ? '<button onclick="window.open(\'' + pdfFile + '\', \'_blank\')" style="margin-top:8px; background: linear-gradient(to bottom, #17a2b8, #138496); color: white; padding: 6px 12px; border: none; border-radius: 20px; font-size: 12px; font-weight: bold; cursor: pointer; box-shadow: 0 2px 4px rgba(0,0,0,0.2); border-bottom: 2px solid #117a8b;">📄 Indicazioni</button>' : '';

            // Avviso per posizioni molari con impianti piccoli
            var avvisoResistenza = '';
            var dentiMolari = ["16","17","18","26","27","28","36","37","38","46","47","48"];
            if (dentiMolari.indexOf(String(denteNum)) !== -1) {
                if ((diametro === "2.7" && b1one === "High") || (diametro === "3.2" && b1one === "High") || (diametro === "3.7" && b1one === "Low")) {
                    avvisoResistenza = '<div style="color:red; font-weight:bold; margin-top:10px;">❌ Non consigliato per questa posizione: "resistenza insufficiente"</div>';
                }
            }

            // Gestione testa con corticale
            var corticale = denteData.corticale || '';
            var postEstrattivo = denteData.post || denteData.postEstrattivo || false;
            var statoTesta = getStatoTesta(denteNum, prep.densita, corticale, postEstrattivo);
            var testaHTML = renderStatoTestaHTML(statoTesta, prep.testa, denteNum, prep.densita, corticale);
            
            // Info classificazione ossea se presente
            var classificazioneOsseaHTML = '';
            if (corticale) {
                var classificazione = getClassificazioneOssea(corticale, denteData.densitaClass || huToClasse(hu));
                if (classificazione) {
                    var classOsseaInfo = getClassificazioneOsseaInfo(classificazione);
                    var cortInfo = getCorticaleInfo(corticale);
                    classificazioneOsseaHTML = '<div class="result-block" style="margin-top:10px; background:#e3f2fd; border-radius:8px; padding:10px;">' +
                        '<strong>🦴 Classificazione Ossea:</strong> ' +
                        '<span style="font-size:20px; font-weight:bold; color:#1565c0; margin-left:8px;">' + classificazione + '</span>' +
                        '<span style="font-size:12px; color:#666; margin-left:8px;">(' + (classOsseaInfo ? classOsseaInfo.desc : '') + ')</span>' +
                        '<div style="display:flex; align-items:center; gap:15px; margin-top:8px;">' +
                        '<div style="display:flex; align-items:center; gap:5px;">' +
                        '<span style="width:20px; height:20px; border-radius:50%; border:' + cortInfo.spessore + 'px solid ' + cortInfo.color + '; display:inline-block;"></span>' +
                        '<span style="font-size:12px;">Corticale ' + cortInfo.label + '</span>' +
                        '</div>' +
                        '</div></div>';
                }
            }

            output += '<div class="result-row" style="display: grid; grid-template-columns: 1fr 4px 1fr; gap: 20px; max-width: 1000px; margin: auto; align-items: start;">' +
                '<div class="result-content">' +
                '<div class="dente">🦷 Dente: ' + denteNum + '</div>' +
                avvisoResistenza +
                '<div class="densita" style="color:' + coloreDensita + '; text-shadow:1px 1px 2px gray;">🦴 Densità: ' + prep.densita + '</div>' +
                classificazioneOsseaHTML +
                getImpiantoIdeale(diametro, prep.densita) +
                '<div class="result-block"><strong>' + extractionIconSVG + ' Post-estrattivo:</strong> ' + (post === 'si' ? 'Sì <span style="color:red;">(rivalutare la densità ossea con il ROI)</span> <button onclick="mostraInfoROI()" style="cursor:pointer; display:inline-flex; align-items:center; justify-content:center; width:20px; height:20px; background:linear-gradient(145deg, #0077cc, #005599); color:white; border-radius:50%; font-size:12px; font-weight:bold; margin-left:4px; border:2px solid #004488; box-shadow:0 2px 4px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.3); font-family:Georgia,serif; font-style:italic;" title="Info sulla funzione ROI">i</button>' : 'No') + '</div>' +
                '<div class="result-block"><strong>🔩 B1One:</strong> <span style="color:' + coloreB1One + '; font-weight:bold;">' + b1one + ' Ø' + diametro + ' x ' + lunghezza + 'mm' + getCorpoApice(diametro, b1one) + '</span></div>' +
                '<div class="result-block"><strong>' + immediateLoadIconSVG + ' Carico immediato:</strong> ' + (carico === 'compresso' ? 'Sì' : 'No') + '</div>' +
                '<div class="result-block"><strong>' + drillIconSVG + ' Fresa Finale Ø:</strong> ' + drillDiam + ' mm</div>' +
                '<div class="result-block"><strong>📏 Preparazione in lunghezza:</strong> ' + prep.prep + '</div>' +
                (prep.noteGenerali ? '<div class="note-cliniche-box"><span class="note-cliniche-title">📝 Note Cliniche:</span><span class="note-cliniche-text">' + prep.noteGenerali + '</span></div>' : '') +
                testaHTML +
                '</div>' +
                '<div style="background-color: #007BFF; height: 100%; border-radius: 2px;"></div>' +
                '<div style="align-self: start; display: flex; flex-direction: column; align-items: center;">' +
                labelHtml +
                imgTag +
                btnHtml +
                '</div>' +
                '</div>';
        }

        document.getElementById('output').innerHTML = output;
        
        document.getElementById('output').scrollIntoView({ behavior: 'smooth' });
    } catch (err) {
        showCustomAlert("Errore: " + err.message);
    }
}

// =============================================
// SALVATAGGIO E CARICAMENTO
// =============================================

function resetta() {
    location.reload();
}

function salvaDati() {
    salvaStatoTutti();

    var nome = document.getElementById('nome').value || 'paziente';
    if (selectedTeeth.length === 0) {
        showCustomAlert("Seleziona almeno un dente prima di salvare.");
        return;
    }

    var dati = {
        paziente: nome,
        selectedTeeth: selectedTeeth,
        impianti: []
    };

    for (var i = 0; i < selectedTeeth.length; i++) {
        var dente = selectedTeeth[i];
        var data = impiantiData[dente] || {};
        dati.impianti.push({
            dente: dente,
            hu: data.hu || '',
            inputMode: data.inputMode || 'hu',
            densitaClass: data.densitaClass || '',
            carico: (data.carico || data.post) ? 'compresso' : 'non compresso',
            post: data.post ? 'si' : 'no',
            postEstrattivo: data.postEstrattivo ? 'si' : 'no',
            corticale: data.corticale || '',
            b1one: data.b1one || 'High',
            diametro: data.diametro || '3.7',
            lunghezza: data.lunghezza || '10'
        });
    }

    var blob = new Blob([JSON.stringify(dati, null, 2)], { type: "application/json" });
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url;
    a.download = "Dati_" + nome.replace(/\s+/g, "_") + ".json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function caricaDati(event) {
    var file = event.target.files[0];
    if (!file) return;
    var reader = new FileReader();
    reader.onload = function(e) {
        try {
            var dati = JSON.parse(e.target.result);
            if (!dati || !dati.impianti) {
                showCustomAlert("File non valido.");
                return;
            }

            document.getElementById('nome').value = dati.paziente || '';

            selectedTeeth = [];
            impiantiData = {};

            for (var i = 0; i < dati.impianti.length; i++) {
                var imp = dati.impianti[i];
                var dente = parseInt(imp.dente);
                if (!dente) continue;

                selectedTeeth.push(dente);
                impiantiData[dente] = {
                    hu: imp.hu || '',
                    densitaClass: imp.densitaClass || '',
                    inputMode: imp.inputMode || 'hu',
                    carico: imp.carico === 'compresso',
                    post: (imp.post === 'si' || imp.postEstrattivo === 'si'),
                    postEstrattivo: (imp.post === 'si' || imp.postEstrattivo === 'si'),
                    corticale: imp.corticale || '',
                    b1one: imp.b1one || 'High',
                    diametro: imp.diametro || '3.7',
                    lunghezza: imp.lunghezza || '10'
                };
            }

            selectedTeeth = ordinaDentiOdontogramma(selectedTeeth);

            initOdontogrammaSelector();
            aggiornaImpiantiContainer();
        } catch (err) {
            showCustomAlert("Errore file JSON.");
        }
    };
    reader.readAsText(file);
}

// =============================================
// EXPORT PDF
// =============================================

function esportaPDF() {
    var nome = document.getElementById('nome').value || 'paziente';
    var output = document.getElementById('output');
    if (output.innerHTML.indexOf('Risultati per:') === -1) {
        showCustomAlert("Non ci sono risultati da esportare.");
        return;
    }
    html2canvas(output, { scale: 2 }).then(function(canvas) {
        var imgData = canvas.toDataURL('image/jpeg', 1.0);
        var pdf = new window.jspdf.jsPDF('p', 'mm', 'a4');
        var pageWidth = pdf.internal.pageSize.getWidth();
        var pageHeight = pdf.internal.pageSize.getHeight();
        var imgProps = pdf.getImageProperties(imgData);
        var imgHeight = (imgProps.height * pageWidth) / imgProps.width;
        var position = 0;
        while (position < imgHeight) {
            pdf.addImage(imgData, 'JPEG', 0, -position, pageWidth, imgHeight);
            position += pageHeight;
            if (position < imgHeight) pdf.addPage();
        }
        pdf.save('Protocollo_B1One_' + nome.replace(/\s+/g, '_') + '.pdf');
    });
}

// =============================================
// FLUSSO DI PREPARAZIONE
// =============================================

function extractDiameter(text) {
    if (!text || typeof text !== 'string') return 0;
    var match = text.match(/(\d+[.,]\d+)/);
    return match ? parseFloat(match[1].replace(',', '.')) : 0;
}

// Nuova funzione per estrarre TUTTI i passaggi di fresatura dal testo di preparazione
function estraiTuttiPassaggi(prepText, fresaPrincipale, lunghezzaDefault) {
    var passaggi = [];
    var cleanText = prepText.replace(/<[^>]*>/g, ' ').replace(/<strong>/g, '').replace(/<\/strong>/g, '');
    
    // Pattern 1: trova tutti i "Ø X.X (Y.Ymm)" nel testo (diametri numerici)
    var pattern1 = /Ø\s*(\d+[.,]\d+)\s*[^\(]*?\((\d+[.,]?\d*)\s*mm\)/gi;
    var match;
    
    while ((match = pattern1.exec(cleanText)) !== null) {
        var diam = parseFloat(match[1].replace(',', '.'));
        var lung = match[2].replace(',', '.') + "mm";
        if (diam > 0) {
            passaggi.push({ diametro: diam, lunghezza: lung, tipo: 'fresa' });
        }
    }
    
    // Pattern 2: trova "Ø f.lettrice (Y.Ymm)" o "Ø F.lettrice (Y.Ymm)"
    var pattern2 = /Ø\s*f\.?lettrice\s*[^\(]*?\((\d+[.,]?\d*)\s*mm\)/gi;
    while ((match = pattern2.exec(cleanText)) !== null) {
        var lungLettrice = match[1].replace(',', '.') + "mm";
        // La fresa lettrice si posiziona tra Ø 2.3 e Ø 2.8, usiamo 2.5 come riferimento
        passaggi.push({ diametro: 2.5, lunghezza: lungLettrice, tipo: 'f.lettrice', label: 'F.lettrice' });
    }
    
    // Pattern 3: trova "Ø maschiatore X.X (Y.Ymm)"
    var pattern3 = /maschiatore\s*(\d+[.,]\d+)\s*[^\(]*?\((\d+[.,]?\d*)\s*mm\)/gi;
    while ((match = pattern3.exec(cleanText)) !== null) {
        var diamMasch = parseFloat(match[1].replace(',', '.'));
        var lungMasch = match[2].replace(',', '.') + "mm";
        if (diamMasch > 0) {
            passaggi.push({ diametro: diamMasch, lunghezza: lungMasch, tipo: 'maschiatore', label: 'Masch. ' + diamMasch });
        }
    }
    
    // Se non abbiamo trovato passaggi nel testo prep, usa la fresa principale
    if (passaggi.length === 0) {
        var diamPrinc = extractDiameter(fresaPrincipale);
        
        // Controlla se la fresa principale contiene F.lettrice
        var hasFLettrice = fresaPrincipale && fresaPrincipale.toLowerCase().indexOf('lettrice') !== -1;
        
        if (hasFLettrice) {
            // Se è F.lettrice (con o senza altro diametro)
            passaggi.push({ diametro: 2.5, lunghezza: lunghezzaDefault, tipo: 'f.lettrice', label: 'F.lettrice' });
            
            // Se c'è anche un diametro numerico (es. "2.8 oppure F.lettrice"), aggiungi anche quello
            if (diamPrinc > 0 && diamPrinc !== 2.5) {
                passaggi.push({ diametro: diamPrinc, lunghezza: lunghezzaDefault, tipo: 'fresa' });
            }
        } else if (diamPrinc > 0) {
            passaggi.push({ diametro: diamPrinc, lunghezza: lunghezzaDefault, tipo: 'fresa' });
        }
    }
    
    // Ordina i passaggi per diametro crescente
    passaggi.sort(function(a, b) { return a.diametro - b.diametro; });
    
    return passaggi;
}

function calcolaFresaComune() {
    salvaStatoTutti();
    
    if (selectedTeeth.length === 0) {
        return showCustomAlert("Seleziona prima gli impianti dall'odontogramma.");
    }

    var superiore = [];
    var inferiore = [];

    for (var i = 0; i < selectedTeeth.length; i++) {
        var dente = selectedTeeth[i];
        var data = impiantiData[dente];
        if (!data) continue;

        var hu = parseInt(data.hu) || 0;
        if (data.inputMode === 'densita' && data.densitaClass) {
            var mappa = { "D1": 1300, "D2_D1": 1200, "D2": 1000, "D3_D2": 775, "D3": 600, "D3_D4": 400, "D4": 250 };
            hu = mappa[data.densitaClass] || 0;
        }

        var carico = (data.carico || data.post) ? 'compresso' : 'non compresso';
        var b1one = data.b1one || 'High';
        var diametro = data.diametro || '3.7';
        var lunghezza = data.lunghezza || '10';

        var prep = getProtocolloDinamico(b1one, diametro, hu, carico, lunghezza);
        
        // Estrai TUTTI i passaggi di fresatura
        var passaggi = estraiTuttiPassaggi(prep.prep, prep.fresa, ((parseFloat(lunghezza) + 0.5) + "mm"));
        
        // Trova il diametro finale per questo dente
        // ECCEZIONE: se il dente ha F.lettrice, quella è la fresa finale
        var diametroFinale = 0;
        var haFLettrice = false;
        
        for (var p = 0; p < passaggi.length; p++) {
            if (passaggi[p].tipo === 'f.lettrice' || passaggi[p].label === 'F.lettrice') {
                haFLettrice = true;
                diametroFinale = passaggi[p].diametro; // F.lettrice è la fresa finale
                break;
            }
        }
        
        // Se non ha F.lettrice, usa il diametro massimo
        if (!haFLettrice) {
            for (var p = 0; p < passaggi.length; p++) {
                if (passaggi[p].diametro > diametroFinale) {
                    diametroFinale = passaggi[p].diametro;
                }
            }
        }
        
        if (passaggi.length > 0) {
            // Determina stato testa con corticale
            var corticale = data.corticale || '';
            var postEstrattivo = data.post || data.postEstrattivo || false;
            var statoTesta = getStatoTesta(dente, prep.densita, corticale, postEstrattivo);
            var headPrepValue = '';
            if (statoTesta === 'obbligatoria') {
                headPrepValue = prep.testa || 'Secondo protocollo';
            } else if (statoTesta === 'a_discrezione') {
                headPrepValue = prep.testa;
            }
            
            var item = {
                id: i + 1,
                dente: dente,
                diam: diametroFinale,  // Diametro finale (per determinare lo STOP)
                passaggi: passaggi,     // TUTTI i passaggi di fresatura
                prepText: prep.prep,
                impDiam: diametro,
                impLen: lunghezza,
                b1Type: b1one,
                densityLabel: prep.densita,
                headPrep: headPrepValue,
                statoTesta: statoTesta,
                corticale: corticale
            };

            if (dente >= 10 && dente <= 29) superiore.push(item);
            else if (dente >= 30 && dente <= 49) inferiore.push(item);
        }
    }

    if (superiore.length === 0 && inferiore.length === 0) {
        return showCustomAlert("Nessun impianto valido trovato per il calcolo.");
    }

    function getDensColor(d) {
        // TENDENTI (colori sbiaditi)
        if (d.indexOf('D2 → D1') !== -1 || d === 'D2_D1') return '#ffcdd2';
        if (d.indexOf('D3 → D2') !== -1 || d === 'D3_D2') return '#ffe0b2';
        if (d.indexOf('D3 → D4') !== -1 || d === 'D3_D4') return '#c8e6c9';
        // DENSITÀ PURE (colori netti)
        if (d === 'D1' || (d.indexOf('D1') !== -1 && d.indexOf('→') === -1)) return '#ef5350';
        if (d === 'D2' || (d.indexOf('D2') !== -1 && d.indexOf('→') === -1)) return '#ffa726';
        if (d === 'D3' || (d.indexOf('D3') !== -1 && d.indexOf('→') === -1)) return '#ffee58';
        if (d === 'D4' || (d.indexOf('D4') !== -1 && d.indexOf('→') === -1)) return '#66bb6a';
        return '#f9f9f9';
    }

    function generaRiepilogoImpianti(items) {
        if (items.length === 0) return "";
        items = ordinaDentiOdontogrammaOggetti(items, 'dente');
        var html = '<div style="margin-bottom:15px; background:#eef; padding:10px; border-radius:6px; font-size:13px; border:1px solid #ccf;">' +
            '<div style="font-weight:bold; margin-bottom:5px; color:#004085;">📋 Riepilogo Impianti:</div>' +
            '<div style="display:flex; flex-wrap:wrap; gap:10px;">';

        for (var i = 0; i < items.length; i++) {
            var item = items[i];
            var bgCol = getDensColor(item.densityLabel);
            var prefix = item.b1Type.charAt(0);
            html += '<div style="background:' + bgCol + '; padding:4px 8px; border-radius:4px; border:1px solid #ccc; box-shadow:0 1px 2px rgba(0,0,0,0.1);">' +
                '<strong>#' + item.dente + '</strong>: ' + prefix + ' Ø' + item.impDiam + ' x ' + item.impLen + 'mm</div>';
        }

        html += '</div>' +
            '<div style="margin-top:10px; display:flex; gap:8px; font-size:10px; align-items:center; flex-wrap:wrap;">' +
            '<span style="font-weight:bold; color:#555;">Legenda:</span>' +
            '<span style="display:flex;align-items:center;gap:2px;"><span style="width:10px;height:10px;background:#ef5350;border:1px solid #999;border-radius:50%"></span>D1</span>' +
            '<span style="display:flex;align-items:center;gap:2px;"><span style="width:10px;height:10px;background:#ffcdd2;border:1px solid #999;border-radius:50%"></span>D2→D1</span>' +
            '<span style="display:flex;align-items:center;gap:2px;"><span style="width:10px;height:10px;background:#ffa726;border:1px solid #999;border-radius:50%"></span>D2</span>' +
            '<span style="display:flex;align-items:center;gap:2px;"><span style="width:10px;height:10px;background:#ffe0b2;border:1px solid #999;border-radius:50%"></span>D3→D2</span>' +
            '<span style="display:flex;align-items:center;gap:2px;"><span style="width:10px;height:10px;background:#ffee58;border:1px solid #999;border-radius:50%"></span>D3</span>' +
            '<span style="display:flex;align-items:center;gap:2px;"><span style="width:10px;height:10px;background:#c8e6c9;border:1px solid #999;border-radius:50%"></span>D3→D4</span>' +
            '<span style="display:flex;align-items:center;gap:2px;"><span style="width:10px;height:10px;background:#66bb6a;border:1px solid #999;border-radius:50%"></span>D4</span>' +
            '</div>' +
            '<div style="margin-top:5px; display:flex; gap:10px; font-size:10px; align-items:center; flex-wrap:wrap; background:#e3f2fd; padding:4px 8px; border-radius:4px;">' +
            '<span style="font-weight:bold; color:#1565c0;">Corticale:</span>' +
            '<span style="display:flex;align-items:center;gap:2px;"><span style="width:12px;height:12px;background:#fff;border:4px solid #1565c0;border-radius:50%;box-sizing:border-box;"></span>H</span>' +
            '<span style="display:flex;align-items:center;gap:2px;"><span style="width:12px;height:12px;background:#fff;border:3px solid #1976d2;border-radius:50%;box-sizing:border-box;"></span>N</span>' +
            '<span style="display:flex;align-items:center;gap:2px;"><span style="width:12px;height:12px;background:#fff;border:2px solid #64b5f6;border-radius:50%;box-sizing:border-box;"></span>S</span>' +
            '<span style="display:flex;align-items:center;gap:2px;"><span style="width:12px;height:12px;background:#fff;border:2px solid #333;border-radius:50%;box-sizing:border-box;"></span>-</span>' +
            '</div></div>';
        return html;
    }

    function generaSequenzaArcata(items, nomeArcata, coloreBordo) {
        if (items.length === 0) return "";
        
        // Raccogli TUTTI i diametri da TUTTI i passaggi di TUTTI i denti
        // Usa un oggetto per tenere traccia anche delle etichette speciali
        var tuttiDiametriMap = {};
        for (var x = 0; x < items.length; x++) {
            var passaggi = items[x].passaggi || [];
            for (var p = 0; p < passaggi.length; p++) {
                var key = passaggi[p].diametro.toFixed(2);
                if (!tuttiDiametriMap[key]) {
                    tuttiDiametriMap[key] = {
                        diametro: passaggi[p].diametro,
                        label: passaggi[p].label || null,
                        tipo: passaggi[p].tipo || 'fresa'
                    };
                }
                // Se troviamo un label, lo salviamo
                if (passaggi[p].label && !tuttiDiametriMap[key].label) {
                    tuttiDiametriMap[key].label = passaggi[p].label;
                    tuttiDiametriMap[key].tipo = passaggi[p].tipo;
                }
            }
        }
        
        var tuttiDiametri = Object.keys(tuttiDiametriMap).map(function(k) { 
            return tuttiDiametriMap[k]; 
        });
        tuttiDiametri.sort(function(a, b) { return a.diametro - b.diametro; });

        var html = '<div style="margin-bottom:25px; text-align:left;">' +
            '<h3 style="color:' + coloreBordo + '; font-size:18px; text-transform:uppercase; border-bottom:2px solid ' + coloreBordo + '; padding-bottom:5px; margin-bottom:10px;">' + nomeArcata + '</h3>' +
            generaRiepilogoImpianti(items) +
            '<div style="margin-top:10px;">';

        var headPrepItems = [];
        var stepCounter = 0;

        for (var index = 0; index < tuttiDiametri.length; index++) {
            var dInfo = tuttiDiametri[index];
            var d = dInfo.diametro;
            
            var dentiConQuestoDiametro = [];
            var dentiCheSiFermano = []; // Denti la cui fresa finale è questo diametro
            var mappaLunghezzaFinale = {}; // Per sapere la lunghezza finale di ogni dente per questa fresa
            
            for (var i = 0; i < items.length; i++) {
                var item = items[i];
                
                // Includi TUTTI i denti che hanno diametro finale >= d
                if (item.diam < d - 0.05) continue;
                
                var passaggi = item.passaggi || [];
                var lunghezzaPerQuestoDiam = null;
                
                // Cerca la lunghezza per questo diametro specifico
                for (var j = 0; j < passaggi.length; j++) {
                    if (Math.abs(passaggi[j].diametro - d) < 0.05) {
                        lunghezzaPerQuestoDiam = passaggi[j].lunghezza;
                        break;
                    }
                }
                
                // Se non ha questo diametro, usa la lunghezza del primo passaggio con diametro > d
                if (!lunghezzaPerQuestoDiam) {
                    for (var j = 0; j < passaggi.length; j++) {
                        if (passaggi[j].diametro > d) {
                            lunghezzaPerQuestoDiam = passaggi[j].lunghezza;
                            break;
                        }
                    }
                }
                
                // Fallback alla lunghezza impianto
                if (!lunghezzaPerQuestoDiam) {
                    lunghezzaPerQuestoDiam = (parseFloat(item.impLen) + 0.5) + "mm";
                }
                
                dentiConQuestoDiametro.push({
                    dente: item.dente,
                    lunghezza: lunghezzaPerQuestoDiam,
                    item: item
                });
                
                mappaLunghezzaFinale[item.dente] = parseFloat(lunghezzaPerQuestoDiam);
                
                // Controlla se questo è il diametro finale (massimo) per il dente
                if (Math.abs(item.diam - d) < 0.05) {
                    dentiCheSiFermano.push(item.dente);
                    // Aggiungi alla lista per preparazione testa
                    if (item.headPrep) {
                        var found = false;
                        for (var hp = 0; hp < headPrepItems.length; hp++) {
                            if (headPrepItems[hp].id === item.id) { found = true; break; }
                        }
                        if (!found) headPrepItems.push(item);
                    }
                }
            }
            
            if (dentiConQuestoDiametro.length === 0) continue;
            
            stepCounter++;
            
            // Raggruppa per lunghezza
            var gruppiLunghezza = {};
            for (var k = 0; k < dentiConQuestoDiametro.length; k++) {
                var lKey = dentiConQuestoDiametro[k].lunghezza;
                if (!gruppiLunghezza[lKey]) gruppiLunghezza[lKey] = [];
                gruppiLunghezza[lKey].push(dentiConQuestoDiametro[k]);
            }
            
            var sortedLengths = Object.keys(gruppiLunghezza).sort(function(a, b) {
                var valA = parseFloat(a) || 0;
                var valB = parseFloat(b) || 0;
                return valA - valB;
            });
            
            var passText = "";
            for (var s = 0; s < sortedLengths.length; s++) {
                var lenKey = sortedLengths[s];
                var lenValue = parseFloat(lenKey) || 0;
                
                // Per questa lunghezza, includi TUTTI i denti che hanno lunghezza >= lenValue
                var dentiPerQuestaLunghezza = [];
                for (var kk = 0; kk < dentiConQuestoDiametro.length; kk++) {
                    var denteLung = parseFloat(dentiConQuestoDiametro[kk].lunghezza) || 0;
                    if (denteLung >= lenValue - 0.1) {
                        dentiPerQuestaLunghezza.push(dentiConQuestoDiametro[kk]);
                    }
                }
                
                // Ordina i denti numericamente
                dentiPerQuestaLunghezza = ordinaDentiOdontogrammaOggetti(dentiPerQuestaLunghezza, 'dente');
                
                // Costruisci stringa con numeri rossi per chi si ferma a questa lunghezza
                var teethArr = [];
                for (var tt = 0; tt < dentiPerQuestaLunghezza.length; tt++) {
                    var denteNum = dentiPerQuestaLunghezza[tt].dente;
                    var siFermaQui = dentiCheSiFermano.indexOf(denteNum) !== -1 && 
                                     Math.abs(mappaLunghezzaFinale[denteNum] - lenValue) < 0.1;
                    if (siFermaQui) {
                        teethArr.push('<strong style="color:#d32f2f;">' + denteNum + '</strong>');
                    } else {
                        teethArr.push('<strong>' + denteNum + '</strong>');
                    }
                }
                var teethStr = teethArr.join(", ");
                passText += '<div style="margin-bottom:4px; padding-left:10px;">• ' + teethStr + ' <span style="color:#1976d2; font-style:italic;">(a L ' + lenKey + ')</span></div>';
            }
            
            var stoppersStr = "";
            if (dentiCheSiFermano.length > 0) {
                dentiCheSiFermano = ordinaDentiOdontogramma(dentiCheSiFermano);
                stoppersStr = '<div style="margin-top:8px; margin-left:32px; padding-top:4px; border-top:1px dashed #ccc; color:#d32f2f; font-size:13px; font-weight:bold;">🛑 STOP (Fresa Finale) per: ' + dentiCheSiFermano.join(", ") + '</div>';
            }
            
            // Determina l'etichetta da mostrare
            var fresaLabel = dInfo.label ? dInfo.label : ('Ø ' + d.toFixed(1));

            html += '<div style="background:' + (stepCounter % 2 === 1 ? '#f9f9f9' : '#fff') + '; padding:12px; border-left:5px solid ' + coloreBordo + '; margin-bottom:10px; border-radius:4px; box-shadow:0 1px 3px rgba(0,0,0,0.05);">' +
                '<div style="font-size:16px; font-weight:bold; color:#333; margin-bottom:5px; display:flex; align-items:center;">' +
                '<span style="background:' + coloreBordo + '; color:white; width:24px; height:24px; border-radius:50%; display:inline-flex; justify-content:center; align-items:center; margin-right:8px; font-size:14px;">' + stepCounter + '</span>' +
                'Fresa ' + fresaLabel +
                '</div>' +
                '<div style="color:#555; font-size:14px; margin-left:32px;">' +
                '<div style="margin-top:4px;">' + passText + '</div>' +
                '</div>' +
                stoppersStr +
                '</div>';
        }

        // Preparazione testa - raccoglie TUTTI i denti con info sulla testa
        var noTestaItems = [];
        var siTestaItems = [];
        
        // Raccogli tutti i denti con il loro stato testa
        for (var ti = 0; ti < items.length; ti++) {
            var toothItem = items[ti];
            var stato = toothItem.statoTesta || 'a_discrezione';
            
            if (stato === 'non_indicata_post_estrattivo') {
                noTestaItems.push({ dente: toothItem.dente, motivo: 'post-estrattivo' });
            } else if (stato === 'non_indicata_corticale_sottile') {
                noTestaItems.push({ dente: toothItem.dente, motivo: 'cort. S' });
            } else if (stato === 'non_indicata_mascellare' || stato === 'non_indicata_mandibolare_d4') {
                noTestaItems.push({ dente: toothItem.dente, motivo: 'osso D4' });
            } else if (stato === 'non_indicata') {
                noTestaItems.push({ dente: toothItem.dente, motivo: 'non indicata' });
            } else if (stato === 'obbligatoria') {
                siTestaItems.push({ dente: toothItem.dente, prep: toothItem.headPrep || 'Ø 4mm', tipo: 'obbligatoria' });
            } else if (stato === 'a_discrezione' && (toothItem.headPrep || toothItem.corticale)) {
                siTestaItems.push({ dente: toothItem.dente, prep: toothItem.headPrep || 'Ø 4mm', tipo: 'a_discrezione' });
            }
        }
        
        // Ordina secondo odontogramma
        noTestaItems = ordinaDentiOdontogrammaOggetti(noTestaItems, 'dente');
        siTestaItems = ordinaDentiOdontogrammaOggetti(siTestaItems, 'dente');
        
        // Mostra sezione testa
        if (siTestaItems.length > 0 || noTestaItems.length > 0) {
            html += '<div style="background:#fff3cd; padding:12px; border-left:5px solid #ffc107; margin-bottom:10px; border-radius:4px; box-shadow:0 1px 3px rgba(0,0,0,0.05); margin-top:20px;">';
            
            // Sezione Sì Testa
            if (siTestaItems.length > 0) {
                html += '<div style="font-size:16px; font-weight:bold; color:#856404; margin-bottom:5px; display:flex; align-items:center;">' +
                    '<span style="font-size:18px; margin-right:5px;">🟢</span> Preparazione Testa <button onclick="mostraInfoTesta()" style="cursor:pointer; display:inline-flex; align-items:center; justify-content:center; width:24px; height:24px; background:linear-gradient(145deg, #0077cc, #005599); color:white; border-radius:50%; font-size:14px; font-weight:bold; margin-left:8px; border:2px solid #004488; box-shadow:0 3px 6px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.3); font-family:Georgia,serif; font-style:italic;" title="Clicca per informazioni">i</button></div>' +
                    '<div style="margin-left:32px; color:#555; font-size:14px;">' +
                    '<p style="margin:0 0 5px 0;">Effettuare solo dopo l\'ultimo passaggio di fresa:</p>';
                
                for (var si = 0; si < siTestaItems.length; si++) {
                    var siItem = siTestaItems[si];
                    if (siItem.tipo === 'obbligatoria') {
                        html += '<div style="margin-bottom:4px;">• <strong style="color:#1976d2;">' + siItem.dente + '</strong>: ' + siItem.prep + ' (obbligatoria)</div>';
                    } else {
                        html += '<div style="margin-bottom:4px;">• <strong>' + siItem.dente + '</strong>: a discrezione ' + siItem.prep + '</div>';
                    }
                }
                html += '</div>';
            }
            
            // Sezione No Testa
            if (noTestaItems.length > 0) {
                html += '<div style="font-size:16px; font-weight:bold; color:#d32f2f; margin-top:10px; margin-bottom:5px; display:flex; align-items:center;">' +
                    '<span style="font-size:18px; margin-right:5px;">❌</span> No Preparazione Testa</div>' +
                    '<div style="margin-left:32px; color:#666; font-size:14px;">';
                
                for (var ni = 0; ni < noTestaItems.length; ni++) {
                    html += '<div style="margin-bottom:4px;">• <strong>' + noTestaItems[ni].dente + '</strong> <span style="font-size:12px;">(' + noTestaItems[ni].motivo + ')</span></div>';
                }
                html += '</div>';
            }
            
            html += '</div>';
        }

        html += '</div></div>';
        return html;
    }

    var msg = '<div id="sequenza-content">';

    var nomePaziente = document.getElementById('nome').value || "Paziente";
    msg += '<div style="text-align:center; margin-bottom:20px; border-bottom:1px solid #eee; padding-bottom:10px;">' +
        '<h2 style="margin:0; color:#333;">Sequenza di Preparazione</h2>' +
        '<p style="margin:5px 0 0 0; color:#666;">' + nomePaziente + '</p>' +
        '</div>';

    msg += generaSequenzaArcata(superiore, "Arcata Superiore", "#0056b3");
    msg += generaSequenzaArcata(inferiore, "Arcata Inferiore", "#28a745");
    msg += '</div>';

    msg = '<div style="text-align:right; margin-bottom:10px;">' +
        '<button onclick="esportaSequenzaPDF()" style="background:#dc3545; color:white; border:none; padding:6px 12px; border-radius:4px; cursor:pointer; font-weight:bold;">📄 Scarica PDF Sequenza</button>' +
        '</div>' + msg;

    showCustomAlert(msg, "📊 Flusso di Preparazione");
}

function esportaSequenzaPDF() {
    var element = document.getElementById('sequenza-content');
    if (!element) {
        showCustomAlert("Contenuto non trovato.");
        return;
    }
    html2canvas(element, { scale: 2 }).then(function(canvas) {
        var imgData = canvas.toDataURL('image/jpeg', 1.0);
        var pdf = new window.jspdf.jsPDF('p', 'mm', 'a4');
        var pageWidth = pdf.internal.pageSize.getWidth();
        var pageHeight = pdf.internal.pageSize.getHeight();
        var imgProps = pdf.getImageProperties(imgData);
        var imgHeight = (imgProps.height * pageWidth) / imgProps.width;
        var position = 0;
        while (position < imgHeight) {
            pdf.addImage(imgData, 'JPEG', 0, -position, pageWidth, imgHeight);
            position += pageHeight;
            if (position < imgHeight) pdf.addPage();
        }
        var nome = document.getElementById('nome').value || 'paziente';
        pdf.save('Sequenza_Preparazione_' + nome.replace(/\s+/g, '_') + '.pdf');
    });
}

// =============================================
// SINTESI PREPARAZIONE UNIFICATA
// Combina odontogramma + flusso di lavoro
// =============================================

function mostraSintesiPreparazione() {
    try {
        salvaStatoTutti();
        
        if (selectedTeeth.length === 0) {
            showCustomAlert("Seleziona prima gli impianti dall'odontogramma.");
            return;
        }

        // Raccogli dati impianti per entrambe le arcate
        var superiori = [];
        var inferiori = [];
        var implantMap = {};

        for (var i = 0; i < selectedTeeth.length; i++) {
            var dente = selectedTeeth[i];
            var data = impiantiData[dente];
            if (!data) continue;

            var hu = parseInt(data.hu) || 0;
            if (data.inputMode === 'densita' && data.densitaClass) {
                var mappa = { "D1": 1300, "D2_D1": 1200, "D2": 1000, "D3_D2": 775, "D3": 600, "D3_D4": 400, "D4": 250 };
                hu = mappa[data.densitaClass] || 0;
            }

            var carico = (data.carico || data.post) ? 'compresso' : 'non compresso';
            var b1one = data.b1one || 'High';
            var diametro = data.diametro || '3.7';
            var lunghezza = data.lunghezza || '10';

            var prep = getProtocolloDinamico(b1one, diametro, hu, carico, lunghezza);
            var bgColor = getDensitaBackgroundColor(prep.densita);
            var typeLetter = b1one ? b1one.charAt(0).toUpperCase() : "?";

            // Per l'odontogramma
            var drillSteps = parseDrillSteps(prep.prep);
            var drillInfoHTML = "";
            
            // Se parseDrillSteps ha trovato passaggi, usali
            if (drillSteps.length > 0) {
                for (var s = 0; s < drillSteps.length; s++) {
                    var step = drillSteps[s];
                    if (step.isLettrice) {
                        drillInfoHTML += '<div style="font-size:14px;">F.Lett L' + step.len + '</div>';
                    } else if (step.isMaschiatore) {
                        drillInfoHTML += '<div style="font-size:14px;">M' + step.diam + ' L' + step.len + '</div>';
                    } else {
                        drillInfoHTML += '<div style="font-size:14px;">Ø' + step.diam + ' L' + step.len + '</div>';
                    }
                }
            } else {
                // Fallback: usa la fresa finale dal protocollo
                if (prep.fresa && prep.fresa !== "Non definito" && prep.fresa !== "Errore") {
                    drillInfoHTML += '<div style="font-size:14px;">Ø' + prep.fresa + ' L' + lunghezza + '</div>';
                }
            }
            
            // Gestione testa con corticale
            var corticale = data.corticale || '';
            var postEstrattivo = data.post || data.postEstrattivo || false;
            var statoTesta = getStatoTesta(dente, prep.densita, corticale, postEstrattivo);
            
            if (statoTesta === 'obbligatoria') {
                drillInfoHTML += '<div style="color:#1976d2; font-weight:bold; font-size:13px; border-top:1px solid #ccc; margin-top:3px; padding-top:2px;">T.' + (prep.testa || 'Ø 4mm') + '</div>';
            } else if (statoTesta === 'non_indicata_post_estrattivo') {
                drillInfoHTML += '<div style="color:#d32f2f; font-size:11px; border-top:1px solid #ccc; margin-top:3px; padding-top:2px;">❌ No T.<br>(post-estr.)</div>';
            } else if (statoTesta === 'non_indicata_corticale_sottile') {
                drillInfoHTML += '<div style="color:#d32f2f; font-size:11px; border-top:1px solid #ccc; margin-top:3px; padding-top:2px;">❌ No T.<br>(cort. S)</div>';
            } else if (statoTesta === 'non_indicata_mascellare' || statoTesta === 'non_indicata_mandibolare_d4') {
                drillInfoHTML += '<div style="color:#ff9800; font-size:11px; border-top:1px solid #ccc; margin-top:3px; padding-top:2px;">⚠️ No T.<br>(osso D4)</div>';
            } else if (statoTesta === 'a_discrezione') {
                if (prep.testa || corticale) {
                    drillInfoHTML += '<div style="color:#2e7d32; font-size:11px; border-top:1px solid #ccc; margin-top:3px; padding-top:2px;">T.a discrez.<br>' + (prep.testa || 'Ø 4mm') + '</div>';
                }
            }

            implantMap[dente] = {
                typeLetter: typeLetter,
                diametroImp: diametro,
                lunghezzaImp: lunghezza,
                bgColor: bgColor,
                drillInfoHTML: drillInfoHTML,
                densita: prep.densita,
                corticale: corticale,
                hasLink: data.hasLink || false
            };

            // Per il flusso di preparazione
            var passaggi = estraiTuttiPassaggi(prep.prep, prep.fresa, ((parseFloat(lunghezza) + 0.5) + "mm"));
            var diametroFinale = 0;
            var haFLettrice = false;
            
            for (var p = 0; p < passaggi.length; p++) {
                if (passaggi[p].tipo === 'f.lettrice' || passaggi[p].label === 'F.lettrice') {
                    haFLettrice = true;
                    diametroFinale = passaggi[p].diametro;
                    break;
                }
            }
            if (!haFLettrice) {
                for (var p = 0; p < passaggi.length; p++) {
                    if (passaggi[p].diametro > diametroFinale) diametroFinale = passaggi[p].diametro;
                }
            }

            var item = {
                dente: dente,
                diam: diametroFinale,
                passaggi: passaggi,
                impDiam: diametro,
                impLen: lunghezza,
                b1Type: b1one,
                densityLabel: prep.densita,
                headPrep: (statoTesta === 'obbligatoria') ? (prep.testa || 'Secondo protocollo') : 
                          (statoTesta === 'a_discrezione' ? prep.testa : ''),
                statoTesta: statoTesta,
                corticale: corticale
            };

            if (dente >= 10 && dente <= 29) superiori.push(item);
            else if (dente >= 30 && dente <= 49) inferiori.push(item);
        }

        // Determina quale arcata mostrare (solo quella con impianti)
        var haSuperiore = superiori.length > 0;
        var haInferiore = inferiori.length > 0;

        // Genera contenuto odontogramma
        var upperTeeth = [18, 17, 16, 15, 14, 13, 12, 11, 21, 22, 23, 24, 25, 26, 27, 28];
        var lowerTeeth = [48, 47, 46, 45, 44, 43, 42, 41, 31, 32, 33, 34, 35, 36, 37, 38];

        function createToothHTML(toothNum, data) {
            // Determina bordo in base alla corticale
            var borderStyle = 'border:1px solid #ddd;';
            if (data) {
                if (data.corticale === 'H') {
                    borderStyle = 'border:6px solid #1565c0;';
                } else if (data.corticale === 'N') {
                    borderStyle = 'border:4px solid #1976d2;';
                } else if (data.corticale === 'S') {
                    borderStyle = 'border:2px solid #64b5f6;';
                } else {
                    borderStyle = 'border:3px solid #333;';
                }
            }
            var bgStyle = data ? 'background:' + data.bgColor + '; ' + borderStyle : 'background:#f0f0f0; border:1px solid #ddd;';
            var circleContent = data ? 
                '<div style="font-weight:bold; font-size:16px;">' + data.typeLetter + ' ' + data.diametroImp + '</div>' +
                '<div style="font-size:15px;">' + data.lunghezzaImp + '</div>' : '';
            var infoBox = data ? '<div style="font-size:14px; margin-top:5px; line-height:1.4; font-weight:600; color:#333;">' + data.drillInfoHTML + '</div>' : '';
            
            // Cerchio viola per Link
            var linkStyle = (data && data.hasLink) ? 
                'display:inline-flex; align-items:center; justify-content:center; width:22px; height:22px; border:3px solid #7b1fa2; border-radius:50%; background:#f3e5f5;' : 
                '';
            var toothNumHTML = (data && data.hasLink) ?
                '<div style="' + linkStyle + '"><span style="font-size:13px; font-weight:bold; color:#333;">' + toothNum + '</span></div>' :
                '<div style="font-size:13px; font-weight:bold; color:#333;">' + toothNum + '</div>';
            
            return '<div style="display:flex; flex-direction:column; align-items:center; width:62px; margin:3px;">' +
                toothNumHTML +
                '<div style="width:56px; height:56px; border-radius:50%; display:flex; flex-direction:column; align-items:center; justify-content:center; margin-top:2px; ' + bgStyle + '">' + circleContent + '</div>' +
                infoBox +
                '</div>';
        }

        var nomePaziente = document.getElementById('nome').value || "Paziente";

        // Costruisci HTML del foglio - LAYOUT VERTICALE: Odontogramma sopra, Flusso sotto
        var html = '<div style="text-align:center; margin-bottom:12px;">' +
            '<h1 style="color:#0056b3; margin:0; font-size:26px;">SINTESI PREPARAZIONE</h1>' +
            '<p style="font-size:18px; font-weight:bold; color:#333; margin:5px 0;">' + nomePaziente + '</p>' +
            '</div>';

        // SEZIONE 1: Odontogramma (solo arcata/e con impianti)
        if (haSuperiore) {
            html += '<div style="font-weight:bold; font-size:14px; color:#0056b3; margin-bottom:5px; text-align:center;">ARCATA SUPERIORE</div>';
            html += '<div style="display:flex; justify-content:center; flex-wrap:nowrap; margin-bottom:10px;">';
            for (var u = 0; u < upperTeeth.length; u++) {
                html += createToothHTML(upperTeeth[u], implantMap[upperTeeth[u]]);
            }
            html += '</div>';
        }
        
        if (haInferiore) {
            html += '<div style="font-weight:bold; font-size:14px; color:#28a745; margin-bottom:5px; text-align:center;">ARCATA INFERIORE</div>';
            html += '<div style="display:flex; justify-content:center; flex-wrap:nowrap; margin-bottom:10px;">';
            for (var l = 0; l < lowerTeeth.length; l++) {
                html += createToothHTML(lowerTeeth[l], implantMap[lowerTeeth[l]]);
            }
            html += '</div>';
        }
        
        // Legenda compatta sotto l'odontogramma
        html += '<div style="display:flex; justify-content:center; gap:8px; font-size:8px; color:#666; margin:5px 0 10px 0; padding:5px; background:#f9f9f9; border-radius:4px; flex-wrap:wrap;">';
        html += '<span style="font-weight:bold;">Legenda:</span>';
        html += '<span style="display:flex;align-items:center;gap:2px;"><span style="width:8px;height:8px;background:#ef5350;border:1px solid #999;border-radius:50%"></span>D1</span>';
        html += '<span style="display:flex;align-items:center;gap:2px;"><span style="width:8px;height:8px;background:#ffcdd2;border:1px solid #999;border-radius:50%"></span>D2→D1</span>';
        html += '<span style="display:flex;align-items:center;gap:2px;"><span style="width:8px;height:8px;background:#ffa726;border:1px solid #999;border-radius:50%"></span>D2</span>';
        html += '<span style="display:flex;align-items:center;gap:2px;"><span style="width:8px;height:8px;background:#ffe0b2;border:1px solid #999;border-radius:50%"></span>D3→D2</span>';
        html += '<span style="display:flex;align-items:center;gap:2px;"><span style="width:8px;height:8px;background:#ffee58;border:1px solid #999;border-radius:50%"></span>D3</span>';
        html += '<span style="display:flex;align-items:center;gap:2px;"><span style="width:8px;height:8px;background:#c8e6c9;border:1px solid #999;border-radius:50%"></span>D3→D4</span>';
        html += '<span style="display:flex;align-items:center;gap:2px;"><span style="width:8px;height:8px;background:#66bb6a;border:1px solid #999;border-radius:50%"></span>D4</span>';
        html += '</div>';
        
        // Legenda corticale e Link
        html += '<div style="display:flex; justify-content:center; gap:12px; font-size:9px; color:#666; margin:0 0 10px 0; padding:5px; background:#e3f2fd; border-radius:4px; flex-wrap:wrap;">';
        html += '<span style="font-weight:bold; color:#1565c0;">Corticale:</span>';
        html += '<span style="display:flex;align-items:center;gap:3px;"><span style="width:14px;height:14px;background:#fff;border:5px solid #1565c0;border-radius:50%;box-sizing:border-box;"></span>H (&gt;2mm)</span>';
        html += '<span style="display:flex;align-items:center;gap:3px;"><span style="width:14px;height:14px;background:#fff;border:3px solid #1976d2;border-radius:50%;box-sizing:border-box;"></span>N (2mm)</span>';
        html += '<span style="display:flex;align-items:center;gap:3px;"><span style="width:14px;height:14px;background:#fff;border:2px solid #64b5f6;border-radius:50%;box-sizing:border-box;"></span>S (&lt;2mm)</span>';
        html += '<span style="display:flex;align-items:center;gap:3px;"><span style="width:14px;height:14px;background:#fff;border:2px solid #333;border-radius:50%;box-sizing:border-box;"></span>Non sel.</span>';
        html += '<span style="margin-left:10px; font-weight:bold; color:#7b1fa2;">Link:</span>';
        html += '<span style="display:flex;align-items:center;gap:3px;"><span style="width:16px;height:16px;background:#f3e5f5;border:3px solid #7b1fa2;border-radius:50%;box-sizing:border-box;font-size:8px;display:flex;align-items:center;justify-content:center;">18</span></span>';
        html += '</div>';
        
        // SEZIONE 2: Flusso di lavoro - layout orizzontale multi-colonna
        html += '<div style="border-top:3px solid #333; padding-top:12px; margin-top:5px;">';
        html += '<div style="font-weight:bold; font-size:18px; color:#333; margin-bottom:12px; text-align:center;">FLUSSO DI LAVORO</div>';
        
        // Container per le arcate in orizzontale
        html += '<div style="display:flex; gap:40px; justify-content:center;">';
        
        // Genera flusso per ciascuna arcata
        function generaFlussoCompatto(items, nomeArcata, colore) {
            if (items.length === 0) return "";
            
            var tuttiDiametriMap = {};
            for (var x = 0; x < items.length; x++) {
                var passaggi = items[x].passaggi || [];
                for (var p = 0; p < passaggi.length; p++) {
                    var key = passaggi[p].diametro.toFixed(2);
                    if (!tuttiDiametriMap[key]) {
                        tuttiDiametriMap[key] = {
                            diametro: passaggi[p].diametro,
                            label: passaggi[p].label || null,
                            tipo: passaggi[p].tipo || 'fresa'
                        };
                    }
                    if (passaggi[p].label && !tuttiDiametriMap[key].label) {
                        tuttiDiametriMap[key].label = passaggi[p].label;
                        tuttiDiametriMap[key].tipo = passaggi[p].tipo;
                    }
                }
            }
            
            var tuttiDiametri = Object.keys(tuttiDiametriMap).map(function(k) { return tuttiDiametriMap[k]; });
            tuttiDiametri.sort(function(a, b) { return a.diametro - b.diametro; });

            var flussoHTML = '<div style="margin-bottom:15px;">' +
                '<div style="font-weight:bold; font-size:16px; color:' + colore + '; border-bottom:2px solid ' + colore + '; padding-bottom:5px; margin-bottom:10px;">' + nomeArcata + '</div>';
            
            var headPrepItems = [];
            var stepsHTML = []; // Array per raccogliere tutti gli step
            var stepNum = 0;

            for (var idx = 0; idx < tuttiDiametri.length; idx++) {
                var dInfo = tuttiDiametri[idx];
                var d = dInfo.diametro;
                
                var dentiConQuestoDiametro = [];
                var dentiCheSiFermano = []; // Denti che hanno diametro finale == d
                var mappaLunghezzaFinale = {}; // Per sapere la lunghezza finale di ogni dente per questa fresa
                
                for (var i = 0; i < items.length; i++) {
                    var item = items[i];
                    
                    // Includi TUTTI i denti che hanno diametro finale >= d
                    if (item.diam < d - 0.05) continue;
                    
                    var passaggi = item.passaggi || [];
                    var lunghezzaPerQuestoDiam = null;
                    
                    // Cerca la lunghezza per questo diametro specifico
                    for (var j = 0; j < passaggi.length; j++) {
                        if (Math.abs(passaggi[j].diametro - d) < 0.05) {
                            lunghezzaPerQuestoDiam = passaggi[j].lunghezza;
                            break;
                        }
                    }
                    
                    // Se non ha questo diametro, usa la lunghezza del primo passaggio con diametro > d
                    if (!lunghezzaPerQuestoDiam) {
                        for (var j = 0; j < passaggi.length; j++) {
                            if (passaggi[j].diametro > d) {
                                lunghezzaPerQuestoDiam = passaggi[j].lunghezza;
                                break;
                            }
                        }
                    }
                    
                    // Fallback alla lunghezza impianto
                    if (!lunghezzaPerQuestoDiam) {
                        lunghezzaPerQuestoDiam = (parseFloat(item.impLen) + 0.5) + "mm";
                    }
                    
                    dentiConQuestoDiametro.push({
                        dente: item.dente,
                        lunghezza: lunghezzaPerQuestoDiam,
                        item: item
                    });
                    
                    mappaLunghezzaFinale[item.dente] = parseFloat(lunghezzaPerQuestoDiam);
                    
                    // Se il diametro finale del dente == d, si ferma qui
                    if (Math.abs(item.diam - d) < 0.05) {
                        dentiCheSiFermano.push(item.dente);
                        if (item.headPrep) headPrepItems.push(item);
                    }
                }
                
                if (dentiConQuestoDiametro.length === 0) continue;
                stepNum++;
                
                // Raggruppa per lunghezza
                var gruppiLung = {};
                for (var k = 0; k < dentiConQuestoDiametro.length; k++) {
                    var lKey = dentiConQuestoDiametro[k].lunghezza;
                    if (!gruppiLung[lKey]) gruppiLung[lKey] = [];
                    gruppiLung[lKey].push(dentiConQuestoDiametro[k].dente);
                }
                
                var fresaLabel = dInfo.label ? dInfo.label : ('Ø ' + d.toFixed(1));
                
                var stepHTML = '<div style="background:' + (stepNum % 2 === 1 ? '#f5f5f5' : '#fff') + '; padding:8px 12px; margin-bottom:6px; border-left:5px solid ' + colore + '; border-radius:4px; flex:1; min-width:200px;">';
                stepHTML += '<div style="font-weight:bold; font-size:18px; color:#333;">';
                stepHTML += '<span style="background:' + colore + '; color:white; width:26px; height:26px; border-radius:50%; display:inline-flex; justify-content:center; align-items:center; margin-right:8px; font-size:15px;">' + stepNum + '</span>';
                stepHTML += 'Fresa ' + fresaLabel + '</div>';
                
                // Denti per lunghezza - dalla più corta alla più lunga
                var sortedLengths = Object.keys(gruppiLung).sort(function(a, b) { return parseFloat(a) - parseFloat(b); });
                
                for (var s = 0; s < sortedLengths.length; s++) {
                    var lenKey = sortedLengths[s];
                    var lenValue = parseFloat(lenKey);
                    
                    // Per questa lunghezza, includi TUTTI i denti che hanno lunghezza >= lenValue
                    var dentiPerQuestaLunghezza = [];
                    for (var kk = 0; kk < dentiConQuestoDiametro.length; kk++) {
                        var denteLung = parseFloat(dentiConQuestoDiametro[kk].lunghezza);
                        if (denteLung >= lenValue - 0.1) {
                            dentiPerQuestaLunghezza.push(dentiConQuestoDiametro[kk].dente);
                        }
                    }
                    
                    var dentiArr = ordinaDentiOdontogramma(dentiPerQuestaLunghezza);
                    
                    // Costruisci stringa con numeri rossi per chi si ferma a questa lunghezza
                    var dentiStrArr = [];
                    for (var dd = 0; dd < dentiArr.length; dd++) {
                        var denteNum = dentiArr[dd];
                        var siFermaQui = dentiCheSiFermano.indexOf(denteNum) !== -1 && 
                                         Math.abs(mappaLunghezzaFinale[denteNum] - lenValue) < 0.1;
                        if (siFermaQui) {
                            dentiStrArr.push('<span style="color:#d32f2f;">' + denteNum + '</span>');
                        } else {
                            dentiStrArr.push('' + denteNum);
                        }
                    }
                    
                    stepHTML += '<div style="font-size:16px; margin-left:36px; color:#333; margin-top:3px;">• <strong>' + dentiStrArr.join(", ") + '</strong> <span style="color:#1976d2;">(L ' + lenKey + ')</span></div>';
                }
                
                // STOP
                if (dentiCheSiFermano.length > 0) {
                    dentiCheSiFermano = ordinaDentiOdontogramma(dentiCheSiFermano);
                    stepHTML += '<div style="color:#d32f2f; font-size:15px; font-weight:bold; margin-left:36px; margin-top:4px;">🛑 STOP: ' + dentiCheSiFermano.join(", ") + '</div>';
                }
                
                stepHTML += '</div>';
                stepsHTML.push(stepHTML);
            }
            
            // Disponi gli step in righe da max 2 elementi ciascuna (quindi colonne affiancate)
            flussoHTML += '<div style="display:flex; flex-wrap:wrap; gap:10px;">';
            for (var st = 0; st < stepsHTML.length; st++) {
                flussoHTML += stepsHTML[st];
            }
            flussoHTML += '</div>';
            
            // Preparazione testa - raccoglie TUTTI i denti con info sulla testa
            var noTestaItems = [];
            var siTestaItems = [];
            
            // Raccogli tutti i denti con il loro stato testa
            for (var ti = 0; ti < items.length; ti++) {
                var toothItem = items[ti];
                var stato = toothItem.statoTesta || 'a_discrezione';
                
                if (stato === 'non_indicata_post_estrattivo') {
                    noTestaItems.push({ dente: toothItem.dente, motivo: 'post-estrattivo' });
                } else if (stato === 'non_indicata_corticale_sottile') {
                    noTestaItems.push({ dente: toothItem.dente, motivo: 'cort. S' });
                } else if (stato === 'non_indicata_mascellare' || stato === 'non_indicata_mandibolare_d4') {
                    noTestaItems.push({ dente: toothItem.dente, motivo: 'osso D4' });
                } else if (stato === 'non_indicata') {
                    noTestaItems.push({ dente: toothItem.dente, motivo: 'non indicata' });
                } else if (stato === 'obbligatoria') {
                    siTestaItems.push({ dente: toothItem.dente, prep: toothItem.headPrep || 'Ø 4mm', tipo: 'obbligatoria' });
                } else if (stato === 'a_discrezione' && (toothItem.headPrep || toothItem.corticale)) {
                    siTestaItems.push({ dente: toothItem.dente, prep: toothItem.headPrep || 'Ø 4mm', tipo: 'a_discrezione' });
                }
            }
            
            // Ordina secondo odontogramma
            noTestaItems = ordinaDentiOdontogrammaOggetti(noTestaItems, 'dente');
            siTestaItems = ordinaDentiOdontogrammaOggetti(siTestaItems, 'dente');
            
            // Mostra sezione testa
            if (siTestaItems.length > 0 || noTestaItems.length > 0) {
                flussoHTML += '<div style="background:#fff3cd; padding:8px 12px; border-left:5px solid #ffc107; border-radius:4px; margin-top:8px;">';
                
                // Sezione Sì Testa
                if (siTestaItems.length > 0) {
                    flussoHTML += '<div style="font-weight:bold; font-size:15px; color:#856404;">🟢 Preparazione Testa <button onclick="mostraInfoTesta()" style="cursor:pointer; display:inline-flex; align-items:center; justify-content:center; width:24px; height:24px; background:linear-gradient(145deg, #0077cc, #005599); color:white; border-radius:50%; font-size:14px; font-weight:bold; margin-left:8px; border:2px solid #004488; box-shadow:0 3px 6px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.3); font-family:Georgia,serif; font-style:italic;" title="Clicca per informazioni">i</button></div>';
                    var prepTestaStr = [];
                    for (var si = 0; si < siTestaItems.length; si++) {
                        var siItem = siTestaItems[si];
                        if (siItem.tipo === 'obbligatoria') {
                            prepTestaStr.push('<strong style="color:#1976d2;">' + siItem.dente + '</strong>: ' + siItem.prep);
                        } else {
                            prepTestaStr.push('<strong>' + siItem.dente + '</strong>: a discrezione ' + siItem.prep);
                        }
                    }
                    flussoHTML += '<div style="font-size:14px; margin-left:12px; margin-top:2px;">' + prepTestaStr.join(' | ') + '</div>';
                }
                
                // Sezione No Testa
                if (noTestaItems.length > 0) {
                    flussoHTML += '<div style="font-weight:bold; font-size:15px; color:#d32f2f; margin-top:8px;">❌ No Preparazione Testa</div>';
                    var noTestaStr = [];
                    for (var ni = 0; ni < noTestaItems.length; ni++) {
                        noTestaStr.push('<strong>' + noTestaItems[ni].dente + '</strong> <span style="font-size:12px;">(' + noTestaItems[ni].motivo + ')</span>');
                    }
                    flussoHTML += '<div style="font-size:14px; margin-left:12px; margin-top:2px; color:#666;">' + noTestaStr.join(' | ') + '</div>';
                }
                
                flussoHTML += '</div>';
            }
            
            flussoHTML += '</div>';
            return flussoHTML;
        }
        
        if (haSuperiore) html += generaFlussoCompatto(superiori, "Arcata Superiore", "#0056b3");
        if (haInferiore) html += generaFlussoCompatto(inferiori, "Arcata Inferiore", "#28a745");
        
        html += '</div>'; // Fine container flex arcate
        html += '</div>'; // Fine sezione flusso

        // Mostra nel foglio
        var overlay = document.getElementById('odonto-overlay');
        var sheet = document.getElementById('odonto-sheet');
        
        // Imposta stile foglio orizzontale A4 landscape
        sheet.style.cssText = 'background:white; padding:12px 15px; width:290mm; min-height:190mm; box-sizing:border-box; font-family:Arial,sans-serif;';
        sheet.innerHTML = html;
        
        overlay.style.display = 'flex';

    } catch (e) {
        console.error(e);
        showCustomAlert("Errore durante la generazione della sintesi: " + e.message);
    }
}

function esportaSintesiPDF() {
    var element = document.getElementById('odonto-sheet');
    if (!element) {
        showCustomAlert("Contenuto non trovato.");
        return;
    }
    
    html2canvas(element, { 
        scale: 2,
        useCORS: true,
        logging: false
    }).then(function(canvas) {
        var imgData = canvas.toDataURL('image/jpeg', 0.95);
        var pdf = new window.jspdf.jsPDF('l', 'mm', 'a4'); // 'l' = landscape
        var pageWidth = pdf.internal.pageSize.getWidth();
        var pageHeight = pdf.internal.pageSize.getHeight();
        
        var imgProps = pdf.getImageProperties(imgData);
        var imgWidth = pageWidth - 10; // margine 5mm per lato
        var imgHeight = (imgProps.height * imgWidth) / imgProps.width;
        
        // Centra verticalmente se entra in una pagina
        var yOffset = Math.max(5, (pageHeight - imgHeight) / 2);
        
        pdf.addImage(imgData, 'JPEG', 5, yOffset, imgWidth, imgHeight);
        
        var nome = document.getElementById('nome').value || 'paziente';
        pdf.save('Sintesi_Preparazione_' + nome.replace(/\s+/g, '_') + '.pdf');
    }).catch(function(error) {
        console.error('Errore PDF:', error);
        showCustomAlert("Errore durante la generazione del PDF.");
    });
}

// =============================================
// FUNZIONI HELPER ODONTOGRAMMA (mantenute per compatibilità)
// =============================================

function parseDrillSteps(prepText) {
    var steps = [];
    var cleanText = prepText.replace(/<[^>]*>/g, '');
    
    // Pattern 1: trova "Ø X.X (Y.Ymm)" - diametri numerici con lunghezza
    var regex1 = /Ø\s*([\d.,]+)\s*[^\(]*?\(([\d.,]+)\s*mm\)/gi;
    var match;
    while ((match = regex1.exec(cleanText)) !== null) {
        steps.push({
            diam: match[1].replace(',', '.'),
            len: match[2].replace(',', '.')
        });
    }
    
    // Pattern 2: trova "Ø f.lettrice (Y.Ymm)"
    var regex2 = /Ø\s*f\.?lettrice\s*[^\(]*?\(([\d.,]+)\s*mm\)/gi;
    while ((match = regex2.exec(cleanText)) !== null) {
        steps.push({
            diam: 'Lett.',
            len: match[1].replace(',', '.'),
            isLettrice: true
        });
    }
    
    // Pattern 3: trova "maschiatore X.X (Y.Ymm)"
    var regex3 = /maschiatore\s*([\d.,]+)\s*[^\(]*?\(([\d.,]+)\s*mm\)/gi;
    while ((match = regex3.exec(cleanText)) !== null) {
        steps.push({
            diam: 'M' + match[1].replace(',', '.'),
            len: match[2].replace(',', '.'),
            isMaschiatore: true
        });
    }
    
    // Pattern 4: trova "ØX.X –2 mm" (sottopreparazione) - estrai solo il diametro
    var regex4 = /Ø\s*([\d.,]+)\s*[–\-]\s*2\s*mm/gi;
    while ((match = regex4.exec(cleanText)) !== null) {
        var diamFound = match[1].replace(',', '.');
        // Verifica che non sia già presente
        var exists = steps.some(function(s) { return s.diam === diamFound; });
        if (!exists) {
            steps.push({
                diam: diamFound,
                len: '-2', // Indica sottopreparazione
                isSottoprep: true
            });
        }
    }
    
    // Pattern 5: trova "Ø X.X completa" senza parentesi
    var regex5 = /Ø\s*([\d.,]+)\s*(?:mm)?\s*completa/gi;
    while ((match = regex5.exec(cleanText)) !== null) {
        var diamFound = match[1].replace(',', '.');
        // Verifica che non sia già presente
        var exists = steps.some(function(s) { return s.diam === diamFound; });
        if (!exists) {
            steps.push({
                diam: diamFound,
                len: 'C' // Indica completa
            });
        }
    }
    
    // Ordina per diametro (dal più piccolo al più grande)
    steps.sort(function(a, b) {
        var diamA = parseFloat(a.diam) || 0;
        var diamB = parseFloat(b.diam) || 0;
        return diamA - diamB;
    });

    return steps;
}

function mostraOdontogramma() {
    try {
        salvaStatoTutti();
        
        if (selectedTeeth.length === 0) {
            showCustomAlert("Nessun impianto selezionato.");
            return;
        }

        var overlay = document.getElementById('odonto-overlay');
        if (!overlay) {
            showCustomAlert("Errore interfaccia: Overlay non trovato.");
            return;
        }

        overlay.style.display = 'flex';
        document.getElementById('odonto-patient-name').innerText = "Paziente: " + (document.getElementById('nome').value || "Sconosciuto");

        var upperGrid = document.getElementById('grid-upper');
        var lowerGrid = document.getElementById('grid-lower');
        upperGrid.innerHTML = '';
        lowerGrid.innerHTML = '';

        var upperTeeth = [18, 17, 16, 15, 14, 13, 12, 11, 21, 22, 23, 24, 25, 26, 27, 28];
        var lowerTeeth = [48, 47, 46, 45, 44, 43, 42, 41, 31, 32, 33, 34, 35, 36, 37, 38];

        var implantMap = {};

        for (var i = 0; i < selectedTeeth.length; i++) {
            var dente = selectedTeeth[i];
            var data = impiantiData[dente];
            if (!data) continue;

            var hu = parseInt(data.hu) || 0;
            if (data.inputMode === 'densita' && data.densitaClass) {
                var mappa = { "D1": 1300, "D2_D1": 1200, "D2": 1000, "D3_D2": 775, "D3": 600, "D3_D4": 400, "D4": 250 };
                hu = mappa[data.densitaClass] || 0;
            }

            var carico = (data.carico || data.post) ? 'compresso' : 'non compresso';
            var b1one = data.b1one || 'High';
            var diametro = data.diametro || '3.7';
            var lunghezza = data.lunghezza || '10';

            var prep = getProtocolloDinamico(b1one, diametro, hu, carico, lunghezza);
            var bgColor = getDensitaBackgroundColor(prep.densita);
            var typeLetter = b1one ? b1one.charAt(0).toUpperCase() : "?";

            var drillSteps = parseDrillSteps(prep.prep);

            var drillInfoHTML = "";
            if (drillSteps.length > 0) {
                for (var s = 0; s < drillSteps.length; s++) {
                    var step = drillSteps[s];
                    if (step.isLettrice) {
                        drillInfoHTML += '<div>F.Lett. L' + step.len + '</div>';
                    } else if (step.isMaschiatore) {
                        drillInfoHTML += '<div>Masch.' + step.diam + ' L' + step.len + '</div>';
                    } else {
                        drillInfoHTML += '<div>F Ø' + step.diam + ' L' + step.len + '</div>';
                    }
                }
            } else {
                drillInfoHTML = '<div>F Ø' + prep.fresaNumerica + ' L' + prep.lunghezzaNumerica + '</div>';
            }

            // Gestione testa con corticale
            var corticale = data.corticale || '';
            var postEstrattivo = data.post || data.postEstrattivo || false;
            var statoTesta = getStatoTesta(dente, prep.densita, corticale, postEstrattivo);
            if (statoTesta === 'obbligatoria') {
                drillInfoHTML += '<div style="color:#1976d2; font-weight:bold; border-top:1px solid #ccc; margin-top:2px;">Testa ' + (prep.testa || 'Ø 4mm') + '</div>';
            } else if (statoTesta === 'non_indicata_post_estrattivo') {
                drillInfoHTML += '<div style="color:#d32f2f; font-size:11px; border-top:1px solid #ccc; margin-top:2px;">❌ No Testa (post-estr.)</div>';
            } else if (statoTesta === 'non_indicata_corticale_sottile') {
                drillInfoHTML += '<div style="color:#d32f2f; font-size:11px; border-top:1px solid #ccc; margin-top:2px;">❌ No Testa (cort. S)</div>';
            } else if (statoTesta === 'non_indicata_mascellare' || statoTesta === 'non_indicata_mandibolare_d4') {
                drillInfoHTML += '<div style="color:#ff9800; font-size:11px; border-top:1px solid #ccc; margin-top:2px;">⚠️ No Testa (osso D4)</div>';
            } else if (statoTesta === 'a_discrezione') {
                if (prep.testa || corticale) {
                    drillInfoHTML += '<div style="color:#2e7d32; font-size:11px; border-top:1px solid #ccc; margin-top:2px;">T.a discrez. ' + (prep.testa || 'Ø 4mm') + '</div>';
                }
            }

            implantMap[dente] = {
                typeLetter: typeLetter,
                diametroImp: diametro,
                lunghezzaImp: lunghezza,
                bgColor: bgColor,
                drillInfoHTML: drillInfoHTML,
                corticale: corticale,
                hasLink: data.hasLink || false
            };
        }

        for (var u = 0; u < upperTeeth.length; u++) {
            upperGrid.appendChild(createToothElement(upperTeeth[u], implantMap[upperTeeth[u]]));
        }
        for (var l = 0; l < lowerTeeth.length; l++) {
            lowerGrid.appendChild(createToothElement(lowerTeeth[l], implantMap[lowerTeeth[l]]));
        }

    } catch (e) {
        console.error(e);
        showCustomAlert("Errore durante la generazione dell'odontogramma: " + e.message);
    }
}

function createToothElement(toothNum, data) {
    var div = document.createElement('div');
    div.className = 'tooth-container';
    if (data) div.classList.add('active');

    // Determina bordo in base alla corticale
    var borderColor = '#555';
    var borderWidth = '3px';
    if (data) {
        if (data.corticale === 'H') {
            borderColor = '#1565c0';
            borderWidth = '6px';
        } else if (data.corticale === 'N') {
            borderColor = '#1976d2';
            borderWidth = '4px';
        } else if (data.corticale === 'S') {
            borderColor = '#64b5f6';
            borderWidth = '2px';
        }
    }

    var bgStyle = data ? 'background-color:' + data.bgColor + '; border-color:' + borderColor + '; border-width:' + borderWidth + '; color:#000; box-shadow:0 2px 5px rgba(0,0,0,0.15);' : '';

    var circleContent = data ? '<div style="line-height:1.1;"><div class="tooth-imp-diam">' + data.typeLetter + ' ' + data.diametroImp + '</div><div class="tooth-imp-len">' + data.lunghezzaImp + '</div></div>' : '';

    var infoBox = data ? '<div class="tooth-info" style="margin-top:4px;">' + data.drillInfoHTML + '</div>' : '';

    // Cerchio viola per Link
    var toothNumHTML = (data && data.hasLink) ?
        '<div class="tooth-number" style="display:inline-flex; align-items:center; justify-content:center; min-width:22px; height:22px; border:3px solid #7b1fa2; border-radius:50%; background:#f3e5f5; padding:0 2px;">' + toothNum + '</div>' :
        '<div class="tooth-number">' + toothNum + '</div>';

    div.innerHTML = toothNumHTML +
        '<div class="tooth-circle" style="' + bgStyle + '">' + circleContent + '</div>' +
        infoBox;
    return div;
}

function closeOdonto() {
    document.getElementById('odonto-overlay').style.display = 'none';
}

function esportaOdontogrammaPDF() {
    var element = document.getElementById('odonto-sheet');
    var originalBorder = element.style.border;
    element.style.border = "none";
    html2canvas(element, { scale: 2 }).then(function(canvas) {
        element.style.border = originalBorder;
        var imgData = canvas.toDataURL('image/jpeg', 1.0);
        var pdf = new window.jspdf.jsPDF('l', 'mm', 'a4');
        var pdfWidth = pdf.internal.pageSize.getWidth();
        var imgProps = pdf.getImageProperties(imgData);
        var imgHeight = (imgProps.height * pdfWidth) / imgProps.width;
        pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, imgHeight);
        var nome = document.getElementById('nome').value || 'paziente';
        pdf.save('Sintesi_Odontogramma_' + nome.replace(/\s+/g, '_') + '.pdf');
    });
}

function mostraLogin() {
    document.getElementById("loginBox").style.display = "block";
}

function verificaLogin() {
    var pass = document.getElementById("adminPass").value;
    if (pass === "b1admin") {
        document.getElementById("accessiCount").textContent = localStorage.getItem(accessiKey) || 0;
        document.getElementById("impiantiCount").textContent = localStorage.getItem(impiantiKey) || 0;
        document.getElementById("adminArea").style.display = "block";
        document.getElementById("loginBox").style.display = "none";
    } else {
        showCustomAlert("Password Admin Errata.");
    }
}

function apriEditor() {
    document.getElementById("editor-overlay").style.display = "flex";
    renderEditorTable();
}


function renderEditorTable() {
    var b1one = document.getElementById("edit-b1one").value;
    var diam = document.getElementById("edit-diametro").value;
    var tbody = document.getElementById("editor-tbody");
    tbody.innerHTML = "";

    if (!dbProtocolli[b1one] || !dbProtocolli[b1one][diam]) {
        tbody.innerHTML = "<tr><td colspan='5' style='text-align:center; padding:20px; color:red;'>Nessun protocollo definito per questa combinazione.</td></tr>";
        return;
    }
    if (Object.keys(dbProtocolli[b1one][diam]).length === 0) {
        tbody.innerHTML = "<tr><td colspan='5' style='text-align:center; padding:20px; color:red;'>Combinazione non valida per il sistema B1One.</td></tr>";
        return;
    }

    var currentNotes = dbProtocolli[b1one][diam].__notes || "";
    var notesEl = document.getElementById("edit-general-notes");
    if (notesEl) notesEl.value = currentNotes;

    var densities = ["D1", "D2_D1", "D2", "D3_D2", "D3", "D3_D4", "D4"];
    var densityLabels = {
        "D1": "D1 (>1250 HU)", "D2_D1": "D2 → D1", "D2": "D2",
        "D3_D2": "D3 → D2", "D3": "D3", "D3_D4": "D3 → D4", "D4": "D4 (<250 HU)"
    };

    for (var i = 0; i < densities.length; i++) {
        var dKey = densities[i];
        var dataRow = dbProtocolli[b1one][diam][dKey];
        if (!dataRow) continue;

        var tr1 = document.createElement("tr");
        tr1.innerHTML = '<td rowspan="2" style="font-weight:bold; vertical-align:middle;">' + densityLabels[dKey] + '</td>' +
            '<td>Differito</td>' +
            '<td><textarea oninput="updateDB(\'' + b1one + '\',\'' + diam + '\',\'' + dKey + '\',\'non compresso\',\'fresa\', this.value)">' + (dataRow["non compresso"].fresa || '') + '</textarea></td>' +
            '<td><textarea oninput="updateDB(\'' + b1one + '\',\'' + diam + '\',\'' + dKey + '\',\'non compresso\',\'prep\', this.value)">' + (dataRow["non compresso"].prep || '') + '</textarea></td>' +
            '<td><input type="text" value="' + (dataRow["non compresso"].testa || '') + '" oninput="updateDB(\'' + b1one + '\',\'' + diam + '\',\'' + dKey + '\',\'non compresso\',\'testa\', this.value)"></td>';
        tbody.appendChild(tr1);

        var tr2 = document.createElement("tr");
        tr2.innerHTML = '<td style="color:var(--accent); font-weight:bold;">Immediato</td>' +
            '<td><textarea oninput="updateDB(\'' + b1one + '\',\'' + diam + '\',\'' + dKey + '\',\'compresso\',\'fresa\', this.value)">' + (dataRow["compresso"].fresa || '') + '</textarea></td>' +
            '<td><textarea oninput="updateDB(\'' + b1one + '\',\'' + diam + '\',\'' + dKey + '\',\'compresso\',\'prep\', this.value)">' + (dataRow["compresso"].prep || '') + '</textarea></td>' +
            '<td><input type="text" value="' + (dataRow["compresso"].testa || '') + '" oninput="updateDB(\'' + b1one + '\',\'' + diam + '\',\'' + dKey + '\',\'compresso\',\'testa\', this.value)"></td>';
        tbody.appendChild(tr2);
    }
}

function updateDB(b1, diam, dens, load, field, val) {
    if (dbProtocolli[b1] && dbProtocolli[b1][diam] && dbProtocolli[b1][diam][dens]) {
        dbProtocolli[b1][diam][dens][load][field] = val;
        console.log("✅ DB aggiornato:", b1, diam, dens, load, field, "=", val);
    } else {
        console.error("❌ Percorso DB non trovato:", b1, diam, dens, load, field);
    }
}

function updateGeneralNotes(val) {
    var b1one = document.getElementById("edit-b1one").value;
    var diam = document.getElementById("edit-diametro").value;
    if (dbProtocolli[b1one] && dbProtocolli[b1one][diam]) {
        dbProtocolli[b1one][diam].__notes = val;
    }
}

function chiudiEditor() {
    // Salva automaticamente in memoria quando si chiude l'editor
    localStorage.setItem("b1one_protocols_custom", JSON.stringify(dbProtocolli));
    document.getElementById("editor-overlay").style.display = "none";
    console.log("📦 Protocolli salvati automaticamente alla chiusura dell'editor");
}

function salvaProtocolliDB() {
    localStorage.setItem("b1one_protocols_custom", JSON.stringify(dbProtocolli));
    showCustomAlert("Protocolli salvati nel browser!");
    document.getElementById("editor-overlay").style.display = "none";
}

function ripristinaDefault() {
    if (confirm("Sei sicuro? Questo cancellerà tutte le tue modifiche.")) {
        localStorage.removeItem("b1one_protocols_custom");
        dbProtocolli = JSON.parse(JSON.stringify(DEFAULT_PROTOCOLS));
        renderEditorTable();
        showCustomAlert("Protocolli ripristinati ai valori di default.");
    }
}

function scaricaScriptCompleto() {
    // Genera il nuovo contenuto di DEFAULT_PROTOCOLS
    var nuoviProtocolli = JSON.stringify(dbProtocolli, null, 2);
    
    // Ricostruisce l'intero file script.js
    var scriptCompleto = generaScriptCompleto(nuoviProtocolli);
    
    // Crea e scarica il file
    var blob = new Blob([scriptCompleto], { type: "application/javascript" });
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url;
    a.download = "script.js";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showCustomAlert("✅ File script.js scaricato!\\n\\nSostituisci il vecchio script.js con questo file per rendere le modifiche permanenti.");
}

function generaScriptCompleto(protocolliJSON) {
    // Questa funzione genera l'intero script.js con i nuovi protocolli
    // Prende tutto il codice PRIMA di DEFAULT_PROTOCOLS e DOPO, sostituendo solo i protocolli
    
    var codiceCompleto = `// =============================================
// ICONE SVG
// =============================================
var drillIconSVG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="drill-icon"><path d="M12 2v5" stroke="#888" stroke-width="2" /><rect x="8" y="7" width="8" height="4" fill="#222" stroke="none" rx="1" /><path d="M12 11v11" stroke="#333" stroke-width="2" /><path d="M12 13l3 2 M12 17l3 2 M12 13l-3 2 M12 17l-3 2 M12 22l-3-2 3 2 3-2" stroke="#333" stroke-width="1.5" /></svg>';
var extractionIconSVG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="result-icon"><path d="M8 14v6c0 1 2 2 4 0s4 1 4 0v-6c0-3-2-5-4-5s-4 2-4 5z" fill="#fff0f0" stroke="#d32f2f"/><path d="M12 7V1m-3 3l3-3 3 3" stroke="#d32f2f" stroke-width="2"/></svg>';
var immediateLoadIconSVG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="result-icon"><path d="M10 13v8c0 1 4 1 4 0v-8" stroke="#555" stroke-width="2"/><path d="M7 7l1-3c0-1.5 1.5-2.5 3.5-2s4.5 0.5 4.5 2l1 3H7z" fill="#fffbe6" stroke="#f57c00"/><path d="M19 9l-2 3h2l-1 4" stroke="#e65100" stroke-width="2" fill="none"/></svg>';

// =============================================
// FUNZIONI ALERT E DISCLAIMER
// =============================================

function showCustomAlert(msg, title) {
    title = title || "⚠️ Attenzione";
    document.getElementById('alert-title').innerText = title;
    document.getElementById('alert-message').innerHTML = msg;
    document.getElementById('alert-overlay').style.display = 'flex';
}

function closeCustomAlert() {
    document.getElementById('alert-overlay').style.display = 'none';
}

function toggleDisclaimerBtn() {
    var chk = document.getElementById('accept-check');
    var btn = document.getElementById('disclaimer-btn');
    if (chk && btn) {
        btn.disabled = !chk.checked;
        if (chk.checked) {
            btn.style.opacity = '1';
            btn.style.cursor = 'pointer';
        } else {
            btn.style.opacity = '0.5';
            btn.style.cursor = 'not-allowed';
        }
    }
}

function acceptDisclaimer() {
    var chk = document.getElementById('accept-check');
    if (!chk || !chk.checked) return;
    var overlay = document.getElementById('disclaimer-overlay');
    if (overlay) {
        overlay.style.display = 'none';
    }
}

function checkPassword() {
    var passwordInput = document.getElementById('password-input').value;
    if (passwordInput === "Martina07") {
        document.getElementById('password-overlay').style.display = 'none';
        document.getElementById('disclaimer-overlay').style.display = 'flex';
    } else {
        showCustomAlert('Password errata. Riprova.');
        document.getElementById('password-input').value = "";
    }
}

// =============================================
// GESTIONE ODONTOGRAMMA INTERATTIVO
// =============================================

var upperTeethSelector = [18,17,16,15,14,13,12,11,21,22,23,24,25,26,27,28];
var lowerTeethSelector = [48,47,46,45,44,43,42,41,31,32,33,34,35,36,37,38];

var selectedTeeth = [];
var impiantiData = {};

function initOdontogrammaSelector() {
    var upperGrid = document.getElementById('selector-upper');
    var lowerGrid = document.getElementById('selector-lower');
    
    if (!upperGrid || !lowerGrid) return;
    
    upperGrid.innerHTML = '';
    lowerGrid.innerHTML = '';
    
    for (var i = 0; i < upperTeethSelector.length; i++) {
        upperGrid.appendChild(createSelectorTooth(upperTeethSelector[i]));
    }
    
    for (var j = 0; j < lowerTeethSelector.length; j++) {
        lowerGrid.appendChild(createSelectorTooth(lowerTeethSelector[j]));
    }
    
    updateSelectionSummary();
}

function createSelectorTooth(toothNum) {
    var div = document.createElement('div');
    div.className = 'selector-tooth';
    div.textContent = toothNum;
    div.setAttribute('data-tooth', toothNum);
    
    if (selectedTeeth.indexOf(toothNum) !== -1) {
        div.classList.add('selected');
    }
    
    div.onclick = function() {
        toggleToothSelection(toothNum, div);
    };
    
    return div;
}

function toggleToothSelection(toothNum, element) {
    var index = selectedTeeth.indexOf(toothNum);
    
    if (index === -1) {
        selectedTeeth.push(toothNum);
        element.classList.add('selected');
        
        if (!impiantiData[toothNum]) {
            impiantiData[toothNum] = {
                hu: '',
                densitaClass: '',
                inputMode: 'hu',
                carico: false,
                post: false,
                b1one: 'High',
                diametro: '3.7',
                lunghezza: '10'
            };
        }
    } else {
        selectedTeeth.splice(index, 1);
        element.classList.remove('selected');
    }
    
    selectedTeeth = ordinaDentiOdontogramma(selectedTeeth);
    
    updateSelectionSummary();
    aggiornaImpiantiContainer();
}

function updateSelectionSummary() {
    var countEl = document.getElementById('selection-count');
    var listEl = document.getElementById('selection-list');
    
    if (countEl) countEl.textContent = selectedTeeth.length;
    if (listEl) {
        if (selectedTeeth.length === 0) {
            listEl.textContent = 'nessuno';
        } else {
            listEl.textContent = selectedTeeth.join(', ');
        }
    }
    
    var impiantiInput = document.getElementById('impianti');
    if (impiantiInput) {
        impiantiInput.value = selectedTeeth.length;
    }
}

function salvaStatoImpianto(dente) {
    var card = document.querySelector('[data-dente="' + dente + '"]');
    if (!card) return;
    
    var data = impiantiData[dente] || {};
    
    var huEl = card.querySelector('[data-field="hu"]');
    var densitaEl = card.querySelector('[data-field="densita"]:checked');
    var modoHuEl = card.querySelector('[data-field="modo_hu"]');
    var caricoEl = card.querySelector('[data-field="carico"]');
    var postEl = card.querySelector('[data-field="post"]');
    var b1oneEl = card.querySelector('[data-field="b1one"]');
    var diametroEl = card.querySelector('[data-field="diametro"]');
    var lunghezzaEl = card.querySelector('[data-field="lunghezza"]');
    var corticaleEl = card.querySelector('[data-field="corticale"]:checked');
    
    if (huEl) data.hu = huEl.value;
    if (densitaEl) data.densitaClass = densitaEl.value;
    if (modoHuEl) data.inputMode = modoHuEl.checked ? 'hu' : 'densita';
    if (caricoEl) data.carico = caricoEl.checked;
    if (postEl) { data.post = postEl.checked; data.postEstrattivo = postEl.checked; }
    if (b1oneEl) data.b1one = b1oneEl.value;
    if (diametroEl) data.diametro = diametroEl.value;
    if (lunghezzaEl) data.lunghezza = lunghezzaEl.value;
    if (corticaleEl) data.corticale = corticaleEl.value;
    
    impiantiData[dente] = data;
}

function salvaStatoTutti() {
    for (var i = 0; i < selectedTeeth.length; i++) {
        salvaStatoImpianto(selectedTeeth[i]);
    }
}

function aggiornaImpiantiContainer() {
    salvaStatoTutti();
    
    var container = document.getElementById('impianti-container');
    if (!container) return;
    
    container.innerHTML = '';
    
    for (var i = 0; i < selectedTeeth.length; i++) {
        var card = creaCardImpianto(selectedTeeth[i], i);
        container.appendChild(card);
    }
}

function creaCardImpianto(dente, index) {
    var data = impiantiData[dente] || {};
    
    var card = document.createElement('div');
    card.className = 'impianto-card';
    card.setAttribute('data-dente', dente);
    
    var inputMode = data.inputMode || 'hu';
    var huValue = data.hu || '';
    var densitaValue = data.densitaClass || '';
    
    // Se c'è un valore HU ma non c'è la classe, calcola automaticamente
    if (huValue && !densitaValue) {
        densitaValue = huToClasse(huValue);
        // Salva anche in impiantiData per persistenza
        if (impiantiData[dente]) {
            impiantiData[dente].densitaClass = densitaValue;
        }
    }
    
    var caricoChecked = data.carico ? 'checked' : '';
    var postChecked = (data.post || data.postEstrattivo) ? 'checked' : '';
    var b1oneValue = data.b1one || 'High';
    var diametroValue = data.diametro || '3.7';
    var lunghezzaValue = data.lunghezza || '10';
    var corticaleValue = data.corticale || '';
    
    var huDisplay = inputMode === 'hu' ? '' : 'display:none;';
    var densitaDisplay = inputMode === 'densita' ? '' : 'display:none;';
    var postDisplay = (data.post || data.postEstrattivo) ? 'display:flex;' : 'display:none;';
    
    // Calcola classificazione ossea se corticale è selezionata
    var classificazioneOssea = '';
    var classificazioneInfo = '';
    if (corticaleValue && densitaValue) {
        classificazioneOssea = getClassificazioneOssea(corticaleValue, densitaValue);
        if (classificazioneOssea) {
            var info = getClassificazioneOsseaInfo(classificazioneOssea);
            classificazioneInfo = info ? info.desc : '';
        }
    }
    
    card.innerHTML = '<div class="impianto-header">' +
        '<div class="impianto-title"><strong>🦷 Dente ' + dente + '</strong></div>' +
        '<button class="collapse-btn" onclick="toggleCard(this)">−</button>' +
    '</div>' +
    '<div class="impianto-content" style="display:flex; gap:15px;">' +
        '<div class="impianto-form" style="flex:1;">' +
        '<div class="form-group">' +
            '<label>Densità Ossea: <span style="color:red; font-weight:bold;">*</span></label>' +
            '<div style="display:flex; align-items:center; gap:15px; flex-wrap:wrap;">' +
                '<div class="radio-group" style="display:flex; gap:8px; margin:0;">' +
                    '<label class="radio-label" style="margin:0;">' +
                        '<input type="radio" name="modo_densita_' + dente + '" value="hu" data-field="modo_hu" ' + (inputMode === 'hu' ? 'checked' : '') + ' onchange="toggleModoInputDente(' + dente + ')"> Hounsfield' +
                    '</label>' +
                    '<label class="radio-label" style="margin:0;">' +
                        '<input type="radio" name="modo_densita_' + dente + '" value="densita" data-field="modo_densita" ' + (inputMode === 'densita' ? 'checked' : '') + ' onchange="toggleModoInputDente(' + dente + ')"> Classe (D1-D4)' +
                    '</label>' +
                '</div>' +
                '<div style="display:flex; align-items:center; gap:8px;">' +
                    '<label class="corticale-option" style="cursor:pointer; display:flex; align-items:center; gap:5px; padding:8px 12px; border:2px solid #ddd; border-radius:8px;' + (corticaleValue === 'H' ? ' border-color:#1565c0; background:#e3f2fd;' : '') + '" title="Corticale >2mm">' +
                        '<input type="radio" name="corticale_' + dente + '" value="H" data-field="corticale" ' + (corticaleValue === 'H' ? 'checked' : '') + ' onchange="aggiornaCorticale(' + dente + '); salvaStatoImpianto(' + dente + ')" style="display:none;">' +
                        '<span style="width:24px; height:24px; border-radius:50%; border:6px solid #1565c0; display:inline-block;"></span>' +
                        '<span style="font-weight:bold; color:#1565c0;">H</span>' +
                        '<span style="font-size:10px; color:#666;">(>2mm)</span>' +
                    '</label>' +
                    '<label class="corticale-option" style="cursor:pointer; display:flex; align-items:center; gap:5px; padding:8px 12px; border:2px solid #ddd; border-radius:8px;' + (corticaleValue === 'N' ? ' border-color:#1976d2; background:#e3f2fd;' : '') + '" title="Corticale 2mm">' +
                        '<input type="radio" name="corticale_' + dente + '" value="N" data-field="corticale" ' + (corticaleValue === 'N' ? 'checked' : '') + ' onchange="aggiornaCorticale(' + dente + '); salvaStatoImpianto(' + dente + ')" style="display:none;">' +
                        '<span style="width:24px; height:24px; border-radius:50%; border:4px solid #1976d2; display:inline-block;"></span>' +
                        '<span style="font-weight:bold; color:#1976d2;">N</span>' +
                        '<span style="font-size:10px; color:#666;">(2mm)</span>' +
                    '</label>' +
                    '<label class="corticale-option" style="cursor:pointer; display:flex; align-items:center; gap:5px; padding:8px 12px; border:2px solid #ddd; border-radius:8px;' + (corticaleValue === 'S' ? ' border-color:#64b5f6; background:#e3f2fd;' : '') + '" title="Corticale <2mm">' +
                        '<input type="radio" name="corticale_' + dente + '" value="S" data-field="corticale" ' + (corticaleValue === 'S' ? 'checked' : '') + ' onchange="aggiornaCorticale(' + dente + '); salvaStatoImpianto(' + dente + ')" style="display:none;">' +
                        '<span style="width:24px; height:24px; border-radius:50%; border:2px solid #64b5f6; display:inline-block;"></span>' +
                        '<span style="font-weight:bold; color:#64b5f6;">S</span>' +
                        '<span style="font-size:10px; color:#666;">(<2mm)</span>' +
                    '</label>' +
                    '<button type="button" onclick="resetCorticale(' + dente + ')" style="background:#d32f2f; border:none; cursor:pointer; padding:4px 6px; border-radius:4px;" title="Rimuovi corticale">' +
                        '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6h14M10 11v6M14 11v6"/></svg>' +
                    '</button>' +
                '</div>' +
            '</div>' +
        '</div>' +
        '<div class="form-group" style="margin-top:8px;">' +
            '<div id="hu_block_' + dente + '" style="' + huDisplay + '">' +
                '<div style="display:flex; align-items:center; gap:12px; flex-wrap:wrap;">' +
                    '<input type="number" data-field="hu" placeholder="Valore HU (es. 850)" value="' + huValue + '" onchange="salvaStatoImpianto(' + dente + '); aggiornaCorticale(' + dente + ')" style="width:140px; padding:6px 8px;">' +
                    '<div id="densita_display_' + dente + '" style="display:none; align-items:center; gap:6px; padding:5px 10px; background:#f5f5f5; border-radius:6px;"></div>' +
                    '<div id="classificazione_' + dente + '" style="padding:5px 10px; background:#e3f2fd; border-radius:6px; display:' + (classificazioneOssea ? 'inline-flex' : 'none') + '; align-items:center; gap:6px;">' +
                        '<span style="font-weight:bold; color:#1565c0; font-size:16px;">' + classificazioneOssea + '</span>' +
                        '<span style="font-size:11px; color:#666;">' + classificazioneInfo + '</span>' +
                    '</div>' +
                '</div>' +
            '</div>' +
            '<div id="densita_block_' + dente + '" style="' + densitaDisplay + '">' +
                '<div class="densita-pallini-container">' +
                    '<div class="densita-row">' +
                        '<label class="densita-pallino" title="D1 - Osso molto denso">' +
                            '<input type="radio" name="densita_classe_' + dente + '" value="D1" data-field="densita" ' + (densitaValue === 'D1' ? 'checked' : '') + ' onchange="impostaHUdaDensitaDente(' + dente + '); salvaStatoImpianto(' + dente + ')">' +
                            '<span class="pallino" style="background:#ef5350; border-color:#d32f2f;"></span>' +
                            '<span class="pallino-label">D1</span>' +
                        '</label>' +
                        '<label class="densita-pallino" title="D2→D1 - Transizione">' +
                            '<input type="radio" name="densita_classe_' + dente + '" value="D2_D1" data-field="densita" ' + (densitaValue === 'D2_D1' ? 'checked' : '') + ' onchange="impostaHUdaDensitaDente(' + dente + '); salvaStatoImpianto(' + dente + ')">' +
                            '<span class="pallino" style="background:#ffcdd2; border-color:#ef9a9a;"></span>' +
                            '<span class="pallino-label">D2→D1</span>' +
                        '</label>' +
                        '<label class="densita-pallino" title="D2 - Osso corticale">' +
                            '<input type="radio" name="densita_classe_' + dente + '" value="D2" data-field="densita" ' + (densitaValue === 'D2' ? 'checked' : '') + ' onchange="impostaHUdaDensitaDente(' + dente + '); salvaStatoImpianto(' + dente + ')">' +
                            '<span class="pallino" style="background:#ffa726; border-color:#f57c00;"></span>' +
                            '<span class="pallino-label">D2</span>' +
                        '</label>' +
                        '<label class="densita-pallino" title="D3→D2 - Transizione">' +
                            '<input type="radio" name="densita_classe_' + dente + '" value="D3_D2" data-field="densita" ' + (densitaValue === 'D3_D2' ? 'checked' : '') + ' onchange="impostaHUdaDensitaDente(' + dente + '); salvaStatoImpianto(' + dente + ')">' +
                            '<span class="pallino" style="background:#ffe0b2; border-color:#ffcc80;"></span>' +
                            '<span class="pallino-label">D3→D2</span>' +
                        '</label>' +
                    '</div>' +
                    '<div class="densita-row">' +
                        '<label class="densita-pallino" title="D3 - Osso trabecolare">' +
                            '<input type="radio" name="densita_classe_' + dente + '" value="D3" data-field="densita" ' + (densitaValue === 'D3' ? 'checked' : '') + ' onchange="impostaHUdaDensitaDente(' + dente + '); salvaStatoImpianto(' + dente + ')">' +
                            '<span class="pallino" style="background:#ffee58; border-color:#fdd835;"></span>' +
                            '<span class="pallino-label">D3</span>' +
                        '</label>' +
                        '<label class="densita-pallino" title="D3→D4 - Transizione">' +
                            '<input type="radio" name="densita_classe_' + dente + '" value="D3_D4" data-field="densita" ' + (densitaValue === 'D3_D4' ? 'checked' : '') + ' onchange="impostaHUdaDensitaDente(' + dente + '); salvaStatoImpianto(' + dente + ')">' +
                            '<span class="pallino" style="background:#c8e6c9; border-color:#a5d6a7;"></span>' +
                            '<span class="pallino-label">D3→D4</span>' +
                        '</label>' +
                        '<label class="densita-pallino" title="D4 - Osso poroso">' +
                            '<input type="radio" name="densita_classe_' + dente + '" value="D4" data-field="densita" ' + (densitaValue === 'D4' ? 'checked' : '') + ' onchange="impostaHUdaDensitaDente(' + dente + '); salvaStatoImpianto(' + dente + ')">' +
                            '<span class="pallino" style="background:#66bb6a; border-color:#43a047;"></span>' +
                            '<span class="pallino-label">D4</span>' +
                        '</label>' +
                    '</div>' +
                '</div>' +
                '<div id="classificazione_densita_' + dente + '" style="margin-top:8px; padding:5px 10px; background:#e3f2fd; border-radius:6px; display:' + (classificazioneOssea && inputMode === 'densita' ? 'inline-flex' : 'none') + '; align-items:center; gap:6px;">' +
                    '<span style="font-weight:bold; color:#1565c0; font-size:16px;">' + classificazioneOssea + '</span>' +
                    '<span style="font-size:11px; color:#666;">' + classificazioneInfo + '</span>' +
                '</div>' +
            '</div>' +
        '</div>' +
        '<div class="form-group">' +
            '<label>Opzioni Cliniche:</label>' +
            '<div class="radio-group">' +
                '<label class="radio-label">' +
                    '<input type="checkbox" data-field="carico" ' + caricoChecked + ' onchange="salvaStatoImpianto(' + dente + ')"> Carico Immediato' +
                '</label>' +
                '<label class="radio-label">' +
                    '<input type="checkbox" data-field="post" ' + postChecked + ' onchange="toggleNotaPostDente(' + dente + '); salvaStatoImpianto(' + dente + ')"> Post-estrattivo' +
                '</label>' +
            '</div>' +
            '<div id="nota_post_' + dente + '" style="' + postDisplay + ' margin-top:8px; align-items:center; gap:8px;">' +
                '<div class="nota" style="margin:0; flex:0 1 auto;">⚠️ In caso di post-estrattivo rivalutare la densità ossea con la funzione ROI</div>' +
                '<button type="button" onclick="mostraInfoROI()" style="cursor:pointer; display:inline-flex; align-items:center; justify-content:center; width:20px; height:20px; background:linear-gradient(145deg, #0077cc, #005599); color:white; border-radius:50%; font-size:12px; font-weight:bold; border:2px solid #004488; box-shadow:0 2px 4px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.3); font-family:Georgia,serif; font-style:italic; flex-shrink:0; min-width:20px; min-height:20px; max-width:20px; max-height:20px; padding:0; line-height:1;" title="Info sulla funzione ROI">i</button>' +
            '</div>' +
        '</div>' +
        '<div class="form-group">' +
            '<label>Impianto:</label>' +
            '<div style="display:flex; gap:12px; align-items:center; flex-wrap:wrap;">' +
                '<div style="display:flex; align-items:center; gap:4px;">' +
                    '<span style="font-size:11px; color:#888;">Tipo:</span>' +
                    '<select data-field="b1one" onchange="aggiornaOpzioniB1OneDente(' + dente + '); aggiornaImmagineCard(' + dente + '); salvaStatoImpianto(' + dente + ')" style="padding:3px 6px; font-size:13px;">' +
                        '<option value="High" style="color:red;"' + (b1oneValue === 'High' ? ' selected' : '') + '>High</option>' +
                        '<option value="Medium" style="color:orange;"' + (b1oneValue === 'Medium' ? ' selected' : '') + '>Medium</option>' +
                        '<option value="Low" style="color:green;"' + (b1oneValue === 'Low' ? ' selected' : '') + '>Low</option>' +
                    '</select>' +
                '</div>' +
                '<div style="display:flex; align-items:center; gap:4px;">' +
                    '<span style="font-size:11px; color:#888;">Ø:</span>' +
                    '<select data-field="diametro" onchange="aggiornaTuttoDente(' + dente + '); aggiornaImmagineCard(' + dente + '); salvaStatoImpianto(' + dente + ')" style="padding:3px 6px; font-size:13px;">' +
                        '<option value="2.7"' + (diametroValue === '2.7' ? ' selected' : '') + '>2.7</option>' +
                        '<option value="3.2"' + (diametroValue === '3.2' ? ' selected' : '') + '>3.2</option>' +
                        '<option value="3.7"' + (diametroValue === '3.7' ? ' selected' : '') + '>3.7</option>' +
                        '<option value="4.2"' + (diametroValue === '4.2' ? ' selected' : '') + '>4.2</option>' +
                        '<option value="4.8"' + (diametroValue === '4.8' ? ' selected' : '') + '>4.8</option>' +
                    '</select>' +
                '</div>' +
                '<div style="display:flex; align-items:center; gap:4px;">' +
                    '<span style="font-size:11px; color:#888;">L:</span>' +
                    '<select data-field="lunghezza" onchange="aggiornaImmagineCard(' + dente + '); salvaStatoImpianto(' + dente + ')" style="padding:3px 6px; font-size:13px;"></select>' +
                '</div>' +
            '</div>' +
        '</div>' +
        '</div>' +
        '<div id="impianto_image_' + dente + '" class="impianto-image-area" style="width:140px; min-width:140px; background:linear-gradient(180deg, #2d3748 0%, #1a202c 100%); border-radius:10px; padding:12px; display:flex; flex-direction:column; align-items:center; justify-content:flex-start; gap:8px;">' +
            '<div id="impianto_label_' + dente + '" style="color:#00d4ff; font-weight:bold; font-size:12px; text-align:center;">High Ø' + diametroValue + ' x ' + lunghezzaValue + 'mm</div>' +
            '<img id="impianto_img_' + dente + '" src="" style="max-width:100%; max-height:150px; border-radius:4px;">' +
            '<button id="impianto_btn_' + dente + '" onclick="" style="margin-top:auto; background:linear-gradient(to bottom, #17a2b8, #138496); color:white; padding:6px 12px; border:none; border-radius:20px; font-size:11px; font-weight:bold; cursor:pointer; box-shadow:0 2px 4px rgba(0,0,0,0.2);">📄 Indicazioni</button>' +
        '</div>' +
    '</div>';
    
    setTimeout(function() {
        aggiornaTuttoDente(dente);
        aggiornaCorticale(dente);
        aggiornaImmagineCard(dente);
        var lunghezzaEl = card.querySelector('[data-field="lunghezza"]');
        if (lunghezzaEl && lunghezzaValue) {
            lunghezzaEl.value = lunghezzaValue;
        }
    }, 10);
    
    return card;
}

function toggleCard(btn) {
    var content = btn.parentNode.nextElementSibling;
    if (content.classList.contains('hidden')) {
        content.classList.remove('hidden');
        btn.textContent = '−';
    } else {
        content.classList.add('hidden');
        btn.textContent = '+';
    }
}

function toggleModoInputDente(dente) {
    var card = document.querySelector('[data-dente="' + dente + '"]');
    if (!card) return;
    
    var radioHu = card.querySelector('[data-field="modo_hu"]');
    var isHu = radioHu && radioHu.checked;
    
    var huBlock = document.getElementById('hu_block_' + dente);
    var densitaBlock = document.getElementById('densita_block_' + dente);
    
    if (isHu) {
        huBlock.style.display = 'block';
        densitaBlock.style.display = 'none';
    } else {
        huBlock.style.display = 'none';
        densitaBlock.style.display = 'block';
    }
    
    salvaStatoImpianto(dente);
}

function impostaHUdaDensitaDente(dente) {
    var card = document.querySelector('[data-dente="' + dente + '"]');
    if (!card) return;
    
    var densitaEl = card.querySelector('[data-field="densita"]:checked');
    var huEl = card.querySelector('[data-field="hu"]');
    
    if (!densitaEl || !huEl) return;
    
    var valore = densitaEl.value;
    var mappa = { "D1": 1300, "D2_D1": 1200, "D2": 1000, "D3_D2": 775, "D3": 600, "D3_D4": 400, "D4": 250 };
    huEl.value = mappa[valore] || "";
    
    // Aggiorna la classificazione ossea se la corticale è selezionata
    if (typeof aggiornaCorticale === 'function') {
        aggiornaCorticale(dente);
    }
}

function toggleNotaPostDente(dente) {
    var card = document.querySelector('[data-dente="' + dente + '"]');
    if (!card) return;
    
    var postEl = card.querySelector('[data-field="post"]');
    var notaEl = document.getElementById('nota_post_' + dente);
    
    if (postEl && notaEl) {
        notaEl.style.display = postEl.checked ? 'flex' : 'none';
    }
}

function aggiornaOpzioniB1OneDente(dente) {
    var card = document.querySelector('[data-dente="' + dente + '"]');
    if (!card) return;
    
    var b1oneEl = card.querySelector('[data-field="b1one"]');
    var diametroEl = card.querySelector('[data-field="diametro"]');
    
    if (!b1oneEl || !diametroEl) return;
    
    var diametro = diametroEl.value;
    
    for (var i = 0; i < b1oneEl.options.length; i++) {
        b1oneEl.options[i].disabled = false;
    }
    
    if (diametro === '2.7' || diametro === '3.2') {
        b1oneEl.value = 'High';
        for (var j = 0; j < b1oneEl.options.length; j++) {
            if (b1oneEl.options[j].value !== 'High') {
                b1oneEl.options[j].disabled = true;
            }
        }
    } else if (diametro === '4.8') {
        if (b1oneEl.value === 'High') b1oneEl.value = 'Medium';
        for (var k = 0; k < b1oneEl.options.length; k++) {
            if (b1oneEl.options[k].value === 'High') {
                b1oneEl.options[k].disabled = true;
            }
        }
    }
}

function aggiornaOpzioniLunghezzaDente(dente) {
    var card = document.querySelector('[data-dente="' + dente + '"]');
    if (!card) return;
    
    var diametroEl = card.querySelector('[data-field="diametro"]');
    var lunghezzaEl = card.querySelector('[data-field="lunghezza"]');
    
    if (!diametroEl || !lunghezzaEl) return;
    
    var diametro = diametroEl.value;
    var currentValue = lunghezzaEl.value || (impiantiData[dente] ? impiantiData[dente].lunghezza : '');
    
    var options = [];
    var defaultOption = '';
    
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
    
    lunghezzaEl.innerHTML = '';
    for (var i = 0; i < options.length; i++) {
        var opt = document.createElement('option');
        opt.value = options[i];
        opt.textContent = options[i];
        lunghezzaEl.appendChild(opt);
    }
    
    if (options.indexOf(currentValue) !== -1) {
        lunghezzaEl.value = currentValue;
    } else {
        lunghezzaEl.value = defaultOption;
    }
}

function aggiornaTuttoDente(dente) {
    aggiornaOpzioniB1OneDente(dente);
    aggiornaOpzioniLunghezzaDente(dente);
}

// =============================================
// DATI PROTOCOLLI
// =============================================

var DEFAULT_PROTOCOLS = ${protocolliJSON};

var dbProtocolli = {};
var accessiKey = "contatoreAccessi";
var impiantiKey = "impiantiElaborati";

// =============================================
// INIZIALIZZAZIONE
// =============================================

function initApp() {
    var ed = document.getElementById("editor-overlay");
    if (ed) ed.style.display = 'none';

    try {
        var savedInfo = localStorage.getItem("b1one_protocols_custom");
        if (savedInfo) {
            dbProtocolli = JSON.parse(savedInfo);
        } else {
            dbProtocolli = JSON.parse(JSON.stringify(DEFAULT_PROTOCOLS));
        }
        if (!dbProtocolli["High"]) throw new Error("Corrupted Data");
    } catch (e) {
        localStorage.removeItem("b1one_protocols_custom");
        dbProtocolli = JSON.parse(JSON.stringify(DEFAULT_PROTOCOLS));
    }

    var acc = parseInt(localStorage.getItem(accessiKey)) || 0;
    localStorage.setItem(accessiKey, ++acc);

    initOdontogrammaSelector();
}

// =============================================
// HELPER VISUALI
// =============================================

var corpoApiceData = {
    "2.7|High": { corpo: "2,3", apice: "1,3" },
    "3.2|High": { corpo: "2,5", apice: "1,8" },
    "3.7|High": { corpo: "3,0", apice: "2,0" },
    "3.7|Medium": { corpo: "2,9", apice: "2,0" },
    "3.7|Low": { corpo: "2,3", apice: "2,0" },
    "4.2|High": { corpo: "3,5", apice: "2,3" },
    "4.2|Medium": { corpo: "3,4", apice: "2,3" },
    "4.2|Low": { corpo: "2,8", apice: "2,3" },
    "4.8|Medium": { corpo: "4,0", apice: "2,9" },
    "4.8|Low": { corpo: "3,4", apice: "2,9" }
};

function getCorpoApice(diametro, b1one) {
    var key = diametro + "|" + b1one;
    if (corpoApiceData[key]) {
        return " (corpo Ø" + corpoApiceData[key].corpo + " apice Ø" + corpoApiceData[key].apice + ")";
    }
    return "";
}

function getDensitaColor(densita) {
    if (densita.indexOf('D1') !== -1) return 'red';
    if (densita.indexOf('D2') !== -1) return 'red';
    if (densita.indexOf('D3 → D2') !== -1) return 'darkorange';
    if (densita.indexOf('D3 → D4') !== -1) return 'green';
    if (densita.indexOf('D2 → D1') !== -1) return 'lightcoral';
    if (densita.indexOf('D3') !== -1) return 'lightsalmon';
    if (densita.indexOf('D4') !== -1) return 'lightgreen';
    return 'black';
}

function getB1OneColor(tipo) {
    if (tipo === 'High') return 'red';
    if (tipo === 'Medium') return 'orange';
    if (tipo === 'Low') return 'green';
    return 'black';
}

function getImpiantoIdeale(diametro, densita) {
    var tipo = null;
    if (diametro === "3.7" || diametro === "4.2" || diametro === "4.8") {
        if (densita === "D1" || densita === "D2" || densita === "D2 → D1") tipo = "High";
        else if (densita === "D3" || densita === "D3 → D2") tipo = "Medium";
        else if (densita === "D4" || densita === "D3 → D4") tipo = "Low";
    }
    if (!tipo) return "";
    var colori = { High: "#e74c3c", Medium: "#ff8800", Low: "#28a745" };
    return '<div class="result-block"><strong>🌟 Impianto ideale:</strong> <span style="color:' + colori[tipo] + '; font-weight:bold;">B1One ' + tipo + ' (Ø' + diametro + ')</span></div>';
}

function getDensitaBackgroundColor(densitaLabel) {
    if (!densitaLabel) return '#f9f9f9';
    
    // TENDENTI (colori sbiaditi) - controllare prima delle densità pure
    if (densitaLabel.indexOf('D2 → D1') !== -1 || densitaLabel === 'D2_D1') return '#ffcdd2'; // rosa sbiadito
    if (densitaLabel.indexOf('D3 → D2') !== -1 || densitaLabel === 'D3_D2') return '#ffe0b2'; // arancione sbiadito
    if (densitaLabel.indexOf('D3 → D4') !== -1 || densitaLabel === 'D3_D4') return '#c8e6c9'; // verde sbiadito
    
    // DENSITÀ PURE (colori netti/pieni)
    if (densitaLabel === 'D1' || (densitaLabel.indexOf('D1') !== -1 && densitaLabel.indexOf('→') === -1)) return '#ef5350'; // rosso netto
    if (densitaLabel === 'D2' || (densitaLabel.indexOf('D2') !== -1 && densitaLabel.indexOf('→') === -1)) return '#ffa726'; // arancione netto
    if (densitaLabel === 'D3' || (densitaLabel.indexOf('D3') !== -1 && densitaLabel.indexOf('→') === -1)) return '#ffee58'; // giallo netto
    if (densitaLabel === 'D4' || (densitaLabel.indexOf('D4') !== -1 && densitaLabel.indexOf('→') === -1)) return '#66bb6a'; // verde netto
    
    return '#f9f9f9';
}

// =============================================
// CALCOLI PROTOCOLLO
// =============================================

function applicaCalcoliLunghezza(testo, L) {
    if (!testo || typeof testo !== 'string') return testo;
    var len = parseFloat(L);
    if (isNaN(len)) return testo;

    testo = testo.replace(/2[–\\-—]?3\\s*mm\\s*meno.*?(?:profondità)?/gi, function() {
        return "{{" + (len - 1.5) + "/" + (len - 2.5) + "mm}}";
    });
    testo = testo.replace(/[–\\-—]\\s*2\\s*mm/gi, function() {
        return "{{" + (len - 1.5) + "mm}}";
    });
    testo = testo.replace(/[–\\-—]\\s*1\\s*mm/gi, function() {
        return "{{" + (len - 0.5) + "mm}}";
    });
    testo = testo.replace(/\\bcompleta\\b/gi, function() {
        return "{{" + (len + 0.5) + "mm}}";
    });

    testo = testo.replace(/\\{\\{(.*?)\\}\\}/g, '<strong>($1)</strong>');
    return testo;
}

function getProtocolloDinamico(b1oneType, diametro, hu, caricoMode, lunghezzaImpianto) {
    var dKey = "D4";
    if (hu > 1250) dKey = "D1";
    else if (hu >= 1150) dKey = "D2_D1";
    else if (hu >= 850) dKey = "D2";
    else if (hu >= 700) dKey = "D3_D2";
    else if (hu >= 500) dKey = "D3";
    else if (hu >= 300) dKey = "D3_D4";

    try {
        var p = null;
        if (dbProtocolli[b1oneType] && dbProtocolli[b1oneType][diametro] && dbProtocolli[b1oneType][diametro][dKey]) {
            p = dbProtocolli[b1oneType][diametro][dKey][caricoMode];
        }
        if (!p) return { densita: dKey.replace("_", " → "), fresa: "Non definito", prep: "-", testa: "", noteGenerali: "", fresaNumerica: "?", lunghezzaNumerica: "-" };

        var noteGen = (dbProtocolli[b1oneType][diametro].__notes) || "";
        var prepCalcolata = applicaCalcoliLunghezza(p.prep, lunghezzaImpianto);

        var fresaMatch = p.fresa.match(/[\\d.,]+/);
        var fresaNum = fresaMatch ? fresaMatch[0] : "?";
        
        // Gestisci caso speciale "F.lettrice" o "Fresa lettrice"
        if (p.fresa.toLowerCase().indexOf('lettrice') !== -1 || p.fresa.toLowerCase().indexOf('f.lettrice') !== -1) {
            fresaNum = "F.lettrice";
        }

        var lungNum = "-";
        var matchBold = prepCalcolata.match(/<strong>\\(([\\d.,]+)mm\\)<\\/strong>/);
        if (matchBold) {
            lungNum = matchBold[1] + "mm";
        }

        return {
            densita: dKey.replace("_", " → "),
            fresa: p.fresa,
            prep: prepCalcolata,
            fresaNumerica: fresaNum,
            lunghezzaNumerica: lungNum,
            testa: p.testa || "",
            noteGenerali: noteGen
        };
    } catch (e) {
        return { densita: dKey.replace("_", " → "), fresa: "Errore", prep: "Errore", fresaNumerica: "?", lunghezzaNumerica: "-", testa: "", noteGenerali: "" };
    }
}

// =============================================
// ELABORAZIONE PRINCIPALE
// =============================================

function elabora() {
    try {
        salvaStatoTutti();

        var nome = document.getElementById('nome').value;
        if (!nome || !nome.trim()) {
            showCustomAlert('Inserire Cognome e Nome del paziente');
            return;
        }

        if (selectedTeeth.length === 0) {
            showCustomAlert("Seleziona almeno un dente dall'odontogramma");
            return;
        }

        for (var i = 0; i < selectedTeeth.length; i++) {
            var dente = selectedTeeth[i];
            var data = impiantiData[dente];
            if (!data) {
                showCustomAlert('Dente ' + dente + ': Dati mancanti');
                return;
            }

            if (data.inputMode === 'hu') {
                if (!data.hu) {
                    showCustomAlert('Dente ' + dente + ': Inserisci un valore Hounsfield valido.');
                    return;
                }
            } else {
                if (!data.densitaClass) {
                    showCustomAlert('Dente ' + dente + ': Seleziona una classe di densità.');
                    return;
                }
            }
        }

        var impiantiElaborati = parseInt(localStorage.getItem(impiantiKey)) || 0;
        impiantiElaborati += selectedTeeth.length;
        localStorage.setItem(impiantiKey, impiantiElaborati);

        var output = '<h2 style="text-align:center; margin-bottom:20px;">Risultati per: ' + nome + '</h2>';

        for (var j = 0; j < selectedTeeth.length; j++) {
            var denteNum = selectedTeeth[j];
            var denteData = impiantiData[denteNum];

            var hu = parseInt(denteData.hu) || 0;
            if (denteData.inputMode === 'densita' && denteData.densitaClass) {
                var mappa = { "D1": 1300, "D2_D1": 1200, "D2": 1000, "D3_D2": 775, "D3": 600, "D3_D4": 400, "D4": 250 };
                hu = mappa[denteData.densitaClass] || 0;
            }

            var carico = (denteData.carico || denteData.post) ? 'compresso' : 'non compresso';
            var post = denteData.post ? 'si' : 'no';
            var b1one = denteData.b1one || 'High';
            var diametro = denteData.diametro || '3.7';
            var lunghezza = denteData.lunghezza || '10';

            var prep = getProtocolloDinamico(b1one, diametro, hu, carico, lunghezza);

            var coloreDensita = getDensitaColor(prep.densita);
            var coloreB1One = getB1OneColor(b1one);
            var drillDiam = prep.fresaNumerica;

            var labelHtml = '<div style="margin-bottom:6px; font-weight:900; font-size:16px; color:' + coloreB1One + '; background:#fff; border:1px solid #eee; padding:4px 8px; border-radius:6px;">' + b1one + ' Ø' + diametro + ' x ' + lunghezza + 'mm</div>';

            var immaginiLocali = {
                "4.8_Medium": "48_Medium.png", "4.8_Low": "48_Low.png",
                "4.2_Low": "42_Low.png", "4.2_Medium": "42_Medium.png", "4.2_High": "42_High.png",
                "3.7_Low": "37_Low.png", "3.7_Medium": "37_Medium.png", "3.7_High": "37_High.png",
                "3.2_High": "32_High.png", "2.7_High": "27_High.png"
            };
            var imgKey = diametro + "_" + b1one;
            var placeholderSrc = 'https://placehold.co/150x250/e0f7fa/006064?text=' + b1one + '+' + diametro;
            var imgSrc = immaginiLocali[imgKey] || placeholderSrc;
            var imgTag = '<img src="' + imgSrc + '" onerror="this.onerror=null;this.src=\\'' + placeholderSrc + '\\';" style="max-height: 180px; border-radius:4px;">';

            var pdfFile = "";
            if (diametro === "2.7") pdfFile = "indicazioni_27high.pdf";
            else if (diametro === "3.2") pdfFile = "indicazioni_32high.pdf";
            else if (diametro === "3.7") pdfFile = "indicazioni_37.pdf";
            else if (diametro === "4.2") pdfFile = "indicazioni_42.pdf";
            else if (diametro === "4.8") pdfFile = "indicazioni_48.pdf";

            var btnHtml = pdfFile ? '<button onclick="window.open(\\'' + pdfFile + '\\', \\'_blank\\')" style="margin-top:8px; background: linear-gradient(to bottom, #17a2b8, #138496); color: white; padding: 6px 12px; border: none; border-radius: 20px; font-size: 12px; font-weight: bold; cursor: pointer; box-shadow: 0 2px 4px rgba(0,0,0,0.2); border-bottom: 2px solid #117a8b;">📄 Indicazioni</button>' : '';

            var avvisoResistenza = '';
            var dentiMolari = ["16","17","18","26","27","28","36","37","38","46","47","48"];
            if (dentiMolari.indexOf(String(denteNum)) !== -1) {
                if ((diametro === "2.7" && b1one === "High") || (diametro === "3.2" && b1one === "High") || (diametro === "3.7" && b1one === "Low")) {
                    avvisoResistenza = '<div style="color:red; font-weight:bold; margin-top:10px;">❌ Non consigliato per questa posizione: "resistenza insufficiente"</div>';
                }
            }

            // Gestione testa con corticale
            var corticale = denteData.corticale || '';
            var postEstrattivo = denteData.post || denteData.postEstrattivo || false;
            var statoTesta = getStatoTesta(denteNum, prep.densita, corticale, postEstrattivo);
            var testaHTML = renderStatoTestaHTML(statoTesta, prep.testa, denteNum, prep.densita, corticale);

            output += '<div class="result-row" style="display: grid; grid-template-columns: 1fr 4px 1fr; gap: 20px; max-width: 1000px; margin: auto; align-items: start;">' +
                '<div class="result-content">' +
                '<div class="dente">🦷 Dente: ' + denteNum + '</div>' +
                avvisoResistenza +
                '<div class="densita" style="color:' + coloreDensita + '; text-shadow:1px 1px 2px gray;">🦴 Densità: ' + prep.densita + '</div>' +
                getImpiantoIdeale(diametro, prep.densita) +
                '<div class="result-block"><strong>' + extractionIconSVG + ' Post-estrattivo:</strong> ' + (post === 'si' ? 'Sì <span style="color:red;">(rivalutare la densità ossea con il ROI)</span> <button onclick="mostraInfoROI()" style="cursor:pointer; display:inline-flex; align-items:center; justify-content:center; width:20px; height:20px; background:linear-gradient(145deg, #0077cc, #005599); color:white; border-radius:50%; font-size:12px; font-weight:bold; margin-left:4px; border:2px solid #004488; box-shadow:0 2px 4px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.3); font-family:Georgia,serif; font-style:italic;" title="Info sulla funzione ROI">i</button>' : 'No') + '</div>' +
                '<div class="result-block"><strong>🔩 B1One:</strong> <span style="color:' + coloreB1One + '; font-weight:bold;">' + b1one + ' Ø' + diametro + ' x ' + lunghezza + 'mm' + getCorpoApice(diametro, b1one) + '</span></div>' +
                '<div class="result-block"><strong>' + immediateLoadIconSVG + ' Carico immediato:</strong> ' + (carico === 'compresso' ? 'Sì' : 'No') + '</div>' +
                '<div class="result-block"><strong>' + drillIconSVG + ' Fresa Finale Ø:</strong> ' + drillDiam + ' mm</div>' +
                '<div class="result-block"><strong>📏 Preparazione in lunghezza:</strong> ' + prep.prep + '</div>' +
                (prep.noteGenerali ? '<div class="note-cliniche-box"><span class="note-cliniche-title">📝 Note Cliniche:</span><span class="note-cliniche-text">' + prep.noteGenerali + '</span></div>' : '') +
                testaHTML +
                '</div>' +
                '<div style="background-color: #007BFF; height: 100%; border-radius: 2px;"></div>' +
                '<div style="align-self: start; display: flex; flex-direction: column; align-items: center;">' +
                labelHtml +
                imgTag +
                btnHtml +
                '</div>' +
                '</div>';
        }

        document.getElementById('output').innerHTML = output;
        
        document.getElementById('output').scrollIntoView({ behavior: 'smooth' });
    } catch (err) {
        showCustomAlert("Errore: " + err.message);
    }
}

// =============================================
// SALVATAGGIO E CARICAMENTO
// =============================================

function resetta() {
    location.reload();
}

function salvaDati() {
    salvaStatoTutti();

    var nome = document.getElementById('nome').value || 'paziente';
    if (selectedTeeth.length === 0) {
        showCustomAlert("Seleziona almeno un dente prima di salvare.");
        return;
    }

    var dati = {
        paziente: nome,
        selectedTeeth: selectedTeeth,
        impianti: []
    };

    for (var i = 0; i < selectedTeeth.length; i++) {
        var dente = selectedTeeth[i];
        var data = impiantiData[dente] || {};
        dati.impianti.push({
            dente: dente,
            hu: data.hu || '',
            inputMode: data.inputMode || 'hu',
            densitaClass: data.densitaClass || '',
            carico: (data.carico || data.post) ? 'compresso' : 'non compresso',
            post: data.post ? 'si' : 'no',
            postEstrattivo: data.postEstrattivo ? 'si' : 'no',
            corticale: data.corticale || '',
            b1one: data.b1one || 'High',
            diametro: data.diametro || '3.7',
            lunghezza: data.lunghezza || '10'
        });
    }

    var blob = new Blob([JSON.stringify(dati, null, 2)], { type: "application/json" });
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url;
    a.download = "Dati_" + nome.replace(/\\s+/g, "_") + ".json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function caricaDati(event) {
    var file = event.target.files[0];
    if (!file) return;
    var reader = new FileReader();
    reader.onload = function(e) {
        try {
            var dati = JSON.parse(e.target.result);
            if (!dati || !dati.impianti) {
                showCustomAlert("File non valido.");
                return;
            }

            document.getElementById('nome').value = dati.paziente || '';

            selectedTeeth = [];
            impiantiData = {};

            for (var i = 0; i < dati.impianti.length; i++) {
                var imp = dati.impianti[i];
                var dente = parseInt(imp.dente);
                if (!dente) continue;

                selectedTeeth.push(dente);
                impiantiData[dente] = {
                    hu: imp.hu || '',
                    densitaClass: imp.densitaClass || '',
                    inputMode: imp.inputMode || 'hu',
                    carico: imp.carico === 'compresso',
                    post: (imp.post === 'si' || imp.postEstrattivo === 'si'),
                    postEstrattivo: (imp.post === 'si' || imp.postEstrattivo === 'si'),
                    corticale: imp.corticale || '',
                    b1one: imp.b1one || 'High',
                    diametro: imp.diametro || '3.7',
                    lunghezza: imp.lunghezza || '10'
                };
            }

            selectedTeeth = ordinaDentiOdontogramma(selectedTeeth);

            initOdontogrammaSelector();
            aggiornaImpiantiContainer();
        } catch (err) {
            showCustomAlert("Errore file JSON.");
        }
    };
    reader.readAsText(file);
}

// =============================================
// EXPORT PDF
// =============================================

function esportaPDF() {
    var nome = document.getElementById('nome').value || 'paziente';
    var output = document.getElementById('output');
    if (output.innerHTML.indexOf('Risultati per:') === -1) {
        showCustomAlert("Non ci sono risultati da esportare.");
        return;
    }
    html2canvas(output, { scale: 2 }).then(function(canvas) {
        var imgData = canvas.toDataURL('image/jpeg', 1.0);
        var pdf = new window.jspdf.jsPDF('p', 'mm', 'a4');
        var pageWidth = pdf.internal.pageSize.getWidth();
        var pageHeight = pdf.internal.pageSize.getHeight();
        var imgProps = pdf.getImageProperties(imgData);
        var imgHeight = (imgProps.height * pageWidth) / imgProps.width;
        var position = 0;
        while (position < imgHeight) {
            pdf.addImage(imgData, 'JPEG', 0, -position, pageWidth, imgHeight);
            position += pageHeight;
            if (position < imgHeight) pdf.addPage();
        }
        pdf.save('Protocollo_B1One_' + nome.replace(/\\s+/g, '_') + '.pdf');
    });
}

// =============================================
// FLUSSO DI PREPARAZIONE
// =============================================

function extractDiameter(text) {
    if (!text || typeof text !== 'string') return 0;
    var match = text.match(/(\\d+[.,]\\d+)/);
    return match ? parseFloat(match[1].replace(',', '.')) : 0;
}

// Nuova funzione per estrarre TUTTI i passaggi di fresatura dal testo di preparazione
function estraiTuttiPassaggi(prepText, fresaPrincipale, lunghezzaDefault) {
    var passaggi = [];
    var cleanText = prepText.replace(/<[^>]*>/g, ' ').replace(/<strong>/g, '').replace(/<\\/strong>/g, '');
    
    // Pattern 1: trova tutti i "Ø X.X (Y.Ymm)" nel testo (diametri numerici)
    var pattern1 = /Ø\\s*(\\d+[.,]\\d+)\\s*[^\\(]*?\\((\\d+[.,]?\\d*)\\s*mm\\)/gi;
    var match;
    
    while ((match = pattern1.exec(cleanText)) !== null) {
        var diam = parseFloat(match[1].replace(',', '.'));
        var lung = match[2].replace(',', '.') + "mm";
        if (diam > 0) {
            passaggi.push({ diametro: diam, lunghezza: lung, tipo: 'fresa' });
        }
    }
    
    // Pattern 2: trova "Ø f.lettrice (Y.Ymm)" o "Ø F.lettrice (Y.Ymm)"
    var pattern2 = /Ø\\s*f\\.?lettrice\\s*[^\\(]*?\\((\\d+[.,]?\\d*)\\s*mm\\)/gi;
    while ((match = pattern2.exec(cleanText)) !== null) {
        var lungLettrice = match[1].replace(',', '.') + "mm";
        passaggi.push({ diametro: 2.5, lunghezza: lungLettrice, tipo: 'f.lettrice', label: 'F.lettrice' });
    }
    
    // Pattern 3: trova "Ø maschiatore X.X (Y.Ymm)"
    var pattern3 = /maschiatore\\s*(\\d+[.,]\\d+)\\s*[^\\(]*?\\((\\d+[.,]?\\d*)\\s*mm\\)/gi;
    while ((match = pattern3.exec(cleanText)) !== null) {
        var diamMasch = parseFloat(match[1].replace(',', '.'));
        var lungMasch = match[2].replace(',', '.') + "mm";
        if (diamMasch > 0) {
            passaggi.push({ diametro: diamMasch, lunghezza: lungMasch, tipo: 'maschiatore', label: 'Masch. ' + diamMasch });
        }
    }
    
    // Se non abbiamo trovato passaggi nel testo prep, usa la fresa principale
    if (passaggi.length === 0) {
        var diamPrinc = extractDiameter(fresaPrincipale);
        
        // Controlla se la fresa principale contiene F.lettrice
        var hasFLettrice = fresaPrincipale && fresaPrincipale.toLowerCase().indexOf('lettrice') !== -1;
        
        if (hasFLettrice) {
            // Se è F.lettrice (con o senza altro diametro)
            passaggi.push({ diametro: 2.5, lunghezza: lunghezzaDefault, tipo: 'f.lettrice', label: 'F.lettrice' });
            
            // Se c'è anche un diametro numerico (es. "2.8 oppure F.lettrice"), aggiungi anche quello
            if (diamPrinc > 0 && diamPrinc !== 2.5) {
                passaggi.push({ diametro: diamPrinc, lunghezza: lunghezzaDefault, tipo: 'fresa' });
            }
        } else if (diamPrinc > 0) {
            passaggi.push({ diametro: diamPrinc, lunghezza: lunghezzaDefault, tipo: 'fresa' });
        }
    }
    
    // Ordina i passaggi per diametro crescente
    passaggi.sort(function(a, b) { return a.diametro - b.diametro; });
    
    return passaggi;
}

function calcolaFresaComune() {
    salvaStatoTutti();
    
    if (selectedTeeth.length === 0) {
        return showCustomAlert("Seleziona prima gli impianti dall'odontogramma.");
    }

    var superiore = [];
    var inferiore = [];

    for (var i = 0; i < selectedTeeth.length; i++) {
        var dente = selectedTeeth[i];
        var data = impiantiData[dente];
        if (!data) continue;

        var hu = parseInt(data.hu) || 0;
        if (data.inputMode === 'densita' && data.densitaClass) {
            var mappa = { "D1": 1300, "D2_D1": 1200, "D2": 1000, "D3_D2": 775, "D3": 600, "D3_D4": 400, "D4": 250 };
            hu = mappa[data.densitaClass] || 0;
        }

        var carico = (data.carico || data.post) ? 'compresso' : 'non compresso';
        var b1one = data.b1one || 'High';
        var diametro = data.diametro || '3.7';
        var lunghezza = data.lunghezza || '10';

        var prep = getProtocolloDinamico(b1one, diametro, hu, carico, lunghezza);
        
        // Estrai TUTTI i passaggi di fresatura
        var passaggi = estraiTuttiPassaggi(prep.prep, prep.fresa, ((parseFloat(lunghezza) + 0.5) + "mm"));
        
        // Trova il diametro finale per questo dente
        // ECCEZIONE: se il dente ha F.lettrice, quella è la fresa finale
        var diametroFinale = 0;
        var haFLettrice = false;
        
        for (var p = 0; p < passaggi.length; p++) {
            if (passaggi[p].tipo === 'f.lettrice' || passaggi[p].label === 'F.lettrice') {
                haFLettrice = true;
                diametroFinale = passaggi[p].diametro; // F.lettrice è la fresa finale
                break;
            }
        }
        
        // Se non ha F.lettrice, usa il diametro massimo
        if (!haFLettrice) {
            for (var p = 0; p < passaggi.length; p++) {
                if (passaggi[p].diametro > diametroFinale) {
                    diametroFinale = passaggi[p].diametro;
                }
            }
        }
        
        if (passaggi.length > 0) {
            // Determina stato testa con corticale
            var corticale = data.corticale || '';
            var postEstrattivo = data.post || data.postEstrattivo || false;
            var statoTesta = getStatoTesta(dente, prep.densita, corticale, postEstrattivo);
            var headPrepValue = '';
            if (statoTesta === 'obbligatoria') {
                headPrepValue = prep.testa || 'Secondo protocollo';
            } else if (statoTesta === 'a_discrezione') {
                headPrepValue = prep.testa;
            }
            
            var item = {
                id: i + 1,
                dente: dente,
                diam: diametroFinale,
                passaggi: passaggi,
                prepText: prep.prep,
                impDiam: diametro,
                impLen: lunghezza,
                b1Type: b1one,
                densityLabel: prep.densita,
                headPrep: headPrepValue,
                statoTesta: statoTesta,
                corticale: corticale
            };

            if (dente >= 10 && dente <= 29) superiore.push(item);
            else if (dente >= 30 && dente <= 49) inferiore.push(item);
        }
    }

    if (superiore.length === 0 && inferiore.length === 0) {
        return showCustomAlert("Nessun impianto valido trovato per il calcolo.");
    }

    function getDensColor(d) {
        // TENDENTI (colori sbiaditi)
        if (d.indexOf('D2 → D1') !== -1 || d === 'D2_D1') return '#ffcdd2';
        if (d.indexOf('D3 → D2') !== -1 || d === 'D3_D2') return '#ffe0b2';
        if (d.indexOf('D3 → D4') !== -1 || d === 'D3_D4') return '#c8e6c9';
        // DENSITÀ PURE (colori netti)
        if (d === 'D1' || (d.indexOf('D1') !== -1 && d.indexOf('→') === -1)) return '#ef5350';
        if (d === 'D2' || (d.indexOf('D2') !== -1 && d.indexOf('→') === -1)) return '#ffa726';
        if (d === 'D3' || (d.indexOf('D3') !== -1 && d.indexOf('→') === -1)) return '#ffee58';
        if (d === 'D4' || (d.indexOf('D4') !== -1 && d.indexOf('→') === -1)) return '#66bb6a';
        return '#f9f9f9';
    }

    function generaRiepilogoImpianti(items) {
        if (items.length === 0) return "";
        items = ordinaDentiOdontogrammaOggetti(items, 'dente');
        var html = '<div style="margin-bottom:15px; background:#eef; padding:10px; border-radius:6px; font-size:13px; border:1px solid #ccf;">' +
            '<div style="font-weight:bold; margin-bottom:5px; color:#004085;">📋 Riepilogo Impianti:</div>' +
            '<div style="display:flex; flex-wrap:wrap; gap:10px;">';

        for (var i = 0; i < items.length; i++) {
            var item = items[i];
            var bgCol = getDensColor(item.densityLabel);
            var prefix = item.b1Type.charAt(0);
            html += '<div style="background:' + bgCol + '; padding:4px 8px; border-radius:4px; border:1px solid #ccc; box-shadow:0 1px 2px rgba(0,0,0,0.1);">' +
                '<strong>#' + item.dente + '</strong>: ' + prefix + ' Ø' + item.impDiam + ' x ' + item.impLen + 'mm</div>';
        }

        html += '</div>' +
            '<div style="margin-top:10px; display:flex; gap:8px; font-size:10px; align-items:center; flex-wrap:wrap;">' +
            '<span style="font-weight:bold; color:#555;">Legenda:</span>' +
            '<span style="display:flex;align-items:center;gap:2px;"><span style="width:10px;height:10px;background:#ef5350;border:1px solid #999;border-radius:50%"></span>D1</span>' +
            '<span style="display:flex;align-items:center;gap:2px;"><span style="width:10px;height:10px;background:#ffcdd2;border:1px solid #999;border-radius:50%"></span>D2→D1</span>' +
            '<span style="display:flex;align-items:center;gap:2px;"><span style="width:10px;height:10px;background:#ffa726;border:1px solid #999;border-radius:50%"></span>D2</span>' +
            '<span style="display:flex;align-items:center;gap:2px;"><span style="width:10px;height:10px;background:#ffe0b2;border:1px solid #999;border-radius:50%"></span>D3→D2</span>' +
            '<span style="display:flex;align-items:center;gap:2px;"><span style="width:10px;height:10px;background:#ffee58;border:1px solid #999;border-radius:50%"></span>D3</span>' +
            '<span style="display:flex;align-items:center;gap:2px;"><span style="width:10px;height:10px;background:#c8e6c9;border:1px solid #999;border-radius:50%"></span>D3→D4</span>' +
            '<span style="display:flex;align-items:center;gap:2px;"><span style="width:10px;height:10px;background:#66bb6a;border:1px solid #999;border-radius:50%"></span>D4</span>' +
            '</div>' +
            '<div style="margin-top:5px; display:flex; gap:10px; font-size:10px; align-items:center; flex-wrap:wrap; background:#e3f2fd; padding:4px 8px; border-radius:4px;">' +
            '<span style="font-weight:bold; color:#1565c0;">Corticale:</span>' +
            '<span style="display:flex;align-items:center;gap:2px;"><span style="width:12px;height:12px;background:#fff;border:4px solid #1565c0;border-radius:50%;box-sizing:border-box;"></span>H</span>' +
            '<span style="display:flex;align-items:center;gap:2px;"><span style="width:12px;height:12px;background:#fff;border:3px solid #1976d2;border-radius:50%;box-sizing:border-box;"></span>N</span>' +
            '<span style="display:flex;align-items:center;gap:2px;"><span style="width:12px;height:12px;background:#fff;border:2px solid #64b5f6;border-radius:50%;box-sizing:border-box;"></span>S</span>' +
            '<span style="display:flex;align-items:center;gap:2px;"><span style="width:12px;height:12px;background:#fff;border:2px solid #333;border-radius:50%;box-sizing:border-box;"></span>-</span>' +
            '</div></div>';
        return html;
    }

    function generaSequenzaArcata(items, nomeArcata, coloreBordo) {
        if (items.length === 0) return "";
        
        // Raccogli TUTTI i diametri da TUTTI i passaggi di TUTTI i denti
        var tuttiDiametriMap = {};
        for (var x = 0; x < items.length; x++) {
            var passaggi = items[x].passaggi || [];
            for (var p = 0; p < passaggi.length; p++) {
                var key = passaggi[p].diametro.toFixed(2);
                if (!tuttiDiametriMap[key]) {
                    tuttiDiametriMap[key] = {
                        diametro: passaggi[p].diametro,
                        label: passaggi[p].label || null,
                        tipo: passaggi[p].tipo || 'fresa'
                    };
                }
                if (passaggi[p].label && !tuttiDiametriMap[key].label) {
                    tuttiDiametriMap[key].label = passaggi[p].label;
                    tuttiDiametriMap[key].tipo = passaggi[p].tipo;
                }
            }
        }
        var tuttiDiametri = Object.keys(tuttiDiametriMap).map(function(k) { return tuttiDiametriMap[k]; });
        tuttiDiametri.sort(function(a, b) { return a.diametro - b.diametro; });

        var html = '<div style="margin-bottom:25px; text-align:left;">' +
            '<h3 style="color:' + coloreBordo + '; font-size:18px; text-transform:uppercase; border-bottom:2px solid ' + coloreBordo + '; padding-bottom:5px; margin-bottom:10px;">' + nomeArcata + '</h3>' +
            generaRiepilogoImpianti(items) +
            '<div style="margin-top:10px;">';

        var headPrepItems = [];
        var stepCounter = 0;

        for (var index = 0; index < tuttiDiametri.length; index++) {
            var dInfo = tuttiDiametri[index];
            var d = dInfo.diametro;
            
            var dentiConQuestoDiametro = [];
            var dentiCheSiFermano = [];
            var mappaLunghezzaFinale = {};
            
            for (var i = 0; i < items.length; i++) {
                var item = items[i];
                
                // Includi TUTTI i denti che hanno diametro finale >= d
                if (item.diam < d - 0.05) continue;
                
                var passaggi = item.passaggi || [];
                var lunghezzaPerQuestoDiam = null;
                
                // Cerca la lunghezza per questo diametro specifico
                for (var j = 0; j < passaggi.length; j++) {
                    if (Math.abs(passaggi[j].diametro - d) < 0.05) {
                        lunghezzaPerQuestoDiam = passaggi[j].lunghezza;
                        break;
                    }
                }
                
                // Se non ha questo diametro, usa la lunghezza del primo passaggio con diametro > d
                if (!lunghezzaPerQuestoDiam) {
                    for (var j = 0; j < passaggi.length; j++) {
                        if (passaggi[j].diametro > d) {
                            lunghezzaPerQuestoDiam = passaggi[j].lunghezza;
                            break;
                        }
                    }
                }
                
                // Fallback alla lunghezza impianto
                if (!lunghezzaPerQuestoDiam) {
                    lunghezzaPerQuestoDiam = (parseFloat(item.impLen) + 0.5) + "mm";
                }
                
                dentiConQuestoDiametro.push({
                    dente: item.dente,
                    lunghezza: lunghezzaPerQuestoDiam,
                    item: item
                });
                
                mappaLunghezzaFinale[item.dente] = parseFloat(lunghezzaPerQuestoDiam);
                
                if (Math.abs(item.diam - d) < 0.05) {
                    dentiCheSiFermano.push(item.dente);
                    if (item.headPrep) {
                        var found = false;
                        for (var hp = 0; hp < headPrepItems.length; hp++) {
                            if (headPrepItems[hp].id === item.id) { found = true; break; }
                        }
                        if (!found) headPrepItems.push(item);
                    }
                }
            }
            
            if (dentiConQuestoDiametro.length === 0) continue;
            
            stepCounter++;
            
            var gruppiLunghezza = {};
            for (var k = 0; k < dentiConQuestoDiametro.length; k++) {
                var lKey = dentiConQuestoDiametro[k].lunghezza;
                if (!gruppiLunghezza[lKey]) gruppiLunghezza[lKey] = [];
                gruppiLunghezza[lKey].push(dentiConQuestoDiametro[k]);
            }
            
            var sortedLengths = Object.keys(gruppiLunghezza).sort(function(a, b) {
                var valA = parseFloat(a) || 0;
                var valB = parseFloat(b) || 0;
                return valA - valB;
            });
            
            var passText = "";
            for (var s = 0; s < sortedLengths.length; s++) {
                var lenKey = sortedLengths[s];
                var lenValue = parseFloat(lenKey) || 0;
                
                // Per questa lunghezza, includi TUTTI i denti che hanno lunghezza >= lenValue
                var dentiPerQuestaLunghezza = [];
                for (var kk = 0; kk < dentiConQuestoDiametro.length; kk++) {
                    var denteLung = parseFloat(dentiConQuestoDiametro[kk].lunghezza) || 0;
                    if (denteLung >= lenValue - 0.1) {
                        dentiPerQuestaLunghezza.push(dentiConQuestoDiametro[kk]);
                    }
                }
                
                dentiPerQuestaLunghezza = ordinaDentiOdontogrammaOggetti(dentiPerQuestaLunghezza, 'dente');
                
                // Costruisci stringa con numeri rossi per chi si ferma a questa lunghezza
                var teethArr = [];
                for (var tt = 0; tt < dentiPerQuestaLunghezza.length; tt++) {
                    var denteNum = dentiPerQuestaLunghezza[tt].dente;
                    var siFermaQui = dentiCheSiFermano.indexOf(denteNum) !== -1 && 
                                     Math.abs(mappaLunghezzaFinale[denteNum] - lenValue) < 0.1;
                    if (siFermaQui) {
                        teethArr.push('<strong style="color:#d32f2f;">' + denteNum + '</strong>');
                    } else {
                        teethArr.push('<strong>' + denteNum + '</strong>');
                    }
                }
                var teethStr = teethArr.join(", ");
                passText += '<div style="margin-bottom:4px; padding-left:10px;">• ' + teethStr + ' <span style="color:#1976d2; font-style:italic;">(a L ' + lenKey + ')</span></div>';
            }
            
            var stoppersStr = "";
            if (dentiCheSiFermano.length > 0) {
                dentiCheSiFermano = ordinaDentiOdontogramma(dentiCheSiFermano);
                stoppersStr = '<div style="margin-top:8px; margin-left:32px; padding-top:4px; border-top:1px dashed #ccc; color:#d32f2f; font-size:13px; font-weight:bold;">🛑 STOP (Fresa Finale) per: ' + dentiCheSiFermano.join(", ") + '</div>';
            }
            
            // Determina l'etichetta da mostrare
            var fresaLabel = dInfo.label ? dInfo.label : ('Ø ' + d.toFixed(1));

            html += '<div style="background:' + (stepCounter % 2 === 1 ? '#f9f9f9' : '#fff') + '; padding:12px; border-left:5px solid ' + coloreBordo + '; margin-bottom:10px; border-radius:4px; box-shadow:0 1px 3px rgba(0,0,0,0.05);">' +
                '<div style="font-size:16px; font-weight:bold; color:#333; margin-bottom:5px; display:flex; align-items:center;">' +
                '<span style="background:' + coloreBordo + '; color:white; width:24px; height:24px; border-radius:50%; display:inline-flex; justify-content:center; align-items:center; margin-right:8px; font-size:14px;">' + stepCounter + '</span>' +
                'Fresa ' + fresaLabel +
                '</div>' +
                '<div style="color:#555; font-size:14px; margin-left:32px;">' +
                '<div style="margin-top:4px;">' + passText + '</div>' +
                '</div>' +
                stoppersStr +
                '</div>';
        }

        // Preparazione testa - raccoglie TUTTI i denti con info sulla testa
        var noTestaItems = [];
        var siTestaItems = [];
        
        // Raccogli tutti i denti con il loro stato testa
        for (var ti = 0; ti < items.length; ti++) {
            var toothItem = items[ti];
            var stato = toothItem.statoTesta || 'a_discrezione';
            
            if (stato === 'non_indicata_post_estrattivo') {
                noTestaItems.push({ dente: toothItem.dente, motivo: 'post-estrattivo' });
            } else if (stato === 'non_indicata_corticale_sottile') {
                noTestaItems.push({ dente: toothItem.dente, motivo: 'cort. S' });
            } else if (stato === 'non_indicata_mascellare' || stato === 'non_indicata_mandibolare_d4') {
                noTestaItems.push({ dente: toothItem.dente, motivo: 'osso D4' });
            } else if (stato === 'non_indicata') {
                noTestaItems.push({ dente: toothItem.dente, motivo: 'non indicata' });
            } else if (stato === 'obbligatoria') {
                siTestaItems.push({ dente: toothItem.dente, prep: toothItem.headPrep || 'Ø 4mm', tipo: 'obbligatoria' });
            } else if (stato === 'a_discrezione' && (toothItem.headPrep || toothItem.corticale)) {
                siTestaItems.push({ dente: toothItem.dente, prep: toothItem.headPrep || 'Ø 4mm', tipo: 'a_discrezione' });
            }
        }
        
        // Ordina secondo odontogramma
        noTestaItems = ordinaDentiOdontogrammaOggetti(noTestaItems, 'dente');
        siTestaItems = ordinaDentiOdontogrammaOggetti(siTestaItems, 'dente');
        
        // Mostra sezione testa
        if (siTestaItems.length > 0 || noTestaItems.length > 0) {
            html += '<div style="background:#fff3cd; padding:12px; border-left:5px solid #ffc107; margin-bottom:10px; border-radius:4px; box-shadow:0 1px 3px rgba(0,0,0,0.05); margin-top:20px;">';
            
            // Sezione Sì Testa
            if (siTestaItems.length > 0) {
                html += '<div style="font-size:16px; font-weight:bold; color:#856404; margin-bottom:5px; display:flex; align-items:center;">' +
                    '<span style="font-size:18px; margin-right:5px;">🟢</span> Preparazione Testa <button onclick="mostraInfoTesta()" style="cursor:pointer; display:inline-flex; align-items:center; justify-content:center; width:24px; height:24px; background:linear-gradient(145deg, #0077cc, #005599); color:white; border-radius:50%; font-size:14px; font-weight:bold; margin-left:8px; border:2px solid #004488; box-shadow:0 3px 6px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.3); font-family:Georgia,serif; font-style:italic;" title="Clicca per informazioni">i</button></div>' +
                    '<div style="margin-left:32px; color:#555; font-size:14px;">' +
                    '<p style="margin:0 0 5px 0;">Effettuare solo dopo l\'ultimo passaggio di fresa:</p>';
                
                for (var si = 0; si < siTestaItems.length; si++) {
                    var siItem = siTestaItems[si];
                    if (siItem.tipo === 'obbligatoria') {
                        html += '<div style="margin-bottom:4px;">• <strong style="color:#1976d2;">' + siItem.dente + '</strong>: ' + siItem.prep + ' (obbligatoria)</div>';
                    } else {
                        html += '<div style="margin-bottom:4px;">• <strong>' + siItem.dente + '</strong>: a discrezione ' + siItem.prep + '</div>';
                    }
                }
                html += '</div>';
            }
            
            // Sezione No Testa
            if (noTestaItems.length > 0) {
                html += '<div style="font-size:16px; font-weight:bold; color:#d32f2f; margin-top:10px; margin-bottom:5px; display:flex; align-items:center;">' +
                    '<span style="font-size:18px; margin-right:5px;">❌</span> No Preparazione Testa</div>' +
                    '<div style="margin-left:32px; color:#666; font-size:14px;">';
                
                for (var ni = 0; ni < noTestaItems.length; ni++) {
                    html += '<div style="margin-bottom:4px;">• <strong>' + noTestaItems[ni].dente + '</strong> <span style="font-size:12px;">(' + noTestaItems[ni].motivo + ')</span></div>';
                }
                html += '</div>';
            }
            
            html += '</div>';
        }

        html += '</div></div>';
        return html;
    }

    var msg = '<div id="sequenza-content">';

    var nomePaziente = document.getElementById('nome').value || "Paziente";
    msg += '<div style="text-align:center; margin-bottom:20px; border-bottom:1px solid #eee; padding-bottom:10px;">' +
        '<h2 style="margin:0; color:#333;">Sequenza di Preparazione</h2>' +
        '<p style="margin:5px 0 0 0; color:#666;">' + nomePaziente + '</p>' +
        '</div>';

    msg += generaSequenzaArcata(superiore, "Arcata Superiore", "#0056b3");
    msg += generaSequenzaArcata(inferiore, "Arcata Inferiore", "#28a745");
    msg += '</div>';

    msg = '<div style="text-align:right; margin-bottom:10px;">' +
        '<button onclick="esportaSequenzaPDF()" style="background:#dc3545; color:white; border:none; padding:6px 12px; border-radius:4px; cursor:pointer; font-weight:bold;">📄 Scarica PDF Sequenza</button>' +
        '</div>' + msg;

    showCustomAlert(msg, "📊 Flusso di Preparazione");
}

function esportaSequenzaPDF() {
    var element = document.getElementById('sequenza-content');
    if (!element) {
        showCustomAlert("Contenuto non trovato.");
        return;
    }
    html2canvas(element, { scale: 2 }).then(function(canvas) {
        var imgData = canvas.toDataURL('image/jpeg', 1.0);
        var pdf = new window.jspdf.jsPDF('p', 'mm', 'a4');
        var pageWidth = pdf.internal.pageSize.getWidth();
        var pageHeight = pdf.internal.pageSize.getHeight();
        var imgProps = pdf.getImageProperties(imgData);
        var imgHeight = (imgProps.height * pageWidth) / imgProps.width;
        var position = 0;
        while (position < imgHeight) {
            pdf.addImage(imgData, 'JPEG', 0, -position, pageWidth, imgHeight);
            position += pageHeight;
            if (position < imgHeight) pdf.addPage();
        }
        var nome = document.getElementById('nome').value || 'paziente';
        pdf.save('Sequenza_Preparazione_' + nome.replace(/\\s+/g, '_') + '.pdf');
    });
}

// =============================================
// SINTESI ODONTOGRAMMA
// =============================================

function parseDrillSteps(prepText) {
    var steps = [];
    var cleanText = prepText.replace(/<[^>]*>/g, '');
    
    // Pattern 1: trova "Ø X.X (Y.Ymm)" - diametri numerici
    var regex1 = /Ø\\s*([\\d.,]+)\\s*[^\\(]*?\\(([\\d.,]+)\\s*mm\\)/gi;
    var match;
    while ((match = regex1.exec(cleanText)) !== null) {
        steps.push({
            diam: match[1].replace(',', '.'),
            len: match[2].replace(',', '.')
        });
    }
    
    // Pattern 2: trova "Ø f.lettrice (Y.Ymm)"
    var regex2 = /Ø\\s*f\\.?lettrice\\s*[^\\(]*?\\(([\\d.,]+)\\s*mm\\)/gi;
    while ((match = regex2.exec(cleanText)) !== null) {
        steps.push({
            diam: 'Lett.',
            len: match[1].replace(',', '.'),
            isLettrice: true
        });
    }
    
    // Pattern 3: trova "maschiatore X.X (Y.Ymm)"
    var regex3 = /maschiatore\\s*([\\d.,]+)\\s*[^\\(]*?\\(([\\d.,]+)\\s*mm\\)/gi;
    while ((match = regex3.exec(cleanText)) !== null) {
        steps.push({
            diam: 'M' + match[1].replace(',', '.'),
            len: match[2].replace(',', '.'),
            isMaschiatore: true
        });
    }
    
    // Ordina per lunghezza (dal più corto al più lungo)
    steps.sort(function(a, b) {
        return parseFloat(a.len) - parseFloat(b.len);
    });

    return steps;
}

function mostraOdontogramma() {
    try {
        salvaStatoTutti();
        
        if (selectedTeeth.length === 0) {
            showCustomAlert("Nessun impianto selezionato.");
            return;
        }

        var overlay = document.getElementById('odonto-overlay');
        if (!overlay) {
            showCustomAlert("Errore interfaccia: Overlay non trovato.");
            return;
        }

        overlay.style.display = 'flex';
        document.getElementById('odonto-patient-name').innerText = "Paziente: " + (document.getElementById('nome').value || "Sconosciuto");

        var upperGrid = document.getElementById('grid-upper');
        var lowerGrid = document.getElementById('grid-lower');
        upperGrid.innerHTML = '';
        lowerGrid.innerHTML = '';

        var upperTeeth = [18, 17, 16, 15, 14, 13, 12, 11, 21, 22, 23, 24, 25, 26, 27, 28];
        var lowerTeeth = [48, 47, 46, 45, 44, 43, 42, 41, 31, 32, 33, 34, 35, 36, 37, 38];

        var implantMap = {};

        for (var i = 0; i < selectedTeeth.length; i++) {
            var dente = selectedTeeth[i];
            var data = impiantiData[dente];
            if (!data) continue;

            var hu = parseInt(data.hu) || 0;
            if (data.inputMode === 'densita' && data.densitaClass) {
                var mappa = { "D1": 1300, "D2_D1": 1200, "D2": 1000, "D3_D2": 775, "D3": 600, "D3_D4": 400, "D4": 250 };
                hu = mappa[data.densitaClass] || 0;
            }

            var carico = (data.carico || data.post) ? 'compresso' : 'non compresso';
            var b1one = data.b1one || 'High';
            var diametro = data.diametro || '3.7';
            var lunghezza = data.lunghezza || '10';

            var prep = getProtocolloDinamico(b1one, diametro, hu, carico, lunghezza);
            var bgColor = getDensitaBackgroundColor(prep.densita);
            var typeLetter = b1one ? b1one.charAt(0).toUpperCase() : "?";

            var drillSteps = parseDrillSteps(prep.prep);

            var drillInfoHTML = "";
            if (drillSteps.length > 0) {
                for (var s = 0; s < drillSteps.length; s++) {
                    var step = drillSteps[s];
                    if (step.isLettrice) {
                        drillInfoHTML += '<div>F.Lett. L' + step.len + '</div>';
                    } else if (step.isMaschiatore) {
                        drillInfoHTML += '<div>Masch.' + step.diam + ' L' + step.len + '</div>';
                    } else {
                        drillInfoHTML += '<div>F Ø' + step.diam + ' L' + step.len + '</div>';
                    }
                }
            } else {
                drillInfoHTML = '<div>F Ø' + prep.fresaNumerica + ' L' + prep.lunghezzaNumerica + '</div>';
            }

            // Gestione testa con corticale
            var corticale = data.corticale || '';
            var postEstrattivo = data.post || data.postEstrattivo || false;
            var statoTesta = getStatoTesta(dente, prep.densita, corticale, postEstrattivo);
            if (statoTesta === 'obbligatoria') {
                drillInfoHTML += '<div style="color:#1976d2; font-weight:bold; border-top:1px solid #ccc; margin-top:2px;">Testa ' + (prep.testa || 'Ø 4mm') + '</div>';
            } else if (statoTesta === 'non_indicata_post_estrattivo') {
                drillInfoHTML += '<div style="color:#d32f2f; font-size:11px; border-top:1px solid #ccc; margin-top:2px;">❌ No Testa (post-estr.)</div>';
            } else if (statoTesta === 'non_indicata_corticale_sottile') {
                drillInfoHTML += '<div style="color:#d32f2f; font-size:11px; border-top:1px solid #ccc; margin-top:2px;">❌ No Testa (cort. S)</div>';
            } else if (statoTesta === 'non_indicata_mascellare' || statoTesta === 'non_indicata_mandibolare_d4') {
                drillInfoHTML += '<div style="color:#ff9800; font-size:11px; border-top:1px solid #ccc; margin-top:2px;">⚠️ No Testa (osso D4)</div>';
            } else if (statoTesta === 'a_discrezione') {
                if (prep.testa || corticale) {
                    drillInfoHTML += '<div style="color:#2e7d32; font-size:11px; border-top:1px solid #ccc; margin-top:2px;">T.a discrez. ' + (prep.testa || 'Ø 4mm') + '</div>';
                }
            }

            implantMap[dente] = {
                typeLetter: typeLetter,
                diametroImp: diametro,
                lunghezzaImp: lunghezza,
                bgColor: bgColor,
                drillInfoHTML: drillInfoHTML,
                corticale: corticale,
                hasLink: data.hasLink || false
            };
        }

        for (var u = 0; u < upperTeeth.length; u++) {
            upperGrid.appendChild(createToothElement(upperTeeth[u], implantMap[upperTeeth[u]]));
        }
        for (var l = 0; l < lowerTeeth.length; l++) {
            lowerGrid.appendChild(createToothElement(lowerTeeth[l], implantMap[lowerTeeth[l]]));
        }

    } catch (e) {
        console.error(e);
        showCustomAlert("Errore durante la generazione dell'odontogramma: " + e.message);
    }
}

function createToothElement(toothNum, data) {
    var div = document.createElement('div');
    div.className = 'tooth-container';
    if (data) div.classList.add('active');

    // Determina bordo in base alla corticale
    var borderColor = '#555';
    var borderWidth = '3px';
    if (data) {
        if (data.corticale === 'H') {
            borderColor = '#1565c0';
            borderWidth = '6px';
        } else if (data.corticale === 'N') {
            borderColor = '#1976d2';
            borderWidth = '4px';
        } else if (data.corticale === 'S') {
            borderColor = '#64b5f6';
            borderWidth = '2px';
        }
    }

    var bgStyle = data ? 'background-color:' + data.bgColor + '; border-color:' + borderColor + '; border-width:' + borderWidth + '; color:#000; box-shadow:0 2px 5px rgba(0,0,0,0.15);' : '';

    var circleContent = data ? '<div style="line-height:1.1;"><div class="tooth-imp-diam">' + data.typeLetter + ' ' + data.diametroImp + '</div><div class="tooth-imp-len">' + data.lunghezzaImp + '</div></div>' : '';

    var infoBox = data ? '<div class="tooth-info" style="margin-top:4px;">' + data.drillInfoHTML + '</div>' : '';

    // Cerchio viola per Link
    var toothNumHTML = (data && data.hasLink) ?
        '<div class="tooth-number" style="display:inline-flex; align-items:center; justify-content:center; min-width:22px; height:22px; border:3px solid #7b1fa2; border-radius:50%; background:#f3e5f5; padding:0 2px;">' + toothNum + '</div>' :
        '<div class="tooth-number">' + toothNum + '</div>';

    div.innerHTML = toothNumHTML +
        '<div class="tooth-circle" style="' + bgStyle + '">' + circleContent + '</div>' +
        infoBox;
    return div;
}

    div.innerHTML = '<div class="tooth-number">' + toothNum + '</div>' +
        '<div class="tooth-circle" style="' + bgStyle + '">' + circleContent + '</div>' +
        infoBox;
    return div;
}

function closeOdonto() {
    document.getElementById('odonto-overlay').style.display = 'none';
}

function esportaOdontogrammaPDF() {
    var element = document.getElementById('odonto-sheet');
    var originalBorder = element.style.border;
    element.style.border = "none";
    html2canvas(element, { scale: 2 }).then(function(canvas) {
        element.style.border = originalBorder;
        var imgData = canvas.toDataURL('image/jpeg', 1.0);
        var pdf = new window.jspdf.jsPDF('l', 'mm', 'a4');
        var pdfWidth = pdf.internal.pageSize.getWidth();
        var imgProps = pdf.getImageProperties(imgData);
        var imgHeight = (imgProps.height * pdfWidth) / imgProps.width;
        pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, imgHeight);
        var nome = document.getElementById('nome').value || 'paziente';
        pdf.save('Sintesi_Odontogramma_' + nome.replace(/\\s+/g, '_') + '.pdf');
    });
}

// =============================================
// EDITOR PROTOCOLLI
// =============================================

function apriEditor() {
    document.getElementById("editor-overlay").style.display = "flex";
    renderEditorTable();
}

function chiudiEditor() {
    // Salva automaticamente in memoria quando si chiude l'editor
    localStorage.setItem("b1one_protocols_custom", JSON.stringify(dbProtocolli));
    document.getElementById("editor-overlay").style.display = "none";
    console.log("📦 Protocolli salvati automaticamente alla chiusura dell'editor");
}

function renderEditorTable() {
    var b1one = document.getElementById("edit-b1one").value;
    var diam = document.getElementById("edit-diametro").value;
    var tbody = document.getElementById("editor-tbody");
    tbody.innerHTML = "";

    if (!dbProtocolli[b1one] || !dbProtocolli[b1one][diam]) {
        tbody.innerHTML = "<tr><td colspan='5' style='text-align:center; padding:20px; color:red;'>Nessun protocollo definito per questa combinazione.</td></tr>";
        return;
    }
    if (Object.keys(dbProtocolli[b1one][diam]).length === 0) {
        tbody.innerHTML = "<tr><td colspan='5' style='text-align:center; padding:20px; color:red;'>Combinazione non valida per il sistema B1One.</td></tr>";
        return;
    }

    var currentNotes = dbProtocolli[b1one][diam].__notes || "";
    var notesEl = document.getElementById("edit-general-notes");
    if (notesEl) notesEl.value = currentNotes;

    var densities = ["D1", "D2_D1", "D2", "D3_D2", "D3", "D3_D4", "D4"];
    var densityLabels = {
        "D1": "D1 (>1250 HU)", "D2_D1": "D2 → D1", "D2": "D2",
        "D3_D2": "D3 → D2", "D3": "D3", "D3_D4": "D3 → D4", "D4": "D4 (<250 HU)"
    };

    for (var i = 0; i < densities.length; i++) {
        var dKey = densities[i];
        var dataRow = dbProtocolli[b1one][diam][dKey];
        if (!dataRow) continue;

        var tr1 = document.createElement("tr");
        tr1.innerHTML = '<td rowspan="2" style="font-weight:bold; vertical-align:middle;">' + densityLabels[dKey] + '</td>' +
            '<td>Differito</td>' +
            '<td><textarea oninput="updateDB(\\'' + b1one + '\\',\\'' + diam + '\\',\\'' + dKey + '\\',\\'non compresso\\',\\'fresa\\', this.value)">' + (dataRow["non compresso"].fresa || '') + '</textarea></td>' +
            '<td><textarea oninput="updateDB(\\'' + b1one + '\\',\\'' + diam + '\\',\\'' + dKey + '\\',\\'non compresso\\',\\'prep\\', this.value)">' + (dataRow["non compresso"].prep || '') + '</textarea></td>' +
            '<td><input type="text" value="' + (dataRow["non compresso"].testa || '') + '" oninput="updateDB(\\'' + b1one + '\\',\\'' + diam + '\\',\\'' + dKey + '\\',\\'non compresso\\',\\'testa\\', this.value)"></td>';
        tbody.appendChild(tr1);

        var tr2 = document.createElement("tr");
        tr2.innerHTML = '<td style="color:var(--accent); font-weight:bold;">Immediato</td>' +
            '<td><textarea oninput="updateDB(\\'' + b1one + '\\',\\'' + diam + '\\',\\'' + dKey + '\\',\\'compresso\\',\\'fresa\\', this.value)">' + (dataRow["compresso"].fresa || '') + '</textarea></td>' +
            '<td><textarea oninput="updateDB(\\'' + b1one + '\\',\\'' + diam + '\\',\\'' + dKey + '\\',\\'compresso\\',\\'prep\\', this.value)">' + (dataRow["compresso"].prep || '') + '</textarea></td>' +
            '<td><input type="text" value="' + (dataRow["compresso"].testa || '') + '" oninput="updateDB(\\'' + b1one + '\\',\\'' + diam + '\\',\\'' + dKey + '\\',\\'compresso\\',\\'testa\\', this.value)"></td>';
        tbody.appendChild(tr2);
    }
}

function updateDB(b1, diam, dens, load, field, val) {
    if (dbProtocolli[b1] && dbProtocolli[b1][diam] && dbProtocolli[b1][diam][dens]) {
        dbProtocolli[b1][diam][dens][load][field] = val;
        console.log("✅ DB aggiornato:", b1, diam, dens, load, field, "=", val);
    } else {
        console.error("❌ Percorso DB non trovato:", b1, diam, dens, load, field);
    }
}

function updateGeneralNotes(val) {
    var b1one = document.getElementById("edit-b1one").value;
    var diam = document.getElementById("edit-diametro").value;
    if (dbProtocolli[b1one] && dbProtocolli[b1one][diam]) {
        dbProtocolli[b1one][diam].__notes = val;
    }
}

function salvaProtocolliDB() {
    localStorage.setItem("b1one_protocols_custom", JSON.stringify(dbProtocolli));
    showCustomAlert("Protocolli salvati nel browser!");
    document.getElementById("editor-overlay").style.display = "none";
}

function ripristinaDefault() {
    if (confirm("Sei sicuro? Questo cancellerà tutte le tue modifiche.")) {
        localStorage.removeItem("b1one_protocols_custom");
        dbProtocolli = JSON.parse(JSON.stringify(DEFAULT_PROTOCOLS));
        renderEditorTable();
        showCustomAlert("Protocolli ripristinati ai valori di default.");
    }
}

function scaricaScriptCompleto() {
    var nuoviProtocolli = JSON.stringify(dbProtocolli, null, 2);
    var scriptCompleto = generaScriptCompleto(nuoviProtocolli);
    
    var blob = new Blob([scriptCompleto], { type: "application/javascript" });
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url;
    a.download = "script.js";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showCustomAlert("✅ File script.js scaricato!\\n\\nSostituisci il vecchio script.js con questo file per rendere le modifiche permanenti.");
}

// =============================================
// FUNZIONI ADMIN E CONTATTI
// =============================================

function mostraLogin() {
    document.getElementById("loginBox").style.display = "block";
}

function verificaLogin() {
    var pass = document.getElementById("adminPass").value;
    if (pass === "b1admin") {
        document.getElementById("accessiCount").textContent = localStorage.getItem(accessiKey) || 0;
        document.getElementById("impiantiCount").textContent = localStorage.getItem(impiantiKey) || 0;
        document.getElementById("adminArea").style.display = "block";
        document.getElementById("loginBox").style.display = "none";
    } else {
        showCustomAlert("Password Admin Errata.");
    }
}

function mostraContatti() {
    document.getElementById('finestraContatti').style.display = 'block';
}

function nascondiContatti() {
    document.getElementById('finestraContatti').style.display = 'none';
}

function creaCampiImpianti() {
    // Legacy - non più necessaria
}

// =============================================
// INIT ON LOAD
// =============================================

window.onload = function() {
    initApp();

    var ids = ['editor-overlay', 'adminArea', 'loginBox', 'odonto-overlay'];
    for (var i = 0; i < ids.length; i++) {
        var el = document.getElementById(ids[i]);
        if (el) el.style.display = 'none';
    }
};
`;
    
    return codiceCompleto;
}

function mostraContatti() {
    document.getElementById('finestraContatti').style.display = 'block';
}

function nascondiContatti() {
    document.getElementById('finestraContatti').style.display = 'none';
}

function creaCampiImpianti() {
    // Legacy - non più necessaria
}

// =============================================
// INIT ON LOAD
// =============================================

window.onload = function() {
    initApp();

    var ids = ['editor-overlay', 'adminArea', 'loginBox', 'odonto-overlay'];
    for (var i = 0; i < ids.length; i++) {
        var el = document.getElementById(ids[i]);
        if (el) el.style.display = 'none';
    }
};

// Funzione per mostrare info sulla funzione ROI - apre il PDF
// Funzione per aggiornare l'immagine dell'impianto nella card
function aggiornaImmagineCard(dente) {
    var card = document.querySelector('[data-dente="' + dente + '"]');
    if (!card) return;
    
    var b1oneEl = card.querySelector('[data-field="b1one"]');
    var diametroEl = card.querySelector('[data-field="diametro"]');
    var lunghezzaEl = card.querySelector('[data-field="lunghezza"]');
    
    var b1one = b1oneEl ? b1oneEl.value : 'High';
    var diametro = diametroEl ? diametroEl.value : '3.7';
    var lunghezza = lunghezzaEl ? lunghezzaEl.value : '10';
    
    // Mappa immagini locali
    var immaginiLocali = {
        "4.8_Medium": "48_Medium.png", "4.8_Low": "48_Low.png",
        "4.2_Low": "42_Low.png", "4.2_Medium": "42_Medium.png", "4.2_High": "42_High.png",
        "3.7_Low": "37_Low.png", "3.7_Medium": "37_Medium.png", "3.7_High": "37_High.png",
        "3.2_High": "32_High.png", "2.7_High": "27_High.png"
    };
    
    var imgKey = diametro + "_" + b1one;
    var placeholderSrc = 'https://placehold.co/120x180/2d3748/00d4ff?text=' + b1one + '%0A' + diametro;
    var imgSrc = immaginiLocali[imgKey] || placeholderSrc;
    
    // Aggiorna etichetta
    var labelEl = document.getElementById('impianto_label_' + dente);
    if (labelEl) {
        var colore = b1one === 'High' ? '#ff6b6b' : (b1one === 'Medium' ? '#ffa726' : '#66bb6a');
        labelEl.innerHTML = '<span style="color:' + colore + ';">' + b1one + '</span> Ø' + diametro + ' x ' + lunghezza + 'mm';
    }
    
    // Aggiorna immagine
    var imgEl = document.getElementById('impianto_img_' + dente);
    if (imgEl) {
        imgEl.src = imgSrc;
        imgEl.onerror = function() {
            this.onerror = null;
            this.src = placeholderSrc;
        };
    }
    
    // Aggiorna pulsante indicazioni
    var btnEl = document.getElementById('impianto_btn_' + dente);
    if (btnEl) {
        var pdfFile = "";
        if (diametro === "2.7") pdfFile = "indicazioni_27high.pdf";
        else if (diametro === "3.2") pdfFile = "indicazioni_32high.pdf";
        else if (diametro === "3.7") pdfFile = "indicazioni_37.pdf";
        else if (diametro === "4.2") pdfFile = "indicazioni_42.pdf";
        else if (diametro === "4.8") pdfFile = "indicazioni_48.pdf";
        
        if (pdfFile) {
            btnEl.style.display = 'block';
            btnEl.onclick = function() { window.open(pdfFile, '_blank'); };
        } else {
            btnEl.style.display = 'none';
        }
    }
}

function mostraInfoROI() {
    window.open('Funzione_ROI.pdf', '_blank');
}
