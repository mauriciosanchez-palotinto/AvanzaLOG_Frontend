# React Frontend

## Instalación de dependencias:
```bash
cd frontend
npm install
```

## Desarrollo:

```bash
# Iniciar en modo desarrollo
npm start

# Build para producción
npm run build

# Tests
npm test
```

## Estructura:

```
src/
├── pages/           # Páginas principales
├── components/      # Componentes reutilizables
├── services/        # API client (axios)
├── stores/          # Estado global (Zustand)
├── types/           # TypeScript interfaces
├── hooks/           # Custom hooks
└── index.tsx        # Entry point
```

## Configuración:

1. Variable de entorno (`.env.local`):
```env
REACT_APP_API_URL=http://localhost:3000
```

2. Tailwind + Postcss ya configurado ✅

## Características:

- ✅ React 18 + TypeScript
- ✅ Tailwind CSS
- ✅ Tanstack Query (data fetching)
- ✅ Zustand (estado global)
- ✅ React Router (navegación)
- ✅ Axios (HTTP client)

---

### Ports:
- Frontend: 3001 (Docker) / 3000 (Local)
