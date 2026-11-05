export const VALID_COLLECTIONS = ["fused-v2", "sample-real-001", "sample-synth-002"];

export function getActiveCollection(): string {
  if (typeof window === "undefined") return "fused-v2";
  try {
    const stored = localStorage.getItem("silence_index_active_collection");
    if (stored && VALID_COLLECTIONS.includes(stored)) {
      return stored;
    }
    // Automatically sanitize and reset stale/broken collection IDs
    localStorage.setItem("silence_index_active_collection", "fused-v2");
    return "fused-v2";
  } catch {
    return "fused-v2";
  }
}

export function setActiveCollection(id: string): void {
  if (typeof window === "undefined") return;
  try {
    const target = VALID_COLLECTIONS.includes(id) ? id : "fused-v2";
    localStorage.setItem("silence_index_active_collection", target);
    window.dispatchEvent(new Event("collection_changed"));
  } catch (err) {
    console.error("Error setting active collection:", err);
  }
}
