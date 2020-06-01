
/*
- insérer les calculs de biais des aires
- finish tuning parameters
- explications et commentaires
*/

/* ==== CONFIGURATION ==== */

var transition = 1000;
var scale = 1;
var margin = 10;
var axisDisplacementX = 50;
var widthCoef = 0.75;
var heightCoef = 0.85;

var config = {
    "rangeBodyHeight": [19.5*scale,97.5*scale],
    "rangeTailLength": [6.5*scale,48.75*scale],
    "rangeFinHeight": [6.5*scale,48.75*scale],
    "rangeEyeRadius": [3.25*scale,13*scale],
    "rangeDorsalHeight": [6.5*scale, 33*scale],

    "bodyLength": 97.5*scale,
    "tailHeight": 19.5*scale,
    "finWidth": 26*scale,
    "eyeCoefX" : 0.315,
    "eyeCoefY": 0.1125,
    "dorsalLength" : 30*scale,
    "dorsalCoefY" : 0.48,
};


/* dimensions of the graphic area */
// scaling ?
var width = widthCoef * (-20 + window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth) ;
var height = heightCoef * (-20 + window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight);

var rangeX = [
    0     + (config["rangeTailLength"][1] + 0.5*config["bodyLength"] + axisDisplacementX + margin),
    width - (config["rangeTailLength"][1] + 0.5*config["bodyLength"] + axisDisplacementX + margin)
];
var rangeY = [
    0      + (0.5*config["rangeBodyHeight"][1] + config["rangeDorsalHeight"][1] + margin),
    height - (0.5*config["rangeBodyHeight"][1] + margin)
];


/* ==== MAIN ====*/

var svg = d3.select("body").append("svg")
    .attr("width", width)
    .attr("height", height);

var currentFeature = null;
var data = null;
var dataSet = null;
var dataRanges = null;
var dataAssign = null;

asyncInit();

d3.json("data/data.json")
	.then(function(input){
        // validating dataset
        for (i in input) {
            if (d3.keys(input[i]).length < 5) {
                throw "Dataset is invalid, need at least 5 features per entry";
            }
        }

        // copying data because my code necessitates globally accessible data constructs (cf function setFocusedFeature)
        assignData(JSON.parse(JSON.stringify(input)));
   	})
	.catch(function(error) {
		console.log(error);
        d3.select("body").insert("h2", "svg")
            .attr("class", "error")
            .text(function(){return "ERROR: "+error});
  	});



/* ==== FUNCTIONS ==== */

function asyncInit() {
    if (data == null) {
        setTimeout(asyncInit, 100);
    } else {
        init();
    }
}

function assignData(input) {
    // assigning data and related constructs to global variables
    dataSet = input;

    dataAssign = {
        "body" : d3.keys(dataSet[0])[0],
        "tail" : d3.keys(dataSet[0])[1],
        "fin" : d3.keys(dataSet[0])[2],
        "eye" : d3.keys(dataSet[0])[3],
        "dorsal" : d3.keys(dataSet[0])[4]
    };

    dataRanges = {
        [dataAssign["body"]]: [d3.min(dataSet, function(d){return d[dataAssign["body"]]}), d3.max(dataSet, function(d){return d[dataAssign["body"]]})],
        [dataAssign["tail"]]: [d3.min(dataSet, function(d){return d[dataAssign["tail"]]}), d3.max(dataSet, function(d){return d[dataAssign["tail"]]})],
        [dataAssign["fin"]]: [d3.min(dataSet, function(d){return d[dataAssign["fin"]]}), d3.max(dataSet, function(d){return d[dataAssign["fin"]]})],
        [dataAssign["eye"]]: [d3.min(dataSet, function(d){return d[dataAssign["eye"]]}), d3.max(dataSet, function(d){return d[dataAssign["eye"]]})],
        [dataAssign["dorsal"]]: [d3.min(dataSet, function(d){return d[dataAssign["dorsal"]]}), d3.max(dataSet, function(d){return d[dataAssign["dorsal"]]})]
    };

    data = {
        "dataSet": dataSet,
        "dataRanges": dataRanges,
        "dataAssign": dataAssign
    };
}


