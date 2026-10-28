<template>
  <div class="grammar-quiz-container">
    <!-- Header with category filters and stats -->
    <div class="quiz-top-bar">
      <div class="quiz-badge-wrap">
        <span class="quiz-badge">
          <FeatherIcon type="check-circle" :size="13" /> Grammar Practice
        </span>
        <span class="quiz-category-tag" v-if="currentCategory !== 'all'">
          {{ getCategoryName(currentCategory) }}
        </span>
      </div>

      <!-- Live score and streak counter -->
      <div class="quiz-live-stats">
        <div class="stat-pill score" title="Số câu đúng">
          <FeatherIcon type="check" :size="14" class="text-emerald" />
          <span>{{ correctCount }}/{{ answeredTotal }}</span>
        </div>
        <div class="stat-pill streak" v-if="currentStreak > 1" title="Chuỗi trả lời đúng liên tiếp">
          <span>🔥 {{ currentStreak }}</span>
        </div>
        <button
          class="btn-sound-toggle"
          @click="isSoundEnabled = !isSoundEnabled"
          :title="isSoundEnabled ? 'Tắt âm thanh' : 'Bật âm thanh'"
        >
          <FeatherIcon :type="isSoundEnabled ? 'volume-2' : 'volume-x'" :size="16" />
        </button>
      </div>
    </div>

    <!-- Category Filter Chips -->
    <div class="category-chips-scroll" v-if="!isQuizFinished">
      <button
        v-for="cat in categories"
        :key="cat.id"
        class="chip-btn"
        :class="{ active: currentCategory === cat.id }"
        @click="filterByCategory(cat.id)"
      >
        {{ cat.name }}
      </button>
    </div>

    <!-- Progress bar -->
    <div class="quiz-progress-track" v-if="!isQuizFinished && activeQuestions.length > 0">
      <div
        class="quiz-progress-fill"
        :style="{ width: `${((currentIndex + 1) / activeQuestions.length) * 100}%` }"
      ></div>
    </div>

    <!-- MAIN QUIZ AREA -->
    <div v-if="!isQuizFinished && currentQuestion" class="quiz-card animate-fadeIn">
      <div class="question-header">
        <span class="question-number">Câu {{ currentIndex + 1 }} / {{ activeQuestions.length }}</span>
        <span class="question-topic-pill">{{ currentQuestion.categoryName }}</span>
      </div>

      <!-- Question sentence with blank -->
      <div class="question-sentence-box">
        <p class="question-sentence" v-html="formattedSentence"></p>
        <p class="question-prompt" v-if="currentQuestion.prompt">
          <FeatherIcon type="info" :size="14" /> {{ currentQuestion.prompt }}
        </p>
      </div>

      <!-- Multiple Choice Options (A, B, C, D) -->
      <div class="options-list">
        <button
          v-for="(option, optIdx) in currentQuestion.options"
          :key="optIdx"
          class="option-item"
          :class="getOptionClass(option)"
          :disabled="hasAnsweredCurrent"
          @click="selectOption(option)"
        >
          <span class="option-letter">{{ getOptionLetter(optIdx) }}</span>
          <span class="option-text">{{ option }}</span>

          <!-- Instant Feedback Icon -->
          <span class="feedback-icon" v-if="hasAnsweredCurrent">
            <FeatherIcon
              v-if="option === currentQuestion.correctAnswer"
              type="check-circle"
              :size="18"
              class="icon-correct"
            />
            <FeatherIcon
              v-else-if="option === selectedOption && option !== currentQuestion.correctAnswer"
              type="x-circle"
              :size="18"
              class="icon-wrong"
            />
          </span>
        </button>
      </div>

      <!-- INSTANT RESULT & EXPLANATION PANEL -->
      <Transition name="slide-fade">
        <div v-if="hasAnsweredCurrent" class="instant-explanation-box" :class="isCorrect ? 'box-correct' : 'box-wrong'">
          <div class="explanation-status-row">
            <div class="status-indicator">
              <span class="status-emoji">{{ isCorrect ? '🎉' : '💡' }}</span>
              <span class="status-title">{{ isCorrect ? 'Chính xác!' : 'Chưa đúng!' }}</span>
            </div>
            <div class="correct-answer-pill" v-if="!isCorrect">
              Đáp án đúng: <strong>{{ currentQuestion.correctAnswer }}</strong>
            </div>
          </div>

          <!-- Grammar Rule structure -->
          <div class="rule-box" v-if="currentQuestion.structure">
            <span class="rule-label">
              <FeatherIcon type="layers" :size="13" /> Cấu trúc áp dụng:
            </span>
            <code class="rule-code">{{ currentQuestion.structure }}</code>
          </div>

          <!-- Explanation description -->
          <div class="explanation-body">
            <p class="explanation-text">{{ currentQuestion.explanation }}</p>
            <div class="translation-row" v-if="currentQuestion.translation">
              <span class="trans-label">Dịch nghĩa:</span>
              <span class="trans-text">"{{ currentQuestion.translation }}"</span>
            </div>
          </div>

          <!-- Action buttons for next question -->
          <div class="explanation-actions">
            <button class="btn btn-primary btn-next-question" @click="nextQuestion">
              <span>{{ isLastQuestion ? 'Xem kết quả tổng kết' : 'Câu tiếp theo' }}</span>
              <FeatherIcon type="arrow-right" :size="16" />
            </button>
          </div>
        </div>
      </Transition>
    </div>

    <!-- QUIZ SUMMARY / RESULTS SCREEN -->
    <div v-else-if="isQuizFinished" class="quiz-results-card card animate-slideUp">
      <div class="result-badge-hero">
        <span class="trophy-emoji">{{ scorePercentage >= 80 ? '🏆' : scorePercentage >= 50 ? '🌟' : '💪' }}</span>
      </div>

      <h2 class="result-title">{{ getResultTitle() }}</h2>
      <p class="result-subtitle">{{ getResultSubtitle() }}</p>

      <!-- Scoreboard -->
      <div class="scoreboard-grid">
        <div class="score-card correct">
          <span class="score-val">{{ correctCount }}</span>
          <span class="score-lbl">Đúng</span>
        </div>
        <div class="score-card wrong">
          <span class="score-val">{{ activeQuestions.length - correctCount }}</span>
          <span class="score-lbl">Sai</span>
        </div>
        <div class="score-card percent">
          <span class="score-val">{{ scorePercentage }}%</span>
          <span class="score-lbl">Độ chính xác</span>
        </div>
        <div class="score-card max-streak">
          <span class="score-val">{{ maxStreak }} 🔥</span>
          <span class="score-lbl">Chuỗi cao nhất</span>
        </div>
      </div>

      <!-- Review List of Questions -->
      <div class="review-questions-section">
        <h3 class="review-title">
          <FeatherIcon type="list" :size="16" /> Xem lại các câu trong bài:
        </h3>
        <div class="review-list">
          <div
            v-for="(item, idx) in questionHistory"
            :key="idx"
            class="review-item"
            :class="item.isCorrect ? 'item-correct' : 'item-wrong'"
          >
            <div class="review-icon">
              <FeatherIcon :type="item.isCorrect ? 'check' : 'x'" :size="14" />
            </div>
            <div class="review-content">
              <p class="review-sentence">{{ item.sentence }}</p>
              <div class="review-meta">
                <span class="your-answer">
                  Bạn chọn: <strong :class="item.isCorrect ? 'text-green' : 'text-red'">{{ item.selected }}</strong>
                </span>
                <span class="correct-ans" v-if="!item.isCorrect">
                  • Đáp án: <strong>{{ item.correct }}</strong>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="results-actions">
        <button class="btn btn-secondary btn-restart" @click="restartQuiz">
          <FeatherIcon type="rotate-ccw" :size="16" /> Làm lại bài này
        </button>
        <button class="btn btn-primary btn-another-cat" @click="resetToAll">
          <FeatherIcon type="shuffle" :size="16" /> Thử các cấu trúc khác
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import FeatherIcon from './FeatherIcon.vue'

