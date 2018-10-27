// modified from http://igglyboo.github.io/d3/7seg.html

var scaleF = 0.5;

var width = 90 * scaleF;
var height = 160 * scaleF;
var numbers = [];

var div = d3.select("body").append("div").attr({id: "sevenseg", style: "width: "+config['mopo_x']+"px; padding-top: "+config['mopo_x']/12.0+"px; padding-left: "+config['mopo_x']/6.0+"px; margin-left: auto; margin-right: auto;"});
for(var counter = 0; counter < 5; counter++) {
    var svg = div.append("svg").attr({width: width, height: height});
    numbers.push(svg.selectAll("polygon")
        .data(to7seg("E"))
        .enter()
        .append("polygon")
        .attr({
            "points": function (d, i) {
                var x = 10*scaleF;
                var y = 10*scaleF;
                var index = [
                    {origin: [x, y], orientation: "horizontal"},
                    {origin: [x + 70*scaleF, y], orientation: "vertical"},
                    {origin: [x + 70*scaleF, y + 70*scaleF], orientation: "vertical"},
                    {origin: [x, y + 140*scaleF], orientation: "horizontal"},
                    {origin: [x, y + 70*scaleF], orientation: "vertical"},
                    {origin: [x, y], orientation: "vertical"},
                    {origin: [x, y + 70*scaleF], orientation: "horizontal"},

                ];
                return getSevenSegmentPoints(index[i].origin, 70*scaleF, 10*scaleF, index[i].orientation);
            }
        })
        .style({
            "fill": function (d) {
                return d ? config['seg_on'] : config['seg_off'];
            }
        }));
}

function getSevenSegmentPoints(origin, longAxis, shortAxis, orientation){
    var x = origin[0];
    var y = origin[1];
    var points = [[x,y], null, null, null, null, null];

    if (orientation === 'horizontal'){
        points[1] = [x + shortAxis/2 , y - shortAxis/2];
        points[2] = [x + longAxis - shortAxis/2 , y - shortAxis/2];
        points[3] = [x + longAxis, y];
        points[4] = [x + longAxis - shortAxis/2 , y + shortAxis/2];
        points[5] = [x + shortAxis/2 , y + shortAxis/2];
        return pointArrayToString(points);
    } else if(orientation === 'vertical') {
        points[1] = [x + shortAxis/2 , y + shortAxis/2];
        points[2] = [x + shortAxis/2 , y + longAxis - shortAxis/2];
        points[3] = [x, y  + longAxis];
        points[4] = [x - shortAxis/2 , y + longAxis - shortAxis/2];
        points[5] = [x - shortAxis/2 , y + shortAxis/2];
        return pointArrayToString(points);
    } else {
        return null;
    }
}

function pointArrayToString(points){
    var str = "";
    for(var i =0; i < points.length; i++){
        str += points[i].join() + " "
    }
    return str;
}

function to7seg(value){
    return {
        "0": [true,true,true,true,true,true,false],
        "1": [false,true,true,false,false,false,false],
        "2": [true,true,false,true,true,false,true],
        "3": [true,true,true,true,false,false,true],
        "4": [false,true,true,false,false,true,true],
        "5": [true,false,true,true,false,true,true],
        "6": [true,false,true,true,true,true,true],
        "7": [true,true,true,false,false,false,false],
        "8": [true,true,true,true,true,true,true],
        "9": [true,true,true,true,false,true,true],
        "10": [true,true,true,false,true,true,true],
        "11": [false,false,true,true,true,true,true],
        "12": [true,false,false,true,true,true,false],
        "13": [false,true,true,true,true,false,true],
        "14": [true,false,false,true,true,true,true],
        "15": [true,false,false,false,true,true,true],
        "E": [false,false,false,false,false,false,true]
    }[value.toUpperCase()]
}
