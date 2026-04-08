import esbuild from "esbuild";
import { htmlPlugin } from "@craftamap/esbuild-plugin-html";
import * as fs from "fs/promises";

const debug = ["true", "debug"].includes(process.argv[2]);

console.log("cleaning build directory...");
await fs.rm("dist", { recursive: true, force: true }).catch(() => {});

console.log("building...");
const ctx = await esbuild.context({
    entryPoints: ["./src/index.tsx", "./src/styles.css"],
    minify: !debug,
    bundle: true,
    outdir: "dist",
    sourcemap: debug,
    format: "esm",
    plugins: [
        htmlPlugin({
            files: [
                {
                    entryPoints: ["src/index.tsx", "src/styles.css"],
                    filename: "index.html",
                    htmlTemplate: "./src/index.html",
                    scriptLoading: "module"
                }
            ]
        })
    ]
});
console.log("build finished!");

console.log("serving on: " + (await ctx.serve({
    port: parseInt(process.argv[3]) || 3000,
    servedir: `./dist`
})).hosts.join(", "));
