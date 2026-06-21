export const getAuthToken = () => {
    return sessionStorage.getItem("access_token") || "";
};

export const API_BASE = import.meta.env.VITE_API_BASE_URL;
export const HEADERS_NGROK = { "ngrok-skip-browser-warning": "true" };

export async function searchUnitCodes(query: string, limit: string = "5") {
    const token = getAuthToken();
    const form = new URLSearchParams();
    form.append("query", query);
    form.append("limit", limit);

    const res = await fetch(`${API_BASE}/unit-codes/search`, {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            Authorization: `Bearer ${token.replace(/^Bearer\s*/i, "")}`,
            ...HEADERS_NGROK
        },
        body: form.toString(),
    });

    if (!res.ok) {
        const txt = await res.text();
        throw new Error(`search-unit-codes failed: ${res.status} ${txt}`);
    }
    return res.json();
}

export async function fetchUnitsForReports() {
    const token = getAuthToken();

    const res = await fetch(`${API_BASE}/units/ready_for_validation_report`, {
        headers: {
            Authorization: `Bearer ${token.replace(/^Bearer\s*/i, "")}`,
            ...HEADERS_NGROK
        }
    });

    if (!res.ok) throw new Error("Failed to fetch units");
    return res.json();
}

export async function callProcessUnit(unitCode: string) {
    const token = getAuthToken();
    const form = new FormData();
    form.append("unit_code", unitCode);

    const res = await fetch(`${API_BASE}/process-unit`, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${token.replace(/^Bearer\s*/i, "")}`,
        },
        body: form,
    });

    if (!res.ok) {
        const txt = await res.text();
        throw new Error(`process-unit failed: ${res.status} ${txt}`);
    }
    return res.json();
}

export async function fetchUserTasks() {
    const token = getAuthToken();
    const res = await fetch(`${API_BASE}/user-process-unit-tasks`, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${token.replace(/^Bearer\s*/i, "")}`,
        },
    });
    if (!res.ok) {
        const txt = await res.text();
        throw new Error(`user-process-unit-tasks failed: ${res.status} ${txt}`);
    }
    return res.json();
}

export async function fetchProcessResult(taskId: string) {
    const token = getAuthToken();
    const form = new FormData();
    form.append("task_id", taskId);

    const res = await fetch(`${API_BASE}/get-process-unit-result`, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${token.replace(/^Bearer\s*/i, "")}`,
        },
        body: form,
    });

    if (!res.ok) {
        const txt = await res.text();
        // don't always throw if we want to handle null, but for debugging log it
        console.warn("fetchProcessResult non-ok:", txt);
    }
    return res.json();
}

export async function fetchAdminValidationReports() {
    const token = getAuthToken();
    const res = await fetch(`${API_BASE}/validation-reports`, {
        method: "GET",
        headers: {
            Authorization: `Bearer ${token.replace(/^Bearer\s*/i, "")}`,
            ...HEADERS_NGROK
        },
    });

    if (!res.ok) {
        const txt = await res.text();
        throw new Error(`validation-reports failed: ${res.status} ${txt}`);
    }
    return res.json();
}

// New API for View Generated Competencies
export async function fetchGeneratedCompetency(unitCode: string) {
    const token = getAuthToken();
    const res = await fetch(`${API_BASE}/view_generated_competencies?unit_code=${unitCode}`, {
        method: "GET",
        headers: {
            Authorization: `Bearer ${token.replace(/^Bearer\s*/i, "")}`,
            ...HEADERS_NGROK
        },
    });

    if (!res.ok) {
        const txt = await res.text();
        throw new Error(`view_generated_competencies failed: ${res.status} ${txt}`);
    }
    return res.json();
}

// Helper for Organization fetch (shared logic)
export async function fetchOrganizationsAPI() {
    const res = await fetch(`${API_BASE}/organizations`, {
        headers: HEADERS_NGROK
    });
    if (!res.ok) throw new Error("Failed to fetch organizations");
    return res.json();
}

export async function fetchOrgDashboard(orgId: number) {
    console.log("🌐 [API] fetchOrgDashboard called with orgId:", orgId);
    const token = getAuthToken();
    console.log("🌐 [API] Token:", token ? "exists" : "missing");

    const url = `${API_BASE}/organizations/${orgId}/dashboard`;
    console.log("🌐 [API] Making GET request to:", url);

    const res = await fetch(url, {
        method: "GET",
        headers: {
            Authorization: `Bearer ${token.replace(/^Bearer\s*/i, "")}`,
            ...HEADERS_NGROK
        },
    });

    console.log("🌐 [API] Response status:", res.status, res.statusText);

    if (!res.ok) {
        const txt = await res.text();
        console.error("🌐 [API] Error response:", txt);
        throw new Error(`Org dashboard API failed: ${res.status} ${txt}`);
    }

    const data = await res.json();
    console.log("🌐 [API] Success response:", data);
    return data;
}

export async function downloadValidationReport(filepath: string) {
    const token = getAuthToken();
    const form = new FormData();
    form.append("filepath", filepath);

    const res = await fetch(`${API_BASE}/download_validation_report`, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${token.replace(/^Bearer\s*/i, "")}`,
            ...HEADERS_NGROK
        },
        body: form
    });

    if (!res.ok) {
        const txt = await res.text();
        throw new Error(`download_validation_report failed: ${res.status} ${txt}`);
    }
    return res.json();
}

