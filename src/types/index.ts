/**
 * Tipos centralizados para la aplicación financiera de parejas
 * Incluye interfaces, tipos y enums reutilizables
 */

import {
  User,
  CoupleProfile,
  Transaction,
  Category,
  Budget,
  SavingsGoal,
  SavingsGoalContribution,
  RecurringTransaction,
  UserSettings,
  SharedSettings,
  Account,
  Session,
} from '@prisma/client';

// Importar tipos de validación que actúan como enums
import type {
  TransactionType,
  BudgetPeriod,
  Priority,
  Theme,
  ChatbotPersonality,
  SplitMethod,
  RecurrenceFrequency
} from '@/lib/validations';

// Re-exportar tipos de Prisma para uso en componentes
export type {
  User,
  CoupleProfile,
  Transaction,
  Category,
  Budget,
  SavingsGoal,
  SavingsGoalContribution,
  RecurringTransaction,
  UserSettings,
  SharedSettings,
  Account,
  Session,
  TransactionType,
  BudgetPeriod,
  Priority,
  Theme,
  ChatbotPersonality,
  SplitMethod,
  RecurrenceFrequency
};

// Tipos extendidos con relaciones para componentes de UI
export interface UserWithCoupleProfile extends User {
  coupleProfile?: CoupleProfile | null;
  settings?: UserSettings | null;
}

export interface CoupleProfileWithUsers extends CoupleProfile {
  users: User[];
  sharedSettings?: SharedSettings | null;
}

export interface TransactionWithCategory extends Transaction {
  category: Category;
  user: User;
}

export interface TransactionWithDetails extends Transaction {
  category: Category;
  user: User;
  couple: CoupleProfile;
}

export interface CategoryWithTransactions extends Category {
  transactions: Transaction[];
  _count?: {
    transactions: number;
  };
}

export interface BudgetWithCategory extends Budget {
  category: Category;
}

export interface BudgetWithDetails extends Budget {
  category: Category;
  couple: CoupleProfile;
  _sum?: {
    transactions: {
      amount: number;
    };
  };
}

export interface SavingsGoalWithContributions extends SavingsGoal {
  contributions: SavingsGoalContribution[];
  _sum?: {
    contributions: {
      amount: number;
    };
  };
}

export interface SavingsGoalWithDetails extends SavingsGoal {
  contributions: (SavingsGoalContribution & { user: User })[];
  couple: CoupleProfile;
}

// Tipos para componentes específicos
export interface DashboardData {
  user: UserWithCoupleProfile;
  recentTransactions: TransactionWithCategory[];
  monthlyBudgets: BudgetWithDetails[];
  savingsGoals: SavingsGoalWithContributions[];
  monthlyStats: {
    totalIncome: number;
    totalExpenses: number;
    netSavings: number;
    budgetUsage: number;
  };
}

export interface FinancialSummary {
  totalIncome: number;
  totalExpenses: number;
  netBalance: number;
  budgetUsed: number;
  budgetRemaining: number;
  savingsProgress: number;
  transactionCount: number;
}

export interface MonthlyStats {
  month: string;
  income: number;
  expenses: number;
  net: number;
  budgetUsage: number;
}

// Tipos para formularios y APIs
export interface TransactionFilters {
  type?: TransactionType;
  categoryId?: string;
  startDate?: Date;
  endDate?: Date;
  minAmount?: number;
  maxAmount?: number;
  search?: string;
}

export interface BudgetAnalysis {
  budget: BudgetWithCategory;
  spent: number;
  remaining: number;
  percentage: number;
  isOverBudget: boolean;
  daysRemaining: number;
  averageDailySpend: number;
  projectedTotal: number;
}

export interface SavingsGoalProgress {
  goal: SavingsGoal;
  currentAmount: number;
  percentage: number;
  monthlyTarget: number;
  isOnTrack: boolean;
  daysRemaining?: number;
  contributionsThisMonth: number;
}

// Tipos para notificaciones y alertas
export interface NotificationData {
  id: string;
  type: 'budget_alert' | 'goal_reminder' | 'large_expense' | 'monthly_summary';
  title: string;
  message: string;
  data?: any;
  isRead: boolean;
  createdAt: Date;
}

export interface BudgetAlert {
  budgetId: string;
  budgetName: string;
  categoryName: string;
  threshold: number;
  currentUsage: number;
  severity: 'warning' | 'danger';
}

// Tipos para el chatbot IA
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  context?: {
    type: 'transaction' | 'budget' | 'goal' | 'general';
    data?: any;
  };
}

export interface ChatContext {
  recentTransactions: TransactionWithCategory[];
  currentBudgets: BudgetWithDetails[];
  savingsGoals: SavingsGoalWithContributions[];
  userSettings: UserSettings;
  coupleSettings: SharedSettings;
}

// Tipos para exports y reportes
export interface ReportData {
  period: {
    start: Date;
    end: Date;
  };
  summary: FinancialSummary;
  transactions: TransactionWithDetails[];
  budgets: BudgetAnalysis[];
  goals: SavingsGoalProgress[];
}

export interface ExportOptions {
  format: 'csv' | 'pdf' | 'json';
  period: 'month' | 'quarter' | 'year' | 'custom';
  startDate?: Date;
  endDate?: Date;
  includeTransactions: boolean;
  includeBudgets: boolean;
  includeGoals: boolean;
}

// Tipos para configuraciones y preferencias
export interface ThemeConfig {
  theme: Theme;
  primaryColor: string;
  accentColor: string;
  borderRadius: 'none' | 'sm' | 'md' | 'lg' | 'full';
  animations: boolean;
}

export interface LocalizationConfig {
  language: string;
  currency: string;
  dateFormat: string;
  numberFormat: string;
  timezone: string;
}

// Tipos para validación y errores
export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  errors?: ValidationError[];
  message?: string;
}

export interface PaginatedResponse<T = any> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// Tipos para configuración de la aplicación
export interface AppConfig {
  name: string;
  version: string;
  environment: 'development' | 'staging' | 'production';
  features: {
    chatbot: boolean;
    oauth: boolean;
    analytics: boolean;
    notifications: boolean;
  };
  limits: {
    maxTransactionsPerMonth: number;
    maxBudgetsPerCouple: number;
    maxSavingsGoals: number;
    maxFileUploadSize: number;
  };
} 