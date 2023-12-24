// Hàm tạo danh sách ngày
function createDayOptions() {
    for (var i = 1; i <= 31; i++) {
        var option = document.createElement("option");
        option.value = i;
        option.textContent = i;
        document.getElementById("day").appendChild(option);
    }
}

// Hàm tạo danh sách tháng
function createMonthOptions() {
    var months = ["Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4", "Tháng 5", "Tháng 6", "Tháng 7", "Tháng 8", "Tháng 9", "Tháng 10", "Tháng 11", "Tháng 12"];
    for (var i = 0; i < months.length; i++) {
        var option = document.createElement("option");
        option.value = i + 1;
        option.textContent = months[i];
        document.getElementById("month").appendChild(option);
    }
}

// Hàm tạo danh sách năm
function createYearOptions() {
    var currentYear = new Date().getFullYear();
    for (var i = 1900; i <= currentYear; i++) {
        var option = document.createElement("option");
        option.value = i;
        option.textContent = i;
        document.getElementById("year").appendChild(option);
    }
}

// Gọi các hàm để tạo danh sách
createDayOptions();
createMonthOptions();
createYearOptions();
const openPopupButton = document.getElementById("open-popup");
const popupOverlay = document.getElementById("popup-overlay");
const popupForm = document.getElementById("popup-form");
const closePopupButton = document.getElementById("close-popup");

openPopupButton.addEventListener("click", function () {
    popupOverlay.style.display = "block";
    popupForm.style.display = "block";
    document.body.style.overflow = "hidden"; // Khoá cuộn trang web
});

closePopupButton.addEventListener("click", function () {
    popupOverlay.style.display = "none";
    popupForm.style.display = "none";
    document.body.style.overflow = "auto"; // Cho phép cuộn trang web lại
});