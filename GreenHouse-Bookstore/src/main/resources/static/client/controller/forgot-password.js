app.controller("forgotPasswordController", forgotPasswordController);

function forgotPasswordController($http, $scope, forgotPasswordAPI) {
    const host = forgotPasswordAPI;
    $scope.sendConfirm = function () {
        // Dữ liệu cần gửi lên server
        const Data = {
            email: $scope.email || "",
        };
        $scope.isLoading = true;
        $http
            .post(host, Data)
            .then((response) => {
                var status = response.status;
                var message = response.data.message;
                if (status === 200) {
                    Swal.fire({
                        title: "Thông báo",
                        text: message,
                        icon: "success",
                        confirmButtonText: "OK",
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
            .catch((error) => {
                console.error("Lỗi: " + error);
            })
            .finally(() => {
                // Sau khi hoàn thành gọi API (thành công hoặc thất bại), đặt isLoading lại thành false.
                $scope.isLoading = false;
            });
    };
}
