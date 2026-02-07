import { GoogleGenAI, Type } from "@google/genai";
import { ComponentSpec } from "../types";


const getAiClient = () => {
  // @ts-ignore
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

// ============================================================================
// PROMPT TEMPLATES
// These are structured, versioned prompts for reproducibility
// ============================================================================

const PROMPTS = {

  REFINE_SKETCH: {
    version: "1.0",
    role: "Expert Technical Illustrator & Software Architect",
    task: "Synthesize hand-drawn sketches into a single, professional, high-fidelity software architecture diagram.",
    template: `
# ROLE
You are an Expert Technical Illustrator and Software Architect.

# TASK
Transform the provided hand-drawn sketch(es) into a single, professional, high-fidelity software architecture diagram.

# VISUAL STYLE REQUIREMENTS

## Aesthetic
- Modern, clean, flat vector art style
- Similar to high-end SaaS documentation (Stripe, AWS, Datadog)
- Professional corporate appearance

## Perspective
- 2D Orthogonal (flat) or clean Isometric view
- Consistent throughout the diagram

## Color Palette
- Primary: Cool blues (#0066CC, #3399FF)
- Backgrounds: Neutral greys (#F5F5F5, #E0E0E0) and white
- Containers: Light backgrounds with subtle borders
- Accent colors: Use sparingly for status/emphasis only
  - Success/Active: Green (#28A745)
  - Warning/Pending: Orange (#FD7E14)
  - Error/Critical: Red (#DC3545)

## Line Work
- Uniform line weights (2px for borders, 1px for connections)
- Rounded corners (8px radius) on all containers
- Orthogonal (right-angle) connector lines only
- Arrow heads for directional data flow

## Typography (if labels are generated)
- Sans-serif font family
- Component names: Bold, 14-16px
- Descriptions: Regular, 12px
- High contrast against backgrounds

# COMPOSITION & STRUCTURE

## Layout
- Unified system view with clear visual hierarchy
- Primary/core components centrally positioned
- Sub-components logically arranged around or nested within parents
- Adequate whitespace between components (minimum 20px)

## Standard Symbology
| Element | Symbol |
|---------|--------|
| Database | Cylinder |
| Service/API | Rectangle with rounded corners |
| External Service | Cloud shape |
| User/Actor | Standard user icon |
| Queue/Stream | Parallelogram |
| Cache | Rounded rectangle with stripes |
| Load Balancer | Hexagon or diamond |

## Data Flow
- Use arrows to show direction of data/requests
- Label connections where purpose isn't obvious
- Group related flows visually

# OUTPUT REQUIREMENTS
- Single cohesive diagram combining all input sketches
- High resolution, suitable for documentation
- Clean, professional appearance
- All components from sketches should be represented
`.trim(),
  },

  ANALYZE_COMPONENTS: {
    version: "1.0",
    role: "Senior Software Architect",
    task: "Extract and identify all software components from an architecture diagram.",
    template: `
# ROLE
You are a Senior Software Architect with expertise in system design and architecture patterns.

# TASK
Analyze the provided software architecture diagram and extract all identifiable components.

# ANALYSIS REQUIREMENTS

## Component Identification
For each component in the diagram, identify:
1. **Name**: The label or inferred name of the component
2. **Description**: Brief explanation of the component's likely role and responsibility

## Component Types to Identify
- Frontend applications (web, mobile, desktop)
- Backend services and APIs
- Databases (SQL, NoSQL, cache)
- Message queues and event streams
- External services and integrations
- Load balancers and gateways
- Authentication/Authorization services
- Storage services (file, object, blob)
- CDN and static asset servers
- Monitoring and logging services

## Output Format
Return a JSON array of components, each with:
- \`name\`: Component name (string)
- \`description\`: Role description based on standard architectural patterns (string)

## Guidelines
- Be thorough - identify ALL visible components
- Use standard naming conventions (e.g., "API Gateway", "User Database", "Auth Service")
- Infer purpose from position, connections, and common patterns
- Keep descriptions concise but informative (1-2 sentences)
`.trim(),
  },

  /**
   * Prompt for generating build plan
   * Version: 1.0
   */
  GENERATE_BUILD_PLAN: {
    version: "1.0",
    role: "Principal Software Architect",
    task: "Create a comprehensive implementation plan from architecture diagram and component specifications.",
    template: `
# ROLE
You are a Principal Software Architect with 15+ years of experience building production systems at scale.

# TASK
Create a comprehensive, actionable Implementation Plan based on the provided architecture diagram and component specifications.

# OUTPUT STRUCTURE

The implementation plan MUST follow this exact structure:

## 1. Executive Summary
- Brief overview of the system (2-3 sentences)
- Key architectural decisions
- Primary technology choices

## 2. Technology Stack

### Frontend
- Framework recommendation with justification
- State management approach
- UI component library

### Backend
- Language and framework
- API design approach (REST/GraphQL/gRPC)
- Authentication strategy

### Data Layer
- Database selection with justification
- Caching strategy
- Data modeling approach

### Infrastructure
- Hosting recommendation
- Container/orchestration approach
- CI/CD pipeline

## 3. Component Implementation Details

For EACH component from the specifications:

### [Component Name]
- **Purpose**: One-line description
- **Technology**: Specific frameworks/libraries
- **Key Features**: Bullet list of main functionality
- **Dependencies**: Other components it connects to
- **Implementation Notes**: Critical considerations

## 4. API Design

### Endpoints
List key API endpoints with:
- Method and path
- Purpose
- Request/response format

### Communication Patterns
- Sync vs async decisions
- Event-driven patterns if applicable

## 5. Data Models

### Core Entities
- Key data structures
- Relationships between entities
- Database schema considerations

## 6. Project Structure

\`\`\`
project-root/
├── ... (detailed folder structure)
\`\`\`

## 7. Implementation Roadmap

### Phase 1: Foundation (Week 1-2)
- [ ] Step-by-step tasks

### Phase 2: Core Features (Week 3-4)
- [ ] Step-by-step tasks

### Phase 3: Integration (Week 5-6)
- [ ] Step-by-step tasks

### Phase 4: Polish & Deploy (Week 7-8)
- [ ] Step-by-step tasks

## 8. Security Considerations
- Authentication/authorization approach
- Data protection measures
- API security

## 9. Monitoring & Observability
- Logging strategy
- Metrics to track
- Alerting recommendations

# COMPONENT SPECIFICATIONS
{specs}

# GUIDELINES
- Be specific with technology recommendations (include versions where relevant)
- Provide actionable, copy-paste ready code snippets where helpful
- Consider scalability from the start
- Include error handling and edge cases
- Reference the diagram for architectural decisions
`.trim(),
  },
} as const;


const GENERATION_CONFIG = {
  temperature: 0,
  topP: 1,
  topK: 1,
} as const;



export const refineSketch = async (base64Images: string[]): Promise<string> => {
  const ai = getAiClient();

  // Prepare all images
  const imageParts = base64Images.map(img => ({
    inlineData: {
      mimeType: 'image/png',
      data: img.replace(/^data:image\/\w+;base64,/, "")
    }
  }));

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-image-preview',
      contents: {
        parts: [
          { text: PROMPTS.REFINE_SKETCH.template },
          ...imageParts,
        ],
      },
      config: {
        // Note: Image generation may have limited temperature support
        // but we include it for consistency
        temperature: GENERATION_CONFIG.temperature,
        imageConfig: {
          aspectRatio: "16:9",
          imageSize: "2K",
        },
      },
    });

    // Extract the generated image
    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData && part.inlineData.data) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }

    throw new Error("No image generated by the model.");
  } catch (error) {
    console.error("Refinement error:", error);
    throw error;
  }
};