export async function createCheckoutSession(subscriptionId: number) {
    const token = getAuthToken();
    const res = await fetch(`${API_BASE}/payment/create-checkout-session?subscription_id=${subscriptionId}`, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${token.replace(/^Bearer\s*/i, "")}`,
            ...HEADERS_NGROK
        },
    });

    if (!res.ok) {
        const txt = await res.text();
        throw new Error(`create-checkout-session failed: ${res.status} ${txt}`);
    }
    return res.json();
}

export async function resetOrgKey() {
    const token = getAuthToken();
    const res = await fetch(`${API_BASE}/reset_org_key`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token.replace(/^Bearer\s*/i, "")}`,
            ...HEADERS_NGROK
        },
    });

    if (!res.ok) {
        const txt = await res.text();
        throw new Error(`reset_org_key failed: ${res.status} ${txt}`);
    }
    return res.json();
}

export async function deleteCompetencyUnit(unitCode: string) {
    const token = getAuthToken();
    const res = await fetch(`${API_BASE}/competency-units/${unitCode}`, {
        method: "DELETE",
        headers: {
            Authorization: `Bearer ${token.replace(/^Bearer\s*/i, "")}`,
            ...HEADERS_NGROK
        },
    });

    if (!res.ok) {
        const txt = await res.text();
        throw new Error(`deleteCompetencyUnit failed: ${res.status} ${txt}`);
    }
    return res.json();
}

export async function fetchSubscriptionDetails() {
    const token = getAuthToken();
    const res = await fetch(`${API_BASE}/subscriptions/details`, {
        method: "GET",
        headers: {
            Authorization: `Bearer ${token.replace(/^Bearer\s*/i, "")}`,
            ...HEADERS_NGROK
        },
    });

    if (!res.ok) {
        const txt = await res.text();
        throw new Error(`fetchSubscriptionDetails failed: ${res.status} ${txt}`);
    }
    return res.json();
}

// Admin Settings APIs
export async function addAndUpdateTrainingPackage() {
    const token = getAuthToken();
    const res = await fetch(`${API_BASE}/addandupdate_trainingpackage`, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${token.replace(/^Bearer\s*/i, "")}`,
            ...HEADERS_NGROK
        },
    });
    return res.json();
}

export async function addAndUpdateCompetencyUnits() {
    const token = getAuthToken();
    const res = await fetch(`${API_BASE}/addandupdate_competencyunits`, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${token.replace(/^Bearer\s*/i, "")}`,
            ...HEADERS_NGROK
        },
    });
    return res.json();
}

export async function linkCompetencyUnits() {
    const token = getAuthToken();
    const res = await fetch(`${API_BASE}/link_competency_units`, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${token.replace(/^Bearer\s*/i, "")}`,
            ...HEADERS_NGROK
        },
    });
    return res.json();
}

export async function fetchAIModels() {
    const token = getAuthToken();
    const res = await fetch(`${API_BASE}/admin/ai-models`, {
        method: "GET",
        headers: {
            Authorization: `Bearer ${token.replace(/^Bearer\s*/i, "")}`,
            ...HEADERS_NGROK
        },
    });
    return res.json();
}

export async function updateAIModels(competencyModel: string, validationModel: string) {
    const token = getAuthToken();
    const res = await fetch(`${API_BASE}/admin/update-ai-models`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token.replace(/^Bearer\s*/i, "")}`,
            ...HEADERS_NGROK
        },
        body: JSON.stringify({
            competency_model: competencyModel,
            validation_model: validationModel
        }),
    });
    return res.json();
}

export async function fetchScraperStatus() {
    const token = getAuthToken();
    const res = await fetch(`${API_BASE}/admin/scraper-status`, {
        method: "GET",
        headers: {
            Authorization: `Bearer ${token.replace(/^Bearer\s*/i, "")}`,
            ...HEADERS_NGROK
        },
    });
    return res.json();
}
