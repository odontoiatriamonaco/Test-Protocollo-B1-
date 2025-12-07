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

function toggleDisclaimerBtn() {
    var chk = document.getElementById('accept-check');
    var btn = document.getElementById('disclaimer-btn');
    if (chk && btn) {
        btn.disabled = !chk.checked;
    }
}

function acceptDisclaimer() {
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
        
        // Prima prova a estrarre testo direttamente
        for (var i = 1; i <= pdf.numPages; i++) {
            var page = await pdf.getPage(i);
            var textContent = await page.getTextContent();
            var pageText = textContent.items.map(function(item) { return item.str; }).join(" ");
            fullText += "\n--- PAGINA " + i + " ---\n" + pageText;
        }
        
        // Se non c'è testo, usa OCR
        var hasText = fullText.replace(/---\s*PAGINA\s*\d+\s*---/g, '').trim().length > 50;
        
        if (!hasText) {
            updateLoadingStatus("PDF contiene immagini. Avvio OCR...");
            fullText = "";
            
            // Carica Tesseract se non già caricato
            if (typeof Tesseract === 'undefined') {
                updateLoadingStatus("Caricamento motore OCR (può richiedere alcuni secondi)...");
                await loadScript('https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js');
            }
            
            updateLoadingStatus("Inizializzazione OCR...");
            
            for (var i = 1; i <= pdf.numPages; i++) {
                updateLoadingStatus("OCR pagina " + i + " di " + pdf.numPages + "...");
                
                var page = await pdf.getPage(i);
                var scale = 3.0; // Alta risoluzione per catturare numeri piccoli
                var viewport = page.getViewport({scale: scale});
                
                var canvas = document.createElement('canvas');
                var context = canvas.getContext('2d');
                canvas.height = viewport.height;
                canvas.width = viewport.width;
                
                await page.render({canvasContext: context, viewport: viewport}).promise;
                
                var imageData = canvas.toDataURL('image/png');
                
                // Usa Tesseract.recognize direttamente (API semplificata)
                var result = await Tesseract.recognize(imageData, 'ita', {
                    logger: function(m) { 
                        if (m.status === 'recognizing text') {
                            updateLoadingStatus("OCR pagina " + i + " di " + pdf.numPages + " (" + Math.round(m.progress * 100) + "%)");
                        }
                    }
                });
                
                fullText += "\n--- PAGINA " + i + " ---\n" + result.data.text;
            }
        }
        
        rawPdfText = fullText;
        console.log("Testo estratto dal PDF:", fullText);
        
        var datiEstratti = estraiDatiDaReport(fullText);
        mostraGrigliaAnteprima(datiEstratti);
        
    } catch (error) {
        console.error("Errore lettura PDF:", error);
        showCustomAlert("Errore nella lettura del PDF: " + (error.message || error));
    }
    
    document.getElementById('import-loading').style.display = 'none';
    event.target.value = '';
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
    
    // Estrai nome paziente (può essere 2 o 3 parole)
    var matchPaziente = testo.match(/Paziente[:\s]+([A-Za-zÀ-ú]+\s+[A-Za-zÀ-ú]+(?:\s+[A-Za-zÀ-ú]+)?)/i);
    if (!matchPaziente) matchPaziente = testo.match(/Nome[:\s]+([A-Za-zÀ-ú]+\s+[A-Za-zÀ-ú]+(?:\s+[A-Za-zÀ-ú]+)?)/i);
    if (matchPaziente) {
        var nomePulito = matchPaziente[1].trim();
        // Rimuovi "Report" se attaccato al nome (errore OCR comune)
        nomePulito = nomePulito.replace(/Report.*$/i, '').trim();
        risultato.paziente = nomePulito;
    }
    
    // METODO 1: Estrai denti, tipo e dimensioni usando i CODICI PRODOTTO
    // I codici sono affidabili: [210422M] = 4.2x12, [210480M] = 4.8x10, etc.
    var testoNorm = testo.replace(/\s+/g, ' ');
    
    // Mappa codici prodotto -> dimensioni
    var codiciDimensioni = {
        '210308': { diametro: '3.2', lunghezza: '8' },
        '210310': { diametro: '3.2', lunghezza: '10' },
        '210312': { diametro: '3.2', lunghezza: '12' },
        '210314': { diametro: '3.2', lunghezza: '14' },
        '210320': { diametro: '3.2', lunghezza: '10' },
        '210322': { diametro: '3.2', lunghezza: '12' },
        '210368': { diametro: '3.7', lunghezza: '8' },
        '210370': { diametro: '3.7', lunghezza: '10' },
        '210372': { diametro: '3.7', lunghezza: '12' },
        '210374': { diametro: '3.7', lunghezza: '14' },
        '210418': { diametro: '4.2', lunghezza: '8' },
        '210420': { diametro: '4.2', lunghezza: '10' },
        '210422': { diametro: '4.2', lunghezza: '12' },
        '210424': { diametro: '4.2', lunghezza: '14' },
        '210478': { diametro: '4.8', lunghezza: '8' },
        '210480': { diametro: '4.8', lunghezza: '10' },
        '210482': { diametro: '4.8', lunghezza: '12' },
        '210484': { diametro: '4.8', lunghezza: '14' }
    };
    
    // Pattern: dente + IDI Evolution + B1 One - Tipo + [codice]
    var patternCodice = /(\d{2})\s+IDI\s*Evolution\s+B1\s*One\s*[-–—]\s*(High|Medium|Low)\s+\[(\d{6})[HML]?\]/gi;
    var matchCodice;
    
    while ((matchCodice = patternCodice.exec(testoNorm)) !== null) {
        var dente = parseInt(matchCodice[1]);
        if (dente >= 11 && dente <= 48) {
            var tipo = matchCodice[2];
            var codice = matchCodice[3];
            var dim = codiciDimensioni[codice] || { diametro: '4.2', lunghezza: '12' };
            
            var exists = risultato.impianti.some(function(imp) { return imp.dente === dente; });
            if (!exists) {
                risultato.impianti.push({
                    dente: dente,
                    tipo: tipo,
                    diametro: dim.diametro,
                    lunghezza: dim.lunghezza,
                    densitaHU: "",
                    caricoImmediato: false,
                    postEstrattivo: false
                });
            }
        }
    }
    
    // Fallback: se non trova codici, usa pattern semplice
    if (risultato.impianti.length === 0) {
        var matchTabella = testoNorm.match(/(\d{2})\s+IDI\s*Evolution\s+B1\s*One\s*[-–—]\s*(High|Medium|Low)/gi);
        
        if (matchTabella) {
            for (var i = 0; i < matchTabella.length; i++) {
                var m = matchTabella[i].match(/(\d{2})\s+IDI\s*Evolution\s+B1\s*One\s*[-–—]\s*(High|Medium|Low)/i);
                if (m) {
                    var dente = parseInt(m[1]);
                    if (dente >= 11 && dente <= 48) {
                        var exists = risultato.impianti.some(function(imp) { return imp.dente === dente; });
                        if (!exists) {
                            risultato.impianti.push({
                                dente: dente,
                                tipo: m[2],
                                diametro: "",
                                lunghezza: "",
                                densitaHU: "",
                                caricoImmediato: false,
                                postEstrattivo: false
                            });
                        }
                    }
                }
            }
        }
    }
    
    // METODO 2: Cerca solo la densità HU dalle pagine di dettaglio
    var pagineDett = testo.split(/---\s*PAGINA\s*\d+\s*---/);
    
    for (var p = 0; p < pagineDett.length; p++) {
        var pagina = pagineDett[p];
        
        // Cerca solo nelle pagine che hanno "Densit" (densità osso)
        if (pagina.indexOf('Densit') === -1) continue;
        
        // Trova il numero del dente in questa pagina
        var denteHU = null;
        
        // Pattern 1: "XX IDI Evolution"
        var matchDenteTab = pagina.match(/\b(\d{2})\s+IDI\s*Evolution/i);
        if (matchDenteTab) denteHU = parseInt(matchDenteTab[1]);
        
        // Pattern 2: "X X Data" (es. "3 5 Data")
        if (!denteHU) {
            var matchConSpazio = pagina.match(/(\d)\s+(\d)\s+Data/i);
            if (matchConSpazio) denteHU = parseInt(matchConSpazio[1] + matchConSpazio[2]);
        }
        
        // Pattern 3: "XX Data" (es. "46 Data")
        if (!denteHU) {
            var matchInizio = pagina.match(/(\d{2})\s+Data/i);
            if (matchInizio) denteHU = parseInt(matchInizio[1]);
        }
        
        // Pattern 4: "X. X Data" (es. "4. 5 Data")
        if (!denteHU) {
            var matchMalLetto = pagina.match(/(\d)[\.\,\s]*([\/\d])\s+Data/i);
            if (matchMalLetto) {
                var secondChar = matchMalLetto[2] === '/' ? '7' : matchMalLetto[2];
                denteHU = parseInt(matchMalLetto[1] + secondChar);
            }
        }
        
        if (denteHU && denteHU >= 11 && denteHU <= 48) {
            // Rimuovi i codici prodotto [210xxxX] per non confondere con HU
            var paginaPulita = pagina.replace(/\[\d{6}[HML]?\]/g, '');
            
            // Cerca numeri a 3 cifre
            var tuttiNumeri = paginaPulita.match(/\b(\d{3})\b/g);
            
            if (tuttiNumeri) {
                for (var h = 0; h < tuttiNumeri.length; h++) {
                    var val = parseInt(tuttiNumeri[h]);
                    // Range HU: 200-1000, escludi valori della scala
                    if (val >= 200 && val <= 1000 && val !== 350 && val !== 850 && val !== 380) {
                        // Assegna all'impianto corrispondente
                        for (var j = 0; j < risultato.impianti.length; j++) {
                            if (risultato.impianti[j].dente === denteHU && !risultato.impianti[j].densitaHU) {
                                risultato.impianti[j].densitaHU = tuttiNumeri[h];
                                break;
                            }
                        }
                        break;
                    }
                }
            }
        }
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
    
    console.log("Dati estratti:", risultato);
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
        tbody.innerHTML = '<tr><td colspan="8" style="text-align:center; color:#999; padding:20px;">Nessun impianto trovato. Usa "Aggiungi Impianto" per inserire manualmente.</td></tr>';
    }
}

