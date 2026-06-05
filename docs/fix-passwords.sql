UPDATE skillsync_auth_db.auth_users
SET password = '$2b$10$44qpDgwsWND5cWdNFk2b6uBycKimGITi7a9RPGM9hmS9bpVoOoODq'
WHERE email IN (
  'aarav.sharma@demo.com',
  'priya.nair@demo.com',
  'rohan.mehta@demo.com',
  'sneha.patel@demo.com',
  'kiran.joshi@demo.com',
  'vikram.rao@demo.com',
  'ananya.iyer@demo.com',
  'dev.kapoor@demo.com',
  'meera.krishnan@demo.com',
  'arjun.singh@demo.com'
);
SELECT ROW_COUNT() AS updated;
