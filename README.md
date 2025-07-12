# OpenTask Frontend

React 18 + TypeScript frontend for the OpenTask project, built with Vite and styled with Tailwind CSS and shadcn/ui components.

## Features

- React 18 with TypeScript
- Vite for fast development and building
- Tailwind CSS for styling
- shadcn/ui component library
- Lucide React icons
- Recharts for data visualization
- ESLint and Prettier for code quality

## Prerequisites

- Node.js 18 or higher
- npm or yarn

## Getting Started

1. **Clone the repository:**
   ```bash
   git clone https://github.com/HrishiT92/opentask-frontend.git
   cd opentask-frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start development server:**
   ```bash
   npm run dev
   ```

4. **Open your browser:**
   Visit http://localhost:5173

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues

## Project Structure

```
src/
├── components/     # Reusable UI components
├── pages/         # Page components
├── hooks/         # Custom React hooks
├── lib/           # Utility functions
├── types/         # TypeScript type definitions
└── styles/        # Global styles
```

## Building

```bash
npm run build
```

The build artifacts will be stored in the `dist/` directory.

## Docker

Build the Docker image:
```bash
docker build -t opentask-frontend .
```

Run with Docker:
```bash
docker run -p 3000:80 opentask-frontend
```

## Environment Variables

Create a `.env` file in the root directory:

```env
VITE_API_URL=http://localhost:5000
```

## Component Library

This project uses shadcn/ui components. To add new components:

```bash
npx shadcn-ui@latest add [component-name]
```

## Contributing

1. Create a feature branch
2. Make your changes
3. Run linting: `npm run lint`
4. Submit a pull request

## Styling

- Tailwind CSS for utility-first styling
- shadcn/ui for pre-built components
- Custom CSS variables for theming
