# API Documentation

This document describes how to use the serverless API with OpenAI integration and simple API key authentication.

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Configure environment variables by editing the `.env` file:
   ```
   OPENAI_API_KEY=your_openai_api_key_here
   API_KEY=your_api_key_here
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

## Authentication

All endpoints are protected with simple API key authentication. Include your API key in the `x-api-key` header for all requests:

```bash
curl -X POST http://localhost:3000/api/llm/completion \
  -H "x-api-key: YOUR_API_KEY_HERE" \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Write a poem about coding"}'
```

## API Endpoints

### Core Endpoints

- `GET /api` - API information and available endpoints
- `GET /api/health` - Health check endpoint

### LLM Endpoints

- `POST /api/llm/completion` - Generate a completion from a prompt (API key auth)
- `POST /api/llm/chat` - Generate a chat completion from messages array (API key auth)
- `POST /api/llm/simple-prompt` - Generate a completion with simpler interface (API key auth)

## Request Examples

### Text Completion

```bash
curl -X POST http://localhost:3000/api/llm/completion \
  -H "x-api-key: YOUR_API_KEY_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Write a poem about coding",
    "temperature": 0.7,
    "maxTokens": 100
  }'
```

### Chat Completion

```bash
curl -X POST http://localhost:3000/api/llm/chat \
  -H "x-api-key: YOUR_API_KEY_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      {"role": "system", "content": "You are a helpful assistant."},
      {"role": "user", "content": "What is the capital of France?"}
    ],
    "model": "gpt-3.5-turbo",
    "temperature": 0.7
  }'
```

### Simple Prompt

```bash
curl -X POST http://localhost:3000/api/llm/simple-prompt \
  -H "x-api-key: YOUR_API_KEY_HERE" \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Explain quantum computing in simple terms."}'
```

## Deployment to Vercel

1. Make sure the Vercel CLI is installed:
   ```bash
   npm i -g vercel
   ```

2. Deploy to Vercel:
   ```bash
   vercel
   ```

3. To deploy to production:
   ```bash
   npm run deploy
   ```

**Important**: When deploying to Vercel, make sure to set the environment variables (OPENAI_API_KEY and API_KEY) in the Vercel dashboard or using the Vercel CLI.
