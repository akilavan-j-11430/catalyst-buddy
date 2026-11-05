import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

const UPSTREAM_PLUGINS = [
  { id: "catalyst-by-zoho@catalyst-by-zoho", repoUrl: "https://github.com/catalystbyzoho/agent-skills" },
  { id: "hallmark@hallmark", repoUrl: "https://github.com/nutlope/hallmark" },
  { id: "zcatalystai@buddy", repoUrl: "https://github.com/akilavan-j-11430/catalyst-buddy" },
];

function readInstalledPlugins() {
  const registryPath = join(homedir(), ".claude", "plugins", "installed_plugins.json");
  try {
    return JSON.parse(readFileSync(registryPath, "utf8")).plugins ?? {};
  } catch {
    return {};
  }
}

function readUpstreamHead(repoUrl) {
  try {
    const output = execFileSync("git", ["ls-remote", repoUrl, "HEAD"], {
      encoding: "utf8",
      timeout: 15000,
      stdio: ["ignore", "pipe", "ignore"],
      env: { ...process.env, GIT_TERMINAL_PROMPT: "0" },
    });
    return output.split(/\s+/)[0] || null;
  } catch {
    return null;
  }
}

function describeFreshness(plugin, installedPlugins) {
  const installs = installedPlugins[plugin.id] ?? [];
  if (installs.length === 0) {
    return { plugin: plugin.id, status: "missing" };
  }
  const installed = installs[0];
  if (!installed.gitCommitSha) {
    return { plugin: plugin.id, status: "unknown", installedVersion: installed.version };
  }
  const upstreamSha = readUpstreamHead(plugin.repoUrl);
  if (upstreamSha === null) {
    return { plugin: plugin.id, status: "unknown", installedVersion: installed.version };
  }
  const isCurrent = installed.gitCommitSha === upstreamSha;
  return {
    plugin: plugin.id,
    status: isCurrent ? "current" : "behind",
    installedVersion: installed.version,
    installedSha: installed.gitCommitSha?.slice(0, 7) ?? "unknown",
    upstreamSha: upstreamSha.slice(0, 7),
  };
}

const installedPlugins = readInstalledPlugins();
const report = UPSTREAM_PLUGINS.map((plugin) => describeFreshness(plugin, installedPlugins));
console.log(JSON.stringify(report, null, 2));
