<template>
  <div class="flashcard-deck">
    <!-- Header with progress and controls -->
    <div class="deck-header">
      <div class="deck-title-group">
        <span class="deck-badge">
          <FeatherIcon type="layers" :size="13" /> {{ title }}
        </span>
        <span class="deck-progress" v-if="cardList.length > 0">
          <strong>{{ currentIndex + 1 }}</strong> / {{ cardList.length }} từ
        </span>
      </div>

      <div class="deck-actions">
        <button
          class="btn-icon-subtle"
          @click="shuffleCards"
          title="Xáo trộn thẻ"
          :disabled="cardList.length <= 1"
        >
          <FeatherIcon type="shuffle" :size="16" />
        </button>
        <button
          class="btn-icon-subtle"
          @click="resetDeck"
          title="Bắt đầu lại"
        >
          <FeatherIcon type="rotate-ccw" :size="16" />
        </button>
      </div>
    </div>

    <!-- Progress indicator bar -->
    <div class="deck-progress-bar" v-if="cardList.length > 0">
      <div
        class="progress-fill"
        :style="{ width: `${((currentIndex + 1) / cardList.length) * 100}%` }"
      ></div>
    </div>

    <!-- 3D Flip Card Container -->
    <div class="card-scene" v-if="currentWord">
      <div
        class="card-flipper"
        :class="{ 'is-flipped': isFlipped }"
        @click="toggleFlip"
        role="button"
        tabindex="0"
        @keydown.space.prevent="toggleFlip"
        @keydown.enter.prevent="toggleFlip"
      >
        <!-- FRONT: Word, Phonetic, Audio, Flip hint -->
        <div class="card-face card-front">
          <div class="card-face-header">
            <span class="tag-level" v-if="currentWord.level || currentWord.pos">
              {{ currentWord.level || currentWord.pos || 'VOCAB' }}
            </span>
            <span class="flip-hint-top">
              <FeatherIcon type="rotate-cw" :size="12" /> Chạm để xem định nghĩa
            </span>
          </div>

          <div class="card-front-center">
            <h2 class="word-english">{{ currentWord.english }}</h2>
            <p class="word-pronunciation" v-if="currentWord.pronunciation">
              {{ currentWord.pronunciation }}
            </p>

            <!-- Pronunciation audio buttons -->
            <div class="audio-buttons" @click.stop>
              <button
                class="btn-audio-pill uk"
                @click="playUK(currentWord.english)"
                title="Phát âm Anh - Anh (UK)"
              >
                <FeatherIcon type="volume-2" :size="14" />
                <span>UK</span>
              </button>
              <button
                class="btn-audio-pill us"
                @click="playUS(currentWord.english)"
                title="Phát âm Anh - Mỹ (US)"
              >
                <FeatherIcon type="volume-2" :size="14" />
                <span>US</span>
              </button>
            </div>
          </div>

          <div class="card-face-footer">
            <span class="click-to-flip">
              <FeatherIcon type="repeat" :size="14" /> Nhấn thẻ để lật xem nghĩa tiếng Việt & định nghĩa
            </span>
          </div>
        </div>

        <!-- BACK: Definition, Vietnamese meaning, Example -->
        <div class="card-face card-back">
          <div class="card-face-header">
            <span class="tag-meaning">ĐỊNH NGHĨA & NGHĨA TIẾNG VIỆT</span>
            <span class="flip-hint-top">
              <FeatherIcon type="rotate-cw" :size="12" /> Lật lại mặt trước
            </span>
          </div>

          <div class="card-back-content">
            <div class="word-title-mini">
              <span class="en-mini">{{ currentWord.english }}</span>
              <span class="ipa-mini" v-if="currentWord.pronunciation">{{ currentWord.pronunciation }}</span>
            </div>

            <!-- Vietnamese meaning -->
            <div class="definition-block vn-block">
              <span class="block-label">
                <FeatherIcon type="globe" :size="13" /> Nghĩa tiếng Việt:
              </span>
              <h3 class="vietnamese-text">{{ currentWord.vietnamese }}</h3>
            </div>

            <!-- English Definition -->
            <div class="definition-block def-block" v-if="currentWord.meaning">
              <span class="block-label">
                <FeatherIcon type="book-open" :size="13" /> Definition:
              </span>
              <p class="definition-text">{{ currentWord.meaning }}</p>
            </div>

            <!-- Example sentence -->
            <div class="definition-block example-block" v-if="currentWord.example">
              <span class="block-label">
                <FeatherIcon type="edit-3" :size="13" /> Example:
              </span>
              <p class="example-text">"{{ currentWord.example }}"</p>
            </div>
          </div>

          <div class="card-face-footer">
            <span class="click-to-flip">
              <FeatherIcon type="repeat" :size="14" /> Chạm để quay lại mặt trước
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty state if no words -->
    <div v-else class="empty-deck">
      <FeatherIcon type="inbox" :size="32" class="text-muted" />
      <p>Không có thẻ từ vựng nào.</p>
    </div>

    <!-- Navigation Controls (Previous, Flip, Next) -->
    <div class="deck-controls">
      <button
        class="btn btn-secondary btn-nav"
        @click="prevCard"
        :disabled="currentIndex === 0"
        title="Thẻ trước"
      >
        <FeatherIcon type="chevron-left" :size="18" />
        <span>Trước</span>
      </button>

      <button
        class="btn btn-primary btn-flip-cta"
        @click="toggleFlip"
      >
        <FeatherIcon type="rotate-cw" :size="16" />
        <span>{{ isFlipped ? 'Xem từ vựng' : 'Xem định nghĩa' }}</span>
      </button>

      <button
        class="btn btn-secondary btn-nav"
        @click="nextCard"
        :disabled="currentIndex >= cardList.length - 1"
        title="Thẻ tiếp theo"
      >
        <span>Sau</span>
        <FeatherIcon type="chevron-right" :size="18" />
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import FeatherIcon from './FeatherIcon.vue'
import { useAudio } from '../composables/useAudio.js'

