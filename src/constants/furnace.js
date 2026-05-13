export const FURNACES = ["本焼炉", "仮焼炉", "接合炉"];

export const OXYGEN_PRESSURE_OPTIONS = [3, 10, 100];
export const ANNEAL_HOUR_OPTIONS = [12, 18, 24];

export function getFurnaceClass(furnace) {
  if (furnace === "本焼炉") return "main-furnace";
  if (furnace === "仮焼炉") return "pre-furnace";
  if (furnace === "接合炉") return "joint-furnace";
  return "";
}
