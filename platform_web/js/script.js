/*
   Main Logic Script - Modified to accept partial inputs
   Handles:
   1. Input mapping (Arabic <-> English) based on Saudi plate standards
   2. Input filtering (only allowed Saudi characters/digits)
   3. Search simulation & UI State management
*/

// --- Mappings & Allowed Chars (Saudi Plate Standard) ---
const numMapAr = { '0':'٠', '1':'١', '2':'٢', '3':'٣', '4':'٤', '5':'٥', '6':'٦', '7':'٧', '8':'٨', '9':'٩' };
const numMapEn = { '٠':'0', '١':'1', '٢':'2', '٣':'3', '٤':'4', '٥':'5', '٦':'6', '٧':'7', '٨':'8', '٩':'9' };

// Allowed Arabic Chars (17 chars: أ ب ج د ر س ص ط ع ق ك ل م ن هـ و ى)
const validArabicChars = 'أابجد رسمصط عقكلمنهـوى';
// Corresponding English Chars (A B J D R S C T E G K L M N H U I)
const validEnglishChars = 'ABJDRSCTEGKLMNHUI';

// The definitive mapping based on user requirements
const charMapArToEn = {
    'أ':'A', 'ب':'B', 'ج':'J', 'د':'D', 'ر':'R', 'س':'S', 'ص':'C', 'ط':'T', 'ع':'E', 'ق':'G', 'ك':'K', 'ل':'L', 'م':'M', 'ن':'N', 'ه':'H', 'و':'U', 'ى':'I'
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
const validationMessage = document.getElementById('validationMessage');

// --- Event Listeners: NUMBERS ---
// Modified to accept any number of digits (not limited to 4)

// 1. Writing in Arabic Numbers
if(inputNumAr) {
    inputNumAr.addEventListener('input', (e) => {
        let val = e.target.value.replace(/\s/g, '');
        let enVal = '';
        let filteredArVal = '';
        
        for (let char of val) {
            if (numMapEn[char]) { // Arabic digit
                enVal += numMapEn[char];
                filteredArVal += char;
            } else if (char >= '0' && char <= '9') { // English digit (handles copy-paste)
                enVal += char;
                filteredArVal += numMapAr[char];
            }
        }
        inputNumAr.value = filteredArVal.split('').join(' ').trim();
        inputNumEn.value = enVal.split('').join(' ').trim();
    });
}

// 2. Writing in English Numbers
if(inputNumEn) {
    inputNumEn.addEventListener('input', (e) => {
        let val = e.target.value.replace(/\s/g, '');
        let arVal = '';
        let filteredEnVal = '';

        for (let char of val) {
            if (char >= '0' && char <= '9') { // English digit
                arVal += numMapAr[char];
                filteredEnVal += char;
            } else if (numMapEn[char]) { // Arabic digit
                 arVal += char;
                 filteredEnVal += numMapEn[char];
            }
        }
        inputNumEn.value = filteredEnVal.split('').join(' ').trim();
        inputNumAr.value = arVal.split('').join(' ').trim();
    });
}

// --- Event Listeners: LETTERS ---

// 1. Writing in Arabic Letters (Filtering and Mapping to English)
if(inputCharAr) {
    inputCharAr.addEventListener('input', (e) => {
        let val = e.target.value;
        let filteredAr = '';
        let enVal = '';
        
        const cleanVal = val.replace(/\s/g, '');

        for (let char of cleanVal) {
            // تحويل "ا" إلى "أ" تلقائياً
            if (char === 'ا') {
                char = 'أ'; // Convert Alif to Hamza
            }
            
            if (validArabicChars.includes(char)) {
                filteredAr += char;
                enVal += charMapArToEn[char];
            }
        }
        
        inputCharAr.value = filteredAr.split('').join(' ').trim();
        inputCharEn.value = enVal.split('').join(' ').trim();
    });
}

// 2. Writing in English Letters (Filtering and Mapping to Arabic)
if(inputCharEn) {
    inputCharEn.addEventListener('input', (e) => {
        let val = e.target.value.toUpperCase();
        let filteredEn = '';
        let arVal = '';
        
        const cleanVal = val.replace(/\s/g, '');
        
        for (let char of cleanVal) {
            if (validEnglishChars.includes(char)) {
                filteredEn += char;
                // الحفاظ على "أ" للقيمة A
                arVal += charMapEnToAr[char];
            }
        }

        inputCharEn.value = filteredEn.split('').join(' ').trim();
        inputCharAr.value = arVal.split('').join(' ').trim();
    });
}

// --- Search Functions ---
// Modified to accept partial inputs for search

function performSearch() {
    const btn = document.querySelector('button[onclick="performSearch()"]');
    const searchSection = document.getElementById('searchSection');
    const resultsSection = document.getElementById('resultsSection');
    
    // Get current values (accept any length)
    const numValue = inputNumEn.value.replace(/\s/g, '');
    const charValue = inputCharEn.value.replace(/\s/g, '');
    
    // Optional: Show warning if inputs are empty instead of error
    if (numValue.length === 0 && charValue.length === 0) {
        if (validationMessage) {
            validationMessage.textContent = 'الرجاء إدخال رقم اللوحة أو الأحرف';
            validationMessage.classList.remove('hidden');
            setTimeout(() => {
                validationMessage.classList.add('hidden');
            }, 3000);
        }
        return;
    }

    if (!btn || !searchSection || !resultsSection) return;
    
    // Hide validation message if it was shown
    if (validationMessage) validationMessage.classList.add('hidden');

    // Update result text - show partial inputs
    const plateText = (inputNumEn.value + " " + inputCharEn.value).trim() || "بحث جزئي";
    const displayEl = document.getElementById('resultPlateDisplay');
    if(displayEl) displayEl.innerText = plateText;

    // Show search criteria in results
    const searchCriteriaEl = document.getElementById('searchCriteria');
    if(searchCriteriaEl) {
        let criteria = [];
        if(numValue.length > 0) criteria.push(`الأرقام: ${numValue}`);
        if(charValue.length > 0) criteria.push(`الأحرف: ${charValue}`);
        searchCriteriaEl.textContent = `معايير البحث: ${criteria.join(' - ')}`;
    }

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

// Optional: Add function to show current input status
function updateInputStatus() {
    const numValue = inputNumEn.value.replace(/\s/g, '');
    const charValue = inputCharEn.value.replace(/\s/g, '');
    
    console.log(`Current input - Numbers: ${numValue} (${numValue.length} digits), Chars: ${charValue} (${charValue.length} chars)`);
}