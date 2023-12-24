


app.controller("ProductController", function ($scope, $http, $filter) {
    $scope.$on("$routeChangeSuccess", function (event, current, previous) {
        $scope.page.setTitle(current.$$route.title || " Quản Lý Sản Phẩm");
    });
    let host = "http://localhost:8081/rest/products";
    $scope.editingProduct = {};
    $scope.isEditing = false;
    $scope.products = [];
    $scope.brands = [];
    $scope.publishers = [];
    $scope.categories = [];
    $scope.authors = [];
    $scope.bookAuthors = [];
    $scope.productCategories = [];
    $scope.productAttributes = [];
    $scope.attributeValues = [];
    $scope.productDetails = [];
    $scope.productImages = [];
    $scope.discounts = [];
    $scope.productDiscounts = [];
    $scope.productPriceHistories = [];
    $scope.defaultImage =
        "/admin/assets/images/default.jpg"; // Thay thế đường dẫn thực bằng đường dẫn hình ảnh mặc định thực tế
    $scope.product = {
        createAt: new Date(),
    };

    $scope.selectedItemIndex = -1; // Biến lưu trạng thái sản phẩm đang được chỉnh sửa
    $scope.showActiveProducts = true; // Mặc định hiển thị danh sách đang kinh doanh
    $scope.itemsPerPageOptions = [5, 10, 20, 50];
    $scope.itemsPerPage = 5;
    $scope.currentPage = 1;
    $scope.maxSize = 5; // Số lượng nút phân trang tối đa hiển thị
    $scope.orderByField = "";
    $scope.reverseSort = true;
    $scope.searchText = ""; // Thêm trường searchText cho ô tìm kiếm
    $scope.errors = "";


    $scope.combinedData = [];



    $scope.loadProducts = function () {
        var productsUrl = `${host}`;
        var productDetailsUrl = "/rest/productDetails";
        var productCategoriesUrl = "/rest/productCategories";
        var bookAuthorsUrl = "/rest/bookAuthors";
        var productDiscountsUrl = "/rest/productDiscounts";
        var attributeValuesUrl = "/rest/attributeValues";
        var productImagesUrl = "/rest/productImages";
        var productPriceHistoriesUrl = "/rest/productPriceHistories";
    
        // Sử dụng Promise.all để thực hiện tất cả các yêu cầu đồng thời
        Promise.all([
            $http.get(productsUrl),
            $http.get(productDetailsUrl),
            $http.get(productCategoriesUrl),
            $http.get(bookAuthorsUrl),
            $http.get(productDiscountsUrl),
            $http.get(attributeValuesUrl),
            $http.get(productImagesUrl),
            $http.get(productPriceHistoriesUrl)
        ])
        .then((responses) => {
            var products = responses[0].data;
            var productDetails = responses[1].data;
            var productCategories = responses[2].data;
            var bookAuthors = responses[3].data;
            var productDiscounts = responses[4].data;
            var attributeValues = responses[5].data;
            var productImages = responses[6].data;
            var productPriceHistories = responses[7].data;
    
            // Tiếp tục với xử lý dữ liệu như bạn đã làm trước đó
        // Tạo mảng combinedData bằng cách kết hợp dữ liệu từ tất cả các URL
        $scope.combinedData = products.map(function (product) {
            var matchingDetail = productDetails.find(function (detail) {

                return detail.product.productId === product.productId;
            });

            var matchingCategory = productCategories.find(function (category) {
                return category.product.productId === product.productId;
            });

            var matchingAuthor = bookAuthors.find(function (author) {
                return author.product.productId === product.productId;
            });

            var matchingDiscount = productDiscounts.find(function (discount) {
                return discount.productDetail.product.productId === product.productId;
            });

            var matchingAttributeValues = [];
            var matchingImages = [];

            if (matchingDetail && matchingDetail.productDetailId) {
                matchingAttributeValues = attributeValues.filter(function (value) {
                    return value.productDetail && value.productDetail.productDetailId === matchingDetail.productDetailId;
                });

                matchingImages = productImages.filter(function (image) {
                    return image.productDetail && image.productDetail.productDetailId === matchingDetail.productDetailId;
                });
            }

            var matchingPriceHistories = null;

            if (matchingDetail && matchingDetail.productDetailId) {
                matchingPriceHistories = productPriceHistories.find(function (price) {
                    return price.productDetail && price.productDetail.product.productId === product.productId;
                });
            }


            return {
                product: product,
                productDetail: matchingDetail,
                productCategory: matchingCategory,
                bookAuthor: matchingAuthor,
                productDiscount: matchingDiscount,
                attributeValues: matchingAttributeValues,
                productImages: matchingImages,
                productPriceHistories: matchingPriceHistories

            };
        });
          
        })
        .catch((error) => {
            console.log("Error", error);
        });
    };
   


    $scope.initTinyMCE = function () {
        tinymce.init({
            selector: '#description',
            height: 300,
            plugins: 'anchor autolink charmap codesample emoticons image link lists media searchreplace table visualblocks wordcount',
            toolbar: 'undo redo | blocks fontfamily fontsize | bold italic underline strikethrough | link image media table | align lineheight | numlist bullist indent outdent | emoticons charmap | removeformat',
            tinycomments_mode: 'embedded',
            tinycomments_author: 'Author name',
            setup: function (editor) {
                editor.on('change', function () {
                    console.log("Mô tả thay đổi: ", editor.getContent());
                    $scope.$apply(); // Kích hoạt cập nhật ánh xạ AngularJS
                });
            }
        });
    };



    // Gọi hàm initTinyMCE khi controller được khởi tạo
    $scope.initTinyMCE();





    // Tạo một mảng chứa các promise
    var promises = [
        $http.get("/rest/productAttributes"),
        $http.get("/rest/attributeValues"),
        $http.get("/rest/categories"),
        $http.get("/rest/authors"),
        $http.get("/rest/brand"),
        $http.get("/rest/publishers"),
        $http.get("/rest/productImages"),


    ];

    // Sử dụng Promise.all để đợi tất cả các promise hoàn thành
    Promise.all(promises)
        .then(function (responses) {
            // Gán dữ liệu cho các $scope tương ứng
            $scope.productAttributes = responses[0].data;
            $scope.attributeValues = responses[1].data;
            $scope.categories = responses[2].data;
            $scope.authors = responses[3].data;
            $scope.brands = responses[4].data;
            $scope.publishers = responses[5].data;
            $scope.productImages = responses[6].data;

        })
        .catch(function (error) {
            console.log("Error", error);
        });



    $scope.exportProductsToExcel = function () {
        // Lấy dữ liệu của trang hiện tại
        var filteredData = $scope.getFilteredData();

        // Tính toán chỉ mục bắt đầu và kết thúc của trang hiện tại
        var end = filteredData.length - ($scope.currentPage - 1) * $scope.itemsPerPage;
        var start = Math.max(0, end - $scope.itemsPerPage);

        // Tạo mảng dữ liệu cho tệp Excel
        var excelData = [
            ['BÁO CÁO - DANH SÁCH SẢN PHẨM'], // Header
            [], // Empty row for spacing
            ['#', 'ID', 'Tên sản phẩm', 'Thương hiệu', 'Nhà xuất bản', 'Giá sản phẩm', 'Số lượng', 'Ảnh']
        ];

        // Tạo mảng dữ liệu để chứa dữ liệu cần xuất
        var dataToExport = [];
        dataToExport.push(["Mã Sản Phẩm", "Tên Sản Phẩm", "Thương Hiệu", "Nhà Xuất Bản", "Giá Sản Phẩm", "Số Lượng", "Ảnh"]);

        // Thêm dữ liệu từ danh sách sản phẩm vào mảng dữ liệu
        for (var i = start; i < end; i++) {
            var item = filteredData[i];
            dataToExport.push([
                item.product.productId || '',  // Sử dụng '' nếu giá trị là null
                item.product.productName || '',
                item.product.brand ? item.product.brand.brandName || '' : '',  // Kiểm tra brand có tồn tại trước khi truy cập property
                item.product.publisher ? item.product.publisher.publisherName || '' : '',  // Kiểm tra publisher có tồn tại trước khi truy cập property
                item.productDetail ? item.productDetail.price || '' : '',  // Kiểm tra productDetail có tồn tại trước khi truy cập property
                item.productDetail ? item.productDetail.quantityInStock || '' : '',  // Kiểm tra productDetail có tồn tại trước khi truy cập property
                item.productDetail ? item.productDetail.image || '' : ''  // Kiểm tra productDetail có tồn tại trước khi truy cập property
            ]);
        }

        // Tạo một đối tượng workbook từ dữ liệu
        var wb = XLSX.utils.book_new();
        var ws = XLSX.utils.aoa_to_sheet(dataToExport);
        XLSX.utils.book_append_sheet(wb, ws, 'Products');

        // Xuất file Excel
        XLSX.writeFile(wb, 'Products_Page_' + $scope.currentPage + '.xlsx');
    };

    $scope.importProductsToExcel = function () {
        var fileInput = document.getElementById('fileInputExcel');
        var file = fileInput.files[0];

        if (!file) {
            Swal.fire({
                icon: "error",
                title: "Lỗi",
                text: "Vui lòng chọn file Excel.",
            });
            return;
        }

        var fileType = file.type;
        if (fileType !== "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" &&
            fileType !== "application/vnd.ms-excel") {
            // Bắt lỗi khi định dạng không đúng
            Swal.fire({
                icon: "error",
                title: "Lỗi",
                text: "Định dạng file Excel không đúng. Vui lòng chọn lại.",
            });
            return;
        }


        if (file) {
            var reader = new FileReader();
            reader.onload = function (e) {
                var data = new Uint8Array(e.target.result);
                var workbook = XLSX.read(data, { type: 'array' });

                // Kiểm tra tên cột ở đây
                var sheet = workbook.Sheets[workbook.SheetNames[0]];
                var expectedColumns = ["Mã Sản Phẩm", "Tên Sản Phẩm", "Thương Hiệu", "Nhà Xuất Bản", "Giá Sản Phẩm", "số Lượng", "Ảnh"];
                var headers = [];
                for (var key in sheet) {
                    if (key[0] === '!') continue;
                    if (key[1] === '1') {
                        headers.push(sheet[key].v.trim()); // Sử dụng trim để loại bỏ khoảng trắng ở đầu và cuối
                    } else {
                        break; // Chỉ kiểm tra dòng đầu tiên
                    }
                }

                var isValid = angular.equals(expectedColumns, headers);
                if (!isValid) {
                    Swal.fire({
                        icon: "error",
                        title: "Lỗi",
                        text: "Tên cột không đúng. Vui lòng kiểm tra lại file Excel.",
                    });
                    return;
                }

                // Tiếp tục với post request nếu tên cột đúng
                var formData = new FormData();
                formData.append('file', file);

                $http.post('http://localhost:8081/rest/products/import', formData, {
                    transformRequest: angular.identity,
                    headers: { 'Content-Type': undefined }
                })
                    .then(function (response) {
                        console.log('Import successful', response);
                        $scope.loadProducts();
                    })
                    .catch(function (error) {
                        console.error('Import failed', error);
                    });
            };

            reader.readAsArrayBuffer(file);
        }
    };

    $scope.selectedFileName = "";  // Thêm biến này vào $scope

    $scope.openFileInput = function () {
        var fileInput = document.getElementById('fileInputExcel');
        fileInput.click();  // Kích hoạt sự kiện click trực tiếp từ mã nguồn

        // Cập nhật tên file đã chọn
        fileInput.addEventListener('change', function () {
            $scope.selectedFileName = fileInput.files[0].name;
            $scope.$apply();  // Cập nhật scope để hiển thị ngay lập tức
        });
    };

    $scope.clearSelectedFile = function () {
        $scope.selectedFileName = "";
        // Đặt giá trị input file thành rỗng để có thể chọn lại cùng một file
        document.getElementById('fileInputExcel').value = "";
    };


    $scope.calculateRange = function () {
        var filteredData = $scope.getFilteredData();
        var start = ($scope.currentPage - 1) * $scope.itemsPerPage;
        var end = Math.min(
            start + $scope.itemsPerPage,
            filteredData.length
        );
        return start + 1 + "-" + end + " của " + filteredData.length;
    };

    $scope.updatePagination = function () {
        $scope.currentPage = 1;
    };

    $scope.getFilteredData = function () {
        return $scope.combinedData.filter(function (item) {
            return item.product.status === $scope.showActiveProducts;
        });
    };


    $scope.saveProduct = function () {
        var formData = new FormData();
        var fileInput = document.getElementById("fileInput");



        // Lưu hình ảnh sản phẩm
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

        // Lưu nhiều hình ảnh sản phẩm
        for (var i = 0; i < $scope.selectedImages.length; i++) {
            var selectedImage = $scope.selectedImages[i];
            var selectedFile = selectedImage.file;

            // Kiểm tra nếu là tệp hình ảnh
            if (isImageFile(selectedFile)) {
                formData.append("file", selectedFile);
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

        // Tạo id ngẫu nhiên nếu đang thêm sản phẩm mới
        if (!$scope.isEditing) {
            $scope.product.productId = generateRandomId();
        }

        if (!$scope.checkErrors()) {
            return;
        }

        // Lưu giá trị vào $scope.product.description trước khi gửi đi
        $scope.product.description = tinymce.get('description').getContent();

        // Hiển thị hiệu ứng loading
        var loadingOverlay = document.getElementById("loadingOverlay");
        loadingOverlay.style.display = "block";


        // Tạo mảng attributeValues từ productAttributes
        var attributeValues = [];
        for (var i = 0; i < $scope.productAttributes.length; i++) {
            if ($scope.productAttributes[i].isSelected) {
                var attributeValue = {
                    attribute: $scope.productAttributes[i],
                    value: $scope.productAttributes[i].value
                };
                attributeValues.push(attributeValue);
                console.log(attributeValue);
            }

        }


        var data = {
            product: $scope.product || "",
            status: $scope.product.status = true,
            category: $scope.productCategory.category || "",
            author: $scope.bookAuthor ? $scope.bookAuthor.author : null,
            productDetail: $scope.productDetail || "",
            image: $scope.productDetail.image || "",
            attributeValues: attributeValues || "",

        };


        var dataJson = JSON.stringify(data);
        formData.append("dataJson", dataJson);

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
                $scope.loadProducts();
                $scope.resetForm();
                Swal.fire({
                    icon: "success",
                    title: "Thành công",
                    text: `Thêm sản phẩm ${data.product.productId} thành công `,
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
                        text: `Thêm sản phẩm ${data.product.productId} thất bại `,
                    });
                }
            });

    };


    $scope.addNewAttribute = function () {
        // Thêm một cặp mới vào mảng attributeValues
        $scope.editingProduct.attributeValues.push({
            attribute: null, // Thiết lập giá trị mặc định là null
            value: ''
        });
    };



    $scope.updateProduct = function () {
        var formData = new FormData();
        var fileInput = document.getElementById("fileInput");

        // Lưu hình ảnh sản phẩm
        if (fileInput && fileInput.files.length > 0) {
            formData.append("image", fileInput.files[0]);
        }

        // Lưu nhiều hình ảnh sản phẩm
        for (var i = 0; i < $scope.editingProduct.productImages.length; i++) {
            var image = $scope.editingProduct.productImages[i];
            if (!image.deleted) {
                // Nếu ảnh không bị xóa, thì mới thêm vào formData
                formData.append("file", image.file);
            }
        }

        // Hiển thị hiệu ứng loading
        var loadingOverlay = document.getElementById("loadingOverlay");
        loadingOverlay.style.display = "block";

        var data = {
            product: $scope.editingProduct.product,
            category: $scope.editingProduct.productCategory.category,
            author: $scope.editingProduct.bookAuthor ? $scope.editingProduct.bookAuthor.author : null,
            productDetail: $scope.editingProduct.productDetail,
            attributeValues: $scope.editingProduct.attributeValues,
        };

        console.log(data);

        var dataJson = JSON.stringify(data);
        formData.append("dataJson", dataJson);

        var url = `${host}/${$scope.editingProduct.product.productId}`;
        $http.put(url, formData, {
            transformRequest: angular.identity,
            headers: {
                "Content-Type": undefined,
            },
        })
            .then((resp) => {
                // Cập nhật ảnh trong mảng, bỏ qua những ảnh đã bị xóa
                $scope.editingProduct.productImages = $scope.editingProduct.productImages.filter(function (image) {
                    return !image.deleted;
                });
                // Ẩn hiệu ứng loading khi lưu thành công
                loadingOverlay.style.display = "none";

                $scope.loadProducts();
                $scope.resetForm();
                Swal.fire({
                    icon: "success",
                    title: "Thành công",
                    text: `Cập nhật sản phẩm ${data.product.productId} thành công `,
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
                        text: `Cập nhật sản phẩm ${data.product.productId} thất bại `,
                    });
                }
            });
    };

    $scope.onCategoryChange = function () {
        // Lấy typeID của danh mục được chọn
        var selectedCategoryId = $scope.productCategory.category.categoryId;

        // Tìm danh mục tương ứng để lấy typeID
        var selectedCategory = $scope.categories.find(function (category) {
            return category.categoryId === selectedCategoryId;
        });

        // Kiểm tra nếu typeID của danh mục được chọn là 1, 2, 3, 4, hoặc 5 (sách)
        if (selectedCategory && selectedCategory.typeId && (selectedCategory.typeId.typeId === "1" || selectedCategory.typeId.typeId === "2" || selectedCategory.typeId.typeId === "3" || selectedCategory.typeId.typeId === "4" || selectedCategory.typeId.typeId === "5" || selectedCategory.typeId.typeId === "12")) {
            $scope.showAuthorSelect = true; // Hiển thị form chọn tên tác giả
        } else {
            $scope.showAuthorSelect = false; // Ẩn form chọn tên tác giả
        }

    };


    $scope.onCategoryChanged = function () {
        // Lấy typeID của danh mục được chọn
        var selectedCategoryId = $scope.editingProduct.productCategory.category.categoryId;

        // Tìm danh mục tương ứng để lấy typeID
        var selectedCategory = $scope.categories.find(function (category) {
            return category.categoryId === selectedCategoryId;
        });

        // Kiểm tra nếu typeID của danh mục được chọn là 1, 2, 3, 4, hoặc 5 (sách)
        if (selectedCategory && selectedCategory.typeId && (selectedCategory.typeId.typeId === "1" || selectedCategory.typeId.typeId === "2" || selectedCategory.typeId.typeId === "3" || selectedCategory.typeId.typeId === "4" || selectedCategory.typeId.typeId === "5" || selectedCategory.typeId.typeId === "12")) {
            $scope.showAuthorSelected = true; // Hiển thị form chọn tên tác giả
        } else {
            $scope.showAuthorSelected = false; // Ẩn form chọn tên tác giả
        } yy
    };


    $scope.openAddAuthorModal = function () {
        $scope.editingAuthor = {};
    }
    $scope.saveAuthor = function (authorId) {
        var formData = new FormData();
        var fileInput = document.getElementById("fileInput");

        if (fileInput && fileInput.files.length > 0) {
            formData.append("image", fileInput.files[0]);
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

        var url = "http://localhost:8081/rest/authors";
        $http
            .post(url, formData, {
                transformRequest: angular.identity,
                headers: {
                    "Content-Type": undefined,
                },
            })
            .then((resp) => {
                // Thêm tác giả vào danh sách hiện có
                $scope.authors.push({
                    authorId: $scope.editingAuthor.authorId,
                    authorName: $scope.editingAuthor.authorName,
                    gender: $scope.editingAuthor.gender || false,
                    nation: $scope.editingAuthor.nation || "",
                    image: resp.data.image || "", // Sử dụng ảnh từ phản hồi của server (nếu có)
                });

                // Đặt tên tác giả mới thêm vào combobox
                $scope.bookAuthor.author = $scope.editingAuthor.authorName;

                Swal.fire({
                    icon: "success",
                    title: "Thành công",
                    text: `Thêm tác giả ${authorId} thành công `,
                });
            })
            .catch((error) => {
                console.log(error.data);
                if (error.data) {
                    Swal.fire({
                        icon: "error",
                        title: "Thất bại",
                        text: `Thêm tác giả ${authorId} thất bại `,
                    });
                }
            });
    };



    $scope.calculateDiscountedPrice = function (item) {
        // Kiểm tra nếu item.productDetail tồn tại và có thuộc tính 'price'
        if (item.productDetail && item.productDetail.price) {
            // Kiểm tra nếu item.productDiscount tồn tại và có thuộc tính 'discount'
            if (item.productDiscount && item.productDiscount.discount) {
                // Kiểm tra nếu thuộc tính 'startDate' và 'endDate' tồn tại
                if (item.productDiscount.discount.startDate && item.productDiscount.discount.endDate) {
                    // Lấy ngày hiện tại
                    var currentDate = new Date();

                    // Kiểm tra nếu startDate nhỏ hơn ngày hiện tại và endDate lớn hơn ngày hiện tại
                    if (new Date(item.productDiscount.discount.startDate) <= currentDate &&
                        new Date(item.productDiscount.discount.endDate) > currentDate) {
                        // Nếu còn hiệu lực, giảm giá sẽ được áp dụng
                        var discountedPrice = item.productDetail.price - (item.productDetail.price * (item.productDiscount.discount.value / 100));
                        return $filter("number")(discountedPrice) + " VND";
                    } else {
                        // Nếu không còn hiệu lực, giá giảm trở thành giá ban đầu
                        item.productDiscount.discount.value = 0;
                        return item.productDetail.priceDiscount = 0;
                    }
                } else {
                    // Xử lý nếu startDate hoặc endDate là null
                    return item.productDetail.priceDiscount = 0;
                }
            } else {
                // Xử lý nếu item.productDiscount hoặc item.productDiscount.discount là null
                // Có thể trả về giá gốc hoặc giá có sự giảm giá (tùy thuộc vào yêu cầu của bạn)
                return item.productDetail.priceDiscount = 0;
            }
        } else {
            // Xử lý nếu item.productDetail hoặc item.productDetail.price là null
            // Có thể trả về giá gốc hoặc giá có sự giảm giá (tùy thuộc vào yêu cầu của bạn)
            return "Price not available";
        }
    };





    $scope.toggleProductStatus = function (productId, isCurrentlyActive) {
        if (!isCurrentlyActive) {
            // Nếu sản phẩm không đang kinh doanh, vẫn gọi API để chuyển sang đang kinh doanh
            var url = `${host}/${productId}/toggleStatus`;
            $http.patch(url)
                .then((resp) => {
                    // Xử lý phản hồi thành công nếu cần
                    console.log('Product status updated successfully.');
                    $scope.loadProducts();
                    $scope.clearImage();
                    Swal.fire({
                        icon: "success",
                        title: "Thành công",
                        text: `Bắt đầu kinh doanh sản phẩm ${productId} thành công`,
                    });
                })
                .catch((error) => {
                    console.error('Error updating product status:', error.data);
                    if (error.data) {
                        Swal.fire({
                            icon: "error",
                            title: "Thất bại",
                            text: `Cập nhật trạng thái sản phẩm thất bại `,
                        });
                    }
                });
            return;
        }

        // Nếu sản phẩm đang kinh doanh, hiển thị thông báo xác nhận
        Swal.fire({
            title: "Ngừng kinh doanh sản phẩm?",
            text: `Bạn muốn ngừng kinh doanh sản phẩm mã ${productId} trên hệ thống?\n\nLưu ý:\n- Thông tin tồn kho và lịch sử giao dịch vẫn được giữ.`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Có",
            cancelButtonText: "Không",
        }).then((result) => {
            if (result.isConfirmed) {
                var url = `${host}/${productId}/toggleStatus`;
                $http.patch(url)
                    .then((resp) => {
                        // Xử lý phản hồi thành công nếu cần
                        console.log('Product status updated successfully.');
                        $scope.loadProducts();
                        $scope.clearImage();
                        Swal.fire({
                            icon: "success",
                            title: "Thành công",
                            text: `Ngừng kinh doanh sản phẩm ${productId} thành công`,
                        });
                    })
                    .catch((error) => {
                        console.error('Error updating product status:', error.data);
                        if (error.data) {
                            Swal.fire({
                                icon: "error",
                                title: "Thất bại",
                                text: `Cập nhật trạng thái sản phẩm thất bại `,
                            });
                        }
                    });
            }
        });
    };


    // Trong controller AngularJS của bạn
    $scope.deleteProduct = function (productId) {
        Swal.fire({
            title: "Xóa Hàng Hóa?",
            text: "Hệ thống sẽ xóa hoàn toàn sản phẩm " + productId + "  nhưng vẫn giữ thông tin trong các giao dịch lịch sử nếu có. Bạn có chắc chắn muốn xóa?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Có",
            cancelButtonText: "Không",
        }).then((result) => {
            if (result.isConfirmed) {
                var url = `${host}/${productId}`;
                $http.delete(url)
                    .then((resp) => {
                        // Xử lý phản hồi thành công nếu cần
                        console.log('Product soft-deleted successfully.');
                        $scope.loadProducts();
                        $scope.clearImage();
                        Swal.fire({
                            icon: "success",
                            title: "Thành công",
                            text: `Xóa mềm sản phẩm ${productId} thành công`,
                        });
                    })
                    .catch((error) => {
                        console.error('Error soft-deleting product:', error.data);
                        if (error.data) {
                            Swal.fire({
                                icon: "error",
                                title: "Thất bại",
                                text: `Xóa mềm sản phẩm ${productId} thất bại`,
                            });
                        }
                    });
            }
        });
    };


    // Hàm tạo id ngẫu nhiên với "AU00" và 3 số ngẫu nhiên
    function generateRandomId() {
        let result = "PR32";
        for (let i = 0; i < 3; i++) {
            result += Math.floor(Math.random() * 10); // Số ngẫu nhiên từ 0 đến 9
        }
        return result;
    }


    $scope.showImage = function (imageUrl, item) {
        // Chắc chắn rằng item và productDetail đã được định nghĩa trước khi truy cập
        if (item.productDetail) {
            // Hiển thị hình ảnh từ productImages lên ảnh chính
            item.productDetail.image = imageUrl;
        }
    };


    $scope.removeAttribute = function (index) {
        // Đặt thuộc tính "deleted" cho giá trị thuộc tính
        $scope.editingProduct.attributeValues[index].value = null; // hoặc gán bằng giá trị mặc định khác

    };


    $scope.checkErrors = function () {
        $scope.errors = {};
        $scope.attributeErrors = [];
        if (!$scope.product.productName) {
            $scope.errors.productName = 'Vui lòng nhập tên sản phẩm.';
        }

        if (!$scope.product.brand) {
            $scope.errors.brandName = 'Vui lòng chọn thương hiệu.';
        }

        if (!$scope.productCategory) {
        }


        if (!$scope.product.manufactureDate) {
            $scope.errors.manufactureDate = 'Vui lòng chọn ngày sản xuất.';
        }

        if (!$scope.productDetail) {
            $scope.errors.width = 'Vui lòng nhập chiều rộng sản phẩm.';
        }
        if (!$scope.productDetail) {
            $scope.errors.height = 'Vui lòng nhập chiều cao sản phẩm.';
        }
        if (!$scope.productDetail) {
            $scope.errors.length = 'Vui lòng nhập chiều dài sản phẩm.';
        }

        if (!$scope.productDetail) {
            $scope.errors.price = 'Vui lòng nhập giá sản phẩm.';
        }

        if (!$scope.productDetail) {
            $scope.errors.quantityInStock = 'Vui lòng nhập số lượng.';
        }

        if (!$scope.productDetail) {
            $scope.errors.weight = 'Vui lòng nhập khối lượng.';
        }

        for (var i = 0; i < $scope.productAttributes.length; i++) {
            var attributeError = {};
            if (!$scope.productAttributes[i].value && $scope.productAttributes[i].isSelected) {
                attributeError.value = 'Vui lòng nhập giá trị thuộc tính.';
            }

            $scope.attributeErrors.push(attributeError);
        }
        var hasErrors = Object.keys($scope.errors).length > 0;

        return !hasErrors;
    };


    $scope.hideError = function (productName) {
        // Ẩn thông báo lỗi cho trường fieldName
        $scope.errors[productName] = '';

    };
    $scope.hideError = function (brandName) {
        // Ẩn thông báo lỗi cho trường fieldName
        $scope.errors[brandName] = '';

    };



    $scope.hideError = function (price) {
        // Ẩn thông báo lỗi cho trường fieldName
        $scope.errors[price] = '';

    };

    $scope.hideError = function (quantityInStock) {
        // Ẩn thông báo lỗi cho trường fieldName
        $scope.errors[quantityInStock] = '';

    };

    $scope.hideError = function (weight) {
        // Ẩn thông báo lỗi cho trường fieldName
        $scope.errors[weight] = '';

    };
    $scope.hideError = function (width) {
        // Ẩn thông báo lỗi cho trường fieldName
        $scope.errors[width] = '';

    };
    $scope.hideError = function (height) {
        // Ẩn thông báo lỗi cho trường fieldName
        $scope.errors[height] = '';

    };
    $scope.hideError = function (length) {
        // Ẩn thông báo lỗi cho trường fieldName
        $scope.errors[length] = '';

    };


    $scope.hideAttributeError = function (index) {
        // Kiểm tra xem productAttributes có tồn tại không
        if ($scope.productAttributes && $scope.productAttributes[index]) {
            // Kiểm tra xem productAttributes[index] có thuộc tính isSelected không
            if ($scope.productAttributes[index].isSelected) {
                // Tiếp tục xử lý hoặc trả về giá trị tùy thuộc vào logic của bạn
            }
        }
    };


    $scope.$watch('searchText', function (newVal, oldVal) {
        if (newVal !== oldVal) {
            $scope.loadProducts();
        }

    });
    $scope.sortBy = function (field) {
        if ($scope.orderByField === field) {
            $scope.reverseSort = !$scope.reverseSort;
        } else {
            $scope.orderByField = field;
            $scope.reverseSort = true;
        }
    };



    $scope.editProduct = function (productId, index) {
        // Tìm sản phẩm cụ thể trong mảng $scope.combinedData dựa trên productId
        var productToEdit = $scope.combinedData.find(function (product) {
            return product.product.productId === productId;
        });
        $scope.selectedItemIndex = index; // Lưu chỉ số sản phẩm đang được chỉnh sửa

        if (productToEdit) {
            // Gán giá trị của sản phẩm được chọn vào biến editingProduct
            $scope.editingProduct = angular.copy(productToEdit);
            $scope.editingProduct.product.manufactureDate = new Date(
                $scope.editingProduct.product.manufactureDate
            ); // Chuyển đổi thành kiểu ngày
            $scope.isEditing = true; // Đặt cờ chỉnh sửa
        }
    };


    $scope.clearImage = function () {
        $scope.productDetail =
            "/admin/assets/images/default.jpg";
        var imageElement = document.getElementById("uploadedImage");
        imageElement.src =
            "/admin/assets/images/default.jpg";
        var fileInput = document.getElementById("fileInput");
        fileInput.value = null; // Đặt giá trị của input file thành null để xóa tệp đã chọn
    };


    $scope.resetForm = function () {
        $scope.editingProduct = {};
        $scope.isEditing = false;
        $scope.product = {
            createAt: new Date(),
            description: "" // Đặt mô tả về giá trị mặc định hoặc rỗng
        };
        $scope.clearImage();
        $scope.productDetail = {};
        $scope.productCategory = {};

        $scope.bookAuthor = {},
            // Reset các giá trị khác cần thiết
            $scope.selectedImages = [];
        $scope.productAttributes.forEach(function (attribute) {
            attribute.value = null;
        });
    };

    $scope.selectedImages = [];
    // Hàm xử lý khi người dùng chọn nhiều ảnh
    // Hàm xử lý khi người dùng chọn nhiều ảnh
    $scope.onImageSelect = function (event) {
        var files = event.target.files;
        for (var i = 0; i < files.length; i++) {
            var file = files[i];

            // Kiểm tra nếu là tệp hình ảnh
            if (isImageFile(file)) {
                var imageUrl = URL.createObjectURL(file);
                if ($scope.selectedImages.length < 5) {
                    $scope.$apply(function () {
                        $scope.selectedImages.push({ file: file, image: imageUrl });
                    });
                } else {
                    // Hiển thị thông báo nếu đã chọn đủ 5 ảnh
                    Swal.fire({
                        icon: "error",
                        title: "Thất bại",
                        text: "Chỉ được chọn tối đa 5 ảnh.",
                    });
                    break;
                }
            } else {
                // Nếu không phải là hình ảnh, hiển thị thông báo lỗi bằng Swal
                Swal.fire({
                    icon: "error",
                    title: "Lỗi",
                    text: "Chỉ cho phép tải lên các file hình ảnh (png, jpg, jpeg).",
                });
                // Đặt giá trị của input file về null để người dùng có thể chọn lại một tệp khác.
                event.target.value = null;
                break;
            }
        }
        console.log(files);
    };


    // Hàm xử lý khi người dùng xóa một ảnh
    $scope.deleteImage = function (index) {
        // Loại bỏ ảnh khỏi mảng selectedImages
        $scope.selectedImages.splice(index, 1);
    };

    $scope.deleteAttribute = function (index) {
        // Kiểm tra xem `index` có nằm trong phạm vi của mảng `productAttributes` không
        if (index >= 0 && index < $scope.productAttributes.length) {
            // Gán tên thuộc tính và giá trị thuộc tính tại vị trí `index` thành null hoặc giá trị mặc định
            $scope.productAttributes[index].value = null; // hoặc gán bằng giá trị mặc định khác
        }
    };


    $scope.deleteImageInEdit = function (index) {
        var imageIdToDelete = $scope.editingProduct.productImages[index].id; // Thay đổi id thành trường id thực tế của ảnh trong đối tượng
        let host1 = "http://localhost:8081/rest/productImages";
        // Gọi API xóa ảnh
        $http.delete(`${host1}/images/${imageIdToDelete}`)
            .then((resp) => {
                // Xóa ảnh khỏi mảng nhưng giữ nguyên id
                $scope.editingProduct.productImages[index].deleted = true;
                $scope.editingProduct.productImages.splice(index, 1);
                Swal.fire({
                    icon: "success",
                    title: "Thành công",
                    text: `Xóa ảnh thành công`,
                });
            })
            .catch((error) => {
                console.log(error.data);
                Swal.fire({
                    icon: "error",
                    title: "Thất bại",
                    text: `Xóa ảnh thất bại`,
                });
            });
    };

    $scope.onEditImageSelect = function (event) {
        var files = event.target.files;
        for (var i = 0; i < files.length; i++) {
            var file = files[i];
            var imageUrl = URL.createObjectURL(file);
            if ($scope.editingProduct.productImages.length < 5) {
                $scope.$apply(function () {
                    $scope.editingProduct.productImages.push({ file: file, image: imageUrl });
                });
            } else {
                // Hiển thị thông báo nếu đã chọn đủ 5 ảnh
                Swal.fire({
                    icon: "error",
                    title: "Thất bại",
                    text: "Chỉ được chọn tối đa 5 ảnh.",
                });
                break;
            }
        }
        console.log(files);
    };



    $scope.loadProducts();
}
);

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
