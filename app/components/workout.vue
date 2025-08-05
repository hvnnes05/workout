<template>
  <div class="p-6 max-w-xl mx-auto flex flex-col">
    <div class="pt-20">
    <div v-if="!running">
      <h1>Konfiguration</h1>
      <div class="pt-10">

      </div>

      <ul class="space-y-4">
        <li
  v-for="(ex, i) in exercises"
  :key="i"
  class="relative overflow-hidden rounded border bg-white shadow-sm"
  @touchstart="startTouch($event, i)"
  @touchmove="moveTouch($event, i)"
  @touchend="endTouch(i)"
>
  <div
    class="flex items-center space-x-4 p-4 transition-transform duration-300 ease-in-out"
    :class="{ '-translate-x-[90px]': swipedIndex === i }"
  >
    <select
      v-model="ex.key"
      @change="updateFromPreset(ex)"
      class="flex-1 border rounded px-3 py-2 text-base"
    >
      <option disabled value="">Übung wählen</option>
      <option v-for="option in exerciseOptions" :key="option.key" :value="option.key">
        {{ option.name }}
      </option>
    </select>

    <div class="flex items-center space-x-2">
      <button
        type="button"
        class="bg-gray-200 rounded px-3 py-1 text-xl select-none"
        @click="changeDuration(i, -5)"
        aria-label="Dauer verringern"
      >
        –
      </button>
      <input
        v-model.number="ex.duration"
        type="number"
        min="5"
        step="5"
        class="w-16 border rounded text-center text-base py-2"
      />
      <button
        type="button"
        class="bg-gray-200 rounded px-3 py-1 text-xl select-none"
        @click="changeDuration(i, 5)"
        aria-label="Dauer erhöhen"
      >
        +
      </button>
    </div>
  </div>

  <transition
    enter-active-class="transition ease-out duration-300"
    enter-from-class="translate-x-10"
    enter-to-class="translate-x-0"
    leave-active-class="transition ease-in duration-200"
    leave-from-class="translate-x-0"
    leave-to-class="translate-x-10"
  >
    <button
      v-if="swipedIndex === i"
      class="absolute top-1/2 right-0 -translate-y-1/2 bg-red-600 text-white rounded-l px-4 h-full shadow-lg z-50"
      @click="removeExercise(i)"
      aria-label="Übung löschen"
    >
      Löschen
    </button>
  </transition>
</li>


    </ul>

      <div class="flex flex-col items-center pt-5">
        <button class="btn-small" @click="addExercise">+</button>
        <button class="mt-10 btn bg-black text-white" @click="startWorkout">Training starten</button>
      </div>

    </div>

    <div v-else class="space-y-">
      <h1 class="text-center">{{ exercises[current].name }}</h1>
      <div class="relative w-96 h-96 mx-auto mt-10">
  <!-- Fortschrittsring -->
  <svg
      class="absolute top-0 left-0 w-full h-full -rotate-90"
      viewBox="0 0 100 100"
    >
      <circle
        stroke="currentColor"
        class="text-gray-300"
        :r="radius"
        cx="50"
        cy="50"
        fill="transparent"
        stroke-width="2"
      />
      
      <!-- Workout-Kreis: Schwarz, von voll nach leer -->
      <circle
        v-if="!paused"
        class="text-black transition-all duration-500"
        stroke="currentColor"
        :stroke-dasharray="circumference"
        :stroke-dashoffset="workoutOffset"
        stroke-width="2"
        fill="transparent"
        :r="radius"
        cx="50"
        cy="50"
      />
      
      <!-- Pause-Kreis: Grün, von leer nach voll -->
      <circle
        v-else
        class="text-green-500 transition-all duration-500"
        stroke="currentColor"
        :stroke-dasharray="circumference"
        :stroke-dashoffset="pauseOffset"
        stroke-width="2"
        fill="transparent"
        :r="radius"
        cx="50"
        cy="50"
      />
    </svg>

  <!-- Rundes Bild -->
  <img
    v-if="exercises[current].image"
    :src="exercises[current].image"
    alt="Übung"
    class="rounded-full w-full h-full object-cover"
  />

  <!-- Countdown -->
  <div class="absolute inset-0 flex items-center justify-center">
    <span class="text-5xl font-bold text-black ">{{ timeLeft }}s</span>
  </div>
