# Future Development Guidelines (MVP to Production)

This document serves as the "Post-MVP" compass for IntervYou.AI. It outlines how to transition from the current experimental features to a robust, scalable enterprise platform.

## 1. Feature Expansion Strategy

### A. Modular AI Capabilities
*   **Proctoring (P2)**: When adding video proctoring, do not pipe raw video through the AI Engine. Use client-side edge inference or periodic snapshots stored in S3/Cloudinary for asynchronous analysis.
*   **Resume Editing (P2)**: Instead of just parsing, integrate a LaTeX-based PDF generator. The AI should suggest improvements via a "Draft" system before committing to the final PDF.

### B. Enterprise Integrations
*   **University ERP Sync**: Future versions should support LTI (Learning Tools Interoperability) or direct LDAP/SAML integrations for student data sync, replacing the current bulk-import CSV method.

## 2. Architectural Evolution

### A. API Gateway Sophistication
*   **Rate Limiting**: Transition from simple Redis-based limits to a more granular, token-bucket strategy (Spring Cloud Gateway + Redis) based on institutional quotas.
*   **Schema Registry**: As Kafka events grow in complexity, implement a Schema Registry (Confluent or similar) to ensure the AI Engine and Backend Core stay in sync without manual DTO maintenance.

### B. Deployment Scale
*   **Kubernetes Transition**: The current `docker-compose` setup is for dev/staging. Move to K8s with HPA (Horizontal Pod Autoscaler) specifically for the AI Engine to handle bursts during university-wide mock drives.

## 3. Security Standards (Post-Hardening)

*   **Secret Management**: Replace `.env` and hardcoded config with **AWS Secrets Manager** or **HashiCorp Vault**.
*   **Multi-Tenancy**: The current `organization_id` filter is sufficient for MVP. For production, consider schema-per-tenant or row-level security (RLS) in PostgreSQL to prevent data leaks.

## 4. Development Workflow

1.  **Docs First**: Every new feature MUST have a corresponding entry in `.gemini/APP_FLOW.md` before implementation.
2.  **Agentic Assistance**: Use the specialized skills in `.gemini/skills/` to ensure new code follows established patterns for Cloudinary, FastAPI, and LangChain.
3.  **Visual Consistency**: Reference `FRONTEND_GUIDELINES.md` for any new UI element. Stick to the **Slate-950 / Emerald-500** industrial aesthetic.
