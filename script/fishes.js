
/*
- insérer les calculs de biais des aires
- eye and tail etc
- finish tuning parameters + add final data feature
*/

/* ==== CONFIGURATION ==== */

var transition = 1000;
var scale = 0.65;
var axisDisplacementX = 50;
var margin = 10;

var config = {
    "rangeBodyHeight": [30*scale,150*scale], // use radius ?
    "rangeTailLength": [10*scale,75*scale],
    "rangeFinHeight": [10*scale,75*scale],
    "rangeEyeRadius": [5*scale,20*scale],

    "bodyLength": 150*scale,
    "tailHeight": 30*scale,
    "finWidth": 40*scale,
    "eyeCoef" : { "x": 0.35*0.9, "y":0.125*0.9 } // do another way
};


/* dimensions of the graphic area */
var width = 0.75*(-20 + window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth) ;
var height = 0.85*(-20 + window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight);

var rangeX = [
    config["rangeTailLength"][1] + 0.5*config["bodyLength"] + axisDisplacementX + margin,
    width - config["rangeTailLength"][1] - 0.5*config["bodyLength"] - axisDisplacementX - margin
];
var rangeY = [
    0.5*config["rangeBodyHeight"][1] + margin,
    height - 0.5*config["rangeBodyHeight"][1] - margin
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
	.then(function(input) {
        // copying data because my code necessitates globally accessible data constructs (cf function setFocusedFeature)
        assignData(JSON.parse(JSON.stringify(input)));
   	})
	.catch(function(error) {
		console.log(error);
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
        "eye" : d3.keys(dataSet[0])[3]
    };

    dataRanges = {
        [dataAssign["body"]]: [d3.min(dataSet, (d)=>{return d[dataAssign["body"]]}), d3.max(dataSet, (d)=>{return d[dataAssign["body"]]})],
        [dataAssign["tail"]]: [d3.min(dataSet, (d)=>{return d[dataAssign["tail"]]}), d3.max(dataSet, (d)=>{return d[dataAssign["tail"]]})],
        [dataAssign["fin"]]: [d3.min(dataSet, (d)=>{return d[dataAssign["fin"]]}), d3.max(dataSet, (d)=>{return d[dataAssign["fin"]]})],
        [dataAssign["eye"]]: [d3.min(dataSet, (d)=>{return d[dataAssign["eye"]]}), d3.max(dataSet, (d)=>{return d[dataAssign["eye"]]})],
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

    // creating fish bodies
    fishes.append("ellipse")
        .attr("class", "body")
        .attr("onclick", "setFocusedFeature(\"body\")")
        .attr("cx", x)
        .attr("cy", y)
        .attr("rx", config["bodyLength"]/2)
        .attr("ry", (d)=>{return 0.5*bodyHeight(d[dataAssign["body"]])}) //scale
        .attr("fill", "white")
        .attr("stroke-width", "2")
        .attr("stroke", "black");

    // creating fish tails
    fishes.append("polygon")
        .attr("class", "tail")
        .attr("onclick", "setFocusedFeature(\"tail\")")
        .attr("points",(d)=>{
            return [
            x-0.5*config["bodyLength"], y,
            x-0.5*config["bodyLength"]-tailLength(d[dataAssign["tail"]]), y+0.5*config["tailHeight"],
            x-0.5*config["bodyLength"]-tailLength(d[dataAssign["tail"]]), y-0.5*config["tailHeight"]
        ].join(" ")});

    // creating fish fins
    fishes.append("polygon")
        .attr("class", "fin")
        .attr("onclick", "setFocusedFeature(\"fin\")")
        .attr("points",(d)=>{
            return [
            x-0.5*config["finWidth"], y,
            x+0.5*config["finWidth"], y,
            x-0.5*config["finWidth"], y+finHeight(d[dataAssign["fin"]])
        ].join(" ")});

    // creating fish eyes
    fishes.append("circle")
        .attr("class", "eye")
        .attr("onclick", "setFocusedFeature(\"eye\")")
        .attr("cx", (d)=>{return x+config["eyeCoef"]["x"]*config["bodyLength"]})
        .attr("cy", (d)=>{return y-config["eyeCoef"]["y"]*bodyHeight(d[dataAssign["body"]])})
        .attr("r", (d)=>{return eyeRadius(d[dataAssign["eye"]])});


    // positioning fishes to move from center to random position to make a landing screen effect
    fishes.attr("transform", function(d, i) {
        return "translate("+width/2+","+height/2+")"
    });

    var posX = randomPositionArray(rangeX, dataSet.length);
    var posY = randomPositionArray(rangeY, dataSet.length);

    fishes.transition().duration(transition).delay(0)
        .attr("transform", function(d, i) {
            var x = rangeX[0]+posX[i]+margin;
            var y = rangeY[0]+posY[i]+margin;
            return "translate("+x+","+y+")";
        });
}


function setFocusedFeature(feature) {
    console.log("focusing "+feature); // debug

    var fishes = d3.selectAll(".fish");

    if (fishes.empty()) { return }

    // deselect previous feature
    if (currentFeature) {
        svg.selectAll("."+currentFeature).attr("stroke", "black").attr("stroke-width", "2");
    }

    // select new feature
    currentFeature = feature;
    svg.selectAll("."+currentFeature).attr("stroke", "red").attr("stroke-width", "3");

    // ajust title
    d3.select(".title")
        .text(function(){return "Selected data feature \""+dataAssign[feature]+"\" assigned to the "+feature});

    // scale for depth
    var scaleY = d3.scaleLinear();
    scaleY.domain(dataRanges[dataAssign[feature]])
    scaleY.range(rangeY);

    // transition to new positions based on selected feature
    var posX = randomPositionArray(rangeX, dataSet.length); // trying to make a good repartition ~~~
    fishes.transition().duration(transition).delay(0)
        .attr("transform", function(d, i) {
            var x = rangeX[0]+posX[i]+margin;
            return "translate("+x+","+scaleY(d[dataAssign[feature]])+")";
        });

    // drawing axis
    svg.selectAll(".axis").remove();

    var axisYLeft = d3.axisLeft().scale(scaleY);
    svg.append("g")
        .attr("class", "axis")
        .attr("transform", ()=>{return "translate("+axisDisplacementX+", 0)"})
        .call(axisYLeft);

    var axisYRight = d3.axisRight().scale(scaleY);
    svg.append("g")
        .attr("class", "axis")
        .attr("transform", ()=>{return "translate("+(width-margin-axisDisplacementX)+", 0)"})
        .call(axisYRight);

}


/* ==== UTIL ==== */

function randomPositionArray(range, length) {
    var pos = new Array(length);
    for (let i = 0; i < pos.length; i++) {
        pos[i] = i*((range[1]-range[0])/pos.length);
    }
    pos.sort(function() {return 0.5 - Math.random();});
    return pos;
}

function getRandomInt(range) {
    var min = range[0];
    var max = range[1];
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
