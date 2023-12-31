const pName = document.getElementById('ProcessName');
const pBurstTime = document.getElementById('ProcessBurstTime');
const pPriority = document.getElementById('ProcessPriority');
const pTimeQuantum = document.getElementById('ProcessTimeQuantum');
const addBtn = document.getElementById('AddButton');
const showBtn = document.getElementById('ShowButton');
const clrBtn = document.getElementById('ClearButton');
const rstBtn = document.getElementById('ResetButton');
const pListTable = document.querySelector('#JobsTable > table > tbody');
const fcfsDiv = document.getElementById('FCFS');
const sjfDiv = document.getElementById('SJF');
const rrDiv = document.getElementById('RR');
const pDiv = document.getElementById('P');
let sjf = [], rr = [], pri = [];

window.onbeforeunload = () => resetPage();
window.onload = () => pName.focus();

async function addProcess() {
    if (pName.value == "" || pBurstTime.value == "" || (pTimeQuantum.value != "" && isNaN(pTimeQuantum.value))) {
        alert("Please enter all the fields with proper inputs!!");
    }
    else {
        let process = document.createElement('tr');
        let processName = pName.value;
        let processBurstTime = pBurstTime.value;
        let processPriority = parseInt(pPriority.value);
        process.innerHTML = `<td>${processName}</td><td>${processBurstTime}</td><td>${processPriority}</td></tr>`;
        pListTable.appendChild(process);
        clearEntries();

        if (fcfsDiv.contains(fcfsDiv.children[2]) || sjfDiv.contains(sjfDiv.children[2]) || rrDiv.contains(rrDiv.children[2]) || pDiv.contains(pDiv.children[2])) {
            await clearGanttCharts();
        }
    }
    pName.focus();
}

async function showGanttCharts() {
    if (pListTable.childElementCount == 0) {
        alert('Please enter atleast one Process!!');
    }
    else {
        await clearGanttCharts();
        await fcfsGanttChart();
        await sjfGanttChart();
        await rrGanttChart();
        await pGanttChart();
    }
    pName.focus();
}

async function fcfsGanttChart() {

    let waitingTimeDisplay = "(";
    let processTime = 0, randomColor = 0, burstTime = 0, totalTime = 0;
    let process = document.createElement('div');
    process.setAttribute('class', "GanttChart");
    for (tableRow = 0; tableRow < pListTable.childElementCount; tableRow++) {
        randomColor = '#' + Math.floor(Math.random() * 16777215).toString(16);
        burstTime = parseInt(pListTable.children[tableRow].children[1].textContent);
        let pWidth = 30 * burstTime;
        if (pWidth >= 200)
            pWidth = 150;
        else if (pWidth >= 150)
            pWidth = 100;
        else if (pWidth >= 100)
            pWidth = 80;
        process.innerHTML += `
            <span><sup>${processTime}</sup></span>
            <p style="width: ${pWidth}px; border-radius: 0.2em; background-color: ${randomColor}">${pListTable.children[tableRow].children[0].textContent}</p>`;
        totalTime += processTime;
        waitingTimeDisplay += " + " + processTime;
        processTime += burstTime;
    }
    waitingTimeDisplay = waitingTimeDisplay.replace("+", "");
    process.innerHTML += `
            <span><sup>${processTime}</sup></span>`
    fcfsDiv.appendChild(process);
    waitingTimeDisplay += " )/" + pListTable.childElementCount + " = ";
    fcfsDiv.children[1].textContent += waitingTimeDisplay + (totalTime / (pListTable.childElementCount)).toFixed(2) + " ms";

    fcfsDiv.style.display = "flex";
    return Promise.resolve();
}

async function sjfGanttChart() {

    let sjfAll = [];
    let waitingTimeDisplay = "(";
    for (let i = 0; i < pListTable.childElementCount; i++) {
        sjfAll.push(parseInt(pListTable.children[i].children[1].textContent));
    }

    let processTime = 0, randomColor = 0, burstTime = 0, totalTime = 0;
    let process = document.createElement('div');
    process.setAttribute('class', "GanttChart");

    sjfAll.sort((a, b) => a - b);
    sjfAll.forEach(element => {
        if (!(sjf.includes(element)))
            sjf.push(element);
    });
    while (sjf.length != 0) {
        for (tableRow = 0; tableRow < pListTable.childElementCount; tableRow++) {
            burstTime = parseInt(pListTable.children[tableRow].children[1].textContent);
            if (sjf[0] == burstTime) {
                randomColor = '#' + Math.floor(Math.random() * 16777215).toString(16);
                let pWidth = 30 * burstTime;
                if (pWidth >= 200)
                    pWidth = 150;
                else if (pWidth >= 150)
                    pWidth = 100;
                else if (pWidth >= 100)
                    pWidth = 80;
                process.innerHTML += `
                        <span><sup>${processTime}</sup></span>
                        <p style="width: ${pWidth}px; border-radius: 0.2em; background-color: ${randomColor}">${pListTable.children[tableRow].children[0].textContent}</p>`;
                totalTime += processTime;
                waitingTimeDisplay += " + " + processTime;
                processTime += burstTime;
            }
        }
        sjf.shift();
    }
    waitingTimeDisplay = waitingTimeDisplay.replace("+", "");
    process.innerHTML += `
<span><sup>${processTime}</sup></span>`
    sjfDiv.appendChild(process);
    waitingTimeDisplay += " )/" + pListTable.childElementCount + " = ";
    sjfDiv.children[1].textContent += waitingTimeDisplay + (totalTime / (pListTable.childElementCount)).toFixed(2) + " ms";

    sjfDiv.style.display = "flex";
    return Promise.resolve();
}

