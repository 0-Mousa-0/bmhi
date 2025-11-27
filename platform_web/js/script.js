/*
   Main Logic Script
   Handles:
   1. Input mapping (Arabic <-> English) based on Saudi plate standards
   2. Input filtering (only allowed Saudi characters/digits)
   3. Search simulation & UI State management
*/

// --- Mappings & Allowed Chars (Saudi Plate Standard) ---
const numMapAr = { '0':'٠', '1':'١', '2':'٢', '3':'٣', '4':'٤', '5':'٥', '6':'٦', '7':'٧', '8':'٨', '9':'٩' };
const numMapEn = { '٠':'0', '١':'1', '٢':'2', '٣':'3', '٤':'4', '٥':'5', '٦':'6', '٧':'7', '٨':'8', '٩':'9' };

// Allowed Arabic Chars (17 chars: أ ب ج د ر س ص ط ع ق ك ل م ن هـ و ى)
const validArabicChars = 'أبجد رسمصط عقكلمنهـوى';
// Corresponding English Chars (A B J D R S C T E G K L M N H U I)
const validEnglishChars = 'ABJDRSCTEGKLMNHUI';

// The definitive mapping based on user requirements
const charMapArToEn = {
    'أ':'A', 'ب':'B', 'ج':'J', 'د':'D', 'ر':'R', 'س':'S', 'ص':'C', 'ط':'T', 'ع':'E', 'ق':'G', 'ك':'K', 'ل':'L', 'م':'M', 'ن':'N', 'هـ':'H', 'و':'U', 'ى':'I'
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

// Helper function to process and clean input based on allowed characters and max length
function processInput(inputValue, charMap, allowedChars, maxLength, targetInput) {
    let filteredVal = '';
    let mappedVal = '';
    let charCount = 0;

    // Remove any previous spaces before processing to get true length
    const cleanVal = inputValue.replace(/\s+/g, '').toUpperCase();

    for (let char of cleanVal) {
        if (charCount >= maxLength) break;

        let charToCheck = char;
        let mappedChar = '';
        let isArabic = charMap === charMapArToEn;

        // Determine the character to check against the allowed list
        if (isArabic) {
             // Handle the two-char "هـ" if present (though direct input is unlikely)
            if (char === 'ه' && cleanVal.includes('هـ')) charToCheck = 'هـ';
        }

        // Check if character is valid (Arabic or English side)
        let isValid = isArabic 
            ? validArabicChars.includes(charToCheck.replace(' ', '')) 
            : validEnglishChars.includes(charToCheck);
        
        if (isValid) {
            filteredVal += char;
            charCount++;
        }
    }
    
    // Perform mapping after filtering
    for (let char of filteredVal) {
        let key = isArabic ? char : char.toUpperCase();
        let value = isArabic ? charMap[key] : charMap[key];

        // Mapped value logic
        if (value) {
            mappedVal += value + ' ';
        } else if (!isArabic && charMapArToEn[key]) {
             // If English input, sometimes we need the Arabic letter itself
             mappedVal += charMapArToEn[key] + ' '; 
        } else {
            // Numbers case, just map
            if (numMapAr[char]) mappedVal += numMapAr[char] + ' ';
            else if (numMapEn[char]) mappedVal += numMapEn[char] + ' ';
        }
    }

    // Set value on the target input and re-format the source input
    if (targetInput) {
        targetInput.value = filteredVal.split('').join(' ').trim(); // Format source input with spaces
    }
    
    return mappedVal.trim();
}


// --- Event Listeners: NUMBERS ---
// Note: Numbers are universal (0-9) and handled separately
// The mapping logic remains similar but separated for clarity.

// 1. Writing in Arabic Numbers
if(inputNumAr) {
    inputNumAr.addEventListener('input', (e) => {
        let val = e.target.value.replace(/\s/g, '');
        let enVal = '';
        let filteredArVal = '';
        let charCount = 0;
        
        for (let char of val) {
            if (charCount >= 4) break;
            if (numMapEn[char]) { // Arabic digit
                enVal += numMapEn[char];
                filteredArVal += char;
                charCount++;
            } else if (numMapAr[char]) { // English digit (shouldn't happen often but handles copy-paste)
                enVal += char;
                filteredArVal += numMapAr[char];
                charCount++;
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
        let charCount = 0;

        for (let char of val) {
            if (charCount >= 4) break;
            if (numMapAr[char]) { // English digit
                arVal += numMapAr[char];
                filteredEnVal += char;
                charCount++;
            } else if (numMapEn[char]) { // Arabic digit
                 arVal += char;
                 filteredEnVal += numMapEn[char];
                 charCount++;
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
        let charCount = 0;
        
        const cleanVal = val.replace(/\s/g, '');

        for (let char of cleanVal) {
            if (charCount >= 3) break;
            
            // Handle the two-char "هـ" as a single character if possible
            if (char === 'ه' && cleanVal.includes('هـ') && charCount < 3) {
                 // Simple logic to prevent partial 'هـ' from being processed
                if(cleanVal.indexOf('ه') + 1 < cleanVal.length && cleanVal[cleanVal.indexOf('ه') + 1] === 'ـ') {
                    if (validArabicChars.includes('هـ')) {
                        filteredAr += 'هـ';
                        enVal += charMapArToEn['هـ'];
                        charCount++;
                    }
                }
            }
            
            if (validArabicChars.includes(char)) {
                filteredAr += char;
                enVal += charMapArToEn[char];
                charCount++;
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
        let charCount = 0;
        
        const cleanVal = val.replace(/\s/g, '');
        
        for (let char of cleanVal) {
            if (charCount >= 3) break;
            if (validEnglishChars.includes(char)) {
                filteredEn += char;
                arVal += charMapEnToAr[char];
                charCount++;
            }
        }

        inputCharEn.value = filteredEn.split('').join(' ').trim();
        inputCharAr.value = arVal.split('').join(' ').trim();
    });
}

// --- Search Functions ---

function performSearch() {
    const btn = document.querySelector('button[onclick="performSearch()"]');
    const searchSection = document.getElementById('searchSection');
    const resultsSection = document.getElementById('resultsSection');
    
    // Check for full plate completion (4 digits, 3 characters)
    const numValue = inputNumEn.value.replace(/\s/g, '');
    const charValue = inputCharEn.value.replace(/\s/g, '');
    
    if (numValue.length !== 4 || charValue.length !== 3) {
        if (validationMessage) {
            validationMessage.classList.remove('hidden');
            inputNumAr.classList.add('border-red-500', 'border-2');
            inputCharAr.classList.add('border-red-500', 'border-2');
            setTimeout(() => {
                validationMessage.classList.add('hidden');
                inputNumAr.classList.remove('border-red-500', 'border-2');
                inputCharAr.classList.remove('border-red-500', 'border-2');
            }, 3000);
        }
        return; // Stop search if validation fails
    }

    if (!btn || !searchSection || !resultsSection) return;
    
    // Hide validation message if it was shown
    if (validationMessage) validationMessage.classList.add('hidden');

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