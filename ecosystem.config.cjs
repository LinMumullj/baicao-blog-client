module.exports = {
  apps: [
    {
      name: "baicao-blog",
      script: "npm",
      args: "run start",
      cwd: "/var/www/baicao-blog-client",
      instances: 1,
      exec_mode: "fork",
      env: {
        NODE_ENV: "production",
        PORT: 3000,
        HOSTNAME: "0.0.0.0",
      },
    },
  ],
};
