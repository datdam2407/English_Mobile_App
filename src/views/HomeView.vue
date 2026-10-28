<template>
  <div class="home-view animate-fadeIn">
    <!-- Onboarding Modal for First Time Visitors -->
    <OnboardingModal
      :is-open="showOnboarding"
      @completed="handleOnboardingComplete"
      @close="showOnboarding = false"
    />

    <!-- Quick Word Detail Modal -->
    <WordDetailModal
      v-if="selectedWord"
      :is-open="isWordDetailOpen"
      :word="selectedWord"
      @close="isWordDetailOpen = false"
    />

    <!-- Today's Learning & Daily Goal Hero -->
    <section class="today-hero card">
      <div class="today-hero-header">
        <div>
          <span class="greeting-badge">
            <FeatherIcon type="sun" :size="14" /> {{ greetingText }}
          </span>
          <h1 class="today-greeting">Sẵn sàng học tiếng Anh hôm nay?</h1>
        </div>
        <button class="btn btn-ghost btn-sm btn-goal-edit" @click="showOnboarding = true" title="Điều chỉnh mục tiêu">
          <FeatherIcon type="settings" :size="15" />
          <span>{{ userGoal.targetName || 'Mục tiêu' }}</span>
        </button>
      </div>

      <!-- Daily Goal Progress -->
      <div class="daily-goal-box">
        <div class="goal-info-row">
          <div class="goal-label">
            <span class="goal-title">MỤC TIÊU HÔM NAY</span>
            <span class="goal-tag">{{ userGoal.minutesPerDay || 10 }} phút / ngày</span>
          </div>
          <div class="goal-counter">
            <span class="goal-current">{{ todayStudiedCount }}</span>
            <span class="goal-target">/ {{ userGoal.dailyWords || 10 }} từ</span>
          </div>
        </div>

        <div class="goal-progress-bar">
          <div
            class="goal-progress-fill"
            :style="{ width: `${goalPercentage}%` }"
          ></div>
        </div>

        <div class="goal-footer">
          <p class="goal-message">
            <FeatherIcon type="sparkles" :size="16" class="text-amber-500" />
            <span v-if="goalPercentage >= 100">Xuất sắc! Bạn đã hoàn thành mục tiêu ngày hôm nay! 🎉</span>
            <span v-else-if="goalPercentage > 0">Bạn đang tiến bộ rất tốt, còn {{ remainingWords }} từ nữa thôi!</span>
            <span v-else>Khởi động ngày mới với 5 từ vựng hoặc ôn lại các từ sắp quên nhé.</span>
          </p>
          <button class="btn btn-primary btn-sm btn-continue" @click="continueLearning">
            <span>{{ reviewStats.dueToday > 0 ? 'Ôn tập ngay' : 'Tiếp tục học' }}</span>
            <FeatherIcon type="arrow-right" :size="16" />
          </button>
        </div>
      </div>

      <!-- Quick Action Cards (3 Nhu cầu: Ôn tập, Học mới, Tra từ) -->
      <div class="quick-actions-grid">
        <!-- 1. Ôn tập từ vựng -->
        <div class="action-card card-clickable" @click="startSRSReview">
          <div class="action-card-icon review-bg">
            <FeatherIcon type="repeat" :size="22" />
          </div>
          <div class="action-card-body">
            <div class="action-card-header">
              <span class="action-title">Ôn tập từ vựng</span>
              <span class="action-pill due" v-if="reviewStats.dueToday > 0">
                {{ reviewStats.dueToday }} từ đến hạn
              </span>
              <span class="action-pill clean" v-else>
                Đã hoàn tất
              </span>
            </div>
            <p class="action-desc">Lặp lại ngắt quãng (SM-2) chống quên từ</p>
          </div>
          <FeatherIcon type="chevron-right" :size="18" class="action-arrow" />
        </div>

        <!-- 2. Học từ mới -->
        <div class="action-card card-clickable" @click="goToLearnNewWords">
          <div class="action-card-icon learn-bg">
            <FeatherIcon type="book-open" :size="22" />
          </div>
          <div class="action-card-body">
            <div class="action-card-header">
              <span class="action-title">Học từ mới</span>
              <span class="action-pill accent">~5 từ · 3 phút</span>
            </div>
            <p class="action-desc">Oxford 3000 & 600 từ TOEIC thiết yếu</p>
          </div>
          <FeatherIcon type="chevron-right" :size="18" class="action-arrow" />
        </div>

        <!-- 3. Tra cứu nhanh -->
        <div class="action-card card-clickable" @click="goToDictionary">
          <div class="action-card-icon dict-bg">
            <FeatherIcon type="search" :size="22" />
          </div>
          <div class="action-card-body">
            <div class="action-card-header">
              <span class="action-title">Tra từ điển nhanh</span>
              <span class="action-pill neutral">UK & US audio</span>
            </div>
            <p class="action-desc">Tra nghĩa, IPA, ví dụ và phát âm chuẩn</p>
          </div>
          <FeatherIcon type="chevron-right" :size="18" class="action-arrow" />
        </div>
      </div>
    </section>

    <!-- Mobile PWA App Banner -->
    <div v-if="!isInstalled && (isInstallable || isIOS)" class="mobile-pwa-banner card">
      <div class="banner-icon-col">
        <FeatherIcon type="smartphone" :size="28" />
      </div>
      <div class="banner-text-col">
        <span class="banner-title">Cài đặt EngLearn Mobile App</span>
        <p class="banner-desc">Thêm ứng dụng vào màn hình chính để học tiếng Anh toàn màn hình mượt mà và tiện lợi.</p>
      </div>
      <button class="btn btn-primary btn-sm btn-install-now" @click="handleInstallClick">
        <FeatherIcon :type="isIOS ? 'info' : 'download'" :size="16" />
        {{ isIOS ? 'Xem cách cài' : 'Cài đặt' }}
      </button>
    </div>

    <!-- 1. Sách Từ Vựng -->
    <section class="books-section">
      <div class="section-header-row">
        <h2 class="section-title">
          <FeatherIcon type="book" :size="24" /> Sách Từ Vựng
        </h2>
        <span class="books-count-badge" v-if="books.length > 0">{{ books.length }} bộ sách</span>
      </div>

      <div v-if="loading" class="loading">
        <span class="animate-pulse">Đang tải sách từ vựng...</span>
      </div>

      <div v-else-if="books.length === 0" class="empty-state">
        <p>Chưa có sách nào.</p>
        <router-link to="/admin" class="btn btn-primary">
          Thêm sách mới
        </router-link>
      </div>

      <div v-else class="grid grid-cols-2">
        <BookCard
          v-for="book in books"
          :key="book.id"
          :book="book"
          :topic-count="topicCounts[book.id] || 0"
          @click="goToBook(book.id)"
        />
      </div>
    </section>

    <!-- 2. Học từ mới & Tiến trình học -->
    <section class="dashboard-section">
      <div class="section-header-row">
        <h2 class="section-title">
          <FeatherIcon type="trending-up" :size="24" /> Học Từ Mới & Tiến Trình
        </h2>
        <router-link to="/progress" class="view-more-link">
          Chi tiết <FeatherIcon type="arrow-right" :size="14" />
        </router-link>
      </div>
      <DashboardWidget ref="dashboardRef" />
    </section>

    <!-- 3. Luyện tập với AI -->
    <section class="ai-practice-section">
      <h2 class="section-title">
        <FeatherIcon type="cpu" :size="24" /> Luyện Tập Với AI
      </h2>
      <div class="practice-grid">
        <div class="practice-card card card-clickable" @click="goToWordTypes">
          <div class="practice-icon" style="background: linear-gradient(135deg, #8B5CF6, #7C3AED);">
            <FeatherIcon type="git-branch" :size="28" />
          </div>
          <div class="practice-info">
            <h3>Phân loại từ</h3>
            <p>Học 8 loại từ cơ bản (Noun, Verb, Adj...) với quiz AI tương tác</p>
          </div>
          <FeatherIcon type="chevron-right" :size="20" class="practice-arrow" />
        </div>

        <div class="practice-card card card-clickable" @click="goToSpeaking">
          <div class="practice-icon" style="background: linear-gradient(135deg, #0EA5E9, #0284C7);">
            <FeatherIcon type="mic" :size="28" />
          </div>
          <div class="practice-info">
            <h3>Luyện phát âm AI</h3>
            <p>Thu âm & nhận phản hồi chuẩn xác ngữ điệu, âm đuôi Anh-Anh và Anh-Mỹ</p>
          </div>
          <FeatherIcon type="chevron-right" :size="20" class="practice-arrow" />
        </div>

        <div class="practice-card card card-clickable" @click="startSRSReview">
          <div
            class="practice-icon srs-icon"
            style="background: linear-gradient(135deg, #FF6B35, #F7931E); position: relative;"
          >
            <FeatherIcon type="clock" :size="28" />
            <span class="notification-badge" v-if="reviewStats.dueToday > 0">{{ reviewStats.dueToday }}</span>
          </div>
          <div class="practice-info">
            <h3>Ôn tập SRS</h3>
            <p v-if="reviewStats.dueToday > 0">{{ reviewStats.dueToday }} từ cần ôn tập ngay hôm nay</p>
            <p v-else>Đã hoàn thành các từ đến hạn hôm nay!</p>
          </div>
          <FeatherIcon type="chevron-right" :size="20" class="practice-arrow" />
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import BookCard from '../components/BookCard.vue'
import FeatherIcon from '../components/FeatherIcon.vue'
import DashboardWidget from '../components/DashboardWidget.vue'
import OnboardingModal from '../components/OnboardingModal.vue'
import WordDetailModal from '../components/WordDetailModal.vue'
import { getAllBooks } from '../db/database.js'
import { getReviewStats } from '../services/srs.js'
import { dictionaryStorage } from '../services/dictionaryStorage.js'
import { usePWAInstall } from '../composables/usePWAInstall.js'

