import { type User, type InsertUser, type AssessmentUpload, type InsertAssessmentUpload, type ValidationReport, type InsertValidationReport } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  createAssessmentUpload(upload: InsertAssessmentUpload): Promise<AssessmentUpload>;
  getAssessmentUploads(userId: string): Promise<AssessmentUpload[]>;
  createValidationReport(report: InsertValidationReport): Promise<ValidationReport>;
  getValidationReport(uploadId: string): Promise<ValidationReport | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private assessmentUploads: Map<string, AssessmentUpload>;
  private validationReports: Map<string, ValidationReport>;

  constructor() {
    this.users = new Map();
    this.assessmentUploads = new Map();
    this.validationReports = new Map();
    
    // Add demo user
    const demoUser: User = {
      id: "demo-user-id",
      username: "admin",
      email: "admin@eduvalidate.com",
      password: "password123", // In production, this would be hashed
      createdAt: new Date(),
    };
    this.users.set(demoUser.id, demoUser);
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email === email,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { 
      ...insertUser, 
      id, 
      createdAt: new Date() 
    };
    this.users.set(id, user);
    return user;
  }

  async createAssessmentUpload(insertUpload: InsertAssessmentUpload): Promise<AssessmentUpload> {
    const id = randomUUID();
    const upload: AssessmentUpload = {
      ...insertUpload,
      id,
      createdAt: new Date(),
    };
    this.assessmentUploads.set(id, upload);
    return upload;
  }

  async getAssessmentUploads(userId: string): Promise<AssessmentUpload[]> {
    return Array.from(this.assessmentUploads.values()).filter(
      (upload) => upload.userId === userId
    );
  }

  async createValidationReport(insertReport: InsertValidationReport): Promise<ValidationReport> {
    const id = randomUUID();
    const report: ValidationReport = {
      ...insertReport,
      id,
      createdAt: new Date(),
    };
    this.validationReports.set(id, report);
    return report;
  }

  async getValidationReport(uploadId: string): Promise<ValidationReport | undefined> {
    return Array.from(this.validationReports.values()).find(
      (report) => report.uploadId === uploadId
    );
  }
}

export const storage = new MemStorage();
