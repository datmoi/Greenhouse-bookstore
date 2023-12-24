app.controller("CategoryTypeController", function ($scope, $location, $routeParams, $http, $filter) {
    $scope.page.setTitle("Quản Lý Loại Danh Mục");

    let host = "http://localhost:8081/rest/categoryTypes";
    $scope.editingCategoryType = {};
    $scope.isEditing = false;
    $scope.categoryTypes = [];
    $scope.filteredCategoryTypes = [];
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


    $scope.checkErrors = function () {
        $scope.errors = {};

        if (!$scope.editingCategoryType.typeName) {
            $scope.errors.typeName = 'Vui lòng nhập tên loại danh mục.';
        }
        if (!$scope.editingCategoryType.parentCategoriesType) {
            $scope.errors.parentCategoriesType = 'Vui lòng nhập phân loại danh mục.';
        }


        var hasErrors = Object.keys($scope.errors).length > 0;

        return !hasErrors;
    };

    $scope.hideError = function (typeName) {
        // Ẩn thông báo lỗi cho trường fieldName
        $scope.errors[typeName] = '';

    };
    $scope.hideError = function (parentCategoriesType) {
        // Ẩn thông báo lỗi cho trường fieldName
        $scope.errors[parentCategoriesType] = '';

    };
    

    $scope.loadCategoryTypes = function () {
        var url = `${host}`;
        $http
            .get(url)
            .then((resp) => {
                $scope.categoryTypes = resp.data;
                $scope.searchData();
            })
            .catch((error) => {
                console.log("Error", error);
            });
    };

    $scope.searchData = function () {
        $scope.filteredCategoryTypes = $filter("filter")(
            $scope.categoryTypes,
            $scope.searchText
        );
        $scope.noResults = $scope.filteredCategoryTypes.length === 0;
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
            $scope.filteredCategoryTypes.length
        );
        return start + 1 + "-" + end + " của " + $scope.filteredCategoryTypes.length;
    };

    $scope.saveCategoryType = function () {
        if (!$scope.isEditing) {
            $scope.editingCategoryType.typeId = "CT00" + generateRandomId(3);
        }
        if (!$scope.checkErrors()) {
            return;
        }

        var categoryType = {
            typeId: $scope.editingCategoryType.typeId,
            typeName: $scope.editingCategoryType.typeName || "",
            description: $scope.editingCategoryType.description || "",
            parentCategoriesType:  $scope.editingCategoryType.parentCategoriesType || "",
        };

        if (isCategoryTypeNameDuplicate($scope.editingCategoryType.typeName, $scope.editingCategoryType.typeId)) {
            $scope.errors.typeName = 'Tên loại danh mục đã tồn tại.';
            return;
        }

        if ($scope.isEditing) {
            var url = `${host}/${categoryType.typeId}`;
            $http
                .put(url, categoryType)
                .then((resp) => {
                    $scope.loadCategoryTypes();
                    $scope.resetForm();
                    Swal.fire({
                        icon: "success",
                        title: "Thành công",
                        text: `Cập nhật loại danh mục ${categoryType.typeId}`,
                    });
                })
                .catch((error) => {
                    Swal.fire({
                        icon: "error",
                        title: "Thất bại",
                        text: `Cập nhật loại danh mục ${categoryType.typeId} thất bại`,
                    });
                });
        } else {
            if (isCategoryTypeNameDuplicate($scope.editingCategoryType.typeName, null)) {
                $scope.errors.typeName = 'Tên loại danh mục đã tồn tại.';
                return;
            }
            var url = `${host}`;
            $http
                .post(url, categoryType)
                .then((resp) => {
                    $scope.loadCategoryTypes();
                    $scope.resetForm();
                    Swal.fire({
                        icon: "success",
                        title: "Thành công",
                        text: `Thêm loại danh mục ` + categoryType.typeName,
                    });
                })
                .catch((error) => {
                    if (error.data) {
                        Swal.fire({
                            icon: "error",
                            title: "Thất bại",
                            text: `Thêm loại danh mục thất bại`,
                        });
                    }
                });
        }
    };

    function isCategoryTypeNameDuplicate(typeName, typeId) {
        return $scope.categoryTypes.some(categoryTy => categoryTy.typeName === typeName && categoryTy.typeId !== typeId);
    }

    function generateRandomId() {
        let result = "";
        for (let i = 0; i < 3; i++) {
            result += Math.floor(Math.random() * 10);
        }
        return result;
    }

    $scope.editCategoryTypeAndRedirect = function (typeId) {
        var url = `${host}/${typeId}`;
        $http
            .get(url)
            .then(function (resp) {
                $scope.editingCategoryType = angular.copy(resp.data);
                $scope.isEditing = true;

                // Chuyển hướng đến trang chỉnh sửa thông tin loại danh mục và truyền dữ liệu loại danh mục.
                // Sử dụng $location.search để thiết lập tham số trong URL.
                $location.path("/categorytype-form").search({id: typeId, data: angular.toJson(resp.data)});
            })
            .catch(function (error) {
                console.log("Error", error);
            });
    };

    // Kiểm tra xem có tham số data trong URL không.
    if ($routeParams.data) {
        // Parse dữ liệu từ tham số data và gán vào editingCategoryType.
        $scope.editingCategoryType = angular.fromJson($routeParams.data);
        $scope.isEditing = true;
    }
    $scope.deleteCategoryType = function (typeId) {
        Swal.fire({
            title: "Xóa Loại Danh Mục?",
            text: "Bạn có chắc chắn muốn xóa loại danh mục này?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Có",
            cancelButtonText: "Không",
        }).then((result) => {
            if (result.isConfirmed) {
                var url = `${host}/${typeId}`;
                $http
                    .delete(url)
                    .then(function (resp) {
                        if (resp.status === 200) {
                            $scope.loadCategoryTypes();
                            Swal.fire({
                                icon: "success",
                                title: "Thành công",
                                text: `Xóa loại danh mục ${typeId} thành công`,
                            });
                        } else {
                            Swal.fire({
                                icon: "error",
                                title: "Thất bại",
                                text: `Loại danh mục ${typeId} đang được sử dụng và không thể xóa.`,
                            });
                        }
                    })
                    .catch(function (error) {
                        Swal.fire({
                            icon: "error",
                            title: "Thất bại",
                            text: `Xóa loại danh mục ${typeId} thất bại`,
                        });
                    });
            }
        });
    };

    $scope.resetForm = function () {
        $scope.editingCategoryType = {};
        $scope.isEditing = false;
    };

    $scope.loadCategoryTypes();
});
