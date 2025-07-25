'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Heart, 
  Smartphone, 
  TrendingUp, 
  PiggyBank, 
  Shield, 
  Zap,
  ArrowRight,
  CheckCircle,
  Star,
  Users
} from 'lucide-react';
import Link from 'next/link';

/**
 * Landing Page principal de Budget Couple App
 * Diseño inspirado en la aplicación Budget con enfoque minimalista
 * y orientado a parejas jóvenes que valoran el diseño visual cuidado
 */
export default function LandingPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Animaciones para Framer Motion
  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  };

  const staggerChildren = {
    animate: {
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50">
      {/* Navigation Header */}
      <motion.nav 
        className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100"
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                <Heart className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">Budget Couple</span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <a href="#caracteristicas" className="text-gray-600 hover:text-gray-900 transition-colors">
                Características
              </a>
              <a href="#como-funciona" className="text-gray-600 hover:text-gray-900 transition-colors">
                Cómo Funciona
              </a>
              <a href="#precios" className="text-gray-600 hover:text-gray-900 transition-colors">
                Precios
              </a>
              <Link 
                href="/auth/signin"
                className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-xl font-medium transition-colors"
              >
                Iniciar Sesión
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button 
              className="md:hidden p-2"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <div className="w-6 h-6 flex flex-col justify-center items-center">
                <span className={`block w-5 h-0.5 bg-gray-600 transition-transform ${isMenuOpen ? 'rotate-45 translate-y-1' : ''}`} />
                <span className={`block w-5 h-0.5 bg-gray-600 mt-1 transition-opacity ${isMenuOpen ? 'opacity-0' : ''}`} />
                <span className={`block w-5 h-0.5 bg-gray-600 mt-1 transition-transform ${isMenuOpen ? '-rotate-45 -translate-y-1' : ''}`} />
              </div>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <motion.div 
            className="md:hidden bg-white border-t border-gray-100"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <div className="px-4 py-4 space-y-3">
              <a href="#caracteristicas" className="block text-gray-600 hover:text-gray-900">
                Características
              </a>
              <a href="#como-funciona" className="block text-gray-600 hover:text-gray-900">
                Cómo Funciona
              </a>
              <a href="#precios" className="block text-gray-600 hover:text-gray-900">
                Precios
              </a>
              <Link 
                href="/auth/signin"
                className="block bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-xl font-medium text-center transition-colors"
              >
                Iniciar Sesión
              </Link>
            </div>
          </motion.div>
        )}
      </motion.nav>

      {/* Hero Section */}
      <section className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            className="text-center max-w-4xl mx-auto"
            variants={staggerChildren}
            initial="initial"
            animate="animate"
          >
            <motion.h1 
              className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6"
              variants={fadeInUp}
            >
              Finanzas en pareja
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-cyan-500">
                nunca fueron tan fáciles
              </span>
            </motion.h1>
            
            <motion.p 
              className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto"
              variants={fadeInUp}
            >
              Gestiona vuestros ingresos, gastos y objetivos de ahorro de forma colaborativa. 
              Con inteligencia artificial que os ayuda a tomar mejores decisiones financieras.
            </motion.p>

            <motion.div 
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
              variants={fadeInUp}
            >
              <Link 
                href="/auth/signup"
                className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-200 flex items-center space-x-2 hover:scale-105"
              >
                <span>Empezar Gratis</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
              
              <Link 
                href="#demo"
                className="border border-gray-300 hover:border-gray-400 text-gray-700 px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-200 hover:bg-gray-50"
              >
                Ver Demo
              </Link>
            </motion.div>

            <motion.div 
              className="mt-12 flex items-center justify-center space-x-6 text-sm text-gray-500"
              variants={fadeInUp}
            >
              <div className="flex items-center space-x-1">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>Gratis para siempre</span>
              </div>
              <div className="flex items-center space-x-1">
                <Shield className="w-4 h-4 text-blue-500" />
                <span>100% Seguro</span>
              </div>
              <div className="flex items-center space-x-1">
                <Smartphone className="w-4 h-4 text-purple-500" />
                <span>Mobile-first</span>
              </div>
            </motion.div>
          </motion.div>

          {/* Hero Image/Mockup */}
          <motion.div 
            className="mt-16 relative"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <div className="relative mx-auto max-w-4xl">
              {/* Phone Mockups */}
              <div className="flex justify-center items-end space-x-4">
                {/* Left Phone */}
                <div className="relative">
                  <div className="w-64 h-[520px] bg-gray-900 rounded-[3rem] p-2 shadow-2xl">
                    <div className="w-full h-full bg-white rounded-[2.5rem] overflow-hidden">
                      {/* Simulated app interface */}
                      <div className="bg-gradient-to-r from-blue-500 to-cyan-500 h-20 flex items-center justify-center">
                        <span className="text-white font-semibold">Dashboard Pareja</span>
                      </div>
                      <div className="p-4 space-y-4">
                        <div className="bg-green-50 border border-green-200 rounded-xl p-3">
                          <div className="text-green-600 text-sm font-medium">Ingresos</div>
                          <div className="text-2xl font-bold text-green-700">€2,450</div>
                        </div>
                        <div className="bg-red-50 border border-red-200 rounded-xl p-3">
                          <div className="text-red-600 text-sm font-medium">Gastos</div>
                          <div className="text-2xl font-bold text-red-700">€1,890</div>
                        </div>
                        <div className="bg-blue-50 border border-blue-200 rounded-xl p-3">
                          <div className="text-blue-600 text-sm font-medium">Ahorros</div>
                          <div className="text-2xl font-bold text-blue-700">€560</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Phone */}
                <div className="relative">
                  <div className="w-64 h-[520px] bg-gray-900 rounded-[3rem] p-2 shadow-2xl">
                    <div className="w-full h-full bg-white rounded-[2.5rem] overflow-hidden">
                      {/* Simulated chat interface */}
                      <div className="bg-gradient-to-r from-purple-500 to-pink-500 h-20 flex items-center justify-center">
                        <span className="text-white font-semibold">Asistente IA</span>
                      </div>
                      <div className="p-4 space-y-3 text-sm">
                        <div className="bg-gray-100 rounded-xl p-3">
                          <p>¿En qué categoría gastamos más este mes?</p>
                        </div>
                        <div className="bg-blue-500 text-white rounded-xl p-3 ml-8">
                          <p>Este mes habéis gastado más en "Comida" con €420. ¿Os gustaría que os ayude a optimizar este gasto?</p>
                        </div>
                        <div className="bg-gray-100 rounded-xl p-3">
                          <p>Sí, danos consejos</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating Elements */}
              <div className="absolute -top-4 -left-4 w-16 h-16 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg">
                <PiggyBank className="w-8 h-8 text-yellow-700" />
              </div>
              <div className="absolute top-8 -right-8 w-12 h-12 bg-green-400 rounded-full flex items-center justify-center shadow-lg">
                <TrendingUp className="w-6 h-6 text-green-700" />
              </div>
              <div className="absolute bottom-16 -left-8 w-14 h-14 bg-purple-400 rounded-full flex items-center justify-center shadow-lg">
                <Zap className="w-7 h-7 text-purple-700" />
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="caracteristicas" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-16"
            variants={fadeInUp}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Todo lo que necesitáis para gestionar vuestras finanzas
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Herramientas diseñadas específicamente para parejas que quieren alcanzar sus metas financieras juntos
            </p>
          </motion.div>

          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            variants={staggerChildren}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            {/* Feature Cards */}
            {[
              {
                icon: <Heart className="w-8 h-8" />,
                title: "Gestión Colaborativa",
                description: "Ambos podéis registrar gastos, ver el progreso y tomar decisiones financieras juntos.",
                color: "from-pink-500 to-rose-500"
              },
              {
                icon: <Zap className="w-8 h-8" />,
                title: "Inteligencia Artificial",
                description: "Nuestro chatbot os ayuda con consejos personalizados y análisis de vuestros hábitos de gasto.",
                color: "from-purple-500 to-indigo-500"
              },
              {
                icon: <TrendingUp className="w-8 h-8" />,
                title: "Visualizaciones Inteligentes",
                description: "Gráficos y reportes que hacen fácil entender hacia dónde va vuestro dinero.",
                color: "from-blue-500 to-cyan-500"
              },
              {
                icon: <PiggyBank className="w-8 h-8" />,
                title: "Objetivos de Ahorro",
                description: "Estableced metas compartidas y tracked vuestro progreso hacia ellas automáticamente.",
                color: "from-green-500 to-emerald-500"
              },
              {
                icon: <Shield className="w-8 h-8" />,
                title: "Seguridad Bancaria",
                description: "Protección de nivel bancario para vuestros datos financieros más sensibles.",
                color: "from-gray-500 to-slate-500"
              },
              {
                icon: <Smartphone className="w-8 h-8" />,
                title: "Mobile-First",
                description: "Diseño optimizado para móvil que funciona perfectamente en cualquier dispositivo.",
                color: "from-orange-500 to-amber-500"
              }
            ].map((feature, index) => (
              <motion.div 
                key={index}
                className="card card-hover text-center"
                variants={fadeInUp}
              >
                <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-r ${feature.color} flex items-center justify-center text-white`}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Social Proof Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center"
            variants={fadeInUp}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            <h3 className="text-2xl font-bold text-gray-900 mb-8">
              Más de 1,000 parejas ya confían en nosotros
            </h3>
            
            <div className="flex justify-center items-center space-x-8 mb-8">
              <div className="flex items-center space-x-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                ))}
                <span className="ml-2 text-gray-600 font-medium">4.9/5</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-600">
                <Users className="w-5 h-5" />
                <span>+1,000 parejas activas</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              {[
                {
                  quote: "Finalmente podemos ahorrar para nuestro viaje a Japón. La IA nos ayuda mucho con consejos personalizados.",
                  author: "María y Carlos",
                  location: "Madrid"
                },
                {
                  quote: "La app es súper intuitiva. Nos encanta poder ver nuestro progreso financiero en tiempo real.",
                  author: "Ana y David",
                  location: "Barcelona"
                },
                {
                  quote: "Antes discutíamos por dinero, ahora trabajamos juntos hacia nuestras metas. ¡Increíble!",
                  author: "Laura y Miguel",
                  location: "Valencia"
                }
              ].map((testimonial, index) => (
                <motion.div 
                  key={index}
                  className="bg-white rounded-xl p-6 shadow-soft"
                  variants={fadeInUp}
                  initial="initial"
                  whileInView="animate"
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <p className="text-gray-700 mb-4 italic">
                    "{testimonial.quote}"
                  </p>
                  <div className="font-semibold text-gray-900">
                    {testimonial.author}
                  </div>
                  <div className="text-sm text-gray-500">
                    {testimonial.location}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-500 to-cyan-500">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <motion.div
            variants={fadeInUp}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
              ¿Listos para transformar vuestras finanzas?
            </h2>
            <p className="text-xl text-blue-100 mb-8">
              Úneos a las miles de parejas que ya están construyendo un futuro financiero sólido juntos.
            </p>
            <Link 
              href="/auth/signup"
              className="bg-white hover:bg-gray-100 text-blue-600 px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-200 inline-flex items-center space-x-2 hover:scale-105"
            >
              <span>Empezar Ahora - Gratis</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                  <Heart className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold">Budget Couple</span>
              </div>
              <p className="text-gray-400">
                La aplicación financiera diseñada para parejas que quieren construir un futuro próspero juntos.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Producto</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Características</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Precios</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Seguridad</a></li>
                <li><a href="#" className="hover:text-white transition-colors">API</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Empresa</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Sobre nosotros</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Carreras</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contacto</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Privacidad</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Términos</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Cookies</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Budget Couple App. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
} 