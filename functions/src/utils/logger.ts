import * as functions from "firebase-functions/v1";

interface ParseFailureLogInput {
  uid: string;
  rawResponse: string;
  parseError: string;
  timestamp: string;
}

export function logAiParseFailure(input: ParseFailureLogInput): void {
  functions.logger.error("AI parse failure", input);
}
