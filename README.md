# Shishir Bhattarai — GPT-Powered Cybersecurity Portfolio

This repository contains a cybersecurity portfolio plus a recruiter-facing
"Ask Shishir AI" assistant powered securely through the OpenAI API.

## Architecture

Browser / portfolio
        |
        v
POST /api/chat
        |
        v
Vercel serverless function
        |
        v
OpenAI Responses API (GPT-5.6 Sol)

The API key exists only in Vercel's environment variables. It is NEVER exposed
in index.html or script.js.

## 1. Put these files in GitHub

Upload all files in this package to your repository:

https://github.com/f1amer/web

Important files:

- index.html
- style.css
- script.js
- api/chat.js
- package.json
- vercel.json
- assets/Shishir_Bhattarai_RangeForce_Certificate.pdf
- .gitignore

Do NOT upload a real `.env` file or your API key.

## 2. Create an OpenAI API key

Use your OpenAI Platform account to create an API key.

Keep the key private. Never paste it into GitHub, HTML, CSS or client-side JS.

## 3. Connect GitHub to Vercel

1. Sign in to Vercel.
2. Choose Add New > Project.
3. Choose Continue with GitHub if needed.
4. Authorize Vercel to access your GitHub account.
5. Import the `f1amer/web` repository.
6. Keep the project framework as Other / static if Vercel detects it that way.
7. Deploy.

Vercel will host the static portfolio and the `/api/chat` serverless function
from the same repository.

## 4. Add the OpenAI API key in Vercel

In the Vercel project:

Settings > Environment Variables

Add:

OPENAI_API_KEY = your real OpenAI API key
OPENAI_MODEL = gpt-5.6-sol

Apply it to Production (and Preview if you want testing there).

Then redeploy the project.

## 5. Test the assistant

Open the deployed Vercel URL and click:

ASK SHISHIR AI

Try:
- What cybersecurity skills does Shishir have?
- Tell me about his RangeForce training.
- Is Shishir suitable for a junior SOC analyst role?
- What vulnerabilities has he studied?
- What is his education background?

## 6. Resume

Place the current resume at:

assets/Shishir_Bhattarai_Resume.pdf

## Cost option

GPT-5.6 Sol is configured because the goal was to use the same flagship model
family as this assistant. For a public portfolio with higher visitor traffic,
you can reduce API cost by changing:

OPENAI_MODEL=gpt-5.6-luna

in Vercel without changing your code.

## Security

- Never expose OPENAI_API_KEY in script.js.
- Never commit `.env` or `.env.local`.
- Consider adding rate limiting before promoting the site heavily.
- The server prompt tells the AI not to invent qualifications or confuse cyber
  labs with commercial security experience.
