import { requireEnv } from "@/lib/env";

describe("requireEnv", () => {
  const KEY = "COOPCART_TEST_ENV_VAR";

  afterEach(() => {
    delete process.env[KEY];
  });

  it("returns the value when the variable is set", () => {
    process.env[KEY] = "hello";
    expect(requireEnv(KEY)).toBe("hello");
  });

  it("throws a clear, actionable error when the variable is missing", () => {
    delete process.env[KEY];
    expect(() => requireEnv(KEY)).toThrow(/Missing required environment variable/);
  });

  it("treats an empty string as missing", () => {
    process.env[KEY] = "";
    expect(() => requireEnv(KEY)).toThrow();
  });
});
