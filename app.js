const express = require('express');
const bodyParser = require('body-parser');
const Nexmo = require('nexmo');
const path = require('path');
const hbs = require('hbs');

const app = express();

// View engine ayarları
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));
app.engine('hbs', hbs({
  extname: 'hbs',
  defaultLayout: 'layout',
  layoutsDir: path.join(__dirname, 'views/layouts'),
  partialsDir: path.join(__dirname, 'views/partials')
}));

// Statik dosyalar
app.use(express.static(path.join(__dirname, 'static')));

// Body parser
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Nexmo (Vonage) başlatma – kendi anahtarlarını koy
const nexmo = new Nexmo({
  apiKey: 'YOUR_API_KEY_HERE',
  apiSecret: 'YOUR_API_SECRET_HERE'
}, { debug: true });

// Ana sayfa
app.get('/', (req, res) => {
  res.render('index');
});

// SMS gönderme endpoint
app.post('/send-sms', (req, res) => {
  const number = req.body.number;
  const text = req.body.msg;

  nexmo.message.sendSms(
    'VonageAPI',          // Gönderici adı (Vonage panelde onaylanmışsa kendi numaranı da kullanabilirsin)
    number,               // 905xxxxxxxxx formatında uluslararası kodla
    text,
    { type: 'unicode' },  // Türkçe karakter desteği
    (err, responseData) => {
      if (err) {
        console.error(err);
        res.render('index', { 
          error: 'SMS gönderilemedi → ' + err.message 
        });
      } else {
        console.log(responseData);
        res.render('index', { 
          success: 'SMS başarıyla gönderildi!',
          messageId: responseData.messages[0]['message-id']
        });
      }
    }
  );
});

// Sunucu başlat
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server http://localhost:${PORT} üzerinde çalışıyor`);
});
