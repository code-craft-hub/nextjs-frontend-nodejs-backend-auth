import { NextRequest, NextResponse } from "next/server";

type ProviderResult = {
  provider: string;
  data: Record<string, unknown>;
  error?: string;
};

const PROVIDERS = [
  {
    name: "ipapi",
    url: "https://ipapi.co/json/",
  },
  {
    name: "ipwho",
    url: "https://ipwho.is/",
  },
  {
    name: "freeipapi",
    url: "https://freeipapi.com/api/json",
  },
] as const;

async function fetchProvider(
  provider: (typeof PROVIDERS)[number],
  timeoutMs = 5000,
): Promise<ProviderResult> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(provider.url, {
      signal: controller.signal,
      headers: {
        accept: "application/json",
      },
    });

    if (!res.ok) {
      return {
        provider: provider.name,
        data: {},
        error: `HTTP ${res.status}`,
      };
    }

    return {
      provider: provider.name,
      data: await res.json(),
    };
  } catch (err) {
    return {
      provider: provider.name,
      data: {},
      error: err instanceof Error ? err.message : "Unknown error",
    };
  } finally {
    clearTimeout(timeout);
  }
}

export async function GET(request: NextRequest) {
  try {
    const results = await Promise.allSettled(
      PROVIDERS.map((p) => fetchProvider(p)),
    );

    let merged: Record<string, unknown> = {};

    for (const r of results) {
      if (r.status === "fulfilled") {
        merged = {
          ...merged,
          ...r.value.data,
        };
      }
    }

    return NextResponse.json(merged);
  } catch (error) {
    console.error("Geolocation API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch geolocation data" },
      { status: 500 },
    );
  }
}
