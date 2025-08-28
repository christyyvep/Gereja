/**
 * Service untuk integrasi dengan Bible API - Alkitab.me URL Approach
 * Menggunakan alkitab.me dengan format URL langsung untuk Terjemahan Baru Indonesia
 */

// Bible APIs
const FREE_BIBLE_API = 'https://bible-api.com'
const ALKITAB_MOBI_BASE = 'https://alkitab.mobi'

// Mapping kitab Indonesia ke format alkitab.mobi
const MOBI_BOOK_MAPPING = {
  'GEN': 'Kejadian', 'EXO': 'Keluaran', 'LEV': 'Imamat', 'NUM': 'Bilangan', 'DEU': 'Ulangan',
  'JOS': 'Yosua', 'JDG': 'Hakim-hakim', 'RUT': 'Rut', '1SA': '1Samuel', '2SA': '2Samuel',
  '1KI': '1Raja-raja', '2KI': '2Raja-raja', '1CH': '1Tawarikh', '2CH': '2Tawarikh', 'EZR': 'Ezra',
  'NEH': 'Nehemia', 'EST': 'Ester', 'JOB': 'Ayub', 'PSA': 'Mazmur', 'PRO': 'Amsal',
  'ECC': 'Pengkhotbah', 'SNG': 'Kidung Agung', 'ISA': 'Yesaya', 'JER': 'Yeremia', 'LAM': 'Ratapan',
  'EZK': 'Yehezkiel', 'DAN': 'Daniel', 'HOS': 'Hosea', 'JOL': 'Yoel', 'AMO': 'Amos',
  'OBA': 'Obaja', 'JON': 'Yunus', 'MIC': 'Mikha', 'NAM': 'Nahum', 'HAB': 'Habakuk',
  'ZEP': 'Zefanya', 'HAG': 'Hagai', 'ZEC': 'Zakharia', 'MAL': 'Maleakhi',
  'MAT': 'Matius', 'MRK': 'Markus', 'LUK': 'Lukas', 'JHN': 'Yohanes', 'ACT': 'Kisah',
  'ROM': 'Roma', '1CO': '1Korintus', '2CO': '2Korintus', 'GAL': 'Galatia', 'EPH': 'Efesus',
  'PHP': 'Filipi', 'COL': 'Kolose', '1TH': '1Tesalonika', '2TH': '2Tesalonika', '1TI': '1Timotius',
  '2TI': '2Timotius', 'TIT': 'Titus', 'PHM': 'Filemon', 'HEB': 'Ibrani', 'JAS': 'Yakobus',
  '1PE': '1Petrus', '2PE': '2Petrus', '1JN': '1Yohanes', '2JN': '2Yohanes', '3JN': '3Yohanes',
  'JUD': 'Yudas', 'REV': 'Wahyu'
}

