const { defineConfig } = require('@vue/cli-service')

module.exports = defineConfig({
  transpileDependencies: true,
  
  // ===== Development Server =====
  devServer: {
    // Hot reload configuration
    hot: true,
    liveReload: true,
    
    // ⭐ FIX: History API fallback untuk SPA routing
    historyApiFallback: true,
    
    // Headers untuk development
    headers: {
      'Service-Worker-Allowed': '/'
    }
  },
  
  // ===== Build Configuration =====
  configureWebpack: {
    // Environment-specific optimizations
    optimization: {
      splitChunks: process.env.NODE_ENV === 'production' ? {
        chunks: 'all'
      } : false
    }
  }
})