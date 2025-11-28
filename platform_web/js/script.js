/*
   Main Logic Script
   Handles:
   1. Plate Input & Validation (Original Logic)
   2. Map System & Routing (Leaflet Logic)
   3. Image Modal Logic
*/

// ==========================================
// PART 1: Plate Input Logic
// ==========================================

const numMapAr = { '0':'٠', '1':'١', '2':'٢', '3':'٣', '4':'٤', '5':'٥', '6':'٦', '7':'٧', '8':'٨', '9':'٩' };
const numMapEn = { '٠':'0', '١':'1', '٢':'2', '٣':'3', '٤':'4', '٥':'5', '٦':'6', '٧':'7', '٨':'8', '٩':'9' };
const validArabicChars = 'أابحد رسمصط عقكلمنهـوى';
const validEnglishChars = 'ABJDRSXTEGKLZNHUV';
const charMapArToEn = { 'أ':'A', 'ب':'B', 'ح':'J', 'د':'D', 'ر':'R', 'س':'S', 'ص':'X', 'ط':'T', 'ع':'E', 'ق':'G', 'ك':'K', 'ل':'L', 'م':'Z', 'ن':'N', 'ه':'H', 'و':'U', 'ى':'V' };
const charMapEnToAr = {};
for (let key in charMapArToEn) charMapEnToAr[charMapArToEn[key]] = key;

document.addEventListener('DOMContentLoaded', () => {
    setupPlateInputs();
    initMap(); // تشغيل الخريطة
});

function setupPlateInputs() {
    const inputNumAr = document.getElementById('inputNumAr');
    const inputNumEn = document.getElementById('inputNumEn');
    const inputCharAr = document.getElementById('inputCharAr');
    const inputCharEn = document.getElementById('inputCharEn');

    // FIX: استخدام bidi-override لإجبار الأرقام العربية على الترتيب من اليسار لليمين
    if(inputNumAr) {
        inputNumAr.style.setProperty('direction', 'ltr', 'important');
        inputNumAr.style.setProperty('unicode-bidi', 'bidi-override', 'important');
    }
    if(inputNumEn) {
        inputNumEn.style.setProperty('direction', 'ltr', 'important');
        inputNumEn.style.setProperty('unicode-bidi', 'bidi-override', 'important');
    }

    if(inputNumAr) {
        inputNumAr.addEventListener('input', (e) => {
            let val = e.target.value.replace(/\s/g, '');
            let enVal = '', filteredArVal = '';
            for (let char of val) {
                if (numMapEn[char]) { enVal += numMapEn[char]; filteredArVal += char; }
                else if (char >= '0' && char <= '9') { enVal += char; filteredArVal += numMapAr[char]; }
            }
            inputNumAr.value = filteredArVal.split('').join(' ').trim();
            inputNumEn.value = enVal.split('').join(' ').trim();
        });
    }

    if(inputNumEn) {
        inputNumEn.addEventListener('input', (e) => {
            let val = e.target.value.replace(/\s/g, '');
            let arVal = '', filteredEnVal = '';
            for (let char of val) {
                if (char >= '0' && char <= '9') { arVal += numMapAr[char]; filteredEnVal += char; }
                else if (numMapEn[char]) { arVal += char; filteredEnVal += numMapEn[char]; }
            }
            inputNumEn.value = filteredEnVal.split('').join(' ').trim();
            inputNumAr.value = arVal.split('').join(' ').trim();
        });
    }

    // --- التعديل هنا لعكس ترتيب الأحرف ---

    if(inputCharAr) {
        inputCharAr.addEventListener('input', (e) => {
            let val = e.target.value.replace(/\s/g, '');
            let filteredAr = '', enVal = '';
            for (let char of val) {
                if (char === 'ا') char = 'أ';
                if (validArabicChars.includes(char)) { 
                    filteredAr += char; 
                    // التغيير هنا: نضع الحرف الجديد في البداية لعكس الترتيب
                    // بدلاً من enVal += ...
                    enVal = charMapArToEn[char] + enVal; 
                }
            }
            inputCharAr.value = filteredAr.split('').join(' ').trim();
            inputCharEn.value = enVal.split('').join(' ').trim();
        });
    }

    if(inputCharEn) {
        inputCharEn.addEventListener('input', (e) => {
            let val = e.target.value.toUpperCase().replace(/\s/g, '');
            let filteredEn = '', arVal = '';
            for (let char of val) {
                if (validEnglishChars.includes(char)) { 
                    filteredEn += char; 
                    // التغيير هنا أيضاً: نضع الحرف العربي المترجم في البداية
                    arVal = charMapEnToAr[char] + arVal; 
                }
            }
            inputCharEn.value = filteredEn.split('').join(' ').trim();
            inputCharAr.value = arVal.split('').join(' ').trim();
        });
    }
}

