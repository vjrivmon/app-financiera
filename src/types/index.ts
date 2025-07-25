/**
 * Tipos centralizados para la aplicación financiera de parejas
 * Proporciona type safety y consistencia en toda la aplicación
 */

import { 
  User, 
  CoupleProfile, 
  Transaction, 
  Category, 
  Budget, 
  SavingsGoal,
  SavingsGoalContribution,
  UserSettings,
  SharedSettings,
  RecurringTransaction,
  TransactionType,
  BudgetPeriod,
  Priority,
  Theme,
  ChatbotPersonality,
  SplitMethod,
  RecurrenceFrequency
} from '@prisma/client';

// Re-exportar enums de Prisma para fácil acceso
export {
  TransactionType,
  BudgetPeriod,
  Priority,
  Theme,
  ChatbotPersonality,
  SplitMethod,
  RecurrenceFrequency
};

/**
 * Tipos extendidos con relaciones para vistas complejas
 */

// Usuario con todas sus relaciones
export type UserWithRelations = User & {
  coupleProfile?: CoupleProfileWithRelations;
  settings?: UserSettings;
  transactions: TransactionWithRelations[];
  categories: Category[];
  savingsGoalContributions: SavingsGoalContributionWithRelations[];
};

// Perfil de pareja con relaciones completas
export type CoupleProfileWithRelations = CoupleProfile & {
  users: User[];
  transactions: TransactionWithRelations[];
  categories: Category[];
  budgets: BudgetWithRelations[];
  savingsGoals: SavingsGoalWithRelations[];
  sharedSettings?: SharedSettings;
};

// Transacción con categoría y usuario
export type TransactionWithRelations = Transaction & {
  category: Category;
  user: User;
  recurringTransaction?: RecurringTransaction;
};

// Presupuesto con categoría
export type BudgetWithRelations = Budget & {
  category: Category;
};

// Objetivo de ahorro con contribuciones
export type SavingsGoalWithRelations = SavingsGoal & {
  contributions: SavingsGoalContributionWithRelations[];
};

// Contribución con usuario
export type SavingsGoalContributionWithRelations = SavingsGoalContribution & {
  user: User;
};

/**
 * Tipos para formularios y validaciones
 */

// Formulario de nueva transacción
export interface TransactionFormData {
  amount: number;
  description: string;
  categoryId: string;
  type: TransactionType;
  date: Date;
  notes?: string;
  location?: string;
}

// Formulario de nueva categoría
export interface CategoryFormData {
  name: string;
  description?: string;
  icon: string;
  color: string;
  type: TransactionType;
}

// Formulario de nuevo presupuesto
export interface BudgetFormData {
  name: string;
  amount: number;
  categoryId: string;
  period: BudgetPeriod;
  startDate: Date;
  endDate?: Date;
  alertThreshold?: number;
}

// Formulario de objetivo de ahorro
export interface SavingsGoalFormData {
  name: string;
  description?: string;
  targetAmount: number;
  targetDate?: Date;
  icon?: string;
  color?: string;
  priority: Priority;
}

// Formulario de contribución a objetivo
export interface ContributionFormData {
  savingsGoalId: string;
  amount: number;
  notes?: string;
}

/**
 * Tipos para dashboard y analytics
 */

// Resumen financiero mensual
export interface MonthlyFinancialSummary {
  totalIncome: number;
  totalExpenses: number;
  balance: number;
  savingsRate: number;
  budgetUtilization: number;
  categoryBreakdown: CategoryExpenseBreakdown[];
  monthOverMonthGrowth: {
    income: number;
    expenses: number;
    savings: number;
  };
}

// Desglose por categoría
export interface CategoryExpenseBreakdown {
  categoryId: string;
  categoryName: string;
  categoryIcon: string;
  categoryColor: string;
  amount: number;
  percentage: number;
  budgetAmount?: number;
  budgetUtilization?: number;
}

// Progreso de objetivos
export interface SavingsGoalProgress {
  goalId: string;
  goalName: string;
  targetAmount: number;
  currentAmount: number;
  progressPercentage: number;
  monthlyContribution: number;
  projectedCompletionDate?: Date;
  isOnTrack: boolean;
}

