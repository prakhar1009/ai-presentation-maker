// AI Presentation Maker Agent
class PptAgent {
  constructor() {
    // Initialize presentation settings
    this.presentationSettings = {
      topic: "",
      audience: "general",
      tone: "formal",
      template: "corporate",
      maxSlides: 15,
      includeNotes: true,
      language: "en"
    };
    
    // Initialize slide content
    this.slides = [];
    
    // Template options (expanded with more professional options)
    this.templates = {
      corporate: {
        name: "Professional Business",
        colors: ["#1F497D", "#4472C4", "#FFFFFF", "#D9D9D9"],
        fonts: {
          heading: "Calibri Light",
          body: "Calibri"
        }
      },
      creative: {
        name: "Creative Design",
        colors: ["#C00000", "#FF9900", "#FFFFFF", "#FFF2CC"],
        fonts: {
          heading: "Century Gothic",
          body: "Georgia"
        }
      },
      academic: {
        name: "Academic Research",
        colors: ["#2F5597", "#5B9BD5", "#FFFFFF", "#DEEBF7"],
        fonts: {
          heading: "Cambria",
          body: "Cambria"
        }
      },
      modern: {
        name: "Modern Minimal",
        colors: ["#212121", "#757575", "#FFFFFF", "#EEEEEE"],
        fonts: {
          heading: "Segoe UI Light",
          body: "Segoe UI"
        }
      },
      vibrant: {
        name: "Vibrant Presentation",
        colors: ["#7030A0", "#00B0F0", "#FFFFFF", "#E6E6FA"],
        fonts: {
          heading: "Trebuchet MS",
          body: "Arial"
        }
      },
      gradient: {
        name: "Gradient Style",
        colors: ["#6A11CB", "#2575FC", "#FFFFFF", "#E9F3FE"],
        fonts: {
          heading: "Montserrat",
          body: "Roboto"
        }
      },
      premium: {
        name: "Premium Executive",
        colors: ["#333333", "#B8860B", "#FFFFFF", "#F5F5F5"],
        fonts: {
          heading: "Georgia",
          body: "Helvetica"
        }
      },
      tech: {
        name: "Technology Focus",
        colors: ["#0A192F", "#64FFDA", "#FFFFFF", "#112240"],
        fonts: {
          heading: "SF Pro Display",
          body: "SF Pro Text"
        }
      }
    };
    
    // Audience options
    this.audienceTypes = [
      "executives", "managers", "clients", 
      "technical", "students", "general",
      "investors", "stakeholders", "team members"
    ];
    
    // Tone options
    this.toneOptions = [
      "formal", "casual", "persuasive", 
      "informative", "inspirational", "analytical",
      "enthusiastic", "authoritative", "conversational"
    ];
    
    // Initialize Gemini API configuration
    this.geminiConfig = {
      useAPI: false, // Only enable when API key is securely provided
      apiEndpoint: "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent"
    };
  }
  
  // Securely set API key (should be called from a secure context)
  setGeminiAPIKey(apiKey) {
    if (apiKey && apiKey.length > 10) {
      this.geminiConfig.apiKey = apiKey;
      this.geminiConfig.useAPI = true;
      console.log("Gemini API configured successfully");
      return true;
    } else {
      console.warn("Invalid API key format");
      this.geminiConfig.useAPI = false;
      return false;
    }
  }
  
  // Set user settings
  setSettings(settings) {
    this.presentationSettings = {
      ...this.presentationSettings,
      ...settings
    };
    
    return this.presentationSettings;
  }
  
  // Generate presentation content
  async generatePresentation() {
    try {
      // Check if Gemini API can be used
      if (this.geminiConfig.useAPI && this.geminiConfig.apiKey) {
        try {
          const aiGenerated = await this.generateWithGemini();
          if (aiGenerated) {
            console.log("Successfully generated with Gemini API");
            return aiGenerated;
          }
        } catch (aiError) {
          console.error("Error with Gemini API, falling back to local generation:", aiError);
          // Continue with local generation as fallback
        }
      }
      
      // Local generation (fallback or default)
      // 1. Topic analysis & research
      await this.analyzeTopicAndResearch();
      
      // 2. Content structuring
      this.structureContent();
      
      // 3. Create slides
      this.createSlideDeck();
      
      // 4. Apply design and visual elements
      this.applyDesignElements();
      
      // 5. Generate output
      return this.generateOutput();
    } catch (error) {
      console.error("Error generating presentation:", error);
      return null;
    }
  }
  