const props = defineProps({
  questions: {
    type: Array,
    default: () => []
  },
  initialCategory: {
    type: String,
    default: 'all'
  }
})

const emit = defineEmits(['answered', 'completed', 'restart'])

// Categories for common English structures
const categories = [
  { id: 'all', name: 'Tất cả cấu trúc' },
  { id: 'conditionals', name: 'Câu điều kiện (If)' },
  { id: 'tenses', name: 'Thì động từ' },
  { id: 'passive', name: 'Câu bị động' },
  { id: 'relative', name: 'Mệnh đề quan hệ' },
  { id: 'gerund_infinitive', name: 'To V & V-ing' },
  { id: 'contrast', name: 'Liên từ đối lập' },
  { id: 'wishes', name: 'Câu ước (Wish)' }
]

// Default comprehensive bank of common English structures
const defaultQuestionBank = [
  // 1. Conditionals (Type 2)
  {
    id: 1,
    category: 'conditionals',
    categoryName: 'Câu điều kiện Loại 2',
    sentence: 'If I ______ enough money right now, I would travel around the world.',
    options: ['have', 'had', 'would have', 'will have'],
    correctAnswer: 'had',
    structure: 'If + S + V2/ed, S + would/could + V(bare)',
    explanation: 'Câu điều kiện loại 2 diễn tả một giả định trái ngược với thực tế ở hiện tại (ngay bây giờ tôi không có đủ tiền). Mệnh đề If chia ở Quá khứ đơn (had).',
    translation: 'Nếu bây giờ tôi có đủ tiền, tôi sẽ đi du lịch vòng quanh thế giới.'
  },
  // 2. Conditionals (Type 3)
  {
    id: 2,
    category: 'conditionals',
    categoryName: 'Câu điều kiện Loại 3',
    sentence: 'If she ______ the warning yesterday, she would not have had an accident.',
    options: ['heeded', 'has heeded', 'had heeded', 'would heed'],
    correctAnswer: 'had heeded',
    structure: 'If + S + had + V3/ed, S + would have + V3/ed',
    explanation: 'Câu điều kiện loại 3 diễn tả giả định trái với sự thật trong quá khứ ("yesterday"). Mệnh đề If chia Quá khứ hoàn thành (had + V3/ed: had heeded).',
    translation: 'Nếu ngày hôm qua cô ấy chú ý đến lời cảnh báo, cô ấy đã không gặp tai nạn.'
  },
  // 3. Tenses (Present Perfect vs Past Simple)
  {
    id: 3,
    category: 'tenses',
    categoryName: 'Hiện tại hoàn thành',
    sentence: 'They ______ in this city since 2018 and have made many good friends.',
    options: ['lived', 'have lived', 'are living', 'were living'],
    correctAnswer: 'have lived',
    structure: 'S + have/has + V3/ed + since + mốc thời gian',
    explanation: 'Dấu hiệu "since 2018" biểu thị hành động bắt đầu trong quá khứ kéo dài liên tục đến hiện tại, do đó cần dùng thì Hiện tại hoàn thành (have lived).',
    translation: 'Họ đã sống ở thành phố này từ năm 2018 và đã kết bạn với rất nhiều người tốt.'
  },
  // 4. Passive Voice (Present Perfect Passive)
  {
    id: 4,
    category: 'passive',
    categoryName: 'Câu bị động',
    sentence: 'The urgent report ______ by the marketing team before the meeting started.',
    options: ['had completed', 'had been completed', 'was completing', 'has been completed'],
    correctAnswer: 'had been completed',
    structure: 'S + had been + V3/ed (Quá khứ hoàn thành bị động)',
    explanation: 'Bản báo cáo (The report) là vật tiếp nhận hành động nên phải chia ở thể bị động. Vì hành động hoàn thành trước một thời điểm quá khứ ("before the meeting started") nên dùng Quá khứ hoàn thành bị động.',
    translation: 'Bản báo cáo khẩn đã được nhóm tiếp thị hoàn thành trước khi cuộc họp bắt đầu.'
  },
  // 5. Relative Clauses (Whose)
  {
    id: 5,
    category: 'relative',
    categoryName: 'Mệnh đề quan hệ',
    sentence: 'The talented author ______ latest novel won the international award gave a speech.',
    options: ['who', 'whom', 'whose', 'which'],
    correctAnswer: 'whose',
    structure: 'Noun (người) + whose + Noun (thuộc sở hữu) + V...',
    explanation: '"Whose" là đại từ quan hệ chỉ quyền sở hữu ("latest novel" là cuốn tiểu thuyết mới nhất của tác giả đó).',
    translation: 'Tác giả tài năng có cuốn tiểu thuyết mới nhất đạt giải thưởng quốc tế đã phát biểu.'
  },
  // 6. Gerund & Infinitive (Look forward to)
  {
    id: 6,
    category: 'gerund_infinitive',
    categoryName: 'Danh động từ (Gerund)',
    sentence: 'We are really looking forward to ______ you at the annual tech conference.',
    options: ['see', 'seeing', 'saw', 'have seen'],
    correctAnswer: 'seeing',
    structure: 'look forward to + V-ing (rất mong đợi điều gì)',
    explanation: 'Cấu trúc "look forward to" đi kèm với Danh động từ (V-ing), từ "to" ở đây là giới từ chứ không phải to-infinitive.',
    translation: 'Chúng tôi rất mong đợi được gặp bạn tại hội nghị công nghệ thường niên.'
  },
  // 7. Contrast Conjunctions (Despite vs Although)
  {
    id: 7,
    category: 'contrast',
    categoryName: 'Liên từ chỉ sự đối lập',
    sentence: '______ the heavy rainfall, the outdoor music festival went ahead as scheduled.',
    options: ['Although', 'Despite', 'Even though', 'In spite'],
    correctAnswer: 'Despite',
    structure: 'Despite / In spite of + Noun Phrase (Mặc dù...)',
    explanation: '"The heavy rainfall" là một cụm danh từ (Noun Phrase), nên phải dùng "Despite" hoặc "In spite of". "Although" và "Even though" bắt buộc phải đi với một mệnh đề (S + V).',
    translation: 'Mặc dù trời mưa rất lớn, lễ hội âm nhạc ngoài trời vẫn diễn ra theo đúng lịch trình.'
  },
  // 8. Wishes (Past Wish)
  {
    id: 8,
    category: 'wishes',
    categoryName: 'Câu ước (Wish)',
    sentence: 'I really wish I ______ more time to prepare for the TOEIC exam last month.',
    options: ['have', 'had had', 'have had', 'would have'],
    correctAnswer: 'had had',
    structure: 'S + wish + S + had + V3/ed (Ước cho điều đã xảy ra trong quá khứ)',
    explanation: 'Câu ước cho một sự việc trong quá khứ ("last month") phải lùi thì về Quá khứ hoàn thành (Past Perfect: had had).',
    translation: 'Tôi thực sự ước gì tháng trước mình đã có nhiều thời gian hơn để chuẩn bị cho kỳ thi TOEIC.'
  },
  // 9. Gerund & Infinitive (Avoid)
  {
    id: 9,
    category: 'gerund_infinitive',
    categoryName: 'Động từ đi kèm V-ing',
    sentence: 'You should avoid ______ sweet beverages late at night for better sleep quality.',
    options: ['to drink', 'drinking', 'drank', 'drink'],
    correctAnswer: 'drinking',
    structure: 'avoid + V-ing (tránh làm gì)',
    explanation: 'Động từ "avoid" luôn đi sau bởi một V-ing (danh động từ).',
    translation: 'Bạn nên tránh uống đồ uống có đường vào ban đêm để có giấc ngủ ngon hơn.'
  },
  // 10. Conditionals (Type 1)
  {
    id: 10,
    category: 'conditionals',
    categoryName: 'Câu điều kiện Loại 1',
    sentence: 'Unless you ______ regularly, your English speaking skills will not improve quickly.',
    options: ['practice', 'don\'t practice', 'practiced', 'will practice'],
    correctAnswer: 'practice',
    structure: 'Unless (= If not) + S + V(hiện tại đơn), S + will + V',
    explanation: '"Unless" vốn đã mang nghĩa phủ định ("Nếu bạn không..."), do đó mệnh đề đi sau Unless phải ở thể khẳng định: "Unless you practice...".',
    translation: 'Nếu bạn không luyện tập thường xuyên, kỹ năng nói tiếng Anh của bạn sẽ không thể tiến bộ nhanh được.'
  }
]

