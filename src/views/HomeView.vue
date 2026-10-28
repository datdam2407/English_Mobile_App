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

    <!-- Quick Interactive Flashcard Modal -->
    <Transition name="modal-fade">
      <div v-if="showFlashcardModal" class="flashcard-modal-backdrop" @click.self="showFlashcardModal = false">
        <div class="flashcard-modal-box card animate-slideUp">
          <div class="modal-header-row">
            <div class="modal-title-wrap">
              <span class="modal-badge">
                <FeatherIcon type="layers" :size="13" /> Flashcard Deck
              </span>
              <h3 class="modal-title">Lật Thẻ Từ Vựng Cốt Lõi</h3>
            </div>
            <button class="btn-close-circle" @click="showFlashcardModal = false" title="Đóng">
              <FeatherIcon type="x" :size="18" />
            </button>
          </div>

          <Flashcard
            :cards="featuredFlashcards"
            title="Luyện nhớ từ"
            @completed="showFlashcardModal = false"
          />
        </div>
      </div>
    </Transition>

    <!-- SECTION 1: Today's Learning & Daily Goal Hero -->
    <section class="today-hero card">
      <div class="today-hero-header">
        <div class="today-hero-title-group">
          <span class="greeting-badge">
            <FeatherIcon type="sun" :size="14" /> {{ greetingText }}
          </span>
          <h1 class="today-greeting">Sẵn sàng học tiếng Anh hôm nay?</h1>
        </div>
        <button class="btn btn-ghost btn-sm btn-goal-edit" @click="showOnboarding = true" title="Điều chỉnh mục tiêu">
          <FeatherIcon type="settings" :size="14" />
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
            <FeatherIcon type="star" :size="16" class="text-amber-500 goal-star-icon" />
            <span v-if="goalPercentage >= 100">Xuất sắc! Bạn đã hoàn thành mục tiêu ngày hôm nay! 🎉</span>
            <span v-else-if="goalPercentage > 0">Bạn đang tiến bộ rất tốt, còn {{ remainingWords }} từ nữa thôi!</span>
            <span v-else>Khởi động ngày mới với 5 từ vựng hoặc ôn lại các từ sắp quên nhé.</span>
          </p>
          <button class="btn btn-primary btn-sm btn-continue" @click="continueLearning">
            <span>{{ reviewStats.dueToday > 0 ? 'Ôn tập ngay' : 'Tiếp tục học' }}</span>
            <FeatherIcon type="arrow-right" :size="15" />
          </button>
        </div>
      </div>

      <!-- Quick Action Cards (3 Nhu cầu: Ôn tập, Học mới Flashcard, Tra từ) -->
      <div class="quick-actions-grid">
        <!-- 1. Ôn tập từ vựng -->
        <div class="action-card card-clickable" @click="startSRSReview">
          <div class="action-card-icon review-bg">
            <FeatherIcon type="repeat" :size="20" />
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
          <FeatherIcon type="chevron-right" :size="16" class="action-arrow" />
        </div>

        <!-- 2. Học từ mới & Lật Flashcard -->
        <div class="action-card card-clickable" @click="openFlashcardDeck">
          <div class="action-card-icon learn-bg">
            <FeatherIcon type="layers" :size="20" />
          </div>
          <div class="action-card-body">
            <div class="action-card-header">
              <span class="action-title">Học từ mới (Flashcard)</span>
              <span class="action-pill accent">Lật thẻ 3D</span>
            </div>
            <p class="action-desc">Chạm lật thẻ xem định nghĩa & phát âm</p>
          </div>
          <FeatherIcon type="chevron-right" :size="16" class="action-arrow" />
        </div>

        <!-- 3. Tra cứu nhanh -->
        <div class="action-card card-clickable" @click="goToDictionary">
          <div class="action-card-icon dict-bg">
            <FeatherIcon type="search" :size="20" />
          </div>
          <div class="action-card-body">
            <div class="action-card-header">
              <span class="action-title">Tra từ điển nhanh</span>
              <span class="action-pill neutral">UK & US audio</span>
            </div>
            <p class="action-desc">Tra nghĩa, IPA, ví dụ và phát âm chuẩn</p>
          </div>
          <FeatherIcon type="chevron-right" :size="16" class="action-arrow" />
        </div>
      </div>
    </section>

    <!-- SECTION 2: Sách Từ Vựng (Unified layout matching the other sections) -->
    <section class="books-section card">
      <div class="today-hero-header books-header-row">
        <div class="today-hero-title-group">
          <span class="greeting-badge books-badge">
            <FeatherIcon type="book-open" :size="14" /> Thư viện từ vựng
          </span>
          <h2 class="today-greeting books-title">Sách Từ Vựng</h2>
        </div>
        <div class="books-header-actions">
          <span class="books-count-badge" v-if="books.length > 0">
            <FeatherIcon type="layers" :size="13" /> {{ books.length }} bộ sách
          </span>
        </div>
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

      <div v-else class="books-grid">
        <BookCard
          v-for="book in books"
          :key="book.id"
          :book="book"
          :topic-count="topicCounts[book.id] || 0"
          @click="goToBook(book.id)"
        />
      </div>
    </section>

    <!-- SECTION 3: Luyện tập với AI (Unified layout matching Section 1 & Section 2) -->
    <section class="ai-practice-section card">
      <div class="today-hero-header ai-header-row">
        <div class="today-hero-title-group">
          <span class="greeting-badge ai-badge">
            <FeatherIcon type="cpu" :size="14" /> Trí tuệ nhân tạo
          </span>
          <h2 class="today-greeting ai-title">Luyện Tập Với AI</h2>
        </div>
        <div class="books-header-actions">
          <span class="books-count-badge">
            <FeatherIcon type="activity" :size="13" /> 3 chế độ luyện
          </span>
        </div>
      </div>

      <div class="practice-grid">
        <!-- Mode 1: Phân loại từ -->
        <div class="practice-card card-clickable" @click="goToWordTypes">
          <div class="practice-icon word-type-bg">
            <FeatherIcon type="git-branch" :size="20" />
          </div>
          <div class="practice-info">
            <div class="card-inner-top">
              <h3 class="practice-card-title">Phân loại từ</h3>
              <span class="action-pill accent">8 loại từ</span>
            </div>
            <p class="practice-card-desc">Học Danh, Động, Tính từ với quiz AI tương tác</p>
          </div>
          <FeatherIcon type="chevron-right" :size="16" class="practice-arrow" />
        </div>

        <!-- Mode 2: Phát âm AI -->
        <div class="practice-card card-clickable" @click="goToSpeaking">
          <div class="practice-icon speaking-bg">
            <FeatherIcon type="mic" :size="20" />
          </div>
          <div class="practice-info">
            <div class="card-inner-top">
              <h3 class="practice-card-title">Luyện phát âm AI</h3>
              <span class="action-pill neutral">UK & US</span>
            </div>
            <p class="practice-card-desc">Thu âm & chấm điểm ngữ điệu, âm đuôi chuẩn xác</p>
          </div>
          <FeatherIcon type="chevron-right" :size="16" class="practice-arrow" />
        </div>

        <!-- Mode 3: Ôn tập SRS -->
        <div class="practice-card card-clickable" @click="startSRSReview">
          <div class="practice-icon srs-bg">
            <FeatherIcon type="clock" :size="20" />
            <span class="notification-badge" v-if="reviewStats.dueToday > 0">{{ reviewStats.dueToday }}</span>
          </div>
          <div class="practice-info">
            <div class="card-inner-top">
              <h3 class="practice-card-title">Ôn tập SRS</h3>
              <span class="action-pill due" v-if="reviewStats.dueToday > 0">{{ reviewStats.dueToday }} từ đến hạn</span>
              <span class="action-pill clean" v-else>Đã hoàn thành</span>
            </div>
            <p class="practice-card-desc">Thuật toán SM-2 nhắc nhở đúng thời điểm vàng</p>
          </div>
          <FeatherIcon type="chevron-right" :size="16" class="practice-arrow" />
        </div>
      </div>
    </section>

    <!-- Mobile PWA App Banner -->
    <div v-if="!isInstalled && (isInstallable || isIOS)" class="mobile-pwa-banner card">
      <div class="banner-icon-col">
        <FeatherIcon type="smartphone" :size="26" />
      </div>
      <div class="banner-text-col">
        <span class="banner-title">Cài đặt EngLearn Mobile App</span>
        <p class="banner-desc">Thêm ứng dụng vào màn hình chính để học tiếng Anh toàn màn hình mượt mà và tiện lợi.</p>
      </div>
      <button class="btn btn-primary btn-sm btn-install-now" @click="handleInstallClick">
        <FeatherIcon :type="isIOS ? 'info' : 'download'" :size="15" />
        {{ isIOS ? 'Xem cách cài' : 'Cài đặt' }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import BookCard from '../components/BookCard.vue'
import FeatherIcon from '../components/FeatherIcon.vue'
import Flashcard from '../components/Flashcard.vue'
import OnboardingModal from '../components/OnboardingModal.vue'
import WordDetailModal from '../components/WordDetailModal.vue'
import { getAllBooks } from '../db/database.js'
import { getReviewStats } from '../services/srs.js'
import { dictionaryStorage } from '../services/dictionaryStorage.js'
import { usePWAInstall } from '../composables/usePWAInstall.js'
import { api } from '../services/api.js'

const router = useRouter()
const { isInstallable, isInstalled, isIOS, install } = usePWAInstall()

const books = ref([])
const topicCounts = ref({})
const loading = ref(true)
const reviewStats = ref({ dueToday: 0, reviewedToday: 0, newToday: 0 })
const showOnboarding = ref(false)
const showFlashcardModal = ref(false)
const userGoal = ref(dictionaryStorage.getUserGoal())

const selectedWord = ref(null)
const isWordDetailOpen = ref(false)
const featuredFlashcards = ref([])

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

function openFlashcardDeck() {
  showFlashcardModal.value = true
}

onMounted(async () => {
  if (!dictionaryStorage.isOnboarded()) {
    showOnboarding.value = true
  }

  try {
    reviewStats.value = getReviewStats()
    userGoal.value = dictionaryStorage.getUserGoal()

    const fetchedBooks = await getAllBooks()
    books.value = fetchedBooks

    const counts = {}
    for (const book of fetchedBooks) {
      counts[book.id] = book.topicCount ?? 0
    }
    topicCounts.value = counts

    try {
      const allWords = await api.getAllWords()
      if (allWords && allWords.length > 0) {
        featuredFlashcards.value = allWords.slice(0, 15)
      }
    } catch (e) {
      console.warn('Could not load words for flashcard', e)
    }
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
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
  overflow-x: hidden;
  padding-bottom: 2.5rem;
}

/* ========================================================
   UNIFIED SECTION CARDS (Section 1, Section 2, Section 3)
   ======================================================== */
.today-hero,
.books-section,
.ai-practice-section {
  background: linear-gradient(135deg, rgba(21, 183, 158, 0.08) 0%, rgba(14, 147, 132, 0.14) 100%);
  border: 1px solid rgba(21, 183, 158, 0.28);
  border-radius: var(--radius-xl);
  padding: 1.25rem 1.4rem;
  margin-bottom: 1.5rem;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
  overflow: hidden;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.03);
}

.ai-practice-section {
  background: linear-gradient(135deg, rgba(139, 92, 246, 0.06) 0%, rgba(124, 58, 237, 0.12) 100%);
  border-color: rgba(139, 92, 246, 0.26);
}

/* ========================================================
   UNIFIED SECTION HEADERS
   ======================================================== */
.today-hero-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 0.75rem;
  margin-bottom: 1.15rem;
}

.today-hero-title-group {
  min-width: 0;
  flex: 1;
}

.greeting-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--mint-600);
  background: rgba(21, 183, 158, 0.15);
  padding: 0.2rem 0.6rem;
  border-radius: 9999px;
  margin-bottom: 0.35rem;
}

