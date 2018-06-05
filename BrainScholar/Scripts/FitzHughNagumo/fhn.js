var chart = {
    element: document.getElementById("lineChart"),
    chartLine: document.getElementById("chartLine"),
    midLine: document.getElementById("midLine"),
    minLine: document.getElementById("minLine"),
    maxLine: document.getElementById("maxLine"),
    midLabel: document.getElementById("midLabel"),
    minLabel: document.getElementById("minLabel"),
    maxLabel: document.getElementById("maxLabel"),
    beginLine: document.getElementById("beginLine"),
    endLine: document.getElementById("endLine"),

    LINE_PADDING: [20, 30, 20, 60],
    LINE_PADDING_SUM_X: undefined, //After init: chart.LINE_PADDING[1] + chart.LINE_PADDING[3]
    LINE_PADDING_SUM_Y: undefined, //After init: chart.LINE_PADDING[0] + chart.LINE_PADDING[2]

    LABEL_LINE_LENGTH: 20,
    LABEL_X: 35,
    LABEL_FONT_SIZE: 16,

    MIDLINE_ENABLED: true,
    MIDLINE_VALUE: 0,

    POINTS_LENGTH: 512,
    RANGE_MIN: -100, //-100
    RANGE_MAX: 20, //20
    RANGE_SIZE: undefined, //After init: chart.RANGE_MAX - chart.RANGE_MIN

    width: undefined,
    height: undefined,
    innerWidth: undefined,
    innerHeight: undefined,
    deltaX: undefined,
    midY: undefined,

    active: false,

    points: [],

    init: function () {
        this.LINE_PADDING_SUM_X = this.LINE_PADDING[1] + this.LINE_PADDING[3];
        this.LINE_PADDING_SUM_Y = this.LINE_PADDING[0] + this.LINE_PADDING[2];
        this.RANGE_SIZE = this.RANGE_MAX - this.RANGE_MIN;

        this.midLabel.style.fontSize = this.LABEL_FONT_SIZE;
        this.minLabel.style.fontSize = this.LABEL_FONT_SIZE;
        this.maxLabel.style.fontSize = this.LABEL_FONT_SIZE;

        this.midLabel.innerHTML = this.MIDLINE_VALUE;
        this.minLabel.innerHTML = this.RANGE_MIN;
        this.maxLabel.innerHTML = this.RANGE_MAX;

        if (!this.MIDLINE_ENABLED) {
            this.midLabel.style.display = "none";
            this.midLine.style.display = "none";
        }

        this.updateSize();
        this.drawPoints();
    },

    reset: function () {
        this.points = [];
        this.drawPoints();
    },

    yCoordinateTransform: function (x) {
        return this.LINE_PADDING[0] + (this.RANGE_SIZE + this.RANGE_MIN - x) / this.RANGE_SIZE * this.innerHeight;
    },

    updateSize: function () {
        //update size values
        this.width = this.element.clientWidth;
        this.height = this.element.clientHeight;
        this.innerWidth = this.width - this.LINE_PADDING_SUM_X;
        this.innerHeight = this.height - this.LINE_PADDING_SUM_Y;
        this.deltaX = this.innerWidth / (this.POINTS_LENGTH - 1);
        this.midY = this.yCoordinateTransform(this.MIDLINE_VALUE);

        //draw lines
        this.midLine.setAttribute("x1", this.LINE_PADDING[3] - this.LABEL_LINE_LENGTH);
        this.midLine.setAttribute("y1", this.midY);
        this.midLine.setAttribute("x2", this.width - this.LINE_PADDING[1]);
        this.midLine.setAttribute("y2", this.midY);

        this.minLine.setAttribute("x1", this.LINE_PADDING[3] - this.LABEL_LINE_LENGTH);
        this.minLine.setAttribute("y1", this.LINE_PADDING[0]);
        this.minLine.setAttribute("x2", this.width - this.LINE_PADDING[1]);
        this.minLine.setAttribute("y2", this.LINE_PADDING[0]);

        this.maxLine.setAttribute("x1", this.LINE_PADDING[3] - this.LABEL_LINE_LENGTH);
        this.maxLine.setAttribute("y1", this.height - this.LINE_PADDING[2]);
        this.maxLine.setAttribute("x2", this.width - this.LINE_PADDING[1]);
        this.maxLine.setAttribute("y2", this.height - this.LINE_PADDING[2]);

        this.beginLine.setAttribute("x1", this.LINE_PADDING[3]);
        this.beginLine.setAttribute("y1", this.LINE_PADDING[0]);
        this.beginLine.setAttribute("x2", this.LINE_PADDING[3]);
        this.beginLine.setAttribute("y2", this.height - this.LINE_PADDING[2]);

        this.endLine.setAttribute("x1", this.width - this.LINE_PADDING[1]);
        this.endLine.setAttribute("y1", this.LINE_PADDING[0]);
        this.endLine.setAttribute("x2", this.width - this.LINE_PADDING[1]);
        this.endLine.setAttribute("y2", this.height - this.LINE_PADDING[2]);

        //draw labels
        this.midLabel.setAttribute("x", this.LABEL_X);
        this.midLabel.setAttribute("y", this.midY);
        this.maxLabel.setAttribute("x", this.LABEL_X);
        this.maxLabel.setAttribute("y", this.LINE_PADDING[0]);
        this.minLabel.setAttribute("x", this.LABEL_X);
        this.minLabel.setAttribute("y", this.height - chart.LINE_PADDING[2]);

    },
    drawPoints: function () {
        var pointsString = "";
        for (var i = 0; i < this.points.length; i++) {
            var posX = this.LINE_PADDING[3] + this.deltaX * i;
            var posY = this.yCoordinateTransform(this.points[i]);
            pointsString += posX + "," + posY + " ";
        }
        this.chartLine.setAttribute("points", pointsString);
    },

    push: function (val) {
        this.points.push(val);
        if (this.points.length > this.POINTS_LENGTH) {
            this.points.shift();
        }
    }
}

