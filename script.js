const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer'); 
const app = express();
const PORT = 3000;

// السماح بالاتصال من أي مصدر (مهم جداً عشان الجوال يشبك بالسيرفر)
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST'],
    credentials: true
}));

app.use(express.json({ limit: '1500mb' })); 
app.use(express.urlencoded({ limit: '1500mb', extended: true }));
app.use(express.static(__dirname)); 

let videos = [];
let activeAuthCodes = {}; 

// إعدادات إرسال الجيميل
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'YOUR_OFFICIAL_EMAIL@gmail.com', // 👈 ضع إيميلك هنا
        pass: 'YOUR_APP_PASSWORD'              // 👈 ضع كلمة مرور التطبيقات هنا
    }
});

// استقبال طلب إرسال الكود
app.post('/api/auth/send-code', async (req, res) => {
    const { email } = req.body;
    const generatedCode = Math.floor(100000 + Math.random() * 900000).toString();
    activeAuthCodes[email] = generatedCode;

    try {
        await transporter.sendMail({
            from: '"🤖 بوت المنصة المطور"',
            to: email,
            subject: 'كود التحقق الخاص بك',
            text: `الكود هو: ${generatedCode}`
        });
        res.json({ success: true, message: "تم إرسال الكود لبريدك!" });
    } catch (error) {
        // في حال فشل الإرسال (لأنك لم تضع إيميل حقيقي) نرسله للمحاكاة لتجربة أختك
        res.json({ success: true, code: generatedCode, note: "محاكاة احتياطية" });
    }
});

// التحقق من الكود
app.post('/api/auth/verify-code', (req, res) => {
    const { email, code } = req.body;
    if (activeAuthCodes[email] === code) {
        delete activeAuthCodes[email];
        res.json({ success: true });
    } else {
        res.json({ success: false });
    }
});

// منطق الفيديوهات
app.get('/api/videos', (req, res) => res.json(videos));
app.post('/api/videos', (req, res) => {
    videos.push({ ...req.body, id: Date.now() });
    res.status(201).json({ success: true });
});

app.listen(PORT, () => {
    console.log(`🚀 السيرفر يعمل الآن على المنفذ ${PORT} وجاهز لاستقبال طلبات أختك!`);
});