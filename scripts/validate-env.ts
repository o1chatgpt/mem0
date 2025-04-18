#!/usr/bin/env node

import { validateEnvironmentVariables, generateEnvErrorMessage } from "../lib/env-validator"

// This script can be run directly to validate environment variables
// Usage: npx ts-node scripts/validate-env.ts [--strict]

const strict = process.argv.includes("--strict")
const validationResult = validateEnvironmentVariables(strict)

if (!validationResult.isValid) {
  console.error(generateEnvErrorMessage(validationResult))
  process.exit(1)
} else {
  console.log("✅ All required environment variables are properly configured.")

  if (validationResult.warnings.length > 0 && !strict) {
    console.log("\n⚠️ Warnings were found but ignored in non-strict mode:")
    validationResult.warnings.forEach((warning) => {
      const severityIcon = warning.severity === "high" ? "🔴" : warning.severity === "medium" ? "🟠" : "🟡"
      console.log(`- ${severityIcon} ${warning.name}: ${warning.message}`)
    })
  }

  process.exit(0)
}
