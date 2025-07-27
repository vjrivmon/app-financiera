/**
 * Esquemas de validación Zod para la aplicación financiera
 * Garantiza la integridad de datos en formularios y APIs
 */

import { z } from 'zod';

/**
 * Esquemas de validación para la aplicación financiera de parejas
 * Incluye validaciones robustas con mensajes de error en español
 */

// Definir constantes para tipos válidos (equivalent a enums)
export const TRANSACTION_TYPES = ['INCOME', 'EXPENSE'] as const;
export const BUDGET_PERIODS = ['WEEKLY', 'MONTHLY', 'YEARLY'] as const;
export const PRIORITIES = ['LOW', 'MEDIUM', 'HIGH'] as const;
export const THEMES = ['LIGHT', 'DARK', 'SYSTEM'] as const;
export const CHATBOT_PERSONALITIES = ['PROFESSIONAL', 'FRIENDLY', 'MOTIVATIONAL', 'CASUAL'] as const;
export const SPLIT_METHODS = ['EQUAL', 'PROPORTIONAL', 'CUSTOM'] as const;
export const RECURRENCE_FREQUENCIES = ['DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY'] as const;

// Crear tipos TypeScript a partir de las constantes
export type TransactionType = typeof TRANSACTION_TYPES[number];
export type BudgetPeriod = typeof BUDGET_PERIODS[number];
export type Priority = typeof PRIORITIES[number];
export type Theme = typeof THEMES[number];
export type ChatbotPersonality = typeof CHATBOT_PERSONALITIES[number];
export type SplitMethod = typeof SPLIT_METHODS[number];
export type RecurrenceFrequency = typeof RECURRENCE_FREQUENCIES[number];

/**
 * Validaciones para monedas y importes financieros
 */
const currencySchema = z.coerce
  .number({ 
    required_error: 'El importe es obligatorio',
    invalid_type_error: 'El importe debe ser un número válido'
  })
  .positive('El importe debe ser mayor que 0')
  .max(999999.99, 'El importe no puede superar €999,999.99')
  .multipleOf(0.01, 'El importe debe tener máximo 2 decimales');

const optionalCurrencySchema = currencySchema.optional();

/**
 * Validaciones para strings comunes
 */
// Removed unused nameSchema

const descriptionSchema = z.string()
  .max(500, 'La descripción no puede tener más de 500 caracteres')
  .trim()
  .optional();

const emailSchema = z.string()
  .email('Introduce un email válido')
  .max(254, 'El email es demasiado largo')
  .toLowerCase()
  .trim();

const passwordSchema = z.string()
  .min(8, 'La contraseña debe tener al menos 8 caracteres')
  .max(100, 'La contraseña no puede tener más de 100 caracteres')
  .regex(/[A-Z]/, 'La contraseña debe contener al menos una mayúscula')
  .regex(/[a-z]/, 'La contraseña debe contener al menos una minúscula')
  .regex(/[0-9]/, 'La contraseña debe contener al menos un número');

/**
 * Validaciones para fechas
 */
const dateSchema = z.date({
  required_error: 'La fecha es obligatoria',
  invalid_type_error: 'Introduce una fecha válida'
});

// Esquemas de fecha validados (se pueden usar cuando sea necesario)
// const futureDateSchema = z.date().refine(date => date > new Date(), 'La fecha debe ser futura');
// const pastOrPresentDateSchema = z.date().refine(date => date <= new Date(), 'La fecha no puede ser futura');

/**
 * Validaciones para formularios de autenticación
 */
export const signInSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'Password requerido'),
});

export const signUpSchema = z.object({
  name: z.string().min(2, 'Nombre debe tener al menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Password debe tener al menos 6 caracteres'),
  confirmPassword: z.string().min(6, 'Confirmación de password requerida'),
  coupleName: z.string().optional(),
  acceptTerms: z.boolean().refine(val => val === true, 'Debes aceptar los términos'),
}).refine(data => data.password === data.confirmPassword, {
  message: "Los passwords no coinciden",
  path: ["confirmPassword"],
});

