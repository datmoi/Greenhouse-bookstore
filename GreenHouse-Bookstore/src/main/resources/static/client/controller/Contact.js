app.controller("ContactController", ContactController);

function ContactController($http, $scope, contactAPI) {
    var host = contactAPI;
    $scope.Create = function () {
        $scope.showLoading();
        var data = {
            fullName: $scope.fullName,
            email: $scope.email,
            content: $scope.content
        };
        $http
            .post(host, JSON.stringify(data))
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
                } else if (status == 400) {
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
            }).finally(() => {
            $scope.hideLoading();
        });
    };
}
