
/**
 * Defines a 2D Point
 * @param {integer} x The x coordinate of point
 * @param {integer} y The y coordinate of point
 */
function Point(x, y) {
    this.x = x;
    this.y = y;
}

/**
 * Defines a quadratic curve with start, end, and control point
 * @param {Point} startPoint the starting point of the curve
 * @param {Point} cntrlPoint the control point of the curve
 * @param {Point} endPoint the ending point of the curve
 */
function Curve(startPoint, cntrlPoint, endPoint) {
    this.startPoint = startPoint;
    this.cntrlPoint = cntrlPoint;
    this.endPoint = endPoint;
    this.length = quadraticBezierLength(this) || 0;
}

/**
 * Defines a path as a starting point and a list of curves
 * @param {Point} startPoint The starting point of the path
 * @param {array of Curves} curves List of curves that define a path
 * @function getPointAtPercentage
 * @param {integer} percent An integer between 0 and 100
 * @return A point along the correct curve along the path representing a percentage along the path
 */
function Path(startPoint, curves) {
    this.startPoint = startPoint;
    this.curves = curves || [];
    this.lengthPercentages = getLengthPercentages(this) || [];
    this.precomputedPoints = (()=>{
        var precompPoints = [];
        for(var percent = 0; percent <= 100; percent++){
             precompPoints.push(this.calcPointAtPercentage(percent));
        }
        return precompPoints;
    })();
}

(function(){
    this.calcPointAtPercentage = function(percent) {
        var sum = 0;
        for (var i = 0; i < this.curves.length; i++) {
            sum += this.lengthPercentages[i];
            if (percent <= sum) {
                percent = (percent - (sum - this.lengthPercentages[i])) / this.lengthPercentages[i];
                return getQuadraticBezierXYatPercent(this.curves[i], percent);
            }
        }
        return null;
    };
    this.getPointAtPercentage = function(percent){
        return this.precomputedPoints[percent]
    };
}).call(Path.prototype)

/**
 * Returns an array of each curve's percentage of a path
 * @param {Path} path A path to calculate percentages on 
 * @return An array of integers representing percentages of curves along a path
 */
function getLengthPercentages(path) {
    var lengthSum = 0;
    var lengthPercentages = [];
    for (var i = 0; i < path.curves.length; i++) {
        lengthSum += path.curves[i].length;
    }

    for (var i = 0; i < path.curves.length; i++) {
        lengthPercentages.push(Math.ceil((path.curves[i].length / lengthSum) * 100));
    }

    return lengthPercentages;
}

/**
 * Returns point representing a control point between two points
 * @param {Point} start The starting point
 * @param {Point} end The ending point
 * @return the control point 
 */
function getControlPoint(start, end) {
    return new Point((start.x + end.x) / 2, (start.y + end.y) / 2)
}

/**
 * Returns a Path that passes through the list of points
 * @param {array of Points} points An array of points
 * @return A path through all the given points
 */
function getPathThroughPoints(points) {
    var startPoint = new Point(points[0].x, points[0].y);
    var curves = [];
    var i;
    var currentCursor = startPoint;
    for (i = 1; i < points.length - 2; i++) {
        var cntrlPoint = getControlPoint(points[i], points[i + 1]);
        curves.push(new Curve(currentCursor, points[i], cntrlPoint));
        currentCursor = cntrlPoint;
    }
    // curve through the last two points
    curves.push(new Curve(currentCursor, points[i], points[i + 1]));
    return new Path(startPoint, curves);
}


/**
 * Returns a point at a given percentage along a curve
 * @param {Curve} curve The curve you want to calculate a point of
 * @param {float} percent A floating point number between 0 - 1
 * @return A point representing a given percentage along a curve 
 */
function getQuadraticBezierXYatPercent(curve, percent) {
    var x = Math.pow(1 - percent, 2) * curve.startPoint.x +
        2 * (1 - percent) * percent * curve.cntrlPoint.x +
        Math.pow(percent, 2) * curve.endPoint.x;
    var y = Math.pow(1 - percent, 2) * curve.startPoint.y +
        2 * (1 - percent) * percent * curve.cntrlPoint.y +
        Math.pow(percent, 2) * curve.endPoint.y;
    return new Point(x, y);
}

/**
 * Computes the length of a quadratic Bezier curve
 * @param {Curve} a curve to calculate the length of
 * @return {float} The length of the curve 
 * http://en.wikipedia.org/wiki/B%C3%A9zier_curve
 * https://gist.github.com/tunght13488/6744e77c242cc7a94859
 */
function quadraticBezierLength(curve) {
    var a = new Point(
        curve.startPoint.x - 2 * curve.cntrlPoint.x + curve.endPoint.x,
        curve.startPoint.y - 2 * curve.cntrlPoint.y + curve.endPoint.y
    );
    var b = new Point(
        2 * curve.cntrlPoint.x - 2 * curve.startPoint.x,
        2 * curve.cntrlPoint.y - 2 * curve.startPoint.y
    );
    var A = 4 * (a.x * a.x + a.y * a.y);
    var B = 4 * (a.x * b.x + a.y * b.y);
    var C = b.x * b.x + b.y * b.y;

    var Sabc = 2 * Math.sqrt(A + B + C);
    var A_2 = Math.sqrt(A);
    var A_32 = 2 * A * A_2;
    var C_2 = 2 * Math.sqrt(C);
    var BA = B / A_2;

    return (A_32 * Sabc + A_2 * B * (Sabc - C_2) +
        (4 * C * A - B * B) * Math.log((2 * A_2 + BA + Sabc) / (BA + C_2))) / (4 * A_32);
}

/**
 * Creates a path on a given canvas 
 * @param {canvas} context A given canvas context to draw on 
 * @param {Path} path The path to stroke 
 */
function makePath(context, path) {
    context.beginPath();
    context.moveTo(path.startPoint.x, path.startPoint.y);
    for (var i = 0; i < path.curves.length; i++) {
        var curve = path.curves[i];
        context.quadraticCurveTo(curve.cntrlPoint.x, curve.cntrlPoint.y, curve.endPoint.x, curve.endPoint.y);
    }
}