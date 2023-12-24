app.controller("OrderDetailController", function ($scope, $timeout, $routeParams, $http, jwtHelper) {
    let host = "http://localhost:8081/customer/rest/order";
    var token = localStorage.getItem('token');

    if (token) {
        var decodedToken = jwtHelper.decodeToken(token);
        $scope.username = decodedToken.sub;
        $scope.listOrders = [];
        $scope.listReviews = {};
        $scope.listOrderDetails = {};
        $scope.filteredOrders = [];
        $scope.currentStatus = 'All';
        $scope.excludedStatuses = ['return_transporting', 'waiting_to_return', 'lost_damage'];

        // Hàm để lấy danh sách order
        $scope.getOrders = function () {
            return $http.get(host + '/' + $scope.username)
                .then(function (response) {
                    $scope.listOrders = response.data.orders;
                    $scope.listOrders.sort(function (a, b) {
                        return new Date(b.create_Date) - new Date(a.create_Date);
                    })
                    // Gọi hàm để lấy danh sách order details dựa trên danh sách order
                    var getOrderDetailPromises = $scope.listOrders.map(function (order) {
                        return $scope.getOrderDetailsWithReviews(order.orderCode, order);
                    });

                    // Sử dụng Promise.all để đợi cho tất cả các promises hoàn thành
                    return Promise.all(getOrderDetailPromises);
                })
                .catch(function (error) {
                    console.error('Error fetching orders:', error);
                });
        };


        $scope.getOrderDetailsWithReviews = function (orderCode, order) {
            $http.get(`${host}/orderdetails-with-reviews/${orderCode}`)
                .then(function (response) {
                    // Truy cập danh sách chi tiết đơn hàng
                    $scope.listOrderDetails[orderCode] = response.data.orderDetails;
                    console.log("data.orderDetails", response.data.orderDetails);
                    // Truy cập danh sách đánh giá
                    $scope.listReviews[orderCode] = response.data.reviews;
                    console.log(" data.reviews", response.data.reviews);
                    order.showReviewButton = $scope.listReviews[orderCode].length !== $scope.listOrderDetails[orderCode].length;

                    console.log("    order.showReviewButton", order.showReviewButton + orderCode);
                })
                .catch(function (error) {
                    console.log('Error fetching order details with reviews: ' + error);
                });
        };

        // Hàm xử lý sự kiện khi người dùng chọn trạng thái từ thanh tab
        $scope.selectStatus = function (status) {
            $scope.setListOrderByStatus(status);
        };

        $scope.hasOrders = false;

        // Hàm để lọc danh sách đơn hàng theo trạng thái đã chọn
        $scope.setListOrderByStatus = function (statusId) {
            $scope.selectedStatus = statusId;
            $scope.currentStatus = statusId;

            if (statusId === 'All') {
                // Lọc danh sách đơn hàng để loại bỏ các trạng thái nhất định
                $scope.filteredOrders = $scope.listOrders.filter(function (item) {
                    return !$scope.excludedStatuses.includes(item.status);
                });
            } else if (statusId === 'completed') {
                // Lọc danh sách đơn hàng có trạng thái "Completed" hoặc "Received"
                $scope.filteredOrders = $scope.listOrders.filter(function (item) {
                    return item.status === 'completed' || item.status === 'received';
                });
            } else {
                // Lọc theo trạng thái khác
                $scope.filteredOrders = $scope.listOrders.filter(function (item) {
                    return item.status === statusId;
                });
            }

            // Kiểm tra xem có đơn hàng hay không
            $scope.hasOrders = $scope.filteredOrders.length > 0;
        };

        //Hủy đơn hàng
        $scope.cancelOrder = [];
        $scope.showCancelModal = function (item) {
            $('#order-cancel').modal('show');
            $scope.cancelOrder.orderCode = item.orderCode;
            $scope.cancelOrder.username = item.account.username;
            $scope.cancelOrder.noteCancel = "";
            $scope.cancelOrder.status = item.status;
            $scope.errorsNoteCancel = "";
            $scope.cancelOrder.orderCodeGHN = item.orderCodeGHN;
            console.log("item", item);
        };

        $scope.confirmCancel = function () {
            if ($scope.cancelOrder.noteCancel == null || $scope.cancelOrder.noteCancel.length < 10) {
                $scope.errorsNoteCancel = 'Vui lòng nhập lí do không ít hơn 10 kí tự!';
            } else {
                $scope.showLoading();
                var updatedOrder = {
                    status: 'cancel',
                    confirmed_By: $scope.username,
                    note: $scope.cancelOrder.noteCancel,
                    orderCodeGHN: $scope.cancelOrder.orderCodeGHN
                };

                if ($scope.cancelOrder && $scope.cancelOrder.status === 'pending') {
                    // Nếu đơn hàng ở trạng thái 'Pending Handover', thực hiện cuộc gọi API của Giao Hàng Nhanh
                    var ghnApiData = {
                        order_codes: [$scope.cancelOrder.orderCodeGHN]
                    };

                    $http.post('https://online-gateway.ghn.vn/shiip/public-api/v2/switch-status/cancel', ghnApiData, {
                        headers: {
                            'Content-Type': 'application/json',
                            'ShopId': '4586990',
                            'Token': '7a77199f-6293-11ee-af43-6ead57e9219a'
                        }
                    }).then(function (ghnResponse) {
                        // Xử lý phản hồi từ Giao Hàng Nhanh (nếu cần)
                        console.log('GHN API Response:', ghnResponse.data);
                    }).catch(function (ghnError) {
                        // Xử lý lỗi từ Giao Hàng Nhanh (nếu cần)
                        console.error('GHN API Error:', ghnError.data);
                    });
                }

                var url = `${host}/cancelOrder/`;
                // Gọi API để hủy đơn hàng
                $http.put(url + $scope.cancelOrder.orderCode, updatedOrder)
                    .then(function (response) {
                        $('#order-cancel').modal('hide');
                        Swal.fire({
                            icon: "success",
                            title: "Thành công",
                            text: `Hủy đơn hàng ${$scope.cancelOrder.orderCode} thành công`,
                        });

                        $scope.getOrders().then(function () {
                            $scope.setListOrderByStatus($scope.currentStatus);
                        });
                        $scope.hideLoading();
                    })
                    .catch(function (error) {
                        // Xử lý khi có lỗi xảy ra
                        console.error("Lỗi khi hủy đơn hàng:", error.data);
                        $scope.hideLoading();
                    });
            }

        };

        $scope.clearCacel = function () {
            $scope.customerEmail = "";
            $scope.noteCancel = "";
            $scope.errorsNoteCancel = "";

        };
        // Mua lại
        $scope.buyAgain = function (orderCode) {
            var listOrderDetails = $scope.listOrderDetails[orderCode];

            var addToCartPromises = listOrderDetails.map(function (item) {
                return $scope.addToCart(item.productDetail.productDetailId, 1);
            });

            Promise.all(addToCartPromises)
                .then(function () {
                    window.location.href = "/cart";
                })
                .catch(function (error) {
                    console.error("Error adding to cart:", error);
                });
        }



        // ============PHẦN ĐÁNH GIÁ==============//
        $scope.acceptOrderModal = function (orderCode) {
            // Lưu mã đơn hàng vào $scope để sử dụng trong hàm acceptOrder
            $scope.currentOrderCode = orderCode;
            // Mở modal
            $('#acceptOrderModal').modal('show');
        };
        $scope.acceptOrder = function () {
            // Gọi hàm xác nhận đơn hàng với mã đơn hàng hiện tại
            $http.put(`${host}/confirmOrder/${$scope.currentOrderCode}`)
                .then(function (response) {
                    $('#acceptOrderModal').modal('hide');
                    $('#message-order').modal('show');
                    // $scope.getOrders();
                    $scope.modalContentOrder = "Xác Nhận Thành Công!";
                    $timeout(function () {
                        $('#message-order').modal('hide');
                    }, 2000);
                    $scope.getOrders().then(function () {
                        $scope.setListOrderByStatus($scope.currentStatus);
                    });
                })
                .catch(function (error) {
                    console.error('Error confirming order:', error);
                });
        };

        $scope.showModalReview = function (order) {
            // Lưu orderCode vào biến $scope.saveReview để sử dụng trong hàm saveReviewData
            $scope.saveReview.orderCode = order.orderCode;

            // Tạo một promise cho việc lấy chi tiết đơn hàng từ API
            var getOrderDetailPromise = $http.get(host + '/orderdetail/' + order.orderCode);

            getOrderDetailPromise.then(function (response) {
                // Truyền thông tin chi tiết của đơn hàng vào $scope
                $scope.selectedOrderDetails = response.data;

                // Gọi hàm kiểm tra đánh giá cho phần tử đầu tiên trong mảng
                checkReviewStatus(0);

            }).catch(function (error) {
                console.error('Error fetching order details:', error);
            });

            // Hàm kiểm tra đánh giá cho từng phần tử trong mảng
            function checkReviewStatus(index) {
                // Kiểm tra xem đã kiểm tra hết tất cả phần tử trong mảng chưa
                if (index < $scope.selectedOrderDetails.length) {
                    // Lấy thông tin của orderDetail
                    var orderDetail = $scope.selectedOrderDetails[index];

                    // Tạo một promise cho việc kiểm tra trạng thái đánh giá từ API
                    var checkReviewStatusPromise = $http.get(host + '/' + $scope.username + '/' + orderDetail.productDetail.productDetailId + '/' + order.orderCode);

                    checkReviewStatusPromise.then(function (response) {
                        // Kiểm tra trạng thái đánh giá và cập nhật isReviewed
                        orderDetail.isReviewed = response.data.productExists;

                        // Gọi đệ quy cho phần tử tiếp theo trong mảng
                        checkReviewStatus(index + 1);
                    }).catch(function (error) {
                        console.error('Error checking review status:', error);
                    });
                } else {
                    // Kiểm tra xem tất cả các phần tử đã được đánh giá chưa
                    $('#popup_show_review').modal('show');

                }
            }

        };

        $scope.openReviewPopup = function (productDetailId) {
            $scope.productDetailId = productDetailId;
            $('#popup_show_review').modal('hide');
            $('#popup_write_review').modal('show');
        }


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
        $scope.saveReview = {
            comment: '',
            star: 5
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
                productDetail: { productDetailId: $scope.productDetailId },
                comment: $scope.saveReview.comment,
                date: currentDate,
                star: $scope.saveReview.star,
                order: { orderCode: $scope.saveReview.orderCode } // Thêm orderCode vào reviewData
            };
            let host1 = "http://localhost:8081/customer/rest/product-detail";
            var url = `${host1}/reviews`;

            $http.post(url, reviewData)
                .then(function (response) {
                    console.log("Đánh giá đã được lưu:", response.data);

                    var reviewId = response.data.reviewId;
                    var orderCode = response.data.order;
                    var url1 = `${host1}/reviews/${reviewId}/images`;

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
                            $scope.modalContentOrder = "Lưu bình luận thành công!";
                            $timeout(function () {
                                $('#message').modal('hide');
                            }, 2000);
                            $scope.getOrders().then(function () {
                                $scope.setListOrderByStatus($scope.currentStatus);
                            });
                            $scope.closeReview();
                            $scope.showModalReview(orderCode);
                            $('#popup_show_review').modal('show');
                        })
                        .catch(function (error) {
                            console.log("Lỗi khi lưu hình ảnh: " + error);
                        });
                })
                .catch(function (error) {
                    console.log("Lỗi khi lưu đánh giá: " + error);
                });
        };

        $scope.closeReview = function () {
            $scope.clearReview();
            // Đóng modal
            $('#popup_write_review').modal('hide');
        };

        $scope.closeReviewOk = function () {
            $('#popup_show_review').modal('hide');
        }

        $scope.clearReview = function () {
            $('#popup_write_review').modal('hide');
            $scope.saveReview.comment = '';
            $scope.saveReview.star = 5;
            $scope.selectedImages = [];
            $scope.errors = {};
        };

        // Thêm hàm tìm kiếm vào controller
        $scope.searchOrders = function (searchTerm) {
            // Chuyển đổi searchTerm thành chữ thường để tìm kiếm không phân biệt chữ hoa chữ thường
            searchTerm = searchTerm.toLowerCase();

            // Lọc danh sách đơn hàng theo mã hóa đơn và tên sản phẩm
            $scope.filteredOrders = $scope.listOrders.filter(function (order) {
                // Kiểm tra xem mã hóa đơn hoặc tên sản phẩm có chứa searchTerm hay không
                return order.orderCode.toLowerCase().includes(searchTerm) ||
                    orderContainsProductName(order, searchTerm);
            });

            // Kiểm tra xem có đơn hàng hay không
            $scope.hasOrders = $scope.filteredOrders.length > 0;
        };

        // Hàm hỗ trợ kiểm tra xem đơn hàng có chứa tên sản phẩm không
        function orderContainsProductName(order, searchTerm) {
            // Duyệt qua từng chi tiết đơn hàng của đơn hàng
            for (var i = 0; i < $scope.listOrderDetails[order.orderCode].length; i++) {
                var orderDetail = $scope.listOrderDetails[order.orderCode][i];

                // Kiểm tra xem tên sản phẩm có chứa searchTerm hay không
                if (orderDetail.productName.toLowerCase().includes(searchTerm)) {
                    return true;
                }
            }

            // Nếu không tìm thấy, trả về false
            return false;
        };


        //Tính tổng tiền  =  (tổng tiền  sản phẩm += priceDiscount * quantity  ) + codAmount
        $scope.calculateTotalAmount = function (order) {
            let totalAmount = 0;

            // Duyệt qua các chi tiết đơn hàng và tính tổng cho mỗi sản phẩm
            angular.forEach($scope.listOrderDetails[order.orderCode], function (orderDetail) {
                totalAmount += orderDetail.productDetail.priceDiscount * orderDetail.quantity;
            });

            // Thêm phí vận chuyển (codAmount) vào tổng số tiền
            totalAmount += order.codAmount;

            return totalAmount;
        };
        $scope.getOrderCode = function (orderCode) {
            window.location.href = '/account/order-detail?orderCode=' + orderCode;
        };

        $scope.init = function () {
            $scope.getOrders().then(function () {
                $scope.setListOrderByStatus($scope.currentStatus);
            });
        }

        $scope.init();
    }
});
app.controller("OrderCancelController", function ($scope, $timeout, $http, customerAPI) {
    var params = new URLSearchParams(location.search);
    var orderCode = params.get('orderCode');

    $scope.orderDetails = {};
    $scope.order = [];
    $scope.getDataOrderDetail = function (orderCode) {
        $http.get(`${customerAPI}/order/orderCancel/${orderCode}`)
            .then(function (response) {
                $scope.order = response.data;
                console.log("code", $scope.order)
            })
            .catch(function (error) {
                console.log('Lỗi khi lấy ảnh chi tiết: ' + error);
            });
    };

    $scope.getOrderDetailCancel = function (orderCode) {
        $http.get(`${customerAPI}/order/orderdetail/${orderCode}`)
            .then(function (response) {
                $scope.orderDetails[orderCode] = response.data;
                console.log(" $scope.orderDetails[orderCode]", response.data);

            })
            .catch(function (error) {
                console.log('Lỗi khi lấy order chi tiết: ' + error);
            });
    };

    //Tính tổng tiền  =  (tổng tiền  sản phẩm += priceDiscount * quantity  ) + codAmount
    $scope.calculateTotalAmount = function (order) {
        let totalAmount = 0;

        // Duyệt qua các chi tiết đơn hàng và tính tổng cho mỗi sản phẩm
        angular.forEach($scope.orderDetails[order.orderCode], function (orderDetail) {
            totalAmount += orderDetail.productDetail.priceDiscount * orderDetail.quantity;
        });

        // Thêm phí vận chuyển (codAmount) vào tổng số tiền
        totalAmount += order.codAmount;

        return totalAmount;
    };

    $scope.getDataOrderDetail(orderCode);
    $scope.getOrderDetailCancel(orderCode);
}); 