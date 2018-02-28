var stratify = d3.stratify().parentId(function (d) {
    return d.substring(0, d.lastIndexOf("."));
}).id(function (d) {
    return d;
});

function separation(a, b) {
    return a.parent == b.parent ? 1 : 1;
}

function makeTree (treeHeight, data) {
    var g = d3.select("#clusterSVG")
        .append("g")
        .attr("id", "tree");

    var tree = d3.cluster()
        .size([treeHeight, 320])
        .separation(separation);

    //This code help to find the parent id in this hierarchy, so change this part.

    var root = stratify(data);
    tree(root);

    var link = g.selectAll(".link").data(root.descendants().slice(1))
        .enter()
        .append("path")
        .attr("class", "link")
        .style("fill", "none")
        .style("stroke", "#555")
        .style("stroke-opacity", "0.4")
        .style("stroke-width", "1.5px")
        .attr("d", function (d) {
            return "M" + d.y + "," + d.x
                + " L " + d.parent.y + " " + d.x + " L " + d.parent.y + " " + d.parent.x;
        });

    var node = g.selectAll(".node")
        .data(root.descendants())
        .enter().append("g")
        .attr("class", function (d) {
            return "node" + (d.children ? " node--internal" : " node--leaf");
        })
        .attr("transform", function (d) {
            return "translate(" + d.y + "," + d.x + ")";
        });

    node.append("circle").attr("r", 2.5)
        .attr("id", "node");

}

function makeColTree (treeWidth, data) {

    var tree = d3.cluster()
    //.nodeSize([50, 25])
        .size([treeWidth, 50])
        .separation(separation);

    var root = stratify(data);
    tree(root);

    var link = d3.select("#clusterSVG")
        .append("g")
        .attr("id", "colTree")
        .selectAll(".link").data(root.descendants().slice(1))
        .enter()
        .append("path")
        .attr("class", "link")
        .style("fill", "none")
        .style("stroke", "#555")
        .style("stroke-opacity", "0.4")
        .style("stroke-width", "1.5px")
        .attr("d", function (d) {
            return "M" + d.x + "," + d.y
                + " L " + d.x + " " + d.parent.y + " L " + d.parent.x + " " + d.parent.y;
        });
}

function clustering (req) {
    d3.json(req['data_path'], function (error, data) {
        //height of each row in the heatmap
        var h = req['h'];
        //width of each column in the heatmap
        var w = req['w'];

        var width = w * data['labels'].length;
        var height = h * data['names'].length;

        //attach a SVG element to the document's body
        var clusterSVG = d3.select(".heatmap")
            .append("svg")
            .attr("id", "clusterSVG")
            .attr("viewbox", "0 0 200 400")
            .attr("width", "100%")
            .attr("height", height + 300)
            //.style('position', 'absolute')
            //.style('top', 0)
            //.style('left', 0)
            .append("g")
            .attr("id", "heatmap");

        makeTree(height, data['dendrogram']);
        makeColTree(width, data['col_dendrogram'])

        var mySVG = d3.select("#heatmap");

        //define a color scale using the min and max expression values
        var colorScale = d3.scaleLinear()
            .domain([data['min'], 0, data['max']])
            .range(req['colors']);

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
            })
            .style('stroke-width', '0.2')
            .style('stroke','white');

        //label columns
        var columnLabel = mySVG.selectAll(".colLabel")
            .data(data['labels'])
            .enter().append('svg:text')
            .attr('y', function (d, i) {
                return ((i + 0.5) * w + 29);
            })
            .attr('x', -30)
            .attr('class', 'label')
            .style('transform', 'rotate(-90deg)')
            .style('text-anchor', 'middle')
            .text(function (d) {
                return d;
            });

        var colLabelHeight = d3.select(".label").node().getBBox().width;

        var element_length = data['clustered_data'][0].length
        //label rows
        var rowLabel = mySVG.selectAll(".rowLabel")
            .data(data['names'])
            .enter().append('svg:text')
            .attr('y', function (d, i) {
                return ((i + 0.5) * h + colLabelHeight + 35);
            })
            .attr('x', element_length * w + 30)
            .attr('class', 'label')
            .style('text-anchor', 'left')
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

        var treeWidth = d3.select("#tree").node().getBBox().width + 30;
        var colTreeHeight = d3.select("#colTree").node().getBBox().height + 10;

        var heatmapY = d3.select("#heatmap").node().getBBox();
        var colTreeY = d3.select("#colTree").node().getBBox();
        d3.select("#heatmap").attr("transform", "translate(" + treeWidth + ", " + colTreeHeight +")");
        treeWidth = treeWidth + 25;
        d3.select("#colTree").attr("transform", "translate(" + treeWidth + ", " + String(Number(colLabelHeight)) + ")");
        colTreeHeight = colTreeHeight + 50;
        d3.select("#tree").attr("transform", "translate(30," + colTreeHeight + ")");
    });
}