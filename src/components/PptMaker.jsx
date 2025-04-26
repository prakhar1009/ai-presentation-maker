import React, { useState, useEffect, useRef } from 'react';
import '../styles/ppt.css';
import SidebarComp from './SidebarComp';
import SlidePreview from './SlidePreview';
import Toolbar from './Toolbar';
import { 
  AiAssistant, 
  ApiKeyModal, 
  AiSuggestionPanel, 
  AiContentPreview,
  SavedPresentations 
} from './AiFeatures';
import PptAgent from '../utils/PptAgent';
import API_CONFIG from '../utils/ApiConfig';
import { saveAs } from 'file-saver';
import { renderToString } from 'react-dom/server';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import pptxgen from 'pptxgenjs';

const PptMaker = () => {
  // Create PptAgent instance
  const pptAgent = useRef(new PptAgent());
  
  // AI related state
  const [isAiEnabled, setIsAiEnabled] = useState(false);
  const [aiStatus, setAiStatus] = useState('inactive'); // 'inactive', 'configuring', 'ready', 'generating', 'error'
  const [aiSuggestions, setAiSuggestions] = useState(null);
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [apiKeyModalOpen, setApiKeyModalOpen] = useState(false);
  
  // State management
  const [topic, setTopic] = useState('Artificial Intelligence');
  const [selectedSlide, setSelectedSlide] = useState(0);
  const [template, setTemplate] = useState('corporate');
  const [presentationView, setPresentationView] = useState(false);
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    topic: 'Artificial Intelligence',
    audience: 'general',
    tone: 'formal',
    template: 'corporate',
    maxSlides: 15,
    includeNotes: true,
    additionalInfo: ''
  });
  
  // Active presentation data
  const [activePresentation, setActivePresentation] = useState(null);
  const slidePreviewRef = useRef();
  
  // Templates configuration
  const templates = {
    corporate: {
      name: "Professional Business",
      primary: '#1F497D',
      secondary: '#4472C4',
    },
    creative: {
      name: "Creative Design",
      primary: '#C00000',
      secondary: '#FF9900',
    },
    modern: {
      name: "Modern Minimal",
      primary: '#212121',
      secondary: '#757575',
    },
    vibrant: {
      name: "Vibrant Presentation",
      primary: '#7030A0',
      secondary: '#00B0F0',
    },
    gradient: {
      name: "Gradient Style",
      primary: '#6A11CB',
      secondary: '#2575FC',
    },
    premium: {
      name: "Premium Executive",
      primary: '#333333',
      secondary: '#B8860B',
    },
    tech: {
      name: "Technology Focus",
      primary: '#0A192F',
      secondary: '#64FFDA',
    }
  };
  
  // Audience options
  const audienceOptions = [
    { value: "executives", label: "Executives" },
    { value: "managers", label: "Managers" },
    { value: "clients", label: "Clients" },
    { value: "technical", label: "Technical Staff" },
    { value: "students", label: "Students" },
    { value: "general", label: "General Audience" },
    { value: "investors", label: "Investors" },
    { value: "stakeholders", label: "Stakeholders" }
  ];
  
  // Tone options
  const toneOptions = [
    { value: "formal", label: "Formal" },
    { value: "casual", label: "Casual" },
    { value: "persuasive", label: "Persuasive" },
    { value: "informative", label: "Informative" },
    { value: "inspirational", label: "Inspirational" },
    { value: "analytical", label: "Analytical" },
    { value: "enthusiastic", label: "Enthusiastic" }
  ];
  
  // Default presentation data (fallback if AI is not used)
  const defaultPresentation = {
    title: formData.topic,
    slides: [
      {
        id: 1,
        type: 'title',
        title: formData.topic,
        subtitle: `${formData.tone === 'formal' ? 'A Comprehensive Analysis' : 'Key Insights and Applications'}`,
        content: [],
        notes: `Welcome everyone to this presentation on ${formData.topic}. Today we'll be exploring the key aspects of this topic and discussing its implications.`
      },
      {
        id: 2,
        type: 'introduction',
        title: 'Introduction',
        content: [
          `Overview of ${formData.topic}`,
          'Key challenges and opportunities',
          `Why this matters to ${audienceOptions.find(a => a.value === formData.audience)?.label || 'your audience'}`
        ],
        notes: `This introduction sets the context for our discussion about ${formData.topic}. We'll explore why this is relevant for ${formData.audience}.`
      },
      {
        id: 3,
        type: 'concept',
        title: `${formData.topic} Fundamentals`,
        content: [
          'Core principles and concepts',
          'Historical development',
          'Current state of technology'
        ],
        notes: `When discussing the fundamentals, focus on the key principles that make ${formData.topic} important and valuable.`
      },
      {
        id: 4,
        type: 'concept',
        title: `${formData.topic} Applications`,
        content: [
          'Industry use cases',
          'Implementation strategies',
          'Success stories'
        ],
        notes: `These practical applications showcase how ${formData.topic} delivers value in real-world scenarios.`
      },
      {
        id: 5,
        type: 'concept',
        title: `${formData.topic} Future Trends`,
        content: [
          'Emerging developments',
          'Predicted advancements',
          'Potential challenges'
        ],
        notes: `The future trends highlight where ${formData.topic} is headed and what the audience should prepare for.`
      },
      {
        id: 6,
        type: 'concept',
        title: 'Key Statistics',
        content: `${formData.topic} market growth and adoption across industries`,
        notes: `These statistics provide concrete evidence of the impact and growth of ${formData.topic} in recent years.`
      },
      {
        id: 7,
        type: 'concept',
        title: 'Case Study',
        content: `How leading companies implement ${formData.topic} successfully`,
        notes: `This case study demonstrates a practical implementation approach that has proven successful.`
      },
      {
        id: 8,
        type: 'conclusion',
        title: 'Conclusion',
        content: [
          'Summary of key points',
          'Implementation recommendations',
          'Future outlook'
        ],
        notes: `In conclusion, summarize the main points and provide clear next steps for the audience regarding ${formData.topic}.`
      }
    ]
  };
  
  // Initialize active presentation
  useEffect(() => {
    setActivePresentation(defaultPresentation);
  }, []);
  
  // Check for stored API key on mount
  useEffect(() => {
    const checkStoredConfig = () => {
      try {
        const storedConfig = sessionStorage.getItem('ppt_maker_config');
        if (storedConfig) {
          // Decode the stored config
          const decodedConfig = atob(storedConfig);
          if (decodedConfig.startsWith('gemini-key:')) {
            const key = decodedConfig.replace('gemini-key:', '');
            
            // Set the API key
            if (API_CONFIG.gemini.setApiKey(key)) {
              // Configure the PptAgent
              const success = pptAgent.current.setGeminiAPIKey(key);
              if (success) {
                setIsAiEnabled(true);
                setAiStatus('ready');
              }
            }
          }
        }
      } catch (error) {
        console.error('Error loading stored configuration:', error);
      }
    };
    
    checkStoredConfig();
  }, []);
  
  // Handle form input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
    
    if (name === 'template') {
      setTemplate(value);
    }
    
    if (name === 'topic') {
      setTopic(value);
    }
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (step < 3) {
      setStep(step + 1);
    } else {
      setIsLoading(true);
      
      try {
        // If AI is enabled and no AI suggestions yet, generate them now
        if (isAiEnabled && aiStatus === 'ready' && !aiSuggestions) {
          await generateAiSuggestions();
        }
        
        // Wait a moment for visual feedback
        setTimeout(() => {
          // If AI suggestions are available, use those, otherwise use default presentation
          if (aiSuggestions) {
            applyAiSuggestions();
          } else {
            // Update the default presentation with the current form data
            const updatedPresentation = {
              ...defaultPresentation,
              title: formData.topic,
              slides: defaultPresentation.slides.map(slide => {
                if (slide.type === 'title') {
                  return {
                    ...slide,
                    title: formData.topic,
                    subtitle: generateSubtitle(formData.tone, formData.audience)
                  };
                }
                return slide;
              })
            };
            
            setActivePresentation(updatedPresentation);
            setPresentationView(true);
          }
          
          setIsLoading(false);
        }, 1500);
      } catch (error) {
        console.error('Error generating presentation:', error);
        setIsLoading(false);
        
        // Fallback to default presentation
        setActivePresentation(defaultPresentation);
        setPresentationView(true);
      }
    }
  };
  
  // Generate subtitle based on tone and audience
  const generateSubtitle = (tone, audience) => {
    const toneMap = {
      formal: "A Comprehensive Analysis",
      casual: "Exploring Key Insights",
      persuasive: "Why It Matters and How to Respond",
      informative: "Facts, Trends, and Implications",
      inspirational: "Opportunities and Possibilities",
      analytical: "Data-Driven Assessment",
      enthusiastic: "Exciting Developments and Possibilities"
    };
    
    const audienceMap = {
      executives: "Strategic Considerations for Leadership",
      managers: "Implementation Strategies and Outcomes",
      clients: "Benefits and Opportunities",
      technical: "Technical Analysis and Applications",
      students: "Learning and Development Framework",
      general: "Key Principles and Applications",
      investors: "Value Proposition and Growth Potential",
      stakeholders: "Impact Analysis and Future Direction"
    };
    
    const tonePart = toneMap[tone] || "Key Insights and Analysis";
    const audiencePart = audienceMap[audience];
    
    return audiencePart ? `${tonePart}: ${audiencePart}` : tonePart;
  };
  
  // Navigate back to previous step
  const goBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };
  
  // Securely store API key
  const securelyStoreApiKey = (key) => {
    try {
      // In a production app, you would use a more secure method
      // This is a simplified example for demonstration
      const obfuscatedKey = btoa(`gemini-key:${key}`);
      sessionStorage.setItem('ppt_maker_config', obfuscatedKey);
      return true;
    } catch (error) {
      console.error('Error storing API key:', error);
      return false;
    }
  };
  
  // Handle API key submission
  const handleApiKeySubmit = (e) => {
    e.preventDefault();
    
    if (apiKeyInput.trim().length > 10) {
      // Set the API key securely
      if (API_CONFIG.gemini.setApiKey(apiKeyInput.trim())) {
        // Configure the PptAgent with the API key
        const success = pptAgent.current.setGeminiAPIKey(API_CONFIG.gemini.getApiKey());
        
        if (success) {
          // Store the key securely
          securelyStoreApiKey(apiKeyInput.trim());
          
          setIsAiEnabled(true);
          setAiStatus('ready');
          setApiKeyModalOpen(false);
          
          // Clear the input for security
          setApiKeyInput('');
          
          // Show success message
          alert('AI features enabled successfully!');
        } else {
          setAiStatus('error');
          alert('There was an issue configuring the AI. Please try again.');
        }
      }
    } else {
      setAiStatus('error');
      alert('Please enter a valid API key');
    }
  };
  
  // Generate AI suggestions
  const generateAiSuggestions = async () => {
    if (!isAiEnabled || aiStatus !== 'ready') {
      setApiKeyModalOpen(true);
      return;
    }
    
    try {
      setAiStatus('generating');
      
      // Update PptAgent with current settings
      pptAgent.current.setSettings(formData);
      
      // Generate presentation content
      const aiGeneratedContent = await pptAgent.current.generatePresentation();
      
      if (aiGeneratedContent) {
        // Process the AI-generated content
        const processedContent = {
          ...aiGeneratedContent,
          slides: aiGeneratedContent.slides.map((slide, index) => ({
            ...slide,
            id: index + 1
          }))
        };
        
        setAiSuggestions(processedContent);
        setAiStatus('ready');
        return processedContent;
      } else {
        throw new Error('Failed to generate content');
      }
    } catch (error) {
      console.error('Error generating AI suggestions:', error);
      setAiStatus('error');
      alert('There was an error generating AI suggestions. Please try again.');
      return null;
    }
  };
  
  // Determine chart type based on slide content
  const determineChartType = (slide) => {
    const title = slide.title.toLowerCase();
    
    if (title.includes('comparison') || title.includes('versus') || title.includes('vs')) {
      return 'bar';
    } else if (title.includes('trend') || title.includes('growth') || title.includes('time')) {
      return 'line';
    } else if (title.includes('distribution') || title.includes('breakdown') || title.includes('share')) {
      return 'pie';
    } else if (title.includes('flow') || title.includes('process')) {
      return 'flow';
    } else {
      // Default chart types based on random assignment
      const charts = ['bar', 'line', 'pie'];
      return charts[Math.floor(Math.random() * charts.length)];
    }
  };
  
  // Apply AI suggestions to the presentation
  const applyAiSuggestions = () => {
    if (!aiSuggestions) return;
    
    // Set the form data based on AI suggestions
    setFormData({
      ...formData,
      topic: aiSuggestions.title
    });
    
    setTopic(aiSuggestions.title);
    
    // Set the active presentation to the AI-generated one
    setActivePresentation(aiSuggestions);
    
    // Switch to presentation view
    setPresentationView(true);
  };
  
  // Save the current presentation
  const savePresentation = () => {
    try {
      const presentationData = {
        title: activePresentation.title,
        settings: formData,
        slides: activePresentation.slides,
        savedAt: new Date().toISOString()
      };
      
      // Get existing saved presentations
      const saved = JSON.parse(localStorage.getItem('saved_presentations') || '[]');
      
      // Add new presentation
      saved.push(presentationData);
      
      // Save back to localStorage
      localStorage.setItem('saved_presentations', JSON.stringify(saved));
      
      alert('Presentation saved successfully!');
    } catch (error) {
      console.error('Error saving presentation:', error);
      alert('Failed to save presentation. Please try again.');
    }
  };
  
  // Load a saved presentation
  const loadPresentation = (savedPresentation) => {
    try {
      // Set form data
      setFormData(savedPresentation.settings);
      
      // Set topic
      setTopic(savedPresentation.title);
      
      // Set template
      setTemplate(savedPresentation.settings.template);
      
      // Set active presentation
      setActivePresentation({
        title: savedPresentation.title,
        slides: savedPresentation.slides
      });
      
      // Switch to presentation view
      setPresentationView(true);
      
      alert('Presentation loaded successfully!');
    } catch (error) {
      console.error('Error loading presentation:', error);
      alert('Failed to load presentation. Please try again.');
    }
  };

  // Add a new slide
  const addSlide = () => {
    if (!activePresentation) return;
    
    // Create a new slide with a unique ID
    const newSlideId = activePresentation.slides.length + 1;
    const newSlide = {
      id: newSlideId,
      type: 'concept',
      title: `New Slide ${newSlideId}`,
      content: ['Add your content here', 'Click Edit Content to modify'],
      notes: 'Speaker notes for this slide.'
    };
    
    // Add the new slide to the presentation
    const updatedSlides = [...activePresentation.slides, newSlide];
    setActivePresentation({
      ...activePresentation,
      slides: updatedSlides
    });
    
    // Select the newly added slide
    setSelectedSlide(updatedSlides.length - 1);
  };
  
  // Delete a slide
  const deleteSlide = (slideIndex) => {
    if (!activePresentation || activePresentation.slides.length <= 1) return;
    
    // Remove the slide at the specified index
    const updatedSlides = activePresentation.slides.filter((_, index) => index !== slideIndex);
    
    // Update slide IDs to maintain sequence
    const slidesWithUpdatedIds = updatedSlides.map((slide, index) => ({
      ...slide,
      id: index + 1
    }));
    
    // Update the active presentation
    setActivePresentation({
      ...activePresentation,
      slides: slidesWithUpdatedIds
    });
    
    // Adjust selected slide if necessary
    if (slideIndex >= updatedSlides.length) {
      setSelectedSlide(Math.max(0, updatedSlides.length - 1));
    }
  };
  
  // Edit slide content
  const editSlideContent = (slideIndex) => {
    if (!activePresentation) return;
    
    const slide = activePresentation.slides[slideIndex];
    if (!slide) return;
    
    // For title slides, prompt for title and subtitle
    if (slide.type === 'title') {
      const newTitle = prompt('Enter slide title:', slide.title);
      if (newTitle === null) return; // User canceled
      
      const newSubtitle = prompt('Enter slide subtitle:', slide.subtitle);
      if (newSubtitle === null) return; // User canceled
      
      // Update the slide
      const updatedSlides = [...activePresentation.slides];
      updatedSlides[slideIndex] = {
        ...slide,
        title: newTitle,
        subtitle: newSubtitle
      };
      
      setActivePresentation({
        ...activePresentation,
        slides: updatedSlides
      });
    } 
    // For slides with bullet points
    else if (Array.isArray(slide.content)) {
      // Convert array to string for easier editing
      const contentStr = slide.content.join('\n');
      const newTitle = prompt('Enter slide title:', slide.title);
      if (newTitle === null) return; // User canceled
      
      const newContent = prompt('Enter slide content (one bullet point per line):', contentStr);
      if (newContent === null) return; // User canceled
      
      // Split content back into array by line breaks
      const contentArray = newContent.split('\n').filter(item => item.trim() !== '');
      
      // Update the slide
      const updatedSlides = [...activePresentation.slides];
      updatedSlides[slideIndex] = {
        ...slide,
        title: newTitle,
        content: contentArray
      };
      
      setActivePresentation({
        ...activePresentation,
        slides: updatedSlides
      });
    } 
    // For slides with paragraph content
    else {
      const newTitle = prompt('Enter slide title:', slide.title);
      if (newTitle === null) return; // User canceled
      
      const newContent = prompt('Enter slide content:', slide.content);
      if (newContent === null) return; // User canceled
      
      // Update the slide
      const updatedSlides = [...activePresentation.slides];
      updatedSlides[slideIndex] = {
        ...slide,
        title: newTitle,
        content: newContent
      };
      
      setActivePresentation({
        ...activePresentation,
        slides: updatedSlides
      });
    }
  };

  // Export presentation as PPTX using PptxGenJS
  const exportToPPTX = async () => {
    try {
      // Create a new presentation
      let pptx = new pptxgen();
      
      // Set presentation properties
      pptx.author = 'AI Presentation Maker';
      pptx.title = activePresentation.title;
      pptx.subject = 'Generated Presentation';
      
      // Set the template colors based on the selected template
      const primaryColor = templates[template].primary;
      const secondaryColor = templates[template].secondary;
      
      // Process each slide
      activePresentation.slides.forEach((slide, index) => {
        // Add a new slide
        let pptSlide = pptx.addSlide();
        
        // Add slide background with a slight gradient
        pptSlide.background = { color: '#FFFFFF' };
        
        // Add a header bar with the template color
        pptSlide.addShape('rect', { 
          x: 0, y: 0, w: '100%', h: 0.5, 
          fill: { color: primaryColor }
        });
        
        // Handle different slide types
        if (slide.type === 'title') {
          // Title slide
          pptSlide.addText(slide.title, { 
            x: 0.5, y: 2, w: '90%', h: 1.5,
            fontSize: 44, color: primaryColor, bold: true,
            align: 'center'
          });
          
          if (slide.subtitle) {
            pptSlide.addText(slide.subtitle, { 
              x: 0.5, y: 3.5, w: '90%', h: 1,
              fontSize: 28, color: secondaryColor,
              align: 'center'
            });
          }
          
          // Add date at the bottom
          pptSlide.addText(`Presentation Date: ${new Date().toLocaleDateString()}`, { 
            x: 0.5, y: 5, w: '90%', h: 0.5,
            fontSize: 14, color: '#666666',
            align: 'center'
          });
          
        } else {
          // Content slides
          // Add slide title
          pptSlide.addText(slide.title, { 
            x: 0.5, y: 0.6, w: '90%', h: 0.8,
            fontSize: 32, color: primaryColor, bold: true
          });
          
          // Add content based on type
          if (Array.isArray(slide.content)) {
            // Bullet points
            slide.content.forEach((item, i) => {
              pptSlide.addText(item, { 
                x: 0.7, y: 1.6 + (i * 0.6), w: '85%', h: 0.5,
                fontSize: 18, bullet: { type: 'bullet' },
                color: '#333333'
              });
            });
          } else if (slide.content) {
            // Paragraph content
            pptSlide.addText(slide.content, { 
              x: 0.7, y: 1.6, w: '85%', h: 2,
              fontSize: 18, color: '#333333'
            });
          }
        }
        
        // Add speaker notes if they exist and are enabled
        if (slide.notes && formData.includeNotes) {
          pptSlide.addNotes(slide.notes);
        }
      });
      
      // Save the presentation
      const fileName = `${activePresentation.title.replace(/\s+/g, '_')}.pptx`;
      await pptx.writeFile({ fileName });
      
      // Show success message
      alert('PowerPoint file created successfully! You can now open it directly in Microsoft PowerPoint.');
      
    } catch (error) {
      console.error('Error exporting to PPTX:', error);
      alert('Failed to export presentation. Error: ' + error.message);
    }
  };

  // Export presentation as PDF - completely revised approach
  const exportToPDF = async () => {
    try {
      // Create a new PDF document
      const doc = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: [297, 210] // A4 landscape
      });
      
      // Set some basic styles
      doc.setFont('helvetica');
      doc.setFontSize(28);
      
      // Add a cover page with the presentation title
      doc.setTextColor(templates[template].primary.replace('#', ''));
      doc.text(activePresentation.title, 20, 30);
      
      // Add date
      doc.setFontSize(12);
      doc.setTextColor(100, 100, 100);
      doc.text(`Created: ${new Date().toLocaleDateString()}`, 20, 40);
      
      // Process each slide
      activePresentation.slides.forEach((slide, index) => {
        // Add a new page for each slide (except the first one which is the cover)
        if (index > 0) {
          doc.addPage();
        }
        
        // Add slide number
        doc.setFontSize(10);
        doc.setTextColor(100, 100, 100);
        doc.text(`Slide ${index + 1}`, 270, 200);
        
        // Add a colored header bar
        doc.setFillColor(templates[template].primary.replace('#', ''));
        doc.rect(0, 0, 297, 15, 'F');
        
        // Add slide title
        doc.setFontSize(24);
        doc.setTextColor(templates[template].primary.replace('#', ''));
        doc.text(slide.title, 20, 30);
        
        // Handle different slide types
        if (slide.type === 'title' && slide.subtitle) {
          doc.setFontSize(18);
          doc.setTextColor(templates[template].secondary.replace('#', ''));
          doc.text(slide.subtitle, 20, 45);
        } else {
          // Add content
          doc.setFontSize(14);
          doc.setTextColor(0, 0, 0);
          
          let yPosition = 50;
          
          if (Array.isArray(slide.content)) {
            // For bullet points
            slide.content.forEach((item, i) => {
              doc.text(`• ${item}`, 30, yPosition);
              yPosition += 10;
            });
          } else if (typeof slide.content === 'string' && slide.content) {
            // For paragraph content
            const textLines = doc.splitTextToSize(slide.content, 250);
            doc.text(textLines, 20, yPosition);
          }
          
          // Add speaker notes if they exist and are enabled
          if (slide.notes && formData.includeNotes) {
            yPosition = Math.max(yPosition, 150); // Ensure notes start at a reasonable position
            doc.setFontSize(10);
            doc.setTextColor(100, 100, 100);
            doc.text('Speaker Notes:', 20, yPosition);
            
            const noteLines = doc.splitTextToSize(slide.notes, 250);
            doc.text(noteLines, 20, yPosition + 7);
          }
        }
      });
      
      // Save the PDF
      doc.save(`${activePresentation.title.replace(/\s+/g, '_')}_presentation.pdf`);
      alert('PDF exported successfully!');
    } catch (error) {
      console.error('Error exporting to PDF:', error);
      alert('Failed to export PDF: ' + error.message);
    }
  };
  
  // Current slide
  const currentSlide = activePresentation ? 
    activePresentation.slides[selectedSlide] : 
    { type: 'loading', title: 'Loading...', content: [] };
    
  const activeTemplateObj = templates[template];
  
  // Render step 1: Topic and audience
  const renderStep1 = () => (
    <div className="step-form">
      <div className="form-group">
        <label className="form-label">Presentation Topic</label>
        <input
          type="text"
          name="topic"
          value={formData.topic}
          onChange={handleChange}
          placeholder="e.g., Artificial Intelligence in Healthcare"
          className="form-input"
          required
        />
      </div>
      
      <div className="form-group">
        <label className="form-label">Target Audience</label>
        <select
          name="audience"
          value={formData.audience}
          onChange={handleChange}
          className="form-select"
        >
          {audienceOptions.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
      
      <div className="form-group">
        <label className="form-label">Presentation Tone</label>
        <select
          name="tone"
          value={formData.tone}
          onChange={handleChange}
          className="form-select"
        >
          {toneOptions.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
      
      {/* Show saved presentations if available */}
      <SavedPresentations loadPresentation={loadPresentation} />
    </div>
  );
  
  // Render step 2: Design and structure
  const renderStep2 = () => (
    <div className="step-form">
      <div className="form-group">
        <label className="form-label">Template Style</label>
        <div className="template-grid-form">
          {Object.entries(templates).map(([key, template]) => (
            <div 
              key={key}
              className={`template-card ${formData.template === key ? 'active' : ''} ${key === 'premium' || key === 'tech' ? key : ''}`}
              onClick={() => setFormData({...formData, template: key})}
            >
              <div className="color-swatch">
                <div 
                  className="color-dot"
                  style={{backgroundColor: template.primary}}
                />
                <div 
                  className="color-dot"
                  style={{backgroundColor: template.secondary}}
                />
              </div>
              <span>{template.name}</span>
            </div>
          ))}
        </div>
      </div>
      
      <div className="form-group">
        <label className="form-label">
          Maximum Number of Slides: {formData.maxSlides}
        </label>
        <div className="range-container">
          <input
            type="range"
            name="maxSlides"
            min="5"
            max="30"
            value={formData.maxSlides}
            onChange={handleChange}
            className="range-input"
          />
          <div className="range-labels">
            <span>5</span>
            <span>15</span>
            <span>30</span>
          </div>
        </div>
      </div>
      
      <div className="checkbox-container">
        <input
          type="checkbox"
          id="includeNotes"
          name="includeNotes"
          checked={formData.includeNotes}
          onChange={handleChange}
          className="checkbox-input"
        />
        <label htmlFor="includeNotes" className="form-label">
          Include speaker notes
        </label>
      </div>
    </div>
  );
  
  // Render step 3: Additional information
  const renderStep3 = () => (
    <div className="step-form">
      <div className="form-group">
        <label className="form-label">Additional Requirements (Optional)</label>
        <textarea
          name="additionalInfo"
          value={formData.additionalInfo}
          onChange={handleChange}
          placeholder="Include any specific information, requirements, or data you want in the presentation..."
          className="form-textarea"
        />
      </div>
      
      {/* Add AI Assistant */}
      <AiAssistant 
        isAiEnabled={isAiEnabled} 
        aiStatus={aiStatus} 
        generateAiSuggestions={generateAiSuggestions}
        setApiKeyModalOpen={setApiKeyModalOpen}
      />
      
      {/* Add AI Suggestions Panel if available */}
      {aiSuggestions && 
        <AiSuggestionPanel 
          aiSuggestions={aiSuggestions} 
          applyAiSuggestions={applyAiSuggestions} 
        />
      }
      
      <div className="summary-container">
        <h3 className="summary-title">Presentation Summary</h3>
        <div className="summary-content">
          <p className="summary-item"><strong>Topic:</strong> {formData.topic || '(Not specified)'}</p>
          <p className="summary-item"><strong>Audience:</strong> {audienceOptions.find(o => o.value === formData.audience)?.label}</p>
          <p className="summary-item"><strong>Tone:</strong> {toneOptions.find(o => o.value === formData.tone)?.label}</p>
          <p className="summary-item"><strong>Template:</strong> {templates[formData.template]?.name}</p>
          <p className="summary-item"><strong>Maximum Slides:</strong> {formData.maxSlides}</p>
          <p className="summary-item"><strong>Speaker Notes:</strong> {formData.includeNotes ? 'Included' : 'Not included'}</p>
        </div>
      </div>
    </div>
  );
  
  // Render progress indicator
  const renderProgress = () => (
    <div className="progress-container">
      <div className="progress-steps">
        {['Topic & Audience', 'Design', 'Additional Info'].map((label, index) => (
          <div 
            key={index}
            className={`step-label ${
              index + 1 === step 
                ? 'step-current' 
                : index + 1 < step 
                  ? 'step-completed' 
                  : 'step-pending'
            }`}
          >
            {label}
          </div>
        ))}
      </div>
      <div className="progress-bar">
        {[1, 2, 3].map((stepNum) => (
          <div
            key={stepNum}
            className={`progress-segment ${
              stepNum < step 
                ? 'segment-completed' 
                : stepNum === step 
                  ? 'segment-current' 
                  : 'segment-pending'
            }`}
          />
        ))}
      </div>
    </div>
  );
  
  // Loader component
  const Loader = () => (
    <div className="loader-container">
      <div className="loader-circle"></div>
      <p className="loader-text">Creating your presentation...</p>
      <div className="loader-progress">
        <div className="loader-progress-bar"></div>
      </div>
    </div>
  );
  
  return (
    <div className="app-container">
      {/* API Key Modal */}
      {apiKeyModalOpen && (
        <ApiKeyModal 
          apiKeyInput={apiKeyInput}
          setApiKeyInput={setApiKeyInput}
          handleApiKeySubmit={handleApiKeySubmit}
          setApiKeyModalOpen={setApiKeyModalOpen}
        />
      )}
      
      {/* Header */}
      <div className="app-header">
        <div>
          <h1 className="app-title">SlideMind</h1>
          <p className="app-subtitle">Create professional presentations in minutes</p>
        </div>
        {presentationView && (
          <button 
            onClick={() => setPresentationView(false)}
            className="button button-back"
          >
            Back to Editor
          </button>
        )}
      </div>
      
      {isLoading ? (
        <Loader />
      ) : presentationView ? (
        <>
          {/* Toolbar */}
          <Toolbar 
            presentation={activePresentation}
            savePresentation={savePresentation}
            setPresentationView={setPresentationView}
            exportToPPTX={exportToPPTX}
            exportToPDF={exportToPDF}
          />
          
          {/* Main content area */}
          <div className="main-content">
            {/* Sidebar */}
            <SidebarComp 
              presentation={activePresentation}
              selectedSlide={selectedSlide}
              setSelectedSlide={setSelectedSlide}
              template={template}
              setTemplate={setTemplate}
              templates={templates}
              addSlide={addSlide}
              deleteSlide={deleteSlide}
              editSlideContent={editSlideContent}
            />
            
            {/* Slide preview */}
            <div ref={slidePreviewRef}>
              <SlidePreview 
                currentSlide={currentSlide}
                activeTemplate={activeTemplateObj}
                includeNotes={formData.includeNotes}
              />
            </div>
          </div>
        </>
      ) : (
        <div className="wizard-container">
          {renderProgress()}
          
          <form onSubmit={handleSubmit}>
            {step === 1 && renderStep1()}
            {step === 2 && renderStep2()}
            {step === 3 && renderStep3()}
            
            <div className="action-container">
              {step > 1 ? (
                <button
                  type="button"
                  onClick={goBack}
                  className="button button-back"
                >
                  Back
                </button>
              ) : (
                <div></div>
              )}
              
              <button
                type="submit"
                className="button button-next"
              >
                {step === 3 ? 'Generate Presentation' : 'Next'}
              </button>
            </div>
          </form>
          
          {/* Preview */}
          {step === 2 && (
            <div className="template-preview">
              <h3 className="preview-title">Template Preview</h3>
              <div className="template-mini-slide">
                <div 
                  className="mini-header"
                  style={{ backgroundColor: templates[formData.template].primary }}
                />
                <div className="mini-content">
                  <h1 
                    className="mini-title"
                    style={{ color: templates[formData.template].primary }}
                  >
                    Sample Title Slide
                  </h1>
                  <p className="mini-subtitle">Subtitle example</p>
                </div>
              </div>
            </div>
          )}
          
          {/* Show AI Preview if available */}
          {step === 3 && aiSuggestions && (
            <AiContentPreview 
              aiSuggestions={aiSuggestions}
              applyAiSuggestions={applyAiSuggestions}
            />
          )}
        </div>
      )}
    </div>
  );
};

export default PptMaker;