let a = 0, b = 0;
let chart = null;
let predictedX = null;

function addRow() {
  const tableBody = document.getElementById('tableBody');
  const newRow = document.createElement('tr');
  newRow.innerHTML = `
    <td><input type="number" step="any" class="xVal"></td>
    <td><input type="number" step="any" class="yVal"></td>
  `;
  tableBody.appendChild(newRow);
}

function calculateRegression() {
  const xInputs = document.querySelectorAll('.xVal');
  const yInputs = document.querySelectorAll('.yVal');

  let x = [], y = [];

  for (let i = 0; i < xInputs.length; i++) {
    const xi = parseFloat(xInputs[i].value);
    const yi = parseFloat(yInputs[i].value);
    if (!isNaN(xi) && !isNaN(yi)) {
      x.push(xi);
      y.push(yi);
    }
  }

  if (x.length < 2) {
    alert('Masukkan minimal dua data!');
    return;
  }

  const n = x.length;
  const sumX = x.reduce((a, b) => a + b, 0);
  const sumY = y.reduce((a, b) => a + b, 0);
  const sumXY = x.reduce((acc, val, i) => acc + val * y[i], 0);
  const sumX2 = x.reduce((acc, val) => acc + val * val, 0);

  b = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  a = (sumY - b * sumX) / n;

  document.getElementById('result').innerHTML = `
    <h3>Hasil Regresi:</h3>
    <p>Persamaan: <strong>Y = ${a.toFixed(4)} + ${b.toFixed(4)}X</strong></p>
  `;

  document.getElementById('prediction').style.display = 'block';

  // Isi tabel perhitungan
  let calcBody = document.getElementById("calcTableBody");
  calcBody.innerHTML = "";
  let totalX = 0, totalY = 0, totalX2 = 0, totalXY = 0;

  for (let i = 0; i < x.length; i++) {
    const xi = x[i], yi = y[i], x2 = xi * xi, xy = xi * yi;
    totalX += xi;
    totalY += yi;
    totalX2 += x2;
    totalXY += xy;

    const row = `<tr>
      <td>${xi.toFixed(2)}</td>
      <td>${yi.toFixed(2)}</td>
      <td>${x2.toFixed(2)}</td>
      <td>${xy.toFixed(2)}</td>
    </tr>`;
    calcBody.innerHTML += row;
  }

  document.getElementById("sumX").innerText = totalX.toFixed(2);
  document.getElementById("sumY").innerText = totalY.toFixed(2);
  document.getElementById("sumX2").innerText = totalX2.toFixed(2);
  document.getElementById("sumXY").innerText = totalXY.toFixed(2);
  document.getElementById("calculationTable").style.display = "block";

  drawChart(x, y);
}

function predictY() {
  const x = parseFloat(document.getElementById('predictX').value);
  if (isNaN(x)) {
    alert('Masukkan nilai X untuk prediksi!');
    return;
  }
  const y = a + b * x;
  predictedX = x;
  document.getElementById('predictedY').textContent =
    `Nilai Y yang diprediksi pada posisi X (${x.toFixed(4)}) adalah: ${y.toFixed(4)}`;

  // Update chart untuk tampilkan prediksi
  const xInputs = document.querySelectorAll('.xVal');
  const yInputs = document.querySelectorAll('.yVal');
  const xData = Array.from(xInputs).map(input => parseFloat(input.value));
  const yData = Array.from(yInputs).map(input => parseFloat(input.value));
  drawChart(xData, yData);
}

function drawChart(xData, yData) {
  const scatterData = xData.map((val, i) => ({ x: val, y: yData[i] }));
  const minX = Math.min(...xData);
  const maxX = Math.max(...xData);
  const regressionLine = [
    { x: minX, y: a + b * minX },
    { x: maxX, y: a + b * maxX }
  ];

  const predictionPoint = (typeof predictedX === 'number' && !isNaN(predictedX))
    ? [{
        label: 'Prediksi Y',
        data: [{ x: predictedX, y: a + b * predictedX }],
        backgroundColor: 'green',
        pointRadius: 6,
        type: 'scatter'
      }]
    : [];

  const ctx = document.getElementById('myChart').getContext('2d');
  if (chart) chart.destroy();

  chart = new Chart(ctx, {
    type: 'scatter',
    data: {
      datasets: [
        {
          label: 'Data Asli',
          data: scatterData,
          backgroundColor: 'blue'
        },
        {
          label: 'Garis Regresi',
          data: regressionLine,
          type: 'line',
          borderColor: 'red',
          borderWidth: 2,
          pointRadius: 0,
          fill: false
        },
        ...predictionPoint
      ]
    },
    options: {
      responsive: true,
      plugins: {
        zoom: {
          zoom: {
            wheel: { enabled: true },
            pinch: { enabled: true },
            mode: 'xy'
          },
          pan: {
            enabled: true,
            mode: 'xy'
          }
        },
        tooltip: {
          enabled: true
        }
      },
      scales: {
        x: {
          type: 'linear',
          position: 'bottom',
          title: { display: true, text: 'X' }
        },
        y: {
          title: { display: true, text: 'Y' }
        }
      }
    }
  });
}

function downloadChart() {
  const link = document.createElement('a');
  link.href = chart.toBase64Image();
  link.download = 'grafik_regresi.png';
  link.click();
}

function downloadExcel() {
  const xInputs = document.querySelectorAll('.xVal');
  const yInputs = document.querySelectorAll('.yVal');
  const data = [["X", "Y"]];

  for (let i = 0; i < xInputs.length; i++) {
    const xi = parseFloat(xInputs[i].value);
    const yi = parseFloat(yInputs[i].value);
    if (!isNaN(xi) && !isNaN(yi)) {
      data.push([xi, yi]);
    }
  }

  const worksheet = XLSX.utils.aoa_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Data Regresi");
  XLSX.writeFile(workbook, "data_regresi.xlsx");
}
