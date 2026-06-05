# SkillSync Demo Credentials

**Password for ALL accounts:** `Password@123`

---

## Learner Accounts

| Name | Email | Role |
|------|-------|------|
| Aarav Sharma | aarav.sharma@demo.com | Learner |
| Priya Nair | priya.nair@demo.com | Learner |
| Rohan Mehta | rohan.mehta@demo.com | Learner |
| Sneha Patel | sneha.patel@demo.com | Learner |
| Kiran Joshi | kiran.joshi@demo.com | Learner |

---

## Mentor Accounts

| Name | Email | Skills | Exp | Rate/hr |
|------|-------|--------|-----|---------|
| Vikram Rao | vikram.rao@demo.com | Spring Boot, PostgreSQL, MySQL, System Design | 8 yrs | ₹1200 |
| Ananya Iyer | ananya.iyer@demo.com | React, Next.js, TypeScript, Node.js | 6 yrs | ₹1000 |
| Dev Kapoor | dev.kapoor@demo.com | Machine Learning, TensorFlow, PyTorch, SQL | 5 yrs | ₹1400 |
| Meera Krishnan | meera.krishnan@demo.com | Docker, Kubernetes, Terraform, AWS | 6 yrs | ₹1300 |
| Arjun Singh | arjun.singh@demo.com | System Design, DSA/Interviews, Engineering Mgmt | 10 yrs | ₹1800 |

---

## How to run the seed

Make sure the full Docker stack is running, then execute:

```bash
docker exec -i skillsync-mysql mysql -uroot -pWelcome@123 < dummy-data/seed.sql
```

Or connect directly and paste the SQL:

```bash
docker exec -it skillsync-mysql mysql -uroot -pWelcome@123
```

> The script uses `INSERT IGNORE` so it is **safe to run multiple times** — it will not create duplicates.

---

## Skill ID reference (from SkillDataSeeder)

| ID | Skill | ID | Skill |
|----|-------|----|-------|
| 1 | React | 19 | AWS |
| 2 | Vue.js | 20 | Azure |
| 3 | Angular | 21 | GCP |
| 4 | Next.js | 22 | Machine Learning |
| 5 | TypeScript | 23 | Data Engineering |
| 6 | Spring Boot | 24 | TensorFlow |
| 7 | Node.js | 25 | PyTorch |
| 8 | Django | 26 | SQL |
| 9 | FastAPI | 27 | iOS (Swift) |
| 10 | Go | 28 | Android (Kotlin) |
| 11 | Rust | 29 | React Native |
| 12 | PostgreSQL | 30 | Flutter |
| 13 | MongoDB | 31 | System Design |
| 14 | Redis | 32 | DSA / Interviews |
| 15 | MySQL | 33 | Product Strategy |
| 16 | Docker | 34 | Engineering Mgmt |
| 17 | Kubernetes | | |
| 18 | Terraform | | |
