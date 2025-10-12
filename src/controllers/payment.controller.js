// controllers/payment.controller.js
const crypto = require('crypto');
const { Order } = require('../models');
const vnpayConfig = require('../config/vnpay.config');
const moment = require('moment');

const sortObjectKeys = (obj) => {
  return Object.keys(obj).sort().reduce((sorted, key) => {
    sorted[key] = obj[key];
    return sorted;
  }, {});
};

const paymentController = {
  vnpayReturn: async (req, res) => {
    try {
      const vnp_Params = req.query;
      const secureHash = vnp_Params['vnp_SecureHash'];

      // 1️⃣ Loại bỏ hash khỏi tham số
      delete vnp_Params['vnp_SecureHash'];
      delete vnp_Params['vnp_SecureHashType'];

      // 2️⃣ Sắp xếp key
      const sortedParams = sortObjectKeys(vnp_Params);
      const signData = new URLSearchParams(sortedParams).toString();

      // 3️⃣ Tính lại checksum
      const secretKey = vnpayConfig.vnp_HashSecret;
      const hmac = crypto.createHmac('sha512', secretKey);
      const calculatedChecksum = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');

      // 🧩 Thêm debug log tại đây:
      console.log('==================== VNPAY RETURN DEBUG ====================');
      console.log('👉 Received Params:', vnp_Params);
      console.log('👉 signData (for verification):', signData);
      console.log('👉 Received Hash:', secureHash);
      console.log('👉 Calculated Hash:', calculatedChecksum);
      console.log('👉 Match?:', secureHash === calculatedChecksum);
      console.log('============================================================');
      // 4️⃣ So sánh chữ ký
      if (secureHash !== calculatedChecksum) {
        console.error('⚠️ Sai chữ ký!');
        return res.redirect(`${process.env.CLIENT_URL}/payment-error?code=97&message=Invalid signature`);
      }

      const orderId = vnp_Params['vnp_TxnRef'];
      const responseCode = vnp_Params['vnp_ResponseCode'];
      const transactionStatus = vnp_Params['vnp_TransactionStatus'];

      console.log(`Order ${orderId}: code=${responseCode}, status=${transactionStatus}`);

      // 5️⃣ Xác định kết quả thanh toán
      if (responseCode === '00' && transactionStatus === '00') {
        // ✅ Thành công
        const order = await Order.findByPk(orderId);
        if (!order) {
          console.error('Không tìm thấy đơn hàng!');
          return res.redirect(`${process.env.CLIENT_URL}/payment-error?code=01&message=Order not found`);
        }

        // Nếu chưa hoàn tất mới cập nhật
        if (order.orderstatus !== '2') {
          order.orderstatus = '2'; 
          await order.save();
          console.log(`✅ Order ${orderId} updated to status=2`);
        }

        // Redirect về trang success
        return res.redirect(`${process.env.CLIENT_URL}/payment-success?orderId=${orderId}&vnp_code=00`);
      } else {
        // ❌ Thất bại
        const order = await Order.findByPk(orderId);
        if (order) {
          order.orderstatus = '3'; // 3 = Failed
          await order.save();
        }
        return res.redirect(`${process.env.CLIENT_URL}/payment-failed?orderId=${orderId}&vnp_code=${responseCode}`);
      }
    } catch (err) {
      console.error('VNPAY Return Error:', err);
      res.redirect(`${process.env.CLIENT_URL}/payment-error?code=99&message=${encodeURIComponent(err.message)}`);
    }
  },

    createPaymentUrl: async (req, res) => {
    try {
      const { orderId, amount, bankCode, orderDescription } = req.body;
      if (!orderId || !amount) {
        return res.status(400).json({ message: 'Missing orderId or amount' });
      }

      const date = new Date();
      const createDate = moment(date).format('YYYYMMDDHHmmss');
      let ipAddr = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';

      const tmnCode = vnpayConfig.vnp_TmnCode;
      const secretKey = vnpayConfig.vnp_HashSecret;
      const returnUrl = vnpayConfig.vnp_ReturnUrl;
      const vnpUrl = vnpayConfig.vnp_Url;

      let vnp_Params = {
        vnp_Version: '2.1.0',
        vnp_Command: 'pay',
        vnp_TmnCode: tmnCode,
        vnp_Locale: 'vn',
        vnp_CurrCode: 'VND',
        vnp_TxnRef: orderId.toString(),
        vnp_OrderInfo: orderDescription || `Thanh toan don hang ${orderId}`,
        vnp_OrderType: 'billpayment',
        vnp_Amount: Math.round(amount) * 100,
        vnp_ReturnUrl: returnUrl,
        vnp_IpAddr: ipAddr,
        vnp_CreateDate: createDate,
      };

      if (bankCode) vnp_Params['vnp_BankCode'] = bankCode;

      const sorted = sortObjectKeys(vnp_Params);
      const signData = new URLSearchParams(sorted).toString();

      const hmac = crypto.createHmac('sha512', secretKey);
      const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');
      sorted['vnp_SecureHash'] = signed;
   // 🧩 Thêm debug log ở đây:
      console.log('==================== VNPAY DEBUG ====================');
      console.log('👉 Raw Params:', vnp_Params);
      console.log('👉 Sorted Params:', sorted);
      console.log('👉 signData:', signData);
      console.log('👉 Generated Hash:', signed);
      console.log('=====================================================');
      const finalUrl = `${vnpUrl}?${new URLSearchParams(sorted).toString()}`;

      res.json({
        code: '00',
        message: 'Success',
        data: finalUrl,
         debug_signData: signData,  // 👈 thêm dòng này
  debug_hash: signed   
      });
    } catch (err) {
      console.error('Create Payment Error:', err);
      res.status(500).json({ message: 'Internal error', error: err.message });
    }
  },

};

module.exports = paymentController;
