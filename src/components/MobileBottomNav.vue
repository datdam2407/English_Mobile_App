<template>
  <div class="mobile-nav-wrapper">
    <!-- Bottom Navigation Bar for Mobile -->
    <nav class="mobile-bottom-nav" role="navigation" aria-label="Mobile Navigation">
      <router-link to="/" class="mobile-nav-item" exact-active-class="active" @click="closeDrawer">
        <div class="nav-icon-wrapper">
          <FeatherIcon type="home" :size="20" />
        </div>
        <span class="nav-label">Trang chủ</span>
      </router-link>

      <router-link to="/review" class="mobile-nav-item" active-class="active" @click="closeDrawer">
        <div class="nav-icon-wrapper">
          <FeatherIcon type="rotate-cw" :size="20" />
          <span v-if="reviewStats.dueToday > 0" class="badge-dot">
            {{ reviewStats.dueToday > 99 ? '99+' : reviewStats.dueToday }}
          </span>
        </div>
        <span class="nav-label">Ôn tập</span>
      </router-link>

      <router-link to="/grammar" class="mobile-nav-item" active-class="active" @click="closeDrawer">
        <div class="nav-icon-wrapper">
          <FeatherIcon type="book" :size="20" />
        </div>
        <span class="nav-label">Ngữ pháp</span>
      </router-link>

      <router-link to="/speaking-practice" class="mobile-nav-item" active-class="active" @click="closeDrawer">
        <div class="nav-icon-wrapper">
          <FeatherIcon type="mic" :size="20" />
        </div>
        <span class="nav-label">Luyện nói</span>
      </router-link>

      <button class="mobile-nav-item btn-menu" :class="{ active: isDrawerOpen }" @click="toggleDrawer" aria-label="Mở menu">
        <div class="nav-icon-wrapper">
          <FeatherIcon :type="isDrawerOpen ? 'x' : 'menu'" :size="20" />
        </div>
        <span class="nav-label">{{ isDrawerOpen ? 'Đóng' : 'Thêm' }}</span>
      </button>
    </nav>

    <!-- Slide-Up Drawer for Additional Mobile Features -->
    <Transition name="drawer-fade">
      <div v-if="isDrawerOpen" class="drawer-backdrop" @click="closeDrawer"></div>
    </Transition>

    <Transition name="drawer-slide">
      <div v-if="isDrawerOpen" class="mobile-drawer" role="dialog" aria-modal="true">
        <div class="drawer-handle" @click="closeDrawer">
          <div class="handle-bar"></div>
        </div>

        <div class="drawer-header">
          <div class="user-brief" v-if="isAuthenticated">
            <div class="brief-avatar">
              {{ getInitials(user?.displayName || user?.email) }}
            </div>
            <div class="brief-info">
              <span class="brief-name">{{ user?.displayName || 'Người dùng' }}</span>
              <span class="brief-email">{{ user?.email }}</span>
            </div>
          </div>
          <div class="guest-brief" v-else>
            <div class="guest-icon">
              <FeatherIcon type="user" :size="22" />
            </div>
            <div class="guest-text">
              <span class="brief-name">Chào mừng bạn!</span>
              <span class="brief-email">Đăng nhập để đồng bộ tiến trình</span>
            </div>
          </div>
          <button class="btn-drawer-close" @click="closeDrawer" aria-label="Đóng">
            <FeatherIcon type="x" :size="20" />
          </button>
        </div>

        <div class="drawer-content">
          <!-- PWA Mobile Install Banner / Button inside drawer -->
          <div v-if="isInstallable || isIOS" class="pwa-drawer-card">
            <div class="pwa-card-icon">
              <FeatherIcon type="smartphone" :size="22" />
            </div>
            <div class="pwa-card-body">
              <strong>Cài đặt App EngLearn</strong>
              <p>Thêm vào màn hình chính để dùng như ứng dụng Native</p>
            </div>
            <button class="btn-pwa-action" @click="handleInstallClick">
              {{ isIOS ? 'Hướng dẫn' : 'Cài đặt' }}
            </button>
          </div>

          <div class="drawer-section">
            <span class="section-heading">Luyện tập & Kỹ năng</span>
            <div class="drawer-grid">
              <router-link to="/word-types" class="drawer-tile" @click="closeDrawer">
                <div class="tile-icon" style="background: linear-gradient(135deg, #8B5CF6, #6D28D9);">
                  <FeatherIcon type="git-branch" :size="18" />
                </div>
                <span>Phân loại từ</span>
              </router-link>

              <router-link to="/paragraph-practice" class="drawer-tile" @click="closeDrawer">
                <div class="tile-icon" style="background: linear-gradient(135deg, #10B981, #059669);">
                  <FeatherIcon type="file-text" :size="18" />
                </div>
                <span>Luyện đoạn văn</span>
              </router-link>

              <router-link to="/speaking-practice" class="drawer-tile" @click="closeDrawer">
                <div class="tile-icon" style="background: linear-gradient(135deg, #0EA5E9, #0284C7);">
                  <FeatherIcon type="mic" :size="18" />
                </div>
                <span>Phát âm AI</span>
              </router-link>

              <router-link to="/my-decks" class="drawer-tile" @click="closeDrawer">
                <div class="tile-icon" style="background: linear-gradient(135deg, #F59E0B, #D97706);">
                  <FeatherIcon type="layers" :size="18" />
                </div>
                <span>Bộ từ của tôi</span>
              </router-link>
            </div>
          </div>

          <div class="drawer-section">
            <span class="section-heading">Tài khoản & Tiện ích</span>
            <div class="drawer-list">
              <router-link v-if="isAuthenticated" to="/profile" class="drawer-row" @click="closeDrawer">
                <div class="row-left">
                  <FeatherIcon type="user" :size="18" />
                  <span>Hồ sơ & Thành tích cá nhân</span>
                </div>
                <FeatherIcon type="chevron-right" :size="16" class="row-arrow" />
              </router-link>

              <router-link v-if="isAdmin" to="/admin" class="drawer-row" @click="closeDrawer">
                <div class="row-left">
                  <FeatherIcon type="settings" :size="18" />
                  <span>Bảng quản trị từ vựng</span>
                </div>
                <FeatherIcon type="chevron-right" :size="16" class="row-arrow" />
              </router-link>

              <div class="drawer-row clickable" @click="toggleSoundEffect">
                <div class="row-left">
                  <FeatherIcon :type="isSoundEnabled ? 'volume-2' : 'volume-x'" :size="18" />
                  <span>Hiệu ứng âm thanh</span>
                </div>
                <span class="row-badge">{{ isSoundEnabled ? 'Bật' : 'Tắt' }}</span>
              </div>

              <div class="drawer-row clickable" @click="toggleThemeMode">
                <div class="row-left">
                  <FeatherIcon :type="isDarkMode ? 'moon' : 'sun'" :size="18" />
                  <span>Giao diện tối (Dark mode)</span>
                </div>
                <span class="row-badge">{{ isDarkMode ? 'Bật' : 'Tắt' }}</span>
              </div>
            </div>
          </div>

          <!-- Auth Actions -->
          <div class="drawer-footer">
            <template v-if="isAuthenticated">
              <button class="btn-drawer-logout" @click="handleLogout">
                <FeatherIcon type="log-out" :size="18" />
                <span>Đăng xuất khỏi tài khoản</span>
              </button>
            </template>
            <template v-else>
              <div class="auth-btn-group">
                <router-link to="/login" class="btn btn-secondary flex-1" @click="closeDrawer">
                  Đăng nhập
                </router-link>
                <router-link to="/register" class="btn btn-primary flex-1" @click="closeDrawer">
                  Đăng ký ngay
                </router-link>
              </div>
            </template>
          </div>
        </div>
      </div>
    </Transition>

    <!-- iOS Install Guide Modal -->
    <Transition name="fade">
      <div v-if="showIOSModal" class="ios-modal-backdrop" @click="showIOSModal = false">
        <div class="ios-modal-card" @click.stop>
          <div class="ios-modal-header">
            <div class="ios-icon-box">
              <FeatherIcon type="share" :size="24" />
            </div>
            <h3>Cài đặt EngLearn lên iPhone / iPad</h3>
          </div>
          <div class="ios-modal-body">
            <ol class="ios-steps">
              <li>
                <span class="step-num">1</span>
                <span>Nhấn vào nút <strong>Chia sẻ (Share)</strong> <FeatherIcon type="share" :size="15" class="inline-icon" /> ở thanh công cụ trình duyệt Safari.</span>
              </li>
              <li>
                <span class="step-num">2</span>
                <span>Cuộn xuống danh sách tùy chọn và chọn <strong>"Thêm vào MH chính" (Add to Home Screen)</strong>.</span>
              </li>
              <li>
                <span class="step-num">3</span>
                <span>Nhấn <strong>"Thêm" (Add)</strong> ở góc trên bên phải để hoàn tất cài đặt ứng dụng.</span>
              </li>
            </ol>
          </div>
          <button class="btn btn-primary btn-block" @click="showIOSModal = false">
            Đã hiểu
          </button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import FeatherIcon from './FeatherIcon.vue'
