app.controller("singinController", singinController);
function singinController($http, $scope, signupAPI) {
    const host = signupAPI;
    $scope.emailAndPhone;
    $scope.code;
    $scope.password;
    $scope.repassword;
    $scope.passwordError = false;
    $scope.disabled = true;
    $scope.checkPassword = function () {
        if (!$scope.isValidPassword($scope.password)) {
            $scope.passwordError = true;
        } else {
            $scope.passwordError = false;
        }
        if ($scope.password == "") {
            $scope.passwordError = false;
        }
    };

    $scope.isValidPassword = function (password) {
        var passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@#$%^&+=]).{8,}$/;
        return passwordRegex.test(password);
    };

    $scope.signup = function () {
        var formData = {
            emailAndPhone: $scope.emailAndPhone || "",
            code: $scope.code || "",
            password: $scope.password || "",
            repassword: $scope.repassword || "",
        };
        // Gửi dữ liệu đến backend thông qua HTTP POST request
        $scope.isLoading = true;
        $http
            .post(host, formData)
            .then(function (response) {
                var status = response.data.status;
                var message = response.data.message;
                if (status == 201) {
                    Swal.fire({
                        title: "Thông báo",
                        text: message,
                        icon: "success",
                        confirmButtonText: "OK",
                    }).then((result) => {
                        if (result.isConfirmed) {
                            // Nếu người dùng nhấn nút "OK", thực hiện chuyển hướng đến /login
                            $scope.disabled = true;
                            window.location.href = "/login";
                        }
                    });
                } else {
                    Swal.fire({
                        title: "Thông báo",
                        text: message,
                        icon: "error",
                        confirmButtonText: "OK",
                    });
                }
            })
            .finally(() => {
                // Sau khi hoàn thành gọi API (thành công hoặc thất bại), đặt isLoading lại thành false.
                $scope.isLoading = false;
            });
    };

    $scope.sendCode = function () {
        var formData = {
            emailAndPhone: $scope.emailAndPhone || "",
            code: $scope.code || "",
            password: $scope.password || "",
            repassword: $scope.repassword || "",
        };
        $scope.isLoading = true;
        $http
            .post(host + "/send-code", formData)
            .then(function (response) {
                var status = response.data.status;
                var message = response.data.message;
                if (status == 201) {
                    Swal.fire({
                        title: "Thông báo",
                        text: message,
                        icon: "success",
                        confirmButtonText: "OK",
                    });
                    $scope.disabled = false;
                } else {
                    Swal.fire({
                        title: "Thông báo",
                        text: message,
                        icon: "error",
                        confirmButtonText: "OK",
                    });
                }
            })
            .finally(() => {
                // Sau khi hoàn thành gọi API (thành công hoặc thất bại), đặt isLoading lại thành false.
                $scope.isLoading = false;
            });
    };
}
