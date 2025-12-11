/*
   Main Logic Script
   السكريبت الرئيسي للمشروع
   
   يقوم بمعالجة:
   1. إدخالات اللوحة والتحقق منها (ربط العربي بالإنجليزي).
   2. نظام الخرائط والتوجيه (باستخدام مكتبة Leaflet).
   3. نافذة عرض الصور (Modal).
   4. التنقل بين الصفحات وعرض البلاغات.
*/

// ==========================================
// تعريف ثوابت التحويل بين العربي والإنجليزي
// ==========================================

// تحويل الأرقام
const numMapAr = { '0':'٠', '1':'١', '2':'٢', '3':'٣', '4':'٤', '5':'٥', '6':'٦', '7':'٧', '8':'٨', '9':'٩' };
const numMapEn = { '٠':'0', '١':'1', '٢':'2', '٣':'3', '٤':'4', '٥':'5', '٦':'6', '٧':'7', '٨':'8', '٩':'9' };

// الحروف المسموح بها في اللوحات السعودية
const validArabicChars = 'أابحد رسمصط عقكلمنهـوى';
const validEnglishChars = 'ABJDRSXTEGKLZNHUV';

// خريطة تحويل الحروف من عربي إلى إنجليزي
const charMapArToEn = { 'أ':'A', 'ب':'B', 'ح':'J', 'د':'D', 'ر':'R', 'س':'S', 'ص':'X', 'ط':'T', 'ع':'E', 'ق':'G', 'ك':'K', 'ل':'L', 'م':'Z', 'ن':'N', 'ه':'H', 'و':'U', 'ى':'V' };

// إنشاء خريطة عكسية (من إنجليزي إلى عربي) تلقائياً
const charMapEnToAr = {};
for (let key in charMapArToEn) charMapEnToAr[charMapArToEn[key]] = key;

// عند اكتمال تحميل الصفحة، قم بتشغيل الدوال الأساسية
document.addEventListener('DOMContentLoaded', () => {
    setupPlateInputs(); // تجهيز حقول الإدخال
    initMap();          // تشغيل الخريطة
    renderReports();    // عرض قائمة البلاغات
});

// ==========================================
// PART 1: Plate Input Logic
// منطق حقول إدخال اللوحة
// ==========================================

function setupPlateInputs() {
    const inputNumAr = document.getElementById('inputNumAr');
    const inputNumEn = document.getElementById('inputNumEn');
    const inputCharAr = document.getElementById('inputCharAr');
    const inputCharEn = document.getElementById('inputCharEn');

    // إجبار اتجاه النص ليكون من اليسار لليمين حتى في الحقول العربية لضبط المحاذاة
    if(inputNumAr) {
        inputNumAr.style.setProperty('direction', 'ltr', 'important');
        inputNumAr.style.setProperty('unicode-bidi', 'bidi-override', 'important');
    }
    if(inputNumEn) {
        inputNumEn.style.setProperty('direction', 'ltr', 'important');
        inputNumEn.style.setProperty('unicode-bidi', 'bidi-override', 'important');
    }

    // مراقب الحدث لحقل الأرقام العربي: عند الكتابة يحول للأرقام الإنجليزية في الحقل السفلي
    if(inputNumAr) {
        inputNumAr.addEventListener('input', (e) => {
            let val = e.target.value.replace(/\s/g, ''); // إزالة المسافات
            let enVal = '', filteredArVal = '';
            for (let char of val) {
                // إذا كتب المستخدم رقماً إنجليزياً أو عربياً نقوم بتحويله وضبطه
                if (numMapEn[char]) { enVal += numMapEn[char]; filteredArVal += char; }
                else if (char >= '0' && char <= '9') { enVal += char; filteredArVal += numMapAr[char]; }
            }
            // تحديث القيم في الحقلين مع إضافة مسافات
            inputNumAr.value = filteredArVal.split('').join(' ').trim();
            inputNumEn.value = enVal.split('').join(' ').trim();
        });
    }

    // مراقب الحدث لحقل الأرقام الإنجليزي
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

    // مراقب الحدث لحقل الحروف العربي
    if(inputCharAr) {
        inputCharAr.addEventListener('input', (e) => {
            let val = e.target.value.replace(/\s/g, '');
            let filteredAr = '', enVal = '';
            for (let char of val) {
                if (char === 'ا') char = 'أ'; // تصحيح حرف الألف
                if (validArabicChars.includes(char)) { 
                    filteredAr += char; 
                    enVal = charMapArToEn[char] + enVal; // عكس الترتيب لأن العربية يمين-يسار
                }
            }
            inputCharAr.value = filteredAr.split('').join(' ').trim();
            inputCharEn.value = enVal.split('').join(' ').trim();
        });
    }

    // مراقب الحدث لحقل الحروف الإنجليزي
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
// PART 2: Map System & Logic
// منطق الخرائط والكاميرات
// ==========================================

let map; 
let routingControl = null;
let selectedWaypoints = []; 

// بيانات وهمية لمواقع الكاميرات في أحياء الرياض
const cameras = [
    { name: "حي الملقا", coords: [24.8105, 46.6112] },
    { name: "حي الصحافة", coords: [24.7963, 46.6385] },
    // ... (بقية الكاميرات)
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

// دالة تهيئة الخريطة
function initMap() {
    const mapElement = document.getElementById('map');
    if (!mapElement) return;

    // إعداد الخريطة ومركزها (الرياض)
    map = L.map('map', {zoomControl: false}).setView([24.7136, 46.6753], 11);
    
    // إضافة طبقة الخريطة (CartoDB Voyager)
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OSM', maxZoom: 19
    }).addTo(map);

    // تحديث عداد الكاميرات في الواجهة
    const camCountEl = document.getElementById('camCount');
    if(camCountEl) camCountEl.innerText = cameras.length;

    // إضافة الدبابيس (Markers) لكل كاميرا
    cameras.forEach(cam => {
        const fixedIcon = L.divIcon({
            className: '',
            html: `<div class="pin-inner"></div>`, // استخدام CSS المخصص للدبوس
            iconSize: [20, 20],
            iconAnchor: [10, 10],
            tooltipAnchor: [0, -12]
        });

        const marker = L.marker(cam.coords, { icon: fixedIcon }).addTo(map);
        marker.bindTooltip(cam.name, { direction: 'top' });
        
        // عند الضغط على الكاميرا يتم تحديدها كنقطة في المسار
        marker.on('click', () => handleCameraClick(cam.coords, cam.name));
    });
}

