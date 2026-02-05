// Item status state machine
// Primary flow: DRAFT_LOCAL → UPLOADING → ANALYZING → READY → CONFIRMED
// Failure state: FAILED with metadata (failureStage, failureReason, retryCount)

export enum ItemStatus {
  DRAFT_LOCAL = 'DRAFT_LOCAL',
  UPLOADING = 'UPLOADING',
  ANALYZING = 'ANALYZING',
  READY = 'READY',
  CONFIRMED = 'CONFIRMED',
  FAILED = 'FAILED',
}
