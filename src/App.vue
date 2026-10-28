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
  padding: 1.75rem 1.25rem;
  max-width: 1200px;
  margin: 0 auto;
  box-sizing: border-box;
  width: 100%;
}

@media (max-width: 768px) {
  .main-content {
    padding: 1rem 0.85rem;
    padding-bottom: calc(75px + env(safe-area-inset-bottom, 0px));
    min-height: calc(100vh - 56px);
    overflow-x: hidden;
  }
}

@media (max-width: 480px) {
  .main-content {
    padding: 0.75rem 0.65rem;
    padding-bottom: calc(75px + env(safe-area-inset-bottom, 0px));
  }
}
</style>
