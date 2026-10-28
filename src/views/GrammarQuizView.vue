<template>
  <div class="grammar-quiz-view animate-fadeIn">
    <!-- Header -->
    <div class="view-header">
      <button class="btn btn-ghost btn-sm" @click="router.back()">
        <FeatherIcon type="arrow-left" :size="16" />
        <span>Quay lại</span>
      </button>

      <div class="header-center">
        <h1 class="page-title">Trắc Nghiệm Ngữ Pháp</h1>
        <p class="page-subtitle">Kiểm tra & củng cố các cấu trúc tiếng Anh thông dụng với phản hồi tức thì</p>
      </div>

      <router-link to="/grammar" class="btn btn-ghost btn-sm btn-theory">
        <FeatherIcon type="book" :size="16" />
        <span>Lý thuyết</span>
      </router-link>
    </div>

    <!-- Quiz Component -->
    <GrammarQuiz
      @completed="handleQuizCompleted"
    />
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import FeatherIcon from '../components/FeatherIcon.vue'
import GrammarQuiz from '../components/GrammarQuiz.vue'

const router = useRouter()

function handleQuizCompleted(result) {
  // Can trigger confetti or save achievements if desired
  console.log('Quiz finished with score:', result)
}
</script>

<style scoped>
.grammar-quiz-view {
  width: 100%;
  max-width: 760px;
  margin: 0 auto;
  padding-bottom: 2.5rem;
}

.view-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.5rem;
  gap: 0.75rem;
}

.header-center {
  text-align: center;
  flex: 1;
}

.page-title {
  font-size: 1.45rem;
  font-weight: 800;
  color: var(--text-primary);
  margin: 0 0 0.2rem 0;
}

.page-subtitle {
  font-size: 0.82rem;
  color: var(--text-muted);
  margin: 0;
}

.btn-theory {
  color: #8b5cf6;
}

@media (max-width: 640px) {
  .view-header {
    flex-wrap: wrap;
  }

  .header-center {
    order: 3;
    width: 100%;
    text-align: left;
    margin-top: 0.5rem;
  }

  .page-title {
    font-size: 1.25rem;
  }
}
</style>
