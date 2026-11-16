/**
 * Fotos y video de cada ejercicio, para que se entienda cómo se hace.
 *
 * Fotos: Free Exercise DB (github.com/yuhonas/free-exercise-db), de dominio público
 * (Unlicense). Cada ejercicio tiene dos: posición inicial (0) y final (1), guardadas en
 * public/ejercicios/<id>/ como .webp. Se emparejan por el nombre exacto que usa
 * lib/gym-exercises.ts; un ejercicio sin equivalente en esa base queda solo con video.
 *
 * Video: búsqueda en YouTube del nombre del ejercicio. Sirve para cualquier ejercicio,
 * incluidos los de rutinas viejas generadas con IA fuera del catálogo (sin foto).
 */

const PHOTO_ID: Record<string, string> = {
  "Abdominal invertido": "Reverse_Crunch",
  "Abducción de cadera (máquina o banda)": "Thigh_Abductor",
  "Bicho muerto (boca arriba, brazo y pierna opuestos)": "Dead_Bug",
  "Caminata lateral con banda": "Monster_Walk",
  "Cruce de poleas (de arriba hacia abajo)": "Cable_Crossover",
  "Curl de bíceps en banco predicador": "Preacher_Curl",
  "Curl de bíceps en máquina": "Machine_Bicep_Curl",
  "Curl femoral bajando en 4 seg (o curl nórdico asistido)": "Lying_Leg_Curls",
  "Curl femoral en máquina": "Lying_Leg_Curls",
  "Curl inclinado con mancuernas": "Incline_Dumbbell_Curl",
  "Curl invertido": "Reverse_Barbell_Curl",
  "Curl martillo": "Hammer_Curls",
  "Dominadas asistidas (o jalón con agarre neutro)": "Band_Assisted_Pull-Up",
  "Elevación de talones a una pierna": "Standing_Dumbbell_Calf_Raise",
  "Elevación de talones de pie": "Standing_Calf_Raises",
  "Elevación de talones sentado": "Seated_Calf_Raise",
  "Empuje de cadera con barra": "Barbell_Hip_Thrust",
  "Empuje de cadera en máquina (o puente con barra)": "Barbell_Glute_Bridge",
  "Encogimientos con mancuernas": "Dumbbell_Shrug",
  "Estocada búlgara": "Split_Squat_with_Dumbbells",
  "Estocada caminando": "Bodyweight_Walking_Lunge",
  "Estocada hacia atrás": "Dumbbell_Rear_Lunge",
  "Extensión de cuádriceps en máquina": "Leg_Extensions",
  "Extensión de tríceps en polea con soga": "Triceps_Pushdown_-_Rope_Attachment",
  "Extensión de tríceps sobre la cabeza (polea o mancuerna)":
    "Cable_Rope_Overhead_Triceps_Extension",
  "Fondos (en paralelas o en banco)": "Dips_-_Triceps_Version",
  "Jalón a la cara con soga": "Face_Pull",
  "Jalón a la cara en polea (o vuelos posteriores)": "Face_Pull",
  "Jalón a la cara en polea": "Face_Pull",
  "Jalón al pecho con agarre cerrado": "Close-Grip_Front_Lat_Pulldown",
  "Jalón al pecho": "Wide-Grip_Lat_Pulldown",
  "Jalón con brazos extendidos en polea": "Straight-Arm_Pulldown",
  "Peso muerto rumano a una pierna": "Kettlebell_One-Legged_Deadlift",
  "Peso muerto rumano con mancuernas": "Stiff-Legged_Dumbbell_Deadlift",
  "Peso muerto rumano": "Romanian_Deadlift",
  "Plancha frontal": "Plank",
  "Plancha lateral": "Side_Bridge",
  "Prensa (pies a media altura)": "Leg_Press",
  "Press de banca con barra (o en máquina guiada)": "Barbell_Bench_Press_-_Medium_Grip",
  "Press de hombros con giro, con mancuernas": "Arnold_Dumbbell_Press",
  "Press de hombros con mancuernas sentado": "Dumbbell_Shoulder_Press",
  "Press de hombros en máquina": "Leverage_Shoulder_Press",
  "Press de pecho con mancuernas (banco plano)": "Dumbbell_Bench_Press",
  "Press de pecho en máquina": "Leverage_Chest_Press",
  "Press de pecho inclinado en máquina": "Leverage_Incline_Chest_Press",
  "Press francés con barra W": "EZ-Bar_Skullcrusher",
  "Press inclinado con mancuernas": "Incline_Dumbbell_Press",
  "Press inclinado en máquina": "Leverage_Incline_Chest_Press",
  "Puente de glúteo a una pierna": "Single_Leg_Glute_Bridge",
  "Puente de glúteo": "Butt_Lift_Bridge",
  "Remo a un brazo con mancuerna": "One-Arm_Dumbbell_Row",
  "Remo con barra o remo en T": "Bent_Over_Barbell_Row",
  "Remo con mancuernas en banco inclinado (pecho apoyado)": "Dumbbell_Incline_Row",
  "Remo en máquina con apoyo de pecho": "Leverage_Iso_Row",
  "Remo sentado en polea": "Seated_Cable_Rows",
  "Sentadilla con polea (o prensa)": "Goblet_Squat",
  "Sentadilla con polea": "Goblet_Squat",
  "Sentadilla en máquina inclinada (o sentadilla copa pesada)": "Hack_Squat",
  "Subida al cajón o escalón": "Dumbbell_Step_Ups",
  "Vuelos laterales en polea": "Cable_Seated_Lateral_Raise",
  "Vuelos laterales sentado con mancuernas": "Seated_Side_Lateral_Raise",
  "Vuelos laterales": "Side_Lateral_Raise",
  "Vuelos posteriores en máquina (contractora invertida)": "Reverse_Machine_Flyes",
};

export interface ExerciseMedia {
  /** Fotos de posición inicial y final, o null si el ejercicio no tiene. */
  photos: [string, string] | null;
  /** Búsqueda en YouTube de cómo se hace el ejercicio. */
  videoUrl: string;
}

export function getExerciseMedia(name: string): ExerciseMedia {
  const id = PHOTO_ID[name];
  // sin lo que va entre paréntesis ("(o prensa)", "(máquina o banda)"): búsqueda más limpia
  const query = `cómo hacer ${name.replace(/\s*\([^)]*\)/g, "")} ejercicio técnica`;
  return {
    photos: id ? [`/ejercicios/${id}/0.webp`, `/ejercicios/${id}/1.webp`] : null,
    videoUrl: `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`,
  };
}
