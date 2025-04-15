// JavaScript code injected into the shadow DOM

let originalData = [];
let filteredData = [];
let sortDirection = "asc";
let sortColumn = "";

async function loadData() {
    try {
        const response = await fetch('https://static.beansandbytes.de/kijobs/data.json');
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        originalData = await response.json();
        if (window.jobFilters !=undefined && window.jobFilters.length != 0){
            // Filter the jobs by the name from window filter
            originalData = originalData.filter(job => jobFilters.includes(job.job.toLowerCase()));
        }
        filteredData = [...originalData];
        populateCategoryFilter();
        updateTable();
        updateChart();
    } catch (error) {
        console.error('Error fetching the data:', error);
    }
}

function generateStableColor(text) {
    const hash = hashCode(text);
    const number = parseInt(hash, 16);
    const r = (number >> 16) & 0xFF;
    const g = (number >> 8) & 0xFF;
    const b = number & 0xFF;
    const hexColor = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
    return hexColor;
}

function hashCode(str) {
    let hash = 0;
    if (str.length === 0) return hash;
    for (let i = 0; i < str.length; i++) {
        const charCode = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + charCode;
        hash |= 0;
    }
    return hash.toString(16);
}

function adjustForOverlap() {
    originalData.forEach((point, i) => {
        const overlapping = originalData.find((p, j) => 
            i !== j && Math.abs(p.creative - point.creative) < 0.1 && Math.abs(p.social - point.social) < 0.1
        );
        if (overlapping) {
            point.creative += (Math.random() - 0.5) * 0.5;
            point.social += (Math.random() - 0.5) * 0.5;
        }
    });
}

const canvas = shadowRoot.querySelector('#myChart');
const ctx = canvas.getContext('2d');

function calculateLikelihood(point) {
    const averageScore = (point.social + 10 + point.creative + 10) / 2;
    const percentageKeepScore = averageScore / 20;
    const percentageReplaceScore = 1 - percentageKeepScore;
    return Math.round(percentageReplaceScore * 100) + '%';
}

const chart = new Chart(ctx, {
    type: 'scatter',
    plugins: [ChartDataLabels],
    data: {
        datasets: [{
            data: filteredData.map(point => ({
                x: point.creative,
                y: point.social,
                job: point.job,
                category: point.category
            })),
            backgroundColor: filteredData.map(point => generateStableColor(point.category)),
            pointRadius: 6
        }]
    },
    options: {
        plugins: {
            legend: { display: false },
            tooltip: {
                callbacks: {
                    label: function(context) {
                        return `${context.raw.job} (${context.raw.category})`;
                    }
                }
            },
            datalabels: {
                display: false,
                align: 'right',
                offset: 10,
                formatter: function(value, context) {
                    return context.dataset.data[context.dataIndex].job;
                },
                font: { size: 12 }
            }
        },
        scales: {
            x: {
                min: -11,
                max: 11,
                grid: { display: false },
                ticks: { display: false },
                border: { display: false }
            },
            y: {
                min: -11,
                max: 11,
                grid: { display: false },
                ticks: { display: false },
                border: { display: false }
            }
        }
    }
});

const addLabelsAndBackground = () => {
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;

    ctx.beginPath();
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;

    ctx.moveTo(width / 2, 0);
    ctx.lineTo(width / 2, height);

    ctx.moveTo(0, height / 2);
    ctx.lineTo(width, height / 2);
    ctx.stroke();

    if (false && width > 500) {
        var background = new Image;
        // Make sure the image is loaded first otherwise nothing will draw.
        background.onload = function () {
            ctx.drawImage(background, width / 2 - 61, height / 2 - 30, 123, 60);

        }
        background.src = "https://static.beansandbytes.de/kijobs/logo.png";
    }

    ctx.font = '14px Arial';
    if (width <= 500){
            ctx.font = '10px Arial';
    }
    ctx.textAlign = 'center';
    ctx.fillStyle = '#000000';

    ctx.save();
    ctx.translate(width - 30, height / 2);
    ctx.fillText('Kreativ', 0, -5);
    ctx.restore();

    ctx.save();
    ctx.translate(50, height / 2);
    ctx.fillText('Optimierung', 0, -5);
    ctx.restore();

    ctx.save();
    ctx.translate(width / 2, 20);
    ctx.fillText('Sozial', 30, 0);
    ctx.restore();

    ctx.save();
    ctx.translate(width / 2 + 20, height - 10);
    ctx.fillText('Kontaktarm', 30, 0);
    ctx.restore();

    ctx.font = '24px Arial';
    if (width <= 500){
            ctx.font = '15px Arial';
    }
    ctx.textAlign = 'center';
    ctx.fillStyle = '#000000';

    ctx.save();
    ctx.translate(width * 0.25, height * 0.25);
    ctx.fillText('Menschliche Fassade', 0, 0);
    ctx.restore();

    ctx.save();
    ctx.translate(width * 0.75, height * 0.25);
    ctx.fillText('Sicherer Bereich', 0, 0);
    ctx.restore();

    ctx.save();
    ctx.translate(width * 0.25, height * 0.75);
    ctx.fillText('Gefahrenzone', 0, 0);
    ctx.restore();

    ctx.save();
    ctx.translate(width * 0.75, height * 0.75);
    ctx.fillText('Schleichende Veränderung', 0, 0);
    ctx.restore();
};

