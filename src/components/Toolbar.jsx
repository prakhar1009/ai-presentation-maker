import React from 'react';
import { saveAs } from 'file-saver';
import JSZip from 'jszip';

const Toolbar = ({ 
  presentation, 
  savePresentation, 
  setPresentationView,
  exportToPPTX,
  exportToPDF
}) => {
  // Function to create a ZIP of presentation assets
  const handleExportZIP = async () => {
    const zip = new JSZip();
    
    // Add presentation data as JSON
    zip.file("presentation.json", JSON.stringify(presentation, null, 2));
    
    // Create a readme file explaining the content
    zip.file("README.txt", `
      AI Presentation Maker - Export Package
      =====================================
      
      Presentation: ${presentation.title}
      Date: ${new Date().toLocaleDateString()}
      Slides: ${presentation.slides.length}
      
      This ZIP archive contains your presentation data and assets.
      
      Files included:
      - presentation.json: The complete presentation data
      - README.txt: This file
    `);
    
    // Generate ZIP file
    try {
      const content = await zip.generateAsync({ type: "blob" });
      saveAs(content, `${presentation.title.replace(/\s+/g, '_')}_package.zip`);
    } catch (error) {
      console.error("Error generating ZIP file:", error);
      alert("Failed to create export package. Please try again.");
    }
  };
  
  return (
    <div className="toolbar">
      <div className="toolbar-group">
        <button className="toolbar-button" title="New Slide">
          <span className="icon">📄</span>
        </button>
        <button className="toolbar-button" title="Add Image">
          <span className="icon">🖼️</span>
        </button>
        <button className="toolbar-button" title="Add Chart">
          <span className="icon">📊</span>
        </button>
      </div>
      
      <div className="toolbar-group">
        <button 
          className="toolbar-button save-button"
          onClick={savePresentation}
          title="Save Presentation"
        >
          <span className="icon">💾</span>
        </button>
        <button 
          className="export-button primary"
          onClick={exportToPPTX}
        >
          <span className="icon">⬇️</span>
          Download PPTX
        </button>
        <button 
          className="export-button secondary"
          onClick={exportToPDF}
        >
          Export PDF
        </button>
        <button 
          className="export-button secondary"
          onClick={handleExportZIP}
        >
          <span className="icon">📦</span>
          Export Package
        </button>
        <button 
          onClick={() => setPresentationView(false)}
          className="button button-back"
        >
          Back to Editor
        </button>
      </div>
    </div>
  );
};

export default Toolbar;