  // Generate presentation using Gemini API
  async generateWithGemini() {
    if (!this.geminiConfig.useAPI || !this.geminiConfig.apiKey) {
      return null;
    }
    
    try {
      // Create request for Gemini API
      const prompt = this.createGeminiPrompt();
      
      // Make API request
      const response = await fetch(this.geminiConfig.apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': this.geminiConfig.apiKey
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 8192,
            topP: 0.95,
          }
        })

      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
      }
      
      // Parse response
      const data = await response.json();
      if (!data.candidates || data.candidates.length === 0) {
        throw new Error("Empty response from Gemini API");
      }
      
      const content = data.candidates[0].content.parts[0].text;
      return this.parseGeminiResponse(content);
    } catch (error) {
      console.error("Error with Gemini API:", error);
      return null;
    }
  }
  
  // Create detailed prompt for Gemini
  createGeminiPrompt() {
    const { topic, audience, tone, maxSlides, includeNotes, additionalInfo } = this.presentationSettings;
    
    return `Create a professional presentation about "${topic || 'Sample Topic'}".
    
Target audience: ${audience}
Presentation tone: ${tone}
Maximum number of slides: ${maxSlides}
Include speaker notes: ${includeNotes ? 'yes' : 'no'}
Additional requirements: ${additionalInfo || 'None'}

I need a complete presentation with the following:

1. An engaging title slide with a memorable title and subtitle
2. An introduction slide explaining why ${topic || 'the topic'} matters to ${audience}
3. 3-5 content slides covering key aspects of ${topic || 'the topic'} with bullet points
4. 2-3 data visualization slides with appropriate charts (bar charts for comparisons, line charts for trends, pie charts for distributions)
5. 1-2 example/case study slides with real-world applications
6. A conclusion slide summarizing key points
7. A Q&A or contact slide

For each slide, provide:
- Slide type (title, introduction, concept, data, example, conclusion, qa)
- Slide title (clear and concise)
- Bullet points or main content (3-5 bullet points per slide)
- Speaker notes to guide the presenter (if requested)
- For data slides, specify appropriate chart type (bar, line, pie) and what data should be visualized

Be creative but professional. The content should be detailed, accurate, and valuable to the audience.

Respond with structured JSON in this format:
{
  "title": "Main Presentation Title",
  "slides": [
    {
      "type": "title",
      "title": "Compelling Title",
      "subtitle": "Engaging Subtitle",
      "notes": "Speaker notes about the presentation opening"
    },
    {
      "type": "introduction",
      "title": "Introduction to Topic",
      "content": ["Point 1", "Point 2", "Point 3"],
      "notes": "Speaker notes for this slide"
    },
    {
      "type": "data",
      "title": "Data Analysis",
      "content": "Description of what the chart shows",
      "chartType": "bar",
      "notes": "Notes explaining the data insights"
    }
  ]
}`;
  }
  
  // Parse response from Gemini into presentation format
  parseGeminiResponse(content) {
    try {
      // Try to extract JSON from the response
      const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/) || content.match(/```\n([\s\S]*?)\n```/) || content.match(/({[\s\S]*?})/);
      
      if (jsonMatch && jsonMatch[1]) {
        try {
          const parsedData = JSON.parse(jsonMatch[1]);
          
          // Structure the data in our expected format
          const slides = parsedData.slides.map((slide, index) => {
            // Make sure all slides have the required properties
            const processedSlide = {
              ...slide,
              number: index + 1,
              id: index + 1
            };
            
            // Add chart types for data slides if not specified
            if (slide.type === 'data' && !slide.chartType) {
              processedSlide.chartType = this.determineChartType(slide);
            }
            
            // Add visual type for example slides
            if (slide.type === 'example' && !slide.imageType) {
              processedSlide.imageType = 'case-study';
            }
            
            return processedSlide;
          });
          
          // Add design elements to the slides
          const template = this.templates[this.presentationSettings.template];
          const enhancedSlides = slides.map(slide => ({
            ...slide,
            design: {
              template: this.presentationSettings.template,
              primaryColor: template.colors[0],
              secondaryColor: template.colors[1],
              backgroundColor: template.colors[2],
              accentColor: template.colors[3],
              headingFont: template.fonts.heading,
              bodyFont: template.fonts.body
            }
          }));
          
          return {
            title: parsedData.title || this.presentationSettings.topic,
            settings: this.presentationSettings,
            slides: enhancedSlides,
            metadata: {
              slideCount: enhancedSlides.length,
              dateCreated: new Date().toISOString(),
              version: "1.0",
              generator: "Gemini AI"
            }
          };
        } catch (jsonError) {
          console.error("Failed to parse JSON from Gemini response:", jsonError);
          console.log("Attempting text extraction instead");
        }
      }
      
      // Fallback to text parsing if JSON extraction fails
      return this.extractPresentationFromText(content);
    } catch (error) {
      console.error("Error parsing Gemini response:", error);
      return null;
    }
  }
  
  // Extract presentation data from text if JSON parsing fails
  extractPresentationFromText(text) {
    const slides = [];
    let presentationTitle = this.presentationSettings.topic;
    
    // Try to find presentation title
    const titleMatch = text.match(/# (.*?)[\n\r]/);
    if (titleMatch && titleMatch[1]) {
      presentationTitle = titleMatch[1].trim();
    }
    
    // Find slides with numbered patterns or headings
    const slideMatches = text.split(/(?:Slide\s+\d+:|#+\s*Slide\s+\d+:|\d+\.\s+Slide:)/g).filter(Boolean);
    
    if (slideMatches.length <= 1) {
      // If no clear slide delimiters, try using markdown headings as slide separators
      const headingMatches = text.split(/\n#{1,3}\s+(?!Slide)/g).filter(Boolean);
      
      if (headingMatches.length > 1) {
        // Process each heading section as a slide
        headingMatches.forEach((section, index) => {
          const lines = section.trim().split('\n').filter(line => line.trim());
          if (lines.length === 0) return;
          
          const title = lines[0].replace(/^#+\s*/, '').trim();
          const slide = this.createSlideFromTextSection(title, lines.slice(1), index);
          
          if (slide) {
            slides.push(slide);
          }
        });
      }
    } else {
      // Process each slide section
      slideMatches.forEach((section, index) => {
        const lines = section.trim().split('\n').filter(line => line.trim());
        if (lines.length === 0) return;
        
        const title = lines[0].replace(/^#+\s*/, '').trim();
        const slide = this.createSlideFromTextSection(title, lines.slice(1), index);
        
        if (slide) {
          slides.push(slide);
        }
      });
    }
    
    // If we couldn't extract slides properly, return null to fallback to local generation
    if (slides.length === 0) {
      console.error("Failed to extract slides from text");
      return null;
    }
    
    // Add design elements and slide numbers
    const template = this.templates[this.presentationSettings.template];
    slides.forEach((slide, index) => {
      slide.id = index + 1;
      slide.number = index + 1;
      slide.design = {
        template: this.presentationSettings.template,
        primaryColor: template.colors[0],
        secondaryColor: template.colors[1],
        backgroundColor: template.colors[2],
        accentColor: template.colors[3],
        headingFont: template.fonts.heading,
        bodyFont: template.fonts.body
      };
    });
    
    return {
      title: presentationTitle,
      settings: this.presentationSettings,
      slides: slides,
      metadata: {
        slideCount: slides.length,
        dateCreated: new Date().toISOString(),
        version: "1.0",
        generator: "Gemini AI (text extraction)"
      }
    };
  }
  
  // Create slide object from text section
  createSlideFromTextSection(title, contentLines, index) {
    // Skip empty sections
    if (!title) return null;
    
    // Determine slide type
    let type = 'concept';
    if (index === 0 || title.toLowerCase().includes('title')) {
      type = 'title';
    } else if (title.toLowerCase().includes('introduction') || title.toLowerCase().includes('intro')) {
      type = 'introduction';
    } else if (title.toLowerCase().includes('conclusion')) {
      type = 'conclusion';
    } else if (title.toLowerCase().includes('q&a') || title.toLowerCase().includes('question')) {
      type = 'qa';
    } else if (title.toLowerCase().includes('case study') || title.toLowerCase().includes('example')) {
      type = 'example';
    } else if (
      title.toLowerCase().includes('data') || 
      title.toLowerCase().includes('statistics') || 
      title.toLowerCase().includes('chart') ||
      title.toLowerCase().includes('graph') ||
      title.toLowerCase().includes('figure')
    ) {
      type = 'data';
    }
    
    // Extract content
    const content = [];
    let notes = '';
    let subtitle = '';
    let chartType = null;
    
    // For title slides, check for subtitle
    if (type === 'title' && contentLines.length > 0) {
      subtitle = contentLines[0].replace(/^[#*-\s]*/, '').trim();
      contentLines = contentLines.slice(1);
    }
    
    // Look for speaker notes and content
    let inNotes = false;
    let imageType = null;
    
    for (const line of contentLines) {
      const trimmedLine = line.trim();
      
      // Check for notes section
      if (
        trimmedLine.toLowerCase().includes('speaker notes') || 
        trimmedLine.toLowerCase().includes('speaking notes') || 
        trimmedLine.toLowerCase().startsWith('note:')
      ) {
        inNotes = true;
        continue;
      }
      
      // Check for chart type in data slides
      if (type === 'data' && !chartType) {
        if (trimmedLine.toLowerCase().includes('bar chart') || trimmedLine.toLowerCase().includes('column chart')) {
          chartType = 'bar';
        } else if (trimmedLine.toLowerCase().includes('line chart') || trimmedLine.toLowerCase().includes('trend')) {
          chartType = 'line';
        } else if (trimmedLine.toLowerCase().includes('pie chart') || trimmedLine.toLowerCase().includes('distribution')) {
          chartType = 'pie';
        } else if (trimmedLine.toLowerCase().includes('flow chart') || trimmedLine.toLowerCase().includes('process')) {
          chartType = 'flow';
        }
      }
      
      // Check for image references in example slides
      if (type === 'example' && !imageType && 
        (trimmedLine.toLowerCase().includes('image') || trimmedLine.toLowerCase().includes('figure'))) {
        imageType = 'case-study';
      }
      
      // Process as note or content
      if (inNotes) {
        notes += trimmedLine + ' ';
      } else if (trimmedLine.startsWith('-') || trimmedLine.startsWith('*') || trimmedLine.startsWith('•') || /^\d+\./.test(trimmedLine)) {
        content.push(trimmedLine.replace(/^[-*•\d.\s]+/, '').trim());
      } else if (trimmedLine.length > 0 && !trimmedLine.startsWith('#')) {
        // Only add non-heading text that isn't empty
        if (content.length === 0 || !Array.isArray(content)) {
          content.push(trimmedLine);
        }
      }
    }
    
    // Create slide object
    const slide = {
      id: index + 1,
      number: index + 1,
      type: type,
      title: title
    };
    
    // Add different properties based on slide type
    if (type === 'title') {
      slide.subtitle = subtitle || this.generateSubtitle();
      slide.content = [];
    } else {
      slide.content = content.length > 0 ? content : ['Content for this slide will be added here.'];
    }
    
    // Add notes if enabled
    if (this.presentationSettings.includeNotes) {
      slide.notes = notes.trim() || this.generateDefaultNotes(type, title);
    }
    
    // Add chart type for data slides
    if (type === 'data') {
      slide.chartType = chartType || this.determineChartType(slide);
    }
    
    // Add image type for example slides
    if (type === 'example') {
      slide.imageType = imageType || 'case-study';
    }
    
    return slide;
  }
  
  // Generate default notes based on slide type
  generateDefaultNotes(slideType, title) {
    const topic = this.presentationSettings.topic;
    const audience = this.presentationSettings.audience;
    
    switch (slideType) {
      case 'title':
        return `Welcome everyone to this presentation on ${topic}. Today we'll be exploring the key aspects of this topic and how it impacts ${audience}.`;
      case 'introduction':
        return `This introduction sets the context for our discussion about ${topic}. We'll explore why this is relevant for ${audience} and what the key challenges and opportunities are.`;
      case 'concept':
        return `When discussing ${title.toLowerCase()}, emphasize how it specifically impacts ${audience}. This concept is fundamental to understanding ${topic}.`;
      case 'data':
        return `These statistics provide concrete evidence of the impact and trends related to ${topic}. Point out the key insights from this visualization that are most relevant to ${audience}.`;
      case 'example':
        return `This example demonstrates a practical application of ${topic}. Highlight the specific aspects that would be most interesting to ${audience}.`;
      case 'conclusion':
        return `Summarize the key takeaways about ${topic} and provide clear next steps or recommendations for ${audience}.`;
      case 'qa':
        return `Be prepared to address questions about specific aspects of ${topic}. Have additional data points ready to support your main arguments if needed.`;
      default:
        return `Present this information about ${topic} in a way that resonates with ${audience}, focusing on the aspects most relevant to their needs and interests.`;
    }
  }
  
  // Generate subtitle for title slide
  generateSubtitle() {
    const { tone, audience } = this.presentationSettings;
    
    const toneMap = {
      formal: "A Comprehensive Analysis",
      casual: "Exploring Key Insights",
      persuasive: "Why It Matters and How to Respond",
      informative: "Facts, Trends, and Implications",
      inspirational: "Opportunities and Possibilities",
      analytical: "Data-Driven Assessment",
      enthusiastic: "Exciting Developments and Possibilities",
      authoritative: "Expert Insights and Strategic Overview",
      conversational: "Let's Talk About What Matters"
    };
    
    const audienceMap = {
      executives: "Strategic Considerations for Leadership",
      managers: "Implementation Strategies and Outcomes",
      clients: "Benefits and Opportunities",
      technical: "Technical Analysis and Applications",
      students: "Learning and Development Framework",
      general: "Key Principles and Applications",
      investors: "Value Proposition and Growth Potential",
      stakeholders: "Impact Analysis and Future Direction",
      "team members": "Collaborative Approach and Implementation"
    };
    
    // Use the tone-based subtitle or a default one
    const tonePart = toneMap[tone] || "Key Insights and Analysis";
    
    // Add audience-specific part if available
    const audiencePart = audienceMap[audience];
    
    return audiencePart ? `${tonePart}: ${audiencePart}` : tonePart;
  }
  
  // Determine appropriate chart type based on slide content
  determineChartType(slide) {
    // Use the slide title and content for the check
    const title = (slide.title || '').toLowerCase();
    const content = Array.isArray(slide.content) 
      ? slide.content.join(' ').toLowerCase() 
      : (slide.content || '').toLowerCase();
    
    const combinedText = title + ' ' + content;
    
    if (combinedText.includes('comparison') || combinedText.includes('versus') || combinedText.includes(' vs ')) {
      return 'bar';
    } else if (combinedText.includes('trend') || combinedText.includes('growth') || combinedText.includes('time') || combinedText.includes('over') || combinedText.includes('increase')) {
      return 'line';
    } else if (combinedText.includes('distribution') || combinedText.includes('breakdown') || combinedText.includes('share') || combinedText.includes('segment') || combinedText.includes('percentage')) {
      return 'pie';
    } else if (combinedText.includes('flow') || combinedText.includes('process') || combinedText.includes('step') || combinedText.includes('workflow')) {
      return 'flow';
    } else {
      // Default chart types based on random assignment with weighted distribution
      const charts = ['bar', 'bar', 'line', 'line', 'pie', 'flow'];
      return charts[Math.floor(Math.random() * charts.length)];
    }
  }
  
  // Analyze topic and perform research
  async analyzeTopicAndResearch() {
    // For this version, we'll simulate analysis results
    const topic = this.presentationSettings.topic || "Sample Topic";
    
    // Extract main concepts (simulated NLP analysis)
    this.topicAnalysis = {
      mainConcepts: this.simulateMainConcepts(topic),
      subtopics: this.simulateSubtopics(topic),
      intent: this.determineIntent(this.presentationSettings.tone),
      facts: this.simulateFactsAndStatistics(topic),
      examples: this.simulateExamples(topic)
    };
    
    return this.topicAnalysis;
  }
  
  // Structure content into presentation sections
  structureContent() {
    // Determine optimal slide count based on content density
    const contentDensity = 
      this.topicAnalysis.mainConcepts.length * 0.5 + 
      this.topicAnalysis.subtopics.length * 0.3 + 
      this.topicAnalysis.facts.length * 0.2;
    
    const optimalSlideCount = Math.min(
      Math.ceil(contentDensity + 3), // +3 for title, intro, conclusion
      this.presentationSettings.maxSlides
    );
    
    this.sections = {
      title: this.createTitleSlide(),
      introduction: this.createIntroductionSlide(),
      keyConcepts: this.createKeyConceptSlides(),
      data: this.createDataSlides(),
      examples: this.createExampleSlides(),
      conclusion: this.createConclusionSlide(),
      qAndA: this.createQASlide()
    };
    
    // Balance content across available slides if needed
    if (this.countTotalSlides() > optimalSlideCount) {
      this.balanceContent(optimalSlideCount);
    }
  }
  
  // Count total slides across all sections
  countTotalSlides() {
    return Object.values(this.sections)
      .flat()
      .length;
  }
  
  // Create the complete slide deck
  createSlideDeck() {
    // Combine all sections into single slides array
    this.slides = [
      ...this.sections.title,
      ...this.sections.introduction,
      ...this.sections.keyConcepts,
      ...this.sections.data,
      ...this.sections.examples,
      ...this.sections.conclusion,
      ...this.sections.qAndA
    ];
    
    // Number the slides
    this.slides.forEach((slide, index) => {
      slide.number = index + 1;
      slide.id = index + 1;
    });
  }
  
  // Apply design elements and visual assets
  applyDesignElements() {
    const template = this.templates[this.presentationSettings.template];
    
    // Apply template to all slides
    this.slides.forEach(slide => {
      slide.design = {
        template: this.presentationSettings.template,
        primaryColor: template.colors[0],
        secondaryColor: template.colors[1],
        backgroundColor: template.colors[2],
        accentColor: template.colors[3],
        headingFont: template.fonts.heading,
        bodyFont: template.fonts.body
      };
      
      // Add visual elements based on slide type
      this.addVisualElements(slide);
    });
  }
  
  // Add appropriate visual elements to each slide
  addVisualElements(slide) {
    switch (slide.type) {
      case 'title':
        slide.visual = {
          type: 'background',
          description: 'Subtle gradient background with company logo'
        };
        break;
      
      case 'data':
        // Determine chart type based on data
        const chartType = slide.chartType || this.determineChartType(slide);
        slide.visual = {
          type: chartType,
          data: slide.dataPoints,
          description: `${chartType} showing ${slide.title.toLowerCase()}`
        };
        slide.chartType = chartType;
        break;
      
      case 'concept':
        slide.visual = {
          type: 'icon',
          description: `Icon representing the concept of ${slide.title}`
        };
        break;
      
      case 'example':
        slide.visual = {
          type: 'image',
          description: `Image illustrating ${slide.title}`
        };
        slide.imageType = 'case-study';
        break;
      
      case 'conclusion':
        slide.visual = {
          type: 'icon',
          description: 'Summary icon or graphic'
        };
        break;
      
      case 'qa':
        slide.visual = {
          type: 'icon',
          description: 'Question mark icon or contact information graphic'
        };
        break;
      
      default:
        slide.visual = {
          type: 'none',
          description: 'No visual element'
        };
    }
  }
  
  // Generate final presentation output
  generateOutput() {
    return {
      title: this.presentationSettings.topic,
      settings: this.presentationSettings,
      slides: this.slides,
      metadata: {
        slideCount: this.slides.length,
        dateCreated: new Date().toISOString(),
        version: "1.0"
      }
    };
  }
  
  // Create title slide
  createTitleSlide() {
    return [{
      type: 'title',
      title: this.capitalizeWords(this.presentationSettings.topic),
      subtitle: this.generateSubtitle(),
      presenter: 'Your Name Here',
      date: new Date().toLocaleDateString(),
      content: [],
      notes: this.presentationSettings.includeNotes ? 
        `Welcome everyone to this presentation on ${this.presentationSettings.topic}. Today we'll be exploring the key aspects of this topic and discussing its implications.` : ''
    }];
  }
  
  // Create introduction slide
  createIntroductionSlide() {
    return [{
      type: 'introduction',
      title: 'Introduction',
      content: [
        `Overview of ${this.capitalizeWords(this.presentationSettings.topic)}`,
        'Key challenges and opportunities',
        'Why this matters to ' + this.presentationSettings.audience
      ],
      notes: this.presentationSettings.includeNotes ?
        `This introduction sets the stage for our discussion. The goal is to provide context about why ${this.presentationSettings.topic} is relevant to ${this.presentationSettings.audience} and what key challenges and opportunities exist in this space.` : ''
    }];
  }
  
  // Create key concept slides
  createKeyConceptSlides() {
    return this.topicAnalysis.mainConcepts.map(concept => ({
      type: 'concept',
      title: this.capitalizeWords(concept),
      content: [
        `Definition and importance of ${concept}`,
        'Current trends and developments',
        'Impact on ' + this.presentationSettings.audience
      ],
      notes: this.presentationSettings.includeNotes ?
        `When discussing ${concept}, emphasize how it specifically impacts ${this.presentationSettings.audience}. This concept is fundamental to understanding the broader topic.` : ''
    }));
  }
  
  // Create data slides
  createDataSlides() {
    return this.topicAnalysis.facts.map(fact => ({
      type: 'data',
      title: fact.title,
      content: fact.description,
      dataPoints: fact.data,
      chartType: this.getChartTypeFromFact(fact),
      notes: this.presentationSettings.includeNotes ?
        `These statistics highlight the significance of ${fact.title.toLowerCase()}. The data demonstrates ${fact.interpretation}.` : ''
    }));
  }
  
  // Determine chart type from fact content
  getChartTypeFromFact(fact) {
    const title = fact.title.toLowerCase();
    const description = fact.description.toLowerCase();
    
    if (
      title.includes('comparison') || 
      title.includes('versus') || 
      description.includes('comparison') || 
      description.includes('versus')
    ) {
      return 'bar';
    } else if (
      title.includes('trend') || 
      title.includes('growth') || 
      title.includes('over time') ||
      description.includes('trend') || 
      description.includes('growth') || 
      description.includes('over time')
    ) {
      return 'line';
    } else if (
      title.includes('distribution') || 
      title.includes('breakdown') || 
      title.includes('share') ||
      description.includes('distribution') || 
      description.includes('breakdown') || 
      description.includes('share')
    ) {
      return 'pie';
    } else if (
      title.includes('flow') || 
      title.includes('process') ||
      description.includes('flow') || 
      description.includes('process')
    ) {
      return 'flow';
    }
    
    // Look at the data structure for clues
    if (fact.data && Array.isArray(fact.data)) {
      if (fact.data.some(d => d.year || d.date || d.time || d.period)) {
        return 'line';
      } else if (fact.data.some(d => d.category || d.group || d.type)) {
        return 'bar';
      } else if (fact.data.some(d => d.percentage || d.share || d.portion)) {
        return 'pie';
      }
    }
    
    // Default based on randomness with weights
    const charts = ['bar', 'bar', 'line', 'line', 'pie'];
    return charts[Math.floor(Math.random() * charts.length)];
  }
  
  // Create example slides
  createExampleSlides() {
    return this.topicAnalysis.examples.map(example => ({
      type: 'example',
      title: example.title,
      content: example.description,
      imageType: 'case-study',
      notes: this.presentationSettings.includeNotes ?
        `This example of ${example.title} illustrates the practical application of the concepts we've discussed. It's particularly relevant for ${this.presentationSettings.audience}.` : ''
    }));
  }
  
  // Create conclusion slide
  createConclusionSlide() {
    return [{
      type: 'conclusion',
      title: 'Conclusion',
      content: [
        `Summary of key points about ${this.presentationSettings.topic}`,
        'Implications for ' + this.presentationSettings.audience,
        'Recommended next steps and actions'
      ],
      notes: this.presentationSettings.includeNotes ?
        `Summarize the key takeaways and emphasize the specific action items that ${this.presentationSettings.audience} should consider. This reinforces the practical value of the presentation.` : ''
    }];
  }
  
  // Create Q&A slide
  createQASlide() {
    return [{
      type: 'qa',
      title: 'Questions?',
      content: 'Contact Information: your.email@example.com',
      notes: this.presentationSettings.includeNotes ?
        'Be prepared to address questions about specific aspects of the topic. Have additional data points ready to support your main arguments if needed.' : ''
    }];
  }
  
  // Balance content across slides if there are too many
  balanceContent(targetSlideCount) {
    // If we have too many slides, start combining content
    
    // First, try to combine examples if there are multiple
    if (this.sections.examples.length > 1) {
      this.sections.examples = this.combineSlides(
        this.sections.examples, 
        Math.ceil(this.sections.examples.length / 2), 
        'Examples'
      );
    }
    
    // Next, combine key concepts if still needed
    if (this.countTotalSlides() > targetSlideCount && 
        this.sections.keyConcepts.length > 2) {
      this.sections.keyConcepts = this.combineSlides(
        this.sections.keyConcepts, 
        Math.ceil(this.sections.keyConcepts.length / 2), 
        'Key Concepts'
      );
    }
    
    // Finally, combine data slides if necessary
    if (this.countTotalSlides() > targetSlideCount && 
        this.sections.data.length > 1) {
      this.sections.data = this.combineSlides(
        this.sections.data, 
        Math.min(2, this.sections.data.length), 
        'Key Data Points'
      );
    }
  }
  
  // Combine multiple slides into fewer slides
  combineSlides(slides, targetCount, groupTitle) {
    if (slides.length <= targetCount) {
      return slides;
    }
    
    const combined = [];
    const slidesPerGroup = Math.ceil(slides.length / targetCount);
    
    for (let i = 0; i < slides.length; i += slidesPerGroup) {
      const group = slides.slice(i, i + slidesPerGroup);
      
      if (group.length === 1) {
        combined.push(group[0]);
        continue;
      }
      
      // Create a combined slide
      let combinedContent;
      let combinedTitle;
      
      if (group[0].type === 'concept') {
        combinedTitle = `Key Concepts: ${group.map(s => s.title).join(' & ')}`;
        combinedContent = group.flatMap(s => 
          [s.title, ...s.content.map(c => `  - ${c}`)]
        );
      } else if (group[0].type === 'data') {
        combinedTitle = 'Key Data Points';
        combinedContent = group.map(s => 
          `${s.title}: ${s.content}`
        );
      } else if (group[0].type === 'example') {
        combinedTitle = 'Examples';
        combinedContent = group.map(s => 
          `${s.title}: ${s.content}`
        );
      } else {
        combinedTitle = groupTitle || "Combined Content";
        combinedContent = group.flatMap(s => 
          [s.title, s.content]
        );
      }
      
      combined.push({
        type: group[0].type,
        title: combinedTitle,
        content: combinedContent,
        // Keep the chart type from the first slide if it's a data slide
        chartType: group[0].type === 'data' ? group[0].chartType || 'bar' : undefined,
        // Keep the image type from the first slide if it's an example slide
        imageType: group[0].type === 'example' ? 'case-study' : undefined,
        notes: this.presentationSettings.includeNotes ?
          `This slide combines multiple points about ${combinedTitle.toLowerCase()} for brevity. Each point deserves attention, so consider addressing them individually.` : ''
      });
    }
    
    return combined;
  }
  
  // Determine intent based on tone
  determineIntent(tone) {
    const intentMap = {
      formal: "inform",
      casual: "engage",
      persuasive: "convince",
      informative: "educate",
      inspirational: "motivate",
      analytical: "analyze",
      enthusiastic: "excite",
      authoritative: "direct",
      conversational: "connect"
    };
    
    return intentMap[tone] || "inform";
  }
  
  // Helper method to capitalize words
  capitalizeWords(str) {
    if (!str) return '';
    return str
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }
  
  // Simulation functions for topic analysis (would be replaced by actual NLP/AI in production)
  
  // Simulate main concepts extraction
  simulateMainConcepts(topic) {
    if (!topic) topic = "Sample Topic";
    
    const topicWords = topic.toLowerCase().split(' ');
    const concepts = [];
    
    // Remove common words and create concept combinations
    const filteredWords = topicWords.filter(word => 
      word.length > 3 && 
      !['and', 'the', 'for', 'with', 'that', 'this'].includes(word)
    );
    
    // Create 2-3 main concepts based on topic words
    if (filteredWords.length >= 2) {
      concepts.push(
        filteredWords[0] + ' principles',
        filteredWords[Math.min(1, filteredWords.length - 1)] + ' applications'
      );
      
      if (filteredWords.length >= 3) {
        concepts.push(
          filteredWords[Math.min(2, filteredWords.length - 1)] + ' integration'
        );
      }
    } else {
      // If not enough distinct words, create generic concepts
      concepts.push(
        topic + ' fundamentals',
        topic + ' applications',
        topic + ' future trends'
      );
    }
    
    return concepts;
  }
  
  // Simulate subtopics extraction
  simulateSubtopics(topic) {
    if (!topic) topic = "Sample Topic";
    
    return [
      topic + ' implementation strategies',
      'Future trends in ' + topic,
      'Challenges and opportunities',
      'Best practices for ' + topic,
      'Case studies and success stories'
    ];
  }
  
  // Simulate facts and statistics generation
  simulateFactsAndStatistics(topic) {
    if (!topic) topic = "Sample Topic";
    
    return [
      {
        title: 'Market Growth',
        description: `The ${topic} market has grown by 27% over the past two years, with projections showing continued expansion.`,
        data: [
          { year: '2022', value: 100 },
          { year: '2023', value: 115 },
          { year: '2024', value: 127 },
          { year: '2025', value: 142 } // Projected
        ],
        interpretation: 'the strong momentum and potential for future investment'
      },
      {
        title: 'Adoption Rates',
        description: `Organizations implementing ${topic} reported a 35% increase in efficiency and 22% reduction in costs.`,
        data: [
          { category: 'Small Business', value: 45 },
          { category: 'Mid-sized', value: 65 },
          { category: 'Enterprise', value: 78 }
        ],
        interpretation: 'the varying adoption rates across different organization sizes'
      },
      {
        title: 'Success Factors',
        description: `Key success factors for ${topic} implementation include leadership support (87%), adequate training (76%), and clear goals (92%).`,
        data: [
          { factor: 'Leadership Support', value: 87 },
          { factor: 'Adequate Training', value: 76 },
          { factor: 'Clear Goals', value: 92 },
          { factor: 'Technology', value: 64 },
          { factor: 'Budget', value: 58 }
        ],
        interpretation: 'the critical importance of organizational factors over purely technical considerations'
      },
      {
        title: 'ROI Analysis',
        description: `Return on investment for ${topic} initiatives shows positive results within 6-12 months in 78% of cases.`,
        data: [
          { timeframe: '0-6 months', percentage: 32 },
          { timeframe: '6-12 months', percentage: 46 },
          { timeframe: '12-18 months', percentage: 18 },
          { timeframe: '18+ months', percentage: 4 }
        ],
        interpretation: 'the relatively quick payback period for well-executed implementations'
      },
      {
        title: 'Industry Comparison',
        description: `${topic} adoption varies significantly by industry, with technology and healthcare leading, while manufacturing and retail are rapidly catching up.`,
        data: [
          { industry: 'Technology', adoption: 92 },
          { industry: 'Healthcare', adoption: 83 },
          { industry: 'Financial Services', adoption: 76 },
          { industry: 'Manufacturing', adoption: 65 },
          { industry: 'Retail', adoption: 58 }
        ],
        interpretation: 'how different industries prioritize and implement these initiatives'
      }
    ];
  }
  
  // Simulate examples generation
  simulateExamples(topic) {
    if (!topic) topic = "Sample Topic";
    
    return [
      {
        title: 'Case Study: Industry Leader',
        description: `A leading organization implemented ${topic} and achieved 45% improvement in performance metrics within 6 months. Their approach focused on incremental deployment with continuous feedback loops.`
      },
      {
        title: 'Real-World Application',
        description: `Practical application of ${topic} in daily operations has resulted in streamlined processes and higher team satisfaction. Small teams reported the biggest proportional gains.`
      },
      {
        title: 'Success Story: Mid-Size Enterprise',
        description: `A mid-size company overcame initial resistance to ${topic} by involving employees at all levels in the implementation process. Their phased approach proved highly effective.`
      },
      {
        title: 'Global Implementation Example',
        description: `A multinational corporation successfully rolled out ${topic} across diverse regional offices by customizing the approach for local cultures while maintaining core principles.`
      }
    ];
  }
}

export default PptAgent;