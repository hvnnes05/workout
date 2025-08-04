<template>
  <div class="p-6 max-w-xl mx-auto">
    <h1 class="text-2xl font-bold mb-4">Ausdauer Workout</h1>

    <div v-if="!running">
      <div class="mb-4">
        <button class="btn" @click="addExercise">+ Übung hinzufügen</button>
        <button class="btn ml-2" @click="addPause">+ Pause hinzufügen</button>
      </div>

      <ul class="mb-4 space-y-2">
        <li v-for="(ex, i) in exercises" :key="i" class="flex gap-2 items-center">
          <select v-model="ex.key" @change="updateFromPreset(ex)" class="border p-1 rounded w-full">
            <option disabled value="">Übung wählen</option>
            <option v-for="option in exerciseOptions" :key="option.key" :value="option.key">
              {{ option.name }}
            </option>
          </select>
          <input
            class="border p-1 rounded w-20"
            v-model.number="ex.duration"
            type="number"
          />
          <button class="text-red-500" @click="removeExercise(i)">✕</button>
        </li>
      </ul>

      <button class="btn" @click="startWorkout">Training starten</button>
    </div>

    <div v-else class="space-y-4">
      <div class="text-xl font-semibold">{{ exercises[current].name }}</div>
      <img v-if="exercises[current].image" :src="exercises[current].image" alt="Übung" class="w-full h-auto" />
      <div class="text-5xl font-bold">{{ timeLeft }}s</div>
      <div class="space-x-2">
        <button class="btn" @click="togglePause">{{ paused ? 'Fortsetzen' : 'Pause' }}</button>
        <button class="btn" @click="nextExercise">Weiter</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';

const exerciseOptions = [
  { key: 'burpees', name: 'Burpees', image: '/images/exercises/burpees.gif' },
  { key: 'jump_squats', name: 'Jump Squats', image: '/images/exercises/jump_squats.gif' },
  { key: 'plank_hold', name: 'Plank Hold', image: '/images/exercises/plank_hold.gif' },
  { key: 'mountain_climbers', name: 'Mountain Climbers', image: '/images/exercises/mountain_climbers.gif' },
  { key: 'high_knees', name: 'High Knees', image: '/images/exercises/high_knees.gif' },
  { key: 'pushups', name: 'Push-ups', image: '/images/exercises/pushups.gif' },
  { key: 'skater_jumps', name: 'Skater Jumps', image: '/images/exercises/skater_jumps.gif' },
  { key: 'lunges', name: 'Lunges', image: '/images/exercises/lunges.gif' },
  { key: 'situps', name: 'Sit-ups', image: '/images/exercises/situps.gif' },
  { key: 'jumping_jacks', name: 'Jumping Jacks', image: '/images/exercises/jumping_jacks.gif' },
  { key: 'pause', name: 'Pause', image: '' },
];

const defaultExercises = [
  { key: 'burpees', name: 'Burpees', duration: 60, image: '/images/exercises/burpees.gif' },
  { key: 'jump_squats', name: 'Jump Squats', duration: 60, image: '/images/exercises/jump_squats.gif' },
  { key: 'plank_hold', name: 'Plank Hold', duration: 60, image: '/images/exercises/plank_hold.gif' },
  { key: 'mountain_climbers', name: 'Mountain Climbers', duration: 60, image: '/images/exercises/mountain_climbers.gif' },
  { key: 'pause', name: 'Pause', duration: 30, image: '' },
];

const exercises = ref([...defaultExercises]);
const current = ref(0);
const running = ref(false);
const paused = ref(false);
const timeLeft = ref(exercises.value[0].duration);
let timer = null;

const updateFromPreset = (exercise) => {
  const match = exerciseOptions.find(opt => opt.key === exercise.key);
  if (match) {
    exercise.name = match.name;
    exercise.image = match.image;
  }
};

const startWorkout = () => {
  running.value = true;
  paused.value = false;
  current.value = 0;
  timeLeft.value = exercises.value[0].duration;
};

const togglePause = () => {
  paused.value = !paused.value;
};

const nextExercise = () => {
  if (current.value < exercises.value.length - 1) {
    current.value++;
    timeLeft.value = exercises.value[current.value].duration;
  } else {
    running.value = false;
    current.value = 0;
  }
};

const addExercise = () => {
  exercises.value.push({ key: '', name: '', duration: 30, image: '' });
};

const addPause = () => {
  exercises.value.push({ key: 'pause', name: 'Pause', duration: 30, image: '' });
};

const removeExercise = (index) => {
  exercises.value.splice(index, 1);
};

onMounted(() => {
  timer = setInterval(() => {
    if (running.value && !paused.value) {
      if (timeLeft.value > 0) {
        timeLeft.value--;
      } else {
        nextExercise();
      }
    }
  }, 1000);
});

onBeforeUnmount(() => {
  clearInterval(timer);
});
</script>

<style scoped>
.btn {
  @apply px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600;
}
</style>