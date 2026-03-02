import * as functions from "firebase-functions/v1";
import { ITEM_ANALYSIS_PROMPT } from "./prompts/itemAnalysis";
import { analyzeImageWithGemini } from "./utils/geminiClient";
import { logAiParseFailure } from "./utils/logger";
import { parseAIResponse } from "./utils/responseParser";
import type {
  AnalyzeItemRequest,
  AnalyzeItemResponse,
  AnalyzeItemResponseData,
} from "./types";
import { itemAnalysisSchema } from "./validators/itemSchema";

function mapUnexpectedErrorToCode(
  message: string,
): "RATE_LIMITED" | "AI_TIMEOUT" | "AI_PARSE_FAILURE" {
  const lowered = message.toLowerCase();

  if (lowered.includes("429") || lowered.includes("rate")) {
    return "RATE_LIMITED";
  }

  if (lowered.includes("timeout") || lowered.includes("deadline")) {
    return "AI_TIMEOUT";
  }

  return "AI_PARSE_FAILURE";
}

export const analyzeItem = functions.https.onCall(
  async (
    data: AnalyzeItemRequest,
    context: functions.https.CallableContext,
  ): Promise<AnalyzeItemResponse> => {
    if (!context.auth) {
      throw new functions.https.HttpsError(
        "unauthenticated",
        "Must be authenticated",
      );
    }

    const uid = context.auth.uid;

    if (!data?.imageUrl || typeof data.imageUrl !== "string") {
      return {
        success: false,
        error: {
          code: "INVALID_IMAGE",
          message: "imageUrl is required",
        },
      };
    }

    try {
      const normalizedUrl = new URL(data.imageUrl);
      if (!normalizedUrl.protocol.startsWith("http")) {
        return {
          success: false,
          error: {
            code: "INVALID_IMAGE",
            message: "imageUrl must be an http or https URL",
          },
        };
      }
    } catch {
      return {
        success: false,
        error: {
          code: "INVALID_IMAGE",
          message: "imageUrl must be a valid URL",
        },
      };
    }

    try {
      const rawResponse = await analyzeImageWithGemini(
        data.imageUrl,
        ITEM_ANALYSIS_PROMPT,
      );

      let parsedResponse: unknown;

      try {
        parsedResponse = parseAIResponse(rawResponse);
      } catch (parseError) {
        logAiParseFailure({
          uid,
          rawResponse,
          parseError: String(parseError),
          timestamp: new Date().toISOString(),
        });

        return {
          success: false,
          error: {
            code: "AI_PARSE_FAILURE",
            message: "AI returned invalid JSON",
          },
        };
      }

      const validation = itemAnalysisSchema.safeParse(parsedResponse);

      if (!validation.success) {
        logAiParseFailure({
          uid,
          rawResponse,
          parseError: validation.error.message,
          timestamp: new Date().toISOString(),
        });

        return {
          success: false,
          error: {
            code: "AI_PARSE_FAILURE",
            message: "AI response failed schema validation",
          },
        };
      }

      const responseData: AnalyzeItemResponseData = validation.data;

      return {
        success: true,
        data: responseData,
      };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      const code = mapUnexpectedErrorToCode(message);

      functions.logger.error("analyzeItem failure", {
        uid,
        message,
        timestamp: new Date().toISOString(),
      });

      return {
        success: false,
        error: {
          code,
          message: "Failed to analyze image",
        },
      };
    }
  },
);
