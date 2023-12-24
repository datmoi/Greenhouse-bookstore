app.controller("productDetailController", function ($scope, $timeout, $routeParams, $http, jwtHelper, ProductDetailService, WebSocketService) {
    let host = "http://localhost:8081/customer/rest/product-detail";
    var token = localStorage.getItem('token');
    // Trong trang product-details
    var params = new URLSearchParams(location.search);
    var productDetailId = params.get('id');
    if (token) {
        var decodedToken = jwtHelper.decodeToken(token);
        $scope.username = decodedToken.sub;
        console.log($scope.username);
        $scope.isCustomer = false; // Mặc định không phải là khách hàng
        $scope.roles = decodedToken.roles;
        $scope.isCustomer = $scope.roles.some(function (role) {
            return role.authority === "ROLE_CUSTOMER";
        });

        $scope.isAdmin = $scope.roles.some(function (role) {
            return role.authority === "ROLE_ADMIN";
        });
        console.log($scope.roles);
        ProductDetailService.hasPurchasedProduct($scope.username, productDetailId)
            .then(function (response) {
                $scope.hasPurchased = response.hasPurchased;
                $scope.hasUserReviewed = response.hasUserReviewed;
                console.log("$scope.hasUserReviewed", $scope.hasUserReviewed);

                console.log($scope.hasPurchased);
            })
            .catch(function (error) {
                console.log('Lỗi khi kiểm tra mua sản phẩm:', error);
            });
    }

    //Phân trang
    $scope.currentPage = 1;
    $scope.modalContent = "";
    // Khởi tạo hàm scope
    $scope.quickViewProduct = null;
    $scope.authenticPhotosForReview = {};
    $scope.productReviews = [];
    $scope.productDetail = [];
    $scope.productImages = [];
    $scope.productDiscounts = [];
    $scope.listProductDiscounts = [];
    $scope.listProductReviews = [];
    $scope.listAttributeValues = [];
    $scope.listBookAuthor = [];
    $scope.getProductDetail = function () {
        ProductDetailService.getProductDetailById(productDetailId)
            .then(function (response) {
                var productDetail = response.data.productDetail;
                productDetail.quantity = 1;
                $scope.productDetail = productDetail;
                $scope.productImages = response.data.productImages;
                $scope.productReviews = response.data.productReviews;
                $scope.productDiscounts = response.data.productDiscounts;
                $scope.relatedProducts = response.data.relatedProducts;
                $scope.listProductDiscounts = response.data.listProductDiscounts;
                $scope.listProductReviews = response.data.listProductReviews;
                $scope.listAttributeValues = response.data.listAttributeValues;
                $scope.listBookAuthor = response.data.listBookAuthor;
                console.log('Dữ liệu Discount trả về', response.data.listBookAuthor)
                console.log('Dữ liệu Discount trả về', $scope.productDiscounts)
                console.log('Dữ liệu Sản Phẩm đã được trả về:', $scope.productDetail);
                console.log('Dữ liệu Hình ảnh đã được trả về:', $scope.productImages);
                console.log('Dữ liệu SP TƯƠNG TỰ đã được trả về:', $scope.relatedProducts);
                // console.log("Danh sách đánh giá sản phẩm: ", $scope.productReviews);
                $scope.productReviews.sort(function (a, b) {
                    // Sắp xếp theo ngày giảm dần (mới nhất đầu tiên)
                    return new Date(b.date) - new Date(a.date);
                });
                angular.forEach($scope.productReviews, function (review) {
                    $scope.getAuthenticPhotosForReview(review.reviewId);
                });
            })
            .catch(function (error) {
                console.log('Lỗi khi lấy chi tiết sản phẩm: ' + error);
            });
    };

    $scope.isWebSocketConnected = false;

    $scope.connectWebSocket = function () {
        WebSocketService.connect(function () {
            $scope.isWebSocketConnected = true;

            // Đăng ký cho đường dẫn /topic/products (ví dụ)
            WebSocketService.subscribeToTopic('/topic/products', function (message) {
                console.log("Received Product Update:", message);
                $scope.getProductDetail();
            });
        });
    }

    // Gọi hàm connectWebSocket khi controller được khởi tạo
    $scope.connectWebSocket();

    //LẤY ẢNH CHI TIẾT CỦA REVIEW
    $scope.getAuthenticPhotosForReview = function (reviewId) {
        // Gọi REST endpoint để lấy danh sách ảnh chi tiết
        $http.get(`${host}/reviews/${reviewId}`)
            .then(function (response) {
                // Gán danh sách ảnh chi tiết vào biến $scope cho mỗi bình luận
                $scope.authenticPhotosForReview[reviewId] = response.data;
                // console.log("Ảnh Review", response.data);
            })
            .catch(function (error) {
                console.log('Lỗi khi lấy ảnh chi tiết: ' + error);
            });
    };

    $scope.getRatingPercentage = function (starRating) {

        var ratingCount = $scope.productReviews.filter(function (review) {
            return review.star === starRating;
        }).length;

        var totalReviews = $scope.productReviews.length;

        // Tính tỷ lệ
        if (totalReviews > 0) {
            return (ratingCount / totalReviews) * 100;
        } else {
            return 0;
        }
    };
    $scope.numStar = [1, 2, 3, 4, 5];
    //tính số sao của 1 sản phẩm
    $scope.calculateAverageRating = function () {
        var totalRatings = 0;
        var totalReviews = $scope.productReviews.length;

        if (totalReviews === 0) {
            return 0; // Tránh chia cho 0
        }

        // Tính tổng số sao từ tất cả đánh giá
        for (var i = 0; i < totalReviews; i++) {
            totalRatings += $scope.productReviews[i].star;
        }

        // Tính trung bình số sao
        var avgRating = (totalRatings / totalReviews).toFixed(1);
        return Math.round(avgRating);
    };

    //Tính số phần trăm giảm giá
    $scope.getDiscountValueByProductId = function (id) {
        var discountValue = null;
        $scope.productDiscounts.find(e => {
            if (e.productDetail.productDetailId === id) {
                discountValue = e.discount.value
            }
        });
        return discountValue ? discountValue : 0;
    }

    $scope.showFullDescription = false;
    $scope.wordsPerLine = 25; // Số từ trung bình trên mỗi dòng (tuỳ chỉnh)

    $scope.toggleDescription = function () {
        $scope.showFullDescription = !$scope.showFullDescription;
    };

    $scope.getLimitedDescription = function () {
        if ($scope.productDetail.product.description) {
            var description = $scope.productDetail.product.description;

            var words = description.split(" "); // Tách văn bản thành từng từ
            var lines = [];

            if (!$scope.showFullDescription) {
                var currentLine = "";
                var currentWordIndex = 0;

                while (currentWordIndex < words.length) {
                    currentLine += words[currentWordIndex] + " ";
                    currentWordIndex++;

                    if (currentWordIndex % $scope.wordsPerLine === 0) {
                        lines.push(currentLine);
                        currentLine = "";
                    }
                }

                // Gộp từng dòng lại
                var limitedDescription = lines.slice(0, 3).join("\n"); // Chỉ hiển thị tối đa 3 dòng

                return limitedDescription;
            }

            return description;
        } else {
            return '';
        }

    };

    // Thêm biến selectedImages để lưu trữ các ảnh đã chọn
    $scope.saveReview = {
        comment: '',
        star: 4
    };
    $scope.errors = {};
    $scope.saveReviewData = function () {
        if (!$scope.saveReview.comment) {
            $scope.errors.comment = '* Vui lòng nhập mô tả về sản phẩm';
            return;
        }

        var currentDate = new Date();
        var username = $scope.username;
        var reviewData = {
            account: { username: username },
            productDetail: { productDetailId: productDetailId },
            comment: $scope.saveReview.comment,
            date: currentDate,
            star: $scope.saveReview.star
        };

        var url = `${host}/reviews`;

        $http.post(url, reviewData)
            .then(function (response) {
                console.log("Đánh giá đã được lưu:", response.data);

                var reviewId = response.data.reviewId;
                var url1 = `${host}/reviews/${reviewId}/images`;

                var imageUploadPromises = [];

                // Tạo mảng promises cho việc lưu hình ảnh
                $scope.showLoading();
                for (var i = 0; i < $scope.selectedImages.length; i++) {
                    (function (index) {
                        var file = $scope.selectedImages[index].file;
                        var formData = new FormData();
                        formData.append('file', file);

                        var imageUploadPromise = $http.post(url1, formData, {
                            transformRequest: angular.identity,
                            headers: { "Content-Type": undefined }
                        });

                        imageUploadPromises.push(imageUploadPromise);
                    })(i);
                }

                // Sử dụng Promise.all để đợi cho tất cả các promises hoàn thành
                Promise.all(imageUploadPromises)
                    .then(function (responses) {
                        // Cập nhật URL thật của hình ảnh sau khi lưu thành công
                        responses.forEach(function (response, index) {
                            var imageUrl = response.data.imageUrl;
                            $scope.selectedImages[index].url = imageUrl;
                        });
                        // Tiếp tục với các hành động tiếp theo
                        $scope.hideLoading();
                        $('#message').modal('show');
                        $scope.modalContent = "Lưu bình luận thành công!";
                        $timeout(function () {
                            $('#message').modal('hide');
                        }, 2000);
                        $scope.getProductDetail();
                        $scope.closeReview();
                    })
                    .catch(function (error) {
                        console.log("Lỗi khi lưu hình ảnh: " + error);
                    });
            })
            .catch(function (error) {
                console.log("Lỗi khi lưu đánh giá: " + error);
            });
    };

    //Hàm xóa
    $scope.deleteReview = function () {
        var url = `${host}/reviews/${$scope.productReviews.reviewId}`;
        // Xóa hình ảnh của đánh giá dựa trên reviewId
        $http.delete(url)
            .then(function (response) {
                console.log("Xóa thành công", $scope.productReviews.reviewId);
                $('#addressDelete').modal('hide');
                $('#message').modal('show');
                $scope.modalContent = "Xóa bình luận thành công!";
                $timeout(function () {
                    $('#message').modal('hide');
                }, 2000);
                $scope.getProductDetail();
            })
            .catch(function (error) {
                // Xảy ra lỗi khi xóa hình ảnh
                console.error("Lỗi khi xóa hình ảnh: " + error);
            });
    };
    /// Hàm hiển thị modal xác nhận
    $scope.showConfirmAddress = function (id) {
        $scope.productReviews.reviewId = id;
        console.log($scope.productReviews.reviewId);
        $('#addressDelete').modal('show'); // Hiển thị modal xác nhận
    };
    $scope.navigateToProductDetail = function (productDetailId) {
        console.log("DÔ ĐÂY", productDetailId);
        window.location.href = '/product-details?id=' + productDetailId;
    }
    // Gọi hàm để lấy thông tin sản phẩm và tạo các slide
    $scope.getProductDetail();
    $scope.selectedImages = [];

    // // Hàm xử lý khi người dùng chọn một hoặc nhiều ảnh
    $scope.onImageSelect = function (event) {
        var files = event.target.files;
        for (var i = 0; i < files.length; i++) {
            var file = files[i];
            var imageUrl = URL.createObjectURL(file);
            $scope.$apply(function () {
                $scope.selectedImages.push({ file: file, url: imageUrl });
            });

        }
        console.log(files);
    };


    // Hàm xử lý khi người dùng xóa một ảnh
    $scope.deleteImage = function (index) {
        // Loại bỏ ảnh khỏi mảng selectedImages
        $scope.selectedImages.splice(index, 1);
    };

    $scope.closeReview = function () {
        $scope.clearReview();
        // Đóng modal
        $('#popup_write_review').modal('hide');
    };


    $scope.clearReview = function () {
        $scope.saveReview.comment = '';
        $scope.saveReview.star = 4;
        $scope.selectedImages = [];
        $scope.errors = {};
    };

    // SẢN PHẨM TƯƠNG TỰ
    $scope.getDiscountValueByProductIdRelated = function (id) {
        var discountValue = null;
        $scope.listProductDiscounts.find(e => {
            if (e.productDetail.productDetailId === id) {
                discountValue = e.discount.value
            }
        });
        return discountValue ? discountValue : 0;
    }

    $scope.getStarRatingByProductIdRelated = function (productDetailId) {
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

    $scope.getAuthorNameByProductId = function (id) {
        var bookAuthor = null;
        $scope.listBookAuthor.find(e => {
            if (e.product.productId === id) {
                bookAuthor = e;
            }
        });
        return bookAuthor ? bookAuthor.author.authorName : '';
    }

    $scope.quickView = function (productDetail) {
        // xem nhanh thông tin sản phẩm
        $scope.quickViewProduct = productDetail;
        $scope.quickViewProduct.quantity = 1;
    }

});

