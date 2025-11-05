// Professional Error Handler Service
// Converts technical errors to user-friendly messages

export interface ErrorMessage {
  title: string;
  message: string;
  type: 'error' | 'warning' | 'info';
  action?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
}

export class ErrorHandler {
  // Authentication errors
  static handleAuthError(error: any): ErrorMessage {
    const errorMessage = error?.message?.toLowerCase() || '';
    
    // Login errors
    if (errorMessage.includes('invalid login credentials') || 
        errorMessage.includes('email hoặc mật khẩu không đúng')) {
      return {
        title: 'Đăng nhập thất bại',
        message: 'Thông tin đăng nhập không chính xác. Vui lòng kiểm tra lại email và mật khẩu.',
        type: 'error',
        action: {
          label: 'Quên mật khẩu?',
          href: '/forgot-password'
        }
      };
    }

    if (errorMessage.includes('email not confirmed') || 
        errorMessage.includes('email_not_confirmed')) {
      return {
        title: 'Tài khoản chưa được kích hoạt',
        message: 'Vui lòng kiểm tra email và nhấp vào liên kết xác nhận để kích hoạt tài khoản.',
        type: 'warning',
        action: {
          label: 'Gửi lại email xác nhận',
          onClick: () => {
            // TODO: Implement resend confirmation
          }
        }
      };
    }

    if (errorMessage.includes('too many requests') || 
        errorMessage.includes('rate limit')) {
      return {
        title: 'Quá nhiều lần thử',
        message: 'Bạn đã thử đăng nhập quá nhiều lần. Vui lòng đợi 15 phút rồi thử lại.',
        type: 'warning'
      };
    }

    if (errorMessage.includes('user not found') || 
        errorMessage.includes('account does not exist')) {
      return {
        title: 'Tài khoản không tồn tại',
        message: 'Không tìm thấy tài khoản với email này. Vui lòng kiểm tra lại hoặc đăng ký tài khoản mới.',
        type: 'error',
        action: {
          label: 'Đăng ký tài khoản',
          href: '/register'
        }
      };
    }

    if (errorMessage.includes('account disabled') || 
        errorMessage.includes('account suspended')) {
      return {
        title: 'Tài khoản bị tạm khóa',
        message: 'Tài khoản của bạn đã bị tạm khóa. Vui lòng liên hệ bộ phận hỗ trợ để được trợ giúp.',
        type: 'error',
        action: {
          label: 'Liên hệ hỗ trợ',
          href: 'mailto:support@ncskit.com'
        }
      };
    }

    // Registration errors
    if (errorMessage.includes('user already registered') || 
        errorMessage.includes('email already exists')) {
      return {
        title: 'Email đã được sử dụng',
        message: 'Tài khoản với email này đã tồn tại. Vui lòng đăng nhập hoặc sử dụng email khác.',
        type: 'error',
        action: {
          label: 'Đăng nhập',
          href: '/login'
        }
      };
    }

    if (errorMessage.includes('email_address_invalid') || 
        errorMessage.includes('invalid email')) {
      return {
        title: 'Email không hợp lệ',
        message: 'Vui lòng nhập địa chỉ email hợp lệ.',
        type: 'error'
      };
    }

    if (errorMessage.includes('password') && errorMessage.includes('weak')) {
      return {
        title: 'Mật khẩu không đủ mạnh',
        message: 'Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường và số.',
        type: 'error'
      };
    }

    if (errorMessage.includes('signup_disabled')) {
      return {
        title: 'Đăng ký tạm thời bị tắt',
        message: 'Hệ thống đang bảo trì. Vui lòng thử lại sau hoặc liên hệ bộ phận hỗ trợ.',
        type: 'warning',
        action: {
          label: 'Liên hệ hỗ trợ',
          href: 'mailto:support@ncskit.com'
        }
      };
    }

    // Network errors
    if (errorMessage.includes('network') || 
        errorMessage.includes('fetch') || 
        errorMessage.includes('connection')) {
      return {
        title: 'Lỗi kết nối',
        message: 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối internet và thử lại.',
        type: 'error'
      };
    }

    // Server errors
    if (errorMessage.includes('500') || 
        errorMessage.includes('internal server error')) {
      return {
        title: 'Lỗi hệ thống',
        message: 'Hệ thống đang gặp sự cố. Chúng tôi đang khắc phục, vui lòng thử lại sau.',
        type: 'error'
      };
    }

    if (errorMessage.includes('503') || 
        errorMessage.includes('service unavailable')) {
      return {
        title: 'Hệ thống bảo trì',
        message: 'Hệ thống đang được bảo trì. Vui lòng thử lại sau ít phút.',
        type: 'warning'
      };
    }

    // Default error
    return {
      title: 'Có lỗi xảy ra',
      message: 'Đã xảy ra lỗi không mong muốn. Vui lòng thử lại hoặc liên hệ bộ phận hỗ trợ nếu vấn đề vẫn tiếp tục.',
      type: 'error',
      action: {
        label: 'Thử lại',
        onClick: () => window.location.reload()
      }
    };
  }