const props = defineProps({
  cards: {
    type: Array,
    default: () => []
  },
  title: {
    type: String,
    default: 'Flashcard Từ Vựng'
  },
  initialIndex: {
    type: Number,
    default: 0
  }
})

const emit = defineEmits(['change', 'completed'])

const { playUK, playUS } = useAudio()

// Default fallback sample cards if none passed
const defaultCards = [
  {
    id: 1,
    english: 'Resilient',
    pronunciation: '/rɪˈzɪliənt/',
    vietnamese: 'Kiên cường, có khả năng phục hồi nhanh',
    meaning: 'Able to withstand or recover quickly from difficult conditions.',
    example: 'She is remarkably resilient in the face of difficulties.',
    level: 'B2',
    pos: 'adjective'
  },
  {
    id: 2,
    english: 'Achieve',
    pronunciation: '/əˈtʃiːv/',
    vietnamese: 'Đạt được, hoàn thành mục tiêu',
    meaning: 'Successfully bring about or reach a desired objective by effort.',
    example: 'He worked hard to achieve his dream of speaking fluent English.',
    level: 'A2',
    pos: 'verb'
  },
  {
    id: 3,
    english: 'Accommodate',
    pronunciation: '/əˈkɒmədeɪt/',
    vietnamese: 'Cung cấp chỗ ở, đáp ứng nhu cầu',
    meaning: 'Provide lodging or sufficient space for; fit in with the wishes of.',
    example: 'The hotel can accommodate up to 500 guests comfortably.',
    level: 'B1',
    pos: 'verb'
  },
  {
    id: 4,
    english: 'Diligent',
    pronunciation: '/ˈdɪlɪdʒənt/',
    vietnamese: 'Chăm chỉ, siêng năng, cần mẫn',
    meaning: 'Having or showing care and conscientiousness in one\'s work or duties.',
    example: 'A diligent student will review vocabulary cards every single day.',
    level: 'B2',
    pos: 'adjective'
  },
  {
    id: 5,
    english: 'Comprehensive',
    pronunciation: '/ˌkɒmprɪˈhensɪv/',
    vietnamese: 'Toàn diện, bao quát',
    meaning: 'Including or dealing with all or nearly all elements or aspects of something.',
    example: 'EngLearn provides a comprehensive vocabulary study solution.',
    level: 'B2',
    pos: 'adjective'
  }
]

