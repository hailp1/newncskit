import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Calendar, Clock, User, ArrowLeft, Share2, BookOpen, Target, CheckCircle, Lightbulb, AlertTriangle, Users, FileText, BarChart3 } from 'lucide-react'

export default function ThietKeNghienCuuPage() {
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
          <Badge className="bg-green-100 text-green-800 mb-4">Phương pháp nghiên cứu</Badge>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Thiết kế nghiên cứu hiệu quả: Từ ý tưởng đến kết quả
          </h1>
          <p className="text-xl text-gray-600 mb-6">
            Hướng dẫn từng bước thiết kế một nghiên cứu chất lượng cao, từ việc xác định vấn đề 
            đến thu thập và phân tích dữ liệu. Không còn "mò mẫm" nữa!
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
              20 phút đọc
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
          <div className="bg-green-50 border-l-4 border-green-500 p-6 mb-8">
            <h3 className="text-lg font-semibold text-green-900 mb-2 flex items-center">
              <Target className="h-5 w-5 mr-2" />
              Sau bài này bạn sẽ biết:
            </h3>
            <ul className="text-green-800 space-y-1">
              <li>• Cách xác định và phát biểu vấn đề nghiên cứu rõ ràng</li>
              <li>• Thiết kế khung lý thuyết và giả thuyết nghiên cứu</li>
              <li>• Chọn phương pháp nghiên cứu phù hợp (định tính/định lượng)</li>
              <li>• Tính toán cỡ mẫu và chiến lược thu thập dữ liệu</li>
              <li>• Lập kế hoạch phân tích và báo cáo kết quả</li>
            </ul>
          </div>

          <h2>Nghiên cứu tốt bắt đầu từ thiết kế tốt</h2>
          <p>
            Nhiều người nghĩ nghiên cứu khoa học là "thu thập dữ liệu rồi phân tích xem có gì hay". 
            Sai bét! Nghiên cứu giống như xây nhà - phải có bản thiết kế chi tiết trước khi động thổ. 
            Không có thiết kế tốt, bạn sẽ "lạc" giữa chừng và kết quả không thuyết phục được ai.
          </p>

          <div className="bg-blue-50 border-l-4 border-blue-500 p-6 mb-8">
            <h4 className="font-semibold text-blue-900 mb-2 flex items-center">
              <Lightbulb className="h-5 w-5 mr-2" />
              Tại sao thiết kế nghiên cứu quan trọng?
            </h4>
            <p className="text-blue-800">
              Thiết kế nghiên cứu giống như GPS - giúp bạn biết mình đang ở đâu, muốn đi đâu, 
              và đường nào là tối ưu nhất. Không có GPS, bạn có thể đi được nhưng sẽ tốn thời gian 
              và có thể... lạc đường!
            </p>
          </div>

          <h2>Bước 1: Xác định vấn đề nghiên cứu</h2>
          
          <h3>Từ "thắc mắc" đến "câu hỏi nghiên cứu"</h3>
          <p>
            Mọi nghiên cứu đều bắt đầu từ một thắc mắc. Nhưng không phải thắc mắc nào cũng 
            trở thành câu hỏi nghiên cứu tốt. Câu hỏi nghiên cứu phải:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <Card className="border-green-200 bg-green-50">
              <CardHeader>
                <CardTitle className="text-lg text-green-800 flex items-center">
                  <CheckCircle className="h-5 w-5 mr-2" />
                  Câu hỏi TỐT
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm text-green-700">
                  <div><strong>Cụ thể:</strong> "Yếu tố nào ảnh hưởng đến ý định mua hàng online của sinh viên?"</div>
                  <div><strong>Có thể đo lường:</strong> Các biến có thể định lượng được</div>
                  <div><strong>Thực tế:</strong> Có thể thực hiện với nguồn lực hiện có</div>
                  <div><strong>Có ý nghĩa:</strong> Kết quả có giá trị thực tiễn</div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-red-200 bg-red-50">
              <CardHeader>
                <CardTitle className="text-lg text-red-800 flex items-center">
                  <AlertTriangle className="h-5 w-5 mr-2" />
                  Câu hỏi CHƯA TỐT
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm text-red-700">
                  <div><strong>Mơ hồ:</strong> "Làm sao để bán hàng online hiệu quả?"</div>
                  <div><strong>Quá rộng:</strong> "Tác động của công nghệ đến xã hội"</div>
                  <div><strong>Không thực tế:</strong> "Khảo sát toàn bộ dân số Việt Nam"</div>
                  <div><strong>Không có ý nghĩa:</strong> "Màu sắc yêu thích của người ngoài hành tinh"</div>
                </div>
              </CardContent>
            </Card>
          </div>

          <h3>Công thức SMART cho câu hỏi nghiên cứu</h3>
          <div className="bg-gray-100 p-6 rounded-lg mb-8">
            <h4 className="font-semibold mb-4">Áp dụng SMART vào nghiên cứu:</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <div className="font-semibold text-blue-600">S - Specific (Cụ thể)</div>
                <p className="text-gray-600">Ai? Cái gì? Ở đâu? Khi nào?</p>
              </div>
              <div>
                <div className="font-semibold text-blue-600">M - Measurable (Đo lường được)</div>
                <p className="text-gray-600">Có thể định lượng hoặc định tính rõ ràng</p>
              </div>
              <div>
                <div className="font-semibold text-blue-600">A - Achievable (Khả thi)</div>
                <p className="text-gray-600">Phù hợp với nguồn lực và thời gian</p>
              </div>
              <div>
                <div className="font-semibold text-blue-600">R - Relevant (Có ý nghĩa)</div>
                <p className="text-gray-600">Đóng góp vào kiến thức hoặc thực tiễn</p>
              </div>
              <div>
                <div className="font-semibold text-blue-600">T - Time-bound (Có thời hạn)</div>
                <p className="text-gray-600">Xác định rõ thời gian thực hiện</p>
              </div>
            </div>
          </div>

          <h2>Bước 2: Xây dựng khung lý thuyết</h2>
          
          <h3>Lý thuyết không phải để "khoe học"</h3>
          <p>
            Nhiều người nghĩ khung lý thuyết là phần "khô khan" để tăng số trang. Sai rồi! 
            Khung lý thuyết giống như bản đồ - giúp bạn hiểu "địa hình" và chọn đường đi phù hợp.
          </p>

          <div className="space-y-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm mr-3">1</span>
                  Tìm hiểu nghiên cứu trước đó
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  Đọc các bài báo khoa học liên quan. Không cần đọc hết, tập trung vào:
                  Abstract, Introduction, và Conclusion. Tìm hiểu người khác đã làm gì, 
                  còn thiếu gì, và bạn có thể đóng góp gì.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm mr-3">2</span>
                  Xác định các khái niệm chính
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  Liệt kê các khái niệm quan trọng trong nghiên cứu của bạn. 
                  Ví dụ: "ý định mua hàng", "tin cậy", "tiện lợi". Mỗi khái niệm 
                  cần có định nghĩa rõ ràng và cách đo lường cụ thể.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm mr-3">3</span>
                  Vẽ mô hình nghiên cứu
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  Tạo sơ đồ thể hiện mối quan hệ giữa các biến. Không cần phức tạp, 
                  chỉ cần rõ ràng: biến nào ảnh hưởng đến biến nào, theo chiều hướng nào.
                </p>
              </CardContent>
            </Card>
          </div>

          <h3>Ví dụ: Mô hình nghiên cứu về mua sắm online</h3>
          <div className="bg-gray-50 p-6 rounded-lg mb-8">
            <h4 className="font-semibold mb-4">Nghiên cứu: "Yếu tố ảnh hưởng đến ý định mua hàng online của sinh viên"</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <Card className="bg-blue-50 border-blue-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Biến độc lập</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <ul className="text-xs space-y-1">
                    <li>• Tin cậy website</li>
                    <li>• Tiện lợi thanh toán</li>
                    <li>• Giá cả hợp lý</li>
                    <li>• Chất lượng dịch vụ</li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="bg-green-50 border-green-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Biến trung gian</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <ul className="text-xs space-y-1">
                    <li>• Thái độ đối với mua sắm online</li>
                    <li>• Chuẩn chủ quan</li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="bg-orange-50 border-orange-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Biến phụ thuộc</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <ul className="text-xs space-y-1">
                    <li>• Ý định mua hàng online</li>
                  </ul>
                </CardContent>
              </Card>
            </div>

            <div className="text-center text-sm text-gray-600">
              <strong>Giả thuyết chính:</strong> Tin cậy, tiện lợi, giá cả và chất lượng dịch vụ 
              tác động tích cực đến ý định mua hàng online thông qua thái độ và chuẩn chủ quan.
            </div>
          </div>

          <h2>Bước 3: Chọn phương pháp nghiên cứu</h2>
          
          <h3>Định lượng hay định tính? Đó là câu hỏi!</h3>
          <p>
            Không có phương pháp nào "tốt hơn" - chỉ có phương pháp "phù hợp hơn" với 
            câu hỏi nghiên cứu của bạn.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <Card className="border-blue-200 bg-blue-50">
              <CardHeader>
                <CardTitle className="text-lg text-blue-800">Nghiên cứu định lượng</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm text-blue-700">
                  <div><strong>Khi nào dùng:</strong> Muốn đo lường, so sánh, dự đoán</div>
                  <div><strong>Ưu điểm:</strong> Khách quan, có thể tổng quát hóa</div>
                  <div><strong>Nhược điểm:</strong> Khó hiểu sâu nguyên nhân</div>
                  <div><strong>Ví dụ:</strong> Khảo sát 500 sinh viên về ý định mua hàng online</div>
                  <div><strong>Công cụ:</strong> Bảng hỏi, thống kê mô tả, hồi quy</div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-green-200 bg-green-50">
              <CardHeader>
                <CardTitle className="text-lg text-green-800">Nghiên cứu định tính</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm text-green-700">
                  <div><strong>Khi nào dùng:</strong> Muốn hiểu sâu, khám phá nguyên nhân</div>
                  <div><strong>Ưu điểm:</strong> Hiểu sâu, linh hoạt, phát hiện điều mới</div>
                  <div><strong>Nhược điểm:</strong> Chủ quan, khó tổng quát hóa</div>
                  <div><strong>Ví dụ:</strong> Phỏng vấn sâu 20 sinh viên về trải nghiệm mua sắm</div>
                  <div><strong>Công cụ:</strong> Phỏng vấn, quan sát, phân tích nội dung</div>
                </div>
              </CardContent>
            </Card>
          </div>

          <h3>Phương pháp hỗn hợp - "Best of both worlds"</h3>
          <p>
            Ngày nay, nhiều nghiên cứu sử dụng phương pháp hỗn hợp để tận dụng ưu điểm của cả hai:
          </p>

          <div className="bg-purple-50 border-l-4 border-purple-500 p-6 mb-8">
            <h4 className="font-semibold text-purple-900 mb-2">Ví dụ nghiên cứu hỗn hợp:</h4>
            <div className="text-purple-800 text-sm space-y-2">
              <div><strong>Giai đoạn 1 (Định tính):</strong> Phỏng vấn 15 sinh viên để khám phá các yếu tố ảnh hưởng đến quyết định mua hàng online</div>
              <div><strong>Giai đoạn 2 (Định lượng):</strong> Khảo sát 400 sinh viên để kiểm định mô hình và đo lường mức độ ảnh hưởng</div>
              <div><strong>Giai đoạn 3 (Định tính):</strong> Phỏng vấn thêm 10 sinh viên để giải thích kết quả bất ngờ từ khảo sát</div>
            </div>
          </div>

          <h2>Bước 4: Thiết kế mẫu nghiên cứu</h2>
          
          <h3>Cỡ mẫu: Không phải "càng nhiều càng tốt"</h3>
          <p>
            Nhiều người nghĩ cỡ mẫu càng lớn càng tốt. Đúng một phần, nhưng quan trọng hơn là 
            <strong>chất lượng mẫu</strong> và <strong>phương pháp chọn mẫu</strong>.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Tính cỡ mẫu định lượng</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div><strong>Công thức cơ bản:</strong> n = (Z²×p×q) / E²</div>
                  <div><strong>Z:</strong> Hệ số tin cậy (1.96 với 95%)</div>
                  <div><strong>p:</strong> Tỷ lệ ước tính (0.5 nếu không biết)</div>
                  <div><strong>E:</strong> Sai số cho phép (thường 5%)</div>
                  <div className="bg-blue-50 p-3 rounded">
                    <strong>Ví dụ:</strong> n = (1.96²×0.5×0.5) / 0.05² = 384 người
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Cỡ mẫu định tính</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div><strong>Nguyên tắc:</strong> Đến khi "bão hòa thông tin"</div>
                  <div><strong>Phỏng vấn sâu:</strong> 15-25 người</div>
                  <div><strong>Thảo luận nhóm:</strong> 6-8 nhóm, mỗi nhóm 8-12 người</div>
                  <div><strong>Quan sát:</strong> Tùy thuộc vào mục tiêu cụ thể</div>
                  <div className="bg-green-50 p-3 rounded">
                    <strong>Lưu ý:</strong> Chất lượng thông tin quan trọng hơn số lượng
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <h3>Phương pháp chọn mẫu</h3>
          <div className="space-y-4 mb-8">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-1" />
                  <div>
                    <h4 className="font-semibold mb-2">Chọn mẫu ngẫu nhiên (Random sampling)</h4>
                    <p className="text-sm text-gray-600">
                      Mỗi cá thể trong tổng thể có cơ hội được chọn như nhau. Tốt nhất cho tổng quát hóa 
                      nhưng khó thực hiện trong thực tế.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-blue-500 mr-3 mt-1" />
                  <div>
                    <h4 className="font-semibold mb-2">Chọn mẫu thuận tiện (Convenience sampling)</h4>
                    <p className="text-sm text-gray-600">
                      Chọn những người dễ tiếp cận nhất. Dễ thực hiện nhưng có thể thiên lệch. 
                      Phù hợp với nghiên cứu khám phá.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-purple-500 mr-3 mt-1" />
                  <div>
                    <h4 className="font-semibold mb-2">Chọn mẫu có mục đích (Purposive sampling)</h4>
                    <p className="text-sm text-gray-600">
                      Chọn những người có đặc điểm phù hợp với mục tiêu nghiên cứu. 
                      Thường dùng trong nghiên cứu định tính.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <h2>Bước 5: Thu thập dữ liệu</h2>
          
          <h3>Thiết kế công cụ thu thập dữ liệu</h3>
          <p>
            Công cụ thu thập dữ liệu giống như "cần câu" - phải phù hợp với "loại cá" bạn muốn câu.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <Card className="border-orange-200 bg-orange-50">
              <CardHeader>
                <CardTitle className="text-lg text-orange-800">Bảng hỏi (Questionnaire)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm text-orange-700">
                  <div><strong>Ưu điểm:</strong> Thu thập nhanh, chi phí thấp, dễ phân tích</div>
                  <div><strong>Nhược điểm:</strong> Có thể thiên lệch, thiếu sâu sắc</div>
                  <div><strong>Lưu ý:</strong> Câu hỏi phải rõ ràng, không gợi ý đáp án</div>
                  <div><strong>Công cụ:</strong> Google Forms, SurveyMonkey, NCSKIT Survey</div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-teal-200 bg-teal-50">
              <CardHeader>
                <CardTitle className="text-lg text-teal-800">Phỏng vấn (Interview)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm text-teal-700">
                  <div><strong>Ưu điểm:</strong> Thông tin sâu, linh hoạt, có thể làm rõ</div>
                  <div><strong>Nhược điểm:</strong> Tốn thời gian, khó tổng quát hóa</div>
                  <div><strong>Lưu ý:</strong> Cần kỹ năng phỏng vấn, môi trường thoải mái</div>
                  <div><strong>Công cụ:</strong> Zoom, Teams, ghi âm (có xin phép)</div>
                </div>
              </CardContent>
            </Card>
          </div>

          <h3>Mẹo thiết kế bảng hỏi hiệu quả</h3>
          <div className="space-y-4 mb-8">
            <div className="bg-green-50 border-l-4 border-green-500 p-4">
              <h5 className="font-semibold text-green-900">✅ NÊN làm:</h5>
              <ul className="text-green-800 text-sm space-y-1 mt-2">
                <li>• Bắt đầu với câu hỏi dễ, thú vị</li>
                <li>• Sử dụng ngôn ngữ đơn giản, dễ hiểu</li>
                <li>• Nhóm câu hỏi theo chủ đề</li>
                <li>• Có thanh tiến độ để người trả lời biết còn bao nhiêu</li>
                <li>• Test với 5-10 người trước khi phát hành chính thức</li>
              </ul>
            </div>

            <div className="bg-red-50 border-l-4 border-red-500 p-4">
              <h5 className="font-semibold text-red-900">❌ KHÔNG nên:</h5>
              <ul className="text-red-800 text-sm space-y-1 mt-2">
                <li>• Hỏi hai vấn đề trong một câu</li>
                <li>• Sử dụng từ ngữ mơ hồ như "thường xuyên", "nhiều"</li>
                <li>• Gợi ý đáp án trong câu hỏi</li>
                <li>• Làm bảng hỏi quá dài (&gt;15 phút)</li>
                <li>• Bỏ qua câu hỏi kiểm tra chất lượng dữ liệu</li>
              </ul>
            </div>
          </div>

          <h2>Bước 6: Phân tích dữ liệu</h2>
          
          <h3>Lập kế hoạch phân tích từ đầu</h3>
          <p>
            Đừng đợi đến khi có dữ liệu mới nghĩ cách phân tích. Lập kế hoạch phân tích ngay từ 
            giai đoạn thiết kế để đảm bảo thu thập đúng loại dữ liệu cần thiết.
          </p>

          <div className="bg-gray-100 p-6 rounded-lg mb-8">
            <h4 className="font-semibold mb-4">Quy trình phân tích dữ liệu với NCSKIT:</h4>
            <div className="space-y-3 text-sm">
              <div className="flex items-center">
                <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs mr-3">1</span>
                <span><strong>Làm sạch dữ liệu:</strong> Kiểm tra missing data, outliers, logic errors</span>
              </div>
              <div className="flex items-center">
                <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs mr-3">2</span>
                <span><strong>Thống kê mô tả:</strong> Mean, median, standard deviation, frequency</span>
              </div>
              <div className="flex items-center">
                <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs mr-3">3</span>
                <span><strong>Kiểm định giả thuyết:</strong> T-test, ANOVA, Chi-square, correlation</span>
              </div>
              <div className="flex items-center">
                <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs mr-3">4</span>
                <span><strong>Phân tích nâng cao:</strong> Regression, Factor Analysis, SEM</span>
              </div>
              <div className="flex items-center">
                <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs mr-3">5</span>
                <span><strong>Trực quan hóa:</strong> Charts, graphs, tables với giải thích</span>
              </div>
            </div>
          </div>

          <h2>Bước 7: Báo cáo kết quả</h2>
          
          <h3>Cấu trúc báo cáo nghiên cứu chuẩn</h3>
          <p>
            Báo cáo nghiên cứu tốt phải "kể câu chuyện" một cách logic và thuyết phục. 
            NCSKIT tự động tạo báo cáo theo chuẩn APA với đầy đủ các phần:
          </p>

          <div className="space-y-4 mb-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <FileText className="h-5 w-5 mr-2" />
                  Cấu trúc báo cáo chuẩn
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div><strong>1. Tóm tắt (Abstract):</strong> Tổng quan 250-300 từ về toàn bộ nghiên cứu</div>
                  <div><strong>2. Giới thiệu:</strong> Bối cảnh, vấn đề, mục tiêu nghiên cứu</div>
                  <div><strong>3. Tổng quan lý thuyết:</strong> Khung lý thuyết, giả thuyết</div>
                  <div><strong>4. Phương pháp:</strong> Thiết kế, mẫu, công cụ, quy trình</div>
                  <div><strong>5. Kết quả:</strong> Phân tích dữ liệu, kiểm định giả thuyết</div>
                  <div><strong>6. Thảo luận:</strong> Giải thích, so sánh với nghiên cứu khác</div>
                  <div><strong>7. Kết luận:</strong> Tóm tắt, hạn chế, hướng phát triển</div>
                </div>
              </CardContent>
            </Card>
          </div>

          <h2>Những lưu ý quan trọng</h2>
          
          <div className="space-y-6 mb-8">
            <div className="bg-yellow-50 border-l-4 border-yellow-500 p-6">
              <h4 className="font-semibold text-yellow-900 mb-2 flex items-center">
                <AlertTriangle className="h-5 w-5 mr-2" />
                Những sai lầm thường gặp:
              </h4>
              <ul className="text-yellow-800 space-y-2 text-sm">
                <li>• Thay đổi câu hỏi nghiên cứu giữa chừng</li>
                <li>• Thu thập dữ liệu trước khi có kế hoạch phân tích</li>
                <li>• Bỏ qua việc kiểm tra chất lượng dữ liệu</li>
                <li>• Không báo cáo hạn chế của nghiên cứu</li>
                <li>• Tổng quát hóa kết quả quá mức</li>
              </ul>
            </div>

            <div className="bg-blue-50 border-l-4 border-blue-500 p-6">
              <h4 className="font-semibold text-blue-900 mb-2">Bí kíp thành công:</h4>
              <ul className="text-blue-800 space-y-2 text-sm">
                <li>• Lập kế hoạch chi tiết từ đầu và tuân thủ</li>
                <li>• Pilot test mọi thứ trước khi thực hiện chính thức</li>
                <li>• Ghi chép quá trình thực hiện để báo cáo hạn chế</li>
                <li>• Tham khảo ý kiến chuyên gia và đồng nghiệp</li>
                <li>• Luôn đặt chất lượng lên trên số lượng</li>
              </ul>
            </div>
          </div>

          <h2>Kết luận</h2>
          <p>
            Thiết kế nghiên cứu tốt là nền tảng của mọi nghiên cứu thành công. Không có "công thức" 
            cố định nào - mỗi nghiên cứu có những đặc thù riêng. Quan trọng là hiểu rõ nguyên tắc 
            và linh hoạt áp dụng.
          </p>

          <p>
            NCSKIT hỗ trợ bạn trong toàn bộ quy trình từ thiết kế đến báo cáo. Với các template 
            có sẵn và hướng dẫn chi tiết, bạn có thể tự tin thực hiện nghiên cứu chất lượng cao 
            ngay cả khi mới bắt đầu.
          </p>

          <div className="bg-green-50 border-l-4 border-green-500 p-6 mt-8">
            <h3 className="text-lg font-semibold text-green-900 mb-2">Sẵn sàng thiết kế nghiên cứu đầu tiên?</h3>
            <p className="text-green-800 mb-4">
              Bắt đầu hành trình nghiên cứu của bạn với NCSKIT Research Designer - 
              từ ý tưởng đến báo cáo hoàn chỉnh!
            </p>
            <Link href="/dashboard/projects/new">
              <Button className="bg-green-600 hover:bg-green-700">
                Tạo dự án nghiên cứu mới
              </Button>
            </Link>
          </div>
        </div>

        {/* Article Footer */}
        <div className="border-t pt-8 mt-12">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <User className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h4 className="font-semibold">Lê Phúc Hải</h4>
                <p className="text-sm text-gray-600">Nghiên cứu sinh tiến sĩ Quản lý kinh doanh</p>
                <p className="text-xs text-gray-500">Chuyên gia thiết kế nghiên cứu và phương pháp luận</p>
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
                  <Link href="/blog/hoi-quy-toan-dien" className="hover:text-blue-600">
                    Hồi quy toàn diện: Tuyến tính, Logistic và Đa cấp
                  </Link>
                </h4>
                <p className="text-gray-600 text-sm">
                  Hướng dẫn chi tiết các kỹ thuật hồi quy từ cơ bản đến nâng cao với ví dụ thực tế.
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <Badge className="bg-purple-100 text-purple-800 mb-3">Phân tích nâng cao</Badge>
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
          </div>
        </div>
      </div>
    </div>
  )
}