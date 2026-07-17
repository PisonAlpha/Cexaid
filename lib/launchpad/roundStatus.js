// Round timing status (live/upcoming/closed) is ALWAYS computed from
// starts_at/ends_at, never stored - a stored status column would drift out
// of sync with reality the moment a round's end time passes.
export function computeRoundStatus(round) {
  const now = Date.now();
  const starts = new Date(round.startsAt).getTime();
  const ends = new Date(round.endsAt).getTime();
  if (ends < now) return "closed";
  if (starts > now) return "upcoming";
  return "live";
}

// Whether a round is visible/contributable by the public at all - separate
// from its timing status. A round can be "live" by date but still not
// public if it hasn't been approved by CEXAID yet.
export function isRoundPublic(round) {
  return round.approvalStatus === "approved";
}
