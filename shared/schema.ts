import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const assessmentUploads = pgTable("assessment_uploads", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  competencyUnit: text("competency_unit").notNull(),
  originalFilename: text("original_filename").notNull(),
  fileSize: text("file_size").notNull(),
  fileType: text("file_type").notNull(),
  uploadPath: text("upload_path").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const validationReports = pgTable("validation_reports", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  uploadId: varchar("upload_id").references(() => assessmentUploads.id).notNull(),
  reportData: jsonb("report_data").notNull(),
  complianceScore: text("compliance_score").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertAssessmentUploadSchema = createInsertSchema(assessmentUploads).omit({
  id: true,
  createdAt: true,
});

export const insertValidationReportSchema = createInsertSchema(validationReports).omit({
  id: true,
  createdAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertAssessmentUpload = z.infer<typeof insertAssessmentUploadSchema>;
export type AssessmentUpload = typeof assessmentUploads.$inferSelect;
export type InsertValidationReport = z.infer<typeof insertValidationReportSchema>;
export type ValidationReport = typeof validationReports.$inferSelect;
