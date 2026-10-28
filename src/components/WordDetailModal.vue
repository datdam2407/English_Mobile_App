<template>
  <Transition name="modal-fade">
    <div v-if="isOpen && word" class="word-modal-backdrop" @click.self="close">
      <div class="word-modal card animate-slideUp" role="dialog" aria-modal="true">
        <!-- Modal Top Bar -->
        <div class="modal-top-bar">
          <div class="badge-group">
            <span class="cefr-badge" :class="cefrClass">{{ cefrLevel }}</span>
            <span class="topic-tag" v-if="word.topic?.name">{{ word.topic.name }}</span>
          </div>

          <div class="top-actions">
            <!-- Bookmark Favorite -->
            <button
              class="btn-action-icon"
              :class="{ favorited: isFavorite }"
              @click="toggleFav"
              :title="isFavorite ? 'Bỏ lưu từ' : 'Lưu từ yêu thích'"
            >
              <FeatherIcon :type="isFavorite ? 'bookmark' : 'bookmark'" :size="20" />
            </button>
            <button class="btn-action-icon" @click="close" title="Đóng">
              <FeatherIcon type="x" :size="20" />
            </button>
          </div>
        </div>

        <!-- TẦNG 1: Từ vựng, IPA, Audio UK/US, Từ loại & Nghĩa phổ biến -->
        <div class="tier-1">
          <div class="word-header-row">
            <h1 class="word-title">{{ word.english }}</h1>
            <span class="part-of-speech">{{ posText }}</span>
          </div>

          <!-- Pronunciation & UK/US Audio Buttons -->
          <div class="phonetics-row">
            <span class="ipa-text" v-if="word.pronunciation">{{ word.pronunciation }}</span>
            
            <div class="audio-buttons">
              <!-- UK Audio -->
              <button
                class="btn-audio btn-uk"
                :class="{ playing: isPlaying && currentPlayingWord === word.english && currentPlayingAccent === 'UK' }"
                @click="playAudioUK(word.english)"
                title="Phát âm giọng Anh - Anh (UK)"
              >
                <span class="flag-icon">🇬🇧</span>
                <span class="accent-label">UK</span>
                <FeatherIcon type="volume-2" :size="15" />
              </button>

              <!-- US Audio -->
              <button
                class="btn-audio btn-us"
                :class="{ playing: isPlaying && currentPlayingWord === word.english && currentPlayingAccent === 'US' }"
                @click="playAudioUS(word.english)"
                title="Phát âm giọng Anh - Mỹ (US)"
              >
                <span class="flag-icon">🇺🇸</span>
                <span class="accent-label">US</span>
                <FeatherIcon type="volume-2" :size="15" />
              </button>
            </div>
          </div>

          <!-- Vietnamese Meaning Highlight -->
          <div class="meaning-box">
            <span class="meaning-label">Nghĩa tiếng Việt</span>
            <p class="meaning-main">{{ word.vietnamese }}</p>
            <p class="meaning-sub" v-if="word.meaning && word.meaning !== word.vietnamese">
              {{ word.meaning }}
            </p>
          </div>
        </div>

        <!-- TẦNG 2: Ví dụ song ngữ & Word Family -->
        <div class="tier-2">
          <!-- Example -->
          <div class="section-block example-block" v-if="word.example || generatedExample">
            <div class="block-title">
              <FeatherIcon type="file-text" :size="16" />
              <span>Ví dụ thực tế</span>
            </div>
            <div class="example-content">
              <p class="en-example">"{{ word.example || generatedExample.en }}"</p>
              <p class="vi-example" v-if="generatedExample.vi">→ {{ generatedExample.vi }}</p>
            </div>
          </div>

          <!-- Word Family -->
          <div class="section-block" v-if="word.wordForms || wordFamilyList.length > 0">
            <div class="block-title">
              <FeatherIcon type="git-branch" :size="16" />
              <span>Gia đình từ (Word Family)</span>
            </div>
            <div class="word-family-tags">
              <span
                v-for="(item, idx) in wordFamilyList"
                :key="idx"
                class="family-tag"
              >
                {{ item }}
              </span>
            </div>
          </div>
        </div>

        <!-- TẦNG 3: Synonyms & Antonyms -->
        <div class="tier-3" v-if="synonymsList.length > 0">
          <div class="section-block">
            <div class="block-title">
              <FeatherIcon type="shuffle" :size="16" />
              <span>Từ đồng nghĩa (Synonyms)</span>
            </div>
            <div class="synonyms-chips">
              <span
                v-for="(syn, idx) in synonymsList"
                :key="idx"
                class="syn-chip"
                @click="$emit('select-word', syn)"
              >
                {{ syn }}
              </span>
            </div>
          </div>
        </div>

        <!-- Footer Actions -->
        <div class="modal-footer">
          <button class="btn btn-secondary btn-speaking-practice" @click="goToSpeaking">
            <FeatherIcon type="mic" :size="17" />
            <span>Luyện phát âm AI</span>
          </button>

          <button class="btn btn-primary btn-learn-action" @click="startPractice">
            <FeatherIcon type="zap" :size="17" />
            <span>Luyện tập từ này</span>
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import FeatherIcon from './FeatherIcon.vue'
import { useAudio } from '../composables/useAudio.js'
import { dictionaryStorage } from '../services/dictionaryStorage.js'

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  },
  word: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['close', 'select-word'])