import { useAuth } from '../composables/useAuth.js'
import { useSoundEffects } from '../composables/useSoundEffects.js'
import { usePWAInstall } from '../composables/usePWAInstall.js'
import { getReviewStats } from '../services/srs.js'

const router = useRouter()
const { user, isAuthenticated, isAdmin, logout } = useAuth()
const { isSoundEnabled, toggleSound } = useSoundEffects()
const { isInstallable, isIOS, install } = usePWAInstall()

const isDrawerOpen = ref(false)
const showIOSModal = ref(false)
const reviewStats = ref({ dueToday: 0 })
const isDarkMode = ref(false)

function checkTheme() {
  isDarkMode.value = document.documentElement.getAttribute('data-theme') === 'dark'
}

function toggleThemeMode() {
  const current = document.documentElement.getAttribute('data-theme')
  const next = current === 'dark' ? 'light' : 'dark'
  document.documentElement.setAttribute('data-theme', next)
  localStorage.setItem('theme', next)
  isDarkMode.value = next === 'dark'
}

function updateStats() {
  try {
    reviewStats.value = getReviewStats()
  } catch {
    //
  }
}

function toggleDrawer() {
  isDrawerOpen.value = !isDrawerOpen.value
  if (isDrawerOpen.value) {
    document.body.style.overflow = 'hidden'
  } else {
    document.body.style.overflow = ''
  }
}

