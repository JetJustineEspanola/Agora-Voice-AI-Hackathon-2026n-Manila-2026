# Basic Sign Language Voice Bridge

Agora Voice AI Hackathon Manila 2026 — Team ByteScouts (Group B)

## Problem

People who use basic sign language often need an immediate way to “speak” urgent needs (HELP, PAIN, WATER, BATHROOM, FIRE) in environments where others may not understand signing.

## Solution

This project uses a webcam to recognize 5 basic sign gestures and converts them into real-time voice output using **Agora Conversational AI** (agent TTS broadcast into an Agora RTC channel).

## Features (Hackathon MVP)

- Webcam feed + basic hand landmark extraction (MediaPipe Hands)
- Basic sign classification (placeholder rule-based classifier; easy to swap with TFJS model)
- Real-time voice output via Agora Conversational AI “speak” API
- On-screen status: detected sign + confidence
- Manual “simulate sign” buttons for reliable demos

## Repo Structure (Submission Compliance)

This submission follows the required format under this team folder:

- Deck & Demo/ — slides, screenshots, demo video
- TRAE_Usage/ — Trae AI logs / scaffolding notes
- Source Code/ — all runnable code (frontend + backend)

## Quick Start

### 1) Prereqs

- Node.js 18+ (recommended)
- An Agora project (App ID + App Certificate)
- Agora REST credentials (Customer ID + Customer Secret) OR use token auth for ConvoAI (see backend `.env.example`)

### 2) Install

```bash
cd "submissions/Group B/ByteScouts/Source Code"
npm install
```

### 3) Configure env

Copy the example env and fill in values. The backend requires Agora credentials, ConvoAI REST API credentials, and vendor keys for the AI agent (OpenAI + Azure TTS):

```bash
cd "submissions/Group B/ByteScouts/Source Code"
copy .env.example .env
```

**Required `.env` values:**
- `AGORA_APP_ID` & `AGORA_APP_CERTIFICATE`: For RTC/RTM token generation.
- `AGORA_CUSTOMER_ID` & `AGORA_CUSTOMER_SECRET`: For ConvoAI REST API Basic Auth (find in Agora Console -> RESTful API).
- `OPENAI_API_KEY`: Required by ConvoAI for the LLM.
- `AZURE_SPEECH_KEY` & `AZURE_SPEECH_REGION`: Required by ConvoAI for Microsoft TTS (e.g., `eastus`).

### 4) Run

Terminal A (backend):

```bash
cd "submissions/Group B/ByteScouts/Source Code"
npm run dev:backend
```

Terminal B (frontend):

```bash
cd "submissions/Group B/ByteScouts/Source Code"
npm run dev:frontend
```

Open the frontend URL shown in the terminal (typically `http://localhost:5173`).

## Demo Flow

1. Start backend + frontend
2. Click “Start Voice Session” (creates ConvoAI agent + joins RTC/RTM)
3. Show hand signs in front of the camera OR use the simulate buttons
4. Click “Speak Detected Sign” (agent broadcasts TTS into channel)

## What’s Implemented vs Placeholder

- Implemented:
  - Project scaffolding (React + Tailwind + Express)
  - Agora token generation (RTC+RTM)
  - ConvoAI REST calls: join + speak (Basic Auth by default)
  - UI wiring for “simulate sign” + “speak” demo
- Placeholder:
  - Robust sign classification model (currently rule-based stub)
  - Dataset/training pipeline (folders are included for quick expansion)

## Links

- Demo video / slides: `Deck & Demo/`
- Trae AI notes: `TRAE_Usage/`