const router = useRouter()
const { isPlaying, currentPlayingWord, currentPlayingAccent, playAudioUK, playAudioUS } = useAudio()

const isFavorite = computed(() => {
  if (!props.word) return false
  return dictionaryStorage.isFavorited(props.word.id)
})

function toggleFav() {
  if (!props.word) return
  dictionaryStorage.toggleFavorite(props.word)
}

function close() {
  emit('close')
}

// Derive CEFR Level based on word or book
const cefrLevel = computed(() => {
  if (!props.word) return 'B1'
  const bookName = props.word.topic?.book?.name || ''
  if (bookName.includes('Oxford')) {
    const len = props.word.english.length
    if (len <= 4) return 'A1'
    if (len <= 6) return 'A2'
    if (len <= 8) return 'B1'
    return 'B2'
  }
  return 'B2'
})

const cefrClass = computed(() => {
  const lvl = cefrLevel.value.toLowerCase()
  return `cefr-${lvl}`
})

// Part of speech
const posText = computed(() => {
  if (!props.word) return ''
  const m = props.word.meaning || ''
  if (m.startsWith('v.') || m.includes('(v)')) return 'verb'
  if (m.startsWith('n.') || m.includes('(n)')) return 'noun'
  if (m.startsWith('adj.') || m.includes('(adj)')) return 'adjective'
  if (m.startsWith('adv.') || m.includes('(adv)')) return 'adverb'
  return 'noun / verb'
})

// Word family list
const wordFamilyList = computed(() => {
  if (!props.word?.wordForms) return []
  return props.word.wordForms.split(',').map(s => s.trim()).filter(Boolean)
})

// Synonyms list
const synonymsList = computed(() => {
  if (!props.word) return []
  if (props.word.synonyms) {
    return props.word.synonyms.split(',').map(s => s.trim()).filter(Boolean)
  }
  // Generate helpful contextual synonyms if empty
  return []
})

// Fallback contextual example if empty
const generatedExample = computed(() => {
  if (props.word?.example) return { en: props.word.example, vi: '' }
  if (!props.word) return { en: '', vi: '' }
  const w = props.word.english
  return {
    en: `It is important to understand how to use "${w}" in everyday professional communication.`,
    vi: `Điều quan trọng là phải hiểu cách sử dụng "${props.word.vietnamese.toLowerCase()}" trong giao tiếp thực tế hàng ngày.`
  }
})

function goToSpeaking() {
  close()
  router.push('/speaking-practice')
}

function startPractice() {
  close()
  if (props.word?.topic?.id) {
    router.push(`/flashcard/${props.word.topic.id}`)
  } else {
    router.push('/review')
  }
}
</script>

<style scoped>
.word-modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.65);
  backdrop-filter: blur(6px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1050;
  padding: 1rem;
}

.word-modal {
  width: 100%;
  max-width: 540px;
  max-height: 90vh;
  overflow-y: auto;
  border-radius: var(--radius-2xl);
  padding: 1.75rem;
  background: var(--card-bg);
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  border: 1px solid var(--border-color);
}

