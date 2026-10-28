<template>
  <div class="book-card card-clickable" @click="$emit('click')">
    <div class="book-icon-wrapper" :class="isOxford ? 'oxford-bg' : 'toeic-bg'">
      <FeatherIcon :type="isOxford ? 'award' : 'book-open'" :size="20" />
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

    <FeatherIcon type="chevron-right" :size="16" class="book-chevron" />
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
  gap: 0.75rem;
  align-items: center;
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  padding: 0.85rem 1rem;
  transition: all 0.2s ease;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
  min-width: 0;
  cursor: pointer;
}

.book-card:hover {
  transform: translateY(-2px);
  border-color: var(--mint-400);
  box-shadow: 0 4px 12px rgba(21, 183, 158, 0.12);
}

.book-icon-wrapper {
  width: 40px;
  height: 40px;
  border-radius: 11px;
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
  gap: 0.4rem;
  margin-bottom: 0.15rem;
}

.book-name {
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.book-tag-badge {
  font-size: 0.68rem;
  font-weight: 700;
  color: var(--mint-600);
  background: rgba(21, 183, 158, 0.12);
  padding: 0.1rem 0.45rem;
  border-radius: 9999px;
  white-space: nowrap;
  flex-shrink: 0;
}

.book-description {
  color: var(--text-muted);
  font-size: 0.76rem;
  margin: 0 0 0.2rem 0;
  line-height: 1.35;
  white-space: normal;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

.book-meta {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.meta-sub {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.72rem;
  color: var(--text-muted);
}

.book-chevron {
  color: var(--text-muted);
  flex-shrink: 0;
  margin-left: 0.2rem;
  transition: transform 0.2s;
}

.book-card:hover .book-chevron {
  transform: translateX(2px);
  color: var(--mint-500);
}

@media (max-width: 640px) {
  .book-card {
    padding: 0.7rem 0.8rem;
    gap: 0.65rem;
  }

  .book-icon-wrapper {
    width: 38px;
    height: 38px;
  }

  .book-name {
    font-size: 0.88rem;
  }

  .book-description {
    font-size: 0.74rem;
  }
}
</style>