.books-badge {
  color: #0284c7;
  background: rgba(2, 132, 199, 0.14);
}

.ai-badge {
  color: #8b5cf6;
  background: rgba(139, 92, 246, 0.14);
}

.today-greeting {
  font-size: 1.35rem;
  font-weight: 800;
  color: var(--text-primary);
  margin: 0;
  line-height: 1.25;
  word-break: break-word;
}

.btn-goal-edit {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.8rem;
  color: var(--text-muted);
  border: 1px solid var(--border-color);
  padding: 0.35rem 0.65rem;
  border-radius: 9999px;
  background: var(--card-bg);
  flex-shrink: 0;
  white-space: nowrap;
}

.books-count-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.78rem;
  font-weight: 700;
  color: var(--text-muted);
  background: var(--card-bg);
  padding: 0.3rem 0.65rem;
  border-radius: 9999px;
  border: 1px solid var(--border-color);
  white-space: nowrap;
}

/* ========================================================
   DAILY GOAL CARD (INSIDE SECTION 1)
   ======================================================== */
.daily-goal-box {
  background: var(--card-bg);
  border-radius: var(--radius-lg);
  padding: 1.1rem 1.2rem;
  border: 1px solid var(--border-color);
  margin-bottom: 1.1rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
}

.goal-info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.65rem;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.goal-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.goal-title {
  font-size: 0.78rem;
  font-weight: 800;
  letter-spacing: 0.06em;
  color: var(--text-muted);
}

