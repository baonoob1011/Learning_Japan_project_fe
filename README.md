# Learning Japan Project

A frontend application designed to facilitate Japanese language learning. Built with Next.js, it provides users with interactive study materials, progress tracking, and communication tools.

## Live Demo
Deployment link will be added soon.

## Overview
- Offers structured study materials including vocabulary, kanji, and video lessons.
- Includes examination modules and learning progress tracking.
- Provides communication features such as real-time chat and video calling for student collaboration.
- Features an administrative dashboard for content and user management.

## Key Features
- **Authentication & User Profiles:** Secure login, registration, and personalized profile management.
- **Interactive Study Modules:** Dedicated sections for practicing vocabulary and kanji.
- **Video Integration:** Incorporates YouTube videos with synchronized transcripts for contextual learning.
- **Real-Time Communication:** Built-in chat and video call interfaces for interactive practice.
- **Assessments & Progress:** Examination flows with result tracking to monitor learning milestones.
- **Admin Dashboard:** Centralized interface for managing courses, content, and system data.

## Tech Stack

| Category | Technologies |
|---|---|
| Framework | Next.js (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| State Management | Zustand |
| Real-time | `@stomp/stompjs`, `sockjs-client` |
| Video Processing | `react-youtube`, `youtube-transcript`, `ytdl-core` |
| UI/UX Tooling | Framer Motion, Lucide React, Recharts |

## Project Structure

```text
src/
  app/
    admin/           # Administrative dashboard pages
    chat/            # Real-time messaging interface
    exam/            # Examination and assessment flows
    kanji/           # Kanji study modules
    video/           # Video lesson integration
    vocabulary/      # Vocabulary practice modules
    ...
  components/        # Reusable UI components
  hooks/             # Custom React hooks
  lib/               # Utility functions and shared logic
  services/          # API integration and external calls
  stores/            # Zustand global state management
  types/             # TypeScript interfaces and enums
public/              # Static assets
```

## Running Locally

### Prerequisites
- Node.js (v20 or higher recommended)
- npm, yarn, or pnpm

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   ```

2. Navigate to the project directory and install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables:
   Copy the example environment file or create a `.env.local` file with the required API endpoints and configuration keys.

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser to view the application.

<!-- Placeholder: Add screenshots or GIFs of the application interface here to showcase the UI -->
