<template>
  <div class="auth-page">
    <div class="auth-container">
      <div class="auth-card">
        <!-- Brand & Back Button -->
        <div class="card-top-nav">
          <router-link to="/" class="btn-back-home" title="Trang chủ">
            <FeatherIcon type="arrow-left" :size="18" />
            <span>Trang chủ</span>
          </router-link>
          <span class="guest-pill">Miễn phí 100%</span>
        </div>

        <div class="auth-header">
          <router-link to="/" class="logo">
            <FeatherIcon type="book-open" :size="32" class="logo-icon" />
            <span class="logo-text">EngLearn</span>
          </router-link>
          <h1>Đăng ký tài khoản</h1>
          <p>Tạo tài khoản để đồng bộ tiến trình học và từ vựng cá nhân</p>
        </div>

        <!-- Guest Callout -->
        <div class="guest-callout card-subtle">
          <div class="guest-info">
            <FeatherIcon type="compass" :size="20" class="guest-icon" />
            <div>
              <strong>Không bắt buộc đăng ký</strong>
              <p>Có thể bắt đầu học và làm bài tập ngay với tư cách Khách</p>
            </div>
          </div>
          <router-link to="/" class="btn-guest-action">
            <span>Học ngay</span>
            <FeatherIcon type="arrow-right" :size="16" />
          </router-link>
        </div>

        <form @submit.prevent="handleRegister" class="auth-form">
          <div class="form-group">
            <label for="displayName">
              <FeatherIcon type="user" :size="16" />
              <span>Tên hiển thị</span>
            </label>
            <input
              type="text"
              id="displayName"
              v-model="displayName"
              placeholder="Ví dụ: Alex Nguyễn"
              autocomplete="name"
              :disabled="isLoading"
            />
          </div>

          <div class="form-group">
            <label for="email">
              <FeatherIcon type="mail" :size="16" />
              <span>Email</span>
            </label>
            <input
              type="email"
              id="email"
              v-model="email"
              placeholder="email@example.com"
              required
              autocomplete="email"
              :disabled="isLoading"
            />
          </div>

          <div class="form-group">
            <label for="password">
              <FeatherIcon type="lock" :size="16" />
              <span>Mật khẩu</span>
            </label>
            <div class="password-input">
              <input
                :type="showPassword ? 'text' : 'password'"
                id="password"
                v-model="password"
                placeholder="Tối thiểu 6 ký tự"
                required
                minlength="6"
                autocomplete="new-password"
                :disabled="isLoading"
              />
              <button
                type="button"
                class="toggle-password"
                @click="showPassword = !showPassword"
                :aria-label="showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'"
              >
                <FeatherIcon :type="showPassword ? 'eye-off' : 'eye'" :size="18" />
              </button>
            </div>
            <div class="password-strength" v-if="password">
              <div class="strength-bar" :class="passwordStrength"></div>
              <span class="strength-text">{{ passwordStrengthText }}</span>
            </div>
          </div>

          <div class="form-group">
            <label for="confirmPassword">
              <FeatherIcon type="check-circle" :size="16" />
              <span>Xác nhận mật khẩu</span>
            </label>
            <div class="password-input">
              <input
                :type="showConfirmPassword ? 'text' : 'password'"
                id="confirmPassword"
                v-model="confirmPassword"
                placeholder="Nhập lại mật khẩu"
                required
                autocomplete="new-password"
                :disabled="isLoading"
              />
              <button
                type="button"
                class="toggle-password"
                @click="showConfirmPassword = !showConfirmPassword"
                :aria-label="showConfirmPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'"
              >
                <FeatherIcon :type="showConfirmPassword ? 'eye-off' : 'eye'" :size="18" />
              </button>
            </div>
            <div v-if="confirmPassword && confirmPassword !== password" class="validation-error">
              <FeatherIcon type="x-circle" :size="14" />
              <span>Mật khẩu không khớp</span>
            </div>
          </div>

          <div v-if="errorMessage" class="error-message">
            <FeatherIcon type="alert-circle" :size="16" />
            <span>{{ errorMessage }}</span>
          </div>

          <button
            type="submit"
            class="btn-submit-primary"
            :disabled="isLoading || !isFormValid"
          >
            <span v-if="isLoading" class="loading-spinner"></span>
            <span v-else class="btn-content">
              <FeatherIcon type="user-plus" :size="18" />
              <span>Đăng ký ngay</span>
            </span>
          </button>
        </form>

        <div class="auth-footer">
          <p>Đã có tài khoản? <router-link to="/login">Đăng nhập</router-link></p>
        </div>
      </div>

      <!-- Illustration Side -->
      <div class="auth-illustration">
        <div class="floating-shapes">
          <div class="shape shape-1"></div>
          <div class="shape shape-2"></div>
          <div class="shape shape-3"></div>
        </div>
        <div class="illustration-content">
          <div class="illustration-badge">
            <FeatherIcon type="users" :size="20" />
            <span>EngLearn Community</span>
          </div>
          <h2>Bắt đầu hành trình chinh phục tiếng Anh</h2>
          <p>
            Mỗi ngày chỉ cần 10-15 phút cùng Flashcard, Quiz và trợ lý phát âm AI để nâng cao vốn từ vựng vượt bậc.
          </p>
          <div class="feature-bullets">
            <div class="bullet-item">
              <FeatherIcon type="check-circle" :size="18" />
              <span>Theo dõi chuỗi học tập (Streak) & XP</span>
            </div>
            <div class="bullet-item">
              <FeatherIcon type="check-circle" :size="18" />
              <span>Tạo các bộ từ vựng cá nhân hóa (Custom Decks)</span>
            </div>
            <div class="bullet-item">
              <FeatherIcon type="check-circle" :size="18" />
              <span>Đồng bộ tiến trình đa thiết bị mọi lúc mọi nơi</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '../composables/useAuth.js'
