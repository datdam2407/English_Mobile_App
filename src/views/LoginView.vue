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
          <h1>Đăng nhập</h1>
          <p>Học từ vựng TOEIC, ngữ pháp & luyện phát âm AI</p>
        </div>

        <!-- Quick Guest Continue Banner (No login required) -->
        <div class="guest-callout card-subtle">
          <div class="guest-info">
            <FeatherIcon type="compass" :size="20" class="guest-icon" />
            <div>
              <strong>Không bắt buộc đăng nhập</strong>
              <p>Bạn có thể vào học, đọc tài liệu và làm quiz ngay</p>
            </div>
          </div>
          <router-link to="/" class="btn-guest-action">
            <span>Học ngay</span>
            <FeatherIcon type="arrow-right" :size="16" />
          </router-link>
        </div>

        <div class="divider-text">
          <span>hoặc đăng nhập để lưu tiến trình cloud</span>
        </div>

        <!-- Form -->
        <form @submit.prevent="handleLogin" class="auth-form">
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
            <div class="label-row">
              <label for="password">
                <FeatherIcon type="lock" :size="16" />
                <span>Mật khẩu</span>
              </label>
            </div>
            <div class="password-input">
              <input
                :type="showPassword ? 'text' : 'password'"
                id="password"
                v-model="password"
                placeholder="Nhập mật khẩu"
                required
                autocomplete="current-password"
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
          </div>

          <div v-if="errorMessage" class="error-message">
            <FeatherIcon type="alert-circle" :size="16" />
            <span>{{ errorMessage }}</span>
          </div>

          <button type="submit" class="btn-submit-primary" :disabled="isLoading">
            <span v-if="isLoading" class="loading-spinner"></span>
            <span v-else class="btn-content">
              <FeatherIcon type="log-in" :size="18" />
              <span>Đăng nhập</span>
            </span>
          </button>

          <!-- 1-Click Demo Account -->
          <button
            type="button"
            class="btn-demo"
            @click="fillDemoAccount"
            :disabled="isLoading"
          >
            <FeatherIcon type="zap" :size="16" />
            <span>Thử nhanh với tài khoản Demo (1-Click)</span>
          </button>
        </form>

        <div class="auth-footer">
          <p>Chưa có tài khoản? <router-link to="/register">Đăng ký tài khoản mới</router-link></p>
        </div>
      </div>

      <!-- Illustration Side (Desktop & Large Tablet) -->
      <div class="auth-illustration">
        <div class="floating-shapes">
          <div class="shape shape-1"></div>
          <div class="shape shape-2"></div>
          <div class="shape shape-3"></div>
        </div>
        <div class="illustration-content">
          <div class="illustration-badge">
            <FeatherIcon type="award" :size="24" />
            <span>Phương pháp SRS SM-2</span>
          </div>
          <h2>Học tiếng Anh thông minh & lâu dài</h2>
          <p>
            Hệ thống lặp lại ngắt quãng (Spaced Repetition) kết hợp AI giúp bạn ghi nhớ từ vựng tự nhiên và hiệu quả gấp 3 lần.
          </p>
          <div class="feature-bullets">
            <div class="bullet-item">
              <FeatherIcon type="check-circle" :size="18" />
              <span>Kho 600 từ vựng TOEIC kèm audio & ví dụ</span>
            </div>
            <div class="bullet-item">
              <FeatherIcon type="check-circle" :size="18" />
              <span>12 thì ngữ pháp tiếng Anh kèm bài tập giải thích</span>
            </div>
            <div class="bullet-item">
              <FeatherIcon type="check-circle" :size="18" />
              <span>Trợ lý AI luyện phát âm & chấm điểm nói</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '../composables/useAuth.js'
import FeatherIcon from '../components/FeatherIcon.vue'

const router = useRouter()
const { login, isLoading } = useAuth()

const email = ref('')
const password = ref('')
const showPassword = ref(false)
const errorMessage = ref('')

async function handleLogin() {
  errorMessage.value = ''
  const result = await login(email.value, password.value)
  if (result.success) {
    router.push('/')
  } else {
    errorMessage.value = result.error || 'Đăng nhập không thành công. Vui lòng thử lại.'
  }
}

function fillDemoAccount() {
  email.value = 'demo@englearn.com'
  password.value = 'user123'
  handleLogin()
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

/* Card Top Navigation */
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
  margin-bottom: 1.5rem;
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

/* Guest Callout */
.guest-callout {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.9rem 1.15rem;
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

/* Divider */
.divider-text {
  display: flex;
  align-items: center;
  text-align: center;
  margin-bottom: 1.25rem;
  color: var(--text-muted);
  font-size: 0.8rem;
}

.divider-text::before,
.divider-text::after {
  content: '';
  flex: 1;
  border-bottom: 1px solid var(--border-color);
}

.divider-text span {
  padding: 0 0.75rem;
}

/* Form */
.auth-form {
  display: flex;
  flex-direction: column;
  gap: 1.15rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
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
  padding: 0.85rem 1rem;
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

.btn-demo {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.45rem;
  padding: 0.75rem 1rem;
  background: var(--bg-tertiary);
  border: 1px dashed var(--mint-400);
  border-radius: var(--radius-lg);
  color: var(--mint-700);
  font-size: 0.88rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

[data-theme="dark"] .btn-demo {
  color: var(--mint-300);
}

.btn-demo:hover:not(:disabled) {
  background: var(--mint-50);
  border-color: var(--mint-500);
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
  right: -100px;
  animation: float 6s ease-in-out infinite;
}

.shape-2 {
  width: 200px;
  height: 200px;
  bottom: -50px;
  left: -50px;
  animation: float 8s ease-in-out infinite reverse;
}

.shape-3 {
  width: 120px;
  height: 120px;
  top: 45%;
  left: 20%;
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
