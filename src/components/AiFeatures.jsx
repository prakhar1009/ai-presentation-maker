import React from 'react';

// AI Assistant Component
export const AiAssistant = ({ 
  isAiEnabled, 
  aiStatus, 
  generateAiSuggestions,
  setApiKeyModalOpen 
}) => (
  <div className="ai-assistant">
    <h3 className="assistant-title">
      <span className="ai-icon">✨</span>
      AI Presentation Assistant
    </h3>
    
    <p className="assistant-description">
      Let our AI assistant generate professional content based on your inputs. Get complete slide suggestions, compelling bullet points, and speaker notes for your presentation.
    </p>
    
    <div className="assistant-status">
      <div className={`status-indicator ${isAiEnabled ? 'active' : 'inactive'}`}>
        {isAiEnabled ? 'AI Enabled' : 'AI Disabled'}
      </div>
    </div>
    
    <button
      onClick={isAiEnabled ? generateAiSuggestions : () => setApiKeyModalOpen(true)}
      className={`button ${isAiEnabled ? 'button-next' : 'button-back'} assistant-button`}
      disabled={aiStatus === 'generating'}
    >
      {aiStatus === 'generating' ? 'Generating...' : isAiEnabled ? 'Generate AI Content' : 'Enable AI Features'}
    </button>
    
    {aiStatus === 'generating' && (
      <div className="assistant-generating">
        <div className="assistant-loader"></div>
        <p>Our AI is creating your presentation with custom content and slides...</p>
      </div>
    )}
  </div>
);

// API Key Modal Component
export const ApiKeyModal = ({ 
  apiKeyInput, 
  setApiKeyInput, 
  handleApiKeySubmit, 
  setApiKeyModalOpen 
}) => (
  <div className="api-key-modal">
    <div className="api-key-modal-content">
      <h2>Enable AI-Powered Features</h2>
      <p>To use AI-powered features like content generation and slide suggestions, please enter your Gemini API key.</p>
      
      <form onSubmit={handleApiKeySubmit}>
        <div className="form-group">
          <label className="form-label">Gemini API Key</label>
          <input
            type="password"
            value={apiKeyInput}
            onChange={(e) => setApiKeyInput(e.target.value)}
            className="form-input"
            placeholder="Enter your API key"
          />
          <small className="form-helper">
            Your API key is stored locally and never sent to our servers. You can get a Gemini API key from <a href="https://ai.google.dev/" target="_blank" rel="noopener noreferrer">Google AI Studio</a>.
          </small>
        </div>
        
        <div className="action-container">
          <button
            type="button"
            onClick={() => setApiKeyModalOpen(false)}
            className="button button-back"
          >
            Cancel
          </button>
          
          <button
            type="submit"
            className="button button-next"
          >
            Enable AI Features
          </button>
        </div>
      </form>
    </div>
  </div>
);

// AI Suggestion Panel Component
export const AiSuggestionPanel = ({ aiSuggestions, applyAiSuggestions }) => {
  if (!aiSuggestions) return null;
  
  return (
    <div className="ai-suggestion-panel">
      <h3 className="suggestion-title">
        <span className="ai-icon">🧠</span>
        AI-Generated Content Ready
      </h3>
      
      <div className="suggestion-preview">
        <h4>{aiSuggestions.title}</h4>
        <p>{aiSuggestions.slides.length} slides generated with custom content and visualizations</p>
        
        <div className="suggestion-samples">
          {aiSuggestions.slides.slice(0, 3).map((slide, index) => (
            <div key={index} className="suggestion-slide">
              <span className="slide-number">{slide.number}</span>
              <span className="slide-title">{slide.title}</span>
              <span className="slide-type-indicator">{getSlideTypeLabel(slide.type)}</span>
            </div>
          ))}
          {aiSuggestions.slides.length > 3 && (
            <div className="suggestion-more">
              +{aiSuggestions.slides.length - 3} more slides
            </div>
          )}
        </div>
        
        <button
          onClick={applyAiSuggestions}
          className="button button-next suggestion-apply"
        >
          Apply AI Suggestions
        </button>
      </div>
    </div>
  );
};

// Helper function to get friendly slide type labels
const getSlideTypeLabel = (type) => {
  const typeLabels = {
    'title': 'Title',
    'introduction': 'Intro',
    'concept': 'Content',
    'data': 'Chart',
    'example': 'Example',
    'conclusion': 'Conclusion',
    'qa': 'Q&A'
  };
  
  return typeLabels[type] || type;
};

// AI Content Preview Component
export const AiContentPreview = ({ aiSuggestions, applyAiSuggestions }) => {
  if (!aiSuggestions || !aiSuggestions.slides || aiSuggestions.slides.length === 0) {
    return null;
  }

  return (
    <div className="ai-content-preview">
      <h3 className="preview-title">AI Generated Presentation Preview</h3>
      
      <div className="preview-slides">
        {aiSuggestions.slides.map((slide, index) => (
          <div 
            key={index} 
            className={`preview-slide ${slide.type}`}
            onClick={() => applyAiSuggestions()}
          >
            <div className="slide-header">
              <span className="slide-type">{getSlideTypeLabel(slide.type)}</span>
              <span className="slide-number">{slide.number}</span>
            </div>
            
            <h4 className="slide-title">{slide.title}</h4>
            
            {slide.subtitle && (
              <p className="slide-subtitle">{slide.subtitle}</p>
            )}
            
            <div className="slide-content">
              {Array.isArray(slide.content) ? (
                <ul className="content-bullets">
                  {slide.content.slice(0, 3).map((point, i) => (
                    <li key={i}>{point}</li>
                  ))}
                  {slide.content.length > 3 && (
                    <li className="more-content">+{slide.content.length - 3} more points</li>
                  )}
                </ul>
              ) : (
                <p>{slide.content}</p>
              )}
            </div>
            

          </div>
        ))}
      </div>
      
      <button 
        className="button button-next preview-apply-all"
        onClick={applyAiSuggestions}
      >
        Apply All AI Content
      </button>
    </div>
  );
};

// Saved Presentations Component
export const SavedPresentations = ({ loadPresentation }) => {
  const [savedPresentations, setSavedPresentations] = React.useState([]);
  const [showSaved, setShowSaved] = React.useState(false);
  
  React.useEffect(() => {
    // Load saved presentations from localStorage
    try {
      const saved = JSON.parse(localStorage.getItem('saved_presentations') || '[]');
      setSavedPresentations(saved);
    } catch (error) {
      console.error('Error loading saved presentations:', error);
      setSavedPresentations([]);
    }
  }, []);
  
  if (savedPresentations.length === 0) {
    return null;
  }
  
  return (
    <div className="saved-presentations">
      <button 
        className="button-subtle"
        onClick={() => setShowSaved(!showSaved)}
      >
        {showSaved ? 'Hide Saved Presentations' : 'Show Saved Presentations'} ({savedPresentations.length})
      </button>
      
      {showSaved && (
        <div className="saved-list">
          {savedPresentations.map((presentation, index) => (
            <div key={index} className="saved-item">
              <div className="saved-info">
                <h4 className="saved-title">{presentation.title}</h4>
                <p className="saved-date">
                  Saved on {new Date(presentation.savedAt).toLocaleDateString()}
                </p>
              </div>
              
              <button 
                className="button button-small"
                onClick={() => loadPresentation(presentation)}
              >
                Load
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};