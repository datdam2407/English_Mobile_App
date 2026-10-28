<template>
  <div class="my-decks-view animate-fadeIn">
    <!-- Header (Selector 1) -->
    <div class="header">
      <div class="header-content">
        <div class="header-badge">
          <FeatherIcon type="layers" :size="14" />
          <span>Cá nhân hóa</span>
        </div>
        <h1>
          <FeatherIcon type="folder-plus" :size="28" class="title-icon" />
          <span>Bộ Từ Của Tôi</span>
        </h1>
        <p>Tạo và quản lý các danh sách từ vựng theo mục tiêu học tập cá nhân</p>
      </div>
      <button class="btn btn-primary btn-create-header" @click="handleCreateClick">
        <FeatherIcon :type="isAuthenticated ? 'plus' : 'log-in'" :size="18" />
        <span>{{ isAuthenticated ? 'Tạo bộ từ mới' : 'Đăng nhập để tạo bộ từ' }}</span>
      </button>
    </div>

    <!-- Stats -->
    <div class="stats-overview" v-if="topics.length > 0">
      <div class="stat-card">
        <span class="stat-value">{{ topics.length }}</span>
        <span class="stat-label">Bộ từ cá nhân</span>
      </div>
      <div class="stat-card">
        <span class="stat-value">{{ totalWords }}</span>
        <span class="stat-label">Tổng số từ vựng</span>
      </div>
    </div>

    <!-- Decks Grid -->
    <div class="decks-grid" v-if="loading">
      <div class="skeleton-card" v-for="i in 3" :key="i"></div>
    </div>

    <div class="decks-grid" v-else-if="topics.length > 0">
      <div v-for="topic in topics" :key="topic.id" class="topic-card card">
        <div class="topic-header">
          <div class="topic-icon">
            <FeatherIcon type="book" :size="24" />
          </div>
          <div class="topic-actions">
            <button class="btn-icon delete" @click="confirmDelete(topic)" title="Xóa bộ từ">
              <FeatherIcon type="trash-2" :size="16" />
            </button>
          </div>
        </div>

        <h3 class="topic-name">{{ topic.name }}</h3>
        <p class="topic-meta">{{ topic.wordCount ?? 0 }} từ vựng</p>

        <div class="topic-footer">
          <router-link :to="`/topic/${topic.id}`" class="btn btn-primary full-width">
            <span>Học bộ từ này</span>
            <FeatherIcon type="arrow-right" :size="16" />
          </router-link>
        </div>
      </div>
    </div>

    <!-- Empty State (Selector 2) -->
    <div class="empty-state" v-else>
      <div class="empty-icon-wrapper">
        <div class="empty-icon">
          <FeatherIcon type="layers" :size="42" />
        </div>
      </div>
      <span class="empty-badge">Chưa có bộ từ nào</span>
      <h2>Bắt đầu tạo bộ từ của riêng bạn</h2>
      <p>
        Thêm các chủ đề từ vựng chuyên sâu (IELTS, phỏng vấn xin việc, giao tiếp công sở, du lịch...) để học tập linh hoạt theo lộ trình cá nhân.
      </p>

      <div v-if="!isAuthenticated" class="auth-hint-box">
        <FeatherIcon type="info" :size="16" />
        <span>Tính năng này yêu cầu đăng nhập để lưu trữ bộ từ của bạn trên hệ thống đám mây.</span>
      </div>

      <button class="btn btn-primary btn-create-empty" @click="handleCreateClick">
        <FeatherIcon :type="isAuthenticated ? 'plus' : 'log-in'" :size="18" />
        <span>{{ isAuthenticated ? 'Tạo ngay' : 'Đăng nhập để tạo ngay' }}</span>
      </button>
    </div>

    <!-- Create Modal -->
    <div class="modal-overlay" v-if="showCreateModal" @click.self="showCreateModal = false">
      <div class="modal card">
        <div class="modal-header">
          <div class="modal-icon-title">
            <FeatherIcon type="folder-plus" :size="22" class="text-mint" />
            <h2>Tạo bộ từ mới</h2>
          </div>
          <button class="btn-close-modal" @click="showCreateModal = false">
            <FeatherIcon type="x" :size="18" />
          </button>
        </div>

        <div class="form-group">
          <label>Tên bộ từ</label>
          <input
            v-model="newTopicName"
            placeholder="Ví dụ: Từ vựng Du Lịch, IELTS Speaking Part 1..."
            class="form-input"
            @keyup.enter="createTopic"
            ref="inputRef"
          />
        </div>

        <div class="modal-actions">
          <button class="btn btn-ghost" @click="showCreateModal = false">Hủy</button>
          <button class="btn btn-primary" @click="createTopic" :disabled="!newTopicName.trim()">
            <FeatherIcon type="check" :size="18" /> Tạo bộ từ
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, nextTick, watch } from 'vue'
import { useRouter } from 'vue-router'
import { api } from '../services/api'
import { useAuth } from '../composables/useAuth.js'
import FeatherIcon from '../components/FeatherIcon.vue'