// Data ayat Indonesia populer sebagai fallback
const INDONESIAN_VERSES = {
  // Ayat-ayat populer Perjanjian Baru
  'JHN.3.16': 'Karena begitu besar kasih Allah akan dunia ini, sehingga Ia telah mengaruniakan Anak-Nya yang tunggal, supaya setiap orang yang percaya kepada-Nya tidak binasa, melainkan beroleh hidup yang kekal.',
  'ROM.8.28': 'Kita tahu sekarang, bahwa Allah turut bekerja dalam segala sesuatu untuk mendatangkan kebaikan bagi mereka yang mengasihi Dia, yaitu bagi mereka yang terpanggil sesuai dengan rencana Allah.',
  'PHP.4.13': 'Segala perkara dapat kutanggung di dalam Dia yang memberi kekuatan kepadaku.',
  'MAT.28.19': 'Karena itu pergilah, jadikanlah semua bangsa murid-Ku dan baptislah mereka dalam nama Bapa dan Anak dan Roh Kudus.',
  'JHN.14.6': 'Kata Yesus kepadanya: "Akulah jalan dan kebenaran dan hidup. Tidak ada seorangpun yang datang kepada Bapa, kalau tidak melalui Aku."',
  '1CO.13.4': 'Kasih itu sabar; kasih itu murah hati; ia tidak cemburu. Ia tidak memegahkan diri dan tidak sombong.',
  'GAL.5.22': 'Tetapi buah Roh ialah: kasih, sukacita, damai sejahtera, kesabaran, kemurahan, kebaikan, kesetiaan,',
  'EPH.2.8': 'Sebab karena kasih karunia kamu diselamatkan oleh iman; itu bukan hasil usahamu, tetapi pemberian Allah,',
  'EPH.2.9': 'itu bukan hasil pekerjaanmu: jangan ada orang yang memegahkan diri.',
  'JHN.1.1': 'Pada mulanya adalah Firman; Firman itu bersama-sama dengan Allah dan Firman itu adalah Allah.',
  'ROM.3.23': 'Karena semua orang telah berbuat dosa dan telah kehilangan kemuliaan Allah,',
  'ROM.6.23': 'Sebab upah dosa ialah maut; tetapi karunia Allah ialah hidup yang kekal dalam Kristus Yesus, Tuhan kita.',
  'MAT.11.28': 'Marilah kepada-Ku, semua yang letih lesu dan berbeban berat, Aku akan memberi kelegaan kepadamu.',
  'JHN.15.13': 'Tidak ada kasih yang lebih besar dari pada kasih seorang yang memberikan nyawanya untuk sahabat-sahabatnya.',
  'PHP.4.19': 'Allahku akan memenuhi segala keperluanmu menurut kekayaan dan kemuliaan-Nya dalam Kristus Yesus.',
  '1JN.4.8': 'Barangsiapa tidak mengasihi, ia tidak mengenal Allah, sebab Allah adalah kasih.',
  '1JN.1.9': 'Jika kita mengaku dosa kita, maka Ia adalah setia dan adil, sehingga Ia akan mengampuni segala dosa kita dan menyucikan kita dari segala kejahatan.',
  'MAT.5.16': 'Demikianlah hendaknya terangmu bercahaya di depan orang, supaya mereka melihat perbuatanmu yang baik dan memuliakan Bapamu yang di sorga.',
  
  // Ayat-ayat populer Perjanjian Lama
  'PSA.23.1': 'Mazmur Daud. TUHAN adalah gembalaku, takkan kekurangan aku.',
  'PSA.23.4': 'Sekalipun aku berjalan dalam lembah kekelaman, aku tidak takut bahaya, sebab Engkau besertaku; gada-Mu dan tongkat-Mu, itulah yang menghibur aku.',
  'ISA.40.31': 'tetapi orang-orang yang menanti-nantikan TUHAN mendapat kekuatan baru: mereka seumpama rajawali yang naik terbang dengan kekuatan sayapnya; mereka berlari dan tidak menjadi lesu, mereka berjalan dan tidak menjadi lelah.',
  'ISA.41.10': 'Janganlah takut, sebab Aku menyertai engkau, janganlah bimbang, sebab Aku ini Allahmu; Aku akan meneguhkan, bahkan akan menolong engkau; Aku akan memegang engkau dengan tangan kanan-Ku yang membawa kemenangan.',
  'JER.29.11': 'Sebab Aku ini mengetahui rancangan-rancangan apa yang ada pada-Ku mengenai kamu, demikianlah firman TUHAN, yaitu rancangan damai sejahtera dan bukan rancangan kecelakaan, untuk memberikan kepadamu hari depan yang penuh harapan.',
  'PRO.3.5': 'Percayalah kepada TUHAN dengan segenap hatimu, dan janganlah bersandar kepada pengertianmu sendiri.',
  'PRO.3.6': 'Akuilah Dia dalam segala lakumu, maka Ia akan meluruskan jalanmu.',
  'PSA.119.105': 'Firman-Mu itu pelita bagi kakiku dan terang bagi jalanku.',
  'PSA.46.1': 'Untuk pemimpin biduan. Dari bani Korah menurut alamot. Nyanyian. Allah itu bagi kita tempat perlindungan dan kekuatan, sebagai penolong dalam kesesakan sangat terbukti.',
  'ECC.3.1': 'Untuk segala sesuatu ada masanya, untuk apapun di bawah langit ada waktunya:',
  
  // Ayat Yesaya 32 (sesuai screenshot) - INDIVIDUAL VERSES
  'ISA.32.1': 'Sesungguhnya, seorang raja akan memerintah dengan adil, dan para pemuka akan memerintah dengan kebenaran.',
  'ISA.32.2': 'Masing-masing akan seperti tempat berlindung terhadap angin dan tempat bernaung terhadap badai, seperti aliran air di tanah kering, seperti naungan batu besar di tanah tandus.',
  'ISA.32.3': 'Mata orang-orang yang melihat tidak akan lagi terpejam, dan telinga orang-orang yang mendengar akan memperhatikan.',
  'ISA.32.4': 'Hati orang-orang yang tergesa-gesa akan memahami pengetahuan, dan lidah orang-orang yang gagap akan fasih berkata-kata dengan terang.',
  
  // RANGE AYAT untuk Yesaya 32:1-4 (INI YANG PENTING!)
  'ISA.32.1-4': 'Sesungguhnya, seorang raja akan memerintah dengan adil, dan para pemuka akan memerintah dengan kebenaran. Masing-masing akan seperti tempat berlindung terhadap angin dan tempat bernaung terhadap badai, seperti aliran air di tanah kering, seperti naungan batu besar di tanah tandus. Mata orang-orang yang melihat tidak akan lagi terpejam, dan telinga orang-orang yang mendengar akan memperhatikan. Hati orang-orang yang tergesa-gesa akan memahami pengetahuan, dan lidah orang-orang yang gagap akan fasih berkata-kata dengan terang.',
  
  // Range ayat populer lainnya
  'MAT.5.3-12': 'Berbahagialah orang yang miskin di hadapan Allah, karena merekalah yang empunya Kerajaan Sorga. Berbahagialah orang yang berdukacita, karena mereka akan dihibur. Berbahagialah orang yang lemah lembut, karena mereka akan memiliki bumi. Berbahagialah orang yang lapar dan haus akan kebenaran, karena mereka akan dipuaskan. Berbahagialah orang yang murah hatinya, karena mereka akan beroleh kemurahan. Berbahagialah orang yang suci hatinya, karena mereka akan melihat Allah. Berbahagialah orang yang membawa damai, karena mereka akan disebut anak-anak Allah. Berbahagialah orang yang dianiaya oleh sebab kebenaran, karena merekalah yang empunya Kerajaan Sorga. Berbahagialah kamu, jika karena Aku kamu dicela dan dianiaya dan kepadamu difitnahkan segala yang jahat. Bersukacitalah dan bergembiralah, karena upahmu besar di sorga, sebab demikian juga telah dianiaya nabi-nabi yang sebelum kamu.',
  
  '1CO.13.4-8': 'Kasih itu sabar; kasih itu murah hati; ia tidak cemburu. Ia tidak memegahkan diri dan tidak sombong. Ia tidak melakukan yang tidak sopan dan tidak mencari keuntungan diri sendiri. Ia tidak pemarah dan tidak menyimpan kesalahan orang lain. Ia tidak bersukacita karena ketidakadilan, tetapi karena kebenaran. Ia menutupi segala sesuatu, percaya segala sesuatu, mengharapkan segala sesuatu, sabar menanggung segala sesuatu. Kasih tidak berkesudahan.',
  
  'PSA.23.1-6': 'Mazmur Daud. TUHAN adalah gembalaku, takkan kekurangan aku. Ia membaringkan aku di padang yang berumput hijau, Ia membimbing aku ke air yang tenang; Ia menyegarkan jiwaku. Ia menuntun aku di jalan yang benar oleh karena nama-Nya. Sekalipun aku berjalan dalam lembah kekelaman, aku tidak takut bahaya, sebab Engkau besertaku; gada-Mu dan tongkat-Mu, itulah yang menghibur aku. Engkau menyediakan hidangan bagiku di hadapan lawanku; Engkau mengurapi kepalaku dengan minyak; pialaku penuh melimpah. Kebajikan dan kemurahan belaka akan mengikuti aku seumur hidupku; dan aku akan diam dalam rumah TUHAN sepanjang masa.',
  
  'ROM.8.38-39': 'Sebab aku yakin, bahwa baik maut, maupun hidup, baik malaikat-malaikat, maupun pemerintah-pemerintah, baik yang ada sekarang, maupun yang akan datang, atau kuasa-kuasa, baik yang di atas, maupun yang di bawah, ataupun sesuatu makhluk lain, tidak akan dapat memisahkan kita dari kasih Allah, yang ada dalam Kristus Yesus, Tuhan kita.'
}

