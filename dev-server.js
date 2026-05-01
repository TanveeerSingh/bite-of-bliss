const { spawn } = require("child_process");

function startProcess(label, command, args, cwd) {
  const child = spawn(command, args, {
    cwd,
    stdio: "inherit",
    shell: false,
  });

  child.on("error", (error) => {
    console.error(`[${label}] failed to start:`, error.message);
    process.exit(1);
  });

  return child;
}

const processes = [
  startProcess("frontend", "npx", ["http-server", ".", "-p", "5500"], __dirname),
  startProcess("backend", "npm", ["run", "dev", "--prefix", "backend"], __dirname),
];

let shuttingDown = false;

function stopAll(exitCode = 0) {
  if (shuttingDown) {
    return;
  }

  shuttingDown = true;
  for (const child of processes) {
    if (!child.killed) {
      child.kill("SIGINT");
    }
  }

  process.exit(exitCode);
}

process.on("SIGINT", () => stopAll(0));
process.on("SIGTERM", () => stopAll(0));

for (const child of processes) {
  child.on("exit", (code, signal) => {
    if (shuttingDown) {
      return;
    }

    if (signal || code !== 0) {
      console.error(`One process stopped (${signal || code}). Shutting down the other process.`);
      stopAll(code || 1);
    }
  });
}

console.log("Frontend: http://localhost:5500");
console.log("Admin Portal: http://localhost:5500/admin-portal/admin-login.html");
console.log("Backend: http://localhost:5001");