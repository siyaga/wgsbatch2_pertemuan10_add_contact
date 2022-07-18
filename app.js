const express = require('express')
const expressEjsLayouts = require('express-ejs-layouts')
const fs = require('fs')
const flash = require('connect-flash');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const {
  body,
  validationResult,
  check
} = require('express-validator');

// panggil contacts fungsion
const {
  loadContact,
  findDetailContact,
  cekDuplikat,
  addDataContact,
  updateDataContact,
  deleteDataContact
} = require('./utils/contacts')
const morgan = require('morgan');
const app = express()
const port = 3000


// information using ejs
app.set('view engine', 'ejs')
//mmenggunakan ejs layouts
app.use(expressEjsLayouts)
// Memberikan akses terhadap folder public
app.use(express.static('public'))
app.use(express.urlencoded({
  extended: true
}));
// menampilkan Log activity
app.use(morgan('dev'))
app.set('layout', './layout/main-layout')
// Middleware configuration
app.use((req, res, next) => {
  console.log('Time:', Date.now())
  next()
})
// configuration flash connect
app.use(cookieParser('secret'));
app.use(session({
  cookie: {
    maxAge: 6000
  },
  secret: 'secret',
  resave: true,
  saveUninitialized: true,
}));
app.use(flash());


app.get('/', (req, res) => {


  res.render('index', {
    nama: "Adi Riyanto",
    title: "WebServer EJS",
    layout: "layout/main-layout"
  })
})

app.get('/about', (req, res) => {
  // res.send('This is about Page!')
  res.render('about', {
    title: "About",
    layout: "layout/main-layout"
  })
})

app.get('/contact', (req, res) => {
  // res.send('This is contact Page!')
  const contacts = loadContact();

  res.render('contact', {
    title: "Contact",
    layout: "layout/main-layout",
    contacts,
    msg: req.flash('msg')
  })
})

app.get('/contact/add', (req, res) => {


  res.render('add-contact', {
    title: 'Form Add Contact',
    layout: "layout/main-layout",
    contact: req.body
  })
})
// membuat post atau create data dengan menggunakan validasi
app.post('/contact', [
  body('name').custom((value) => {
    const duplikat = cekDuplikat(value);
    if (duplikat) {
      throw new Error('Nama contact sudah terdaftar! ');
    }

    return true;
  }),
  check('email', 'Email tidak valid!').isEmail(),
  check('mobile', 'No HP tidak valid!').isMobilePhone('id-ID')
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {


    res.render('add-contact', {
      title: 'Form Tambah Data Contact',
      layout: 'layout/main-layout',
      errors: errors.array(),
      dataOld: req.body

    });

  } else {
    addDataContact(req.body);
    req.flash('msg', 'Data contact berhasil di Tambahkan')

    res.redirect('/contact');
  }


});
// Proses delete contact
app.get('/contact/delete/:name', (req, res) => {
  const contact = findDetailContact(req.params.name);


  //   jika contact tidak ada
  if (!contact) {
    res.status(404);
    res.send('<h1>404</h1>')
  } else {
    deleteDataContact(req.params.name);
    req.flash('msg', 'Data contact berhasil di Hapus')
    res.redirect('/contact');
  }
})

// proses mengambil data sebelumnya
app.get('/contact/edit/:name', (req, res) => {
  const contact = findDetailContact(req.params.name);

  res.render('edit-contact', {
    title: "Form Edit Contact",
    layout: "layout/main-layout",
    contact,
  });

});

// Proses melakukan update data
app.post('/contact/update', [
  body('name').custom((value, {
    req
  }) => {
    const duplikat = cekDuplikat(value);
    if (value !== req.body.oldName && duplikat) {
      throw new Error('Nama contact sudah terdaftar! ');
    }

    return true;
  }),
  check('email', 'Email tidak valid!').isEmail(),
  check('mobile', 'No HP tidak valid!').isMobilePhone('id-ID')
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {

    res.render('edit-contact', {
      title: 'Form Ubah Data Contact',
      layout: 'layout/main-layout',
      errors: errors.array(),
      contact: req.body
    });

  } else {

    updateDataContact(req.body);
    req.flash('msg', 'Data contact berhasil di ubah')
    res.redirect('/contact');
  }


});
// app.post('/contact', (req, res) => {
//     addDataContact(req.body)
//     res.send('the data is added!')
// })
// membuat Detail per contacts
app.get('/contact/:name', (req, res) => {

  const contact = findDetailContact(req.params.name)

  res.render('detail', {
    title: 'Detail',
    layout: "layout/main-layout",
    contact
  })

})



// membuat SaveData Contact atau tambah contact 


//Membuat reques
app.get('/product/:id?', (req, res) => {
  // res.send('Product Id: ' + req.params.id + '<br>'
  // + 'Category Id : ' + req.params.idCat);
  let category = req.query.category;
  res.send(`Product Id : ${req.params.id} <br> Category Id : ${category}`);
})

app.use('/', (req, res) => {
  res.status(404)
  res.send('Page Not found : 404')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})





// const http = require('http');   
// const port = 3000;
// const fs = require('fs'); 

// const findRespown = (url, res)=>{

//     fs.readFile(url,(err,data)=> {

//         if(err){
//             res.writeHead(404);
//             res.write('Error : page not found');
//         } else {
//             res.write(data);
//         }
//         res.end();
//     })

// }

// http
//     .createServer((req,res)=>{

//         //membuat fungsi validasi
//         const url = req.url;
//         console.log(url);
//         // Menambahkan validasi untuk setiap pagenya
//         if(url==='/about'){
//             // res.write('<h1>this is about page</h1>');
//             // res.end();
//             findRespown('./view/about.html',res);
//             // fs.readFile('./view/about.html',(err,data)=> {
//             //     validasiData(err,data);
//             // })
//         }else  if(url==='/contact'){
//             // res.write('<h1>this is contact page</h1>');
//             // res.end();
//             findRespown('./view/contact.html',res);
//             // fs.readFile('./view/contact.html',(err,data)=> {
//             //     validasiData(err,data);
//             // })

//         }else {
//             findRespown('./view/index.html',res);
//         // res.write('hello world');
//         // res.end();
//         }
//         // res.writeHead(200, { 
//         //     'Content-Type': 'text/html' });

//     })
//     // Memasukan Port yang akan di jalankan
//     .listen(port, ()=>{
//         console.log('Server listening on port 3000');
//     });