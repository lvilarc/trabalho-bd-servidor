const express = require('express');
const mysql = require('mysql');
const cors = require('cors');

const app = express();
const port = 3030; // ou qualquer outra porta de sua escolha

app.use(cors());

// Configuração da conexão com o banco de dados
const connection = mysql.createConnection({
  host: 'localhost', // ou o endereço do seu banco de dados
  port: 3306,
  user: 'root',
  password: '1234',
  database: 'senado'
});

connection.connect(function(err) {
  if (err) throw err;
  console.log("Connected!");
});


app.get('/consulta1', (req, res) => {
  const sql = 'SELECT s.nome_completo AS senador, count(DISTINCT map.codigo_partido) AS partidos_senador FROM	senadores AS s INNER JOIN senador_partido_map AS map ON s.codigo = map.codigo_senador GROUP BY s.codigo ORDER BY partidos_senador DESC LIMIT 3;'; 
// const sql = 'select * from senadores;'
  connection.query(sql, (error, results) => {
    if (error) {
      res.status(500).send(error);
    } else {
      res.json(results);
    }
  });
});

app.get('/consulta2', (req, res) => {
  const sql = "SELECT b.nome AS bancada, SUM(s.materia_count) AS relatorias FROM (SELECT s.codigo AS senador, count(DISTINCT r.codigo_materia) AS materia_count FROM senadores AS s INNER JOIN relatorias AS r ON s.codigo = r.codigo_senador INNER JOIN materias AS m ON m.codigo = r.codigo_materia GROUP BY s.codigo) AS s INNER JOIN (SELECT bpm.codigo_bancada AS bancada, spm.codigo_senador AS senador FROM bancada_partido_map AS bpm INNER JOIN senador_partido_map AS spm ON bpm.codigo_partido = spm.codigo_partido) AS map ON s.senador = map.senador INNER JOIN (SELECT b.codigo AS bancada, b.nome AS nome, count(DISTINCT spm.codigo_senador) AS senador_count FROM bancadas_parlamentares AS b INNER JOIN bancada_partido_map AS bpm ON b.codigo = bpm.codigo_bancada INNER JOIN senador_partido_map AS spm ON bpm.codigo_partido = spm.codigo_partido GROUP BY b.codigo ORDER BY senador_count DESC LIMIT 2) AS b ON map.bancada = b.bancada GROUP BY b.bancada ORDER BY relatorias DESC;";


  connection.query(sql, (error, results) => {
    if (error) {
      res.status(500).send('Erro ao executar consulta.');
    } else {
      res.json(results);
    }
  });
});

app.get('/consulta3', (req, res) => {
  const sql = "SELECT p.nome AS partido, count(DISTINCT a.codigo_materia) AS materias FROM partidos AS p INNER JOIN senador_partido_map AS map ON p.codigo = map.codigo_partido INNER JOIN autorias AS a ON a.codigo_senador = map.codigo_senador GROUP BY p.codigo ORDER BY materias DESC LIMIT 3;";


  connection.query(sql, (error, results) => {
    if (error) {
      res.status(500).send('Erro ao executar consulta.');
    } else {
      res.json(results);
    }
  });
});

app.get('/consulta4', (req, res) => {
  const sql = "SELECT b.bancada AS bancada, SUM(s.discursos) AS discursos FROM (SELECT b.nome AS bancada, b.codigo AS codigo, spm.codigo_senador AS senador FROM bancadas_parlamentares AS b INNER JOIN bancada_partido_map AS bpm ON b.codigo = bpm.codigo_bancada INNER JOIN senador_partido_map AS spm ON bpm.codigo_partido = spm.codigo_partido) AS b INNER JOIN (SELECT s.codigo AS senador, count(DISTINCT d.codigo) AS discursos FROM senadores AS s INNER JOIN discursos AS d ON d.codigo_senador = s.codigo GROUP BY s.codigo ORDER BY discursos DESC) AS s ON b.senador = s.senador GROUP BY bancada ORDER BY discursos DESC;";


  connection.query(sql, (error, results) => {
    if (error) {
      res.status(500).send('Erro ao executar consulta.');
    } else {
      res.json(results);
    }
  });
});

app.get('/consulta5', (req, res) => {
  const sql = "SELECT s.nome_completo AS senador, count(r.codigo_materia) as relatorias FROM senadores AS s LEFT JOIN relatorias AS r ON s.codigo = r.codigo_senador GROUP BY s.codigo ORDER BY relatorias DESC, senador ASC;";


  connection.query(sql, (error, results) => {
    if (error) {
      res.status(500).send('Erro ao executar consulta.');
    } else {
      res.json(results);
    }
  });
});

// Iniciar o servidor
app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});