function closeDrawer() {
  isDrawerOpen.value = false
  document.body.style.overflow = ''
}

function getInitials(name) {
  if (!name) return '?'
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}

function toggleSoundEffect() {
  toggleSound()
}

async function handleInstallClick() {
  if (isIOS.value) {
    showIOSModal.value = true
  } else if (isInstallable.value) {
    await install()
  }
}

function handleLogout() {
  closeDrawer()
  logout()
  router.push('/')
}

onMounted(() => {
  checkTheme()
  updateStats()
  window.addEventListener('storage', updateStats)
})

onUnmounted(() => {
  document.body.style.overflow = ''
  window.removeEventListener('storage', updateStats)
})
</script>

<style scoped>
.mobile-nav-wrapper {
  display: contents;
}

/* Hide on Desktop / Large tablets */
@media (min-width: 769px) {
  .mobile-bottom-nav,
  .mobile-drawer,
  .drawer-backdrop {
    display: none !important;
  }
}

/* Mobile Bottom Navigation Bar */
.mobile-bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: calc(62px + env(safe-area-inset-bottom, 0px));
  padding-bottom: env(safe-area-inset-bottom, 0px);
  background: var(--navbar-bg);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-top: 1px solid var(--border-color);
  display: flex;
  align-items: center;
  justify-content: space-around;
  z-index: 990;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.05);
}

.mobile-nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 3px;
  flex: 1;
  height: 100%;
  color: var(--text-muted);
  text-decoration: none;
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 4px 0;
  transition: all 0.15s ease;
  -webkit-tap-highlight-color: transparent;
  user-select: none;
}

.mobile-nav-item:active {
  transform: scale(0.92);
}

.nav-icon-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
}

.nav-label {
  font-size: 0.72rem;
  font-weight: 500;
  letter-spacing: -0.01em;
}

.mobile-nav-item.active {
  color: var(--mint-600);
}

[data-theme="dark"] .mobile-nav-item.active {
  color: var(--mint-400);
}

.mobile-nav-item.active .nav-label {
  font-weight: 700;
}

.badge-dot {
  position: absolute;
  top: -4px;
  right: -8px;
  min-width: 17px;
  height: 17px;
  padding: 0 4px;
  background: #ef4444;
  color: white;
  border-radius: 9999px;
  font-size: 0.65rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid var(--navbar-bg);
}

/* Backdrop */
.drawer-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.55);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  z-index: 1000;
}

/* Mobile Drawer */
.mobile-drawer {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  max-height: 85vh;
  background: var(--card-bg);
  border-top-left-radius: 24px;
  border-top-right-radius: 24px;
  box-shadow: 0 -10px 30px rgba(0, 0, 0, 0.2);
  z-index: 1001;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  padding-bottom: env(safe-area-inset-bottom, 0px);
}

.drawer-handle {
  width: 100%;
  padding: 10px 0 6px;
  display: flex;
  justify-content: center;
  cursor: pointer;
}

.handle-bar {
  width: 44px;
  height: 5px;
  background: var(--border-color);
  border-radius: 9999px;
}

.drawer-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1.25rem 1rem;
  border-bottom: 1px solid var(--border-color);
}

.user-brief,
.guest-brief {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.brief-avatar,
.guest-icon {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--mint-500) 0%, var(--mint-600) 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 0.95rem;
}

.guest-icon {
  background: var(--bg-tertiary);
  color: var(--mint-600);
}

