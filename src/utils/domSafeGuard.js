// DOM Safe Guard - Prevent parentNode null errors
// Utility untuk mencegah error DOM manipulation

export const safeTimeout = (callback, delay) => {
  const timeoutId = setTimeout(() => {
    try {
      if (typeof callback === 'function') {
        callback()
      }
    } catch (error) {
      console.warn('SafeTimeout error:', error)
    }
  }, delay)
  
  return timeoutId
}

export const safeInterval = (callback, delay) => {
  const intervalId = setInterval(() => {
    try {
      if (typeof callback === 'function') {
        callback()
      }
    } catch (error) {
      console.warn('SafeInterval error:', error)
    }
  }, delay)
  
  return intervalId
}

export const safeClearTimeout = (timeoutId) => {
  try {
    if (timeoutId) {
      clearTimeout(timeoutId)
    }
  } catch (error) {
    console.warn('SafeClearTimeout error:', error)
  }
}

export const safeClearInterval = (intervalId) => {
  try {
    if (intervalId) {
      clearInterval(intervalId)
    }
  } catch (error) {
    console.warn('SafeClearInterval error:', error)
  }
}

export const safeElementOperation = (operation) => {
  try {
    return operation()
  } catch (error) {
    console.warn('SafeElementOperation error:', error)
    return null
  }
}

export default {
  safeTimeout,
  safeInterval,
  safeClearTimeout,
  safeClearInterval,
  safeElementOperation
}