chart.options.animation.onComplete = function() {
    addLabelsAndBackground();
};

chart.options.animation.onProgress = function() {
    addLabelsAndBackground();
};

function populateCategoryFilter() {
    const categories = [...new Set(originalData.map(point => point.category))];
    const container = shadowRoot.querySelector('#filterContainer');
    container.innerHTML = '';

    categories.forEach(category => {
        const label = document.createElement('label');
        label.innerHTML = `
            <label class="filter-label">
                <input type="checkbox" value="${category}" checked onchange="filterList()">
                <span class="checkbox-custom" style="background-color: ${generateStableColor(category)}"></span>
                ${category}
            </label>
        `;
        container.appendChild(label);
    });
}

function filterList() {
    const checkedBoxes = Array.from(shadowRoot.querySelectorAll('#filterContainer input[type="checkbox"]:checked'));
    const selectedCategories = checkedBoxes.map(box => box.value);
    if (selectedCategories.length === 0) {
        filteredData = [...originalData];
    } else {
        filteredData = originalData.filter(point => selectedCategories.includes(point.category));
    }
    updateChart();
    updateTable();
}

function resetFilter() {
    const checkboxes = shadowRoot.querySelectorAll('#filterContainer input[type="checkbox"]');
    checkboxes.forEach(box => box.checked = true);
    filteredData = [...originalData];
    updateChart();
    updateTable();
}

function updateChart() {
    chart.data.datasets[0].data = filteredData.map(point => ({
        x: point.creative,
        y: point.social,
        job: point.job,
        category: point.category
    }));
    chart.data.datasets[0].backgroundColor = filteredData.map(point => generateStableColor(point.category));
    chart.update();
}


function quarter(point){
    if (point.creative>=0 && point.social >=0){
      return "Sicherer Bereich"
    }
    if (point.creative>=0 && point.social <0){
      return "Schleichende Veränderung"
    }
    if (point.creative<0 && point.social >=0){
      return "Menschliche Fassade"
    }
    if (point.creative<0 && point.social <0){
      return "Gefahrenzone"
    }
  }

function updateTable() {
    const tbody = shadowRoot.querySelector('#dataBody');
    tbody.innerHTML = '';
    filteredData.forEach(point => {
        const likelihood = calculateLikelihood(point);
        const row = `
            <tr>
                <td><a href="https://static.beansandbytes.de/kijobs/jobs/${point.job.replace(/\s+/g, '_')}.html" target="_blank">${point.job}</a></td>
                <td>${likelihood}</td>
                <td class="hideSmall">${quarter(point)}</td>
            </tr>
        `;
        tbody.innerHTML += row;
    });
}


function calculateQuadrant(point){
    if (point.creative>=0 && point.social >=0){
      return 4.0
    }
    if (point.creative>=0 && point.social <0){
      return 3.0
    }
    if (point.creative<0 && point.social >=0){
      return 2.0
    }
    if (point.creative<0 && point.social <0){
      return 1.0
    }
  }

function sortTable(column) {
    sortDirection = (sortColumn === column && sortDirection === 'asc') ? 'desc' : 'asc';
    sortColumn = column;

    filteredData.sort((a, b) => {
        let compareA, compareB;
        if (column === 'likelihood') {
            compareA = parseFloat(calculateLikelihood(a));
            compareB = parseFloat(calculateLikelihood(b));
        } else {
          if (column == 'quadrant'){
            compareA = parseFloat(calculateQuadrant(a));
            compareB = parseFloat(calculateQuadrant(b));
          }else{
            compareA = typeof a[column] === 'string' ? a[column].toLowerCase() : a[column];
            compareB = typeof b[column] === 'string' ? b[column].toLowerCase() : b[column];
          }
          }
        
        if (sortDirection === 'asc') {
            return compareA < compareB ? -1 : (compareA > compareB ? 1 : 0);
        } else {
            return compareA > compareB ? -1 : (compareA < compareB ? 1 : 0);
        }
    });

    updateTable();
}

loadData();
