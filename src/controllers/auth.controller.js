const authService = require('../services/auth.service');

const register = async (req, res, next) => {
    try {
        // Kiểm tra dữ liệu đầu vào cơ bản (có thể dùng thư viện validation như express-validator)
        const requiredFields = ['name', 'email', 'address', 'username', 'password'];
        const missingFields = requiredFields.filter(field => !req.body[field]);

        if (missingFields.length > 0) {
             return res.status(400).json({
                 success: false,
                 message: `Thiếu các trường bắt buộc: ${missingFields.join(', ')}`
             });
        }

        const customerData = req.body;
        const newCustomer = await authService.registerCustomer(customerData);

        res.status(201).json({
            success: true,
            message: 'Đăng ký thành công!',
            data: newCustomer
        });
    } catch (error) {
        console.error("Register Error:", error.message);
        if (error.message.includes('đã được sử dụng')) {
            return res.status(409).json({ success: false, message: error.message }); // 409 Conflict
        }
        if (error.message.includes('Vui lòng điền đủ')) {
             return res.status(400).json({ success: false, message: error.message }); // 400 Bad Request
        }
        // Lỗi chung
        res.status(500).json({ success: false, message: 'Lỗi máy chủ nội bộ khi đăng ký.' });
        // Hoặc dùng next(error) nếu có middleware xử lý lỗi chung
        // next(error);
    }
};

const login = async (req, res, next) => {
    try {
        const { emailOrUsername, password } = req.body;
         if (!emailOrUsername || !password) {
             return res.status(400).json({
                 success: false,
                 message: 'Vui lòng nhập email/username và mật khẩu.'
             });
        }

        const loginData = { emailOrUsername, password };
        const result = await authService.loginCustomer(loginData);
        // const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
        // await delay(5000);

        res.status(200).json({
            success: true,
            message: 'Đăng nhập thành công!',
            data: result // Chứa token và customer info
        });
    } catch (error) {
         console.error("Login Error:", error.message);
        if (error.message.includes('không chính xác')) {
            return res.status(401).json({ success: false, message: error.message }); // 401 Unauthorized
        }
         if (error.message.includes('Vui lòng nhập')) {
             return res.status(400).json({ success: false, message: error.message }); // 400 Bad Request
        }
        res.status(500).json({ success: false, message: 'Lỗi máy chủ nội bộ khi đăng nhập.' });
        // next(error);
    }
};


const loginAdmin = async (req, res, next) => {
    try {
        const { username, password } = req.body;
         if (!username || !password) {
             return res.status(400).json({
                 success: false,
                 message: 'Vui lòng nhập email/username và mật khẩu.'
             });
        }

        const loginData = { 
            username, 
            password 
        };
        const result = await authService.loginAdmin(loginData);

        res.status(200).json({
            success: true,
            message: 'Đăng nhập thành công!',
            data: result // Chứa token và customer info
        });
    } catch (error) {
         console.error("Login Error:", error.message);
        if (error.message.includes('không chính xác')) {
            return res.status(401).json({ success: false, message: error.message }); // 401 Unauthorized
        }
         if (error.message.includes('Vui lòng nhập')) {
             return res.status(400).json({ success: false, message: error.message }); // 400 Bad Request
        }
        res.status(500).json({ success: false, message: 'Lỗi máy chủ nội bộ khi đăng nhập.' });
        // next(error);
    }
};

module.exports = {
    register,
    login,
    loginAdmin
};