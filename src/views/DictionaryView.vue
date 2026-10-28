<template>
  <div class="dictionary-view animate-fadeIn">
    <!-- Header -->
    <div class="dict-header">
      <div class="header-badge">
        <FeatherIcon type="book-open" :size="14" />
        <span>Oxford 3000 & TOEIC Essential</span>
      </div>
      <h1 class="dict-title">Từ Điển Tra Cứu Nhanh</h1>
      <p class="dict-subtitle">
        Tìm kiếm hơn 800+ từ vựng cốt lõi kèm phiên âm quốc tế IPA, phát âm chuẩn Anh-Anh (UK) & Anh-Mỹ (US).
      </p>

      <!-- Search Input Box -->
      <div class="search-box-wrapper">
        <div class="search-input-box">
          <FeatherIcon type="search" :size="20" class="search-icon" />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Nhập từ tiếng Anh hoặc nghĩa tiếng Việt (e.g. achieve, accept, hợp đồng)..."
            class="search-input"
            @input="handleSearchInput"
            ref="searchInputRef"
          />
          <button v-if="searchQuery" class="btn-clear" @click="clearSearch" title="Xóa tìm kiếm">
            <FeatherIcon type="x" :size="18" />
          </button>
        </div>
      </div>
    </div>

    <!-- View Mode Tabs -->
    <div class="tab-controls">
      <button
        class="tab-btn"
        :class="{ active: activeTab === 'all' }"
        @click="activeTab = 'all'"
      >
        <FeatherIcon type="list" :size="16" />
        <span>Tất cả từ ({{ allWords.length }})</span>
      </button>

      <button
        class="tab-btn"
        :class="{ active: activeTab === 'favorites' }"
        @click="activeTab = 'favorites'"
      >
        <FeatherIcon type="bookmark" :size="16" />
        <span>Từ đã lưu ({{ favorites.length }})</span>
      </button>

      <button
        class="tab-btn"
        :class="{ active: activeTab === 'history' }"
        @click="activeTab = 'history'"
      >
        <FeatherIcon type="clock" :size="16" />
        <span>Lịch sử tra cứu ({{ searchHistory.length }})</span>
      </button>
    </div>

    <!-- Level / Book Quick Filters (when in 'all' tab) -->
    <div class="filter-chips" v-if="activeTab === 'all'">
      <button
        v-for="f in filterOptions"
        :key="f.id"
        class="filter-chip"
        :class="{ active: selectedFilter === f.id }"
        @click="selectedFilter = f.id"
      >
        {{ f.label }}
      </button>
    </div>

    <!-- Word Lists -->
    <div class="words-container">
      <!-- Loading skeleton -->
      <div v-if="loading" class="word-skeleton-grid">
        <div v-for="i in 8" :key="i" class="word-skeleton-card"></div>
      </div>

      <!-- Empty State -->
      <div v-else-if="displayWords.length === 0" class="empty-state card">
        <div class="empty-icon-circle">
          <FeatherIcon :type="emptyStateIcon" :size="36" />
        </div>
        <h3>{{ emptyStateTitle }}</h3>
        <p>{{ emptyStateDesc }}</p>
        <button v-if="activeTab !== 'all'" class="btn btn-primary" @click="activeTab = 'all'">
          Khám phá danh sách từ vựng
        </button>
      </div>

      <!-- Word Cards Grid -->
      <div v-else class="words-grid">
        <div
          v-for="word in displayWords"
          :key="word.id"
          class="word-card card card-clickable"
          @click="openWordDetail(word)"
        >
          <div class="card-top">
            <div class="title-with-badge">
              <span class="word-english">{{ word.english }}</span>
              <span class="card-cefr-badge" :class="getCefrClass(word)">{{ getCefr(word) }}</span>
            </div>

            <!-- Bookmark Button -->
            <button
              class="btn-star"
              :class="{ starred: isWordFav(word.id) }"
              @click.stop="toggleFav(word)"
              :title="isWordFav(word.id) ? 'Bỏ lưu' : 'Lưu từ'"
            >
              <FeatherIcon :type="isWordFav(word.id) ? 'bookmark' : 'bookmark'" :size="18" />
            </button>
          </div>

          <div class="card-middle">
            <span class="word-ipa" v-if="word.pronunciation">{{ word.pronunciation }}</span>
            <span class="word-pos" v-if="getPartOfSpeech(word)">{{ getPartOfSpeech(word) }}</span>
          </div>

          <p class="word-vietnamese">{{ word.vietnamese }}</p>

          <!-- Audio Action Buttons -->
          <div class="card-bottom">
            <div class="audio-group" @click.stop>
              <button
                class="btn-accent-audio uk"
                :class="{ playing: isPlaying && currentPlayingWord === word.english && currentPlayingAccent === 'UK' }"
                @click="playAudioUK(word.english)"
                title="Phát âm giọng UK"
              >
                <span>🇬🇧 UK</span>
                <FeatherIcon type="volume-2" :size="13" />
              </button>
              <button
                class="btn-accent-audio us"
                :class="{ playing: isPlaying && currentPlayingWord === word.english && currentPlayingAccent === 'US' }"
                @click="playAudioUS(word.english)"
                title="Phát âm giọng US"
              >
                <span>🇺🇸 US</span>
                <FeatherIcon type="volume-2" :size="13" />
              </button>
            </div>

            <span class="topic-label" v-if="word.topic?.name">{{ word.topic.name }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Word Detail Modal -->
    <WordDetailModal
      :is-open="isModalOpen"
      :word="selectedWord"
      @close="isModalOpen = false"
      @select-word="handleRelatedWordClick"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import FeatherIcon from '../components/FeatherIcon.vue'
import WordDetailModal from '../components/WordDetailModal.vue'
import { api } from '../services/api'
import { useAudio } from '../composables/useAudio.js'
import { dictionaryStorage } from '../services/dictionaryStorage.js'

const { isPlaying, currentPlayingWord, currentPlayingAccent, playAudioUK, playAudioUS } = useAudio()

const allWords = ref([])
const loading = ref(true)
const searchQuery = ref('')
const activeTab = ref('all') // 'all', 'favorites', 'history'
const selectedFilter = ref('all') // 'all', 'oxford', 'toeic'

const isModalOpen = ref(false)
const selectedWord = ref(null)

const favorites = ref([])
const searchHistory = ref([])

const filterOptions = [
  { id: 'all', label: 'Tất cả' },
  { id: 'oxford', label: 'Oxford 3000' },
  { id: 'toeic', label: 'TOEIC 600' }
]

onMounted(async () => {
  loadLocalData()
  try {
    allWords.value = await api.getAllWords()
  } catch (error) {
    console.error('Failed to load dictionary words:', error)
  } finally {
    loading.value = false
  }
})

function loadLocalData() {
  favorites.value = dictionaryStorage.getFavorites()
  searchHistory.value = dictionaryStorage.getSearchHistory()
}

function handleSearchInput() {
  if (searchQuery.value.trim().length >= 2) {
    dictionaryStorage.addSearchHistory(searchQuery.value.trim())
    searchHistory.value = dictionaryStorage.getSearchHistory()
  }
}

function clearSearch() {
  searchQuery.value = ''
}

const displayWords = computed(() => {
  let source = []

  if (activeTab.value === 'favorites') {
    source = favorites.value
  } else if (activeTab.value === 'history') {
    // Match search history strings to word objects if possible
    const histNames = searchHistory.value.map(s => s.toLowerCase())
    source = allWords.value.filter(w => histNames.includes(w.english.toLowerCase()))
  } else {
    source = allWords.value
    if (selectedFilter.value === 'oxford') {
      source = source.filter(w => w.topic?.book?.name?.includes('Oxford'))
    } else if (selectedFilter.value === 'toeic') {
      source = source.filter(w => w.topic?.book?.name?.includes('TOEIC'))
    }
  }

  // Apply search query filter
  if (!searchQuery.value.trim()) {
    return source
  }

  const q = searchQuery.value.toLowerCase().trim()
  return source.filter(w =>
    w.english.toLowerCase().includes(q) ||
    w.vietnamese.toLowerCase().includes(q) ||
    (w.meaning && w.meaning.toLowerCase().includes(q))
  )
})

function isWordFav(wordId) {
  return dictionaryStorage.isFavorited(wordId)
}

function toggleFav(word) {
  dictionaryStorage.toggleFavorite(word)
  favorites.value = dictionaryStorage.getFavorites()
}

function openWordDetail(word) {
  selectedWord.value = word
  isModalOpen.value = true
  dictionaryStorage.addSearchHistory(word.english)
  searchHistory.value = dictionaryStorage.getSearchHistory()
}

function handleRelatedWordClick(wordText) {
  searchQuery.value = wordText
  activeTab.value = 'all'
}

function getCefr(word) {
  const len = word.english?.length || 5
  if (word.topic?.book?.name?.includes('Oxford')) {
    if (len <= 4) return 'A1'
    if (len <= 6) return 'A2'
    if (len <= 8) return 'B1'
    return 'B2'
  }
  return 'B2'
}

function getCefrClass(word) {
  return `cefr-${getCefr(word).toLowerCase()}`
}

function getPartOfSpeech(word) {
  const m = word.meaning || ''
  if (m.startsWith('v.') || m.includes('(v)')) return 'verb'
  if (m.startsWith('n.') || m.includes('(n)')) return 'noun'
  if (m.startsWith('adj.') || m.includes('(adj)')) return 'adj'
  if (m.startsWith('adv.') || m.includes('(adv)')) return 'adv'
  return ''
}

const emptyStateIcon = computed(() => {
  if (activeTab.value === 'favorites') return 'bookmark'
  if (activeTab.value === 'history') return 'clock'
  return 'search'
})

const emptyStateTitle = computed(() => {
  if (activeTab.value === 'favorites') return 'Chưa có từ vựng yêu thích'
  if (activeTab.value === 'history') return 'Chưa có lịch sử tra từ'
  return 'Không tìm thấy từ vựng phù hợp'
})

const emptyStateDesc = computed(() => {
  if (activeTab.value === 'favorites') {
    return 'Bấm vào biểu tượng bookmark ở bất kỳ từ nào để lưu và ôn tập lại nhanh chóng.'
  }
  if (activeTab.value === 'history') {
    return 'Khi bạn tra cứu từ vựng trên thanh tìm kiếm, lịch sử sẽ xuất hiện tại đây.'
  }
  return 'Hãy thử tìm từ tiếng Anh hoặc tiếng Việt khác trong kho từ điển.'
})
</script>

<style scoped>
.dictionary-view {
  padding: 1.5rem 0.5rem 4rem;
  max-width: 1100px;
  margin: 0 auto;
}

.dict-header {
  text-align: center;
  margin-bottom: 2rem;
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
  margin-bottom: 0.75rem;
}

[data-theme="dark"] .header-badge {
  background: rgba(21, 183, 158, 0.15);
  color: var(--mint-300);
}

.dict-title {
  font-size: 2.25rem;
  font-weight: 800;
  color: var(--text-primary);
  margin: 0 0 0.5rem;
  letter-spacing: -0.02em;
}

.dict-subtitle {
  max-width: 620px;
  color: var(--text-muted);
  font-size: 0.96rem;
  line-height: 1.5;
  margin: 0 0 1.5rem;
}

.search-box-wrapper {
  width: 100%;
  max-width: 640px;
}

.search-input-box {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.85rem 1.25rem;
  background: var(--card-bg);
  border: 2px solid var(--border-color);
  border-radius: var(--radius-2xl);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.05);
  transition: all 0.2s ease;
}

