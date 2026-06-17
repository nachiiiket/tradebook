export interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  name: string;
}

export interface Strategy {
  id: number;
  name: string;
  description: string;
  color: string;
  rules: string;
  is_active: boolean;
  trade_count: number;
  win_rate: number;
  created_at: string;
  updated_at: string;
}

export interface TradeImage {
  id: number;
  caption: string;
  mime_type: string;
  original_filename: string;
  file_size: number;
  width: number;
  height: number;
  image_base64: string;
  created_at: string;
}

export interface Trade {
  id: number;
  strategy: number | null;
  strategy_name: string | null;
  strategy_color: string | null;
  symbol: string;
  direction: "long" | "short";
  entry_price: string | null;
  exit_price: string | null;
  stop_loss: string | null;
  take_profit: string | null;
  position_size: string | null;
  result: "win" | "loss" | "breakeven";
  rr_ratio: string | null;
  planned_rr: string | null;
  pnl: string;
  pnl_percent: string | null;
  trade_date: string;
  trade_time: string | null;
  session: string | null;
  timeframe: string | null;
  timeframe_confluences: string[];
  confluences: string[];
  notes: string;
  emotional_state: string;
  mistakes: string;
  lessons_learned: string;
  tags: string[];
  images: TradeImage[];
  created_at: string;
  updated_at: string;
}

export interface CalendarDay {
  date: string;
  day: number;
  weekday: string;
  pnl: number;
  trades: number;
  wins: number;
  losses: number;
}

export interface CalendarData {
  year: number;
  month: number;
  month_pnl: number;
  days: CalendarDay[];
}

export interface StrategyBreakdown {
  strategy_id: number | null;
  strategy_name: string;
  color: string;
  pnl: number;
  trades: number;
  wins: number;
  losses: number;
  win_rate: number;
  avg_rr: number;
}

export interface AnalyticsData {
  overview: {
    total_trades: number;
    wins: number;
    losses: number;
    breakevens: number;
    win_rate: number;
    loss_rate: number;
    total_pnl: number;
    avg_pnl: number;
    avg_rr: number;
    profit_factor: number;
    best_trade: { symbol: string; pnl: number } | null;
    worst_trade: { symbol: string; pnl: number } | null;
    current_streak: { type: string | null; count: number };
  };
  calendar: CalendarData;
  monthly: Array<{
    month: string;
    month_label: string;
    pnl: number;
    trades: number;
    wins: number;
    losses: number;
    win_rate: number;
  }>;
  weekly: Array<{
    week_start: string;
    pnl: number;
    trades: number;
    wins: number;
    losses: number;
  }>;
  sessions: Array<{
    session: string;
    pnl: number;
    trades: number;
    wins: number;
    losses: number;
    win_rate: number;
    avg_rr: number;
  }>;
  strategies: StrategyBreakdown[];
  day_of_week: Array<{
    weekday: number;
    day_name: string;
    pnl: number;
    trades: number;
    wins: number;
    win_rate: number;
  }>;
  symbols: Array<{
    symbol: string;
    pnl: number;
    trades: number;
    wins: number;
    win_rate: number;
  }>;
  rr_distribution: Record<string, number>;
}

export interface TradeAnalysis {
  summary: string;
  strengths: string[];
  weaknesses: string[];
  improvements: string[];
  risk_notes: string[];
  pattern_insight?: string;
  ai_powered: boolean;
}

export interface PortfolioCoach {
  summary: string;
  top_patterns?: string[];
  recommendations: string[];
  focus_areas?: string[];
  ai_powered: boolean;
}
