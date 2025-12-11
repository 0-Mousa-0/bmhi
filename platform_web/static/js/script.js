/*
   Main Logic Script
   السكريبت الرئيسي للمشروع - النسخة النهائية المتصلة بقاعدة البيانات
*/

// ==========================================
// 1. Constants & Configuration
// ==========================================

// Maps for Arabic <-> English conversion
const numMapAr = { '0':'٠', '1':'١', '2':'٢', '3':'٣', '4':'٤', '5':'٥', '6':'٦', '7':'٧', '8':'٨', '9':'٩' };
const numMapEn = { '٠':'0', '١':'1', '٢':'2', '٣':'3', '٤':'4', '٥':'5', '٦':'6', '٧':'7', '٨':'8', '٩':'9' };
const validArabicChars = 'أابحد رسمصط عقكلمنهـوى';
const validEnglishChars = 'ABJDRSXTEGKLZNHUV';
const charMapArToEn = { 'أ':'A', 'ب':'B', 'ح':'J', 'د':'D', 'ر':'R', 'س':'S', 'ص':'X', 'ط':'T', 'ع':'E', 'ق':'G', 'ك':'K', 'ل':'L', 'م':'Z', 'ن':'N', 'ه':'H', 'و':'U', 'ى':'V' };
const charMapEnToAr = {};
for (let key in charMapArToEn) charMapEnToAr[charMapArToEn[key]] = key;

// Full Camera List (Must match Python Database coordinates)
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

let map; 
let routingControl = null;
let selectedWaypoints = []; 

// ==========================================
// 2. Initialization
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
    setupPlateInputs();
    initMap();
    renderReports();
});

// ==========================================
// 3. Plate Inputs Logic
// ==========================================

function setupPlateInputs() {
    const inputNumAr = document.getElementById('inputNumAr');
    const inputNumEn = document.getElementById('inputNumEn');
    const inputCharAr = document.getElementById('inputCharAr');
    const inputCharEn = document.getElementById('inputCharEn');

    // Force LTR direction for correct alignment
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

    if(inputCharAr) {
        inputCharAr.addEventListener('input', (e) => {
            let val = e.target.value.replace(/\s/g, '');
            let filteredAr = '', enVal = '';
            for (let char of val) {
                if (char === 'ا') char = 'أ';
                if (validArabicChars.includes(char)) { 
                    filteredAr += char; 
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
                    arVal = charMapEnToAr[char] + arVal; 
                }
            }
            inputCharEn.value = filteredEn.split('').join(' ').trim();
            inputCharAr.value = arVal.split('').join(' ').trim();
        });
    }
}

// ==========================================
// 4. Map Functions
// ==========================================

