/* eslint-disable jsdoc/require-jsdoc */
"use strict";

async function request(path, customHeaders = Object.create(null)) {
    const headers = {
        Accept: "application/json"
    };

    const raw = await fetch(path, {
        method: "GET",
        headers: Object.assign({}, headers, customHeaders)
    });

    return raw.json();
}

function mapLicense(data) {
    // console.log(data);
    Object.filter = (obj, predicate) => Object.keys(obj)
        .filter((key) => predicate(obj[key]))
        // eslint-disable-next-line no-return-assign
        .reduce((res, key) => (res[key] = obj[key], res), {});

    const obj = Object.filter(data, (value) => value > 0);

    // console.log(obj);
    const licenseName = Object.keys(obj).map((key) => key);
    const licenseValue = Object.keys(obj).map((key) => obj[key]);

    return { licenseName, licenseValue };
}

document.addEventListener("DOMContentLoaded", async() => {
    const data = await request("/data");

    console.log(data);

    const intLicenses = mapLicense(data.fStats.intLicenses);
    const extLicenses = mapLicense(data.fStats.extLicenses);
    const intLicensesPkg = mapLicense(data.fStatsPkg.intLicenses);
    const extLicensesPkg = mapLicense(data.fStatsPkg.extLicenses);

    Chart.defaults.global.defaultFontColor = "grey";
    Chart.defaults.global.defaultFontFamily = "Arial";
    new Chart(document.getElementById("pie-chart-intLicense"), {
        type: "pie",
        data: {
            labels: intLicenses.licenseName,
            datasets: [{
                label: "Population (millions)",
                backgroundColor: ["#3e95cd", "#8e5ea2", "#3cba9f", "#e8c3b9", "#c45850"],
                data: intLicenses.licenseValue
            }]
        },
        options: {
            title: {
                display: true,
                text: "Licenses"
            }
        }
    });
    new Chart(document.getElementById("pie-chart-extLicense"), {
        type: "pie",
        data: {
            labels: extLicenses.licenseName,
            datasets: [{
                label: "Population (millions)",
                backgroundColor: ["#3e95cd", "#8e5ea2", "#3cba9f", "#e8c3b9", "#c45850"],
                data: extLicenses.licenseValue
            }]
        },
        options: {
            title: {
                display: true,
                text: "Licenses"
            }
        }
    });
    new Chart(document.getElementById("pie-chart-intLicensePkg"), {
        type: "pie",
        data: {
            labels: intLicensesPkg.licenseName,
            datasets: [{
                label: "Population (millions)",
                backgroundColor: ["#3e95cd", "#8e5ea2", "#3cba9f", "#e8c3b9", "#c45850"],
                data: intLicensesPkg.licenseValue
            }]
        },
        options: {
            title: {
                display: true,
                text: "Licenses"
            }
        }
    });
    new Chart(document.getElementById("pie-chart-extLicensePkg"), {
        type: "pie",
        data: {
            labels: extLicensesPkg.licenseName,
            datasets: [{
                label: "Population (millions)",
                backgroundColor: ["#3e95cd", "#8e5ea2", "#3cba9f", "#e8c3b9", "#c45850"],
                data: extLicensesPkg.licenseValue
            }]
        },
        options: {
            title: {
                display: true,
                text: "Licenses"
            }
        }
    });

    function generateTable(table, data) {
        for (const element of data) {
            const row = table.insertRow();
            const cell = row.insertCell();
            const text = document.createTextNode(element);
            cell.appendChild(text);
        }
    }

    const thirdTable = document.getElementById("thirdArr");
    const slimDepsTable = document.getElementById("slimDepsArr");
    generateTable(slimDepsTable, data.fStats.slimDepsArr);
    generateTable(thirdTable, data.fStats.thirdArr);


//    generateTableHead(table, data2);
});

