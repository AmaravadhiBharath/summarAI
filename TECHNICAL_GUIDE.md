# SummarAI - Technical Overview & Architecture Guide

**Version:** 1.0.7  
**Author:** Bharath Amaravadhi  
**Contact:** amaravadhibharath@gmail.com  

---

## 1. Executive Summary

SummarAI is a next-generation browser extension designed to consolidate and summarize complex context from various AI chat platforms (ChatGPT, Gemini, Claude) and general web content. It leverages a hybrid AI architecture to provide accurate, context-aware summaries that help users retain key information without re-reading lengthy conversations.

This document provides a high-level technical overview of the system's architecture, integrations, and operational flow, intended for technical stakeholders and maintenance understanding.

## 2. System Architecture

The system operates on a **Client-Serverless** architecture, ensuring high scalability, low latency, and reduced operational overhead.

### 2.1 High-Level Flow
1.  **Client (Browser Extension):** Captures content from the active tab using dynamic, platform-specific selectors.
2.  **API Gateway (Cloudflare Workers):** Receives the content, handles authentication, and enforces rate limits.
3.  **Intelligence Engine:** Routes the request to the optimal AI model based on content size and complexity.
4.  **Response:** Returns a structured, consolidated summary to the user.

### 2.2 Core Components

#### A. Frontend (Chrome Extension)
-   **Framework:** Built with **React** and **Vite** for a modern, reactive user interface.
-   **Styling:** Uses **Tailwind CSS** for a responsive, premium design aesthetic.
-   **State Management:** Implements **Manifest V3** compliant service workers and storage patterns.
-   **Content Extraction:** Utilizes a proprietary DOM traversal engine that adapts to updates in third-party platforms (ChatGPT, Claude, etc.) without requiring extension updates.

#### B. Backend (Serverless Edge)
-   **Runtime:** **Cloudflare Workers** (Edge Computing).
-   **Function:** Handles business logic, API orchestration, and security headers (CORS).
-   **Storage:** **Cloudflare KV** is used for high-speed, low-latency user quota tracking and session management.

## 3. Key Integrations & Technology Stack

The platform integrates best-in-class services to deliver a seamless experience:

| Category | Technology / Service | Purpose |
| :--- | :--- | :--- |
| **Cloud Infrastructure** | **Cloudflare Workers** | Serverless backend logic and API hosting. |
| **Database** | **Cloudflare KV** | Ephemeral storage for rate limiting and quotas. |
| **AI / LLM** | **Google Gemini 2.0 Flash** | Handling large-context queries (>50k chars) and multimodal inputs. |
| **AI / LLM** | **OpenAI (GPT-4o-mini)** | High-speed processing for standard queries. |
| **Payments** | **Dodo Payments** | Secure payment processing for Premium subscriptions. |
| **Authentication** | **Google OAuth 2.0** | Secure user sign-in and identity verification. |
| **Email Infrastructure** | **Resend API** | Transactional emails (Welcome, Receipts). |
| **Analytics/Sync** | **Google Sheets Webhook** | Real-time user registration tracking. |

## 4. The "Context Consolidation" Engine

At the heart of SummarAI is a specialized processing pipeline designed to understand *intent* rather than just compressing text.

-   **Smart Routing:** The backend dynamically selects the most cost-effective and capable model based on the input length and complexity.
-   **Sanitization:** Raw HTML and chat logs are cleaned to remove UI noise (timestamps, avatars) before processing.
-   **Structured Output:** The engine can generate summaries in multiple formats (Paragraph, Bullet Points, JSON, XML) strictly adhering to defined schemas.

## 5. Security & Compliance

-   **Data Privacy:** User content is processed in-memory and is not persistently stored on our servers.
-   **Rate Limiting:** A robust quota system (Guest vs. Free vs. Pro) prevents abuse and manages API costs.
-   **Standard:** Fully compliant with Chrome Web Store **Manifest V3** security requirements.

---

**Confidentiality Notice:**  
This document contains proprietary information regarding the architecture of SummarAI. Unauthorized copying, reverse engineering, or distribution of the system's core logic is strictly prohibited.

**© 2025 Bharath Amaravadhi**
