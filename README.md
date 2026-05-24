# WorkNoon Chat Frontend

Real-time chat system frontend for eCommerce platforms. Enables communication between buyers, merchants, designers, and customer support agents.

## Features

- User Authentication (Login/Register)
- Real-time messaging with Pusher
- Typing indicators
- Online/offline status
- Read receipts
- File and image uploads
- Dark/Light mode (Dribbble-inspired UI)
- Responsive design
- Admin dashboard
- Push notifications
- Offline fallback

## Tech Stack

- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Real-time**: Pusher-js
- **HTTP Client**: Axios
- **Routing**: React Router v6
- **Icons**: Lucide React
- **Notifications**: React Hot Toast
- **Date Handling**: date-fns

## Prerequisites

- Node.js 18+
- Running backend API (worknoon-chat-backend)

## Setup

1. Clone the repository:
```bash
git clone https://github.com/RightFix/worknoon-chat-frontend.git
cd worknoon-chat-frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```bash
cp .env.example .env
```

4. Configure environment variables in `.env`:
```env
# API URL (your Vercel backend URL)
VITE_API_URL=https://your-backend.vercel.app

```

5. Start the development server:
```bash
npm run dev
```

The app will be available at `http://localhost:3000`

## Deployment (Vercel)

This frontend is designed to deploy to Vercel:

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Deploy:
```bash
vercel
```

Or connect your GitHub repository to Vercel for automatic deployments.

## Pages

| Route | Description |
|-------|-------------|
| `/login` | Login page |
| `/register` | Registration page |
| `/` | Inbox/Conversation list |
| `/chat/:conversationId` | Chat view |
| `/profile` | User profile settings |
| `/admin` | Admin dashboard |

## User Roles

| Role | Access |
|------|--------|
| `admin` | Full admin dashboard, user management |
| `agent` | Chat with customers |
| `customer` | Chat with agents, merchants, designers |
| `designer` | Chat with customers |
| `merchant` | Chat with customers |

## UI/UX Design

The design is inspired by modern chat applications on Dribbble:

- **Color Palette**: Indigo primary (#6366F1), Purple secondary (#8B5CF6)
- **Typography**: Inter font family
- **Dark Mode**: Full dark theme support with proper contrast
- **Animations**: Smooth fade-in and slide-in animations
- **Responsive**: Mobile-first design with breakpoints

### Color Scheme

```
Light Mode:
- Background: #F7F8FC
- Card: #FFFFFF
- Primary: #6366F1

Dark Mode:
- Background: #1A1D21
- Card: #2D3136
- Primary: #818CF8
```

## Challenges & Solutions

### Offline Support
**Challenge**: Users may lose internet connectivity while sending messages.

**Solution**: Implemented optimistic UI updates and message queuing. When connectivity returns, queued messages are sent automatically.

### State Management
**Challenge**: Managing chat state across multiple components.

**Solution**: Created ChatContext with useReducer for centralized state management. Real-time events update the central state which propagates to all subscribed components.

### Dark Mode
**Challenge**: Ensuring all components properly support dark mode.

**Solution**: Used Tailwind's dark: modifier extensively. Created ThemeContext for centralized theme management with system preference detection.

## Project Structure

```
src/
├── components/
│   ├── Layout/
│   │   ├── Header.tsx
│   │   ├── Sidebar.tsx
│   │   └── MainLayout.tsx
│   ├── Chat/
│   │   ├── ChatWindow.tsx
│   │   ├── MessageBubble.tsx
│   │   ├── MessageInput.tsx
│   │   └── TypingIndicator.tsx
│   ├── Auth/
│   │   ├── LoginForm.tsx
│   │   └── RegisterForm.tsx
│   └── Common/
│       ├── Button.tsx
│       ├── Input.tsx
│       ├── Avatar.tsx
│       ├── Badge.tsx
│       └── Modal.tsx
├── contexts/
│   ├── AuthContext.tsx
│   ├── ThemeContext.tsx
│   └── ChatContext.tsx
├── services/
│   ├── api.ts
│   └── socket.ts
├── types/
│   └── index.ts
├── pages/
│   ├── Login.tsx
│   ├── Register.tsx
│   ├── Inbox.tsx
│   ├── Chat.tsx
│   ├── Profile.tsx
│   └── AdminDashboard.tsx
├── App.tsx
└── main.tsx
```

## Key Components

### AuthContext
Manages user authentication state including login, logout, and token refresh.

### ThemeContext
Provides dark/light mode toggle with system preference detection.

### ChatContext
Centralized chat state management for conversations, messages, and real-time updates.

## License

MIT

## Author

RightFix - https://github.com/RightFix