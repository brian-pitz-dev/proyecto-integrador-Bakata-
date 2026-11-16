/**
 * Plan de comidas — portado 1:1 de plan_vida_2026.html.
 * No es dato de Supabase (Principio IV): vive como constante en el código,
 * igual que lib/training-plan.ts.
 */

export type MealType = "desayuno" | "media" | "almuerzo" | "merienda" | "cena";

export interface Ingrediente {
  /** Clave de ingredienteNutri; los platos generados por IA usan "ia" + `nombre`. */
  id: string;
  cantidad: number | null;
  nombre?: string;
}

export interface Meal {
  name: string;
  detail: string;
  ingredientes: Ingrediente[];
  carbLoad?: boolean;
  liviana?: boolean;
  /** Totales de la porción base estimados por la IA (los platos del banco base no los traen). */
  proteinG?: number;
  kcal?: number;
  /** Hidratos y grasas estimados por la IA (los planes generados antes no los traen). */
  hcG?: number;
  grasaG?: number;
}

export interface DayMeal {
  type: MealType;
  label: string;
  meal: Meal;
  proteinG: number;
  /** Hidratos de carbono y grasas (g); null si el plato es de IA y no trae el dato. */
  hcG: number | null;
  grasaG: number | null;
}

export type MealBank = Record<MealType, Meal[]>;

