<template>
  <div id="app">
    <NavBar />
    <main class="main-content">
      <router-view />
    </main>
    <!-- AI Assistant for interactive learning -->
    <AIAssistant />
    <!-- Native Mobile App Bottom Navigation & Drawer -->
    <MobileBottomNav />
  </div>
</template>

<script setup>
import NavBar from './components/NavBar.vue'
import AIAssistant from './components/AIAssistant.vue'
import MobileBottomNav from './components/MobileBottomNav.vue'
import { useAuth } from './composables/useAuth.js'

const { isAuthenticated } = useAuth()
</script>

<style>
.main-content {
  min-height: calc(100vh - 68px);
  padding: 2rem;
  max-width: 1320px;
  margin: 0 auto;
}

@media (max-width: 768px) {
  .main-content {
    padding: 1rem 0.85rem;
    /* Extra padding at bottom so content is never obscured by mobile bottom nav or safe area */
    padding-bottom: calc(75px + env(safe-area-inset-bottom, 0px));
    min-height: calc(100vh - 56px);
  }
}
</style>
