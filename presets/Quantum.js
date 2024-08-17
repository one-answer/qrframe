// Based on QRBTF's A1P style
// https://github.com/CPunisher/react-qrbtf/blob/master/src/components/QRNormal.tsx
export const paramsSchema = {
  Margin: {
    type: "number",
    min: 0,
    max: 10,
    step: 0.1,
    default: 2,
  },
  Background: {
    type: "Color",
    default: "#ffffff",
  },
  Foreground: {
    type: "Color",
    default: "#000000",
  },
  "Finder pattern": {
    type: "Select",
    options: ["Atom", "Planet"],
  },
  Particles: {
    type: "boolean",
    default: true,
  },
  Seed: {
    type: "number",
    min: 1,
    max: 100,
    default: 1,
  },
};

const Module = {
  DataOFF: 0,
  DataON: 1,
  FinderOFF: 2,
  FinderON: 3,
  AlignmentOFF: 4,
  AlignmentON: 5,
  TimingOFF: 6,
  TimingON: 7,
  FormatOFF: 8,
  FormatON: 9,
  VersionOFF: 10,
  VersionON: 11,
  SeparatorOFF: 12,
};

function splitmix32(a) {
  return function () {
    a |= 0;
    a = (a + 0x9e3779b9) | 0;
    let t = a ^ (a >>> 16);
    t = Math.imul(t, 0x21f0aaad);
    t = t ^ (t >>> 15);
    t = Math.imul(t, 0x735a2d97);
    return ((t = t ^ (t >>> 15)) >>> 0) / 4294967296;
  };
}

