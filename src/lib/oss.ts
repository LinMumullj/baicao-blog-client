import crypto from "crypto";
import { getMaxUploadBytes } from "@/lib/upload-limits";

interface OSSConfig {
  region: string;
  accessKeyId: string;
  accessKeySecret: string;
  bucket: string;
  endpoint: string;
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

  const host = config.endpoint
    ? `https://${config.bucket}.${config.endpoint}`
    : `https://${config.bucket}.${config.region}.aliyuncs.com`;

  return {
    host,
    key,
    policy,
    signature,
    accessKeyId: config.accessKeyId,
    url: `${host}/${key}`,
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