import FeatherIcon from '../components/FeatherIcon.vue'

const router = useRouter()
const { register, isLoading } = useAuth()

const displayName = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const showPassword = ref(false)
const showConfirmPassword = ref(false)
const errorMessage = ref('')

const passwordStrength = computed(() => {
  const p = password.value
  if (p.length < 6) return 'weak'
  if (p.length < 8) return 'medium'
  if (p.length >= 8 && /[A-Z]/.test(p) && /[0-9]/.test(p)) return 'strong'
  return 'medium'
})

const passwordStrengthText = computed(() => {
  const strength = passwordStrength.value
  if (strength === 'weak') return 'Yếu (>=6 ký tự)'
  if (strength === 'medium') return 'Khá'
  return 'Mạnh'
})

const isFormValid = computed(() => {
  return (
    email.value &&
    password.value.length >= 6 &&
    confirmPassword.value === password.value
  )
})

async function handleRegister() {
  errorMessage.value = ''

  if (password.value !== confirmPassword.value) {
    errorMessage.value = 'Mật khẩu không khớp'
    return
  }

  if (password.value.length < 6) {
    errorMessage.value = 'Mật khẩu phải có ít nhất 6 ký tự'
    return
  }

  const result = await register(email.value, password.value, displayName.value || null)
  if (result.success) {
    router.push('/')
  } else {
    errorMessage.value = result.error || 'Đăng ký không thành công. Vui lòng thử lại.'
  }
}
</script>

<style scoped>
.auth-page {
  min-height: calc(100vh - 70px);
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, var(--bg-primary) 0%, var(--bg-secondary) 100%);
  padding: 1.5rem;
}

.auth-container {
  display: grid;
  grid-template-columns: 1.15fr 0.85fr;
  max-width: 1020px;
  width: 100%;
  background: var(--card-bg);
  border-radius: var(--radius-2xl);
  box-shadow: 0 20px 45px -10px rgba(0, 0, 0, 0.12), 0 0 0 1px var(--border-color);
  overflow: hidden;
}

.auth-card {
  padding: 2.75rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.card-top-nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.5rem;
}

