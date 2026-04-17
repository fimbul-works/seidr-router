import { DUMMY_BASE_URL } from "../constants.js";
import { useNavigate } from "./use-navigate.js";
import { usePathname } from "./use-pathname.js";

/**
 * Hook to manage search parameters.
 * @returns {[Seidr<Record<string, string>>, (key: string, value: string) => void]}
 * A tuple with a derived Seidr of search params and a function to set them.
 */
export const useSearchParams = () => {
  const location = usePathname();
  const navigate = useNavigate();

  const searchParams = location.as((path) => {
    const url = new URL(path, DUMMY_BASE_URL);
    return Object.fromEntries(url.searchParams.entries());
  });

  const setParam = (key: string, value: string) => {
    const url = new URL(location.value, DUMMY_BASE_URL);
    url.searchParams.set(key, value);
    navigate(url.pathname + url.search, true);
  };

  return [searchParams, setParam] as const;
};
