#!/usr/bin/env node

const { execSync } = require("child_process")
const fs = require("fs")
const path = require("path")

const ig = fs
    .readFileSync(".gitignore")
    .toString()
    .split("\n")
    .concat([".git", "package-lock.json", "node_modules", "dist", "build", "yarn.lock"])
    .filter((line) => line && !line.startsWith("#"))

const parseGitBlame = (blame) => {
    const contributions = {}
    const lines = blame.split("\n")
    lines.forEach((line) => {
        if (line.startsWith("author ")) {
            const author = line.split(" ")[1].trim()
            if (!contributions[author]) {
                contributions[author] = 0
            }
            contributions[author] += 1
        }
    })
    return contributions
}

const getAllFiles = (dirPath, arrayOfFiles) => {
    const files = fs.readdirSync(dirPath)

    arrayOfFiles = arrayOfFiles || []

    files.forEach((file) => {
        if (fs.statSync(path.join(dirPath, file)).isDirectory()) {
            if (!ig.includes(path.basename(file))) {
                arrayOfFiles = getAllFiles(path.join(dirPath, file), arrayOfFiles)
            }
        } else {
            if (!file.match(/\.(txt|md|js|jsx|ts|tsx|html|css|scss|json)$/)) {
                return
            }
            arrayOfFiles.push(path.join(dirPath, file))
        }
    })

    return arrayOfFiles
}

try {
    const files = getAllFiles(".").filter((filePath) => !ig.some((ignoredPath) => filePath.includes(ignoredPath)))

    let totalContributions = {}
    files.forEach((filePath) => {
        try {
            const gitBlame = execSync(`git blame --line-porcelain ${filePath}`).toString()
            const fileContributions = parseGitBlame(gitBlame)
            Object.keys(fileContributions).forEach((author) => {
                if (!totalContributions[author]) {
                    totalContributions[author] = 0
                }
                totalContributions[author] += fileContributions[author]
            })
        } catch (blameError) {}
    })

    // Display a simple bar graph for the contributions
    const maxContribution = Math.max(...Object.values(totalContributions))
    const totalContributionCount = Object.values(totalContributions).reduce((acc, val) => acc + val, 0)
    const graphWidth = 50 // Width of the graph

    const graphRows = Object.entries(totalContributions).map(([author, contributions]) => {
        const percentage = ((contributions / totalContributionCount) * 100).toFixed(2)
        return { row: `${author}: ${contributions} (${percentage}%)`, contributions }
    })

    const pad = Math.max(...graphRows.map(({ row }) => row.length))

    console.log("Contribution Graph:\n")

    graphRows.forEach(({ row, contributions }) => {
        const barLength = Math.round((contributions / maxContribution) * graphWidth)
        const bar = "#".repeat(barLength)
        console.log(`${row.padEnd(pad)} | ${bar}`)
    })
} catch (error) {
    console.error("Error processing git blame:", error)
}
