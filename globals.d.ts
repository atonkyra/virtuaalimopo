type D3 = import("@types/d3");
declare var d3: D3;

interface Config {
  keul_factor: number;
  mopo_x: number;
  mopo_y: number;
  event_datasource: string;
  datasource: string;
  seg_on: string;
  seg_off: string;
  bg_day: string;
  bg_night: string;
  max_rotate: number;
}

declare var config: Config;

type XY = [x: number, y: number];
type Points = [XY, XY, XY, XY, XY, XY];

interface Data {
  interface: string;
  pps: number;
  bps: number;
}
