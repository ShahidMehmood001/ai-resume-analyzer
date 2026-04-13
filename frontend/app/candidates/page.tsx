"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { LayoutGrid, Table2, Search, ChevronLeft, ChevronRight, SlidersHorizontal } from "lucide-react";
import { Shell } from "@/components/layout/shell";
import { CandidateTable } from "@/components/candidates/candidate-table";
import { CandidateCard } from "@/components/candidates/candidate-card";
import { CompareBar } from "@/components/candidates/compare-bar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { candidatesApi } from "@/lib/api";
import { useAppStore } from "@/store";

const LIMIT = 12;

export default function CandidatesPage() {
  const { viewMode, setViewMode } = useAppStore();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [sortBy, setSortBy] = useState("createdAt");
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ["candidates", search, status, sortBy, page],
    queryFn: () =>
      candidatesApi.list({
        ...(search && { search }),
        ...(status !== "all" && { status }),
        sortBy,
        order: "DESC",
        page: String(page),
        limit: String(LIMIT),
      }),
    placeholderData: (prev) => prev,
  });

  const candidates = data?.data ?? [];
  const total = data?.total ?? 0;
  const totalPages = data?.totalPages ?? 1;

  return (
    <Shell>
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Candidates</h1>
          <p className="mt-1 text-sm text-[var(--color-muted-foreground)]">
            {total} candidate{total !== 1 ? "s" : ""}
          </p>
        </div>
        {/* View toggle */}
        <div className="flex items-center gap-1 rounded-[var(--radius)] border border-[var(--color-border)] p-0.5">
          {(["table", "card"] as const).map((mode) => {
            const Icon = mode === "table" ? Table2 : LayoutGrid;
            return (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`flex h-7 w-7 items-center justify-center rounded-[var(--radius-sm)] transition-colors ${
                  viewMode === mode
                    ? "bg-[var(--color-primary)] text-white shadow-sm"
                    : "text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
              </button>
            );
          })}
        </div>
      </div>

      {/* Filters */}
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[var(--color-muted-foreground)]" />
          <Input
            placeholder="Search by name, skill, location…"
            className="pl-9"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
        </div>

        <Select value={status} onValueChange={(v) => { setStatus(v); setPage(1); }}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="shortlisted">Shortlisted</SelectItem>
            <SelectItem value="interviewing">Interviewing</SelectItem>
            <SelectItem value="hired">Hired</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>

        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="createdAt">Upload date</SelectItem>
            <SelectItem value="overallScore">Score</SelectItem>
            <SelectItem value="name">Name</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Content */}
      {viewMode === "table" ? (
        <CandidateTable candidates={candidates} loading={isLoading} />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {isLoading
            ? Array.from({ length: 9 }).map((_, i) => (
                <div key={i} className="h-52 rounded-[var(--radius-lg)] skeleton" />
              ))
            : candidates.map((c: any) => (
                <CandidateCard key={c.id} candidate={c} />
              ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="icon"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="min-w-[120px] text-center text-sm text-[var(--color-muted-foreground)]">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="icon"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}

      <CompareBar />
    </Shell>
  );
}
