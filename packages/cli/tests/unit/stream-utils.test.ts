import assert from "node:assert/strict";
import { PassThrough } from "node:stream";
import { describe, it } from "node:test";

import { createStdoutChunkQueue, drainStderr, STDERR_CAP } from "../../src/providers/stream-utils.js";

async function collectChunks(stdout: PassThrough): Promise<string[]> {
  const chunks: string[] = [];

  for await (const chunk of createStdoutChunkQueue(stdout)) {
    chunks.push(chunk);
  }

  return chunks;
}

describe("stream-utils", () => {
  it("createStdoutChunkQueue yields stdout chunks in order", async () => {
    const stdout = new PassThrough();
    const chunksPromise = collectChunks(stdout);

    stdout.write("first chunk\n");
    stdout.write("second chunk\n");
    stdout.end("third chunk\n");

    assert.deepEqual(await chunksPromise, ["first chunk\n", "second chunk\n", "third chunk\n"]);
  });

  it("drainStderr keeps only the capped stderr tail", () => {
    const stderr = new PassThrough();
    const { getBuffer } = drainStderr(stderr);
    const discardedHead = "discarded-head\n";
    const keptTail = "kept-tail\n";

    stderr.write(discardedHead);
    stderr.write("x".repeat(STDERR_CAP));
    stderr.end(keptTail);

    const buffered = getBuffer();

    assert.equal(buffered.length, STDERR_CAP);
    assert.ok(buffered.endsWith(keptTail), "expected the newest stderr tail to be preserved");
    assert.ok(!buffered.includes(discardedHead), "expected older stderr content to be truncated");
  });

  it("drainStderr handles stderr error events gracefully", () => {
    const stderr = new PassThrough();

    drainStderr(stderr);

    assert.doesNotThrow(() => {
      stderr.emit("error", new Error("simulated stderr failure"));
    });
  });
});