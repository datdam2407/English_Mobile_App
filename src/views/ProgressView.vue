<template>
  <div class="progress-view animate-fadeIn">
    <!-- Header -->
    <div class="progress-header">
      <div class="header-badge">
        <FeatherIcon type="trending-up" :size="14" />
        <span>Theo Dõi Năng Lực & Mục Tiêu</span>
      </div>
      <h1 class="page-title">Tiến Độ Học Tập</h1>
      <p class="page-subtitle">
        Xem chi tiết mức độ ghi nhớ từ vựng, chuỗi ngày học tập và lịch ôn ngắt quãng (SRS).
      </p>
    </div>

    <!-- Daily Goal Card -->
    <div class="daily-goal-card card">
      <div class="goal-info-col">
        <div class="goal-tag">
          <FeatherIcon type="target" :size="16" />
          <span>MỤC TIÊU HÔM NAY</span>
        </div>
        <div class="goal-numbers">
          <span class="goal-current">{{ srsStats.reviewedToday }}</span>
          <span class="goal-divider">/</span>
          <span class="goal-total">{{ userGoal.dailyWords }} từ</span>
        </div>
        <p class="goal-message">
          <span v-if="srsStats.reviewedToday >= userGoal.dailyWords">
            🎉 Tuyệt vời! Bạn đã hoàn thành mục tiêu học tập của hôm nay!
          </span>
          <span v-else>
            Cố lên! Bạn còn {{ userGoal.dailyWords - srsStats.reviewedToday }} từ nữa để hoàn thành mục tiêu.
          </span>
        </p>

        <!-- Progress Bar -->
        <div class="goal-progress-track">
          <div
            class="goal-progress-fill"
            :style="{ width: Math.min(100, (srsStats.reviewedToday / userGoal.dailyWords) * 100) + '%' }"
          ></div>
        </div>
      </div>

      <!-- Quick Action Button -->
      <div class="goal-action-col">
        <router-link
          v-if="srsStats.dueToday > 0"
          to="/review"
          class="btn btn-primary btn-review-cta"
        >
          <FeatherIcon type="rotate-cw" :size="18" />
          <span>Ôn tập ngay ({{ srsStats.dueToday }} từ)</span>
        </router-link>
        <router-link
          v-else
          to="/book/1"
          class="btn btn-primary btn-learn-more-cta"
        >
          <FeatherIcon type="book-open" :size="18" />
          <span>Học thêm từ mới</span>
        </router-link>
        <button class="btn btn-ghost btn-edit-goal" @click="showOnboarding = true">
          <FeatherIcon type="settings" :size="15" />
          <span>Đổi mục tiêu</span>
        </button>
      </div>
    </div>

    <!-- 4 Trạng Thái Từ Vựng (Pillars) -->
    <div class="status-grid">
      <!-- Đã học -->
      <div class="status-card card">
        <div class="status-icon-box total">
          <FeatherIcon type="book" :size="24" />
        </div>
        <div class="status-data">
          <span class="status-number">{{ srsStats.totalCards }}</span>
          <span class="status-name">Từ đã bắt đầu học</span>
        </div>
      </div>

      <!-- Nhớ tốt (Mastered) -->
      <div class="status-card card">
        <div class="status-icon-box mastered">
          <FeatherIcon type="check-circle" :size="24" />
        </div>
        <div class="status-data">
          <span class="status-number text-green">{{ srsStats.masteredCards }}</span>
          <span class="status-name">Đã nhớ tốt (Mastered)</span>
        </div>
      </div>

      <!-- Đang học (Learning) -->
      <div class="status-card card">
        <div class="status-icon-box learning">
          <FeatherIcon type="activity" :size="24" />
        </div>
        <div class="status-data">
          <span class="status-number text-blue">{{ srsStats.learningCards }}</span>
          <span class="status-name">Đang củng cố (Learning)</span>
        </div>
      </div>

      <!-- Cần ôn tập (Due) -->
      <div class="status-card card">
        <div class="status-icon-box due">
          <FeatherIcon type="clock" :size="24" />
        </div>
        <div class="status-data">
          <span class="status-number text-orange">{{ srsStats.dueToday }}</span>
          <span class="status-name">Đến hạn ôn hôm nay</span>
        </div>
      </div>
    </div>

    <!-- Streak & XP Row -->
    <div class="streak-xp-row">
      <!-- Streak Card -->
      <div class="metric-card card">
        <div class="metric-header">
          <div class="metric-icon streak-icon">
            <FeatherIcon type="zap" :size="24" />
          </div>
          <div>
            <h3>Chuỗi Ngày Học Liên Tục</h3>
            <p>Học mỗi ngày để duy trì thói quen</p>
          </div>
        </div>
        <div class="streak-body">
          <span class="streak-highlight">{{ userStats.streak?.current || 0 }} Ngày</span>
          <span class="streak-sub">Kỷ lục dài nhất: {{ userStats.streak?.longest || 0 }} ngày</span>
        </div>
      </div>

      <!-- Level & XP Card -->
      <div class="metric-card card">
        <div class="metric-header">
          <div class="metric-icon level-icon">
            <FeatherIcon type="award" :size="24" />
          </div>
          <div>
            <h3>Cấp Độ & Điểm Thưởng</h3>
            <p>Tích lũy XP qua mỗi bài học & quiz</p>
          </div>
        </div>
        <div class="level-body">
          <div class="level-top">
            <span class="level-title">Level {{ userStats.level || 1 }}</span>
            <span class="xp-val">{{ userStats.xp || 0 }} XP</span>
          </div>
          <div class="level-track">
            <div
              class="level-fill"
              :style="{ width: (userStats.levelProgress || 0) + '%' }"
            ></div>
          </div>
          <span class="level-hint">{{ 100 - (userStats.levelProgress || 0) }}% nữa lên Level kế tiếp</span>
        </div>
      </div>
    </div>

    <!-- 7-Day Spaced Repetition Forecast -->
    <div class="forecast-section card">
      <div class="section-title-row">
        <div class="title-with-icon">
          <FeatherIcon type="calendar" :size="20" class="text-mint" />
          <h3>Dự Báo Lịch Ôn Tập 7 Ngày Tới (SRS)</h3>
        </div>
        <span class="forecast-badge">Thuật toán SM-2</span>
      </div>
      <p class="forecast-desc">
        Hệ thống tự động tính toán thời điểm trí não bắt đầu quên từ vựng để xếp lịch ôn tập tối ưu.
      </p>

      <div class="forecast-bars">
        <div
          v-for="(count, dateStr) in upcomingReviews"
          :key="dateStr"
          class="forecast-col"
        >
          <div class="bar-container">
            <div
              class="bar-fill"
              :style="{ height: getBarHeight(count) + '%' }"
              :class="{ 'has-words': count > 0 }"
            >
              <span class="bar-count" v-if="count > 0">{{ count }}</span>
            </div>
          </div>
          <span class="bar-label">{{ formatDayLabel(dateStr) }}</span>
        </div>
      </div>
    </div>

    <!-- Weak Words to Strengthen -->
    <div class="weak-words-section card" v-if="weakWords.length > 0">
      <div class="section-title-row">
        <div class="title-with-icon">
          <FeatherIcon type="alert-triangle" :size="20" class="text-orange" />
          <h3>Từ Cần Củng Cố Lại</h3>
        </div>
        <router-link to="/review" class="view-all-link">Ôn tập ngay →</router-link>
      </div>
      <p class="weak-desc">Những từ bạn đánh giá "Khó" hoặc "Quên" gần đây:</p>

      <div class="weak-chips">
        <div
          v-for="w in weakWords"
          :key="w.wordId"
          class="weak-chip card-clickable"
          @click="openWord(w)"
        >
          <span class="weak-word">{{ w.word }}</span>
          <span class="weak-due">Đến hạn ôn</span>
        </div>
      </div>
    </div>

    <!-- Onboarding Modal for editing goal -->
    <OnboardingModal
      :is-open="showOnboarding"
      @close="showOnboarding = false"
      @completed="handleGoalUpdated"
    />

    <!-- Word Detail Modal -->
    <WordDetailModal
      :is-open="isModalOpen"
      :word="selectedWordObj"
      @close="isModalOpen = false"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import FeatherIcon from '../components/FeatherIcon.vue'