.goal-tag {
  font-size: 0.72rem;
  font-weight: 600;
  color: var(--mint-600);
  background: rgba(21, 183, 158, 0.12);
  padding: 0.12rem 0.45rem;
  border-radius: 9999px;
  white-space: nowrap;
}

.goal-counter {
  font-weight: 800;
  white-space: nowrap;
}

.goal-current {
  font-size: 1.3rem;
  color: var(--mint-600);
}

.goal-target {
  font-size: 0.9rem;
  color: var(--text-muted);
  margin-left: 0.2rem;
}

.goal-progress-bar {
  width: 100%;
  height: 8px;
  background: var(--border-color);
  border-radius: 9999px;
  overflow: hidden;
  margin-bottom: 0.75rem;
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
  gap: 0.75rem;
}

.goal-message {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  font-size: 0.84rem;
  color: var(--text-secondary);
  margin: 0;
  line-height: 1.35;
  min-width: 0;
  flex: 1;
}

.goal-star-icon {
  flex-shrink: 0;
}

.btn-continue {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.5rem 0.95rem;
  font-size: 0.85rem;
  font-weight: 700;
  flex-shrink: 0;
  white-space: nowrap;
}

/* ========================================================
   UNIFIED GRIDS (Section 1, Section 2, Section 3)
   ======================================================== */
