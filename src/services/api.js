const API_URL = '/api'

// Fast in-memory cache with TTL
const cacheStore = new Map()
const CACHE_TTL_MS = 60 * 1000 // 1 minute

async function fetchWithCache(url, options = {}, ttl = CACHE_TTL_MS) {
  const method = (options.method || 'GET').toUpperCase()
  if (method !== 'GET') {
    return fetch(url, options).then((r) => r.json())
  }

  const now = Date.now()
  const cached = cacheStore.get(url)
  if (cached && now - cached.timestamp < ttl) {
    return cached.data
  }

  const response = await fetch(url, options)
  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`)
  }
  const data = await response.json()
  cacheStore.set(url, { timestamp: now, data })
  return data
}

export function clearApiCache(prefix = '') {
  if (!prefix) {
    cacheStore.clear()
    return
  }
  for (const key of cacheStore.keys()) {
    if (key.includes(prefix)) {
      cacheStore.delete(key)
    }
  }
}

// Helper to get auth headers
function getAuthHeaders() {
  const token = localStorage.getItem('englearn_access_token')
  return token ? { 'Authorization': `Bearer ${token}` } : {}
}

export const api = {
  async getBooks() {
    return fetchWithCache(`${API_URL}/books`)
  },

  async getBookById(id) {
    return fetchWithCache(`${API_URL}/books/${id}`)
  },

  async getTopicsByBookId(bookId) {
    return fetchWithCache(`${API_URL}/topics/book/${bookId}`)
  },

  async getTopicById(id) {
    return fetchWithCache(`${API_URL}/topics/${id}`)
  },

  async getWordsByTopicId(topicId) {
    return fetchWithCache(`${API_URL}/words/topic/${topicId}`, {}, 120 * 1000)
  },

  async getAllWords() {
    return fetchWithCache(`${API_URL}/words`, {}, 180 * 1000)
  },

  async searchWords(query) {
    if (!query || !query.trim()) return []
    return fetch(`${API_URL}/words/search?q=${encodeURIComponent(query.trim())}`).then(r => r.json())
  },

  async createBook(book) {
    clearApiCache('/api/books')
    const response = await fetch(`${API_URL}/books`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify(book)
    })
    return response.json()
  },

  async createTopic(topic) {
    const response = await fetch(`${API_URL}/topics`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify(topic)
    })
    return response.json()
  },

  async getMyTopics() {
    const response = await fetch(`${API_URL}/topics/my`, {
        headers: getAuthHeaders()
    })
    return response.json()
  },

  async createCustomTopic(topic) {
    const response = await fetch(`${API_URL}/topics/custom`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify(topic)
    })
    return response.json()
  },


  async getRandomWords(limit = 10) {
    const response = await fetch(`${API_URL}/words/random?limit=${limit}`)
    if (!response.ok) throw new Error('Failed to fetch random words')
    return response.json()
  },

  async createWord(word) {
    const response = await fetch(`${API_URL}/words`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify(word)
    })
    return response.json()
  },

  async updateBook(id, book) {
    const response = await fetch(`${API_URL}/books/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify(book)
    })
    return response.json()
  },

  async deleteBook(id) {
    await fetch(`${API_URL}/books/${id}`, { method: 'DELETE', headers: getAuthHeaders() })
  },

  async updateTopic(id, topic) {
    const response = await fetch(`${API_URL}/topics/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify(topic)
    })
    return response.json()
  },

  async deleteTopic(id) {
    await fetch(`${API_URL}/topics/${id}`, { method: 'DELETE', headers: getAuthHeaders() })
  },

  async updateWord(id, word) {
    const response = await fetch(`${API_URL}/words/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify(word)
    })
    return response.json()
  },

  async deleteWord(id) {
    await fetch(`${API_URL}/words/${id}`, { method: 'DELETE', headers: getAuthHeaders() })
  },

  async checkHealth() {
    try {
      await fetch(`${API_URL}/books`)
      return true
    } catch (e) {
      return false
    }
  },

  // AI Features
  async getSynonymsAntonyms(word) {
    const response = await fetch(`${API_URL}/ai/synonyms-antonyms`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ word })
    })
    return response.json()
  },

  async checkSpelling(input, expected, context = null) {
    const response = await fetch(`${API_URL}/ai/spell-check`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ input, expected, context })
    })
    return response.json()
  },

  async explainWord(word, context = null) {
    const response = await fetch(`${API_URL}/ai/explain`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ word, context })
    })
    return response.json()
  },

  async generateSentences(word, level = 'medium') {
    const response = await fetch(`${API_URL}/ai/sentences`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ word, level })
    })
    return response.json()
  },

  async getQuizHint(question, wrongAnswer, correctAnswer) {
    const response = await fetch(`${API_URL}/ai/quiz-hint`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question, wrongAnswer, correctAnswer })
    })
    return response.json()
  },

  async smartSearch(input) {
    const response = await fetch(`${API_URL}/ai/smart-search`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ input })
    })
    return response.json()
  },

  async generateParagraphBlanks(words, topic) {
    const response = await fetch(`${API_URL}/ai/paragraph-blanks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ words, topic })
    })
    return response.json()
  },

  async transcribe(input) {
    const response = await fetch(`${API_URL}/ai/transcribe`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ input })
    })
    return response.json()
  },

  async gradeSentence(word, vietnamese, userSentence) {
    const response = await fetch(`${API_URL}/ai/grade-sentence`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ word, vietnamese, userSentence })
    })
    return response.json()
  },

  // Word Type Learning
  async getWordTypeLesson(words = []) {
    const response = await fetch(`${API_URL}/ai/word-type-lesson`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ words })
    })
    return response.json()
  },

  async getWordTypeQuiz(words = [], questionCount = 5) {
    const response = await fetch(`${API_URL}/ai/word-type-quiz`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ words, level: String(questionCount) })
    })
    return response.json()
  },

  async getPronunciationFeedback(word, userSentence) {
    const response = await fetch(`${API_URL}/ai/pronunciation-feedback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ word, userSentence })
    })
    return response.json()
  },

  async checkPronunciationAudio(formData) {
    const response = await fetch(`${API_URL}/ai/pronunciation-audio`, {
      method: 'POST',
      // No Content-Type header needed for FormData, browser sets it with boundary
      body: formData
    })
    if (!response.ok) throw new Error('Failed to analyze audio')
    return response.json()
  },

  async generatePracticePassage(topic = null, words = null) {
    const response = await fetch(`${API_URL}/ai/generate-practice-passage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ topic, words })
    })
    return response.json()
  },

  async checkParagraphPronunciation(formData) {
    const response = await fetch(`${API_URL}/ai/pronunciation-paragraph`, {
      method: 'POST',
      body: formData
    })
    if (!response.ok) throw new Error('Failed to analyze paragraph pronunciation')
    return response.json()
  },

  // Grammar Tenses
  async getTenses() {
    return fetchWithCache(`${API_URL}/grammar`, {}, 300 * 1000)
  },

  async getGrammarLesson(tenseName, refresh = false) {
    const url = `${API_URL}/grammar/${encodeURIComponent(tenseName)}?refresh=${refresh}`
    if (refresh) {
      clearApiCache(url)
      const response = await fetch(url)
      if (!response.ok) throw new Error('Failed to fetch grammar lesson')
      return response.json()
    }
    return fetchWithCache(url, {}, 300 * 1000)
  }
}

