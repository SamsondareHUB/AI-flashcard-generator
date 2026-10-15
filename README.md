# AI Flashcard Generator

A simple JavaScript + Node.js web application that generates beginner-friendly
flashcards from any topic using the Google Gemini API.

## Features

- Enter any study topic
- Generate five flashcards
- Reveal answers interactively
- Automatic retries when the AI service is temporarily busy

## Tech stack

- HTML, CSS, JavaScript
- Node.js
- Express
- Google Gemini API

## How to run locally

1. Install dependencies:

```bash
npm install
```

2. Create a `.env` file:

```env
GEMINI_API_KEY=your_api_key_here
```

3. Start the server:

```bash
node server.js
```

4. Open:

```text
http://localhost:3000
```