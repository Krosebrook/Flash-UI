# Flash UI Component Documentation

Flash UI is a high-performance generative interface builder powered by Gemini.

## Core Features

### 1. Multi-Library Generation
Choose between three code-generation modes and one asset-generation mode:
- **F (Vanilla)**: Standard HTML/CSS with modern layouts (Flexbox/Grid).
- **M (Material UI)**: Production-ready React components using MUI v5.
- **C (Chakra UI)**: Accessible and themeable React components.
- **I (AI Image)**: High-fidelity visual asset generation (720p to 1K resolution).

### 2. Design Variations Engine
The Variations engine allows you to iterate on a concept without losing your progress:
- **Radical Conceptualization**: Gemini generates three distinct design archetypes (e.g., Brutalist vs. Glassmorphic) for your prompt.
- **Aesthetic Steering**: Add keywords like "Neo-Retro," "Bento Grid," or "Cyberpunk" to steer the variations towards a specific look.

### 3. Artifact Management
- **Streaming Previews**: Watch code being written in real-time.
- **Focus Mode**: Click any artifact to see it full-screen and access the Variations and Source Code tools.
- **Retry Logic**: If a generation fails or is blocked by safety filters, use the "Regenerate" button to re-trigger the engine with adjusted parameters.

---

## Technical Appendix: Component Docs

### ArtifactCard
Manages the lifecycle of a design result.
- **Iframe Sandboxing**: Ensures generated code cannot interfere with the main app's DOM or styles.
- **Automatic Code Streaming**: Proxies the model's text output into a syntax-highlighted terminal overlay.

### SideDrawer
Used for high-density tools:
- **Code Mode**: Raw source code with one-click copy.
- **Variations Mode**: Live design playground to swap archetypes.

### DottedGlowBackground
A high-performance HTML5 Canvas background.
- **DPI Aware**: Automatically scales for Retina displays.
- **Physics Sim**: Dots pulse based on an internal clock, creating a living "AI heartbeat" atmosphere.

---

## Troubleshooting: "Generators Not Producing"
If you find the output quality is not meeting expectations:
1. **Be Specific**: Instead of "Make a button," try "Generate a high-contrast 'Purchase' button with a glowing border and a hover animation using CSS transitions."
2. **Steer the Aesthetics**: Use the Variations tool and input keywords like "Industrial Minimalist" or "Modern SaaS Dashboard."
3. **HQ Mode (Images)**: For Image generation, ensure HQ is enabled to use the Pro model for sharper details.
4. **Safety Blocks**: If you see a "Safety Filter" error, try rephrasing technical terms that might be misinterpreted by the model's filters.