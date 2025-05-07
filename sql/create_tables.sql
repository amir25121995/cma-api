-- sql/create_tables.sql

-- enable uuid generation (if you ever need it)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. roles
CREATE TABLE IF NOT EXISTS roles (
  id          BIGSERIAL PRIMARY KEY,
  role_id     VARCHAR(255) NOT NULL UNIQUE,
  name        VARCHAR(255) NOT NULL UNIQUE,
  created_at  TIMESTAMP WITHOUT TIME ZONE DEFAULT now(),
  updated_at  TIMESTAMP WITHOUT TIME ZONE DEFAULT now()
);

-- 2. users
CREATE TABLE IF NOT EXISTS users (
  id                 BIGSERIAL PRIMARY KEY,
  role_id            VARCHAR(255) NOT NULL REFERENCES roles(role_id),
  name               VARCHAR(255) NOT NULL,
  email              VARCHAR(255) NOT NULL UNIQUE,
  email_verified_at  TIMESTAMP WITHOUT TIME ZONE,
  password           VARCHAR(255) NOT NULL,
  remember_token     VARCHAR(100),
  created_at         TIMESTAMP WITHOUT TIME ZONE DEFAULT now(),
  updated_at         TIMESTAMP WITHOUT TIME ZONE DEFAULT now()
);

-- 3. client_details
CREATE TABLE IF NOT EXISTS client_details (
  id              BIGSERIAL PRIMARY KEY,
  company_name    VARCHAR(255) NOT NULL,
  billing_address TEXT         NOT NULL,
  contact_person  VARCHAR(255) NOT NULL,
  contact_email   VARCHAR(255) NOT NULL,
  finance_email   VARCHAR(255) NOT NULL,
  ops_email       VARCHAR(255) NOT NULL,
  contact_no      VARCHAR(255) NOT NULL,
  status_of_collab VARCHAR(255) NOT NULL,
  remarks         TEXT,
  user_id         BIGINT       NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at      TIMESTAMP WITHOUT TIME ZONE DEFAULT now(),
  updated_at      TIMESTAMP WITHOUT TIME ZONE DEFAULT now()
);

-- 4. provider_details
CREATE TABLE IF NOT EXISTS provider_details (
  id               BIGSERIAL PRIMARY KEY,
  provider_name    VARCHAR(255) NOT NULL,
  regions_covered  VARCHAR(255) NOT NULL,
  service_type     VARCHAR(255) NOT NULL,
  case_fee         VARCHAR(255) NOT NULL,
  contact_person   VARCHAR(255) NOT NULL,
  contact_no       VARCHAR(255) NOT NULL,
  contact_email    VARCHAR(255) NOT NULL,
  ops_email        VARCHAR(255) NOT NULL,
  finance_email    VARCHAR(255) NOT NULL,
  remarks          VARCHAR(255),
  user_id          BIGINT     NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at       TIMESTAMP WITHOUT TIME ZONE DEFAULT now(),
  updated_at       TIMESTAMP WITHOUT TIME ZONE DEFAULT now()
);

-- 5. hospital_details
CREATE TABLE IF NOT EXISTS hospital_details (
  id             BIGSERIAL PRIMARY KEY,
  hospital_name  VARCHAR(255) NOT NULL,
  location_city  VARCHAR(255) NOT NULL,
  country        VARCHAR(255) NOT NULL,
  ops_email      VARCHAR(255) NOT NULL,
  phone_no       VARCHAR(255) NOT NULL,
  contact_person VARCHAR(255) NOT NULL,
  admin_email    VARCHAR(255) NOT NULL,
  branches       VARCHAR(255) NOT NULL,
  contact_no     VARCHAR(255) NOT NULL,
  mode_of_payment VARCHAR(255) NOT NULL,
  remarks        VARCHAR(255),
  user_id        BIGINT     NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at     TIMESTAMP WITHOUT TIME ZONE DEFAULT now(),
  updated_at     TIMESTAMP WITHOUT TIME ZONE DEFAULT now()
);

-- 6. invoice_details
CREATE TABLE IF NOT EXISTS invoice_details (
  id                     BIGSERIAL PRIMARY KEY,
  invoice_no             VARCHAR(255) NOT NULL,
  case_ref_no            VARCHAR(255) NOT NULL,
  billing_to             VARCHAR(255),
  issue_date             DATE        NOT NULL,
  payment_received_date  DATE        NOT NULL,
  remarks                VARCHAR(255),
  user_id                BIGINT      NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  billing_address        VARCHAR(255),
  service_type           VARCHAR(255),
  case_handling_fee      VARCHAR(255),
  medical_expense        VARCHAR(255),
  total                  VARCHAR(255) NOT NULL,
  exchange_rate          VARCHAR(255) NOT NULL,
  created_at             TIMESTAMP WITHOUT TIME ZONE DEFAULT now(),
  updated_at             TIMESTAMP WITHOUT TIME ZONE DEFAULT now()
);

-- 7. income_details
CREATE TABLE IF NOT EXISTS income_details (
  id                BIGSERIAL PRIMARY KEY,
  date              DATE        NOT NULL,
  amount_inr        DECIMAL(12,2) NOT NULL,
  income            VARCHAR(255),
  invoice           VARCHAR(255) NOT NULL,
  amount_received   DECIMAL(12,2) NOT NULL,
  remarks           TEXT,
  user_id           BIGINT      NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at        TIMESTAMP WITHOUT TIME ZONE DEFAULT now(),
  updated_at        TIMESTAMP WITHOUT TIME ZONE DEFAULT now()
);

-- 8. expense_details
CREATE TABLE IF NOT EXISTS expense_details (
  id             BIGSERIAL PRIMARY KEY,
  date           DATE         NOT NULL,
  amount_inr     DECIMAL(12,2) NOT NULL,
  actual_amount  DECIMAL(12,2) NOT NULL,
  paid_by        VARCHAR(255) NOT NULL,
  expense        VARCHAR(255),
  remarks        TEXT,
  user_id        BIGINT       NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at     TIMESTAMP WITHOUT TIME ZONE DEFAULT now(),
  updated_at     TIMESTAMP WITHOUT TIME ZONE DEFAULT now()
);

-- 9. case_details
CREATE TABLE IF NOT EXISTS case_details (
  id                BIGSERIAL PRIMARY KEY,
  case_ref_no       VARCHAR(255) NOT NULL,
  date_of_assistance DATE,
  country            VARCHAR(255) NOT NULL,
  city               VARCHAR(255) NOT NULL,
  patient_name       VARCHAR(255) NOT NULL,
  insurance          VARCHAR(255) NOT NULL,
  ic_ref_no          VARCHAR(255) NOT NULL,
  hospital_doctors   VARCHAR(255) NOT NULL,
  invoice_status     VARCHAR(255) NOT NULL,
  service_type       VARCHAR(255) NOT NULL,
  final_invoice      DATE,
  mr_status          VARCHAR(255) NOT NULL,
  remarks            VARCHAR(255),
  user_id            BIGINT      NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at         TIMESTAMP WITHOUT TIME ZONE DEFAULT now(),
  updated_at         TIMESTAMP WITHOUT TIME ZONE DEFAULT now()
);
