// Đăng ký controller và định nghĩa hàm StaticOvertime
app.controller("StaticOvertime", StaticOvertime);

function StaticOvertime($scope, $http, $filter) {
    // Khai báo và khởi tạo giá trị ban đầu cho biến tổng doanh thu, tổng chi phí, và tổng lợi nhuận
    $scope.totalRevenueBySearch = 0;
    $scope.totalExpenseBySearch = 0;
    $scope.totalProfitBySearch = 0;

    $scope.calculateTotalRevenueForCurrentYear = 0;
    $scope.calculateTotalRevenueForLastYear = 0;
    $scope.calculateTotalRevenueForCurrentMonth = 0;

    // Xử lý sự kiện khi thay đổi route
    $scope.$on('$routeChangeSuccess', function (event, current, previous) {
        $scope.page.setTitle(current.$$route.title || 'Thống kê hàng tồn kho');
        $scope.loadStaticOvertime();
    });

    $scope.errorMessages = {
        dateError: ''
    };

    // Khai báo và khởi tạo biến dữ liệu liên quan đến invoice
    $scope.invoice = [];
    $scope.years = [];
    $scope.searchText = "";
    $scope.itemsPerPageOptions = [5, 12, 24, 32, 64, 128];
    let host = "http://localhost:8081/rest/static_overtime";
    $scope.originalInvoice = [];
    $scope.invoiceRepeat = [];
    $scope.selectedItemsPerPage = 5;
    $scope.currentPage = 1;
    $scope.itemsPerPage = 5;
    $scope.totalItems = 0;
    $scope.maxSize = 5;

    // Hàm tính số trang dựa trên số mục hiển thị và tổng số mục
    $scope.getNumOfPages = function () {
        return Math.ceil($scope.totalItems / $scope.itemsPerPage);
    };

    // Hàm chuyển đổi trang
    $scope.setPage = function (pageNo) {
        $scope.currentPage = pageNo;
    };

    // Hàm tính phạm vi hiển thị của mục trên trang
    $scope.calculateRange = function () {
        var startIndex = ($scope.currentPage - 1) * $scope.itemsPerPage + 1;
        var endIndex = $scope.currentPage * $scope.itemsPerPage;
        if (endIndex > $scope.totalItems) {
            endIndex = $scope.totalItems;
        }
        return startIndex + ' đến ' + endIndex + ' trên tổng số ' + $scope.totalItems + ' mục';
    };

    // Hàm cập nhật dữ liệu hiển thị trên trang
    $scope.updateVisibleData = function () {
        var startIndex = ($scope.currentPage - 1) * $scope.itemsPerPage;
        var endIndex = startIndex + $scope.itemsPerPage;
        $scope.invoiceRepeat = $scope.invoice.slice(startIndex, endIndex);
    };

    $scope.isDataChanged = false;

    // Hàm theo dõi thay đổi dữ liệu hiển thị
    $scope.$watch('invoiceRepeat', function (newValue, oldValue) {
        if (newValue !== oldValue) {
            $scope.isDataChanged = true;
        }
    }, true);

    // Hàm theo dõi thay đổi trang và số mục hiển thị
    $scope.$watchGroup(['currentPage', 'itemsPerPage'], function () {
        if ($scope.isDataChanged) {
            $scope.updateVisibleData();
            $scope.isDataChanged = false;
        }
    });

    // Hàm tải dữ liệu từ server
    $scope.loadStaticOvertime = function () {
        var url = `${host}`;
        $http.get(url).then(resp => {
            $scope.originalInvoice = resp.data.invoice;
            $scope.invoice = $scope.originalInvoice;
            $scope.invoiceDetails = resp.data.invoiceDetail;
            $scope.totalItems = $scope.invoice.length;
            $scope.calculateTotalRevenueForCurrentYear = resp.data.calculateTotalRevenueForCurrentYear;
            $scope.calculateTotalRevenueForLastYear = resp.data.calculateTotalRevenueForLastYear;
            $scope.calculateTotalRevenueForCurrentMonth = resp.data.calculateTotalRevenueForCurrentMonth;
            $scope.percent = resp.data.percent;
            $scope.years = resp.data.year;
            // $scope.year = resp.data.percent;
            $scope.updateVisibleData();
            $scope.calculateTotalProfit();
            $scope.updateSelectedYear();
            // $scope.calculateMonthlyRevenues($scope.selectedYear); // Thay đổi để truyền năm cụ thể
            // Thêm logic khác (nếu cần) dựa trên dữ liệu được tải từ API
        }).catch(error => {
            console.log("Error", error);
        });
    };

    $scope.selectedYear = new Date().getFullYear().toString();
    $scope.years = [[$scope.selectedYear]]; // Ban đầu chỉ có năm hiện tại

    $scope.updateSelectedYear = function () {
        $scope.calculateMonthlyRevenues($scope.selectedYear);
    };


    $scope.calculateMonthlyRevenues = function (selectedYear) {
        // Đặt tất cả giá trị doanh thu hàng tháng về 0
        $scope.monthlyRevenues = new Array(12).fill(0);

        $scope.invoice.forEach(function (item) {
            var invoiceDate = new Date(item.paymentDate);
            var year = invoiceDate.getFullYear();

            if (year === parseInt(selectedYear)) {
                var month = invoiceDate.getMonth();
                var revenue = item.totalAmount;

                $scope.monthlyRevenues[month] += revenue;
            }
        });

        // Cập nhật biểu đồ
        var ctx = document.getElementById('monthlyRevenueChart').getContext('2d');
        var labels = ["Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4", "Tháng 5", "Tháng 6", "Tháng 7", "Tháng 8", "Tháng 9", "Tháng 10", "Tháng 11", "Tháng 12"];
        var data = $scope.monthlyRevenues;

        if ($scope.monthlyRevenueChart) {
            $scope.monthlyRevenueChart.destroy();
        }
        $scope.monthlyRevenueChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'VNĐ',
                    data: data,
                    backgroundColor: 'rgb(48,207,48, 0.5)',
                    borderColor: 'rgba(75, 192, 192, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    };


    $scope.dateNow = new Date();
    $scope.listInvoiceSearch = [];

    // Hàm tìm kiếm dữ liệu dựa trên ngày bắt đầu và ngày kết thúc
    $scope.searchByDate = function () {
        var dateS = $filter('date')($scope.dateStart, "yyyy-MM-dd");
        var dateE = $filter('date')($scope.dateEnd, "yyyy-MM-dd");

        if (dateS === null && dateE === null) {
            $scope.errorMessages.dateError = '';

            // Đặt lại dữ liệu của invoice và invoiceDetails thành dữ liệu mặc định
            $scope.invoice = $scope.originalInvoice;
            $scope.totalItems = $scope.invoice.length;
            $scope.updateVisibleData();
            // $scope.invoiceDetails =filteredInvoiceDetails; // Nếu bạn có dữ liệu mặc định khác

            // Tính lại tổng doanh thu, chi phí và lợi nhuận dựa trên dữ liệu ban đầu
            $scope.calculateTotalProfit();
            return;

        } else if (!dateS || !dateE) {
            $scope.errorMessages.dateError = 'Vui lòng nhập đầy đủ ngày bắt đầu và ngày kết thúc';
            return;
        } else if (dateS > dateE) {
            $scope.errorMessages.dateError = 'Ngày bắt đầu không thể lớn hơn ngày kết thúc';
            return;
        } else {
            $scope.errorMessages.dateError = '';
        }

        // Lọc dữ liệu dựa trên ngày bắt đầu và ngày kết thúc trong bản sao
        var filteredInvoice = $scope.originalInvoice.filter(function (item) {
            var invoiceDate = $filter('date')(item.paymentDate, "yyyy-MM-dd");
            return (invoiceDate >= dateS) && (invoiceDate <= dateE);
        });

        // Cập nhật dữ liệu tìm kiếm cho invoice
        $scope.invoice = filteredInvoice;
        $scope.totalItems = filteredInvoice.length;
        $scope.updateVisibleData();

        // Lọc dữ liệu dựa trên ngày bắt đầu và ngày kết thúc trong invoiceDetails
        var filteredInvoiceDetails = $scope.invoiceDetails.filter(function (item) {
            var invoiceDate = $filter('date')(item.invoice.paymentDate, "yyyy-MM-dd");
            return (invoiceDate >= dateS) && (invoiceDate <= dateE);
        });

        // Cập nhật dữ liệu tìm kiếm cho invoiceDetails
        $scope.invoiceDetails = filteredInvoiceDetails;

        // Tính tổng doanh thu, chi phí và lợi nhuận dựa trên dữ liệu tìm kiếm
        $scope.calculateTotalProfit();
    };

    // Hàm đặt lại bộ lọc
    $scope.resetFilters = function () {
        // Xóa giá trị của ngày bắt đầu và ngày kết thúc
        $scope.dateStart = null;
        $scope.dateEnd = null;

        // Trả lại dữ liệu của bảng về trạng thái ban đầu
        $scope.invoice = $scope.originalInvoice;
        $scope.totalItems = $scope.invoice.length;
        $scope.updateVisibleData();

        // Trả lại dữ liệu của invoiceDetails về trạng thái ban đầu
        $scope.invoiceDetails = resp.data.invoiceDetail;

        // Tính lại tổng doanh thu, chi phí và lợi nhuận dựa trên dữ liệu ban đầu
        $scope.calculateTotalProfit();
    };

    // Hàm tính tổng doanh thu, chi phí và lợi nhuận
    $scope.calculateTotalProfit = function () {
        // Tính tổng doanh thu từ invoiceDetails
        $scope.totalRevenueBySearch = $scope.invoiceDetails.reduce(function (total, item) {
            return total + (item.priceDiscount * item.quantity);
        }, 0);

        // Tính tổng chi phí từ invoiceDetails
        $scope.totalExpenseBySearch = $scope.invoiceDetails.reduce(function (total, item) {
            return total + (item.price * item.quantity);
        }, 0);

        // Tính tổng lợi nhuận
        $scope.totalProfitBySearch = $scope.totalRevenueBySearch - $scope.totalExpenseBySearch;
    };

    // Hàm lấy danh sách chi tiết hóa đơn dựa trên ID hóa đơn
    $scope.getListInvoiceDetailByInvoiceId = function (invoiceId) {
        return $scope.invoiceDetails.filter(a => a.invoice.invoiceId === invoiceId);
    };
    $scope.exportToExcel = function () {
        // Lấy toàn bộ dữ liệu từ server khi tải trang ban đầu
        // $scope.loadStaticOvertime();

        // Bây giờ, $scope.invoice sẽ chứa toàn bộ dữ liệu từ tất cả các trang

        // Tạo mảng dữ liệu cho tệp Excel
        var excelData = [
            ['BÁO CÁO - DANH SÁCH ĐƠN HÀNG'], // Header
            [], // Empty row for spacing
            ['#', 'Mã hóa đơn', 'Tên khách hàng', 'Ngày tạo', 'Tổng tiền', 'Phí ship', 'Tiền thanh toán', 'Ngày thanh toán']
        ];

        $scope.invoice.forEach(function (item, index) {
            excelData.push([
                index + 1,
                item.invoiceId,
                item.account.fullname,
                $filter('date')(item.createDate, 'dd/MM/yyyy'),
                $filter('number')(item.totalAmount, 0),
                $filter('number')(item.shippingFee, 0),
                $filter('number')(item.paymentAmount, 0),
                $filter('date')(item.paymentDate, 'dd/MM/yyyy')
            ]);
        });

        // Sử dụng thư viện XLSX để tạo tệp Excel
        var ws = XLSX.utils.aoa_to_sheet(excelData);

        // Đặt độ rộng cố định cho từng cột
        var colWidths = [10, 15, 20, 15, 15, 15, 15, 15];
        ws['!cols'] = colWidths.map(function (width) {
            return {wch: width};
        });

        // Căn giữa dữ liệu trong từng cột (trừ hàng đầu tiên)
        for (var row = 1; row < excelData.length; row++) {
            for (var col = 0; col < excelData[row].length; col++) {
                var cellAddress = XLSX.utils.encode_cell({r: row, c: col});
                var cell = ws[cellAddress];

                if (cell && !cell.s) {
                    cell.s = {};
                }

                if (cell && cell.s) {
                    cell.s.alignment = {horizontal: 'center'};
                }
            }
        }

        var wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Danh sách đơn hàng');

        // Xuất tệp Excel
        XLSX.writeFile(wb, 'danh_sach_don_hang.xlsx');
    };

    // Định nghĩa hàm formatDate để định dạng ngày in
    function formatDate(date) {
        var options = {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        };
        return date.toLocaleString('en-US', options);
    }


    $scope.printPDF = function () {
        var headerTable = {
            table: {
                headerRows: 1,
                widths: [20, 30, 110, 60, 60, 40, 60, 60],
                body: [
                    [{ text: '#', alignment: 'center', fontSize: 11 }, // Căn giữa cột '#'
                    { text: 'Mã hóa đơn', alignment: 'center', fontSize: 11 }, // Căn giữa cột 'Mã hóa đơn'
                    { text: 'Tên khách hàng', alignment: 'center', fontSize: 11 }, // Căn giữa cột 'Tên khách hàng'
                    { text: 'Ngày tạo', alignment: 'center', fontSize: 11 }, // Căn giữa cột 'Ngày tạo'
                    { text: 'Tổng tiền', alignment: 'center', fontSize: 11 }, // Căn giữa cột 'Tổng tiền'
                    { text: 'Phí ship', alignment: 'center', fontSize: 11 }, // Căn giữa cột 'Phí ship'
                    { text: 'Tiền thanh toán', alignment: 'center', fontSize: 11 }, // Căn giữa cột 'Tiền thanh toán'
                    { text: 'Ngày thanh toán', alignment: 'center', fontSize: 11 }] // Căn giữa cột 'Ngày thanh toán'
                ]
            }
        };

        var bodyTable = {
            table: {
                widths: [20, 30, 110, 60, 60, 40, 60, 60],
                body: $scope.invoice.map((item, index) => [
                    { text: (index + 1).toString(), alignment: 'center', fontSize: 11 }, // Đặt kích thước font cho cột '#'
                    { text: item.invoiceId, alignment: 'center', fontSize: 11 }, // Đặt kích thước font cho cột 'Mã hóa đơn'
                    { text: item.account.fullname, fontSize: 11 }, // Không đặt kích thước font cho cột 'Tên khách hàng'
                    { text: $filter('date')(item.createDate, 'dd/MM/yyyy'), alignment: 'center', fontSize: 11 }, // Đặt kích thước font cho cột 'Ngày tạo'
                    { text: $filter('number')(item.totalAmount, 0), alignment: 'center', fontSize: 11 }, // Đặt kích thước font cho cột 'Tổng tiền'
                    { text: $filter('number')(item.shippingFee, 0), alignment: 'center', fontSize: 11 }, // Đặt kích thước font cho cột 'Phí ship'
                    { text: $filter('number')(item.paymentAmount, 0), alignment: 'center', fontSize: 11 }, // Đặt kích thước font cho cột 'Tiền thanh toán'
                    { text: $filter('date')(item.paymentDate, 'dd/MM/yyyy'), alignment: 'center', fontSize: 11 } // Đặt kích thước font cho cột 'Ngày thanh toán'
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
                header: {fontSize: 16, bold: true, alignment: 'center'},
                default: {fontSize: 14}
            }
        };

        pdfMake.createPdf(docDefinition).open();
    };

    // Xử lý sự kiện bấm nút "Hiện/Ẩn doanh thu"
    // const toggleButton = document.getElementById("toggleButtonText");
    // const bodyProfitCollapse = document.getElementById("bodyProfitCollapse");
    // toggleButton.addEventListener("click", function () {
    //     if (bodyProfitCollapse.classList.contains("show")) {
    //         toggleButton.textContent = "Hiện doanh thu";
    //     } else {
    //         toggleButton.textContent = "Ẩn doanh thu";
    //     }
    // });
}