.btn-back-home {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  color: var(--text-muted);
  text-decoration: none;
  font-size: 0.875rem;
  font-weight: 500;
  padding: 0.35rem 0.65rem;
  border-radius: var(--radius-md);
  background: var(--bg-tertiary);
  transition: all 0.2s ease;
}

.btn-back-home:hover {
  color: var(--mint-600);
  background: var(--mint-50);
}

.guest-pill {
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--mint-700);
  background: var(--mint-100);
  padding: 0.25rem 0.65rem;
  border-radius: var(--radius-full);
}

[data-theme="dark"] .guest-pill {
  background: rgba(21, 183, 158, 0.2);
  color: var(--mint-300);
}

.auth-header {
  text-align: left;
  margin-bottom: 1.25rem;
}

.logo {
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
  color: var(--mint-600);
  font-size: 1.5rem;
  font-weight: 800;
  text-decoration: none;
  margin-bottom: 0.75rem;
  letter-spacing: -0.02em;
}

.logo-icon {
  color: var(--mint-500);
}

.auth-header h1 {
  font-size: 1.75rem;
  color: var(--text-primary);
  margin-bottom: 0.35rem;
  font-weight: 700;
}

.auth-header p {
  color: var(--text-muted);
  font-size: 0.92rem;
  line-height: 1.45;
}

.guest-callout {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.85rem 1.15rem;
  background: linear-gradient(135deg, rgba(21, 183, 158, 0.12), rgba(21, 183, 158, 0.05));
  border: 1px solid rgba(21, 183, 158, 0.3);
  border-radius: var(--radius-xl);
  margin-bottom: 1.25rem;
}

.guest-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.guest-icon {
  color: var(--mint-600);
  flex-shrink: 0;
}

.guest-info strong {
  display: block;
  font-size: 0.88rem;
  color: var(--text-primary);
}

.guest-info p {
  margin: 0;
  font-size: 0.78rem;
  color: var(--text-muted);
}

.btn-guest-action {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.5rem 0.9rem;
  background: var(--mint-500);
  color: white;
  text-decoration: none;
  border-radius: var(--radius-lg);
  font-size: 0.82rem;
  font-weight: 600;
  white-space: nowrap;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.btn-guest-action:hover {
  background: var(--mint-600);
  transform: translateX(2px);
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.form-group label {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  font-weight: 600;
  color: var(--text-secondary);
  font-size: 0.88rem;
}

.form-group input {
  width: 100%;
  padding: 0.8rem 1rem;
  border: 1.5px solid var(--border-color);
  border-radius: var(--radius-lg);
  font-size: 1rem;
  background: var(--bg-secondary);
  color: var(--text-primary);
  transition: all var(--transition-fast);
}

.form-group input:focus {
  outline: none;
  border-color: var(--mint-500);
  box-shadow: 0 0 0 3px rgba(21, 183, 158, 0.15);
}

.form-group input::placeholder {
  color: var(--text-muted);
  font-size: 0.95rem;
}

.password-input {
  position: relative;
  display: flex;
  align-items: center;
}

.password-input input {
  padding-right: 3rem;
}

.toggle-password {
  position: absolute;
  right: 0.65rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  padding: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-md);
  transition: color 0.15s;
}

.toggle-password:hover {
  color: var(--text-primary);
}

.password-strength {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-top: 0.25rem;
}

.strength-bar {
  flex: 1;
  height: 4px;
  border-radius: 2px;
  background: var(--border-color);
  position: relative;
  overflow: hidden;
}

.strength-bar::after {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  border-radius: 2px;
  transition: width 0.3s ease;
}

.strength-bar.weak::after {
  width: 33%;
  background: #ef4444;
}

.strength-bar.medium::after {
  width: 66%;
  background: #f59e0b;
}

.strength-bar.strong::after {
  width: 100%;
  background: var(--mint-500);
}

.strength-text {
  font-size: 0.75rem;
  color: var(--text-muted);
  min-width: 60px;
}

.validation-error {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  color: #ef4444;
  font-size: 0.8rem;
  margin-top: 0.25rem;
}

.error-message {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: var(--radius-lg);
  color: #ef4444;
  font-size: 0.85rem;
}

.btn-submit-primary {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  min-height: 48px;
  padding: 0.85rem 1.5rem;
  background: linear-gradient(135deg, var(--mint-500) 0%, var(--mint-600) 100%);
  color: white;
  font-size: 1rem;
  font-weight: 600;
  border: none;
  border-radius: var(--radius-lg);
  cursor: pointer;
  transition: all var(--transition-fast);
  box-shadow: 0 4px 12px rgba(21, 183, 158, 0.25);
  margin-top: 0.25rem;
}

.btn-submit-primary:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 6px 18px rgba(21, 183, 158, 0.35);
}

