import { cpSync, existsSync, mkdirSync } from "node:fs";
import path from "node:path";

const root = process.cwd();
const standaloneDir = path.join(root, ".next/standalone");

if (!existsSync(path.join(standaloneDir, "server.js"))) {
  console.error("Missing .next/standalone/server.js — run `pnpm build` first.");
  process.exit(1);
}

cpSync(path.join(root, "public"), path.join(standaloneDir, "public"), {
  recursive: true,
  force: true,
});

mkdirSync(path.join(standaloneDir, ".next"), { recursive: true });
cpSync(path.join(root, ".next/static"), path.join(standaloneDir, ".next/static"), {
  recursive: true,
  force: true,
});

for (const pkg of ["styled-jsx"]) {
  const src = path.join(root, "node_modules", pkg);
  const dest = path.join(standaloneDir, "node_modules", pkg);
  if (!existsSync(src)) {
    console.warn(`Skip missing package: ${pkg}`);
    continue;
  }
  cpSync(src, dest, { recursive: true, force: true, dereference: true });
  console.log(`Copied ${pkg} into standalone`);
}

console.log("Standalone bundle ready in .next/standalone");
