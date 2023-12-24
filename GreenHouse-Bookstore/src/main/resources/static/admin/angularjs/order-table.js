app.controller("OrderController", function ($scope, $http, WebSocketService) {

    $scope.$on('$routeChangeSuccess', function (event, current, previous) {
        $scope.page.setTitle(current.$$route.title || ' Quản lý đơn hàng');
    });

    let host = "http://localhost:8081/rest/order";
    $scope.username = localStorage.getItem("username");
    const tokenGHN = '7a77199f-6293-11ee-af43-6ead57e9219a';
    const shopIdGHN = 4586990;
    const provinceCodeGH = 220;
    const districtCodeGH = 1574;
    const wardCodeGH = 550307;
    // List get data - start
    $scope.listInvoiceDetails = [];
    $scope.listInvoiceMappingVoucher = [];
    $scope.listOderMappingStatus = [];
    $scope.listProductDetails = [];
    $scope.listAuthorities = [];
    // List get data - end 

    // List for repeat - start
    $scope.listOrders = [];
    $scope.listStatus = [];
    $scope.listCustomer = [];
    $scope.searchProductResults = [];
    $scope.selectedProducts = [];
    $scope.searchUserResults = [];
    // List for repeat - start

    // NO NAME - START =))
    $scope.selectedStatus = null;
    $scope.selectedUsers = null;
    $scope.searchProductKeyword = null;
    $scope.searchUserKeyword = null;

    $scope.itemsPerPageOptions = [5, 12, 24, 32, 64, 128];
    $scope.itemsPerPage = 5;
    $scope.maxSize = 5;
    $scope.currentPage = 1;
    // Đây là biến invoice đã được khởi tạo và có thể sử dụng trong AngularJS
    // $scope.totalItems = $scope.listOrders.length;

    $scope.getData = function () {
        var url = `${host}/getData`;
        return $http.get(url).then((resp) => {
            $scope.originalOrdersList = resp.data.listOrders;
            $scope.listOrders = $scope.originalOrdersList;
            $scope.listProductDetails = resp.data.productDetails;
            $scope.listAuthorities = resp.data.authorities;

            $scope.listOrders.sort(function (a, b) {
                return new Date(b.create_Date) - new Date(a.create_Date);
            });
            // $scope.totalItems = $scope.listOrders.length;
            console.log("List order status: ", $scope.listOrders);
            console.log("List product detail", $scope.listProductDetails);
            console.log("List authorities: ", $scope.listAuthorities);
            console.log("Lenght", $scope.listOrders.length);
            $scope.countAllOrders = $scope.listOrders.length;
            $scope.setListOrderByStatus('All');
            $scope.totalItems = $scope.listOrders.length;
        }).catch((Error) => {
            console.log("Error: ", Error);
        });
    }

    $scope.countOrderByStatus = function (statusID) {
        var count = 0;
        angular.forEach($scope.listOrders, function (order) {
            if (order.status === statusID) {
                count++;
            }
        });
        return count;
    };


    $scope.getNumOfPages = function () {
        return Math.ceil($scope.totalItems / $scope.itemsPerPage);
    };

    $scope.setPage = function (pageNo) {
        $scope.currentPage = pageNo;
    };

    $scope.calculateRange = function () {
        var startIndex = ($scope.currentPage - 1) * $scope.itemsPerPage + 1;
        var endIndex = $scope.currentPage * $scope.itemsPerPage;

        if (endIndex > $scope.totalItems) {
            endIndex = $scope.totalItems;
        }

        return startIndex + ' đến ' + endIndex + ' trên tổng số ' + $scope.totalItems + ' mục';
    };

    $scope.currentStatus = 'All';

    $scope.setListOrderByStatus = function (statusId) {
        $scope.selectedStatus = statusId;
        $scope.currentStatus = statusId;

        if (statusId === 'All') {
            $scope.filteredOrders = $scope.listOrders;
        } else {
            $scope.filteredOrders = $scope.listOrders.filter(function (item) {
                return item.status === statusId;
            });
        }
        $scope.totalItems = $scope.filteredOrders.length;
        // Gọi hàm tìm kiếm lại khi chuyển tab
        // $scope.searchData();
    };

    $scope.searchData = function () {
        if ($scope.currentStatus === 'All') {
            $scope.filteredOrders = $scope.originalOrdersList.filter(function (item) {
                return (
                    item.orderCode.toLowerCase().includes($scope.searchText.toLowerCase()) ||
                    item.username.toLowerCase().includes($scope.searchText.toLowerCase()) ||
                    item.create_Date.toLowerCase().includes($scope.searchText.toLowerCase()) ||
                    item.toPhone.toLowerCase().includes($scope.searchText.toLowerCase()) ||
                    item.toAddress.toLowerCase().includes($scope.searchText.toLowerCase()) ||
                    item.codAmount.toString().includes($scope.searchText)
                );
            });
            $scope.totalItems = $scope.searchText ? $scope.filteredOrders.length : $scope.originalOrdersList.length;

        } else {
            $scope.filteredOrders = $scope.listOrders.filter(function (item) {
                return (
                    item.status === $scope.currentStatus &&
                    (
                        item.orderCode.toLowerCase().includes($scope.searchText.toLowerCase()) ||
                        item.username.toLowerCase().includes($scope.searchText.toLowerCase()) ||
                        item.create_Date.toLowerCase().includes($scope.searchText.toLowerCase()) ||
                        item.fromPhone.toLowerCase().includes($scope.searchText.toLowerCase()) ||
                        item.fromAddress.toLowerCase().includes($scope.searchText.toLowerCase()) ||
                        item.codAmount.toString().includes($scope.searchText)
                    )
                );
            });
            $scope.totalItems = $scope.searchText ? $scope.filteredOrders.length : $scope.listOrders.length;
        }
        $scope.setPage(1);
    };

    // ====================LẤY HÓA ĐƠN CHI TIẾT===============//
    $scope.selectedOrder = [];
    $scope.selectedOrderDetails = [];
    $scope.getOrderInfo = function (orderCode) {
        var url = `${host}/getOrderInfo/${orderCode}`;
        $http.get(url).then(function (resp) {
            var data = resp.data;
            console.log(resp.data);
            // Kiểm tra nếu có thông tin đơn hàng
            if (data.order) {
                $scope.selectedOrder = data.order;
                // Kiểm tra nếu có thông tin đơn hàng chi tiết
                if (data.orderDetails && data.orderDetails.length > 0) {
                    $scope.selectedOrderDetails = data.orderDetails;
                    $scope.calculateTotalOrderAmount();
                } else {
                    // Nếu không có thông tin đơn hàng chi tiết
                    $scope.selectedOrderDetails = [];
                }
            } else {
                // Hiển thị thông báo hoặc xử lý khi không có thông tin đơn hàng
                console.log('Không có thông tin đơn hàng.');
            }
        }).catch(function (error) {
            console.log("Error: ", error);
        });
    };
    //Tính tổng tiền
    $scope.totalOrderAmount = 0;
    $scope.calculateTotalOrderAmount = function () {
        $scope.totalOrderAmount = 0;
        angular.forEach($scope.selectedOrderDetails, function (detail) {
            $scope.totalOrderAmount += detail.price * detail.quantity;
        });
        $scope.totalOrderAmount += $scope.selectedOrder.codAmount;
    };

    $scope.formatDate = function (date) {
        if (date == null) {
            return "";
        }
        var formattedDate = new Date(date);
        var year = formattedDate.getFullYear();
        var month = (formattedDate.getMonth() + 1).toString().padStart(2, '0');
        var day = formattedDate.getDate().toString().padStart(2, '0');

        return `${year}-${month}-${day}`;
    };

    //SOrt
    $scope.reverseSort = false; // Sắp xếp tăng dần
    $scope.sortBy = function (field) {
        if ($scope.sortField === field) {
            $scope.reverseSort = !$scope.reverseSort;
        } else {
            $scope.sortField = field;
            $scope.reverseSort = false;
        }
    };
    // duyệt đơn
    $scope.acceptOrder = function (order) {
        loadingOverlay.style.display = "block";
        var apiUrl = 'https://online-gateway.ghn.vn/shiip/public-api/v2/shipping-order/create';
        //================================================================
        var paymentTypeId = order.paymentTypeId;
        var note = order.note;
        var requiredNote = order.requiredNote;
        var fromName = order.fromName;
        var fromPhone = order.fromPhone;
        var fromAddress = order.fromAddress;
        var fromWardName = order.fromWardName;
        var fromDistrictName = order.fromDistrictName;
        var fromProvinceName = order.fromProvinceName;
        var returnPhone = order.returnPhone;
        var returnAddress = order.returnAddress;
        var returnDistrictId = order.returnDistrictId;
        var returnWardCode = order.returnWardCode;
        var clientOrderCode = order.clientOrderCode;
        var toName = order.toName;
        var toPhone = order.toPhone;
        var toAddress = order.toAddress;
        var toWardCode = order.toWardCode;
        var toDistrictId = order.toDistrictId;
        var codAmount = order.codAmount;
        var content = order.content;
        var weight = order.weight;
        var length = order.length;
        var width = order.width;
        var height = order.height;
        if (order.insuranceValue > 8000000) {
            order.insuranceValue = 8000000;
        }
        var insuranceValue = order.insuranceValue;
        var serviceId = order.serviceId;
        var serviceTypeId = order.serviceTypeId;
        var items = [];
        angular.forEach($scope.selectedOrderDetails, orderDetail => {
            var item = {
                name: orderDetail.productName,
                code: orderDetail.productDetail.product.productId,
                quantity: orderDetail.quantity,
                price: orderDetail.price,
                length: orderDetail.length,
                width: orderDetail.width,
                height: orderDetail.height,
                weight: orderDetail.weight,
            }
            items.push(item);
        })
        //================================================
        var requestBody = {
            payment_type_id: paymentTypeId,
            note: note,
            required_note: requiredNote,
            from_name: fromName,
            from_phone: fromPhone,
            from_address: fromAddress,
            from_ward_name: fromWardName,
            from_district_name: fromDistrictName,
            from_province_name: fromProvinceName,
            return_phone: returnPhone,
            return_address: returnAddress,
            return_district_id: returnDistrictId,
            return_ward_code: returnWardCode,
            client_order_code: clientOrderCode,
            to_name: toName,
            to_phone: toPhone,
            to_address: toAddress,
            to_ward_code: toWardCode,
            to_district_id: toDistrictId,
            cod_amount: codAmount,
            content: content,
            weight: weight,
            length: length,
            width: width,
            height: height,
            insurance_value: insuranceValue,
            service_id: serviceId,
            service_type_id: serviceTypeId,
            items: items
        };
        console.log(requestBody);

        var requestConfig = {
            headers: {
                'Content-Type': 'application/json',
                'ShopId': shopIdGHN,
                'Token': tokenGHN
            }
        };
        var updatedOrder = {
            status: 'pending',
            confirmed_By: $scope.username,
            note: 'Đơn hàng của bạn đã được GreenHouse xác nhận!',
            orderCodeGHN: '',
            expected_delivery_time: '',
        };
        $http.post(apiUrl, requestBody, requestConfig)
            .then(function (response) {
                console.log(response);
                $scope.getData();
                updatedOrder.orderCodeGHN = response.data.data.order_code;
                updatedOrder.expected_delivery_time = response.data.data.expected_delivery_time;
                $http.put('/rest/order/cancelOrder/' + order.orderCode, updatedOrder)
                    .then(function (response) {
                        // Xử lý khi hủy đơn hàng thành công
                        loadingOverlay.style.display = "none";
                        $scope.sendNotification("Thông báo giao hàng", order.orderCode, order.username, "Đơn hàng của bạn đã được GreenHouse xác nhận ");
                        $scope.getData();
                        $scope.clearCancel();
                        $('#order-detail-modal-lg').modal('hide');
                        Swal.fire({
                            icon: "success",
                            title: "Thành công",
                            text: `Xác nhận đơn hàng thành công`,
                        });
                        loadingOverlay.style.display = "none";
                    })
                    .catch(function (error) {
                        loadingOverlay.style.display = "none";
                        // Xử lý khi có lỗi xảy ra
                        console.error("Lỗi khi hủy đơn hàng:", error.data);
                    });
            })
            .catch(function (error) {
                loadingOverlay.style.display = "none";
                console.error(error);
            });


    };

    //Hàm hủy
    $scope.cancelOrder = [];
    $scope.showCancelModal = function (item) {
        $scope.cancelOrder.orderCode = item.orderCode;
        $scope.cancelOrder.email = item.account.email;
        $scope.cancelOrder.username = item.account.username;
        $scope.cancelOrder.noteCancel = "";
        $scope.cancelOrder.status = item.status;
        $scope.errorsNoteCancel = "";
        $scope.cancelOrder.orderCodeGHN = item.orderCodeGHN;
        console.log(item);
    };

    $scope.sendNotification = function (title, orderCode, username, message) {
        WebSocketService.sendNotification(title, orderCode, username, message);
    };

    $scope.confirmCancel = function () {
        if ($scope.cancelOrder.noteCancel == null || $scope.cancelOrder.noteCancel.length < 10) {
            $scope.errorsNoteCancel = 'Vui lòng nhập lí do không ít hơn 10 kí tự!';
        } else {
            var loadingOverlay = document.getElementById("loadingOverlay");
            loadingOverlay.style.display = "block";
            var updatedOrder = {
                status: 'cancel',
                confirmed_By: $scope.username,
                note: $scope.cancelOrder.noteCancel
            };

            if ($scope.cancelOrder.status === 'pending') {
                // Nếu đơn hàng ở trạng thái 'pending', thực hiện cuộc gọi API của Giao Hàng Nhanh
                var ghnApiData = {
                    order_codes: [$scope.cancelOrder.orderCodeGHN]
                };
                console.log(ghnApiData);
                $http.post('https://online-gateway.ghn.vn/shiip/public-api/v2/switch-status/cancel', ghnApiData, {
                    headers: {
                        'Content-Type': 'application/json',
                        'ShopId': shopIdGHN,
                        'Token': tokenGHN
                    }
                }).then(function (ghnResponse) {
                    // Xử lý phản hồi từ Giao Hàng Nhanh (nếu cần)
                    console.log('GHN API Response:', ghnResponse.data);
                }).catch(function (ghnError) {
                    // Xử lý lỗi từ Giao Hàng Nhanh (nếu cần)
                    console.error('GHN API Error:', ghnError.data);
                });
            }

            // Gọi API để hủy đơn hàng
            $http.put('/rest/order/cancelOrder/' + $scope.cancelOrder.orderCode, updatedOrder)
                .then(function (response) {
                    // Xử lý khi hủy đơn hàng thành công
                    $('#order-cancel').modal('hide');
                    console.log(response.data);
                    loadingOverlay.style.display = "none";

                    $scope.sendNotification("Thông báo hủy đơn hàng", $scope.cancelOrder.orderCode, $scope.cancelOrder.username, "Lí do hủy đơn hàng: " + $scope.cancelOrder.noteCancel);
                    $scope.getData();
                    $scope.clearCancel();

                    Swal.fire({
                        icon: "success",
                        title: "Thành công",
                        text: `Hủy đơn hàng ${$scope.cancelOrder.orderCode} thành công`,
                    });
                })
                .catch(function (error) {
                    // Xử lý khi có lỗi xảy ra
                    loadingOverlay.style.display = "none";
                    console.error("Lỗi khi hủy đơn hàng:", error.data);
                });
        }

    };

    $scope.clearCancel = function () {
        $scope.customerEmail = "";
        $scope.noteCancel = "";
        $scope.errorsNoteCancel = "";

    };
    // Thêm biến selectedStatus vào scope để theo dõi trạng thái hiện tại
    $scope.selectedStatus = 'all';

    // Hàm thay đổi trạng thái
    $scope.changeStatus = function (status) {
        $scope.selectedStatus = status;
        $scope.loadOrders(); // Gọi hàm loadOrders hoặc tương tự để cập nhật dữ liệu
    };

    // Thêm ánh xạ trạng thái
    $scope.statusMapping = {
        'pending_confirmation': 'Chờ Xác Nhận',
        'pending': 'Chờ Bàn Giao',
        'transporting': 'Đang Giao',
        'return_transporting': 'Đang Hoàn Hàng',
        'waiting_to_return': 'Chờ Xác Nhận Giao Lại',
        'completed': 'Hoàn Tất',
        'received': 'Đã Nhận',
        'cancel': 'Đã Hủy',
        'lost_damage': 'Hàng Thất Lạc - Hư Hỏng'
    };

    // Sửa đoạn mã xuất Excel
    $scope.exportToExcel = function () {
        if ($scope.filteredOrders.length === 0) {
            Swal.fire({
                icon: 'info',
                title: 'Không có dữ liệu để xuất Excel.',
                text: 'Vui lòng kiểm tra lại.',
            });
            return;
        }

        // Tạo mảng dữ liệu cho tệp Excel
        var excelData = [
            ['BÁO CÁO - DANH SÁCH HÓA ĐƠN'], // Header
            [], // Empty row for spacing
            ['STT', 'Mã Đơn', 'Ngày Tạo', 'Người Đặt', 'SĐT', 'Địa Chỉ Giao Hàng', 'Phí Vận Chuyển', 'Thanh Toán Bằng', 'Trạng Thái']
        ];

        $scope.filteredOrders.forEach(function (item, index) {
            excelData.push([
                index + 1,
                item.orderCode,
                $scope.formatDate(item.create_Date),
                item.username,
                item.toPhone,
                item.toAddress,
                item.codAmount,
                item.invoices.paymentMethod,
                $scope.statusMapping[item.status] || item.status
            ]);
        });

        // Đặt độ rộng cố định cho từng cột (có thể điều chỉnh theo ý muốn)
        var colWidths = [10, 20, 20, 20, 15, 30, 25, 25, 20];

        // Sử dụng thư viện XLSX để tạo tệp Excel
        var ws = XLSX.utils.aoa_to_sheet(excelData);

        // Đặt độ rộng cố định cho các cột
        for (var i = 0; i < colWidths.length; i++) {
            ws['!cols'] = ws['!cols'] || [];
            ws['!cols'].push({ wch: colWidths[i] });
        }

        // Căn giữa dữ liệu trong từng cột
        for (var row = 0; row < excelData.length; row++) {
            for (var col = 0; col < excelData[row].length; col++) {
                ws[XLSX.utils.encode_cell({ r: row, c: col })].s = { alignment: { horizontal: 'center' } };
            }
        }

        var currentTime = moment().format('DDMMYYYY_HHmmss');
        var statusMapping = $scope.statusMapping[$scope.currentStatus] || $scope.currentStatus;
        var fileName = 'danh_sach_don_hang_' + statusMapping + '_' + currentTime + '.xlsx';

        var wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Danh sách đơn hàng');

        // Xuất tệp Excel
        XLSX.writeFile(wb, fileName);
    };

    // Tạo một đối tượng mapping giữa trạng thái tiếng Anh và tiếng Việt
    var statusMapping = {
        'pending_confirmation': 'Chờ Xác Nhận',
        'pending': 'Chờ Bàn Giao',
        'transporting': 'Đang Giao',
        'return_transporting': 'Đang Hoàn Hàng',
        'waiting_to_return': 'Chờ Xác Nhận Giao Lại',
        'completed': 'Hoàn Tất',
        'received': 'Đã Nhận',
        'cancel': 'Đã Hủy',
        'lost_damage': 'Hàng Thất Lạc - Hư Hỏng'
    };
    // Thay đổi hàm printPDF để chỉ in dữ liệu theo trạng thái hiện tại
    $scope.printPDF = function () {
        // Kiểm tra nếu không có dữ liệu
        // if ($scope.filteredOrders.length === 0) {
        //     alert('Không có dữ liệu để xuất PDF.');
        //     return;
        // }
        if ($scope.filteredOrders.length === 0) {
            Swal.fire({
                icon: 'info',
                title: 'Không có dữ liệu để xuất PDF.',
                text: 'Vui lòng kiểm tra lại.',
            });
            return;
        }
        var headerTable = {
            table: {
                headerRows: 1,
                widths: [20, 40, 50, 50, 50, 90, 40, 60, 35],
                body: [
                    [{ text: 'STT', alignment: 'center', fontSize: 11 },
                    { text: 'Mã Đơn', alignment: 'center', fontSize: 11 },
                    { text: 'Ngày Tạo', alignment: 'center', fontSize: 11 },
                    { text: 'Người Đặt', alignment: 'center', fontSize: 11 },
                    { text: 'SĐT', alignment: 'center', fontSize: 11 },
                    { text: 'Địa Chỉ Giao Hàng', alignment: 'center', fontSize: 11 },
                    { text: 'Phí Vận Chuyển', alignment: 'center', fontSize: 11 },
                    { text: 'Thanh Toán Bằng', alignment: 'center', fontSize: 11 },
                    { text: 'Trạng Thái', alignment: 'center', fontSize: 11 }]
                ]
            }
        };

        var bodyTable = {
            table: {
                widths: [20, 40, 50, 50, 50, 90, 40, 60, 35],
                body: $scope.filteredOrders.map((item, index) => [
                    { text: (index + 1).toString(), alignment: 'center', fontSize: 11 },
                    { text: item.orderCode, alignment: 'center', fontSize: 11 },
                    { text: $scope.formatDate(item.create_Date), fontSize: 11 },
                    { text: item.username, fontSize: 11 },
                    { text: item.toPhone, fontSize: 11 },
                    { text: item.toAddress, fontSize: 11 },
                    { text: item.codAmount, fontSize: 11 },
                    { text: item.invoices.paymentMethod, fontSize: 11 },
                    { text: statusMapping[item.status], fontSize: 11 }, // Sử dụng đối tượng mapping
                ])
            }
        };

        var docDefinition = {
            pageOrientation: 'portrait',
            pageSize: 'A4',
            content: [
                { text: 'Danh sách đơn hàng', style: 'header' },
                ' ',
                { text: 'Ngày in: ' + moment().format('DD/MM/YYYY'), alignment: 'right', fontSize: 12 },
                ' ',
                headerTable,
                bodyTable
            ],
            styles: {
                header: { fontSize: 16, bold: true, alignment: 'center' },
                default: { fontSize: 14 }
            }
        };

        pdfMake.createPdf(docDefinition).open();
    };


    // END WEBSOCKET

    $scope.init = function () {
        WebSocketService.connect();
        $scope.getData();
    }

    $scope.init();

    $scope.$on('$destroy', function () {
        WebSocketService.disconnect();
    });
});