export const mealBank: MealBank = {
  desayuno: [
    {
      name: "3 huevos fritos + café negro",
      detail: "150g (3 huevos), fritos con poco aceite",
      ingredientes: [{ id: "huevoFrito", cantidad: 150 }],
    },
    {
      name: "Avena con leche con proteínas + café",
      detail: "50g avena cocida, 250ml leche con proteínas",
      ingredientes: [
        { id: "avena", cantidad: 50 },
        { id: "lecheProte", cantidad: null },
      ],
    },
    {
      name: "2 huevos fritos + café negro",
      detail: "Rápido, para días con menos tiempo",
      ingredientes: [{ id: "huevoFrito", cantidad: 100 }],
    },
    {
      name: "Tortilla de avena + infusión",
      detail: "3 claras y avena licuadas con vainilla y edulcorante, a fuego lento en sartén",
      ingredientes: [
        { id: "claras", cantidad: 100 },
        { id: "avenaCruda", cantidad: 25 },
      ],
    },
    {
      name: "Claras revueltas + galletas de arroz con mermelada + fruta",
      detail: "Con té verde o café; mermelada sin azúcar",
      ingredientes: [
        { id: "claras", cantidad: 100 },
        { id: "galletasArroz", cantidad: 20 },
        { id: "mermelada", cantidad: 20 },
        { id: "fruta", cantidad: 150 },
      ],
    },
    {
      name: "Tostada integral con queso crema y palta + almendras",
      detail: "Con infusión; queso crema descremado",
      ingredientes: [
        { id: "panIntegral", cantidad: 30 },
        { id: "quesoUntable", cantidad: 30 },
        { id: "palta", cantidad: 40 },
        { id: "almendras", cantidad: 10 },
      ],
    },
    {
      name: "Yogur con granola + fruta",
      detail: "Yogur descremado o proteico, granola sin azúcar",
      ingredientes: [
        { id: "yogur", cantidad: 200 },
        { id: "granola", cantidad: 30 },
        { id: "fruta", cantidad: 150 },
      ],
    },
    {
      name: "Pancake de coco + infusión",
      detail: "Huevo, claras, coco rallado y vainilla, vuelta y vuelta en sartén",
      ingredientes: [
        { id: "huevo", cantidad: 50 },
        { id: "claras", cantidad: 100 },
        { id: "cocoRallado", cantidad: 20 },
      ],
    },
    {
      name: "Avena energética",
      detail: "Avena instantánea con agua, una medida de proteína, cacao amargo y edulcorante",
      ingredientes: [
        { id: "avenaCruda", cantidad: 25 },
        { id: "batidoProte", cantidad: null },
      ],
    },
    {
      name: "Tostada integral con huevo a la plancha y palta + almendras",
      detail: "Con infusión",
      ingredientes: [
        { id: "panIntegral", cantidad: 30 },
        { id: "huevo", cantidad: 50 },
        { id: "palta", cantidad: 40 },
        { id: "almendras", cantidad: 10 },
      ],
    },
  ],
  media: [
    {
      name: "Batido de proteína + almendras",
      detail: "1 scoop (40g) + 250ml leche con proteínas + 20g almendras",
      ingredientes: [
        { id: "batidoProte", cantidad: null },
        { id: "lecheProte", cantidad: null },
        { id: "almendras", cantidad: 20 },
      ],
    },
    {
      name: "Batido de proteína solo",
      detail: "1 scoop (40g) + 250ml leche con proteínas",
      ingredientes: [
        { id: "batidoProte", cantidad: null },
        { id: "lecheProte", cantidad: null },
      ],
    },
    {
      name: "Yogur + fruta",
      detail: "Yogur descremado o proteico, fruta de estación",
      ingredientes: [
        { id: "yogur", cantidad: 200 },
        { id: "fruta", cantidad: 150 },
      ],
    },
    {
      name: "Fruta + almendras",
      detail: "Ideal post entrenamiento si no tomás batido",
      ingredientes: [
        { id: "fruta", cantidad: 150 },
        { id: "almendras", cantidad: 15 },
      ],
    },
  ],
  almuerzo: [
    {
      name: "Pollo + arroz + espinaca",
      detail: "200g pollo, 150g arroz, 100g espinaca",
      ingredientes: [
        { id: "pollo", cantidad: 200 },
        { id: "arroz", cantidad: 150 },
        { id: "espinaca", cantidad: 100 },
      ],
      carbLoad: false,
    },
    {
      name: "Carne de vaca + papa + espinaca",
      detail: "200g carne, 200g papa, 100g espinaca",
      ingredientes: [
        { id: "carneVaca", cantidad: 200 },
        { id: "papa", cantidad: 200 },
        { id: "espinaca", cantidad: 100 },
      ],
      carbLoad: false,
    },
    {
      name: "Milanesa de carne + fideos integrales + espinaca",
      detail: "200g milanesa al horno, 150g fideos, 100g espinaca",
      ingredientes: [
        { id: "milanesa", cantidad: 200 },
        { id: "fideosInteg", cantidad: 150 },
        { id: "espinaca", cantidad: 100 },
      ],
      carbLoad: true,
    },
    {
      name: "Carne picada + arroz + espinaca",
      detail: "200g carne picada, 150g arroz, 100g espinaca",
      ingredientes: [
        { id: "carnePicada", cantidad: 200 },
        { id: "arroz", cantidad: 150 },
        { id: "espinaca", cantidad: 100 },
      ],
      carbLoad: false,
    },
    {
      name: "Carne picada + polenta + espinaca",
      detail: "200g carne picada, 150g polenta, 100g espinaca",
      ingredientes: [
        { id: "carnePicada", cantidad: 200 },
        { id: "polenta", cantidad: 150 },
        { id: "espinaca", cantidad: 100 },
      ],
      carbLoad: true,
    },
    {
      name: "Rapiditas + carne picada + espinaca (burrito)",
      detail: "55g rapiditas, 150g carne picada, 100g espinaca",
      ingredientes: [
        { id: "rapiditas", cantidad: 55 },
        { id: "carnePicada", cantidad: 150 },
        { id: "espinaca", cantidad: 100 },
      ],
      carbLoad: false,
    },
    {
      name: "Chorizo + arroz",
      detail: "400g chorizo, 150g arroz",
      ingredientes: [
        { id: "chorizo", cantidad: 400 },
        { id: "arroz", cantidad: 150 },
      ],
      carbLoad: true,
    },
    {
      name: "Chorizo + polenta + espinaca",
      detail: "200g chorizo, 150g polenta, 100g espinaca",
      ingredientes: [
        { id: "chorizo", cantidad: 200 },
        { id: "polenta", cantidad: 150 },
        { id: "espinaca", cantidad: 100 },
      ],
      carbLoad: true,
    },
    {
      name: "Salsa de tomate + fideos integrales + espinaca",
      detail: "150g salsa de tomate, 250g fideos integrales, 100g espinaca",
      ingredientes: [
        { id: "salsaTomate", cantidad: 150 },
        { id: "fideosInteg", cantidad: 250 },
        { id: "espinaca", cantidad: 100 },
      ],
      carbLoad: true,
    },
    {
      name: "Pollo a la plancha + soufflé de calabaza",
      detail: "Puré de calabaza con ricota, huevo y claras a nieve, 25 min al horno",
      ingredientes: [
        { id: "pollo", cantidad: 150 },
        { id: "calabaza", cantidad: 150 },
        { id: "ricota", cantidad: 50 },
        { id: "claras", cantidad: 66 },
      ],
      carbLoad: false,
    },
    {
      name: "Merluza al horno + vegetales grillados + arroz yamaní",
      detail: "Condimentar con una cdita de oliva y limón",
      ingredientes: [
        { id: "pescado", cantidad: 200 },
        { id: "vegetales", cantidad: 200 },
        { id: "arroz", cantidad: 50 },
        { id: "aceiteOliva", cantidad: 5 },
      ],
      carbLoad: false,
    },
    {
      name: "Hamburguesas de carne con avena + puré de calabaza",
      detail: "Carne picada magra, avena, cebolla y huevo, 20 min al horno",
      ingredientes: [
        { id: "carnePicada", cantidad: 150 },
        { id: "avenaCruda", cantidad: 15 },
        { id: "calabaza", cantidad: 200 },
      ],
      carbLoad: false,
    },
    {
      name: "Guiso de lentejas con carne magra",
      detail: "Carne magra en cubos, calabaza, tomate y lentejas cocidas",
      ingredientes: [
        { id: "carneMagra", cantidad: 150 },
        { id: "lentejas", cantidad: 150 },
        { id: "calabaza", cantidad: 100 },
        { id: "vegetales", cantidad: 100 },
      ],
      carbLoad: true,
    },
    {
      name: "Pastel de pescado con puré de papa",
      detail: "Merluza salteada con verduras, cubierta de puré y gratinada",
      ingredientes: [
        { id: "pescado", cantidad: 200 },
        { id: "papa", cantidad: 200 },
        { id: "vegetales", cantidad: 80 },
        { id: "quesoRallado", cantidad: 10 },
      ],
      carbLoad: true,
    },
    {
      name: "Pollo + garbanzos + ensalada",
      detail: "Medio plato de vegetales; oliva y limón o aceto",
      ingredientes: [
        { id: "pollo", cantidad: 150 },
        { id: "legumbres", cantidad: 100 },
        { id: "vegetales", cantidad: 200 },
        { id: "aceiteOliva", cantidad: 5 },
      ],
      carbLoad: false,
    },
  ],
  merienda: [
    {
      name: "Leche con proteínas + avena",
      detail: "250ml leche con proteínas + 30g avena",
      ingredientes: [
        { id: "lecheProte", cantidad: null },
        { id: "avena", cantidad: 30 },
      ],
      liviana: true,
    },
    {
      name: "Leche con proteínas + almendras",
      detail: "250ml leche con proteínas + 20g almendras",
      ingredientes: [
        { id: "lecheProte", cantidad: null },
        { id: "almendras", cantidad: 20 },
      ],
      liviana: true,
    },
    {
      name: "Pasta de maní con proteína + rapiditas",
      detail: "30g pasta de maní, 27.5g rapiditas (media porción)",
      ingredientes: [
        { id: "pastaMani", cantidad: 30 },
        { id: "rapiditas", cantidad: 27.5 },
      ],
      liviana: true,
    },
    {
      name: "Tortilla de avena + infusión",
      detail: "3 claras y avena licuadas con vainilla y edulcorante, a fuego lento en sartén",
      ingredientes: [
        { id: "claras", cantidad: 100 },
        { id: "avenaCruda", cantidad: 25 },
      ],
      liviana: true,
    },
    {
      name: "Tostada integral con queso crema y mermelada + almendras",
      detail: "Con infusión; mermelada light",
      ingredientes: [
        { id: "panIntegral", cantidad: 30 },
        { id: "quesoUntable", cantidad: 30 },
        { id: "mermelada", cantidad: 15 },
        { id: "almendras", cantidad: 10 },
      ],
      liviana: true,
    },
    {
      name: "Yogur con granola + fruta",
      detail: "Yogur descremado o proteico, granola sin azúcar",
      ingredientes: [
        { id: "yogur", cantidad: 200 },
        { id: "granola", cantidad: 30 },
        { id: "fruta", cantidad: 150 },
      ],
      liviana: true,
    },
    {
      name: "Cookies crepes de manzana",
      detail: "Rodajas de manzana bañadas en avena, claras y canela, a la sartén",
      ingredientes: [
        { id: "fruta", cantidad: 150 },
        { id: "avenaCruda", cantidad: 20 },
        { id: "claras", cantidad: 66 },
      ],
      liviana: true,
    },
  ],
  cena: [
    {
      name: "2 huevos fritos + espinaca salteada",
      detail: "Rápido, poca preparación",
      ingredientes: [
        { id: "huevoFrito", cantidad: 100 },
        { id: "espinaca", cantidad: 100 },
      ],
      liviana: true,
    },
    {
      name: "Batido de proteína liviano",
      detail: "1 scoop (40g) + 250ml leche con proteínas",
      ingredientes: [
        { id: "batidoProte", cantidad: null },
        { id: "lecheProte", cantidad: null },
      ],
      liviana: true,
    },
    {
      name: "2 huevos fritos",
      detail: "Simple",
      ingredientes: [{ id: "huevoFrito", cantidad: 100 }],
      liviana: true,
    },
    {
      name: "Pasta de maní con proteína + rapiditas",
      detail: "30g pasta de maní, 27.5g rapiditas (media porción)",
      ingredientes: [
        { id: "pastaMani", cantidad: 30 },
        { id: "rapiditas", cantidad: 27.5 },
      ],
      liviana: false,
    },
    {
      name: "Tortilla de espinaca",
      detail: "Huevo, claras, espinaca y un poco de queso rallado",
      ingredientes: [
        { id: "huevo", cantidad: 50 },
        { id: "claras", cantidad: 100 },
        { id: "espinaca", cantidad: 150 },
        { id: "quesoRallado", cantidad: 10 },
      ],
      liviana: true,
    },
    {
      name: "Wok de pollo con vegetales",
      detail: "Pollo en tiras salteado con vegetales de estación",
      ingredientes: [
        { id: "pollo", cantidad: 150 },
        { id: "vegetales", cantidad: 250 },
        { id: "aceiteOliva", cantidad: 5 },
      ],
      liviana: false,
    },
    {
      name: "Zapallitos rellenos de pollo",
      detail: "Pulpa de zapallito con pollo, huevo y queso light gratinado",
      ingredientes: [
        { id: "pollo", cantidad: 120 },
        { id: "huevo", cantidad: 50 },
        { id: "vegetales", cantidad: 250 },
        { id: "muzzarella", cantidad: 20 },
      ],
      liviana: false,
    },
    {
      name: "Omelette de vegetales",
      detail: "Huevo, claras y semillas, relleno de espárragos y zucchinis",
      ingredientes: [
        { id: "huevo", cantidad: 50 },
        { id: "claras", cantidad: 100 },
        { id: "vegetales", cantidad: 150 },
        { id: "quesoRallado", cantidad: 10 },
      ],
      liviana: true,
    },
    {
      name: "Pizza con masa de pollo",
      detail: "Base de pechuga procesada con huevo, queso y aceitunas",
      ingredientes: [
        { id: "pollo", cantidad: 150 },
        { id: "huevo", cantidad: 50 },
        { id: "muzzarella", cantidad: 30 },
        { id: "aceiteOliva", cantidad: 3 },
      ],
      liviana: false,
    },
    {
      name: "Tarta proteica de zapallito y pollo",
      detail: "Masa de avena y queso crema light; relleno de pollo, zapallitos y claras",
      ingredientes: [
        { id: "avenaCruda", cantidad: 40 },
        { id: "quesoUntable", cantidad: 25 },
        { id: "pollo", cantidad: 100 },
        { id: "claras", cantidad: 66 },
        { id: "vegetales", cantidad: 150 },
      ],
      liviana: false,
    },
    {
      name: "Carne al horno con vegetales grillados",
      detail: "Corte magro; oliva y limón o aceto",
      ingredientes: [
        { id: "carneMagra", cantidad: 150 },
        { id: "vegetales", cantidad: 250 },
        { id: "aceiteOliva", cantidad: 5 },
      ],
      liviana: false,
    },
    {
      name: "Pescado con vegetales verdes",
      detail: "A la plancha o al horno; se puede repetir vegetales",
      ingredientes: [
        { id: "pescado", cantidad: 200 },
        { id: "vegetales", cantidad: 250 },
        { id: "aceiteOliva", cantidad: 5 },
      ],
      liviana: true,
    },
  ],
};