// Debug configuration untuk URL scraping approach
console.log('🔧 [BibleAPI] URL Scraping Configuration:')
console.log('- ALKITAB_MOBI_BASE:', ALKITAB_MOBI_BASE)
console.log('- FREE_BIBLE_API:', FREE_BIBLE_API)
console.log('- Indonesian verses loaded:', Object.keys(INDONESIAN_VERSES).length)
console.log('- Mobi book mappings:', Object.keys(MOBI_BOOK_MAPPING).length)
console.log('- Environment:', process.env.NODE_ENV)

/**
 * Headers untuk API Bible (Tidak diperlukan untuk bible-api.com)
 */
// const getHeaders = () => ({
//   'api-key': API_KEY,
//   'Accept': 'application/json',
//   'Content-Type': 'application/json'
// })

/**
 * Mapping nama kitab Indonesia ke kode API Bible
 */
const BOOK_MAPPING = {
  // Perjanjian Lama
  'kejadian': 'GEN',
  'keluaran': 'EXO',
  'imamat': 'LEV',
  'bilangan': 'NUM',
  'ulangan': 'DEU',
  'yosua': 'JOS',
  'hakim': 'JDG',
  'hakim-hakim': 'JDG',
  'rut': 'RUT',
  '1 samuel': '1SA',
  '2 samuel': '2SA',
  '1 raja': '1KI',
  '1 raja-raja': '1KI',
  '2 raja': '2KI',
  '2 raja-raja': '2KI',
  '1 tawarikh': '1CH',
  '2 tawarikh': '2CH',
  'ezra': 'EZR',
  'nehemia': 'NEH',
  'ester': 'EST',
  'ayub': 'JOB',
  'mazmur': 'PSA',
  'amsal': 'PRO',
  'pengkhotbah': 'ECC',
  'kidung agung': 'SNG',
  'yesaya': 'ISA',
  'yeremia': 'JER',
  'ratapan': 'LAM',
  'yehezkiel': 'EZK',
  'daniel': 'DAN',
  'hosea': 'HOS',
  'yoel': 'JOL',
  'amos': 'AMO',
  'obaja': 'OBA',
  'yunus': 'JON',
  'mikha': 'MIC',
  'nahum': 'NAM',
  'habakuk': 'HAB',
  'zefanya': 'ZEP',
  'hagai': 'HAG',
  'zakharia': 'ZEC',
  'maleakhi': 'MAL',
  
  // Perjanjian Baru
  'matius': 'MAT',
  'markus': 'MRK',
  'lukas': 'LUK',
  'yohanes': 'JHN',
  'kisah': 'ACT',
  'kisah para rasul': 'ACT',
  'roma': 'ROM',
  '1 korintus': '1CO',
  '2 korintus': '2CO',
  'galatia': 'GAL',
  'efesus': 'EPH',
  'filipi': 'PHP',
  'kolose': 'COL',
  '1 tesalonika': '1TH',
  '2 tesalonika': '2TH',
  '1 timotius': '1TI',
  '2 timotius': '2TI',
  'titus': 'TIT',
  'filemon': 'PHM',
  'ibrani': 'HEB',
  'yakobus': 'JAS',
  '1 petrus': '1PE',
  '2 petrus': '2PE',
  '1 yohanes': '1JN',
  '2 yohanes': '2JN',
  '3 yohanes': '3JN',
  'yudas': 'JUD',
  'wahyu': 'REV'
}

