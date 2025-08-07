<template>
  <div
    class="p-6 max-w-full md:max-w-xl mx-auto flex flex-col overflow-x-hidden"
  >
    <div class="pt-20">
      <div v-if="!running">
        <h1>Konfiguration</h1>
        <div class="pt-10" />

        <SlickList
          v-model:list="exercises"
          class="space-y-4"
          :use-drag-handle="true"
          lock-axis="y"
          @sort-end="onSortEnd"
        >
          <SlickItem
            v-for="(ex, index) in exercises"
            :key="`item-${ex.key}-${index}`"
            :index="index"
            class="relative overflow-hidden rounded border bg-white shadow-sm"
          >
            <div
              class="flex flex-wrap md:flex-nowrap items-center gap-4 p-4 transition-transform duration-200 ease-out touch-manipulation"
              :style="{
                transform: swipeStates[index]
                  ? `translateX(${swipeStates[index].translateX}px)`
                  : 'translateX(0)',
              }"
              @touchstart="onSwipeStart($event, index)"
              @touchmove="onSwipeMove($event, index)"
              @touchend="onSwipeEnd($event, index)"
            >
              <!-- Drag Handle -->
              <DragHandle class="cursor-move touch-none mr-2">
                <svg
                  class="w-5 h-5 text-gray-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z"
                  ></path>
                </svg>
              </DragHandle>

              <select
                v-model="ex.key"
                class="flex-1 border rounded px-3 py-2 text-base min-w-[150px]"
                @change="updateFromPreset(ex)"
              >
                <option disabled value="">Übung wählen</option>
                <option
                  v-for="option in exerciseOptions"
                  :key="option.key"
                  :value="option.key"
                >
                  {{ option.name }}
                </option>
              </select>

              <div class="flex items-center space-x-2">
                <button
                  type="button"
                  class="bg-gray-200 rounded px-3 py-1 text-xl select-none touch-manipulation"
                  aria-label="Dauer verringern"
                  @click="changeDuration(index, -5)"
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
                  class="bg-gray-200 rounded px-3 py-1 text-xl select-none touch-manipulation"
                  aria-label="Dauer erhöhen"
                  @click="changeDuration(index, 5)"
                >
                  +
                </button>
              </div>
            </div>

            <!-- Delete overlay - appears when swiping left -->
            <div
              v-if="swipeStates[index] && swipeStates[index].translateX < -50"
              class="absolute inset-0 bg-red-500 flex items-center justify-end pr-8"
            >
              <span class="text-white font-bold text-lg">🗑️ Löschen</span>
            </div>

            <!-- Delete button entfernt - jetzt immer sichtbar -->
          </SlickItem>
        </SlickList>

        <div class="flex flex-col items-center pt-5">
          <button class="btn-small touch-manipulation" @click="addExercise">
            +
          </button>
          <button
            class="mt-10 btn bg-black text-white touch-manipulation"
            @click="startWorkout"
          >
            Training starten
          </button>
        </div>
      </div>

      <!-- Trainingsanzeige -->
      <div v-else class="flex flex-col items-center pt-10">
        
        <div class="text-center">
          <h2 class="text-4xl font-bold">
            {{ exercises[current].name }}
          </h2>
        </div>
        <div class="text-xl font-semibol pt-3">{{ timeLeft }}s</div>
        <div class="relative aspect-square w-full mt-12">
          <svg
            class="transform -rotate-90"
            width="100%"
            height="100%"
            viewBox="0 0 120 120"
          >
            <circle
              cx="60"
              cy="60"
              :r="radius"
              stroke="#e5e7eb"
              stroke-width="10"
              fill="transparent"
            />
            <circle
              cx="60"
              cy="60"
              :r="radius"
              stroke="currentColor"
              stroke-width="10"
              fill="transparent"
              :stroke-dasharray="circumference"
              :stroke-dashoffset="workoutOffset"
              :class="
                exercises[current].key === 'pause'
                  ? 'text-green-500'
                  : 'text-gray-900'
              "
              class="transition-all duration-500"
            />
          </svg>

          <!-- Bild im Kreis -->
          <div class="absolute inset-0 flex items-center justify-center p-4">
            <img
              v-if="exercises[current].image"
              :src="exercises[current].image"
              class="w-full h-full object-contain rounded-full"
              alt="Exercise image"
            />
          </div>
        </div>

        <div class="flex space-x-4 pt-12">
          <button class="btn touch-manipulation" @click="toggleStop">
            {{ stopped ? 'Weiter' : 'Stoppen' }}
          </button>
          <button
            class="btn bg-red-500 text-white touch-manipulation"
            @click="endWorkout"
          >
            Beenden
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
  import { ref, computed, onMounted } from 'vue';
  import { SlickList, SlickItem, DragHandle } from 'vue-slicksort';

  const radius = 54;
  const circumference = 2 * Math.PI * radius;

  const exerciseOptions = [
    { key: 'burpees', name: 'Burpees', image: '/images/exercises/burpees.gif' },
    {
      key: 'jump_squats',
      name: 'Jump Squats',
      image: '/images/exercises/jump_squats.gif',
    },
    {
      key: 'plank_hold',
      name: 'Plank Hold',
      image: '/images/exercises/plank_hold.gif',
    },
    {
      key: 'mountain_climbers',
      name: 'Mountain Climbers',
      image: '/images/exercises/mountain_climbers.gif',
    },
    {
      key: 'high_knees',
      name: 'High Knees',
      image: '/images/exercises/high_knees.gif',
    },
    {
      key: 'pushups',
      name: 'Push-ups',
      image: '/images/exercises/pushups.gif',
    },
    {
      key: 'skater_jumps',
      name: 'Skater Jumps',
      image: '/images/exercises/skater_jumps.gif',
    },
    { key: 'lunges', name: 'Lunges', image: '/images/exercises/lunges.gif' },
    { key: 'situps', name: 'Sit-ups', image: '/images/exercises/situps.gif' },
    {
      key: 'jumping_jacks',
      name: 'Jumping Jacks',
      image: '/images/exercises/jumping_jacks.gif',
    },
    { key: 'pause', name: 'Pause', image: '' },
  ];

  const defaultExercises = [
    {
      key: 'burpees',
      name: 'Burpees',
      duration: 60,
      image: '/images/exercises/burpees.gif',
    },
    {
      key: 'jump_squats',
      name: 'Jump Squats',
      duration: 60,
      image: '/images/exercises/jump_squats.gif',
    },
    {
      key: 'plank_hold',
      name: 'Plank Hold',
      duration: 60,
      image: '/images/exercises/plank_hold.gif',
    },
    {
      key: 'mountain_climbers',
      name: 'Mountain Climbers',
      duration: 60,
      image: '/images/exercises/mountain_climbers.gif',
    },
    { key: 'pause', name: 'Pause', duration: 30, image: '' },
  ];

  const exercises = ref([...defaultExercises]);
  const swipeStates = ref({});

  const current = ref(0);
  const running = ref(false);
  const paused = ref(false);
  const stopped = ref(false);

  const timeLeft = ref(0);
  const totalTime = ref(0);

  // Swipe state für Delete-Funktion
  const swipeThreshold = 120; // Pixel threshold für Delete

  let timer = null;

  const workoutProgress = computed(() => {
    if (totalTime.value === 0) return 1;

    const progress = timeLeft.value / totalTime.value;

    // Bei Pause: Ring füllt sich (von leer zu voll)
    // Bei Übungen: Ring leert sich (von voll zu leer)
    if (exercises.value[current.value]?.key === 'pause') {
      return 1 - progress; // Invertiert für "Auffüllen"-Effekt
    } else {
      return progress; // Normal für "Leeren"-Effekt
    }
  });
  const workoutOffset = computed(
    () => circumference * (1 - workoutProgress.value)
  );

  function changeDuration(index, amount) {
    let dur = exercises.value[index].duration + amount;
    if (dur < 5) dur = 5;
    exercises.value[index].duration = dur;
  }

  function updateFromPreset(exercise) {
    const match = exerciseOptions.find((opt) => opt.key === exercise.key);
    if (match) {
      exercise.name = match.name;
      exercise.image = match.image;
    }
  }

  function addExercise() {
    exercises.value.push({ key: '', name: '', duration: 30, image: '' });
  }

  function removeExercise(index) {
    exercises.value.splice(index, 1);
    // Clear swipe state for this item
    delete swipeStates.value[index];
    // Reindex swipe states
    const newSwipeStates = {};
    Object.keys(swipeStates.value).forEach((key) => {
      const keyIndex = parseInt(key);
      if (keyIndex < index) {
        newSwipeStates[keyIndex] = swipeStates.value[key];
      } else if (keyIndex > index) {
        newSwipeStates[keyIndex - 1] = swipeStates.value[key];
      }
    });
    swipeStates.value = newSwipeStates;
  }

  function onSortEnd(event) {
    // Vue Slicksort handelt das Sorting automatisch über v-model:list
    // Clear all swipe states after sorting
    swipeStates.value = {};
    console.log('Sorted:', event);
  }

  // Swipe-to-delete functionality
  function onSwipeStart(event, index) {
    const touch = event.touches[0];
    if (!swipeStates.value[index]) {
      swipeStates.value[index] = {};
    }
    swipeStates.value[index].startX = touch.clientX;
    swipeStates.value[index].startY = touch.clientY;
    swipeStates.value[index].translateX = 0;
    swipeStates.value[index].isDragging = false;
  }

  function onSwipeMove(event, index) {
    if (!swipeStates.value[index]) return;

    const touch = event.touches[0];
    const deltaX = touch.clientX - swipeStates.value[index].startX;
    const deltaY = Math.abs(touch.clientY - swipeStates.value[index].startY);

    // Only swipe left, and only if not dragging vertically (for sort)
    if (deltaX < 0 && deltaY < 30) {
      event.preventDefault(); // Prevent scrolling and dragging
      swipeStates.value[index].isDragging = true;
      // Limit swipe distance
      swipeStates.value[index].translateX = Math.max(deltaX, -200);
    } else if (deltaY > 30) {
      // If vertical movement is detected, reset swipe
      swipeStates.value[index].translateX = 0;
      swipeStates.value[index].isDragging = false;
    }
  }

  function onSwipeEnd(event, index) {
    if (!swipeStates.value[index]) return;

    const translateX = swipeStates.value[index].translateX;

    if (translateX < -swipeThreshold) {
      // Delete the item with animation
      if (navigator.vibrate) {
        navigator.vibrate(50);
      }
      removeExercise(index);
    } else {
      // Snap back
      swipeStates.value[index].translateX = 0;
    }

    swipeStates.value[index].isDragging = false;
  }

  function startWorkout() {
    current.value = 0;
    const cur = exercises.value[current.value];
    timeLeft.value = cur.duration;
    totalTime.value = cur.duration;
    running.value = true;
    paused.value = cur.key === 'pause';
    stopped.value = false;

    // Start the timer
    startTimer();
  }

  function startTimer() {
    if (timer) {
      clearInterval(timer);
    }

    timer = setInterval(() => {
      if (!paused.value && !stopped.value && running.value) {
        timeLeft.value--;

        if (timeLeft.value <= 0) {
          // Move to next exercise
          nextExercise();
        }
      }
    }, 1000);
  }

  function nextExercise() {
    current.value++;

    if (current.value >= exercises.value.length) {
      // Workout finished
      finishWorkout();
    } else {
      // Start next exercise
      const cur = exercises.value[current.value];
      timeLeft.value = cur.duration;
      totalTime.value = cur.duration;
    }
  }

  function finishWorkout() {
    running.value = false;
    if (timer) {
      clearInterval(timer);
      timer = null;
    }
    // Optional: Show completion message
    alert('🎉 Training beendet! Gut gemacht!');
  }

  function endWorkout() {
    running.value = false;
    if (timer) {
      clearInterval(timer);
      timer = null;
    }
  }

  function toggleStop() {
    stopped.value = !stopped.value;

    if (stopped.value) {
      // Paused completely
      if (timer) {
        clearInterval(timer);
        timer = null;
      }
    } else {
      // Resume
      startTimer();
    }
  }

  // Reset swipe states when clicking elsewhere
  onMounted(() => {
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.slick-item')) {
        // Reset all swipe states
        Object.keys(swipeStates.value).forEach((key) => {
          swipeStates.value[key].translateX = 0;
        });
      }
    });
  });

  // Cleanup timer when component unmounts
  onBeforeUnmount(() => {
    if (timer) {
      clearInterval(timer);
      timer = null;
    }
  });
</script>

<style scoped>
  .touch-manipulation {
    touch-action: manipulation;
  }

  /* Vue Slicksort Styles */
  .slick-list {
    position: relative;
  }

  .slick-item {
    position: relative;
    z-index: 1;
    transition: transform 200ms ease;
  }

  .slick-item.slick-sorting {
    z-index: 9999;
    transform: scale(1.02);
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  }

  .slick-ghost {
    opacity: 0.4;
  }
</style>