interface IngredienteNutri {
  nombre: string;
  prote100?: number;
  kcal100?: number;
  /** Hidratos de carbono y grasas cada 100 g, en la misma base que prote100/kcal100. */
  hc100?: number;
  grasa100?: number;
  /** Porción fija (scoop / vaso): no se escala. */
  fixed?: number;
  fixedKcal?: number;
  fixedHc?: number;
  fixedGrasa?: number;
  /** Escalar de a unidades enteras (ej. 1 huevo = 50 g) en vez de a 5 g. */
  unidadG?: number;
  /** Nombre de la unidad en singular y plural ("huevo frito", "huevos fritos"), si se cuenta por unidades. */
  unidadNombre?: [string, string];
  /** Cómo se muestra una porción fija ("1 scoop de proteína"). */
  porcionFija?: string;
  /** Fuente principal de proteína del plato (carne, pollo, huevo): se escala aparte del resto. */
  fuenteProteina?: boolean;
  /** Verdura de acompañamiento: al ajustar a la persona queda en su porción base. */
  verdura?: boolean;
  /** Porción máxima razonable en una comida (g): al agrandar porciones no se pasa de esto. */
  maxG?: number;
  /** Acompañamiento en poca cantidad (queso untable, mermelada): queda en su porción base. */
  acompana?: boolean;
  /** Fuente principal de grasa (frutos secos, pasta de maní): se escala aparte de los hidratos. */
  fuenteGrasa?: boolean;
}

// kcal100, hc100 (hidratos netos, sin fibra) y grasa100: valores de referencia aproximados, en la misma base (crudo/cocido) que
// el prote100 original de cada ingrediente — revisar contra las etiquetas reales.
const ingredienteNutri: Record<string, IngredienteNutri> = {
  pollo: {
    nombre: "pollo",
    maxG: 300,
    fuenteProteina: true,
    prote100: 31,
    kcal100: 165,
    hc100: 0,
    grasa100: 3.6,
  },
  carneVaca: {
    nombre: "carne",
    maxG: 250,
    fuenteProteina: true,
    prote100: 27,
    kcal100: 250,
    hc100: 0,
    grasa100: 16,
  },
  carnePicada: {
    nombre: "carne picada",
    maxG: 250,
    fuenteProteina: true,
    prote100: 28,
    kcal100: 250,
    hc100: 0,
    grasa100: 15,
  },
  milanesa: {
    nombre: "milanesa",
    maxG: 250,
    fuenteProteina: true,
    prote100: 21,
    kcal100: 230,
    hc100: 9,
    grasa100: 11,
  },
  huevoFrito: {
    nombre: "huevo frito",
    fuenteProteina: true,
    unidadNombre: ["huevo frito", "huevos fritos"],
    prote100: 13,
    kcal100: 196,
    hc100: 0.8,
    grasa100: 15,
    unidadG: 50,
  },
  arroz: { maxG: 120, nombre: "arroz", prote100: 7, kcal100: 360, hc100: 79, grasa100: 0.6 },
  fideosInteg: {
    nombre: "fideos integrales",
    maxG: 120,
    prote100: 11.25,
    kcal100: 350,
    hc100: 70,
    grasa100: 2.5,
  },
  papa: { maxG: 400, nombre: "papa", prote100: 2, kcal100: 77, hc100: 17, grasa100: 0.1 },
  espinaca: {
    nombre: "espinaca",
    verdura: true,
    prote100: 3.6,
    kcal100: 23,
    hc100: 1.5,
    grasa100: 0.4,
  },
  avena: { maxG: 200, nombre: "avena", prote100: 3.3, kcal100: 70, hc100: 12, grasa100: 1.4 },
  almendras: {
    nombre: "almendras",
    maxG: 40,
    fuenteGrasa: true,
    prote100: 20,
    kcal100: 580,
    hc100: 10,
    grasa100: 50,
  },
  pastaMani: {
    nombre: "pasta de maní",
    maxG: 40,
    fuenteProteina: true,
    prote100: 37,
    kcal100: 560,
    hc100: 12,
    grasa100: 42,
  },
  rapiditas: {
    maxG: 110,
    nombre: "rapiditas",
    prote100: 9.1,
    kcal100: 300,
    hc100: 50,
    grasa100: 7,
  },
  polenta: { maxG: 120, nombre: "polenta", prote100: 7.2, kcal100: 360, hc100: 78, grasa100: 1.5 },
  chorizo: {
    nombre: "chorizo",
    maxG: 150,
    fuenteProteina: true,
    prote100: 17.5,
    kcal100: 330,
    hc100: 1,
    grasa100: 28,
  },
  claras: {
    nombre: "clara",
    fuenteProteina: true,
    unidadG: 33,
    unidadNombre: ["clara", "claras"],
    prote100: 11,
    kcal100: 52,
    hc100: 0.7,
    grasa100: 0.2,
  },
  huevo: {
    nombre: "huevo",
    fuenteProteina: true,
    unidadG: 50,
    unidadNombre: ["huevo", "huevos"],
    prote100: 13,
    kcal100: 143,
    hc100: 0.7,
    grasa100: 9.5,
  },
  pescado: {
    nombre: "merluza",
    fuenteProteina: true,
    prote100: 18,
    kcal100: 90,
    hc100: 0,
    grasa100: 1.5,
  },
  carneMagra: {
    nombre: "carne magra",
    fuenteProteina: true,
    prote100: 22,
    kcal100: 135,
    hc100: 0,
    grasa100: 5,
  },
  ricota: {
    nombre: "ricota descremada",
    fuenteProteina: true,
    prote100: 11,
    kcal100: 110,
    hc100: 4,
    grasa100: 6,
  },
  lentejas: {
    maxG: 250,
    nombre: "lentejas cocidas",
    prote100: 9,
    kcal100: 116,
    hc100: 17,
    grasa100: 0.4,
  },
  legumbres: {
    maxG: 250,
    nombre: "garbanzos cocidos",
    prote100: 8.9,
    kcal100: 164,
    hc100: 20,
    grasa100: 2.6,
  },
  calabaza: { maxG: 300, nombre: "calabaza", prote100: 1, kcal100: 26, hc100: 6, grasa100: 0.1 },
  vegetales: {
    nombre: "vegetales",
    verdura: true,
    prote100: 1.5,
    kcal100: 30,
    hc100: 4.5,
    grasa100: 0.3,
  },
  avenaCruda: { maxG: 80, nombre: "avena", prote100: 13, kcal100: 380, hc100: 58, grasa100: 7 },
  panIntegral: {
    nombre: "pan integral",
    maxG: 90,
    unidadG: 30,
    unidadNombre: ["tostada integral", "tostadas integrales"],
    prote100: 9,
    kcal100: 250,
    hc100: 41,
    grasa100: 3.5,
  },
  galletasArroz: {
    nombre: "galletas de arroz",
    maxG: 40,
    unidadG: 10,
    unidadNombre: ["galleta de arroz", "galletas de arroz"],
    prote100: 8,
    kcal100: 390,
    hc100: 80,
    grasa100: 3,
  },
  granola: { maxG: 60, nombre: "granola", prote100: 10, kcal100: 450, hc100: 60, grasa100: 18 },
  yogur: {
    maxG: 300,
    nombre: "yogur descremado",
    fuenteProteina: true,
    prote100: 4.5,
    kcal100: 45,
    hc100: 6,
    grasa100: 0.1,
  },
  fruta: {
    nombre: "fruta",
    maxG: 300,
    unidadG: 150,
    unidadNombre: ["fruta", "frutas"],
    prote100: 0.4,
    kcal100: 55,
    hc100: 13,
    grasa100: 0.2,
  },
  mermelada: {
    nombre: "mermelada light",
    acompana: true,
    prote100: 0.3,
    kcal100: 60,
    hc100: 14,
    grasa100: 0,
  },
  quesoUntable: {
    nombre: "queso crema descremado",
    acompana: true,
    prote100: 12,
    kcal100: 110,
    hc100: 4,
    grasa100: 5,
  },
  quesoRallado: {
    nombre: "queso rallado",
    acompana: true,
    prote100: 33,
    kcal100: 390,
    hc100: 3,
    grasa100: 28,
  },
  muzzarella: {
    nombre: "muzzarella light",
    fuenteProteina: true,
    prote100: 25,
    kcal100: 250,
    hc100: 3,
    grasa100: 16,
  },
  palta: {
    maxG: 100,
    nombre: "palta",
    fuenteGrasa: true,
    prote100: 2,
    kcal100: 160,
    hc100: 2,
    grasa100: 15,
  },
  cocoRallado: {
    nombre: "coco rallado",
    maxG: 30,
    fuenteGrasa: true,
    prote100: 7,
    kcal100: 660,
    hc100: 7,
    grasa100: 64,
  },
  aceiteOliva: {
    nombre: "aceite de oliva",
    maxG: 15,
    fuenteGrasa: true,
    prote100: 0,
    kcal100: 900,
    hc100: 0,
    grasa100: 100,
  },
  banana: {
    nombre: "banana",
    maxG: 240,
    unidadG: 120,
    unidadNombre: ["banana", "bananas"],
    prote100: 1.1,
    kcal100: 89,
    hc100: 20,
    grasa100: 0.3,
  },
  salsaTomate: {
    nombre: "salsa de tomate",
    verdura: true,
    prote100: 1.7,
    kcal100: 30,
    hc100: 5,
    grasa100: 0.3,
  },
  batidoProte: {
    nombre: "batido de proteína",
    porcionFija: "1 scoop de proteína",
    fixed: 30,
    fixedKcal: 120,
    fixedHc: 3,
    fixedGrasa: 1.5,
  },
  lecheProte: {
    nombre: "leche con proteínas",
    porcionFija: "250 ml de leche con proteínas",
    fixed: 12.5,
    fixedKcal: 120,
    fixedHc: 12,
    fixedGrasa: 3,
  },
  lecheDescremada: {
    nombre: "leche descremada",
    porcionFija: "250 ml de leche descremada",
    fixed: 8.5,
    fixedKcal: 88,
    fixedHc: 12,
    fixedGrasa: 0.5,
  },
};

