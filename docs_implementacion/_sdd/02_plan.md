# SOFTWARE DEVELOPMENT DOCUMENT (SDD)
# 02_PLAN.md

---

# 1. Objetivo del Plan

Plan del HITO-001 (línea base + vertical 1: usuarios/autenticación). Define alcance, estrategia,
fases y riesgos antes de tocar código (Ley 1 — análisis previo obligatorio).

---

# 2. Alcance del Desarrollo

## 2.1 Alcance Incluido

- Línea base técnica: scaffold backend Quarkus, PostgreSQL en Docker, autenticación JWT local.
- Vertical 1: CRUD de usuarios (3 perfiles, soft delete) + login por `usuario` + cambio de
  contraseña obligatorio (DNI máx 8) + homes mobile por perfil (ADR-A002).

## 2.2 Alcance Excluido

- Web (React/Vite), CI/CD GitHub Actions, programación de stock, requerimientos reales,
  evidencias fotográficas, actas PDF, SMTP, Nginx/HTTPS, refresh token/revocación, rate limiting.



---

# 3. Estrategia de Implementación

Vertical incremental: BD (Flyway V1/V2) → backend (auth JWT + CRUD + tests) → mobile
(navegación + cambio password + homes). Verificación por capa (Ley 5); auditoría integral
(gate review) antes de cerrar el HITO; commit único coherente.

---

# 4. Arquitectura General

```text
mobile (RN CLI) ──► backend API Quarkus (:6101) ──► PostgreSQL 16 (Docker)
       JWT local                          Flyway V1/V2
```



---

# 5. Stack Tecnológico

| Capa | Tecnología |
|---|---|
| Backend | Quarkus Java |
| Frontend Android | React Native |
| Frontend Web | React + MUI |
| Base de Datos | PostgreSQL |
| Autenticación | JWT + tabla de usuarios local |
| Seguridad | JWT |
| APIs | REST |
| Reverse Proxy | Nginx |
| Contenedorización | Docker |
| Orquestación Contenedores | Docker Compose |
| Control Versiones | GitHub |
| Gestión Proyecto | GitHub |
| CI/CD | GitHub Actions |
| Generación PDF | iText PDF |
| Almacenamiento Fotografías | Filesystem + rutas en base de datos |
| Infraestructura Cloud | VPS Linux (Hetzner / DigitalOcean) |

---

# 6. Estructura de Módulos

| Código | Módulo |
|---|---|
| MOD-01 | Autenticación (JWT local, login por usuario, cambio de contraseña obligatorio) |
| MOD-02 | Usuarios (CRUD, 3 perfiles, soft delete) |

---

# 7. Fases del Proyecto

| Fase | Objetivo |
|---|---|
| F1 — Línea base + Vertical 1 (HITO-001) | Scaffold backend + BD Docker + auth + CRUD usuarios + homes mobile (CERRADO 2026-08-18) |
| F2 — Web + CI/CD | Scaffold web React/Vite + GitHub Actions (pendiente) |
| F3 — Módulos funcionales | Requerimientos, programación, evidencias (pendiente, a coordinar) |

---

# 8. Roadmap General



---

# 9. Ambientes del Sistema

| Ambiente | Objetivo |
|---|---|

---

# 10. Estrategia de Seguridad



---

# 11. Estrategia de Auditoría



---

# 12. Estrategia de Fotografías y Archivos



---

# 13. Estrategia de Reportes PDF



---

# 14. Estrategia KPI y Dashboard



---

# 15. Estrategia QA y Testing



---

# 16. Estrategia DevOps y Despliegue



---

# 17. Escalabilidad Futura



---

# 18. Riesgos del Proyecto

| Riesgo | Impacto |
|---|---|

---

# 19. Dependencias del Proyecto



---

# 20. Consideraciones Finales
