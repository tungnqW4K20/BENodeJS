const bcrypt = require('bcryptjs');
const { generateToken, generateRefreshToken, verifyRefreshToken } = require('../utils/jwt.utils');
const db = require('../models');
const Customer = db.Customer;
const Admin = db.Admin;
const CartItem = db.CartItem;
const JWT_SECRET = process.env.JWT_SECRET;
const SALT_ROUNDS = 10;

const registerCustomer = async (customerData) => {
    const { name, email, address, username, password } = customerData;

    // --- Validation cơ bản ---
    if (!name || !email || !address || !password) {
        throw new Error('Vui lòng điền đủ thông tin bắt buộc: tên, email, địa chỉ, mật khẩu.');
    }

    // --- Kiểm tra Email hoặc Username đã tồn tại chưa ---
    const existingCustomer = await Customer.findOne({
        where: {
            [db.Sequelize.Op.or]: [{ email: email }, { username: username }]
        }
    });

    if (existingCustomer) {
        if (existingCustomer.email === email) {
            throw new Error('Email đã được sử dụng.');
        }
        if (existingCustomer.username === username) {
            throw new Error('Username đã được sử dụng.');
        }
    }

    // --- Hash mật khẩu ---
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    // --- Tạo customer mới ---
    const newCustomer = await Customer.create({
        name,
        email,
        address, // Sửa lỗi chính tả từ adress thành address
        username,
        password: hashedPassword // Lưu mật khẩu đã hash
    });

    // --- Trả về thông tin customer (loại bỏ password) ---
    // eslint-disable-next-line no-unused-vars
    const { password: _, ...customerWithoutPassword } = newCustomer.toJSON();
    return customerWithoutPassword;
};

const loginCustomer = async (loginData) => {
    const { emailOrUsername, password } = loginData;

    if (!emailOrUsername || !password) {
        throw new Error('Vui lòng nhập email/username và mật khẩu.');
    }

    const customer = await Customer.findOne({
        where: {
            [db.Sequelize.Op.or]: [
                { email: emailOrUsername },
                { username: emailOrUsername }
            ]
        }
    });

    if (!customer) {
        throw new Error('Email/username hoặc mật khẩu không chính xác.');
    }

    // So sánh mật khẩu trực tiếp (plaintext so với plaintext trong DB)
    if (password !== customer.password) {
        throw new Error('Email/username hoặc mật khẩu không chính xác.');
    }

    const payload = {
        id: customer.id,
        email: customer.email,
        username: customer.username,
        role: "customer"
    };

    const token = generateToken(payload, 'customer');
    const refreshToken = generateRefreshToken(payload, 'customer' )
    const { password: _, ...customerInfo } = customer.toJSON();
    const cartCount = await CartItem.sum('quantity', {
        where: { customer_id: customer.id }
    });

    return { token, refreshToken, customer: customerInfo,  cartCount: cartCount || 0 };
};

const loginAdmin = async (loginData) => {
    const { username, password } = loginData;

    if (!username || !password) {
        throw new Error('Vui lòng nhập email/username và mật khẩu.');
    }
    console.log("username", username)
    console.log("password", password)
    console.log("db", db)
    console.log("Admin", Admin)

    const admin = await Admin.findOne({
        where: {
            [db.Sequelize.Op.or]: [ { username: username }]
        }
    });
    console.log("admin", admin)
    if (!admin) {
        throw new Error('Không tìm thấy admin');
    }

    const isPasswordMatch = password === admin.password;

    if (!isPasswordMatch) {
        throw new Error('Email/username hoặc mật khẩu không chính xác.');
    }

    const payload = {
        id: admin.id,
        username: admin.username,
        role: "admin"
    };

    const token = generateToken(payload, 'admin');
    const refreshToken = generateRefreshToken(payload, 'admin' )

    const { password: _, ...adminInfo } = admin.toJSON();
    return { token, refreshToken, admin: adminInfo };
};

const newRefreshToken = async () => {
    try {
        const decoded = verifyRefreshToken(token);
        const {iat, exp, ...payload} = decoded
        
        const newAccessToken = generateToken(payload, payload.role)
        const newRefreshToken = generateRefreshToken(payload, payload.role)

        return {
            accessToken : newAccessToken,
            refreshToken: newRefreshToken,
            user: payload
        }
    } catch (error) {
        
    }
}

const generateNewTokens = async (refreshToken) => {
  try {
    const decoded = verifyRefreshToken(refreshToken)
    const { iat, exp, ...payload } = decoded

    const newAccessToken = generateToken(payload, payload.role)
    const newRefreshToken = generateRefreshToken(payload, payload.role)

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
      user: payload
    }
  } catch (error) {
    throw error
  }
}
module.exports = {
    registerCustomer,
    loginCustomer,
    loginAdmin,
    newRefreshToken,
    generateNewTokens
};