.brief-info,
.guest-text {
  display: flex;
  flex-direction: column;
}

.brief-name {
  font-weight: 700;
  color: var(--text-primary);
  font-size: 0.98rem;
}

.brief-email {
  font-size: 0.78rem;
  color: var(--text-muted);
}

.btn-drawer-close {
  background: var(--bg-tertiary);
  border: none;
  width: 34px;
  height: 34px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-muted);
  cursor: pointer;
}

.drawer-content {
  overflow-y: auto;
  padding: 1rem 1.25rem 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

/* PWA Card */
.pwa-drawer-card {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background: linear-gradient(135deg, rgba(21, 183, 158, 0.12), rgba(14, 147, 132, 0.18));
  border: 1px solid var(--mint-300);
  border-radius: var(--radius-lg);
  padding: 0.85rem 1rem;
}

.pwa-card-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: var(--mint-500);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.pwa-card-body {
  flex: 1;
}

.pwa-card-body strong {
  display: block;
  font-size: 0.88rem;
  color: var(--text-primary);
}

.pwa-card-body p {
  font-size: 0.75rem;
  color: var(--text-muted);
  margin: 0;
}

.btn-pwa-action {
  padding: 0.45rem 0.85rem;
  background: var(--mint-600);
  color: white;
  border: none;
  border-radius: var(--radius-md);
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
}

/* Section Headings */
.drawer-section {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

.section-heading {
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--text-muted);
}

.drawer-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.6rem;
}

.drawer-tile {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.85rem;
  background: var(--bg-tertiary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  text-decoration: none;
  color: var(--text-primary);
  font-size: 0.88rem;
  font-weight: 600;
  transition: all 0.15s ease;
}

.drawer-tile:active {
  transform: scale(0.97);
  background: var(--mint-50);
}

.tile-icon {
  width: 34px;
  height: 34px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
}

/* Drawer list */
.drawer-list {
  display: flex;
  flex-direction: column;
  background: var(--bg-tertiary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  overflow: hidden;
}

.drawer-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.85rem 1rem;
  color: var(--text-primary);
  text-decoration: none;
  font-size: 0.9rem;
  border-bottom: 1px solid var(--border-color);
}

.drawer-row:last-child {
  border-bottom: none;
}

.drawer-row.clickable {
  cursor: pointer;
}

.drawer-row:active {
  background: rgba(21, 183, 158, 0.08);
}

.row-left {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.row-badge {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--mint-600);
  background: var(--mint-50);
  padding: 2px 8px;
  border-radius: 999px;
}

[data-theme="dark"] .row-badge {
  background: rgba(21, 183, 158, 0.15);
  color: var(--mint-300);
}

.row-arrow {
  color: var(--text-muted);
}

.drawer-footer {
  margin-top: 0.5rem;
}

.btn-drawer-logout {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem;
  border: 1px solid rgba(239, 68, 68, 0.2);
  border-radius: var(--radius-lg);
  background: rgba(239, 68, 68, 0.05);
  color: #ef4444;
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
}

.btn-drawer-logout:active {
  background: rgba(239, 68, 68, 0.12);
}

.auth-btn-group {
  display: flex;
  gap: 0.75rem;
}

.flex-1 {
  flex: 1;
}

/* Animations */
.drawer-fade-enter-active,
.drawer-fade-leave-active {
  transition: opacity 0.25s ease;
}

.drawer-fade-enter-from,
.drawer-fade-leave-to {
  opacity: 0;
}

.drawer-slide-enter-active,
.drawer-slide-leave-active {
  transition: transform 0.28s cubic-bezier(0.16, 1, 0.3, 1);
}

.drawer-slide-enter-from,
.drawer-slide-leave-to {
  transform: translateY(100%);
}

/* iOS Modal */
.ios-modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  z-index: 2000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.25rem;
}

.ios-modal-card {
  width: 100%;
  max-width: 380px;
  background: var(--card-bg);
  border-radius: 20px;
  padding: 1.5rem;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
}

.ios-modal-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1.25rem;
}

.ios-icon-box {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: var(--mint-100);
  color: var(--mint-700);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.ios-modal-header h3 {
  font-size: 1.05rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
}

.ios-steps {
  list-style: none;
  padding: 0;
  margin: 0 0 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
}

.ios-steps li {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  font-size: 0.85rem;
  color: var(--text-secondary);
  line-height: 1.45;
}

.step-num {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: var(--mint-500);
  color: white;
  font-weight: 700;
  font-size: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  margin-top: 2px;
}

.inline-icon {
  display: inline-block;
  vertical-align: middle;
}

.btn-block {
  width: 100%;
}
</style>