function initMap() {
    const mapElement = document.getElementById('map');
    if (!mapElement) return;

    // Center on Riyadh
    map = L.map('map', {zoomControl: false}).setView([24.7136, 46.6753], 11);
    
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OSM', maxZoom: 19
    }).addTo(map);

    const camCountEl = document.getElementById('camCount');
    if(camCountEl) camCountEl.innerText = cameras.length;

    // Add Grey Dots for Cameras
    cameras.forEach(cam => {
        const fixedIcon = L.divIcon({
            className: '',
            html: `<div class="pin-inner" style="background-color: #999; border-color: #fff;"></div>`,
            iconSize: [12, 12], 
            iconAnchor: [6, 6],
            tooltipAnchor: [0, -10]
        });

        const marker = L.marker(cam.coords, { icon: fixedIcon }).addTo(map);
        marker.bindTooltip(cam.name, { direction: 'top' });
        
        // Manual click handler (optional usage)
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
    
    // Custom Markers for Start/End of the path
    const plan = L.Routing.plan(waypoints, {
        createMarker: function(i, wp) {
            return L.marker(wp.latLng, {
                icon: L.divIcon({
                    className: '',
                    html: `<div class="pin-inner" style="background-color: #014B32; transform: scale(1.2);"></div>`,
                    iconSize: [16, 16],
                    iconAnchor: [8, 8]
                })
            });
        }
    });

    routingControl = L.Routing.control({
        plan: plan,
        routeWhileDragging: false,
        addWaypoints: false,
        draggableWaypoints: false,
        fitSelectedRoutes: true,
        show: false,
        lineOptions: { styles: [{color: '#014B32', opacity: 0.8, weight: 6}] }
    }).addTo(map);
}

window.resetMap = function() {
    selectedWaypoints = [];
    if (routingControl && map) {
        map.removeControl(routingControl);
        routingControl = null;
    }
    const statusBox = document.getElementById('statusBox');
    const resetBtn = document.getElementById('resetBtn');
    
    // Clear Sidebar Log
    const container = document.getElementById('movementLogContainer');
    if(container) container.innerHTML = '<p class="text-gray-400 text-sm p-4">قم بالبحث لعرض السجل...</p>';

    if(statusBox) {
        statusBox.innerHTML = "حدد نقطة البداية للمركبة...";
        statusBox.style.color = "#333";
    }
    if(resetBtn) resetBtn.style.display = 'none';
    if(map) map.setView([24.7136, 46.6753], 11);
};

// ==========================================
// 5. SEARCH & API LOGIC (UPDATED)
// ==========================================

window.performSearch = function() {
    const btn = document.querySelector('button[onclick="performSearch()"]');
    const searchSection = document.getElementById('searchSection');
    const resultsSection = document.getElementById('resultsSection');
    const validationMessage = document.getElementById('validationMessage');
    const inputNumEn = document.getElementById('inputNumEn');
    const inputCharEn = document.getElementById('inputCharEn');
    
    // 1. Prepare Data
    const numVal = inputNumEn ? inputNumEn.value.replace(/\s/g, '') : '';
    const charVal = inputCharEn ? inputCharEn.value.replace(/\s/g, '') : '';
    const fullPlate = numVal + charVal; 

    // 2. Validation
    if (numVal.trim() === '' && charVal.trim() === '') {
        if(validationMessage) {
            validationMessage.textContent = 'الرجاء إدخال رقم اللوحة أو الأحرف';
            validationMessage.classList.remove('hidden');
            setTimeout(() => validationMessage.classList.add('hidden'), 3000);
        }
        return;
    }
    if(validationMessage) validationMessage.classList.add('hidden');

    // 3. Update Display (Fix for 506 format)
    const displayEl = document.getElementById('resultPlateDisplay');
    if(displayEl) {
        displayEl.innerText = (numVal + " " + charVal).trim();
        displayEl.style.direction = 'ltr'; 
        displayEl.style.unicodeBidi = 'embed';
    }

    // 4. Loading State
    const originalContent = btn.innerHTML;
    btn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin text-2xl"></i>';
    btn.disabled = true;

    // 5. CALL THE REAL API (FETCH)
    fetch(`/api/check_plate/${fullPlate}`)
        .then(response => response.json())
        .then(data => {
            btn.innerHTML = originalContent;
            btn.disabled = false;

            if (data.found) {
                // Show Results
                searchSection.classList.add('hidden-section');
                resultsSection.classList.remove('hidden-section');
                requestAnimationFrame(() => {
                    resultsSection.classList.remove('opacity-0');
                    resultsSection.classList.add('fade-in-up');
                });

                // Update Map
                if(map) {
                    map.invalidateSize();
                    setTimeout(() => {
                        map.invalidateSize();
                        
                        // 1. Draw Route from DB path
                        const dbRoute = data.data.path.map(coord => L.latLng(coord[0], coord[1]));
                        selectedWaypoints = dbRoute; // Sync for manual usage if needed
                        drawRoute(dbRoute);

                        // 2. Render Sidebar History
                        renderHistoryLog(data.data.history);

                        // 3. Update Status Box
                        const statusBox = document.getElementById('statusBox');
                        const resetBtn = document.getElementById('resetBtn');
                        
                        if(statusBox) {
                            statusBox.innerHTML = `
                                المالك: <b>${data.data.owner}</b><br>
                                الحالة: <span class="${data.data.status === 'stolen' ? 'text-red-600' : 'text-green-600'} font-bold">
                                ${data.data.status === 'stolen' ? 'مسروقة' : 'نشطة'}
                                </span><br>
                                تم رصد المسار (${dbRoute.length} نقاط)
                            `;
                            statusBox.style.color = "#333";
                        }
                        if(resetBtn) resetBtn.style.display = 'block';

                        // Zoom to path
                        const bounds = L.latLngBounds(dbRoute);
                        map.fitBounds(bounds, { padding: [50, 50] });

                    }, 400);
                }

            } else {
                // Not Found Alert
                if(typeof Swal !== 'undefined') {
                    Swal.fire({
                        icon: 'error',
                        title: 'لم يتم العثور على المركبة',
                        text: 'تأكد من رقم اللوحة (جرب 9090 RBX)',
                        confirmButtonColor: '#014B32'
                    });
                } else {
                    alert('لم يتم العثور على المركبة.\nجرب لوحة: 9090 RBX');
                }
            }
        })
        .catch(error => {
            console.error('Error:', error);
            btn.innerHTML = originalContent;
            btn.disabled = false;
            alert("حدث خطأ في الاتصال بالنظام");
        });
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
// 6. Sidebar & Reports Logic
// ==========================================

// New Function to render the dynamic history list
function renderHistoryLog(historyData) {
    const container = document.getElementById('movementLogContainer');
    if (!container) return;

    container.innerHTML = ''; // Clear previous

    if(!historyData || historyData.length === 0) {
        container.innerHTML = '<p class="text-center text-gray-400 mt-4">لا توجد بيانات سجل.</p>';
        return;
    }

    historyData.forEach((item, index) => {
        const isFirst = index === 0;
        
        // Styles
        const dotStyle = isFirst 
            ? 'w-5 h-5 bg-ksaGreen border-4 border-white shadow -right-[41px]' 
            : 'w-4 h-4 bg-gray-300 border-2 border-white top-1 -right-[39px]';
            
        const cardStyle = isFirst
            ? 'p-4 bg-green-50 rounded-xl border border-green-100'
            : 'py-1 hover:bg-gray-50 rounded-lg px-2';

        const textTitle = isFirst ? 'text-gray-800' : 'text-gray-600';
        const iconBtn = isFirst
            ? 'w-8 h-8 text-ksaGreen bg-white border-green-200 hover:bg-ksaGreen hover:text-white'
            : 'w-7 h-7 text-gray-400 border-gray-200 hover:bg-ksaGreen hover:text-white hover:border-ksaGreen';

        const itemHTML = `
            <div class="relative mr-8 group transition-all duration-500 fade-in-up" style="animation-delay: ${index * 0.1}s">
                <span class="absolute ${dotStyle} rounded-full z-10"></span>
                <div class="${cardStyle} flex justify-between items-center transition-colors">
                    <div>
                        <p class="font-bold ${textTitle}">${item.name}</p>
                        <p class="text-xs text-gray-500 mt-1 flex gap-2">
                            <span>${item.date}</span>
                            <span>${item.time}</span>
                        </p>
                    </div>
                    <button onclick="showImage()" class="${iconBtn} rounded-full border flex items-center justify-center transition-all shadow-sm">
                        <i class="fa-regular fa-eye ${isFirst ? '' : 'text-xs'}"></i>
                    </button>
                </div>
            </div>
        `;
        
        container.innerHTML += itemHTML;
    });
}

window.showImage = function() {
    const modal = document.getElementById('imageModal');
    if(!modal) return;
    modal.classList.remove('hidden');
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

// دالة التبديل بين التبويبات
window.switchTab = function(tabName) {
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
        item.classList.remove('bg-ksaGreen', 'text-white'); 
        item.classList.add('text-gray-600', 'hover:bg-green-50'); 
    });

    const activeBtn = document.getElementById(`nav-${tabName}`);
    if(activeBtn) {
        activeBtn.classList.add('active');
        activeBtn.classList.remove('text-gray-600', 'hover:bg-green-50');
    }

    const viewTracking = document.getElementById('view-tracking');
    const viewReports = document.getElementById('view-reports');

    if(tabName === 'tracking') {
        viewReports.classList.add('hidden');
        viewTracking.classList.remove('hidden');
        requestAnimationFrame(() => {
            if(map) map.invalidateSize();
        });
    } else if (tabName === 'reports') {
        viewTracking.classList.add('hidden');
        viewReports.classList.remove('hidden');
    }
};

// بيانات وهمية للبلاغات (Using your provided list)
const stolenCarsData = [
    { id: 9822, plateNum: "9090", plateChar: "R B X", type: "سرقة", date: "منذ ساعتين", location: "الرياض - حي العقيق", status: "نشط", statusColor: "red" },
    { id: 4511, plateNum: "1234", plateChar: "A B D", type: "اشتباه", date: "منذ 5 ساعات", location: "الرياض - حي الملز", status: "تحت المعالجة", statusColor: "orange" },
    { id: 3321, plateNum: "5561", plateChar: "K S A", type: "سرقة", date: "أمس", location: "جدة - الحمراء", status: "نشط", statusColor: "red" },
    { id: 7782, plateNum: "6600", plateChar: "L E D", type: "لوحة مفقودة", date: "قبل يومين", location: "الدمام - الشاطئ", status: "مغلق", statusColor: "gray" },
    { id: 1122, plateNum: "8888", plateChar: "H H H", type: "سرقة", date: "قبل 3 أيام", location: "الرياض - الصحافة", status: "نشط", statusColor: "red" },
    { id: 5543, plateNum: "2020", plateChar: "N S S", type: "اشتباه", date: "قبل أسبوع", location: "مكة - العزيزية", status: "مغلق", statusColor: "gray" },
];

window.renderReports = function() {
    const grid = document.getElementById('reports-grid');
    if(!grid) return;

    grid.innerHTML = stolenCarsData.map(car => `
        <div class="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow p-5 flex flex-col">
            <div class="flex justify-between items-start mb-4">
                <div class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded-full bg-${car.statusColor}-50 flex items-center justify-center text-${car.statusColor}-600">
                        <i class="fa-solid fa-triangle-exclamation"></i>
                    </div>
                    <div>
                        <h4 class="font-bold text-gray-800 text-sm">بلاغ ${car.type}</h4>
                        <p class="text-xs text-gray-500">${car.date}</p>
                    </div>
                </div>
                <span class="px-2 py-1 rounded text-xs font-bold bg-${car.statusColor}-100 text-${car.statusColor}-700">
                    ${car.status}
                </span>
            </div>
            <div class="bg-gray-50 border border-gray-200 rounded-lg p-2 flex flex-row-reverse justify-between items-center mb-4">
                <div class="text-lg font-bold text-gray-800 font-mono">${car.plateNum}</div>
                <div class="h-6 w-[1px] bg-gray-300"></div>
                <div class="text-lg font-bold text-gray-800 font-mono tracking-widest">${car.plateChar}</div>
                <div class="flex flex-col items-center border-l border-gray-300 pl-2">
                    <span class="text-[8px] font-bold">KSA</span>
                    <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/0/0d/Flag_of_Saudi_Arabia.svg/800px-Flag_of_Saudi_Arabia.svg.png" class="w-3 opacity-80">
                </div>
            </div>
            <div class="mt-auto pt-3 border-t border-gray-100 flex justify-between items-center">
                <div class="flex items-center gap-1 text-gray-500 text-xs">
                    <i class="fa-solid fa-location-dot"></i>
                    <span>${car.location}</span>
                </div>
                <button class="text-ksaGreen text-sm font-bold hover:underline">التفاصيل</button>
            </div>
        </div>
    `).join('');
};