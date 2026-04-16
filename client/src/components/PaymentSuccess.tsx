import React from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle2, ArrowRight, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";

export default function PaymentSuccess() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="max-w-md w-full bg-white border-slate-200 shadow-2xl shadow-blue-100/50">
          <CardHeader className="text-center pt-10 pb-6">
            <div className="flex justify-center mb-6">
              <div className="bg-green-100 p-4 rounded-full">
                <CheckCircle2 className="w-12 h-12 text-green-600" />
              </div>
            </div>
            <CardTitle className="text-3xl font-bold text-slate-900 mb-2">Payment Successful!</CardTitle>
            <p className="text-slate-500">
              Your subscription has been activated successfully. Thank you for choosing EduValidate.
            </p>
          </CardHeader>

          <CardContent className="space-y-6 pb-10">
            <div className="bg-slate-50 rounded-lg p-4 border border-slate-100">
              <p className="text-sm text-slate-600 text-center italic">
                "Empowering education through precise validation."
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <Button
                onClick={() => navigate("/orgdashboard")}
                className="w-full py-6 bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg shadow-lg shadow-blue-600/20 group"
              >
                <LayoutDashboard className="mr-2 h-5 w-5" />
                Back to Dashboard
                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
