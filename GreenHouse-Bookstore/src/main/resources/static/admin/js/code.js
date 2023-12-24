var table = document.getElementById('table-nhapkho');
var cells = table.getElementsByTagName('td');


for (var i = 0; i < cells.length; i++) {
  cells[i].addEventListener('click', function () {
    var cell = this;
    if (cell.getAttribute('contenteditable') !== 'true') {
      cell.setAttribute('contenteditable', 'true');
      cell.focus();

      cell.addEventListener('blur', function () {
        cell.removeAttribute('contenteditable');
        var newText = cell.textContent;
        var origText = cell.getAttribute('data-original-text');
        
        if (newText !== origText) {
          // Có sự thay đổi, xử lý lưu dữ liệu ở đây (Ajax hoặc các bước khác)
          console.log(origText + ' đã thay đổi thành ' + newText);
        } else {
          console.log('Không có sự thay đổi');
        }
      });

      cell.addEventListener('keydown', function (event) {
        if (event.key === 'Enter') {
          cell.blur();
        }
      });

      cell.addEventListener('dblclick', function (event) {
        event.preventDefault(); // Tránh xảy ra sự kiện dblclick khi chỉnh sửa
      });
      
      // Lưu giá trị ban đầu vào thuộc tính data để so sánh sau này
      cell.setAttribute('data-original-text', cell.textContent);
    }
  });
}
