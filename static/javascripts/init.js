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
    clustering(req);
})