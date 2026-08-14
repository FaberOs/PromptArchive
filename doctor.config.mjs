/**
 * Repository-owned React Doctor policy.
 *
 * The React frontend is scanned with the root-owned executable; the Python
 * backend stays out of this React-specific scan and uses its native pytest
 * gate.
 */
export const REACT_PROJECTS = ["frontend"];

export default {
  projects: REACT_PROJECTS,
  scope: "full",
  lint: true,
  deadCode: true,
  supplyChain: { enabled: false },
  share: false,
  noScore: true,
  blocking: "none",
  warnings: true,
};
