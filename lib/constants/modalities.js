/**
 * Shared Modalities & Theoretical Approaches
 * Single authoritative source of truth for therapy modalities across Vanquish forms & admin screens.
 */

export const MODALITY_OPTIONS = [
  "Integrative Therapy",
  "Person-Centred",
  "Psychodynamic Therapy",
  "Gestalt Therapy",
  "Existential Therapy",
  "Acceptance and Commitment Therapy (ACT)",
  "Compassion-Focused Therapy (CFT)",
  "Systemic / Family Therapy",
  "Emotion-Focused Therapy (EFT)",
  "Trauma-Informed Therapy",
  "Mindfulness-Based Approaches",
  "Creative / Arts-Based Therapy",
  "Counselling & Coaching",
  "Pluralistic",
  "Psychoanalytic Therapy",
  "Humanistic Therapy",
  "Transactional Analysis (TA)",
  "Solution-Focused Brief Therapy (SFBT)",
  "Dialectical Behaviour Therapy (DBT)",
  "Schema Therapy",
  "Narrative Therapy",
  "Attachment-Based Therapy",
  "Eye Movement Desensitisation and Reprocessing (EMDR)",
  "Couples / Relationship Therapy",
  "Other (not listed above)",
];

export const MODALITY_SELECT_OPTIONS = MODALITY_OPTIONS.map((modality) => ({
  value: modality,
  label: modality,
}));

export default MODALITY_OPTIONS;
