import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Calendar, Clock, User, ArrowLeft, Share2, BookOpen, TrendingUp, CheckCircle, Lightbulb, AlertTriangle, Target } from 'lucide-react'

export default function SEMGuidePage() {
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
          <Badge className="bg-purple-100 text-purple-800 mb-4">Phân tích thống kê</Badge>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Mô hình phương trình cấu trúc SEM: Từ lý thuyết đến thực hành
          </h1>
          <p className="text-xl text-gray-600 mb-6">
            Làm chủ phân tích SEM với các ví dụ thực tế, đánh giá độ phù hợp mô hình và cách giải thích kết quả bằng NCSKIT. 
            SEM không còn là "ác mộng" nữa!
          </p>
          
          <div className="flex items-center justify-center space-x-6 text-sm text-gray-500 mb-8">
            <div className="flex items-center">
              <User className="h-4 w-4 mr-2" />
              Lê Phúc Hải
            </div>
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-2" />
              10 tháng 1, 2024
            </div>
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-2" />
              18 phút đọc
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
          <div className="bg-purple-50 border-l-4 border-purple-500 p-6 mb-8">
            <h3 className="text-lg font-semibold text-purple-900 mb-2 flex items-center">
              <Target className="h-5 w-5 mr-2" />
              Sau khi đọc bài này, bạn sẽ:
            </h3>
            <ul className="text-purple-800 space-y-1">
              <li>• Hiểu SEM là gì và tại sao nó "xịn" hơn hồi quy thông thường</li>
              <li>• Biết cách xây dựng mô hình SEM từ lý thuyết</li>
              <li>• Thực hành SEM với NCSKIT từng bước một</li>
              <li>• Đánh giá và giải thích kết quả như một chuyên gia</li>
              <li>• Tránh được những "hố sâu" thường gặp</li>
            </ul>
          </div>

          <h2>SEM là cái gì mà "xịn" thế?</h2>
          <p>
            Structural Equation Modeling (SEM) - hay Mô hình phương trình cấu trúc - nghe tên thôi đã thấy "cao siêu" rồi phải không? 
            Nhưng thực ra, SEM chỉ là cách kết hợp <strong>phân tích nhân tố</strong> và <strong>hồi quy</strong> thành một "siêu mô hình" thôi.
          </p>

          <p>
            Tưởng tượng bạn muốn nghiên cứu mối quan hệ giữa "Sự hài lòng của nhân viên" và "Hiệu suất công việc". 
            Với hồi quy thông thường, bạn chỉ có thể xem mối quan hệ trực tiếp. Nhưng với SEM, bạn có thể:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <Card className="border-blue-200 bg-blue-50">
              <CardHeader>
                <CardTitle className="text-lg text-blue-800">Hồi quy thông thường</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-blue-700 space-y-2">
                  <li>• Chỉ xem mối quan hệ trực tiếp</li>
                  <li>• Một biến phụ thuộc</li>
                  <li>• Không xử lý được sai số đo lường</li>
                  <li>• Đơn giản nhưng hạn chế</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-purple-200 bg-purple-50">
              <CardHeader>
                <CardTitle className="text-lg text-purple-800">SEM "siêu xịn"</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-purple-700 space-y-2">
                  <li>• Xem cả mối quan hệ trực tiếp và gián tiếp</li>
                  <li>• Nhiều biến phụ thuộc cùng lúc</li>
                  <li>• Xử lý sai số đo lường</li>
                  <li>• Phức tạp nhưng mạnh mẽ</li>
                </ul>
              </CardContent>
            </Card>
          </div>

          <div className="bg-yellow-50 border-l-4 border-yellow-500 p-6 mb-8">
            <h4 className="font-semibold text-yellow-900 mb-2 flex items-center">
              <Lightbulb className="h-5 w-5 mr-2" />
              Ví dụ dễ hiểu
            </h4>
            <p className="text-yellow-800">
              Thay vì chỉ hỏi "Lương cao có làm nhân viên hạnh phúc không?", SEM cho phép bạn hỏi: 
              "Lương cao → Sự hài lòng → Động lực làm việc → Hiệu suất → Thăng tiến → Hạnh phúc". 
              Cả một chuỗi mối quan hệ phức tạp!
            </p>
          </div>

          <h2>Khi nào nên dùng SEM?</h2>
          <p>
            SEM không phải là "thuốc chữa bách bệnh". Bạn nên dùng SEM khi:
          </p>

          <div className="space-y-4 mb-8">
            <Card className="border-green-200 bg-green-50">
              <CardContent className="pt-6">
                <div className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-1" />
                  <div>
                    <h4 className="font-semibold mb-2">Có lý thuyết rõ ràng</h4>
                    <p className="text-sm text-gray-600">
                      Bạn đã có giả thuyết về mối quan hệ giữa các biến, không phải "thả câu" xem có gì.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-green-200 bg-green-50">
              <CardContent className="pt-6">
                <div className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-1" />
                  <div>
                    <h4 className="font-semibold mb-2">Mối quan hệ phức tạp</h4>
                    <p className="text-sm text-gray-600">
                      Có biến trung gian, biến điều tiết, hoặc nhiều biến phụ thuộc cùng lúc.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-green-200 bg-green-50">
              <CardContent className="pt-6">
                <div className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-1" />
                  <div>
                    <h4 className="font-semibold mb-2">Biến tiềm ẩn (Latent variables)</h4>
                    <p className="text-sm text-gray-600">
                      Nghiên cứu các khái niệm không đo trực tiếp được như "hài lòng", "động lực", "thái độ".
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <h2>Các thành phần của SEM</h2>
          <p>
            SEM gồm hai phần chính, giống như một chiếc xe có cả động cơ và vỏ xe:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Mô hình đo lường (Measurement Model)</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-3">
                  Giống như CFA - định nghĩa các biến tiềm ẩn được đo bằng những câu hỏi nào.
                </p>
                <div className="bg-blue-50 p-3 rounded text-sm">
                  <strong>Ví dụ:</strong> "Sự hài lòng" được đo bằng 5 câu hỏi về lương, môi trường, đồng nghiệp...
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Mô hình cấu trúc (Structural Model)</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-3">
                  Giống như hồi quy - định nghĩa mối quan hệ giữa các biến tiềm ẩn.
                </p>
                <div className="bg-green-50 p-3 rounded text-sm">
                  <strong>Ví dụ:</strong> Sự hài lòng → Động lực → Hiệu suất công việc
                </div>
              </CardContent>
            </Card>
          </div>

          <h2>Thực hành SEM với NCSKIT - Bước đầu tiên</h2>
          
          <h3>Bước 1: Xây dựng mô hình lý thuyết</h3>
          <p>
            Đây là bước quan trọng nhất! Không có lý thuyết tốt = SEM tệ. Bạn cần:
          </p>

          <div className="space-y-4 mb-8">
            <div className="border-l-4 border-blue-500 pl-4">
              <h5 className="font-semibold">Xác định biến tiềm ẩn</h5>
              <p className="text-sm text-gray-600">
                Những khái niệm không đo trực tiếp được. VD: Sự hài lòng, Động lực, Hiệu suất...
              </p>
            </div>
            <div className="border-l-4 border-green-500 pl-4">
              <h5 className="font-semibold">Định nghĩa mối quan hệ</h5>
              <p className="text-sm text-gray-600">
                Biến nào ảnh hưởng đến biến nào? Có biến trung gian không? Có tương tác không?
              </p>
            </div>
            <div className="border-l-4 border-purple-500 pl-4">
              <h5 className="font-semibold">Vẽ sơ đồ đường dẫn</h5>
              <p className="text-sm text-gray-600">
                NCSKIT có công cụ vẽ sơ đồ trực quan, giúp bạn "nhìn thấy" mô hình.
              </p>
            </div>
          </div>

          <h3>Bước 2: Chuẩn bị dữ liệu</h3>
          <p>
            SEM "khó tính" hơn các phương pháp khác về dữ liệu:
          </p>

          <div className="bg-red-50 border-l-4 border-red-500 p-6 mb-8">
            <h4 className="font-semibold text-red-900 mb-2">Yêu cầu nghiêm ngặt:</h4>
            <ul className="text-red-800 space-y-2 text-sm">
              <li>• <strong>Kích thước mẫu:</strong> Tối thiểu 200, tốt nhất 400+ (10-20 mẫu/tham số)</li>
              <li>• <strong>Phân phối chuẩn:</strong> Dữ liệu nên có phân phối gần chuẩn</li>
              <li>• <strong>Không có outliers:</strong> Giá trị ngoại lai có thể làm sai lệch kết quả</li>
              <li>• <strong>Không multicollinearity:</strong> Các biến không được tương quan quá cao</li>
            </ul>
          </div>

          <h3>Bước 3: Chạy mô hình trong NCSKIT</h3>
          <p>
            NCSKIT làm cho SEM trở nên dễ dàng với giao diện kéo-thả:
          </p>

          <div className="space-y-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <span className="bg-purple-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm mr-3">1</span>
                  Định nghĩa biến tiềm ẩn
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-100 p-4 rounded-lg font-mono text-sm">
                  # Cú pháp đơn giản trong NCSKIT
                  <br />
                  Sự_hài_lòng =~ HL1 + HL2 + HL3 + HL4 + HL5
                  <br />
                  Động_lực =~ DL1 + DL2 + DL3 + DL4
                  <br />
                  Hiệu_suất =~ HS1 + HS2 + HS3 + HS4
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <span className="bg-purple-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm mr-3">2</span>
                  Định nghĩa mối quan hệ cấu trúc
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-100 p-4 rounded-lg font-mono text-sm">
                  # Mối quan hệ giữa các biến tiềm ẩn
                  <br />
                  Động_lực ~ Sự_hài_lòng
                  <br />
                  Hiệu_suất ~ Động_lực + Sự_hài_lòng
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <span className="bg-purple-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm mr-3">3</span>
                  Chạy và kiểm tra kết quả
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  NCSKIT tự động tính toán tất cả chỉ số cần thiết và cung cấp báo cáo chi tiết.
                </p>
              </CardContent>
            </Card>
          </div>

          <h2>Đánh giá độ phù hợp mô hình</h2>
          <p>
            Đây là phần "căng thẳng" nhất - mô hình của bạn có "fit" không? NCSKIT cung cấp đầy đủ chỉ số:
          </p>

          <h3>Chỉ số độ phù hợp tuyệt đối</h3>
          <div className="overflow-x-auto mb-6">
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
                  <td className="border border-gray-300 px-4 py-2 font-semibold">χ²/df</td>
                  <td className="border border-gray-300 px-4 py-2 text-green-600">&lt; 3</td>
                  <td className="border border-gray-300 px-4 py-2 text-yellow-600">&lt; 5</td>
                  <td className="border border-gray-300 px-4 py-2">Chi-square chuẩn hóa</td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="border border-gray-300 px-4 py-2 font-semibold">RMSEA</td>
                  <td className="border border-gray-300 px-4 py-2 text-green-600">&lt; 0.05</td>
                  <td className="border border-gray-300 px-4 py-2 text-yellow-600">&lt; 0.08</td>
                  <td className="border border-gray-300 px-4 py-2">Sai số xấp xỉ</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-4 py-2 font-semibold">SRMR</td>
                  <td className="border border-gray-300 px-4 py-2 text-green-600">&lt; 0.05</td>
                  <td className="border border-gray-300 px-4 py-2 text-yellow-600">&lt; 0.08</td>
                  <td className="border border-gray-300 px-4 py-2">Phần dư chuẩn hóa</td>
                </tr>
              </tbody>
            </table>
          </div>

          <h3>Chỉ số độ phù hợp tương đối</h3>
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
                  <td className="border border-gray-300 px-4 py-2 font-semibold">GFI</td>
                  <td className="border border-gray-300 px-4 py-2 text-green-600">&gt; 0.95</td>
                  <td className="border border-gray-300 px-4 py-2 text-yellow-600">&gt; 0.90</td>
                  <td className="border border-gray-300 px-4 py-2">Goodness of Fit Index</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="bg-blue-50 border-l-4 border-blue-500 p-6 mb-8">
            <h4 className="font-semibold text-blue-900 mb-2">Mẹo đọc kết quả:</h4>
            <p className="text-blue-800 text-sm">
              Không cần tất cả chỉ số đều "tốt". Nếu đa số chỉ số ở mức "chấp nhận được" và có ý nghĩa lý thuyết, 
              mô hình vẫn có thể sử dụng được. Quan trọng là phải giải thích được tại sao!
            </p>
          </div>

          <h2>Ví dụ thực tế: Nghiên cứu sự hài lòng nhân viên</h2>
          <p>
            Hãy cùng xem một ví dụ cụ thể về nghiên cứu các yếu tố ảnh hưởng đến hiệu suất làm việc:
          </p>

          <div className="bg-gray-50 p-6 rounded-lg mb-8">
            <h4 className="font-semibold mb-4">Mô hình nghiên cứu:</h4>
            <div className="text-center mb-4">
              <div className="inline-block bg-white p-4 rounded-lg border-2 border-dashed border-gray-300">
                <div className="text-sm space-y-2">
                  <div>Lương bổng → Sự hài lòng → Động lực → Hiệu suất</div>
                  <div>Môi trường làm việc ↗</div>
                  <div>Cơ hội thăng tiến ↗</div>
                </div>
              </div>
            </div>
            <p className="text-sm text-gray-600">
              <strong>Giả thuyết:</strong> Lương bổng, môi trường làm việc và cơ hội thăng tiến ảnh hưởng đến sự hài lòng, 
              từ đó tác động đến động lực và cuối cùng là hiệu suất làm việc.
            </p>
          </div>

          <h3>Kết quả từ NCSKIT</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <Card className="border-green-200 bg-green-50">
              <CardHeader>
                <CardTitle className="text-lg text-green-800">Độ phù hợp mô hình</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm text-green-700">
                  <div><strong>χ²/df:</strong> 2.34 (Tốt)</div>
                  <div><strong>CFI:</strong> 0.962 (Xuất sắc)</div>
                  <div><strong>TLI:</strong> 0.951 (Xuất sắc)</div>
                  <div><strong>RMSEA:</strong> 0.047 (Tốt)</div>
                  <div><strong>SRMR:</strong> 0.041 (Tốt)</div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-blue-200 bg-blue-50">
              <CardHeader>
                <CardTitle className="text-lg text-blue-800">Hệ số đường dẫn</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm text-blue-700">
                  <div>Lương → Hài lòng: <strong>0.34***</strong></div>
                  <div>Môi trường → Hài lòng: <strong>0.28**</strong></div>
                  <div>Thăng tiến → Hài lòng: <strong>0.19*</strong></div>
                  <div>Hài lòng → Động lực: <strong>0.67***</strong></div>
                  <div>Động lực → Hiệu suất: <strong>0.52***</strong></div>
                </div>
                <p className="text-xs text-blue-600 mt-2">*p&lt;0.05, **p&lt;0.01, ***p&lt;0.001</p>
              </CardContent>
            </Card>
          </div>

          <h3>Giải thích kết quả</h3>
          <p>
            Kết quả cho thấy mô hình phù hợp tốt với dữ liệu. Các phát hiện chính:
          </p>

          <ul className="space-y-2 mb-8">
            <li>• <strong>Lương bổng</strong> có tác động mạnh nhất đến sự hài lòng (β = 0.34)</li>
            <li>• <strong>Sự hài lòng</strong> là yếu tố quan trọng thúc đẩy động lực (β = 0.67)</li>
            <li>• <strong>Động lực</strong> có tác động trung bình đến hiệu suất (β = 0.52)</li>
            <li>• Có tác động gián tiếp từ lương → hài lòng → động lực → hiệu suất</li>
          </ul>

          <h2>Phân tích trung gian (Mediation Analysis)</h2>
          <p>
            Một trong những điểm mạnh của SEM là khả năng phân tích tác động trung gian. 
            NCSKIT tự động tính toán các tác động:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Tác động trực tiếp</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-2">
                  Ảnh hưởng trực tiếp từ biến này đến biến khác
                </p>
                <div className="bg-blue-50 p-3 rounded text-sm">
                  Lương → Hài lòng: 0.34
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Tác động gián tiếp</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-2">
                  Ảnh hưởng thông qua biến trung gian
                </p>
                <div className="bg-green-50 p-3 rounded text-sm">
                  Lương → Hài lòng → Động lực: 0.23
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Tác động tổng</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-2">
                  Tổng của tác động trực tiếp và gián tiếp
                </p>
                <div className="bg-purple-50 p-3 rounded text-sm">
                  Tổng tác động: 0.57
                </div>
              </CardContent>
            </Card>
          </div>

          <h2>Những lưu ý quan trọng</h2>
          
          <div className="space-y-6 mb-8">
            <div className="bg-red-50 border-l-4 border-red-500 p-6">
              <h4 className="font-semibold text-red-900 mb-2 flex items-center">
                <AlertTriangle className="h-5 w-5 mr-2" />
                Những sai lầm thường gặp:
              </h4>
              <ul className="text-red-800 space-y-2 text-sm">
                <li>• Không có lý thuyết nền tảng, chỉ "thử" các mô hình khác nhau</li>
                <li>• Mẫu quá nhỏ so với độ phức tạp của mô hình</li>
                <li>• Chỉ nhìn vào chỉ số fit, bỏ qua ý nghĩa thực tế</li>
                <li>• Không kiểm tra giả định về phân phối và outliers</li>
                <li>• Modification indices "ăn may" để cải thiện fit</li>
              </ul>
            </div>

            <div className="bg-green-50 border-l-4 border-green-500 p-6">
              <h4 className="font-semibold text-green-900 mb-2">Bí kíp thành công:</h4>
              <ul className="text-green-800 space-y-2 text-sm">
                <li>• Bắt đầu với lý thuyết vững chắc và mô hình đơn giản</li>
                <li>• Kiểm tra mô hình đo lường trước khi chạy mô hình cấu trúc</li>
                <li>• Sử dụng nhiều chỉ số fit, không dựa vào một chỉ số duy nhất</li>
                <li>• Cross-validate với mẫu khác nếu có thể</li>
                <li>• Báo cáo đầy đủ và trung thực về kết quả</li>
              </ul>
            </div>
          </div>

          <h2>Kết luận</h2>
          <p>
            SEM là một công cụ mạnh mẽ nhưng cũng đòi hỏi sự hiểu biết sâu sắc về lý thuyết và phương pháp. 
            Không phải lúc nào SEM cũng là lựa chọn tốt nhất - đôi khi một mô hình hồi quy đơn giản 
            lại hiệu quả hơn.
          </p>

          <p>
            NCSKIT giúp bạn thực hiện SEM một cách dễ dàng với giao diện trực quan và hướng dẫn chi tiết. 
            Nhưng nhớ rằng, công cụ chỉ là phương tiện - kiến thức và kinh nghiệm của bạn mới là chìa khóa thành công!
          </p>

          <div className="bg-purple-50 border-l-4 border-purple-500 p-6 mt-8">
            <h3 className="text-lg font-semibold text-purple-900 mb-2">Sẵn sàng chinh phục SEM?</h3>
            <p className="text-purple-800 mb-4">
              Bắt đầu hành trình SEM của bạn với NCSKIT - từ mô hình đơn giản đến phức tạp, 
              chúng tôi sẽ đồng hành cùng bạn!
            </p>
            <Link href="/dashboard/analysis">
              <Button className="bg-purple-600 hover:bg-purple-700">
                Thử ngay NCSKIT SEM Analysis
              </Button>
            </Link>
          </div>
        </div>

        {/* Article Footer */}
        <div className="border-t pt-8 mt-12">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <User className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <h4 className="font-semibold">Lê Phúc Hải</h4>
                <p className="text-sm text-gray-600">Nghiên cứu sinh tiến sĩ Quản lý kinh doanh</p>
                <p className="text-xs text-gray-500">Chuyên gia SEM và phân tích dữ liệu nâng cao</p>
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
                <Badge className="bg-blue-100 text-blue-800 mb-3">Phân tích thống kê</Badge>
                <h4 className="text-lg font-semibold mb-2">
                  <Link href="/blog/phan-tich-nhan-to-efa-cfa" className="hover:text-blue-600">
                    Phân tích nhân tố EFA và CFA: Hướng dẫn từ A đến Z
                  </Link>
                </h4>
                <p className="text-gray-600 text-sm">
                  Tìm hiểu cách phân tích nhân tố khám phá và khẳng định một cách dễ hiểu nhất.
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <Badge className="bg-orange-100 text-orange-800 mb-3">Phân tích thống kê</Badge>
                <h4 className="text-lg font-semibold mb-2">
                  <Link href="/blog/hoi-quy-toan-dien" className="hover:text-blue-600">
                    Hồi quy toàn diện: Tuyến tính, Logistic và Đa cấp
                  </Link>
                </h4>
                <p className="text-gray-600 text-sm">
                  Hướng dẫn chi tiết các kỹ thuật hồi quy với ví dụ thực tế.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}