const router = useRouter()
const { isAuthenticated } = useAuth()
const topics = ref([])
const loading = ref(true)
const showCreateModal = ref(false)
const newTopicName = ref('')
const inputRef = ref(null)

const totalWords = computed(() => {
  return topics.value.reduce((acc, t) => acc + (t.wordCount || 0), 0)
})

watch(showCreateModal, (val) => {
  if (val) {
    nextTick(() => {
      inputRef.value?.focus()
    })
  }
})

onMounted(async () => {
  await fetchTopics()
})

async function fetchTopics() {
  loading.value = true
  try {
    if (!isAuthenticated.value) {
      topics.value = []
      return
    }
    const data = await api.getMyTopics()
    topics.value = Array.isArray(data) ? data : []
  } catch (error) {
    console.error('Failed to load topics:', error)
    topics.value = []
  } finally {
    loading.value = false
  }
}

function handleCreateClick() {
  if (!isAuthenticated.value) {
    // Navigate to login page as requested
    router.push('/login')
    return
  }
  showCreateModal.value = true
}

async function createTopic() {
  if (!newTopicName.value.trim()) return

  try {
    await api.createCustomTopic({
      name: newTopicName.value.trim(),
    })
    showCreateModal.value = false
    newTopicName.value = ''
    await fetchTopics()
  } catch (error) {
    console.error('Failed to create topic:', error)
    alert('Không thể tạo bộ từ. Vui lòng thử lại.')
  }
}

async function confirmDelete(topic) {
  if (confirm(`Bạn có chắc muốn xóa bộ từ "${topic.name}"?`)) {
    try {
      await api.deleteTopic(topic.id)
      await fetchTopics()
    } catch (error) {
      console.error('Failed to delete topic:', error)
      alert('Không thể xóa bộ từ.')
    }
  }
}
</script>

<style scoped>
.my-decks-view {
  padding: 1.5rem 0.5rem 3rem;
  max-width: 1100px;
  margin: 0 auto;
}

/* Header (Selector 1) */
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1.5rem;
  margin-bottom: 2rem;
  padding: 1.5rem 1.75rem;
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-2xl);
  box-shadow: var(--shadow-sm);
}

.header-content {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.header-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--mint-600);
  background: var(--mint-50);
  padding: 0.2rem 0.65rem;
  border-radius: var(--radius-full);
  width: fit-content;
}

[data-theme="dark"] .header-badge {
  background: rgba(21, 183, 158, 0.15);
  color: var(--mint-300);
}

.header-content h1 {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  margin: 0.15rem 0;
  font-size: 1.75rem;
  font-weight: 800;
  color: var(--text-primary);
  letter-spacing: -0.02em;
}

.title-icon {
  color: var(--mint-500);
}

.header-content p {
  color: var(--text-muted);
  font-size: 0.92rem;
  margin: 0;
  line-height: 1.45;
}

