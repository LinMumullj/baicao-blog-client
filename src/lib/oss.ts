import crypto from "crypto";

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

  const policy = Buffer.from(
    JSON.stringify({
      expiration,
      conditions: [
        ["content-length-range", 0, 50 * 1024 * 1024],
        { bucket: config.bucket },
        { key },
        ["starts-with", "$Content-Type", contentType.split("/")[0]],
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
