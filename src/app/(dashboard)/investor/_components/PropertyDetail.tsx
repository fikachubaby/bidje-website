"use client";

import { useEffect, useState } from "react";
import { Check, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDueIn } from "@/lib/reminders";
import {
  formatDate,
  money,
  phaseTimeframe,
  projectedProfit,
  STAGE_BADGE,
  STAGE_LABELS,
  totalCost,
} from "@/lib/investor";
import type { InvestorProperty, MilestoneCategory } from "@/types/investor";
import { DocumentsTab } from "../DocumentsTab";
import { JOURNEY, JourneyProgress } from "./JourneyProgress";
import {
  ContractorCard,
  ExpenseForm,
  PhaseTimeframes,
} from "./PropertyEditors";

type Tab = "overview" | "progress" | "expenses" | "documents" | "updates";

const TABS: { key: Tab; label: string }[] = [
  { key: "overview", label: "Overview" },
  { key: "progress", label: "Progress" },
  { key: "expenses", label: "Expenses" },
  { key: "documents", label: "Documents" },
  { key: "updates", label: "Updates" },
];

function Timeline({
  property,
  limit,
}: {
  property: InvestorProperty;
  limit?: number;
}) {
  const items = limit ? property.updates.slice(0, limit) : property.updates;
  if (!items.length)
    return (
      <p className="text-sm text-neutral-500">
        No updates yet. We&apos;ll post here as things move.
      </p>
    );
  return (
    <ol className="space-y-4">
      {items.map((u) => (
        <li key={u.id} className="border-l-2 border-brand pl-4">
          <p className="text-[11px] font-bold uppercase text-neutral-500">
            {formatDate(u.createdAt)} · {u.category}
          </p>
          <p className="mt-1 text-sm text-neutral-800">{u.message}</p>
        </li>
      ))}
    </ol>
  );
}

function Checklist({
  property,
  category,
}: {
  property: InvestorProperty;
  category: MilestoneCategory;
}) {
  return (
    <ol className="space-y-2">
      {property.milestones
        .filter((m) => m.category === category)
        .map((m, i) => (
          <li
            key={m.id}
            className={cn(
              "flex items-center gap-3 rounded-xl border px-3 py-2.5 text-sm",
              m.done
                ? "border-emerald-200 bg-emerald-50"
                : "border-neutral-200",
            )}
          >
            <span
              className={cn(
                "grid h-6 w-6 shrink-0 place-items-center rounded-full text-[11px] font-black",
                m.done
                  ? "bg-emerald-600 text-white"
                  : "bg-neutral-100 text-neutral-500",
              )}
            >
              {m.done ? <Check className="h-3.5 w-3.5" /> : i + 1}
            </span>
            <span className="flex-1">{m.label}</span>
            {m.done && m.doneAt && (
              <span className="text-[11px] text-neutral-500">
                {formatDate(m.doneAt)}
              </span>
            )}
          </li>
        ))}
    </ol>
  );
}

