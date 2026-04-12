"""
MediMatch — Seed Vectors to Endee
Run AFTER the MySQL database is populated.
This script generates TF-IDF style embeddings and upserts them into Endee.
"""

import mysql.connector
import requests
import json
import math
import hashlib

# ── Config ──────────────────────────────────────────────────
MYSQL_CONFIG = {
    "host": "localhost",
    "user": "root",
    "password": "your_password",
    "database": "medimatch"
}
ENDEE_BASE_URL = "http://localhost:8080/api/v1"
ENDEE_AUTH_TOKEN = ""  # Leave empty if no auth

VECTOR_DIM = 384

# ── Endee HTTP helpers ───────────────────────────────────────
def endee_headers():
    h = {"Content-Type": "application/json"}
    if ENDEE_AUTH_TOKEN:
        h["Authorization"] = ENDEE_AUTH_TOKEN
    return h

def create_index(name, dim=VECTOR_DIM):
    payload = {
        "name": name,
        "dimension": dim,
        "space_type": "cosine",
        "precision": "INT8"
    }
    r = requests.post(f"{ENDEE_BASE_URL}/index/create", json=payload, headers=endee_headers())
    print(f"Create index '{name}': {r.status_code} {r.text[:80]}")

def upsert_vectors(index_name, vectors):
    """vectors: list of {id, vector, meta, filter}"""
    payload = {"vectors": vectors}
    r = requests.post(f"{ENDEE_BASE_URL}/index/{index_name}/upsert", json=payload, headers=endee_headers())
    print(f"Upsert {len(vectors)} vectors to '{index_name}': {r.status_code}")
    if r.status_code not in (200, 201):
        print("  Error:", r.text[:200])

# ── Simple text embedding (384-dim TF-IDF inspired) ──────────
VOCAB_SIZE = VECTOR_DIM
MEDICAL_TERMS = [
    "headache","migraine","fever","cough","cold","pain","ache","sore","throat",
    "chest","heart","breathing","asthma","diabetes","thyroid","stomach","nausea",
    "vomiting","diarrhea","constipation","allergy","rash","itching","skin","eye",
    "vision","ear","hearing","joint","knee","back","muscle","bone","fracture",
    "anxiety","depression","stress","insomnia","sleep","fatigue","weakness",
    "swelling","inflammation","infection","bacteria","virus","fungal","antibiotic",
    "blood","urine","kidney","liver","lung","brain","nerve","hormone","insulin",
    "pressure","hypertension","cholesterol","cardiac","artery","cancer","tumor",
    "wound","injury","sports","weight","obesity","diet","nutrition","vitamin",
    "pregnancy","menstrual","periods","fertility","pcos","gynecology","pediatric",
    "dental","oral","sinusitis","nasal","congestion","snoring","vertigo","dizzy",
    "memory","seizure","epilepsy","numbness","tingling","tremor","paralysis",
    "acid","reflux","ulcer","gastritis","bloating","gas","jaundice","hepatitis",
    "psoriasis","eczema","acne","hair","loss","dermatology","ophthalmology","glaucoma",
    "cataract","retina","dry","moist","discharge","bleeding","bruising","clot",
    "sugar","glucose","uric","acid","arthritis","gout","rheumatoid","lupus",
    "autoimmune","thyroid","hyperthyroid","hypothyroid","parathyroid","adrenal",
    "neurologist","cardiologist","pulmonologist","gastroenterologist","dermatologist",
    "orthopedist","endocrinologist","psychiatrist","ophthalmologist","urologist",
    "nephrologist","rheumatologist","oncologist","pediatrician","gynecologist",
    "general","physician","specialist","surgery","treatment","medication","dose",
    "prescription","otc","chronic","acute","mild","moderate","severe","symptom",
    "diagnosis","prognosis","therapy","relief","prevention","care","health","medical"
]

def text_to_vector(text: str) -> list:
    """Convert text to a deterministic 384-dim float vector."""
    text = text.lower()
    words = text.replace(",", " ").replace(".", " ").split()
    vec = [0.0] * VECTOR_DIM

    # Seed with medical term frequencies
    for i, term in enumerate(MEDICAL_TERMS):
        if i >= VECTOR_DIM:
            break
        count = words.count(term)
        if count > 0:
            vec[i] = math.log(1 + count) / math.log(10)

    # Add hash-based components for remaining dims
    for j in range(len(MEDICAL_TERMS), VECTOR_DIM):
        h = int(hashlib.md5(f"{text}_{j}".encode()).hexdigest(), 16)
        vec[j] = ((h % 1000) - 500) / 1000.0

    # Normalize to unit length (cosine similarity)
    norm = math.sqrt(sum(x*x for x in vec)) or 1.0
    return [round(x / norm, 6) for x in vec]

# ── Main seeding ──────────────────────────────────────────────
def main():
    conn = mysql.connector.connect(**MYSQL_CONFIG)
    cursor = conn.cursor(dictionary=True)

    # 1. Create Endee indexes
    print("\n=== Creating Endee Indexes ===")
    create_index("doctors_index")
    create_index("medicines_index")

    # 2. Seed doctors
    print("\n=== Seeding Doctors ===")
    cursor.execute("SELECT * FROM doctors")
    doctors = cursor.fetchall()
    doctor_vectors = []
    for doc in doctors:
        text = f"{doc['specialization']} {doc['bio']} {doc['symptoms_treated']}"
        vec = text_to_vector(text)
        doctor_vectors.append({
            "id": f"doc_{doc['id']}",
            "vector": vec,
            "meta": {
                "name": doc["name"],
                "specialization": doc["specialization"],
                "hospital": doc["hospital"],
                "city": doc["city"],
                "rating": float(doc["rating"] or 0)
            },
            "filter": {
                "specialization": doc["specialization"],
                "city": doc["city"],
                "available": 1 if doc["available"] else 0
            }
        })
        # Batch upsert every 100
        if len(doctor_vectors) == 100:
            upsert_vectors("doctors_index", doctor_vectors)
            doctor_vectors = []
    if doctor_vectors:
        upsert_vectors("doctors_index", doctor_vectors)
    print(f"  → Seeded {len(doctors)} doctors")

    # 3. Seed medicines
    print("\n=== Seeding Medicines ===")
    cursor.execute("SELECT * FROM medicines")
    medicines = cursor.fetchall()
    med_vectors = []
    for med in medicines:
        text = f"{med['name']} {med['generic_name']} {med['category']} {med['description']} {med['uses']}"
        vec = text_to_vector(text)
        med_vectors.append({
            "id": f"med_{med['id']}",
            "vector": vec,
            "meta": {
                "name": med["name"],
                "generic_name": med["generic_name"],
                "category": med["category"],
                "manufacturer": med["manufacturer"],
                "dosage": med["dosage"],
                "price_inr": float(med["price_inr"] or 0)
            },
            "filter": {
                "category": med["category"],
                "requires_prescription": 1 if med["requires_prescription"] else 0
            }
        })
        if len(med_vectors) == 100:
            upsert_vectors("medicines_index", med_vectors)
            med_vectors = []
    if med_vectors:
        upsert_vectors("medicines_index", med_vectors)
    print(f"  → Seeded {len(medicines)} medicines")
    
    cursor.close()
    conn.close()
    print("\n✅ Done! Endee indexes are ready.")

if __name__ == "__main__":
    main()