// State
const currentCategory = ref(props.initialCategory || 'all')
const currentIndex = ref(0)
const selectedOption = ref(null)
const hasAnsweredCurrent = ref(false)
const correctCount = ref(0)
const currentStreak = ref(0)
const maxStreak = ref(0)
const isQuizFinished = ref(false)
const isSoundEnabled = ref(true)
const questionHistory = ref([])

// Question pool based on selected category
const allQuestions = computed(() => {
  return props.questions && props.questions.length > 0 ? props.questions : defaultQuestionBank
})

const activeQuestions = computed(() => {
  if (currentCategory.value === 'all') {
    return allQuestions.value
  }
  return allQuestions.value.filter(q => q.category === currentCategory.value)
})

const currentQuestion = computed(() => {
  return activeQuestions.value[currentIndex.value] || null
})

const isCorrect = computed(() => {
  if (!currentQuestion.value || !selectedOption.value) return false
  return selectedOption.value === currentQuestion.value.correctAnswer
})

const isLastQuestion = computed(() => {
  return currentIndex.value >= activeQuestions.value.length - 1
})

const answeredTotal = computed(() => {
  return questionHistory.value.length
})

const scorePercentage = computed(() => {
  if (activeQuestions.value.length === 0) return 0
  return Math.round((correctCount.value / activeQuestions.value.length) * 100)
})

