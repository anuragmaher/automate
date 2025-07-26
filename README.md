# Serverless API

A simple serverless API built with JavaScript for Vercel deployment.

## Project Structure

```
/
├── api/
│   └── hello.js     # Hello world API endpoint
├── package.json     # Project configuration
└── vercel.json      # Vercel deployment configuration
```

## API Endpoints

- `/api/hello` - Returns a simple Hello World JSON message

## Local Development

To test this API locally, install the Vercel CLI:

```bash
npm i -g vercel
```

Then run:

```bash
vercel dev
```

Your API will be available at `http://localhost:3000/api/hello`

## Deployment

To deploy to Vercel:

```bash
vercel
```

Follow the prompts to link your project to a Vercel account. Once deployed, your API will be available at the provided URL.
