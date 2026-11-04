const API_BASE = process.env.NEXT_PUBLIC_API_URL || "";

export async function fetchApi<T>(path: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE}${path}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options?.headers || {})
    }
  });

  if (!res.ok) {
    let errBody: any;
    try {
      errBody = await res.json();
    } catch {
      errBody = { message: res.statusText };
    }
    throw new Error(errBody.message || errBody.detail?.message || `API error ${res.status}`);
  }

  return res.json();
}

export const api = {
  getCollections: () => fetchApi<any[]>("/api/collections"),
  getCollectionSummary: (id: string) => fetchApi<any>(`/api/collections/${id}/summary`),
  getAudit: (id: string) => fetchApi<any>(`/api/audits/${id}`),
  getAuditProgress: (id: string) => fetchApi<any>(`/api/audits/${id}/progress`),
  getAuditMatrix: (id: string, params?: { category?: string; dimension?: string }) => {
    const q = new URLSearchParams();
    if (params?.category) q.set("category", params.category);
    if (params?.dimension) q.set("dimension", params.dimension);
    return fetchApi<any>(`/api/audits/${id}/matrix?${q.toString()}`);
  },
  getMatrixCell: (id: string, category: string, dimension: string) =>
    fetchApi<any>(`/api/audits/${id}/matrix/cell?category=${encodeURIComponent(category)}&dimension=${encodeURIComponent(dimension)}`),
  getMapData: (id: string, metric?: string) =>
    fetchApi<any>(`/api/audits/${id}/map?metric=${metric || "record_count"}`),
  getStateDetails: (id: string, code: string) =>
    fetchApi<any>(`/api/audits/${id}/map/state/${encodeURIComponent(code)}`),
  getFindings: (id: string) => fetchApi<any>(`/api/audits/${id}/findings`),
  getFindingDetail: (id: string, fid: string) => fetchApi<any>(`/api/audits/${id}/findings/${fid}`),
  getPriorities: (id: string, filters?: { dimension?: string; band?: string; consultation?: string }) => {
    const q = new URLSearchParams();
    if (filters?.dimension) q.set("dimension", filters.dimension);
    if (filters?.band) q.set("band", filters.band);
    if (filters?.consultation) q.set("consultation", filters.consultation);
    return fetchApi<any>(`/api/audits/${id}/priorities?${q.toString()}`);
  },
  getDuplicates: (id: string) => fetchApi<any>(`/api/audits/${id}/duplicates`),
  getRecords: (params?: Record<string, any>) => {
    const q = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== null && v !== "") q.set(k, String(v));
      });
    }
    return fetchApi<any>(`/api/records?${q.toString()}`);
  },
  getRecordDetail: (id: string) => fetchApi<any>(`/api/records/${id}`),
  getRelatedRecords: (id: string) => fetchApi<any>(`/api/records/${id}/related`),
  getImages: (params?: Record<string, any>) => {
    const q = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== null && v !== "") q.set(k, String(v));
      });
    }
    return fetchApi<any>(`/api/images?${q.toString()}`);
  },
  getConfigRubrics: () => fetchApi<any>("/api/config/rubrics"),
  getConfigApplicability: () => fetchApi<any>("/api/config/applicability"),
  getConfigTaxonomy: () => fetchApi<any>("/api/config/taxonomy"),
  getConfigStates: () => fetchApi<any>("/api/config/states"),
  getConfigWeights: () => fetchApi<any>("/api/config/weights"),
};
