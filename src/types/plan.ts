import { ReactNode } from "react";

export type Plan = {
  name: string;
  description: string;
  icon: ReactNode;
  monthlyPrice: number | null;
  yearlyPrice: number | null;
  popular: boolean;
  features: string[];
  limitations: string[];
};
