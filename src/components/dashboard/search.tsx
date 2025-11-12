"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Search, X, Loader2, Briefcase, User, FileText, Building2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type SearchResult = {
  id: string;
  type: "deal" | "contact" | "activity" | "organization";
  title: string;
  subtitle?: string;
  href: string;
};

export function DashboardSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  const performSearch = useCallback(
    async (searchQuery: string) => {
      if (!searchQuery.trim()) {
        setResults([]);
        setIsOpen(false);
        return;
      }

      setIsLoading(true);
      setIsOpen(true);

      try {
        // Search deals, contacts, and activities
        const response = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`);
        if (response.ok) {
          const data = (await response.json()) as { results?: SearchResult[] };
          setResults(data.results || []);
        } else {
          setResults([]);
        }
      } catch (error) {
        console.error("Search error:", error);
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (query) {
        performSearch(query);
      } else {
        setResults([]);
        setIsOpen(false);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query, performSearch]);

  const handleResultClick = (href: string) => {
    router.push(href);
    setQuery("");
    setIsOpen(false);
  };

  const getResultIcon = (type: SearchResult["type"]) => {
    switch (type) {
      case "deal":
        return <Briefcase className="h-4 w-4" />;
      case "contact":
        return <User className="h-4 w-4" />;
      case "activity":
        return <FileText className="h-4 w-4" />;
      case "organization":
        return <Building2 className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  return (
    <div className="relative flex-1 max-w-md">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search deals, contacts, activities..."
          className="pl-10 pr-10 w-full"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => {
            if (results.length > 0 || query) {
              setIsOpen(true);
            }
          }}
          onBlur={() => {
            // Delay closing to allow click events
            setTimeout(() => setIsOpen(false), 200);
          }}
        />
        {query && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7"
            onClick={() => {
              setQuery("");
              setIsOpen(false);
            }}
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>

      {/* Search Results Dropdown */}
      {isOpen && (query || results.length > 0) && (
        <Card className="absolute top-full left-0 right-0 mt-2 z-50 max-h-[400px] overflow-y-auto shadow-lg border-border animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="p-2">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
                <span className="ml-2 text-sm text-muted-foreground">Searching...</span>
              </div>
            ) : results.length > 0 ? (
              <div className="space-y-1">
                {results.map((result, index) => (
                  <button
                    key={result.id}
                    onClick={() => handleResultClick(result.href)}
                    onMouseDown={(e) => e.preventDefault()}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted transition-all duration-200 hover:scale-[1.01] text-left animate-in fade-in slide-in-from-left-2"
                    style={{ animationDelay: `${index * 30}ms` }}
                  >
                    <div className="p-2 rounded-md bg-primary/10 text-primary transition-colors">
                      {getResultIcon(result.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{result.title}</p>
                      {result.subtitle && (
                        <p className="text-xs text-muted-foreground truncate">{result.subtitle}</p>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            ) : query ? (
              <div className="py-8 text-center animate-in fade-in duration-300">
                <p className="text-sm text-muted-foreground">No results found</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Try searching for deals, contacts, or activities
                </p>
              </div>
            ) : null}
          </div>
        </Card>
      )}
    </div>
  );
}

