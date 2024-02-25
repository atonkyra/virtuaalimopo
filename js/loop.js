let iter = 0;
const mopo_x = config["mopo_x"];
const mopo_y = config["mopo_y"];

let night = false;

const mopoDiv = d3.select("#mopodiv");
mopoDiv.attr(
  "style",
  `width: ${mopo_x}px; height: ${mopo_y}px; margin-left: auto; margin-right: auto;`
);
mopoDiv
  .append("svg")
  .attr("id", "mopotolppa_outer")
  .attr("width", mopo_x)
  .attr("height", "800px")
  .attr("style", "margin-top: 400px; position: absolute; z-index: -1;");
mopoDiv
  .append("svg")
  .attr("id", "mopo_outer")
  .attr("width", mopo_x)
  .attr("height", mopo_y);
mopoDiv
  .append("svg")
  .attr("id", "lisakyltti_outer")
  .attr("width", mopo_x)
  .attr("style", "");

d3.svg("svg/varoituskolmio.svg").then((svg) => {
  const importedNode = document.importNode(svg.documentElement, true);
  d3.select("#mopo_outer").insert(() => importedNode);
  d3.select("#Layer_1").attr("width", mopo_x);

  d3.svg("svg/mopo.svg").then((svg) => {
    const importedNode = document.importNode(svg.documentElement, true);
    d3.select("#mopo_outer").insert(() => importedNode);

    d3.select("#mopo_svg").attr("width", mopo_x).attr("height", mopo_y);

    d3.select("#mopo")
      .attr("transform", `translate(50,80) scale(0.5) rotate(0, ${cx}, ${cy})`)
      .attr("fill", "#202020");
    if (!night) {
      d3.select("#mopo_svg").selectAll("ellipse").attr("visibility", "hidden");
    }
  });
});

d3.svg("svg/mopotolppa.svg").then((svg) => {
  const importedNode = document.importNode(svg.documentElement, true);
  d3.select("#mopotolppa_outer").insert(() => importedNode);
  d3.select("#mopotolppa").attr("width", mopo_x);
});

d3.svg("svg/lisakyltti.svg").then((svg) => {
  const importedNode = document.importNode(svg.documentElement, true);
  d3.select("#lisakyltti_outer").insert(() => importedNode);
  d3.select("#lisakyltti").attr("width", mopo_x);
});

const cx = 162.052;
const cy = 136.745;
const cs = 0.5;

const avg_arr = new Array();
const num_samples = 1000;
for (let i = 0; i < num_samples; i++) {
  avg_arr.push(0);
}

function setBackgroundColor() {
  const hours = new Date().getHours();
  night = hours >= 16 || hours <= 8;
  if (night) {
    document.body.style.background = config["bg_night"];
    d3.select("#mopo").attr("fill", "#202020");
    d3.select("#mopo_svg").selectAll("ellipse").attr("visibility", "visible");
  } else {
    document.body.style.background = config["bg_day"];
    d3.select("#mopo").attr("fill", "#000000");
    d3.select("#mopo_svg").selectAll("ellipse").attr("visibility", "hidden");
  }
}

let source = null;
function establishEventChannel() {
  if (source !== null) {
    source.close();
  }
  source = new EventSource(config["event_datasource"]);
  source.addEventListener(
    "message",
    (e) => {
      /** @type {Data} */
      const edata = JSON.parse(e.data);
      const mbps = +edata.bps / 1000 / 1000;
      updateMopo(mbps);
    },
    false
  );
  source.addEventListener(
    "error",
    () => {
      establishEventChannel();
    },
    false
  );
}

if (!!window.EventSource && config["event_datasource"] != "") {
  establishEventChannel();
  requestAnimationFrame(eventUpdate);
} else {
  requestAnimationFrame(xhrUpdate);
}

function xhrUpdate() {
  if (iter % 100 == 0) {
    fetch(config["datasource"])
      .then((response) => response.json())
      .then((edata) => {
        const mbps = edata.bps / 1000 / 1000;
        updateMopo(mbps);
      });
  } else {
    updateMopo(avg_arr[num_samples - 1]);
  }

  ++iter;
  requestAnimationFrame(xhrUpdate);
}

function eventUpdate() {
  updateMopo(avg_arr[num_samples - 1]);

  ++iter;
  requestAnimationFrame(eventUpdate);
}

/**
 * @param {number} mbps
 */
function updateMopo(mbps) {
  const traffic = post_return_avg(mbps);
  numberTo7Seg(traffic);

  const maxRotate = config["max_rotate"];
  const rawRotate = traffic * config["keul_factor"];
  const rotate = maxRotate ? Math.min(rawRotate, maxRotate) : rawRotate;
  const translateX = maxRotate ? 50 - (4 * rotate) / 9 : 50;
  const transform = `translate(${translateX},80) scale(0.5) rotate(${rotate}, ${cx}, ${cy})`;
  const mopoSvg = d3.select("#mopo_svg");
  mopoSvg.selectAll("path").attr("transform", transform);
  mopoSvg.selectAll("ellipse").attr("transform", transform);
}

/**
 * @param {number} traffic_value
 */
function post_return_avg(traffic_value) {
  avg_arr.shift();
  avg_arr.push(Math.round(traffic_value));
  let sum = 0;
  for (let i = 0; i < num_samples; i++) {
    sum += avg_arr[i];
  }
  return Math.round(sum / num_samples);
}

/**
 * @param {number} number
 */
function numberTo7Seg(number) {
  let max = 5;
  // Make sure there is exactly 5 digits and take only 5 last
  const parts = number.toString().padStart(max, "0").split("").slice(-max);
  for (let i = 0; i < 5; i++) {
    const element = numbers[i];
    element
      .selectAll("polygon")
      .data(to7seg(parts[i]))
      .join("polygon")
      .attr("fill", (d) => (d ? config["seg_on"] : config["seg_off"]));
  }
}

setInterval(setBackgroundColor, 60000);
setBackgroundColor();
