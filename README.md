# 🎌 Advanced Japanese Learning Platform

[![Next.js](https://img.shields.io/badge/Next.js-14+-black?style=flat&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.0-38B2AC?style=flat&logo=tailwind-css)](https://tailwindcss.com/)
[![Zustand](https://img.shields.io/badge/Zustand-State_Management-brown?style=flat)](https://zustand-demo.pmnd.rs/)

An immersive, full-featured Japanese learning ecosystem designed to provide interactive education through multimedia, real-time communication, and AI. Built with a focus on performance, scalable architecture, and modern UX/UI principles.

## 🌟 Highlighted Features

| Icon | Feature | Description | Libraries |
| :---: | :--- | :--- | :--- |
| 🎬 | **Immersive Video Learning** | Integrates YouTube videos with synchronized, segmented transcripts for contextual language acquisition. | `react-youtube`, `ytdl-core`, `youtube-transcript`, `tiny-segmenter` |
| ⚡ | **Real-Time Collaboration** | Low-latency bidirectional communication powering live messaging and video calling. | `@stomp/stompjs`, `sockjs-client` |
| 🧠 | **AI-Powered Assistance** | Intelligent tutoring, automated feedback, and contextual translations. | `openai` |
| 📊 | **Dynamic Progress Tracking** | Processes and visualizes complex user learning data and statistics into interactive charts. | `recharts` |
| 🏛️ | **Scalable Architecture** | Utilizes Next.js App Router, global state management, and a highly modular component design pattern. | Next.js, `zustand` |
| ✨ | **Premium UX/UI** | Delivers a fluid, responsive interface with smooth micro-interactions. | Tailwind CSS, `framer-motion` |

## 🛠️ Technical Stack

| Category | Technologies |
| :--- | :--- |
| **Core** | Next.js (App Router), React 19, TypeScript |
| **Styling & Design System** | Tailwind CSS v4, Framer Motion (Animations), Lucide React (Icons) |
| **State Management** | Zustand |
| **Real-time Communication**| WebSockets (STOMP protocol) |
| **Data Visualization** | Recharts |
| **Authentication & Security**| JWT decoding and secure Next.js route middleware |

## 🚀 Getting Started

**Prerequisites:** Node.js (v20+ recommended)

| Step | Action | Command / Note |
| :---: | :--- | :--- |
| **1** | **Clone the repository** | `git clone <repository-url>` |
| **2** | **Install dependencies** | `npm install` |
| **3** | **Configure Environment**| Create a `.env.local` file with necessary API keys (OpenAI, Backend APIs, STOMP server URLs, etc.) |
| **4** | **Run development server**| `npm run dev` |

## 📁 Architecture

| Directory | Purpose |
| :--- | :--- |
| `src/app/` | Next.js App Router pages including dedicated modules for `/video`, `/chat`, `/exam`, `/kanji`, and `/admin`. |
| `src/components/` | Reusable, loosely-coupled UI components. |
| `src/stores/` | Global Zustand stores managing complex application state. |
| `src/services/` | API integration layer handling all external communication (Axios configurations). |
| `src/hooks/` | Custom React hooks encapsulating reusable frontend business logic. |
| `src/types/` & `src/enums/` | Strict TypeScript definitions ensuring type safety and reducing runtime errors. |
