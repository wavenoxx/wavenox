import { describe, it, expect, vi } from "vitest";
import { createDemoProjectStore, DEMO_CUSTOMERS } from "./project-demo";
import { DEMO_STAFF_DIRECTORY } from "./crm-auth";
import { createLiveProjectStore } from "./project-store";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { ProjectActor, ProjectCommand } from "@/lib/projects";
const owner: ProjectActor = { kind: "staff", id: DEMO_STAFF_DIRECTORY[0].id, role: "owner_admin" };
const customer: ProjectActor = { kind: "customer", id: DEMO_CUSTOMERS[0].id };
const projectId = "00000000-0000-4000-8000-000000000701";
const command = (version = 1): ProjectCommand => ({
  action: "note",
  projectId,
  expectedVersion: version,
  requestId: crypto.randomUUID(),
  payload: { summary: "Synthetic private operational note", customerVisible: false },
});
describe("project integrity and adapter failures", () => {
  it("rolls back demo data when the mandatory audit hook fails", async () => {
    const db = createDemoProjectStore(() => {
      throw new Error("Injected audit failure");
    });
    const before = await db.read(owner, projectId);
    await expect(db.mutate(owner, command())).rejects.toThrow();
    expect(await db.read(owner, projectId)).toEqual(before);
  });
  it("allows one concurrent version, rejects stale updates, and replays one request without duplicate audit", async () => {
    const db = createDemoProjectStore();
    const c = command();
    const results = await Promise.allSettled([db.mutate(owner, c), db.mutate(owner, command())]);
    expect(results.map((r) => r.status).sort()).toEqual(["fulfilled", "rejected"]);
    expect((await db.mutate(owner, c)).replayed).toBe(true);
    const p = await db.read(owner, projectId);
    expect(p.version).toBe(2);
    expect(p.activities).toHaveLength(1);
    await expect(
      db.mutate(owner, { ...c, payload: { summary: "Changed payload attempt" } }),
    ).rejects.toMatchObject({ status: 409 });
  });
  it("denies unassigned, deactivated and read-only staff", async () => {
    const db = createDemoProjectStore();
    for (const n of [2, 3, 4]) {
      const s = DEMO_STAFF_DIRECTORY[n];
      await expect(
        db.read({ kind: "staff", id: s.id, role: s.role }, projectId),
      ).rejects.toMatchObject({ status: 403 });
    }
  });
  it("enforces revocation for reads, support and document checks", async () => {
    const db = createDemoProjectStore();
    await db.mutate(owner, {
      ...command(),
      action: "revoke",
      payload: { userId: customer.id, reason: "Synthetic revocation requested" },
    });
    await expect(db.read(customer, projectId)).rejects.toMatchObject({ status: 403 });
    await expect(
      db.mutate(customer, {
        ...command(2),
        action: "support",
        payload: { category: "other", description: "Unauthorized request after revocation" },
      }),
    ).rejects.toMatchObject({ status: 403 });
  });
  it("rate limits support and keeps resolution explicit", async () => {
    const db = createDemoProjectStore();
    for (let n = 1; n <= 5; n++)
      await db.mutate(customer, {
        ...command(n),
        action: "support",
        payload: { category: "other", description: "Synthetic project assistance" },
      });
    await expect(
      db.mutate(customer, {
        ...command(6),
        action: "support",
        payload: { category: "other", description: "One request beyond the limit" },
      }),
    ).rejects.toMatchObject({ status: 429 });
    expect((await db.read(owner, projectId)).support.every((s) => s.resolved_at === null)).toBe(
      true,
    );
  });
  it("the LIVE adapter uses exactly one transactional RPC and never simulates success on errors", async () => {
    const rpc = vi.fn().mockResolvedValue({ data: null, error: { code: "XX000" } });
    const from = vi.fn();
    const db = createLiveProjectStore({ rpc, from } as unknown as SupabaseClient);
    await expect(db.mutate(owner, command())).rejects.toMatchObject({ status: 503 });
    expect(rpc).toHaveBeenCalledOnce();
    expect(rpc.mock.calls[0][0]).toBe("project_mutate");
    expect(from).not.toHaveBeenCalled();
    rpc.mockResolvedValue({ data: null, error: { code: "PT409" } });
    await expect(db.mutate(owner, command())).rejects.toMatchObject({ status: 409 });
  });
  it("rejects a public bucket or failed storage request", async () => {
    const getBucket = vi.fn().mockResolvedValue({ data: { public: true }, error: null });
    const from = vi.fn();
    const db = createLiveProjectStore({
      storage: { getBucket, from },
    } as unknown as SupabaseClient);
    await expect(db.download("private")).rejects.toMatchObject({ status: 503 });
    expect(from).not.toHaveBeenCalled();
  });
});
