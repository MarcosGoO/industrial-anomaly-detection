# Industrial Anomaly Detection - Frontend

React + TypeScript application for real-time industrial machinery monitoring and anomaly detection visualization.

## Tech Stack

- **React 18** with TypeScript
- **Vite** - Fast build tool
- **TailwindCSS** - Utility-first CSS framework
- **React Query** - Data fetching and caching
- **Zustand** - State management
- **Axios** - HTTP client
- **D3.js** - Data visualization (ready for Sprint 3+)
- **Plotly.js** - Interactive charts (ready for Sprint 3+)
- **Recharts** - Chart library (ready for Sprint 3+)
- **Framer Motion** - Animations (ready for Sprint 3+)

## Prerequisites

- Node.js 18+ and npm
- Backend API running at `http://localhost:8000`

## Getting Started

### Installation

```bash
cd frontend
npm install
```

### Environment Configuration

Copy `.env.example` to `.env` and configure:

```env
VITE_API_URL=http://localhost:8000
```

### Development Server

```bash
npm run dev
```

Application will be available at `http://localhost:5173`

### Build for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── Dashboard/        # Dashboard screens (Sprint 3+)
│   │   └── Visualizations/   # Chart components (Sprint 3+)
│   ├── services/
│   │   ├── api.ts           # API service layer
│   │   └── queryClient.ts   # React Query config
│   ├── hooks/
│   │   └── useHealthCheck.ts # Health monitoring hook
│   ├── store/
│   │   └── useAppStore.ts   # Zustand global state
│   ├── types/
│   │   └── index.ts         # TypeScript type definitions
│   ├── utils/               # Utility functions
│   ├── App.tsx              # Main application
│   ├── main.tsx             # Application entry point
│   └── index.css            # Global styles
├── public/                  # Static assets
├── .env                     # Environment variables
├── vite.config.ts           # Vite configuration
├── tailwind.config.js       # Tailwind configuration
├── tsconfig.json            # TypeScript configuration
└── package.json
```

## Features (Sprint 2 Complete)

✅ **System Status Monitoring**
- Real-time connection status
- Health check every 10 seconds
- Model availability display
- Ensemble configuration view

✅ **API Integration**
- Typed API service with Axios
- React Query for data fetching
- Error handling and retry logic

✅ **State Management**
- Global state with Zustand
- Prediction history tracking
- System health tracking

✅ **UI/UX**
- Dark mode theme
- Responsive design with Tailwind
- Loading and error states
- Connection status indicator

## Planned Features (Sprint 3+)

🔜 **Real-Time Monitoring Dashboard**
- Live vibration waveforms
- Frequency spectrum visualization
- Current temperature display
- Anomaly score gauge
- Health status indicators

🔜 **Historical Analysis**
- 30-day health score trends
- Anomaly events timeline
- Feature correlation heatmap
- Performance degradation curves

🔜 **Anomaly Details**
- Alert severity classification
- Root cause analysis
- Contributing factors breakdown
- Recommended actions
- Similar past events

🔜 **System Performance Metrics**
- Model precision/recall/F1
- Inference latency tracking
- Resource usage monitoring
- Drift detection status

## API Integration

The frontend communicates with the backend API at the configured `VITE_API_URL`.

### Available Endpoints

- `GET /` - API information
- `GET /api/health` - System health status
- `GET /api/ready` - Readiness probe
- `POST /api/predict` - Anomaly prediction (Sprint 3+)

See [Backend API Documentation](../backend/API_README.md) for details.

## Development

### Type Safety

All API responses and requests are typed in `src/types/index.ts`. The TypeScript compiler will catch type mismatches at build time.

### State Management

Global state is managed with Zustand in `src/store/useAppStore.ts`:

```typescript
const isConnected = useAppStore((state) => state.isConnected);
const setCurrentPrediction = useAppStore((state) => state.setCurrentPrediction);
```

### Data Fetching

React Query is used for server state management:

```typescript
const { data, isLoading, error } = useHealthCheck();
```

### Styling

Tailwind utility classes are used throughout. Custom styles can be added to `index.css`.

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)

## License

Part of the Industrial Anomaly Detection System project.
