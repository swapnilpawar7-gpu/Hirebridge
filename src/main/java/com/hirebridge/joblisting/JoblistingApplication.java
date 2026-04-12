package com.hirebridge.joblisting;

import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.web.bind.annotation.RestController;

import com.hirebridge.joblisting.model.Post;
import com.hirebridge.joblisting.repository.PostRepository;

import springfox.documentation.builders.ApiInfoBuilder;
import springfox.documentation.builders.PathSelectors;
import springfox.documentation.builders.RequestHandlerSelectors;
import springfox.documentation.service.ApiInfo;
import springfox.documentation.spi.DocumentationType;
import springfox.documentation.spring.web.plugins.Docket;
import springfox.documentation.swagger2.annotations.EnableSwagger2;

@SpringBootApplication
@EnableSwagger2
public class JoblistingApplication {

	@Bean
	public Docket api() {
		return new Docket(DocumentationType.SWAGGER_2).select()
				.apis(RequestHandlerSelectors.withClassAnnotation(RestController.class)).paths(PathSelectors.any())
				.build().apiInfo(apiInfo()).useDefaultResponseMessages(false);
	}

	@Bean
	public ApiInfo apiInfo() {
		final ApiInfoBuilder builder = new ApiInfoBuilder();
		return builder.build();
	}

	public static void main(String[] args) {
		SpringApplication.run(JoblistingApplication.class, args);
	}

	@Bean
    CommandLineRunner runner(PostRepository repo) {
        return args -> {

            repo.save(new Post("Java Developer", "Spring Boot backend role", 2));
            repo.save(new Post("Frontend Developer", "HTML Tailwind UI", 1));
            repo.save(new Post("Full Stack Developer", "React + Spring Boot", 3));
            repo.save(new Post("DevOps Engineer", "CI/CD pipelines", 2));
            repo.save(new Post("Python Developer", "Django backend", 2));
        };
    }

}