// Local state tracking current index and flip status
const localCards = ref([])
const currentIndex = ref(props.initialIndex || 0)
const isFlipped = ref(false)

watch(
  () => props.cards,
  (newCards) => {
    if (newCards && newCards.length > 0) {
      localCards.value = [...newCards]
    } else {
      localCards.value = [...defaultCards]
    }
    currentIndex.value = 0
    isFlipped.value = false
  },
  { immediate: true }
)

const cardList = computed(() => {
  return localCards.value.length > 0 ? localCards.value : defaultCards
})

const currentWord = computed(() => {
  return cardList.value[currentIndex.value] || null
})

function toggleFlip() {
  isFlipped.value = !isFlipped.value
}

function nextCard() {
  if (currentIndex.value < cardList.value.length - 1) {
    currentIndex.value++
    isFlipped.value = false
    emit('change', { index: currentIndex.value, word: currentWord.value })
  } else {
    emit('completed')
  }
}

function prevCard() {
  if (currentIndex.value > 0) {
    currentIndex.value--
    isFlipped.value = false
    emit('change', { index: currentIndex.value, word: currentWord.value })
  }
}

function shuffleCards() {
  const shuffled = [...cardList.value]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  localCards.value = shuffled
  currentIndex.value = 0
  isFlipped.value = false
}

function resetDeck() {
  currentIndex.value = 0
  isFlipped.value = false
}

defineExpose({
  currentIndex,
  isFlipped,
  toggleFlip,
  nextCard,
  prevCard,
  resetDeck,
  shuffleCards
})
</script>

<style scoped>
.flashcard-deck {
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
  box-sizing: border-box;
}

/* Header */
.deck-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.65rem;
  gap: 0.5rem;
}

.deck-title-group {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  flex-wrap: wrap;
}

.deck-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.76rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--mint-600);
  background: rgba(21, 183, 158, 0.12);
  padding: 0.2rem 0.6rem;
  border-radius: 9999px;
}

.deck-progress {
  font-size: 0.85rem;
  color: var(--text-muted);
}

.deck-progress strong {
  color: var(--mint-600);
  font-size: 0.95rem;
}

.deck-actions {
  display: flex;
  align-items: center;
  gap: 0.35rem;
}

.btn-icon-subtle {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  border: 1px solid var(--border-color);
  background: var(--card-bg);
  color: var(--text-muted);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-icon-subtle:hover:not(:disabled) {
  color: var(--mint-600);
  border-color: var(--mint-400);
  background: rgba(21, 183, 158, 0.06);
}

.btn-icon-subtle:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Progress bar */
.deck-progress-bar {
  width: 100%;
  height: 6px;
  background: var(--border-color);
  border-radius: 9999px;
  overflow: hidden;
  margin-bottom: 1rem;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--mint-500), #10b981);
  border-radius: 9999px;
  transition: width 0.35s ease;
}

/* 3D Card Scene & Flipper */
.card-scene {
  perspective: 1000px;
  width: 100%;
  min-height: 290px;
  margin-bottom: 1.1rem;
}

.card-flipper {
  position: relative;
  width: 100%;
  min-height: 290px;
  cursor: pointer;
  transform-style: preserve-3d;
  transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  border-radius: var(--radius-xl);
  outline: none;
}

.card-flipper.is-flipped {
  transform: rotateY(180deg);
}

.card-face {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
  border-radius: var(--radius-xl);
  border: 1px solid var(--border-color);
  background: var(--card-bg);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
  padding: 1.25rem 1.4rem;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  box-sizing: border-box;
}

/* Front Styling */
.card-front {
  background: linear-gradient(135deg, var(--card-bg) 60%, rgba(21, 183, 158, 0.06) 100%);
  border-color: rgba(21, 183, 158, 0.3);
}

.card-face-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.5rem;
}

.tag-level {
  font-size: 0.72rem;
  font-weight: 800;
  color: var(--mint-600);
  background: rgba(21, 183, 158, 0.14);
  padding: 0.2rem 0.55rem;
  border-radius: 9999px;
  letter-spacing: 0.04em;
}

