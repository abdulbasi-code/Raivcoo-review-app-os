// app/dashboard/components/GlobalSearch.tsx
// @ts-nocheck
"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Search, X, FileText, User, Folder, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import debounce from "lodash.debounce";
import { globalSearch, SearchFilters, SearchResult } from "../../actions";
import { RevButtons } from "@/components/ui/RevButtons";
import { getStatusVariant } from "../../components/libs";

export function GlobalSearch() {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({
    status: "all",
    sortBy: "updated_at",
    sortOrder: "desc",
  });

  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  const hasActiveFilters =
    filters.status !== "all" ||
    filters.sortBy !== "updated_at" ||
    filters.sortOrder !== "desc";

  const loadInitialProjects = useCallback(async () => {
    setIsSearching(true);
    try {
      const searchResults = await globalSearch("", {
        ...filters,
        limit: 10,
      });
      setResults(searchResults);
    } catch (error) {
      console.error("Error loading initial projects:", error);
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  }, [filters]);

  useEffect(() => {
    if (isOpen && searchTerm === "" && results.length === 0) {
      loadInitialProjects();
    }
  }, [isOpen, searchTerm, results.length, loadInitialProjects]);

  const debouncedSearch = useCallback(
    debounce(async (term: string, searchFilters: SearchFilters) => {
      if (term.trim().length === 0 && !hasActiveFilters) {
        loadInitialProjects();
        return;
      }
      if (
        !hasActiveFilters &&
        term.trim().length > 0 &&
        term.trim().length < 2
      ) {
        setResults([]);
        setIsSearching(false);
        return;
      }

      setIsSearching(true);
      try {
        const searchResults = await globalSearch(term, searchFilters);
        setResults(searchResults);
      } catch (error) {
        console.error("Search error:", error);
        setResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 300),
    [hasActiveFilters, loadInitialProjects]
  );

  useEffect(() => {
    debouncedSearch(searchTerm, filters);

    // Cleanup
    return () => {
      debouncedSearch.cancel();
    };
  }, [searchTerm, filters, debouncedSearch]);

  // Close search when route changes
  useEffect(() => {
    setIsOpen(false);
    setSearchTerm("");
    setResults([]);
    setShowFilters(false);
  }, [pathname]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsOpen(true);
      }
      if (e.key === "Escape") {
        setIsOpen(false);
        setShowFilters(false);
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleBackdropClick = useCallback((e: React.MouseEvent) => {
    if (e.target === backdropRef.current) {
      setIsOpen(false);
      setShowFilters(false);
    }
  }, []);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "project":
        return <FileText className="h-4 w-4 text-muted-foreground" />;
      case "track":
        return <Folder className="h-4 w-4 text-muted-foreground" />;
      case "client":
        return <User className="h-4 w-4 text-muted-foreground" />;
      default:
        return <FileText className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const clearFilters = () => {
    setFilters({
      status: "all",
      sortBy: "updated_at",
      sortOrder: "desc",
    });
  };

  // Detect operating system for keyboard shortcut display
  const isMac =
    typeof window !== "undefined" &&
    navigator.platform.toUpperCase().indexOf("MAC") >= 0;

  return (
    <div className="relative">
      {/* Search Button */}
      <RevButtons
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(true)}
        className="w-full justify-start border border-dashed text-muted-foreground md:w-[300px]"
      >
        <Search className="md:mr-2 h-4 w-4" />
        <span className="hidden md:inline-flex">Search projects...</span>

        <kbd className="pointer-events-none ml-auto hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 md:flex">
          <span className="text-xs">{isMac ? "⌘" : "Ctrl+"}</span>K
        </kbd>
      </RevButtons>

      {/* Search Dialog */}
      {isOpen && (
        <>
          <div
            ref={backdropRef}
            className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm"
            onClick={handleBackdropClick}
          />

          {/* Search Panel */}
          <div className="fixed left-1/2 top-[20%] z-50 w-full max-w-2xl -translate-x-1/2 p-4">
            <Card ref={searchRef} className="w-full shadow-lg">
              <div className="flex items-center border-b px-3">
                <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                <Input
                  ref={inputRef}
                  placeholder="Search projects, clients, or tracks..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex h-11 w-full border-0 bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground focus-visible:ring-0"
                />
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className={cn("ml-2", hasActiveFilters && "text-primary")}
                    onClick={() => setShowFilters(!showFilters)}
                  >
                    <Filter className="h-4 w-4" />
                    {hasActiveFilters && (
                      <span className="ml-1 h-2 w-2 rounded-full bg-primary" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsOpen(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Filters Panel */}
              {showFilters && (
                <div className="border-b p-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label className="text-xs">Status</Label>
                      <Select
                        value={filters.status}
                        onValueChange={(value: SearchFilters["status"]) =>
                          setFilters((prev) => ({ ...prev, status: value }))
                        }
                      >
                        <SelectTrigger className="h-9">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent
                          className="z-[100]"
                          onEscapeKeyDown={(e) => e.preventDefault()}
                        >
                          <SelectItem value="all">All Status</SelectItem>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                          <SelectItem value="on_hold">On Hold</SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs">Sort By</Label>
                      <Select
                        value={filters.sortBy}
                        onValueChange={(value: SearchFilters["sortBy"]) =>
                          setFilters((prev) => ({ ...prev, sortBy: value }))
                        }
                      >
                        <SelectTrigger className="h-9">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent
                          className="z-[100]"
                          onEscapeKeyDown={(e) => e.preventDefault()}
                        >
                          <SelectItem value="updated_at">
                            Last Updated
                          </SelectItem>
                          <SelectItem value="created_at">
                            Created Date
                          </SelectItem>
                          <SelectItem value="deadline">Deadline</SelectItem>
                          <SelectItem value="title">Title</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs">Order</Label>
                      <Select
                        value={filters.sortOrder}
                        onValueChange={(value: SearchFilters["sortOrder"]) =>
                          setFilters((prev) => ({ ...prev, sortOrder: value }))
                        }
                      >
                        <SelectTrigger className="h-9">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent
                          className="z-[100]"
                          onEscapeKeyDown={(e) => e.preventDefault()}
                        >
                          <SelectItem value="desc">Newest First</SelectItem>
                          <SelectItem value="asc">Oldest First</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {hasActiveFilters && (
                    <div className="mt-4 flex justify-end">
                      <RevButtons
                        variant="outline"
                        size="sm"
                        onClick={clearFilters}
                      >
                        Clear Filters
                      </RevButtons>
                    </div>
                  )}
                </div>
              )}

              {/* Search Results */}
              <div className="max-h-[400px] overflow-y-auto p-2">
                {isSearching ? (
                  <div className="py-6 text-center text-sm text-muted-foreground">
                    <div className="flex items-center justify-center gap-2">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                      {searchTerm === "" && !hasActiveFilters
                        ? "Loading recent projects..."
                        : "Searching..."}
                    </div>
                  </div>
                ) : results.length > 0 ? (
                  <div className="space-y-1">
                    {results.map((result) => (
                      <Link
                        key={`${result.type}-${result.id}`}
                        href={result.url}
                        onClick={() => setIsOpen(false)}
                        className={cn(
                          "flex items-center justify-between rounded-md px-3 py-2 hover:bg-accent",
                          "focus:bg-accent focus:outline-none"
                        )}
                      >
                        <div className="flex items-center gap-3">
                          {getTypeIcon(result.type)}
                          <div>
                            <p className="text-sm font-medium">
                              {result.title}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {result.subtitle}
                            </p>
                          </div>
                        </div>
                        {result.status && (
                          <Badge
                            variant={getStatusVariant(result.status)}
                            className="text-xs"
                          >
                            {result.status}
                          </Badge>
                        )}
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="py-6 text-center text-sm text-muted-foreground">
                    {searchTerm.length > 0 &&
                    searchTerm.length < 2 &&
                    !hasActiveFilters
                      ? "Type at least 2 characters to search"
                      : `No results found${searchTerm ? ` for "${searchTerm}"` : ""}`}
                  </div>
                )}
              </div>

              {searchTerm === "" && !hasActiveFilters && results.length > 0 && (
                <div className="border-t p-3 text-center text-xs text-muted-foreground">
                  Showing {results.length} most recent projects
                </div>
              )}
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