function init() {
    svg.selectAll("*").remove();

    // title
    d3.select("body").insert("h2", "svg")
        .attr("class", "title")
        .text("The fish are swimming...");

    // background
    svg.append("rect")
        .attr("x", "0")
        .attr("y", "0")
        .attr("width", "100%")
        .attr("height", "100%")
        .attr("stroke", "black")
        .attr("stroke-width", "3px")
        .attr("fill", "lightblue");


    // those will be used only during initilisation
    var bodyHeight = d3.scaleLinear();
    bodyHeight.domain(dataRanges[dataAssign["body"]]);
    bodyHeight.range(config["rangeBodyHeight"]);

    var tailLength = d3.scaleLinear();
    tailLength.domain(dataRanges[dataAssign["tail"]]);
    tailLength.range(config["rangeTailLength"]);

    var finHeight = d3.scaleLinear();
    finHeight.domain(dataRanges[dataAssign["fin"]]);
    finHeight.range(config["rangeFinHeight"]);

    var eyeRadius = d3.scaleLinear();
    eyeRadius.domain(dataRanges[dataAssign["eye"]]);
    eyeRadius.range(config["rangeEyeRadius"]);

    var dorsalHeight = d3.scaleLinear();
    dorsalHeight.domain(dataRanges[dataAssign["dorsal"]]);
    dorsalHeight.range(config["rangeDorsalHeight"]);


    /* position of (0,0) for all fishes so the x,y of translate(x,y)
    are always the absolute coordinates and we can move everything
    by simply changing de transform attribute and with a transition */
    var x = 0;
    var y = 0;

    // joining data to svg groups for fishes
    var fishes = svg.selectAll(".fish").data(dataSet)
        .enter().append("g")
        .attr("class", "fish")
        .attr("fill", "white")
        .attr("stroke-width", "2")
        .attr("stroke", "black");

    // creating fish tails (first so the point of the triangle is hidden by the body)
    fishes.append("polygon")
        .attr("class", "tail")
        .attr("onclick", "setFocusedFeature(\"tail\")")
        .attr("onmouseover", function(d){ return "showDetail(\"tail\","+d[dataAssign["tail"]]+")" })
        .attr("onmouseout", "removeDetail()")
        .attr("points",function(d){
            return [
            x - 0.5*config["bodyLength"], y,
            x - 0.5*config["bodyLength"] - tailLength(d[dataAssign["tail"]]), y + 0.5*config["tailHeight"],
            x - 0.5*config["bodyLength"] - tailLength(d[dataAssign["tail"]]), y-  0.5*config["tailHeight"]
        ].join(" ")});


    fishes.append("polyline")
        .attr("class", "dorsal")
        .attr("onclick", "setFocusedFeature(\"dorsal\")")
        .attr("onmouseover", function(d){ return "showDetail(\"dorsal\","+d[dataAssign["dorsal"]]+")" })
        .attr("onmouseout", "removeDetail()")
        .attr("points",function(d){
            return [
            x + 0.5*config["dorsalLength"], y - config["dorsalCoefY"]*bodyHeight(d[dataAssign["body"]]),
            x, y - config["dorsalCoefY"]*bodyHeight(d[dataAssign["body"]]) - dorsalHeight(d[dataAssign["dorsal"]]),
            x- 0.5*config["dorsalLength"], y - config["dorsalCoefY"]*bodyHeight(d[dataAssign["body"]]),
        ].join(" ");});

    // creating fish bodies
    fishes.append("ellipse")
        .attr("class", "body")
        .attr("onclick", "setFocusedFeature(\"body\")")
        .attr("onmouseover", function(d){ return "showDetail(\"body\","+d[dataAssign["body"]]+")" })
        .attr("onmouseout", "removeDetail()")
        .attr("cx", x)
        .attr("cy", y)
        .attr("rx", config["bodyLength"]/2)
        .attr("ry", function(d){ return 0.5*bodyHeight(d[dataAssign["body"]]) })

    // creating fish fins
    fishes.append("polygon")
        .attr("class", "fin")
        .attr("onclick", "setFocusedFeature(\"fin\")")
        .attr("onmouseover", function(d){ return "showDetail(\"fin\","+d[dataAssign["fin"]]+")" })
        .attr("onmouseout", "removeDetail()")
        .attr("points",function(d){
            return [
            x - 0.5*config["finWidth"], y,
            x + 0.5*config["finWidth"], y,
            x - 0.5*config["finWidth"], y + finHeight(d[dataAssign["fin"]])
        ].join(" ")});

    // creating fish eyes
    fishes.append("circle")
        .attr("class", "eye")
        .attr("onclick", "setFocusedFeature(\"eye\")")
        .attr("onmouseover", function(d){ return "showDetail(\"eye\","+d[dataAssign["eye"]]+")" })
        .attr("onmouseout", "removeDetail()")
        .attr("cx", function(d){ return x + config["eyeCoefX"] * config["bodyLength"] })
        .attr("cy", function(d){ return y - config["eyeCoefY"] * bodyHeight(d[dataAssign["body"]]) })
        .attr("r", function(d){ return eyeRadius(d[dataAssign["eye"]]) });



    // positioning fishes to move from center to random position to make a landing screen effect
    fishes.attr("transform", function(d, i){ return "translate("+width/2+","+height/2+")" });

    var posX = randomPositionArray(rangeX, dataSet.length);
    var posY = randomPositionArray(rangeY, dataSet.length);

    fishes.transition().duration(transition).delay(0)
        .attr("transform", function(d, i){
            var x = rangeX[0] + posX[i] + margin;
            var y = rangeY[0] + posY[i] + margin;
            return "translate("+x+","+y+")";
        });
}