export const forgotPasswordSchema = z.object({
  email: emailSchema
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Token requerido'),
  password: passwordSchema,
  confirmPassword: z.string()
}).refine(data => data.password === data.confirmPassword, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmPassword']
});

/**
 * Validaciones para transacciones financieras - ARREGLADO
 */
export const transactionSchema = z.object({
  amount: z.number().positive('El monto debe ser positivo'),
  description: z.string().min(1, 'La descripción es requerida'),
  categoryId: z.string().min(1, 'La categoría es requerida'), // Cambiado de cuid() a string simple
  type: z.enum(['INCOME', 'EXPENSE'], {
    errorMap: () => ({ message: 'Tipo debe ser INCOME o EXPENSE' })
  }),
  date: z.string().min(1, 'La fecha es requerida'), // Cambiado de date() a string
  notes: z.string().optional(),
  location: z.string().optional(),
  receipt: z.string().optional(),
});

export const transactionUpdateSchema = transactionSchema.partial();

export const transactionFiltersSchema = z.object({
  startDate: dateSchema.optional(),
  endDate: dateSchema.optional(),
  categoryIds: z.array(z.string().cuid()).optional(),
  type: z.enum(TRANSACTION_TYPES).optional(),
  userId: z.string().cuid().optional(),
  minAmount: optionalCurrencySchema,
  maxAmount: optionalCurrencySchema,
  search: z.string().max(100).trim().optional()
}).refine(data => {
  if (data.startDate && data.endDate) {
    return data.startDate <= data.endDate;
  }
  return true;
}, {
  message: 'La fecha de inicio debe ser anterior a la fecha de fin',
  path: ['endDate']
}).refine(data => {
  if (data.minAmount && data.maxAmount) {
    return data.minAmount <= data.maxAmount;
  }
  return true;
}, {
  message: 'El importe mínimo debe ser menor al máximo',
  path: ['maxAmount']
});

/**
 * Validaciones para categorías
 */
export const categorySchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  description: z.string().optional(),
  icon: z.string().min(1, 'El icono es requerido'),
  color: z.string().regex(/^#[0-9A-F]{6}$/i, 'Color debe ser hexadecimal válido'),
  type: z.enum(['INCOME', 'EXPENSE']),
});

export const categoryUpdateSchema = categorySchema.partial();

/**
 * Validaciones para presupuestos
 */
export const budgetSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  amount: z.number().positive('El monto debe ser positivo'),
  categoryId: z.string().cuid('ID de categoría inválido'),
  period: z.enum(['WEEKLY', 'MONTHLY', 'YEARLY']),
  startDate: z.date(),
  endDate: z.date().optional(),
  alertThreshold: z.number().min(0).max(1).optional(),
});

// Esquema de actualización de presupuesto (sin refine para permitir partial)
const baseBudgetSchema = z.object({
  name: z.string()
    .min(3, 'El nombre debe tener al menos 3 caracteres')
    .max(100, 'El nombre no puede superar 100 caracteres'),
  
  amount: z.number()
    .positive('El monto debe ser mayor a 0')
    .max(999999.99, 'El monto máximo es €999,999.99'),
  
  categoryId: z.string().cuid('ID de categoría inválido'),
  
  period: z.enum(BUDGET_PERIODS, {
    errorMap: () => ({ message: 'Período de presupuesto inválido' })
  }),
  
  startDate: z.date({
    required_error: 'La fecha de inicio es requerida'
  }),
  
  endDate: z.date().optional(),
  
  alertThreshold: z.number()
    .min(0.1, 'El umbral mínimo es 10%')
    .max(1, 'El umbral máximo es 100%')
    .optional(),
});

export const budgetUpdateSchema = baseBudgetSchema.partial();

