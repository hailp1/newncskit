import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Calendar, Clock, User, ArrowLeft, Share2, BookOpen, TrendingUp, CheckCircle, Lightbulb, AlertTriangle, BarChart3 } from 'lucide-react'

export default function HoiQuyToanDienPage() {
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
          <Badge className="bg-orange-100 text-orange-800 mb-4">Phân tích thống kê</Badge>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Hồi quy toàn diện: Tuyến tính, Logistic và Đa cấp
          </h1>
          <p className="text-xl text-gray-600 mb-6">
            Hướng dẫn chi tiết các kỹ thuật hồi quy từ cơ bản đến nâng cao với ví dụ thực tế và mẹo thực hành hữu ích. 
            Hồi quy không còn là "ác mộng" nữa!
          </p>
          
          <div className="flex items-center justify-center space-x-6 text-sm text-gray-500 mb-8">
            <div className="flex items-center">
              <User className="h-4 w-4 mr-2" />
              Lê Phúc Hải
            </div>
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-2" />
              5 tháng 1, 2024
            </div>
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-2" />
              15 phút đọc
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
          <div className="bg-orange-50 border-l-4 border-orange-500 p-6 mb-8">
            <h3 className="text-lg font-semibold text-orange-900 mb-2 flex items-center">
              <BarChart3 className="h-5 w-5 mr-2" />
              Bạn sẽ thành thạo:
            </h3>
            <ul className="text-orange-800 space-y-1">
              <li>• Hồi quy tuyến tính: Từ đơn giản đến đa biến</li>
              <li>• Hồi quy Logistic: Dự đoán xác suất và phân loại</li>
              <li>• Hồi quy đa cấp (HLM): Xử lý dữ liệu phân cấp</li>
              <li>• Kiểm tra giả định và xử lý vi phạm</li>
              <li>• Thực hành với NCSKIT từng bước một</li>
            </ul>
          </div>

          <h2>Hồi quy là gì và tại sao quan trọng?</h2>
          <p>
            Hồi quy (Regression) là một trong những kỹ thuật thống kê phổ biến nhất, giúp chúng ta hiểu mối quan hệ 
            giữa các biến và dự đoán kết quả. Nói đơn giản, hồi quy trả lời câu hỏi: 
            <strong>"Nếu tôi thay đổi X, thì Y sẽ thay đổi như thế nào?"</strong>
          </p>

          <div className="bg-blue-50 border-l-4 border-blue-500 p-6 mb-8">
            <h4 className="font-semibold text-blue-900 mb-2 flex items-center">
              <Lightbulb className="h-5 w-5 mr-2" />
              Ví dụ đời thường
            </h4>
            <p className="text-blue-800">
              • Lương của bạn tăng 1 triệu → Chi tiêu tăng bao nhiêu?<br/>
              • Học thêm 1 giờ/ngày → Điểm thi tăng bao nhiêu?<br/>
              • Tăng giá sản phẩm 10% → Doanh số giảm bao nhiêu?
            </p>
          </div>

          <h2>Hồi quy tuyến tính - "Ông tổ" của các phương pháp</h2>
          
          <h3>Hồi quy tuyến tính đơn giản</h3>
          <p>
            Bắt đầu với trường hợp đơn giản nhất: một biến độc lập (X) và một biến phụ thuộc (Y). 
            Công thức cơ bản: <strong>Y = a + bX + e</strong>
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <Card className="border-green-200 bg-green-50">
              <CardHeader>
                <CardTitle className="text-lg text-green-800">Ví dụ: Chiều cao và Cân nặng</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm text-green-700">
                  <div><strong>Y:</strong> Cân nặng (kg)</div>
                  <div><strong>X:</strong> Chiều cao (cm)</div>
                  <div><strong>Phương trình:</strong> Cân nặng = -100 + 1.2 × Chiều cao</div>
                  <div><strong>Giải thích:</strong> Tăng 1cm chiều cao → tăng 1.2kg cân nặng</div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-blue-200 bg-blue-50">
              <CardHeader>
                <CardTitle className="text-lg text-blue-800">Các thành phần quan trọng</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm text-blue-700">
                  <div><strong>a (Intercept):</strong> Giá trị Y khi X = 0</div>
                  <div><strong>b (Slope):</strong> Độ dốc, mức thay đổi của Y</div>
                  <div><strong>R²:</strong> Tỷ lệ biến thiên được giải thích</div>
                  <div><strong>p-value:</strong> Mức ý nghĩa thống kê</div>
                </div>
              </CardContent>
            </Card>
          </div>

          <h3>Hồi quy tuyến tính đa biến</h3>
          <p>
            Trong thực tế, hiếm khi chỉ có một yếu tố ảnh hưởng. Hồi quy đa biến giúp chúng ta xem xét 
            tác động đồng thời của nhiều biến: <strong>Y = a + b₁X₁ + b₂X₂ + ... + bₙXₙ + e</strong>
          </p>

          <div className="bg-gray-100 p-6 rounded-lg mb-8">
            <h4 className="font-semibold mb-4">Ví dụ: Dự đoán giá nhà</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <strong>Biến phụ thuộc (Y):</strong>
                <ul className="mt-2 space-y-1">
                  <li>• Giá nhà (tỷ đồng)</li>
                </ul>
              </div>
              <div>
                <strong>Biến độc lập (X):</strong>
                <ul className="mt-2 space-y-1">
                  <li>• Diện tích (m²)</li>
                  <li>• Số phòng ngủ</li>
                  <li>• Khoảng cách đến trung tâm (km)</li>
                  <li>• Tuổi nhà (năm)</li>
                </ul>
              </div>
            </div>
            <div className="mt-4 p-3 bg-white rounded border-l-4 border-blue-500">
              <strong>Phương trình:</strong> Giá = 0.5 + 0.02×Diện_tích + 0.1×Số_phòng - 0.05×Khoảng_cách - 0.01×Tuổi_nhà
            </div>
          </div>

          <h3>Kiểm tra giả định hồi quy tuyến tính</h3>
          <p>
            Hồi quy tuyến tính có những "quy tắc" cần tuân thủ. NCSKIT tự động kiểm tra tất cả:
          </p>

          <div className="space-y-4 mb-8">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-1" />
                  <div>
                    <h4 className="font-semibold mb-2">Tính tuyến tính (Linearity)</h4>
                    <p className="text-sm text-gray-600">
                      Mối quan hệ giữa X và Y phải là đường thẳng. Kiểm tra bằng scatter plot.
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
                    <h4 className="font-semibold mb-2">Tính độc lập (Independence)</h4>
                    <p className="text-sm text-gray-600">
                      Các quan sát phải độc lập với nhau. Quan trọng với dữ liệu chuỗi thời gian.
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
                    <h4 className="font-semibold mb-2">Phương sai đồng nhất (Homoscedasticity)</h4>
                    <p className="text-sm text-gray-600">
                      Phương sai của sai số không đổi. Kiểm tra bằng biểu đồ residuals vs fitted values.
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
                    <h4 className="font-semibold mb-2">Phân phối chuẩn của sai số (Normality)</h4>
                    <p className="text-sm text-gray-600">
                      Sai số phải có phân phối chuẩn. Kiểm tra bằng Q-Q plot và Shapiro-Wilk test.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <h2>Hồi quy Logistic - Khi kết quả là "Có/Không"</h2>
          <p>
            Khi biến phụ thuộc là nhị phân (0/1, Có/Không, Thành công/Thất bại), hồi quy tuyến tính không phù hợp. 
            Đây là lúc hồi quy Logistic tỏa sáng!
          </p>

          <div className="bg-purple-50 border-l-4 border-purple-500 p-6 mb-8">
            <h4 className="font-semibold text-purple-900 mb-2">Tại sao không dùng hồi quy tuyến tính?</h4>
            <p className="text-purple-800 text-sm">
              Hồi quy tuyến tính có thể cho kết quả &lt; 0 hoặc &gt; 1, vô nghĩa với xác suất. 
              Hồi quy Logistic sử dụng hàm logit để đảm bảo kết quả luôn trong khoảng [0,1].
            </p>
          </div>

          <h3>Cách hoạt động của Logistic Regression</h3>
          <p>
            Thay vì dự đoán trực tiếp Y, Logistic regression dự đoán <strong>xác suất</strong> Y xảy ra:
          </p>

          <div className="bg-gray-100 p-6 rounded-lg mb-8">
            <h4 className="font-semibold mb-4">Công thức Logistic:</h4>
            <div className="space-y-2 text-sm font-mono">
              <div>p = e^(a + bX) / (1 + e^(a + bX))</div>
              <div>hoặc: ln(p/(1-p)) = a + bX</div>
            </div>
            <p className="text-sm text-gray-600 mt-3">
              <strong>p:</strong> Xác suất sự kiện xảy ra (0 ≤ p ≤ 1)<br/>
              <strong>ln(p/(1-p)):</strong> Log odds (logit)
            </p>
          </div>

          <h3>Ví dụ thực tế: Dự đoán khách hàng mua hàng</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Dữ liệu đầu vào</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div><strong>Y:</strong> Mua hàng (1) hoặc Không mua (0)</div>
                  <div><strong>X₁:</strong> Tuổi khách hàng</div>
                  <div><strong>X₂:</strong> Thu nhập (triệu/tháng)</div>
                  <div><strong>X₃:</strong> Số lần truy cập website</div>
                  <div><strong>X₄:</strong> Thời gian ở trên trang (phút)</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Kết quả từ NCSKIT</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div>Tuổi: OR = 1.02 (p &lt; 0.05)</div>
                  <div>Thu nhập: OR = 1.15 (p &lt; 0.001)</div>
                  <div>Lần truy cập: OR = 1.08 (p &lt; 0.01)</div>
                  <div>Thời gian: OR = 1.25 (p &lt; 0.001)</div>
                  <div className="pt-2 border-t">
                    <strong>Accuracy: 78.5%</strong>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <h3>Giải thích Odds Ratio (OR)</h3>
          <p>
            Odds Ratio là chỉ số quan trọng nhất trong Logistic regression:
          </p>

          <div className="space-y-4 mb-8">
            <div className="border-l-4 border-green-500 pl-4">
              <h5 className="font-semibold">OR = 1: Không có tác động</h5>
              <p className="text-sm text-gray-600">
                Biến này không ảnh hưởng đến xác suất kết quả.
              </p>
            </div>
            <div className="border-l-4 border-blue-500 pl-4">
              <h5 className="font-semibold">OR &gt; 1: Tác động tích cực</h5>
              <p className="text-sm text-gray-600">
                OR = 1.15 nghĩa là tăng 1 đơn vị X làm tăng odds 15%.
              </p>
            </div>
            <div className="border-l-4 border-red-500 pl-4">
              <h5 className="font-semibold">OR &lt; 1: Tác động tiêu cực</h5>
              <p className="text-sm text-gray-600">
                OR = 0.8 nghĩa là tăng 1 đơn vị X làm giảm odds 20%.
              </p>
            </div>
          </div>

          <h2>Hồi quy đa cấp (HLM) - Xử lý dữ liệu phân cấp</h2>
          <p>
            Khi dữ liệu có cấu trúc phân cấp (học sinh trong lớp, nhân viên trong công ty, bệnh nhân trong bệnh viện), 
            hồi quy thông thường có thể cho kết quả sai lệch. HLM ra đời để giải quyết vấn đề này.
          </p>

          <div className="bg-yellow-50 border-l-4 border-yellow-500 p-6 mb-8">
            <h4 className="font-semibold text-yellow-900 mb-2 flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2" />
              Tại sao cần HLM?
            </h4>
            <p className="text-yellow-800 text-sm">
              Học sinh trong cùng một lớp có xu hướng giống nhau hơn học sinh khác lớp. 
              Nếu bỏ qua điều này, chúng ta có thể đưa ra kết luận sai về tác động của các yếu tố.
            </p>
          </div>

          <h3>Cấu trúc dữ liệu đa cấp</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Cấp 1 (Level 1)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div><strong>Đơn vị:</strong> Cá nhân</div>
                  <div><strong>Ví dụ:</strong> Học sinh</div>
                  <div><strong>Biến:</strong> Điểm thi, giới tính, tuổi</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Cấp 2 (Level 2)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div><strong>Đơn vị:</strong> Nhóm</div>
                  <div><strong>Ví dụ:</strong> Lớp học</div>
                  <div><strong>Biến:</strong> Sĩ số lớp, kinh nghiệm giáo viên</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Cấp 3 (Level 3)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div><strong>Đơn vị:</strong> Tổ chức</div>
                  <div><strong>Ví dụ:</strong> Trường học</div>
                  <div><strong>Biến:</strong> Loại trường, vị trí địa lý</div>
                </div>
              </CardContent>
            </Card>
          </div>

          <h3>Ví dụ HLM: Nghiên cứu thành tích học tập</h3>
          <div className="bg-gray-50 p-6 rounded-lg mb-8">
            <h4 className="font-semibold mb-4">Mô hình 3 cấp:</h4>
            <div className="space-y-3 text-sm">
              <div className="bg-white p-3 rounded border-l-4 border-blue-500">
                <strong>Cấp 1 (Học sinh):</strong> Điểm_thi = β₀ + β₁×Giới_tính + β₂×IQ + e
              </div>
              <div className="bg-white p-3 rounded border-l-4 border-green-500">
                <strong>Cấp 2 (Lớp học):</strong> β₀ = γ₀₀ + γ₀₁×Sĩ_số_lớp + u₀
              </div>
              <div className="bg-white p-3 rounded border-l-4 border-purple-500">
                <strong>Cấp 3 (Trường):</strong> γ₀₀ = δ₀₀₀ + δ₀₀₁×Loại_trường + v₀₀
              </div>
            </div>
          </div>

          <h2>Thực hành với NCSKIT</h2>
          
          <h3>Giao diện thân thiện</h3>
          <p>
            NCSKIT biến việc phân tích hồi quy phức tạp thành đơn giản với giao diện kéo-thả:
          </p>

          <div className="space-y-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <span className="bg-orange-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm mr-3">1</span>
                  Upload dữ liệu
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  Kéo thả file Excel/CSV hoặc kết nối trực tiếp với database. 
                  NCSKIT tự động phát hiện loại dữ liệu và đề xuất phương pháp phù hợp.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <span className="bg-orange-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm mr-3">2</span>
                  Chọn biến và phương pháp
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  Kéo biến vào vị trí phù hợp. NCSKIT tự động kiểm tra giả định và 
                  cảnh báo nếu có vấn đề với dữ liệu.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <span className="bg-orange-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm mr-3">3</span>
                  Phân tích và giải thích
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  Nhận kết quả với biểu đồ trực quan và giải thích bằng tiếng Việt dễ hiểu. 
                  Xuất báo cáo APA style chỉ với một click.
                </p>
              </CardContent>
            </Card>
          </div>

          <h3>Tính năng nâng cao</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <Card className="border-blue-200 bg-blue-50">
              <CardHeader>
                <CardTitle className="text-lg text-blue-800">Kiểm tra tự động</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-blue-700 space-y-2">
                  <li>• Phát hiện outliers và missing data</li>
                  <li>• Kiểm tra multicollinearity</li>
                  <li>• Test giả định hồi quy</li>
                  <li>• Đề xuất biến đổi dữ liệu</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-green-200 bg-green-50">
              <CardHeader>
                <CardTitle className="text-lg text-green-800">Trực quan hóa</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-green-700 space-y-2">
                  <li>• Scatter plots với đường hồi quy</li>
                  <li>• Residual plots để kiểm tra giả định</li>
                  <li>• ROC curves cho Logistic regression</li>
                  <li>• Forest plots cho HLM</li>
                </ul>
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
                <li>• Không kiểm tra giả định trước khi phân tích</li>
                <li>• Nhầm lẫn correlation và causation</li>
                <li>• Overfitting: quá nhiều biến so với kích thước mẫu</li>
                <li>• Bỏ qua multicollinearity</li>
                <li>• Không cross-validate kết quả</li>
              </ul>
            </div>

            <div className="bg-green-50 border-l-4 border-green-500 p-6">
              <h4 className="font-semibold text-green-900 mb-2">Bí kíp thành công:</h4>
              <ul className="text-green-800 space-y-2 text-sm">
                <li>• Luôn bắt đầu với EDA (Exploratory Data Analysis)</li>
                <li>• Kiểm tra và xử lý outliers cẩn thận</li>
                <li>• Sử dụng cross-validation để đánh giá mô hình</li>
                <li>• Giải thích kết quả trong bối cảnh thực tế</li>
                <li>• Báo cáo đầy đủ limitations và assumptions</li>
              </ul>
            </div>
          </div>

          <h2>Kết luận</h2>
          <p>
            Hồi quy là công cụ mạnh mẽ nhưng cũng đòi hỏi sự hiểu biết về giả định và hạn chế. 
            Không có phương pháp nào là "tốt nhất" - chọn phương pháp phù hợp với dữ liệu và 
            câu hỏi nghiên cứu của bạn.
          </p>

          <p>
            NCSKIT giúp bạn thực hiện tất cả các loại hồi quy một cách dễ dàng, từ cơ bản đến nâng cao. 
            Với hướng dẫn chi tiết và kiểm tra tự động, bạn có thể tự tin phân tích dữ liệu 
            và đưa ra kết luận chính xác.
          </p>

          <div className="bg-orange-50 border-l-4 border-orange-500 p-6 mt-8">
            <h3 className="text-lg font-semibold text-orange-900 mb-2">Sẵn sàng làm chủ hồi quy?</h3>
            <p className="text-orange-800 mb-4">
              Bắt đầu hành trình phân tích hồi quy của bạn với NCSKIT - từ tuyến tính đơn giản 
              đến đa cấp phức tạp, chúng tôi đều hỗ trợ!
            </p>
            <Link href="/dashboard/analysis">
              <Button className="bg-orange-600 hover:bg-orange-700">
                Thử ngay NCSKIT Regression Analysis
              </Button>
            </Link>
          </div>
        </div>

        {/* Article Footer */}
        <div className="border-t pt-8 mt-12">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                <User className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <h4 className="font-semibold">Lê Phúc Hải</h4>
                <p className="text-sm text-gray-600">Nghiên cứu sinh tiến sĩ Quản lý kinh doanh</p>
                <p className="text-xs text-gray-500">Chuyên gia phân tích hồi quy và mô hình thống kê</p>
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
          </div>
        </div>
      </div>
    </div>
  )
}