const formattedSentence = computed(() => {
  if (!currentQuestion.value) return ''
  const s = currentQuestion.value.sentence
  if (!hasAnsweredCurrent.value) {
    return s.replace('______', '<span class="blank-highlight">______</span>')
  }
  // If answered, fill in the blank with selected option
  const fillClass = isCorrect.value ? 'filled-correct' : 'filled-wrong'
  return s.replace('______', `<span class="filled-blank ${fillClass}">${selectedOption.value}</span>`)
})

function getCategoryName(catId) {
  const c = categories.find(x => x.id === catId)
  return c ? c.name : 'Cấu trúc ngữ pháp'
}

function getOptionLetter(idx) {
  return ['A', 'B', 'C', 'D'][idx] || ''
}

function getOptionClass(option) {
  if (!hasAnsweredCurrent.value) {
    return selectedOption.value === option ? 'selected-preview' : ''
  }
  if (option === currentQuestion.value.correctAnswer) {
    return 'option-correct'
  }
  if (option === selectedOption.value && option !== currentQuestion.value.correctAnswer) {
    return 'option-wrong'
  }
  return 'option-dimmed'
}

function playAudioChime(correct) {
  if (!isSoundEnabled.value) return
  try {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)()
    const osc = audioCtx.createOscillator()
    const gain = audioCtx.createGain()
    osc.connect(gain)
    gain.connect(audioCtx.destination)

    if (correct) {
      // Pleasant high double ping
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime) // D5
      osc.frequency.setValueAtTime(880, audioCtx.currentTime + 0.1) // A5
      gain.gain.setValueAtTime(0.12, audioCtx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.35)
      osc.start(audioCtx.currentTime)
      osc.stop(audioCtx.currentTime + 0.35)
    } else {
      // Gentle low buzz
      osc.frequency.setValueAtTime(220, audioCtx.currentTime)
      gain.gain.setValueAtTime(0.15, audioCtx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.25)
      osc.start(audioCtx.currentTime)
      osc.stop(audioCtx.currentTime + 0.25)
    }
  } catch (e) {
    // Audio synthesis not available or blocked by browser policy
  }
}

