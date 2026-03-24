# 100% Free-Tier Version

This application has been optimized to run entirely on free-tier resources.

## Modifications for Free Tier Compatibility:

- **Gemini API (AI Features):** 
  - Real-time calls to Gemini AI models have been disabled to avoid paid API costs and quota limits.
  - The `translateText` and `textToSpeech` functions in `src/lib/gemini.ts` now use mock responses and local logic.
  - This ensures the app remains functional for demonstration purposes without requiring a linked billing account or a paid API key.

- **External APIs:**
  - Any potentially paid external API calls have been replaced with static sample data or local logic.

- **Hosting Optimization:**
  - The project is configured for easy deployment on free hosting platforms like Netlify or Vercel.
  - No server-side cloud functions requiring billing are used.

## Deployment:

You can deploy this app directly to Vercel or Netlify by connecting your GitHub repository. The app will work out-of-the-box without any additional configuration for paid services.

---
*Note: This version is intended for demonstration and development purposes where zero-cost operation is a priority.*
