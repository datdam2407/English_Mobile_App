<template>
  <div class="book-card card card-clickable" @click="$emit('click')">
    <div class="book-icon-wrapper" :class="isOxford ? 'oxford-bg' : 'toeic-bg'">
      <FeatherIcon :type="isOxford ? 'award' : 'book-open'" :size="24" />
    </div>

    <div class="book-info">
      <div class="book-top-row">
        <h3 class="book-name">{{ book.name }}</h3>
        <span class="book-tag-badge">{{ topicCount }} chủ đề</span>
      </div>
      <p class="book-description" v-if="book.description">{{ book.description }}</p>
      <div class="book-meta">
        <span class="meta-sub">
          <FeatherIcon type="check-circle" :size="12" /> Chuẩn CEFR A1 - B2
        </span>
      </div>
    </div>

    <FeatherIcon type="chevron-right" :size="18" class="book-chevron" />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import FeatherIcon from './FeatherIcon.vue'

const props = defineProps({
  book: {
    type: Object,
    required: true
  },
  topicCount: {
    type: Number,
    default: 0
  }
})

defineEmits(['click'])

const isOxford = computed(() => {
  return props.book?.name?.toLowerCase().includes('oxford')
})
</script>

<style scoped>
.book-card {
  display: flex;
  gap: 1.1rem;
  align-items: center;
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  padding: 1.1rem 1.25rem;
  transition: all 0.2s ease;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
}

.book-card:hover {
  transform: translateY(-2px);
  border-color: var(--mint-400);
  box-shadow: 0 4px 14px rgba(21, 183, 158, 0.12);
}

.book-icon-wrapper {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
}

.oxford-bg {
  background: linear-gradient(135deg, #0284c7, #0369a1);
}

.toeic-bg {
  background: linear-gradient(135deg, var(--mint-500), #0d9488);
}

.book-info {
  flex: 1;
  min-width: 0;
  overflow: hidden;
}

.book-top-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  margin-bottom: 0.25rem;
}

.book-name {
  font-size: 1.05rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.book-tag-badge {
  font-size: 0.72rem;
  font-weight: 700;
  color: var(--mint-600);
  background: rgba(21, 183, 158, 0.12);
  padding: 0.15rem 0.5rem;
  border-radius: 9999px;
  white-space: nowrap;
  flex-shrink: 0;
}

.book-description {
  color: var(--text-muted);
  font-size: 0.82rem;
  margin: 0 0 0.35rem 0;
  line-height: 1.35;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

.book-meta {
  display: flex;
  align-items: center;
  gap: 0.6rem;
}

.meta-sub {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  font-size: 0.74rem;
  color: var(--text-muted);
}

.book-chevron {
  color: var(--text-muted);
  flex-shrink: 0;
  margin-left: 0.25rem;
  transition: transform 0.2s;
}

.book-card:hover .book-chevron {
  transform: translateX(2px);
  color: var(--mint-500);
}

@media (max-width: 640px) {
  .book-card {
    gap: 0.85rem;
    padding: 0.85rem 1rem;
  }

  .book-icon-wrapper {
    width: 42px;
    height: 42px;
    border-radius: 10px;
  }

  .book-name {
    font-size: 0.95rem;
  }

  .book-description {
    font-size: 0.78rem;
  }
}
</style>