// ==========================================
// PART 2: Map & Tracking Logic
// ==========================================

let map; 
let routingControl = null;
let selectedWaypoints = []; 

const cameras = [
    { name: "حي الملقا", coords: [24.8105, 46.6112] },
    { name: "حي الصحافة", coords: [24.7963, 46.6385] },
    { name: "حي النخيل", coords: [24.7681, 46.6318] },
    { name: "حي الياسمين", coords: [24.8192, 46.6568] },
    { name: "حي النرجس", coords: [24.8345, 46.6872] },
    { name: "حي حطين", coords: [24.7648, 46.6045] },
    { name: "حي العقيق", coords: [24.7785, 46.6231] },
    { name: "حي الربيع", coords: [24.7912, 46.6734] },
    { name: "حي العليا", coords: [24.6953, 46.6805] },
    { name: "حي السليمانية", coords: [24.7011, 46.6978] },
    { name: "حي الملك عبدالعزيز", coords: [24.7214, 46.7089] },
    { name: "حي المربع", coords: [24.6465, 46.7093] },
    { name: "حي الملز", coords: [24.6632, 46.7382] },
    { name: "حي الوزارات", coords: [24.6558, 46.7165] },
    { name: "حي الروضة", coords: [24.7251, 46.7654] },
    { name: "حي القدس", coords: [24.7432, 46.7541] },
    { name: "حي الحمراء", coords: [24.7689, 46.7582] },
    { name: "حي قرطبة", coords: [24.8021, 46.7456] },
    { name: "حي النسيم الغربي", coords: [24.7218, 46.8055] },
    { name: "حي إشبيلية", coords: [24.7854, 46.7821] },
    { name: "حي الخليج", coords: [24.7698, 46.8123] },
    { name: "حي السويدي", coords: [24.5985, 46.6578] },
    { name: "حي ظهرة لبن", coords: [24.6154, 46.5789] },
    { name: "حي العريجاء", coords: [24.6234, 46.6112] },
    { name: "حي طويق", coords: [24.5842, 46.5321] },
    { name: "حي العزيزية", coords: [24.5823, 46.7651] },
    { name: "حي الشفا", coords: [24.5385, 46.7082] },
    { name: "حي منفوحة", coords: [24.6089, 46.7235] },
    { name: "حي الدار البيضاء", coords: [24.5321, 46.7845] },
    { name: "حي الحاير", coords: [24.4567, 46.8123] }
];

function initMap() {
    const mapElement = document.getElementById('map');
    if (!mapElement) return;

    map = L.map('map', {zoomControl: false}).setView([24.7136, 46.6753], 11);
    
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OSM', maxZoom: 19
    }).addTo(map);

    const camCountEl = document.getElementById('camCount');
    if(camCountEl) camCountEl.innerText = cameras.length;

    cameras.forEach(cam => {
        const fixedIcon = L.divIcon({
            className: '',
            html: `<div class="pin-inner"></div>`, 
            iconSize: [20, 20],
            iconAnchor: [10, 10],
            tooltipAnchor: [0, -12]
        });

        const marker = L.marker(cam.coords, { icon: fixedIcon }).addTo(map);
        marker.bindTooltip(cam.name, { direction: 'top' });
        marker.on('click', () => handleCameraClick(cam.coords, cam.name));
    });
}

function handleCameraClick(coords, name) {
    const statusBox = document.getElementById('statusBox');
    const resetBtn = document.getElementById('resetBtn');
    const latlng = L.latLng(coords);
    
    selectedWaypoints.push(latlng);

    if (selectedWaypoints.length === 1) {
        if(statusBox) {
            statusBox.innerHTML = `البداية: <b>${name}</b><br>أكمل اختيار نقاط المسار...`;
            statusBox.style.color = "#014B32"; 
        }
    } else {
        if(statusBox) {
            statusBox.innerHTML = `تم إضافة: <b>${name}</b><br>إجمالي النقاط: ${selectedWaypoints.length}`;
            statusBox.style.color = "black";
        }
        drawRoute(selectedWaypoints);
        if(resetBtn) resetBtn.style.display = 'block';
    }
}

