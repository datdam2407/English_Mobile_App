<template>
  <Transition name="onboard-fade">
    <div v-if="isOpen" class="onboard-backdrop">
      <div class="onboard-container card animate-slideUp">
        <!-- Progress Steps Indicator -->
        <div class="onboard-top">
          <div class="steps-indicator">
            <div class="step-dot" :class="{ active: currentStep >= 1 }"></div>
            <div class="step-line" :class="{ active: currentStep >= 2 }"></div>
            <div class="step-dot" :class="{ active: currentStep >= 2 }"></div>
            <div class="step-line" :class="{ active: currentStep >= 3 }"></div>
            <div class="step-dot" :class="{ active: currentStep >= 3 }"></div>
          </div>
          <button class="btn-skip" @click="completeOnboarding" title="Bỏ qua thiết lập">
            Bỏ qua
          </button>
        </div>

        <!-- MÀN 1: CHÀO MỪNG -->
        <div v-if="currentStep === 1" class="step-content">
          <div class="step-icon-hero">
            <div class="icon-circle">
              <FeatherIcon type="compass" :size="44" />
            </div>
          </div>
          <span class="step-badge">EngLearn Experience</span>
          <h1 class="step-title">Học Từ Vựng & Phát Âm Chuẩn Quốc Tế</h1>
          <p class="step-desc">
            Nắm vững 3000 từ vựng cốt lõi Oxford & 600 từ TOEIC thiết yếu, kết hợp phương pháp lặp lại ngắt quãng (SRS) và luyện nói AI.
          </p>

          <div class="benefits-list">
            <div class="benefit-item">
              <div class="benefit-icon"><FeatherIcon type="volume-2" :size="18" /></div>
              <span>Phát âm chuẩn cả giọng Anh - Anh (UK) & Anh - Mỹ (US)</span>
            </div>
            <div class="benefit-item">
              <div class="benefit-icon"><FeatherIcon type="clock" :size="18" /></div>
              <span>Thuật toán SRS nhắc ôn đúng thời điểm sắp quên</span>
            </div>
            <div class="benefit-item">
              <div class="benefit-icon"><FeatherIcon type="check-circle" :size="18" /></div>
              <span>Học miễn phí ngay - Không bắt buộc đăng ký tài khoản</span>
            </div>
          </div>

          <div class="step-actions">
            <button class="btn btn-primary btn-full-cta" @click="currentStep = 2">
              <span>Bắt đầu thiết lập lộ trình</span>
              <FeatherIcon type="arrow-right" :size="18" />
            </button>
          </div>
        </div>

        <!-- MÀN 2: CHỌN TRÌNH ĐỘ -->
        <div v-else-if="currentStep === 2" class="step-content">
          <span class="step-badge">Bước 1 / 2</span>
          <h2 class="step-title">Trình độ hiện tại của bạn?</h2>
          <p class="step-desc">
            Chọn trình độ phù hợp nhất để EngLearn đề xuất các bộ từ vựng và bài tập tối ưu (bạn có thể thay đổi bất cứ lúc nào).
          </p>

          <div class="options-grid">
            <div
              v-for="lvl in levels"
              :key="lvl.id"
              class="option-card"
              :class="{ selected: selectedLevel === lvl.id }"
              @click="selectedLevel = lvl.id"
            >
              <div class="card-radio">
                <div class="radio-inner" v-if="selectedLevel === lvl.id"></div>
              </div>
              <div class="card-text">
                <div class="card-header-row">
                  <span class="level-code">{{ lvl.code }}</span>
                  <span class="level-name">{{ lvl.name }}</span>
                </div>
                <p class="card-desc">{{ lvl.desc }}</p>
              </div>
            </div>
          </div>

          <div class="step-actions dual-actions">
            <button class="btn btn-ghost" @click="currentStep = 1">
              <FeatherIcon type="arrow-left" :size="16" /> Quay lại
            </button>
            <button class="btn btn-primary btn-next" @click="currentStep = 3">
              <span>Tiếp tục</span>
              <FeatherIcon type="arrow-right" :size="16" />
            </button>
          </div>
        </div>

        <!-- MÀN 3: CHỌN MỤC TIÊU & THỜI GIAN HỌC -->
        <div v-else-if="currentStep === 3" class="step-content">
          <span class="step-badge">Bước 2 / 2</span>
          <h2 class="step-title">Mục tiêu & Thời gian mỗi ngày</h2>
          <p class="step-desc">
            Đặt ra thói quen nhỏ mỗi ngày để tiến bộ bền vững mà không bị quá tải.
          </p>

          <div class="section-group">
            <label class="group-label">Mục tiêu học tập chính:</label>
            <div class="target-chips">
              <div
                v-for="t in targets"
                :key="t.id"
                class="target-chip"
                :class="{ selected: selectedTarget === t.id }"
                @click="selectedTarget = t.id"
              >
                <FeatherIcon :type="t.icon" :size="16" />
                <span>{{ t.label }}</span>
              </div>
            </div>
          </div>

          <div class="section-group">
            <label class="group-label">Thời gian học mỗi ngày:</label>
            <div class="time-cards">
              <div
                v-for="tm in timeOptions"
                :key="tm.minutes"
                class="time-card"
                :class="{ selected: selectedMinutes === tm.minutes }"
                @click="selectedMinutes = tm.minutes"
              >
                <span class="time-val">{{ tm.minutes }} phút</span>
                <span class="time-words">~{{ tm.words }} từ / ngày</span>
              </div>
            </div>
          </div>

          <div class="step-actions dual-actions">
            <button class="btn btn-ghost" @click="currentStep = 2">
              <FeatherIcon type="arrow-left" :size="16" /> Quay lại
            </button>
            <button class="btn btn-primary btn-next" @click="completeOnboarding">
              <FeatherIcon type="check" :size="18" />
              <span>Vào học ngay</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { ref } from 'vue'
