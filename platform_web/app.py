from flask import Flask, render_template, jsonify
from tinydb import TinyDB, Query
import os

app = Flask(__name__)
DB_FILE = 'database.json'
app.config['JSON_AS_ASCII'] = False 

# --- CAMERA COORDINATES ---
COORDS = {
    "Malqa": [24.8105, 46.6112], "Sahafa": [24.7963, 46.6385], "Nakhil": [24.7681, 46.6318],
    "Yasmin": [24.8192, 46.6568], "Narjis": [24.8345, 46.6872], "Hittin": [24.7648, 46.6045],
    "Aqiq": [24.7785, 46.6231], "Rabie": [24.7912, 46.6734], "Olaya": [24.6953, 46.6805],
    "Suleimaniyah": [24.7011, 46.6978], "Malaz": [24.6632, 46.7382], "Rawdah": [24.7251, 46.7654],
    "Quds": [24.7432, 46.7541], "Hamra": [24.7689, 46.7582], "Qurtubah": [24.8021, 46.7456],
    "Suwaidi": [24.5985, 46.6578], "Aziziyah": [24.5823, 46.7651]
}

db = TinyDB(DB_FILE)
Vehicle = Query()

def init_db():
    db.truncate()
    
    # We now store a list of objects called 'history'
    # The first item in the list is the MOST RECENT (Current Location)
    vehicles_data = [
        # 1. 9090 RBX (Stolen - Riyadh)
        {
            "plate_clean": "9090RBX", "plate_display": "9090 RBX", "owner": "Khalid Al-Otaibi", "status": "stolen",
            "history": [
                {"name": "حي العقيق", "coords": COORDS["Aqiq"], "time": "11:30 ص", "date": "اليوم"},
                {"name": "حي الصحافة", "coords": COORDS["Sahafa"], "time": "11:15 ص", "date": "اليوم"},
                {"name": "حي الملقا", "coords": COORDS["Malqa"], "time": "10:50 ص", "date": "اليوم"}
            ]
        },
        # 2. 1234 ABD (Suspect - Riyadh)
        {
            "plate_clean": "1234ABD", "plate_display": "1234 ABD", "owner": "Mohammed Ahmed", "status": "suspect",
            "history": [
                {"name": "حي الملز", "coords": COORDS["Malaz"], "time": "02:00 م", "date": "اليوم"},
                {"name": "حي السليمانية", "coords": COORDS["Suleimaniyah"], "time": "01:30 م", "date": "اليوم"},
                {"name": "حي العليا", "coords": COORDS["Olaya"], "time": "01:00 م", "date": "اليوم"}
            ]
        },
        # 3. 5561 KSA (Stolen - Jeddah/Hamra) - Mapped to Riyadh Hamra for demo
        {
            "plate_clean": "5561KSA", "plate_display": "5561 KSA", "owner": "Sami Al-Jaber", "status": "stolen",
            "history": [
                {"name": "حي الحمراء", "coords": COORDS["Hamra"], "time": "04:30 م", "date": "أمس"},
                {"name": "حي القدس", "coords": COORDS["Quds"], "time": "04:00 م", "date": "أمس"},
                {"name": "حي الروضة", "coords": COORDS["Rawdah"], "time": "03:45 م", "date": "أمس"}
            ]
        },
        # 4. 6600 LED (Closed - Dammam) - Mapped to Qurtubah for demo
        {
            "plate_clean": "6600LED", "plate_display": "6600 LED", "owner": "Fahad Al-Dossari", "status": "closed",
            "history": [
                {"name": "حي الشاطئ", "coords": COORDS["Qurtubah"], "time": "09:00 ص", "date": "قبل يومين"},
                {"name": "حي قرطبة", "coords": COORDS["Qurtubah"], "time": "08:45 ص", "date": "قبل يومين"}
            ]
        },
        # 5. 8888 HHH (Stolen - Riyadh)
        {
            "plate_clean": "8888HHH", "plate_display": "8888 HHH", "owner": "VIP Transport", "status": "stolen",
            "history": [
                {"name": "حي الصحافة", "coords": COORDS["Sahafa"], "time": "07:15 م", "date": "قبل 3 أيام"},
                {"name": "حي النخيل", "coords": COORDS["Nakhil"], "time": "07:00 م", "date": "قبل 3 أيام"},
                {"name": "حي حطين", "coords": COORDS["Hittin"], "time": "06:30 م", "date": "قبل 3 أيام"}
            ]
        },
        # 6. 2020 NSS (Suspect - Makkah/Aziziyah) - Mapped to Riyadh Aziziyah for demo
        {
            "plate_clean": "2020NSS", "plate_display": "2020 NSS", "owner": "Rental Company", "status": "closed",
            "history": [
                {"name": "حي العزيزية", "coords": COORDS["Aziziyah"], "time": "10:30 ص", "date": "قبل أسبوع"},
                {"name": "حي السويدي", "coords": COORDS["Suwaidi"], "time": "10:00 ص", "date": "قبل أسبوع"}
            ]
        },
        # 7. 506 BUD (Badr Alshaya)
        {
            "plate_clean": "506BUD", "plate_display": "506 BUD", "owner": "Badr Alshaya", "status": "active",
            "history": [
                {"name": "حي الربيع", "coords": COORDS["Rabie"], "time": "09:45 م", "date": "اليوم"},
                {"name": "حي الصحافة", "coords": COORDS["Sahafa"], "time": "09:30 م", "date": "اليوم"},
                {"name": "حي الملقا", "coords": COORDS["Malqa"], "time": "09:00 م", "date": "اليوم"}
            ]
        },

        # 8. 5873 NER (Haitham alsheri)
        {
            "plate_clean": "5873NER", "plate_display": "5873 NER", "owner": "Hatiam alsheri", "status": "active",
            "history": [
                {"name": "حي العزيزية", "coords": COORDS["Aziziyah"], "time": "09:45 م", "date": "اليوم"},
                {"name": "حي الصحافة", "coords": COORDS["Sahafa"], "time": "09:30 م", "date": "اليوم"},
                {"name": "حي السليمانية", "coords": COORDS["Suleimaniyah"], "time": "09:00 م", "date": "اليوم"}
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