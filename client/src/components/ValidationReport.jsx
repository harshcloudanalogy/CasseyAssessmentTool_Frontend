// Updated ValidationReport.jsx
import { useLocation, useNavigate } from "react-router-dom"; // Changed to react-router-dom
import { useState, useEffect } from "react";
import { 
  CheckCircle2, 
  Download, 
  ArrowLeft, 
  LogOut, 
  User, 
  Lightbulb,
  FileText,
  Eye
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import logo from "../components/assets/Edulogo.png";

const SmallLogo = () => (
  <img src={logo} alt="EduValidate Logo" className="w-21 h-9 object-contain" />
);

export default function ValidationReport() {
  useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  if (!sessionStorage.getItem("access_token")) return null;
  const { toast } = useToast();
  const [pdfUrl, setPdfUrl] = useState(null);
  const [pdfBlob, setPdfBlob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { apiResponse } = location.state || {};

  useEffect(() => {
    if (apiResponse && apiResponse.pdf_content_base64) {
      console.log("API Response received:", apiResponse.pdf_content_base64.substring(0, 50) + "..."); // Debug log
      setLoading(true);
      setError(null);
      try {
        const base64String = apiResponse.pdf_content_base64;
        // Remove data URL prefix if present (e.g., 'data:application/pdf;base64,')
        const cleanBase64 = base64String.replace(/^data:application\/pdf;base64,/, '');
        const binaryString = atob(cleanBase64);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        const blob = new Blob([bytes], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        setPdfBlob(blob);
        setPdfUrl(url);
        console.log("PDF URL generated:", url); // Debug log
        setLoading(false);
      } catch (err) {
        console.error('Error processing PDF:', err);
        setError('Failed to process PDF. Please try again.');
        setLoading(false);
        toast({
          title: "Error",
          description: "Failed to load PDF preview.",
          variant: "destructive",
        });
      }
    } else {
      setError('No PDF data available. Please generate a report first.');
      setLoading(false);
      console.log("No apiResponse or pdf_content_base64"); // Debug log
    }
  }, [apiResponse, toast]);

  useEffect(() => {
    return () => {
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl);
      }
    };
  }, [pdfUrl]);

  const handleDownloadReport = () => {
    if (pdfBlob) {
      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'validation_report.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: "Report Downloaded",
        description: "Your validation report has been downloaded successfully!",
      });
    } else {
      toast({
        title: "Error",
        description: "PDF not available for download.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Modern Navigation */}
      <nav className="bg-white/80 backdrop-blur-lg shadow-sm border-b border-gray-200/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex justify-between items-center py-5">
            <SmallLogo />
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3 bg-gray-50 px-4 py-2 rounded-full">
                <User className="w-4 h-4 text-gray-600" />
                <span className="font-semibold text-gray-700">Welcome, Admin</span>
              </div>
              <Button 
                onClick={handleDownloadReport}
                disabled={!pdfBlob}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-semibold shadow-lg transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                data-testid="button-download-report"
              >
                <Download className="w-4 h-4 mr-2" />
                Download Report
              </Button>
              <Button 
                variant="ghost"
                onClick={() => navigate("/documents")}
                className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 font-semibold px-4 py-2 rounded-lg"
                data-testid="button-back-to-upload"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Upload
              </Button>
              <Button 
                variant="ghost"
                onClick={() => navigate("/")}
                className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 font-semibold px-4 py-2 rounded-lg"
                data-testid="button-logout"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-600 rounded-2xl mb-6">
            <FileText className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Validation Report
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            View your generated validation report below.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Report Preview Section */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-3xl shadow-lg border border-gray-200/50 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Eye className="w-6 h-6" />
                    <h2 className="text-2xl font-bold">Report Preview</h2>
                  </div>
                  <Button
                    onClick={handleDownloadReport}
                    disabled={!pdfBlob}
                    className="bg-white/20 hover:bg-white/30 text-white border border-white/30 px-4 py-2 rounded-lg font-semibold transition-all disabled:opacity-50"
                    data-testid="button-download-full-report"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                </div>
              </div>
              
              {/* PDF Preview Section */}
              <div className="p-8 bg-gray-50 min-h-[800px] flex items-center justify-center">
                {loading ? (
                  <div className="text-center text-gray-500">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    Loading PDF...
                  </div>
                ) : error ? (
                  <div className="text-center text-red-500">
                    <p>{error}</p>
                  </div>
                ) : pdfUrl ? (
                  <iframe
                    src={pdfUrl}
                    width="100%"
                    height="100%"
                    style={{ minHeight: '800px', border: 'none' }}
                    title="Validation Report PDF"
                    data-testid="pdf-preview"
                  />
                ) : (
                  <div className="text-center text-gray-500">
                    <p>No report available. Please generate a report first.</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-white rounded-3xl shadow-lg border border-gray-200/50">
              <div className="p-6 space-y-4">
                <Button
                  onClick={handleDownloadReport}
                  disabled={!pdfBlob}
                  className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-bold transition-all hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  data-testid="button-download-sidebar"
                >
                  <Download className="w-5 h-5 mr-2" />
                  Download Full Report
                </Button>
                <Button
                  variant="outline"
                  onClick={() => navigate("/documents")}
                  className="w-full py-3 rounded-xl font-bold border-2 hover:bg-blue-50"
                  data-testid="button-upload-new-assessment"
                >
                  <ArrowLeft className="w-5 h-5 mr-2" />
                  Upload New Assessment
                </Button>
              </div>
            </div>

            {/* Next Steps */}
            <div className="bg-white rounded-3xl shadow-lg border border-gray-200/50">
              <div className="p-6">
                <h3 className="flex items-center space-x-2 font-bold text-lg mb-4">
                  <Lightbulb className="w-6 h-6 text-yellow-600" />
                  <span>Next Steps</span>
                </h3>
                <ol className="space-y-3 text-sm text-gray-700">
                  {[
                    "Review the PDF report for detailed analysis",
                    "Implement any suggested improvements",
                    "Re-submit updated assessment tools if needed"
                  ].map((step, index) => (
                    <li key={index} className="flex items-start space-x-3" data-testid={`next-step-${index}`}>
                      <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                        {index + 1}
                      </div>
                      <span>{step}</span>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}