import OnboardingModal from '../components/OnboardingModal.vue'
import WordDetailModal from '../components/WordDetailModal.vue'
import { getReviewStats, getUpcomingReviews, getAllProgress } from '../services/srs.js'
import { getStats } from '../services/gamification.js'
import { dictionaryStorage } from '../services/dictionaryStorage.js'
import { api } from '../services/api'

const srsStats = ref({
  totalCards: 0,
  dueToday: 0,
  masteredCards: 0,
  learningCards: 0,
  reviewedToday: 0
})

const userStats = ref({
  streak: { current: 0, longest: 0 },
  xp: 0,
  level: 1,
  levelProgress: 0
})

const userGoal = ref(dictionaryStorage.getUserGoal())
const upcomingReviews = ref({})
const rawProgress = ref({})
const showOnboarding = ref(false)

const isModalOpen = ref(false)
const selectedWordObj = ref(null)
const allWordsCache = ref([])

onMounted(async () => {
  loadData()
  try {
    allWordsCache.value = await api.getAllWords()
  } catch {}
})

function loadData() {
  srsStats.value = getReviewStats()
  userStats.value = getStats()
  upcomingReviews.value = getUpcomingReviews()
  rawProgress.value = getAllProgress()
  userGoal.value = dictionaryStorage.getUserGoal()
}

