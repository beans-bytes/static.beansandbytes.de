const me = document.currentScript;

const jobFilterAttr = me.getAttribute("data-jobs");
let specialEmbedInstruct = "";
if (jobFilterAttr != null && jobFilterAttr != ""){
    window.jobFilters = jobFilterAttr.toLowerCase().split(",");
    specialEmbedInstruct = ` data-jobs="${ jobFilterAttr }" `
}


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
            border: 3px solid black;
        }
    </style>
    <div id="main">
    <div style="height: 800px; width: 800px;">
        <canvas id="myChart" width="800" height="800"></canvas>
    </div>
    <div id="filterContainer"></div>
    <table id="dataTable">
        <thead>
            <tr>
                <th onclick="sortTable('job')">Job</th>
                <th onclick="sortTable('likelihood')">Kann KI diesen Job ersetzen?</th>
                <th onclick="sortTable('quadrant')">Quadrant</th>
            </tr>
        </thead>
        <tbody id="dataBody"></tbody>
    </table>
    </div>
    <div id="embedInstruct">Sie können diese Visualisierung auf Ihrer eigenen Website einbinden. Kopieren sie einfach diesen Code:<br><code>&lt;script src="${me.src}"${specialEmbedInstruct} &gt;&lt;/script&gt;</code></div>
`;


// Create script elements and load Chart.js and chartjs-plugin-datalabels
const chartJsScript = document.createElement('script');
chartJsScript.src = 'https://cdn.jsdelivr.net/npm/chart.js';
chartJsScript.onload = function(){

const chartJsPluginScript = document.createElement('script');
chartJsPluginScript.src = 'https://cdn.jsdelivr.net/npm/chartjs-plugin-datalabels';
chartJsPluginScript.onload = function(){
    
const mainScript = document.createElement('script');
mainScript.src = 'https://static.beansandbytes.de/kijobs/actual_script.js';

shadowRoot.appendChild(mainScript);

};
shadowRoot.appendChild(chartJsPluginScript);
};
shadowRoot.appendChild(chartJsScript);
