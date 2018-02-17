function drawCanvas(canvas_id) {
    for ($i = 1; $i < 4; $i++) {
        d3.select("#canvas_picker" + $i).style("display", "none");
    }
    d3.select("#"+canvas_id).node().style = "display:block; padding: 0; margin:auto;";
    canvasPicker = d3.select("#"+canvas_id).node().getContext("2d");
    // create an image object and get it’s source
    var img = new Image();
    img.src = "img/color.png";

    // copy the image to the canvas
    $(img).on("load", function () {
        console.log(canvasPicker);
        console.log(img);
        canvasPicker.drawImage(img, 0, 0);
    });
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
        "data_path" : "../data/output.json",
        "w" : 20,
        "h" : 20
    };
    console.log(req);
    clustering(req);
})