chart.init();

/////////////////////////////////////////////

var fitzHughNagumo = {
    defaults: {
        gna: 0.9,
        gk: 1.1,
        beta: 0.6,
        gamma: 1,
        stimulusTimeInterval: 2,
        stimulusMagnitude: 0.9,
        c: 0.025,

        uSolution: -1.1,
        vSolution: -1.2,

        iteration: 0
    },

    DELTA_T: 0.005, //Simulated time per iteration, not actual time between calculations. Weird: 0.0297

    gna: undefined,
    gk: undefined,
    beta: undefined,
    gamma: undefined,
    stimulusTimeInterval: undefined,
    stimulusIterationInterval: undefined, //Is updated to: Math.floor(this.stimulusTimeInterval * this.DELTA_T)
    stimulusMagnitude: undefined,
    c: undefined,

    fSolution: undefined,
    uSolution: undefined,
    vSolution: undefined,

    iteration: undefined,

    reset: function () {
        var keys = Object.keys(this.defaults);

        for (var i = 0; i < keys.length; i++) {
            this[keys[i]] = this.defaults[keys[i]];
        }
    },
    init: function () {
        this.reset();
        this.updateVariables();
    },
    updateVariables: function () {
        this.stimulusIterationInterval = Math.floor(this.stimulusTimeInterval / this.DELTA_T);

    },
    calculateSolutions: function () {
        this.fSolution = this.vSolution * (1 - (Math.pow(this.vSolution, 2) / 3));

        var newSolutionU = (this.vSolution + this.beta - this.gamma * this.uSolution) * this.DELTA_T + this.uSolution;
        var newSolutionV = 1 / this.c * (this.gna * this.fSolution - this.gk * this.uSolution) * this.DELTA_T + this.vSolution;

        this.vSolution = newSolutionV;
        this.uSolution = newSolutionU;

        if (this.iteration % this.stimulusIterationInterval == 0) {
            this.vSolution += this.stimulusMagnitude;
        }

        ++this.iteration;
    }
}

fitzHughNagumo.init();

////////////////////////////////////////////

function recursiveTick() {
    fitzHughNagumo.updateVariables();
    fitzHughNagumo.calculateSolutions();

    var scaledSolution = 100 * (fitzHughNagumo.vSolution + 2.2) / 4.4 - 90;

    chart.push(scaledSolution);

    chart.drawPoints();

    if (chart.active) {
        setTimeout(recursiveTick, 5);
    }
}

setInterval(function () {
    chart.updateSize();
    if (!chart.active) {
        chart.drawPoints();
    }
}, 1000);

/////////////////////////////////////////////

var sliders = {
    elements: {
        gna: document.getElementById("gnaSlider"),
        gk: document.getElementById("gkSlider"),
        beta: document.getElementById("betaSlider"),
        gamma: document.getElementById("gammaSlider"),
        stimulusTimeInterval: document.getElementById("stimulusIntervalSlider"),
        stimulusMagnitude: document.getElementById("stimulusMagnitudeSlider")
    },

    sliderKeys: undefined,

    init: function () {
        this.sliderKeys = Object.keys(this.elements);
        this.reset();
    },
    reset: function () {
        for (var i = 0; i < this.sliderKeys.length; i++) {
            var key = this.sliderKeys[i];
            this.elements[key].value = fitzHughNagumo.defaults[key];
        }
    }
}

sliders.init();

/////////////////////////////////////////////////////

var startButton = document.getElementById("startButton");
startButton.addEventListener("click", function () {
    if (!chart.active) {
        chart.active = true;
        recursiveTick();

        this.setAttribute("value", "Stop");
    } else {
        chart.active = false;

        this.setAttribute("value", "Start");
    }
});

var resetButton = document.getElementById("resetButton");
resetButton.addEventListener("click", function () {
    fitzHughNagumo.reset();
    chart.reset();
    sliders.reset();
});

onChange = function (property, value) {
    fitzHughNagumo[property] = value;
}