import React, { useState } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createCheckoutSession, fetchSubscriptionDetails, fetchOrgDashboard } from "./api";
import { parseJwt } from "@/lib/auth";

interface Plan {
  id: number;
  name: string;
  price: string;
  period: string;
  features: string[];
  recommended: boolean;
}

export function SubscriptionPurchase() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingId, setLoadingId] = useState<number | null>(null);
  const [currentPlanId, setCurrentPlanId] = useState<number | null>(null);
  const [isSubscribed, setIsSubscribed] = useState(false);

  React.useEffect(() => {
    const loadData = async () => {
      try {
        const token = sessionStorage.getItem("access_token");
        if (token) {
          const decoded = parseJwt(token);
          const orgId = decoded?.organization_id || decoded?.org_id || decoded?.id;
          if (orgId) {
            const orgRes = await fetchOrgDashboard(orgId);
            if (orgRes.success && orgRes.organization) {
              setCurrentPlanId(orgRes.organization.subscription_id);
              setIsSubscribed(orgRes.organization.is_subscribed);
            }
          }
        }

        const response = await fetchSubscriptionDetails();
        if (response.success && response.data) {
          const mappedPlans: Plan[] = response.data.map((item: any) => {
            let price = `$${item.price}`;
            let credits = `${item.credits} Credits`;
            if (item.name === "Lite") {
              price = "$8,000.00";
              credits = "15 Credits";
            } else if (item.name === "Pro") {
              price = "$15,000.00";
              credits = "40 Credits";
            } else if (item.name === "Premium") {
              price = "$22,000.00";
              credits = "75 Credits";
            }
            return {
              id: item.id,
              name: item.name,
              price: price,
              period: item.duration_days === 365 ? "/year" : `/ ${item.duration_days} days`,
              features: [
                credits,
                `${item.duration_days} Days`,
                `Max ${item.max_competencies} Units`,
                item.features || `${item.name} plan`
              ].filter(Boolean),
              recommended: item.name === "Pro" || item.id === 2
            };
          });
          
          // Sort plans by price (Free first, then others)
          const sorted = mappedPlans.sort((a, b) => {
            const priceA = parseInt(a.price.replace('$', ''));
            const priceB = parseInt(b.price.replace('$', ''));
            return priceA - priceB;
          });
          
          setPlans(sorted);
        }
      } catch (error) {
        console.error("Failed to load subscription data:", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const handleSubscribe = async (planId: number) => {
    if (planId === 0) return;
    
    setLoadingId(planId);
    try {
      const response = await createCheckoutSession(planId);
      if (response.checkout_url) {
        window.location.href = response.checkout_url;
      } else {
        alert("Failed to get checkout URL");
      }
    } catch (error) {
      console.error("Subscription error:", error);
      alert("An error occurred while creating the checkout session");
    } finally {
      setLoadingId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-full flex items-center justify-center bg-[#f8fafc]">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-slate-500">Loading subscription plans...</p>
        </div>
      </div>
    );
  }

  // Get paid plans (excluding Free)
  const paidPlans = plans.filter((p: Plan) => p.id !== 0);
  const freePlan = plans.find((p: Plan) => p.id === 0);

  return (
    <div className="bg-[#f8fafc] text-slate-900 p-8 pt-20 pb-40">
      <div className="max-w-6xl mx-auto text-center space-y-4 mb-12">
        <h1 className="text-4xl font-bold tracking-tight text-slate-900">Upgrade Your Plan</h1>
        <p className="text-slate-500 text-lg">
          Unlock more credits and advanced features for your organization.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-12">
        {paidPlans.map((plan) => (
          <PlanCard 
            key={plan.id} 
            plan={plan} 
            onSubscribe={() => handleSubscribe(plan.id)}
            isLoading={loadingId === plan.id}
            isCurrentPlan={currentPlanId === plan.id && isSubscribed}
          />
        ))}
      </div>

      {freePlan && (
        <div className="flex justify-center max-w-6xl mx-auto">
          <div className="w-full md:w-1/3">
            <PlanCard 
              plan={freePlan} 
              onSubscribe={() => handleSubscribe(freePlan.id)}
              isLoading={loadingId === freePlan.id}
              isCurrentPlan={currentPlanId === freePlan.id || !isSubscribed}
            />
          </div>
        </div>
      )}
    </div>
  );
}

function PlanCard({ 
  plan, 
  onSubscribe, 
  isLoading,
  isCurrentPlan
}: { 
  plan: Plan, 
  onSubscribe: () => void,
  isLoading: boolean,
  isCurrentPlan?: boolean
}) {
  const isFree = plan.id === 0;
  const isActive = isCurrentPlan;

  return (
    <Card className={`bg-white border-slate-200 text-slate-900 relative transition-all duration-300 ${isActive ? 'bg-blue-50/40 ring-2 ring-blue-600 shadow-xl shadow-blue-200/50 border-blue-600' : !isFree ? 'hover:scale-105 hover:shadow-2xl hover:shadow-blue-200/50' : ''} flex flex-col h-full ${plan.recommended && !isActive ? 'ring-2 ring-blue-600 shadow-xl shadow-blue-200/50' : 'shadow-sm'}`}>
      {isActive ? (
        <div className="absolute top-0 left-0 right-0 bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest py-1.5 text-center rounded-t-lg">
          Current Plan
        </div>
      ) : plan.recommended && (
        <div className="absolute top-0 left-0 right-0 bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest py-1.5 text-center rounded-t-lg">
          Recommended
        </div>
      )}
      
      <CardHeader className={`text-center pt-10 pb-6 ${plan.recommended ? 'pt-14' : ''}`}>
        <CardTitle className="text-2xl font-bold text-slate-800 mb-2">{plan.name}</CardTitle>
        <div className="flex items-baseline justify-center gap-1">
          <span className="text-4xl font-black text-slate-900">{plan.price}</span>
          <span className="text-sm text-slate-500">{plan.period}</span>
        </div>
      </CardHeader>

      <CardContent className="space-y-6 flex-1 flex flex-col justify-between">
        <ul className="space-y-4">
          {plan.features.map((feature, idx) => (
            <li key={idx} className="flex items-center gap-3 text-sm text-slate-600">
              <CheckCircle2 className="w-4 h-4 text-blue-500 shrink-0" />
              <span>{feature}</span>
            </li>
          ))}
        </ul>

        <Button 
          onClick={onSubscribe}
          disabled={(isFree || isLoading || isActive)}
          className={`w-full py-6 mt-8 font-bold text-md transition-all ${
            isActive
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
              : isFree 
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                : plan.recommended 
                  ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/20' 
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-900 border border-slate-200 shadow-sm'
          }`}
        >
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : isActive ? (
            "Subscribed"
          ) : isFree ? (
            "Current Plan"
          ) : (
            "Subscribe"
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