.quick-actions-grid,
.practice-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.75rem;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
}

.books-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.75rem;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
}

/* ========================================================
   UNIFIED INNER CARDS (ActionCard, BookCard, PracticeCard)
   ======================================================== */
.action-card,
.practice-card {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  padding: 0.85rem 1rem;
  width: 100%;
  max-width: 100%;
  min-width: 0;
  box-sizing: border-box;
  transition: all 0.2s ease;
  cursor: pointer;
}

.action-card:hover,
.practice-card:hover {
  transform: translateY(-2px);
  border-color: var(--mint-400);
  box-shadow: 0 4px 12px rgba(21, 183, 158, 0.12);
}

.action-card-icon,
.practice-icon {
  width: 40px;
  height: 40px;
  border-radius: 11px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
  position: relative;
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

.word-type-bg {
  background: linear-gradient(135deg, #8b5cf6, #7c3aed);
}

.speaking-bg {
  background: linear-gradient(135deg, #0ea5e9, #0284c7);
}

.srs-bg {
  background: linear-gradient(135deg, #ff6b35, #f7931e);
}

.action-card-body,
.practice-info {
  flex: 1;
  min-width: 0;
  overflow: hidden;
}

.action-card-header,
.card-inner-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.4rem;
  margin-bottom: 0.15rem;
}

.action-title,
.practice-card-title {
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.action-pill {
  font-size: 0.68rem;
  font-weight: 700;
  padding: 0.1rem 0.45rem;
  border-radius: 9999px;
  white-space: nowrap;
  flex-shrink: 0;
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

.action-desc,
.practice-card-desc {
  font-size: 0.76rem;
  color: var(--text-muted);
  margin: 0;
  line-height: 1.35;
  white-space: normal;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

.action-arrow,
.practice-arrow {
  color: var(--text-muted);
  flex-shrink: 0;
  margin-left: 0.2rem;
  transition: transform 0.2s;
}

.action-card:hover .action-arrow,
.practice-card:hover .practice-arrow {
  transform: translateX(2px);
  color: var(--mint-500);
}

.notification-badge {
  position: absolute;
  top: -6px;
  right: -6px;
  background-color: #ef4444;
  color: white;
  font-size: 0.68rem;
  font-weight: bold;
  height: 19px;
  width: 19px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  border: 2px solid var(--white);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

/* ========================================================
   MOBILE PWA BANNER
   ======================================================== */
.mobile-pwa-banner {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  padding: 0.9rem 1.1rem;
  margin-bottom: 1.5rem;
  background: linear-gradient(135deg, rgba(21, 183, 158, 0.12), rgba(14, 147, 132, 0.18));
  border: 1px solid var(--mint-300);
  border-radius: var(--radius-xl);
  box-sizing: border-box;
  width: 100%;
}

.banner-icon-col {
  width: 42px;
  height: 42px;
  border-radius: 11px;
  background: var(--mint-500);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.banner-text-col {
  flex: 1;
  min-width: 0;
}

.banner-title {
  display: block;
  font-weight: 700;
  font-size: 0.92rem;
  color: var(--text-primary);
  margin-bottom: 0.15rem;
}

.banner-desc {
  font-size: 0.78rem;
  color: var(--text-muted);
  margin: 0;
  line-height: 1.35;
}

.btn-install-now {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.5rem 0.85rem;
  font-size: 0.82rem;
  font-weight: 600;
  white-space: nowrap;
}

.loading {
  text-align: center;
  padding: 2.5rem;
  color: var(--text-muted);
}

.empty-state {
  text-align: center;
  padding: 2rem 1.25rem;
  background-color: var(--card-bg);
  border-radius: var(--radius-xl);
  border: 2px dashed var(--border-color);
  box-sizing: border-box;
}

.empty-state p {
  color: var(--text-muted);
  margin-bottom: 1rem;
}

/* ========================================================
   FLASHCARD MODAL
   ======================================================== */
.flashcard-modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.65);
  backdrop-filter: blur(4px);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

.flashcard-modal-box {
  width: 100%;
  max-width: 580px;
  background: var(--card-bg);
  border-radius: var(--radius-xl);
  padding: 1.25rem 1.35rem;
  border: 1px solid var(--border-color);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.25);
  box-sizing: border-box;
}

.modal-header-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1.15rem;
}

.modal-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  color: var(--mint-600);
  background: rgba(21, 183, 158, 0.12);
  padding: 0.2rem 0.55rem;
  border-radius: 9999px;
  margin-bottom: 0.25rem;
}

.modal-title {
  font-size: 1.2rem;
  font-weight: 800;
  color: var(--text-primary);
  margin: 0;
}

.btn-close-circle {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 1px solid var(--border-color);
  background: var(--card-bg);
  color: var(--text-muted);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-close-circle:hover {
  color: var(--text-primary);
  border-color: var(--mint-400);
}

/* ========================================================
   RESPONSIVE ADJUSTMENTS (Tablets & Mobile)
   ======================================================== */
@media (max-width: 860px) {
  .quick-actions-grid {
    grid-template-columns: 1fr;
  }

  .books-grid {
    grid-template-columns: 1fr;
  }

  .practice-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 640px) {
  .today-hero,
  .books-section,
  .ai-practice-section {
    padding: 0.95rem 0.85rem;
    margin-bottom: 1.15rem;
    border-radius: var(--radius-lg);
  }

  .today-hero-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.55rem;
  }

  .today-greeting {
    font-size: 1.2rem;
  }

  .daily-goal-box {
    padding: 0.8rem;
    margin-bottom: 0.8rem;
  }

  .goal-footer {
    flex-direction: column;
    align-items: stretch;
    gap: 0.65rem;
  }

  .btn-continue {
    width: 100%;
    justify-content: center;
    padding: 0.55rem;
  }

  .action-card,
  .practice-card {
    padding: 0.7rem 0.8rem;
    gap: 0.65rem;
  }

  .action-card-icon,
  .practice-icon {
    width: 38px;
    height: 38px;
  }

  .action-title,
  .practice-card-title {
    font-size: 0.88rem;
  }

  .mobile-pwa-banner {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.65rem;
    padding: 0.85rem;
  }

  .mobile-pwa-banner .btn-install-now {
    width: 100%;
    justify-content: center;
  }

  .flashcard-modal-box {
    padding: 0.9rem;
  }
}
</style>
