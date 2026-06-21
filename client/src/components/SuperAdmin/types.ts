export interface DocRecord {
    id: string;
    org: string;
    name: string;
    type: string;
    uploadedAt: string;
    status: "Authentic" | "Issue" | "In Review";
    score: number;
    model: string;
    owner: string;
}

export interface DocTemplate {
    id: string;
    name: string;
    version: string;
    tags: string[];
    description: string;
    enabled: boolean;
    fileName?: string;
    fileType?: string;
    fileSize?: number;
}

export interface CompetencyUnit {
    id: string;
    unit: string;
    code: string;
    weight: number;
    description: string;
    enabled: boolean;
    fileName?: string;
    fileType?: string;
    fileSize?: number;
}

export interface CompetencyReport {
    id: string;
    name: string;
    units: string[]; // unit codes array
    createdAt: string;
    status: "processing" | "completed" | "failed" | "error";
    htmlContent?: string; // base64 encoded HTML (or PDF base64 if server returns PDF)
    taskIds?: string[]; // one task_id per unit
}

// New Interface for Dashboard API
export interface AdminValidationReport {
    id: number;
    task_id: string;
    status: "pending" | "processing" | "completed" | "failed";
    original_filename: string;
    competency_unit_code: string;
    report_name: string;
    organization_name: string;
    user_name: string;
    output_paths: {
        json: string | null;
        pdf: string | null;
        html: string | null;
    };
    created_at: string;
    completed_at: string | null;
    credits_used: number;
}

export interface OrgSettings {
    threshold: number;
    model: string;
    retentionDays: number;
    dailyRateLimit: number;
    monthlyQuota: number;
    suspended: boolean;
}

export interface OrgSubscription {
    plan: "Basic" | "Professional" | "Enterprise";
    startDate: string;
    endDate: string;
    docsPerMonth: number;
    apiCalls: number;
    supportLevel: "Email" | "Priority" | "24/7";
    price: number;
    renewalDate: string;
    status: "active" | "expiring" | "expired";
}

export interface OrgLog {
    time: string;
    message: string;
}

export interface Organization {
    id: number;
    name: string;
    email: string;
    contact_person: string;
    phone: string;
    address: string;
    website: string | null;
    description: string;
    org_key: string | null;
    is_registered: boolean;
    credits_left: number;
    is_subscribed: boolean | null;
    subscription_id: number | null;
    orgtype_id: number;
    subscription_start_date: string | null;
    subscription_expiry_date: string | null;
    created_at: string;
}

export interface AIModelsUpdate {
    competency_model: string;
    validation_model: string;
}

export interface AIModelsResponse {
    current_competency_model: string;
    current_validation_model: string;
    available_models: string[];
    using_redis: boolean;
}
