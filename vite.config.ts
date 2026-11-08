import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, Plugin } from 'vite';
import { GoogleGenAI } from '@google/genai';

function jarvisApiPlugin(): Plugin {
  return {
    name: 'jarvis-api-plugin',
    configureServer(server) {
      server.middlewares.use('/api/jarvis', async (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405;
          res.end(JSON.stringify({ error: 'Method not allowed' }));
          return;
        }

        let body = '';
        req.on('data', (chunk) => {
          body += chunk;
        });

        req.on('end', async () => {
          res.setHeader('Content-Type', 'application/json');
          try {
            const parsed = JSON.parse(body || '{}');
            const prompt = parsed.prompt || '';
            const apiKey = process.env.GEMINI_API_KEY;

            if (!apiKey) {
              res.statusCode = 200;
              res.end(JSON.stringify({
                action: 'chat',
                parameters: {},
                response: '📊 **[JARVIS CORE - AUTONOMOUS MODE]**\n🔹 **Status:** Server API Key is not set in environment.\n🔹 **Note:** Local heuristic engine and manual API key mode remain fully active, Sir.'
              }));
              return;
            }

            const ai = new GoogleGenAI({
              apiKey,
              httpOptions: {
                headers: {
                  'User-Agent': 'aistudio-build',
                },
              },
            });

            const systemPrompt = `You are JARVIS, an ultra-advanced AI assistant created by Adil.
Tone: Highly intelligent, efficient, loyal, polite (address user as "Sir" or "Boss").
Language: Always respond in the EXACT language used by the user (Hindi, English, Hinglish).
Format: Format the output nicely with emojis and bold markdown headers.`;

            const response = await ai.models.generateContent({
              model: 'gemini-3.8-flash',
              contents: prompt,
              config: {
                systemInstruction: systemPrompt,
              },
            });

            const text = response.text || '';
            res.statusCode = 200;
            res.end(JSON.stringify({
              action: 'chat',
              parameters: {},
              response: text,
            }));
          } catch (err: any) {
            console.error('API Error in /api/jarvis:', err);
            res.statusCode = 500;
            res.end(JSON.stringify({
              error: err?.message || 'Internal server error',
            }));
          }
        });
      });
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), jarvisApiPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});

