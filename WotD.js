// server.js
import express from "express";
import fetch from "node-fetch";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// 5 dil listesi
const languages = [
  { code: "english" },
  { code: "german" },
  { code: "french" },
  { code: "spanish" },
  { code: "turkish" }
];

// Seviye belirleme fonksiyonu
function getWordLevel(word) {
  const len = word.length;
  if (len <= 5) return "Beginner";
  if (len <= 8) return "Intermediate";
  return "Advanced";
}

// Rastgele kelime çekme
async function getRandomWord(lang) {
  try {
    const resp = await fetch(`https://random-words-api.vercel.app/word/${lang.code}`);
    const data = await resp.json();
    const w = data[0];
    return {
      word: w.word,
      definition: w.definition,
      pronunciation: w.pronunciation,
      level: getWordLevel(w.word)
    };
  } catch (err) {
    console.error(`❌ ${lang.code} kelime alınamadı:`, err);
    return null;
  }
}

// Günlük kelime dosyası oluşturma
async function buildDailyWords() {
  const result = {};
  for (const lang of languages) {
    result[lang.code] = await getRandomWord(lang);
  }
  const today = new Date().toISOString().slice(0, 10);
  const filename = path.join(__dirname, `daily-${today}.json`);
  fs.writeFileSync(filename, JSON.stringify(result, null, 2), "utf-8");
  console.log(`✅ ${today} kelimeleri kaydedildi.`);
}

// API endpoint
app.get("/api/today", (req, res) => {
  const today = new Date().toISOString().slice(0, 10);
  const filename = path.join(__dirname, `daily-${today}.json`);
  if (fs.existsSync(filename)) {
    res.json(JSON.parse(fs.readFileSync(filename, "utf-8")));
  } else {
    res.status(404).json({ error: "Bugünün kelimesi henüz oluşturulmadı." });
  }
});

// Sunucu başlat
app.listen(PORT, () => {
  console.log(`🚀 Sunucu çalışıyor: http://localhost:${PORT}`);
  buildDailyWords(); // İlk başlatmada kelime oluştur
});
