<template>
  <Transition name="onboard-fade">
    <div v-if="isOpen" class="onboard-backdrop" @click.self="completeOnboarding">
      <div class="onboard-container card animate-slideUp">
        <!-- TOP NAVIGATION BAR (Matching Images 1 & 2) -->
        <div class="onboard-top-nav">
          <button
            v-if="currentStep > 1"
            class="btn-nav-back"
            @click="prevStep"
            title="Quay lại"
          >
            <FeatherIcon type="arrow-left" :size="20" />
          </button>
          <div v-else class="nav-placeholder"></div>

          <!-- Stepper Progress Bar at Top -->
          <div class="stepper-track">
            <div
              class="stepper-fill"
              :style="{ width: `${(currentStep / 3) * 100}%` }"
            ></div>
          </div>

          <button class="btn-skip-text" @click="completeOnboarding" title="Bỏ qua thiết lập">
            Bỏ qua
          </button>
        </div>

        <!-- ==============================================
             STEP 1: WELCOME & VALUE PROP (Matching Image 3)
             ============================================== -->
        <div v-if="currentStep === 1" class="step-view step-welcome">
          <!-- Floating Playful Cards Illustration -->
          <div class="hero-illustration">
            <div class="floating-badge-item badge-plane animate-float">
              <span class="emoji-icon">✈️</span>
            </div>
            <div class="floating-badge-item badge-briefcase animate-float-delayed">
              <span class="emoji-icon">💼</span>
            </div>
            <div class="floating-badge-item badge-capsule animate-float">
              <span class="emoji-icon">💊</span>
            </div>

            <!-- Mascot Center Card -->
            <div class="center-mascot-card">
              <div class="mascot-face">
                <span class="mascot-eyes">👀</span>
                <span class="mascot-smile">‿</span>
              </div>
              <span class="mascot-title">EngLearn</span>
              <span class="mascot-sub">Vocabulary</span>
            </div>
          </div>

          <div class="step-welcome-text">
            <h1 class="welcome-heading">Improve your English vocabulary</h1>
            <p class="welcome-subheading">
              Học từ vựng mỗi ngày với 3000+ từ Oxford & 600 từ TOEIC thiết yếu, phát âm chuẩn cả Anh-Anh & Anh-Mỹ.
            </p>
          </div>

          <div class="welcome-highlights">
            <div class="highlight-chip">
              <FeatherIcon type="check-circle" :size="14" class="text-mint" />
              <span>Miễn phí 100%</span>
            </div>
            <div class="highlight-chip">
              <FeatherIcon type="zap" :size="14" class="text-mint" />
              <span>Không bắt buộc đăng ký</span>
            </div>
            <div class="highlight-chip">
              <FeatherIcon type="repeat" :size="14" class="text-mint" />
              <span>Nhớ lâu với SRS</span>
            </div>
          </div>

          <div class="step-bottom-cta">
            <button class="btn-continue-pill" @click="currentStep = 2">
              <span>Tiếp tục</span>
              <FeatherIcon type="arrow-right" :size="18" />
            </button>
          </div>
        </div>

        <!-- ==============================================
             STEP 2: WHAT'S YOUR LEVEL? (Matching Image 1)
             ============================================== -->
        <div v-else-if="currentStep === 2" class="step-view step-level">
          <div class="step-header">
            <h2 class="step-main-title">What's your level of English?</h2>
            <p class="step-sub-desc">Chọn trình độ gần nhất với khả năng hiện tại của bạn:</p>
          </div>

          <div class="level-pill-list">
            <div
              v-for="lvl in cefrLevels"
              :key="lvl.code"
              class="level-pill-card"
              :class="{ 'is-selected': selectedLevel === lvl.code }"
              @click="selectLevel(lvl.code)"
            >
              <div class="level-code-badge" :class="`badge-${lvl.color}`">
                {{ lvl.code }}
              </div>
              <div class="level-content">
                <p class="level-desc-en">{{ lvl.descEn }}</p>
                <p class="level-desc-vi">{{ lvl.descVi }}</p>
              </div>
              <div class="selection-indicator">
                <div class="check-circle-mark" v-if="selectedLevel === lvl.code">
                  <FeatherIcon type="check" :size="14" />
                </div>
              </div>
            </div>
          </div>

          <div class="step-bottom-cta">
            <button class="btn-continue-pill" @click="currentStep = 3">
              <span>Tiếp tục</span>
              <FeatherIcon type="arrow-right" :size="18" />
            </button>
          </div>
        </div>

        <!-- ==============================================
             STEP 3: PICK A GOAL (Matching Image 2)
             ============================================== -->
        <div v-else-if="currentStep === 3" class="step-view step-goal">
          <div class="step-header">
            <h2 class="step-main-title">Pick a goal</h2>
            <p class="step-sub-desc">Chọn mục tiêu thời gian học tiếng Anh mỗi ngày:</p>
          </div>

          <!-- Goal segmented cards list -->
          <div class="goal-segmented-list">
            <div
              v-for="goal in goalOptions"
              :key="goal.id"
              class="goal-row-card"
              :class="{ 'is-selected': selectedGoalId === goal.id }"
              @click="selectedGoalId = goal.id"
            >
              <div class="goal-left">
                <span class="goal-name">{{ goal.name }}</span>
                <span class="goal-words-hint">~{{ goal.words }} từ / ngày</span>
              </div>
              <div class="goal-right">
                <span class="goal-time">{{ goal.minutes }} min / day</span>
              </div>
            </div>
          </div>

          <!-- Mascot speech bubble (Matching Image 2) -->
          <div class="mascot-speech-container">
            <div class="cute-mini-mascot">
              <div class="mascot-head">
                <span class="headband"></span>
                <span class="eyes">^‿^</span>
              </div>
            </div>
            <div class="speech-bubble">
              <span class="bubble-tail"></span>
              <p class="bubble-text">You can always change goals later.</p>
              <span class="bubble-text-sub">Bạn luôn có thể điều chỉnh lại mục tiêu này sau.</span>
            </div>
          </div>

          <div class="step-bottom-cta">
            <button class="btn-continue-pill green-accent" @click="completeOnboarding">
              <FeatherIcon type="check" :size="18" />
              <span>CONTINUE</span>
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

