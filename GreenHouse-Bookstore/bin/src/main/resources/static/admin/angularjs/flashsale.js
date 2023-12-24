app.controller('flashsaleController', flashsaleController);
// app.controller('flashsale-formCtrl', flashsale_formCtrl)

var test3 = 0;
// var key5 = null;
var form5 = {};

//Table
function flashsaleController($scope, $http, jwtHelper, $location, $routeParams, $interval, $filter) {
    $scope.$on('$routeChangeSuccess', function (event, current, previous) {
        $scope.page.setTitle(current.$$route.title || ' Quản lý Flash-Sale');
        $scope.load_All();
    });
    // ... Các mã xử lý khác trong controller
    //Mảng danh sách chính
    $scope.flashsalelist = [];
    $scope.productfsList = [];
    $scope.productDetailList = [];
    $scope.productList = [];
    // Tạo một danh sách tạm thời để lưu các sản phẩm đã chọn
    $scope.tempSelectedProducts = [];
    $scope.listModelProduct = [];
    $scope.listProductFlashSale = [];
    $scope.listDeletedProductFlashSale = [];
    $scope.searchText = "";
    $scope.sortField = null;
    $scope.reverseSort = false;
    // Khai báo danh sách tùy chọn cho số mục trên mỗi trang
    $scope.currentPage = 1; // Trang hiện tại
    $scope.itemsPerPage = 12; // Số mục hiển thị trên mỗi trang
    $scope.maxSize = 5;
    $scope.itemsPerPageOptions = [5, 12, 24, 32, 64, 128];
    $scope.selectedItemsPerPage = 5; // Khởi tạo giá trị mặc định cho số mục trên mỗi trang

    $scope.timeRanges = ["00:00-02:00", "02:00-04:00", "04:00-06:00", "06:00-08:00", "08:00-10:00", "10:00-12:00", "12:00-14:00", "14:00-16:00", "16:00-18:00", "18:00-20:00", "20:00-22:00", "22:00-23:59"];

    let host = "http://localhost:8081/rest";

    // Hàm tính toán số trang dựa trên số lượng mục và số mục trên mỗi trang
    $scope.getNumOfPages = function () {
        return Math.ceil($scope.totalItems / $scope.itemsPerPage);
    };

    // Hàm chuyển đổi trang
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


    $scope.searchData = function () {
        // Lọc danh sách gốc bằng searchText
        $scope.flashsalelist = $scope.originalFlashSaleList.filter(function (item) {
            // Thực hiện tìm kiếm trong các thuộc tính cần thiết của item
            return (
                item.flashSaleId.toString().includes($scope.searchText) || item.name.toLowerCase().includes($scope.searchText.toLowerCase())
            );
        });
        $scope.totalItems = $scope.searchText ? $scope.flashsalelist.length : $scope.originalFlashSaleList.length;
        $scope.setPage(1);
    };
    //load table
    $scope.load_All = function () {
        var url = `${host}/getData`;
        $http.get(url).then(resp => {
            $scope.originalFlashSaleList = resp.data.flashsalelist;
            $scope.flashsalelist = $scope.originalFlashSaleList;
            $scope.productfsList = resp.data.productfsList;
            $scope.productDetailList = resp.data.productDetailList;
            $scope.productList = resp.data.productList;
            $scope.flashsalelist.sort(function (a, b) {
                return new Date(b.userDate) - new Date(a.userDate);
            });
            // Cập nhật trạng thái Flash Sale

            $scope.loadModelProduct();
            $scope.totalItems = $scope.originalFlashSaleList.length; // Tổng số mục
        }).catch(error => {
            console.log("Error", error);

        });
    }

    //Load model product
    $scope.loadModelProduct = function () {
        $scope.listModelProduct = [];
        $scope.productDetailList.filter(function (item) {
            if (item.product.status === true) {
                $scope.listModelProduct.push(item);
            }
        });
        $scope.totalItemsProFl = $scope.listModelProduct.length;
        console.log("Danh sách sản phẩm có status = 1:", $scope.listModelProduct);

    }
    //Kiểm Tra CheckBox
    // Controller
    $scope.selectAllChecked = false; // Biến cho checkbox "Check All"

    $scope.checkAll = function () {
        // Duyệt qua tất cả các sản phẩm và cập nhật trạng thái của từng sản phẩm
        angular.forEach($scope.listModelProduct, function (item) {
            item.selected = $scope.selectAllChecked;
        });
    }

    $scope.updateSelectAll = function () {
        // Kiểm tra xem tất cả các sản phẩm có đều được chọn không
        var allSelected = $scope.listModelProduct.every(function (item) {
            return item.selected;
        });

        // Cập nhật trạng thái của checkbox "Check All"
        $scope.selectAllChecked = allSelected;
    }


    // Sắp xếp
    $scope.sortBy = function (field) {
        if ($scope.sortField === field) {
            $scope.reverseSort = !$scope.reverseSort;
        } else {
            $scope.sortField = field;
            $scope.reverseSort = false;
        }
    };

    //Save tạm trên model xuống bảng
    $scope.saveTam = function () {
        $scope.listModelProduct.forEach(function (item) {
            if (item.selected) {
                var isDuplicate = $scope.listProductFlashSale.some(function (e) {
                    return e.productDetail.productDetailId === item.productDetailId;
                });

                if (!isDuplicate) {
                    var FlashSaleProduct = {
                        id: null,
                        quantity: 0,
                        usedQuantity: 0,
                        discountPercentage: 0,
                        purchaseLimit: 0,
                        flashSaleId: null,
                        productDetail: item
                    };
                    $scope.listProductFlashSale.push(FlashSaleProduct);
                }
            }
        });

        console.log("Sản phẩm đã chọn: ", $scope.listProductFlashSale);
        $('#exampleModal').modal('hide');
    };


    //Tính số tiền giảm
    $scope.calculateDiscountedPrice = function (product) {
        if (!isNaN(product.discountPercentage)) {
            return product.discountPercentage * product.productDetail.price / 100;
        }
        return 0; // Trả về chuỗi rỗng nếu dữ liệu không hợp lệ
    };

    //Hàm Xóa Product_FlashSale Tạm
    $scope.removeProduct = function (index) {
        // Sử dụng index để xác định hàng cần xóa và loại bỏ nó khỏi danh sách selectedProducts
        $scope.listDeletedProductFlashSale.push($scope.listProductFlashSale[index])
        $scope.listProductFlashSale.splice(index, 1);
    };
    //hàm Save 
    $scope.create = function () {
        var check = $scope.check();
        if (check) {
            var url = `${host}/flashsales`;
            var formattedTime = moment($scope.item.startTime, 'hh:mm A').format('HH:mm:ss');
            var formattedEndTime = moment($scope.item.endTime, 'hh:mm A').format('HH:mm:ss');
            var formatUserDate = moment($scope.item.userDate, 'YYYY-MM-DD').format('YYYY-MM-DD');
            // Tạo dữ liệu yêu cầu POST từ các trường trong form HTML
            var startTime = moment($scope.item.timeRange.split("-")[0], 'HH:mm').format('HH:mm:ss');
            var endTime = moment($scope.item.timeRange.split("-")[1], 'HH:mm').format('HH:mm:ss');

            var requestData = {
                flashSale: {
                    flashSaleId: $scope.item.flashSaleId | null,
                    name: $scope.item.name,
                    startTime: startTime,
                    endTime: endTime,
                    userDate: $scope.item.userDate,
                    status: 1
                },
                productFlashSales: $scope.listProductFlashSale,
                listDeletedProductFlashSale: $scope.listDeletedProductFlashSale
            };
            // Duyệt qua danh sách sản phẩm đã chọn và thêm chúng vào danh sách productFlashSales
            console.log(requestData);
            $http.post(url, requestData).then(resp => {
                console.log("Thêm Flashsale thành công", resp);
                $scope.clearTable();
                Swal.fire({
                    icon: "success",
                    title: "Thành công",
                    text: `Thêm Flash Sale thành công`,
                });

            }).catch(error => {
                console.log("Error", error);
                Swal.fire({
                    icon: "error",
                    title: "Thất bại",
                    text: `Thêm Flash Sale thất bại`,
                });
            });
        }
    }

    //Hàm Reset
    $scope.clearTable = function () {
        $scope.item = {};
        $scope.listProductFlashSale = [];
        $scope.errors = {};
        // Sử dụng $location.search() để xóa tham số "id" và "data" khỏi URL
        $location.search('id', null);
        $location.search('data', null);

        // Sau khi xóa, chuyển hướng lại đến trang /flashsale-form
        $location.path('/flashsale-form');
    };

    //Hàm EDIT
    $scope.edit = function (flashSaleId) {
        var url = `${host}/edit/${flashSaleId}`;
        $http
            .get(url)
            .then(function (resp) {
                $location
                    .path("/flashsale-form")
                    .search({ id: flashSaleId, data: resp.data });
                console.log(resp.data);
            }).catch(function (error) {
                console.log("Error", error);
            });
    }

    

    if ($routeParams.data) {
        // Parse dữ liệu từ tham số data và gán vào $scope.item.
        $scope.item = angular.fromJson($routeParams.data.flashSale);
        $scope.listProductFlashSale = angular.fromJson($routeParams.data.listProductFlashSale);
        if ($scope.item && $scope.item.status === 3) {
            $scope.disableSaveButton = true;
        } else {
            $scope.disableSaveButton = false;
        }
       
        if (!moment($scope.item.startTime).isValid() || !moment($scope.item.endTime).isValid()) {
            // Chuyển đổi chuỗi thời gian thành đối tượng Date
            $scope.item.startTime = moment($scope.item.startTime, 'HH:mm:ss').toDate();
            $scope.item.endTime = moment($scope.item.endTime, 'HH:mm:ss').toDate();
        }

        // Gán giá trị của timeRange bằng giá trị từ $scope.item.startTime và $scope.item.endTime
        $scope.item.timeRange = moment($scope.item.startTime).format('HH:mm') + '-' + moment($scope.item.endTime).format('HH:mm');
    }


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
   // $scope.isUpdating = $scope.item.flashSaleId !== null;
    $scope.checkTimeRangeOverlap = function () {
        if ($scope.flashsalelist && $scope.item && !$scope.item.flashSaleId) {
            var existingFlashSales = $scope.flashsalelist.filter(function (flashSale) {
                var formatTime = function (time) {
                    return moment(time, 'HH:mm:ss.SSSSSSS').format('HH:mm');
                };

                var flashSaleTimeRange = formatTime(flashSale.startTime) + '-' + formatTime(flashSale.endTime);

                var formatUserDate = function (date) {
                    return moment(date).format('YYYY-MM-DD');
                };
                var flashSaleUserDate = formatUserDate(flashSale.userDate);
                var itemUserDate = formatUserDate($scope.item.userDate);

                return (
                    flashSaleUserDate === itemUserDate &&
                    flashSaleTimeRange === $scope.item.timeRange
                );

            });
            return existingFlashSales.length > 0;
        }

        return false;
    };

    $scope.check = function () {
        if ($scope.item) {
            console.log("Ok");
            var flashSaleName = $scope.item.name;
            var userDate = $scope.item.userDate;
            var active = $scope.item.status;
            var timeRange = $scope.item.timeRange;
            $scope.errors = {}; // Đặt lại đối tượng errors

            if (!flashSaleName) {
                $scope.errors.flashSaleName = '*Vui lòng nhập tên FlashSale';
            }
            if (!timeRange) {
                $scope.errors.timeRange = '*Vui lòng chọn thời gian';
            }
            if ($scope.checkTimeRangeOverlap()) {
                $scope.errors.duplicateFlashSale = 'Flash Sale trùng lặp với khoảng thời gian đã có';
            }
            console.log($scope.checkTimeRangeOverlap());

            if (!userDate) {
                $scope.errors.userDate = '*Vui lòng chọn ngày thực hiện';
            }

            if (!active || active == null) {
                $scope.errors.status = '*Vui lòng chọn trạng thái';
            }
            // So sánh ngày bắt đầu và ngày kết thúc
            // So sánh thời gian bắt đầu và kết thúc
            // if (startTime && endTime && endTime.isBefore(startTime)) {
            //     $scope.errors.failTime = '*Giờ kết thúc phải sau giờ bắt đầu';
            // }


            if (!$scope.listProductFlashSale || $scope.listProductFlashSale.length === 0) {
                $scope.errors.listProductFlashSale = 'Vui lòng chọn ít nhất một sản phẩm';
            }

            // =================================================================================================
            angular.forEach($scope.listProductFlashSale, product => {
                if (product.quantity > product.productDetail.quantityInStock) {
                    $scope.errors.quantityOutOfStock = 'Số lượng sản phẩm không đủ';
                }
            })
            console.log($scope.errors);
            var hasErrors = Object.keys($scope.errors).length > 0;

            return !hasErrors && !$scope.checkTimeRangeOverlap();
        }
    }

    //////////////////////////HÀM CỦA PRODUCT FLASHSALE/////////////////////////////////
    $scope.currentPageProFl = 1; // Trang hiện tại
    $scope.itemsPerPageProFl = 5; // Số mục hiển thị trên mỗi trang
    $scope.maxSizeProFl = 5;
    $scope.itemsPerPageOptionsProFl = [5, 12, 24, 32, 64, 128];
    $scope.selectedItemsPerPageProFl = 5; // Khởi tạo giá trị mặc định cho số mục trên mỗi trang
    $scope.searchTextProFl = "";
    // Hàm tính toán số trang dựa trên số lượng mục và số mục trên mỗi trang
    $scope.getNumOfPagesProFl = function () {
        return Math.ceil($scope.totalItemsProFl / $scope.itemsPerPageProFl);
    };

    // Hàm chuyển đổi trang
    $scope.setPageProFl = function (pageNo) {
        $scope.currentPageProFl = pageNo;
    };

    $scope.calculateRangeProFl = function () {
        var startIndex = ($scope.currentPageProFl - 1) * $scope.itemsPerPageProFl + 1;
        var endIndex = $scope.currentPageProFl * $scope.itemsPerPageProFl;

        if (endIndex > $scope.totalItemsProFl) {
            endIndex = $scope.totalItemsProFl;
        }

        return startIndex + ' đến ' + endIndex + ' trên tổng số ' + $scope.totalItemsProFl + ' mục';
    };

    $scope.searchDataProFl = function () {
        // Lọc danh sách gốc bằng searchText
        if (!$scope.originalModelProductList) {
            $scope.originalModelProductList = angular.copy($scope.listModelProduct);
        }

        $scope.listModelProduct = $scope.originalModelProductList.filter(function (item) {
            // Thực hiện tìm kiếm trong các thuộc tính cần thiết của item
            return (
                item.product.productName.toLowerCase().includes($scope.searchTextProFl.toLowerCase())
            );
        });
        $scope.totalItemsProFl = $scope.searchTextProFl ? $scope.listModelProduct.length : $scope.originalModelProductList.length;
        $scope.setPageProFl(1);
    };

    //Xuất EXCEL
    $scope.exportToExcel = function () {
        // Lấy toàn bộ dữ liệu từ server khi tải trang ban đầu
        $scope.load_All();

        // Tạo mảng dữ liệu cho tệp Excel
        var excelData = [
            ['BÁO CÁO - DANH SÁCH CHIẾN DỊCH FLASH SALE'], // Header
            [], // Empty row for spacing
            ['#', 'Mã Flash Sale', 'Tên Flash Sale', 'Bắt Đầu', 'Kết Thúc', 'Ngày Sale', 'Trạng Thái']
        ];

        // Sử dụng $filter để định dạng ngày
        var dateFilter = $filter('date');

        $scope.flashsalelist.forEach(function (item, index) {
            excelData.push([
                index + 1,
                item.flashSaleId,
                item.name,
                item.startTime,
                item.endTime,
                dateFilter(item.userDate, 'dd/MM/yyyy'),
                getStatusText(item.status)
            ]);
        });

        // Đặt độ rộng cố định cho từng cột
        var colWidths = [10, 20, 30, 30, 30, 50, 50];

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

        var wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Danh sách chiến dịch flash sale');

        // Xuất tệp Excel
        XLSX.writeFile(wb, 'danh_sach_chien_dich_flash_sale.xlsx');
    }


    // Định nghĩa hàm formatDate để định dạng ngày in
    function formatDate(date) {
        var day = date.getDate();
        var month = date.getMonth() + 1;
        var year = date.getFullYear();
        var hours = date.getHours();
        var minutes = date.getMinutes();
        var seconds = date.getSeconds();

        // Định dạng thời gian thành chuỗi 'HH:mm:ss'
        var time = [hours, minutes, seconds].map(function (unit) {
            return (unit < 10 ? '0' : '') + unit;
        }).join(':');

        // Định dạng ngày thành chuỗi 'dd/MM/yyyy'
        var formattedDate = [(day < 10 ? '0' : '') + day, (month < 10 ? '0' : '') + month, year].join('/');

        return formattedDate + ' ' + time;
    }

    $scope.printPDF = function () {
        var headerTable = {
            table: {
                headerRows: 1,
                widths: [20, 60, 100, 70, 70, 70, 80],
                body: [
                    [{ text: '#', alignment: 'center', fontSize: 11 }, // Căn giữa cột '#'
                    { text: 'Mã Flash Sale', alignment: 'center', fontSize: 11 }, // Căn giữa cột 'Mã hóa đơn'
                    { text: 'Tên Flash Sale', alignment: 'center', fontSize: 11 },
                    { text: 'Bắt Đầu', alignment: 'center', fontSize: 11 },
                    { text: 'Kết Thúc', alignment: 'center', fontSize: 11 },
                    { text: 'Ngày Sale', alignment: 'center', fontSize: 11 },
                    { text: 'Trạng Thái', alignment: 'center', fontSize: 11 },
                    ]
                ]
            }
        };

        var bodyTable = {
            table: {
                widths: [20, 60, 100, 70, 70, 70, 80],
                body: $scope.flashsalelist.map((item, index) => [
                    { text: (index + 1).toString(), alignment: 'center', fontSize: 11 },
                    { text: item.flashSaleId, alignment: 'center', fontSize: 11 },
                    { text: item.name, fontSize: 11 },
                    { text: item.startTime, alignment: 'center', fontSize: 11 },
                    { text: item.endTime, alignment: 'center', fontSize: 11 },
                    { text: moment(item.userDate).format('DD/MM/YYYY'), alignment: 'center', fontSize: 11 },
                    { text: getStatusText(item.status), fontSize: 11 }
                ])
            }
        };
        var docDefinition = {
            pageOrientation: 'portrait',
            pageSize: 'A4',
            content: [
                { text: 'Danh sách chiến dịch flash sale', style: 'header' },
                ' ',
                { text: 'Ngày in: ' + moment().format('DD/MM/YYYY'), alignment: 'right', fontSize: 12 },
                ' ',
                headerTable,
                bodyTable
            ],
            styles: {
                header: {fontSize: 16, bold: true, alignment: 'center'},
                default: {fontSize: 14}
            }
        };

        pdfMake.createPdf(docDefinition).open();

        // var docDefinition = {
        //     pageOrientation: 'portrait',
        //     pageSize: 'A4',
        //     content: [
        //         { text: 'Danh sách hàng hóa trong kho', style: 'header' },
        //         ' ',
        //         { text: 'Ngày in: ' + moment().format('DD/MM/YYYY'), alignment: 'right', fontSize: 12 },
        //         ' ',
        //         headerTable,
        //         bodyTable
        //     ],
        //     styles: {
        //         header: { fontSize: 16, bold: true, alignment: 'center' },
        //         default: { fontSize: 14 }
        //     }
        // };

        // var pdfDoc = pdfMake.createPdf(docDefinition);

        // // Đặt tên tệp PDF dựa trên tên tùy chỉnh, ví dụ: "danh_sach_flash_sale.pdf"
        // var customFileName = "danh_sach_flash_sale.pdf";

        // // Sử dụng FileSaver.js để tải về tệp PDF với tên tùy chỉnh
        // pdfDoc.getBlob((blob) => {
        //     saveAs(blob, customFileName);
        // });
    };

    // Hàm để lấy văn bản dựa trên giá trị của item.status
    function getStatusText(status) {
        switch (status) {
            case 1:
                return 'Đã lên lịch';
            case 2:
                return 'Đang sử dụng';
            case 3:
                return 'Hết hạn';
            default:
                return 'Không xác định'; // Hoặc bạn có thể thay đổi văn bản mặc định theo nhu cầu
        }
    }

}


// $scope.updateFlashSaleStatus = function () {
//     var url = `${host}/updateFlashSaleStatus`;
//     angular.forEach($scope.flashsalelist, function (flashSale) {
//         var currentDate = new Date(); // Lấy ngày hiện tại
//         var useDate = new Date(flashSale.userDate); // Lấy ngày sử dụng từ Flash Sale

//         // Chỉ cập nhật nếu trạng thái không phải là đã sử dụng (3) và sau ngày hiện tại
//         if ( currentDate > useDate) {
//             // Nếu ngày hiện tại lớn hơn ngày sử dụng, cập nhật trạng thái thành đã sử dụng (3)
//             $http.put(url).then(function (response) {
//                 // Xử lý phản hồi thành công
//                 alert(response.data); // Hiển thị thông báo thành công
//             }).catch(function (error) {
//                 // Xử lý lỗi
//                 console.error(error.data); // Log lỗi ra console
//                 alert('Có lỗi xảy ra khi cập nhật trạng thái Flash Sale');
//             });
//         }
//     });

// }


