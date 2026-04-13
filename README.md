# 🏥 MediMatch AI

## 📌 Overview
AI-powered platform to find the right doctor and medicine by describing your symptoms in plain English.
MediMatch AI is an AI-powered healthcare platform that helps users find relevant doctors and medicines using semantic search and Retrieval-Augmented Generation (RAG).
Instead of searching by keywords, you just describe how you feel — the AI understands the meaning and finds the best matches.

---

## 🚀 Features

 🔍 *Symptom Search* — describe symptoms in plain English, get matched doctors and medicines
 🤖 *Ask AI (RAG)* — get a full AI-generated answer powered by a Retrieve-Augment-Generate pipeline
 🩺 *Doctors Directory* — browse and filter all doctors by specialization and city
 💊 *Medicines Directory* — browse medicines, filter by OTC or prescription
 📅 *Book Appointment* — book a slot directly with any doctor
 🕓 *Search History* — revisit your past searches

---

How It Works

1. You type your symptoms
2. The system converts your text into a vector (numbers that capture meaning)
3. Endee vector database finds the most similar doctors and medicines
4. Results are ranked by similarity score and shown instantly
   
---

## 🏗️ System Architecture

* **Frontend:** HTML, CSS, JavaScript
* **Backend:** Java Spring Boot REST API
* **Database:** MySQL schema and seed data
* **AI:** Embedding + RAG pipeline
* **SCRIPTS:** Python script to load vectors into Endee

---

## 🧠 Use of Endee

This project uses Endee as a vector database to:

* Store embeddings of doctors and medicines
* Perform similarity search
* Enable semantic retrieval for RAG

---

## ⚙️ Setup Instructions

### 1. Clone the repository

```
git clone https://github.com/Nive2501-engg/endee.git
cd endee
```

### 2. Run backend

```
cd backend
mvn spring-boot:run
```

### 3. Open frontend

Open `frontend/index.html` in browser

---

## 📊 Project Use Case

This system helps users:

* Find relevant doctors based on symptoms
* Get medicine suggestions
* Receive AI-powered healthcare insights

---

## 🎯 Conclusion

MediMatch AI demonstrates a real-world application of semantic search and RAG using Endee as a vector database.

---
