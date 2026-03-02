import { httpsCallable } from "firebase/functions";
import { functions } from "@/services/firebaseConfig";
import type {
  AnalyzeItemRequest,
  AnalyzeItemResponse,
} from "@/types/api.types";

export async function analyzeItem(
  imageUrl: string,
): Promise<AnalyzeItemResponse> {
  const analyzeItemCallable = httpsCallable<
    AnalyzeItemRequest,
    AnalyzeItemResponse
  >(functions, "analyzeItem");

  try {
    const result = await analyzeItemCallable({ imageUrl });
    return result.data;
  } catch (error: any) {
    const code = error?.code || "";
    let errorCode: "AI_TIMEOUT" | "RATE_LIMITED" | "INVALID_IMAGE" | "AI_PARSE_FAILURE" = "AI_PARSE_FAILURE";
    let message = error?.message || "Unknown AI error";

    if (typeof code === "string") {
      if (code.includes("deadline-exceeded")) {
        errorCode = "AI_TIMEOUT";
      } else if (code.includes("resource-exhausted")) {
        errorCode = "RATE_LIMITED";
      } else if (code.includes("invalid-argument")) {
        errorCode = "INVALID_IMAGE";
      }
    }

    return {
      success: false,
      error: {
        code: errorCode,
        message,
      },
    };
  }
}
