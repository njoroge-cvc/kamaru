// Event helpers that work with both the current and the previous API shape.
export const timingOf = (e) => e?.timing || (new Date(e?.date_time) >= new Date() ? "upcoming" : "past");
export const statusOf = (e) => (["postponed", "cancelled"].includes(e?.status) ? e.status : "scheduled");