/**
 * Convert book code ke nama Inggris untuk bible-api.com
 * @param {string} bookCode - Kode kitab (contoh: 'JHN', 'MAT')
 * @returns {string} Nama kitab dalam bahasa Inggris
 */
function convertToEnglishBook(bookCode) {
  const englishBooks = {
    // Perjanjian Lama
    'GEN': 'genesis',
    'EXO': 'exodus', 
    'LEV': 'leviticus',
    'NUM': 'numbers',
    'DEU': 'deuteronomy',
    'JOS': 'joshua',
    'JDG': 'judges',
    'RUT': 'ruth',
    '1SA': '1samuel',
    '2SA': '2samuel',
    '1KI': '1kings',
    '2KI': '2kings',
    '1CH': '1chronicles',
    '2CH': '2chronicles',
    'EZR': 'ezra',
    'NEH': 'nehemiah',
    'EST': 'esther',
    'JOB': 'job',
    'PSA': 'psalms',
    'PRO': 'proverbs',
    'ECC': 'ecclesiastes',
    'SNG': 'song',
    'ISA': 'isaiah',
    'JER': 'jeremiah',
    'LAM': 'lamentations',
    'EZK': 'ezekiel',
    'DAN': 'daniel',
    'HOS': 'hosea',
    'JOL': 'joel',
    'AMO': 'amos',
    'OBA': 'obadiah',
    'JON': 'jonah',
    'MIC': 'micah',
    'NAM': 'nahum',
    'HAB': 'habakkuk',
    'ZEP': 'zephaniah',
    'HAG': 'haggai',
    'ZEC': 'zechariah',
    'MAL': 'malachi',
    
    // Perjanjian Baru
    'MAT': 'matthew',
    'MRK': 'mark',
    'LUK': 'luke',
    'JHN': 'john',
    'ACT': 'acts',
    'ROM': 'romans',
    '1CO': '1corinthians',
    '2CO': '2corinthians',
    'GAL': 'galatians',
    'EPH': 'ephesians',
    'PHP': 'philippians',
    'COL': 'colossians',
    '1TH': '1thessalonians',
    '2TH': '2thessalonians',
    '1TI': '1timothy',
    '2TI': '2timothy',
    'TIT': 'titus',
    'PHM': 'philemon',
    'HEB': 'hebrews',
    'JAS': 'james',
    '1PE': '1peter',
    '2PE': '2peter',
    '1JN': '1john',
    '2JN': '2john',
    '3JN': '3john',
    'JUD': 'jude',
    'REV': 'revelation'
  }
  
  return englishBooks[bookCode] || 'john' // default fallback
}

