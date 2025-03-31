// API Configuration for secure API key management

const API_CONFIG = {
    gemini: {
      // Placeholder for API key that should be set securely at runtime
      apiKey: '', 
      
      // Method to securely set API key at runtime
      setApiKey: function(key) {
        if (key && typeof key === 'string' && key.length > 10) {
          this.apiKey = key;
          return true;
        }
        return false;
      },
      
      // Method to check if API key is configured
      isConfigured: function() {
        return !!this.apiKey;
      },
      
      // Retrieve API key for authorized use
      getApiKey: function() {
        return this.apiKey;
      },
      
      // Clear API key from memory when no longer needed
      clearApiKey: function() {
        this.apiKey = '';
      }
    }
  };
  
  export default API_CONFIG;