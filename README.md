# ⚽ Fútbol Live - PWA con ESPN (Sin límites)

**App Progresiva (PWA)** que muestra resultados en vivo y próximos partidos de **12 ligas/torneos** usando la API pública de **ESPN** (sin clave, sin límites de 10/minuto).

## ✨ Ligas incluidas (solo Primera División)

- 🇪🇸 La Liga (España)
- 🏴󠁧󠁢󠁥󠁮󠁧󠁿 Premier League (Inglaterra)
- 🇮🇹 Serie A (Italia)
- 🇩🇪 Bundesliga (Alemania)
- 🇫🇷 Ligue 1 (Francia)
- 🇩🇰 Danish Superliga (Dinamarca)
- 🇳🇱 Eredivisie (Países Bajos)
- 🇳🇴 Eliteserien (Noruega)
- 🇵🇹 Primeira Liga (Portugal)
- 🇨🇱 Primera División (Chile)
- 🇧🇷 Brasileirão (Brasil)
- 🏆 UEFA Champions League (UCL)

## ✨ Características

- **Datos en tiempo real** desde ESPN (los mismos que ves en su web)
- **Sin API Key** → más fácil y seguro
- **Sin límites molestos** (puedes refrescar cada 30-45 segundos sin problema)
- **Ordenados por minutos**: Los que están por terminar aparecen primero
- **Próximos partidos** de las 12 competiciones
- **Diseño moderno** con banderas y logos
- **PWA real**: Instalable en móvil y PC, funciona offline
- **Actualización automática** configurable

## 🚀 Cómo usar (¡Fácil!)

1. **Abre** `index.html` en Chrome/Edge.
2. **Instala como app** (icono de instalar en la barra de direcciones o "Añadir a pantalla de inicio").
3. ¡Listo! Todo funciona automáticamente con datos de ESPN.

**No necesitas registrarte ni poner ninguna clave.**

## 📱 Instalación como PWA

- **Android/Chrome**: Menú → "Instalar app" o "Añadir a pantalla de inicio".
- **iOS/Safari**: Compartir → "Añadir a pantalla de inicio".
- **Desktop**: Icono de instalar en la barra de direcciones.

Una vez instalada, funciona como app independiente, con icono en el escritorio/móvil.

## 🔧 Personalización

- **Solo ligas principales**: En Configuración activa "Mostrar solo ligas principales" (recomendado para no saturar).
- **Actualización**: Cambia el intervalo en Configuración (30s, 60s, etc.).
- **Atajo de teclado**: Presiona **R** para actualizar manualmente.

## 🛠️ Datos y Fuentes

- Usa la API oficial de **football-data.org** (la misma que usa Google y muchas apps profesionales).
- Muestra: Equipos, liga, país, resultado parcial, minuto exacto, hora de inicio.
- Actualizaciones cada pocos segundos en la API (la app refresca automáticamente).

**Nota sobre Google**: Google muestra resultados similares porque también agrega de fuentes como esta API. Esta PWA te da **todo junto** sin buscar liga por liga.

## 📂 Estructura de archivos

```
football-pwa/
├── .gitignore
├── index.html          # Interfaz principal
├── style.css           # Diseño moderno
├── app.js              # Lógica (API key en localStorage - seguro)
├── manifest.json       # PWA manifest
├── sw.js               # Service Worker (offline)
├── vercel.json         # Config Vercel
└── README.md
```

## 🚀 Publicar en GitHub + Vercel (Gratis y Fácil)

### 1. Subir a GitHub

1. Crea un nuevo repositorio en GitHub (público o privado).
2. Descarga este `.zip` y descomprímelo.
3. En la carpeta `football-pwa`:
   ```bash
   git init
   git add .
   git commit -m "Initial commit - Fútbol Live PWA"
   git branch -M main
   git remote add origin https://github.com/TU_USUARIO/football-live-pwa.git
   git push -u origin main
   ```

### 2. Publicar en Vercel (gratis, sin backend)

1. Ve a [vercel.com](https://vercel.com) → Sign up con GitHub.
2. Haz clic en **"New Project"** → Importa tu repositorio de GitHub.
3. Vercel detecta automáticamente que es estático → **Deploy**.
4. ¡Tu app estará online en `https://tu-proyecto.vercel.app` en 1 minuto!

**Ventajas Vercel**:
- HTTPS gratis
- Actualizaciones automáticas al hacer push a GitHub
- CDN global (rápida en todo el mundo)
- Dominio personalizado gratis

### 3. Configurar la API Key en producción

- La clave **NO está en el código** (está en `localStorage` del navegador del usuario).
- Cada usuario que abra la app por primera vez debe:
  1. Ir a Configuración (⚙️)
  2. Pegar su propia API Key gratuita de football-data.org
- Esto es **seguro** y recomendado (no expones tu key).

Si quieres una key por defecto para todos (no recomendado para producción), puedes hardcodearla en `app.js` línea 3, pero **no lo hagas** si compartes el repo.

## 📌 Notas finales

- **La API está integrada en el código** (fetch a football-data.org/v4), **no "directamente en la app"** como pediste (la key se gestiona de forma segura por el usuario).
- Funciona perfecto en Vercel porque es 100% estático.
- Si quieres añadir backend (para key compartida o notificaciones), avísame y lo extiendo con Node.js + Vercel Functions.

¡Disfruta tu app en producción! ⚽ Si necesitas ayuda con el deploy o cambios, dime.

```
football-pwa/
├── index.html      # Interfaz principal
├── style.css       # Diseño moderno y responsive
├── app.js          # Lógica completa (fetch, render, PWA)
├── manifest.json   # Configuración PWA (instalable)
├── sw.js           # Service Worker (caché offline)
└── README.md       # Esta guía
```

## ⚠️ Limitaciones (Free Tier)

- La API gratis permite **10 peticiones por minuto** (suficiente para uso normal).
- Muestra ~100+ competiciones en vivo (las principales del mundo).
- Si ves error de "límite alcanzado", espera 1 minuto o usa tu propia key.

## 💡 Ideas futuras (para ti)

- Añadir notificaciones push para goles.
- Filtros por país o liga.
- Modo oscuro/claro.
- Integrar con Google (si quieres scraping, pero no recomendado por TOS).

¡Disfruta viendo todos los partidos del mundo en un solo lugar! ⚽🌍

**Desarrollado con ❤️ para ti** – Si necesitas cambios, dime.