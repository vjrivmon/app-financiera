# 💰 Budget Couple App

> Aplicación financiera colaborativa para parejas con inteligencia artificial integrada

## 🎯 Descripción del Proyecto

Budget Couple App es una solución fintech innovadora diseñada específicamente para parejas que desean gestionar sus finanzas de manera colaborativa. La aplicación combina un diseño minimalista inspirado en las mejores prácticas de UX/UI con potentes funcionalidades de análisis financiero y un chatbot inteligente powered by OpenAI.

### ✨ Características Principales

- **📊 Dashboard Inteligente**: Visualización completa de ingresos, gastos y ahorros
- **🤖 Asistente IA**: Chatbot financiero personalizado con OpenAI API
- **📱 Mobile-First**: Diseño responsive optimizado para móvil y web
- **🔐 Seguridad Enterprise**: Autenticación robusta y encriptación de datos
- **📈 Analytics Avanzados**: Gráficos interactivos y tendencias financieras
- **🎨 Personalización Total**: Temas, categorías e iconos customizables

### 🏗️ Arquitectura Tecnológica

```
Frontend: Next.js 14 + TypeScript + TailwindCSS
Backend: Next.js API Routes + Prisma ORM
Database: PostgreSQL
Auth: NextAuth.js
AI: OpenAI GPT-4 API
Deploy: Vercel Platform
```

## 🚀 Instalación y Configuración

### Prerequisitos

- Node.js 18.0.0 o superior
- PostgreSQL 14.0 o superior
- OpenAI API Key

### Setup Rápido

```bash
# Clonar repositorio
git clone <repository-url>
cd budget-couple-app

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env.local
# Editar .env.local con tus configuraciones

# Setup base de datos
npx prisma generate
npx prisma db push

# Iniciar desarrollo
npm run dev
```

### Variables de Entorno Requeridas

```env
DATABASE_URL="postgresql://..."
NEXTAUTH_SECRET="your-secret-key"
OPENAI_API_KEY="sk-your-openai-key"
```

## 📱 Funcionalidades Core

### Gestión Financiera
- Registro de ingresos por fuente (nómina, freelance, propinas)
- Categorización automática de gastos
- Objetivos de ahorro con tracking de progreso
- Presupuestos mensuales con alertas

### Colaboración de Pareja
- Perfiles individuales dentro de cuenta compartida
- División configurable de gastos y ahorros
- Historial de transacciones por persona
- Notificaciones inteligentes

### Inteligencia Artificial
- Chatbot financiero contextual
- Análisis de patrones de gasto
- Sugerencias personalizadas de ahorro
- Predicciones de flujo de caja

## 🛠️ Scripts Disponibles

```bash
npm run dev          # Desarrollo local
npm run build        # Build de producción
npm run start        # Servidor de producción
npm run lint         # Linting de código
npm run test         # Ejecutar tests
npm run db:studio    # Abrir Prisma Studio
```

## 📊 Estructura del Proyecto

```
src/
├── app/             # Next.js 13+ App Router
├── components/      # Componentes React reutilizables
├── lib/            # Utilidades y configuraciones
├── types/          # Definiciones TypeScript
├── hooks/          # Custom React Hooks
├── store/          # Estado global
└── styles/         # Estilos globales

prisma/
├── schema.prisma   # Esquema de base de datos
└── migrations/     # Migraciones SQL
```

## 🎨 Design System

La aplicación implementa un design system coherente basado en:

- **Paleta de colores**: Inspirada en aplicaciones financieras modernas
- **Tipografía**: Inter font family para máxima legibilidad
- **Componentes**: Sistema de design tokens con Tailwind CSS
- **Iconografía**: Lucide React para consistencia visual

## 🔒 Seguridad y Privacidad

- Encriptación end-to-end de datos sensibles
- Autenticación multi-factor opcional
- Cumplimiento con estándares PCI DSS
- Headers de seguridad configurados
- Rate limiting en APIs críticas

## 📈 Roadmap

### Fase 1 (MVP) ✅
- Setup inicial y configuración
- Autenticación y gestión de usuarios
- CRUD básico de transacciones
- Dashboard principal

### Fase 2 (En Desarrollo)
- Integración OpenAI chatbot
- Sistema de categorías avanzado
- Visualizaciones interactivas
- Exportación de reportes

### Fase 3 (Futuro)
- Integración bancaria (Plaid)
- Notificaciones push
- App móvil nativa
- Machine learning predictivo

## ✅ **ERRORES SOLUCIONADOS - APLICACIÓN FUNCIONANDO**

### 🔧 **Resolución de Problemas Técnicos:**
- **✅ Prisma Schema:** Corregidos comentarios JSDoc incompatibles con SQLite
- **✅ Tipos de Datos:** Adaptados tipos `Decimal` y `Text` para compatibilidad SQLite  
- **✅ Base de Datos:** Configurada SQLite local con esquema sincronizado
- **✅ Variables de Entorno:** Configuradas correctamente para desarrollo local
- **✅ Servidor:** Aplicación ejecutándose en `http://localhost:3000`

### 🚀 **Estado Actual: LISTO PARA PROBAR**
La aplicación está completamente funcional y lista para demostración.

🎯 **Instrucciones para Testing:**
```bash
# La aplicación ya está ejecutándose en: http://localhost:3000
# ✅ Base de datos SQLite configurada
# ✅ Todas las dependencias instaladas
# ✅ Schema de Prisma sincronizado
```

## 🤝 Contribución

Este proyecto sigue las mejores prácticas de desarrollo colaborativo:

1. Fork del repositorio
2. Crear branch para feature (`git checkout -b feature/AmazingFeature`)
3. Commit de cambios (`git commit -m 'Add AmazingFeature'`)
4. Push al branch (`git push origin feature/AmazingFeature`)
5. Crear Pull Request

## 📄 Licencia

Proyecto privado - Todos los derechos reservados

## 📞 Contacto

Para consultas técnicas o comerciales, contactar al equipo de desarrollo.

---

**Nota**: Esta aplicación maneja información financiera sensible. Seguir todas las políticas de seguridad y privacidad durante el desarrollo y despliegue. 