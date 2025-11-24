/*
   Main Logic Script
   Handles:
   1. Input mapping (Arabic <-> English)
   2. Search simulation
   3. UI State management
*/

// --- Mappings ---
const numMapAr = { '0':'٠', '1':'١', '2':'٢', '3':'٣', '4':'٤', '5':'٥', '6':'٦', '7':'٧', '8':'٨', '9':'٩' };
const numMapEn = { '٠':'0', '١':'1', '٢':'2', '٣':'3', '٤':'4', '٥':'5', '٦':'6', '٧':'7', '٨':'8', '٩':'9' };

const charMapArToEn = {
    'أ':'A', 'ب':'B', 'ح':'J', 'د':'D', 'ر':'R', 'س':'S', 'ص':'X', 'ط':'T', 'ع':'E', 'ق':'G', 'ك':'K', 'ل':'L', 'م':'Z', 'ن':'N', 'هـ':'H', 'و':'U', 'ى':'V'
};
// Reverse Mapping
const charMapEnToAr = {};
for (let key in charMapArToEn) {
    charMapEnToAr[charMapArToEn[key]] = key;
}

// --- DOM Elements ---
const inputNumAr = document.getElementById('inputNumAr');
const inputNumEn = document.getElementById('inputNumEn');
const inputCharAr = document.getElementById('inputCharAr');
const inputCharEn = document.getElementById('inputCharEn');

// --- Event Listeners: NUMBERS ---

// 1. Writing in Arabic Numbers
if(inputNumAr) {
    inputNumAr.addEventListener('input', (e) => {
        let val = e.target.value;
        let enVal = '';
        
        for (let char of val) {
            if (numMapEn[char]) { // Arabic digit -> convert
                enVal += numMapEn[char] + ' ';
            } else if (numMapAr[char]) { // English digit in Arabic field -> keep logic
                enVal += char + ' ';
            } else if (char === ' ') {
                continue;
            }
        }
        inputNumEn.value = enVal.trim();
    });
}

// 2. Writing in English Numbers
if(inputNumEn) {
    inputNumEn.addEventListener('input', (e) => {
        let val = e.target.value;
        let arVal = '';
        
        for (let char of val) {
            if (numMapAr[char]) { // English digit -> convert
                arVal += numMapAr[char] + ' ';
            } else if (numMapEn[char]) { // Arabic digit -> keep logic
                 arVal += char + ' ';
            }
        }
        inputNumAr.value = arVal.trim();
    });
}

// --- Event Listeners: LETTERS ---

// 1. Writing in Arabic Letters
if(inputCharAr) {
    inputCharAr.addEventListener('input', (e) => {
        let val = e.target.value;
        let enVal = '';
        
        for (let char of val) {
            if (char === ' ') continue;
            if (charMapArToEn[char]) {
                enVal += charMapArToEn[char] + ' ';
            } else {
                let upper = char.toUpperCase();
                if (charMapEnToAr[upper]) {
                    enVal += upper + ' ';
                }
            }
        }
        inputCharEn.value = enVal.trim();
    });
}

// 2. Writing in English Letters
if(inputCharEn) {
    inputCharEn.addEventListener('input', (e) => {
        let val = e.target.value.toUpperCase();
        let arVal = '';
        
        for (let char of val) {
            if (char === ' ') continue;
            if (charMapEnToAr[char]) {
                arVal += charMapEnToAr[char] + ' ';
            } else {
                if (charMapArToEn[char]) {
                    arVal += char + ' ';
                }
            }
        }
        inputCharAr.value = arVal.trim();
    });
}

// --- Search Functions ---

function performSearch() {
    const btn = document.querySelector('button[onclick="performSearch()"]');
    const searchSection = document.getElementById('searchSection');
    const resultsSection = document.getElementById('resultsSection');
    
    if (!btn || !searchSection || !resultsSection) return;

    // Update result text
    const plateText = (inputNumEn.value + " " + inputCharEn.value).trim() || "1234 ABD";
    const displayEl = document.getElementById('resultPlateDisplay');
    if(displayEl) displayEl.innerText = plateText;

    // Loading State
    const original = btn.innerHTML;
    btn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin text-2xl"></i>';
    btn.disabled = true;
    
    setTimeout(() => {
        searchSection.classList.add('hidden-section');
        resultsSection.classList.remove('hidden-section');
        requestAnimationFrame(() => {
            resultsSection.classList.remove('opacity-0');
            resultsSection.classList.add('fade-in-up');
        });
        btn.innerHTML = original;
        btn.disabled = false;
    }, 800);
}

function resetSearch() {
    const searchSection = document.getElementById('searchSection');
    const resultsSection = document.getElementById('resultsSection');
    
    if (!searchSection || !resultsSection) return;

    resultsSection.classList.add('opacity-0');
    setTimeout(() => {
        resultsSection.classList.add('hidden-section');
        resultsSection.classList.remove('fade-in-up');
        
        searchSection.classList.remove('hidden-section');
        requestAnimationFrame(() => {
            searchSection.classList.remove('opacity-0');
            searchSection.classList.add('fade-in-up');
        });
        
        // Clear inputs
        if(inputNumAr) inputNumAr.value = '';
        if(inputNumEn) inputNumEn.value = '';
        if(inputCharAr) inputCharAr.value = '';
        if(inputCharEn) inputCharEn.value = '';
    }, 300);
}