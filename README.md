# Your City Vibe

Una aplicación Next.js que descubre lugares perfectos según tu mood usando IA.

## 🚀 Deployment en Vercel

1. **Clona o descarga** este proyecto
2. **Configura las variables de entorno** en Vercel:
   - `OPENAI_API_KEY`: Tu API key de OpenAI
   - `SONAR_API_KEY`: Tu API key de Perplexity
   - `REDIS_REST_URL`: URL de tu instancia Upstash Redis
   - `REDIS_REST_TOKEN`: Token de tu instancia Upstash Redis

3. **Deploy**: Vercel detectará automáticamente que es un proyecto Next.js

## 🛠️ Desarrollo Local

\`\`\`bash
# Instalar dependencias
npm install

# Crear .env.local con tus API keys
cp .env.example .env.local

# Ejecutar en desarrollo
npm run dev

# Build para producción
npm run build
\`\`\`

## 📁 Estructura del Proyecto

\`\`\`
your-city-vibe/
├── app/
│   ├── api/
│   │   ├── vibe/route.ts    # Clasificación de vibes
│   │   └── recs/route.ts    # Recomendaciones de lugares
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── Card.tsx
│   ├── CardList.tsx
│   └── SkeletonCard.tsx
├── lib/
│   ├── fetcher.ts
│   └── utils.ts
└── package.json
\`\`\`

## 🎯 Funcionalidades

- **Clasificación de Vibes**: Analiza texto o imágenes para detectar el mood
- **Recomendaciones Inteligentes**: Encuentra lugares usando Perplexity AI
- **Cache con Redis**: Optimización de rendimiento
- **UI Responsiva**: Diseño mobile-first con Tailwind CSS
- **Animaciones Lottie**: Interfaz interactiva y atractiva

## 🔧 APIs Utilizadas

- **OpenAI GPT-4**: Clasificación de vibes y procesamiento de imágenes
- **Perplexity Sonar**: Búsqueda de lugares en tiempo real
- **Upstash Redis**: Cache para optimizar rendimiento

## 📱 Vibes Soportados

- **Perrea**: Clubs y rooftops con reggaeton
- **Productivo**: Cafés y coworks con wifi
- **Sad**: Cafés acogedores con música acústica
- **Corridos**: Cantinas con música norteña
- **Chill**: Bares relajados con buen ambiente
- **Traka**: Street food y mercados auténticos
- **Eco**: Parques y espacios naturales
- **K-cute**: Cafés estéticos e Instagram-worthy
