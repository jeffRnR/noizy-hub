import Form from "next/form";
import { Search } from "lucide-react";

function SearchBar() {
  return (
    <div>
      <Form action="/search" className="relative">
        <input
          type="text"
          name="q" //for query
          placeholder="Search for events..."
          className="w-full py-3 px-4 pl-12 text-gray-200 rounded-xl border border-gray-200 shadow-sm focus:outline-none focus:ring-1 focus:ring-gray-300 focus:border-transparent transition-all duration-200"
        />
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 w-5 h-5"/>
        <button
            type="submit"
            className="absolute right-3 top-1/2 -translate-y-1/2 bg-[#553b6d] text-gray-200 px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-[#553b6d]/80 hover:cursor-pointer transition-colors duration-200"
        >
            Search
        </button>
      </Form>
    </div>
  );
}

export default SearchBar;