const router = useRouter()
const { isInstallable, isInstalled, isIOS, install } = usePWAInstall()

const books = ref([])
const topicCounts = ref({})
const loading = ref(true)
const dashboardRef = ref(null)
const reviewStats = ref({ dueToday: 0, reviewedToday: 0, newToday: 0 })
const showOnboarding = ref(false)
const userGoal = ref(dictionaryStorage.getUserGoal())

const selectedWord = ref(null)
const isWordDetailOpen = ref(false)

const greetingText = computed(() => {
  const hour = new Date().getHours()
  if (hour < 12) return 'Chào buổi sáng'
  if (hour < 18) return 'Chào buổi chiều'
  return 'Chào buổi tối'
})

const todayStudiedCount = computed(() => {
  return (reviewStats.value.reviewedToday || 0) + (reviewStats.value.newToday || 0)
})

const remainingWords = computed(() => {
  const target = userGoal.value.dailyWords || 10
  return Math.max(0, target - todayStudiedCount.value)
})

const goalPercentage = computed(() => {
  const target = userGoal.value.dailyWords || 10
  if (target <= 0) return 100
  return Math.min(100, Math.round((todayStudiedCount.value / target) * 100))
})

async function handleInstallClick() {
  if (isInstallable.value) {
    await install()
  } else if (isIOS.value) {
    window.alert('Trên Safari iPhone/iPad: Nhấn nút Chia sẻ (Share icon ở thanh công cụ dưới), sau đó chọn "Thêm vào MH chính" (Add to Home Screen).')
  }
}

