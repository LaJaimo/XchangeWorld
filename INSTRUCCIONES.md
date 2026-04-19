# XChange LATAM — Word Cloud en tiempo real
## Guía de instalación (30-40 minutos)

---

## PASO 1 — Crear proyecto en Firebase (10 min)

1. Entrá a https://console.firebase.google.com
2. Hacé click en **"Agregar proyecto"**
3. Nombre: `xchange-wordcloud` → Continuar
4. Podés desactivar Google Analytics si querés → Crear proyecto

### Activar Realtime Database
1. En el menú izquierdo: **Compilación → Realtime Database**
2. Click en **"Crear base de datos"**
3. Elegí la región más cercana (us-central1 está bien)
4. Empezar en **modo de prueba** (lo dejamos abierto por ahora)

### Copiar las credenciales
1. Click en el ícono de engranaje (⚙️) → **Configuración del proyecto**
2. Bajá hasta **"Tus apps"** → Click en **</>** (Web)
3. Nombre de la app: `xchange-live` → Registrar
4. Copiá el objeto `firebaseConfig` que aparece

---

## PASO 2 — Configurar el proyecto (5 min)

1. Abrí el archivo `src/firebase.js`
2. Reemplazá los valores del objeto `firebaseConfig` con los que copiaste

---

## PASO 3 — Subir a GitHub (5 min)

1. Creá un repo nuevo en github.com (público o privado, da igual)
2. Desde la carpeta del proyecto en tu Mac:
```bash
git init
git add .
git commit -m "xchange wordcloud"
git remote add origin https://github.com/TU_USUARIO/TU_REPO.git
git push -u origin main
```

---

## PASO 4 — Deploy en Vercel (5 min)

1. Entrá a https://vercel.com → **Sign up with GitHub**
2. Click en **"Add New Project"**
3. Importá el repo que creaste
4. Framework: Vite (lo detecta solo)
5. Click en **Deploy** → Listo

✅ Vercel te da una URL tipo `https://xchange-wordcloud.vercel.app`

---

## PASO 5 — Generar el QR

1. Entrá a https://qr.io o https://www.qrcode-monkey.com
2. URL: tu dominio de Vercel (ej: `https://xchange-wordcloud.vercel.app`)
3. Descargá el QR en PNG o SVG
4. Listo para proyectar

---

## Cómo usarlo durante el evento

### Antes de cada momento interactivo:
1. Abrí `/admin` en tu celular o laptop
2. Seleccioná la sesión correspondiente (apertura, networking, cierre) o escribí una pregunta personalizada
3. Click en **Activar**

### En la pantalla grande:
- Abrí `/screen` en el navegador de la computadora que proyectás
- F11 para modo pantalla completa
- Las palabras aparecen automáticamente al ritmo que la gente envía

### La audiencia:
- Escanea el QR → entra a `/` → escribe su palabra o frase → envía

---

## URLs del sistema

| Pantalla | URL | Para quién |
|----------|-----|------------|
| Audiencia | `tu-dominio.vercel.app/` | Escanean con el QR |
| Proyector | `tu-dominio.vercel.app/screen` | Pantalla grande del evento |
| Admin | `tu-dominio.vercel.app/admin` | Vos, para cambiar preguntas |

---

## Sesiones preconfiguradas

- **Apertura**: "¿Qué esperás llevarte de XChange LATAM?"
- **Networking**: "¿Con quién querés conectar hoy?"
- **Cierre**: "¿Cuál es tu principal aprendizaje del día?"
- **Personalizada**: escribís la pregunta que quieras

---

## Costo
Todo gratuito:
- Firebase Realtime Database: gratis hasta 100 conexiones simultáneas y 1GB de datos
- Vercel: gratis para proyectos personales
- GitHub: gratis