function sumNutri(
  meal: Meal,
  fixedKey: "fixed" | "fixedKcal" | "fixedHc" | "fixedGrasa",
  per100Key: "prote100" | "kcal100" | "hc100" | "grasa100",
) {
  return meal.ingredientes.reduce((total, item) => {
    const ing = ingredienteNutri[item.id];
    if (!ing) return total;
    if (ing[fixedKey] !== undefined) return total + (ing[fixedKey] ?? 0);
    return total + ((ing[per100Key] ?? 0) * (item.cantidad ?? 0)) / 100;
  }, 0);
}

function calcMealProtein(meal: Meal): number {
  return (meal.proteinG ?? 0) + sumNutri(meal, "fixed", "prote100");
}

function calcMealKcal(meal: Meal): number {
  return (meal.kcal ?? 0) + sumNutri(meal, "fixedKcal", "kcal100");
}

/** Plato de IA sin el dato (generado antes de que se pidiera): no se puede calcular. */
function sinDatoIa(meal: Meal, valor: number | undefined): boolean {
  return valor === undefined && meal.ingredientes.some((i) => i.id === "ia");
}

function calcMealHc(meal: Meal): number | null {
  if (sinDatoIa(meal, meal.hcG)) return null;
  return (meal.hcG ?? 0) + sumNutri(meal, "fixedHc", "hc100");
}

function calcMealGrasa(meal: Meal): number | null {
  if (sinDatoIa(meal, meal.grasaG)) return null;
  return (meal.grasaG ?? 0) + sumNutri(meal, "fixedGrasa", "grasa100");
}

/** Proteína, hidratos y grasas de un plato ya escalado. */
function macrosDe(meal: Meal): Pick<DayMeal, "proteinG" | "hcG" | "grasaG"> {
  return { proteinG: calcMealProtein(meal), hcG: calcMealHc(meal), grasaG: calcMealGrasa(meal) };
}

/** "230 g pollo · 175 g arroz" — porción escalada, armada desde los ingredientes. */
export function formatPortion(meal: Meal): string {
  // mismo ingrediente dos veces (ej. huevos + refuerzo de huevos): se suma en una sola entrada
  const total = new Map<string, number>();
  const orden: Ingrediente[] = [];
  for (const i of meal.ingredientes) {
    const key = i.id === "ia" ? `ia:${i.nombre}` : i.id;
    if (!total.has(key)) orden.push(i);
    total.set(key, (total.get(key) ?? 0) + (i.cantidad ?? 0));
  }
  return orden
    .map((i) => {
      const ing = ingredienteNutri[i.id];
      if (ing?.porcionFija) return ing.porcionFija;
      if (i.cantidad == null || ing?.fixed !== undefined) return null;
      const g = total.get(i.id === "ia" ? `ia:${i.nombre}` : i.id) ?? 0;
      if (ing?.unidadG && ing.unidadNombre) {
        const n = Math.round(g / ing.unidadG);
        return `${n} ${ing.unidadNombre[n === 1 ? 0 : 1]}`;
      }
      return `${g} g ${i.nombre ?? ing?.nombre ?? i.id}`;
    })
    .filter((t): t is string => t !== null)
    .join(" · ");
}

const MIN_FACTOR = 0.75;
const MAX_FACTOR = 1.3;

/** Factor de porción para acercar las comidas del día a la meta calórica, acotado a [0.75, 1.3] y redondeado a 0.05. */
export function portionFactor(metaKcal: number, baseKcal: number): number {
  if (!(metaKcal > 0) || !(baseKcal > 0)) return 1;
  const f = Math.round((metaKcal / baseKcal) * 20) / 20;
  return Math.min(MAX_FACTOR, Math.max(MIN_FACTOR, f));
}

function scaleMeal(meal: Meal, f: number): Meal {
  if (f === 1) return meal;
  return {
    ...meal,
    proteinG: meal.proteinG != null ? meal.proteinG * f : undefined,
    kcal: meal.kcal != null ? meal.kcal * f : undefined,
    hcG: meal.hcG != null ? meal.hcG * f : undefined,
    grasaG: meal.grasaG != null ? meal.grasaG * f : undefined,
    ingredientes: meal.ingredientes.map((i) => {
      const ing = ingredienteNutri[i.id];
      if (i.cantidad == null || ing?.fixed !== undefined) return { ...i };
      const unidad = ing?.unidadG ?? 5;
      return { ...i, cantidad: Math.max(unidad, Math.round((i.cantidad * f) / unidad) * unidad) };
    }),
  };
}

