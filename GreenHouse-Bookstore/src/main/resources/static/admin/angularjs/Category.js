app.controller("CategoryController", function ($scope, $location, $routeParams, $http, $filter) {
    $scope.$on('$routeChangeSuccess', function (event, current, previous) {
        $scope.page.setTitle(current.$$route.title || ' Quản Lý Danh Mục');
    });

    let host = "http://localhost:8081/rest/categories";
    $scope.editingCategory = {};
    $scope.isEditing = false;
    $scope.categories = [];
    $scope.categoryTypes = [];
    $scope.filteredCategories = [];
    $scope.errors = "";
    $scope.searchText = "";
    $scope.noResults = false;
    $scope.orderByField = "";
    $scope.reverseSort = true;
    $scope.itemsPerPageOptions = [5, 10, 20, 50];
    $scope.itemsPerPage = 5;
    $scope.maxSize = 5; // Số lượng nút phân trang tối đa hiển thị
    $scope.currentPage = 1;
    $scope.maxSize = 5; // Số lượng nút phân trang tối đa hiển thị



    

    $scope.loadCategories = function () {
        var url = `${host}`;
        $http
            .get(url)
            .then((resp) => {
                $scope.categories = resp.data;
                $scope.searchData();
            })
            .catch((error) => {
                console.log("Error", error);
            });
    };

    // Lấy dữ liệu loại danh mục
    $http
        .get("/rest/categoryTypes")
        .then((resp) => {
            $scope.categoryTypes = resp.data;
        })
        .catch((error) => {
            console.log("Error", error);
        });

        $scope.checkErrors = function () {
            $scope.errors = {};
    
            if (!$scope.editingCategory.typeId) {
                $scope.errors.typeId = 'Vui lòng chọn loại danh mục.';
            }
    
            if (!$scope.editingCategory.categoryName) {
                $scope.errors.categoryName = 'Vui lòng nhập tên danh mục.';
            }
    
    
            var hasErrors = Object.keys($scope.errors).length > 0;
    
            return !hasErrors;
        };


        $scope.hideError = function (typeId) {
            // Ẩn thông báo lỗi cho trường fieldName
            $scope.errors[typeId] = '';
    
        };
        $scope.hideError = function (categoryName) {
            // Ẩn thông báo lỗi cho trường fieldName
            $scope.errors[categoryName] = '';
    
        };
        

    $scope.searchData = function () {
        $scope.filteredCategories = $filter("filter")($scope.categories, $scope.searchText);
        $scope.noResults = $scope.filteredCategories.length === 0;
    };

    $scope.sortBy = function (field) {
        if ($scope.orderByField === field) {
            $scope.reverseSort = !$scope.reverseSort;
        } else {
            $scope.orderByField = field;
            $scope.reverseSort = true;
        }
    };

    $scope.calculateRange = function () {
        var start = ($scope.currentPage - 1) * $scope.itemsPerPage;
        var end = Math.min(
            start + $scope.itemsPerPage,
            $scope.filteredCategories.length
        );
        return start + 1 + "-" + end + " của " + $scope.filteredCategories.length;
    };

    $scope.saveCategory = function () {
        if (!$scope.isEditing) {
            $scope.editingCategory.categoryId = "CAT00" + generateRandomId(3);
        }
        if (!$scope.checkErrors()) {
            return;
        }

        var category = {
            categoryId: $scope.editingCategory.categoryId,
            categoryName: $scope.editingCategory.categoryName || "",
            typeId: $scope.editingCategory.typeId || "",
        };

        if (isCategoryNameDuplicate($scope.editingCategory.categoryName, $scope.editingCategory.categoryId)) {
            $scope.errors.categoryName = 'Tên danh mục đã tồn tại.';
            return;
        }

        if ($scope.isEditing) {
            var url = `${host}/${category.categoryId}`;
            $http
                .put(url, category)
                .then((resp) => {
                    $scope.loadCategories();
                    $scope.resetForm();
                    Swal.fire({
                        icon: "success",
                        title: "Thành công",
                        text: `Cập nhật danh mục ${category.categoryId}`,
                    });
                })
                .catch((error) => {
                    Swal.fire({
                        icon: "error",
                        title: "Thất bại",
                        text: `Cập nhật danh mục ${category.categoryId} thất bại`,
                    });
                });
        } else {

            if (isCategoryNameDuplicate($scope.editingCategory.categoryName, null)) {
                $scope.errors.categoryName = 'Tên danh mục đã tồn tại.';
                return;
            }
            var url = `${host}`;
            $http
                .post(url, category)
                .then((resp) => {
                    $scope.loadCategories();
                    $scope.resetForm();
                    Swal.fire({
                        icon: "success",
                        title: "Thành công",
                        text: `Thêm danh mục ` + category.categoryName,
                    });
                })
                .catch((error) => {
                    if (error.data) {
                        Swal.fire({
                            icon: "error",
                            title: "Thất bại",
                            text: `Thêm danh mục thất bại`,
                        });
                    }
                });
        }
    };

    function isCategoryNameDuplicate(categoryName, categoryId) {
        return $scope.categories.some(category => category.categoryName === categoryName && category.categoryId !== categoryId);
    }

    function generateRandomId() {
        let result = "";
        for (let i = 0; i < 3; i++) {
            result += Math.floor(Math.random() * 10);
        }
        return result;
    }

    $scope.editCategoryAndRedirect = function (categoryId) {
        var url = `${host}/${categoryId}`;
        $http
            .get(url)
            .then(function (resp) {
                $scope.editingCategory = angular.copy(resp.data);
                $scope.isEditing = true;

                $location.path("/category-form").search({ id: categoryId, data: angular.toJson(resp.data) });
            })
            .catch(function (error) {
                console.log("Error", error);
            });
    };

    if ($routeParams.data) {
        $scope.editingCategory = angular.fromJson($routeParams.data);
        $scope.isEditing = true;
    }

    $scope.deleteCategory = function (categoryId) {
        Swal.fire({
            title: "Xóa Danh Mục?",
            text: "Bạn có chắc chắn muốn xóa danh mục này?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Có",
            cancelButtonText: "Không",
        }).then((result) => {
            if (result.isConfirmed) {
                var url = `${host}/${categoryId}`;
                $http
                    .delete(url)
                    .then(function (resp) {
                        if (resp.status === 200) {
                            $scope.loadCategories();
                            Swal.fire({
                                icon: "success",
                                title: "Thành công",
                                text: `Xóa danh mục ${categoryId} thành công`,
                            });
                        } else {
                            Swal.fire({
                                icon: "error",
                                title: "Thất bại",
                                text: `Danh mục ${categoryId} đang được sử dụng và không thể xóa.`,
                            });
                        }
                    })
                    .catch(function (error) {
                        Swal.fire({
                            icon: "error",
                            title: "Thất bại",
                            text: `Xóa danh mục ${categoryId} thất bại`,
                        });
                    });
            }
        });
    };


    $scope.resetForm = function () {
        $scope.editingCategory = {};
        $scope.isEditing = false;
    };


    $scope.loadCategories();
});
