<template>
  <component 
    :is="tag" 
    :class="className"
  >
    <template v-for="(element, index) in processedElements" :key="index">
      <VerseLink 
        v-if="element.type === 'verse'"
        :reference="element.reference"
        :class="[linkOptions.linkClass, `verse-link-${linkOptions.highlightStyle}`]"
        :underline="linkOptions.highlightStyle === 'underline' ? linkOptions.underline : false"
      >
        {{ element.text }}
      </VerseLink>
      <span v-else>{{ element.text }}</span>
    </template>
  </component>
</template>

<script>
import { extractVerseReferences } from '../services/bibleApi'
import VerseLink from './VerseLink.vue'

export default {
  name: 'AutoVerseLinks',
  components: {
    VerseLink
  },
  props: {
    text: {
      type: String,
      required: true
    },
    className: {
      type: String,
      default: ''
    },
    tag: {
      type: String,
      default: 'span'
    },
    linkOptions: {
      type: Object,
      default: () => ({
        linkClass: '',
        underline: true,
        highlightStyle: 'underline' // 'underline', 'highlight', 'border', 'icon'
      })
    }
  },
  computed: {
    processedElements() {
      if (!this.text || typeof this.text !== 'string') {
        return [{ type: 'text', text: this.text || '' }]
      }

      // Extract semua referensi ayat dari teks
      const references = extractVerseReferences(this.text)
      
      if (references.length === 0) {
        return [{ type: 'text', text: this.text }]
      }

      // Split teks berdasarkan referensi dan buat element objects
      let processedText = this.text
      let elements = []
      let lastIndex = 0

      references.forEach((reference) => {
        const refIndex = processedText.indexOf(reference, lastIndex)
        
        if (refIndex !== -1) {
          // Tambahkan teks sebelum referensi
          if (refIndex > lastIndex) {
            elements.push({
              type: 'text',
              text: processedText.substring(lastIndex, refIndex)
            })
          }
          
          // Tambahkan referensi sebagai VerseLink
          elements.push({
            type: 'verse',
            reference: reference,
            text: reference
          })
          
          lastIndex = refIndex + reference.length
        }
      })

      // Tambahkan sisa teks setelah referensi terakhir
      if (lastIndex < processedText.length) {
        elements.push({
          type: 'text',
          text: processedText.substring(lastIndex)
        })
      }

      return elements
    }
  }
}
</script>

<style scoped>
/* Tidak ada style khusus karena menggunakan VerseLink component */
</style>
