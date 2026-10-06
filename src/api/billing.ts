import apiClient from "./client";
import type { User, Usage } from "../types";

export interface CheckoutSessionResponse {
  session_id: string;
  url: string;
}

export interface SubscriptionResponse {
  user_id: string;
  status: string;
  stripe_subscription_id?: string | null;
  current_period_end?: number | null;
}

export interface PlanInfo {
  id: string;
  name: string;
  max_file_bytes: number;
  max_transfers: number;
  max_storage_bytes: number;
  transfer_ttl_days: number;
  price_usd_cents: number;
  price_inr_paise: number;
  price_display: string;
}

export interface PlansResponse {
  plans: PlanInfo[];
}

export interface VerifyPaymentResponse {
  verified: boolean;
  user: User;
  usage: Usage;
}

export async function createCheckoutSession(params?: {
  price_id?: string;
  success_url?: string;
  cancel_url?: string;
}): Promise<CheckoutSessionResponse> {
  const res = await apiClient.post<CheckoutSessionResponse>(
    "/billing/checkout",
    params ?? {}
  );
  return res.data;
}

export async function verifyPayment(params: {
  payment_link_id?: string;
  payment_id?: string;
}): Promise<VerifyPaymentResponse> {
  const res = await apiClient.post<VerifyPaymentResponse>(
    "/billing/verify",
    params
  );
  return res.data;
}

export async function getSubscription(): Promise<SubscriptionResponse> {
  const res = await apiClient.get<SubscriptionResponse>("/billing/subscription");
  return res.data;
}

export async function getPlans(): Promise<PlansResponse> {
  const res = await apiClient.get<PlansResponse>("/plans");
  return res.data;
}
