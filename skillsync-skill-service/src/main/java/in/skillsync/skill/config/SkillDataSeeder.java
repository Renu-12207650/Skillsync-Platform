package in.skillsync.skill.config;

import in.skillsync.skill.entity.Skill;
import in.skillsync.skill.repository.SkillRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Seeds a fixed set of skills on startup if the skills table is empty.
 * Safe and idempotent: won't re-insert existing skills.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class SkillDataSeeder implements ApplicationRunner {

    private final SkillRepository skillRepository;

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        long count = skillRepository.count();
        if (count > 0) {
            log.info("SkillDataSeeder: {} skills already present, skipping seeding.", count);
            return;
        }

        log.info("SkillDataSeeder: seeding default skills into empty database...");

        List<Skill> seeds = List.of(
                // Frontend
                Skill.builder().name("React").category("Frontend").description("React.js").build(),
                Skill.builder().name("Vue.js").category("Frontend").description("Vue.js").build(),
                Skill.builder().name("Angular").category("Frontend").description("Angular").build(),
                Skill.builder().name("Next.js").category("Frontend").description("Next.js (React framework)").build(),
                Skill.builder().name("TypeScript").category("Frontend").description("TypeScript").build(),

                // Backend
                Skill.builder().name("Spring Boot").category("Backend").description("Java Spring Boot").build(),
                Skill.builder().name("Node.js").category("Backend").description("Node.js (Express, Nest)").build(),
                Skill.builder().name("Django").category("Backend").description("Python Django").build(),
                Skill.builder().name("FastAPI").category("Backend").description("Python FastAPI").build(),
                Skill.builder().name("Go").category("Backend").description("Go / Golang").build(),
                Skill.builder().name("Rust").category("Backend").description("Rust backend development").build(),

                // Databases
                Skill.builder().name("PostgreSQL").category("Database").description("PostgreSQL").build(),
                Skill.builder().name("MongoDB").category("Database").description("MongoDB").build(),
                Skill.builder().name("Redis").category("Database").description("Redis").build(),
                Skill.builder().name("MySQL").category("Database").description("MySQL").build(),

                // DevOps
                Skill.builder().name("Docker").category("DevOps").description("Docker containers").build(),
                Skill.builder().name("Kubernetes").category("DevOps").description("Kubernetes orchestration").build(),
                Skill.builder().name("Terraform").category("DevOps").description("Terraform IaC").build(),

                // Cloud
                Skill.builder().name("AWS").category("Cloud").description("Amazon Web Services").build(),
                Skill.builder().name("Azure").category("Cloud").description("Microsoft Azure").build(),
                Skill.builder().name("GCP").category("Cloud").description("Google Cloud Platform").build(),

                // Data & ML
                Skill.builder().name("Machine Learning").category("Data").description("Machine Learning fundamentals").build(),
                Skill.builder().name("Data Engineering").category("Data").description("Data engineering practices").build(),
                Skill.builder().name("TensorFlow").category("Data").description("TensorFlow").build(),
                Skill.builder().name("PyTorch").category("Data").description("PyTorch").build(),
                Skill.builder().name("SQL").category("Data").description("SQL querying and optimization").build(),

                // Mobile
                Skill.builder().name("iOS (Swift)").category("Mobile").description("iOS development with Swift").build(),
                Skill.builder().name("Android (Kotlin)").category("Mobile").description("Android development with Kotlin").build(),
                Skill.builder().name("React Native").category("Mobile").description("React Native").build(),
                Skill.builder().name("Flutter").category("Mobile").description("Flutter (Dart)").build(),

                // Career
                Skill.builder().name("System Design").category("Career").description("System design interview prep").build(),
                Skill.builder().name("DSA / Interviews").category("Career").description("Data structures & algorithms").build(),
                Skill.builder().name("Product Strategy").category("Career").description("Product thinking and strategy").build(),
                Skill.builder().name("Engineering Mgmt").category("Career").description("Engineering management and leadership").build()
        );

        seeds.forEach(skill -> {
            if (!skillRepository.existsByNameIgnoreCase(skill.getName())) {
                skillRepository.save(skill);
                log.debug("Seeded skill: {}", skill.getName());
            }
        });

        log.info("SkillDataSeeder: seeding completed. Current total: {}", skillRepository.count());
    }
}
