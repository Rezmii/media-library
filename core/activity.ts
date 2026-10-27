// Klucz sortowania list ("Data", najnowsze na gorze). Uzywany przez sort w
// repozytorium i przez sort po stronie klienta (mapper -> activityTs).
//
// - Jesli pozycja zostala recznie przeciagnieta, decyduje orderAt.
// - W przeciwnym razie: najpozniejsza z dat dodania, ukonczenia i ostatniego
//   postepu (np. zaznaczenia obejrzanego sezonu).
// Ukonczenie i nowy postep czyszcza orderAt, wiec takie zdarzenie i tak
// wypycha pozycje na gore.
export function sortTimestamp(item: {
  createdAt: Date;
  completedAt: Date | null;
  orderAt?: Date | null;
  metadata: unknown;
}): number {
  if (item.orderAt) return item.orderAt.getTime();

  const meta = (item.metadata as Record<string, unknown>) || {};
  const progress =
    typeof meta.lastProgressAt === 'string' ? Date.parse(meta.lastProgressAt) : Number.NaN;

  return Math.max(
    item.createdAt.getTime(),
    item.completedAt?.getTime() ?? 0,
    Number.isFinite(progress) ? progress : 0
  );
}
