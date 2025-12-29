import { createMcpHandler } from "mcp-handler";
import { z } from "zod";
import { spawn } from "child_process";

const FFUF_PATH = process.env.FFUF_PATH || "/usr/bin/ffuf";

const handler = createMcpHandler(
  async (server) => {
    server.tool(
      "do-ffuf",
      "Run ffuf with a target URL and custom arguments",
      {
        url: z.string().url().describe("Target URL to fuzz"),
        ffuf_args: z
          .array(z.string())
          .default([])
          .describe("Additional ffuf arguments (each flag/param as separate array element)")
      },
      async ({ url, ffuf_args }) => {
        const args = ["-u", url, ...(ffuf_args ?? [])];

        return new Promise((resolve, reject) => {
          const proc = spawn(FFUF_PATH, args, { env: process.env });
          let output = "";

          proc.stdout.on("data", (chunk) => {
            output += chunk.toString();
          });

          proc.stderr.on("data", (chunk) => {
            output += chunk.toString();
          });

          proc.on("error", (err) => {
            reject(new Error(`Failed to start ffuf: ${err.message}`));
          });

          proc.on("close", (code) => {
            const summary = `\n\nffuf exited with code ${code}`;
            if (code === 0) {
              resolve({
                content: [
                  {
                    type: "text",
                    text: output + summary
                  }
                ]
              });
            } else {
              reject(new Error(output + summary));
            }
          });
        });
      }
    );
  },
  {
    capabilities: {
      tools: {
        "do-ffuf": {
          description: "Run ffuf with a target URL and custom arguments"
        }
      }
    }
  },
  {
    basePath: "",
    maxDuration: 60,
    verboseLogs: true,
    disableSse: true
  }
);

export { handler as GET, handler as POST, handler as DELETE };