defineProps({
  isOpen: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close', 'completed'])

const currentStep = ref(1)
const selectedLevel = ref('B1')
const selectedGoalId = ref('regular')

// CEFR Levels matching Image 1
const cefrLevels = [
  {
    code: 'A1',
    color: 'purple',
    descEn: 'I can take part in basic chats',
    descVi: 'Giao tiếp những câu đơn giản, căn bản'
  },
  {
    code: 'A2',
    color: 'purple',
    descEn: 'I can handle short chats on familiar topics',
    descVi: 'Trao đổi về các chủ đề quen thuộc hàng ngày'
  },
  {
    code: 'B1',
    color: 'blue',
    descEn: 'I can talk about everyday topics in detail',
    descVi: 'Nói chi tiết về công việc & đời sống thường nhật'
  },
  {
    code: 'B2',
    color: 'blue',
    descEn: 'I can talk fluently with native speakers',
    descVi: 'Giao tiếp trôi chảy, tự tin thi chứng chỉ TOEIC/IELTS'
  },
  {
    code: 'C1',
    color: 'indigo',
    descEn: 'I can express myself clearly on any topic',
    descVi: 'Làm chủ ngữ cảnh học thuật và thương mại chuyên sâu'
  },
  {
    code: 'C2',
    color: 'indigo',
    descEn: 'I can communicate like a native speaker',
    descVi: 'Thành thạo tự nhiên như người bản xứ'
  }
]

// Goal options matching Image 2
const goalOptions = [
  { id: 'casual', name: 'Casual', minutes: 5, words: 5 },
  { id: 'regular', name: 'Regular', minutes: 10, words: 10 },
  { id: 'serious', name: 'Serious', minutes: 15, words: 15 },
  { id: 'intense', name: 'Intense', minutes: 20, words: 20 }
]

function selectLevel(code) {
  selectedLevel.value = code
}

function prevStep() {
  if (currentStep.value > 1) {
    currentStep.value--
  }
}

function completeOnboarding() {
  const chosenGoal = goalOptions.find(g => g.id === selectedGoalId.value) || goalOptions[1]
  const goal = {
    level: selectedLevel.value,
    levelName: `${selectedLevel.value} Level`,
    target: selectedGoalId.value,
    targetName: `${chosenGoal.name} (${chosenGoal.minutes} phút/ngày)`,
    dailyWords: chosenGoal.words,
    minutesPerDay: chosenGoal.minutes
  }

  dictionaryStorage.setUserGoal(goal)
  dictionaryStorage.setOnboarded(true)
  emit('completed', goal)
}
</script>

<style scoped>
.onboard-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.7);
  backdrop-filter: blur(8px);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

.onboard-container {
  width: 100%;
  max-width: 480px;
  background: var(--card-bg);
  border-radius: 28px;
  padding: 1.25rem 1.4rem 1.4rem;
  border: 1px solid var(--border-color);
  box-shadow: 0 24px 48px rgba(0, 0, 0, 0.2);
  box-sizing: border-box;
  position: relative;
  overflow: hidden;
}

/* TOP NAVIGATION BAR */
.onboard-top-nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.85rem;
  margin-bottom: 1.15rem;
}

