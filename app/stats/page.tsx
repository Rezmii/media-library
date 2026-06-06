import Image from 'next/image';

import {
  BarChart3,
  BookOpen,
  CalendarCheck,
  ChevronDown,
  Clock,
  Sparkles,
  Star,
  Tags,
  Trophy,
} from 'lucide-react';

import {
  computeLibraryStats,
  MONTH_LABELS,
  STATUS_LABELS,
  TYPE_LABELS,
} from '@/core/stats';

import { mediaRepository } from '@/lib/db/media-repository';
import { cn } from '@/lib/utils';

import { DashboardHeader } from '@/components/domain/dashboard-header';

// Kolory pasków per typ/status (spójne z resztą UI)
const TYPE_BAR: Record<string, string> = {
  GAME: 'bg-violet-500',
  MOVIE: 'bg-sky-500',
  SERIES: 'bg-amber-500',
  BOOK: 'bg-emerald-500',
  ALBUM: 'bg-pink-500',
};

const STATUS_BAR: Record<string, string> = {
  IN_PROGRESS: 'bg-blue-500',
  COMPLETED: 'bg-emerald-500',
  ABANDONED: 'bg-red-600',
  BACKLOG: 'bg-zinc-500',
};

function StatCard({
  value,
  label,
  sub,
  icon,
}: {
  value: string | number;
  label: string;
  sub?: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5">
      <div className="mb-1 flex items-center justify-between">
        <span className="text-3xl font-black tracking-tight text-zinc-100 tabular-nums">{value}</span>
        {icon && <span className="text-zinc-600">{icon}</span>}
      </div>
      <div className="text-sm font-medium text-zinc-400">{label}</div>
      {sub && <div className="mt-0.5 text-xs text-zinc-500">{sub}</div>}
    </div>
  );
}

function BarRow({
  label,
  count,
  max,
  colorClass,
}: {
  label: string;
  count: number;
  max: number;
  colorClass: string;
}) {
  const pct = max > 0 ? Math.max(2, Math.round((count / max) * 100)) : 0;
  return (
    <div className="flex items-center gap-3">
      <div className="w-24 shrink-0 truncate text-sm text-zinc-400" title={label}>
        {label}
      </div>
      <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-zinc-800/80">
        <div className={cn('h-full rounded-full', colorClass)} style={{ width: `${pct}%` }} />
      </div>
      <div className="w-10 shrink-0 text-right text-sm font-medium tabular-nums text-zinc-300">
        {count}
      </div>
    </div>
  );
}

function SectionTitle({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-zinc-200">
      <span className="text-emerald-500">{icon}</span>
      {children}
    </h3>
  );
}

// Kompaktowa okładka (Rok w pigułce + Dziennik)
function CoverThumb({
  title,
  coverUrl,
  rating,
}: {
  title: string;
  coverUrl: string | null;
  rating: number | null;
}) {
  return (
    <div className="space-y-1">
      <div className="relative aspect-[2/3] overflow-hidden rounded-lg bg-zinc-900 ring-1 ring-zinc-800">
        {coverUrl ? (
          <Image src={coverUrl} alt={title} fill className="object-cover" unoptimized />
        ) : (
          <div className="flex h-full items-center justify-center text-[10px] text-zinc-700">Brak</div>
        )}
        {rating != null && (
          <div className="absolute top-1 right-1 flex items-center gap-0.5 rounded-full bg-black/75 px-1.5 py-0.5 text-[10px] font-medium text-yellow-400 backdrop-blur-sm">
            <Star className="h-2.5 w-2.5 fill-yellow-400" />
            {rating}
          </div>
        )}
      </div>
      <p className="truncate text-[11px] text-zinc-400" title={title}>
        {title}
      </p>
    </div>
  );
}