/**
 * Validaciones para objetivos de ahorro
 */
export const savingsGoalSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  description: z.string().optional(),
  targetAmount: z.number().positive('El monto objetivo debe ser positivo'),
  currentAmount: z.number().min(0, 'El monto actual no puede ser negativo').default(0),
  targetDate: z.string().optional(), // Como string ISO
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH']).default('MEDIUM'),
  icon: z.string().optional(),
  color: z.string().optional(),
});

export const savingsGoalUpdateSchema = savingsGoalSchema.partial();

export const contributionSchema = z.object({
  savingsGoalId: z.string()
    .min(1, 'El objetivo de ahorro es obligatorio')
    .cuid('ID de objetivo inválido'),
  amount: currencySchema,
  notes: descriptionSchema
});

/**
 * Validaciones para configuraciones de usuario
 */
export const userSettingsSchema = z.object({
  theme: z.enum(['LIGHT', 'DARK', 'SYSTEM']).default('LIGHT'),
  language: z.string().default('es'),
  currency: z.string().default('EUR'),
  emailNotifications: z.boolean().default(true),
  pushNotifications: z.boolean().default(true),
  budgetAlerts: z.boolean().default(true),
  goalReminders: z.boolean().default(true),
  shareDataForAnalytics: z.boolean().default(false),
});

export const sharedSettingsSchema = z.object({
  splitMethod: z.enum(SPLIT_METHODS, {
    errorMap: () => ({ message: 'Método de división inválido' })
  }).default('EQUAL'),
  
  defaultCurrency: z.string()
    .length(3, 'Código de moneda debe tener 3 caracteres')
    .default('EUR'),
  
  budgetCycle: z.enum(BUDGET_PERIODS, {
    errorMap: () => ({ message: 'Ciclo de presupuesto inválido' })
  }).default('MONTHLY'),
  
  budgetStartDay: z.number()
    .int('Debe ser un número entero')
    .min(1, 'Día mínimo es 1')
    .max(31, 'Día máximo es 31')
    .default(1),
  
  sharedGoalNotifications: z.boolean().default(true),
  
  largeExpenseThreshold: z.number()
    .positive('El umbral debe ser mayor a 0')
    .max(99999.99, 'Umbral máximo es €99,999.99')
    .optional(),
});

/**
 * Esquemas para perfil de pareja
 */
export const coupleProfileSchema = z.object({
  name: z.string()
    .min(1, 'El nombre de la pareja es obligatorio')
    .max(150, 'El nombre no puede tener más de 150 caracteres')
    .trim(),
  currency: z.string()
    .min(3, 'Código de moneda inválido')
    .max(3, 'Código de moneda inválido')
    .default('EUR'),
  timezone: z.string()
    .min(1, 'La zona horaria es obligatoria')
    .default('Europe/Madrid')
});

export const invitePartnerSchema = z.object({
  email: emailSchema,
  message: z.string()
    .max(500, 'El mensaje no puede tener más de 500 caracteres')
    .trim()
    .optional()
});

/**
 * Validaciones para el chatbot
 */
export const chatMessageSchema = z.object({
  content: z.string().min(1, 'El mensaje no puede estar vacío'),
  context: z.object({
    currentPage: z.string().optional(),
    userInfo: z.object({
      name: z.string().optional(),
      email: z.string().optional(),
    }).optional(),
  }).optional(),
  conversationHistory: z.array(z.object({
    role: z.enum(['user', 'assistant']),
    content: z.string(),
  })).optional(),
});

/**
 * Esquemas para exportación y reportes
 */
export const exportOptionsSchema = z.object({
  format: z.enum(['csv', 'pdf', 'excel'], {
    required_error: 'El formato es obligatorio'
  }),
  dateRange: z.object({
    start: dateSchema,
    end: dateSchema
  }).refine(data => data.start <= data.end, {
    message: 'La fecha de inicio debe ser anterior a la de fin'
  }),
  includeCategories: z.array(z.string().cuid()).optional(),
  includeFields: z.array(z.string()).optional()
});

