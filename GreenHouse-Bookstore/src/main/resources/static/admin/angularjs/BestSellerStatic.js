app.controller("BestSellerController", BestSellerController);

function BestSellerController($scope, $location, $routeParams, $http) {
    $scope.$on('$routeChangeSuccess', function (event, current, previous) {
        $scope.page.setTitle(current.$$route.title || ' Sản phẩm bán chạy');
        $scope.loadBestSellers();
    });

    $scope.isEditing = false;
    $scope.bestsellers = [];
    $scope.searchText = "";

    // Khai báo danh sách tùy chọn cho số mục trên mỗi trang
    $scope.itemsPerPageOptions = [5, 12, 24, 32, 64, 128];
    let host = "http://localhost:8081/rest/best-seller"; // Có thể cần chỉnh sửa URL tương ứng
    $scope.selectedItemsPerPage = 5;
    $scope.currentPage = 1;
    $scope.itemsPerPage = 5;
    $scope.totalItems = $scope.bestsellers.length;
    $scope.maxSize = 5;
    $scope.reverseSort = false;

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

    $scope.loadBestSellers = function () {
        var url = `${host}`;
        $http.get(url).then(resp => {
            // Hiển thị hiệu ứng loading khi người dùng xác nhận cập nhật
            loadingOverlay.style.display = "block";
            $scope.originalBestseller = $scope.bestsellers;
            $scope.bestsellers = resp.data;
            console.log("success", resp.data);
            $scope.totalItems = $scope.bestsellers.length;
            // Ẩn hiệu ứng loading khi lưu thành công
            loadingOverlay.style.display = "none";
        }).catch(error => {
            // Ẩn hiệu ứng loading khi lưu thành công
            loadingOverlay.style.display = "none";
            console.log("Error", error);
        });
    };

    $scope.searchData = function () {
        // Lọc danh sách gốc bằng searchText
        $scope.bestsellers = $scope.originalBestseller.filter(function (item) {
            return item[0].toString().includes($scope.searchText) || // ID
                item[1].toLowerCase().includes($scope.searchText.toLowerCase()) || // Tên sản phẩm
                item[4].toString().includes($scope.searchText); // Trạng thái tồn kho
        });
        $scope.totalItems = $scope.searchText ? $scope.bestsellers.length : $scope.originalBestseller.length;
        $scope.setPage(1);
    };

    $scope.exportToExcel = function () {
        // Lấy toàn bộ dữ liệu từ server khi tải trang ban đầu
        $scope.loadBestSellers();

        // Bây giờ, $scope.invoice sẽ chứa toàn bộ dữ liệu từ tất cả các trang

        // Tạo mảng dữ liệu cho tệp Excel
        var excelData = [
            ['BÁO CÁO - DANH SÁCH SẢN PHẨM TỒN TRONG KHO'], // Header
            [], // Empty row for spacing
            ['#', 'ID', 'Tên sản phẩm', 'Số lượng tồn', 'Số lượng đã bán', 'Điểm đánh giá trung bình']
        ];

        $scope.bestsellers.forEach(function (item, index) {
            excelData.push([
                index + 1,
                item[0],
                item[1],
                item[2],
                item[4],
                item[5],
            ]);
        });
        // Đặt độ rộng cố định cho từng cột
        var colWidths = [10, 10, 50, 15, 15, 15];

        // Sử dụng thư viện XLSX để tạo tệp Excel
        var ws = XLSX.utils.aoa_to_sheet(excelData);

        // Đặt độ rộng cố định cho các cột
        for (var i = 0; i < colWidths.length; i++) {
            ws['!cols'] = ws['!cols'] || [];
            ws['!cols'].push({ wch: colWidths[i] });
        }

        var wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Danh sách sản phẩm bán chạy');

        // Xuất tệp Excel
        XLSX.writeFile(wb, 'danh_sach_san_pham_ban_chay.xlsx');
    }


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
                widths: [20, 40, 180, 70, 70, 70],
                body: [
                    [{text: '#', alignment: 'center', fontSize: 11}, // Căn giữa cột '#'
                        {text: 'ID', alignment: 'center', fontSize: 11}, // Căn giữa cột 'Mã hóa đơn'
                        {text: 'Tên sản phảm', alignment: 'center', fontSize: 11}, // Căn giữa cột 'Tên khách hàng'
                        {text: 'Số lượng tồn', alignment: 'center', fontSize: 11}, // Căn giữa cột 'Ngày tạo'
                        {text: 'Số lượng đã bán', alignment: 'center', fontSize: 11}, // Căn giữa cột 'Tổng tiền'
                        {text: 'Điểm đánh giá trung bình', alignment: 'center', fontSize: 11}] // Căn giữa cột 'Ngày thanh toán'
                ]
            }
        };

        bodyTable = {
            table: {
                widths: [20, 40, 180, 70, 70, 70],
                body: $scope.bestsellers.map((item, index) => [
                    {text: (index + 1).toString(), alignment: 'center', fontSize: 11},
                    {text: item[0], alignment: 'center', fontSize: 11}, // Chỉnh sửa để lấy ID sản phẩm từ item[0]
                    {text: item[1], fontSize: 11},
                    {text: item[2], alignment: 'center', fontSize: 11},
                    {text: item[4], alignment: 'center', fontSize: 11},
                    {text: item[5], alignment: 'center', fontSize: 11}
                ])
            }
        };

        var docDefinition = {
            pageOrientation: 'portrait',
            pageSize: 'A4',
            content: [
                { text: 'Danh sách sản phẩm bán chạy', style: 'header' },
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
    $scope.loadBestSellers();
}