function aggiungiRigaTabella(imp, index) {
    var tbody = document.getElementById('import-tbody');
    var tr = document.createElement('tr');
    tr.id = 'import-row-' + index;
    
    tr.innerHTML = 
        '<td><input type="number" value="' + (imp.dente || '') + '" min="11" max="48" onchange="aggiornaImportData(' + index + ', \'dente\', this.value)"></td>' +
        '<td><select onchange="aggiornaImportData(' + index + ', \'tipo\', this.value)">' +
            '<option value="High"' + (imp.tipo === 'High' ? ' selected' : '') + '>High</option>' +
            '<option value="Medium"' + (imp.tipo === 'Medium' ? ' selected' : '') + '>Medium</option>' +
            '<option value="Low"' + (imp.tipo === 'Low' ? ' selected' : '') + '>Low</option>' +
        '</select></td>' +
        '<td><select onchange="aggiornaImportData(' + index + ', \'diametro\', this.value)">' +
            '<option value="3.2"' + (imp.diametro === '3.2' ? ' selected' : '') + '>3.2</option>' +
            '<option value="3.7"' + (imp.diametro === '3.7' ? ' selected' : '') + '>3.7</option>' +
            '<option value="4.2"' + (imp.diametro === '4.2' ? ' selected' : '') + '>4.2</option>' +
            '<option value="4.8"' + (imp.diametro === '4.8' ? ' selected' : '') + '>4.8</option>' +
        '</select></td>' +
        '<td><select onchange="aggiornaImportData(' + index + ', \'lunghezza\', this.value)">' +
            '<option value="8"' + (imp.lunghezza === '8' ? ' selected' : '') + '>8</option>' +
            '<option value="10"' + (imp.lunghezza === '10' ? ' selected' : '') + '>10</option>' +
            '<option value="12"' + (imp.lunghezza === '12' ? ' selected' : '') + '>12</option>' +
            '<option value="14"' + (imp.lunghezza === '14' ? ' selected' : '') + '>14</option>' +
        '</select></td>' +
        '<td><input type="number" value="' + (imp.densitaHU || '') + '" min="0" max="3000" placeholder="HU" onchange="aggiornaImportData(' + index + ', \'densitaHU\', this.value)"></td>' +
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
    
    // Salva il conteggio prima di resettare
    var numImpianti = importedImplantsData.length;
    
    document.getElementById('nome').value = paziente;
    selectedTeeth = [];
    impiantiData = {};
    
    for (var j = 0; j < importedImplantsData.length; j++) {
        var impData = importedImplantsData[j];
        var dente = parseInt(impData.dente);
        selectedTeeth.push(dente);
        impiantiData[dente] = {
            b1one: impData.tipo,
            diametro: impData.diametro,
            lunghezza: impData.lunghezza,
            hu: impData.densitaHU || '',
            inputMode: impData.densitaHU ? 'hu' : 'densita',
            carico: impData.caricoImmediato === true,
            postEstrattivo: impData.postEstrattivo === true,
            densitaClass: ''
        };
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
    
    selectedTeeth.sort(function(a, b) { return a - b; });
    
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
    var densitaEl = card.querySelector('[data-field="densita"]');
    var modoHuEl = card.querySelector('[data-field="modo_hu"]');
    var caricoEl = card.querySelector('[data-field="carico"]');
    var postEl = card.querySelector('[data-field="post"]');
    var b1oneEl = card.querySelector('[data-field="b1one"]');
    var diametroEl = card.querySelector('[data-field="diametro"]');
    var lunghezzaEl = card.querySelector('[data-field="lunghezza"]');
    
    if (huEl) data.hu = huEl.value;
    if (densitaEl) data.densitaClass = densitaEl.value;
    if (modoHuEl) data.inputMode = modoHuEl.checked ? 'hu' : 'densita';
    if (caricoEl) data.carico = caricoEl.checked;
    if (postEl) data.post = postEl.checked;
    if (b1oneEl) data.b1one = b1oneEl.value;
    if (diametroEl) data.diametro = diametroEl.value;
    if (lunghezzaEl) data.lunghezza = lunghezzaEl.value;
    
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
    var caricoChecked = data.carico ? 'checked' : '';
    var postChecked = data.postEstrattivo ? 'checked' : '';
    var b1oneValue = data.b1one || 'High';
    var diametroValue = data.diametro || '3.7';
    var lunghezzaValue = data.lunghezza || '10';
    
    var huDisplay = inputMode === 'hu' ? '' : 'display:none;';
    var densitaDisplay = inputMode === 'densita' ? '' : 'display:none;';
    var postDisplay = data.postEstrattivo ? '' : 'display:none;';
    
    card.innerHTML = '<div class="impianto-header">' +
        '<div class="impianto-title"><strong>🦷 Dente ' + dente + '</strong></div>' +
        '<button class="collapse-btn" onclick="toggleCard(this)">−</button>' +
    '</div>' +
    '<div class="impianto-content">' +
        '<div class="form-group">' +
            '<label>Densità Ossea: <span style="color:red; font-weight:bold;">*</span></label>' +
            '<div class="radio-group">' +
                '<label class="radio-label">' +
                    '<input type="radio" name="modo_densita_' + dente + '" value="hu" data-field="modo_hu" ' + (inputMode === 'hu' ? 'checked' : '') + ' onchange="toggleModoInputDente(' + dente + ')"> Hounsfield' +
                '</label>' +
                '<label class="radio-label">' +
                    '<input type="radio" name="modo_densita_' + dente + '" value="densita" data-field="modo_densita" ' + (inputMode === 'densita' ? 'checked' : '') + ' onchange="toggleModoInputDente(' + dente + ')"> Classe (D1-D4)' +
                '</label>' +
            '</div>' +
            '<div id="hu_block_' + dente + '" style="' + huDisplay + '">' +
                '<input type="number" data-field="hu" placeholder="Valore HU (es. 850)" value="' + huValue + '" onchange="salvaStatoImpianto(' + dente + ')">' +
            '</div>' +
            '<div id="densita_block_' + dente + '" style="' + densitaDisplay + '">' +
                '<select data-field="densita" onchange="impostaHUdaDensitaDente(' + dente + '); salvaStatoImpianto(' + dente + ')">' +
                    '<option value="">-- Seleziona classe --</option>' +
                    '<option value="D1"' + (densitaValue === 'D1' ? ' selected' : '') + '>D1</option>' +
                    '<option value="D2_D1"' + (densitaValue === 'D2_D1' ? ' selected' : '') + '>D2 tendente a D1</option>' +
                    '<option value="D2"' + (densitaValue === 'D2' ? ' selected' : '') + '>D2</option>' +
                    '<option value="D3_D2"' + (densitaValue === 'D3_D2' ? ' selected' : '') + '>D3 tendente a D2</option>' +
                    '<option value="D3"' + (densitaValue === 'D3' ? ' selected' : '') + '>D3</option>' +
                    '<option value="D3_D4"' + (densitaValue === 'D3_D4' ? ' selected' : '') + '>D4 tendente a D3</option>' +
                    '<option value="D4"' + (densitaValue === 'D4' ? ' selected' : '') + '>D4</option>' +
                '</select>' +
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
            '<div id="nota_post_' + dente + '" class="nota" style="' + postDisplay + '">⚠️ In presenza di una radice in posizione impianto il valore HU deve essere controllato (per possibile sovrastima).</div>' +
        '</div>' +
        '<div class="form-group">' +
            '<label>Diametro (mm):</label>' +
            '<select data-field="diametro" onchange="aggiornaTuttoDente(' + dente + '); salvaStatoImpianto(' + dente + ')">' +
                '<option value="2.7"' + (diametroValue === '2.7' ? ' selected' : '') + '>2.7</option>' +
                '<option value="3.2"' + (diametroValue === '3.2' ? ' selected' : '') + '>3.2</option>' +
                '<option value="3.7"' + (diametroValue === '3.7' ? ' selected' : '') + '>3.7</option>' +
                '<option value="4.2"' + (diametroValue === '4.2' ? ' selected' : '') + '>4.2</option>' +
                '<option value="4.8"' + (diametroValue === '4.8' ? ' selected' : '') + '>4.8</option>' +
            '</select>' +
        '</div>' +
        '<div class="form-group">' +
            '<label>Lunghezza (mm):</label>' +
            '<select data-field="lunghezza"></select>' +
        '</div>' +
        '<div class="form-group">' +
            '<label>B1One:</label>' +
            '<select data-field="b1one" onchange="aggiornaOpzioniB1OneDente(' + dente + '); salvaStatoImpianto(' + dente + ')">' +
                '<option value="High" style="color:red;"' + (b1oneValue === 'High' ? ' selected' : '') + '>High</option>' +
                '<option value="Medium" style="color:orange;"' + (b1oneValue === 'Medium' ? ' selected' : '') + '>Medium</option>' +
                '<option value="Low" style="color:green;"' + (b1oneValue === 'Low' ? ' selected' : '') + '>Low</option>' +
            '</select>' +
        '</div>' +
    '</div>';
    
    setTimeout(function() {
        aggiornaTuttoDente(dente);
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
    
    var densitaEl = card.querySelector('[data-field="densita"]');
    var huEl = card.querySelector('[data-field="hu"]');
    
    if (!densitaEl || !huEl) return;
    
    var valore = densitaEl.value;
    var mappa = { "D1": 1300, "D2_D1": 1200, "D2": 1000, "D3_D2": 775, "D3": 600, "D3_D4": 400, "D4": 250 };
    huEl.value = mappa[valore] || "";
}

function toggleNotaPostDente(dente) {
    var card = document.querySelector('[data-dente="' + dente + '"]');
    if (!card) return;
    
    var postEl = card.querySelector('[data-field="post"]');
    var notaEl = document.getElementById('nota_post_' + dente);
    
    if (postEl && notaEl) {
        notaEl.style.display = postEl.checked ? 'block' : 'none';
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
    if (densitaLabel.indexOf('D1') !== -1 && densitaLabel.indexOf('D2') === -1) return '#ffcdd2';
    if (densitaLabel.indexOf('D2') !== -1) return '#ffe0b2';
    if (densitaLabel.indexOf('D3') !== -1) return '#fff9c4';
    if (densitaLabel.indexOf('D4') !== -1) return '#c8e6c9';
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

            var carico = denteData.carico ? 'compresso' : 'non compresso';
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

            output += '<div class="result-row" style="display: grid; grid-template-columns: 1fr 4px 1fr; gap: 20px; max-width: 1000px; margin: auto; align-items: start;">' +
                '<div class="result-content">' +
                '<div class="dente">🦷 Dente: ' + denteNum + '</div>' +
                avvisoResistenza +
                '<div class="densita" style="color:' + coloreDensita + '; text-shadow:1px 1px 2px gray;">🦴 Densità: ' + prep.densita + '</div>' +
                getImpiantoIdeale(diametro, prep.densita) +
                '<div class="result-block"><strong>' + extractionIconSVG + ' Post-estrattivo:</strong> ' + (post === 'si' ? 'Sì <span style="color:red;">(rivalutare la densità ossea con il ROI)</span>' : 'No') + '</div>' +
                '<div class="result-block"><strong>🔩 B1One:</strong> <span style="color:' + coloreB1One + '; font-weight:bold;">' + b1one + ' Ø' + diametro + ' x ' + lunghezza + 'mm' + getCorpoApice(diametro, b1one) + '</span></div>' +
                '<div class="result-block"><strong>' + immediateLoadIconSVG + ' Carico immediato:</strong> ' + (carico === 'compresso' ? 'Sì' : 'No') + '</div>' +
                '<div class="result-block"><strong>' + drillIconSVG + ' Fresa Finale Ø:</strong> ' + drillDiam + ' mm</div>' +
                '<div class="result-block"><strong>📏 Preparazione in lunghezza:</strong> ' + prep.prep + '</div>' +
                (prep.noteGenerali ? '<div class="note-cliniche-box"><span class="note-cliniche-title">📝 Note Cliniche:</span><span class="note-cliniche-text">' + prep.noteGenerali + '</span></div>' : '') +
                (prep.testa ? '<div class="result-block" style="margin-top:10px;"><strong>🟢 Preparazione Testa:</strong> ' + prep.testa + '</div>' : '') +
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
        document.getElementById('odontoBtn').style.display = 'inline-block';
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
            carico: data.carico ? 'compresso' : 'non compresso',
            post: data.post ? 'si' : 'no',
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
                    post: imp.post === 'si',
                    b1one: imp.b1one || 'High',
                    diametro: imp.diametro || '3.7',
                    lunghezza: imp.lunghezza || '10'
                };
            }

            selectedTeeth.sort(function(a, b) { return a - b; });

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
        if (diamPrinc > 0) {
            passaggi.push({ diametro: diamPrinc, lunghezza: lunghezzaDefault, tipo: 'fresa' });
        } else if (fresaPrincipale && fresaPrincipale.toLowerCase().indexOf('lettrice') !== -1) {
            // Se la fresa principale è f.lettrice
            passaggi.push({ diametro: 2.5, lunghezza: lunghezzaDefault, tipo: 'f.lettrice', label: 'F.lettrice' });
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

        var carico = data.carico ? 'compresso' : 'non compresso';
        var b1one = data.b1one || 'High';
        var diametro = data.diametro || '3.7';
        var lunghezza = data.lunghezza || '10';

        var prep = getProtocolloDinamico(b1one, diametro, hu, carico, lunghezza);
        
        // Estrai TUTTI i passaggi di fresatura
        var passaggi = estraiTuttiPassaggi(prep.prep, prep.fresa, (lunghezza + "mm"));
        
        // Trova il diametro massimo (fresa finale per questo dente)
        var diametroFinale = 0;
        for (var p = 0; p < passaggi.length; p++) {
            if (passaggi[p].diametro > diametroFinale) {
                diametroFinale = passaggi[p].diametro;
            }
        }
        
        if (passaggi.length > 0) {
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
                headPrep: prep.testa
            };

            if (dente >= 10 && dente <= 29) superiore.push(item);
            else if (dente >= 30 && dente <= 49) inferiore.push(item);
        }
    }

    if (superiore.length === 0 && inferiore.length === 0) {
        return showCustomAlert("Nessun impianto valido trovato per il calcolo.");
    }

    function getDensColor(d) {
        if (d.indexOf('D1') !== -1) return '#ffcdd2';
        if (d.indexOf('D2') !== -1) return '#ffe0b2';
        if (d.indexOf('D3') !== -1) return '#fff9c4';
        if (d.indexOf('D4') !== -1) return '#c8e6c9';
        return '#f9f9f9';
    }

    function generaRiepilogoImpianti(items) {
        if (items.length === 0) return "";
        items.sort(function(a, b) { return a.dente - b.dente; });
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
            '<div style="margin-top:10px; display:flex; gap:15px; font-size:11px; align-items:center;">' +
            '<span style="font-weight:bold; color:#555;">Legenda Densità:</span>' +
            '<span style="display:flex;align-items:center;gap:4px;"><span style="width:10px;height:10px;background:#ffcdd2;border:1px solid #999;border-radius:50%"></span>D1</span>' +
            '<span style="display:flex;align-items:center;gap:4px;"><span style="width:10px;height:10px;background:#ffe0b2;border:1px solid #999;border-radius:50%"></span>D2</span>' +
            '<span style="display:flex;align-items:center;gap:4px;"><span style="width:10px;height:10px;background:#fff9c4;border:1px solid #999;border-radius:50%"></span>D3</span>' +
            '<span style="display:flex;align-items:center;gap:4px;"><span style="width:10px;height:10px;background:#c8e6c9;border:1px solid #999;border-radius:50%"></span>D4</span>' +
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
            var dLabel = dInfo.label || ('Ø ' + d.toFixed(1));
            if (!dInfo.label) {
                dLabel = 'Ø ' + d.toFixed(1);
            }
            
            // Trova tutti i denti che hanno questo diametro O UN DIAMETRO MAGGIORE nei loro passaggi
            // (cioè tutti i denti che devono passare per questo diametro)
            var dentiConQuestoDiametro = [];
            var dentiCheSiFermano = []; // Denti la cui fresa finale è questo diametro
            
            for (var i = 0; i < items.length; i++) {
                var item = items[i];
                var passaggi = item.passaggi || [];
                
                // Il dente deve essere fresato con questo diametro SE:
                // - Ha questo diametro nei suoi passaggi, OPPURE
                // - Il suo diametro finale (massimo) è >= questo diametro
                
                // Trova la lunghezza specifica per questo diametro
                var lunghezzaPerQuestoDiam = null;
                for (var j = 0; j < passaggi.length; j++) {
                    if (Math.abs(passaggi[j].diametro - d) < 0.05) {
                        lunghezzaPerQuestoDiam = passaggi[j].lunghezza;
                        break;
                    }
                }
                
                // Se il dente ha un diametro finale >= d, deve passare per questo step
                if (item.diam >= d - 0.05) {
                    // Se non abbiamo una lunghezza specifica, usa la lunghezza dell'impianto
                    var lungToUse = lunghezzaPerQuestoDiam || (item.impLen + "mm");
                    
                    dentiConQuestoDiametro.push({
                        dente: item.dente,
                        lunghezza: lungToUse,
                        item: item
                    });
                }
                
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
                var dentiArr = gruppiLunghezza[lenKey];
                
                // Ordina i denti numericamente
                dentiArr.sort(function(a, b) { return a.dente - b.dente; });
                
                var teethArr = [];
                for (var tt = 0; tt < dentiArr.length; tt++) {
                    teethArr.push('<strong>' + dentiArr[tt].dente + '</strong>');
                }
                var teethStr = teethArr.join(", ");
                passText += '<div style="margin-bottom:4px; padding-left:10px;">• ' + teethStr + ' <span style="color:#666; font-style:italic;">(a L ' + lenKey + ')</span></div>';
            }
            
            var stoppersStr = "";
            if (dentiCheSiFermano.length > 0) {
                dentiCheSiFermano.sort(function(a, b) { return a - b; });
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

        if (headPrepItems.length > 0) {
            headPrepItems.sort(function(a, b) { return a.dente - b.dente; });
            html += '<div style="background:#fff3cd; padding:12px; border-left:5px solid #ffc107; margin-bottom:10px; border-radius:4px; box-shadow:0 1px 3px rgba(0,0,0,0.05); margin-top:20px;">' +
                '<div style="font-size:16px; font-weight:bold; color:#856404; margin-bottom:5px; display:flex; align-items:center;">' +
                '<span style="font-size:18px; margin-right:5px;">🟢</span> Preparazione di Testa (Countersink)' +
                '</div>' +
                '<div style="margin-left:32px; color:#555; font-size:14px;">' +
                '<p style="margin:0 0 5px 0;">Effettuare solo dopo l\'ultimo passaggio di fresa:</p>';

            for (var hp2 = 0; hp2 < headPrepItems.length; hp2++) {
                html += '<div style="margin-bottom:4px;">• <strong>' + headPrepItems[hp2].dente + '</strong>: ' + headPrepItems[hp2].headPrep + '</div>';
            }

            html += '</div></div>';
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
// SINTESI ODONTOGRAMMA
// =============================================

function parseDrillSteps(prepText) {
    var steps = [];
    var cleanText = prepText.replace(/<[^>]*>/g, '');
    
    // Pattern 1: trova "Ø X.X (Y.Ymm)" - diametri numerici
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

            var carico = data.carico ? 'compresso' : 'non compresso';
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

            if (prep.testa) {
                drillInfoHTML += '<div style="color:#d32f2f; font-weight:bold; border-top:1px solid #ccc; margin-top:2px;">Testa ' + prep.testa + '</div>';
            }

            implantMap[dente] = {
                typeLetter: typeLetter,
                diametroImp: diametro,
                lunghezzaImp: lunghezza,
                bgColor: bgColor,
                drillInfoHTML: drillInfoHTML
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

    var bgStyle = data ? 'background-color:' + data.bgColor + '; border-color:#555; color:#000; box-shadow:0 2px 5px rgba(0,0,0,0.15);' : '';

    var circleContent = data ? '<div style="line-height:1.1;"><div class="tooth-imp-diam">' + data.typeLetter + ' ' + data.diametroImp + '</div><div class="tooth-imp-len">' + data.lunghezzaImp + '</div></div>' : '';

    var infoBox = data ? '<div class="tooth-info" style="margin-top:4px;">' + data.drillInfoHTML + '</div>' : '';

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
    }
}

function acceptDisclaimer() {
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
    
    selectedTeeth.sort(function(a, b) { return a - b; });
    
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
    var densitaEl = card.querySelector('[data-field="densita"]');
    var modoHuEl = card.querySelector('[data-field="modo_hu"]');
    var caricoEl = card.querySelector('[data-field="carico"]');
    var postEl = card.querySelector('[data-field="post"]');
    var b1oneEl = card.querySelector('[data-field="b1one"]');
    var diametroEl = card.querySelector('[data-field="diametro"]');
    var lunghezzaEl = card.querySelector('[data-field="lunghezza"]');
    
    if (huEl) data.hu = huEl.value;
    if (densitaEl) data.densitaClass = densitaEl.value;
    if (modoHuEl) data.inputMode = modoHuEl.checked ? 'hu' : 'densita';
    if (caricoEl) data.carico = caricoEl.checked;
    if (postEl) data.post = postEl.checked;
    if (b1oneEl) data.b1one = b1oneEl.value;
    if (diametroEl) data.diametro = diametroEl.value;
    if (lunghezzaEl) data.lunghezza = lunghezzaEl.value;
    
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
    var caricoChecked = data.carico ? 'checked' : '';
    var postChecked = data.postEstrattivo ? 'checked' : '';
    var b1oneValue = data.b1one || 'High';
    var diametroValue = data.diametro || '3.7';
    var lunghezzaValue = data.lunghezza || '10';
    
    var huDisplay = inputMode === 'hu' ? '' : 'display:none;';
    var densitaDisplay = inputMode === 'densita' ? '' : 'display:none;';
    var postDisplay = data.postEstrattivo ? '' : 'display:none;';
    
    card.innerHTML = '<div class="impianto-header">' +
        '<div class="impianto-title"><strong>🦷 Dente ' + dente + '</strong></div>' +
        '<button class="collapse-btn" onclick="toggleCard(this)">−</button>' +
    '</div>' +
    '<div class="impianto-content">' +
        '<div class="form-group">' +
            '<label>Densità Ossea: <span style="color:red; font-weight:bold;">*</span></label>' +
            '<div class="radio-group">' +
                '<label class="radio-label">' +
                    '<input type="radio" name="modo_densita_' + dente + '" value="hu" data-field="modo_hu" ' + (inputMode === 'hu' ? 'checked' : '') + ' onchange="toggleModoInputDente(' + dente + ')"> Hounsfield' +
                '</label>' +
                '<label class="radio-label">' +
                    '<input type="radio" name="modo_densita_' + dente + '" value="densita" data-field="modo_densita" ' + (inputMode === 'densita' ? 'checked' : '') + ' onchange="toggleModoInputDente(' + dente + ')"> Classe (D1-D4)' +
                '</label>' +
            '</div>' +
            '<div id="hu_block_' + dente + '" style="' + huDisplay + '">' +
                '<input type="number" data-field="hu" placeholder="Valore HU (es. 850)" value="' + huValue + '" onchange="salvaStatoImpianto(' + dente + ')">' +
            '</div>' +
            '<div id="densita_block_' + dente + '" style="' + densitaDisplay + '">' +
                '<select data-field="densita" onchange="impostaHUdaDensitaDente(' + dente + '); salvaStatoImpianto(' + dente + ')">' +
                    '<option value="">-- Seleziona classe --</option>' +
                    '<option value="D1"' + (densitaValue === 'D1' ? ' selected' : '') + '>D1</option>' +
                    '<option value="D2_D1"' + (densitaValue === 'D2_D1' ? ' selected' : '') + '>D2 tendente a D1</option>' +
                    '<option value="D2"' + (densitaValue === 'D2' ? ' selected' : '') + '>D2</option>' +
                    '<option value="D3_D2"' + (densitaValue === 'D3_D2' ? ' selected' : '') + '>D3 tendente a D2</option>' +
                    '<option value="D3"' + (densitaValue === 'D3' ? ' selected' : '') + '>D3</option>' +
                    '<option value="D3_D4"' + (densitaValue === 'D3_D4' ? ' selected' : '') + '>D4 tendente a D3</option>' +
                    '<option value="D4"' + (densitaValue === 'D4' ? ' selected' : '') + '>D4</option>' +
                '</select>' +
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
            '<div id="nota_post_' + dente + '" class="nota" style="' + postDisplay + '">⚠️ In presenza di una radice in posizione impianto il valore HU deve essere controllato (per possibile sovrastima).</div>' +
        '</div>' +
        '<div class="form-group">' +
            '<label>Diametro (mm):</label>' +
            '<select data-field="diametro" onchange="aggiornaTuttoDente(' + dente + '); salvaStatoImpianto(' + dente + ')">' +
                '<option value="2.7"' + (diametroValue === '2.7' ? ' selected' : '') + '>2.7</option>' +
                '<option value="3.2"' + (diametroValue === '3.2' ? ' selected' : '') + '>3.2</option>' +
                '<option value="3.7"' + (diametroValue === '3.7' ? ' selected' : '') + '>3.7</option>' +
                '<option value="4.2"' + (diametroValue === '4.2' ? ' selected' : '') + '>4.2</option>' +
                '<option value="4.8"' + (diametroValue === '4.8' ? ' selected' : '') + '>4.8</option>' +
            '</select>' +
        '</div>' +
        '<div class="form-group">' +
            '<label>Lunghezza (mm):</label>' +
            '<select data-field="lunghezza"></select>' +
        '</div>' +
        '<div class="form-group">' +
            '<label>B1One:</label>' +
            '<select data-field="b1one" onchange="aggiornaOpzioniB1OneDente(' + dente + '); salvaStatoImpianto(' + dente + ')">' +
                '<option value="High" style="color:red;"' + (b1oneValue === 'High' ? ' selected' : '') + '>High</option>' +
                '<option value="Medium" style="color:orange;"' + (b1oneValue === 'Medium' ? ' selected' : '') + '>Medium</option>' +
                '<option value="Low" style="color:green;"' + (b1oneValue === 'Low' ? ' selected' : '') + '>Low</option>' +
            '</select>' +
        '</div>' +
    '</div>';
    
    setTimeout(function() {
        aggiornaTuttoDente(dente);
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
    
    var densitaEl = card.querySelector('[data-field="densita"]');
    var huEl = card.querySelector('[data-field="hu"]');
    
    if (!densitaEl || !huEl) return;
    
    var valore = densitaEl.value;
    var mappa = { "D1": 1300, "D2_D1": 1200, "D2": 1000, "D3_D2": 775, "D3": 600, "D3_D4": 400, "D4": 250 };
    huEl.value = mappa[valore] || "";
}

function toggleNotaPostDente(dente) {
    var card = document.querySelector('[data-dente="' + dente + '"]');
    if (!card) return;
    
    var postEl = card.querySelector('[data-field="post"]');
    var notaEl = document.getElementById('nota_post_' + dente);
    
    if (postEl && notaEl) {
        notaEl.style.display = postEl.checked ? 'block' : 'none';
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
    if (densitaLabel.indexOf('D1') !== -1 && densitaLabel.indexOf('D2') === -1) return '#ffcdd2';
    if (densitaLabel.indexOf('D2') !== -1) return '#ffe0b2';
    if (densitaLabel.indexOf('D3') !== -1) return '#fff9c4';
    if (densitaLabel.indexOf('D4') !== -1) return '#c8e6c9';
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

            var carico = denteData.carico ? 'compresso' : 'non compresso';
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

            output += '<div class="result-row" style="display: grid; grid-template-columns: 1fr 4px 1fr; gap: 20px; max-width: 1000px; margin: auto; align-items: start;">' +
                '<div class="result-content">' +
                '<div class="dente">🦷 Dente: ' + denteNum + '</div>' +
                avvisoResistenza +
                '<div class="densita" style="color:' + coloreDensita + '; text-shadow:1px 1px 2px gray;">🦴 Densità: ' + prep.densita + '</div>' +
                getImpiantoIdeale(diametro, prep.densita) +
                '<div class="result-block"><strong>' + extractionIconSVG + ' Post-estrattivo:</strong> ' + (post === 'si' ? 'Sì <span style="color:red;">(rivalutare la densità ossea con il ROI)</span>' : 'No') + '</div>' +
                '<div class="result-block"><strong>🔩 B1One:</strong> <span style="color:' + coloreB1One + '; font-weight:bold;">' + b1one + ' Ø' + diametro + ' x ' + lunghezza + 'mm' + getCorpoApice(diametro, b1one) + '</span></div>' +
                '<div class="result-block"><strong>' + immediateLoadIconSVG + ' Carico immediato:</strong> ' + (carico === 'compresso' ? 'Sì' : 'No') + '</div>' +
                '<div class="result-block"><strong>' + drillIconSVG + ' Fresa Finale Ø:</strong> ' + drillDiam + ' mm</div>' +
                '<div class="result-block"><strong>📏 Preparazione in lunghezza:</strong> ' + prep.prep + '</div>' +
                (prep.noteGenerali ? '<div class="note-cliniche-box"><span class="note-cliniche-title">📝 Note Cliniche:</span><span class="note-cliniche-text">' + prep.noteGenerali + '</span></div>' : '') +
                (prep.testa ? '<div class="result-block" style="margin-top:10px;"><strong>🟢 Preparazione Testa:</strong> ' + prep.testa + '</div>' : '') +
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
        document.getElementById('odontoBtn').style.display = 'inline-block';
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
            carico: data.carico ? 'compresso' : 'non compresso',
            post: data.post ? 'si' : 'no',
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
                    post: imp.post === 'si',
                    b1one: imp.b1one || 'High',
                    diametro: imp.diametro || '3.7',
                    lunghezza: imp.lunghezza || '10'
                };
            }

            selectedTeeth.sort(function(a, b) { return a - b; });

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
        if (diamPrinc > 0) {
            passaggi.push({ diametro: diamPrinc, lunghezza: lunghezzaDefault, tipo: 'fresa' });
        } else if (fresaPrincipale && fresaPrincipale.toLowerCase().indexOf('lettrice') !== -1) {
            passaggi.push({ diametro: 2.5, lunghezza: lunghezzaDefault, tipo: 'f.lettrice', label: 'F.lettrice' });
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

        var carico = data.carico ? 'compresso' : 'non compresso';
        var b1one = data.b1one || 'High';
        var diametro = data.diametro || '3.7';
        var lunghezza = data.lunghezza || '10';

        var prep = getProtocolloDinamico(b1one, diametro, hu, carico, lunghezza);
        
        // Estrai TUTTI i passaggi di fresatura
        var passaggi = estraiTuttiPassaggi(prep.prep, prep.fresa, (lunghezza + "mm"));
        
        // Trova il diametro massimo (fresa finale per questo dente)
        var diametroFinale = 0;
        for (var p = 0; p < passaggi.length; p++) {
            if (passaggi[p].diametro > diametroFinale) {
                diametroFinale = passaggi[p].diametro;
            }
        }
        
        if (passaggi.length > 0) {
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
                headPrep: prep.testa
            };

            if (dente >= 10 && dente <= 29) superiore.push(item);
            else if (dente >= 30 && dente <= 49) inferiore.push(item);
        }
    }

    if (superiore.length === 0 && inferiore.length === 0) {
        return showCustomAlert("Nessun impianto valido trovato per il calcolo.");
    }

    function getDensColor(d) {
        if (d.indexOf('D1') !== -1) return '#ffcdd2';
        if (d.indexOf('D2') !== -1) return '#ffe0b2';
        if (d.indexOf('D3') !== -1) return '#fff9c4';
        if (d.indexOf('D4') !== -1) return '#c8e6c9';
        return '#f9f9f9';
    }

    function generaRiepilogoImpianti(items) {
        if (items.length === 0) return "";
        items.sort(function(a, b) { return a.dente - b.dente; });
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
            '<div style="margin-top:10px; display:flex; gap:15px; font-size:11px; align-items:center;">' +
            '<span style="font-weight:bold; color:#555;">Legenda Densità:</span>' +
            '<span style="display:flex;align-items:center;gap:4px;"><span style="width:10px;height:10px;background:#ffcdd2;border:1px solid #999;border-radius:50%"></span>D1</span>' +
            '<span style="display:flex;align-items:center;gap:4px;"><span style="width:10px;height:10px;background:#ffe0b2;border:1px solid #999;border-radius:50%"></span>D2</span>' +
            '<span style="display:flex;align-items:center;gap:4px;"><span style="width:10px;height:10px;background:#fff9c4;border:1px solid #999;border-radius:50%"></span>D3</span>' +
            '<span style="display:flex;align-items:center;gap:4px;"><span style="width:10px;height:10px;background:#c8e6c9;border:1px solid #999;border-radius:50%"></span>D4</span>' +
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
            
            // Trova tutti i denti che hanno questo diametro O UN DIAMETRO MAGGIORE nei loro passaggi
            var dentiConQuestoDiametro = [];
            var dentiCheSiFermano = [];
            
            for (var i = 0; i < items.length; i++) {
                var item = items[i];
                var passaggi = item.passaggi || [];
                
                // Trova la lunghezza specifica per questo diametro
                var lunghezzaPerQuestoDiam = null;
                for (var j = 0; j < passaggi.length; j++) {
                    if (Math.abs(passaggi[j].diametro - d) < 0.05) {
                        lunghezzaPerQuestoDiam = passaggi[j].lunghezza;
                        break;
                    }
                }
                
                // Se il dente ha un diametro finale >= d, deve passare per questo step
                if (item.diam >= d - 0.05) {
                    var lungToUse = lunghezzaPerQuestoDiam || (item.impLen + "mm");
                    
                    dentiConQuestoDiametro.push({
                        dente: item.dente,
                        lunghezza: lungToUse,
                        item: item
                    });
                }
                
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
                var dentiArr = gruppiLunghezza[lenKey];
                
                dentiArr.sort(function(a, b) { return a.dente - b.dente; });
                
                var teethArr = [];
                for (var tt = 0; tt < dentiArr.length; tt++) {
                    teethArr.push('<strong>' + dentiArr[tt].dente + '</strong>');
                }
                var teethStr = teethArr.join(", ");
                passText += '<div style="margin-bottom:4px; padding-left:10px;">• ' + teethStr + ' <span style="color:#666; font-style:italic;">(a L ' + lenKey + ')</span></div>';
            }
            
            var stoppersStr = "";
            if (dentiCheSiFermano.length > 0) {
                dentiCheSiFermano.sort(function(a, b) { return a - b; });
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

        if (headPrepItems.length > 0) {
            headPrepItems.sort(function(a, b) { return a.dente - b.dente; });
            html += '<div style="background:#fff3cd; padding:12px; border-left:5px solid #ffc107; margin-bottom:10px; border-radius:4px; box-shadow:0 1px 3px rgba(0,0,0,0.05); margin-top:20px;">' +
                '<div style="font-size:16px; font-weight:bold; color:#856404; margin-bottom:5px; display:flex; align-items:center;">' +
                '<span style="font-size:18px; margin-right:5px;">🟢</span> Preparazione di Testa (Countersink)' +
                '</div>' +
                '<div style="margin-left:32px; color:#555; font-size:14px;">' +
                "<p style=\\"margin:0 0 5px 0;\\">Effettuare solo dopo l'ultimo passaggio di fresa:</p>";

            for (var hp2 = 0; hp2 < headPrepItems.length; hp2++) {
                html += '<div style="margin-bottom:4px;">• <strong>' + headPrepItems[hp2].dente + '</strong>: ' + headPrepItems[hp2].headPrep + '</div>';
            }

            html += '</div></div>';
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

            var carico = data.carico ? 'compresso' : 'non compresso';
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

            if (prep.testa) {
                drillInfoHTML += '<div style="color:#d32f2f; font-weight:bold; border-top:1px solid #ccc; margin-top:2px;">Testa ' + prep.testa + '</div>';
            }

            implantMap[dente] = {
                typeLetter: typeLetter,
                diametroImp: diametro,
                lunghezzaImp: lunghezza,
                bgColor: bgColor,
                drillInfoHTML: drillInfoHTML
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

    var bgStyle = data ? 'background-color:' + data.bgColor + '; border-color:#555; color:#000; box-shadow:0 2px 5px rgba(0,0,0,0.15);' : '';

    var circleContent = data ? '<div style="line-height:1.1;"><div class="tooth-imp-diam">' + data.typeLetter + ' ' + data.diametroImp + '</div><div class="tooth-imp-len">' + data.lunghezzaImp + '</div></div>' : '';

    var infoBox = data ? '<div class="tooth-info" style="margin-top:4px;">' + data.drillInfoHTML + '</div>' : '';

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
