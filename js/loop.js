//setInterval(onUpdate, 33);
var iter = 0;
var accum = 0;
var mopo_x = config['mopo_x'];
var mopo_y = config['mopo_y'];

var night = false;

d3.select("#mopodiv")
    .append("svg")
    .attr("id","mopotolppa_outer")
    .attr("width", mopo_x)
    .attr("height", "800px")
    .attr("style", "margin-top: 440px; position: absolute; z-index: -1;");

d3.select("#mopodiv")
    .attr("style", "width: "+mopo_x+"px; height: "+mopo_y+"px; margin-left: auto; margin-right: auto;")
    .append("svg")
    .attr("id","mopo_outer")
    .attr("width", mopo_x)
    .attr("height", mopo_y);
d3.select("#mopodiv")
    .append("svg")
    .attr("id","lisakyltti_outer")
    .attr("width", mopo_x)
    .attr("style", "");


d3.xml("svg/varoituskolmio.svg", "image/svg+xml", function(xml) {
    var importedNode = document.importNode(xml.documentElement, true);
    d3.select("#mopo_outer").node().appendChild(importedNode);
    d3.select("#Layer_1")
        .attr("width", mopo_x);

    d3.xml("svg/mopo.svg", "image/svg+xml", function(xml) {
        var importedNode = document.importNode(xml.documentElement, true);
        d3.select("#mopo_outer").node().appendChild(importedNode);

        d3.select("#mopo_svg")
            .attr("width", mopo_x)
            .attr("height", mopo_y);

        d3.select("#mopo")
            .attr("transform", "translate(50,80) scale(0.5) rotate(0, "+cx+", "+cy+")")
            .attr("fill", "#202020");
        if (!night)
        {
            d3.select("#mopo_svg").selectAll("ellipse").attr("visibility", "hidden");
        }
    });
});

d3.xml("svg/mopotolppa.svg", "image/svg+xml", function(xml) {
    var importedNode = document.importNode(xml.documentElement, true);
    d3.select("#mopotolppa_outer").node().appendChild(importedNode);
    d3.select("#mopotolppa")
        .attr("width", mopo_x);

});

d3.xml("svg/lisakyltti.svg", "image/svg+xml", function(xml) {
        var importedNode = document.importNode(xml.documentElement, true);
        d3.select("#lisakyltti_outer").node().appendChild(importedNode);
        d3.select("#lisakyltti")
            .attr("width", mopo_x);     
});

var cx=162.052,cy=136.745,cs=0.5;

var avg_arr = new Array();
var num_samples = 100;
for(i=0;i<num_samples;i++) {
    avg_arr.push(0);
}


function setBackgroundColor(day)
{
    var t = new Date();
    if ((t.getHours() >= 16 || t.getHours() <= 8) && day === undefined)
    {
        document.body.style.background = "#101010";
        d3.select("#mopo").attr("fill", "#202020");
        d3.select("#mopo_svg").selectAll("ellipse").attr("visibility", "visible");
        night = true;
    }
    else {
        document.body.style.background = "#f0f0f0";
        d3.select("#mopo").attr("fill", "#000000");
        d3.select("#mopo_svg").selectAll("ellipse").attr("visibility", "hidden");
        night = false;
    }
}

var source = null;
function establishEventChannel() {
    if(source !== null) { source.close(); }
    source = new EventSource(config['event_datasource']);
    source.addEventListener('message', function(e) {
        edata = JSON.parse(e.data);
        mbps = edata.bps/1000.0/1000.0;
        traffic = parseInt(post_return_avg(parseInt(mbps)));
        numberTo7Seg(traffic);
        var d3m = d3.select("#mopo_svg")
            .attr("transform", "translate(50,80) scale(0.5) rotate("+traffic*config['keul_factor']+", "+cx+", "+cy+")");
    }, false);
    source.addEventListener('error', function(e) {
        establishEventChannel();
    }, false);
}

if(!!window.EventSource && config['event_datasource'] != '') {
    establishEventChannel();
    requestAnimationFrame(eventUpdate);
} else {
    requestAnimationFrame(xhrUpdate);
}

function xhrUpdate() {
    var traffic = 0;
    if(iter % 10 == 0) {
        $.get(config['datasource'], function(traffic_value) {
            traffic = parseInt(post_return_avg(parseInt(traffic_value)));
            numberTo7Seg(traffic);
            var d3m = d3.select("#mopo_svg").selectAll("path")
                .attr("transform", "translate(50,80) scale(0.5) rotate("+traffic*config['keul_factor']+", "+cx+", "+cy+")");
        });
    } else {
        traffic = post_return_avg(parseInt(avg_arr[num_samples-1]));
        numberTo7Seg(traffic);
        var d3m = d3.select("#mopo_svg").selectAll("path")
            .attr("transform", "translate(50,80) scale(0.5) rotate("+traffic*config['keul_factor']+", "+cx+", "+cy+")");
        var d3m = d3.select("#mopo_svg").selectAll("ellipse")
            .attr("transform", "translate(50,80) scale(0.5) rotate("+traffic*config['keul_factor']+", "+cx+", "+cy+")");
    }

    ++iter;
    requestAnimationFrame(xhrUpdate);
}

function eventUpdate() {
    var traffic = 0;
    traffic = post_return_avg(parseInt(avg_arr[num_samples-1]));
    numberTo7Seg(traffic);
    var d3m = d3.select("#mopo_svg").selectAll("path")
        .attr("transform", "translate(50,80) scale(0.5) rotate("+traffic*config['keul_factor']+", "+cx+", "+cy+")");
    var d3m = d3.select("#mopo_svg").selectAll("ellipse")
        .attr("transform", "translate(50,80) scale(0.5) rotate("+traffic*config['keul_factor']+", "+cx+", "+cy+")")

    ++iter;
    requestAnimationFrame(eventUpdate);
}

function post_return_avg(traffic_value) {
    avg_arr.shift();
    avg_arr.push(traffic_value);
    var avg = 0;
    for(i=0;i<num_samples;i++) {
        avg += avg_arr[i];
    }

    avg = avg / num_samples;

    return Math.round(avg);
}

function numberTo7Seg(number) {
    var max = 5;
    for(i=1;i<=max;i++) {
        base = Math.pow(10,i);
        segnum = number % base;
        number -= segnum;
        segnum = segnum / (base/10);
        numbers[max-i].data(to7seg(segnum.toString())).style({"fill": function (d) {
            return d ? config['seg_on'] : config['seg_off'];
        }});
    }
}

setInterval(setBackgroundColor, 60000);
setBackgroundColor();
