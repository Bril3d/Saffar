// ============================================
// SAFAR Chain — Ollama LLM Client
// Graceful fallback when Ollama is offline
// Prompt injection protection
// ============================================
const axios = require('axios');
const fs = require('fs');
const path = require('path');

const OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'phi3:mini';
const OLLAMA_TIMEOUT = parseInt(process.env.OLLAMA_TIMEOUT) || 120000;

// Load prompt templates
const PROMPTS_DIR = path.join(__dirname, 'prompts');

function loadPrompt(name) {
    const filePath = path.join(PROMPTS_DIR, `${name}.txt`);
    try {
        return fs.readFileSync(filePath, 'utf-8');
    } catch {
        console.warn(`[OLLAMA] Prompt template not found: ${name}`);
        return '';
    }
}

/**
 * Sanitize user input to prevent prompt injection
 */
function sanitizeInput(input) {
    if (typeof input !== 'string') return '';
    return input
        .replace(/```/g, '')           // No code blocks
        .replace(/\[INST\]/gi, '')     // No instruction markers
        .replace(/\[\/INST\]/gi, '')
        .replace(/<<SYS>>/gi, '')      // No system markers
        .replace(/<<\/SYS>>/gi, '')
        .replace(/<\|.*?\|>/g, '')     // No special tokens
        .replace(/system:/gi, '')
        .replace(/assistant:/gi, '')
        .replace(/user:/gi, '')
        .trim()
        .slice(0, 2000);              // Max 2000 chars
}

/**
 * Call Ollama API for text generation
 */
async function generate(systemPrompt, userMessage, options = {}) {
    try {
        const response = await axios.post(`${OLLAMA_URL}/api/generate`, {
            model: options.model || OLLAMA_MODEL,
            prompt: userMessage,
            system: systemPrompt,
            stream: false,
            options: {
                temperature: options.temperature || 0.7,
                top_p: options.top_p || 0.9,
                num_predict: options.maxTokens || 500
            }
        }, {
            timeout: OLLAMA_TIMEOUT
        });

        return {
            text: response.data.response,
            model: response.data.model,
            totalDuration: response.data.total_duration
        };
    } catch (err) {
        if (err.code === 'ECONNREFUSED' || err.code === 'ENOTFOUND') {
            throw Object.assign(new Error('AI service temporarily unavailable'), { statusCode: 503 });
        }
        if (err.code === 'ECONNABORTED' || err.message?.includes('timeout')) {
            throw Object.assign(new Error('AI request timed out'), { statusCode: 504 });
        }
        throw err;
    }
}

/**
 * Check if Ollama is running
 */
async function isAvailable() {
    try {
        await axios.get(`${OLLAMA_URL}/api/tags`, { timeout: 3000 });
        return true;
    } catch {
        return false;
    }
}

module.exports = { generate, sanitizeInput, loadPrompt, isAvailable };
