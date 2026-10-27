/** One day's published rates, in rupees per gram. */
export interface GoldRate {
  /** Calendar day in India, YYYY-MM-DD. One entry per day. */
  date: string;
  /** 22 carat (916) gold, per gram. Always required. */
  gold22: number;
  /** 18 carat gold, per gram. Optional. */
  gold18?: number;
  /** 24 carat gold, per gram. Optional. */
  gold24?: number;
  /** Silver, per gram. Optional. */
  silver?: number;
  /** Optional short line shown on the poster (e.g. an offer). */
  note?: string;
  /** ISO timestamp of the last save; used to bust poster caches. */
  updatedAt: string;
}

/** Grams in one pavan (sovereign), the unit Kerala customers quote. */
export const GRAMS_PER_PAVAN = 8;
