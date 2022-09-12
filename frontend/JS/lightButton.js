var header = document.getElementById("tool_left");
var btnGrid = document.getElementById("grid");
var btns = header.getElementsByClassName("btn");
// console.log(btns)

$(document).ready(function () {
    $(".option-btn").on("click", function () {
        if ($(this).hasClass("btn-off")) {
            $(this).addClass("btn-on");
            $(this).removeClass("btn-off");
        } else {
            $(this).removeClass("btn-on");
            $(this).addClass("btn-off");
        }
    });
});

// for (var i = 0; i < btns.length; i++) {
//     btns[i].addEventListener("click", function () {
//         var current = document.getElementsByClassName("active");
//         if (current.length > 0) {
//             current[0].className = current[0].className.replace(" active", "");
//         }
//         this.className += " active";
//     });
// }

