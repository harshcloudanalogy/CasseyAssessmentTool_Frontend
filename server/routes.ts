import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import multer from "multer";
import path from "path";
import { z } from "zod";

// Configure multer for file uploads
const upload = multer({
  dest: 'uploads/',
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['.pdf', '.doc', '.docx', '.txt'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, DOC, DOCX, and TXT files are allowed.'));
    }
  },
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Authentication routes
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = loginSchema.parse(req.body);
      
      const user = await storage.getUserByEmail(email);
      
      if (!user || user.password !== password) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // In a real application, you would set up proper session management here
      res.json({ 
        message: "Login successful", 
        user: { id: user.id, email: user.email, username: user.username }
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // File upload route
  app.post("/api/upload", upload.array('files'), async (req, res) => {
    try {
      const files = req.files as Express.Multer.File[];
      const competencyUnit = req.body.competencyUnit;

      if (!files || files.length === 0) {
        return res.status(400).json({ message: "No files uploaded" });
      }

      if (!competencyUnit) {
        return res.status(400).json({ message: "Competency unit is required" });
      }

      const uploads = [];
      
      for (const file of files) {
        const upload = await storage.createAssessmentUpload({
          userId: "demo-user-id", // In a real app, get this from session
          competencyUnit,
          originalFilename: file.originalname,
          fileSize: file.size.toString(),
          fileType: file.mimetype,
          uploadPath: file.path,
        });
        uploads.push(upload);
      }

      res.json({ 
        message: "Files uploaded successfully", 
        uploads 
      });
    } catch (error) {
      console.error("Upload error:", error);
      res.status(500).json({ message: "Upload failed" });
    }
  });

  // Generate validation report
  app.post("/api/generate-report", async (req, res) => {
    try {
      const { competencyUnit, files } = req.body;

      if (!competencyUnit || !files) {
        return res.status(400).json({ message: "Missing required data" });
      }

      // Simulate AI processing time
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Generate mock validation report data
      const reportData = {
        competencyUnit,
        filesAnalyzed: files,
        overallScore: 85,
        requirementsMet: [
          "Assessment covers all required knowledge elements",
          "Clear instructions provided to candidates",
          "Appropriate marking criteria included",
          "Alignment with unit performance criteria"
        ],
        areasForImprovement: [
          "Missing evidence requirements documentation",
          "Insufficient practical demonstration tasks",
          "Accessibility considerations not addressed"
        ],
        suggestions: [
          {
            title: "Evidence Requirements",
            description: "Include a dedicated section outlining specific evidence that candidates must provide for each assessment task."
          },
          {
            title: "Practical Demonstrations",
            description: "Add hands-on tasks that require candidates to demonstrate practical application of business administration skills."
          },
          {
            title: "Accessibility",
            description: "Include provisions for candidates with diverse learning needs and accessibility requirements."
          }
        ],
        nextSteps: [
          "Review and implement the improvement suggestions above",
          "Update assessment documentation to include evidence requirements",
          "Add practical demonstration components where appropriate",
          "Ensure accessibility guidelines are met",
          "Re-submit for validation once improvements are made"
        ],
        generatedAt: new Date().toISOString()
      };

      // Create validation report record
      const report = await storage.createValidationReport({
        uploadId: "mock-upload-id", // In real app, link to actual upload
        reportData,
        complianceScore: "85",
      });

      res.json({ 
        message: "Report generated successfully", 
        report: reportData 
      });
    } catch (error) {
      console.error("Report generation error:", error);
      res.status(500).json({ message: "Failed to generate report" });
    }
  });

  // Request Demo route
  app.post("/api/request-demo", async (req, res) => {
    try {
      const { name, email, rtoName } = req.body;
      if (!name || !email || !rtoName) {
        return res.status(400).json({ message: "Name, email, and RTO name are required." });
      }
      console.log(`[DEMO REQUEST RECEIVED] Name: ${name}, Email: ${email}, RTO Name: ${rtoName}`);
      res.json({ success: true, message: "Demo request received successfully." });
    } catch (error) {
      console.error("Demo request error:", error);
      res.status(500).json({ message: "Failed to submit demo request." });
    }
  });
  
  // Competency Unit routes
  app.get("/api/units/ready_for_validation_report", async (req, res) => {
    try {
      const units = await storage.getCompetencyUnits();
      res.json({ unit_codes: units });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch units" });
    }
  });

  app.post("/api/competency-units/add", async (req, res) => {
    try {
      const { unit_code } = req.body;
      if (!unit_code) {
        return res.status(400).json({ message: "Unit code is required" });
      }
      await storage.addCompetencyUnit(unit_code);
      res.json({ success: true, message: "Unit added successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to add unit" });
    }
  });

  app.delete("/api/competency-units/:unitCode", async (req, res) => {
    try {
      const { unitCode } = req.params;
      const success = await storage.deleteCompetencyUnit(unitCode);
      if (success) {
        res.json({ success: true, message: "Unit deleted successfully" });
      } else {
        res.status(404).json({ success: false, message: "Unit not found" });
      }
    } catch (error) {
      res.status(500).json({ success: false, message: "Failed to delete unit" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