  // Project errors
  static handleProjectError(error: any): ErrorMessage {
    const errorMessage = error?.message?.toLowerCase() || '';

    if (errorMessage.includes('unauthorized') || errorMessage.includes('permission denied')) {
      return {
        title: 'Không có quyền truy cập',
        message: 'Bạn không có quyền thực hiện thao tác này.',
        type: 'error'
      };
    }

    if (errorMessage.includes('project not found')) {
      return {
        title: 'Không tìm thấy dự án',
        message: 'Dự án này không tồn tại hoặc đã bị xóa.',
        type: 'error',
        action: {
          label: 'Về trang chủ',
          href: '/dashboard'
        }
      };
    }

    if (errorMessage.includes('quota exceeded') || errorMessage.includes('limit reached')) {
      return {
        title: 'Đã đạt giới hạn',
        message: 'Bạn đã đạt giới hạn số lượng dự án. Vui lòng nâng cấp gói dịch vụ để tiếp tục.',
        type: 'warning',
        action: {
          label: 'Nâng cấp gói',
          href: '/pricing'
        }
      };
    }

    return this.handleGenericError(error);
  }

  // File upload errors
  static handleUploadError(error: any): ErrorMessage {
    const errorMessage = error?.message?.toLowerCase() || '';

    if (errorMessage.includes('file too large') || errorMessage.includes('size limit')) {
      return {
        title: 'File quá lớn',
        message: 'Kích thước file vượt quá giới hạn cho phép (10MB). Vui lòng chọn file nhỏ hơn.',
        type: 'error'
      };
    }

    if (errorMessage.includes('invalid file type') || errorMessage.includes('unsupported format')) {
      return {
        title: 'Định dạng file không hỗ trợ',
        message: 'Chỉ hỗ trợ các file: PDF, DOC, DOCX, TXT, CSV, XLS, XLSX.',
        type: 'error'
      };
    }

    if (errorMessage.includes('upload failed') || errorMessage.includes('storage error')) {
      return {
        title: 'Tải file thất bại',
        message: 'Không thể tải file lên. Vui lòng kiểm tra kết nối internet và thử lại.',
        type: 'error'
      };
    }

    return this.handleGenericError(error);
  }

  // Payment errors
  static handlePaymentError(error: any): ErrorMessage {
    const errorMessage = error?.message?.toLowerCase() || '';

    if (errorMessage.includes('card declined') || errorMessage.includes('payment failed')) {
      return {
        title: 'Thanh toán thất bại',
        message: 'Thẻ của bạn đã bị từ chối. Vui lòng kiểm tra thông tin thẻ hoặc liên hệ ngân hàng.',
        type: 'error'
      };
    }

    if (errorMessage.includes('insufficient funds')) {
      return {
        title: 'Số dư không đủ',
        message: 'Tài khoản không có đủ số dư để thực hiện giao dịch.',
        type: 'error'
      };
    }

    if (errorMessage.includes('expired card')) {
      return {
        title: 'Thẻ đã hết hạn',
        message: 'Thẻ thanh toán đã hết hạn. Vui lòng cập nhật thông tin thẻ mới.',
        type: 'error'
      };
    }

    return this.handleGenericError(error);
  }