// دالة معالجة الضغط على الكاميرا
function handleCameraClick(coords, name) {
    const statusBox = document.getElementById('statusBox');
    const resetBtn = document.getElementById('resetBtn');
    const latlng = L.latLng(coords);
    selectedWaypoints.push(latlng);
    
    // منطق تحديث نص الحالة
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
        drawRoute(selectedWaypoints); // رسم الخط بين النقاط
        if(resetBtn) resetBtn.style.display = 'block'; // إظهار زر المسح
    }
}

// دالة رسم المسار باستخدام Leaflet Routing Machine
function drawRoute(waypoints) {
    if (routingControl) map.removeControl(routingControl);
    routingControl = L.Routing.control({
        waypoints: waypoints,
        routeWhileDragging: false,
        addWaypoints: false,
        draggableWaypoints: false,
        fitSelectedRoutes: true,
        show: false,
        lineOptions: { styles: [{color: '#014B32', opacity: 0.8, weight: 6}] }, // لون الخط أخضر
        createMarker: function() { return null; } // عدم إنشاء دبابيس إضافية
    }).addTo(map);
}

// دالة مسح المسار وإعادة تعيين الخريطة
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

// ==========================================
// PART 3: Search Simulation Logic
// منطق محاكاة البحث
// ==========================================

