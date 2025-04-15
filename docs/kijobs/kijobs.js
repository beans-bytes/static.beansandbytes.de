const me = document.currentScript;

const jobFilterAttr = me.getAttribute("data-jobs");
let specialEmbedInstruct = "";
if (jobFilterAttr != null && jobFilterAttr != ""){
    window.jobFilters = jobFilterAttr.toLowerCase().split(",");
    specialEmbedInstruct = ` data-jobs="${ jobFilterAttr }" `
}

const hideEmbedNote = me.getAttribute("data-hide-embed-note")!=undefined && me.getAttribute("data-hide-embed-note")!=null;


const widgetNode = document.createElement("div");
widgetNode.classList.add("container");
widgetNode.style.maxWidth="800px";

widgetNode.style.margin="auto";
widgetNode.style.textAlign="center";

me.parentNode.insertBefore(widgetNode, me);
const shadowRoot = widgetNode.attachShadow({mode: 'open'});
shadowRoot.innerHTML = `
    <style>
        /* Add styles for the elements inside the shadow DOM */
        * {
            font-family: Arial, sans-serif;
            max-width:100%;
            color: #000000;
            background-color:#ffffff;
        }
        #filterContainer {
            margin-bottom: 10px;
            display: flex;
            flex-wrap: wrap;
            gap:0.5em;
            align-items: center;
            align-content: center;
            justify-content: center;
            padding: 1em;
        }
        table {
            width: 100%;
            border-collapse: collapse;
        }
        th, td {
            text-align: left;
            padding: 2px;
            border-bottom: 1px solid #ddd;
            flex:1;
        }
        th {
            cursor: pointer;
        }
        tr{
            display:flex;
        }
        #filterContainer label{
            display:inline-block;
        }
        #dataBody{
            max-height:400px;
            overflow:auto;
            display:block;
            width:100%;
        }
        #embedInstruct{
            margin-top:1em;
            font-size:small;
            
        }
        #main{
            padding:1em;
            border: 1px solid #eee;
            width: 100%;
            display: block;
            box-sizing: border-box;
            overflow: hidden;
        }

        /* Styles for the filter checkboxes */
        .filter-label {
            display: flex;
            align-items: center;
            margin-bottom: 0.5em;
            cursor: pointer;
        }

        .checkbox-custom {
            position: relative;
            width: 18px;
            height: 18px;
            border: 1px solid #aaa;
            border-radius: 3px;
            margin-right: 0.5em;
            background-color: #fff;
        }

        .checkbox-custom::after {
            content: '';
            position: absolute;
            top: 50%;
            left: 50%;
            width: 0;
            height: 0;
            background-color: #4CAF50; /* Green color when checked */
            border-radius: 2px;
            transform: translate(-50%, -50%) scale(0);
            transition: all 0.2s ease;
        }

        input[type="checkbox"]:checked + .checkbox-custom::after {
            width: 12px;
            height: 12px;
            transform: translate(-50%, -50%) scale(1);
        }

        input[type="checkbox"] {
            display: none; /* Hide the default checkbox */
        }

        /* Styles for the table */
        #dataBody {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
        }

        #dataBody th,
        #dataBody td {
            padding: 12px 15px;
            text-align: left;
            border-bottom: 1px solid #ddd;
            text-wrap: wrap;
        }

        #dataBody th {
            background-color: #f2f2f2;
            font-weight: bold;
        }

        #dataBody tbody tr:hover {
            background-color: #f5f5f5;
        }

        #dataBody a {
            color: black;
            text-decoration: none;
        }

        #dataBody a:hover {
            text-decoration: underline;
        }
        #sources{
            font-size:small;
            opacity:0.5;
            margin-top:2em;
            display:block;
        }
        @media screen and  (max-width: 420px) {
            .hideSmall {
                display: none;
            }
            #dataBody td{
                text-align: center;
            }
        }
    </style>
    <div id="main">
    <div style="max-height: 800px; max-width: 800px;">
        <canvas id="myChart" width="800" height="800"></canvas>
    </div>
    <div id="filterContainer"></div>
    <table id="dataTable">
        <thead>
            <tr>
                <th onclick="sortTable('job')">Job</th>
                <th onclick="sortTable('likelihood')">Kann KI diesen Job ersetzen?</th>
                <th onclick="sortTable('quadrant')" class="hideSmall">Quadrant</th>
            </tr>
        </thead>
        <tbody id="dataBody"></tbody>
    </table>
    <div id="sources">Interaktive Grafik zum "AI Job Displacement Index" von Dr. Kai-Fu Lee.<br>Basierend auf Daten der <b>Oxford University</b>, <b>McKinsey</b>, <b>Bain & Co</b>, <b>PWC</b> und <b>Sinovation Ventures</b></div>
    </div>
    <div id="embedInstruct">Sie können diese Visualisierung auf Ihrer eigenen Website einbinden. Kopieren sie einfach diesen Code:<br><code>&lt;script src="${me.src}"${specialEmbedInstruct} &gt;&lt;/script&gt;</code></div>
`;

if (hideEmbedNote){
    shadowRoot.querySelector("#embedInstruct").style.display="none";
}

// Create script elements and load Chart.js and chartjs-plugin-datalabels
const chartJsScript = document.createElement('script');
chartJsScript.src = 'https://cdn.jsdelivr.net/npm/chart.js';
chartJsScript.onload = function(){

const chartJsPluginScript = document.createElement('script');
chartJsPluginScript.src = 'https://cdn.jsdelivr.net/npm/chartjs-plugin-datalabels';
chartJsPluginScript.onload = function(){
    
const mainScript = document.createElement('script');
let scriptSrc = "/kijobs/actual_script.js";
if (!me.src.includes("localhost")){
    scriptSrc = "https://static.beansandbytes.de" + scriptSrc;
}
mainScript.src = scriptSrc;

shadowRoot.appendChild(mainScript);

};
shadowRoot.appendChild(chartJsPluginScript);
};
shadowRoot.appendChild(chartJsScript);
