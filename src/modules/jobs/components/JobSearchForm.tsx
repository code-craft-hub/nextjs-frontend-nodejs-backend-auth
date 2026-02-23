import { useForm } from "react-hook-form";
import { useEffect } from "react";
import SearchBox from "@/shared/component/SearchBox";
import { SearchForm } from "../types";

export function JobSearchForm({
  onSubmit,
}: {
  onSubmit: (query: string) => void;
}) {
 

  return <SearchBox onSubmit={onSubmit} />;

  return (
    <form
      onSubmit={form.handleSubmit((v) => onSubmit(v.query.trim()))}
      className="flex gap-2 items-center"
    >
      <input
        {...form.register("query")}
        placeholder="Search jobs by title, company, or skills"
        className="px-3 py-2 border rounded-md w-full"
        aria-label="Search jobs"
      />
      <button
        type="button"
        onClick={() => {
          reset({ query: "" });
          onSubmit("");
        }}
        className="px-3 py-2 border rounded-md"
        aria-label="Clear search"
      >
        Clear
      </button>
      <button
        type="submit"
        className="px-3 py-2 bg-primary text-white rounded-md"
      >
        Search
      </button>
    </form>
  );
}