function handleOnboardingComplete(goal) {
  showOnboarding.value = false
  userGoal.value = goal || dictionaryStorage.getUserGoal()
}

onMounted(async () => {
  // Check if first-time user
  if (!dictionaryStorage.isOnboarded()) {
    showOnboarding.value = true
  }

  try {
    // Load SRS stats instantly from local progress
    reviewStats.value = getReviewStats()
    userGoal.value = dictionaryStorage.getUserGoal()

    // Load books with cached API
    const fetchedBooks = await getAllBooks()
    books.value = fetchedBooks

    // Topic counts
    const counts = {}
    for (const book of fetchedBooks) {
      counts[book.id] = book.topicCount ?? 0
    }
    topicCounts.value = counts
  } catch (error) {
    console.error('Error loading home data:', error)
  } finally {
    loading.value = false
  }
})

function continueLearning() {
  if (reviewStats.value.dueToday > 0) {
    router.push('/review')
  } else if (books.value.length > 0) {
    router.push(`/book/${books.value[0].id}`)
  } else {
    router.push('/progress')
  }
}

function goToLearnNewWords() {
  if (books.value.length > 0) {
    router.push(`/book/${books.value[0].id}`)
  } else {
    router.push('/dictionary')
  }
}

function goToDictionary() {
  router.push('/dictionary')
}