import FeatherIcon from './FeatherIcon.vue'
import { dictionaryStorage } from '../services/dictionaryStorage.js'

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close', 'completed'])

const currentStep = ref(1)
const selectedLevel = ref('intermediate')
const selectedTarget = ref('toeic_ielts')
const selectedMinutes = ref(10)

const levels = [
  {
    id: 'beginner',
    code: 'A1 – A2',
    name: 'Beginner (Mới bắt đầu)',
    desc: 'Học các từ vựng giao tiếp căn bản, ngữ pháp nền tảng và phát âm chuẩn.'
  },
  {
    id: 'intermediate',
    code: 'B1 – B2',
    name: 'Intermediate (Trung cấp)',
    desc: 'Mở rộng vốn từ Oxford 3000, giao tiếp tự tin và ôn luyện thi chứng chỉ.'
  },
  {
    id: 'advanced',
    code: 'C1 – C2',
    name: 'Advanced (Nâng cao)',
    desc: 'Làm chủ từ vựng chuyên ngành, ngữ cảnh học thuật và sắc thái diễn đạt cao cấp.'
  }
]

const targets = [
  { id: 'communication', icon: 'message-circle', label: 'Giao tiếp hàng ngày' },
  { id: 'toeic_ielts', icon: 'award', label: 'Luyện thi TOEIC / IELTS' },
  { id: 'work_academic', icon: 'briefcase', label: 'Học thuật & Công sở' }
]

const timeOptions = [
  { minutes: 5, words: 5 },
  { minutes: 10, words: 10 },
  { minutes: 15, words: 15 }
]

function completeOnboarding() {
  const chosenTarget = targets.find(t => t.id === selectedTarget.value)
  const chosenLevel = levels.find(l => l.id === selectedLevel.value)
  const chosenTime = timeOptions.find(tm => tm.minutes === selectedMinutes.value)

  dictionaryStorage.setUserGoal({
    level: selectedLevel.value,
    levelName: chosenLevel?.name || 'Intermediate',
    levelCode: chosenLevel?.code || 'B1-B2',
    target: selectedTarget.value,
    targetName: chosenTarget?.label || 'Luyện thi TOEIC / IELTS',
    minutesPerDay: selectedMinutes.value,
    dailyWords: chosenTime?.words || 10
  })

  dictionaryStorage.setOnboarded(true)
  emit('completed')
  emit('close')
}
</script>

<style scoped>
.onboard-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1100;
  padding: 1rem;
}

.onboard-container {
  width: 100%;
  max-width: 520px;
  max-height: 92vh;
  overflow-y: auto;
  border-radius: var(--radius-2xl);
  padding: 2rem;
  background: var(--card-bg);
  box-shadow: 0 25px 60px rgba(0, 0, 0, 0.3);
  border: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
}

.onboard-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.5rem;
}

.steps-indicator {
  display: flex;
  align-items: center;
  gap: 0.35rem;
}

.step-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: var(--border-color);
  transition: all 0.25s ease;
}

.step-dot.active {
  background: var(--mint-500);
  transform: scale(1.15);
}

.step-line {
  width: 24px;
  height: 2px;
  background: var(--border-color);
  transition: all 0.25s ease;
}

.step-line.active {
  background: var(--mint-500);
}

.btn-skip {
  background: none;
  border: none;
  color: var(--text-muted);
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  padding: 0.3rem 0.6rem;
  border-radius: var(--radius-md);
  transition: color 0.15s;
}

.btn-skip:hover {
  color: var(--mint-600);
}

.step-content {
  display: flex;
  flex-direction: column;
}

.step-icon-hero {
  display: flex;
  justify-content: center;
  margin-bottom: 1.25rem;
}

.icon-circle {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--mint-100) 0%, var(--mint-200) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--mint-600);
  box-shadow: 0 8px 20px rgba(21, 183, 158, 0.25);
}

[data-theme="dark"] .icon-circle {
  background: linear-gradient(135deg, rgba(21, 183, 158, 0.25) 0%, rgba(21, 183, 158, 0.1) 100%);
  color: var(--mint-300);
}

