export const LOADING_STALL_DISPLAY_PERCENT = 90;

export const ANALYZE_STALL_LABEL =
  "Almost there — finalizing your report…";

export const ANALYZE_STALL_HELPER =
  "Complex pages can take up to 30 seconds.";

export const COPY_OPTIMIZE_STALL_LABEL =
  "Almost there — hang tight…";

export const COPY_OPTIMIZE_STALL_HELPER =
  "Some sites take a bit longer to capture.";

export function getStallLoadingLabel(
  loadingStalled: boolean,
  defaultLabel: string,
  stallLabel: string
) {
  return loadingStalled ? stallLabel : defaultLabel;
}
