// Test Age Calculation Logic
function calculateAge(birthDate) {
  if (!birthDate) return 0
  
  const today = new Date()
  const birth = new Date(birthDate)
  
  // Handle invalid dates
  if (isNaN(birth.getTime())) return 0
  
  let age = today.getFullYear() - birth.getFullYear()
  const monthDiff = today.getMonth() - birth.getMonth()
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--
  }
  
  return Math.max(0, age) // Ensure age is not negative
}

// Test cases
console.log('=== Test Age Calculation ===')
console.log('Today:', new Date().toDateString())

// Test child (should be <= 12)
const child1 = '2015-01-01' // ~10 years old
const child2 = '2012-12-31' // ~12 years old

// Test youth (should be > 12 and single)
const youth1 = '2005-01-01' // ~20 years old
const youth2 = '2010-01-01' // ~15 years old

// Test adult
const adult1 = '1990-01-01' // ~35 years old

console.log(`Child 1 (${child1}): ${calculateAge(child1)} years`)
console.log(`Child 2 (${child2}): ${calculateAge(child2)} years`)
console.log(`Youth 1 (${youth1}): ${calculateAge(youth1)} years`)
console.log(`Youth 2 (${youth2}): ${calculateAge(youth2)} years`)
console.log(`Adult 1 (${adult1}): ${calculateAge(adult1)} years`)

console.log('\n=== Classification Logic ===')
console.log(`Child 1 is child: ${calculateAge(child1) <= 12}`)
console.log(`Child 2 is child: ${calculateAge(child2) <= 12}`)
console.log(`Youth 1 can be pemuda (age > 12): ${calculateAge(youth1) > 12}`)
console.log(`Youth 2 can be pemuda (age > 12): ${calculateAge(youth2) > 12}`)
