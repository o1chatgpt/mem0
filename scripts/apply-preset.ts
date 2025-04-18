#!/usr/bin/env node

import fs from "fs"
import path from "path"
import { program } from "commander"
import inquirer from "inquirer"
import chalk from "chalk"
import {
  environmentPresets,
  generateEnvFromPreset,
  generateEnvFileContent,
  checkPresetCompatibility,
} from "../lib/env-presets"

// Set up the command line interface
program.name("apply-preset").description("Apply environment variable presets to generate .env files").version("1.0.0")

program.command("list").description("List available presets").action(listPresets)

program
  .command("apply")
  .description("Apply a preset to generate a .env file")
  .option("-p, --preset <presetIds>", "Preset ID(s) to apply (comma-separated)")
  .option("-o, --output <filename>", "Output filename", ".env.local")
  .option("-i, --interactive", "Use interactive mode", false)
  .option("-f, --force", "Force overwrite if file exists", false)
  .action(applyPreset)

program.command("detect").description("Detect which presets match the current environment").action(detectPresets)

program.parse(process.argv)

// If no command is provided, show help
if (!process.argv.slice(2).length) {
  program.outputHelp()
}

// Function to list all available presets
function listPresets() {
  console.log(chalk.bold("Available Environment Presets:"))
  console.log("")

  environmentPresets.forEach((category) => {
    console.log(chalk.blue.bold(`${category.name}:`))
    console.log(chalk.gray(category.description))
    console.log("")

    category.presets.forEach((preset) => {
      console.log(`  ${chalk.green(preset.id)} - ${chalk.yellow(preset.name)}`)
      console.log(`    ${chalk.gray(preset.description)}`)
      console.log(`    ${chalk.cyan("Tags:")} ${preset.tags.join(", ")}`)
      if (preset.recommended) {
        console.log(`    ${chalk.magenta("✓ Recommended")}`)
      }
      console.log("")
    })
  })
}