  // Survey Builder errors
  static handleSurveyBuilderError(error: any): ErrorMessage {
    const errorMessage = error?.message?.toLowerCase() || '';

    if (errorMessage.includes('question bank') || errorMessage.includes('template not found')) {
      return {
        title: 'Không tìm thấy câu hỏi mẫu',
        message: 'Không thể tải câu hỏi từ ngân hàng câu hỏi. Bạn có thể tạo câu hỏi thủ công.',
        type: 'warning',
        action: {
          label: 'Tạo câu hỏi thủ công',
          onClick: () => {
            // Will be handled by the component
          }
        }
      };
    }

    if (errorMessage.includes('research design') || errorMessage.includes('invalid framework')) {
      return {
        title: 'Thiết kế nghiên cứu không hợp lệ',
        message: 'Thiết kế nghiên cứu chưa đầy đủ thông tin. Vui lòng kiểm tra lại khung lý thuyết và biến nghiên cứu.',
        type: 'error',
        action: {
          label: 'Quay lại thiết kế nghiên cứu',
          href: '/projects/new?step=research-design'
        }
      };
    }

    if (errorMessage.includes('survey validation') || errorMessage.includes('invalid survey')) {
      return {
        title: 'Survey không hợp lệ',
        message: 'Survey có lỗi cấu trúc hoặc thiếu thông tin bắt buộc. Vui lòng kiểm tra lại các câu hỏi.',
        type: 'error',
        action: {
          label: 'Kiểm tra survey',
          onClick: () => {
            // Will be handled by the component
          }
        }
      };
    }

    if (errorMessage.includes('generation failed') || errorMessage.includes('auto-generation')) {
      return {
        title: 'Không thể tự động tạo survey',
        message: 'Hệ thống không thể tự động tạo survey từ thiết kế nghiên cứu. Bạn có thể tạo survey thủ công.',
        type: 'warning',
        action: {
          label: 'Tạo survey thủ công',
          onClick: () => {
            // Will be handled by the component
          }
        }
      };
    }

    if (errorMessage.includes('save failed') || errorMessage.includes('storage')) {
      return {
        title: 'Không thể lưu survey',
        message: 'Có lỗi khi lưu survey. Vui lòng kiểm tra kết nối và thử lại.',
        type: 'error',
        action: {
          label: 'Thử lại',
          onClick: () => {
            // Will be handled by the component
          }
        }
      };
    }

    return this.handleGenericError(error);
  }

