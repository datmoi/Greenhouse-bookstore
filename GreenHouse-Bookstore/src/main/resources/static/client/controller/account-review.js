app.controller("ReviewController", function ($scope, $timeout, $http, jwtHelper, customerAPI) {
    var token = localStorage.getItem("token");
    var username = localStorage.getItem("username");
    $scope.username = username;
    let host = customerAPI;
    $scope.currentPage = 1;
    $scope.reviews = [];

    $scope.getDataReview = function (username) {
        $http.get(host + '/review/' + $scope.username)
            .then(function (response) {
                $scope.reviews = response.data;
                $scope.reviews.sort(function (a, b) {
                    // Sắp xếp theo ngày giảm dần (mới nhất đầu tiên)
                    return new Date(b.date) - new Date(a.date);
                });
                console.log($scope.reviews);
            })
            .catch(function (error) {
                console.error("Error loading reviews:", error);
            });
    }

    $scope.trimText = function (text) {
        if (text.length > 40) {
            return text.substring(0, 40) + "...";
        } else {
            return text;
        }
    };

    $scope.getReviewId = function (reviewId) {
        window.location.href = '/account/review-detail?reviewId=' + reviewId;
    };
    $scope.getDataReview();
});
app.controller("ReviewDetailController", function ($scope, $timeout, $http, customerAPI) {
    var params = new URLSearchParams(location.search);
    var reviewId = params.get('reviewId');
    $scope.authenticPhotosForReview = {};
    $scope.productReview = [];
    $scope.getDataReviewDetail = function (reviewId) {
        $http.get(`${customerAPI}/reviewdetail/${reviewId}`)
            .then(function (response) {
                $scope.productReview = response.data;
            })
            .catch(function (error) {
                console.log('Lỗi khi lấy ảnh chi tiết: ' + error);
            });
    };

    $scope.getAuthenticPhotosForReview = function (reviewId) {
        $http.get(`${customerAPI}/product-detail/reviews/${reviewId}`)
            .then(function (response) {
                $scope.authenticPhotosForReview[reviewId] = response.data;
                console.log(" Review", response.data);

            })
            .catch(function (error) {
                console.log('Lỗi khi lấy ảnh chi tiết: ' + error);
            });
    };
    //Hàm xóa
    $scope.deleteReview = function () {
        var url = `${customerAPI}/product-detail/reviews/${$scope.productReview.reviewId}`;
        // Xóa hình ảnh của đánh giá dựa trên reviewId
        $http.delete(url)
            .then(function (response) {
                console.log("Xóa thành công", $scope.productReview.reviewId);
                $('#addressDelete').modal('hide');
                $('#message').modal('show');
                $scope.modalContent = "Xóa bình luận thành công!";
                $timeout(function () {
                    $('#message').modal('hide');
                }, 2000);
                $scope.getDataReviewDetail(reviewId);
            })
            .catch(function (error) {
                // Xảy ra lỗi khi xóa hình ảnh
                console.error("Lỗi khi xóa hình ảnh: " + error);
            });
        // window.location.href = '/account/review';
    };
    /// Hàm hiển thị modal xác nhận
    $scope.showConfirmReview = function (id) {
        $scope.productReview.reviewId = id;
        console.log($scope.productReview.reviewId);
        $('#addressDelete').modal('show'); // Hiển thị modal xác nhận
    };
    $scope.getAuthenticPhotosForReview(reviewId);
    $scope.getDataReviewDetail(reviewId);
});


