// "Data aktywnosci" pozycji = najpozniejsza z: dodania, ukonczenia i ostatniego
// postepu (np. zaznaczenia obejrzanego sezonu). Uzywana do sortowania list
// (repozytorium) i do sortu "Data" po stronie klienta (mapper -> activityTs).
export function activityTimestamp(item: {
  createdAt: Date;
  completedAt: Date | null;
  metadata: unknown;
}): number {
  const meta = (item.metadata as Record<string, unknown>) || {};
  const progress =
    typeof meta.lastProgressAt === 'string' ? Date.parse(meta.lastProgressAt) : Number.NaN;

  return Math.max(
    item.createdAt.getTime(),
    item.completedAt?.getTime() ?? 0,
    Number.isFinite(progress) ? progress : 0
  );
}
