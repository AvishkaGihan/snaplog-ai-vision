export interface AnalyzeItemRequest {
  imageUrl: string;
}

export interface AnalyzeItemResponse {
  success: boolean;
  data?: {
    title: string;
    category: string;
    color: string;
    condition: string;
  };
  error?: {
    code: "RATE_LIMITED" | "AI_PARSE_FAILURE" | "AI_TIMEOUT" | "INVALID_IMAGE";
    message: string;
  };
}
