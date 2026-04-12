package com.medimatch.service;

import org.springframework.stereotype.Service;
import java.security.MessageDigest;
import java.util.Arrays;

/**
 * Generates 384-dimensional text embeddings using a TF-IDF inspired approach
 * with medical vocabulary. In production, swap embed() with an actual
 * sentence-transformer API (e.g. OpenAI text-embedding-3-small).
 */
@Service
public class EmbeddingService {

    private static final int VECTOR_DIM = 384;

    // Medical vocabulary — each term maps to a specific dimension
    private static final String[] MEDICAL_TERMS = {
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
        "cataract","retina","discharge","bleeding","bruising","clot","sugar","glucose",
        "arthritis","gout","rheumatoid","lupus","autoimmune","adrenal","neurologist",
        "cardiologist","pulmonologist","gastroenterologist","dermatologist","orthopedist",
        "endocrinologist","psychiatrist","ophthalmologist","urologist","nephrologist",
        "rheumatologist","oncologist","pediatrician","gynecologist","physician","specialist",
        "surgery","treatment","medication","dose","prescription","otc","chronic","acute",
        "mild","moderate","severe","symptom","diagnosis","therapy","relief","prevention",
        "care","health","medical","shortness","breath","palpitation","burning","frequent"
    };

    /**
     * Convert input text to a 384-dimensional float vector.
     */
    public float[] embed(String text) {
        if (text == null || text.isBlank()) {
            return new float[VECTOR_DIM];
        }

        String lower = text.toLowerCase();
        String[] words = lower.replaceAll("[^a-z0-9 ]", " ").split("\\s+");
        float[] vec = new float[VECTOR_DIM];

        // Term-frequency component for known medical terms
        for (int i = 0; i < Math.min(MEDICAL_TERMS.length, VECTOR_DIM); i++) {
            String term = MEDICAL_TERMS[i];
            int count = 0;
            for (String w : words) {
                if (w.contains(term) || term.contains(w)) count++;
            }
            if (count > 0) {
                vec[i] = (float) (Math.log(1 + count) / Math.log(10));
            }
        }

        // Hash-based filler for remaining dimensions (semantic spread)
        try {
            MessageDigest md = MessageDigest.getInstance("MD5");
            for (int j = MEDICAL_TERMS.length; j < VECTOR_DIM; j++) {
                byte[] hash = md.digest((text + "_" + j).getBytes());
                int val = ((hash[0] & 0xFF) << 8) | (hash[1] & 0xFF);
                vec[j] = (val - 32768) / 32768.0f;
            }
        } catch (Exception ignored) {}

        // L2 normalize to unit vector (required for cosine similarity)
        float norm = 0;
        for (float v : vec) norm += v * v;
        norm = (float) Math.sqrt(norm);
        if (norm > 0) {
            for (int i = 0; i < vec.length; i++) vec[i] /= norm;
        }

        return vec;
    }

    public float[] embedQuery(String query) {
        return embed(query);
    }
}