import { describeDualMode, enableClientMode } from "@fimbul-works/seidr/testing";
import { beforeEach, expect, it, vi } from "vitest";
import { useNavigate } from "./use-navigate";
import { useParams } from "./use-params";
import { usePathname } from "./use-pathname";

describeDualMode("useNavigate", ({ mode }) => {
  beforeEach(() => {
    enableClientMode();
    vi.stubGlobal("window", {
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      location: {
        pathname: "/",
        search: "",
        hash: "",
        href: "http://localhost/",
      },
      history: {
        pushState: vi.fn(),
        replaceState: vi.fn(),
        go: vi.fn(),
      },
    });
  });

  it("should update currentPath value", () => {
    const navigate = useNavigate();
    navigate("/about");
    expect(usePathname().value).toBe("/about");
  });

  it("should preserve query params and hashes", () => {
    const navigate = useNavigate();
    navigate("/about?foo=bar#baz");
    expect(usePathname().value).toBe("/about?foo=bar");
    expect(useParams().value).toEqual({ foo: "bar" });
  });

  if (mode !== "SSR") {
    it("should call window.history.pushState", () => {
      const navigate = useNavigate();
      navigate("/contact");
      expect(window.history.pushState).toHaveBeenCalledWith({}, "", "/contact");
    });

    it("should call window.history.go when passing a number", () => {
      const navigate = useNavigate();
      navigate(-1);
      expect(window.history.go).toHaveBeenCalledWith(-1);
    });
  }
});
