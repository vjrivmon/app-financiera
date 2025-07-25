/**
 * Esquemas de validación Zod para la aplicación financiera
 * Garantiza la integridad de datos en formularios y APIs
 */

import { z } from 'zod';
import { 
  TransactionType, 
  BudgetPeriod, 
  Priority, 
  Theme, 
  ChatbotPersonality, 
  SplitMethod 
} from '@prisma/client';

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
const nameSchema = z.string()
  .min(1, 'El nombre es obligatorio')
  .max(100, 'El nombre no puede tener más de 100 caracteres')
  .trim();

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

const futureDateSchema = z.date()
  .refine(date => date > new Date(), 'La fecha debe ser futura');

const pastOrPresentDateSchema = z.date()
  .refine(date => date <= new Date(), 'La fecha no puede ser futura');

/**
 * Esquemas de autenticación
 */
export const signInSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'La contraseña es obligatoria'),
  remember: z.boolean().optional().default(false)
});

export const signUpSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  password: passwordSchema,
  confirmPassword: z.string(),
  acceptTerms: z.boolean()
    .refine(val => val === true, 'Debes aceptar los términos y condiciones'),
  coupleName: z.string()
    .min(1, 'El nombre de la pareja es obligatorio')
    .max(150, 'El nombre de la pareja no puede tener más de 150 caracteres')
    .trim()
    .optional()
}).refine(data => data.password === data.confirmPassword, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmPassword']
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
 * Esquemas para transacciones financieras
 */
export const transactionSchema = z.object({
  amount: currencySchema,
  description: z.string()
    .min(1, 'La descripción es obligatoria')
    .max(200, 'La descripción no puede tener más de 200 caracteres')
    .trim(),
  categoryId: z.string()
    .min(1, 'La categoría es obligatoria')
    .cuid('ID de categoría inválido'),
  type: z.nativeEnum(TransactionType, {
    required_error: 'El tipo de transacción es obligatorio',
    invalid_type_error: 'Tipo de transacción inválido'
  }),
  date: pastOrPresentDateSchema,
  notes: z.string()
    .max(1000, 'Las notas no pueden tener más de 1000 caracteres')
    .trim()
    .optional(),
  location: z.string()
    .max(200, 'La ubicación no puede tener más de 200 caracteres')
    .trim()
    .optional(),
  receipt: z.string()
    .url('URL de recibo inválida')
    .optional()
});

export const transactionUpdateSchema = transactionSchema.partial();

export const transactionFiltersSchema = z.object({
  startDate: dateSchema.optional(),
  endDate: dateSchema.optional(),
  categoryIds: z.array(z.string().cuid()).optional(),
  type: z.nativeEnum(TransactionType).optional(),
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
 * Esquemas para categorías
 */
export const categorySchema = z.object({
  name: nameSchema,
  description: descriptionSchema,
  icon: z.string()
    .min(1, 'El icono es obligatorio')
    .max(50, 'Nombre de icono demasiado largo'),
  color: z.string()
    .regex(/^#[0-9A-F]{6}$/i, 'Color hexadecimal inválido'),
  type: z.nativeEnum(TransactionType, {
    required_error: 'El tipo de categoría es obligatorio'
  })
});

export const categoryUpdateSchema = categorySchema.partial();

/**
 * Esquemas para presupuestos
 */
export const budgetSchema = z.object({
  name: nameSchema,
  amount: currencySchema,
  categoryId: z.string()
    .min(1, 'La categoría es obligatoria')
    .cuid('ID de categoría inválido'),
  period: z.nativeEnum(BudgetPeriod, {
    required_error: 'El período es obligatorio'
  }),
  startDate: dateSchema,
  endDate: dateSchema.optional(),
  alertThreshold: z.coerce
    .number()
    .min(0.1, 'El umbral debe ser al menos 10%')
    .max(1, 'El umbral no puede superar 100%')
    .optional()
}).refine(data => {
  if (data.endDate) {
    return data.startDate < data.endDate;
  }
  return true;
}, {
  message: 'La fecha de fin debe ser posterior a la de inicio',
  path: ['endDate']
});

export const budgetUpdateSchema = budgetSchema.partial();

/**
 * Esquemas para objetivos de ahorro
 */
export const savingsGoalSchema = z.object({
  name: nameSchema,
  description: descriptionSchema,
  targetAmount: currencySchema,
  targetDate: futureDateSchema.optional(),
  icon: z.string()
    .max(50, 'Nombre de icono demasiado largo')
    .optional(),
  color: z.string()
    .regex(/^#[0-9A-F]{6}$/i, 'Color hexadecimal inválido')
    .optional(),
  priority: z.nativeEnum(Priority).default('MEDIUM')
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
 * Esquemas para configuraciones de usuario
 */
export const userSettingsSchema = z.object({
  theme: z.nativeEnum(Theme).default('LIGHT'),
  language: z.string()
    .min(2, 'Código de idioma inválido')
    .max(5, 'Código de idioma inválido')
    .default('es'),
  currency: z.string()
    .min(3, 'Código de moneda inválido')
    .max(3, 'Código de moneda inválido')
    .default('EUR'),
  emailNotifications: z.boolean().default(true),
  pushNotifications: z.boolean().default(true),
  budgetAlerts: z.boolean().default(true),
  goalReminders: z.boolean().default(true),
  shareDataForAnalytics: z.boolean().default(false),
  chatbotPersonality: z.nativeEnum(ChatbotPersonality).default('FRIENDLY')
});

export const sharedSettingsSchema = z.object({
  splitMethod: z.nativeEnum(SplitMethod).default('EQUAL'),
  defaultCurrency: z.string()
    .min(3, 'Código de moneda inválido')
    .max(3, 'Código de moneda inválido')
    .default('EUR'),
  budgetCycle: z.nativeEnum(BudgetPeriod).default('MONTHLY'),
  budgetStartDay: z.number()
    .min(1, 'El día debe ser entre 1 y 31')
    .max(31, 'El día debe ser entre 1 y 31')
    .default(1),
  sharedGoalNotifications: z.boolean().default(true),
  largeExpenseThreshold: optionalCurrencySchema
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
 * Esquemas para chatbot y IA
 */
export const chatMessageSchema = z.object({
  content: z.string()
    .min(1, 'El mensaje no puede estar vacío')
    .max(2000, 'El mensaje no puede tener más de 2000 caracteres')
    .trim(),
  context: z.object({
    currentPage: z.string().optional(),
    selectedFilters: z.record(z.unknown()).optional(),
    recentActions: z.array(z.string()).optional()
  }).optional()
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
  name: nameSchema,
  amount: currencySchema,
  type: z.nativeEnum(TransactionType),
  categoryId: z.string().cuid('ID de categoría inválido'),
  frequency: z.enum(['DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY'], {
    required_error: 'La frecuencia es obligatoria'
  }),
  startDate: dateSchema,
  endDate: futureDateSchema.optional(),
  dayOfMonth: z.number()
    .min(1, 'El día debe estar entre 1 y 31')
    .max(31, 'El día debe estar entre 1 y 31')
    .optional(),
  dayOfWeek: z.number()
    .min(0, 'El día de la semana debe estar entre 0 y 6')
    .max(6, 'El día de la semana debe estar entre 0 y 6')
    .optional()
}).refine(data => {
  // Validar que dayOfMonth se especifica para frecuencia MONTHLY
  if (data.frequency === 'MONTHLY' && !data.dayOfMonth) {
    return false;
  }
  // Validar que dayOfWeek se especifica para frecuencia WEEKLY
  if (data.frequency === 'WEEKLY' && data.dayOfWeek === undefined) {
    return false;
  }
  return true;
}, {
  message: 'Configuración de frecuencia incompleta'
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