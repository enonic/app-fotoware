export const unforceArray = (v) => (Array.isArray(v) && v.length === 1) ? v[0] : v;