.step-badge {
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--mint-600);
  background: var(--mint-50);
  padding: 0.25rem 0.65rem;
  border-radius: var(--radius-full);
  width: fit-content;
  margin-bottom: 0.65rem;
}

[data-theme="dark"] .step-badge {
  background: rgba(21, 183, 158, 0.15);
  color: var(--mint-300);
}

.step-title {
  font-size: 1.6rem;
  font-weight: 800;
  color: var(--text-primary);
  margin: 0 0 0.5rem;
  line-height: 1.3;
}

.step-desc {
  color: var(--text-muted);
  font-size: 0.92rem;
  line-height: 1.55;
  margin: 0 0 1.5rem;
}

.benefits-list {
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
  margin-bottom: 2rem;
}

.benefit-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 0.9rem;
  color: var(--text-secondary);
}

.benefit-icon {
  width: 32px;
  height: 32px;
  border-radius: var(--radius-md);
  background: var(--mint-50);
  color: var(--mint-600);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

[data-theme="dark"] .benefit-icon {
  background: rgba(21, 183, 158, 0.15);
  color: var(--mint-300);
}

.step-actions {
  margin-top: 1.5rem;
}

.btn-full-cta {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  min-height: 48px;
  font-size: 1rem;
  font-weight: 600;
  border-radius: var(--radius-xl);
}

.dual-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.btn-next {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border-radius: var(--radius-xl);
  font-weight: 600;
}

/* Option Cards (Level) */
.options-grid {
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
}

.option-card {
  display: flex;
  align-items: flex-start;
  gap: 0.85rem;
  padding: 1.15rem;
  border: 1.5px solid var(--border-color);
  border-radius: var(--radius-xl);
  background: var(--bg-secondary);
  cursor: pointer;
  transition: all 0.2s ease;
}

.option-card:hover {
  border-color: var(--mint-400);
  transform: translateY(-1px);
}

.option-card.selected {
  border-color: var(--mint-500);
  background: linear-gradient(135deg, rgba(21, 183, 158, 0.1) 0%, rgba(21, 183, 158, 0.03) 100%);
}

.card-radio {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: 2px solid var(--border-color);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  margin-top: 2px;
}

.option-card.selected .card-radio {
  border-color: var(--mint-500);
}

.radio-inner {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: var(--mint-500);
}

.card-header-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.25rem;
}

.level-code {
  font-size: 0.75rem;
  font-weight: 800;
  color: var(--mint-600);
  background: var(--mint-50);
  padding: 0.15rem 0.45rem;
  border-radius: var(--radius-sm);
}

[data-theme="dark"] .level-code {
  background: rgba(21, 183, 158, 0.2);
  color: var(--mint-300);
}

.level-name {
  font-weight: 700;
  font-size: 0.96rem;
  color: var(--text-primary);
}

.card-desc {
  margin: 0;
  font-size: 0.82rem;
  color: var(--text-muted);
  line-height: 1.45;
}

/* Target & Time options */
.section-group {
  margin-bottom: 1.25rem;
}

.group-label {
  display: block;
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--text-secondary);
  margin-bottom: 0.5rem;
}

.target-chips {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.target-chip {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  padding: 0.75rem 1rem;
  border: 1.5px solid var(--border-color);
  border-radius: var(--radius-lg);
  background: var(--bg-secondary);
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.2s ease;
}

.target-chip.selected {
  border-color: var(--mint-500);
  color: var(--mint-700);
  background: var(--mint-50);
}

[data-theme="dark"] .target-chip.selected {
  background: rgba(21, 183, 158, 0.15);
  color: var(--mint-300);
}

.time-cards {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.65rem;
}

.time-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0.85rem 0.5rem;
  border: 1.5px solid var(--border-color);
  border-radius: var(--radius-lg);
  background: var(--bg-secondary);
  cursor: pointer;
  text-align: center;
  transition: all 0.2s ease;
}

.time-card.selected {
  border-color: var(--mint-500);
  background: var(--mint-50);
}

[data-theme="dark"] .time-card.selected {
  background: rgba(21, 183, 158, 0.15);
}

.time-val {
  font-weight: 800;
  font-size: 1rem;
  color: var(--text-primary);
}

.time-card.selected .time-val {
  color: var(--mint-700);
}

[data-theme="dark"] .time-card.selected .time-val {
  color: var(--mint-300);
}

.time-words {
  font-size: 0.75rem;
  color: var(--text-muted);
  margin-top: 0.2rem;
}

.onboard-fade-enter-active, .onboard-fade-leave-active {
  transition: opacity 0.25s ease;
}
.onboard-fade-enter-from, .onboard-fade-leave-to {
  opacity: 0;
}

@media (max-width: 500px) {
  .onboard-container {
    padding: 1.25rem;
  }
  .step-title {
    font-size: 1.35rem;
  }
}
</style>