function showDetail(feature, data) {
    //console.log(feature, data); // debug
    svg.append("text")
        .attr("class", "detail-text")
        .attr("x", "10")
        .attr("y", "25")
        .text(function(d){ return dataAssign[feature]+" = "+data });

}

function removeDetail() {
    svg.selectAll(".detail-text").remove();
}

function setFocusedFeature(feature) {
    //console.log("focusing "+feature); // debug

    var fishes = d3.selectAll(".fish");

    if (fishes.empty()) { return }

    // deselect previous feature
    if (currentFeature) {
        svg.selectAll("."+currentFeature)
            .attr("stroke", "black")
            .attr("stroke-width", "2");
    }

    // select new feature
    currentFeature = feature;
    svg.selectAll("."+currentFeature)
        .attr("stroke", "red")
        .attr("stroke-width", "3");

    // ajust title
    d3.select(".title")
        .text(function(){ return "Selected data feature \""+dataAssign[feature]+"\" assigned to the "+feature });

    // scale for depth
    var scaleY = d3.scaleLinear();
    scaleY.domain(dataRanges[dataAssign[feature]])
    scaleY.range(rangeY);

    // transition to new positions based on selected feature
    var posX = randomPositionArray(rangeX, dataSet.length); // trying to make a good repartition ~~~
    fishes.transition().duration(transition).delay(0)
        .attr("transform", function(d, i){
            var x = rangeX[0] + posX[i] + margin;
            var y = scaleY(d[dataAssign[feature]]);
            return "translate("+x+","+y+")";
        });

    // drawing axis
    svg.selectAll(".axis").remove();

    var axisYLeft = d3.axisLeft().scale(scaleY);
    svg.append("g")
        .attr("class", "axis")
        .attr("transform", function(){ return "translate("+axisDisplacementX+", 0)"})
        .call(axisYLeft);

    var axisYRight = d3.axisRight().scale(scaleY);
    svg.append("g")
        .attr("class", "axis")
        .attr("transform", function(){ return "translate("+(width-margin-axisDisplacementX)+", 0)" })
        .call(axisYRight);

}


/* ==== UTIL ==== */

function randomPositionArray(range, length) {
    var pos = new Array(length);
    for (let i = 0; i < pos.length; i++) {
        pos[i] = i*((range[1]-range[0])/pos.length);
    }
    pos.sort(function(){ return 0.5 - Math.random() });
    return pos;
}

function getRandomInt(range) {
    var min = range[0];
    var max = range[1];
    return Math.floor(Math.random()*(max - min + 1)) + min;
}