function handleGoalUpdated() {
  userGoal.value = dictionaryStorage.getUserGoal()
}

// Top words needing review
const weakWords = computed(() => {
  const cards = Object.values(rawProgress.value)
  return cards
    .filter(c => (c.easeFactor && c.easeFactor < 2.2) || c.interval <= 2)
    .slice(0, 10)
})

function getBarHeight(count) {
  if (!count) return 8
  const max = Math.max(...Object.values(upcomingReviews.value), 10)
  return Math.min(100, Math.max(15, (count / max) * 100))
}

function formatDayLabel(dateStr) {
  const today = new Date().toISOString().split('T')[0]
  if (dateStr === today) return 'Hôm nay'
  const date = new Date(dateStr)
  const days = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7']
  return `${days[date.getDay()]} (${date.getDate()}/${date.getMonth() + 1})`
}

function openWord(card) {
  const found = allWordsCache.value.find(w => w.id === card.wordId || w.english?.toLowerCase() === card.word?.toLowerCase())
  if (found) {
    selectedWordObj.value = found
    isModalOpen.value = true
  }
}
</script>

<style scoped>
.progress-view {
  padding: 1.5rem 0.5rem 4rem;
  max-width: 1050px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 1.75rem;
}

.progress-header {
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.header-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--mint-600);
  background: var(--mint-50);
  padding: 0.25rem 0.75rem;
  border-radius: var(--radius-full);
  margin-bottom: 0.65rem;
}

[data-theme="dark"] .header-badge {
  background: rgba(21, 183, 158, 0.15);
  color: var(--mint-300);
}

.page-title {
  font-size: 2.2rem;
  font-weight: 800;
  color: var(--text-primary);
  margin: 0 0 0.5rem;
  letter-spacing: -0.02em;
}

.page-subtitle {
  color: var(--text-muted);
  font-size: 0.96rem;
  max-width: 600px;
  margin: 0;
  line-height: 1.5;
}

/* Daily Goal Card */
.daily-goal-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 2rem;
  padding: 1.75rem 2rem;
  background: linear-gradient(135deg, var(--card-bg) 0%, var(--bg-secondary) 100%);
  border-radius: var(--radius-2xl);
  border: 1px solid var(--border-color);
  box-shadow: var(--shadow-sm);
}

