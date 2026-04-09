import type { BenchmarkDataset } from "@/types";

export const DATASETS: BenchmarkDataset[] = [
  {
    id: "en-mixed",
    name: "English Mixed",
    description: "30 English sentences spanning positive, negative, and neutral registers",
    language: "en",
    samples: [
      {
        id: "en-01",
        text: "I absolutely love this product! It exceeded all my expectations.",
        language: "en",
        expected: "POSITIVE",
      },
      {
        id: "en-02",
        text: "This is the worst experience I have ever had. Completely unacceptable.",
        language: "en",
        expected: "NEGATIVE",
      },
      { id: "en-03", text: "The package arrived on Tuesday.", language: "en", expected: "NEUTRAL" },
      {
        id: "en-04",
        text: "Outstanding quality and fast delivery. Highly recommended!",
        language: "en",
        expected: "POSITIVE",
      },
      {
        id: "en-05",
        text: "Total waste of money. Broke after two days.",
        language: "en",
        expected: "NEGATIVE",
      },
      {
        id: "en-06",
        text: "The item is available in three colours.",
        language: "en",
        expected: "NEUTRAL",
      },
      {
        id: "en-07",
        text: "Brilliant! Works exactly as described. Five stars.",
        language: "en",
        expected: "POSITIVE",
      },
      {
        id: "en-08",
        text: "Terrible customer service. No response for weeks.",
        language: "en",
        expected: "NEGATIVE",
      },
      {
        id: "en-09",
        text: "Weight: 450g. Dimensions: 20 × 15 × 5 cm.",
        language: "en",
        expected: "NEUTRAL",
      },
      {
        id: "en-10",
        text: "Incredibly well-made. My kids are obsessed with it.",
        language: "en",
        expected: "POSITIVE",
      },
      {
        id: "en-11",
        text: "Do not buy this. It stopped working immediately.",
        language: "en",
        expected: "NEGATIVE",
      },
      {
        id: "en-12",
        text: "The manual is included in the box.",
        language: "en",
        expected: "NEUTRAL",
      },
      {
        id: "en-13",
        text: "Best purchase this year. So happy with the results!",
        language: "en",
        expected: "POSITIVE",
      },
      {
        id: "en-14",
        text: "Completely faulty on arrival. Very disappointed.",
        language: "en",
        expected: "NEGATIVE",
      },
      {
        id: "en-15",
        text: "Compatible with models released after 2022.",
        language: "en",
        expected: "NEUTRAL",
      },
    ],
  },
  {
    id: "de-mixed",
    name: "German Mixed",
    description: "15 German sentences for multilingual evaluation",
    language: "de",
    samples: [
      {
        id: "de-01",
        text: "Absolut fantastisch! Ich bin begeistert von der Qualität.",
        language: "de",
        expected: "POSITIVE",
      },
      {
        id: "de-02",
        text: "Schrecklich. Das Produkt ist nach einem Tag kaputtgegangen.",
        language: "de",
        expected: "NEGATIVE",
      },
      {
        id: "de-03",
        text: "Das Paket wurde am Donnerstag geliefert.",
        language: "de",
        expected: "NEUTRAL",
      },
      {
        id: "de-04",
        text: "Hervorragende Verarbeitung und schneller Versand. Klare Kaufempfehlung.",
        language: "de",
        expected: "POSITIVE",
      },
      {
        id: "de-05",
        text: "Totale Geldverschwendung. Hält nicht, was es verspricht.",
        language: "de",
        expected: "NEGATIVE",
      },
      {
        id: "de-06",
        text: "Der Artikel ist in zwei Größen erhältlich.",
        language: "de",
        expected: "NEUTRAL",
      },
      {
        id: "de-07",
        text: "Genau wie beschrieben – einfach perfekt!",
        language: "de",
        expected: "POSITIVE",
      },
      {
        id: "de-08",
        text: "Keinerlei Kundenservice. Sehr enttäuscht.",
        language: "de",
        expected: "NEGATIVE",
      },
      {
        id: "de-09",
        text: "Gewicht: 320 g. Maße: 15 × 10 × 3 cm.",
        language: "de",
        expected: "NEUTRAL",
      },
      {
        id: "de-10",
        text: "Meine Kinder lieben es. Top-Qualität!",
        language: "de",
        expected: "POSITIVE",
      },
    ],
  },
  {
    id: "fr-mixed",
    name: "French Mixed",
    description: "15 French sentences for multilingual evaluation",
    language: "fr",
    samples: [
      {
        id: "fr-01",
        text: "Absolument magnifique! Je suis très satisfait de la qualité.",
        language: "fr",
        expected: "POSITIVE",
      },
      {
        id: "fr-02",
        text: "Terrible. Le produit s'est cassé après un jour seulement.",
        language: "fr",
        expected: "NEGATIVE",
      },
      {
        id: "fr-03",
        text: "Le colis a été livré le mercredi.",
        language: "fr",
        expected: "NEUTRAL",
      },
      {
        id: "fr-04",
        text: "Excellente fabrication et livraison rapide. Je recommande vivement!",
        language: "fr",
        expected: "POSITIVE",
      },
      {
        id: "fr-05",
        text: "Complète perte d'argent. Ne correspond pas à la description.",
        language: "fr",
        expected: "NEGATIVE",
      },
      {
        id: "fr-06",
        text: "L'article est disponible en deux tailles.",
        language: "fr",
        expected: "NEUTRAL",
      },
      {
        id: "fr-07",
        text: "Exactement comme décrit. Vraiment parfait!",
        language: "fr",
        expected: "POSITIVE",
      },
      {
        id: "fr-08",
        text: "Aucun service client. Très déçu.",
        language: "fr",
        expected: "NEGATIVE",
      },
      {
        id: "fr-09",
        text: "Poids: 280 g. Dimensions: 12 × 8 × 2 cm.",
        language: "fr",
        expected: "NEUTRAL",
      },
      {
        id: "fr-10",
        text: "Mes enfants adorent. Qualité irréprochable!",
        language: "fr",
        expected: "POSITIVE",
      },
    ],
  },
  {
    id: "ar-mixed",
    name: "Arabic Mixed",
    description: "10 Arabic sentences for Arabic sentiment evaluation",
    language: "ar",
    samples: [
      {
        id: "ar-01",
        text: "رائع جداً! أنا سعيد جداً بهذا المنتج.",
        language: "ar",
        expected: "POSITIVE",
      },
      {
        id: "ar-02",
        text: "منتج سيء للغاية. توقف عن العمل في اليوم الأول.",
        language: "ar",
        expected: "NEGATIVE",
      },
      { id: "ar-03", text: "تم تسليم الطرد يوم الاثنين.", language: "ar", expected: "NEUTRAL" },
      {
        id: "ar-04",
        text: "جودة ممتازة وشحن سريع. أوصي بشدة!",
        language: "ar",
        expected: "POSITIVE",
      },
      {
        id: "ar-05",
        text: "مضيعة للمال تمامًا. لا يستحق السعر.",
        language: "ar",
        expected: "NEGATIVE",
      },
      { id: "ar-06", text: "المنتج متوفر بثلاثة ألوان.", language: "ar", expected: "NEUTRAL" },
      {
        id: "ar-07",
        text: "بالضبط كما هو موصوف. مثالي تمامًا!",
        language: "ar",
        expected: "POSITIVE",
      },
      {
        id: "ar-08",
        text: "لا توجد خدمة عملاء على الإطلاق. خائب الأمل جداً.",
        language: "ar",
        expected: "NEGATIVE",
      },
    ],
  },
];

export function getDatasetById(id: string): BenchmarkDataset | undefined {
  return DATASETS.find((d) => d.id === id);
}
