app.controller("AuthorController", function ($scope, $location, $routeParams, $http, $filter) {
    $scope.page.setTitle("Quản Lý Tác Giả");

    let host = "http://localhost:8081/rest/authors";
    $scope.editingAuthor = {};
    $scope.isEditing = false;
    $scope.authors = [];
    $scope.filteredAuthors = [];
    $scope.errors = {
        authorName: null
    }; // Biến lưu trữ thông báo lỗi


    $scope.searchText = "";
    $scope.noResults = false;
    $scope.orderByField = "";
    $scope.reverseSort = true;
    $scope.defaultImage =
        "/admin/assets/images/default.jpg"; // Thay thế đường dẫn thực bằng đường dẫn hình ảnh mặc định thực tế

    $scope.itemsPerPageOptions = [5, 10, 20, 50];
    $scope.itemsPerPage = 5;
    $scope.currentPage = 1;
    $scope.maxSize = 5; // Số lượng nút phân trang tối đa hiển thị

    $scope.checkErrors = function () {
        $scope.errors = {};

        if (!$scope.editingAuthor.authorName) {
            $scope.errors.authorName = 'Vui lòng nhập tên tác giả.';
        }

        if (!$scope.editingAuthor.nation) {
            $scope.errors.nation = 'Vui lòng chọn quốc tịch.';
        }

        if ($scope.editingAuthor.gender === undefined) {
            $scope.errors.gender = 'Vui lòng chọn giới tính.';
        }

        var hasErrors = Object.keys($scope.errors).length > 0;


        return !hasErrors;
    };


    $scope.hideError = function (authorName) {
        // Ẩn thông báo lỗi cho trường fieldName
        $scope.errors[authorName] = '';

    };


    $scope.hideError = function (nation) {
        // Ẩn thông báo lỗi cho trường fieldName
        $scope.errors[nation] = '';

    };
    $scope.hideError = function (gender) {
        // Ẩn thông báo lỗi cho trường fieldName
        $scope.errors[gender] = '';

    };


    $scope.loadAuthors = function () {
        var url = `${host}`;
        $http
            .get(url)
            .then((resp) => {
                $scope.authors = resp.data;
                $scope.searchData();
            })
            .catch((error) => {
                console.log("Error", error);
            });
    };

    $scope.searchData = function () {
        $scope.filteredAuthors = $filter("filter")(
            $scope.authors,
            $scope.searchText
        );
        $scope.noResults = $scope.filteredAuthors.length === 0;
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
            $scope.filteredAuthors.length
        );
        return start + 1 + "-" + end + " của " + $scope.filteredAuthors.length;
    };

    function generateRandomId() {
        let result = "AU00";
        for (let i = 0; i < 3; i++) {
            result += Math.floor(Math.random() * 10);
        }
        return result;
    }

    $scope.saveAuthor = function (authorId) {
        var formData = new FormData();
        var fileInput = document.getElementById("fileInput");


        if (!$scope.checkErrors()) {
            return;
        }

        // Hiển thị hiệu ứng loading
    var loadingOverlay = document.getElementById("loadingOverlay");
    loadingOverlay.style.display = "block";

    if (fileInput && fileInput.files.length > 0) {
        var file = fileInput.files[0];

        // Kiểm tra nếu là tệp hình ảnh
        if (isImageFile(file)) {
            formData.append("image", file);
        } else {
            // Nếu không phải là hình ảnh, hiển thị thông báo lỗi bằng Swal
            Swal.fire({
                icon: "error",
                title: "Lỗi",
                text: "Chỉ cho phép tải lên các file hình ảnh (png, jpg, jpeg).",
            });
            // Ẩn hiệu ứng loading khi lưu thành công
            loadingOverlay.style.display = "none";
            return;
        }
    }
        if (!$scope.isEditing) {
            $scope.editingAuthor.authorId = generateRandomId();
        }

        formData.append(
            "authorJson",
            JSON.stringify({
                authorId: $scope.editingAuthor.authorId || "",
                authorName: $scope.editingAuthor.authorName || "",
                gender: $scope.editingAuthor.gender || false,
                nation: $scope.editingAuthor.nation || "",
            })
        );

        if (isAuthorNameDuplicate($scope.editingAuthor.authorName, $scope.editingAuthor.authorId)) {
            $scope.errors.authorName = 'Tác giả đã tồn tại.';
            // Ẩn hiệu ứng loading khi lưu thành công
            loadingOverlay.style.display = "none";
            return;
        }


        if ($scope.isEditing) {
            // Ẩn hiệu ứng loading khi lưu thành công
            loadingOverlay.style.display = "none";
            var loadingOverlay = document.getElementById("loadingOverlay");
            loadingOverlay.style.display = "block";

            var url = `${host}/${$scope.editingAuthor.authorId}`;
            $http
                .put(url, formData, {
                    transformRequest: angular.identity,
                    headers: { "Content-Type": undefined },
                })
                .then((resp) => {
                    // Ẩn hiệu ứng loading khi lưu thành công
                    loadingOverlay.style.display = "none";

                    $scope.loadAuthors();
                    $scope.resetForm();
                    Swal.fire({
                        icon: "success",
                        title: "Thành công",
                        text: `Cập nhật tác giả ${authorId} thành công`,
                    });
                    $scope.clearImage();
                })
                .catch((error) => {
                    // Ẩn hiệu ứng loading khi lưu thành công
                    loadingOverlay.style.display = "none";

                    Swal.fire({
                        icon: "error",
                        title: "Thất bại",
                        text: `Cập nhật tác giả ${authorId} thất bại`,
                    });
                });
        } else {

            if (isAuthorNameDuplicate($scope.editingAuthor.authorName, null)) {
                $scope.errors.authorName = 'Tác giả đã tồn tại.';
                // Ẩn hiệu ứng loading khi lưu thành công
                loadingOverlay.style.display = "none";
                return;
            }
            var url = `${host}`;
            $http
                .post(url, formData, {
                    transformRequest: angular.identity,
                    headers: {
                        "Content-Type": undefined,
                    },
                })
                .then((resp) => {
                    // Ẩn hiệu ứng loading khi lưu thành công
                    loadingOverlay.style.display = "none";
                    $scope.loadAuthors();
                    $scope.resetForm();
                    Swal.fire({
                        icon: "success",
                        title: "Thành công",
                        text: `Thêm tác giả  ${authorId} thành công `,
                    });
                    $scope.clearImage();
                })
                .catch((error) => {
                    // Ẩn hiệu ứng loading khi lưu thành công
                    loadingOverlay.style.display = "none";

                    console.log(error.data);
                    if (error.data) {
                        Swal.fire({
                            icon: "error",
                            title: "Thất bại",
                            text: `Thêm tác giả ${authorId} thất bại `,
                        });
                    }
                });
        }
    };

    function isAuthorNameDuplicate(authorName, authorId) {
        return $scope.authors.some(author => author.authorName === authorName && author.authorId !== authorId);
    }


    $scope.$watch("nationalities", function () {
        $("#nationSelect").select2({
            placeholder: "Tìm kiếm quốc tịch",
            allowClear: true,
        });

        $("#nationSelect").on("change", function () {
            $scope.editingAuthor.nation = $(this).val();
        });
    });

    $scope.clearNationalitySearch = function () {
        $scope.editingAuthor.nation = ''; // Xóa giá trị quốc tịch trong biến $scope.editingAuthor
        $('#nationSelect').val(null).trigger('change'); // Xóa giá trị được chọn trong thanh tìm kiếm quốc tịch
    };


    function getNationalities() {
        var url = "/admin/js/nationalities.json";
        return $http.get(url);
    }

    $scope.nationalities = [];

    getNationalities()
        .then(function (resp) {
            $scope.nationalities = resp.data.map(function (nationality) {
                return nationality.name;
            });
        })
        .catch(function (error) {
            console.log("Error", error);
        });

    $scope.editAuthorAndRedirect = function (authorId) {
        var url = `${host}/${authorId}`;
        $http
            .get(url)
            .then(function (resp) {
                $scope.editingAuthor = angular.copy(resp.data);
                $scope.isEditing = true;

                // Chuyển hướng đến trang chỉnh sửa thông tin tác giả và truyền dữ liệu tác giả.
                // Sử dụng $location.search để thiết lập tham số trong URL.
                $location
                    .path("/author-form")
                    .search({ id: authorId, data: angular.toJson(resp.data) });
            })
            .catch(function (error) {
                console.log("Error", error);
            });
    };
    // Kiểm tra xem có tham số data trong URL không.
    if ($routeParams.data) {
        // Parse dữ liệu từ tham số data và gán vào editingAuthor.
        $scope.editingAuthor = angular.fromJson($routeParams.data);
        $scope.isEditing = true;
    }

    $scope.deleteAuthor = function (authorId) {
        Swal.fire({
            title: "Xóa Tác Giả?",
            text: "Bạn có chắc chắn muốn xóa tác giả này?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Có",
            cancelButtonText: "Không",
        }).then((result) => {
            if (result.isConfirmed) {
                var url = `${host}/${authorId}`;
                $http
                    .delete(url)
                    .then(function (resp) {
                        if (resp.status === 200) {
                            $scope.loadAuthors();
                            Swal.fire({
                                icon: "success",
                                title: "Thành công",
                                text: `Xóa ID ${authorId} thành công `,
                            });
                        } else {
                            Swal.fire({
                                icon: "error",
                                title: "Thất bại",
                                text: `Không thể xóa tác giả ${authorId} đang sử dụng `,
                            });
                        }
                    })
                    .catch(function (error) {
                        Swal.fire({
                            icon: "error",
                            title: "Thất bại",
                            text: `Xóa ID ${authorId} thất bại `,
                        });
                    });
            }
        });
    };


    $scope.clearImage = function () {
        $scope.editingAuthor.image =
            "/admin/assets/images/default.jpg";
        var imageElement = document.getElementById("uploadedImage");
        imageElement.src =
            "/admin/assets/images/default.jpg";
        var fileInput = document.getElementById("fileInput");
        fileInput.value = null; // Đặt giá trị của input file thành null để xóa tệp đã chọn
    };


    $scope.resetForm = function () {
        $scope.editingAuthor = {};
        $scope.isEditing = false;




        $scope.clearNationalitySearch();
        $scope.clearImage();
        $scope.errors = {};
    };

    $scope.loadAuthors();
});

// Hiển thị ảnh tải lên khi chọn tệp
function displayImage(event) {
    var imageElement = document.getElementById("uploadedImage");
    var fileInput = event.target;

    if (fileInput.files && fileInput.files[0]) {
        var file = fileInput.files[0];

        // Kiểm tra nếu là tệp hình ảnh
        if (isImageFile(file)) {
            var reader = new FileReader();

            reader.onload = function (e) {
                imageElement.src = e.target.result;
            };

            reader.readAsDataURL(file);
        } else {
            // Nếu không phải là hình ảnh, hiển thị thông báo lỗi bằng Swal
            Swal.fire({
                icon: "error",
                title: "Lỗi",
                text: "Chỉ cho phép tải lên các file hình ảnh (png, jpg, jpeg).",
            });
            // Đặt giá trị của input file về null để người dùng có thể chọn lại một tệp khác.
            fileInput.value = null;
        }
    }
}

// Kiểm tra nếu là tệp hình ảnh
function isImageFile(file) {
    return file.type.startsWith("image/");
}
