export type AnalyzeItemErrorCode =
  | "RATE_LIMITED"
  | "AI_PARSE_FAILURE"
  | "AI_TIMEOUT"
  | "INVALID_IMAGE";

export interface AnalyzeItemRequest {
  imageUrl: string;
}

export interface AnalyzeItemResponseData {
  title: string;
  category: string;
  color: string;
  condition: "Excellent" | "Good" | "Fair" | "Poor";
}

export interface AnalyzeItemResponse {
  success: boolean;
  data?: AnalyzeItemResponseData;
  error?: {
    code: AnalyzeItemErrorCode;
    message: string;
  };
}
