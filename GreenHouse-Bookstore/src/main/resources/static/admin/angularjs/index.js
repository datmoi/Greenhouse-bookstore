app.controller('IndexController', IndexController);

function IndexController($scope, $http) {
    $scope.$on('$routeChangeSuccess', function (event, current, previous) {
        $scope.page.setTitle(current.$$route.title || ' Trang quản trị');
    });
    let host = "http://localhost:8081/rest";
    $scope.getIndexCount = function () {
        var url = `${host}/getIndexCount`;
        $http.get(url).then(resp => {
            $scope.countOrdersWithStatus = resp.data.countOrdersWithStatus;
            $scope.countBrand = resp.data.countBrand;

            $scope.countUsersCurrentYear = resp.data.countUsersCurrentYear;
            $scope.percentageChange = resp.data.percentageChange;
        }).catch(error => {
            console.log("Error", error);
        });
    }
    $scope.getIndexCount();
}