.btn-nav-back {
  background: none;
  border: none;
  color: var(--text-primary);
  cursor: pointer;
  padding: 0.35rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: background 0.2s;
}

.btn-nav-back:hover {
  background: var(--border-color);
}

.nav-placeholder {
  width: 28px;
}

.stepper-track {
  flex: 1;
  height: 6px;
  background: var(--border-color);
  border-radius: 9999px;
  overflow: hidden;
}

.stepper-fill {
  height: 100%;
  background: linear-gradient(90deg, #8b5cf6, var(--mint-500));
  border-radius: 9999px;
  transition: width 0.35s cubic-bezier(0.4, 0, 0.2, 1);
}

.btn-skip-text {
  background: none;
  border: none;
  color: var(--text-muted);
  font-size: 0.82rem;
  font-weight: 600;
  cursor: pointer;
  padding: 0.2rem 0.4rem;
}

.btn-skip-text:hover {
  color: var(--text-primary);
}

/* =========================================
   STEP 1: WELCOME & PLAYFUL ILLUSTRATION
   ========================================= */
.step-welcome {
  text-align: center;
  padding: 0.5rem 0 0;
}

.hero-illustration {
  position: relative;
  height: 140px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1.25rem;
}

.center-mascot-card {
  width: 110px;
  height: 110px;
  background: linear-gradient(135deg, #ffffff 0%, #f1f5f9 100%);
  border: 3px solid #8b5cf6;
  border-radius: 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  box-shadow: 0 12px 24px rgba(139, 92, 246, 0.18);
  z-index: 2;
}

[data-theme="dark"] .center-mascot-card {
  background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
}

.mascot-face {
  display: flex;
  flex-direction: column;
  align-items: center;
  font-size: 1.5rem;
  line-height: 1;
  margin-bottom: 0.2rem;
}

.mascot-eyes {
  font-size: 1.25rem;
  letter-spacing: 0.2rem;
}

.mascot-smile {
  font-size: 1.1rem;
  color: #8b5cf6;
  font-weight: 800;
  margin-top: -4px;
}

.mascot-title {
  font-size: 0.82rem;
  font-weight: 800;
  color: #8b5cf6;
  letter-spacing: -0.01em;
}

.mascot-sub {
  font-size: 0.65rem;
  color: var(--text-muted);
  font-weight: 600;
}

.floating-badge-item {
  position: absolute;
  width: 44px;
  height: 44px;
  border-radius: 14px;
  background: var(--card-bg);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.08);
  border: 1px solid var(--border-color);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
}

.badge-plane {
  top: 10px;
  left: 18%;
  background: #fef2f2;
  border-color: #fecaca;
}

.badge-briefcase {
  top: 15px;
  right: 18%;
  background: #fffbeb;
  border-color: #fde68a;
}

.badge-capsule {
  bottom: 10px;
  left: 24%;
  background: #eff6ff;
  border-color: #bfdbfe;
}

.animate-float {
  animation: float 3s ease-in-out infinite;
}

.animate-float-delayed {
  animation: float 3s ease-in-out infinite 1.5s;
}

@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-6px); }
}