.btn-submit-primary:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.btn-content {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.loading-spinner {
  width: 20px;
  height: 20px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.auth-footer {
  margin-top: 1.5rem;
  text-align: center;
  color: var(--text-muted);
  font-size: 0.9rem;
}

.auth-footer a {
  color: var(--mint-600);
  font-weight: 600;
  text-decoration: none;
}

.auth-footer a:hover {
  text-decoration: underline;
}

/* Illustration Side */
.auth-illustration {
  background: linear-gradient(135deg, var(--mint-600) 0%, var(--mint-500) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  padding: 2.5rem;
}

.floating-shapes {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.shape {
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
}

.shape-1 {
  width: 300px;
  height: 300px;
  top: -100px;
  left: -100px;
  animation: float 6s ease-in-out infinite;
}

.shape-2 {
  width: 200px;
  height: 200px;
  bottom: -50px;
  right: -50px;
  animation: float 8s ease-in-out infinite reverse;
}

.shape-3 {
  width: 120px;
  height: 120px;
  top: 45%;
  right: 25%;
  animation: float 5s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0) rotate(0deg); }
  50% { transform: translateY(-15px) rotate(4deg); }
}

.illustration-content {
  position: relative;
  z-index: 1;
  text-align: left;
  color: white;
}

.illustration-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: rgba(255, 255, 255, 0.2);
  padding: 0.35rem 0.85rem;
  border-radius: 999px;
  font-size: 0.8rem;
  font-weight: 600;
  margin-bottom: 1.25rem;
}

.illustration-content h2 {
  font-size: 1.85rem;
  font-weight: 800;
  line-height: 1.25;
  margin-bottom: 0.75rem;
  color: white;
}

.illustration-content p {
  opacity: 0.92;
  font-size: 0.95rem;
  line-height: 1.55;
  margin-bottom: 1.5rem;
}

.feature-bullets {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.bullet-item {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.95);
}

/* Tablet Optimizations (768px to 1024px) */
@media (max-width: 1024px) {
  .auth-container {
    grid-template-columns: 1fr;
    max-width: 540px;
    margin: 0 auto;
  }

  .auth-illustration {
    display: none;
  }

  .auth-card {
    padding: 2.25rem;
  }
}

/* Mobile Optimizations (<768px) */
@media (max-width: 768px) {
  .auth-page {
    padding: 1rem 0.85rem;
    align-items: flex-start;
  }

  .auth-container {
    box-shadow: none;
    border-radius: var(--radius-xl);
    border: none;
    background: transparent;
  }

  .auth-card {
    padding: 1.5rem 1.25rem;
    background: var(--card-bg);
    border-radius: var(--radius-xl);
    box-shadow: var(--shadow-md);
    border: 1px solid var(--border-color);
  }

  .guest-callout {
    flex-direction: column;
    align-items: stretch;
    gap: 0.75rem;
  }

  .btn-guest-action {
    width: 100%;
    justify-content: center;
    padding: 0.65rem 1rem;
  }

  .auth-header h1 {
    font-size: 1.5rem;
  }
}

@media (max-width: 420px) {
  .auth-page {
    padding: 0.5rem 0.5rem 1.5rem;
  }

  .auth-card {
    padding: 1.25rem 1rem;
  }
}
</style>
