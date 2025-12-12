from flask import Flask, render_template, jsonify
from tinydb import TinyDB, Query
import os

app = Flask(__name__)
DB_FILE = 'database.json'
app.config['JSON_AS_ASCII'] = False 

db = TinyDB(DB_FILE)
Vehicle = Query()

def init_db():
    db.truncate()
    
    # We now store a list of objects called 'history'
    # The first item in the list is the MOST RECENT (Current Location)
    # تحديث بيانات المركبات بمسارات أكثر دقة ونقاط رصد مكثفة
    # تحديث بيانات المركبات بمسارات نظيفة وخطية (بدون عشوائية)
    vehicles_data = [
        # 1. 9090 RBX: مسار مستقيم على طريق الملك فهد (من الشمال باتجاه الجنوب)
        # المسار: الملقا -> الصحافة -> العقيق
        {
            "plate_clean": "9090RBX", "plate_display": "9090 RBX", "owner": "Khalid Al-Otaibi", "status": "stolen",
            "history": [
                {"name": "حي العقيق - الملك فهد", "coords": [24.7785, 46.6231], "time": "11:30 ص", "date": "اليوم"},
                {"name": "كاميرا مخرج 4 - الشمالي", "coords": [24.8000, 46.6500], "time": "11:20 ص", "date": "اليوم"},
                {"name": "حي الصحافة - الملك فهد", "coords": [24.7963, 46.6385], "time": "11:10 ص", "date": "اليوم"},
                {"name": "حي الملقا - التخصصي", "coords": [24.8105, 46.6112], "time": "10:55 ص", "date": "اليوم"}
            ]
        },

        # 2. 1234 ABD: مسار عرضي في وسط الرياض (من الشرق للغرب)
        # المسار: الملز -> الوزارات -> العليا
        {
            "plate_clean": "1234ABD", "plate_display": "1234 ABD", "owner": "Mohammed Ahmed", "status": "suspect",
            "history": [
                {"name": "حي العليا - موسى بن نصير", "coords": [24.6953, 46.6805], "time": "02:00 م", "date": "اليوم"},
                {"name": "طريق الملك فهد - الفيصلية", "coords": [24.6900, 46.6850], "time": "01:50 م", "date": "اليوم"},
                {"name": "حي الوزارات", "coords": [24.6558, 46.7165], "time": "01:30 م", "date": "اليوم"},
                {"name": "حي الملز - الجامعة", "coords": [24.6632, 46.7382], "time": "01:10 م", "date": "اليوم"}
            ]
        },

        # 3. 2030 KSA: مسار طويل جداً (من أقصى الجنوب إلى الشمال)
        # المسار: العزيزية -> المربع -> الصحافة
        {
            "plate_clean": "2030KSA", "plate_display": "2030 KSA", "owner": "Ahmed Al-Jaber", "status": "stolen",
            "history": [
                {"name": "حي الصحافة - الملك فهد", "coords": [24.7963, 46.6385], "time": "09:45 م", "date": "اليوم"},
                {"name": "طريق الملك فهد 1", "coords": [24.7300, 46.6600], "time": "09:15 م", "date": "اليوم"},
                {"name": "حي المربع - الملك فيصل", "coords": [24.6465, 46.7093], "time": "08:45 م", "date": "اليوم"},
                {"name": "حي العزيزية - الدائري الجنوبي", "coords": [24.5823, 46.7651], "time": "08:00 م", "date": "اليوم"}
            ]
        },

        # 4. 6600 LED: مسار محدد في شمال شرق الرياض
        # المسار: قرطبة -> المونسية
        {
            "plate_clean": "6600LED", "plate_display": "6600 LED", "owner": "Fahad Al-Dossari", "status": "closed",
            "history": [
                {"name": "حي قرطبة - المطار", "coords": [24.8021, 46.7456], "time": "01:00 م", "date": "اليوم"},
                {"name": "حي المونسية", "coords": [24.8300, 46.7700], "time": "12:45 م", "date": "اليوم"},
                {"name": "طريق الدمام - الفحص", "coords": [24.8200, 46.8000], "time": "12:30 م", "date": "اليوم"}
            ]
        },

        # 5. 8888 HHH: مسار غربي (من حطين للنخيل)
        # المسار: حطين -> النخيل -> جامعة الملك سعود
        {
            "plate_clean": "8888HHH", "plate_display": "8888 HHH", "owner": "VIP Transport", "status": "stolen",
            "history": [
                {"name": "جامعة الملك سعود", "coords": [24.7150, 46.6200], "time": "07:15 م", "date": "قبل 3 أيام"},
                {"name": "حي النخيل - التخصصي", "coords": [24.7681, 46.6318], "time": "07:00 م", "date": "قبل 3 أيام"},
                {"name": "حي حطين - الثغر", "coords": [24.7648, 46.6045], "time": "06:45 م", "date": "قبل 3 أيام"}
            ]
        },

        # 6. 2020 NSS: مسار جنوب غرب (من الشفا للسويدي)
        # المسار: الشفا -> الدائري الغربي -> السويدي
        {
            "plate_clean": "2020NSS", "plate_display": "2020 NSS", "owner": "Rental Company", "status": "closed",
            "history": [
                {"name": "حي السويدي العام", "coords": [24.5985, 46.6578], "time": "10:30 ص", "date": "قبل أسبوع"},
                {"name": "كاميرا مخرج 25 - الدائري الغربي", "coords": [24.5800, 46.6300], "time": "10:15 ص", "date": "قبل أسبوع"},
                {"name": "حي الشفا - المعارض", "coords": [24.5385, 46.7082], "time": "10:00 ص", "date": "قبل أسبوع"}
            ]
        },

        # 7. 506 BUD: مسار أفقي شمالي (من الشرق للغرب)
        # المسار: النرجس -> الياسمين -> الملقا
        {
            "plate_clean": "506BUD", "plate_display": "506 BUD", "owner": "Badr Alshaya", "status": "active",
            "history": [
                {"name": "حي الملقا - التخصصي", "coords": [24.8105, 46.6112], "time": "09:45 م", "date": "اليوم"},
                {"name": "حي الياسمين - أنس بن مالك", "coords": [24.8192, 46.6568], "time": "09:30 م", "date": "اليوم"},
                {"name": "حي النرجس - عثمان بن عفان", "coords": [24.8345, 46.6872], "time": "09:15 م", "date": "اليوم"}
            ]
        },

        # 8. 5873 NER: مسار طريق التخصصي (من الشمال للجنوب)
        # المسار: التخصصي (شمال) -> التخصصي (جنوب)
        {
            "plate_clean": "5873NER", "plate_display": "5873 NER", "owner": "Hatiam alsheri", "status": "active",
            "history": [
                {"name": "شارع التخصصي 1", "coords": [24.7200, 46.6500], "time": "09:45 م", "date": "اليوم"},
                {"name": "شارع التخصصي 2", "coords": [24.7400, 46.6400], "time": "09:30 م", "date": "اليوم"},
                {"name": "حي النخيل - التخصصي", "coords": [24.7681, 46.6318], "time": "09:15 م", "date": "اليوم"}
            ]
        }
    ]
    db.insert_multiple(vehicles_data)
    print("Database initialized with detailed history.")

init_db()

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/api/check_plate/<plate_number>')
def check_plate(plate_number):
    clean_plate = plate_number.replace(" ", "").upper()
    results = db.search(Vehicle.plate_clean == clean_plate)
    
    if results:
        vehicle = results[0]
        # Extract just coordinates for the map line
        path_coords = [item['coords'] for item in vehicle['history']]
        
        return jsonify({
            "found": True,
            "data": {
                "plate": vehicle['plate_display'],
                "owner": vehicle['owner'],
                "status": vehicle['status'],
                "path": path_coords,      # Simple list for Map
                "history": vehicle['history'] # Detailed list for Sidebar
            }
        })
    else:
        return jsonify({"found": False})

if __name__ == '__main__':
    app.run(debug=True, port=5000)