function selectOption(option) {
  if (hasAnsweredCurrent.value) return

  selectedOption.value = option
  hasAnsweredCurrent.value = true

  const correct = option === currentQuestion.value.correctAnswer
  if (correct) {
    correctCount.value++
    currentStreak.value++
    if (currentStreak.value > maxStreak.value) {
      maxStreak.value = currentStreak.value
    }
  } else {
    currentStreak.value = 0
  }

  playAudioChime(correct)

  // Record history
  questionHistory.value.push({
    sentence: currentQuestion.value.sentence,
    selected: option,
    correct: currentQuestion.value.correctAnswer,
    isCorrect: correct
  })

  emit('answered', {
    questionId: currentQuestion.value.id,
    selectedOption: option,
    isCorrect: correct,
    question: currentQuestion.value
  })
}

function nextQuestion() {
  if (isLastQuestion.value) {
    isQuizFinished.value = true
    emit('completed', {
      score: correctCount.value,
      total: activeQuestions.value.length,
      percentage: scorePercentage.value
    })
  } else {
    currentIndex.value++
    selectedOption.value = null
    hasAnsweredCurrent.value = false
  }
}

function filterByCategory(catId) {
  currentCategory.value = catId
  restartQuiz()
}

function restartQuiz() {
  currentIndex.value = 0
  selectedOption.value = null
  hasAnsweredCurrent.value = false
  correctCount.value = 0
  currentStreak.value = 0
  isQuizFinished.value = false
  questionHistory.value = []
  emit('restart')
}

