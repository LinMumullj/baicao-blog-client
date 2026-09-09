import crypto from "crypto";
import { getMaxUploadBytes } from "@/lib/upload-limits";

interface OSSConfig {
  region: string;
  accessKeyId: string;
  accessKeySecret: string;
  bucket: string;
  endpoint: string;
}

interface OssDeleteTarget {
  key: string;
  host: string;
}

function getOSSConfig(): OSSConfig {
  return {
    region: process.env.OSS_REGION || "oss-cn-hangzhou",
    accessKeyId: process.env.OSS_ACCESS_KEY_ID || "",
    accessKeySecret: process.env.OSS_ACCESS_KEY_SECRET || "",
    bucket: process.env.OSS_BUCKET || "",
    endpoint: process.env.OSS_ENDPOINT || "",
  };
}

function normalizeEndpoint(endpoint: string): string {
  return endpoint.replace(/^https?:\/\//, "").replace(/\/+$/, "");
}

export function getOssHost(config: OSSConfig = getOSSConfig()): string {
  if (config.endpoint) {
    const endpoint = normalizeEndpoint(config.endpoint);
    if (endpoint.startsWith(`${config.bucket}.`)) {
      return endpoint;
    }
    return `${config.bucket}.${endpoint}`;
  }

  return `${config.bucket}.${config.region}.aliyuncs.com`;
}

function encodeOssKeyForUrl(key: string): string {
  return key
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/");
}

export function generateUploadParams(filename: string, contentType: string) {
  const config = getOSSConfig();
  const ext = filename.split(".").pop() || "jpg";
  const key = `uploads/${Date.now()}-${crypto.randomUUID()}.${ext}`;

  const expiration = new Date(Date.now() + 30 * 60 * 1000).toISOString();
  const maxBytes = getMaxUploadBytes(contentType);

  const policy = Buffer.from(
    JSON.stringify({
      expiration,
      conditions: [
        ["content-length-range", 0, maxBytes],
        { bucket: config.bucket },
        { key },
        ["starts-with", "$Content-Type", contentType.split("/")[0]],
        { "x-oss-object-acl": "public-read" },
      ],
    })
  ).toString("base64");

  const signature = crypto
    .createHmac("sha1", config.accessKeySecret)
    .update(policy)
    .digest("base64");

  const host = getOssHost(config);

  return {
    host: `https://${host}`,
    key,
    policy,
    signature,
    accessKeyId: config.accessKeyId,
    url: `https://${host}/${key}`,
  };
}

export async function uploadFileToOSS(
  file: Blob,
  filename: string,
  contentType: string
) {
  const params = generateUploadParams(filename, contentType);

  const formData = new FormData();
  formData.append("key", params.key);
  formData.append("policy", params.policy);
  formData.append("OSSAccessKeyId", params.accessKeyId);
  formData.append("Signature", params.signature);
  formData.append("Content-Type", contentType);
  formData.append("x-oss-object-acl", "public-read");
  formData.append("file", file, filename);

  const res = await fetch(params.host, { method: "POST", body: formData });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`OSS 上传失败: ${res.status} ${text}`);
  }

  return { url: params.url, type: contentType };
}

export function extractOssKeyFromUrl(url: string): string | null {
  try {
    const pathname = new URL(url).pathname;
    const key = decodeURIComponent(pathname.replace(/^\/+/, ""));
    return key.length > 0 ? key : null;
  } catch {
    return null;
  }
}

export function isManagedOssUrl(url: string): boolean {
  return parseManagedOssUrl(url) !== null;
}

export function parseManagedOssUrl(url: string): OssDeleteTarget | null {
  try {
    const config = getOSSConfig();
    if (!config.bucket) return null;

    const parsed = new URL(url);
    if (!parsed.host.startsWith(`${config.bucket}.`)) {
      return null;
    }

    const key = extractOssKeyFromUrl(url);
    if (!key) return null;

    return { key, host: parsed.host };
  } catch {
    return null;
  }
}

export async function deleteOssObject(
  key: string,
  host: string = getOssHost()
): Promise<void> {
  const config = getOSSConfig();
  if (!config.accessKeyId || !config.accessKeySecret || !config.bucket) {
    return;
  }

  const date = new Date().toUTCString();
  const canonicalizedResource = `/${config.bucket}/${key}`;
  const stringToSign = `DELETE\n\n\n${date}\n${canonicalizedResource}`;
  const signature = crypto
    .createHmac("sha1", config.accessKeySecret)
    .update(stringToSign)
    .digest("base64");

  const res = await fetch(`https://${host}/${encodeOssKeyForUrl(key)}`, {
    method: "DELETE",
    headers: {
      Date: date,
      Authorization: `OSS ${config.accessKeyId}:${signature}`,
    },
  });

  if (!res.ok && res.status !== 404) {
    const text = await res.text();
    throw new Error(`OSS 删除失败: ${res.status} ${text}`);
  }
}

export async function deleteOssObjectsByUrls(urls: string[]): Promise<void> {
  const targets = urls
    .map(parseManagedOssUrl)
    .filter((target): target is OssDeleteTarget => target !== null);

  if (targets.length === 0 && urls.length > 0) {
    console.warn("No managed OSS URLs matched for deletion:", urls);
  }

  const results = await Promise.allSettled(
    targets.map(({ key, host }) => deleteOssObject(key, host))
  );

  for (const [index, result] of results.entries()) {
    if (result.status === "rejected") {
      const target = targets[index];
      console.error(
        `Failed to delete OSS object ${target.key} on ${target.host}:`,
        result.reason
      );
    }
  }
}
