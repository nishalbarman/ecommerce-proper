import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"], // Entry point for your package
  outDir: "dist", // Output directory
  format: ["cjs", "esm"], // Output formats (CommonJS and ES Modules)
  dts: true, // Generate TypeScript declaration files
  splitting: false, // Disable code splitting
  sourcemap: true, // Generate source maps
  clean: true, // Clean the output directory before building
  external: [
    "@reduxjs/toolkit",
    "redux-persist",
    "@reduxjs/toolkit/query",
    "@reduxjs/toolkit/query/react",
    "react-redux",
    "@react-native-async-storage/async-storage",
  ], // Externalize these dependencies
  tsconfig: "./tsconfig.json", // Specify the path to your tsconfig.json
});
