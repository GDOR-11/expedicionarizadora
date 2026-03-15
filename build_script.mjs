import esbuild from "esbuild";

const debug = ["true", "debug"].includes(process.argv[2]);

console.log("building...");
const ctx = await esbuild.context({
    entryPoints: ["./src/index.js"],
    minify: !debug,
    bundle: true,
    outfile: "dist/index.js",
    sourcemap: debug,
    format: "esm",
});
console.log("build finished!");

console.log("serving on: " + (await ctx.serve({
    port: parseInt(process.argv[3]) || 3000,
    servedir: `./dist`
})).hosts.join(", "));
