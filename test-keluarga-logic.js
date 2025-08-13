// Test file untuk memverifikasi logika counting unique families
// File ini untuk testing saja, bisa dihapus setelah testing

// Test data jemaat
const testUsers = [
  { nama: 'John Potabuga', keluarga: 'Kel. Potabuga-Gerungan' },
  { nama: 'Jane Potabuga', keluarga: 'Kel. Potabuga-Gerungan' }, // Same family as John
  { nama: 'Bob Smith', keluarga: 'Kel. Smith-Manado' },
  { nama: 'Alice Johnson', keluarga: 'Kel. Johnson-Tomohon' },
  { nama: 'Charlie Potabuga', keluarga: 'kel. potabuga-gerungan' }, // Same family, different case
  { nama: 'David Brown', keluarga: '' }, // Empty family
  { nama: 'Eva White', keluarga: '   ' }, // Whitespace only
  { nama: 'Frank Green', keluarga: 'Kel. Green-Manado' },
  { nama: 'Grace Green', keluarga: 'Kel. Green-Manado' }, // Same family as Frank
]

// Function to count unique families (same logic as in AdminUsers.vue)
function countUniqueFamilies(users) {
  const uniqueFamilies = new Set()
  users.forEach(user => {
    if (user.keluarga && user.keluarga.trim() !== '') {
      uniqueFamilies.add(user.keluarga.trim().toLowerCase())
    }
  })
  return uniqueFamilies.size
}

// Test the function
const totalFamilies = countUniqueFamilies(testUsers)

console.log('🧪 Testing Unique Family Count Logic')
console.log('=====================================')
console.log('Test Users:')
testUsers.forEach((user, index) => {
  console.log(`${index + 1}. ${user.nama} - "${user.keluarga}"`)
})
console.log()

console.log('Expected unique families:')
console.log('1. kel. potabuga-gerungan (John, Jane, Charlie)')
console.log('2. kel. smith-manado (Bob)')
console.log('3. kel. johnson-tomohon (Alice)')
console.log('4. kel. green-manado (Frank, Grace)')
console.log()

console.log(`✅ Total unique families: ${totalFamilies}`)
console.log(`✅ Expected: 4`)
console.log(`✅ Test ${totalFamilies === 4 ? 'PASSED' : 'FAILED'}!`)

// Show which families were counted
const uniqueFamilies = new Set()
testUsers.forEach(user => {
  if (user.keluarga && user.keluarga.trim() !== '') {
    uniqueFamilies.add(user.keluarga.trim().toLowerCase())
  }
})

console.log()
console.log('Unique families detected:')
Array.from(uniqueFamilies).forEach((family, index) => {
  console.log(`${index + 1}. "${family}"`)
})
