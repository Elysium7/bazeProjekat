var express = require('express');
var router = express.Router();
const mysql = require('mysql2');
require('dotenv').config();


const dbConnection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  port: process.env.DB_PORT,
});

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('izvjestaj', { title: 'Pregled izvještaja' });
});

router.post('/izvjestaj1', function(req, res, next) {
  const {od_datuma, do_datuma} = req.body;
  const values = [od_datuma, do_datuma];
  dbConnection.query('call pregled_usluga_iz_rezervacije_stavke(?,?)', values, (err,result) => {

    if(err)
      return res.send(err);
    //console.log(result[0]);
   res.render('izvjestaj1tabela', { title: 'Pregled izvještaja za usluge', izvjestaj: result[0] });

  })

});

router.post('/izvjestaj2', function(req, res, next) {
  const {od_datuma, do_datuma} = req.body;
  const values = [od_datuma, do_datuma];
  dbConnection.query('call zbirni_prikaz_usluga_po_tipu_sobe(?,?)', values, (err,result) => {

    if(err)
      return res.send(err);
    //console.log(result[0]);
    res.render('izvjestaj2tabela', { title: 'Zbirni pregled usluga po tipovima soba', izvjestaj: result[0] });

  })

});

router.post('/izvjestaj3', function(req, res, next) {
  const {datum} = req.body;
  const values = [datum];
  dbConnection.query('call popunjenost_alotmana_na_datum(?)', values, (err,result) => {

    if(err)
      return res.send(err);
    //console.log(result[0]);
    res.render('izvjestaj3tabela', { title: 'Popunjenost alotmana', izvjestaj: result[0] });

  })

});

router.post('/izvjestaj4', function(req, res, next) {
  const {datum_od_1, datum_do_1, datum_od_2, datum_do_2} = req.body;
  const values = [datum_od_1, datum_do_1, datum_od_2, datum_do_2];
  dbConnection.query('call izvjestaj_o_prodatim_uslugama_za_period(?,?,?,?)', values, (err,result) => {

    if(err)
      return res.send(err);
    //console.log(result[0]);
    res.render('izvjestaj4tabela', { title: 'Prodate usluge', izvjestaj: result[0] });

  })

});

router.post('/izvjestaj5', function(req, res, next) {
  const {od_datuma, do_datuma} = req.body;
  const values = [od_datuma, do_datuma];
  dbConnection.query('call kontrola_cijena(?,?)', values, (err,result) => {

    if(err)
      return res.send(err);
    //console.log(result[0]);
    res.render('izvjestaj5tabela', { title: 'Kontrola cijena', izvjestaj: result[0] });

  })

});

router.post('/izvjestaj6', function(req, res, next) {
  const {od_datuma, do_datuma, kupac_dobavljac} = req.body;
  const booleanValue = JSON.parse(kupac_dobavljac);
  const values = [od_datuma, do_datuma, booleanValue];
  console.log(req.body);
  dbConnection.query('call izvjestaj_o_prodatim_uslugama_dynamic_sql(?,?,?)', values, (err,result) => {

    if(err)
      return res.send(err);
    //console.log(result[0]);
    res.render('izvjestaj6tabela', { title: 'Prodate usluge po kupcu/dobavljacu', izvjestaj: result[0], kupacOrDobavljac: booleanValue });

  })

});

router.get('/unosAlotmana',function(req,res,next){
  res.render('unosAlotmana', {title: 'Unesite alotman'})
});

router.post('/unosAlotmana', function(req, res, next) {
  const {sifra_dobavljaca, period_od, period_do, status, napomena, sifra_sobe, broj_soba, opis} = req.body;
  const values_alotman = [sifra_dobavljaca, period_od, period_do, status,napomena];
  const values_alotman_stavke = [sifra_sobe,broj_soba,opis];

  console.log(req.body);
  dbConnection.query('insert into Alotmani(sifra_dobavljaca, period_od, period_do, status, napomena) values(?,?,?,?,?)', values_alotman, (error,result) => {
   if (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
      return;
    }
   console.log(result.insertId);
    values_alotman_stavke.push(result.insertId);
    dbConnection.query('insert into Alotman_stavke(sifra_sobe,broj_soba,opis,sifra_alotmana) values(?,?,?,?)', values_alotman_stavke ,(err,result2)=>{
      if (err) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
        return;
      }
      res.json({ message: 'Alotman uspjesno dodan' });
    });
  });

});

router.get('/unosUsluge',function(req,res,next){
  res.render('unosUsluge', {title: 'Unesite uslugu'})
});

router.post('/unosUsluge', function(req, res, next) {
  const {naziv} = req.body;
  const values = [naziv];

  console.log(req.body);
  dbConnection.query('insert into Usluga(naziv) values(?)', values, (error,result) => {
    if (error) {
      console.error(error);
      res.status(500).json({error: 'Internal Server Error'});
      return;
    }
    res.json({message: 'Usluga uspjesno unesena'});
  });
});

router.get('/pregledUsluge', function(req,res,next) {
  console.log('Prije upita');
  dbConnection.query('select * from Usluga', [], (error, result) => {
    console.log('Nakon upita');
    if (error) {
      console.error(error);
      res.status(500).json({error: 'Internal Server Error'});
      return;
    }
    console.log(result);
    res.render('pregledUsluga', {title: 'Pregled usluga', usluge: result});
  });
  console.log('Nakon callbacka za upit');
});

router.get('/brisanjeUsluge', function(req,res,next) {
  console.log('Prije upita');
  dbConnection.query('select * from Usluga', [], (error, result) => {
    console.log('Nakon upita');
    if (error) {
      console.error(error);
      res.status(500).json({error: 'Internal Server Error'});
      return;
    }
    console.log(result);
    res.render('brisanjeUsluge', {title: 'Brisanje usluge', usluge: result});
  });
  console.log('Nakon callbacka za upit');
});

router.get('/brisanjeUsluge/:id', function(req,res,next) {
  const sifra_usluge = req.params.id;
  dbConnection.query('delete from Usluga where sifra_usluge = ?', [sifra_usluge], (error, result) => {
    console.log('Nakon upita');
    if (error) {
      console.error(error);
      res.status(500).json({error: 'Internal Server Error'});
      return;
    }
    res.redirect('/brisanjeUsluge');
  });
  console.log('Nakon callbacka za upit');
});

router.get('/formaRezervacija',function(req,res,next){
  res.render('formaRezervacija', {title: 'Rezervacija'})
});

router.post('/prikazRezervacije',function(req,res,next){
  const {sifra_rezervacija} = req.body;
  const value = [sifra_rezervacija];
  dbConnection.query('select r.sifra_rezervacija, r.datum_rezervacije, r.sifra_kupca, rs.sifra_rezervacija_stavke, rs.sifra_usluge, rs.datum_od, rs.datum_do, rs.broj_komada, rs.cijena, rs.vrijednost, rs.sifra_dobavljaca, rs.sifra_sobe, rs.sifra_smjestaja, rs.sifra_alotmana from Rezervacija r join Rezervacija_stavke rs on rs.sifra_rezervacija = r.sifra_rezervacija where r.sifra_rezervacija = ?', value, (err,result)=>{
    if (err) {
      console.error(err);
      res.status(500).json({error: 'Internal Server Error'});
      return;
    }
    if (result.length === 0) {
      return res.status(404).json({ error: 'Rezervacija nije pronađena' });
    }
    res.render('prikazRezervacije', {title: 'Rezervacija', rezervacija: result});
  });
});

module.exports = router;
