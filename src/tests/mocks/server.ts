import { setupServer } from "msw/node";
import { handlers } from "./handlers";

/**
 * The MSW server consumed by `vitest.setup.ts`, which owns its lifecycle
 * (listen / resetHandlers / close). Referenced by the setup file since the test
 * suite was introduced but never committed, which made every client test fail
 * at setup with "Failed to resolve import ./src/tests/mocks/server".
 */
export const server = setupServer(...handlers);