window.performSearch = function() {
    const btn = document.querySelector('button[onclick="performSearch()"]');
    const searchSection = document.getElementById('searchSection');
    const resultsSection = document.getElementById('resultsSection');
    const validationMessage = document.getElementById('validationMessage');
    const inputNumEn = document.getElementById('inputNumEn');
    const inputCharEn = document.getElementById('inputCharEn');
    
    const numVal = inputNumEn ? inputNumEn.value : '';
    const charVal = inputCharEn ? inputCharEn.value : '';

    // التحقق من أن الحقول ليست فارغة
    if (numVal.trim() === '' && charVal.trim() === '') {
        if(validationMessage) {
            validationMessage.textContent = 'الرجاء إدخال رقم اللوحة أو الأحرف';
            validationMessage.classList.remove('hidden');
            setTimeout(() => validationMessage.classList.add('hidden'), 3000);
        }
        return;
    }
    if(validationMessage) validationMessage.classList.add('hidden');

    // عرض رقم اللوحة في صفحة النتائج
    const displayEl = document.getElementById('resultPlateDisplay');
    if(displayEl) displayEl.innerText = (numVal + " " + charVal).trim();

    // تغيير أيقونة الزر لتدل على التحميل
    const originalContent = btn.innerHTML;
    btn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin text-2xl"></i>';
    btn.disabled = true;
    
    // محاكاة تأخير الشبكة (Loading)
    setTimeout(() => {
        searchSection.classList.add('hidden-section');
        resultsSection.classList.remove('hidden-section');
        requestAnimationFrame(() => {
            resultsSection.classList.remove('opacity-0');
            resultsSection.classList.add('fade-in-up');
        });
        btn.innerHTML = originalContent;
        btn.disabled = false;
        
        // تحديث حجم الخريطة ورسم مسار وهمي للتجربة
        if(map) {
            map.invalidateSize();
            setTimeout(() => {
                map.invalidateSize();
                // إحداثيات وهمية للمسار (حي الصحافة -> حي الملقا -> حي الربيع)
                const hafaCoords = [24.7963, 46.6385]; 
                const malqaCoords = [24.8105, 46.6112]; 
                const rabieCoords = [24.7912, 46.6734]; 

                const simulatedRoute = [L.latLng(hafaCoords), L.latLng(malqaCoords), L.latLng(rabieCoords)];
                selectedWaypoints = simulatedRoute;
                
                const statusBox = document.getElementById('statusBox');
                const resetBtn = document.getElementById('resetBtn');
                if(statusBox) {
                    statusBox.innerHTML = `تم رصد مسار المركبة<br>عدد النقاط: 3`;
                    statusBox.style.color = "#014B32";
                }
                if(resetBtn) resetBtn.style.display = 'block';
                drawRoute(simulatedRoute);
            }, 300);
        }
    }, 800);
};

// دالة العودة للبحث الجديد
window.resetSearch = function() {
    const searchSection = document.getElementById('searchSection');
    const resultsSection = document.getElementById('resultsSection');
    
    // إخفاء النتائج وإظهار البحث
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

// دوال التحكم في نافذة عرض الصورة
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

// ==========================================
// PART 4: Navigation & Reports Logic
// منطق التنقل والبلاغات
// ==========================================

// دالة التبديل بين التبويبات (تتبع / بلاغات)
window.switchTab = function(tabName) {
    // 1. تحديث شكل الأزرار في القائمة
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

    // 2. إظهار وإخفاء الأقسام (Views)
    const viewTracking = document.getElementById('view-tracking');
    const viewReports = document.getElementById('view-reports');

    if(tabName === 'tracking') {
        viewReports.classList.add('hidden');
        viewTracking.classList.remove('hidden');
        requestAnimationFrame(() => {
            if(map) map.invalidateSize(); // إصلاح مشكلة عدم ظهور الخريطة عند العودة
        });
    } else if (tabName === 'reports') {
        viewTracking.classList.add('hidden');
        viewReports.classList.remove('hidden');
    }
};

// بيانات وهمية للبلاغات
const stolenCarsData = [
    { id: 9822, plateNum: "9090", plateChar: "R B X", type: "سرقة", date: "منذ ساعتين", location: "الرياض - حي العقيق", status: "نشط", statusColor: "red" },
    { id: 4511, plateNum: "1234", plateChar: "A B D", type: "اشتباه", date: "منذ 5 ساعات", location: "الرياض - حي الملز", status: "تحت المعالجة", statusColor: "orange" },
    { id: 3321, plateNum: "5561", plateChar: "K S A", type: "سرقة", date: "أمس", location: "جدة - الحمراء", status: "نشط", statusColor: "red" },
    { id: 7782, plateNum: "6600", plateChar: "L E D", type: "لوحة مفقودة", date: "قبل يومين", location: "الدمام - الشاطئ", status: "مغلق", statusColor: "gray" },
    { id: 1122, plateNum: "8888", plateChar: "H H H", type: "سرقة", date: "قبل 3 أيام", location: "الرياض - الصحافة", status: "نشط", statusColor: "red" },
    { id: 5543, plateNum: "2020", plateChar: "M S S", type: "اشتباه", date: "قبل أسبوع", location: "مكة - العزيزية", status: "مغلق", statusColor: "gray" },
];

// دالة إنشاء بطاقات البلاغات وتعبئتها في الصفحة
window.renderReports = function() {
    const grid = document.getElementById('reports-grid');
    if(!grid) return;

    // استخدام map لتحويل البيانات إلى كود HTML
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