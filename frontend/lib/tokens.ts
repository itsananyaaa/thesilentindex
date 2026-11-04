export interface StatusStyle {
  label: string;
  bg: string;
  border: string;
  text: string;
  pattern: string; // SVG or CSS pattern description
  description: string;
}

export const STATUS_STYLES: Record<string, StatusStyle> = {
  "Documented": {
    label: "Documented",
    bg: "bg-olive-700",
    border: "border-olive-500",
    text: "text-cream-100",
    pattern: "solid-olive",
    description: "Field mapped and content meets rubric (score ≥ 0.75)"
  },
  "Partial": {
    label: "Partial",
    bg: "bg-gold-400/90 text-oxblood-900",
    border: "border-gold-500",
    text: "text-oxblood-900",
    pattern: "diagonal-stripe",
    description: "Some evidence recorded (0.25 ≤ score < 0.75)"
  },
  "Undocumented in collection": {
    label: "Undocumented in collection",
    bg: "bg-cream-100/60 text-copper-600",
    border: "border-copper-500 border-dashed",
    text: "text-copper-600",
    pattern: "copper-hatch",
    description: "Column exists in dataset but record value is empty or < 0.25"
  },
  "Not assessable": {
    label: "Not assessable",
    bg: "bg-parchment-300/50 text-oxblood-800",
    border: "border-parchment-400 border-dotted",
    text: "text-oxblood-800",
    pattern: "dotted-grey",
    description: "Dataset has no column for this dimension; impossible to evaluate"
  },
  "Not applicable": {
    label: "Not applicable",
    bg: "bg-cream-100/20 text-neutral-400",
    border: "border-parchment-300/40",
    text: "text-neutral-400",
    pattern: "blank-dash",
    description: "Dimension does not apply to this cultural category"
  }
};

export const PROVENANCE_BADGES = {
  SOURCE: {
    label: "SOURCE",
    bg: "bg-emerald-900/10 text-emerald-900 border-emerald-900/30",
    description: "Direct verbatim value from holding institution"
  },
  NORMALISED: {
    label: "NORMALISED",
    bg: "bg-gold-400/20 text-oxblood-900 border-gold-400/50",
    description: "Standardised against authority table (e.g. state alias, Unicode NFC)"
  },
  INFERRED: {
    label: "INFERRED",
    bg: "bg-henna-600/15 text-henna-700 border-henna-600/40",
    description: "Rule-based taxonomy inference with confidence score"
  }
};

