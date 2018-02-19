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

function rgb2hex(color) {
    var rgb = color[2] | (color[1] << 8) | (color[0] << 16);
    return '#' + (0x1000000 + rgb).toString(16).slice(1)
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
        "h" : 20
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
        var btnColors = $("button[id^=btn-color]");
        req["colors"] = assignColor(btnColors, []);
        req["data_path"] = "../data/output_" + $("#param-toggle").text() + ".json";
        $("#clusterSVG g").remove();
        clustering(req);
    });

    console.log(req);
    clustering(req);
})