  // Survey Campaign errors
  static handleCampaignError(error: any): ErrorMessage {
    const errorMessage = error?.message?.toLowerCase() || '';

    if (errorMessage.includes('insufficient tokens') || errorMessage.includes('balance')) {
      return {
        title: 'Số dư token không đủ',
        message: 'Tài khoản không có đủ token để tạo chiến dịch này. Vui lòng nạp thêm token.',
        type: 'error',
        action: {
          label: 'Nạp token',
          href: '/dashboard/tokens'
        }
      };
    }

    if (errorMessage.includes('campaign limit') || errorMessage.includes('quota exceeded')) {
      return {
        title: 'Đã đạt giới hạn chiến dịch',
        message: 'Bạn đã đạt số lượng chiến dịch tối đa cho gói dịch vụ hiện tại.',
        type: 'warning',
        action: {
          label: 'Nâng cấp gói',
          href: '/pricing'
        }
      };
    }

    if (errorMessage.includes('no eligible participants') || errorMessage.includes('participants not found')) {
      return {
        title: 'Không tìm thấy người tham gia phù hợp',
        message: 'Không có thành viên nào phù hợp với tiêu chí của chiến dịch. Vui lòng điều chỉnh tiêu chí.',
        type: 'warning',
        action: {
          label: 'Điều chỉnh tiêu chí',
          onClick: () => {
            // Will be handled by the component
          }
        }
      };
    }

    if (errorMessage.includes('campaign not found') || errorMessage.includes('invalid campaign')) {
      return {
        title: 'Không tìm thấy chiến dịch',
        message: 'Chiến dịch này không tồn tại hoặc đã bị xóa.',
        type: 'error',
        action: {
          label: 'Về danh sách chiến dịch',
          href: '/dashboard/campaigns'
        }
      };
    }

    if (errorMessage.includes('launch failed') || errorMessage.includes('cannot launch')) {
      return {
        title: 'Không thể khởi chạy chiến dịch',
        message: 'Có lỗi khi khởi chạy chiến dịch. Vui lòng kiểm tra cấu hình và thử lại.',
        type: 'error',
        action: {
          label: 'Kiểm tra cấu hình',
          onClick: () => {
            // Will be handled by the component
          }
        }
      };
    }

    if (errorMessage.includes('notification failed') || errorMessage.includes('email')) {
      return {
        title: 'Không thể gửi thông báo',
        message: 'Có lỗi khi gửi thông báo đến người tham gia. Chiến dịch vẫn hoạt động bình thường.',
        type: 'warning',
        action: {
          label: 'Thử gửi lại',
          onClick: () => {
            // Will be handled by the component
          }
        }
      };
    }

    if (errorMessage.includes('reward processing') || errorMessage.includes('token distribution')) {
      return {
        title: 'Lỗi xử lý phần thưởng',
        message: 'Có lỗi khi phân phối token thưởng. Chúng tôi sẽ xử lý thủ công trong 24h.',
        type: 'warning',
        action: {
          label: 'Liên hệ hỗ trợ',
          href: 'mailto:support@ncskit.com'
        }
      };
    }

    return this.handleGenericError(error);
  }

  // Data Integration errors
  static handleDataIntegrationError(error: any): ErrorMessage {
    const errorMessage = error?.message?.toLowerCase() || '';

    if (errorMessage.includes('file too large') || errorMessage.includes('size limit')) {
      return {
        title: 'File quá lớn',
        message: 'Kích thước file vượt quá giới hạn 50MB. Vui lòng nén hoặc chia nhỏ file.',
        type: 'error',
        action: {
          label: 'Hướng dẫn nén file',
          href: '/help/file-compression'
        }
      };
    }

    if (errorMessage.includes('invalid format') || errorMessage.includes('unsupported')) {
      return {
        title: 'Định dạng file không được hỗ trợ',
        message: 'Chỉ hỗ trợ file CSV và Excel (.xlsx, .xls). Vui lòng chuyển đổi file sang định dạng phù hợp.',
        type: 'error',
        action: {
          label: 'Hướng dẫn chuyển đổi',
          href: '/help/file-formats'
        }
      };
    }

    if (errorMessage.includes('parsing error') || errorMessage.includes('corrupt')) {
      return {
        title: 'File bị lỗi hoặc hỏng',
        message: 'Không thể đọc file dữ liệu. File có thể bị hỏng hoặc có định dạng không chuẩn.',
        type: 'error',
        action: {
          label: 'Kiểm tra file mẫu',
          href: '/help/sample-data'
        }
      };
    }

    if (errorMessage.includes('no data') || errorMessage.includes('empty file')) {
      return {
        title: 'File không có dữ liệu',
        message: 'File được tải lên không chứa dữ liệu hoặc chỉ có tiêu đề cột.',
        type: 'warning',
        action: {
          label: 'Tải file khác',
          onClick: () => {
            // Will be handled by the component
          }
        }
      };
    }

    if (errorMessage.includes('survey data not found') || errorMessage.includes('no survey results')) {
      return {
        title: 'Không có dữ liệu survey',
        message: 'Dự án này chưa có dữ liệu survey hoặc chiến dịch chưa hoàn thành.',
        type: 'info',
        action: {
          label: 'Kiểm tra chiến dịch',
          href: '/dashboard/campaigns'
        }
      };
    }

    if (errorMessage.includes('data processing') || errorMessage.includes('analysis failed')) {
      return {
        title: 'Lỗi xử lý dữ liệu',
        message: 'Có lỗi khi xử lý dữ liệu để phân tích. Vui lòng kiểm tra định dạng dữ liệu.',
        type: 'error',
        action: {
          label: 'Xem hướng dẫn',
          href: '/help/data-format'
        }
      };
    }

    if (errorMessage.includes('column mapping') || errorMessage.includes('variable mapping')) {
      return {
        title: 'Lỗi ánh xạ biến',
        message: 'Không thể ánh xạ các cột dữ liệu với biến nghiên cứu. Vui lòng kiểm tra tên cột.',
        type: 'warning',
        action: {
          label: 'Ánh xạ thủ công',
          onClick: () => {
            // Will be handled by the component
          }
        }
      };
    }

    if (errorMessage.includes('statistical analysis') || errorMessage.includes('r server')) {
      return {
        title: 'Lỗi phân tích thống kê',
        message: 'Máy chủ phân tích thống kê gặp sự cố. Vui lòng thử lại sau ít phút.',
        type: 'error',
        action: {
          label: 'Thử lại',
          onClick: () => window.location.reload()
        }
      };
    }

    return this.handleGenericError(error);
  }