</div>

      <div class=" pt-10 space-x-2 flex justify-center ">
        <button class="btn" @click="toggleStop">{{ stopped ? 'Fortsetzen' : 'Pause' }}</button>
        <button class="btn" @click="nextExercise">Weiter</button>
      </div>
    </div>
  </div>
</div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';

// Radius für den Kreis (einmal anpassen für alle)
const radius = 49
const circumference = 2 * Math.PI * radius

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


const swipedIndex = ref(null);

let touchStartX = 0;
let touchCurrentX = 0;

function startTouch(event, index) {
  touchStartX = event.touches[0].clientX;
  swipedIndex.value = null; // Reset on new touch
}

function moveTouch(event, index) {
  touchCurrentX = event.touches[0].clientX;
  const diffX = touchCurrentX - touchStartX;

  // Swipe nach links für löschen anzeigen
  if (diffX < -40) {
    swipedIndex.value = index;
  } else if (diffX > 40 && swipedIndex.value === index) {
    // Swipe zurück nach rechts versteckt den Button
    swipedIndex.value = null;
  }
}

function endTouch(index) {
  // Wenn Swipe weniger als 40px -> kein löschen
  // Swipe-Index bleibt, falls genug Swipe nach links
}



function changeDuration(index, amount) {
  let dur = exercises.value[index].duration + amount;
  if (dur < 5) dur = 5;
  exercises.value[index].duration = dur;
}

const exercises = ref([...defaultExercises]);

const current = ref(0);
const running = ref(false);
const paused = ref(false);   // geplante Erholungs-Pause
const stopped = ref(false);  // manuelle Unterbrechung (alles einfrieren)

const timeLeft = ref(0);
const totalTime = ref(0);

const pauseTimeLeft = ref(0);
const pauseTotalTime = ref(0);

let timer = null;

const workoutProgress = computed(() => {
  if (totalTime.value === 0) return 1
  return timeLeft.value / totalTime.value
})
const workoutOffset = computed(() => circumference * (1 - workoutProgress.value))

const pauseProgress = computed(() => {
  if (pauseTotalTime.value === 0) return 0
  return 1 - pauseTimeLeft.value / pauseTotalTime.value
})
const pauseOffset = computed(() => circumference * (1 - pauseProgress.value))

const updateFromPreset = (exercise) => {
  const match = exerciseOptions.find(opt => opt.key === exercise.key);
  if (match) {
    exercise.name = match.name;
    exercise.image = match.image;
  }
}

const startWorkout = () => {
  current.value = 0
  const cur = exercises.value[current.value]
  timeLeft.value = cur.duration
  totalTime.value = cur.duration
  running.value = true
  paused.value = false
  stopped.value = false
}

// NEU: Manuelle Unterbrechung ein/aus (alles anhalten)
const toggleStop = () => {
  stopped.value = !stopped.value
}

// Geplante Pause starten/stoppen (Erholungspause)
const togglePause = () => {
  paused.value = !paused.value
  if (paused.value) {
    pauseTimeLeft.value = timeLeft.value
    pauseTotalTime.value = timeLeft.value
  } else {
    timeLeft.value = pauseTimeLeft.value
  }
}

const nextExercise = () => {
  if (current.value < exercises.value.length - 1) {
    current.value++
    const cur = exercises.value[current.value]
    timeLeft.value = cur.duration
    totalTime.value = cur.duration
    paused.value = cur.key === 'pause'

    if (paused.value) {
      pauseTimeLeft.value = cur.duration
      pauseTotalTime.value = cur.duration
    }
  } else {
    running.value = false
    current.value = 0
  }
}

const addExercise = () => {
  exercises.value.push({ key: '', name: '', duration: 30, image: '' })
}

const removeExercise = (index) => {
  exercises.value.splice(index, 1)
}

onMounted(() => {
  timer = setInterval(() => {
    if (!running.value || stopped.value) return  // wenn manuell gestoppt, nichts tun

    if (paused.value) {
      if (pauseTimeLeft.value > 0) {
        pauseTimeLeft.value--
      } else {
        nextExercise()
      }
    } else {
      if (timeLeft.value > 0) {
        timeLeft.value--
      } else {
        nextExercise()
      }
    }
  }, 1000)
})

onBeforeUnmount(() => {
  clearInterval(timer)
})
</script>



<style scoped>

</style>