.search-input-box:focus-within {
  border-color: var(--mint-500);
  box-shadow: 0 10px 30px rgba(21, 183, 158, 0.15);
}

.search-icon {
  color: var(--mint-600);
  flex-shrink: 0;
}

.search-input {
  width: 100%;
  border: none;
  background: transparent;
  font-size: 1.05rem;
  color: var(--text-primary);
  outline: none;
}

.search-input::placeholder {
  color: var(--text-muted);
  font-size: 0.92rem;
}

.btn-clear {
  border: none;
  background: none;
  color: var(--text-muted);
  cursor: pointer;
  padding: 0.2rem;
}

/* Tabs */
.tab-controls {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin-bottom: 1.25rem;
  flex-wrap: wrap;
}

.tab-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  padding: 0.65rem 1.15rem;
  border-radius: var(--radius-full);
  border: 1px solid var(--border-color);
  background: var(--card-bg);
  color: var(--text-secondary);
  font-size: 0.88rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.tab-btn:hover {
  background: var(--bg-tertiary);
  color: var(--text-primary);
}

.tab-btn.active {
  background: var(--mint-500);
  color: white;
  border-color: var(--mint-500);
  box-shadow: 0 4px 12px rgba(21, 183, 158, 0.25);
}

/* Filter chips */
.filter-chips {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin-bottom: 1.75rem;
}

