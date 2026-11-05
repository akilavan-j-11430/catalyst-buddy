import { readFileSync } from "node:fs";
import { homedir } from "node:os";
import { join, posix } from "node:path";

const UPSTREAM_PLUGINS = [
  { id: "catalyst-by-zoho@catalyst-by-zoho", rawUrl: "https://raw.githubusercontent.com/catalystbyzoho/agent-skills/HEAD" },
  { id: "hallmark@hallmark", rawUrl: "https://raw.githubusercontent.com/nutlope/hallmark/HEAD" },
  { id: "zcatalystai@buddy", rawUrl: "https://raw.githubusercontent.com/akilavan-j-11430/catalyst-buddy/HEAD" },
];

function readInstalledPlugins() {
  const registryPath = join(homedir(), ".claude", "plugins", "installed_plugins.json");
  try {
    return JSON.parse(readFileSync(registryPath, "utf8")).plugins ?? {};
  } catch {
    return {};
  }
}

async function fetchJson(url) {
  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(15000) });
    return response.ok ? await response.json() : null;
  } catch {
    return null;
  }
}

async function readUpstreamVersion(plugin) {
  const marketplace = await fetchJson(`${plugin.rawUrl}/.claude-plugin/marketplace.json`);
  const pluginName = plugin.id.split("@")[0];
  const entry = marketplace?.plugins?.find((candidate) => candidate.name === pluginName);
  if (!entry) {
    return null;
  }
  if (entry.version) {
    return entry.version;
  }
  const manifestPath = posix.join(entry.source, ".claude-plugin", "plugin.json");
  const manifest = await fetchJson(`${plugin.rawUrl}/${manifestPath}`);
  return manifest?.version ?? null;
}

async function describeFreshness(plugin, installedPlugins) {
  const installs = installedPlugins[plugin.id] ?? [];
  if (installs.length === 0) {
    return { plugin: plugin.id, status: "missing" };
  }
  const installedVersion = installs[0].version;
  const upstreamVersion = await readUpstreamVersion(plugin);
  if (upstreamVersion === null) {
    return { plugin: plugin.id, status: "unknown", installedVersion };
  }
  return {
    plugin: plugin.id,
    status: installedVersion === upstreamVersion ? "current" : "behind",
    installedVersion,
    upstreamVersion,
  };
}

const installedPlugins = readInstalledPlugins();
const report = await Promise.all(UPSTREAM_PLUGINS.map((plugin) => describeFreshness(plugin, installedPlugins)));
console.log(JSON.stringify(report, null, 2));
