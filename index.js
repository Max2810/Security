/* eslint-disable max-depth */
"use strict";

require("dotenv").config();
require("make-promises-safe");

// Require Node.js Dependencies
const { join } = require("path");
const { mkdir, rmdir } = require("fs").promises;

// Require Third-party Dependencies
const { cyan, white } = require("kleur");
const Spinner = require("@slimio/async-cli-spinner");
Spinner.DEFAULT_SPINNER = "dots";

// Require Internal Dependencies
const { cloneGITRepository, fetchStatsFromNsecurePayloads, nsecure } = require("./src/utils");
const config = require("./data/config.json");

// CONSTANTS
const CLONE_DIR = join(__dirname, "clones");
const JSON_DIR = join(__dirname, "json");

async function fetchPackagesStats() {
    const spinner = new Spinner({
        prefixText: white().bold("Fetching packages stats on nsecure")
    }).start();

    try {
        const jsonFiles = await Promise.all(config.ADDONS.map(nsecure.onPackage));
        const elapsed = `${spinner.elapsedTime.toFixed(2)}ms`;
        spinner.succeed(`Successfully done in ${cyan().bold(elapsed)}`);

        return fetchStatsFromNsecurePayloads(jsonFiles);
    }
    catch (error) {
        spinner.failed(error.message);
        throw error;
    }
}

async function fetchRepositoriesStats() {
    const spinner = new Spinner({
        prefixText: white().bold("Clone and analyze built-in addons")
    }).start("clone repositories...");

    try {
        const repos = await Promise.all(config.REPOS.map(cloneGITRepository));
        spinner.text = "Run node-secure analyze";

        const jsonFiles = await Promise.all(repos.map(nsecure.onLocalDirectory));
        spinner.succeed(`Successfully done in ${spinner.elapsedTime.toFixed(2)}ms`);

        return fetchStatsFromNsecurePayloads(jsonFiles.filter((value) => value !== null));
    }
    catch (error) {
        spinner.failed(error.message);
        throw error;
    }
}

async function main() {
    await Promise.all([
        mkdir(JSON_DIR, { recursive: true }),
        mkdir(CLONE_DIR, { recursive: true })
    ]);

    try {
        const pkgStats = await fetchPackagesStats();
        // const repoStats = await fetchRepositoriesStats();

        console.log(pkgStats);
        // console.log(JSON.stringify(repoStats, null, 4));
    }
    finally {
        await new Promise((resolve) => setTimeout(resolve, 100));
        await rmdir(CLONE_DIR, { recursive: true });
    }
}
main().catch(console.error);
