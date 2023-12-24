app.controller("productPageController", productPageController);

function productPageController($http, $scope, productPageAPI, WebSocketService) {
    const host = productPageAPI;

    //Phân trang
    $scope.currentPage = 1;
    // DECLARE SCOPE GET DATA - START

    $scope.listProductDetail = [];
    $scope.listCategoryTypes = [];
    $scope.listCategories = [];
    $scope.listBookAuthor = [];
    $scope.listProductDiscount = [];
    $scope.listProductReviews = [];
    $scope.listBrands = [];
    $scope.listProductImages = [];

    // DECLARE SCOPE GET DATA - END

    // DECLARE SCOPE FOR UI - START
    $scope.numStar = [1, 2, 3, 4, 5];
    $scope.quickViewProduct = null;
    $scope.listImageQuickView = [];
    // pagination - START
    $scope.currentPage = 1;
    $scope.totalItems = 0;
    $scope.maxSize = 5;
    $scope.itemsPerPage = 12;
    // pagination - END

    // DECLARE SCOPE FOR UI - END
    //=================================
    // SCOPE_FUNCTION GET DATA - START

    $scope.getDataProductDetail = function () {

        var url = host + "/product-show";
        var params = {};

        if ($scope.selectedCategoryId != null) {
            {
                params.categoryId = $scope.selectedCategoryId;

            }
        }
        if ($scope.selectedCategoryId) {
            params.categoryId = $scope.selectedCategoryId;
        }

        if ($scope.selectedBrand) {
            params.brandId = $scope.selectedBrand;
        }

        // Tạo một mảng để lưu các khoảng giá đã được chọn
        var selectedPriceRanges = [];
        for (var priceRange in $scope.priceSelection) {
            if ($scope.priceSelection[priceRange]) {
                if (priceRange === 'gia1') {
                    selectedPriceRanges.push({ min: 0, max: 100000 });
                } else if (priceRange === 'gia2') {
                    selectedPriceRanges.push({ min: 100000, max: 200000 });
                } else if (priceRange === 'gia3') {
                    selectedPriceRanges.push({ min: 200000, max: 500000 });
                } else if (priceRange === 'gia4') {
                    selectedPriceRanges.push({ min: 500000, max: 700000 });
                } else if (priceRange === 'gia5') {
                    selectedPriceRanges.push({ min: 700000, max: Number.MAX_VALUE });
                }
            }
        }
        if (selectedPriceRanges.length > 0) {
            // Nếu có ít nhất một khoảng giá được chọn, sử dụng chúng để lọc dữ liệu
            params.priceRanges = JSON.stringify(selectedPriceRanges); // Gửi danh sách các khoảng giá đã chọn dưới dạng chuỗi JSON
        }

        // Truy vấn API để lấy dữ liệu
        $http.get(url, { params: params }).then(response => {
            // $scope.listProductDetail = response.data.listProductDetail;
            $scope.listCategoryTypes = response.data.listCategoryTypes;
            $scope.listCategories = response.data.listCategories;
            $scope.listBookAuthor = response.data.listBookAuthor;
            $scope.listProductDiscount = response.data.listProductDiscount;
            $scope.listProductReviews = response.data.listProductReviews;
            $scope.listBrands = response.data.listBrands;
            $scope.listProductImages = response.data.listProductImages;
            $scope.listImportInvoiceDetail = response.data.listImportInvoiceDetail;
            $scope.listInvoiceDetails = response.data.listInvoiceDetails;
            var allProducts = response.data.listProductDetail
                .filter(function (productDetail) {
                    return productDetail.product.status === true;
                });
            // $scope.filteredProducts =  allProducts;
            if (localStorage.getItem("keyword")) {
                var keyword = localStorage.getItem("keyword");
                console.log(keyword);
                keyword = keyword.toLowerCase();
                allProducts.forEach(function (productD) {
                    if (productD.product.productName.toLowerCase().includes(keyword)) {
                        $scope.listProductDetail.push(productD);
                    }
                });
                console.log("$scope.listProductDetail,", $scope.listProductDetail);
            } else if (selectedPriceRanges.length > 0) {
                // Nếu có khoảng giá được chọn, lọc danh sách theo nó
                $scope.listProductDetail = allProducts.filter(product => {
                    var price = product.priceDiscount;
                    for (var i = 0; i < selectedPriceRanges.length; i++) {
                        var range = selectedPriceRanges[i];
                        if (price >= range.min && price <= range.max) {
                            return true;
                        }
                    }
                    return false;
                });
            } else {
                // Nếu không có khoảng giá được chọn, sắp xếp theo 'newest'
                $scope.listProductDetail = allProducts.slice(); // Tạo một bản sao của danh sách
                $scope.listProductDetail.sort((a, b) => {
                    const createDateA = $scope.getNearestImportInvoiceCreateDate(a.productDetailId);
                    const createDateB = $scope.getNearestImportInvoiceCreateDate(b.productDetailId);
                    return createDateB - createDateA;
                });
            }

            $scope.totalItems = $scope.listProductDetail.length;
            if (localStorage.getItem("categoryId")) {
                localStorage.removeItem("categoryId");
            }
            if (localStorage.getItem("categoryName")) {
                localStorage.removeItem("categoryName");
            }
        }).catch(function (error) {
            console.error("Lỗi call API: ", error);
        });
    };

    //LỌC THEO GIÁ
    $scope.priceSelection = {
        gia1: false,
        gia2: false,
        gia3: false,
        gia4: false,
        gia5: false
    };
    //LỌC THEO GIÁ
    $scope.togglePriceSelection = function (selectedPrice) {
        if ($scope.priceSelection[selectedPrice]) {
            // Nếu đã chọn khoảng giá này và bấm lại, hãy bỏ chọn nó
            $scope.priceSelection[selectedPrice] = false;
        } else {
            // Nếu chưa chọn khoảng giá này, hãy chọn nó và bỏ chọn tất cả các khoảng giá khác
            for (var priceRange in $scope.priceSelection) {
                $scope.priceSelection[priceRange] = false;
            }
            $scope.priceSelection[selectedPrice] = true;
        }

        // Kiểm tra nếu không có khoảng giá nào được chọn, hãy gọi hàm để cập nhật danh sách sản phẩm
        var noPriceRangeSelected = true;
        for (var priceRange in $scope.priceSelection) {
            if ($scope.priceSelection[priceRange]) {
                noPriceRangeSelected = false;
                break;
            }
        }

        if (noPriceRangeSelected) {
            $scope.getDataProductDetail(); // Gọi lại hàm lấy dữ liệu để trở về trạng thái ban đầu
        } else {
            // Nếu có ít nhất một khoảng giá được chọn, gọi hàm để cập nhật danh sách sản phẩm dựa trên lựa chọn
            $scope.getDataProductDetail();
        }
    };

    //LỌC THEO BRAND
    // Thêm biến selectedBrand vào AngularJS Controller của bạn
    $scope.selectedBrand = null;

    // Hàm xử lý khi nhấn vào checkbox thương hiệu
    $scope.toggleBrandSelection = function (brandId) {
        // Nếu bạn đang chọn thương hiệu đã được chọn, hãy bỏ chọn nó
        if ($scope.selectedBrand === brandId) {
            $scope.selectedBrand = null;
        } else {
            // Nếu bạn đang chọn thương hiệu khác, hãy chọn nó
            $scope.selectedBrand = brandId;
        }

        // Sau khi thay đổi biến selectedBrand, gọi hàm để cập nhật danh sách sản phẩm
        $scope.getDataProductDetail();
    };


    //LỌC THEO LOẠI SẢN PHẨM
    $scope.selectedCategoryId = null;
    $scope.selectedCategoryName = null;

    $scope.selectCategory = function (categoryId, categoryName) {
        $scope.selectedCategoryId = categoryId;
        $scope.selectedCategoryName = categoryName;
        if (categoryId === null) {
            $scope.selectedCategoryId = null;
            $scope.selectedCategoryName = null;
        }

        $scope.getDataProductDetail();
    };

    $scope.changeItemsPerPage = function () {
        console.log("Đã gọi hàm changeItemsPerPage");
        // Cập nhật số lượng phần tử mỗi trang
        $scope.currentPage = 1; // Đặt lại trang về trang đầu
        $scope.getDataProductDetail(); // Gọi lại hàm lấy dữ liệu để cập nhật danh sách sản phẩm với itemsPerPage mới
    };

    //Ngày nhập mới nhất
    $scope.getNearestImportInvoiceCreateDate = function (productDetailId) {
        let nearestCreateDate = null;
        for (const detail of $scope.listImportInvoiceDetail) {
            if (detail.productDetail.productDetailId === productDetailId) {
                const createDate = new Date(detail.importInvoice.createDate);
                if (!nearestCreateDate || createDate > nearestCreateDate) {
                    nearestCreateDate = createDate;
                }
            }
        }
        return nearestCreateDate;
    }
    //Đếm số lượt mua nhiều nhất
    $scope.countSoldQuantity = function (productDetailId) {
        var totalQuantity = $scope.listInvoiceDetails.reduce(function (sum, item) {
            if (item.productDetail.productDetailId === productDetailId) {
                return sum + item.quantity;
            }
            return sum;
        }, 0);
        return totalQuantity;
    };

    //sort
    $scope.sortBy = 'newest'; // Mặc định sắp xếp theo 'Mới nhất'

    $scope.onSortChange = function () {
        if ($scope.sortBy === 'newest') {
            $scope.listProductDetail.sort((a, b) => {
                const createDateA = $scope.getNearestImportInvoiceCreateDate(a.productDetailId);
                const createDateB = $scope.getNearestImportInvoiceCreateDate(b.productDetailId);
                return createDateB - createDateA;
            });
        } else if ($scope.sortBy === 'bestSelling') {
            $scope.listProductDetail.sort((a, b) => {
                const quantityA = $scope.countSoldQuantity(a.productDetailId);
                const quantityB = $scope.countSoldQuantity(b.productDetailId);
                return quantityB - quantityA;
            });
        } else if ($scope.sortBy === 'lowestPrice') {
            $scope.listProductDetail.sort((a, b) => a.priceDiscount - b.priceDiscount);
        } else if ($scope.sortBy === 'highestPrice') {
            $scope.listProductDetail.sort((a, b) => b.priceDiscount - a.priceDiscount);
        }
    };

    // SCOPE_FUNCTION GET DATA - END
    //===========================
    // SCOPE_FUNCTION GET DATA WITH PARAMETERS - START

    // RETURN SINGLE DATA - START

    $scope.getAuthorNameByProductId = function (id) {
        var bookAuthor = $scope.listBookAuthor.find(e => e.product.productId === id);

        // Kiểm tra xem bookAuthor và author có tồn tại không trước khi truy cập thuộc tính
        if (bookAuthor && bookAuthor.author) {
            return bookAuthor.author.authorName;
        } else {
            return '';
        }
    }

    $scope.getDiscountValueByProductId = function (id) {
        var discountValue = null;
        $scope.listProductDiscount.find(e => {
            if (e.productDetail.productDetailId === id) {
                discountValue = e.discount.value
            }
        });
        return discountValue ? discountValue : 0;
    }

    // RETURN SINGLE DATA - END
    //  RETURN LIST DATA - START

    $scope.getListCateByCateTypeId = function (typeId) {
        return $scope.listCategories.filter(category => category.typeId.typeId === typeId);
    }

    $scope.getListImagesByProductDetailId = function (productDetailId) {
        return $scope.listProductImages.filter(pi => pi.productDetail.productDetailId === productDetailId);
    }

    // RETURN LIST DATA - END
    // SCOPE_FUNCTION GET DATA WITH PARAMETERS - END

    // SCOPE_FUNCTION FOR UI - START

    // đếm số bài review của sản phẩm
    $scope.countReviewsOfProduct = function (productId) {
        var totalReviews = 0;
        $scope.listProductReviews.forEach(review => {
            if (review.productDetail.productDetailId === productId) {
                totalReviews++;
            }
        })
        return totalReviews;
    }

    // tính số sao vote của sản phẩm
    $scope.getStarRatingByProductId = function (productDetailId) {
        var totalStars = 0;
        var totalReviews = 0;

        $scope.listProductReviews.forEach(review => {
            if (review.productDetail.productDetailId === productDetailId) {
                totalStars += review.star;
                totalReviews++;
            }
        });
        if (totalReviews > 0) {
            var averageRating = totalStars / totalReviews;
            return Math.round(averageRating);
        } else {
            return 0;
        }
    }

    // xem nhanh thông tin sản phẩm
    $scope.quickView = function (productDetail) {
        $scope.quickViewProduct = productDetail;
        $scope.listImageQuickView = $scope.getListImagesByProductDetailId($scope.quickViewProduct.productDetailId);
        console.log($scope.listImageQuickView);
        $scope.quantityQuickViewProduct = 1;
    }


    // PAGINATION - START
    // hiển thị đang xem sản phẩm thứ bao nhiêu trong danh sách
    $scope.calculateRange = function () {
        var startIndex = ($scope.currentPage - 1) * $scope.itemsPerPage + 1;
        var endIndex = $scope.currentPage * $scope.itemsPerPage;

        if (endIndex > $scope.totalItems) {
            endIndex = $scope.totalItems;
        }

        return startIndex + ' đến ' + endIndex + ' trên tổng số ' + $scope.totalItems + ' mục';
    };

    // Hàm chuyển đổi trang
    $scope.setPage = function (pageNo) {
        $scope.currentPage = pageNo;
    };

    // PAGINATION - END
    // SCOPE_FUNCTION FOR UI - END
    //Mở đóng Collapse
    $scope.collapsedTypes = {}; // Đối tượng để theo dõi trạng thái của các loại sản phẩm

    $scope.toggleCollapse = function (typeId) {
        $scope.collapsedTypes[typeId] = !$scope.collapsedTypes[typeId];
    };

    $scope.isCollapsed = function (typeId) {
        return $scope.collapsedTypes[typeId];
    };
    // Xem thêm Câtegory
    $scope.numViewNormalCategories = 5;
    $scope.viewMoreNormalCategories = function () {
        $scope.numViewNormalCategories = $scope.listCategoryTypes.length;
    }
    $scope.viewLessNormalCategories = function () {
        $scope.numViewNormalCategories = 5;
    }
    // End Xem thêm category
    // Xem thêm BRands
    $scope.numViewNormalBrands = 5;
    $scope.viewMoreNormalBrands = function () {
        $scope.numViewNormalBrands = $scope.listBrands.length;
    }
    $scope.viewLessNormalBrands = function () {
        $scope.numViewNormalBrands = 5;
    }
    // END Xem thêm BRands
    $scope.init = function () {
        var categoryId = null;
        var categoryName = null;
        if (localStorage.getItem("categoryId")) {
            categoryId = localStorage.getItem("categoryId");
        }
        if (localStorage.getItem("categoryName")) {
            categoryName = localStorage.getItem("categoryName");
        }
        if (categoryId !== null && categoryName !== null) {
            $scope.selectCategory(categoryId, categoryName);
        } else {
            $scope.getDataProductDetail();
        }
    }
    $scope.isWebSocketConnected = false;

    $scope.connectWebSocket = function () {
        WebSocketService.connect(function () {
            $scope.isWebSocketConnected = true;

            // Đăng ký cho đường dẫn /topic/products (ví dụ)
            WebSocketService.subscribeToTopic('/topic/products', function (message) {
                console.log("Received Product Update:", message);
                $scope.init();
            });
        });
    }

    // Gọi hàm connectWebSocket khi controller được khởi tạo
    $scope.connectWebSocket();

    $scope.init();
}