/** mulberry32: PRNG determinístico (misma semilla → misma secuencia siempre). */
function mulberry32(seed: number): () => number {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Tope duro: ningún plato pasa MAX_SLOTS_SIN_SALIR turnos sin aparecer al menos una vez. */
const MAX_SLOTS_SIN_SALIR = 10;

function buildRecencySequence(length: number, totalSlots: number, seed: number): number[] {
  const rng = mulberry32(seed);
  const lastUsed = new Array(length).fill(0);
  const seq: number[] = [];
  let prevChosen = -1;
  for (let t = 0; t < totalSlots; t++) {
    const forced = lastUsed.findIndex((lu, i) => i !== prevChosen && t - lu >= MAX_SLOTS_SIN_SALIR);
    let chosen: number;
    if (forced !== -1) {
      chosen = forced;
    } else {
      const weights = lastUsed.map((lu, i) => (i === prevChosen ? 0 : Math.max(1, t - lu)));
      const wPow = weights.map((w) => Math.pow(w, 3));
      const totalWeight = wPow.reduce((a, b) => a + b, 0);
      let r = rng() * totalWeight;
      chosen = 0;
      for (let i = 0; i < length; i++) {
        r -= wPow[i];
        if (r <= 0) {
          chosen = i;
          break;
        }
      }
    }
    seq.push(chosen);
    lastUsed[chosen] = t;
    prevChosen = chosen;
  }
  return seq;
}

// Generoso a propósito (~20 años de semanas): la secuencia mulberry32 es
// estrictamente secuencial, alargarla no cambia los valores que ya se usan,
// solo agrega más al final — ver lib/training-plan.ts buildPlan().
const ROTATION_SLOTS = 1040 * 5 + 10;
// Una secuencia por (largo del banco, semilla): el banco base de siempre cae en la misma
// entrada que antes; un banco propio (IA) de otro largo arma la suya.
const sequenceCache = new Map<string, number[]>();
function rotationSequence(length: number, seed: number): number[] {
  const key = `${length}:${seed}`;
  let seq = sequenceCache.get(key);
  if (!seq) {
    seq = buildRecencySequence(length, ROTATION_SLOTS, seed);
    sequenceCache.set(key, seq);
  }
  return seq;
}

function pickAlmuerzo(
  mealBank: MealBank,
  weekNum: number,
  dayIdx: number,
  carbLoadWeeks: number[],
): Meal {
  const bank = mealBank.almuerzo;
  const almuerzoSequence = rotationSequence(bank.length, 42);
  // la carga va solo jueves y viernes (dayIdx 3-4): para una carrera larga alcanzan 1-2 días
  if (dayIdx >= 3 && carbLoadWeeks.includes(weekNum)) {
    const carbArr = bank.filter((m) => m.carbLoad);
    if (carbArr.length) return carbArr[dayIdx % carbArr.length];
  }
  const globalIdx = (weekNum - 1) * 5 + dayIdx;
  const seqIdx = almuerzoSequence[globalIdx % almuerzoSequence.length];
  return bank[seqIdx];
}

function hasIngredient(meal: Meal, id: string): boolean {
  return meal.ingredientes.some((i) => i.id === id);
}

function pickCena(mealBank: MealBank, weekNum: number, dayIdx: number, meriendaMeal: Meal): Meal {
  const bank = mealBank.cena;
  const cenaSequence = rotationSequence(bank.length, 99);
  const globalIdx = (weekNum - 1) * 5 + dayIdx;
  const seqIdx = cenaSequence[globalIdx % cenaSequence.length];
  let cena = bank[seqIdx];

  // Regla dura: nunca el mismo plato que la merienda del día
  if (cena.name === meriendaMeal.name) {
    for (let off = 1; off < bank.length; off++) {
      const altIdx = cenaSequence[(globalIdx + off) % cenaSequence.length];
      if (bank[altIdx].name !== meriendaMeal.name) {
        cena = bank[altIdx];
        break;
      }
    }
  }

  // Regla blanda: evitar merienda liviana + cena liviana si hay alternativa
  if (meriendaMeal.liviana && cena.liviana) {
    for (let off = 1; off < bank.length; off++) {
      const altIdx = cenaSequence[(globalIdx + off) % cenaSequence.length];
      const alt = bank[altIdx];
      if (!alt.liviana && alt.name !== meriendaMeal.name) {
        cena = alt;
        break;
      }
    }
  }

  return cena;
}

function pickMeal(
  mealBank: MealBank,
  type: "desayuno" | "media" | "merienda",
  weekNum: number,
  dayIdx: number,
  offset: number,
): Meal {
  const arr = mealBank[type];
  let idx = (weekNum + dayIdx + offset) % arr.length;
  if (dayIdx > 0) {
    const prevIdx = (weekNum + (dayIdx - 1) + offset) % arr.length;
    if (idx === prevIdx) idx = (idx + 1) % arr.length;
  }
  return arr[idx];
}

function cloneMeal(meal: Meal): Meal {
  return { ...meal, ingredientes: meal.ingredientes.map((i) => ({ ...i })) };
}

function reinforceBreakfast(meal: Meal): Meal {
  const reinforced = cloneMeal(meal);
  reinforced.ingredientes.push({ id: "huevoFrito", cantidad: 100 });
  reinforced.detail = `${meal.detail} · + 2 huevos fritos extra (refuerzo proteína)`;
  return reinforced;
}

function reinforceWithBatido(meal: Meal): Meal {
  const reinforced = cloneMeal(meal);
  if (!hasIngredient(reinforced, "batidoProte"))
    reinforced.ingredientes.push({ id: "batidoProte", cantidad: null });
  if (!hasIngredient(reinforced, "lecheProte"))
    reinforced.ingredientes.push({ id: "lecheProte", cantidad: null });
  reinforced.detail = `${meal.detail} · + batido de proteína extra (refuerzo)`;
  return reinforced;
}

const LOW_LUNCH_PROTEIN_THRESHOLD = 55;
// 55 g / 94.9 kg (peso inicial de Brian, brian-migration.sql) ≈ 0.58 g/kg: a ese peso da el umbral de siempre.
const LUNCH_PROTEIN_G_PER_KG = 0.58;
/** Objetivo diario de proteína por kg de peso actual. */
export const PROTEINA_G_POR_KG = 1.8;

/** Proteína mínima del almuerzo antes de reforzar el resto del día; escala con el peso actual. */
export function umbralAlmuerzo(pesoKg?: number | null): number {
  return pesoKg && pesoKg > 0
    ? Math.round(pesoKg * LUNCH_PROTEIN_G_PER_KG)
    : LOW_LUNCH_PROTEIN_THRESHOLD;
}

/** Si el almuerzo del día queda bajo en proteína: agranda desayuno, después batido en merienda, si no, refuerza la cena. */
function applyProteinReinforcement(
  meals: DayMeal[],
  almuerzoProtein: number,
  threshold: number,
): DayMeal[] {
  if (almuerzoProtein >= threshold) return meals;
  const merienda = meals.find((m) => m.type === "merienda");

  return meals.map((m) => {
    if (m.type === "desayuno") {
      const meal = reinforceBreakfast(m.meal);
      return { ...m, meal, ...macrosDe(meal) };
    }
    if (m.type === "merienda" && !hasIngredient(m.meal, "batidoProte")) {
      const meal = reinforceWithBatido(m.meal);
      return { ...m, meal, ...macrosDe(meal) };
    }
    if (m.type === "cena") {
      const meriendaYaReforzada = merienda ? hasIngredient(merienda.meal, "batidoProte") : false;
      if (!meriendaYaReforzada || hasIngredient(m.meal, "batidoProte")) return m;
      const meal = reinforceWithBatido(m.meal);
      return { ...m, meal, ...macrosDe(meal) };
    }
    return m;
  });
}

const MEAL_LABELS: Record<MealType, string> = {
  desayuno: "Desayuno",
  media: "Media mañana",
  almuerzo: "Almuerzo",
  merienda: "Merienda",
  cena: "Cena",
};

export interface DayPlan {
  meals: DayMeal[];
  totalProteinG: number;
  /** null si algún plato (de IA, viejo) no trae el dato. */
  totalHcG: number | null;
  totalGrasaG: number | null;
  totalKcal: number;
  /** Factor de porción aplicado para acercarse a la meta calórica (1 = porción base). */
  factor: number;
  /**
   * true = banco base ajustado a la persona (su peso y su meta): las cantidades del texto original
   * del plato no aplican, vale la porción calculada (formatPortion).
   */
  personalizado: boolean;
  /** Hidratos a los que apunta el día (banco base ajustado a la persona); null si no aplica. */
  hcObjetivoG: number | null;
  /** Grasas a las que apunta el día: lo que queda de la meta calórica, nunca menos de 0,8 g/kg. */
  grasaObjetivoG: number | null;
  /** true = lunes a viernes; false = fin de semana (mismo armado, pero más flexible). */
  isWeekday: boolean;
}

export interface MealsForDayOptions {
  /** Qué toca entrenar ese día: decide el objetivo de hidratos (HC_G_POR_KG). */
  tipoDia?: TipoDia | null;
  /** Banco propio del usuario (plan_ia); si falta, el banco base compartido. */
  bank?: MealBank;
  /** Meta calórica del día: si llega, las porciones se escalan hacia ella. */
  metaKcal?: number | null;
  /**
   * Peso actual. Con el banco base, las porciones se arman para la proteína (PROTEINA_G_POR_KG) y las
   * calorías de esta persona; con un banco propio (IA) solo ajusta el umbral de proteína del almuerzo.
   */
  pesoKg?: number | null;
}

/**
 * Comidas del día para una semana (1-indexed, igual que lib/training-plan.ts)
 * y un índice de día 0=lunes..6=domingo. Sábado/domingo no tienen estructura fija.
 * Sin `opts` da exactamente el mismo resultado que el plan original.
 */
/** Corrimiento de semanas para los menús de fin de semana (dentro de ROTATION_SLOTS). */
const FINDE_OFFSET_SEMANAS = 520;

export function getMealsForDay(
  weekNum: number,
  dayIdx: number,
  carbLoadWeeks: number[],
  opts: MealsForDayOptions = {},
): DayPlan {
  // Sábado y domingo también tienen menú (más flexible): rotan con su propio tramo de la secuencia
  // para no repetir los platos de la semana, y sin carga de hidratos (va jueves y viernes).
  const finde = dayIdx >= 5;
  if (finde) {
    weekNum = weekNum + FINDE_OFFSET_SEMANAS;
    dayIdx = dayIdx - 5;
    carbLoadWeeks = [];
  }

  const bank = opts.bank ?? mealBank;
  const offsets = { desayuno: 0, media: 1, merienda: 2 } as const;
  const meriendaMeal = pickMeal(bank, "merienda", weekNum, dayIdx, offsets.merienda);
  const picked: Record<MealType, Meal> = {
    desayuno: pickMeal(bank, "desayuno", weekNum, dayIdx, offsets.desayuno),
    media: pickMeal(bank, "media", weekNum, dayIdx, offsets.media),
    almuerzo: pickAlmuerzo(bank, weekNum, dayIdx, carbLoadWeeks),
    merienda: meriendaMeal,
    cena: pickCena(bank, weekNum, dayIdx, meriendaMeal),
  };

  const types = Object.keys(MEAL_LABELS) as MealType[];
  if (opts.pesoKg && opts.pesoKg > 0 && types.every((t) => platoCalculable(picked[t])))
    return {
      ...diaPersonalizado(picked, opts.pesoKg, opts.metaKcal ?? null, opts.tipoDia ?? null),
      isWeekday: !finde,
    };

  const threshold = umbralAlmuerzo(opts.pesoKg);
  const kcalOf = (meals: DayMeal[]) => meals.reduce((total, m) => total + calcMealKcal(m.meal), 0);

  function buildDay(factor: number): DayMeal[] {
    const meals: DayMeal[] = types.map((type) => {
      const meal = scaleMeal(picked[type], factor);
      return { type, label: MEAL_LABELS[type], meal, ...macrosDe(meal) };
    });
    return applyProteinReinforcement(meals, meals[types.indexOf("almuerzo")].proteinG, threshold);
  }

  let factor = 1;
  if (opts.metaKcal) {
    const baseKcal = types.reduce((total, t) => total + calcMealKcal(picked[t]), 0);
    // 2 pasadas: el refuerzo de proteína (no escalable) suma kcal, así que se descuenta de la meta.
    const first = portionFactor(opts.metaKcal, baseKcal);
    const reinforceKcal =
      kcalOf(buildDay(first)) -
      types.reduce((total, t) => total + calcMealKcal(scaleMeal(picked[t], first)), 0);
    factor = portionFactor(opts.metaKcal - reinforceKcal, baseKcal);
  }

  const meals = buildDay(factor);
  const totalProteinG = meals.reduce((total, m) => total + m.proteinG, 0);
  const sumar = (key: "hcG" | "grasaG") =>
    meals.some((m) => m[key] === null)
      ? null
      : meals.reduce((total, m) => total + (m[key] ?? 0), 0);
  return {
    meals,
    totalProteinG,
    totalHcG: sumar("hcG"),
    totalGrasaG: sumar("grasaG"),
    totalKcal: kcalOf(meals),
    factor,
    personalizado: false,
    hcObjetivoG: null,
    grasaObjetivoG: null,
    isWeekday: !finde,
  };
}

/** Reglas de alimentación según la persona y el día (objetivo, tipo de día). */
export function reglasNutricion(c: {
  objetivo?: "musculo" | "bajar" | "evento";
  tipoDia?: TipoDia | null;
}): string[] {
  const reglas: (string | false)[] = [
    "Medio plato de vegetales en el almuerzo y la cena.",
    "Repartí la proteína entre las comidas en vez de concentrarla en una.",
    "Un vaso de agua antes de cada comida.",
    c.objetivo === "bajar" &&
      "Empezá por las verduras y la proteína: llenan más con menos calorías.",
    c.objetivo === "musculo" && "Comé algo con proteína e hidratos en las 2 horas después del gym.",
    (c.tipoDia === "fondo" || c.tipoDia === "running") &&
      "Hoy entrenás cardio: sumá hidratos antes y después de la sesión.",
    c.tipoDia === "carga" &&
      "Carga de hidratos: más pasta, arroz o papa y menos fibra y grasa, para llegar con energía.",
    c.tipoDia === "descanso" &&
      "Día de descanso: la proteína sigue igual, los hidratos pueden bajar.",
    "El fin de semana es más flexible: tratá de llegar a la proteína del día.",
  ];
  return reglas.filter((r): r is string => !!r);
}

// ---------------------------------------------------------------------------
// Banco base ajustado a cada persona
//
// El banco base tiene porciones de referencia (las del plan original). Para que sirva a cualquiera,
// las porciones se recalculan con dos factores: uno para la fuente de proteína del plato (carne,
// pollo, huevo) y otro para el resto (hidratos, grasas, verduras). Se eligen para que el día llegue a
// la proteína de la persona (PROTEINA_G_POR_KG × su peso) y a su meta de calorías a la vez. Si con
// las porciones al mínimo sigue sobrando proteína, se sacan los batidos; si al máximo sigue faltando,
// se agregan refuerzos (huevos, batido).
// ---------------------------------------------------------------------------

// Hidratos según lo que se entrena ese día (g por kg de peso), dentro de los rangos de las guías de
// nutrición deportiva (ACSM / ISSN / COI): 3–5 g/kg con poca actividad, 5–7 con ~1 h por día,
// 6–10 con entrenamiento de resistencia largo y 8–12 en la carga previa a una carrera larga.
export type TipoDia = "descanso" | "liviano" | "gym" | "running" | "fondo" | "carga";

export const HC_G_POR_KG: Record<TipoDia, number> = {
  descanso: 3,
  liviano: 3.5,
  gym: 4,
  running: 5,
  fondo: 6,
  carga: 8,
};

export const TIPO_DIA_LABEL: Record<TipoDia, string> = {
  descanso: "día de descanso",
  liviano: "día liviano",
  gym: "día de gym",
  running: "día de running",
  fondo: "día de fondo",
  carga: "carga de hidratos",
};

/** Tipo de día según las sesiones que tiene (tags de lib/training-plan.ts): vale la más exigente. */
export function tipoDiaPara(tags: string[], esCarga: boolean): TipoDia {
  if (esCarga) return "carga";
  if (tags.some((t) => t === "long" || t === "event" || t === "luj")) return "fondo";
  if (tags.includes("run")) return "running";
  if (tags.includes("gym")) return "gym";
  if (tags.some((t) => t === "core" || t === "walk")) return "liviano";
  return "descanso";
}

/** Grasas mínimas recomendadas (g/kg): los hidratos no pueden comerse este piso. */
const GRASA_MIN_G_POR_KG = 0.8;
/** Hidratos mínimos (g/kg) aunque la meta calórica sea baja. */
const HC_MIN_G_POR_KG = 2;

const FACTOR_MIN_PERSONAL = 0.5;
const FACTOR_MAX_PERSONAL = 2;
/** Margen aceptado alrededor del objetivo de proteína antes de agregar o sacar batidos/huevos. */
const PROTEINA_MARGEN_BAJO = 0.9;
const PROTEINA_MARGEN_ALTO = 1.15;

/** La fuente de proteína puede achicarse más: muchos platos del banco nacieron para ~95 kg. */
const FACTOR_MIN_PROTE = 0.35;

const acotar = (f: number, min = FACTOR_MIN_PERSONAL) =>
  Math.min(FACTOR_MAX_PERSONAL, Math.max(min, Math.round(f * 20) / 20));

type Clase = "prote" | "hc" | "grasa" | "fijo";

function claseDe(ing: IngredienteNutri): Clase {
  if (ing.fixed !== undefined || ing.verdura || ing.acompana) return "fijo";
  if (ing.fuenteProteina) return "prote";
  if (ing.fuenteGrasa) return "grasa";
  return "hc";
}

type Factores = Record<Exclude<Clase, "fijo">, number>;

function escalarPorClase(meal: Meal, f: Factores): Meal {
  return {
    ...meal,
    ingredientes: meal.ingredientes.map((i) => {
      const ing = ingredienteNutri[i.id];
      if (i.cantidad == null || !ing) return { ...i };
      const clase = claseDe(ing);
      if (clase === "fijo") return { ...i };
      const unidad = ing.unidadG ?? 5;
      const cantidad = Math.max(unidad, Math.round((i.cantidad * f[clase]) / unidad) * unidad);
      return { ...i, cantidad: ing.maxG ? Math.min(ing.maxG, cantidad) : cantidad };
    }),
  };
}

interface Macros {
  p: number;
  h: number;
  g: number;
  k: number;
}

/** Proteína, hidratos y kcal del día a porción base, separados por clase de ingrediente. */
function partesDelDia(meals: Meal[]): Record<Clase, Macros> {
  const r: Record<Clase, Macros> = {
    prote: { p: 0, h: 0, g: 0, k: 0 },
    hc: { p: 0, h: 0, g: 0, k: 0 },
    grasa: { p: 0, h: 0, g: 0, k: 0 },
    fijo: { p: 0, h: 0, g: 0, k: 0 },
  };
  for (const meal of meals)
    for (const item of meal.ingredientes) {
      const ing = ingredienteNutri[item.id];
      if (!ing) continue;
      const c = r[claseDe(ing)];
      if (ing.fixed !== undefined) {
        c.p += ing.fixed;
        c.h += ing.fixedHc ?? 0;
        c.g += ing.fixedGrasa ?? 0;
        c.k += ing.fixedKcal ?? 0;
        continue;
      }
      const g = (item.cantidad ?? 0) / 100;
      c.p += (ing.prote100 ?? 0) * g;
      c.h += (ing.hc100 ?? 0) * g;
      c.g += (ing.grasa100 ?? 0) * g;
      c.k += (ing.kcal100 ?? 0) * g;
    }
  return r;
}

/** Objetivos del día en gramos: proteína, hidratos y grasas (las calorías salen de los tres). */
interface MetasDia {
  p: number;
  h: number;
  g: number;
}

/**
 * Factores por clase para que el día llegue a la proteína, los hidratos y las grasas de la persona:
 * la fuente de proteína (carne, huevo…) ajusta la proteína, la de hidratos (arroz, papa, avena…)
 * los hidratos y la de grasas (frutos secos, palta, aceite) las grasas. Como cada alimento aporta
 * un poco de todo, se resuelve por pasadas sucesivas, acotando cada factor.
 */
function factoresPara(meals: Meal[], metas: MetasDia): Factores {
  const d = partesDelDia(meals);
  const total = (f: Factores, key: keyof Macros) =>
    d.fijo[key] + f.prote * d.prote[key] + f.hc * d.hc[key] + f.grasa * d.grasa[key];
  const f: Factores = { prote: 1, hc: 1, grasa: 1 };
  for (let i = 0; i < 40; i++) {
    if (d.prote.p > 0)
      f.prote = acotar(
        (metas.p - (total(f, "p") - f.prote * d.prote.p)) / d.prote.p,
        FACTOR_MIN_PROTE,
      );
    if (d.hc.h > 0) f.hc = acotar((metas.h - (total(f, "h") - f.hc * d.hc.h)) / d.hc.h);
    if (d.grasa.g > 0)
      f.grasa = acotar((metas.g - (total(f, "g") - f.grasa * d.grasa.g)) / d.grasa.g);
  }
  return f;
}

function sinBatido(meal: Meal): Meal {
  const ingredientes = meal.ingredientes
    .filter((i) => i.id !== "batidoProte")
    .map((i) => ({ ...i }));
  const nombres = ingredientes.map((i) => ingredienteNutri[i.id]?.nombre ?? i.nombre ?? i.id);
  const name = nombres.join(" + ");
  return {
    ...meal,
    name: name.charAt(0).toUpperCase() + name.slice(1),
    detail: "Sin batido: ya llegás a tu proteína del día",
    ingredientes,
  };
}

/** Grasas: piso saludable y techo razonable (g/kg); entre los dos completan las calorías. */
const GRASA_MAX_G_POR_KG = 1.2;

/**
 * Proteína, hidratos y grasas del día para la persona, que sumen su meta de calorías:
 * proteína 1,8 g/kg; grasas, lo que deja la meta después de la proteína y los hidratos del tipo de
 * día, acotadas entre 0,8 y 1,2 g/kg; los hidratos completan el resto (así, con superávit sobran
 * hidratos y con déficit se recortan, nunca debajo de 2 g/kg). Sin meta: hidratos del tipo de día
 * y grasas 1 g/kg.
 */
export function metasMacros(
  pesoKg: number,
  tipoDia: TipoDia,
  metaKcal: number | null,
): { p: number; h: number; g: number } {
  const p = pesoKg * PROTEINA_G_POR_KG;
  const hBase = pesoKg * HC_G_POR_KG[tipoDia];
  if (!metaKcal) return { p, h: hBase, g: pesoKg };
  const libre = metaKcal - 4 * p;
  const g = Math.min(
    pesoKg * GRASA_MAX_G_POR_KG,
    Math.max(pesoKg * GRASA_MIN_G_POR_KG, (libre - 4 * hBase) / 9),
  );
  const h = Math.max(pesoKg * HC_MIN_G_POR_KG, (libre - 9 * g) / 4);
  return { p, h, g };
}

/** Hidratos del día para la persona (ver metasMacros). */
export function hcObjetivo(pesoKg: number, tipoDia: TipoDia, metaKcal: number | null): number {
  return Math.round(metasMacros(pesoKg, tipoDia, metaKcal).h);
}

/** Grasas del día para la persona (ver metasMacros). */
export function grasaObjetivo(pesoKg: number, tipoDia: TipoDia, metaKcal: number | null): number {
  return Math.round(metasMacros(pesoKg, tipoDia, metaKcal).g);
}

function diaPersonalizado(
  picked: Record<MealType, Meal>,
  pesoKg: number,
  metaKcal: number | null,
  tipoDia: TipoDia | null,
): DayPlan {
  const types = Object.keys(MEAL_LABELS) as MealType[];
  const objetivo = pesoKg * PROTEINA_G_POR_KG;
  // sin tipo de día se apunta a un día de gym
  const metas: MetasDia = metasMacros(pesoKg, tipoDia ?? "gym", metaKcal);
  const hcMeta = tipoDia ? Math.round(metas.h) : null;
  let base: Record<MealType, Meal> = { ...picked };

  function armar(b: Record<MealType, Meal>) {
    const f = factoresPara(
      types.map((t) => b[t]),
      metas,
    );
    const meals: DayMeal[] = types.map((type) => {
      const meal = escalarPorClase(b[type], f);
      return { type, label: MEAL_LABELS[type], meal, ...macrosDe(meal) };
    });
    const proteina = meals.reduce((t, m) => t + m.proteinG, 0);
    return { meals, proteina, f };
  }

  let dia = armar(base);
  const kcalDe = (d: typeof dia) => d.meals.reduce((t, m) => t + calcMealKcal(m.meal), 0);

  // Falta proteína aun con la fuente al máximo: refuerzos, de a uno (mismo orden que el plan original).
  const refuerzos: ((b: Record<MealType, Meal>) => Record<MealType, Meal> | null)[] = [
    (b) => ({ ...b, desayuno: reinforceBreakfast(b.desayuno) }),
    (b) =>
      hasIngredient(b.merienda, "batidoProte")
        ? null
        : { ...b, merienda: reinforceWithBatido(b.merienda) },
    (b) =>
      hasIngredient(b.cena, "batidoProte") ? null : { ...b, cena: reinforceWithBatido(b.cena) },
  ];
  for (const refuerzo of refuerzos) {
    if (dia.proteina >= objetivo * PROTEINA_MARGEN_BAJO) break;
    const siguiente = refuerzo(base);
    if (!siguiente) continue;
    base = siguiente;
    dia = armar(base);
  }

  // Sobra proteína aun con la fuente al mínimo: se sacan los batidos (primero el de la cena).
  for (const type of ["cena", "merienda", "media", "desayuno"] as const) {
    if (dia.proteina <= objetivo * PROTEINA_MARGEN_ALTO) break;
    if (!hasIngredient(base[type], "batidoProte") || base[type].ingredientes.length < 2) continue;
    base = { ...base, [type]: sinBatido(base[type]) };
    dia = armar(base);
  }

  // Con las porciones al máximo todavía falta algún macro (días con pocos hidratos o platos muy
  // magros): se suma un complemento, de a uno, al macro que más falta, sin pasarse de calorías.
  const complementos: Record<"h" | "g", [MealType, string, number, string][]> = {
    h: [
      ["desayuno", "fruta", 150, "fruta"],
      ["merienda", "panIntegral", 30, "tostada integral"],
      ["almuerzo", "arroz", 60, "arroz"],
      ["media", "fruta", 150, "fruta"],
      ["cena", "papa", 200, "papa"],
      ["merienda", "fruta", 150, "fruta"],
      ["desayuno", "avenaCruda", 30, "avena"],
      ["desayuno", "panIntegral", 30, "tostada integral"],
      ["cena", "panIntegral", 30, "pan integral"],
    ],
    g: [
      ["almuerzo", "aceiteOliva", 5, "oliva"],
      ["cena", "aceiteOliva", 5, "oliva"],
      ["media", "almendras", 15, "almendras"],
      ["desayuno", "palta", 40, "palta"],
      ["merienda", "almendras", 15, "almendras"],
    ],
  };
  const usados = { h: 0, g: 0 };
  for (let paso = 0; paso < 14; paso++) {
    const suma = (key: "hcG" | "grasaG") => dia.meals.reduce((t, m) => t + (m[key] ?? 0), 0);
    const kcal = dia.meals.reduce((t, m) => t + calcMealKcal(m.meal), 0);
    if (metaKcal && kcal >= metaKcal * 1.05) break;
    const ratios = { h: suma("hcG") / metas.h, g: suma("grasaG") / metas.g };
    const falta = (["h", "g"] as const)
      .filter((k) => ratios[k] < 0.9 && usados[k] < complementos[k].length)
      .sort((a, b) => ratios[a] - ratios[b])[0];
    if (!falta) break;
    const [type, id, cantidad, nombre] = complementos[falta][usados[falta]++];
    if (hasIngredient(base[type], id)) continue;
    // el aceite va para condimentar platos con verdura, no una merienda de pan con maní
    const conVerdura = base[type].ingredientes.some((i) => ingredienteNutri[i.id]?.verdura);
    if (id === "aceiteOliva" && !conVerdura) continue;
    const meal = cloneMeal(base[type]);
    meal.ingredientes.push({ id, cantidad });
    meal.name = `${meal.name} + ${nombre}`;
    const conComplemento = { ...base, [type]: meal };
    const prueba = armar(conComplemento);
    // si con el complemento el día se pasa de calorías, no va (y no se prueban más)
    if (metaKcal && kcalDe(prueba) > metaKcal * 1.05) break;
    base = conComplemento;
    dia = prueba;
  }

  // Sobra proteína aun con la carne al mínimo (la proteína viene de lácteos, legumbres, frutos
  // secos): la leche con proteínas pasa a leche común, de a una.
  for (const type of ["cena", "merienda", "media", "desayuno"] as const) {
    if (dia.proteina <= objetivo * PROTEINA_MARGEN_ALTO) break;
    if (!hasIngredient(base[type], "batidoProte") || base[type].ingredientes.length < 2) continue;
    base = { ...base, [type]: sinBatido(base[type]) };
    dia = armar(base);
  }
  for (const type of ["merienda", "media", "desayuno", "cena"] as const) {
    if (dia.proteina <= objetivo * PROTEINA_MARGEN_ALTO) break;
    if (!hasIngredient(base[type], "lecheProte")) continue;
    const meal = cloneMeal(base[type]);
    meal.ingredientes = meal.ingredientes.map((i) =>
      i.id === "lecheProte" ? { ...i, id: "lecheDescremada" } : i,
    );
    meal.name = meal.name.replace(/[Ll]eche con proteínas/, (m) =>
      m[0] === "L" ? "Leche descremada" : "leche descremada",
    );
    base = { ...base, [type]: meal };
    dia = armar(base);
  }

  // Se pasa de calorías: se sacan complementos agregados (de los que suman más), de a uno.
  const quitables = ["aceiteOliva", "almendras", "palta", "panIntegral", "fruta", "banana"];
  for (let paso = 0; paso < 6 && metaKcal && kcalDe(dia) > metaKcal * 1.07; paso++) {
    const candidato = types
      .flatMap((t) =>
        base[t].ingredientes
          .filter((i) => quitables.includes(i.id) && base[t].ingredientes.length > 1)
          .map((i) => ({ t, id: i.id })),
      )
      .at(0);
    if (!candidato) break;
    const meal = cloneMeal(base[candidato.t]);
    const idx = meal.ingredientes.findIndex((i) => i.id === candidato.id);
    meal.ingredientes.splice(idx, 1);
    const nombre = ingredienteNutri[candidato.id]?.nombre ?? "";
    meal.name = meal.name.replace(new RegExp(` \\+ ${nombre}$`), "");
    base = { ...base, [candidato.t]: meal };
    dia = armar(base);
  }
  const grasaMeta = Math.round(metas.g);

  // "3 huevos fritos + café": la cantidad del nombre es la del plan original, la real va en la porción
  const meals = dia.meals.map((m) => {
    const name = m.meal.name.replace(/^\d+\s+/, "");
    return name === m.meal.name
      ? m
      : { ...m, meal: { ...m.meal, name: name.charAt(0).toUpperCase() + name.slice(1) } };
  });
  const sumar = (key: "hcG" | "grasaG") => meals.reduce((total, m) => total + (m[key] ?? 0), 0);
  return {
    meals,
    totalProteinG: dia.proteina,
    totalHcG: sumar("hcG"),
    totalGrasaG: sumar("grasaG"),
    totalKcal: meals.reduce((total, m) => total + calcMealKcal(m.meal), 0),
    factor: dia.f.hc,
    personalizado: true,
    hcObjetivoG: hcMeta,
    grasaObjetivoG: grasaMeta,
    isWeekday: true,
  };
}

// ---------------------------------------------------------------------------
// Catálogo para la IA: la IA elige platos (o arma nuevos con estos ingredientes) y la app calcula
// las cantidades. Un plato es "calculable" si todos sus ingredientes están en el catálogo.
// ---------------------------------------------------------------------------

/** El plato usa solo ingredientes del catálogo: sus macros y porciones las calcula la app. */
export function platoCalculable(meal: Meal): boolean {
  return meal.ingredientes.length > 0 && meal.ingredientes.every((i) => i.id in ingredienteNutri);
}

export interface IngredienteCatalogo {
  id: string;
  nombre: string;
  /** "fija": porción fija (scoop / vaso), sin gramos. */
  porcion: "gramos" | "fija";
}

export function catalogoIngredientes(): IngredienteCatalogo[] {
  return Object.entries(ingredienteNutri).map(([id, ing]) => ({
    id,
    nombre: ing.porcionFija ?? ing.nombre,
    porcion: ing.fixed !== undefined ? "fija" : "gramos",
  }));
}

export function esIngredienteFijo(id: string): boolean {
  return ingredienteNutri[id]?.fixed !== undefined;
}

export function esIngredienteConocido(id: string): boolean {
  return id in ingredienteNutri;
}

export const MEAL_TYPES = Object.keys(MEAL_LABELS) as MealType[];