// Métricas del dashboard
export interface DashboardMetrics {
  currentBalance: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  activeBudgets: number;
  activeSavingsGoals: number;
  upcomingRecurringTransactions: RecurringTransaction[];
  recentTransactions: TransactionWithRelations[];
  budgetAlerts: BudgetAlert[];
}

// Alertas de presupuesto
export interface BudgetAlert {
  budgetId: string;
  budgetName: string;
  categoryName: string;
  currentAmount: number;
  budgetAmount: number;
  utilizationPercentage: number;
  alertType: 'warning' | 'exceeded' | 'near_limit';
}

/**
 * Tipos para configuraciones de usuario
 */

// Configuraciones completas del usuario
export interface UserPreferences {
  personal: UserSettings;
  shared?: SharedSettings;
  notifications: NotificationSettings;
  privacy: PrivacySettings;
}

// Configuraciones de notificaciones
export interface NotificationSettings {
  email: boolean;
  push: boolean;
  budgetAlerts: boolean;
  goalReminders: boolean;
  transactionReminders: boolean;
  weeklyReports: boolean;
  monthlyReports: boolean;
}

// Configuraciones de privacidad
export interface PrivacySettings {
  shareDataForAnalytics: boolean;
  shareDataWithPartner: boolean;
  allowLocationTracking: boolean;
  allowReceiptScanning: boolean;
}

/**
 * Tipos para el chatbot IA
 */

// Mensaje del chat
export interface ChatMessage {
  id: string;
  content: string;
  role: 'user' | 'assistant' | 'system';
  timestamp: Date;
  metadata?: ChatMessageMetadata;
}

// Metadatos del mensaje
export interface ChatMessageMetadata {
  functionCalled?: string;
  financialData?: unknown;
  suggestedActions?: SuggestedAction[];
  confidence?: number;
}

// Acciones sugeridas por la IA
export interface SuggestedAction {
  id: string;
  type: 'create_budget' | 'add_transaction' | 'set_goal' | 'adjust_budget';
  title: string;
  description: string;
  data: unknown;
}

// Contexto del chatbot
export interface ChatbotContext {
  userId: string;
  coupleId: string;
  currentMonth: Date;
  financialSummary: MonthlyFinancialSummary;
  recentTransactions: TransactionWithRelations[];
  activeBudgets: BudgetWithRelations[];
  savingsGoals: SavingsGoalWithRelations[];
}

/**
 * Tipos para API responses
 */

// Respuesta estándar de la API
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    hasMore?: boolean;
  };
}

// Filtros para transacciones
export interface TransactionFilters {
  startDate?: Date;
  endDate?: Date;
  categoryIds?: string[];
  type?: TransactionType;
  userId?: string;
  minAmount?: number;
  maxAmount?: number;
  search?: string;
}

// Opciones de paginación
export interface PaginationOptions {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/**
 * Tipos para exportación de datos
 */

// Opciones de exportación
export interface ExportOptions {
  format: 'csv' | 'pdf' | 'excel';
  dateRange: {
    start: Date;
    end: Date;
  };
  includeCategories?: string[];
  includeFields?: string[];
}

// Datos para reporte
export interface ReportData {
  summary: MonthlyFinancialSummary;
  transactions: TransactionWithRelations[];
  budgets: BudgetWithRelations[];
  savingsGoals: SavingsGoalWithRelations[];
  generatedAt: Date;
  period: {
    start: Date;
    end: Date;
  };
}

/**
 * Tipos para validación de formularios
 */

// Errores de validación
export interface ValidationError {
  field: string;
  message: string;
  code?: string;
}

// Estado de validación
export interface ValidationState {
  isValid: boolean;
  errors: ValidationError[];
  warnings?: ValidationError[];
}

/**
 * Tipos para temas y personalización
 */

// Configuración de tema
export interface ThemeConfig {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  text: string;
  borders: string;
}

// Configuración de iconos de categoría
export interface CategoryIconConfig {
  [key: string]: {
    icon: string;
    color: string;
    gradient?: string;
  };
} 