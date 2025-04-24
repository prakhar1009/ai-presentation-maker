import React from 'react';

const SlidePreview = ({
  currentSlide,
  activeTemplate,
  includeNotes
}) => {
  // Render chart for data slides
  const renderChart = (chartType) => {
    if (chartType === 'bar') {
      return (
        <div className="chart-container">
          {[70, 85, 55, 95, 65].map((height, i) => (
            <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div 
                className="chart-bar"
                style={{ 
                  height: `${height}%`, 
                  backgroundColor: activeTemplate.secondary,
                  '--index': i
                }} 
              />
              <div className="chart-label">Item {i+1}</div>
            </div>
          ))}
        </div>
      );
    } else if (chartType === 'line') {
      return (
        <div className="chart-container line-chart">
          <svg width="100%" height="200" viewBox="0 0 300 200" preserveAspectRatio="none">
            <polyline
              points="0,150 60,100 120,120 180,50 240,80 300,30"
              fill="none"
              stroke={activeTemplate.secondary}
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {[0, 60, 120, 180, 240, 300].map((x, i) => (
              <circle
                key={i}
                cx={x}
                cy={[150, 100, 120, 50, 80, 30][i]}
                r="5"
                fill={activeTemplate.secondary}
              />
            ))}
          </svg>
          <div className="chart-labels">
            {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'].map((month, i) => (
              <div key={i} className="chart-label">{month}</div>
            ))}
          </div>
        </div>
      );
    } else if (chartType === 'pie') {
      return (
        <div className="chart-container pie-chart">
          <svg width="200" height="200" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="40" fill="#f0f0f0" />
            
            {/* Pie segments */}
            <path d="M50,50 L90,50 A40,40 0 0,1 75,85 Z" fill={activeTemplate.secondary} />
            <path d="M50,50 L75,85 A40,40 0 0,1 15,60 Z" fill={activeTemplate.primary} />
            <path d="M50,50 L15,60 A40,40 0 0,1 50,10 Z" fill="#4CAF50" />
            <path d="M50,50 L50,10 A40,40 0 0,1 90,50 Z" fill="#FFC107" />
            
            {/* Center circle */}
            <circle cx="50" cy="50" r="20" fill="white" />
          </svg>
          <div className="pie-labels">
            <div className="pie-label"><span style={{backgroundColor: activeTemplate.secondary}}></span> Segment 1</div>
            <div className="pie-label"><span style={{backgroundColor: activeTemplate.primary}}></span> Segment 2</div>
            <div className="pie-label"><span style={{backgroundColor: "#4CAF50"}}></span> Segment 3</div>
            <div className="pie-label"><span style={{backgroundColor: "#FFC107"}}></span> Segment 4</div>
          </div>
        </div>
      );
    } else if (chartType === 'flow') {
      return (
        <div className="chart-container flow-chart">
          <svg width="100%" height="200" viewBox="0 0 500 150">
            {/* Nodes */}
            <rect x="10" y="50" width="100" height="50" rx="5" fill={activeTemplate.primary} />
            <rect x="200" y="50" width="100" height="50" rx="5" fill={activeTemplate.secondary} />
            <rect x="390" y="50" width="100" height="50" rx="5" fill={activeTemplate.primary} />
            
            {/* Connectors */}
            <path 
              d="M110,75 L200,75" 
              stroke={activeTemplate.secondary} 
              strokeWidth="2" 
              markerEnd="url(#arrowhead)" 
            />
            <path 
              d="M300,75 L390,75" 
              stroke={activeTemplate.secondary} 
              strokeWidth="2" 
              markerEnd="url(#arrowhead)" 
            />
            
            {/* Arrow marker definition */}
            <defs>
              <marker 
                id="arrowhead" 
                markerWidth="10" 
                markerHeight="7" 
                refX="10" 
                refY="3.5" 
                orient="auto"
              >
                <polygon 
                  points="0 0, 10 3.5, 0 7" 
                  fill={activeTemplate.secondary} 
                />
              </marker>
            </defs>
            
            {/* Text */}
            <text x="60" y="80" fill="white" textAnchor="middle" fontSize="12">Step 1</text>
            <text x="250" y="80" fill="white" textAnchor="middle" fontSize="12">Step 2</text>
            <text x="440" y="80" fill="white" textAnchor="middle" fontSize="12">Step 3</text>
          </svg>
        </div>
      );
    }
    
    return null;
  };
  
  return (
    <div className="preview-container">
      <div className="slide-preview">
        <div 
          className="slide-header"
          style={{ backgroundColor: activeTemplate.primary }}
        />
        
        {currentSlide.type === 'title' ? (
          <div className="title-slide">
            <h1 
              className="title-heading"
              style={{ color: activeTemplate.primary }}
            >
              {currentSlide.title}
            </h1>
            <p className="title-subtitle">{currentSlide.subtitle}</p>
            <div className="slide-date">
              Presentation Date: {new Date().toLocaleDateString()}
            </div>
          </div>
        ) : (
          <div className="content-slide">
            <h2 
              className="content-heading"
              style={{ color: activeTemplate.primary }}
            >
              {currentSlide.title}
            </h2>
            
            <div>
              {Array.isArray(currentSlide.content) ? (
                <ul className="bullet-list">
                  {currentSlide.content.map((item, i) => (
                    <li key={i} className="bullet-item">
                      <div 
                        className="bullet-marker"
                        style={{ 
                          backgroundColor: activeTemplate.secondary,
                          '--index': i 
                        }}
                      />
                      <div className="bullet-text">{item}</div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p>{currentSlide.content}</p>
              )}
            </div>
          </div>
        )}
      </div>
      
      {/* Speaker notes */}
      {includeNotes && currentSlide.notes && (
        <div className="speaker-notes">
          <h4 className="notes-title">
            <span className="icon">📝</span>
            Speaker Notes:
          </h4>
          <p className="notes-content">
            {currentSlide.notes}
          </p>
        </div>
      )}
    </div>
  );
};

export default SlidePreview;