import { useState } from "react";
import { useAction } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { CandidateCard } from "../components/CandidateCard";
import { Search as SearchIcon } from "lucide-react";
import { Link } from "react-router-dom";

type SearchResult = {
  profileId: Id<"profiles">;
  shareToken: string;
  name?: string;
  narrativeSnippet: string;
  topClaims: string[];
  score: number;
};

const EXAMPLE_QUERIES = [
  "Engineer who scaled infrastructure to millions of users",
  "PM who took a product from 0→1",
  "Sales leader who built a team from scratch",
  "Designer who led a rebrand",
];

export default function Search() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const searchCandidates = useAction(api.search.searchCandidates);

  const handleSearch = async (q?: string) => {
    const searchQuery = q ?? query;
    if (!searchQuery.trim()) return;
    setLoading(true);
    setSearched(true);
    try {
      const res = await searchCandidates({ query: searchQuery });
      setResults(res as SearchResult[]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleSearch();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-12 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xs">A</span>
            </div>
            <span className="font-bold text-gray-900">AwesomeWork</span>
          </Link>
          <Link to="/start" className="text-sm text-blue-600 hover:text-blue-800 font-medium">
            Build your profile →
          </Link>
        </div>

        {/* Search bar */}
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold text-gray-900">Search verified profiles</h1>
          <p className="text-gray-500">
            Describe the candidate you're looking for in plain English.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-2xl px-4 py-3 shadow-sm focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent">
          <SearchIcon className="w-5 h-5 text-gray-400 shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="PM who took a product from 0→1…"
            className="flex-1 text-base outline-none bg-transparent text-gray-800 placeholder-gray-400"
          />
          <button
            onClick={() => handleSearch()}
            disabled={!query.trim() || loading}
            className="px-5 py-2 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 disabled:opacity-40 transition-colors"
          >
            Search
          </button>
        </div>

        {/* Loading skeletons */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="border rounded-xl p-5 bg-white animate-pulse space-y-3">
                <div className="h-4 bg-gray-100 rounded w-1/2" />
                <div className="h-3 bg-gray-100 rounded w-full" />
                <div className="h-3 bg-gray-100 rounded w-4/5" />
              </div>
            ))}
          </div>
        )}

        {/* Results */}
        {!loading && searched && results.length === 0 && (
          <div className="text-center py-16 space-y-4">
            <p className="text-gray-500">No published profiles matched your search.</p>
            <p className="text-sm text-gray-400">Try one of these:</p>
            <div className="flex flex-wrap gap-2 justify-center">
              {EXAMPLE_QUERIES.map((q) => (
                <button
                  key={q}
                  onClick={() => { setQuery(q); handleSearch(q); }}
                  className="text-sm px-3 py-1.5 border border-gray-200 rounded-full hover:bg-gray-50 text-gray-600 transition-colors"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {!loading && results.length > 0 && (
          <div>
            <p className="text-sm text-gray-500 mb-4">{results.length} result{results.length !== 1 ? "s" : ""}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {results.map((result) => (
                <CandidateCard key={result.profileId} result={result} />
              ))}
            </div>
          </div>
        )}

        {/* Example chips (pre-search) */}
        {!searched && !loading && (
          <div className="flex flex-wrap gap-2 justify-center">
            {EXAMPLE_QUERIES.map((q) => (
              <button
                key={q}
                onClick={() => { setQuery(q); handleSearch(q); }}
                className="text-sm px-3 py-1.5 border border-gray-200 rounded-full hover:bg-gray-50 text-gray-500 transition-colors"
              >
                {q}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
