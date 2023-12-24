app.controller("headerController", headerController);

function headerController($scope, jwtHelper, AuthService) {
    var token = localStorage.getItem("token");
    // Khởi tạo biến $scope.username với giá trị mặc định
    $scope.fullName = "Tài khoản";
    if (token) {
        var decodedToken = jwtHelper.decodeToken(token);
        var username = decodedToken.sub;
        var fullName = decodedToken.fullName;
        var image = decodedToken.image;
        window.localStorage.setItem("fullName", fullName);
        window.localStorage.setItem("username", username);
        window.localStorage.setItem("image", image);
    }

    $scope.admin = function () {
        window.location.href = "/admin/index";
    };

    $scope.logout = function () {
        AuthService.logout();
    };

}