export function PropertyDetail({
  property,
  onClose,
  onUpdated,
}: {
  property: InvestorProperty;
  onClose?: () => void;
  onUpdated: (property: InvestorProperty) => void;
}) {
  const [tab, setTab] = useState<Tab>("overview");
  const [stage, setStage] = useState<MilestoneCategory>("legal");

  // New property: start on the overview and its current stage.
  useEffect(() => {
    setTab("overview");
    setStage(
      property.stage === "renovation"
        ? "renovation"
        : property.stage === "legal"
          ? "legal"
          : "sales",
    );
  }, [property.id, property.stage]);

  const openStage = (key: MilestoneCategory) => {
    setStage(key);
    setTab("progress");
  };

  const nextReminder = property.reminders.find((r) => r.status === "scheduled");
  const profit = projectedProfit(property);
  const stageTime = phaseTimeframe(property, stage);

  return (
    <section className="rounded-2xl border border-neutral-200 bg-white shadow-sm">
      <header className="flex items-start justify-between gap-3 border-b border-neutral-100 p-4 sm:p-5">
        <div className="min-w-0">
          <span
            className={cn(
              "rounded-full px-2.5 py-1 text-[11px] font-black",
              STAGE_BADGE[property.stage],
            )}
          >
            {STAGE_LABELS[property.stage]}
          </span>
          <h2 className="mt-2 text-lg font-black leading-snug tracking-tight">
            {property.address}
          </h2>
          <p className="mt-1 text-xs text-neutral-500">
            Signed{" "}
            {property.dateSigned
              ? formatDate(property.dateSigned)
              : (property.dateSignedNote ?? "—")}
            {property.expectedCompletion &&
              ` · Expected completion ${formatDate(property.expectedCompletion)}`}
          </p>
        </div>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 hover:bg-neutral-100 lg:hidden"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </header>

      <nav className="flex gap-1 overflow-x-auto border-b border-neutral-100 px-3">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className={cn(
              "whitespace-nowrap border-b-[3px] px-2 py-3 text-sm font-bold",
              tab === t.key
                ? "border-brand text-black"
                : "border-transparent text-neutral-500 hover:text-black",
            )}
          >
            {t.label}
          </button>
        ))}
      </nav>

      <div className="p-4 sm:p-5">
        {tab === "overview" && (
          <div className="space-y-5">
            {property.aiAnalysis?.investor_message && (
              <div className="rounded-2xl bg-neutral-950 p-4 text-sm text-white">
                <p className="text-[11px] font-bold uppercase tracking-wide text-brand">
                  Where things stand
                </p>
                <p className="mt-1 leading-relaxed">
                  {property.aiAnalysis.investor_message}
                </p>
              </div>
            )}

            <div>
              <p className="mb-2 text-xs font-bold uppercase tracking-wide text-neutral-500">
                Journey · tap a stage to see its steps
              </p>
              <JourneyProgress property={property} onSelect={openStage} />
            </div>

            <PhaseTimeframes property={property} onUpdated={onUpdated} />

            <div className="grid grid-cols-1 gap-3">
              <div className="rounded-xl bg-neutral-50 p-3">
                <p className="text-[11px] font-bold uppercase text-neutral-500">
                  Next deadline
                </p>
                <p className="mt-1 text-sm font-black">
                  {nextReminder ? nextReminder.title : "None"}
                </p>
                {nextReminder && (
                  <p className="text-xs text-neutral-500">
                    {formatDueIn(nextReminder.dueDate)}
                  </p>
                )}
              </div>
            </div>

            {(property.legalFirm || property.financingConsultant) && (
              <div className="rounded-xl border border-neutral-200 p-3 text-sm">
                <p className="mb-2 text-[11px] font-bold uppercase text-neutral-500">
                  Your team
                </p>
                {property.legalFirm && (
                  <p>
                    ⚖️ <b>{property.legalFirm.name}</b>
                    <span className="text-neutral-500">
                      {" "}
                      · Lawyer
                      {property.legalFirm.contactPerson
                        ? ` · ${property.legalFirm.contactPerson}`
                        : ""}
                      {property.legalFirm.phone
                        ? ` · ${property.legalFirm.phone}`
                        : ""}
                    </span>
                  </p>
                )}
                {property.financingConsultant && (
                  <p className="mt-1">
                    💰 <b>{property.financingConsultant.name}</b>
                    <span className="text-neutral-500">
                      {" "}
                      · Financing consultant
                    </span>
                  </p>
                )}
              </div>
            )}

            <div>
              <h3 className="mb-3 text-sm font-black">Latest activity</h3>
              <Timeline property={property} limit={3} />
            </div>
          </div>
        )}

        {tab === "progress" && (
          <div className="space-y-4">
            <div className="flex gap-2">
              {JOURNEY.map((s) => (
                <button
                  key={s.key}
                  type="button"
                  onClick={() => setStage(s.key)}
                  className={cn(
                    "rounded-full px-3 py-1.5 text-xs font-bold",
                    stage === s.key
                      ? "bg-black text-brand"
                      : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200",
                  )}
                >
                  {s.icon} {s.label}
                </button>
              ))}
            </div>
            <JourneyProgress
              property={property}
              activeKey={stage}
              onSelect={setStage}
            />
            {(stageTime.start || stageTime.end) && (
              <p className="text-xs text-neutral-500">
                Timeframe:{" "}
                <b>
                  {formatDate(stageTime.start)} → {formatDate(stageTime.end)}
                </b>
              </p>
            )}
            {stage === "renovation" && (
              <ContractorCard property={property} onUpdated={onUpdated} />
            )}
            <Checklist property={property} category={stage} />
          </div>
        )}

        {tab === "expenses" && (
          <div className="space-y-5 text-sm">
            <div>
              {[
                ["Property acquired", property.purchasePrice],
                ["Agent fee", property.agentFee],
                ["Legal cost", property.legalCost],
                ["Renovation", property.renovationCost],
                ["Other expenses", property.otherCost],
                ["Estimated selling cost", property.sellingCost],
                ["Target sale price", property.targetPrice],
                ["Highest offer so far", property.highestOffer],
              ].map(([label, value]) => (
                <div
                  key={label as string}
                  className="flex justify-between border-b border-neutral-100 py-2.5"
                >
                  <span className="text-neutral-500">{label}</span>
                  <span className="font-bold">
                    {value ? money(value as number) : "—"}
                  </span>
                </div>
              ))}
              <div className="mt-4 flex items-center justify-between rounded-xl bg-neutral-950 p-4 text-white">
                <span className="text-xs text-neutral-400">
                  ESTIMATED NET PROFIT
                </span>
                <span className="text-xl font-black text-brand">
                  {property.targetPrice ? money(profit) : "Pending"}
                </span>
              </div>
              {property.targetPrice > 0 && totalCost(property) > 0 && (
                <p className="mt-3 text-neutral-600">
                  Total cost {money(totalCost(property))} · Projected ROI{" "}
                  <b>{((profit / totalCost(property)) * 100).toFixed(1)}%</b>
                </p>
              )}
            </div>
            <ExpenseForm property={property} onUpdated={onUpdated} />
          </div>
        )}

        {tab === "documents" && (
          <DocumentsTab key={property.id} propertyId={property.id} />
        )}
        {tab === "updates" && <Timeline property={property} />}
      </div>
    </section>
  );
}