function goToBook(id) {
  router.push(`/book/${id}`)
}

function goToWordTypes() {
  router.push('/word-types')
}

function goToSpeaking() {
  router.push('/speaking-practice')
}

function startSRSReview() {
  router.push('/review')
}
</script>

<style scoped>
.home-view {
  padding-bottom: 2.5rem;
}

/* Today Hero Card */
.today-hero {
  background: linear-gradient(135deg, rgba(21, 183, 158, 0.08) 0%, rgba(14, 147, 132, 0.14) 100%);
  border: 1px solid rgba(21, 183, 158, 0.28);
  border-radius: var(--radius-xl);
  padding: 1.5rem;
  margin-bottom: 2rem;
}

.today-hero-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1.25rem;
}

.greeting-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.8rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--mint-600);
  background: rgba(21, 183, 158, 0.15);
  padding: 0.25rem 0.65rem;
  border-radius: 9999px;
  margin-bottom: 0.4rem;
}

.today-greeting {
  font-size: 1.5rem;
  font-weight: 800;
  color: var(--text-primary);
  margin: 0;
}

.btn-goal-edit {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.82rem;
  color: var(--text-muted);
  border: 1px solid var(--border-color);
  padding: 0.35rem 0.75rem;
  border-radius: 9999px;
  background: var(--card-bg);
}

.daily-goal-box {
  background: var(--card-bg);
  border-radius: var(--radius-lg);
  padding: 1.25rem;
  border: 1px solid var(--border-color);
  margin-bottom: 1.25rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.goal-info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
}

.goal-label {
  display: flex;
  align-items: center;
  gap: 0.6rem;
}

.goal-title {
  font-size: 0.8rem;
  font-weight: 800;
  letter-spacing: 0.06em;
  color: var(--text-muted);
}

.goal-tag {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--mint-600);
  background: rgba(21, 183, 158, 0.12);
  padding: 0.15rem 0.5rem;
  border-radius: 9999px;
}

.goal-counter {
  font-weight: 800;
}

.goal-current {
  font-size: 1.4rem;
  color: var(--mint-600);
}

.goal-target {
  font-size: 0.95rem;
  color: var(--text-muted);
  margin-left: 0.2rem;
}

.goal-progress-bar {
  width: 100%;
  height: 10px;
  background: var(--border-color);
  border-radius: 9999px;
  overflow: hidden;
  margin-bottom: 0.85rem;
}

.goal-progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--mint-500), #10b981);
  border-radius: 9999px;
  transition: width 0.4s ease;
}

.goal-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
}

.goal-message {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.88rem;
  color: var(--text-secondary);
  margin: 0;
}

.btn-continue {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.55rem 1.1rem;
  font-weight: 700;
  flex-shrink: 0;
}

/* Quick Actions Grid */
.quick-actions-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.85rem;
}

.action-card {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  padding: 0.85rem 1rem;
  transition: all 0.2s ease;
}

.action-card:hover {
  transform: translateY(-2px);
  border-color: var(--mint-400);
  box-shadow: 0 4px 12px rgba(21, 183, 158, 0.12);
}

.action-card-icon {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
}

