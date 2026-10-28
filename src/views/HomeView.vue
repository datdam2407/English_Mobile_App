<template>
  <div class="home-view animate-fadeIn">
    <section class="hero">
      <h1 class="hero-title">Học Tiếng Anh Hiệu Quả</h1>
      <p class="hero-subtitle">Flash Cards, Quiz và nhiều hơn nữa</p>
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
      <h2 class="section-title">
        <FeatherIcon type="book" :size="24" /> Sách Từ Vựng
      </h2>

      <div v-if="loading" class="loading">
        <span class="animate-pulse">Đang tải...</span>
      </div>

      <div v-else-if="books.length === 0" class="empty-state">
        <p>Chưa có sách nào.</p>
        <router-link to="/admin" class="btn btn-primary">
          Thêm sách mới
        </router-link>
      </div>

      <div v-else class="grid grid-cols-2">
        <BookCard v-for="book in books" :key="book.id" :book="book" :topic-count="topicCounts[book.id] || 0"
          @click="goToBook(book.id)" />
      </div>
    </section>

    <!-- 2. Học từ mới & Tiến trình học -->
    <section class="dashboard-section">
      <h2 class="section-title">
        <FeatherIcon type="trending-up" :size="24" /> Học Từ Mới & Tiến Trình
      </h2>
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
            <p>Học 8 loại từ cơ bản (Noun, Verb, Adj...) với quiz AI</p>
          </div>
          <FeatherIcon type="chevron-right" :size="20" class="practice-arrow" />
        </div>

        <div class="practice-card card card-clickable" @click="goToSpeaking">
          <div class="practice-icon" style="background: linear-gradient(135deg, #0EA5E9, #0284C7);">
            <FeatherIcon type="mic" :size="28" />
          </div>
          <div class="practice-info">
            <h3>Luyện phát âm AI</h3>
            <p>Thu âm & nhận phản hồi chuẩn xác ngữ điệu, âm đuôi</p>
          </div>
          <FeatherIcon type="chevron-right" :size="20" class="practice-arrow" />
        </div>

        <div class="practice-card card card-clickable" @click="startSRSReview">
          <div class="practice-icon srs-icon"
            style="background: linear-gradient(135deg, #FF6B35, #F7931E); position: relative;">
            <FeatherIcon type="clock" :size="28" />
            <span class="notification-badge" v-if="reviewStats.dueToday > 0">{{ reviewStats.dueToday }}</span>
          </div>
          <div class="practice-info">
            <h3>Ôn tập SRS</h3>
            <p v-if="reviewStats.dueToday > 0">{{ reviewStats.dueToday }} từ cần ôn tập ngay hôm nay</p>
            <p v-else>Đã hoàn thành bài ôn tập hôm nay!</p>
          </div>
          <FeatherIcon type="chevron-right" :size="20" class="practice-arrow" />
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import BookCard from '../components/BookCard.vue'
import FeatherIcon from '../components/FeatherIcon.vue'
import DashboardWidget from '../components/DashboardWidget.vue'
import { getAllBooks, getTopicsByBookId } from '../db/database.js'
import { getReviewStats } from '../services/srs.js'
import { usePWAInstall } from '../composables/usePWAInstall.js'

const router = useRouter()
const { isInstallable, isInstalled, isIOS, install } = usePWAInstall()
const books = ref([])
const topicCounts = ref({})
const loading = ref(true)
const dashboardRef = ref(null)
const reviewStats = ref({ dueToday: 0 })

async function handleInstallClick() {
  if (isInstallable.value) {
    await install()
  } else if (isIOS.value) {
    window.alert('Trên Safari iPhone/iPad: Nhấn nút Chia sẻ (Share icon ở thanh công cụ dưới), sau đó chọn "Thêm vào MH chính" (Add to Home Screen).')
  }
}

onMounted(async () => {
  try {
    // Load SRS stats instantly from local progress
    reviewStats.value = getReviewStats()

    // Load books with cached API
    const fetchedBooks = await getAllBooks()
    books.value = fetchedBooks

    // Topic counts are already calculated and returned with the books
    const counts = {}
    for (const book of fetchedBooks) {
      counts[book.id] = book.topicCount ?? 0
    }
    topicCounts.value = counts
  } catch (error) {
    console.error('Error loading books:', error)
  } finally {
    loading.value = false
  }
})

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
  padding-bottom: 2rem;
}

.hero {
  text-align: center;
  padding: 3rem 0;
  margin-bottom: 2rem;
}

.hero-title {
  font-size: 2.5rem;
  color: var(--mint-500);
  margin-bottom: 0.5rem;
}

.hero-subtitle {
  font-size: 1.25rem;
  color: var(--text-muted);
}

.section-title {
  font-size: 1.5rem;
  margin-bottom: 1.5rem;
  color: var(--text-primary);
  display: flex;
  align-items: center;
  gap: 0.5rem;
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

/* Mobile PWA Banner */
.mobile-pwa-banner {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 1.25rem;
  margin-bottom: 1.5rem;
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

@media (max-width: 768px) {
  .hero {
    padding: 1.5rem 0 1rem;
    margin-bottom: 1.25rem;
  }

  .hero-title {
    font-size: 1.65rem;
  }

  .hero-subtitle {
    font-size: 0.95rem;
  }

  .section-title {
    font-size: 1.25rem;
    margin-bottom: 1rem;
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

/* Sections */
.books-section,
.dashboard-section,
.ai-practice-section {
  margin-bottom: 2.5rem;
}

.practice-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
}

@media (max-width: 900px) {
  .practice-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 600px) {
  .practice-grid {
    grid-template-columns: 1fr;
  }
}

.practice-card {
  display: flex;
  align-items: center;
  gap: 1.25rem;
  padding: 1.25rem 1.5rem;
  border: 1px solid rgba(139, 92, 246, 0.2);
  background: linear-gradient(135deg, rgba(139, 92, 246, 0.05), rgba(124, 58, 237, 0.08));
}

.practice-card:hover {
  border-color: rgba(139, 92, 246, 0.4);
  transform: translateY(-2px);
}

.practice-icon {
  width: 56px;
  height: 56px;
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
  font-size: 1.1rem;
  color: var(--text-primary);
  margin-bottom: 0.25rem;
}

.practice-info p {
  font-size: 0.875rem;
  color: var(--text-muted);
  margin: 0;
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
  height: 24px;
  width: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  border: 2px solid var(--white);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}
</style>
