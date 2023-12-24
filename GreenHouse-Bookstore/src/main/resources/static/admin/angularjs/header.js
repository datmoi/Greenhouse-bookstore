app.controller("headerController", headerController);

function headerController($http, $window, $scope, jwtHelper) {
  var fullName = localStorage.getItem("fullName");
  var imageStorge = localStorage.getItem("image");
  // Khởi tạo biến $scope.username với giá trị mặc định
  $scope.fullName = fullName;
  $scope.image = "https://img2.woyaogexing.com/2021/07/17/362d5f90c6a14213b27fb814e5c599da!400x400.jpeg";

  if (imageStorge !== "undefined") {
    $scope.image = imageStorge;
  } else if (imageStorge == undefined) {
    $scope.image = "https://img2.woyaogexing.com/2021/07/17/362d5f90c6a14213b27fb814e5c599da!400x400.jpeg";
  }

  $scope.logout = function () {
    $window.localStorage.removeItem("token");
    $window.localStorage.removeItem("username");
    $window.localStorage.removeItem("fullName");
    window.location.href = "/logout";
  };
}
