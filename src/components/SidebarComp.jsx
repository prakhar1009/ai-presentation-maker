import React from 'react';

const SidebarComp = ({ 
  presentation, 
  selectedSlide, 
  setSelectedSlide, 
  template, 
  setTemplate, 
  templates 
}) => {
  return (
    <div className="sidebar">
      <div className="sidebar-section">
        <h3 className="sidebar-title">
          <span className="icon">📑</span>
          Slides
        </h3>
        <div className="slide-list">
          {presentation.slides.map((slide, index) => (
            <div 
              key={index}
              className={`slide-item ${selectedSlide === index ? 'active' : ''}`}
              onClick={() => setSelectedSlide(index)}
            >
              <div className="slide-number">{slide.id}</div>
              <div className="slide-title">{slide.title}</div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="sidebar-section">
        <h3 className="sidebar-title">
          <span className="icon">⚙️</span>
          Template
        </h3>
        <div className="template-grid">
          {Object.entries(templates).map(([key, value]) => (
            <div 
              key={key}
              className={`template-item ${template === key ? 'active' : ''} ${key === 'premium' || key === 'tech' ? key : ''}`}
              onClick={() => setTemplate(key)}
            >
              <div 
                className="template-color"
                style={{ backgroundColor: value.primary }}
              />
              {key.charAt(0).toUpperCase() + key.slice(1)}
            </div>
          ))}
        </div>
      </div>
      
      <div className="sidebar-section">
        <h3 className="sidebar-title">
          <span className="icon">🎨</span>
          Slide Options
        </h3>
        <div className="slide-options">
          <button className="sidebar-button">
            <span className="icon">📝</span>
            Edit Content
          </button>
          <button className="sidebar-button">
            <span className="icon">🖼️</span>
            Add Image
          </button>
          <button className="sidebar-button">
            <span className="icon">📊</span>
            Add Chart
          </button>
        </div>
      </div>
    </div>
  );
};

export default SidebarComp;