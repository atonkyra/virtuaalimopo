// modified from http://igglyboo.github.io/d3/7seg.html

let scaleF = 0.5;

/** @type {d3.Selection<SVGElement, any, HTMLElement, any>[]} */
const numbers = [];

const div = d3
  .select("#sevenseg")
  .style("width", `${config["mopo_x"]}px`)
  .style("padding-top", `${config["mopo_x"] / 12.0}px`)
  .style("padding-left", `${config["mopo_x"] / 6.0}px`)
  .style("margin-left", "auto")
  .style("margin-right", "auto");

for (let counter = 0; counter < 5; counter++) {
  const svg = div.append("svg");
  svg.attr("width", 90 * scaleF);
  svg.attr("height", 160 * scaleF);
  numbers.push(svg);

  for (let dash = 0; dash < 7; dash++) {
    const polygon = svg.append("polygon");
    const data = to7seg("E");
    polygon.data([data[dash]]);
    const x = 10 * scaleF;
    const y = 10 * scaleF;
    const index = [
      { origin: [x, y], orientation: "horizontal" },
      { origin: [x + 70 * scaleF, y], orientation: "vertical" },
      {
        origin: [x + 70 * scaleF, y + 70 * scaleF],
        orientation: "vertical",
      },
      { origin: [x, y + 140 * scaleF], orientation: "horizontal" },
      { origin: [x, y + 70 * scaleF], orientation: "vertical" },
      { origin: [x, y], orientation: "vertical" },
      { origin: [x, y + 70 * scaleF], orientation: "horizontal" },
    ];
    const points = getSevenSegmentPoints(
      index[dash].origin,
      70 * scaleF,
      10 * scaleF,
      index[dash].orientation
    );

    polygon.attr("points", points);
    polygon.attr("fill", (d) => (d ? config["seg_on"] : config["seg_off"]));
  }
}

/**
 * @param {XY} origin
 * @param {number} longAxis
 * @param {number} shortAxis
 * @param {'horizontal' | 'vertical' | undefined} orientation
 * @returns {string | null}
 */
function getSevenSegmentPoints(origin, longAxis, shortAxis, orientation) {
  const x = origin[0];
  const y = origin[1];
  /** @type {Points} */
  const points = [[x, y], null, null, null, null, null];

  if (orientation === "horizontal") {
    points[1] = [x + shortAxis / 2, y - shortAxis / 2];
    points[2] = [x + longAxis - shortAxis / 2, y - shortAxis / 2];
    points[3] = [x + longAxis, y];
    points[4] = [x + longAxis - shortAxis / 2, y + shortAxis / 2];
    points[5] = [x + shortAxis / 2, y + shortAxis / 2];
    return pointArrayToString(points);
  } else if (orientation === "vertical") {
    points[1] = [x + shortAxis / 2, y + shortAxis / 2];
    points[2] = [x + shortAxis / 2, y + longAxis - shortAxis / 2];
    points[3] = [x, y + longAxis];
    points[4] = [x - shortAxis / 2, y + longAxis - shortAxis / 2];
    points[5] = [x - shortAxis / 2, y + shortAxis / 2];
    return pointArrayToString(points);
  } else {
    return null;
  }
}

/**
 * @param {Points} points
 * @returns
 */
function pointArrayToString(points) {
  return points.map((v) => v.join(",")).join(" ");
}

/**
 * @param {string} value
 * @returns {[boolean, boolean, boolean, boolean, boolean, boolean]}
 */
function to7seg(value) {
  const rows = {
    0: [true, true, true, true, true, true, false],
    1: [false, true, true, false, false, false, false],
    2: [true, true, false, true, true, false, true],
    3: [true, true, true, true, false, false, true],
    4: [false, true, true, false, false, true, true],
    5: [true, false, true, true, false, true, true],
    6: [true, false, true, true, true, true, true],
    7: [true, true, true, false, false, false, false],
    8: [true, true, true, true, true, true, true],
    9: [true, true, true, true, false, true, true],
    10: [true, true, true, false, true, true, true],
    11: [false, false, true, true, true, true, true],
    12: [true, false, false, true, true, true, false],
    13: [false, true, true, true, true, false, true],
    14: [true, false, false, true, true, true, true],
    15: [true, false, false, false, true, true, true],
    E: [false, false, false, false, false, false, true],
  };
  return rows[value.toUpperCase()];
}
