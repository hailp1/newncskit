import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Calendar, Clock, User, ArrowLeft, Share2, BookOpen, TrendingUp, CheckCircle, Lightbulb, AlertTriangle } from 'lucide-react'

export default function PhanTichNhanToPage() {
  return (
    <div className="bg-white">
      {/* Navigation */}
      <div className="border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link href="/blog" className="inline-flex items-center text-blue-600 hover:text-blue-800">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Về trang Blog
          </Link>
        </div>
      </div>

      {/* Article Header */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-8">
          <Badge className="bg-blue-100 text-blue-800 mb-4">Phân tích thống kê</Badge>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Phân tích nhân tố EFA và CFA: Hướng dẫn từ A đến Z
          </h1>
          <p className="text-xl text-gray-600 mb-6">
            Tìm hiểu cách phân tích nhân tố khám phá (EFA) và khẳng định (CFA) một cách dễ hiểu nhất. 
            Từ lý thuyết đến thực hành với NCSKIT - không khó như bạn nghĩ đâu!
          </p>
          
          <div className="flex items-center justify-center space-x-6 text-sm text-gray-500 mb-8">
            <div className="flex items-center">
              <User className="h-4 w-4 mr-2" />
              Lê Phúc Hải
            </div>
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-2" />
              15 tháng 1, 2024
            </div>
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-2" />
              12 phút đọc
            </div>
          </div>

          <div className="flex justify-center space-x-4">
            <Button variant="outline" size="sm">
              <Share2 className="h-4 w-4 mr-2" />
              Chia sẻ
            </Button>
            <Button variant="outline" size="sm">
              <BookOpen className="h-4 w-4 mr-2" />
              Lưu bài
            </Button>
          </div>
        </div>

        {/* Article Content */}
        <div className="prose prose-lg max-w-none">
          {/* Introduction */}
          <div className="bg-blue-50 border-l-4 border-blue-500 p-6 mb-8">
            <h3 className="text-lg font-semibold text-blue-900 mb-2 flex items-center">
              <Lightbulb className="h-5 w-5 mr-2" />
              Bạn sẽ học được gì?
            </h3>
            <ul className="text-blue-800 space-y-1">
              <li>• Phân tích nhân tố là gì và tại sao cần dùng</li>
              <li>• Phân biệt EFA và CFA một cách đơn giản</li>
              <li>• Thực hành từng bước với NCSKIT</li>
              <li>• Cách đọc và giải thích kết quả</li>
              <li>• Ví dụ thực tế và những lưu ý quan trọng</li>
            </ul>
          </div>

          <h2>Phân tích nhân tố là cái gì vậy?</h2>
          <p>
            Hãy tưởng tượng bạn có một bộ câu hỏi khảo sát với 20 câu hỏi về sự hài lòng của khách hàng. 
            Thay vì phân tích từng câu một (mệt lắm!), phân tích nhân tố giúp bạn gom những câu hỏi 
            tương tự nhau thành các "nhóm" hay "nhân tố". Ví dụ: nhóm về chất lượng sản phẩm, 
            nhóm về dịch vụ khách hàng, nhóm về giá cả...
          </p>

          <p>
            Nói đơn giản, phân tích nhân tố giúp bạn <strong>"gọn gàng hóa"</strong> dữ liệu phức tạp 
            thành những khái niệm dễ hiểu hơn. Như việc dọn tủ quần áo vậy - thay vì để lung tung, 
            bạn phân loại thành áo, quần, váy... để dễ tìm và sử dụng.
          </p>

          <div className="bg-yellow-50 border-l-4 border-yellow-500 p-6 mb-8">
            <h4 className="font-semibold text-yellow-900 mb-2 flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2" />
              Lưu ý quan trọng
            </h4>
            <p className="text-yellow-800">
              Phân tích nhân tố không phải là "phép màu" tự động tìm ra nhân tố cho bạn. 
              Bạn vẫn cần hiểu biết lý thuyết và logic để giải thích kết quả một cách có ý nghĩa!
            </p>
          </div>

          <h2>EFA vs CFA: Khác nhau như thế nào?</h2>
          
          <h3>EFA - Phân tích nhân tố khám phá (Exploratory Factor Analysis)</h3>
          <p>
            EFA giống như việc bạn đi "khám phá" xem trong dữ liệu có những nhân tố gì. 
            Bạn chưa biết trước sẽ có bao nhiêu nhân tố, câu hỏi nào thuộc nhân tố nào. 
            Cứ cho dữ liệu vào, để máy tính "tìm hiểu" và báo cáo lại cho bạn.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <Card className="border-green-200 bg-green-50">
              <CardHeader>
                <CardTitle className="text-lg text-green-800">Khi nào dùng EFA?</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-green-700 space-y-2">
                  <li>• Phát triển thang đo mới</li>
                  <li>• Chưa biết cấu trúc nhân tố</li>
                  <li>• Muốn khám phá dữ liệu</li>
                  <li>• Bước đầu tiên trước khi làm CFA</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-blue-200 bg-blue-50">
              <CardHeader>
                <CardTitle className="text-lg text-blue-800">Ưu điểm của EFA</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-blue-700 space-y-2">
                  <li>• Linh hoạt, không ràng buộc</li>
                  <li>• Phát hiện cấu trúc ẩn</li>
                  <li>• Dễ thực hiện</li>
                  <li>• Phù hợp nghiên cứu sơ bộ</li>
                </ul>
              </CardContent>
            </Card>
          </div>

          <h3>CFA - Phân tích nhân tố khẳng định (Confirmatory Factor Analysis)</h3>
          <p>
            CFA thì ngược lại - bạn đã có "giả thuyết" trước về cấu trúc nhân tố rồi. 
            Ví dụ: "Tôi nghĩ rằng sự hài lòng khách hàng gồm 3 nhân tố: chất lượng sản phẩm, 
            dịch vụ, và giá cả". CFA sẽ kiểm tra xem giả thuyết của bạn có đúng không.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <Card className="border-purple-200 bg-purple-50">
              <CardHeader>
                <CardTitle className="text-lg text-purple-800">Khi nào dùng CFA?</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-purple-700 space-y-2">
                  <li>• Kiểm tra lý thuyết có sẵn</li>
                  <li>• Xác nhận kết quả EFA</li>
                  <li>• Đánh giá thang đo</li>
                  <li>• Chuẩn bị cho phân tích SEM</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-orange-200 bg-orange-50">
              <CardHeader>
                <CardTitle className="text-lg text-orange-800">Ưu điểm của CFA</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-orange-700 space-y-2">
                  <li>• Kiểm tra chính xác</li>
                  <li>• Có chỉ số độ phù hợp</li>
                  <li>• Đánh giá độ tin cậy</li>
                  <li>• Cơ sở cho SEM</li>
                </ul>
              </CardContent>
            </Card>
          </div>

          <h2>Thực hành EFA với NCSKIT - Từng bước một</h2>
          
          <h3>Bước 1: Chuẩn bị dữ liệu</h3>
          <p>
            Trước khi bắt đầu, hãy đảm bảo dữ liệu của bạn "sạch sẽ":
          </p>

          <div className="space-y-4 mb-8">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-1" />
                  <div>
                    <h4 className="font-semibold mb-2">Kích thước mẫu</h4>
                    <p className="text-sm text-gray-600">
                      Tối thiểu 100 mẫu, tốt nhất là 200+ mẫu. Nguyên tắc: ít nhất 5-10 mẫu cho mỗi biến quan sát.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-1" />
                  <div>
                    <h4 className="font-semibold mb-2">Dữ liệu thiếu (Missing data)</h4>
                    <p className="text-sm text-gray-600">
                      Xử lý dữ liệu thiếu trước khi phân tích. NCSKIT có công cụ tự động phát hiện và xử lý.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-1" />
                  <div>
                    <h4 className="font-semibold mb-2">Giá trị ngoại lai (Outliers)</h4>
                    <p className="text-sm text-gray-600">
                      Kiểm tra và xử lý các giá trị bất thường có thể làm méo kết quả phân tích.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <h3>Bước 2: Kiểm tra tính phù hợp của dữ liệu</h3>
          <p>
            Không phải dữ liệu nào cũng phù hợp để làm phân tích nhân tố. NCSKIT sẽ tự động kiểm tra:
          </p>

          <div className="bg-gray-100 p-6 rounded-lg mb-8">
            <h4 className="font-semibold mb-4">Các chỉ số quan trọng:</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600 mb-2">KMO</div>
                <div className="text-sm">
                  <div className="text-green-600">Tốt: &gt; 0.8</div>
                  <div className="text-yellow-600">Chấp nhận được: &gt; 0.6</div>
                  <div className="text-red-600">Không tốt: &lt; 0.6</div>
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600 mb-2">Bartlett</div>
                <div className="text-sm">
                  <div className="text-green-600">Tốt: p &lt; 0.05</div>
                  <div className="text-red-600">Không tốt: p &gt; 0.05</div>
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600 mb-2">Tương quan</div>
                <div className="text-sm">
                  <div className="text-green-600">Tốt: nhiều r &gt; 0.3</div>
                  <div className="text-red-600">Không tốt: hầu hết r &lt; 0.3</div>
                </div>
              </div>
            </div>
          </div>

          <h3>Bước 3: Chọn số nhân tố</h3>
          <p>
            Đây là bước "nghệ thuật" nhất! NCSKIT cung cấp nhiều tiêu chí để bạn quyết định:
          </p>

          <div className="space-y-4 mb-8">
            <div className="border-l-4 border-blue-500 pl-4">
              <h5 className="font-semibold">Tiêu chí Kaiser (Eigenvalue &gt; 1)</h5>
              <p className="text-sm text-gray-600">
                Chỉ giữ lại những nhân tố có eigenvalue &gt; 1. Đơn giản nhưng đôi khi không chính xác.
              </p>
            </div>
            <div className="border-l-4 border-green-500 pl-4">
              <h5 className="font-semibold">Scree Plot (Biểu đồ sỏi)</h5>
              <p className="text-sm text-gray-600">
                Nhìn vào biểu đồ, tìm điểm "khuỷu tay" - nơi đường cong bắt đầu phẳng.
              </p>
            </div>
            <div className="border-l-4 border-purple-500 pl-4">
              <h5 className="font-semibold">Parallel Analysis</h5>
              <p className="text-sm text-gray-600">
                Phương pháp hiện đại và chính xác nhất. NCSKIT tự động thực hiện.
              </p>
            </div>
          </div>

          <h3>Bước 4: Xoay nhân tố (Factor Rotation)</h3>
          <p>
            Sau khi trích xuất nhân tố, bạn cần "xoay" chúng để dễ giải thích hơn. 
            Giống như xoay một bức tranh để nhìn rõ hơn vậy:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Xoay vuông góc (Orthogonal)</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-3">
                  Giả định các nhân tố không tương quan với nhau.
                </p>
                <div className="bg-blue-50 p-3 rounded">
                  <strong>Varimax:</strong> Phổ biến nhất, dễ giải thích
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Xoay xiên (Oblique)</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-3">
                  Cho phép các nhân tố tương quan với nhau.
                </p>
                <div className="bg-green-50 p-3 rounded">
                  <strong>Promax:</strong> Thực tế hơn cho tâm lý học
                </div>
              </CardContent>
            </Card>
          </div>

          <h2>Ví dụ thực tế: Khảo sát sự hài lòng khách hàng</h2>
          <p>
            Hãy cùng xem một ví dụ cụ thể với 12 câu hỏi về sự hài lòng khách hàng:
          </p>

          <div className="bg-gray-50 p-6 rounded-lg mb-8">
            <h4 className="font-semibold mb-4">Dữ liệu mẫu:</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <strong>Chất lượng dịch vụ:</strong>
                <ul className="mt-2 space-y-1">
                  <li>• DV1: Nhân viên thân thiện</li>
                  <li>• DV2: Phục vụ nhanh chóng</li>
                  <li>• DV3: Giải quyết khiếu nại tốt</li>
                  <li>• DV4: Tư vấn chuyên nghiệp</li>
                </ul>
              </div>
              <div>
                <strong>Chất lượng sản phẩm:</strong>
                <ul className="mt-2 space-y-1">
                  <li>• SP1: Sản phẩm bền</li>
                  <li>• SP2: Thiết kế đẹp</li>
                  <li>• SP3: Chức năng tốt</li>
                  <li>• SP4: Chất lượng cao</li>
                </ul>
              </div>
              <div>
                <strong>Giá trị tiền bạc:</strong>
                <ul className="mt-2 space-y-1">
                  <li>• GT1: Giá hợp lý</li>
                  <li>• GT2: Đáng đồng tiền</li>
                  <li>• GT3: Ưu đãi hấp dẫn</li>
                  <li>• GT4: Cạnh tranh về giá</li>
                </ul>
              </div>
            </div>
          </div>

          <h3>Kết quả EFA từ NCSKIT</h3>
          <div className="bg-green-50 border-l-4 border-green-500 p-6 mb-8">
            <h4 className="font-semibold text-green-900 mb-3">Kết quả phân tích:</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-green-800 text-sm">
              <div>
                <strong>KMO:</strong> 0.847<br />
                <span className="text-xs">(Xuất sắc!)</span>
              </div>
              <div>
                <strong>Bartlett:</strong> p &lt; 0.001<br />
                <span className="text-xs">(Có ý nghĩa)</span>
              </div>
              <div>
                <strong>Phương sai giải thích:</strong> 68.4%<br />
                <span className="text-xs">(Tốt)</span>
              </div>
              <div>
                <strong>Số nhân tố:</strong> 3<br />
                <span className="text-xs">(Như dự đoán)</span>
              </div>
            </div>
          </div>

          <h2>CFA - Xác nhận mô hình</h2>
          <p>
            Sau khi có kết quả EFA, chúng ta dùng CFA để "double-check" xem mô hình có thực sự phù hợp không:
          </p>

          <h3>Chỉ số độ phù hợp (Fit Indices)</h3>
          <p>
            NCSKIT tự động tính toán các chỉ số này. Bạn chỉ cần biết cách đọc:
          </p>

          <div className="overflow-x-auto mb-8">
            <table className="min-w-full border border-gray-300 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="border border-gray-300 px-4 py-2 text-left">Chỉ số</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Tốt</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Chấp nhận được</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Ý nghĩa</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-gray-300 px-4 py-2 font-semibold">CFI</td>
                  <td className="border border-gray-300 px-4 py-2 text-green-600">&gt; 0.95</td>
                  <td className="border border-gray-300 px-4 py-2 text-yellow-600">&gt; 0.90</td>
                  <td className="border border-gray-300 px-4 py-2">So sánh với mô hình cơ sở</td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="border border-gray-300 px-4 py-2 font-semibold">TLI</td>
                  <td className="border border-gray-300 px-4 py-2 text-green-600">&gt; 0.95</td>
                  <td className="border border-gray-300 px-4 py-2 text-yellow-600">&gt; 0.90</td>
                  <td className="border border-gray-300 px-4 py-2">Tucker-Lewis Index</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-4 py-2 font-semibold">RMSEA</td>
                  <td className="border border-gray-300 px-4 py-2 text-green-600">&lt; 0.05</td>
                  <td className="border border-gray-300 px-4 py-2 text-yellow-600">&lt; 0.08</td>
                  <td className="border border-gray-300 px-4 py-2">Sai số trung bình</td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="border border-gray-300 px-4 py-2 font-semibold">SRMR</td>
                  <td className="border border-gray-300 px-4 py-2 text-green-600">&lt; 0.05</td>
                  <td className="border border-gray-300 px-4 py-2 text-yellow-600">&lt; 0.08</td>
                  <td className="border border-gray-300 px-4 py-2">Phần dư chuẩn hóa</td>
                </tr>
              </tbody>
            </table>
          </div>

          <h2>Những lưu ý quan trọng (Đừng bỏ qua!)</h2>
          
          <div className="space-y-6 mb-8">
            <div className="bg-red-50 border-l-4 border-red-500 p-6">
              <h4 className="font-semibold text-red-900 mb-2">❌ Những sai lầm thường gặp:</h4>
              <ul className="text-red-800 space-y-2 text-sm">
                <li>• Mẫu quá nhỏ (&lt; 100) nhưng vẫn cố làm</li>
                <li>• Chỉ dựa vào eigenvalue &gt; 1 để chọn số nhân tố</li>
                <li>• Bỏ qua ý nghĩa lý thuyết, chỉ nhìn số liệu</li>
                <li>• Không kiểm tra giả định trước khi phân tích</li>
                <li>• Báo cáo thiếu thông tin quan trọng</li>
              </ul>
            </div>

            <div className="bg-green-50 border-l-4 border-green-500 p-6">
              <h4 className="font-semibold text-green-900 mb-2">✅ Bí kíp thành công:</h4>
              <ul className="text-green-800 space-y-2 text-sm">
                <li>• Luôn kiểm tra giả định trước khi phân tích</li>
                <li>• Sử dụng nhiều tiêu chí để chọn số nhân tố</li>
                <li>• Kết hợp lý thuyết và thống kê</li>
                <li>• Cross-validate với mẫu khác nếu có thể</li>
                <li>• Báo cáo đầy đủ và minh bạch</li>
              </ul>
            </div>
          </div>

          <h2>Kết luận</h2>
          <p>
            Phân tích nhân tố không phải là "phép màu" nhưng cũng không khó như bạn nghĩ. 
            Quan trọng nhất là hiểu rõ dữ liệu của mình, có lý thuyết nền tảng vững chắc, 
            và biết cách sử dụng công cụ phù hợp.
          </p>

          <p>
            NCSKIT giúp bạn thực hiện tất cả các bước một cách dễ dàng, từ kiểm tra dữ liệu 
            đến xuất báo cáo cuối cùng. Nhưng nhớ rằng, công cụ chỉ là phương tiện - 
            trí tuệ và kinh nghiệm của bạn mới là yếu tố quyết định!
          </p>

          <div className="bg-blue-50 border-l-4 border-blue-500 p-6 mt-8">
            <h3 className="text-lg font-semibold text-blue-900 mb-2">Sẵn sàng thử phân tích nhân tố?</h3>
            <p className="text-blue-800 mb-4">
              Bắt đầu hành trình phân tích nhân tố của bạn với giao diện thân thiện 
              và hướng dẫn chi tiết của NCSKIT.
            </p>
            <Link href="/dashboard/analysis">
              <Button className="bg-blue-600 hover:bg-blue-700">
                Thử ngay NCSKIT Factor Analysis
              </Button>
            </Link>
          </div>
        </div>

        {/* Article Footer */}
        <div className="border-t pt-8 mt-12">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <User className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h4 className="font-semibold">Lê Phúc Hải</h4>
                <p className="text-sm text-gray-600">Nghiên cứu sinh tiến sĩ Quản lý kinh doanh</p>
                <p className="text-xs text-gray-500">Chuyên gia phân tích thống kê và phương pháp nghiên cứu</p>
              </div>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm">
                <Share2 className="h-4 w-4 mr-2" />
                Chia sẻ
              </Button>
            </div>
          </div>
        </div>

        {/* Related Articles */}
        <div className="mt-12">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">Bài viết liên quan</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <Badge className="bg-purple-100 text-purple-800 mb-3">Phân tích thống kê</Badge>
                <h4 className="text-lg font-semibold mb-2">
                  <Link href="/blog/mo-hinh-phuong-trinh-cau-truc-sem" className="hover:text-blue-600">
                    Mô hình phương trình cấu trúc SEM: Từ lý thuyết đến thực hành
                  </Link>
                </h4>
                <p className="text-gray-600 text-sm">
                  Làm chủ phân tích SEM với các ví dụ thực tế và đánh giá độ phù hợp mô hình.
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <Badge className="bg-green-100 text-green-800 mb-3">Phương pháp nghiên cứu</Badge>
                <h4 className="text-lg font-semibold mb-2">
                  <Link href="/blog/kiem-tra-tin-cay-gia-tri" className="hover:text-blue-600">
                    Kiểm tra độ tin cậy và giá trị: Thang đo của bạn có "đáng tin" không?
                  </Link>
                </h4>
                <p className="text-gray-600 text-sm">
                  Đảm bảo các công cụ đo lường của bạn đáng tin cậy và có giá trị.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}