.goal-info-col {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.goal-tag {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.75rem;
  font-weight: 800;
  letter-spacing: 0.05em;
  color: var(--mint-600);
}

.goal-numbers {
  display: flex;
  align-items: baseline;
  gap: 0.4rem;
}

.goal-current {
  font-size: 2.75rem;
  font-weight: 800;
  color: var(--mint-600);
  line-height: 1;
}

.goal-divider {
  font-size: 1.75rem;
  color: var(--text-muted);
}

.goal-total {
  font-size: 1.35rem;
  font-weight: 700;
  color: var(--text-secondary);
}

.goal-message {
  font-size: 0.92rem;
  color: var(--text-muted);
  margin: 0;
}

.goal-progress-track {
  width: 100%;
  height: 10px;
  background: var(--bg-tertiary);
  border-radius: var(--radius-full);
  overflow: hidden;
  margin-top: 0.5rem;
}

.goal-progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--mint-500), var(--mint-400));
  border-radius: var(--radius-full);
  transition: width 0.4s ease;
}

.goal-action-col {
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
  align-items: flex-end;
}

.btn-review-cta, .btn-learn-more-cta {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  padding: 0.85rem 1.35rem;
  font-size: 0.95rem;
  font-weight: 600;
  border-radius: var(--radius-xl);
  white-space: nowrap;
}

.btn-edit-goal {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.85rem;
  padding: 0.4rem 0.75rem;
}

/* 4 Status Cards Grid */
.status-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
}

.status-card {
  padding: 1.25rem;
  border-radius: var(--radius-xl);
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  display: flex;
  align-items: center;
  gap: 1rem;
  box-shadow: var(--shadow-sm);
}