export default async function StatsPage() {
  const items = await mediaRepository.getAll();
  const year = new Date().getFullYear();
  const stats = computeLibraryStats(items, year);

  const maxType = Math.max(1, ...stats.perType.map((t) => t.count));
  const maxStatus = Math.max(1, ...stats.perStatus.map((s) => s.count));
  const maxTag = Math.max(1, ...stats.topTags.map((t) => t.count));
  const maxRating = Math.max(1, ...stats.ratingHistogram.map((r) => r.count));

  // --- Dziennik: ukończone pogrupowane rok -> miesiąc (najnowsze pierwsze) ---
  const completed = items
    .filter((i) => i.status === 'COMPLETED' && i.completedAt)
    .sort((a, b) => b.completedAt!.getTime() - a.completedAt!.getTime());

  const diaryYears: { year: number; total: number; months: { month: number; items: typeof completed }[] }[] = [];
  for (const it of completed) {
    const d = it.completedAt!;
    const y = d.getFullYear();
    const mo = d.getMonth();
    let yg = diaryYears.find((g) => g.year === y);
    if (!yg) {
      yg = { year: y, total: 0, months: [] };
      diaryYears.push(yg);
    }
    yg.total += 1;
    let mg = yg.months.find((g) => g.month === mo);
    if (!mg) {
      mg = { month: mo, items: [] };
      yg.months.push(mg);
    }
    mg.items.push(it);
  }
  // Miesiace malejaco (najnowszy pierwszy) — jawnie, niezaleznie od kolejnosci wejscia.
  diaryYears.forEach((yg) => yg.months.sort((a, b) => b.month - a.month));

  return (
    <div className="animate-in fade-in space-y-12 duration-500">
      <DashboardHeader title="Statystyki" count={stats.total} icon={<BarChart3 className="h-8 w-8" />} />

      {/* Rok w pigułce */}
      <section className="rounded-3xl border border-emerald-900/40 bg-gradient-to-br from-emerald-950/30 via-zinc-900/40 to-zinc-900/40 p-6 md:p-8">
        <div className="mb-6 flex items-center gap-2 text-sm font-semibold tracking-wider text-emerald-400 uppercase">
          <Sparkles className="h-4 w-4" />
          Rok w pigułce {year}
        </div>

        {stats.completedThisYear === 0 ? (
          <p className="text-sm text-zinc-400">
            Nic jeszcze nie ukończono w {year}. Oznacz coś jako „Ukończone", aby zobaczyć tu
            podsumowanie roku.
          </p>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              <StatCard
                value={stats.completedThisYear}
                label="Ukończone w tym roku"
                icon={<CalendarCheck className="h-5 w-5" />}
              />
              <StatCard
                value={`${stats.gameHoursThisYear}h`}
                label="Godziny w grach"
                sub="ukończone w tym roku"
                icon={<Clock className="h-5 w-5" />}
              />
              <StatCard
                value={stats.bookPagesThisYear}
                label="Przeczytane strony"
                sub="ukończone w tym roku"
                icon={<BookOpen className="h-5 w-5" />}
              />
              <StatCard
                value={stats.topRatedThisYear.length}
                label="Wysoko oceniane (4–5★)"
                sub="w tym roku"
                icon={<Trophy className="h-5 w-5" />}
              />
            </div>

            {stats.topRatedThisYear.length > 0 && (
              <div className="mt-8">
                <h4 className="mb-3 text-sm font-semibold text-zinc-300">
                  Najlepiej oceniane w {year}
                </h4>
                <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-10">
                  {stats.topRatedThisYear.map((item) => (
                    <CoverThumb
                      key={item.id}
                      title={item.title}
                      coverUrl={item.coverUrl}
                      rating={item.rating}
                    />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </section>

      {/* Przegląd */}
      <section>
        <SectionTitle icon={<BarChart3 className="h-5 w-5" />}>Przegląd biblioteki</SectionTitle>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <StatCard value={stats.total} label="W bibliotece" />
          <StatCard value={stats.completedTotal} label="Ukończone łącznie" />
          <StatCard
            value={`${stats.totalGameHours}h`}
            label="Łączny czas gier"
            icon={<Clock className="h-5 w-5" />}
          />
          <StatCard
            value={stats.totalBookPages}
            label="Łącznie stron książek"
            icon={<BookOpen className="h-5 w-5" />}
          />
        </div>
      </section>

      {/* Rozkłady: typ / status */}
      <section className="grid gap-8 lg:grid-cols-2">
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/30 p-6">
          <SectionTitle icon={<BarChart3 className="h-5 w-5" />}>Według typu</SectionTitle>
          <div className="space-y-3">
            {stats.perType.map((t) => (
              <BarRow
                key={t.type}
                label={TYPE_LABELS[t.type] || t.type}
                count={t.count}
                max={maxType}
                colorClass={TYPE_BAR[t.type] || 'bg-zinc-500'}
              />
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/30 p-6">
          <SectionTitle icon={<BarChart3 className="h-5 w-5" />}>Według statusu</SectionTitle>
          <div className="space-y-3">
            {stats.perStatus.map((s) => (
              <BarRow
                key={s.status}
                label={STATUS_LABELS[s.status] || s.status}
                count={s.count}
                max={maxStatus}
                colorClass={STATUS_BAR[s.status] || 'bg-zinc-500'}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Oceny + Top tagi */}
      <section className="grid gap-8 lg:grid-cols-2">
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/30 p-6">
          <SectionTitle icon={<Star className="h-5 w-5" />}>Rozkład ocen</SectionTitle>
          {stats.ratedCount > 0 ? (
            <>
              <div className="mb-4 flex items-baseline gap-2">
                <span className="text-3xl font-black text-zinc-100">
                  {stats.avgRating?.toFixed(2)}
                </span>
                <span className="text-sm text-zinc-500">średnia z {stats.ratedCount} ocen</span>
              </div>
              <div className="space-y-3">
                {[...stats.ratingHistogram].reverse().map((r) => (
                  <BarRow
                    key={r.stars}
                    label={`${r.stars} ★`}
                    count={r.count}
                    max={maxRating}
                    colorClass="bg-yellow-500"
                  />
                ))}
              </div>
            </>
          ) : (
            <p className="text-sm text-zinc-500 italic">Brak ocen.</p>
          )}
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/30 p-6">
          <SectionTitle icon={<Tags className="h-5 w-5" />}>Najczęstsze tagi</SectionTitle>
          {stats.topTags.length > 0 ? (
            <div className="space-y-3">
              {stats.topTags.map((t) => (
                <BarRow
                  key={t.tag}
                  label={t.tag}
                  count={t.count}
                  max={maxTag}
                  colorClass="bg-emerald-500"
                />
              ))}
            </div>
          ) : (
            <p className="text-sm text-zinc-500 italic">Brak tagów.</p>
          )}
        </div>
      </section>

      {/* Dziennik — oś ukończeń */}
      <section>
        <SectionTitle icon={<CalendarCheck className="h-5 w-5" />}>Dziennik — oś ukończeń</SectionTitle>

        {diaryYears.length === 0 ? (
          <p className="text-sm text-zinc-500 italic">
            Brak ukończonych pozycji. Oznacz coś jako „Ukończone", aby zobaczyć tu historię.
          </p>
        ) : (
          <div className="space-y-3">
            {diaryYears.map((yg, idx) => (
              <details
                key={yg.year}
                open={idx === 0}
                className="group rounded-2xl border border-zinc-800 bg-zinc-900/30"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between px-5 py-4 text-zinc-200 transition-colors hover:text-white">
                  <span className="flex items-center gap-2 text-xl font-bold">
                    <ChevronDown className="h-5 w-5 text-zinc-500 transition-transform group-open:rotate-180" />
                    {yg.year}
                  </span>
                  <span className="text-sm text-zinc-500">
                    {yg.total} {yg.total === 1 ? 'pozycja' : 'pozycji'}
                  </span>
                </summary>

                <div className="space-y-6 px-5 pt-1 pb-6">
                  {yg.months.map((mg) => (
                    <div key={mg.month}>
                      <h4 className="mb-3 text-sm font-semibold tracking-wider text-zinc-500 uppercase">
                        {MONTH_LABELS[mg.month]}
                      </h4>
                      <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8">
                        {mg.items.map((it) => (
                          <CoverThumb
                            key={it.id}
                            title={it.title}
                            coverUrl={it.coverUrl}
                            rating={typeof it.rating === 'number' ? it.rating : null}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </details>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
