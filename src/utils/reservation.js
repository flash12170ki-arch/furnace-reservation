import { createDefaultDateTime } from "./date";

export function createSampleGrid() {
  return Array.from({ length: 40 }, () => "");
}

export function createInitialForm() {
  return {
    id: null,
    furnace: "本焼炉",
    start_time: createDefaultDateTime(9),
    end_time: createDefaultDateTime(12),
    user_names: [],
    memo: "",

    calcine_slot: "午前",

    oxygen_pressure: 10,
    firing_temperature: 760,
    firing_time_value: 1,
    firing_time_unit: "h",

    anneal_mode: "降温",
    anneal_start_temp: 450,
    anneal_end_temp: 250,
    anneal_keep_temp: 450,
    anneal_hours: 18,

    sample_slots: createSampleGrid(),
  };
}

export function cycleValue(current, options, direction) {
  const value = Number(current);
  const index = options.indexOf(value);
  if (index === -1) return options[0];

  if (direction === "up") {
    return options[Math.min(index + 1, options.length - 1)];
  }

  return options[Math.max(index - 1, 0)];
}

export function normalizeReservationForForm(reservation) {
  const initialForm = createInitialForm();

  return {
    ...initialForm,
    ...reservation,
    user_names:
      reservation.user_names && reservation.user_names.length > 0
        ? reservation.user_names
        : reservation.user_name
          ? reservation.user_name.split(",").map((name) => name.trim())
          : [],
    sample_slots:
      reservation.sample_slots && reservation.sample_slots.length === 40
        ? reservation.sample_slots
        : createSampleGrid(),
  };
}

export function createReservationPayload(form) {
  return {
    furnace: form.furnace,
    user_name: form.user_names.join(", "),
    user_names: form.user_names,
    start_time: form.start_time,
    end_time: form.end_time,
    memo: form.memo || null,

    calcine_slot: form.furnace === "仮焼炉" ? form.calcine_slot : null,

    oxygen_pressure:
      form.furnace === "本焼炉" ? Number(form.oxygen_pressure) : null,
    firing_temperature:
      form.furnace === "本焼炉" ? Number(form.firing_temperature) : null,
    firing_time_value:
      form.furnace === "本焼炉" ? Number(form.firing_time_value) : null,
    firing_time_unit:
      form.furnace === "本焼炉" ? form.firing_time_unit : null,

    anneal_mode: form.furnace === "本焼炉" ? form.anneal_mode : null,
    anneal_start_temp:
      form.furnace === "本焼炉" && form.anneal_mode === "降温"
        ? Number(form.anneal_start_temp)
        : null,
    anneal_end_temp:
      form.furnace === "本焼炉" && form.anneal_mode === "降温"
        ? Number(form.anneal_end_temp)
        : null,
    anneal_keep_temp:
      form.furnace === "本焼炉" && form.anneal_mode === "キープ"
        ? Number(form.anneal_keep_temp)
        : null,
    anneal_hours:
      form.furnace === "本焼炉" ? Number(form.anneal_hours) : null,

    sample_slots: form.sample_slots,
  };
}
