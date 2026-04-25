import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useLocalStorage } from "../useLocalStorage";

const mockStorage: Record<string, string> = {};

beforeEach(() => {
  Object.keys(mockStorage).forEach((k) => delete mockStorage[k]);
  vi.stubGlobal("localStorage", {
    getItem: vi.fn((key: string) => mockStorage[key] ?? null),
    setItem: vi.fn((key: string, value: string) => {
      mockStorage[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete mockStorage[key];
    }),
  });
});

describe("useLocalStorage", () => {
  it("returns default value when nothing is stored", () => {
    const { result } = renderHook(() => useLocalStorage("test-key", 42));
    expect(result.current[0]).toBe(42);
  });

  it("persists value to localStorage on set", () => {
    const { result } = renderHook(() => useLocalStorage("test-key", 0));
    act(() => result.current[1](99));
    expect(result.current[0]).toBe(99);
  });

  it("reads existing value from localStorage on mount", () => {
    mockStorage["preloaded"] = JSON.stringify("hello");
    const { result } = renderHook(() => useLocalStorage("preloaded", "default"));
    expect(result.current[0]).toBe("hello");
  });

  it("falls back to default on invalid JSON", () => {
    mockStorage["broken"] = "not-json{{{";
    const { result } = renderHook(() => useLocalStorage("broken", 7));
    expect(result.current[0]).toBe(7);
  });

  it("supports functional updater", () => {
    const { result } = renderHook(() => useLocalStorage("func-key", 10));
    act(() => result.current[1]((prev) => prev + 5));
    expect(result.current[0]).toBe(15);
  });
});
