-- Tablas de la tienda. Se puede ejecutar más de una vez sin borrar datos.

CREATE TABLE IF NOT EXISTS categorias (
  id     INTEGER PRIMARY KEY AUTOINCREMENT,
  nombre TEXT NOT NULL,
  orden  INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS productos (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  nombre          TEXT NOT NULL,
  descripcion     TEXT NOT NULL DEFAULT '',
  precio          INTEGER NOT NULL,            -- pesos colombianos, sin decimales
  precio_anterior INTEGER,                     -- opcional, para mostrar descuento
  categoria_id    INTEGER REFERENCES categorias(id) ON DELETE SET NULL,
  edad_rango      TEXT NOT NULL DEFAULT '1-3', -- '1-3', '3-5' o '5+' (para el filtro)
  edad_texto      TEXT NOT NULL DEFAULT '',    -- texto libre, ej. "3 a 6 años"
  fotos           TEXT NOT NULL DEFAULT '[]',  -- JSON: hasta 4 referencias (assets/img/x.jpg o id de KV)
  habilidades     TEXT NOT NULL DEFAULT '[]',  -- JSON: lista de textos (opcional)
  nota            TEXT NOT NULL DEFAULT '',    -- nota de la pedagoga (opcional)
  agotado         INTEGER NOT NULL DEFAULT 0,
  destacado       INTEGER NOT NULL DEFAULT 0,
  orden           INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS config (
  clave TEXT PRIMARY KEY,
  valor TEXT NOT NULL DEFAULT ''
);

-- Configuración inicial
INSERT OR IGNORE INTO config (clave, valor) VALUES
  ('nombre',    'Cerebro Feliz'),
  ('eslogan',   'Learning Center & Therapy'),
  ('logo',      'assets/img/cerebro-feliz-logo.jpg'),
  ('whatsapp',  '573194298413'),
  ('bienvenida','Asesoría psicológica y de estimulación con la Psic. Sharon Espinel'),
  ('direccion', ''),
  ('instagram', ''),
  ('facebook',  '');

-- Categorías de ejemplo
INSERT OR IGNORE INTO categorias (id, nombre, orden) VALUES
  (1, 'Sensorial & Montessori', 1),
  (2, 'Motricidad Fina', 2),
  (3, 'Lógica & Conteo', 3),
  (4, 'Educación Emocional', 4);

-- Productos de ejemplo (usan fotos de la carpeta assets/img)
INSERT OR IGNORE INTO productos
  (id, nombre, descripcion, precio, precio_anterior, categoria_id, edad_rango, edad_texto, fotos, habilidades, nota, agotado, destacado, orden)
VALUES
  (1, 'Arcoíris Waldorf y Torres Apilables',
   'Set de arcoíris de madera natural y anillos apilables con tintas no tóxicas en tonos vivos y pasteles. Estimula la creatividad espacial, el equilibrio motriz y el juego no estructurado.',
   85000, 99000, 1, '1-3', '1 a 5 años',
   '["assets/img/bloques-arcoiris.jpg"]',
   '["Equilibrio y física intuitiva","Discriminación cromática","Juego simbólico","Paciencia y ensayo-error"]',
   'El arcoíris es un juguete abierto por excelencia: los niños lo usan como puente, cuna para muñecos, túnel o torre de equilibrio según su propia imaginación.',
   0, 1, 1),
  (2, 'Tablero Sensorial "Busy Board" Explorador',
   'Panel de madera con cerrojos, engranajes, cremalleras, cordones, reloj didáctico y laberinto de cuentas. Desarrolla la pinza digital, la fuerza de agarre y la resolución de problemas de la vida práctica.',
   135000, NULL, 2, '1-3', '1 a 3 años',
   '["assets/img/busy-board-sensorial.jpg"]',
   '["Independencia y vida práctica","Coordinación ojo-mano","Atención sostenida","Curiosidad táctil"]',
   'Satisface la necesidad natural de los pequeños de manipular objetos cotidianos de manera segura, prolongando periodos de concentración autónoma.',
   0, 1, 2),
  (3, 'Tablero de Conteo, Formas y Letras',
   'Puzzle de madera encajable con abecedario tridimensional, números, formas geométricas y aros contadores. Facilita la iniciación a la lectoescritura y al concepto matemático de cantidad.',
   92000, NULL, 3, '3-5', '3 a 6 años',
   '["assets/img/puzzle-alfabeto-numeros.jpg"]',
   '["Conteo uno a uno","Reconocimiento grafema-fonema","Encaje y orientación espacial","Clasificación por forma y color"]',
   'Al tocar las letras y números en 3D, el niño no solo memoriza visualmente, sino que fija el concepto a través de la memoria muscular y sensorial.',
   0, 0, 3),
  (4, 'Juego de Expresiones y Educación Emocional',
   'Tarjetas ilustradas en madera y fichas de gestos para identificar alegría, enojo, miedo, tristeza y calma. Herramienta clave para la autorregulación infantil y el diálogo afectivo en familia.',
   78000, NULL, 4, '3-5', '3 a 8 años',
   '["assets/img/juego-emociones.jpg"]',
   '["Identificación de emociones primarias","Empatía hacia otros","Expresión verbal de sentimientos","Estrategias de calma"]',
   'Ideal para usar al final del día. Ayuda a los niños que aún no tienen suficiente vocabulario a mostrar con una ficha cómo se sintieron en su día escolar.',
   0, 0, 4),
  (5, 'Cuencos de Madera y Bolas de Clasificación',
   'Set de 6 cuencos de madera de colores arcoíris con esferas a juego, pinzas de madera ergonómicas y bandeja. Fortalece los músculos de la mano para la futura sujeción del lápiz.',
   68000, NULL, 1, '1-3', '1 a 4 años',
   '["assets/img/cuencos-clasificacion.jpg"]',
   '["Pinza con pinzas ergonómicas","Agrupación por propiedades","Secuenciación lógica","Control inhibitorio"]',
   'El uso de las pinzas de madera ejercita los músculos necesarios para que el niño tome correctamente el lápiz al entrar al colegio.',
   0, 0, 5),
  (6, 'Zorrito de Hilado y Costura Motriz',
   'Figura de animalito en madera pulida con perforaciones de precisión, cordones de algodón de colores y aguja de madera. Estimula la paciencia, el ritmo respiratorio y la destreza con ambas manos.',
   49000, NULL, 2, '3-5', '3 a 7 años',
   '["assets/img/juego-hilado-motricidad.jpg"]',
   '["Coordinación óculo-manual fina","Paciencia y perseverancia","Cruzar la línea media corporal","Precisión de trazo"]',
   'Coser e hilar genera un efecto relajante similar a un ejercicio de mindfulness infantil. Es excelente para momentos de transición antes de ir a dormir.',
   0, 0, 6);