.btn-create-header {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.8rem 1.4rem;
  font-size: 0.95rem;
  font-weight: 600;
  border-radius: var(--radius-xl);
  background: linear-gradient(135deg, var(--mint-500) 0%, var(--mint-600) 100%);
  color: white;
  white-space: nowrap;
  box-shadow: 0 4px 12px rgba(21, 183, 158, 0.25);
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.btn-create-header:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 18px rgba(21, 183, 158, 0.35);
}

/* Stats Overview */
.stats-overview {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1.25rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: var(--card-bg);
  padding: 1.25rem 1.5rem;
  border-radius: var(--radius-xl);
  border: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
  align-items: center;
  box-shadow: var(--shadow-sm);
  transition: transform 0.2s;
}

.stat-card:hover {
  transform: translateY(-2px);
}

.stat-value {
  font-size: 2.25rem;
  font-weight: 800;
  color: var(--mint-600);
}

.stat-label {
  color: var(--text-muted);
  font-size: 0.85rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.03em;
}

/* Decks Grid */
.decks-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.25rem;
}

.topic-card {
  padding: 1.5rem;
  border-radius: var(--radius-xl);
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  transition: all 0.2s ease;
  display: flex;
  flex-direction: column;
  box-shadow: var(--shadow-sm);
}

.topic-card:hover {
  transform: translateY(-3px);
  box-shadow: var(--shadow-md);
  border-color: var(--mint-300);
}

.topic-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.topic-icon {
  width: 44px;
  height: 44px;
  background: var(--mint-50);
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--mint-600);
}

[data-theme="dark"] .topic-icon {
  background: rgba(21, 183, 158, 0.15);
  color: var(--mint-300);
}

.topic-actions {
  display: flex;
  gap: 0.4rem;
}

.btn-icon {
  width: 34px;
  height: 34px;
  border-radius: var(--radius-full);
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: transparent;
  color: var(--text-muted);
  cursor: pointer;
  transition: all 0.2s;
}

.btn-icon:hover {
  background: var(--bg-tertiary);
  color: var(--text-primary);
}

.btn-icon.delete:hover {
  background: #fee2e2;
  color: #ef4444;
}

.topic-name {
  font-size: 1.2rem;
  font-weight: 700;
  margin-bottom: 0.35rem;
  color: var(--text-primary);
}

.topic-meta {
  color: var(--text-muted);
  font-size: 0.88rem;
  margin-bottom: 1.25rem;
}

.topic-footer {
  margin-top: auto;
}

.full-width {
  width: 100%;
  justify-content: center;
  gap: 0.4rem;
}

