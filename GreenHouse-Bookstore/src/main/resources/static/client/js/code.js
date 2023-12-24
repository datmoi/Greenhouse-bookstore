$(document).ready(function () {
    $('.selectpicker').selectpicker();
});

//Menu Sách
$("#sach-menu").mouseenter(function () {
    $("#top-bar-category-container-right-sach").css("display", "block");
}).mouseleave(function () {
    $("#top-bar-category-container-right-sach").css("display", "none");
});

$("#top-bar-category-container-right-sach").mouseenter(function () {
    $("#top-bar-category-container-right-sach").css("display", "block");
}).mouseleave(function () {
    $("#top-bar-category-container-right-sach").css("display", "none");
});
// Hover mặc định vào tab có id sach-menu
$("#sach-menu").trigger("mouseenter");
//Menu Sách Nước ngoài
$("#sachnuocngoai-menu").mouseenter(function () {
    $("#top-bar-category-container-right-nuocngoai").css("display", "block");
}).mouseleave(function () {
    $("#top-bar-category-container-right-nuocngoai").css("display", "none");
});

$("#top-bar-category-container-right-nuocngoai").mouseenter(function () {
    $("#top-bar-category-container-right-nuocngoai").css("display", "block");
}).mouseleave(function () {
    $("#top-bar-category-container-right-nuocngoai").css("display", "none");
});

// Menu DỤNG CỤ HỌC SINH
$("#dungcu-menu").mouseenter(function () {
    $("#top-bar-category-container-right-dungcu").css("display", "block");
}).mouseleave(function () {
    $("#top-bar-category-container-right-dungcu").css("display", "none");
});

$("#top-bar-category-container-right-dungcu").mouseenter(function () {
    $("#top-bar-category-container-right-dungcu").css("display", "block");
}).mouseleave(function () {
    $("#top-bar-category-container-right-dungcu").css("display", "none");
});

//Menu Hành trang đến trường
$("#hanhtrang-menu").mouseenter(function () {
    $("#top-bar-category-container-right-hanhtrang").css("display", "block");
}).mouseleave(function () {
    $("#top-bar-category-container-right-hanhtrang").css("display", "none");
});

$("#top-bar-category-container-right-hanhtrang").mouseenter(function () {
    $("#top-bar-category-container-right-hanhtrang").css("display", "block");
}).mouseleave(function () {
    $("#top-bar-category-container-right-hanhtrang").css("display", "none");
});


//Menu Sách mobile
$("#sach-menu1").mouseenter(function () {
    $("#top-bar-category-container-right-sach1").css("display", "block");
}).mouseleave(function () {
    $("#top-bar-category-container-right-sach1").css("display", "none");
});

$("#top-bar-category-container-right-sach1").mouseenter(function () {
    $("#top-bar-category-container-right-sach1").css("display", "block");
}).mouseleave(function () {
    $("#top-bar-category-container-right-sach1").css("display", "none");
});


//Menu Sách nước ngoài mobile
$("#sachnuocngoai-menu1").mouseenter(function () {
    $("#top-bar-category-container-right-nuocngoai1").css("display", "block");
}).mouseleave(function () {
    $("#top-bar-category-container-right-nuocngoai1").css("display", "none");
});

$("#top-bar-category-container-right-nuocngoai1").mouseenter(function () {
    $("#top-bar-category-container-right-nuocngoai1").css("display", "block");
}).mouseleave(function () {
    $("#top-bar-category-container-right-nuocngoai1").css("display", "none");
});

// Menu DỤNG CỤ HỌC SINH mobile
$("#dungcu-menu1").mouseenter(function () {
    $("#top-bar-category-container-right-dungcu1").css("display", "block");
}).mouseleave(function () {
    $("#top-bar-category-container-right-dungcu1").css("display", "none");
});

$("#top-bar-category-container-right-dungcu1").mouseenter(function () {
    $("#top-bar-category-container-right-dungcu1").css("display", "block");
}).mouseleave(function () {
    $("#top-bar-category-container-right-dungcu1").css("display", "none");
});

// Menu Hành trang đến trường mobile
$("#hanhtrang-menu1").mouseenter(function () {
    $("#top-bar-category-container-right-hanhtrang1").css("display", "block");
}).mouseleave(function () {
    $("#top-bar-category-container-right-hanhtrang1").css("display", "none");
});

$("#top-bar-category-container-right-hanhtrang1").mouseenter(function () {
    $("#top-bar-category-container-right-hanhtrang1").css("display", "block");
}).mouseleave(function () {
    $("#top-bar-category-container-right-hanhtrang1").css("display", "none");
});


$(document).ready(function () {
    $("a[href*=lang]").on("click", function () {
        var param = $(this).attr("href");
        $.ajax({
            url: "/index" + param,
            success: function () {
                location.reload();
            }
        });
        return false;
    });
});

