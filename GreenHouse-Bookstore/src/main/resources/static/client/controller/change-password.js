app.controller("changePasswordController", changePasswordController);

function changePasswordController($http, $scope, $timeout, AuthService, changePasswordAPI) {
    const host = changePasswordAPI;
    var currentURL = window.location.href;
    var url = new URL(currentURL);
    $scope.token = url.searchParams.get("token");
    $scope.showFormPassword = true;
    $scope.countdown = 5; // Đếm ngược từ 5 giây
    $scope.newPassword;
    $scope.confirmPassword;
    $scope.passwordError = false;
    $scope.checkPassword = function () {
        if (!$scope.isValidPassword($scope.newPassword)) {
            $scope.passwordError = true;
        } else {
            $scope.passwordError = false;
        }
        if ($scope.newPassword == "") {
            $scope.passwordError = false;
        }
    };

    $scope.isValidPassword = function (password) {
        var passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@#$%^&+=]).{8,}$/;
        return passwordRegex.test(password);
    };

    // Sử dụng $timeout để cập nhật đếm ngược mỗi giây
    var updateCountdown = function () {
        $scope.countdown--;
        if ($scope.countdown === 0) {
            // Nếu đếm ngược hết, điều hướng về trang đăng nhập
            window.location.href = "/login"; // Đổi đường dẫn thành trang đăng nhập của bạn
            AuthService.logout();
        } else {
            // Nếu chưa hết thời gian, tiếp tục cập nhật đếm ngược
            $timeout(updateCountdown, 1000);
        }
    };

    $scope.sendCode = function () {
        var account = {
            token: $scope.token,
            newPassword: $scope.newPassword || "",
            confirmPassword: $scope.confirmPassword || "",
        };
        if (account.token == null) {
            var username = localStorage.getItem("username");
            $http
                .post(host + "/" + username, account)
                .then((response) => {
                    // Xử lý kết quả trả về khi gọi API thành công
                    var status = response.status;
                    var message = response.data.message;
                    if (status === 200) {
                        $scope.showFormPassword = false;
                        updateCountdown();
                    } else {
                        Swal.fire({
                            title: "Thông báo",
                            text: message,
                            icon: "error",
                            confirmButtonText: "OK",
                        });
                    }
                })
                .catch((error) => {
                    console.error("Lỗi: " + error);
                });
        } else {
            $http
                .post(host, account)
                .then((response) => {
                    // Xử lý kết quả trả về khi gọi API thành công
                    var status = response.status;
                    var message = response.data.message;
                    if (status === 200) {
                        $scope.showFormPassword = false;
                        updateCountdown();
                    } else {
                        Swal.fire({
                            title: "Thông báo",
                            text: message,
                            icon: "error",
                            confirmButtonText: "OK",
                        });
                    }
                })
                .catch((error) => {
                    console.error("Lỗi: " + error);
                });
        }
    };
}
