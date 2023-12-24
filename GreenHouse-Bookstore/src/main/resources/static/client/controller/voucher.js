app.controller("voucherController", voucherController);

function voucherController($http, $scope, voucherAPI) {
    var host = voucherAPI;
    $scope.listVoucher = [];
    $scope.getVoucherData = function () {
        $http
            .get(host + "/list-vouchers")
            .then(function (response) {
                $scope.listVoucher = response.data;
            })
            .catch(function (error) {
                // Xử lý lỗi nếu có
                console.error("Error:", error);
            });
    };

    $scope.Create = function (voucher) {
        var username = localStorage.getItem("username");
        var data = {
            username: username,
            voucher: voucher,
        };
        $http
            .post(host + "/add/voucher", JSON.stringify(data))
            .then(function (response) {
                // Xử lý dữ liệu khi request thành công
                var message = response.data.message;
                var status = response.data.status;
                if (status == 200) {
                    Swal.fire({
                        title: "Thông báo",
                        text: message,
                        icon: "success",
                        confirmButtonText: "OK",
                    });
                } else if (status == 403) {
                    Swal.fire({
                        title: "Thông báo",
                        text: message,
                        icon: "warning",
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
            .catch(function (error) {
                // Xử lý lỗi khi request thất bại
                console.error(error);
            });
    };

    $scope.getVoucherData();
}