.review-bg {
  background: linear-gradient(135deg, #f97316, #ea580c);
}

.learn-bg {
  background: linear-gradient(135deg, #10b981, #059669);
}

.dict-bg {
  background: linear-gradient(135deg, #3b82f6, #2563eb);
}

.action-card-body {
  flex: 1;
  min-width: 0;
}

.action-card-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.2rem;
  flex-wrap: wrap;
}

.action-title {
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--text-primary);
}

.action-pill {
  font-size: 0.7rem;
  font-weight: 700;
  padding: 0.1rem 0.45rem;
  border-radius: 9999px;
}

.action-pill.due {
  background: #fee2e2;
  color: #dc2626;
}

.action-pill.clean {
  background: #dcfce7;
  color: #16a34a;
}

.action-pill.accent {
  background: #e0e7ff;
  color: #4f46e5;
}

.action-pill.neutral {
  background: #f1f5f9;
  color: #475569;
}

.action-desc {
  font-size: 0.78rem;
  color: var(--text-muted);
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.action-arrow {
  color: var(--text-muted);
  flex-shrink: 0;
}

/* Mobile PWA Banner */
.mobile-pwa-banner {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 1.25rem;
  margin-bottom: 1.75rem;
  background: linear-gradient(135deg, rgba(21, 183, 158, 0.12), rgba(14, 147, 132, 0.18));
  border: 1px solid var(--mint-300);
  border-radius: var(--radius-xl);
}

.banner-icon-col {
  width: 48px;
  height: 48px;
  border-radius: 14px;
  background: var(--mint-500);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.banner-text-col {
  flex: 1;
}

.banner-title {
  display: block;
  font-weight: 700;
  font-size: 1rem;
  color: var(--text-primary);
  margin-bottom: 0.2rem;
}

.banner-desc {
  font-size: 0.82rem;
  color: var(--text-muted);
  margin: 0;
}

.btn-install-now {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.6rem 1rem;
  font-weight: 600;
}

/* Section Common */
.section-header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.25rem;
}

.section-title {
  font-size: 1.35rem;
  font-weight: 800;
  color: var(--text-primary);
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0;
}

.books-count-badge {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--text-muted);
  background: var(--card-bg);
  padding: 0.25rem 0.65rem;
  border-radius: 9999px;
  border: 1px solid var(--border-color);
}

.view-more-link {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--mint-600);
  text-decoration: none;
}

.view-more-link:hover {
  text-decoration: underline;
}

.books-section,
.dashboard-section,
.ai-practice-section {
  margin-bottom: 2.25rem;
}

.loading {
  text-align: center;
  padding: 3rem;
  color: var(--text-muted);
}

.empty-state {
  text-align: center;
  padding: 3rem;
  background-color: var(--card-bg);
  border-radius: var(--radius-xl);
  border: 2px dashed var(--border-color);
}

.empty-state p {
  color: var(--text-muted);
  margin-bottom: 1rem;
}

/* AI Practice Section */
.practice-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
}

.practice-card {
  display: flex;
  align-items: center;
  gap: 1.15rem;
  padding: 1.15rem 1.35rem;
  border: 1px solid rgba(139, 92, 246, 0.2);
  background: linear-gradient(135deg, rgba(139, 92, 246, 0.05), rgba(124, 58, 237, 0.08));
}

.practice-card:hover {
  border-color: rgba(139, 92, 246, 0.4);
  transform: translateY(-2px);
}

.practice-icon {
  width: 52px;
  height: 52px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
}

.practice-info {
  flex: 1;
}

.practice-info h3 {
  font-size: 1.05rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 0.25rem;
}

.practice-info p {
  font-size: 0.85rem;
  color: var(--text-muted);
  margin: 0;
  line-height: 1.4;
}

.practice-arrow {
  color: var(--text-muted);
}

.notification-badge {
  position: absolute;
  top: -8px;
  right: -8px;
  background-color: #ef4444;
  color: white;
  font-size: 0.75rem;
  font-weight: bold;
  height: 22px;
  width: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  border: 2px solid var(--white);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

/* Responsive adjustments */
@media (max-width: 900px) {
  .quick-actions-grid {
    grid-template-columns: 1fr;
  }

  .practice-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 640px) {
  .today-hero {
    padding: 1.1rem;
    margin-bottom: 1.5rem;
  }

  .today-hero-header {
    flex-direction: column;
    gap: 0.75rem;
  }

  .today-greeting {
    font-size: 1.25rem;
  }

  .goal-footer {
    flex-direction: column;
    align-items: flex-start;
  }

  .btn-continue {
    width: 100%;
    justify-content: center;
  }

  .mobile-pwa-banner {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem;
    padding: 1rem;
  }

  .mobile-pwa-banner .btn-install-now {
    width: 100%;
    justify-content: center;
  }
}
</style>
