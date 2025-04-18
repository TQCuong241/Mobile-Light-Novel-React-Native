require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');
const morgan = require('morgan');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(cors());
app.use(morgan('dev'));

// Cấu hình PayPal
const PAYPAL_API_URL = process.env.PAYPAL_URL || 'api.sandbox.paypal.com';
const SERVER_URL = process.env.SERVER_URL || `http://localhost:${PORT}`;

// Hàm tạo access token PayPal
async function generateAccessToken() {
  try {
    if (!process.env.PAYPAL_CLIENT_ID || !process.env.PAYPAL_CLIENT_SECRET) {
      throw new Error("Thiếu thông tin xác thực PayPal trong file .env");
    }

    const auth = {
      username: process.env.PAYPAL_CLIENT_ID,
      password: process.env.PAYPAL_CLIENT_SECRET
    };

    const response = await axios.post(
      `https://${PAYPAL_API_URL}/v1/oauth2/token`,
      'grant_type=client_credentials',
      { auth, timeout: 5000 }
    );

    return response.data.access_token;
  } catch (error) {
    console.error('Lỗi xác thực PayPal:', error.response?.data || error.message);
    throw new Error("Không thể lấy access token từ PayPal");
  }
}

// API: Tạo đơn hàng mới
app.post('/create-order', async (req, res) => {
  try {
    const { amount } = req.body;

    // Validate amount
    if (!amount || isNaN(amount) || Number(amount) <= 0) {
      return res.status(400).json({ error: "Số tiền không hợp lệ" });
    }

    if (Number(amount) < 1) {
      return res.status(400).json({ error: "Số tiền tối thiểu là 1 USD" });
    }

    const accessToken = await generateAccessToken();
    const orderData = {
      intent: 'CAPTURE',
      purchase_units: [{
        amount: {
          currency_code: 'USD',
          value: Number(amount).toFixed(2)
        },
        description: `Nạp tiền vào tài khoản`
      }],
      application_context: {
        return_url: `${SERVER_URL}/complete-order`,
        cancel_url: `${SERVER_URL}/cancel-order`,
        brand_name: process.env.BRAND_NAME || 'My App',
        user_action: 'PAY_NOW',
        shipping_preference: 'NO_SHIPPING'
      }
    };

    const response = await axios.post(
      `https://${PAYPAL_API_URL}/v2/checkout/orders`,
      orderData,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
          'PayPal-Request-Id': `order-${Date.now()}`
        },
        timeout: 10000
      }
    );

    const approveLink = response.data.links.find(link => link.rel === 'approve');
    if (!approveLink) {
      throw new Error("Không tìm thấy link thanh toán");
    }

    res.json({
      orderID: response.data.id,
      approveLink: approveLink.href
    });

  } catch (error) {
    console.error('Lỗi tạo đơn hàng:', error.response?.data || error.message);
    res.status(500).json({ 
      error: error.response?.data?.message || error.message || 'Lỗi khi tạo đơn hàng' 
    });
  }
});

// API: Xác nhận thanh toán
app.post('/capture-order', async (req, res) => {
    try {
      const { orderID } = req.body;
      if (!orderID) {
        return res.status(400).json({ error: "Thiếu orderID" });
      }
  
      const accessToken = await generateAccessToken();
      const response = await axios.post(
        `https://${PAYPAL_API_URL}/v2/checkout/orders/${orderID}/capture`,
        {},
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
          },
          timeout: 10000
        }
      );
  
      // Kiểm tra response structure từ PayPal
      if (!response.data || 
          !response.data.purchase_units || 
          !response.data.purchase_units[0] || 
          !response.data.purchase_units[0].payments || 
          !response.data.purchase_units[0].payments.captures || 
          !response.data.purchase_units[0].payments.captures[0]) {
        throw new Error("Cấu trúc response từ PayPal không hợp lệ");
      }
  
      const capture = response.data.purchase_units[0].payments.captures[0];
      const paymentData = {
        orderId: orderID,
        transactionId: capture.id,
        amount: capture.amount.value,
        currency: capture.amount.currency_code,
        status: capture.status,
        createTime: capture.create_time,
        updateTime: capture.update_time
      };
  
      console.log('Thanh toán thành công:', paymentData);
  
      res.json({
        status: 'success',
        data: paymentData
      });
  
    } catch (error) {
      console.error('Lỗi xác nhận thanh toán:', {
        message: error.message,
        responseData: error.response?.data,
        stack: error.stack
      });
      
      res.status(500).json({
        error: error.response?.data?.message || error.message || 'Lỗi khi xác nhận thanh toán'
      });
    }
  });

// Xử lý callback từ PayPal sau thanh toán
app.get('/complete-order', async (req, res) => {
    try {
      const { token } = req.query;
      if (!token) {
        return res.status(400).send('Thiếu token thanh toán');
      }
  
      // 1. Lấy thông tin order trước
      const accessToken = await generateAccessToken();
      const orderDetails = await axios.get(
        `https://${PAYPAL_API_URL}/v2/checkout/orders/${token}`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        }
      );
  
      // 2. Xác nhận thanh toán
      const captureResponse = await axios.post(
        `https://${PAYPAL_API_URL}/v2/checkout/orders/${token}/capture`,
        {},
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
          }
        }
      );
  
      // 3. Kiểm tra kết quả
      const capture = captureResponse.data.purchase_units[0].payments.captures[0];
      if (capture.status !== 'COMPLETED') {
        throw new Error(`Trạng thái thanh toán: ${capture.status}`);
      }
  
      // 4. Redirect với thông tin chi tiết
      const successUrl = new URL(`${SERVER_URL}/success`);
      successUrl.searchParams.append('orderId', token);
      successUrl.searchParams.append('transactionId', capture.id);
      successUrl.searchParams.append('amount', capture.amount.value);
      successUrl.searchParams.append('currency', capture.amount.currency_code);
      
      return res.redirect(successUrl.toString());
  
    } catch (error) {
      console.error('Lỗi xử lý thanh toán:', {
        message: error.message,
        responseData: error.response?.data,
        stack: error.stack
      });
      
      return res.redirect('/cancel-order');
    }
  });
// Trang hủy thanh toán
app.get('/cancel-order', (req, res) => {
  res.send(`
    <div><p>thanh toán thất bại</p></div>
  `);
});

app.get('/success', (req, res) => {
    const { orderId, transactionId, amount, currency } = req.query;
    
    res.send(`
      <div><p>thanh toán thành công</p></div>
    `);
  });

// Xử lý lỗi 404
app.use((req, res) => {
  res.status(404).json({ error: "Không tìm thấy tài nguyên" });
});

// Xử lý lỗi toàn cục
app.use((err, req, res, next) => {
  console.error('Lỗi hệ thống:', err);
  res.status(500).json({ error: "Đã xảy ra lỗi hệ thống" });
});

// Khởi động server
app.listen(PORT, () => {
  console.log(`🟢 Server đang chạy tại ${SERVER_URL}`);
  console.log(`🔵 PayPal API: ${PAYPAL_API_URL}`);
  console.log(`🟡 Chế độ: ${process.env.NODE_ENV || 'development'}`);
});