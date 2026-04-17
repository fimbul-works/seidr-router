import { beforeEach, describe, expect, it } from "vitest";
import { initRouter } from "../init-router";
import { useNavigate } from "./use-navigate";
import { usePathname } from "./use-pathname";

describe("usePathname", () => {
  beforeEach(() => {
    initRouter("/");
    window.history.replaceState(null, "", "/");
  });

  it("should return current path as a Seidr", () => {
    const location = usePathname();
    expect(location.value).toBe("/");
  });

  it("should be reactive when path changes", () => {
    const location = usePathname();
    const navigate = useNavigate();

    navigate("/about");
    expect(location.value).toBe("/about");
  });

  it("should be read-only (derived)", () => {
    const location = usePathname();
    expect(() => {
      location.value = "/forbidden";
    }).toThrow();
  });
});