function resetToAll() {
  currentCategory.value = 'all'
  restartQuiz()
}

function getResultTitle() {
  const p = scorePercentage.value
  if (p === 100) return 'Xuất Sắc Tuyệt Đối!'
  if (p >= 80) return 'Làm Tốt Lắm!'
  if (p >= 60) return 'Khá Tốt!'
  return 'Cần Ôn Luyện Thêm'
}

function getResultSubtitle() {
  const p = scorePercentage.value
  if (p >= 80) return 'Bạn nắm rất vững các cấu trúc ngữ pháp thông dụng này.'
  if (p >= 60) return 'Bạn đã hiểu hầu hết cấu trúc, chỉ cần chú ý một vài bẫy nhỏ.'
  return 'Hãy xem lại phần giải thích bên dưới để củng cố các cấu trúc chưa nhớ nhé.'
}
</script>

<style scoped>
.grammar-quiz-container {
  width: 100%;
  max-width: 680px;
  margin: 0 auto;
  box-sizing: border-box;
}

/* TOP BAR */
.quiz-top-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.85rem;
  gap: 0.5rem;
}

.quiz-badge-wrap {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  flex-wrap: wrap;
}

.quiz-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.74rem;
  font-weight: 700;
  text-transform: uppercase;
  color: #8b5cf6;
  background: rgba(139, 92, 246, 0.12);
  padding: 0.2rem 0.55rem;
  border-radius: 9999px;
  letter-spacing: 0.04em;
}

.quiz-category-tag {
  font-size: 0.74rem;
  font-weight: 600;
  color: var(--text-muted);
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  padding: 0.15rem 0.5rem;
  border-radius: 9999px;
}

.quiz-live-stats {
  display: flex;
  align-items: center;
  gap: 0.45rem;
}

.stat-pill {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  font-size: 0.78rem;
  font-weight: 700;
  padding: 0.2rem 0.55rem;
  border-radius: 9999px;
  background: var(--card-bg);
  border: 1px solid var(--border-color);
}

.stat-pill.score {
  color: var(--text-primary);
}

.stat-pill.streak {
  color: #f97316;
  background: rgba(249, 115, 22, 0.12);
  border-color: rgba(249, 115, 22, 0.3);
}

.btn-sound-toggle {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  border: 1px solid var(--border-color);
  background: var(--card-bg);
  color: var(--text-muted);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-sound-toggle:hover {
  color: var(--text-primary);
  border-color: var(--mint-400);
}

/* Category Filter Chips */
.category-chips-scroll {
  display: flex;
  gap: 0.45rem;
  overflow-x: auto;
  padding-bottom: 0.5rem;
  margin-bottom: 0.75rem;
  scrollbar-width: none;
}

.category-chips-scroll::-webkit-scrollbar {
  display: none;
}

.chip-btn {
  font-size: 0.76rem;
  font-weight: 600;
  padding: 0.3rem 0.75rem;
  border-radius: 9999px;
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  color: var(--text-muted);
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s;
  flex-shrink: 0;
}

.chip-btn:hover {
  color: var(--text-primary);
  border-color: #8b5cf6;
}

.chip-btn.active {
  background: #8b5cf6;
  color: white;
  border-color: #8b5cf6;
  box-shadow: 0 2px 8px rgba(139, 92, 246, 0.25);
}

/* Progress bar */
.quiz-progress-track {
  width: 100%;
  height: 6px;
  background: var(--border-color);
  border-radius: 9999px;
  overflow: hidden;
  margin-bottom: 1.15rem;
}

.quiz-progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #8b5cf6, var(--mint-500));
  border-radius: 9999px;
  transition: width 0.3s ease;
}

/* MAIN QUIZ CARD */
.quiz-card {
  background: var(--card-bg);
  border-radius: var(--radius-xl);
  border: 1px solid var(--border-color);
  padding: 1.4rem 1.5rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
}