function drawRoute(waypoints) {
    if (routingControl) map.removeControl(routingControl);
    
    routingControl = L.Routing.control({
        waypoints: waypoints,
        routeWhileDragging: false,
        addWaypoints: false,
        draggableWaypoints: false,
        fitSelectedRoutes: true,
        show: false,
        lineOptions: { styles: [{color: '#014B32', opacity: 0.8, weight: 6}] },
        createMarker: function() { return null; }
    }).addTo(map);
}

// Global functions for buttons
window.resetMap = function() {
    selectedWaypoints = [];
    
    if (routingControl && map) {
        map.removeControl(routingControl);
        routingControl = null;
    }
    const statusBox = document.getElementById('statusBox');
    const resetBtn = document.getElementById('resetBtn');

    if(statusBox) {
        statusBox.innerHTML = "حدد نقطة البداية للمركبة...";
        statusBox.style.color = "#333";
    }
    if(resetBtn) resetBtn.style.display = 'none';
    if(map) map.setView([24.7136, 46.6753], 11);
};

window.performSearch = function() {
    const btn = document.querySelector('button[onclick="performSearch()"]');
    const searchSection = document.getElementById('searchSection');
    const resultsSection = document.getElementById('resultsSection');
    const validationMessage = document.getElementById('validationMessage');
    const inputNumEn = document.getElementById('inputNumEn');
    const inputCharEn = document.getElementById('inputCharEn');
    
    const numVal = inputNumEn ? inputNumEn.value : '';
    const charVal = inputCharEn ? inputCharEn.value : '';

    if (numVal.trim() === '' && charVal.trim() === '') {
        if(validationMessage) {
            validationMessage.textContent = 'الرجاء إدخال رقم اللوحة أو الأحرف';
            validationMessage.classList.remove('hidden');
            setTimeout(() => validationMessage.classList.add('hidden'), 3000);
        }
        return;
    }

    if(validationMessage) validationMessage.classList.add('hidden');

    const displayEl = document.getElementById('resultPlateDisplay');
    if(displayEl) displayEl.innerText = (numVal + " " + charVal).trim();

    const originalContent = btn.innerHTML;
    btn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin text-2xl"></i>';
    btn.disabled = true;
    
    setTimeout(() => {
        searchSection.classList.add('hidden-section');
        resultsSection.classList.remove('hidden-section');
        requestAnimationFrame(() => {
            resultsSection.classList.remove('opacity-0');
            resultsSection.classList.add('fade-in-up');
        });
        btn.innerHTML = originalContent;
        btn.disabled = false;
        
        if(map) {
            map.invalidateSize();
            setTimeout(() => map.invalidateSize(), 300);
        }
    }, 800);
};

window.resetSearch = function() {
    const searchSection = document.getElementById('searchSection');
    const resultsSection = document.getElementById('resultsSection');
    
    resultsSection.classList.add('opacity-0');
    setTimeout(() => {
        resultsSection.classList.add('hidden-section');
        resultsSection.classList.remove('fade-in-up');
        
        searchSection.classList.remove('hidden-section');
        requestAnimationFrame(() => {
            searchSection.classList.remove('opacity-0');
            searchSection.classList.add('fade-in-up');
        });
        
        document.querySelectorAll('.plate-input').forEach(input => input.value = '');
        if(typeof window.resetMap === 'function') window.resetMap();
    }, 300);
};

// ==========================================
// PART 3: Image Modal Logic (جديد)
// ==========================================

window.showImage = function() {
    const modal = document.getElementById('imageModal');
    if(!modal) return;
    
    modal.classList.remove('hidden');
    // تأخير بسيط لتفعيل الأنيميشن
    requestAnimationFrame(() => {
        modal.classList.remove('opacity-0');
        if(modal.firstElementChild) {
            modal.firstElementChild.classList.remove('scale-95');
            modal.firstElementChild.classList.add('scale-100');
        }
    });
}

window.closeImage = function() {
    const modal = document.getElementById('imageModal');
    if(!modal) return;

    modal.classList.add('opacity-0');
    if(modal.firstElementChild) {
        modal.firstElementChild.classList.remove('scale-100');
        modal.firstElementChild.classList.add('scale-95');
    }
    
    setTimeout(() => {
        modal.classList.add('hidden');
    }, 300);
}