.welcome-heading {
  font-size: 1.45rem;
  font-weight: 800;
  color: var(--text-primary);
  margin: 0 0 0.45rem 0;
  line-height: 1.25;
}

.welcome-subheading {
  font-size: 0.85rem;
  color: var(--text-muted);
  margin: 0 0 1.15rem 0;
  line-height: 1.4;
}

.welcome-highlights {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
  text-align: left;
}

.highlight-chip {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  background: rgba(21, 183, 158, 0.08);
  border: 1px solid rgba(21, 183, 158, 0.2);
  border-radius: 12px;
  padding: 0.55rem 0.85rem;
  font-size: 0.82rem;
  font-weight: 600;
  color: var(--text-primary);
}

/* =========================================
   STEP 2: CEFR LEVEL PILL LIST (Image 1)
   ========================================= */
.step-header {
  margin-bottom: 1.15rem;
}

.step-main-title {
  font-size: 1.4rem;
  font-weight: 800;
  color: var(--text-primary);
  margin: 0 0 0.25rem 0;
  line-height: 1.25;
}

.step-sub-desc {
  font-size: 0.84rem;
  color: var(--text-muted);
  margin: 0;
}

.level-pill-list {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  margin-bottom: 1.4rem;
  max-height: 380px;
  overflow-y: auto;
  padding-right: 2px;
}

