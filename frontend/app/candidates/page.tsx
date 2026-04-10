"use client";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Shell } from "@/components/layout/shell";
import { CandidateTable } from "@/components/candidates/candidate-table";
import { CandidateCard } from "@/components/candidates/candidate-card";
import { CompareBar } from "@/components/candidates/compare-bar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { candidatesApi } from "@/lib/api";
import { useAppStore } from "@/store";
import { LayoutGrid, Table2, Search, ChevronLeft, ChevronRight } from "lucide-react";

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
        limit: "12",
      }),
  });

  const candidates = data?.data ?? [];
  const totalPages = data?.totalPages ?? 1;

  return (
    <Shell>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Candidates</h1>
          <p className="text-muted-foreground mt-1">{data?.total ?? 0} total candidates</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === "table" ? "default" : "ghost"}
            size="icon"
            onClick={() => setViewMode("table")}
          >
            <Table2 className="w-4 h-4" />
          </Button>
          <Button
            variant={viewMode === "card" ? "default" : "ghost"}
            size="icon"
            onClick={() => setViewMode("card")}
          >
            <LayoutGrid className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, email, skill…"
            className="pl-9"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
        <Select value={status} onValueChange={(v) => { setStatus(v); setPage(1); }}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="shortlisted">Shortlisted</SelectItem>
            <SelectItem value="interviewing">Interviewing</SelectItem>
            <SelectItem value="hired">Hired</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="createdAt">Upload Date</SelectItem>
            <SelectItem value="overallScore">Score</SelectItem>
            <SelectItem value="name">Name</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Content */}
      {viewMode === "table" ? (
        <CandidateTable candidates={candidates} loading={isLoading} />
      ) : (
        <div className="grid grid-cols-3 gap-4">
          {isLoading
            ? Array.from({ length: 9 }).map((_, i) => (
                <div key={i} className="h-48 rounded-xl skeleton" />
              ))
            : candidates.map((c: any) => <CandidateCard key={c.id} candidate={c} />)}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 mt-6">
          <Button variant="outline" size="icon" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="text-sm text-muted-foreground">Page {page} of {totalPages}</span>
          <Button variant="outline" size="icon" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      )}

      <CompareBar />
    </Shell>
  );
}
