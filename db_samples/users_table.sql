CREATE OR REPLACE FUNCTION update_modified_column()
  RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE 'plpgsql';

-- Table: people_details.people_details

-- DROP TABLE people_details.people_details;

CREATE TABLE people_details.people_details
(
  email             CHARACTER VARYING(50)  NOT NULL,
  id                SERIAL                 NOT NULL,
  password          CHARACTER VARYING(100) NOT NULL,
  created_at        TIME WITH TIME ZONE    NOT NULL DEFAULT now(),
  updated_at        TIME WITH TIME ZONE    NOT NULL DEFAULT now(),
  username          CHARACTER VARYING(100) NOT NULL,
  is_email_verified BOOLEAN                NOT NULL DEFAULT FALSE,
  CONSTRAINT id_primary_key PRIMARY KEY (id),
  CONSTRAINT email_unique UNIQUE (email),
  CONSTRAINT username_unique UNIQUE (username)
)
WITH (
OIDS =FALSE
);
ALTER TABLE people_details.people_details
OWNER TO postgres;

-- Index: people_details.id_primary

-- DROP INDEX people_details.id_primary;

CREATE INDEX id_primary
ON people_details.people_details
USING BTREE
(id);


-- Trigger: update_user_updated_time on people_details.people_details

-- DROP TRIGGER update_user_updated_time ON people_details.people_details;

CREATE TRIGGER update_user_updated_time
BEFORE UPDATE
ON people_details.people_details
FOR EACH ROW
EXECUTE PROCEDURE public.update_modified_column();


-- Table: people_details.device_ids

-- DROP TABLE people_details.device_ids;

CREATE TABLE people_details.device_ids
(
  id            SERIAL                NOT NULL,
  device_id_str CHARACTER VARYING(75) NOT NULL,
  users_id      INTEGER,
  CONSTRAINT device_user_id_foreign_key FOREIGN KEY (users_id)
  REFERENCES people_details.people_details (id) MATCH SIMPLE
  ON UPDATE CASCADE ON DELETE SET NULL,
  CONSTRAINT device_id_str_unique UNIQUE (device_id_str)
)
WITH (
OIDS =FALSE
);
ALTER TABLE people_details.device_ids
OWNER TO postgres;

-- Index: people_details.fki_device_user_id_foreign_key

-- DROP INDEX people_details.fki_device_user_id_foreign_key;

CREATE INDEX fki_device_user_id_foreign_key
ON people_details.device_ids
USING BTREE
(users_id);


-- Table: people_details.users_verification

-- DROP TABLE people_details.users_verification;

CREATE TABLE people_details.users_verification
(
  id         SERIAL                 NOT NULL,
  users_id   INTEGER                NOT NULL,
  token      CHARACTER VARYING(150) NOT NULL,
  expires_at TIME WITH TIME ZONE    NOT NULL DEFAULT (now() + ((24) :: DOUBLE PRECISION * '01:00:00' :: INTERVAL)),
  created_at TIME WITH TIME ZONE    NOT NULL DEFAULT now(),
  updated_at TIME WITH TIME ZONE    NOT NULL DEFAULT now(),
  CONSTRAINT users_verification_pkey PRIMARY KEY (id),
  CONSTRAINT users_verification_users_id_fkey FOREIGN KEY (users_id)
  REFERENCES people_details.people_details (id) MATCH SIMPLE
  ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT users_verification_users_id_key UNIQUE (users_id)
)
WITH (
OIDS =FALSE
);
ALTER TABLE people_details.users_verification
OWNER TO postgres;

-- Index: people_details.users_verification_users_id_idx

-- DROP INDEX people_details.users_verification_users_id_idx;

CREATE INDEX users_verification_users_id_idx
ON people_details.users_verification
USING BTREE
(users_id);


-- Trigger: update_users_verification_updated_time on people_details.users_verification

-- DROP TRIGGER update_users_verification_updated_time ON people_details.users_verification;

CREATE TRIGGER update_users_verification_updated_time
BEFORE UPDATE
ON people_details.users_verification
FOR EACH ROW
EXECUTE PROCEDURE public.update_modified_column();


-- Table: people_details.password_change_requests

-- DROP TABLE people_details.password_change_requests;

CREATE TABLE people_details.password_change_requests
(
  id         SERIAL                 NOT NULL,
  users_id   INTEGER                NOT NULL,
  token      CHARACTER VARYING(150) NOT NULL,
  created_at TIME WITH TIME ZONE    NOT NULL DEFAULT now(),
  updated_at TIME WITH TIME ZONE    NOT NULL DEFAULT now(),
  expires_at TIME WITH TIME ZONE    NOT NULL DEFAULT (now() + ((24) :: DOUBLE PRECISION * '01:00:00' :: INTERVAL)),
  CONSTRAINT password_change_requests_pkey PRIMARY KEY (id),
  CONSTRAINT password_change_requests_users_id_fkey FOREIGN KEY (users_id)
  REFERENCES people_details.people_details (id) MATCH SIMPLE
  ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT password_change_requests_users_id_key UNIQUE (users_id)
)
WITH (
OIDS =FALSE
);
ALTER TABLE people_details.password_change_requests
OWNER TO postgres;

-- Index: people_details.password_change_requests_users_id_idx

-- DROP INDEX people_details.password_change_requests_users_id_idx;

CREATE INDEX password_change_requests_users_id_idx
ON people_details.password_change_requests
USING BTREE
(users_id);


-- Trigger: update_password_change_requests_updated_time on people_details.password_change_requests

-- DROP TRIGGER update_password_change_requests_updated_time ON people_details.password_change_requests;

CREATE TRIGGER update_password_change_requests_updated_time
BEFORE UPDATE
ON people_details.password_change_requests
FOR EACH ROW
EXECUTE PROCEDURE public.update_modified_column();


-- Table: people_details.server_key_values

-- DROP TABLE people_details.server_key_values;

CREATE TABLE people_details.server_key_values
(
  key_str    CHARACTER VARYING(200) NOT NULL,
  value_str  CHARACTER VARYING(200) NOT NULL,
  id         SERIAL                 NOT NULL,
  created_at TIME WITH TIME ZONE    NOT NULL DEFAULT now(),
  updated_at TIME WITH TIME ZONE    NOT NULL DEFAULT now(),
  CONSTRAINT server_key_values_pkey PRIMARY KEY (id),
  CONSTRAINT server_key_values_key_str_value_str_key UNIQUE (key_str, value_str)
)
WITH (
OIDS =FALSE
);
ALTER TABLE people_details.server_key_values
OWNER TO postgres;

-- Trigger: update_server_key_values_updated_time on people_details.server_key_values

-- DROP TRIGGER update_server_key_values_updated_time ON people_details.server_key_values;

CREATE TRIGGER update_server_key_values_updated_time
BEFORE UPDATE
ON people_details.server_key_values
FOR EACH ROW
EXECUTE PROCEDURE public.update_modified_column();
