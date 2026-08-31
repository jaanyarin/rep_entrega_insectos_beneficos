/**
 * db/seed/catalogos.ts — Datos semilla para catálogos (offline-first).
 *
 * Pobla las tablas de catálogos con los mismos datos que el backend
 * (Flyway V4/V7/V9) para que la app funcione sin conexión desde el
 * primer lanzamiento.
 *
 * Solo se ejecuta si las tablas están vacías (primer arranque o DB limpia).
 * Cuando hay conexión, `syncAllCatalogos()` sobreescribe estos datos con
 * los del servidor (cache-first).
 */

import type {open} from '@op-engineering/op-sqlite';

type DBInstance = ReturnType<typeof open>;

const SEED_MARKER = '0002_seed_catalogos';

export async function seedCatalogosIfEmpty(db: DBInstance): Promise<void> {
  // Verificar si el seed ya se ejecutó
  const result = await db.execute(
    `SELECT COUNT(*) as count FROM drizzle_migrations WHERE hash = ?`,
    [SEED_MARKER],
  );
  const count =
    result.rows.length > 0 ? (result.rows[0] as {count: number}).count : 0;
  if (count > 0) {
    return;
  }

  // Verificar si las tablas ya tienen datos (p. ej. sync previo)
  const fundosCheck = await db.execute(
    `SELECT COUNT(*) as count FROM fundos`,
  );
  const fundosCount =
    fundosCheck.rows.length > 0
      ? (fundosCheck.rows[0] as {count: number}).count
      : 0;
  if (fundosCount > 0) {
    // Ya hay datos → marcar seed como ejecutado y salir
    await db.execute(
      `INSERT INTO drizzle_migrations (hash, created_at) VALUES (?, ?)`,
      [SEED_MARKER, Date.now()],
    );
    return;
  }

  const now = Date.now();

  // ─── ESPECIES (V4) ───────────────────────────────────────────────────────
  await db.execute(
    `INSERT INTO especies (id, nombre, fetched_at) VALUES (1, 'Chrysopa sp.', ?), (2, 'Cryptolaemus', ?)`,
    [now, now],
  );

  // ─── FUNDOS (V7) ─────────────────────────────────────────────────────────
  await db.execute(
    `INSERT INTO fundos (id, nombre, estado, fetched_at) VALUES
      (1, 'Challapampa', 'ACTIVO', ?),
      (2, 'El Arenal', 'ACTIVO', ?),
      (3, 'La Esperanza', 'ACTIVO', ?),
      (4, 'Las Casuarinas', 'ACTIVO', ?),
      (5, 'Los Laureles', 'ACTIVO', ?),
      (6, 'Milagritos', 'ACTIVO', ?)`,
    [now, now, now, now, now, now],
  );

  // ─── LOTES (V7) ──────────────────────────────────────────────────────────
  // fundo_id resuelto por nombre: Challapampa=1, El Arenal=2, La Esperanza=3,
  // Las Casuarinas=4, Los Laureles=5, Milagritos=6
  // variedad_id: Sweet Globe=1, Sweet Celebration=2, Jack Salute=3,
  // Autumn Crisp=4, Ivory=5, Sugra 53=6, Sugra 57=7, Sugra 60=8,
  // Allison=9, Adora=10, Sweet Favors=11
  await db.execute(
    `INSERT INTO lotes (id, nombre, fundo_id, variedad_id, color, area, fetched_at) VALUES
      (1,'CH01',1,1,'Verde',9.2,?),(2,'CH02',1,1,'Verde',10.1,?),
      (3,'CH03',1,2,'Roja',9.9,?),(4,'CH04',1,2,'Roja',9.6,?),
      (5,'CH05',1,1,'Verde',8.5,?),(6,'CH06',1,1,'Verde',9.8,?),
      (7,'CH07',1,2,'Roja',9.7,?),(8,'CH08',1,2,'Roja',9.6,?),
      (9,'CH09',1,1,'Verde',9.7,?),(10,'CH10',1,2,'Roja',9.6,?),
      (11,'CH11',1,2,'Roja',9.2,?),(12,'CH12',1,1,'Verde',10.8,?),
      (13,'CH13',1,1,'Verde',10.3,?),(14,'CH14',1,2,'Roja',10.4,?),
      (15,'CH15',1,2,'Roja',10.9,?),(16,'CH16',1,1,'Verde',7.8,?),
      (17,'CH17',1,1,'Verde',7.4,?),(18,'CH18',1,2,'Roja',7.3,?),
      (19,'CH19',1,2,'Roja',7.5,?),(20,'CH20',1,3,'Roja',10.4,?),
      (21,'CH21',1,3,'Roja',10.9,?),(22,'CH22',1,2,'Roja',9.1,?),
      (23,'CH23',1,2,'Roja',8.9,?),(24,'CH24',1,2,'Roja',9.5,?),
      (25,'CH25',1,2,'Roja',9.7,?),(26,'CH26',1,2,'Roja',9.2,?),
      (27,'CH27',1,2,'Roja',9.1,?),(28,'CH28',1,2,'Roja',9.4,?),
      (29,'CH29',1,2,'Roja',8.7,?),(30,'CH30',1,2,'Roja',5.2,?),
      (31,'CH31',1,2,'Roja',10.29,?),
      (32,'EA01',2,5,'Verde',6.83,?),(33,'EA02',2,5,'Verde',6.54,?),
      (34,'EA03',2,5,'Verde',6.71,?),(35,'EA04',2,5,'Verde',8.08,?),
      (36,'EA05',2,5,'Verde',7.92,?),(37,'EA06',2,5,'Verde',8.07,?),
      (38,'EA07',2,4,'Verde',8.08,?),(39,'EA08',2,4,'Verde',7.92,?),
      (40,'EA09',2,4,'Verde',6.27,?),(41,'EA10',2,4,'Verde',7.56,?),
      (42,'EA11',2,4,'Verde',7.69,?),(43,'EA12',2,4,'Verde',8.18,?),
      (44,'LE05',3,5,'Verde',10.78,?),(45,'LE06',3,5,'Verde',10.78,?),
      (46,'LE07',3,5,'Verde',9.98,?),(47,'LE08',3,5,'Verde',9.98,?),
      (48,'LE09',3,4,'Verde',9.98,?),(49,'LE10',3,4,'Verde',9.98,?),
      (50,'LE11',3,4,'Verde',9.98,?),(51,'LE12',3,4,'Verde',9.98,?),
      (52,'LE13',3,4,'Verde',9.98,?),(53,'LE14',3,4,'Verde',9.98,?),
      (54,'LE15',3,4,'Verde',9.98,?),(55,'LE16',3,4,'Verde',9.98,?),
      (56,'LE17',3,4,'Verde',9.98,?),(57,'LE18',3,4,'Verde',9.98,?),
      (58,'LE19',3,4,'Verde',9.98,?),(59,'LE24',3,4,'Verde',9.98,?),
      (60,'LE25',3,4,'Verde',9.98,?),(61,'LE26',3,4,'Verde',9.98,?),
      (62,'LE27',3,4,'Verde',9.98,?),(63,'LE28',3,4,'Verde',9.98,?),
      (64,'LE29',3,4,'Verde',9.98,?),(65,'LE30',3,4,'Verde',10.14,?),
      (66,'LE31',3,6,'Verde',null,?),(67,'LE32',3,6,'Verde',8.42,?),
      (68,'LE33',3,6,'Verde',10.57,?),(69,'LE34',3,6,'Verde',9.98,?),
      (70,'LE35',3,6,'Verde',9.98,?),(71,'LE36',3,6,'Verde',9.9,?),
      (72,'LE37',3,6,'Verde',10.11,?),(73,'LE38',3,7,'Negra',9.98,?),
      (74,'LE39',3,6,'Verde',10.59,?),(75,'LE40',3,6,'Verde',10.59,?),
      (76,'LE01',3,4,'Verde',null,?),(77,'LE02',3,4,'Verde',null,?),
      (78,'LE03',3,4,'Verde',null,?),(79,'LE04',3,4,'Verde',null,?),
      (80,'LE20',3,4,'Verde',null,?),(81,'LE22',3,8,'Verde',null,?),
      (82,'LE41',3,7,'Negra',null,?),(83,'LE42',3,7,'Negra',null,?),
      (84,'LC01',4,3,'Roja',9.26,?),(85,'LC02',4,4,'Verde',10.03,?),
      (86,'LC03',4,4,'Verde',10.03,?),(87,'LC04',4,4,'Verde',10.06,?),
      (88,'LC05',4,4,'Verde',9.97,?),(89,'LC06',4,4,'Verde',9.92,?),
      (90,'LC07',4,4,'Verde',10.01,?),(91,'LC08',4,3,'Roja',8.43,?),
      (92,'LC09',4,3,'Roja',10.04,?),(93,'LC10',4,4,'Verde',9.99,?),
      (94,'LC11',4,4,'Verde',9.54,?),(95,'LC12',4,4,'Verde',8.98,?),
      (96,'LC13',4,4,'Verde',9.76,?),(97,'LC14',4,4,'Verde',10.01,?),
      (98,'LC15',4,9,'Roja',8.37,?),(99,'LC16',4,9,'Roja',11.15,?),
      (100,'LC17',4,10,'Roja',11.11,?),(101,'LC18',4,4,'Verde',11.09,?),
      (102,'LC19',4,4,'Verde',8.52,?),(103,'LC20',4,4,'Verde',10.95,?),
      (104,'LC21',4,1,'Verde',11.0,?),(105,'LC22',4,9,'Roja',6.21,?),
      (106,'LC23',4,9,'Roja',11.0,?),(107,'LC24',4,10,'Roja',11.04,?),
      (108,'LC25',4,11,'Negra',11.06,?),(109,'LC26',4,11,'Negra',10.91,?),
      (110,'LC27',4,4,'Verde',10.94,?),(111,'LC28',4,1,'Verde',11.01,?),
      (112,'LL01',5,5,'Verde',10.43,?),(113,'LL02',5,5,'Verde',10.22,?),
      (114,'LL03',5,5,'Verde',10.39,?),(115,'LL04',5,5,'Verde',10.56,?),
      (116,'LL05',5,5,'Verde',10.42,?),(117,'LL06',5,5,'Verde',10.05,?),
      (118,'LL07',5,5,'Verde',10.05,?),(119,'LL08',5,11,'Negra',10.05,?),
      (120,'LL09',5,11,'Negra',10.05,?),(121,'LL10',5,1,'Verde',9.97,?),
      (122,'LL11',5,1,'Verde',9.71,?),(123,'LL12',5,4,'Verde',9.71,?),
      (124,'LL13',5,4,'Verde',12.68,?),
      (125,'ML01',6,1,'Verde',9.3,?),(126,'ML02',6,1,'Verde',9.0,?),
      (127,'ML03',6,2,'Roja',8.9,?),(128,'ML04',6,2,'Roja',9.0,?),
      (129,'ML05',6,2,'Roja',9.5,?),(130,'ML06',6,2,'Roja',9.5,?),
      (131,'ML07',6,2,'Roja',9.6,?),(132,'ML08',6,2,'Roja',9.3,?),
      (133,'ML09',6,1,'Verde',11.3,?),(134,'ML10',6,1,'Verde',10.2,?),
      (135,'ML11',6,4,'Verde',12.6,?),(136,'ML12',6,1,'Verde',9.9,?),
      (137,'ML13',6,2,'Roja',5.8,?),(138,'ML14',6,5,'Verde',9.7,?),
      (139,'ML15',6,5,'Verde',9.4,?),(140,'ML16',6,1,'Verde',9.1,?),
      (141,'ML17',6,1,'Verde',8.7,?),(142,'ML18',6,4,'Verde',12.11,?),
      (143,'ML19',6,4,'Verde',10.74,?),(144,'ML20',6,4,'Verde',12.2,?),
      (145,'ML21',6,4,'Verde',12.5,?),(146,'ML22',6,5,'Verde',11.33,?),
      (147,'ML23',6,5,'Verde',10.97,?),(148,'ML24',6,5,'Verde',11.35,?),
      (149,'ML25',6,5,'Verde',9.5,?),(150,'ML26',6,5,'Verde',9.47,?),
      (151,'ML27',6,5,'Verde',9.43,?),(152,'ML28',6,5,'Verde',10.74,?),
      (153,'ML29',6,5,'Verde',11.03,?),(154,'ML30',6,5,'Verde',10.3,?),
      (155,'ML31',6,5,'Verde',10.22,?),(156,'ML32',6,5,'Verde',10.14,?),
      (157,'ML33',6,5,'Verde',9.87,?)`,
    Array(157).fill(now),
  );

  // ─── ETAPAS FENOLÓGICAS (V9) ─────────────────────────────────────────────
  await db.execute(
    `INSERT INTO etapas_fenologicas (id, nombre, fetched_at) VALUES
      (1, 'BROTACIÓN', ?),
      (2, 'FLORACIÓN Y CUAJA', ?),
      (3, 'CRECIMIENTO DE BAYAS', ?),
      (4, 'EMVERO', ?),
      (5, 'COSECHA', ?),
      (6, 'POST-COSECHA', ?),
      (7, 'FORMACIÓN', ?)`,
    [now, now, now, now, now, now, now],
  );

  // ─── PLAGAS (V9) ─────────────────────────────────────────────────────────
  await db.execute(
    `INSERT INTO plagas (id, nombre, fetched_at) VALUES
      (1, 'PSEUDOCOCCIDAE', ?),
      (2, 'TRIPS', ?),
      (3, 'ARAÑITA ROJA', ?),
      (4, 'LEPIDÓPTEROS LARVA', ?),
      (5, 'ACARO HIALINO', ?)`,
    [now, now, now, now, now],
  );

  // Registrar seed como ejecutado
  await db.execute(
    `INSERT INTO drizzle_migrations (hash, created_at) VALUES (?, ?)`,
    [SEED_MARKER, Date.now()],
  );
}