async function rrGanttChart() {

    rr = [];
    for (let i = 0; i < pListTable.childElementCount; i++) {
        rr.push(parseInt(pListTable.children[i].children[1].textContent));
    }

    if ((pTimeQuantum.value != "" && !(isNaN(pTimeQuantum.value)))) {

        let processTime = 0, randomColor = 0, burstTime = 0, totalTime = 0, waitingTime = 0, processTimeQuantum = parseInt(pTimeQuantum.value);
        let process = document.createElement('div');
        process.setAttribute('class', "GanttChart");

        while (!(rr.every((x) => x == 0))) {
            for (tableRow = 0; tableRow < pListTable.childElementCount; tableRow++) {
                if (rr[tableRow] != 0) {
                    randomColor = '#' + Math.floor(Math.random() * 16777215).toString(16);
                    process.innerHTML += `
                        <span><sup>${processTime}</sup></span>
                        <p style="width: fit-content; border-radius: 0.2em; background-color: ${randomColor}">${pListTable.children[tableRow].children[0].textContent}</p>`;

                    if (rr[tableRow] >= processTimeQuantum) {
                        processTime += processTimeQuantum;
                        rr[tableRow] -= processTimeQuantum;
                    }
                    else {
                        processTime += rr[tableRow];
                        rr[tableRow] -= rr[tableRow];
                        totalTime = processTime - parseInt(pListTable.children[tableRow].children[1].textContent);
                        waitingTime += totalTime;
                    }
                }
            }
        }
        process.innerHTML += `
                <span><sup>${processTime}</sup></span>`
        rrDiv.appendChild(process);
        rrDiv.children[1].textContent += (waitingTime / (pListTable.childElementCount)).toFixed(2) + " ms";

        rrDiv.style.display = "flex";
        return Promise.resolve();
    }
}

async function pGanttChart() {

    let priAll = [];
    let waitingTimeDisplay = "(";
    for (let i = 0; i < pListTable.childElementCount; i++) {
        priAll.push(parseInt(pListTable.children[i].children[2].textContent));
    }

    if (!(priAll.includes(NaN))) {

        let processTime = 0, randomColor = 0, burstTime = 0, priority = 0, totalTime = 0;
        let process = document.createElement('div');
        process.setAttribute('class', "GanttChart");

        priAll.sort((a, b) => a - b);
        priAll.forEach(element => {
            if (!(pri.includes(element)))
                pri.push(element);
        });
        while (pri.length != 0) {
            for (tableRow = 0; tableRow < pListTable.childElementCount; tableRow++) {
                burstTime = parseInt(pListTable.children[tableRow].children[1].textContent);
                priority = parseInt(pListTable.children[tableRow].children[2].textContent);
                if (pri[0] == priority) {
                    randomColor = '#' + Math.floor(Math.random() * 16777215).toString(16);
                    let pWidth = 30 * burstTime;
                    if (pWidth >= 200)
                        pWidth = 150;
                    else if (pWidth >= 150)
                        pWidth = 100;
                    else if (pWidth >= 100)
                        pWidth = 80;
                    process.innerHTML += `
                            <span><sup>${processTime}</sup></span>
                            <p style="width: ${pWidth}px; border-radius: 0.2em; background-color: ${randomColor}">${pListTable.children[tableRow].children[0].textContent}</p>`;
                    totalTime += processTime;
                    waitingTimeDisplay += " + " + processTime;
                    processTime += burstTime;
                }
            }
            pri.shift();
        }
        waitingTimeDisplay = waitingTimeDisplay.replace("+", "");
        process.innerHTML += `
    <span><sup>${processTime}</sup></span>`
        pDiv.appendChild(process);
        waitingTimeDisplay += " )/" + pListTable.childElementCount + " = ";
        pDiv.children[1].textContent += waitingTimeDisplay + (totalTime / (pListTable.childElementCount)).toFixed(2) + " ms";

        pDiv.style.display = "flex";
        return Promise.resolve();
    }
}

function clearEntries() {
    pName.value = "";
    pBurstTime.value = "";
    pPriority.value = "";
    pName.focus();
}

function resetPage() {
    clearEntries();
    pTimeQuantum.value = "";
    pListTable.innerHTML = "";
    clearGanttCharts();
}

async function clearGanttCharts() {
    if (fcfsDiv.contains(fcfsDiv.children[2])) {
        fcfsDiv.removeChild(fcfsDiv.children[2]);
        fcfsDiv.children[1].textContent = "Average Waiting Time: ";
        fcfsDiv.style.display = "none";
    }

    if (sjfDiv.contains(sjfDiv.children[2])) {
        sjfDiv.removeChild(sjfDiv.children[2]);
        sjfDiv.children[1].textContent = "Average Waiting Time: ";
        sjfDiv.style.display = "none";
    }

    if (rrDiv.contains(rrDiv.children[2])) {
        rrDiv.removeChild(rrDiv.children[2]);
        rrDiv.children[1].textContent = "Average Waiting Time: ";
        rrDiv.style.display = "none";
    }

    if (pDiv.contains(pDiv.children[2])) {
        pDiv.removeChild(pDiv.children[2]);
        pDiv.children[1].textContent = "Average Waiting Time: ";
        pDiv.style.display = "none";
    }
    return Promise.resolve();
}