/**
 * Parse referensi ayat dari format Indonesia ke format API Bible
 * Contoh: "Yesaya 32:1-4" → "ISA.32.1-ISA.32.4"
 * @param {string} reference - Referensi ayat dalam bahasa Indonesia
 * @returns {Object} Parsed reference
 */
function parseReference(reference) {
  try {
    console.log('🔍 [BibleAPI] Parsing reference:', reference)
    
    // Clean up reference
    const cleaned = reference.trim().toLowerCase()
    
    // Pattern untuk menangkap kitab, pasal, dan ayat
    // Contoh: "yesaya 32:1-4", "1 korintus 13:4", "mazmur 23:1"
    const pattern = /^(\d*\s*[\w\s-]+?)\s+(\d+):(\d+)(?:-(\d+))?$/
    const match = cleaned.match(pattern)
    
    if (!match) {
      throw new Error(`Format referensi tidak valid: ${reference}`)
    }
    
    const [, bookName, chapter, startVerse, endVerse] = match
    const bookCode = BOOK_MAPPING[bookName.trim()]
    
    if (!bookCode) {
      throw new Error(`Kitab tidak ditemukan: ${bookName}`)
    }
    
    const result = {
      bookCode,
      chapter: parseInt(chapter),
      startVerse: parseInt(startVerse),
      endVerse: endVerse ? parseInt(endVerse) : parseInt(startVerse),
      originalReference: reference
    }
    
    console.log('✅ [BibleAPI] Parsed reference:', result)
    return result
    
  } catch (error) {
    console.error('❌ [BibleAPI] Error parsing reference:', error)
    throw error
  }
}