.status-icon-box {
  width: 48px;
  height: 48px;
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.status-icon-box.total {
  background: rgba(139, 92, 246, 0.1);
  color: #7c3aed;
}

.status-icon-box.mastered {
  background: rgba(34, 197, 94, 0.1);
  color: #16a34a;
}

.status-icon-box.learning {
  background: rgba(59, 130, 246, 0.1);
  color: #2563eb;
}

.status-icon-box.due {
  background: rgba(249, 115, 22, 0.1);
  color: #ea580c;
}

.status-data {
  display: flex;
  flex-direction: column;
}

.status-number {
  font-size: 1.6rem;
  font-weight: 800;
  color: var(--text-primary);
  line-height: 1.1;
}

.status-name {
  font-size: 0.78rem;
  color: var(--text-muted);
  font-weight: 500;
  margin-top: 0.15rem;
}

.text-green { color: #16a34a; }
.text-blue { color: #2563eb; }
.text-orange { color: #ea580c; }
.text-mint { color: var(--mint-600); }

/* Streak & XP Row */
.streak-xp-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.25rem;
}

.metric-card {
  padding: 1.5rem;
  border-radius: var(--radius-2xl);
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  box-shadow: var(--shadow-sm);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.metric-header {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  margin-bottom: 1.25rem;
}

.metric-header h3 {
  font-size: 1.1rem;
  font-weight: 700;
  margin: 0;
  color: var(--text-primary);
}

.metric-header p {
  font-size: 0.82rem;
  color: var(--text-muted);
  margin: 0;
}

.metric-icon {
  width: 44px;
  height: 44px;
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.streak-icon {
  background: linear-gradient(135deg, #fef3c7, #fde68a);
  color: #d97706;
}

.level-icon {
  background: linear-gradient(135deg, #e0e7ff, #c7d2fe);
  color: #4f46e5;
}

.streak-body {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.streak-highlight {
  font-size: 2.25rem;
  font-weight: 800;
  color: #d97706;
}

.streak-sub {
  font-size: 0.85rem;
  color: var(--text-muted);
}

.level-body {
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
}

.level-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.level-title {
  font-weight: 800;
  font-size: 1.25rem;
  color: var(--text-primary);
}

.xp-val {
  font-weight: 700;
  color: var(--mint-600);
}

.level-track {
  width: 100%;
  height: 8px;
  background: var(--bg-tertiary);
  border-radius: var(--radius-full);
  overflow: hidden;
}

.level-fill {
  height: 100%;
  background: #4f46e5;
  border-radius: var(--radius-full);
}

.level-hint {
  font-size: 0.78rem;
  color: var(--text-muted);
}

/* 7-Day Forecast */
.forecast-section {
  padding: 1.5rem 1.75rem;
  border-radius: var(--radius-2xl);
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  box-shadow: var(--shadow-sm);
}

.section-title-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.35rem;
}

.title-with-icon {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.section-title-row h3 {
  font-size: 1.15rem;
  font-weight: 700;
  margin: 0;
  color: var(--text-primary);
}

.forecast-badge {
  font-size: 0.72rem;
  font-weight: 700;
  background: var(--mint-50);
  color: var(--mint-700);
  padding: 0.2rem 0.55rem;
  border-radius: var(--radius-full);
}

[data-theme="dark"] .forecast-badge {
  background: rgba(21, 183, 158, 0.15);
  color: var(--mint-300);
}

.forecast-desc {
  font-size: 0.88rem;
  color: var(--text-muted);
  margin: 0 0 1.5rem;
}

.forecast-bars {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 0.75rem;
  height: 140px;
  padding-top: 1rem;
}

.forecast-col {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  height: 100%;
}

.bar-container {
  flex: 1;
  width: 100%;
  max-width: 44px;
  display: flex;
  align-items: flex-end;
  background: var(--bg-tertiary);
  border-radius: var(--radius-lg);
  overflow: hidden;
}

.bar-fill {
  width: 100%;
  background: var(--border-color);
  border-radius: var(--radius-lg);
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding-top: 0.35rem;
  transition: height 0.3s ease;
}

.bar-fill.has-words {
  background: linear-gradient(180deg, var(--mint-400) 0%, var(--mint-600) 100%);
}

.bar-count {
  font-size: 0.75rem;
  font-weight: 800;
  color: white;
}

.bar-label {
  font-size: 0.75rem;
  color: var(--text-muted);
  white-space: nowrap;
}

/* Weak Words */
.weak-words-section {
  padding: 1.5rem 1.75rem;
  border-radius: var(--radius-2xl);
  background: var(--card-bg);
  border: 1px solid var(--border-color);
}

.view-all-link {
  font-size: 0.88rem;
  font-weight: 600;
  color: var(--mint-600);
  text-decoration: none;
}

.view-all-link:hover {
  text-decoration: underline;
}

.weak-desc {
  font-size: 0.88rem;
  color: var(--text-muted);
  margin: 0 0 1rem;
}

.weak-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.65rem;
}

.weak-chip {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.45rem 0.85rem;
  border-radius: var(--radius-full);
  border: 1px solid rgba(239, 68, 68, 0.25);
  background: rgba(239, 68, 68, 0.05);
  font-size: 0.88rem;
  cursor: pointer;
  transition: all 0.15s ease;
}

.weak-chip:hover {
  border-color: #ef4444;
  transform: translateY(-1px);
}

.weak-word {
  font-weight: 700;
  color: var(--text-primary);
}

.weak-due {
  font-size: 0.72rem;
  color: #dc2626;
  font-weight: 600;
}

@media (max-width: 900px) {
  .status-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 700px) {
  .daily-goal-card {
    flex-direction: column;
    align-items: stretch;
    padding: 1.25rem;
  }
  .goal-action-col {
    align-items: stretch;
  }
  .btn-review-cta, .btn-learn-more-cta {
    width: 100%;
    justify-content: center;
  }
  .streak-xp-row {
    grid-template-columns: 1fr;
  }
  .status-grid {
    grid-template-columns: 1fr;
  }
}
</style>