.level-pill-card {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  background: var(--card-bg);
  border: 1.5px solid var(--border-color);
  border-radius: 16px;
  padding: 0.65rem 0.95rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.level-pill-card:hover {
  border-color: #8b5cf6;
  background: rgba(139, 92, 246, 0.04);
}

.level-pill-card.is-selected {
  border-color: #8b5cf6;
  background: rgba(139, 92, 246, 0.08);
  box-shadow: 0 2px 10px rgba(139, 92, 246, 0.12);
}

.level-code-badge {
  font-size: 1.15rem;
  font-weight: 800;
  width: 44px;
  height: 36px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  letter-spacing: -0.02em;
}

.badge-purple {
  color: #7c3aed;
  background: rgba(124, 58, 237, 0.12);
}

.badge-blue {
  color: #0284c7;
  background: rgba(2, 132, 199, 0.12);
}

.badge-indigo {
  color: #4f46e5;
  background: rgba(79, 70, 229, 0.12);
}

.level-content {
  flex: 1;
  min-width: 0;
}

.level-desc-en {
  font-size: 0.88rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
  line-height: 1.25;
}

.level-desc-vi {
  font-size: 0.74rem;
  color: var(--text-muted);
  margin: 0.15rem 0 0 0;
}

.selection-indicator {
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.check-circle-mark {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #8b5cf6;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* =========================================
   STEP 3: PICK A GOAL (Image 2)
   ========================================= */
.goal-segmented-list {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  margin-bottom: 1.25rem;
}

.goal-row-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: var(--card-bg);
  border: 1.5px solid var(--border-color);
  border-radius: 14px;
  padding: 0.85rem 1.15rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.goal-row-card:hover {
  border-color: var(--mint-500);
}

.goal-row-card.is-selected {
  background: #e0f2fe;
  border-color: #0284c7;
  box-shadow: 0 2px 10px rgba(2, 132, 199, 0.12);
}

[data-theme="dark"] .goal-row-card.is-selected {
  background: rgba(2, 132, 199, 0.18);
  border-color: #38bdf8;
}

.goal-left {
  display: flex;
  align-items: baseline;
  gap: 0.5rem;
}

.goal-name {
  font-size: 1rem;
  font-weight: 700;
  color: var(--text-primary);
}

.goal-row-card.is-selected .goal-name {
  color: #0369a1;
}

[data-theme="dark"] .goal-row-card.is-selected .goal-name {
  color: #7dd3fc;
}

.goal-words-hint {
  font-size: 0.74rem;
  color: var(--text-muted);
}

.goal-right {
  font-size: 0.88rem;
  font-weight: 600;
  color: var(--text-muted);
}

.goal-row-card.is-selected .goal-right {
  color: #0284c7;
  font-weight: 700;
}

[data-theme="dark"] .goal-row-card.is-selected .goal-right {
  color: #38bdf8;
}

/* Mascot Speech Bubble (Image 2) */
.mascot-speech-container {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  margin-bottom: 1.4rem;
  padding: 0 0.25rem;
}

.cute-mini-mascot {
  flex-shrink: 0;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: linear-gradient(135deg, #84cc16 0%, #65a30d 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 10px rgba(101, 163, 13, 0.25);
}

.mascot-head {
  display: flex;
  flex-direction: column;
  align-items: center;
  color: white;
  font-weight: 800;
  font-size: 0.85rem;
}

.headband {
  width: 28px;
  height: 4px;
  background: #ef4444;
  border-radius: 2px;
  margin-bottom: 2px;
}

.speech-bubble {
  position: relative;
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: 14px;
  padding: 0.6rem 0.85rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  flex: 1;
}

.bubble-tail {
  position: absolute;
  left: -6px;
  top: 50%;
  transform: translateY(-50%) rotate(45deg);
  width: 10px;
  height: 10px;
  background: var(--card-bg);
  border-left: 1px solid var(--border-color);
  border-bottom: 1px solid var(--border-color);
}

.bubble-text {
  font-size: 0.82rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
}

.bubble-text-sub {
  font-size: 0.72rem;
  color: var(--text-muted);
}

/* COMMON BOTTOM BUTTON */
.step-bottom-cta {
  width: 100%;
}

.btn-continue-pill {
  width: 100%;
  padding: 0.85rem 1.25rem;
  font-size: 0.95rem;
  font-weight: 700;
  border: none;
  border-radius: 9999px;
  background: linear-gradient(90deg, #7c3aed, #8b5cf6);
  color: white;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  cursor: pointer;
  box-shadow: 0 6px 18px rgba(124, 58, 237, 0.25);
  transition: all 0.2s ease;
}

.btn-continue-pill:hover {
  transform: translateY(-1px);
  box-shadow: 0 8px 22px rgba(124, 58, 237, 0.35);
}

.btn-continue-pill.green-accent {
  background: linear-gradient(90deg, #84cc16, #65a30d);
  box-shadow: 0 6px 18px rgba(101, 163, 13, 0.3);
}

.btn-continue-pill.green-accent:hover {
  box-shadow: 0 8px 22px rgba(101, 163, 13, 0.4);
}

/* Animations */
.onboard-fade-enter-active,
.onboard-fade-leave-active {
  transition: opacity 0.25s ease;
}

.onboard-fade-enter-from,
.onboard-fade-leave-to {
  opacity: 0;
}

@media (max-width: 480px) {
  .onboard-container {
    padding: 1.1rem 1.15rem;
    border-radius: 22px;
  }

  .step-main-title {
    font-size: 1.25rem;
  }

  .level-pill-card {
    padding: 0.55rem 0.75rem;
  }

  .level-code-badge {
    font-size: 1rem;
    width: 38px;
    height: 32px;
  }
}
</style>
