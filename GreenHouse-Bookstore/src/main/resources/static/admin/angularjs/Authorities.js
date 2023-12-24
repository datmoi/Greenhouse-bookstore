app.controller("AuthoritiesController", function ($scope, $http) {
    $scope.currentPage = 1;
    $scope.itemsPerPageOptions = [5, 12, 24, 32, 64, 128];
    $scope.itemsPerPage = 12;
    $scope.originalAccountsList = [];
    $scope.maxSize = 5;


    $scope.getData = function () {
        $http.get("/rest/authorities").then(resp => {
            $scope.db = resp.data;
            $scope.originalAccountsList = angular.copy($scope.db.accounts);
            $scope.totalItems = $scope.originalAccountsList.length;
            $scope.filteredAccounts = $scope.originalAccountsList;
        });
    };

    $scope.index_of = function (username, roleId) {
        return $scope.db.authorities.findIndex(a => a.account.username == username && a.role.roleId == roleId);
    }

    $scope.setPage = function (pageNo) {
        $scope.currentPage = pageNo;
    };

    $scope.calculateRange = function () {
        var startIndex = ($scope.currentPage - 1) * $scope.itemsPerPage + 1;
        var endIndex = $scope.currentPage * $scope.itemsPerPage;
        if (endIndex > $scope.totalItems) {
            endIndex = $scope.totalItems;
        }

        if ($scope.totalItems === 0) {
            startIndex = 0;
        }

        return startIndex + ' đến ' + endIndex + ' trên tổng số ' + $scope.totalItems + ' mục';
    };

    $scope.updateVisibleData = function () {
        var startIndex = ($scope.currentPage - 1) * $scope.itemsPerPage;
        var endIndex = startIndex + $scope.itemsPerPage;
        $scope.filteredAccounts = $scope.originalAccountsList.slice(startIndex, endIndex);
    };

    $scope.isDataChanged = false;

    $scope.$watch('filteredAccounts', function (newValue, oldValue) {
        if (newValue !== oldValue) {
            $scope.isDataChanged = true;
        }
    }, true);

    $scope.$watchGroup(['currentPage', 'itemsPerPage'], function () {
        if ($scope.isDataChanged) {
            $scope.updateVisibleData();
            $scope.isDataChanged = false;
        }
    });


    $scope.searchData = function () {
        $scope.filteredAccounts = $scope.originalAccountsList.filter(function (account) {
            return !$scope.searchText || account.username.toLowerCase().includes($scope.searchText.toLowerCase());
        });

        // Calculate the total items based on the search results
        $scope.totalItems = $scope.searchText ? $scope.filteredAccounts.length : $scope.originalAccountsList.length;
        $scope.setPage(1);// Set the current page to the first page
    };

    $scope.updateAuthorities = function (username, roleId) {
        var index = $scope.index_of(username, roleId);
        var authoritiesId;

        var data = {
            username: username,
            roleId: roleId
        };

        if (index >= 0) {
            authoritiesId = $scope.db.authorities[index].authoritiesId;
            var username = localStorage.getItem('username');

            if (roleId == 1) {
                Swal.fire({
                    title: 'Mật mã',
                    input: 'password',
                    showCancelButton: true,
                    confirmButtonText: 'Đồng ý',
                    cancelButtonText: 'Hủy',
                }).then((result) => {
                    if (result.value) {
                        if (result.value == 'admin') {
                            $http.delete(`/rest/authorities/${authoritiesId}/${username}`).then(function (resp) {
                                var status = resp.data.status;
                                var message = resp.data.message;
                                if (status == 400) {
                                    swal.fire('Thất bại', message, 'warning');
                                } else if (status == 200) {
                                    swal.fire('Thành công!', message, 'success');
                                }
                            });
                        } else {
                            swal.fire('Thất bại', "Sai mật mã...", 'error');
                        }
                        window.location.reload();
                    }
                });
            } else if (roleId == 2 || roleId == 3) {

                $http.delete(`/rest/authorities/${authoritiesId}/${username}`).then(function (resp) {
                    var status = resp.data.status;
                    var message = resp.data.message;
                    if (status == 400) {
                        swal.fire('Thất bại', message, 'warning');
                    } else if (status == 200) {
                        swal.fire('Thành công!', message, 'success');
                    }
                });
            }


        } else {
            if (roleId == 1) {
                Swal.fire({
                    title: 'Mật mã',
                    input: 'password',
                    showCancelButton: true,
                    confirmButtonText: 'Đồng ý',
                    cancelButtonText: 'Hủy',
                }).then((result) => {
                    if (result.value) {
                        if (result.value == 'admin') {
                            $http.post('/rest/authorities', data).then(function (resp) {
                                swal.fire('Thành công!', 'Đã cập nhật thành công.', 'success');
                            });
                        } else {
                            swal.fire('Thất bại', "Sai mật mã...", 'error');
                        }
                        window.location.reload();
                    }
                });
            } else if (roleId == 2 || roleId == 3) {
                $http.post('/rest/authorities', data).then(function (resp) {
                    $scope.getData();
                    swal.fire('Thành công!', 'Đã cập nhật thành công.', 'success');
                });
            }
        }
    };

    $scope.getData();
});