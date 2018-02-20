function drawCanvas(canvas_id) {
    $("canvas[name*='canvas_picker']").each(function (){
        $(this)[0].style = "display:none";
    });

    d3.select("#"+canvas_id).node().style = "display:block; padding: 0; margin:auto; z-index=1;";
    canvasPicker = d3.select("#"+canvas_id).node().getContext("2d");
    // create an image object and get it’s source
    var img = new Image();
    img.src = "img/color.png";

    // copy the image to the canvas
    $(img).on("load", function () {
        img.height = "234";
        img.width = "142";
        canvasPicker.drawImage(img, 0, 0);
    });
}

// create continuous color legend
function makeLegend(selector_id, req) {
    d3.json(req['data_path'], function (error, data) {
        d3.select("#legendSvg").remove();

        var w = 234, h = 50;
        var svg = d3.select(".legend")
            .append("svg")
            .attr("id", "legendSvg")
            .attr("width", w)
            .attr("height", h)
            .append("g");

        var legend = svg.append("defs")
            .append("svg:linearGradient")
            .attr("id", "gradient")
            .attr("x1", "0%")
            .attr("y1", "100%")
            .attr("x2", "100%")
            .attr("y2", "100%")
            .attr("spreadMethod", "pad");

        legend.append("stop")
            .attr("offset", "0%")
            .attr("stop-color", req["colors"][0])
            .attr("stop-opacity", 1);

        legend.append("stop")
            .attr("offset", "50%")
            .attr("stop-color", req["colors"][1])
            .attr("stop-opacity", 1);

        legend.append("stop")
            .attr("offset", "100%")
            .attr("stop-color", req["colors"][2])
            .attr("stop-opacity", 1);

        svg.append("rect")
            .attr("width", w)
            .attr("height", h-20)
            .style("fill", "url(#gradient)");

        svg.append("text")
            .style("font-size", "12px")
            .style("fill", "#ffffff")
            .attr("x", "10px")
            .attr("y", "45px")
            .text(data["max"].toFixed(2));

        svg.append("text")
            .style("font-size", "12px")
            .style("fill", "#ffffff")
            .attr("x", "200px")
            .attr("y", "45px")
            .text(data["min"].toFixed(2))
    });
};

function rgb2hex(color) {
    var rgb = color[2] | (color[1] << 8) | (color[0] << 16);
    return '#' + (0x1000000 + rgb).toString(16).slice(1)
}

function checkRadioBtn() {
    if (d3.select("#r1").node().checked) {
        return "both";
    }
    else if (d3.select("#r2").node().checked) {
        return "x";
    }
    else if (d3.select("#r3").node().checked) {
        return "y";
    }
}


function assignBtn(button, color1, color2, color3) {
    button[0].style.backgroundColor = color1;
    button[1].style.backgroundColor = color2;
    button[2].style.backgroundColor = color3;
}

function assignColor(btnGroup, list) {
    console.log(btnGroup[0].style.backgroundColor.replace("rgb(", "").replace(")", "").split(","));
    list[0] = rgb2hex(btnGroup[0].style.backgroundColor.replace("rgb(", "").replace(")", "").split(","));
    list[1] = rgb2hex(btnGroup[1].style.backgroundColor.replace("rgb(", "").replace(")", "").split(","));
    list[2] = rgb2hex(btnGroup[2].style.backgroundColor.replace("rgb(", "").replace(")", "").split(","));
    return list;
}

$(function () {
    $('.config-toggle').on('click', function () {
        console.log("hi")
        $('body').toggleClass('config-closed');
    });

    $("#param-dropdown").on('click', 'li a', function () {
        $("#param-toggle").text($(this).text());
        $("#param-toggle").val($(this).text());

    });
    $("#color-dropdown li a").click(function () {
        $("#color-toggle").text($(this).text());
        $("#color-toggle").val($(this).text());
    });


    var req = {
        "data_path" : "../data/output_single.json",
        "colors" : ["#00ff00", "#000000","#ff0000"],
        "w" : 20,
        "h" : 20,
        "axis" : "both"
    };

    var canvasPicker;
    $("canvas[name='canvas_picker']").click(function (event) {
        console.log(event);
        console.log($("#" + event.target.id));
        canvasPicker = $("#" + event.target.id)[0].getContext("2d");
        // getting user coordinates
        var x = event.pageX - $("#" + event.target.id).offset().left;
        var y = event.pageY - $("#" + event.target.id).offset().top;
        // getting image data and RGB values
        var img_data = canvasPicker.getImageData(x, y, 1, 1).data;
        var R = img_data[0];
        var G = img_data[1];
        var B = img_data[2];
        var hex = rgb2hex([R, G, B]);
        $("#" + event.target.id)[0].style.display = "none";
        var canvas_id = String(event.target.id.slice(-1));
        $("#btn-color" + String(canvas_id))[0].style.backgroundColor = hex;
    });

    $(".color-dropdown li").click(function () {
        if ($(this)[0].textContent == "Green, Black, Red") {
            assignBtn($("button[id^=btn-color]"), "#00ff00", "#000000","#ff0000");
        } else if ($(this)[0].textContent == "Blue, White, Red") {
            assignBtn($("button[id^=btn-color]"), "#0000ff", "#ffffff","#ff0000");
        } else {
            assignBtn($("button[id^=btn-color]"), "#ff0000", "#ffa500","#ffff00");
        }
    });

    $("#clusterBtn").click(function () {
        $("#clusterSVG g").remove();
        var btnColors = $("button[id^=btn-color]");
        req["colors"] = assignColor(btnColors, []);
        req["data_path"] = "../data/output_" + $("#param-toggle").text() + ".json";
        req["axis"] = checkRadioBtn();
        if (req["axis"] == "x" || req["axis"] == "y"){
            req["data_path"] = "../data/output_" + $("#param-toggle").text() + "_" + req["axis"] + ".json";
        }
        makeLegend("#legend1", req);
        console.log(req);
        clustering(req);
    });
    console.log(req);
    makeLegend("#legend1", req);
    clustering(req);
})

