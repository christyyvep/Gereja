<template>
  <div class="autocomplete-container">
    <div class="form-group">
      <label :for="id">{{ label }}</label>
      
      <!-- Input field dengan autocomplete -->
      <div class="input-wrapper" :class="{ 'has-suggestions': showSuggestions }">
        <input 
          :id="id"
          :type="type"
          :placeholder="placeholder"
          :value="modelValue"
          @input="onInput"
          @focus="onFocus"
          @blur="onBlur"
          @keydown="onKeydown"
          :class="{ 'filled': modelValue, 'loading': isLoading }"
          ref="inputRef"
          autocomplete="off"
        />
        
        <!-- Loading spinner -->
        <div v-if="isLoading" class="loading-spinner">
          <div class="spinner"></div>
        </div>
        
        <!-- Clear button -->
        <button 
          v-if="modelValue && !isLoading" 
          type="button"
          class="clear-btn"
          @click="clearInput"
          aria-label="Hapus input"
        >
          ✕
        </button>
      </div>
      
      <!-- Suggestions dropdown -->
      <div 
        v-if="showSuggestions && suggestions.length > 0" 
        class="suggestions-dropdown"
        ref="dropdownRef"
      >
        <!-- Search info header -->
        <div class="search-info">
          <span class="search-count">{{ suggestions.length }} nama ditemukan</span>
          <span class="search-query">untuk "{{ searchQuery }}"</span>
        </div>
        
        <!-- Suggestion items -->
        <div 
          v-for="(suggestion, index) in suggestions" 
          :key="suggestion.id"
          class="suggestion-item"
          :class="{ 
            'active': selectedIndex === index,
            'registered': suggestion.isRegistered
          }"
          @click="selectSuggestion(suggestion)"
          @mouseenter="selectedIndex = index"
        >
          <div class="suggestion-name">
            <span v-html="highlightMatch(suggestion.nama, searchQuery)"></span>
          </div>
          
          <div class="suggestion-status">
            <span 
              class="status-badge"
              :class="suggestion.isRegistered ? 'registered' : 'not-registered'"
            >
              {{ suggestion.isRegistered ? 'SUDAH REGISTRASI' : 'BELUM REGISTRASI' }}
            </span>
          </div>
        </div>
      </div>
      
      <!-- No results state -->
      <div 
        v-if="showSuggestions && suggestions.length === 0 && searchQuery && !isLoading"
        class="no-results"
      >
        <div class="no-results-icon">🔍</div>
        <div class="no-results-text">
          <p><strong>Tidak ada nama yang cocok dengan "{{ searchQuery }}"</strong></p>
          <p>Coba ketik dengan ejaan yang berbeda atau hubungi admin untuk mendaftarkan nama Anda.</p>
        </div>
      </div>
      
      <!-- Error message -->
      <p v-if="error" class="error-text">{{ error }}</p>
    </div>
  </div>
</template>

<script>
import { getAllJemaatNames } from '@/services/auth-hybrid'

