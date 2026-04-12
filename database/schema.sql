CREATE DATABASE IF NOT EXISTS medimatch;
USE medimatch;

CREATE TABLE IF NOT EXISTS doctors (
    id                BIGINT AUTO_INCREMENT PRIMARY KEY,
    name              VARCHAR(100) NOT NULL,
    specialization    VARCHAR(100) NOT NULL,
    hospital          VARCHAR(150),
    city              VARCHAR(80),
    phone             VARCHAR(20),
    email             VARCHAR(100),
    experience_years  INT DEFAULT 0,
    rating            DECIMAL(3,1) DEFAULT 0.0,
    bio               TEXT,
    symptoms_treated  TEXT,
    image_url         VARCHAR(255),
    available         BOOLEAN DEFAULT TRUE,
    created_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS medicines (
    id                     BIGINT AUTO_INCREMENT PRIMARY KEY,
    name                   VARCHAR(150) NOT NULL,
    generic_name           VARCHAR(150),
    category               VARCHAR(100),
    manufacturer           VARCHAR(150),
    description            TEXT,
    uses                   TEXT,
    side_effects           TEXT,
    dosage                 VARCHAR(200),
    requires_prescription  BOOLEAN DEFAULT FALSE,
    price_inr              DECIMAL(10,2),
    created_at             TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert doctors (sample)
INSERT INTO doctors (name, specialization, hospital, city, phone, experience_years, rating, bio, symptoms_treated) VALUES
('Dr. Priya Sharma',     'Neurologist',      'Apollo Hospital',      'Chennai',    '9841000001', 15, 4.8, 'Specialist in headaches, migraines, epilepsy and neurological disorders.', 'headache,migraine,nausea,light sensitivity,dizziness,seizure,memory loss,numbness'),
('Dr. Ramesh Iyer',      'Cardiologist',     'Fortis Malar',         'Chennai',    '9841000002', 20, 4.9, 'Expert in heart diseases, chest pain, arrhythmia and cardiac surgery.', 'chest pain,shortness of breath,palpitations,fatigue,swelling,hypertension'),
('Dr. Meena Krishnan',   'Pulmonologist',    'MIOT International',   'Chennai',    '9841000003', 12, 4.7, 'Specializes in asthma, COPD, and respiratory infections.', 'cough,breathing difficulty,wheezing,chest tightness,asthma,breathlessness'),
('Dr. Suresh Babu',      'Gastroenterologist','Kauvery Hospital',    'Trichy',     '9841000004', 18, 4.6, 'Expert in digestive disorders, liver diseases, and GI problems.', 'stomach pain,bloating,diarrhea,constipation,vomiting,acidity,nausea,jaundice'),
('Dr. Kavitha Nair',     'Dermatologist',    'Skin Care Clinic',     'Coimbatore', '9841000005', 10, 4.5, 'Treats skin allergies, acne, psoriasis, and hair loss conditions.', 'rash,itching,acne,skin allergy,hair loss,eczema,psoriasis,dry skin,redness'),
('Dr. Anand Patel',      'Orthopedist',      'Sri Ramachandra Hospital','Chennai', '9841000006', 16, 4.7, 'Specializes in bone fractures, joint pain, arthritis, sports injuries.', 'joint pain,knee pain,back pain,fracture,arthritis,swelling,muscle pain'),
('Dr. Lakshmi Devi',     'Endocrinologist',  'Global Hospital',      'Chennai',    '9841000007', 14, 4.6, 'Expert in diabetes, thyroid disorders, and hormonal imbalances.', 'diabetes,thyroid,weight gain,fatigue,excessive thirst,frequent urination'),
('Dr. Vijay Kumar',      'Ophthalmologist',  'Sankara Nethralaya',   'Chennai',    '9841000008', 22, 4.9, 'Eye specialist for cataract, glaucoma, and vision correction.', 'eye pain,blurry vision,redness,cataract,glaucoma,dry eyes,eye infection'),
('Dr. Nalini Raj',       'Psychiatrist',     'NIMHANS',              'Bangalore',  '9841000009', 11, 4.8, 'Mental health specialist for depression, anxiety and stress.', 'anxiety,depression,stress,insomnia,panic attacks,mood swings,sleep disorder'),
('Dr. Karthik Sundaram', 'ENT Specialist',   'Asha Hospital',        'Chennai',    '9841000010',  9, 4.5, 'Treats ear, nose and throat conditions including sinusitis.', 'ear pain,hearing loss,sore throat,sinusitis,nasal congestion,tonsillitis,snoring'),
('Dr. Mohan Raj',        'General Physician','Primary Care Clinic',  'Chennai',    '9841000014',  8, 4.4, 'General practitioner for common illnesses, fever, and preventive care.', 'fever,cold,cough,body ache,weakness,headache,flu,fatigue,general illness');

INSERT INTO medicines (name, generic_name, category, manufacturer, description, uses, side_effects, dosage, requires_prescription, price_inr) VALUES
('Crocin',       'Paracetamol',    'Analgesic',         'GSK',       'Common painkiller and fever reducer.', 'fever,headache,body ache,mild pain,cold,flu', 'nausea,liver damage with overdose', '500mg every 4-6 hours', FALSE, 15.00),
('Sumatriptan',  'Sumatriptan',    'Migraine Relief',   'Sun Pharma','Triptan drug for acute migraine attacks.', 'migraine,severe headache,nausea with headache,light sensitivity', 'dizziness,chest tightness', '50mg at onset', TRUE, 180.00),
('Salbutamol',   'Salbutamol',     'Bronchodilator',    'Cipla',     'Short-acting beta agonist for asthma.', 'asthma,bronchospasm,COPD,shortness of breath,wheezing,breathlessness', 'tremors,tachycardia', '2 puffs every 4-6 hours', TRUE, 120.00),
('Omeprazole',   'Omeprazole',     'PPI',               'AstraZeneca','Reduces stomach acid for GERD.', 'acidity,GERD,ulcer,heartburn,acid reflux,bloating,stomach pain', 'headache,diarrhea', '20-40mg before meals', FALSE, 55.00),
('Cetrizine',    'Cetirizine',     'Antihistamine',     'UCB',       'Antihistamine for allergies and rash.', 'allergy,rash,itching,hay fever,sneezing,hives,skin allergy', 'drowsiness,dry mouth', '10mg once daily', FALSE, 25.00),
('Ibuprofen',    'Ibuprofen',      'NSAID',             'Abbott',    'Anti-inflammatory for pain and fever.', 'joint pain,arthritis,back pain,menstrual pain,fever,inflammation,muscle pain', 'gastric irritation', '400mg 3x daily after food', FALSE, 30.00),
('Amoxicillin',  'Amoxicillin',    'Antibiotic',        'GSK',       'Broad-spectrum penicillin antibiotic.', 'bacterial infection,throat infection,ear infection,UTI,sinusitis,pneumonia', 'diarrhea,rash', '500mg 3x daily 7 days', TRUE, 65.00),
('Metformin',    'Metformin HCl',  'Antidiabetic',      'Merck',     'First-line drug for type 2 diabetes.', 'type 2 diabetes,high blood sugar,insulin resistance,excessive thirst,frequent urination', 'nausea,diarrhea', '500-2000mg daily', TRUE, 45.00),
('Levothyroxine','Levothyroxine',  'Thyroid Hormone',   'Abbott',    'Synthetic thyroid hormone for hypothyroidism.', 'hypothyroidism,thyroid deficiency,fatigue,weight gain,cold intolerance', 'palpitations if overdosed', '25-200mcg daily empty stomach', TRUE, 85.00),
('Escitalopram', 'Escitalopram',   'SSRI',              'Lundbeck',  'SSRI antidepressant for depression and anxiety.', 'depression,anxiety,panic disorder,stress,insomnia,mood swings', 'nausea,sexual dysfunction', '10-20mg once daily', TRUE, 150.00),
('Ondansetron',  'Ondansetron',    'Antiemetic',        'GSK',       'Prevents nausea and vomiting.', 'nausea,vomiting,dizziness,motion sickness', 'headache,constipation', '4-8mg 3x daily', TRUE, 75.00),
('Amlodipine',   'Amlodipine',     'Calcium Channel Blocker','Pfizer','Lowers blood pressure and treats angina.', 'hypertension,chest pain,angina,high blood pressure,palpitations', 'ankle swelling,flushing', '5-10mg once daily', TRUE, 40.00),
('Diclofenac',   'Diclofenac',     'NSAID',             'Novartis',  'Potent anti-inflammatory for musculoskeletal pain.', 'joint pain,back pain,muscle pain,arthritis,knee pain,sports injury', 'stomach upset', '50mg twice daily after food', FALSE, 35.00),
('Norfloxacin',  'Norfloxacin',    'Antibiotic',        'Cipla',     'Fluoroquinolone for urinary tract infections.', 'UTI,urinary infection,burning urination,kidney infection,frequent urination', 'nausea,dizziness', '400mg twice daily', TRUE, 80.00),
('Montelukast',  'Montelukast',    'Leukotriene Antagonist','MSD',   'Prevents asthma attacks and treats allergic rhinitis.', 'asthma prevention,allergic rhinitis,nasal congestion,sneezing,wheezing,cough', 'mood changes', '10mg once daily', TRUE, 110.00);