function getElementFontSize( context ) {
    // Returns a number
    return parseFloat(
        // of the computed font-size, so in px
        getComputedStyle(
            // for the given context
            context
            // or the root <html> element
            || document.documentElement
        )
        .fontSize
    );
}
function convertRem(value) {
    return convertEm(value);
}
function convertEm(value, context) {
    return value * getElementFontSize(context);
}

console.log(convertRem(17));

function clustering (req) {

    d3.json(req['data_path'], function (error, data) {
        console.log(req);
        //height of each row in the heatmap
        var h = req['h'];
        //width of each column in the heatmap
        var w = req['w'];

        console.log(data);
        //attach a SVG element to the document's body
        var mySVG = d3.select("body")
            .append("div")
            .style("overflow", "scroll")
            .append("svg")
            .attr("width", window.innerWidth - "15em")
            .attr("height", (h * data['names'].length + 100))
            .style('position', 'absolute')
            .style('top', 0)
            .style('left', 0);

        //define a color scale using the min and max expression values
        var colorScale = d3.scaleLinear()
            .domain([data['min'], 0, data['max']])
            .range(["blue", "white", "red"]);

        //generate heatmap rows
        var heatmapRow = mySVG.selectAll(".heatmap")
            .data(data['clustered_data'])
            .enter().append("g");

        //generate heatmap columns
        var heatmapRects = heatmapRow
            .selectAll(".rect")
            .data(function (d) {
                return d;
            }).enter().append("svg:rect")
            .attr('width', w)
            .attr('height', h)
            .attr('x', function (d) {
                return (d[2] * w) + 25;
            })
            .attr('y', function (d) {
                return (d[1] * h) + 50;
            })
            .style('fill', function (d) {
                return colorScale(d[0]);
            });

        //label columns
        var columnLabel = mySVG.selectAll(".colLabel")
            .data(data['labels'])
            .enter().append('svg:text')
            .attr('x', function (d, i) {
                return ((i + 0.5) * w) + 25;
            })
            .attr('y', 30)
            .attr('class', 'label')
            .style('text-anchor', 'middle')
            .text(function (d) {
                return d;
            });

        //expression value label
        var expLab = d3.select("body")
            .append('div')
            .style('height', 23)
            .style('position', 'absolute')
            .style('background', 'FFE53B')
            .style('opacity', 0.8)
            .style('top', 0)
            .style('padding', 10)
            .style('left', 40)
            .style('display', 'none');

        //heatmap mouse events
        heatmapRow
            .on('mouseover', function (d, i) {
                d3.select(this)
                    .attr('stroke-width', 1)
                    .attr('stroke', 'black')

                output = '<b>' + data['names'][i] + '</b><br>';
                for (var j = 0, count = data['clustered_data'][i].length; j < count; j++) {
                    output += data['clustered_data'][i][j][0] + ", ";
                }
                expLab
                    .style('top', (i * h))
                    .style('display', 'block')
                    .html(output.substring(0, output.length - 3));
            })
            .on('mouseout', function (d, i) {
                d3.select(this)
                    .attr('stroke-width', 0)
                    .attr('stroke', 'none')
                expLab
                    .style('display', 'none')
            });
    });
}