/**
 * Analyzes the refined diagram to extract component specifications using 'gemini-3-pro-preview'.
 */
export const analyzeDiagramComponents = async (base64Image: string): Promise<ComponentSpec[]> => {
  const ai = getAiClient();
  const base64Data = base64Image.replace(/^data:image\/\w+;base64,/, "");

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: {
        parts: [
          { text: PROMPTS.ANALYZE_COMPONENTS.template },
          {
            inlineData: {
              mimeType: 'image/png',
              data: base64Data,
            },
          },
        ],
      },
      config: {
        temperature: GENERATION_CONFIG.temperature,
        topP: GENERATION_CONFIG.topP,
        topK: GENERATION_CONFIG.topK,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              description: { type: Type.STRING },
            },
            required: ["name", "description"],
          },
        },
      },
    });

    const text = response.text;
    if (!text) throw new Error("No text response from model");

    const rawComponents = JSON.parse(text);

    // Map to our internal type with IDs
    return rawComponents.map((c: any, index: number) => ({
      id: `comp-${index}-${Date.now()}`,
      name: c.name,
      description: c.description,
      userNotes: "", // Initialized empty for user input
    }));

  } catch (error) {
    console.error("Analysis error:", error);
    throw error;
  }
};

/**
 * Generates the final build plan using 'gemini-3-pro-preview'.
 */
export const generateBuildPlan = async (
  refinedDiagramBase64: string,
  specs: ComponentSpec[]
): Promise<string> => {
  const ai = getAiClient();
  const base64Data = refinedDiagramBase64.replace(/^data:image\/\w+;base64,/, "");

  // Format component specifications
  const specsText = specs.map(s =>
    `### ${s.name}\n- **Inferred Role**: ${s.description}\n- **User Requirements**: ${s.userNotes || "None provided"}`
  ).join("\n\n");

  // Build the prompt with specifications injected
  const prompt = PROMPTS.GENERATE_BUILD_PLAN.template.replace("{specs}", specsText);

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: {
        parts: [
          { text: prompt },
          {
            inlineData: {
              mimeType: 'image/png',
              data: base64Data,
            },
          },
        ],
      },
      config: {
        temperature: GENERATION_CONFIG.temperature,
        topP: GENERATION_CONFIG.topP,
        topK: GENERATION_CONFIG.topK,
      },
    });

    return response.text || "Failed to generate plan.";
  } catch (error) {
    console.error("Build Plan error:", error);
    throw error;
  }
};

export const processVersionInBackground = async (
  images: string[],
  onProgress: (status: 'refining' | 'specifying' | 'complete') => void
): Promise<{ refinedImage: string; specs: ComponentSpec[] }> => {
  // Filter out null/empty images
  const validImages = images.filter(Boolean);

  if (validImages.length === 0) {
    throw new Error("No valid images to process");
  }

  // Step 1: Refine the sketches
  onProgress('refining');
  const refinedImage = await refineSketch(validImages);

  // Step 2: Analyze components from the refined image
  onProgress('specifying');
  const specs = await analyzeDiagramComponents(refinedImage);

  // Done
  onProgress('complete');
  return { refinedImage, specs };
};


export const getPromptVersions = () => ({
  refineSketch: PROMPTS.REFINE_SKETCH.version,
  analyzeComponents: PROMPTS.ANALYZE_COMPONENTS.version,
  generateBuildPlan: PROMPTS.GENERATE_BUILD_PLAN.version,
});
