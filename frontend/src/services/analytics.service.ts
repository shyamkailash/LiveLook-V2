import { apiGet } from "@/services/api";
import type { DistributionPoint, TrendPoint, UsagePoint } from "@/types/analytics";

export interface AnalyticsResponse {
  trend: TrendPoint[];
  distribution: DistributionPoint[];
  usage: UsagePoint[];
}

const emptyAnalytics: AnalyticsResponse = {
  trend: [],
  distribution: [],
  usage: [],
};

export function getAnalytics() {
  return apiGet<AnalyticsResponse>("/analytics", emptyAnalytics);
}
