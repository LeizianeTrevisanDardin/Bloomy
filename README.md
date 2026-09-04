# Bloomy

Bloomy is a gamified productivity application that combines planning tools with an interactive pixel-art world.

Users can organize habits, tasks, and long-term goals while earning XP and coins for completed activities. The dashboard changes its scenery according to the local weather and time of day, creating a more personal and engaging planning experience.

## Features

### Habits

- Create habits with custom titles, descriptions, icons, and frequency
- Select a difficulty level
- Complete and uncomplete habits
- Earn XP and coins
- Archive or permanently delete habits
- Track daily and weekly progress

### Tasks

- Create tasks with priority, difficulty, description, and due date
- Mark tasks as completed or incomplete
- Receive rewards based on task difficulty
- Archive or permanently delete tasks
- View active and completed tasks

### Goals

- Create measurable goals with categories, deadlines, and target values
- Update progress over time
- Automatically complete goals when their target is reached
- Award XP and coins when goals are completed
- Archive or permanently delete goals

### Calendar

- View activities organized by date
- Navigate between months
- Identify days containing habits, tasks, or goals
- Access a complete calendar page from the dashboard

### Statistics

- View the current level and accumulated XP
- Track coins and gems
- Monitor habit completion rates
- View current streaks
- Track completed tasks and goals

### Profile and account settings

- Update the display name
- Upload, replace, or remove a profile photo
- Log out securely
- Permanently delete the account

### Interactive world

- Pixel-art environment with animated characters
- Weather-based automatic scenery
- Manual scene selection
- Day, night, sunrise, sunset, rain, snow, cloudy, and aurora scenes
- Animated rain, snow, and aurora effects
- Responsive character positioning
- Optimized WebP backgrounds

## Weather-based scenes

Bloomy uses the user's approximate location to load current weather information. The application selects the most appropriate scene based on:

- Current weather conditions
- Cloud coverage
- Precipitation and snowfall
- Local time
- Sunrise and sunset periods
- Aurora forecast probability

Weather failures do not prevent the dashboard from working. When weather information is unavailable, Bloomy continues using a default scene.

## Built With

- [Next.js](https://nextjs.org/) 16
- [React](https://react.dev/) 19
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/) 4
- [Supabase](https://supabase.com/)
- [Open-Meteo](https://open-meteo.com/)
- [NOAA Space Weather Prediction Center](https://www.swpc.noaa.gov/)
- [Sharp](https://sharp.pixelplumbing.com/)

## Getting Started

### Requirements

Before running the project, make sure you have:

- Node.js installed
- npm installed
- A Supabase project
- The required Supabase database tables and functions

### Installation

Clone the repository:

```bash
git clone YOUR_REPOSITORY_URL
```

Enter the project directory:

```bash
cd bloomy
```

Install the dependencies:

```bash
npm install
```

### Environment variables

Create a `.env.local` file in the root of the project:

```env
NEXT_PUBLIC_SUPABASE_URL=supabase_project_url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=supabase_publishable_key
```

The `.env.local` file contains private configuration and should not be committed to the repository.

### Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Available Commands

Run the application in development mode:

```bash
npm run dev
```

Check the project with ESLint:

```bash
npm run lint
```

Create a production build:

```bash
npm run build
```

Run the production build locally:

```bash
npm run start
```

## Image Optimization

The scenery files are converted from PNG to WebP to reduce their download size and improve dashboard loading time.

The optimization script requires Sharp. After adding or replacing scene images, run the image optimization script configured for the project.

The optimized files are stored in:

```text
public/bloomy/
```

Character sprite sheets are stored in:

```text
public/bloomy/characters/
```

Visual effects are stored in:

```text
public/bloomy/effects/
```

## Project Structure

```text
src/
├── app/
│   ├── api/
│   ├── auth/
│   └── dashboard/
│       ├── calendar/
│       ├── goals/
│       ├── habits/
│       ├── settings/
│       ├── statistics/
│       └── tasks/
├── components/
├── context/
├── hooks/
├── lib/
│   └── supabase/
└── types/

public/
└── bloomy/
    ├── characters/
    └── effects/
```

## Authentication and Data

Authentication and application data are managed through Supabase.

Database access is protected by authenticated user sessions and Row Level Security policies. Sensitive operations, including rewards, progress updates, and account deletion, are handled through database functions instead of being calculated only in the browser.

## Responsive Design

Bloomy was designed to work across desktop, tablet, and mobile screen sizes.

The world uses a fixed scene coordinate system so that characters and environmental elements maintain their relative positions when the viewport changes. The interface also adapts navigation, panels, text, and controls according to the available screen space.

## Current Status

Bloomy is under active development. The main productivity and account-management features are functional, including authentication, habits, tasks, goals, calendar, statistics, profile management, weather integration, and the interactive world.

## License

This project is currently intended for personal and portfolio use.