/* Modal Top Bar */
.modal-top-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.badge-group {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.cefr-badge {
  font-size: 0.75rem;
  font-weight: 800;
  padding: 0.2rem 0.6rem;
  border-radius: var(--radius-full);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.cefr-a1, .cefr-a2 {
  background: #dcfce7;
  color: #15803d;
}

.cefr-b1, .cefr-b2 {
  background: #dbeafe;
  color: #1d4ed8;
}

.cefr-c1, .cefr-c2 {
  background: #fae8ff;
  color: #a21caf;
}

[data-theme="dark"] .cefr-a1, [data-theme="dark"] .cefr-a2 {
  background: rgba(34, 197, 94, 0.2);
  color: #4ade80;
}
[data-theme="dark"] .cefr-b1, [data-theme="dark"] .cefr-b2 {
  background: rgba(59, 130, 246, 0.2);
  color: #60a5fa;
}
[data-theme="dark"] .cefr-c1, [data-theme="dark"] .cefr-c2 {
  background: rgba(217, 70, 239, 0.2);
  color: #e879f9;
}

.topic-tag {
  font-size: 0.75rem;
  color: var(--text-muted);
  background: var(--bg-tertiary);
  padding: 0.2rem 0.6rem;
  border-radius: var(--radius-md);
  font-weight: 500;
}

.top-actions {
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.btn-action-icon {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: none;
  background: var(--bg-tertiary);
  color: var(--text-muted);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-action-icon:hover {
  background: var(--border-color);
  color: var(--text-primary);
}

.btn-action-icon.favorited {
  background: #fef3c7;
  color: #d97706;
}

[data-theme="dark"] .btn-action-icon.favorited {
  background: rgba(245, 158, 11, 0.2);
  color: #fbbf24;
}

/* TẦNG 1 */
.tier-1 {
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
}

.word-header-row {
  display: flex;
  align-items: baseline;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.word-title {
  font-size: 2.15rem;
  font-weight: 800;
  color: var(--text-primary);
  margin: 0;
  letter-spacing: -0.02em;
}

.part-of-speech {
  font-size: 0.95rem;
  font-style: italic;
  color: var(--mint-600);
  font-weight: 600;
}

.phonetics-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.ipa-text {
  font-family: var(--font-mono, monospace);
  font-size: 1.15rem;
  color: var(--text-secondary);
}

.audio-buttons {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-audio {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.45rem 0.8rem;
  border-radius: var(--radius-lg);
  font-size: 0.82rem;
  font-weight: 700;
  cursor: pointer;
  border: 1px solid var(--border-color);
  background: var(--bg-secondary);
  color: var(--text-primary);
  transition: all 0.15s ease;
}

.btn-audio:hover {
  border-color: var(--mint-500);
  background: var(--mint-50);
  color: var(--mint-700);
  transform: translateY(-1px);
}

.btn-audio.playing {
  background: var(--mint-500);
  color: white;
  border-color: var(--mint-500);
  animation: pulse 1s infinite;
}

.flag-icon {
  font-size: 1rem;
}

.meaning-box {
  padding: 1.15rem;
  background: linear-gradient(135deg, rgba(21, 183, 158, 0.08) 0%, rgba(21, 183, 158, 0.02) 100%);
  border: 1px solid rgba(21, 183, 158, 0.25);
  border-radius: var(--radius-xl);
}

.meaning-label {
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--mint-700);
  display: block;
  margin-bottom: 0.35rem;
}

[data-theme="dark"] .meaning-label {
  color: var(--mint-300);
}

.meaning-main {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
  line-height: 1.4;
}

.meaning-sub {
  margin: 0.45rem 0 0;
  font-size: 0.88rem;
  color: var(--text-muted);
}

/* TẦNG 2 & 3 */
.tier-2, .tier-3 {
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
}

.section-block {
  padding: 1rem 1.15rem;
  background: var(--bg-secondary);
  border-radius: var(--radius-xl);
  border: 1px solid var(--border-color);
}

.block-title {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  font-size: 0.82rem;
  font-weight: 700;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.03em;
  margin-bottom: 0.65rem;
}

.example-content {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.en-example {
  font-size: 0.96rem;
  font-weight: 500;
  color: var(--text-primary);
  margin: 0;
  line-height: 1.5;
}

.vi-example {
  font-size: 0.86rem;
  color: var(--text-muted);
  margin: 0;
}

.word-family-tags, .synonyms-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.45rem;
}

.family-tag {
  font-size: 0.82rem;
  padding: 0.3rem 0.65rem;
  background: var(--bg-tertiary);
  border-radius: var(--radius-md);
  color: var(--text-secondary);
  font-weight: 500;
}

.syn-chip {
  font-size: 0.82rem;
  padding: 0.3rem 0.75rem;
  background: rgba(139, 92, 246, 0.1);
  color: #7c3aed;
  border-radius: var(--radius-full);
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;
}

.syn-chip:hover {
  background: #7c3aed;
  color: white;
}

/* Footer Actions */
.modal-footer {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-top: 0.5rem;
}

.btn-speaking-practice {
  flex: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.45rem;
  padding: 0.75rem 1rem;
  border-radius: var(--radius-xl);
  font-weight: 600;
  font-size: 0.92rem;
}

.btn-learn-action {
  flex: 1.25;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.45rem;
  padding: 0.75rem 1rem;
  border-radius: var(--radius-xl);
  font-weight: 600;
  font-size: 0.92rem;
}

/* Animations */
.modal-fade-enter-active, .modal-fade-leave-active {
  transition: opacity 0.25s ease;
}
.modal-fade-enter-from, .modal-fade-leave-to {
  opacity: 0;
}

@media (max-width: 600px) {
  .word-modal {
    padding: 1.25rem;
    max-height: 95vh;
  }
  .word-title {
    font-size: 1.75rem;
  }
  .modal-footer {
    flex-direction: column;
  }
  .btn-speaking-practice, .btn-learn-action {
    width: 100%;
  }
}
</style>