.question-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.question-number {
  font-size: 0.82rem;
  font-weight: 800;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.question-topic-pill {
  font-size: 0.72rem;
  font-weight: 700;
  color: #8b5cf6;
  background: rgba(139, 92, 246, 0.1);
  padding: 0.15rem 0.55rem;
  border-radius: 9999px;
}

/* Sentence with blank */
.question-sentence-box {
  background: linear-gradient(135deg, rgba(139, 92, 246, 0.04) 0%, rgba(21, 183, 158, 0.04) 100%);
  border: 1px dashed rgba(139, 92, 246, 0.25);
  border-radius: 14px;
  padding: 1.25rem 1.35rem;
  margin-bottom: 1.25rem;
}

.question-sentence {
  font-size: 1.2rem;
  font-weight: 600;
  color: var(--text-primary);
  line-height: 1.5;
  margin: 0;
}

:deep(.blank-highlight) {
  display: inline-block;
  min-width: 70px;
  border-bottom: 2.5px solid #8b5cf6;
  color: #8b5cf6;
  font-weight: 700;
  text-align: center;
  margin: 0 4px;
}

:deep(.filled-blank) {
  display: inline-block;
  padding: 0.1rem 0.5rem;
  border-radius: 6px;
  font-weight: 800;
  margin: 0 4px;
}

:deep(.filled-correct) {
  background: #dcfce7;
  color: #15803d;
  border: 1px solid #86efac;
}

:deep(.filled-wrong) {
  background: #fee2e2;
  color: #b91c1c;
  border: 1px solid #fca5a5;
  text-decoration: line-through;
}

.question-prompt {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.78rem;
  color: var(--text-muted);
  margin: 0.65rem 0 0 0;
}

/* Multiple choice options */
.options-list {
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
  margin-bottom: 1.25rem;
}

.option-item {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  background: var(--card-bg);
  border: 1.5px solid var(--border-color);
  border-radius: 14px;
  padding: 0.85rem 1.15rem;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: left;
  position: relative;
  width: 100%;
}

.option-item:hover:not(:disabled) {
  border-color: #8b5cf6;
  background: rgba(139, 92, 246, 0.04);
  transform: translateY(-1px);
}

.option-letter {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: rgba(0, 0, 0, 0.04);
  color: var(--text-muted);
  font-size: 0.85rem;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all 0.2s;
}

[data-theme="dark"] .option-letter {
  background: rgba(255, 255, 255, 0.06);
}

.option-text {
  flex: 1;
  font-size: 0.98rem;
  font-weight: 600;
  color: var(--text-primary);
}

.feedback-icon {
  flex-shrink: 0;
  display: flex;
  align-items: center;
}

.icon-correct {
  color: #10b981;
}

.icon-wrong {
  color: #ef4444;
}

/* Feedback states */
.option-correct {
  border-color: #10b981 !important;
  background: rgba(16, 185, 129, 0.08) !important;
}

.option-correct .option-letter {
  background: #10b981;
  color: white;
}

.option-correct .option-text {
  color: #047857;
  font-weight: 700;
}

.option-wrong {
  border-color: #ef4444 !important;
  background: rgba(239, 68, 68, 0.08) !important;
}

.option-wrong .option-letter {
  background: #ef4444;
  color: white;
}

.option-wrong .option-text {
  color: #b91c1c;
  font-weight: 700;
}

.option-dimmed {
  opacity: 0.55;
  cursor: default;
}

/* INSTANT EXPLANATION BOX */
.instant-explanation-box {
  border-radius: 16px;
  padding: 1.15rem 1.25rem;
  margin-top: 1rem;
  animation: slideUp 0.25s ease-out;
}

.box-correct {
  background: rgba(16, 185, 129, 0.08);
  border: 1.5px solid rgba(16, 185, 129, 0.3);
}

.box-wrong {
  background: rgba(249, 115, 22, 0.08);
  border: 1.5px solid rgba(249, 115, 22, 0.3);
}

.explanation-status-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.85rem;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.status-indicator {
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.status-emoji {
  font-size: 1.25rem;
}

.status-title {
  font-size: 1.05rem;
  font-weight: 800;
  color: var(--text-primary);
}

.correct-answer-pill {
  font-size: 0.82rem;
  color: #b91c1c;
  background: #fee2e2;
  padding: 0.25rem 0.65rem;
  border-radius: 9999px;
}

.rule-box {
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: 10px;
  padding: 0.65rem 0.85rem;
  margin-bottom: 0.75rem;
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}

.rule-label {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  color: #8b5cf6;
}

.rule-code {
  font-family: monospace;
  font-size: 0.86rem;
  font-weight: 700;
  color: var(--text-primary);
  background: none;
  padding: 0;
}

.explanation-body {
  font-size: 0.88rem;
  line-height: 1.45;
  color: var(--text-secondary);
  margin-bottom: 1rem;
}

.explanation-text {
  margin: 0 0 0.5rem 0;
}

.translation-row {
  font-style: italic;
  font-size: 0.84rem;
  color: var(--text-muted);
}

.trans-label {
  font-weight: 700;
  margin-right: 0.3rem;
}

.explanation-actions {
  display: flex;
  justify-content: flex-end;
}

.btn-next-question {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  padding: 0.65rem 1.25rem;
  font-weight: 700;
  border-radius: 9999px;
  background: linear-gradient(90deg, #7c3aed, #8b5cf6);
  border: none;
  color: white;
  cursor: pointer;
  box-shadow: 0 4px 14px rgba(124, 58, 237, 0.25);
  transition: all 0.2s;
}

.btn-next-question:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 18px rgba(124, 58, 237, 0.35);
}

/* RESULTS SCREEN */
.quiz-results-card {
  text-align: center;
  padding: 2.25rem 1.5rem;
}

.result-badge-hero {
  margin-bottom: 0.75rem;
}

.trophy-emoji {
  font-size: 3.5rem;
  display: inline-block;
  animation: bounce 1s infinite alternate;
}

@keyframes bounce {
  from { transform: translateY(0); }
  to { transform: translateY(-8px); }
}

.result-title {
  font-size: 1.6rem;
  font-weight: 800;
  color: var(--text-primary);
  margin: 0 0 0.35rem 0;
}

.result-subtitle {
  font-size: 0.92rem;
  color: var(--text-muted);
  max-width: 480px;
  margin: 0 auto 1.5rem;
}

.scoreboard-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.75rem;
  margin-bottom: 1.75rem;
}

.score-card {
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: 14px;
  padding: 0.85rem 0.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.score-val {
  font-size: 1.45rem;
  font-weight: 800;
  margin-bottom: 0.15rem;
}

.score-lbl {
  font-size: 0.72rem;
  color: var(--text-muted);
  text-transform: uppercase;
  font-weight: 700;
}

.score-card.correct .score-val { color: #10b981; }
.score-card.wrong .score-val { color: #ef4444; }
.score-card.percent .score-val { color: #8b5cf6; }
.score-card.max-streak .score-val { color: #f97316; }

/* Review section */
.review-questions-section {
  text-align: left;
  border-top: 1px solid var(--border-color);
  padding-top: 1.25rem;
  margin-bottom: 1.5rem;
}

.review-title {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 0.85rem;
}

.review-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  max-height: 260px;
  overflow-y: auto;
  padding-right: 4px;
}

.review-item {
  display: flex;
  align-items: flex-start;
  gap: 0.65rem;
  padding: 0.65rem 0.85rem;
  border-radius: 12px;
  background: var(--card-bg);
  border: 1px solid var(--border-color);
}

.review-icon {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  margin-top: 2px;
}

.item-correct .review-icon {
  background: #dcfce7;
  color: #15803d;
}

.item-wrong .review-icon {
  background: #fee2e2;
  color: #b91c1c;
}

.review-content {
  flex: 1;
  min-width: 0;
}

.review-sentence {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 0.2rem 0;
}

.review-meta {
  font-size: 0.76rem;
  color: var(--text-muted);
}

.text-green { color: #15803d; }
.text-red { color: #b91c1c; }

/* Results CTA buttons */
.results-actions {
  display: flex;
  gap: 0.75rem;
  justify-content: center;
}

.btn-restart {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.7rem 1.25rem;
  font-weight: 700;
  border-radius: 9999px;
}

.btn-another-cat {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.7rem 1.35rem;
  font-weight: 700;
  border-radius: 9999px;
  background: linear-gradient(90deg, #7c3aed, #8b5cf6);
  color: white;
  border: none;
}

@media (max-width: 600px) {
  .quiz-card {
    padding: 1.15rem 1rem;
  }

  .question-sentence {
    font-size: 1.05rem;
  }

  .option-item {
    padding: 0.75rem 0.95rem;
    gap: 0.65rem;
  }

  .scoreboard-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .results-actions {
    flex-direction: column;
  }

  .btn-restart,
  .btn-another-cat {
    width: 100%;
    justify-content: center;
  }
}
</style>