  // Progress Tracking errors
  static handleProgressTrackingError(error: any): ErrorMessage {
    const errorMessage = error?.message?.toLowerCase() || '';

    if (errorMessage.includes('milestone not found') || errorMessage.includes('invalid milestone')) {
      return {
        title: 'Milestone không hợp lệ',
        message: 'Milestone này không tồn tại hoặc không phù hợp với dự án.',
        type: 'error'
      };
    }

    if (errorMessage.includes('progress update failed')) {
      return {
        title: 'Không thể cập nhật tiến độ',
        message: 'Có lỗi khi cập nhật tiến độ dự án. Vui lòng thử lại.',
        type: 'error',
        action: {
          label: 'Thử lại',
          onClick: () => window.location.reload()
        }
      };
    }

    return this.handleGenericError(error);
  }

  // Question Bank errors
  static handleQuestionBankError(error: any): ErrorMessage {
    const errorMessage = error?.message?.toLowerCase() || '';

    if (errorMessage.includes('no questions found') || errorMessage.includes('empty result')) {
      return {
        title: 'Không tìm thấy câu hỏi',
        message: 'Không có câu hỏi nào phù hợp với tiêu chí tìm kiếm. Thử điều chỉnh bộ lọc.',
        type: 'info',
        action: {
          label: 'Xóa bộ lọc',
          onClick: () => {
            // Will be handled by the component
          }
        }
      };
    }

    if (errorMessage.includes('search failed') || errorMessage.includes('query error')) {
      return {
        title: 'Lỗi tìm kiếm',
        message: 'Có lỗi khi tìm kiếm câu hỏi. Vui lòng thử lại với từ khóa khác.',
        type: 'error'
      };
    }

    return this.handleGenericError(error);
  }

  // Generic error handler
  static handleGenericError(error: any): ErrorMessage {
    return {
      title: 'Có lỗi xảy ra',
      message: 'Đã xảy ra lỗi không mong muốn. Vui lòng thử lại sau.',
      type: 'error',
      action: {
        label: 'Thử lại',
        onClick: () => window.location.reload()
      }
    };
  }

  // Success messages
  static createSuccessMessage(title: string, message: string, action?: ErrorMessage['action']): ErrorMessage {
    return {
      title,
      message,
      type: 'info',
      action
    };
  }
}