export default {
  name: 'AutoCompleteInput',
  
  props: {
    id: {
      type: String,
      required: true
    },
    label: {
      type: String,
      required: true
    },
    type: {
      type: String,
      default: 'text'
    },
    placeholder: {
      type: String,
      default: ''
    },
    modelValue: {
      type: String,
      default: ''
    },
    error: {
      type: String,
      default: ''
    },
    minChars: {
      type: Number,
      default: 2
    }
  },
  
  emits: ['update:modelValue', 'suggestion-selected', 'nama-validated'],
  
  data() {
    return {
      suggestions: [],
      showSuggestions: false,
      isLoading: false,
      selectedIndex: -1,
      searchQuery: '',
      searchTimeout: null,
      allNames: []
    }
  },
  
  watch: {
    modelValue(newValue) {
      if (newValue !== this.searchQuery) {
        this.searchQuery = newValue
        this.debouncedSearch()
      }
    }
  },
  
  mounted() {
    this.loadAllNames()
    document.addEventListener('click', this.handleClickOutside)
  },
  
  beforeUnmount() {
    this.cleanup()
  },
  
  methods: {
    // ⭐ Load all names for searching
    async loadAllNames() {
      try {
        this.allNames = await getAllJemaatNames()
      } catch (error) {
        console.error('❌ [AutoComplete] Failed to load names:', error)
        this.allNames = []
      }
    },
    
    // ⭐ Handle input changes
    onInput(event) {
      const value = event.target.value
      this.searchQuery = value
      this.$emit('update:modelValue', value)
      this.selectedIndex = -1
      
      if (value.length < this.minChars) {
        this.resetSuggestions()
        return
      }
      
      this.debouncedSearch()
    },
    
    // ⭐ Handle input focus
    onFocus() {
      if (this.searchQuery.length >= this.minChars && this.suggestions.length > 0) {
        this.showSuggestions = true
      }
    },
    
    // ⭐ Handle input blur (with delay for clicks)
    onBlur() {
      setTimeout(() => {
        this.showSuggestions = false
        this.selectedIndex = -1
      }, 150)
    },
    
    // ⭐ Handle keyboard navigation
    onKeydown(event) {
      if (!this.showSuggestions || this.suggestions.length === 0) return
      
      switch (event.key) {
        case 'ArrowDown':
          event.preventDefault()
          this.selectedIndex = Math.min(this.selectedIndex + 1, this.suggestions.length - 1)
          this.scrollToSelected()
          break
          
        case 'ArrowUp':
          event.preventDefault()
          this.selectedIndex = Math.max(this.selectedIndex - 1, -1)
          this.scrollToSelected()
          break
          
        case 'Enter':
          event.preventDefault()
          if (this.selectedIndex >= 0) {
            this.selectSuggestion(this.suggestions[this.selectedIndex])
          }
          break
          
        case 'Escape':
          this.resetSuggestions()
          this.$refs.inputRef.blur()
          break
      }
    },
    
    // ⭐ Debounced search to avoid too many API calls
    debouncedSearch() {
      if (this.searchTimeout) {
        clearTimeout(this.searchTimeout)
      }
      
      this.searchTimeout = setTimeout(() => {
        this.performSearch()
      }, 300)
    },
    
    // ⭐ Perform the actual search
    performSearch() {
      if (this.searchQuery.length < this.minChars) {
        this.resetSuggestions()
        return
      }
      
      this.isLoading = true
      
      try {
        const query = this.searchQuery.toLowerCase().trim()
        const filteredNames = this.filterNames(query)
        const sortedNames = this.sortNames(filteredNames, query)
        
        this.suggestions = sortedNames.slice(0, 8) // Limit to 8 results
        this.showSuggestions = this.suggestions.length > 0
        this.selectedIndex = -1
        
      } catch (error) {
        console.error('❌ [AutoComplete] Search error:', error)
        this.resetSuggestions()
      } finally {
        this.isLoading = false
      }
    },
    
    // ⭐ Filter names based on query
    filterNames(query) {
      return this.allNames.filter(person => {
        const nama = person.nama.toLowerCase()
        return (
          nama.startsWith(query) ||
          nama.includes(query) ||
          nama.split(' ').some(word => word.startsWith(query))
        )
      })
    },
    
    // ⭐ Sort filtered names by relevance
    sortNames(filteredNames, query) {
      return filteredNames.sort((a, b) => {
        const aName = a.nama.toLowerCase()
        const bName = b.nama.toLowerCase()
        
        // Exact match first
        if (aName === query) return -1
        if (bName === query) return 1
        
        // Starts with query second
        if (aName.startsWith(query) && !bName.startsWith(query)) return -1
        if (bName.startsWith(query) && !aName.startsWith(query)) return 1
        
        // Alphabetical order last
        return aName.localeCompare(bName)
      })
    },
    
    // ⭐ Select a suggestion
    selectSuggestion(suggestion) {
      this.$emit('update:modelValue', suggestion.nama)
      this.$emit('suggestion-selected', suggestion)
      this.$emit('nama-validated', {
        nama: suggestion.nama,
        exists: true,
        isRegistered: suggestion.isRegistered,
        userData: suggestion
      })
      
      this.resetSuggestions()
      this.$refs.inputRef.blur()
    },
    
    // ⭐ Clear input field
    clearInput() {
      this.$emit('update:modelValue', '')
      this.resetSuggestions()
      this.searchQuery = ''
      this.$refs.inputRef.focus()
    },
    
    // ⭐ Highlight matching text in suggestions
    highlightMatch(text, query) {
      if (!query) return text
      
      const regex = new RegExp(`(${query})`, 'gi')
      return text.replace(regex, '<mark>$1</mark>')
    },
    
    // ⭐ Scroll to selected item in dropdown
    scrollToSelected() {
      if (this.selectedIndex >= 0 && this.$refs.dropdownRef) {
        const dropdown = this.$refs.dropdownRef
        const items = dropdown.querySelectorAll('.suggestion-item')
        const selectedItem = items[this.selectedIndex]
        
        if (selectedItem) {
          selectedItem.scrollIntoView({
            block: 'nearest',
            behavior: 'smooth'
          })
        }
      }
    },
    
    // ⭐ Handle clicks outside component
    handleClickOutside(event) {
      if (!this.$el.contains(event.target)) {
        this.resetSuggestions()
      }
    },
    
    // ⭐ Reset suggestions state
    resetSuggestions() {
      this.suggestions = []
      this.showSuggestions = false
      this.selectedIndex = -1
    },
    
    // ⭐ Cleanup on component destroy
    cleanup() {
      if (this.searchTimeout) {
        clearTimeout(this.searchTimeout)
      }
      document.removeEventListener('click', this.handleClickOutside)
    }
  }
}
</script>

