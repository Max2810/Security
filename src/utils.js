"use strict";

// Require Node.js Dependencies
const { readFile } = require("fs").promises;

// Require Third-party Dependencies
const { yellow } = require("kleur");

/**
 * @async
 * @function linkPackages
 * @param {string[]} files
 * @returns {Map<string, any>}
 */
async function linkPackages(files) {
    const result = new Map();

    for (const file of files) {
        const buf = await readFile(file);
        const stats = JSON.parse(buf.toString());
        for (const [name, descriptor] of Object.entries(stats)) {
            const { versions } = descriptor;
            const { size, license, composition: { required, required_builtin } } = descriptor[versions[0]];

            if (result.has(name)) {
                const curr = result.get(name);

                for (const lVer of versions) {
                    curr.versions.add(lVer);
                    const hasIndirectDependencies = descriptor[lVer].flags.hasIndirectDependencies;
                    curr[lVer] = {
                        hasIndirectDependencies
                    };
                }
            }
            else {
                const ref = {
                    internal: name.startsWith("@slimio/"),
                    versions: new Set(versions),
                    required: new Set(required),
                    required_builtin: new Set(required_builtin),
                    license,
                    size
                };

                for (const lVer of versions) {
                    const hasIndirectDependencies = descriptor[lVer].flags.hasIndirectDependencies;
                    ref[lVer] = {
                        hasIndirectDependencies
                    };
                }

                result.set(name, ref);
            }
        }
    }

    return result;
}

/**
 * @function stats
 * @param {*} stats
 * @returns {void}
 */
function stats(stats) {
    const ref = { internal: 0, external: 0, internalSize: 0, externalSize: 0 };
    const third = new Set();
    const slimDeps = new Set();
    const transitive = new Set();
    const intLicenses = { Unknown: 0 };
    const extLicenses = { Unknown: 0 };
    const required = new Set();
    const requiredBuiltin = new Set();

    // console.log(stats.entries());
    for (const [name, pkg] of stats.entries()) {
        // console.log(pkg.license);
        if (pkg.required.size !== 0) {
            required.add([...pkg.required]);
        }
        if (pkg.required_builtin.size !== 0) {
            requiredBuiltin.add([...pkg.required_builtin]);
        }
        if (pkg.internal) {
            slimDeps.add(name);
            if (pkg.license === "") {
                intLicenses.Unknown++;
            }
            else {
                intLicenses[pkg.license] = Reflect.has(intLicenses, pkg.license) ? ++intLicenses[pkg.license] : 1;
            }
            ref.internalSize += pkg.size;
            ref.internal++;
            continue;
        }

        ref.externalSize += pkg.size;
        third.add(name);
        if (pkg.license === "") {
            extLicenses.Unknown++;
        }
        else {
            extLicenses[pkg.license] = Reflect.has(extLicenses, pkg.license) ? ++extLicenses[pkg.license] : 1;
        }
        for (const version of pkg.versions) {
            if (pkg[version].hasIndirectDependencies) {
                transitive.add({ name, version });
            }
        }
    }
    ref.external = stats.size - ref.internal;

    const thirdArr = [...third];
    const slimDepsArr = [...slimDeps];
    const requiredArr = [...required];
    const requiredBuiltinArr = [...requiredBuiltin];
    const transiArr = [...transitive];

    return Object.assign({ thirdArr, slimDepsArr, transiArr, intLicenses, extLicenses, requiredArr, requiredBuiltinArr }, ref);
}

/**
 * @function formatBytes
 * @param {number} bytes
 * @param {number} decimals
 * @returns {number}
 */
function formatBytes(bytes, decimals) {
    if (bytes === 0) {
        return "0 B";
    }
    const dm = decimals <= 0 ? 0 : decimals || 2;
    const sizes = ["B", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
    const id = Math.floor(Math.log(bytes) / Math.log(1024));

    // eslint-disable-next-line
    return parseFloat((bytes / Math.pow(1024, id)).toFixed(dm)) + ' ' + sizes[id];
}

module.exports = { linkPackages, stats, formatBytes };
