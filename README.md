🎌 Advanced Japanese Learning Platform
Next.jsTypeScriptTailwind CSSZustand

An immersive, full-featured Japanese learning ecosystem designed to provide interactive education through multimedia, real-time communication, and AI. Built with a focus on performance, scalable architecture, and modern UX/UI principles.

🌟 Highlighted Engineering Features (Why this project stands out)
This project goes beyond simple CRUD operations and demonstrates the ability to solve complex frontend engineering challenges:

🎬 Immersive Video Learning Engine: Seamlessly integrates YouTube APIs (react-youtube, ytdl-core) with synchronized, segmented transcripts (youtube-transcript, tiny-segmenter) for contextual language acquisition.
⚡ Real-Time Collaboration: Implemented low-latency bidirectional communication using WebSockets (@stomp/stompjs, sockjs-client) to power live messaging and video calling, simulating a virtual classroom environment.
🧠 AI-Powered Assistance: Leverages the OpenAI API to provide intelligent tutoring, automated feedback, and contextual translations, showcasing the ability to work with modern LLM integrations.
📊 Dynamic Progress Tracking: Processes and visualizes complex user learning data and statistics into beautiful, interactive charts using Recharts.
🏛️ Scalable Architecture: Strictly utilizes the Next.js App Router paradigm, robust global state management with Zustand, and a highly modular component design pattern.
✨ Premium UX/UI & Accessibility: Delivers a fluid, responsive interface using Tailwind CSS and Framer Motion for micro-interactions, ensuring a high-retention user experience.
🛠️ Technical Stack
Core: Next.js (App Router), React 19, TypeScript
Styling & Design System: Tailwind CSS v4, Framer Motion (Animations), Lucide React (Icons)
State Management: Zustand (Chosen for its minimal boilerplate and scalability)
Real-time Communication: WebSockets (STOMP protocol)
Data Visualization: Recharts
Authentication & Security: JWT decoding and secure Next.js route middleware.
🚀 Getting Started
Prerequisites
Node.js (v20+ recommended)
Installation
Clone the repository:

bash

git clone <repository-url>
Install dependencies:

bash

npm install
Configure Environment Variables (create a .env.local file): (Requires necessary API keys like OpenAI, Backend API endpoints, STOMP server URLs, etc.)

Run the development server:

bash

npm run dev
📁 Project Architecture
The application follows a modular, scalable directory structure:

src/app/: Next.js App Router pages including dedicated modules for /video, /chat, /exam, /kanji, and a comprehensive /admin dashboard.
src/components/: Reusable, loosely-coupled UI components.
src/stores/: Global Zustand stores managing complex application state.
src/services/: API integration layer handling all external communication (Axios configurations).
src/hooks/: Custom React hooks encapsulating reusable frontend business logic.
src/types/ & src/enums/: Strict TypeScript definitions ensuring type safety and reducing runtime errors.