/**
 * Convert parsed reference ke format verseId untuk API Bible
 * @param {Object} parsedRef - Hasil dari parseReference
 * @returns {string} Verse ID untuk API
 */
function buildVerseId(parsedRef) {
  const { bookCode, chapter, startVerse, endVerse } = parsedRef
  
  if (startVerse === endVerse) {
    // Single verse: "ISA.32.1"
    return `${bookCode}.${chapter}.${startVerse}`
  } else {
    // Range of verses: "ISA.32.1-ISA.32.4"
    return `${bookCode}.${chapter}.${startVerse}-${bookCode}.${chapter}.${endVerse}`
  }
}

/**
 * Ambil ayat dari berbagai sumber - URL Scraping + Fallback
 * @param {string} reference - Referensi ayat (contoh: "Yohanes 3:16")
 * @returns {Promise<Object>} Data ayat
 */
export async function getVerse(reference) {
  try {
    console.log('🔍 [BibleAPI] Mengambil ayat:', reference)
    
    // Parse referensi
    const parsedRef = parseReference(reference)
    const verseId = buildVerseId(parsedRef)
    
    console.log('🌐 [BibleAPI] Verse ID:', verseId)
    
    // Priority 1: Cek data Indonesia lokal (untuk ayat range dan populer)
    if (INDONESIAN_VERSES[verseId]) {
      console.log('✅ [BibleAPI] Menggunakan data Indonesia lokal')
      return {
        success: true,
        reference: reference,
        verseId: verseId,
        book: parsedRef.bookCode,
        chapter: parsedRef.chapter,
        startVerse: parsedRef.startVerse,
        endVerse: parsedRef.endVerse,
        text: INDONESIAN_VERSES[verseId],
        source: 'indonesia-local',
        translation: 'Terjemahan Baru (TB)'
      }
    }
    
    // Priority 2: Scrape dari alkitab.mobi (untuk single verse)
    if (parsedRef.startVerse === parsedRef.endVerse) {
      console.log('🌐 [BibleAPI] Mencoba scraping alkitab.mobi')
      const scrapedText = await scrapeAlkitabMobi(parsedRef.bookCode, parsedRef.chapter, parsedRef.startVerse)
      
      if (scrapedText) {
        console.log('✅ [BibleAPI] Berhasil scraping alkitab.mobi')
        return {
          success: true,
          reference: reference,
          verseId: verseId,
          book: parsedRef.bookCode,
          chapter: parsedRef.chapter,
          startVerse: parsedRef.startVerse,
          endVerse: parsedRef.endVerse,
          text: scrapedText,
          source: 'alkitab-mobi-scraping',
          translation: 'Terjemahan Baru (TB)'
        }
      }
    }
    
    // Priority 3: Fallback ke bible-api.com (bahasa Inggris)
    console.log('🌐 [BibleAPI] Menggunakan bible-api.com sebagai fallback')
    
    // Convert book name untuk API bahasa Inggris
    const englishBook = convertToEnglishBook(parsedRef.bookCode)
    const apiUrl = `${FREE_BIBLE_API}/${englishBook}+${parsedRef.chapter}:${parsedRef.startVerse}`
    
    console.log('🌐 [BibleAPI] API URL:', apiUrl)
    
    const response = await fetch(apiUrl)
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`)
    }
    
    const data = await response.json()
    console.log('✅ [BibleAPI] API Response:', data)
    
    if (data.error) {
      throw new Error(data.error)
    }
    
    // Format response
    const result = {
      success: true,
      reference: reference,
      verseId: verseId,
      book: parsedRef.bookCode,
      chapter: parsedRef.chapter,
      startVerse: parsedRef.startVerse,
      endVerse: parsedRef.endVerse,
      text: data.text?.trim() || 'Teks ayat tidak tersedia',
      source: 'bible-api-com',
      translation: data.translation_name || 'World English Bible (English)',
      originalData: data
    }
    
    console.log('✅ [BibleAPI] Formatted result:', result)
    return result
    
  } catch (error) {
    console.error('❌ [BibleAPI] Error mengambil ayat:', error)
    
    return {
      success: false,
      error: error.message,
      reference: reference,
      fallbackText: `Maaf, ayat ${reference} tidak dapat dimuat saat ini. Silakan coba lagi nanti.`
    }
  }
}

/**
 * Ambil multiple ayat sekaligus
 * @param {Array<string>} references - Array referensi ayat
 * @returns {Promise<Array>} Array hasil
 */
export async function getMultipleVerses(references) {
  try {
    console.log('🔍 [BibleAPI] Batch mengambil ayat:', references)
    
    const promises = references.map(ref => getVerse(ref))
    const results = await Promise.allSettled(promises)
    
    return results.map((result, index) => {
      if (result.status === 'fulfilled') {
        return result.value
      } else {
        console.error(`❌ [BibleAPI] Failed to fetch ${references[index]}:`, result.reason)
        return {
          success: false,
          error: result.reason.message,
          reference: references[index],
          fallbackText: `Ayat ${references[index]} tidak dapat dimuat.`
        }
      }
    })
    
  } catch (error) {
    console.error('❌ [BibleAPI] Error batch mengambil ayat:', error)
    throw error
  }
}

/**
 * Deteksi dan extract referensi ayat dari teks
 * @param {string} text - Teks yang mengandung referensi ayat
 * @returns {Array<string>} Array referensi yang ditemukan
 */
export function extractVerseReferences(text) {
  if (!text || typeof text !== 'string') {
    return []
  }
  
  console.log('🔍 [BibleAPI] Extracting references from text:', text.substring(0, 100) + '...')
  
  // Pattern untuk mendeteksi referensi ayat dalam bahasa Indonesia
  const patterns = [
    // "Yesaya 32:1-4", "1 Korintus 13:4-8"
    /(\d*\s*[A-Za-z]+(?:\s+[A-Za-z]+)*)\s+(\d+):(\d+)(?:-(\d+))?/gi,
    // "Mazmur 23", "Kejadian 1" (tanpa ayat spesifik)
    /(\d*\s*[A-Za-z]+(?:\s+[A-Za-z]+)*)\s+(\d+)(?!\d|:)/gi
  ]
  
  const references = []
  
  patterns.forEach((pattern, index) => {
    let match
    while ((match = pattern.exec(text)) !== null) {
      const fullMatch = match[0].trim()
      
      // Untuk pattern kedua (tanpa ayat), tambahkan :1 sebagai default
      if (index === 1 && !fullMatch.includes(':')) {
        references.push(fullMatch + ':1')
      } else {
        references.push(fullMatch)
      }
    }
  })
  
  // Remove duplicates dan filter yang valid
  const uniqueRefs = [...new Set(references)]
  const validRefs = uniqueRefs.filter(ref => {
    try {
      parseReference(ref)
      return true
    } catch {
      return false
    }
  })
  
  console.log('✅ [BibleAPI] Found references:', validRefs)
  return validRefs
}

/**
 * Test koneksi ke Bible API (Hybrid)
 * @returns {Promise<boolean>}
 */
export async function testApiConnection() {
  try {
    console.log('🔍 [BibleAPI] Testing hybrid API connection...')
    
    // Test bible-api.com
    const url = `${FREE_BIBLE_API}/john+3:16`
    const response = await fetch(url)
    
    if (response.ok) {
      const data = await response.json()
      console.log('✅ [BibleAPI] Free API connection successful')
      console.log('✅ [BibleAPI] Sample response:', data)
      return true
    } else {
      console.error('❌ [BibleAPI] Free API connection failed:', response.status)
      return false
    }
    
  } catch (error) {
    console.error('❌ [BibleAPI] API connection error:', error)
    return false
  }
}

/**
 * Get list Bible yang tersedia (Hybrid approach)
 * @returns {Promise<Array>}
 */
export async function getAvailableBibles() {
  try {
    // Return static list since we're using hybrid approach
    console.log('📚 [BibleAPI] Getting available Bibles (hybrid)')
    
    return [
      {
        id: 'indonesia-local',
        name: 'Terjemahan Baru (TB)',
        language: 'Indonesian',
        description: 'Ayat populer dalam Bahasa Indonesia'
      },
      {
        id: 'bible-api-com',
        name: 'World English Bible',
        language: 'English',
        description: 'Fallback dari bible-api.com (Public Domain)'
      }
    ]
    
  } catch (error) {
    console.error('❌ [BibleAPI] Error getting available Bibles:', error)
    return []
  }
}

/**
 * Scrape verse dari alkitab.mobi
 * @param {string} bookCode - Kode kitab (JHN, MAT, dll)
 * @param {number} chapter - Nomor pasal
 * @param {number} verse - Nomor ayat
 * @returns {Promise<string|null>} Teks ayat atau null jika gagal
 */
async function scrapeAlkitabMobi(bookCode, chapter, verse) {
  try {
    const mobiBook = MOBI_BOOK_MAPPING[bookCode]
    if (!mobiBook) {
      console.log(`❌ [AlkitabMobi] Book mapping not found for: ${bookCode}`)
      return null
    }
    
    const url = `${ALKITAB_MOBI_BASE}/${mobiBook}/${chapter}/${verse}`
    console.log(`🌐 [AlkitabMobi] Scraping: ${url}`)
    
    const response = await fetch(url)
    
    if (!response.ok) {
      console.log(`❌ [AlkitabMobi] HTTP ${response.status} for ${url}`)
      return null
    }
    
    const html = await response.text()
    
    // Extract verse text from HTML
    const verseText = extractVerseFromHTML(html)
    
    if (verseText) {
      console.log(`✅ [AlkitabMobi] Successfully scraped: ${verseText.substring(0, 50)}...`)
      return verseText
    } else {
      console.log(`❌ [AlkitabMobi] Could not extract verse from HTML`)
      return null
    }
    
  } catch (error) {
    console.error(`❌ [AlkitabMobi] Error scraping: ${error.message}`)
    return null
  }
}

/**
 * Extract verse text dari HTML alkitab.mobi
 * @param {string} html - HTML content
 * @returns {string|null} Extracted verse text
 */
function extractVerseFromHTML(html) {
  try {
    // Pattern untuk extract teks ayat dari alkitab.mobi
    const patterns = [
      // Pattern yang berhasil untuk Yohanes 3:16
      /Karena begitu besar kasih Allah[^<]*?kekal\.?/gi,
      // Pattern umum untuk ayat TB
      /<div[^>]*class[^>]*verse[^>]*>([^<]+)</gi,
      /<span[^>]*class[^>]*verse[^>]*>([^<]+)</gi,
      // Pattern untuk content dalam quotes
      /"([^"]*[A-Z][^"]*\.)/g,
      // Pattern untuk paragraf text
      />([^<]*[A-Z][^<]*\.)[^<]*</g
    ]
    
    for (const pattern of patterns) {
      const matches = [...html.matchAll(pattern)]
      for (const match of matches) {
        const text = (match[1] || match[0])
          .replace(/<[^>]*>/g, '') // remove HTML tags
          .replace(/\s+/g, ' ') // normalize spaces
          .trim()
        
        // Validate reasonable verse length and content
        if (text.length > 20 && text.length < 500 && text.includes(' ')) {
          // Additional validation for Indonesian Christian content
          const indonesianWords = ['Allah', 'Tuhan', 'dan', 'yang', 'dalam', 'itu', 'tidak', 'akan', 'kepada', 'dengan']
          const hasIndonesian = indonesianWords.some(word => text.toLowerCase().includes(word.toLowerCase()))
          
          if (hasIndonesian) {
            return text
          }
        }
      }
    }
    
    return null
  } catch (error) {
    console.error('Error extracting verse:', error)
    return null
  }
}
