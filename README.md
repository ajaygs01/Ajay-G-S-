# 🚀 SkillChain – AI-Powered Resume Verification System

SkillChain is an *AI-driven resume verification system* that automatically validates a candidate’s *skills, certificates, education, and employment history* using *Machine Learning, NLP, and (future) Blockchain integration*.

This repository currently contains the *frontend app, built with **TypeScript + React + Vite, configured to talk to a Gemini-powered backend via the **Google AI Studio* setup.

---

## 🧩 What This App Does (Current Version)

- Provides a *web UI* for the SkillChain concept.
- Connects to a *Gemini API key* (via GEMINI_API_KEY) to power AI features.
- Acts as the *client* for:
  - Resume input / interaction  
  - Displaying AI responses / verification information  
- Serves as the starting point for a full *AI + Blockchain resume verification platform*.

> The repo was generated from google-gemini/aistudio-repository-template, then adapted for SkillChain. :contentReference[oaicite:1]{index=1}

---

## 🧠 Vision / Concept

SkillChain aims to:

- Parse resumes using *NLP*  
- Validate skills, projects, and experience using *AI models*  
- Authenticate certificates (via *OCR + metadata checks*)  
- Store verified credentials on *Blockchain* for tamper-proof proof of skills  
- Provide *recruiters* with:
  - A *trust score* for each candidate  
  - A *verification report* of claims  

The current repo is the *frontend foundation* for this system.

---

## 🛠 Tech Stack

- *Language*: TypeScript  
- *Framework*: React  
- *Build Tool*: Vite  
- *Runtime*: Node.js (for local dev tooling)  
- *AI Integration*: Gemini API (via GEMINI_API_KEY)  

You can see from GitHub that the codebase is almost entirely *TypeScript + HTML*. :contentReference[oaicite:2]{index=2}  

---

## 📁 Project Structure

At the root of the repo:

```bash
SkillChain-Ai-powered-resume-verification-system/
│
├── components/        # Reusable React components
├── services/          # API / helper services (Gemini, etc.)
├── App.tsx            # Root React component
├── index.tsx          # App entry point (React + Vite)
├── index.html         # Base HTML template
├── types.ts           # Shared TypeScript types/interfaces
├── vite.config.ts     # Vite configuration
├── metadata.json      # AI Studio / template metadata
├── package.json       # Project dependencies & scripts
├── tsconfig.json      # TypeScript configuration
└── README.md          # Project documentation (this file)