/**
 * Esquemas para paginación y filtros generales
 */
export const paginationSchema = z.object({
  page: z.coerce
    .number()
    .int('La página debe ser un número entero')
    .min(1, 'La página debe ser mayor a 0')
    .default(1),
  limit: z.coerce
    .number()
    .int('El límite debe ser un número entero')
    .min(1, 'El límite debe ser mayor a 0')
    .max(100, 'El límite no puede superar 100')
    .default(20),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc')
});

/**
 * Esquemas para transacciones recurrentes
 */
export const recurringTransactionSchema = z.object({
  name: z.string()
    .min(3, 'El nombre debe tener al menos 3 caracteres')
    .max(100, 'El nombre no puede superar 100 caracteres'),
  
  amount: z.number()
    .positive('El monto debe ser mayor a 0')
    .max(999999.99, 'El monto máximo es €999,999.99'),
  
  type: z.enum(TRANSACTION_TYPES, {
    errorMap: () => ({ message: 'Tipo de transacción inválido' })
  }),
  
  frequency: z.enum(RECURRENCE_FREQUENCIES, {
    errorMap: () => ({ message: 'Frecuencia inválida' })
  }),
  
  categoryId: z.string().cuid('ID de categoría inválido'),
  
  startDate: z.date({
    required_error: 'La fecha de inicio es requerida'
  }),
  
  endDate: z.date().optional(),
  
  dayOfMonth: z.number()
    .int('Debe ser un número entero')
    .min(1, 'Día mínimo es 1')
    .max(31, 'Día máximo es 31')
    .optional(),
  
  dayOfWeek: z.number()
    .int('Debe ser un número entero')
    .min(0, 'Día de la semana mínimo es 0 (Domingo)')
    .max(6, 'Día de la semana máximo es 6 (Sábado)')
    .optional(),
});

/**
 * Tipos exportados para TypeScript
 */
export type SignInFormData = z.infer<typeof signInSchema>;
export type SignUpFormData = z.infer<typeof signUpSchema>;
export type TransactionFormData = z.infer<typeof transactionSchema>;
export type CategoryFormData = z.infer<typeof categorySchema>;
export type BudgetFormData = z.infer<typeof budgetSchema>;
export type SavingsGoalFormData = z.infer<typeof savingsGoalSchema>;
export type ContributionFormData = z.infer<typeof contributionSchema>;
export type UserSettingsFormData = z.infer<typeof userSettingsSchema>;
export type SharedSettingsFormData = z.infer<typeof sharedSettingsSchema>;
export type CoupleProfileFormData = z.infer<typeof coupleProfileSchema>;
export type ChatMessageFormData = z.infer<typeof chatMessageSchema>;
export type ExportOptionsFormData = z.infer<typeof exportOptionsSchema>;
export type PaginationParams = z.infer<typeof paginationSchema>;
export type TransactionFilters = z.infer<typeof transactionFiltersSchema>;
export type RecurringTransactionFormData = z.infer<typeof recurringTransactionSchema>; 

// Exportar tipos inferidos
export type TransactionInput = z.infer<typeof transactionSchema>;
export type CategoryInput = z.infer<typeof categorySchema>;
export type BudgetInput = z.infer<typeof budgetSchema>;
export type SavingsGoalInput = z.infer<typeof savingsGoalSchema>;
export type SavingsContributionInput = z.infer<typeof contributionSchema>;
export type UserSettingsInput = z.infer<typeof userSettingsSchema>;
export type SharedSettingsInput = z.infer<typeof sharedSettingsSchema>;
export type RecurringTransactionInput = z.infer<typeof recurringTransactionSchema>;
export type SignUpInput = z.infer<typeof signUpSchema>;
export type SignInInput = z.infer<typeof signInSchema>; 