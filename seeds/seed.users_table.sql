BEGIN;


TRUNCATE
usernames;
RESTART IDENTITY CASCADE;

INSERT INTO usernames (name, password)
VALUES
('omar','123')















COMMIT;