.filter-chip {
  padding: 0.35rem 0.85rem;
  border-radius: var(--radius-lg);
  font-size: 0.8rem;
  font-weight: 600;
  border: 1px solid var(--border-color);
  background: var(--bg-secondary);
  color: var(--text-muted);
  cursor: pointer;
  transition: all 0.15s ease;
}

.filter-chip:hover {
  color: var(--text-primary);
}

.filter-chip.active {
  background: var(--mint-50);
  color: var(--mint-700);
  border-color: var(--mint-400);
}

[data-theme="dark"] .filter-chip.active {
  background: rgba(21, 183, 158, 0.15);
  color: var(--mint-300);
}

/* Words Grid */
.words-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(310px, 1fr));
  gap: 1.15rem;
}

.word-card {
  padding: 1.25rem 1.35rem;
  border-radius: var(--radius-xl);
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
  transition: all 0.2s ease;
}

.word-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
  border-color: var(--mint-400);
}

.card-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.title-with-badge {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.word-english {
  font-size: 1.25rem;
  font-weight: 800;
  color: var(--text-primary);
}

.card-cefr-badge {
  font-size: 0.7rem;
  font-weight: 800;
  padding: 0.15rem 0.45rem;
  border-radius: var(--radius-sm);
}

.cefr-a1, .cefr-a2 {
  background: #dcfce7;
  color: #15803d;
}
.cefr-b1, .cefr-b2 {
  background: #dbeafe;
  color: #1d4ed8;
}

[data-theme="dark"] .cefr-a1, [data-theme="dark"] .cefr-a2 {
  background: rgba(34, 197, 94, 0.2);
  color: #4ade80;
}
[data-theme="dark"] .cefr-b1, [data-theme="dark"] .cefr-b2 {
  background: rgba(59, 130, 246, 0.2);
  color: #60a5fa;
}

.btn-star {
  background: none;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  padding: 0.3rem;
  border-radius: 50%;
  transition: all 0.15s ease;
}

.btn-star:hover {
  color: #d97706;
}

.btn-star.starred {
  color: #d97706;
}

.card-middle {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  font-size: 0.88rem;
}

.word-ipa {
  font-family: var(--font-mono, monospace);
  color: var(--text-secondary);
}

.word-pos {
  font-style: italic;
  font-size: 0.82rem;
  color: var(--mint-600);
  font-weight: 600;
}

.word-vietnamese {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
  line-height: 1.4;
}

.card-bottom {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: auto;
  padding-top: 0.5rem;
  border-top: 1px solid var(--border-color);
}

.audio-group {
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.btn-accent-audio {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.3rem 0.55rem;
  border-radius: var(--radius-md);
  border: 1px solid var(--border-color);
  background: var(--bg-secondary);
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.15s ease;
}

.btn-accent-audio:hover {
  border-color: var(--mint-500);
  color: var(--mint-700);
}

.btn-accent-audio.playing {
  background: var(--mint-500);
  color: white;
  border-color: var(--mint-500);
}

.topic-label {
  font-size: 0.75rem;
  color: var(--text-muted);
  max-width: 140px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 3.5rem 1.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  border-radius: var(--radius-2xl);
  border: 2px dashed var(--border-color);
}

.empty-icon-circle {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  background: var(--bg-tertiary);
  color: var(--text-muted);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1rem;
}

.empty-state h3 {
  font-size: 1.35rem;
  font-weight: 700;
  margin: 0 0 0.5rem;
  color: var(--text-primary);
}

.empty-state p {
  color: var(--text-muted);
  font-size: 0.92rem;
  max-width: 480px;
  margin: 0 0 1.5rem;
  line-height: 1.5;
}

/* Skeleton */
.word-skeleton-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(310px, 1fr));
  gap: 1.15rem;
}

.word-skeleton-card {
  height: 150px;
  border-radius: var(--radius-xl);
  background: var(--bg-secondary);
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0% { opacity: 0.5; }
  50% { opacity: 0.8; }
  100% { opacity: 0.5; }
}

@media (max-width: 640px) {
  .dict-title {
    font-size: 1.75rem;
  }
  .words-grid {
    grid-template-columns: 1fr;
  }
}
</style>
