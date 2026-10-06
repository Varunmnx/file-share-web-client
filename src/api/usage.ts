import api from "./client";
import type { Usage, Plan } from "../types";

export async function getUsage(): Promise<Usage> {
  const { data } = await api.get<Usage>("/usage");
  return data;
}

export async function getPlans(): Promise<Plan[]> {
  const { data } = await api.get<Plan[]>("/plans");
  return data;
}