export function renderSVG(qr, params) {
  const rand = splitmix32(params["Seed"]);
  function range(min, max) {
    const t = Math.trunc(100 * (rand() * (max - min) + min)) / 100;
    return t;
  }

  const matrixWidth = qr.version * 4 + 17;
  const margin = params["Margin"];
  const bg = params["Background"];
  const fg = params["Foreground"];

  const size = matrixWidth + 2 * margin;
  let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${-margin} ${-margin} ${size} ${size}">`;
  svg += `<rect x="${-margin}" y="${-margin}" width="${size}" height="${size}" fill="${bg}"/>`;

  for (const [x, y] of [
    [0, 0],
    [matrixWidth - 7, 0],
    [0, matrixWidth - 7],
  ]) {
    svg += `<g fill="${fg}">`;
    svg += `<circle cx="${x + 3.5}" cy="${y + 3.5}" r="1.5"/>`;
    svg += `<circle cx="${x + 3.5}" cy="${y + 0.5}" r="0.5"/>`;
    svg += `<circle cx="${x + 0.5}" cy="${y + 3.5}" r="0.5"/>`;
    svg += `<circle cx="${x + 6.5}" cy="${y + 3.5}" r="0.5"/>`;
    svg += `<circle cx="${x + 3.5}" cy="${y + 6.5}" r="0.5"/>`;

    switch (params["Finder pattern"]) {
      case "Atom": {
        let r1 = 0.98;
        let r2 = 1.5;

        const a = 0.87 * r2;
        const b = 0.5 * r2;
        svg += `<path fill="none" stroke-width="0.1" stroke="${fg}" d="`;
        svg += `M${x + 3.5 + 3 * a},${y + 3.5 - 3 * b}a${r1},${r2} 60,0,1 ${-6 * a},${6 * b}a${r1},${r2} 60,0,1 ${6 * a},${-6 * b}`;
        svg += `M${x + 3.5 + 3 * a},${y + 3.5 + 3 * b}a${r2},${r1} 30,0,1 ${-6 * a},${-6 * b}a${r2},${r1} 30,0,1 ${6 * a},${6 * b}`;

        svg += `M${x + 3.5},${y + 3.5 - 3 * r2}a${r1},${r2} 0,0,1 0,${6 * r2}a${r1},${r2} 0,0,1 0,${-6 * r2}`;
        break;
      }
      case "Planet": {
        svg += `<path fill="none" stroke-width="0.1" stroke="${fg}" stroke-dasharray="0.5 0.65" d="`;
        svg += `M${x + 3.5},${y + 0.5}a3,3 0,0,1 0,6a3,3 0,0,1 0-6`;
      }
    }
    svg += `"/></g>`;
  }

  let linesLayer = `<g stroke="${fg}"><path fill="none" stroke-width="0.1" d="`;
  let dotsLayer = `<g fill="${fg}">`;

  function on(x, y) {
    return (qr.matrix[y * matrixWidth + x] & 1) === 1;
  }

  const visitArray = Array.from({ length: matrixWidth * matrixWidth }).fill(
    false
  );

  function visited(x, y) {
    return visitArray[y * matrixWidth + x];
  }
  function visitCenter(x, y) {
    visitArray[y * matrixWidth + x] = true;
    dotsLayer += `<circle cx="${x + 0.5}" cy="${y + 0.5}" r="${range(0.3, 0.5)}"/>`;
  }
  function visit(x, y, center) {
    visitArray[y * matrixWidth + x] = true;
    dotsLayer += `<circle cx="${x + 0.5}" cy="${y + 0.5}" r="0.2"/>`;
  }

  for (let y = 0; y < matrixWidth; y++) {
    for (let x = 0; x < matrixWidth; x++) {
      const module = qr.matrix[y * matrixWidth + x];
      if ((module | 1) === Module.FinderON) continue;

      if (params["Particles"] && y < matrixWidth - 2 && x < matrixWidth - 2) {
        let xCross = false;
        let tCross = false;

        let a = range(-10, 10);
        if (
          on(x, y) &&
          !visited(x, y) &&
          on(x + 2, y) &&
          !visited(x + 2, y) &&
          on(x + 1, y + 1) &&
          !visited(x + 1, y + 1) &&
          on(x, y + 2) &&
          !visited(x, y + 2) &&
          on(x + 2, y + 2) &&
          !visited(x + 2, y + 2)
        ) {
          linesLayer += `M${x + 0.5},${y + 0.5}a1.4,.35 ${45 + a},0,1 2,2a1.4,.35 ${45 + a},0,1 -2,-2`;
          linesLayer += `M${x + 2.5},${y + 0.5}a.35,1.4 ${45 + a},0,1 -2,2a.35,1.4 ${45 + a},0,1 2,-2`;
          xCross = true;
        }
        if (
          on(x + 1, y) &&
          !visited(x + 1, y) &&
          on(x, y + 1) &&
          !visited(x, y + 1) &&
          on(x + 1, y + 1) &&
          !visited(x + 1, y + 1) &&
          on(x + 2, y + 1) &&
          !visited(x + 2, y + 1) &&
          on(x + 1, y + 2) &&
          !visited(x + 1, y + 2)
        ) {
          linesLayer += `M${x},${y + 1.55}a1,.35 ${a},0,1 3,0a1,.35 ${a},0,1 -3,0`;
          linesLayer += `M${x + 1.5},${y}a.35,1 ${a},0,1 0,3a.35,1 ${a},0,1 0,-3`;
          tCross = true;
        }
        if (xCross) {
          visit(x, y);
          visit(x + 2, y);
          visitCenter(x + 1, y + 1);
          visit(x, y + 2);
          visit(x + 2, y + 2);
        }
        if (tCross) {
          visit(x + 1, y);
          visit(x, y + 1);
          visitCenter(x + 1, y + 1);
          visit(x + 2, y + 1);
          visit(x + 1, y + 2);
        }
      }

      if (!visited(x, y) && on(x, y)) {
        dotsLayer += `<circle cx="${x + 0.5}" cy="${y + 0.5}" r="${range(0.3, 0.5)}"/>`;
      }
    }
  }

  linesLayer += `"/></g>`;
  svg += linesLayer;
  dotsLayer += `</g>`;
  svg += dotsLayer;
  svg += `</svg>`;

  return svg;
}