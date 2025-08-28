<template>
  <div class="bible-api-test">
    <div class="container">
      <h1>🧪 Bible API Test</h1>
      
      <!-- Test Controls -->
      <div class="test-controls">
        <button 
          @click="testConnection"
          :disabled="loading"
          class="btn btn-primary"
        >
          Test Connection
        </button>
        
        <button 
          @click="testSingleVerse('Yohanes 3:16')"
          :disabled="loading"
          class="btn btn-success"
        >
          Test Yohanes 3:16
        </button>
        
        <button 
          @click="testSingleVerse('Mazmur 23:1')"
          :disabled="loading"
          class="btn btn-success"
        >
          Test Mazmur 23:1
        </button>
        
        <button 
          @click="testSingleVerse('Yesaya 55:10-11')"
          :disabled="loading"
          class="btn btn-success"
        >
          Test Yesaya 55:10-11
        </button>
        
        <button 
          @click="clearResults"
          class="btn btn-danger"
        >
          Clear Results
        </button>
      </div>

      <!-- Manual VerseLink Test -->
      <div class="test-section">
        <h3>Manual VerseLink Test</h3>
        <p>
          Klik referensi berikut untuk test popup: 
          <VerseLink reference="Yohanes 3:16" /> 
          <VerseLink reference="Mazmur 23:1" /> 
          <VerseLink reference="Yesaya 55:11" />
        </p>
      </div>

      <!-- Auto VerseLinks Test -->
      <div class="test-section">
        <h3>Auto VerseLinks Test</h3>
        <AutoVerseLinks 
          :text="sampleText"
          :linkOptions="{
            highlightStyle: 'underline',
            underline: true
          }"
        />
      </div>

      <!-- Test Results -->
      <div class="test-results" v-if="testResults.length > 0 || loading">
        <h3>Test Results</h3>
        <div v-if="loading" class="loading">⏳ Running test...</div>
        
        <div class="results-container">
          <div 
            v-for="(result, index) in testResults" 
            :key="index"
            :class="['result-item', result.success ? 'success' : 'error']"
          >
            <div class="result-header">
              <span class="result-icon">{{ result.success ? '✅' : '❌' }}</span>
              <span class="result-test">{{ result.test }}</span>
              <small class="result-time">{{ result.timestamp }}</small>
            </div>
            <div class="result-message">{{ result.message }}</div>
            <div v-if="result.data" class="result-data">
              Preview: {{ result.data }}
            </div>
          </div>
        </div>
      </div>

      <!-- Instructions -->
      <div class="instructions">
        <h3>📋 Cara Penggunaan</h3>
        <ol>
          <li>
            <strong>Update API Key:</strong> Pastikan API key sudah benar di file 
            <code>src/services/bibleApi.js</code>
          </li>
          <li>
            <strong>Test Connection:</strong> Klik "Test Connection" untuk memastikan API dapat diakses.
          </li>
          <li>
            <strong>Test Manual Links:</strong> Klik referensi ayat di bagian "Manual VerseLink Test".
          </li>
          <li>
            <strong>Test Auto Detection:</strong> Lihat bagaimana referensi ayat otomatis terdeteksi 
            di bagian "Auto VerseLinks Test".
          </li>
          <li>
            <strong>Implementasi:</strong> Gunakan komponen <code>VerseLink</code> atau <code>AutoVerseLinks</code> 
            di halaman renungan Anda.
          </li>
        </ol>
      </div>
    </div>
  </div>
</template>

<script>
import { testApiConnection, getVerse } from '../services/bibleApi'
import VerseLink from '../components/VerseLink.vue'
import AutoVerseLinks from '../components/AutoVerseLinks.vue'

export default {
  name: 'BibleApiTest',
  components: {
    VerseLink,
    AutoVerseLinks
  },
  data() {
    return {
      testResults: [],
      loading: false,
      sampleText: `
        Firman Tuhan dalam Yesaya 55:11 berkata bahwa firman-Nya tidak akan kembali dengan sia-sia. 
        Kita juga dapat membaca janji indah dalam Yeremia 29:11 tentang rencana Allah untuk kehidupan kita.
        Mazmur 23:1 mengajarkan kita bahwa Tuhan adalah gembala yang baik.
        Mari kita renungkan juga Yohanes 3:16 yang merupakan inti dari Injil.
      `
    }
  },
  methods: {
    addResult(result) {
      this.testResults.push({
        ...result,
        timestamp: new Date().toLocaleTimeString()
      })
    },

    clearResults() {
      this.testResults = []
    },

    async testConnection() {
      this.loading = true
      try {
        const isConnected = await testApiConnection()
        this.addResult({
          test: 'API Connection',
          success: isConnected,
          message: isConnected ? 'Koneksi berhasil' : 'Koneksi gagal'
        })
      } catch (error) {
        this.addResult({
          test: 'API Connection',
          success: false,
          message: `Error: ${error.message}`
        })
      }
      this.loading = false
    },

    async testSingleVerse(reference) {
      this.loading = true
      try {
        const result = await getVerse(reference)
        this.addResult({
          test: `Single Verse: ${reference}`,
          success: result.success,
          message: result.success ? 'Berhasil mengambil ayat' : result.error,
          data: result.success ? result.text.substring(0, 100) + '...' : null
        })
      } catch (error) {
        this.addResult({
          test: `Single Verse: ${reference}`,
          success: false,
          message: `Error: ${error.message}`
        })
      }
      this.loading = false
    }
  }
}
</script>

<style scoped>
.bible-api-test {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.container h1 {
  text-align: center;
  color: #2d3748;
  margin-bottom: 30px;
}

.test-controls {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  margin-bottom: 30px;
}

.btn {
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s ease;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-primary {
  background-color: #667eea;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background-color: #5a67d8;
}

.btn-success {
  background-color: #48bb78;
  color: white;
}

.btn-success:hover:not(:disabled) {
  background-color: #38a169;
}

.btn-danger {
  background-color: #f56565;
  color: white;
}

.btn-danger:hover:not(:disabled) {
  background-color: #e53e3e;
}

.test-section {
  margin-bottom: 30px;
  padding: 20px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
}

.test-section h3 {
  margin-top: 0;
  color: #2d3748;
}

.test-results {
  margin-top: 30px;
}

.test-results h3 {
  color: #2d3748;
}

.loading {
  padding: 10px;
  text-align: center;
  color: #718096;
}

.results-container {
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 15px;
}

.result-item {
  margin-bottom: 10px;
  padding: 10px;
  border-radius: 4px;
  border-left: 4px solid;
}

.result-item.success {
  background-color: #f0fff4;
  border-left-color: #48bb78;
}

.result-item.error {
  background-color: #fef5e7;
  border-left-color: #f56565;
}

.result-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: bold;
  margin-bottom: 5px;
}

.result-time {
  margin-left: auto;
  color: #666;
  font-weight: normal;
}

.result-message {
  font-size: 14px;
  color: #666;
}

.result-data {
  font-size: 12px;
  color: #888;
  margin-top: 5px;
  font-style: italic;
}

.instructions {
  margin-top: 30px;
  padding: 20px;
  background-color: #f7fafc;
  border-radius: 8px;
}

.instructions h3 {
  margin-top: 0;
  color: #2d3748;
}

.instructions ol {
  line-height: 1.6;
}

.instructions code {
  background-color: #e2e8f0;
  padding: 2px 4px;
  border-radius: 3px;
  font-family: 'Monaco', 'Menlo', monospace;
}
</style>
