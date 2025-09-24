export type Transaction = {
  id: string;            // unique id
  date: string;          // ISO date string (yyyy-mm-dd)
  amount: number;        // positive for incoming, negative for outgoing
  inOut: 'COME' | 'GO';  // 'COME' = income, 'GO' = expense
  type?: string;         // description
  savings?: number;      // optional savings
};
