import React from "react";
import { useNavigate } from "react-router-dom";
import { XCircle, ArrowLeft, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";

export default function PaymentCancel() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
      >
        <Card className="max-w-md w-full bg-white border-slate-200 shadow-2xl shadow-red-100/50">
          <CardHeader className="text-center pt-10 pb-6">
            <div className="flex justify-center mb-6">
              <div className="bg-red-100 p-4 rounded-full">
                <XCircle className="w-12 h-12 text-red-600" />
              </div>
            </div>
            <CardTitle className="text-3xl font-bold text-slate-900 mb-2">Payment Cancelled</CardTitle>
            <p className="text-slate-500">
              The payment process was cancelled. No charges were made to your account.
            </p>
          </CardHeader>

          <CardContent className="space-y-6 pb-10">
            <p className="text-sm text-slate-600 text-center">
              If you experienced any issues during checkout, please contact our support team.
            </p>

            <div className="flex flex-col gap-3">
              <Button
                onClick={() => navigate("/orgdashboard?view=subscription")}
                className="w-full py-6 bg-slate-900 hover:bg-slate-800 text-white font-bold text-lg shadow-lg shadow-slate-900/20 group"
              >
                <ArrowLeft className="mr-2 h-5 w-5 transition-transform group-hover:-translate-x-1" />
                Return to Plans
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate("/orgdashboard")}
                className="w-full py-6 border-slate-200 text-slate-600 hover:bg-slate-50 font-medium"
              >
                <LayoutDashboard className="mr-2 h-5 w-5" />
                Go to Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