// Function to apply a preset and generate a .env file
async function applyPreset(options: {
  preset?: string
  output: string
  interactive: boolean
  force: boolean
}) {
  let presetIds: string[] = []

  if (options.interactive) {
    // Interactive mode - prompt for presets
    const { categoryChoice } = await inquirer.prompt([
      {
        type: "list",
        name: "categoryChoice",
        message: "Select a preset category:",
        choices: environmentPresets.map((cat) => ({
          name: `${cat.name} - ${cat.description}`,
          value: cat.id,
        })),
      },
    ])

    const category = environmentPresets.find((cat) => cat.id === categoryChoice)
    if (!category) {
      console.error(chalk.red("Category not found"))
      process.exit(1)
    }

    const { presetChoices } = await inquirer.prompt([
      {
        type: "checkbox",
        name: "presetChoices",
        message: "Select presets to apply:",
        choices: category.presets.map((preset) => ({
          name: `${preset.name} - ${preset.description}`,
          value: preset.id,
          checked: preset.recommended,
        })),
      },
    ])

    presetIds = presetChoices

    // Ask for additional presets from other categories
    const { addMore } = await inquirer.prompt([
      {
        type: "confirm",
        name: "addMore",
        message: "Would you like to add presets from other categories?",
        default: false,
      },
    ])

    if (addMore) {
      const otherCategories = environmentPresets.filter((cat) => cat.id !== categoryChoice)

      for (const cat of otherCategories) {
        const { addFromCategory } = await inquirer.prompt([
          {
            type: "confirm",
            name: "addFromCategory",
            message: `Add presets from ${cat.name}?`,
            default: false,
          },
        ])

        if (addFromCategory) {
          const { additionalPresets } = await inquirer.prompt([
            {
              type: "checkbox",
              name: "additionalPresets",
              message: `Select presets from ${cat.name}:`,
              choices: cat.presets.map((preset) => ({
                name: `${preset.name} - ${preset.description}`,
                value: preset.id,
                checked: preset.recommended,
              })),
            },
          ])

          presetIds = [...presetIds, ...additionalPresets]
        }
      }
    }

    // Check compatibility
    if (presetIds.length > 1) {
      const compatibility = checkPresetCompatibility(presetIds)

      if (!compatibility.compatible) {
        console.log(chalk.yellow("⚠️ Warning: Selected presets have compatibility issues:"))

        compatibility.incompatibilities.forEach((issue) => {
          console.log(`  - ${issue.reason}`)
        })

        const { continueAnyway } = await inquirer.prompt([
          {
            type: "confirm",
            name: "continueAnyway",
            message: "Continue anyway?",
            default: false,
          },
        ])

        if (!continueAnyway) {
          console.log(chalk.yellow("Operation cancelled"))
          process.exit(0)
        }
      }
    }

    // Ask for output filename
    const { outputFile } = await inquirer.prompt([
      {
        type: "input",
        name: "outputFile",
        message: "Output filename:",
        default: options.output,
      },
    ])

    options.output = outputFile
  } else if (options.preset) {
    // Non-interactive mode - use provided preset IDs
    presetIds = options.preset.split(",")
  } else {
    console.error(chalk.red("Error: No preset specified. Use --preset or --interactive"))
    process.exit(1)
  }

  if (presetIds.length === 0) {
    console.error(chalk.red("Error: No presets selected"))
    process.exit(1)
  }

  // Generate environment variables from presets
  const variables = generateEnvFromPreset(presetIds)

  // Generate .env file content
  const content = generateEnvFileContent(variables)

  // Check if file exists
  const outputPath = path.resolve(process.cwd(), options.output)
  if (fs.existsSync(outputPath) && !options.force) {
    if (options.interactive) {
      const { overwrite } = await inquirer.prompt([
        {
          type: "confirm",
          name: "overwrite",
          message: `File ${options.output} already exists. Overwrite?`,
          default: false,
        },
      ])

      if (!overwrite) {
        console.log(chalk.yellow("Operation cancelled"))
        process.exit(0)
      }
    } else {
      console.error(chalk.red(`Error: File ${options.output} already exists. Use --force to overwrite`))
      process.exit(1)
    }
  }

  // Write the file
  fs.writeFileSync(outputPath, content)

  console.log(chalk.green(`✓ Environment variables written to ${options.output}`))
  console.log(chalk.gray(`Applied presets: ${presetIds.join(", ")}`))

  // Show a summary of the variables
  console.log("")
  console.log(chalk.bold("Summary of environment variables:"))

  const variableCount = Object.keys(variables).length
  console.log(chalk.cyan(`Total variables: ${variableCount}`))

  // Group variables by type
  const secretCount = Object.keys(variables).filter(
    (key) => key.includes("KEY") || key.includes("SECRET") || key.includes("PASSWORD"),
  ).length

  const publicCount = Object.keys(variables).filter((key) => key.startsWith("NEXT_PUBLIC_")).length

  console.log(chalk.yellow(`Public variables: ${publicCount}`))
  console.log(chalk.magenta(`Secret variables: ${secretCount}`))
  console.log(chalk.gray(`Other variables: ${variableCount - publicCount - secretCount}`))
}

// Function to detect which presets match the current environment
function detectPresets() {
  // This function is limited in Node.js script context
  console.log(chalk.yellow("Note: Detection is limited in CLI mode and works best in the application"))

  // Check for common environment indicators
  const nodeEnv = process.env.NODE_ENV

  if (nodeEnv === "development") {
    console.log(chalk.green("Detected development environment"))
  } else if (nodeEnv === "production") {
    console.log(chalk.green("Detected production environment"))
  } else {
    console.log(chalk.yellow("Could not confidently detect environment"))
  }

  // Check for specific preset indicators
  environmentPresets.forEach((category) => {
    category.presets.forEach((preset) => {
      let matchCount = 0
      let checkedCount = 0

      for (const [key, value] of Object.entries(preset.variables)) {
        if (value === null) continue
        checkedCount++

        if (process.env[key] === value) {
          matchCount++
        }
      }

      if (checkedCount > 0 && matchCount / checkedCount > 0.7) {
        console.log(chalk.green(`Detected preset: ${preset.name} (${matchCount}/${checkedCount} variables match)`))
      }
    })
  })
}
