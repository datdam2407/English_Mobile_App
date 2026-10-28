const HISTORY_KEY = 'englearn_dict_history'
const FAVORITES_KEY = 'englearn_dict_favorites'
const GOAL_KEY = 'englearn_user_goal'
const ONBOARDED_KEY = 'englearn_onboarded'

export const dictionaryStorage = {
  // Search History
  getSearchHistory() {
    try {
      const data = localStorage.getItem(HISTORY_KEY)
      return data ? JSON.parse(data) : []
    } catch {
      return []
    }
  },

  addSearchHistory(word) {
    if (!word) return
    const text = typeof word === 'string' ? word : word.english
    if (!text) return
    const history = this.getSearchHistory().filter(w => w.toLowerCase() !== text.toLowerCase())
    history.unshift(text)
    try {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(0, 30)))
    } catch {}
  },

  clearSearchHistory() {
    localStorage.removeItem(HISTORY_KEY)
  },

  // Favorites
  getFavorites() {
    try {
      const data = localStorage.getItem(FAVORITES_KEY)
      return data ? JSON.parse(data) : []
    } catch {
      return []
    }
  },

  isFavorited(wordId) {
    if (!wordId) return false
    const list = this.getFavorites()
    return list.some(w => w.id === wordId)
  },

  toggleFavorite(word) {
    if (!word || !word.id) return false
    const list = this.getFavorites()
    const index = list.findIndex(w => w.id === word.id)
    let isFav = false
    if (index >= 0) {
      list.splice(index, 1)
      isFav = false
    } else {
      list.unshift(word)
      isFav = true
    }
    try {
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(list))
    } catch {}
    return isFav
  },

  // User Goal & Onboarding
  isOnboarded() {
    return localStorage.getItem(ONBOARDED_KEY) === 'true'
  },

  setOnboarded(value = true) {
    localStorage.setItem(ONBOARDED_KEY, value ? 'true' : 'false')
  },

  getUserGoal() {
    try {
      const data = localStorage.getItem(GOAL_KEY)
      if (data) return JSON.parse(data)
    } catch {}
    return {
      level: 'B1-B2',
      levelName: 'Intermediate (B1–B2)',
      target: 'toeic_ielts',
      targetName: 'Luyện thi TOEIC / IELTS',
      dailyWords: 10,
      minutesPerDay: 10
    }
  },

  setUserGoal(goal) {
    try {
      localStorage.setItem(GOAL_KEY, JSON.stringify(goal))
    } catch {}
  }
}
