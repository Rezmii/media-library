// Wyliczanie nowych znacznikow czasu po przeciagnieciu karty.
//
// Lista L jest juz w docelowej kolejnosci (malejaco po ts), a `moved` to indeks
// przeniesionej pozycji. Szukamy najmniejszego okna wokol niej, w ktorym da sie
// rozstawic scisle malejace znaczniki pomiedzy sasiadami spoza okna. Zwykle
// okno to jedna karta (jeden zapis); rozszerza sie tylko, gdy sasiedzi maja
// identyczny lub prawie identyczny czas (np. pozycje dodane masowo).

export interface OrderEntry {
  id: string;
  ts: number;
}

const GAP_MS = 1000;

export function computeReorderUpdates(list: OrderEntry[], moved: number): OrderEntry[] {
  const n = list.length;
  if (n < 2 || moved < 0 || moved >= n) return [];

  let a = moved;
  let b = moved;
  let expandUp = true;

  for (;;) {
    const count = b - a + 1;
    let upper: number | null = a > 0 ? list[a - 1].ts : null;
    let lower: number | null = b < n - 1 ? list[b + 1].ts : null;

    if (upper === null && lower === null) {
      upper = Math.max(...list.map((e) => e.ts)) + GAP_MS;
      lower = upper - GAP_MS * (count + 1);
    } else if (upper === null) {
      upper = (lower as number) + GAP_MS * (count + 1);
    } else if (lower === null) {
      lower = upper - GAP_MS * (count + 1);
    }

    const room = (upper as number) - (lower as number);
    if (room >= count + 1) {
      const step = room / (count + 1);
      return list.slice(a, b + 1).map((entry, k) => ({
        id: entry.id,
        ts: Math.floor((upper as number) - step * (k + 1)),
      }));
    }

    const canUp = a > 0;
    const canDown = b < n - 1;
    if (expandUp && canUp) a--;
    else if (canDown) b++;
    else if (canUp) a--;
    expandUp = !expandUp;
  }
}