.tag-meaning {
  font-size: 0.7rem;
  font-weight: 800;
  color: #3b82f6;
  background: rgba(59, 130, 246, 0.12);
  padding: 0.2rem 0.55rem;
  border-radius: 9999px;
  letter-spacing: 0.04em;
}

.flip-hint-top {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  font-size: 0.74rem;
  color: var(--text-muted);
}

.card-front-center {
  text-align: center;
  padding: 1.25rem 0;
}

.word-english {
  font-size: 2rem;
  font-weight: 800;
  color: var(--text-primary);
  margin: 0 0 0.35rem 0;
  letter-spacing: -0.02em;
}

.word-pronunciation {
  font-size: 1.05rem;
  color: var(--mint-600);
  font-family: monospace, sans-serif;
  margin: 0 0 1rem 0;
}

.audio-buttons {
  display: flex;
  justify-content: center;
  gap: 0.6rem;
}

.btn-audio-pill {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  padding: 0.35rem 0.8rem;
  font-size: 0.8rem;
  font-weight: 700;
  border-radius: 9999px;
  border: 1px solid var(--border-color);
  background: var(--card-bg);
  color: var(--text-primary);
  cursor: pointer;
  transition: all 0.2s;
}

.btn-audio-pill.uk:hover {
  background: rgba(14, 165, 233, 0.12);
  color: #0284c7;
  border-color: #38bdf8;
}

.btn-audio-pill.us:hover {
  background: rgba(239, 68, 68, 0.12);
  color: #dc2626;
  border-color: #f87171;
}

.card-face-footer {
  text-align: center;
  border-top: 1px dashed var(--border-color);
  padding-top: 0.75rem;
}

.click-to-flip {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.78rem;
  color: var(--text-muted);
  font-weight: 500;
}

/* Back Styling */
.card-back {
  transform: rotateY(180deg);
  background: linear-gradient(135deg, var(--card-bg) 60%, rgba(59, 130, 246, 0.05) 100%);
  border-color: rgba(59, 130, 246, 0.3);
}

.card-back-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
  padding: 0.6rem 0;
  overflow-y: auto;
}

.word-title-mini {
  display: flex;
  align-items: baseline;
  gap: 0.5rem;
  border-bottom: 1px solid var(--border-color);
  padding-bottom: 0.35rem;
}

.en-mini {
  font-size: 1.15rem;
  font-weight: 800;
  color: var(--text-primary);
}

.ipa-mini {
  font-size: 0.85rem;
  color: var(--mint-600);
  font-family: monospace;
}

.definition-block {
  text-align: left;
}

.block-label {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  color: var(--text-muted);
  margin-bottom: 0.2rem;
}

.vietnamese-text {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
  line-height: 1.35;
}

.definition-text {
  font-size: 0.85rem;
  color: var(--text-secondary);
  margin: 0;
  line-height: 1.35;
}

.example-text {
  font-size: 0.82rem;
  color: var(--mint-700);
  font-style: italic;
  margin: 0;
  line-height: 1.35;
}

/* Empty deck */
.empty-deck {
  text-align: center;
  padding: 3rem 1rem;
  background: var(--card-bg);
  border-radius: var(--radius-xl);
  border: 1px dashed var(--border-color);
  margin-bottom: 1rem;
}

/* Bottom Controls */
.deck-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.65rem;
}

.btn-nav {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.55rem 0.95rem;
  font-size: 0.85rem;
  font-weight: 600;
  flex: 1;
  justify-content: center;
}

.btn-flip-cta {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.6rem 1.25rem;
  font-size: 0.88rem;
  font-weight: 700;
  flex: 2;
  justify-content: center;
}

@media (max-width: 480px) {
  .card-face {
    padding: 1rem 1.1rem;
  }

  .word-english {
    font-size: 1.65rem;
  }

  .vietnamese-text {
    font-size: 1rem;
  }

  .card-scene {
    min-height: 270px;
  }

  .card-flipper {
    min-height: 270px;
  }
}
</style>