/* Empty State (Selector 2) */
.empty-state {
  text-align: center;
  padding: 3.5rem 2rem;
  background: linear-gradient(135deg, var(--card-bg) 0%, var(--bg-secondary) 100%);
  border-radius: var(--radius-2xl);
  border: 2px dashed var(--border-color);
  box-shadow: var(--shadow-sm);
  max-width: 680px;
  margin: 1.5rem auto 0;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.empty-icon-wrapper {
  position: relative;
  margin-bottom: 1.25rem;
}

.empty-icon {
  width: 88px;
  height: 88px;
  background: linear-gradient(135deg, var(--mint-100) 0%, var(--mint-200) 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--mint-600);
  box-shadow: 0 10px 25px rgba(21, 183, 158, 0.2);
}

[data-theme="dark"] .empty-icon {
  background: linear-gradient(135deg, rgba(21, 183, 158, 0.25) 0%, rgba(21, 183, 158, 0.1) 100%);
  color: var(--mint-300);
}

.empty-badge {
  font-size: 0.8rem;
  font-weight: 700;
  color: var(--mint-600);
  background: var(--mint-50);
  padding: 0.25rem 0.85rem;
  border-radius: var(--radius-full);
  margin-bottom: 0.75rem;
}

[data-theme="dark"] .empty-badge {
  background: rgba(21, 183, 158, 0.15);
  color: var(--mint-300);
}

.empty-state h2 {
  font-size: 1.6rem;
  font-weight: 800;
  color: var(--text-primary);
  margin-bottom: 0.65rem;
  letter-spacing: -0.01em;
}

.empty-state p {
  color: var(--text-muted);
  max-width: 520px;
  margin: 0 auto 1.5rem;
  line-height: 1.6;
  font-size: 0.95rem;
}

.auth-hint-box {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.75rem 1rem;
  background: rgba(59, 130, 246, 0.08);
  border: 1px solid rgba(59, 130, 246, 0.2);
  border-radius: var(--radius-lg);
  color: #2563eb;
  font-size: 0.86rem;
  max-width: 500px;
  margin-bottom: 1.5rem;
  text-align: left;
}

[data-theme="dark"] .auth-hint-box {
  background: rgba(59, 130, 246, 0.15);
  color: #93c5fd;
}

.btn-create-empty {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  min-height: 48px;
  padding: 0.85rem 2rem;
  font-size: 1rem;
  font-weight: 600;
  border-radius: var(--radius-xl);
  background: linear-gradient(135deg, var(--mint-500) 0%, var(--mint-600) 100%);
  color: white;
  box-shadow: 0 6px 18px rgba(21, 183, 158, 0.3);
  transition: all 0.2s ease;
}

.btn-create-empty:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(21, 183, 158, 0.4);
}

/* Modal */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.55);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
  padding: 1rem;
}

.modal {
  width: 100%;
  max-width: 440px;
  border-radius: var(--radius-2xl);
  padding: 1.75rem;
  animation: slideUp 0.25s ease;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
}

@keyframes slideUp {
  from { transform: translateY(20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.5rem;
}

.modal-icon-title {
  display: flex;
  align-items: center;
  gap: 0.6rem;
}

.modal-header h2 {
  font-size: 1.35rem;
  font-weight: 700;
  margin: 0;
  color: var(--text-primary);
}

.btn-close-modal {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: none;
  background: var(--bg-tertiary);
  color: var(--text-muted);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-close-modal:hover {
  background: var(--border-color);
  color: var(--text-primary);
}

.form-group {
  margin-bottom: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-size: 0.88rem;
  font-weight: 600;
  color: var(--text-secondary);
}

.form-input {
  width: 100%;
  padding: 0.85rem 1rem;
  border: 1.5px solid var(--border-color);
  border-radius: var(--radius-lg);
  background: var(--bg-secondary);
  color: var(--text-primary);
  font-size: 1rem;
  transition: all 0.2s;
}

.form-input:focus {
  border-color: var(--mint-500);
  box-shadow: 0 0 0 3px rgba(21, 183, 158, 0.15);
  outline: none;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
}

/* Skeleton */
.skeleton-card {
  height: 180px;
  border-radius: var(--radius-xl);
  background: var(--bg-secondary);
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0% { opacity: 0.5; }
  50% { opacity: 0.8; }
  100% { opacity: 0.5; }
}

/* Tablet & Mobile Responsiveness */
@media (max-width: 768px) {
  .my-decks-view {
    padding: 1rem 0.25rem 2.5rem;
  }

  .header {
    flex-direction: column;
    align-items: stretch;
    padding: 1.25rem;
    gap: 1rem;
  }

  .header-content h1 {
    font-size: 1.45rem;
  }

  .header-content p {
    font-size: 0.85rem;
  }

  .btn-create-header {
    width: 100%;
    justify-content: center;
    padding: 0.75rem 1rem;
    font-size: 0.9rem;
  }

  .empty-state {
    padding: 2.5rem 1.25rem;
  }

  .empty-state h2 {
    font-size: 1.35rem;
  }

  .empty-state p {
    font-size: 0.88rem;
  }

  .btn-create-empty {
    width: 100%;
  }

  .decks-grid {
    grid-template-columns: 1fr;
  }
}
</style>