<style scoped>
/* ⭐ CONTAINER & FORM GROUP */
.autocomplete-container {
  position: relative;
  width: 100%;
}

.form-group {
  width: 100%;
  max-width: 360px;
  margin-bottom: 16px;
}

/* ⭐ LABEL */
label {
  display: block;
  font-weight: bold;
  margin-bottom: 6px;
  font-family: 'Inter';
  font-size: 14px;
  color: #333;
}

/* ⭐ INPUT WRAPPER */
.input-wrapper {
  position: relative;
  width: 100%;
}

.input-wrapper.has-suggestions {
  border-radius: 6px 6px 0 0;
}

/* ⭐ INPUT FIELD */
input {
  width: 100%;
  height: 44px;
  padding: 12px 40px 12px 12px;
  font-size: 14px;
  font-family: 'Inter';
  border: 2px solid #41442A;
  border-radius: 6px;
  background-color: #fcfcf7;
  box-sizing: border-box;
  transition: all 0.2s ease;
  color: #777;
}

input:focus {
  outline: none;
  border-color: #5a5e3d;
  box-shadow: 0 0 0 3px rgba(65, 68, 42, 0.1);
}

input.filled {
  color: #333;
}

input.loading {
  padding-right: 70px;
}

/* ⭐ LOADING SPINNER */
.loading-spinner {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
}

.spinner {
  width: 16px;
  height: 16px;
  border: 2px solid #e0e0e0;
  border-top: 2px solid #41442A;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* ⭐ CLEAR BUTTON */
.clear-btn {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  width: 20px;
  height: 20px;
  border: none;
  background: #ccc;
  color: white;
  border-radius: 50%;
  font-size: 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s ease;
}

.clear-btn:hover {
  background: #999;
}

/* ⭐ SUGGESTIONS DROPDOWN */
.suggestions-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border: 2px solid #41442A;
  border-top: 1px solid #e0e0e0;
  border-radius: 0 0 8px 8px;
  max-height: 300px;
  overflow-y: auto;
  z-index: 1000;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

/* ⭐ SEARCH INFO HEADER */
.search-info {
  padding: 8px 12px;
  background: #f8f9fa;
  border-bottom: 1px solid #e0e0e0;
  font-size: 12px;
  color: #666;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.search-count {
  font-weight: 600;
  color: #41442A;
}

.search-query {
  font-style: italic;
}

/* ⭐ SUGGESTION ITEMS */
.suggestion-item {
  padding: 12px;
  cursor: pointer;
  border-bottom: 1px solid #f0f0f0;
  transition: all 0.2s ease;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.suggestion-item:hover,
.suggestion-item.active {
  background-color: #f0f8ff;
  border-left: 3px solid #41442A;
}

.suggestion-item:last-child {
  border-bottom: none;
}

.suggestion-name {
  font-size: 14px;
  font-weight: 600;
  color: #333;
  font-family: 'Inter';
  flex: 1;
  min-width: 0;
}

.suggestion-name :deep(mark) {
  background-color: #ffeb3b;
  color: #333;
  padding: 1px 2px;
  border-radius: 2px;
  font-weight: 700;
}

/* ⭐ STATUS BADGES */
.suggestion-status {
  display: flex;
  align-items: center;
}

.status-badge {
  font-size: 9px;
  padding: 3px 6px;
  border-radius: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  white-space: nowrap;
}

.status-badge.registered {
  background: #e8f5e8;
  color: #2e7d32;
  border: 1px solid #c8e6c9;
}

.status-badge.not-registered {
  background: #fff3cd;
  color: #856404;
  border: 1px solid #ffeaa7;
}

/* ⭐ NO RESULTS STATE */
.no-results {
  padding: 20px;
  text-align: center;
  color: #666;
}

.no-results-icon {
  font-size: 32px;
  margin-bottom: 8px;
}

.no-results-text p {
  margin: 4px 0;
  font-size: 14px;
  line-height: 1.4;
}

.no-results-text p:first-child {
  font-weight: 600;
  color: #333;
}

/* ⭐ ERROR MESSAGE */
.error-text {
  color: #dc3545;
  font-size: 12px;
  margin-top: 4px;
  margin-bottom: 0;
  font-family: 'Inter';
}

/* ⭐ RESPONSIVE DESIGN */
@media (max-width: 360px) {
  .suggestion-item {
    padding: 10px;
  }
  
  .suggestion-name {
    font-size: 13px;
  }
  
  .status-badge {
    font-size: 8px;
    padding: 2px 4px;
  }
  
  .search-info {
    font-size: 11px;
  }
}

/* ⭐ ACCESSIBILITY - Reduced motion */
@media (prefers-reduced-motion: reduce) {
  .spinner {
    animation: none;
  }
  
  input,
  .suggestion-item,
  .clear-btn {
    transition: none;
  }
}
</style>